import {
  enabledSecTrackedCompanies,
  normalizeSecFormType,
  secFilingCategoryOrder,
  type MarketSecFiling,
  type SecFilingCategory,
} from '../src/content/disclosures/index.js';

declare const process: {
  env: Record<string, string | undefined>;
};

type QueryValue = string | string[] | undefined;

type ApiRequest = {
  query?: Record<string, QueryValue>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

type SecFilingRow = {
  accession_number: string;
  cik: string;
  company_name: string;
  ticker: string;
  form_type: string;
  filing_category: SecFilingCategory;
  filed_at: string;
  report_date?: string | null;
  primary_document?: string | null;
  source_url: string;
  source?: 'sec-edgar';
  synced_at?: string | null;
};

const MAX_LIMIT = 100;

function env(key: string) {
  return process.env[key] || '';
}

function hasSupabase() {
  return Boolean(env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY'));
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function sinceIso(query: Record<string, unknown>) {
  const hours = query.hours ? clampNumber(query.hours, 0, 1, 24 * 90) : 0;
  const days = clampNumber(query.days, 30, 1, 90);
  const durationMs = (hours || days * 24) * 60 * 60 * 1000;
  return new Date(Date.now() - durationMs).toISOString();
}

function isStale(value?: string | null) {
  if (!value) return true;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return true;
  return Date.now() - timestamp > 36 * 60 * 60 * 1000;
}

function normalizeSecFiling(row: SecFilingRow): MarketSecFiling {
  return {
    accessionNumber: row.accession_number,
    cik: row.cik,
    companyName: row.company_name,
    ticker: row.ticker,
    formType: row.form_type,
    category: row.filing_category,
    filedAt: row.filed_at,
    reportDate: row.report_date ?? null,
    primaryDocument: row.primary_document ?? null,
    source: 'sec-edgar',
    sourceUrl: row.source_url,
  };
}

function emptyResponse(code: string, message: string) {
  return {
    ok: false,
    code,
    message,
    items: [],
    meta: {
      count: 0,
      lastSyncedAt: null,
      source: 'sec-edgar',
      stale: true,
      trackedCompanyCount: enabledSecTrackedCompanies.length,
    },
  };
}

async function latestSecFilingSync() {
  const url = new URL('/rest/v1/sync_runs', env('SUPABASE_URL'));
  url.searchParams.set('select', 'ended_at,started_at,status');
  url.searchParams.set('source', 'eq.sec-edgar-filings');
  url.searchParams.set('order', 'started_at.desc');
  url.searchParams.set('limit', '1');

  const response = await fetch(url, {
    headers: {
      apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
      Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) return null;
  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  return row?.ended_at ?? row?.started_at ?? null;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=900');

  if (!hasSupabase()) {
    res.status(200).json(emptyResponse('SEC_FILINGS_NOT_CONFIGURED', '미국 공시 데이터가 아직 연결되지 않았습니다.'));
    return;
  }

  const limit = clampNumber(req.query?.limit, 30, 1, MAX_LIMIT);
  const ticker = typeof req.query?.ticker === 'string' ? req.query.ticker.trim().toUpperCase() : '';
  const form = typeof req.query?.form === 'string' ? normalizeSecFormType(req.query.form) : '';
  const category = typeof req.query?.category === 'string' ? req.query.category.trim() as SecFilingCategory : '';
  const validCategory = secFilingCategoryOrder.includes(category as SecFilingCategory) ? category : '';

  try {
    const url = new URL('/rest/v1/market_sec_filings', env('SUPABASE_URL'));
    url.searchParams.set(
      'select',
      'accession_number,cik,company_name,ticker,form_type,filing_category,filed_at,report_date,primary_document,source_url,source,synced_at',
    );
    url.searchParams.set('filed_at', `gte.${sinceIso(req.query ?? {})}`);
    url.searchParams.set('order', 'filed_at.desc,synced_at.desc');
    url.searchParams.set('limit', String(limit));
    if (ticker) url.searchParams.set('ticker', `eq.${ticker}`);
    if (form) url.searchParams.set('form_type', form === '424B' ? 'like.424B*' : `eq.${form}`);
    if (validCategory) url.searchParams.set('filing_category', `eq.${validCategory}`);

    const response = await fetch(url, {
      headers: {
        apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error(`market_sec_filings ${response.status}`);

    const rows = await response.json();
    const items = Array.isArray(rows) ? rows.map(normalizeSecFiling) : [];
    const rowSyncedAt = Array.isArray(rows)
      ? rows
          .map((row) => row.synced_at)
          .filter(Boolean)
          .sort()
          .at(-1)
      : null;
    const lastSyncedAt = rowSyncedAt ?? (await latestSecFilingSync());

    res.status(200).json({
      ok: true,
      items,
      meta: {
        count: items.length,
        lastSyncedAt,
        source: 'sec-edgar',
        stale: isStale(lastSyncedAt),
        trackedCompanyCount: enabledSecTrackedCompanies.length,
      },
    });
  } catch {
    res.status(200).json(emptyResponse('SEC_FILINGS_UNAVAILABLE', '미국 공시 정보를 일시적으로 불러오지 못했습니다.'));
  }
}
