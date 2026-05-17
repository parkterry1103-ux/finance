import { companies, mockMarketPrices } from '../src/data.js';
import { envValue, errorMessage, hasSupabaseConfig, isDirectRun, nowIso, recordSyncRun, upsertRows } from './sync-utils.js';

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

async function loadPriceRows() {
  const importUrl = envValue('MARKET_PRICES_IMPORT_URL');
  if (importUrl) {
    const response = await fetch(importUrl);
    if (!response.ok) throw new Error(`price import ${response.status}`);
    return { rows: parseRows(await response.text(), importUrl), sourceLabel: importUrl };
  }

  try {
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(projectFile('data/prices.json'), 'utf-8');
    return { rows: parseRows(raw, 'data/prices.json'), sourceLabel: 'data/prices.json' };
  } catch {
    const yahooRows = await fetchYahooFinanceRows();
    if (yahooRows.length) return { rows: yahooRows, sourceLabel: 'yahoo-finance-public-quote' };
    return { rows: [], sourceLabel: '' };
  }
}

function uniqueTickersForPriceSync() {
  return Array.from(
    new Set(
      companies
        .map((company) => company.ticker)
        .filter((ticker): ticker is string => Boolean(ticker && ticker !== 'WATCH')),
    ),
  );
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

function yahooMarketStatus(marketState) {
  const normalized = String(marketState ?? '').toUpperCase();
  if (normalized === 'REGULAR') return 'open';
  if (normalized === 'PRE' || normalized === 'PREPRE') return 'premarket';
  if (normalized === 'POST' || normalized === 'POSTPOST') return 'afterhours';
  if (normalized === 'CLOSED') return 'closed';
  return 'unknown';
}

function yahooPriceLabel(marketState) {
  const status = yahooMarketStatus(marketState);
  if (status === 'open') return 'latest';
  if (status === 'closed') return 'close';
  return 'delayed';
}

function signedPercent(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return `${parsed > 0 ? '+' : ''}${parsed.toFixed(2)}%`;
}

function nullableString(value) {
  return value === undefined || value === null || value === '' ? null : String(value);
}

async function fetchYahooFinanceRows() {
  if (envValue('PRICE_SYNC_SOURCE') === 'manual-only') return [];
  const tickers = uniqueTickersForPriceSync();
  const rows = [];
  for (const chunk of chunkArray(tickers, 70)) {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(chunk.join(','))}`;
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': envValue('SEC_USER_AGENT', 'finance-supply-chain-app contact@example.com'),
        },
      });
      if (!response.ok) throw new Error(`Yahoo quote ${response.status}`);
      const payload = await response.json();
      const results = payload?.quoteResponse?.result;
      if (!Array.isArray(results)) continue;
      results.forEach((quote) => {
        const company = companies.find((item) => item.ticker === quote.symbol);
        rows.push({
          companyId: company?.id,
          ticker: quote.symbol,
          market: company?.country ?? quote.fullExchangeName ?? 'unknown',
          price: quote.regularMarketPrice,
          open: quote.regularMarketOpen,
          previousClose: quote.regularMarketPreviousClose,
          close: yahooMarketStatus(quote.marketState) === 'closed' ? quote.regularMarketPrice : quote.regularMarketPreviousClose,
          change: quote.regularMarketChange,
          changePercent: signedPercent(quote.regularMarketChangePercent),
          currency: quote.currency,
          priceLabel: yahooPriceLabel(quote.marketState),
          marketStatus: yahooMarketStatus(quote.marketState),
          asOf: quote.regularMarketTime ? new Date(Number(quote.regularMarketTime) * 1000).toISOString() : nowIso(),
          source: 'yahoo-finance-public-quote',
          isDelayed: true,
        });
      });
    } catch (error) {
      console.warn(`[sync-prices] Yahoo chunk skipped: ${errorMessage(error)}`);
    }
  }
  return rows;
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
  try {
    const { rows, sourceLabel } = await loadPriceRows();
    if (!sourceLabel) {
      const message = 'No price import source. Frontend keeps mock delayed/close price fallback.';
      await recordSyncRun({ source: 'market-prices', status: 'skipped', startedAt, errorMessage: message });
      return {
        source: 'market-prices',
        status: 'skipped',
        insertedCount: 0,
        updatedCount: 0,
        mockFallbackCount: mockRowsForReport().length,
        errors: [message],
      };
    }

    const normalizedRows = rows.map(normalizePriceRow).filter((row) => row.ticker);
    if (!normalizedRows.length) {
      const message = `No price rows in ${sourceLabel}. Frontend keeps mock fallback.`;
      await recordSyncRun({ source: 'market-prices', status: 'skipped', startedAt, errorMessage: message });
      return { source: 'market-prices', status: 'skipped', insertedCount: 0, updatedCount: 0, errors: [message] };
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
    await recordSyncRun({
      source: 'market-prices',
      status: 'success',
      startedAt,
      insertedCount: result.inserted ?? normalizedRows.length,
      updatedCount: result.updated ?? 0,
    });
    return {
      source: 'market-prices',
      status: 'success',
      insertedCount: result.inserted ?? normalizedRows.length,
      updatedCount: result.updated ?? 0,
      errors: [],
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
