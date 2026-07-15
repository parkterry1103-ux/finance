import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadReleaseGateConfig } from './release-gate-config.js';

type HttpOutcome = {
  status: number;
  contentType: string;
  body: string;
  finalUrl: string;
  redirects: number;
  retries: number;
  durationMs: number;
};

type SmokeResult = {
  id: string;
  url: string;
  status: number | null;
  result: 'passed' | 'failed';
  durationMs: number;
  redirects: number;
  retries: number;
  detail: string;
  count?: number;
  duplicates?: number;
};

const config = loadReleaseGateConfig();
const root = process.cwd();
const args = process.argv ?? [];
const baseArgument = args.find((argument) => argument.startsWith('--base-url='));
const baseValue = baseArgument?.slice('--base-url='.length) ?? '';
const startedAt = Date.now();
const routeResults: SmokeResult[] = [];
const apiResults: SmokeResult[] = [];
const syncResults: SmokeResult[] = [];
const assetResults: SmokeResult[] = [];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isAllowedVercelUrl(value: URL) {
  return value.protocol === 'https:'
    && !value.username
    && !value.password
    && (!value.port || value.port === '443')
    && (value.hostname === 'finance1-flax.vercel.app' || value.hostname.endsWith('.vercel.app'));
}

function validatedBaseUrl(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('base URL must be a valid absolute URL');
  }
  assert(isAllowedVercelUrl(parsed), 'base URL must use HTTPS on finance1-flax.vercel.app or *.vercel.app');
  assert((parsed.pathname === '/' || parsed.pathname === '') && !parsed.search && !parsed.hash, 'base URL must not contain a path, query, or hash');
  return parsed.origin;
}

function joinBase(baseUrl: string, path: string) {
  const target = new URL(path, `${baseUrl}/`);
  assert(isAllowedVercelUrl(target), `request target is outside the allowed Vercel hosts: ${target.hostname}`);
  return target.toString();
}

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

class NonRetryableRequestError extends Error {}

async function requestWithPolicy(url: string, init: { method?: string } = {}): Promise<HttpOutcome> {
  const requestStartedAt = Date.now();
  let lastError = 'request failed';

  for (let attempt = 0; attempt <= config.smoke.retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.smoke.timeoutMs);
    let current = new URL(url);
    let redirects = 0;
    try {
      while (true) {
        if (!isAllowedVercelUrl(current)) throw new NonRetryableRequestError(`redirect target is outside allowed Vercel hosts: ${current.hostname}`);
        const response = await fetch(current, {
          method: init.method ?? 'GET',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'accept': '*/*',
            'user-agent': 'finance1-release-smoke/1.0 read-only',
          },
        });

        if (RETRYABLE_STATUS.has(response.status) && attempt < config.smoke.retries) {
          lastError = `transient HTTP ${response.status}`;
          break;
        }

        if (REDIRECT_STATUS.has(response.status)) {
          const location = response.headers.get('location');
          if (!location) throw new NonRetryableRequestError(`HTTP ${response.status} redirect is missing Location`);
          redirects += 1;
          if (redirects > config.smoke.maxRedirects) throw new NonRetryableRequestError(`redirect limit exceeded (${config.smoke.maxRedirects})`);
          current = new URL(location, current);
          continue;
        }

        const body = await response.text();
        clearTimeout(timer);
        return {
          status: response.status,
          contentType: response.headers.get('content-type') ?? '',
          body,
          finalUrl: current.toString(),
          redirects,
          retries: attempt,
          durationMs: Date.now() - requestStartedAt,
        };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (error instanceof NonRetryableRequestError) {
        clearTimeout(timer);
        throw error;
      }
      if (attempt >= config.smoke.retries) {
        clearTimeout(timer);
        throw new Error(`request failed after ${attempt + 1} attempts: ${lastError}`);
      }
    } finally {
      clearTimeout(timer);
    }
    if (attempt < config.smoke.retries) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  throw new Error(lastError);
}

function failedResult(id: string, url: string, error: unknown): SmokeResult {
  return {
    id,
    url,
    status: null,
    result: 'failed',
    durationMs: 0,
    redirects: 0,
    retries: 0,
    detail: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
  };
}

function duplicateCount(values: string[]) {
  return values.length - new Set(values).size;
}

function objectValue(value: unknown): Record<string, unknown> {
  assert(Boolean(value) && typeof value === 'object' && !Array.isArray(value), 'response must be a JSON object');
  return value as Record<string, unknown>;
}

function stringField(item: Record<string, unknown>, field: string) {
  return typeof item[field] === 'string' && Boolean((item[field] as string).trim());
}

function validateApiContract(contract: string, payloadValue: unknown) {
  const payload = objectValue(payloadValue);
  if (contract !== 'news') assert(payload.ok === true, 'top-level ok must be true');

  if (contract === 'prices') {
    const prices = payload.prices;
    assert(Array.isArray(prices) && prices.length > 0, 'prices must be a non-empty array');
    const keys = prices.map((value) => {
      const item = objectValue(value);
      assert(stringField(item, 'ticker') || stringField(item, 'symbol'), 'price item ticker/symbol missing');
      assert(Object.hasOwn(item, 'price'), 'price item price field missing');
      return String(item.ticker ?? item.symbol);
    });
    return { schema: 'prices[]', count: prices.length, duplicates: duplicateCount(keys) };
  }

  if (contract === 'macro') {
    const series = payload.series;
    assert(Array.isArray(series) && series.length === config.content.macroSeries, `macro series must contain ${config.content.macroSeries} items`);
    assert(Array.isArray(payload.errors), 'macro errors must be an array');
    const ids = series.map((value) => {
      const item = objectValue(value);
      assert(stringField(item, 'id') && stringField(item, 'seriesId'), 'macro id/seriesId missing');
      return String(item.id);
    });
    return { schema: 'series[]', count: series.length, duplicates: duplicateCount(ids) };
  }

  if (contract === 'relations') {
    const relations = payload.relations;
    assert(Array.isArray(relations) && relations.length === config.content.marketRelations, `relations must contain ${config.content.marketRelations} items`);
    const ids = relations.map((value) => {
      const item = objectValue(value);
      assert(stringField(item, 'id') && stringField(item, 'title') && Boolean(item.macro) && Boolean(item.market), 'relation required fields missing');
      return String(item.id);
    });
    return { schema: 'relations[]', count: relations.length, duplicates: duplicateCount(ids) };
  }

  if (contract === 'disclosures') {
    const items = payload.items;
    assert(Array.isArray(items) && items.length <= 20, 'OpenDART items must be an array with at most 20 items');
    const ids = items.map((value) => {
      const item = objectValue(value);
      assert(stringField(item, 'receiptNumber') && stringField(item, 'companyName') && stringField(item, 'receivedAt') && stringField(item, 'reportName'), 'OpenDART required fields missing');
      return String(item.receiptNumber);
    });
    return { schema: 'items[]', count: items.length, duplicates: duplicateCount(ids) };
  }

  if (contract === 'sec') {
    const items = payload.items;
    assert(Array.isArray(items) && items.length <= 20, 'SEC items must be an array with at most 20 items');
    const ids = items.map((value) => {
      const item = objectValue(value);
      assert(stringField(item, 'accessionNumber') && stringField(item, 'companyName') && stringField(item, 'filedAt') && stringField(item, 'formType'), 'SEC required fields missing');
      return String(item.accessionNumber);
    });
    return { schema: 'items[]', count: items.length, duplicates: duplicateCount(ids) };
  }

  if (contract === 'financials') {
    assert(stringField(payload, 'companyId') && stringField(payload, 'country'), 'financials companyId/country missing');
    assert(Boolean(payload.metrics) && typeof payload.metrics === 'object', 'financials metrics object missing');
    return { schema: 'financials object', count: Array.isArray(payload.metrics) ? payload.metrics.length : Object.keys(payload.metrics as object).length, duplicates: 0 };
  }

  if (contract === 'ownership') {
    const trades = payload.trades;
    assert(Array.isArray(trades), 'ownership trades must be an array');
    const ids = trades.map((value) => {
      const item = objectValue(value);
      assert(stringField(item, 'id') && stringField(item, 'source') && stringField(item, 'companyName'), 'ownership required fields missing');
      return String(item.id);
    });
    return { schema: 'trades[]', count: trades.length, duplicates: duplicateCount(ids) };
  }

  if (contract === 'news') {
    const articles = payload.articles;
    assert(Array.isArray(articles), 'news articles must be an array');
    assert(Array.isArray(payload.upstreamErrors), 'news upstreamErrors must be an array');
    const urls = articles.map((value) => {
      const item = objectValue(value);
      assert(stringField(item, 'title') && stringField(item, 'url') && stringField(item, 'domain'), 'news required fields missing');
      return String(item.url);
    });
    return { schema: 'articles[] (legacy contract without ok)', count: articles.length, duplicates: duplicateCount(urls) };
  }

  throw new Error(`unknown API contract: ${contract}`);
}

function hasStackTrace(body: string) {
  return /node:internal|\n\s*at\s+[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?\s*\(|"stack"\s*:/.test(body);
}

async function main() {
  let baseUrl = '';
  let baseError: string | null = null;
  try {
    baseUrl = validatedBaseUrl(baseValue);
  } catch (error) {
    baseError = error instanceof Error ? error.message : String(error);
  }

  const entryReferences = new Set<string>();
  const cssReferences = new Set<string>();

  if (!baseError) {
    for (const path of config.smoke.routes) {
      const url = joinBase(baseUrl, path);
      try {
        const response = await requestWithPolicy(url);
        assert(response.status === 200, `expected HTTP 200, received ${response.status}`);
        assert(response.contentType.includes('text/html'), `expected HTML Content-Type, received ${response.contentType || 'missing'}`);
        assert(response.body.trim().length > 100 && /<html[\s>]/i.test(response.body), 'HTML body is empty or invalid');
        const scripts = [...response.body.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]);
        const styles = [...response.body.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((match) => match[1]);
        assert(scripts.length > 0, 'entry JS reference missing');
        assert(styles.length > 0, 'CSS reference missing');
        scripts.forEach((reference) => entryReferences.add(new URL(reference, response.finalUrl).toString()));
        styles.forEach((reference) => cssReferences.add(new URL(reference, response.finalUrl).toString()));
        routeResults.push({ id: path, url, status: response.status, result: 'passed', durationMs: response.durationMs, redirects: response.redirects, retries: response.retries, detail: `HTML, ${scripts.length} JS, ${styles.length} CSS; final ${new URL(response.finalUrl).pathname}` });
      } catch (error) {
        routeResults.push(failedResult(path, url, error));
      }
    }

    for (const assetUrl of [...entryReferences, ...cssReferences]) {
      try {
        const response = await requestWithPolicy(assetUrl);
        assert(response.status === 200, `asset returned HTTP ${response.status}`);
        assert(response.body.length > 0, 'asset body is empty');
        assetResults.push({ id: new URL(assetUrl).pathname, url: assetUrl, status: response.status, result: 'passed', durationMs: response.durationMs, redirects: response.redirects, retries: response.retries, detail: `${response.body.length} decoded bytes` });

        if (assetUrl.endsWith('.js')) {
          const dynamicFiles = new Set(response.body.match(/(?:[A-Za-z]+Route|entries|trades)-[A-Za-z0-9_-]+\.js/g) ?? []);
          for (const route of config.lazyRoutes) {
            assert([...dynamicFiles].some((file) => file.startsWith(`${route.name}-`)), `${route.name} deployed lazy asset reference missing`);
          }
          for (const file of dynamicFiles) {
            const dynamicUrl = joinBase(baseUrl, `/assets/${file}`);
            const dynamicResponse = await requestWithPolicy(dynamicUrl);
            assert(dynamicResponse.status === 200 && dynamicResponse.body.length > 0, `${file} returned HTTP ${dynamicResponse.status} or an empty body`);
            assetResults.push({ id: `/assets/${file}`, url: dynamicUrl, status: dynamicResponse.status, result: 'passed', durationMs: dynamicResponse.durationMs, redirects: dynamicResponse.redirects, retries: dynamicResponse.retries, detail: `${dynamicResponse.body.length} decoded bytes; dynamic` });
          }
        }
      } catch (error) {
        assetResults.push(failedResult(new URL(assetUrl).pathname, assetUrl, error));
      }
    }

    for (const api of config.smoke.apis) {
      const url = joinBase(baseUrl, api.path);
      try {
        const response = await requestWithPolicy(url);
        assert(response.status === 200, `expected HTTP 200, received ${response.status}`);
        assert(response.contentType.toLowerCase().includes('application/json'), `expected JSON Content-Type, received ${response.contentType || 'missing'}`);
        assert(!hasStackTrace(response.body), 'response exposes a stack trace');
        let payload: unknown;
        try {
          payload = JSON.parse(response.body);
        } catch {
          throw new Error('response body is not valid JSON');
        }
        const contract = validateApiContract(api.contract, payload);
        assert(contract.duplicates === 0, `${contract.duplicates} duplicate primary keys`);
        apiResults.push({ id: api.id, url, status: response.status, result: 'passed', durationMs: response.durationMs, redirects: response.redirects, retries: response.retries, detail: contract.schema, count: contract.count, duplicates: contract.duplicates });
      } catch (error) {
        apiResults.push(failedResult(api.id, url, error));
      }
    }

    for (const path of config.smoke.syncEndpoints) {
      const url = joinBase(baseUrl, path);
      try {
        const response = await requestWithPolicy(url, { method: 'POST' });
        assert(response.status === 401, `expected unauthenticated HTTP 401, received ${response.status}`);
        assert(response.contentType.toLowerCase().includes('application/json'), `expected JSON Content-Type, received ${response.contentType || 'missing'}`);
        assert(!hasStackTrace(response.body), 'sync response exposes a stack trace');
        const payload = objectValue(JSON.parse(response.body));
        assert(payload.ok === false && typeof payload.error === 'string', 'sync 401 schema must contain ok:false and an error string');
        syncResults.push({ id: path, url, status: response.status, result: 'passed', durationMs: response.durationMs, redirects: response.redirects, retries: response.retries, detail: 'unauthenticated POST denied before execution' });
      } catch (error) {
        syncResults.push(failedResult(path, url, error));
      }
    }
  }

  if (baseError) routeResults.push(failedResult('base-url-validation', baseValue, new Error(baseError)));

  const allResults = [...routeResults, ...assetResults, ...apiResults, ...syncResults];
  const failures = allResults.filter((result) => result.result === 'failed');
  const commitResult = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  const summary = {
    timestamp: new Date().toISOString(),
    commit: process.env?.GITHUB_SHA ?? commitResult.stdout?.trim() ?? 'unknown',
    baseUrl: baseUrl || baseValue,
    nodeVersion: process.version ?? process.versions?.node ?? 'unknown',
    policy: {
      httpsOnly: true,
      allowedHosts: ['finance1-flax.vercel.app', '*.vercel.app'],
      timeoutMs: config.smoke.timeoutMs,
      maxRedirects: config.smoke.maxRedirects,
      retries: config.smoke.retries,
      retryStatus: [...RETRYABLE_STATUS],
    },
    routeCount: routeResults.length,
    assetCount: assetResults.length,
    apiCount: apiResults.length,
    syncCount: syncResults.length,
    durationMs: Date.now() - startedAt,
    status: failures.length ? 'failed' : 'passed',
    failures: failures.map((result) => `${result.id}: ${result.detail}`),
    routes: routeResults,
    assets: assetResults,
    apis: apiResults,
    sync: syncResults,
  };

  mkdirSync(join(root, 'artifacts'), { recursive: true });
  writeFileSync(join(root, 'artifacts', 'release-smoke-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  const row = (result: SmokeResult) => `| ${result.id} | ${result.status ?? '-'} | ${result.result.toUpperCase()} | ${result.count ?? '-'} | ${result.duplicates ?? '-'} | ${result.redirects} | ${result.retries} | ${result.durationMs}ms | ${result.detail.replaceAll('|', '\\|')} |`;
  const table = (items: SmokeResult[]) => `| Check | HTTP | Result | Count | Duplicates | Redirects | Retries | Duration | Detail |\n| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |\n${items.map(row).join('\n')}`;
  const markdown = `## Deployment Smoke Gate\n\n- Commit: \`${summary.commit}\`\n- Base URL: \`${summary.baseUrl}\`\n- Final status: **${summary.status.toUpperCase()}**\n- Duration: **${summary.durationMs}ms**\n- Policy: HTTPS allowlist, ${config.smoke.timeoutMs}ms timeout, ${config.smoke.retries} retries, ${config.smoke.maxRedirects} redirects\n- Write operations: **0**; authenticated sync calls: **0**\n\n### Routes\n\n${table(routeResults)}\n\n### Deployment assets\n\n${table(assetResults)}\n\n### Public APIs\n\n${table(apiResults)}\n\n### Sync authentication\n\n${table(syncResults)}\n${failures.length ? `\n### Failures\n\n${failures.map((result) => `- ${result.id}: ${result.detail}`).join('\n')}\n` : ''}`;
  writeFileSync(join(root, 'artifacts', 'release-smoke-summary.md'), markdown, 'utf8');

  console.log(`Deployment smoke ${summary.status}: routes=${routeResults.length}, assets=${assetResults.length}, APIs=${apiResults.length}, sync=${syncResults.length}, duration=${summary.durationMs}ms`);
  allResults.forEach((result) => console.log(`${result.result === 'passed' ? '✓' : '✗'} ${result.id}: ${result.detail}`));
  if (failures.length) process.exit?.(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit?.(1);
});
