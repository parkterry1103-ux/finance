/**
 * scripts/check-market-provider-config.ts
 * Server-only smoke test for market data provider env vars.
 *
 * Usage:
 *   npm run sync:compile && node .sync-build/scripts/check-market-provider-config.js
 *
 * Output: JSON with boolean flags only - never exposes key values.
 * Safe to run in CI (missing keys => configured: false, not an error exit).
 */

const runtime = globalThis;

function envValue(key: string): string {
  return (runtime as { process?: { env?: Record<string, string> } }).process?.env?.[key] ?? '';
}

type ProviderResult = {
  configured: boolean;
  requestOk: boolean;
  status: 'ok' | 'not-configured' | 'request-failed' | 'error';
  errorCode?: string;
};

type CheckResult = {
  finnhub: ProviderResult;
  twelveData: ProviderResult;
  fred: ProviderResult;
};

const DEFAULT_TIMEOUT_MS = 8000;

async function checkFinnhub(): Promise<ProviderResult> {
  const key = envValue('FINNHUB_API_KEY').trim();
  if (!key) return { configured: false, requestOk: false, status: 'not-configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const url = new URL('https://finnhub.io/api/v1/quote');
    url.searchParams.set('symbol', 'AAPL');
    const res = await fetch(url.toString(), {
      headers: { 'X-Finnhub-Token': key },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { configured: true, requestOk: false, status: 'request-failed', errorCode: `HTTP_${res.status}` };
    const data = await res.json() as Record<string, unknown>;
    if (typeof data.c !== 'number') return { configured: true, requestOk: false, status: 'error', errorCode: 'INVALID_RESPONSE' };
    return { configured: true, requestOk: true, status: 'ok' };
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    const code = msg.toLowerCase().includes('abort') ? 'TIMEOUT' : 'NETWORK_ERROR';
    return { configured: true, requestOk: false, status: 'error', errorCode: code };
  }
}

async function checkTwelveData(): Promise<ProviderResult> {
  const key = envValue('TWELVE_DATA_API_KEY').trim();
  if (!key) return { configured: false, requestOk: false, status: 'not-configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const url = new URL('https://api.twelvedata.com/price');
    url.searchParams.set('symbol', 'AAPL');
    url.searchParams.set('apikey', key);
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return { configured: true, requestOk: false, status: 'request-failed', errorCode: `HTTP_${res.status}` };
    const data = await res.json() as Record<string, unknown>;
    if (data.code === 401) return { configured: true, requestOk: false, status: 'request-failed', errorCode: 'AUTH_FAILED' };
    if (typeof data.price !== 'string') return { configured: true, requestOk: false, status: 'error', errorCode: 'INVALID_RESPONSE' };
    return { configured: true, requestOk: true, status: 'ok' };
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    const code = msg.toLowerCase().includes('abort') ? 'TIMEOUT' : 'NETWORK_ERROR';
    return { configured: true, requestOk: false, status: 'error', errorCode: code };
  }
}

async function checkFred(): Promise<ProviderResult> {
  const key = envValue('FRED_API_KEY').trim();
  if (!key) return { configured: false, requestOk: false, status: 'not-configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const url = new URL('https://api.stlouisfed.org/fred/series/observations');
    url.searchParams.set('series_id', 'FEDFUNDS');
    url.searchParams.set('limit', '1');
    url.searchParams.set('sort_order', 'desc');
    url.searchParams.set('api_key', key);
    url.searchParams.set('file_type', 'json');
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return { configured: true, requestOk: false, status: 'request-failed', errorCode: `HTTP_${res.status}` };
    const data = await res.json() as Record<string, unknown>;
    if (!Array.isArray(data.observations)) return { configured: true, requestOk: false, status: 'error', errorCode: 'INVALID_RESPONSE' };
    return { configured: true, requestOk: true, status: 'ok' };
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    const code = msg.toLowerCase().includes('abort') ? 'TIMEOUT' : 'NETWORK_ERROR';
    return { configured: true, requestOk: false, status: 'error', errorCode: code };
  }
}

async function main() {
  const [finnhub, twelveData, fred] = await Promise.all([
    checkFinnhub(),
    checkTwelveData(),
    checkFred(),
  ]);

  const result: CheckResult = { finnhub, twelveData, fred };
  // Output JSON only - no key values, no request URLs
  console.log(JSON.stringify(result, null, 2));

  // Exit 0 even if not configured - CI should not fail on missing optional keys
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(JSON.stringify({ error: msg }));
  process.exit(1);
});
