const MAX_LIMIT = 200;
const PAGE_SIZE = 1000;
const MAX_PAGES = 25;
const MARKET_PRICE_SELECT =
  'company_id,ticker,market,price,open,previous_close,close,change,change_percent,currency,price_label,market_status,as_of,source,is_delayed,created_at';
const MARKET_BRIEF_TARGETS = [
  { ticker: '^KS11', market: 'KOSPI', currency: 'KRW' },
  { ticker: '^KQ11', market: 'KOSDAQ', currency: 'KRW' },
  { ticker: '^GSPC', market: 'S&P', currency: 'USD' },
  { ticker: '^IXIC', market: 'NASDAQ', currency: 'USD' },
  { ticker: 'KRW=X', market: 'FX', currency: 'KRW' },
  { ticker: '^TNX', market: 'US TREASURY', currency: 'PERCENT' },
  { ticker: 'GC=F', market: 'COMEX', currency: 'USD' },
  { ticker: 'HG=F', market: 'COMEX', currency: 'USD' },
  { ticker: 'CL=F', market: 'NYMEX', currency: 'USD' },
];
const MARKET_BRIEF_TICKERS = new Set(MARKET_BRIEF_TARGETS.map((target) => target.ticker));

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

function signedNumber(value) {
  return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${value.toFixed(4)}` : '';
}

function signedPercent(value) {
  return Number.isFinite(value) ? `${value > 0 ? '+' : ''}${value.toFixed(2)}%` : '';
}

function finiteQuotePoints(values = [], timestamps = []) {
  return values.flatMap((value, index) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? [{ value: parsed, timestamp: timestamps[index] }] : [];
  });
}

export function normalizeYahooMarketBriefPrice(target, payload) {
  const result = payload?.chart?.result?.[0];
  const error = payload?.chart?.error;
  if (!result || error) throw new Error(error?.description || 'Yahoo chart result missing');

  const meta = result.meta ?? {};
  const quote = result.indicators?.quote?.[0] ?? {};
  const closes = finiteQuotePoints(quote.close, result.timestamp);
  const opens = finiteQuotePoints(quote.open, result.timestamp);
  const latestClose = closes.at(-1);
  const priorClose = closes.at(-2);
  const latestOpen = opens.at(-1);
  const price = Number(meta.regularMarketPrice ?? latestClose?.value);
  const previousClose = Number(priorClose?.value);
  const open = Number(meta.regularMarketOpen ?? latestOpen?.value);
  if (!Number.isFinite(price)) throw new Error('Yahoo chart price missing');

  const change = Number.isFinite(previousClose) ? price - previousClose : Number.NaN;
  const changePercent = Number.isFinite(change) && previousClose !== 0 ? (change / previousClose) * 100 : Number.NaN;
  const asOfTimestamp = Number(meta.regularMarketTime ?? latestClose?.timestamp);

  return {
    ticker: target.ticker,
    market: target.market,
    price: String(price),
    open: Number.isFinite(open) ? String(open) : undefined,
    previousClose: Number.isFinite(previousClose) ? String(previousClose) : undefined,
    close: String(price),
    change: signedNumber(change),
    changePercent: signedPercent(changePercent),
    currency: target.currency || meta.currency || 'USD',
    priceLabel: 'delayed',
    marketStatus: 'unknown',
    asOf: Number.isFinite(asOfTimestamp) ? new Date(asOfTimestamp * 1000).toISOString() : '',
    source: 'yahoo-finance-chart',
    isDelayed: true,
  };
}

async function fetchYahooMarketBriefPrices(targets) {
  const settled = await Promise.allSettled(
    targets.map(async (target) => {
      let lastStatus = 0;
      for (const host of ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']) {
        const url = `https://${host}/v8/finance/chart/${encodeURIComponent(target.ticker)}?range=5d&interval=1d`;
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': env('SEC_USER_AGENT') || 'Mozilla/5.0 finance-market-brief contact@example.com',
          },
        });
        lastStatus = response.status;
        if (response.ok) return normalizeYahooMarketBriefPrice(target, await response.json());
      }
      throw new Error(`Yahoo chart ${lastStatus || 'unavailable'}`);
    }),
  );
  return settled.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
}

function hasValidPrice(row) {
  return Number.isFinite(parsePriceValue(row?.price));
}

function hasUsableMarketBriefPrice(row) {
  if (!hasValidPrice(row) || !Number.isFinite(parsePriceValue(row?.previousClose))) return false;
  const asOf = Date.parse(String(row?.asOf ?? row?.as_of ?? ''));
  return Number.isFinite(asOf) && Date.now() - asOf < 96 * 60 * 60 * 1000;
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
  const marketBriefTarget = MARKET_BRIEF_TARGETS.find((target) => target.ticker === normalizeTickerKey(ticker));
  return {
    companyId: companyId || undefined,
    ticker,
    market: marketBriefTarget?.market || 'unknown',
    price: '',
    change: '',
    changePercent: '',
    currency: marketBriefTarget?.currency || (ticker.includes('.KS') || ticker.includes('.KQ') ? 'KRW' : 'USD'),
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
  const includeMarketBrief = req.query?.include === 'market-brief';
  res.setHeader?.(
    'Cache-Control',
    includeMarketBrief ? 'public, s-maxage=300, stale-while-revalidate=900' : 'no-store',
  );

  if (!hasSupabase()) {
    const liveBriefPrices = includeMarketBrief && !ticker && !companyId
      ? await fetchYahooMarketBriefPrices(MARKET_BRIEF_TARGETS)
      : [];
    res.status(200).json({
      ok: true,
      source: liveBriefPrices.length ? 'yahoo-finance-chart' : 'fallback',
      prices: liveBriefPrices.length
        ? liveBriefPrices.slice(0, limit)
        : ticker || companyId
          ? [unavailablePrice(ticker, companyId)]
          : [],
      reason: 'Supabase env missing',
    });
    return;
  }

  try {
    const rows = await fetchMarketPriceRows({ ticker, companyId });
    const storedPrices = latestRowsByTicker(rows).map(normalizePrice);
    let prices = storedPrices;
    let liveBriefPrices = [];
    if (includeMarketBrief && !ticker && !companyId) {
      const storedTickers = new Set(storedPrices.filter(hasUsableMarketBriefPrice).map((price) => normalizeTickerKey(price.ticker)));
      const missingBriefTargets = MARKET_BRIEF_TARGETS.filter((target) => !storedTickers.has(target.ticker));
      liveBriefPrices = await fetchYahooMarketBriefPrices(missingBriefTargets);
      const combined = new Map(storedPrices.map((price) => [normalizeTickerKey(price.ticker), price]));
      liveBriefPrices.forEach((price) => combined.set(normalizeTickerKey(price.ticker), price));
      const briefPrices = MARKET_BRIEF_TARGETS.flatMap((target) => {
        const price = combined.get(target.ticker);
        return price ? [price] : [];
      });
      const regularPrices = storedPrices.filter((price) => !MARKET_BRIEF_TICKERS.has(normalizeTickerKey(price.ticker)));
      prices = [...briefPrices, ...regularPrices];
    }
    prices = prices.slice(0, limit);
    res.status(200).json({
      ok: true,
      source: prices.length ? (liveBriefPrices.length ? 'supabase+yahoo-finance-chart' : 'supabase') : 'fallback',
      limit,
      prices: prices.length || (!ticker && !companyId) ? prices : [unavailablePrice(ticker, companyId)],
    });
  } catch (error) {
    const liveBriefPrices = includeMarketBrief && !ticker && !companyId
      ? await fetchYahooMarketBriefPrices(MARKET_BRIEF_TARGETS)
      : [];
    res.status(200).json({
      ok: true,
      source: liveBriefPrices.length ? 'yahoo-finance-chart' : 'fallback',
      prices: liveBriefPrices.length
        ? liveBriefPrices.slice(0, limit)
        : ticker || companyId
          ? [unavailablePrice(ticker, companyId)]
          : [],
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
