import {
  disclosureCategoryOrder,
  enabledDartTrackedCompanies,
  type DisclosureCategory,
  type MarketDisclosure,
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

type DisclosureRow = {
  receipt_number: string;
  corp_code: string;
  company_name: string;
  ticker?: string | null;
  report_name: string;
  filer_name?: string | null;
  disclosure_category: DisclosureCategory;
  received_at: string;
  source_url: string;
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
  const hours = query.hours ? clampNumber(query.hours, 0, 1, 24 * 30) : 0;
  const days = clampNumber(query.days, 7, 1, 30);
  const durationMs = (hours || days * 24) * 60 * 60 * 1000;
  return new Date(Date.now() - durationMs).toISOString();
}

function isStale(value?: string | null) {
  if (!value) return true;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return true;
  return Date.now() - timestamp > 2 * 60 * 60 * 1000;
}

function normalizeDisclosure(row: DisclosureRow): MarketDisclosure {
  return {
    receiptNumber: row.receipt_number,
    corpCode: row.corp_code,
    companyName: row.company_name,
    ticker: row.ticker ?? null,
    reportName: row.report_name,
    filerName: row.filer_name ?? null,
    category: row.disclosure_category,
    receivedAt: row.received_at,
    source: 'opendart',
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
      source: 'opendart',
      stale: true,
      trackedCompanyCount: enabledDartTrackedCompanies.length,
    },
  };
}

async function latestDisclosureSync() {
  const url = new URL('/rest/v1/sync_runs', env('SUPABASE_URL'));
  url.searchParams.set('select', 'ended_at,started_at,status');
  url.searchParams.set('source', 'eq.opendart-disclosures');
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
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');

  if (!hasSupabase()) {
    res.status(200).json(emptyResponse('DISCLOSURES_NOT_CONFIGURED', '공시 데이터가 아직 연결되지 않았습니다.'));
    return;
  }

  const limit = clampNumber(req.query?.limit, 20, 1, MAX_LIMIT);
  const ticker = typeof req.query?.ticker === 'string' ? req.query.ticker.trim().toUpperCase() : '';
  const category = typeof req.query?.category === 'string' ? req.query.category.trim() as DisclosureCategory : '';
  const validCategory = disclosureCategoryOrder.includes(category as DisclosureCategory) ? category : '';

  try {
    const url = new URL('/rest/v1/market_disclosures', env('SUPABASE_URL'));
    url.searchParams.set(
      'select',
      'receipt_number,corp_code,company_name,ticker,report_name,filer_name,disclosure_category,received_at,source_url,source,synced_at',
    );
    url.searchParams.set('received_at', `gte.${sinceIso(req.query ?? {})}`);
    url.searchParams.set('order', 'received_at.desc,synced_at.desc');
    url.searchParams.set('limit', String(limit));
    if (ticker) url.searchParams.set('ticker', `eq.${ticker}`);
    if (validCategory) url.searchParams.set('disclosure_category', `eq.${validCategory}`);

    const response = await fetch(url, {
      headers: {
        apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error(`market_disclosures ${response.status}`);

    const rows = await response.json();
    const items = Array.isArray(rows) ? rows.map(normalizeDisclosure) : [];
    const rowSyncedAt = Array.isArray(rows)
      ? rows
          .map((row) => row.synced_at)
          .filter(Boolean)
          .sort()
          .at(-1)
      : null;
    const lastSyncedAt = rowSyncedAt ?? (await latestDisclosureSync());

    res.status(200).json({
      ok: true,
      items,
      meta: {
        count: items.length,
        lastSyncedAt,
        source: 'opendart',
        stale: isStale(lastSyncedAt),
        trackedCompanyCount: enabledDartTrackedCompanies.length,
      },
    });
  } catch {
    res.status(200).json(emptyResponse('DISCLOSURES_UNAVAILABLE', '공시 정보를 일시적으로 불러오지 못했습니다.'));
  }
}
