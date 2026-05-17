const MAX_LIMIT = 200;

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

export default async function handler(req, res) {
  const limit = clampLimit(req.query?.limit);
  const ticker = typeof req.query?.ticker === 'string' ? req.query.ticker.trim() : '';
  const companyId = typeof req.query?.companyId === 'string' ? req.query.companyId.trim() : '';

  if (!hasSupabase()) {
    res.status(200).json({ ok: true, source: 'fallback', prices: [], reason: 'Supabase env missing' });
    return;
  }

  try {
    const url = new URL('/rest/v1/market_prices', env('SUPABASE_URL'));
    url.searchParams.set(
      'select',
      'company_id,ticker,market,price,open,previous_close,close,change,change_percent,currency,price_label,market_status,as_of,source,is_delayed,created_at',
    );
    url.searchParams.set('order', 'as_of.desc,created_at.desc');
    url.searchParams.set('limit', String(limit));
    if (ticker) url.searchParams.set('ticker', `ilike.*${ticker.replaceAll('*', '')}*`);
    if (companyId) url.searchParams.set('company_id', `eq.${companyId}`);

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

    const rows = await response.json();
    const deduped = new Map();
    rows.forEach((row) => {
      const key = `${row.company_id || ''}:${String(row.ticker || '').toUpperCase()}`;
      if (!deduped.has(key)) deduped.set(key, normalizePrice(row));
    });

    res.status(200).json({ ok: true, source: 'supabase', limit, prices: Array.from(deduped.values()) });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error), prices: [] });
  }
}
