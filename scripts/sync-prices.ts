import { anchors, companies, marketMovers, mockMarketPrices, stockAutopsyPicks } from '../src/data.js';
import { inferCompanyListing, isPriceSyncTarget } from '../src/services/listing.js';
import { fetchKisDomesticQuoteRows, isKisDomesticTicker } from './price-sources/kis.js';
import { envValue, errorMessage, hasSupabaseConfig, isDirectRun, nowIso, recordSyncRun, upsertRows } from './sync-utils.js';

const REQUIRED_PRICE_TICKERS = [
  '005930.KS',
  '000660.KS',
  '373220.KS',
  '005380.KS',
  '035420.KS',
  '035720.KS',
  'NVDA',
  'AMD',
  'INTC',
  'AAPL',
  'TSLA',
  'BRK-B',
  'XYZ',
];

const YAHOO_TICKER_ALIASES: Record<string, string> = {
  'BRK.B': 'BRK-B',
  SQ: 'XYZ',
};
const YAHOO_CHUNK_SIZE = 4;
const YAHOO_CHUNK_DELAY_MS = 250;
const YAHOO_RETRY_COUNT = 1;
const YAHOO_RETRY_DELAY_MS = 750;

function projectFile(path) {
  const runtime = globalThis as typeof globalThis & { process?: { cwd?: () => string } };
  return `${runtime.process?.cwd?.() ?? '.'}/${path}`;
}

function parseCsv(text) {
  const lines = String(text).trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const split = (line) => {
    const cells = [];
    let current = '';
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];
      if (char === '"' && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === ',' && !quoted) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  };
  const headers = split(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? '';
    });
    return row;
  });
}

function parseRows(text, label) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.rows)) return parsed.rows;
    if (Array.isArray(parsed.data)) return parsed.data;
    throw new Error(`${label} JSON must be an array or contain rows/data array`);
  }
  return parseCsv(trimmed);
}

function importUrl() {
  return envValue('PRICE_IMPORT_URL') || envValue('MARKET_PRICES_IMPORT_URL');
}

function normalizeTickerKey(ticker?: string) {
  return String(ticker ?? '').trim().toUpperCase();
}

function combinedSourceLabel(labels) {
  return Array.from(new Set(labels.filter(Boolean))).join('+');
}

function dedupeRowsByTicker(rows) {
  const byTicker = new Map();
  rows.forEach((row) => {
    const key = normalizeTickerKey(row?.ticker);
    if (key && !byTicker.has(key)) byTicker.set(key, row);
  });
  return Array.from(byTicker.values());
}

function resultProviderMetrics(provider, attemptedCount, results, skippedCount = 0, skipReason = '') {
  const providerResults = results.filter((item) => item.provider === provider || (!item.provider && provider === 'import'));
  return {
    attemptedCount,
    successCount: providerResults.filter((item) => item.status === 'success').length,
    failedCount: providerResults.filter((item) => item.status === 'failed').length,
    skippedCount,
    skipReason,
  };
}

function emptyProviderMetrics(skippedCount = 0, skipReason = '') {
  return {
    attemptedCount: 0,
    successCount: 0,
    failedCount: 0,
    skippedCount,
    skipReason,
  };
}

function targetsMissingRows(targets, rows) {
  const rowTickers = new Set(rows.map((row) => normalizeTickerKey(row.ticker)));
  return targets.filter((target) => !rowTickers.has(normalizeTickerKey(target.ticker)));
}

function maxAsOf(rows) {
  return rows
    .map((row) => row.as_of ?? row.asOf)
    .filter(Boolean)
    .sort((left, right) => compareAsOf(right, left))[0] ?? null;
}

function compareAsOf(left, right) {
  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;
  const leftTime = Date.parse(left);
  const rightTime = Date.parse(right);
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) return leftTime - rightTime;
  return String(left).localeCompare(String(right));
}

async function latestMarketPriceAsOf() {
  if (!hasSupabaseConfig()) return null;
  try {
    const url = new URL('/rest/v1/market_prices', envValue('SUPABASE_URL'));
    url.searchParams.set('select', 'as_of');
    url.searchParams.set('order', 'as_of.desc,created_at.desc');
    url.searchParams.set('limit', '1');

    const response = await fetch(url, {
      headers: {
        apikey: envValue('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${envValue('SUPABASE_SERVICE_ROLE_KEY')}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Supabase market_prices latest query failed: ${response.status}`);
    const rows = await response.json();
    return rows?.[0]?.as_of ?? null;
  } catch (error) {
    console.warn(`[sync-prices] latest market price as_of check skipped: ${errorMessage(error)}`);
    return null;
  }
}

async function loadImportRows() {
  const importUrlValue = importUrl();
  if (importUrlValue) {
    const response = await fetch(importUrlValue);
    if (!response.ok) throw new Error(`price import ${response.status}`);
    const rows = parseRows(await response.text(), importUrlValue);
    return {
      rows,
      sourceLabel: importUrlValue,
      results: rows.map((row) => ({
        provider: 'import',
        ticker: row.ticker,
        status: row.ticker ? 'success' : 'failed',
        price: row.price,
        priceLabel: row.priceLabel ?? row.price_label ?? 'delayed',
        source: row.source ?? 'manual-import',
        asOf: row.asOf ?? row.as_of,
      })),
    };
  }

  try {
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(projectFile('data/prices.json'), 'utf-8');
    const rows = parseRows(raw, 'data/prices.json');
    return {
      rows,
      sourceLabel: 'data/prices.json',
      results: rows.map((row) => ({
        provider: 'import',
        ticker: row.ticker,
        status: row.ticker ? 'success' : 'failed',
        price: row.price,
        priceLabel: row.priceLabel ?? row.price_label ?? 'delayed',
        source: row.source ?? 'manual-import',
        asOf: row.asOf ?? row.as_of,
      })),
    };
  } catch {
    return { rows: [], sourceLabel: '', results: [] };
  }
}

async function loadPriceRows() {
  const syncSource = envValue('PRICE_SYNC_SOURCE');
  const zeroMetrics = {
    kis: emptyProviderMetrics(),
    yahoo: emptyProviderMetrics(),
    import: emptyProviderMetrics(),
  };

  if (syncSource === 'import-only' || syncSource === 'manual-only') {
    const imported = await loadImportRows();
    return {
      ...imported,
      metrics: {
        ...zeroMetrics,
        import: resultProviderMetrics('import', imported.rows.length, imported.results),
      },
      providerFallbackUsed: Boolean(imported.rows.length),
    };
  }

  const targets = uniquePriceTargets();
  const domesticTargets = targets.filter((target) => isKisDomesticTicker(target.ticker));
  const kis = await fetchKisDomesticQuoteRows(domesticTargets);
  const kisSuccessTickers = new Set(kis.rows.map((row) => normalizeTickerKey(row.ticker)));
  const yahooTargets = targets.filter((target) => !kisSuccessTickers.has(normalizeTickerKey(target.ticker)));
  const yahoo = await fetchYahooFinanceRows(yahooTargets);

  let imported = { rows: [], sourceLabel: '', results: [] };
  let importRows = [];
  let importResults = [];
  let rows = dedupeRowsByTicker([...kis.rows, ...yahoo.rows]);
  const missingAfterProviders = targetsMissingRows(targets, rows);
  const providerFailures = [...kis.results, ...yahoo.results].filter((item) => item.status === 'failed').length;

  if (!rows.length || missingAfterProviders.length || providerFailures) {
    imported = await loadImportRows();
    if (imported.rows.length) {
      const existingTickers = new Set(rows.map((row) => normalizeTickerKey(row.ticker)));
      importRows = imported.rows.filter((row) => {
        const key = normalizeTickerKey(row.ticker);
        return key && !existingTickers.has(key);
      });
      const importTickers = new Set(importRows.map((row) => normalizeTickerKey(row.ticker)));
      importResults = imported.results.filter((item) => importTickers.has(normalizeTickerKey(item.ticker)));
      rows = dedupeRowsByTicker([...rows, ...importRows]);
    }
  }

  return {
    rows,
    sourceLabel: combinedSourceLabel([kis.sourceLabel, yahoo.sourceLabel, importRows.length ? imported.sourceLabel : '']),
    results: [...kis.results, ...yahoo.results, ...importResults],
    metrics: {
      kis: {
        attemptedCount: kis.attemptedCount,
        successCount: kis.successCount,
        failedCount: kis.failedCount,
        skippedCount: kis.skippedCount,
        skipReason: kis.skipReason,
      },
      yahoo: resultProviderMetrics('yahoo-finance-chart', yahooTargets.length, yahoo.results),
      import: resultProviderMetrics('import', importRows.length, importResults),
    },
    providerFallbackUsed: Boolean(importRows.length || yahoo.rows.length < yahooTargets.length || kis.failedCount),
  };
}
function isPriceTicker(ticker?: string) {
  return Boolean(ticker && ticker !== 'WATCH' && ticker !== '비상장' && (/\.KS$|\.KQ$|^[A-Z][A-Z0-9.-]{0,6}$/.test(ticker)));
}

function priceLookupTicker(ticker: string) {
  const normalized = ticker.trim().toUpperCase();
  return YAHOO_TICKER_ALIASES[normalized] ?? normalized;
}

function canonicalPriceCompany(row) {
  const lookupTicker = priceLookupTicker(normalizeTickerKey(row.ticker));
  return (
    companies.find((company) => company.ticker && priceLookupTicker(normalizeTickerKey(company.ticker)) === lookupTicker) ??
    companies.find((company) => company.id === row.company_id)
  );
}

function canonicalizePriceCompanyIds(rows) {
  return rows.map((row) => {
    const company = canonicalPriceCompany(row);
    return { ...row, company_id: company?.id ?? null };
  });
}

function companyRowsForPrices(rows) {
  const byId = new Map();
  rows.forEach((row) => {
    const company = canonicalPriceCompany(row);
    if (!company || byId.has(company.id)) return;
    byId.set(company.id, {
      id: company.id,
      name: company.name,
      ticker: company.ticker ?? null,
      market: company.country,
      sector: company.sector,
      dart_corp_code: company.corpCode ?? null,
      sec_cik: company.cik ?? null,
      updated_at: nowIso(),
    });
  });
  return Array.from(byId.values());
}

function uniquePriceTargets() {
  const byLookupTicker = new Map<string, { ticker: string; lookupTicker: string; companyId?: string; market?: string }>();
  const add = (ticker?: string, companyId?: string, market?: string) => {
    if (!isPriceTicker(ticker)) return;
    const normalizedTicker = String(ticker).trim().toUpperCase();
    const lookupTicker = priceLookupTicker(normalizedTicker);
    if (!byLookupTicker.has(lookupTicker)) {
      byLookupTicker.set(lookupTicker, { ticker: normalizedTicker, lookupTicker, companyId, market });
      return;
    }

    const previous = byLookupTicker.get(lookupTicker);
    if (previous && !previous.companyId && companyId) {
      byLookupTicker.set(lookupTicker, { ...previous, companyId, market: market ?? previous.market });
    }
  };

  REQUIRED_PRICE_TICKERS.forEach((ticker) => add(ticker));
  mockMarketPrices.forEach((price) => add(price.ticker, price.companyId, price.market));
  marketMovers.forEach((mover) => add(mover.ticker, mover.companyId, mover.market));
  stockAutopsyPicks.forEach((pick) => add(pick.ticker, pick.relatedCompanyId, pick.market));
  anchors.forEach((anchor) => add(anchor.ticker, anchor.id, anchor.country));
  companies.forEach((company) => {
    const listing = inferCompanyListing(company);
    if (listing.isPriceSyncTarget) add(company.ticker, company.id, listing.market);
  });

  return Array.from(byLookupTicker.values());
}

function priceTargetSummary() {
  const listedCompanies = companies.filter((company) => inferCompanyListing(company).listed);
  const priceTargetCompanies = listedCompanies.filter((company) => isPriceSyncTarget(company));
  const excludedCompanies = companies.filter((company) => !isPriceSyncTarget(company));
  return {
    totalCompanyCount: companies.length,
    listedOrTrackedCompanyCount: listedCompanies.length,
    priceTargetCompanyCount: priceTargetCompanies.length,
    excludedPrivateOrUnavailableCompanyCount: excludedCompanies.length,
    targetTickerCount: uniquePriceTargets().length,
  };
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableYahooStatus(status: number) {
  return status === 429 || status >= 500;
}

function yahooMarketStatus(marketState, tradingPeriod) {
  const normalized = String(marketState ?? '').toUpperCase();
  if (normalized === 'REGULAR') return 'open';
  if (normalized === 'PRE' || normalized === 'PREPRE') return 'premarket';
  if (normalized === 'POST' || normalized === 'POSTPOST') return 'afterhours';
  if (normalized === 'CLOSED') return 'closed';
  const now = Math.floor(Date.now() / 1000);
  if (tradingPeriod?.regular?.start && tradingPeriod?.regular?.end && now >= tradingPeriod.regular.start && now <= tradingPeriod.regular.end) {
    return 'open';
  }
  return 'unknown';
}

function yahooPriceLabel(marketState, tradingPeriod) {
  const status = yahooMarketStatus(marketState, tradingPeriod);
  if (status === 'open') return 'latest';
  if (status === 'closed') return 'close';
  return 'delayed';
}

function signedPercent(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return `${parsed > 0 ? '+' : ''}${parsed.toFixed(2)}%`;
}

function signedNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return `${parsed > 0 ? '+' : ''}${parsed.toFixed(2)}`;
}

function nullableString(value) {
  return value === undefined || value === null || value === '' ? null : String(value);
}

function lastFinite(values) {
  if (!Array.isArray(values)) return null;
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = Number(values[index]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function normalizeYahooRow(target, payload) {
  const result = payload?.chart?.result?.[0];
  const error = payload?.chart?.error;
  if (!result || error) throw new Error(error?.description || 'Yahoo chart result missing');
  const meta = result.meta ?? {};
  const quote = result.indicators?.quote?.[0] ?? {};
  const status = yahooMarketStatus(meta.marketState, meta.currentTradingPeriod);
  const price = Number(meta.regularMarketPrice ?? lastFinite(quote.close));
  const open = Number(meta.regularMarketOpen ?? lastFinite(quote.open));
  const previousClose = Number(meta.chartPreviousClose ?? meta.previousClose);
  const basis = Number.isFinite(open) ? open : previousClose;
  const change = Number.isFinite(price) && Number.isFinite(basis) ? price - basis : Number.NaN;
  const changePercent = Number.isFinite(change) && Number.isFinite(basis) && basis !== 0 ? (change / basis) * 100 : Number.NaN;

  if (!Number.isFinite(price)) throw new Error('Yahoo chart price missing');

  return {
    companyId: target.companyId,
    ticker: target.ticker,
    market: target.market ?? meta.exchangeName ?? 'unknown',
    price,
    open: Number.isFinite(open) ? open : null,
    previousClose: Number.isFinite(previousClose) ? previousClose : null,
    close: status === 'closed' ? price : lastFinite(quote.close) ?? price,
    change: signedNumber(change),
    changePercent: signedPercent(changePercent),
    currency: meta.currency,
    priceLabel: yahooPriceLabel(meta.marketState, meta.currentTradingPeriod),
    marketStatus: status,
    asOf: meta.regularMarketTime ? new Date(Number(meta.regularMarketTime) * 1000).toISOString() : nowIso(),
    source: 'yahoo-finance-chart',
    isDelayed: true,
  };
}

async function fetchYahooFinanceRows(targets = uniquePriceTargets()) {
  if (envValue('PRICE_SYNC_SOURCE') === 'manual-only') return { rows: [], sourceLabel: '', results: [] };
  const rows = [];
  const results = [];

  const yahooChunks = chunkArray(targets, YAHOO_CHUNK_SIZE);
  for (const [chunkIndex, chunk] of yahooChunks.entries()) {
    await Promise.all(
      chunk.map(async (target) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(target.lookupTicker)}?range=5d&interval=1d`;
        try {
          let response;
          for (let attempt = 0; attempt <= YAHOO_RETRY_COUNT; attempt += 1) {
            response = await fetch(url, {
              headers: {
                Accept: 'application/json',
                'User-Agent': envValue('SEC_USER_AGENT', 'Mozilla/5.0 finance-supply-chain-app contact@example.com'),
              },
            });
            if (response.ok || attempt >= YAHOO_RETRY_COUNT || !isRetriableYahooStatus(response.status)) break;
            await sleep(YAHOO_RETRY_DELAY_MS * (attempt + 1));
          }
          if (!response?.ok) throw new Error(`Yahoo chart ${response?.status ?? 'unknown'}`);
          const row = normalizeYahooRow(target, await response.json());
          rows.push(row);
          results.push({
            provider: 'yahoo-finance-chart',
            ticker: target.ticker,
            lookupTicker: target.lookupTicker,
            status: 'success',
            price: row.price,
            priceLabel: row.priceLabel,
            source: row.source,
            asOf: row.asOf,
          });
        } catch (error) {
          const message = errorMessage(error);
          results.push({ provider: 'yahoo-finance-chart', ticker: target.ticker, lookupTicker: target.lookupTicker, status: 'failed', error: message });
          console.warn(`[sync-prices] Yahoo chart skipped ${target.ticker} (${target.lookupTicker}): ${message}`);
        }
      }),
    );
    if (chunkIndex < yahooChunks.length - 1) await sleep(YAHOO_CHUNK_DELAY_MS);
  }

  return { rows, sourceLabel: rows.length ? 'yahoo-finance-chart' : '', results };
}

function normalizePriceRow(row) {
  return {
    company_id: row.company_id ?? row.companyId ?? null,
    ticker: row.ticker,
    market: row.market ?? 'unknown',
    price: nullableString(row.price),
    open: nullableString(row.open),
    previous_close: nullableString(row.previousClose ?? row.previous_close),
    close: nullableString(row.close),
    change: nullableString(row.change),
    change_percent: row.changePercent ?? row.change_percent ?? null,
    currency: row.currency ?? null,
    price_label: row.priceLabel ?? row.price_label ?? 'delayed',
    market_status: row.marketStatus ?? row.market_status ?? 'unknown',
    as_of: row.asOf ?? row.as_of ?? nowIso(),
    source: row.source ?? 'manual-price-import',
    is_delayed: Boolean(row.isDelayed ?? row.is_delayed ?? true),
    created_at: nowIso(),
  };
}

function mockRowsForReport() {
  return mockMarketPrices.map(normalizePriceRow);
}

export async function syncPrices() {
  const startedAt = nowIso();
  const targetSummary = priceTargetSummary();
  try {
    const latestAsOfBefore = await latestMarketPriceAsOf();
    const loadedPrices = await loadPriceRows();
    const { rows, sourceLabel, results = [] } = loadedPrices;
    const metrics: any = loadedPrices.metrics ?? {};
    const providerMetrics = {
      kis: metrics.kis ?? emptyProviderMetrics(),
      yahoo: metrics.yahoo ?? emptyProviderMetrics(),
      import: metrics.import ?? emptyProviderMetrics(),
    };
    if (!sourceLabel) {
      const failedCount = results.filter((item) => item.status === 'failed').length;
      const message = failedCount
        ? `Price providers failed for ${failedCount} attempts and no PRICE_IMPORT_URL/data/prices.json fallback produced rows.`
        : 'No price source produced rows. Frontend keeps mock fallback as example/pending prices.';
      await recordSyncRun({ source: 'market-prices', status: 'skipped', startedAt, errorMessage: message });
      return {
        source: 'market-prices',
        status: 'skipped',
        insertedCount: 0,
        updatedCount: 0,
        mockFallbackCount: mockRowsForReport().length,
        summary: {
          ...targetSummary,
          successTickerCount: 0,
          failedTickerCount: failedCount,
          providerMetrics,
          latest_as_of_before: latestAsOfBefore,
          latest_as_of_after: latestAsOfBefore,
        },
        results,
        errors: [message],
      };
    }

    const normalizedRows = canonicalizePriceCompanyIds(rows.map(normalizePriceRow).filter((row) => row.ticker));
    if (!normalizedRows.length) {
      const message = `No price rows in ${sourceLabel}. Frontend keeps mock fallback.`;
      await recordSyncRun({ source: 'market-prices', status: 'skipped', startedAt, errorMessage: message });
      return {
        source: 'market-prices',
        status: 'skipped',
        insertedCount: 0,
        updatedCount: 0,
        mockFallbackCount: mockRowsForReport().length,
        summary: {
          ...targetSummary,
          successTickerCount: 0,
          failedTickerCount: results.filter((item) => item.status === 'failed').length,
          providerMetrics,
          latest_as_of_before: latestAsOfBefore,
          latest_as_of_after: latestAsOfBefore,
        },
        results,
        errors: [message],
      };
    }

    if (hasSupabaseConfig()) {
      const companyRows = companyRowsForPrices(normalizedRows);
      if (companyRows.length) {
        await upsertRows('companies', companyRows, ['id']);
      }
    }

    const result = await upsertRows('market_prices', normalizedRows, ['ticker', 'source', 'as_of']);
    const latestAsOfAfter = await latestMarketPriceAsOf();
    const failedCount = results.filter((item) => item.status === 'failed').length;
    const successCount = new Set(normalizedRows.map((row) => normalizeTickerKey(row.ticker))).size;
    const latestDidNotAdvance = Boolean(latestAsOfBefore && latestAsOfAfter && compareAsOf(latestAsOfAfter, latestAsOfBefore) <= 0);
    const status = failedCount > 0 || latestDidNotAdvance ? 'partial' : 'success';
    const providerSummary = `KIS ${providerMetrics.kis.successCount}/${providerMetrics.kis.attemptedCount} ok, Yahoo ${providerMetrics.yahoo.successCount}/${providerMetrics.yahoo.attemptedCount} ok`;
    const latestSummary = latestAsOfBefore || latestAsOfAfter ? `latest_as_of ${latestAsOfBefore ?? 'unknown'} -> ${latestAsOfAfter ?? maxAsOf(normalizedRows) ?? 'unknown'}` : '';
    const summary = status === 'partial'
      ? `Price sync partial: ${normalizedRows.length} rows saved/prepared, ${failedCount} provider attempts failed. ${providerSummary}${latestDidNotAdvance ? `, ${latestSummary} unchanged` : latestSummary ? `, ${latestSummary}` : ''}.`
      : '';
    await recordSyncRun({
      source: 'market-prices',
      status,
      startedAt,
      insertedCount: result.inserted ?? normalizedRows.length,
      updatedCount: result.updated ?? 0,
      errorMessage: summary,
    });
    return {
      source: 'market-prices',
      status,
      insertedCount: result.inserted ?? normalizedRows.length,
      updatedCount: result.updated ?? 0,
      mockFallbackCount: 0,
      summary: {
        ...targetSummary,
        successTickerCount: successCount,
        failedTickerCount: failedCount,
        providerMetrics,
        latest_as_of_before: latestAsOfBefore,
        latest_as_of_after: latestAsOfAfter,
        prepared_latest_as_of: maxAsOf(normalizedRows),
      },
      results,
      errors: results.filter((item) => item.status === 'failed').map((item) => `${item.ticker}: ${item.error}`),
    };
  } catch (error) {
    await recordSyncRun({ source: 'market-prices', status: 'failed', startedAt, errorMessage: errorMessage(error) });
    return { source: 'market-prices', status: 'failed', insertedCount: 0, updatedCount: 0, errors: [errorMessage(error)] };
  }
}

if (isDirectRun(import.meta.url)) {
  syncPrices()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch(async (error) => {
      await recordSyncRun({ source: 'market-prices', status: 'failed', startedAt: nowIso(), errorMessage: errorMessage(error) });
      console.error(error);
      globalThis.process?.exit?.(1);
    });
}
