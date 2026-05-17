const MAX_LIMIT = 100;
const DEFAULT_PUBLIC_LIMIT = 20;
const DIVERSIFIED_FETCH_LIMIT = 500;

const PROMINENT_13F_INVESTORS = [
  'Berkshire Hathaway',
  'ARK Investment Management',
  'BlackRock',
  'Goldman Sachs',
  'Vanguard',
  'State Street',
  'JPMorgan',
  'Morgan Stanley',
  'Bridgewater',
  'Citadel',
  'Renaissance',
  'Baupost',
  'Soros',
];

const SOURCE_FILTERS = {
  all: '',
  'sec-13f': 'source=eq.sec-13f',
  'sec-form4': 'or=(source.ilike.*Form 4*,source.ilike.*sec-form4*)',
};

function clampLimit(value) {
  const parsed = Number.parseInt(String(value ?? String(DEFAULT_PUBLIC_LIMIT)), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_PUBLIC_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

function env(key) {
  return process.env[key] || '';
}

function hasSupabase() {
  return Boolean(env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY'));
}

function companyMap() {
  return new Map([
    ['NVDA', ['NVIDIA', 'US', 'AI 반도체']],
    ['AAPL', ['Apple', 'US', '소비자 기술']],
    ['TSLA', ['Tesla', 'US', '전기차']],
    ['MSFT', ['Microsoft', 'US', 'AI 클라우드']],
    ['AMZN', ['Amazon', 'US', 'AI 클라우드']],
    ['AMD', ['AMD', 'US', 'AI 반도체']],
    ['BRK.B', ['Berkshire Hathaway', 'US', '보험·투자지주']],
    ['BRK-B', ['Berkshire Hathaway', 'US', '보험·투자지주']],
    ['XYZ', ['Block', 'US', '핀테크·결제']],
    ['005930.KS', ['삼성전자', 'KR', '반도체']],
    ['000660.KS', ['SK하이닉스', 'KR', '반도체']],
  ]);
}

function normalizeAction(row) {
  const source = String(row.source || '').toLowerCase();
  const action = String(row.action || '').toLowerCase();
  if (source === 'sec-13f') return ['holding', '13F 보유 보고'];
  if (action.includes('sell') || action.includes('dispose')) return ['sell', '내부자 매도 보고'];
  if (action.includes('buy') || action.includes('acquire')) return ['buy', '내부자 매수 보고'];
  return [action || 'increase', source.includes('form') ? '내부자 거래 보고' : '공개 보유·거래 보고'];
}

function securityFromRawId(rawId) {
  const parts = String(rawId || '').split(':').filter(Boolean);
  const key = parts.length >= 3 ? parts.at(-2) || '' : parts.at(-1) || '';
  if (!key) return '';
  if (/^[A-Z0-9]{6,12}$/i.test(key)) return `CUSIP ${key.toUpperCase()}`;
  return key.replaceAll('-', ' ').slice(0, 80);
}

function normalizeTrade(row) {
  const ticker = String(row.ticker || '').trim();
  const lookup = companyMap().get(ticker.toUpperCase()) || companyMap().get(ticker);
  const source = String(row.source || '');
  const is13f = source === 'sec-13f';
  const [action, actionLabel] = normalizeAction(row);
  const fallbackSecurity = securityFromRawId(row.raw_id);
  const companyName = lookup?.[0] || ticker || fallbackSecurity || '보유 종목 확인 필요';
  const market = lookup?.[1] || (ticker.includes('.KS') || ticker.includes('.KQ') ? 'KR' : 'US');
  const sector = lookup?.[2] || '섹터 확인 필요';

  return {
    id: row.id || `${source}-${row.raw_id || ticker}-${row.created_at || ''}`,
    investorName: row.investor_name || (is13f ? '기관명 확인 필요' : '공개 보고자 확인 필요'),
    investorType: is13f ? 'fund' : 'insider',
    investorTypeLabel: is13f ? '기관 13F 분기 포트폴리오' : 'Form 4 내부자 거래 보고',
    companyName,
    ticker: ticker || fallbackSecurity,
    market,
    action,
    actionLabel,
    disclosedDate: row.disclosed_date || row.created_at || '',
    tradeDateOptional: row.trade_date || undefined,
    sector,
    sectorLabel: sector,
    source,
    sourceLabel: is13f ? 'SEC 13F 분기 포트폴리오' : 'SEC Form 4 공개 보고',
    sourceUrl: row.source_url || undefined,
    amount: row.amount || undefined,
    shares: row.shares || undefined,
    isDelayedDisclosure: true,
    beginnerExplanation: is13f
      ? '13F 보유 보고는 기관의 분기 말 포트폴리오를 보여주지만, 실시간 매수 신호가 아닙니다.'
      : '내부자 거래 보고는 공개 시점이 늦을 수 있어 실적과 공시를 함께 확인해야 합니다.',
  };
}

async function querySupabase({ source, limit, investor, ticker }) {
  const url = new URL('/rest/v1/ownership_trades', env('SUPABASE_URL'));
  url.searchParams.set('select', 'id,investor_name,investor_type,action,trade_date,disclosed_date,shares,price,amount,source,source_url,raw_id,ticker,created_at');
  url.searchParams.set('order', 'disclosed_date.desc.nullslast,created_at.desc');
  url.searchParams.set('limit', String(limit));
  const sourceFilter = SOURCE_FILTERS[source] ?? '';
  if (sourceFilter) {
    const [key, value] = sourceFilter.split('=');
    url.searchParams.set(key, value);
  }
  if (investor) url.searchParams.set('investor_name', `ilike.*${investor.replaceAll('*', '')}*`);
  if (ticker) url.searchParams.set('ticker', `ilike.*${ticker.replaceAll('*', '')}*`);

  const response = await fetch(url, {
    headers: {
      apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
      Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase ownership query failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function diversifyTrades(trades, limit) {
  const normalizedLimit = Math.min(Math.max(Number(limit) || DEFAULT_PUBLIC_LIMIT, 1), MAX_LIMIT);
  const byInvestor = new Map();
  trades.forEach((trade) => {
    const key = String(trade.investorName || '기관명 확인 필요').toLowerCase();
    const bucket = byInvestor.get(key) || [];
    bucket.push(trade);
    byInvestor.set(key, bucket);
  });

  const investorKeys = Array.from(byInvestor.keys());
  const preferredKeys = PROMINENT_13F_INVESTORS
    .map((name) => investorKeys.find((key) => key.includes(name.toLowerCase().split(' ')[0]) || key.includes(name.toLowerCase())))
    .filter(Boolean);
  const orderedKeys = Array.from(new Set([...preferredKeys, ...investorKeys]));
  const selected = [];
  let round = 0;

  while (selected.length < normalizedLimit) {
    let added = false;
    orderedKeys.forEach((key) => {
      if (selected.length >= normalizedLimit) return;
      const item = byInvestor.get(key)?.[round];
      if (item) {
        selected.push(item);
        added = true;
      }
    });
    if (!added) break;
    round += 1;
  }

  return selected;
}

export default async function handler(req, res) {
  const source = String(req.query?.source || 'all');
  const limit = clampLimit(req.query?.limit);
  const investor = typeof req.query?.investor === 'string' ? req.query.investor.trim() : '';
  const ticker = typeof req.query?.ticker === 'string' ? req.query.ticker.trim() : '';
  const shouldDiversify = !investor && !ticker && (source === 'all' || source === 'sec-13f');

  if (!hasSupabase()) {
    res.status(200).json({ ok: true, source: 'fallback', limit, trades: [], investors: PROMINENT_13F_INVESTORS, reason: 'Supabase env missing' });
    return;
  }

  try {
    const rows = await querySupabase({
      source: source === 'sec-13f' || source === 'sec-form4' ? source : 'all',
      limit: shouldDiversify ? DIVERSIFIED_FETCH_LIMIT : limit,
      investor,
      ticker,
    });
    const normalizedRows = rows.map(normalizeTrade);
    const trades = shouldDiversify ? diversifyTrades(normalizedRows, limit) : normalizedRows.slice(0, limit);
    res.status(200).json({
      ok: true,
      source: 'supabase',
      limit,
      diversified: shouldDiversify,
      investors: PROMINENT_13F_INVESTORS,
      trades,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error), trades: [] });
  }
}
