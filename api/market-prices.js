const MAX_LIMIT = 200;
const PAGE_SIZE = 1000;
const MAX_PAGES = 25;
const MARKET_PRICE_SELECT =
  'company_id,ticker,market,price,open,previous_close,close,change,change_percent,currency,price_label,market_status,as_of,source,is_delayed,created_at';

function env(key) {
  return process.env[key] || '';
}

function hasSupabase() {
  return Boolean(env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY'));
}

function clampLimit(value) {
  const parsed = Number.parseInt(String(value ?? '200'), 10);
  if (!Number.isFinite(parsed)) return 200;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

export function normalizeTickerKey(ticker = '') {
  return String(ticker ?? '').trim().toUpperCase();
}

function parseTimestamp(value) {
  const parsed = Date.parse(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function compareTimestampDesc(left, right) {
  const leftTime = parseTimestamp(left);
  const rightTime = parseTimestamp(right);
  if (leftTime === rightTime) return 0;
  return rightTime > leftTime ? 1 : -1;
}

function parsePriceValue(value) {
  if (value === null || value === undefined || value === '') return Number.NaN;
  return Number(String(value).replace(/[^0-9.-]/g, ''));
}

function hasValidPrice(row) {
  return Number.isFinite(parsePriceValue(row?.price));
}

export function compareMarketPriceRows(left, right) {
  const leftValid = hasValidPrice(left);
  const rightValid = hasValidPrice(right);
  if (leftValid !== rightValid) return leftValid ? -1 : 1;

  const asOfDiff = compareTimestampDesc(left?.as_of, right?.as_of);
  if (asOfDiff !== 0) return asOfDiff;

  const createdAtDiff = compareTimestampDesc(left?.created_at, right?.created_at);
  if (createdAtDiff !== 0) return createdAtDiff;

  const tickerDiff = normalizeTickerKey(left?.ticker).localeCompare(normalizeTickerKey(right?.ticker));
  if (tickerDiff !== 0) return tickerDiff;

  return String(left?.source ?? '').localeCompare(String(right?.source ?? ''));
}

export function latestRowsByTicker(rows) {
  const byTicker = new Map();
  rows.forEach((row) => {
    const key = normalizeTickerKey(row?.ticker);
    if (!key) return;
    const current = byTicker.get(key);
    if (!current || compareMarketPriceRows(row, current) < 0) byTicker.set(key, row);
  });
  return Array.from(byTicker.values()).sort(compareMarketPriceRows);
}

function normalizePrice(row) {
  return {
    companyId: row.company_id || undefined,
    ticker: row.ticker,
    market: row.market || 'unknown',
    price: row.price || '',
    open: row.open || undefined,
    previousClose: row.previous_close || undefined,
    close: row.close || undefined,
    change: row.change || '',
    changePercent: row.change_percent || '',
    currency: row.currency || (String(row.ticker || '').includes('.KS') || String(row.ticker || '').includes('.KQ') ? 'KRW' : 'USD'),
    priceLabel: row.price_label || undefined,
    marketStatus: row.market_status || 'unknown',
    asOf: row.as_of || '',
    source: row.source || 'supabase',
    isDelayed: row.is_delayed !== false,
  };
}

function tickerAliases(ticker = '') {
  const normalized = normalizeTickerKey(ticker);
  if (!normalized) return [];
  const aliases = new Set([normalized]);
  if (normalized === 'BRK.B') aliases.add('BRK-B');
  if (normalized === 'BRK-B') aliases.add('BRK.B');
  if (normalized === 'SQ') aliases.add('XYZ');
  return Array.from(aliases);
}

function unavailablePrice(ticker = '', companyId = '') {
  return {
    companyId: companyId || undefined,
    ticker,
    market: 'unknown',
    price: '',
    change: '',
    changePercent: '',
    currency: ticker.includes('.KS') || ticker.includes('.KQ') ? 'KRW' : 'USD',
    priceLabel: 'unavailable',
    marketStatus: 'unknown',
    asOf: '',
    source: 'fallback-unavailable',
    isDelayed: true,
  };
}

function sanitizeFilterValue(value = '') {
  return String(value).replace(/[*,()]/g, '').trim();
}

function marketPricesUrl({ ticker, companyId, offset }) {
  const url = new URL('/rest/v1/market_prices', env('SUPABASE_URL'));
  url.searchParams.set('select', MARKET_PRICE_SELECT);
  url.searchParams.set('order', 'as_of.desc,created_at.desc');
  url.searchParams.set('limit', String(PAGE_SIZE));
  url.searchParams.set('offset', String(offset));
  if (ticker) {
    const aliases = tickerAliases(ticker)
      .map(sanitizeFilterValue)
      .filter(Boolean)
      .map((item) => `ticker.ilike.*${item}*`);
    if (aliases.length > 1) url.searchParams.set('or', `(${aliases.join(',')})`);
    else url.searchParams.set('ticker', `ilike.*${sanitizeFilterValue(ticker)}*`);
  }
  if (companyId) url.searchParams.set('company_id', `eq.${sanitizeFilterValue(companyId)}`);
  return url;
}

async function fetchMarketPriceRows({ ticker, companyId }) {
  const rows = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const offset = page * PAGE_SIZE;
    const url = marketPricesUrl({ ticker, companyId, offset });
    const response = await fetch(url, {
      headers: {
        apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase market_prices query failed: ${response.status} ${await response.text()}`);
    }

    const pageRows = await response.json();
    if (!Array.isArray(pageRows) || !pageRows.length) break;
    rows.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) break;
  }
  return rows;
}

export default async function handler(req, res) {
  const limit = clampLimit(req.query?.limit);
  const ticker = typeof req.query?.ticker === 'string' ? req.query.ticker.trim() : '';
  const companyId = typeof req.query?.companyId === 'string' ? req.query.companyId.trim() : '';
  res.setHeader?.('Cache-Control', 'no-store');

  if (!hasSupabase()) {
    res.status(200).json({
      ok: true,
      source: 'fallback',
      prices: ticker || companyId ? [unavailablePrice(ticker, companyId)] : [],
      reason: 'Supabase env missing',
    });
    return;
  }

  try {
    const rows = await fetchMarketPriceRows({ ticker, companyId });
    const prices = latestRowsByTicker(rows).slice(0, limit).map(normalizePrice);
    res.status(200).json({
      ok: true,
      source: prices.length ? 'supabase' : 'fallback',
      limit,
      prices: prices.length || (!ticker && !companyId) ? prices : [unavailablePrice(ticker, companyId)],
    });
  } catch (error) {
    res.status(200).json({
      ok: true,
      source: 'fallback',
      prices: ticker || companyId ? [unavailablePrice(ticker, companyId)] : [],
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
