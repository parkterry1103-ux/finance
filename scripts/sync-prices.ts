import { anchors, companies, marketMovers, mockMarketPrices, stockAutopsyPicks } from '../src/data.js';
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
  if (envValue('PRICE_SYNC_SOURCE') === 'import-only') {
    return loadImportRows();
  }

  const yahoo = await fetchYahooFinanceRows();
  if (yahoo.rows.length) return yahoo;

  const imported = await loadImportRows();
  if (imported.rows.length) return imported;

  return yahoo;
}
function isPriceTicker(ticker?: string) {
  return Boolean(ticker && ticker !== 'WATCH' && ticker !== '비상장' && (/\.KS$|\.KQ$|^[A-Z][A-Z0-9.-]{0,6}$/.test(ticker)));
}

function priceLookupTicker(ticker: string) {
  const normalized = ticker.trim().toUpperCase();
  return YAHOO_TICKER_ALIASES[normalized] ?? normalized;
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
  companies.forEach((company) => add(company.ticker, company.id, company.country));

  return Array.from(byLookupTicker.values());
}

function priceTargetSummary() {
  const listedCompanies = companies.filter((company) => company.tier === 'anchor' || isPriceTicker(company.ticker));
  const priceTargetCompanies = listedCompanies.filter((company) => isPriceTicker(company.ticker));
  const excludedCompanies = companies.filter((company) => !isPriceTicker(company.ticker));
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

async function fetchYahooFinanceRows() {
  if (envValue('PRICE_SYNC_SOURCE') === 'manual-only') return { rows: [], sourceLabel: '', results: [] };
  const targets = uniquePriceTargets();
  const rows = [];
  const results = [];

  for (const chunk of chunkArray(targets, 8)) {
    await Promise.all(
      chunk.map(async (target) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(target.lookupTicker)}?range=5d&interval=1d`;
        try {
          const response = await fetch(url, {
            headers: {
              Accept: 'application/json',
              'User-Agent': envValue('SEC_USER_AGENT', 'Mozilla/5.0 finance-supply-chain-app contact@example.com'),
            },
          });
          if (!response.ok) throw new Error(`Yahoo chart ${response.status}`);
          const row = normalizeYahooRow(target, await response.json());
          rows.push(row);
          results.push({
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
          results.push({ ticker: target.ticker, lookupTicker: target.lookupTicker, status: 'failed', error: message });
          console.warn(`[sync-prices] Yahoo chart skipped ${target.ticker} (${target.lookupTicker}): ${message}`);
        }
      }),
    );
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
    const { rows, sourceLabel, results = [] } = await loadPriceRows();
    if (!sourceLabel) {
      const failedCount = results.filter((item) => item.status === 'failed').length;
      const message = failedCount
        ? `Yahoo Finance chart failed for ${failedCount} tickers and no PRICE_IMPORT_URL/data/prices.json fallback produced rows.`
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
        },
        results,
        errors: [message],
      };
    }

    const normalizedRows = rows.map(normalizePriceRow).filter((row) => row.ticker);
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
        },
        results,
        errors: [message],
      };
    }

    if (hasSupabaseConfig()) {
      const companyRows = normalizedRows
        .map((row) => companies.find((company) => company.id === row.company_id))
        .filter(Boolean)
        .map((company) => ({
          id: company.id,
          name: company.name,
          ticker: company.ticker ?? null,
          market: company.country,
          sector: company.sector,
          dart_corp_code: company.corpCode ?? null,
          sec_cik: company.cik ?? null,
          updated_at: nowIso(),
        }));
      if (companyRows.length) {
        await upsertRows('companies', companyRows, ['id']);
      }
    }

    const result = await upsertRows('market_prices', normalizedRows, ['ticker', 'source', 'as_of']);
    const failedCount = results.filter((item) => item.status === 'failed').length;
    const successCount = results.filter((item) => item.status === 'success').length;
    const status = failedCount > 0 ? 'partial' : 'success';
    const summary = status === 'partial' ? `Price sync partial: ${normalizedRows.length} rows saved/prepared, ${failedCount} tickers failed.` : '';
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
