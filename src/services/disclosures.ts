import {
  enabledDartTrackedCompanies,
  enabledSecTrackedCompanies,
  type DisclosureCategory,
  type MarketDisclosureApiResponse,
  type MarketSecFilingsApiResponse,
  type SecFilingCategory,
} from '../content/disclosures/index.js';

const emptyDisclosureMeta = {
  count: 0,
  lastSyncedAt: null,
  source: 'opendart' as const,
  stale: true,
  trackedCompanyCount: enabledDartTrackedCompanies.length,
};

const emptySecFilingsMeta = {
  count: 0,
  lastSyncedAt: null,
  source: 'sec-edgar' as const,
  stale: true,
  trackedCompanyCount: enabledSecTrackedCompanies.length,
};

export type FetchMarketDisclosuresOptions = {
  limit?: number;
  ticker?: string;
  category?: DisclosureCategory | 'all';
  hours?: number;
  days?: number;
};

export type FetchMarketSecFilingsOptions = {
  limit?: number;
  ticker?: string;
  form?: string | 'all';
  category?: SecFilingCategory | 'all';
  hours?: number;
  days?: number;
};

export async function fetchMarketDisclosures(options: FetchMarketDisclosuresOptions = {}): Promise<MarketDisclosureApiResponse> {
  const params = new URLSearchParams();
  params.set('limit', String(Math.min(Math.max(options.limit ?? 100, 1), 100)));
  params.set('days', String(Math.min(Math.max(options.days ?? 7, 1), 30)));
  if (options.hours) params.set('hours', String(Math.min(Math.max(options.hours, 1), 24 * 30)));
  if (options.ticker) params.set('ticker', options.ticker);
  if (options.category && options.category !== 'all') params.set('category', options.category);

  try {
    const response = await fetch(`/api/market-disclosures?${params.toString()}`);
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || typeof payload !== 'object') {
      throw new Error(`market disclosures ${response.status}`);
    }
    return {
      ok: Boolean(payload.ok),
      code: typeof payload.code === 'string' ? payload.code : undefined,
      message: typeof payload.message === 'string' ? payload.message : undefined,
      items: Array.isArray(payload.items) ? payload.items : [],
      meta: {
        ...emptyDisclosureMeta,
        ...(payload.meta && typeof payload.meta === 'object' ? payload.meta : {}),
        source: 'opendart',
        trackedCompanyCount: enabledDartTrackedCompanies.length,
      },
    };
  } catch {
    return {
      ok: false,
      code: 'DISCLOSURES_FETCH_FAILED',
      message: '공시 정보를 일시적으로 불러오지 못했습니다.',
      items: [],
      meta: emptyDisclosureMeta,
    };
  }
}

export async function fetchMarketSecFilings(options: FetchMarketSecFilingsOptions = {}): Promise<MarketSecFilingsApiResponse> {
  const params = new URLSearchParams();
  params.set('limit', String(Math.min(Math.max(options.limit ?? 100, 1), 100)));
  params.set('days', String(Math.min(Math.max(options.days ?? 30, 1), 90)));
  if (options.hours) params.set('hours', String(Math.min(Math.max(options.hours, 1), 24 * 90)));
  if (options.ticker) params.set('ticker', options.ticker);
  if (options.form && options.form !== 'all') params.set('form', options.form);
  if (options.category && options.category !== 'all') params.set('category', options.category);

  try {
    const response = await fetch(`/api/market-sec-filings?${params.toString()}`);
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || typeof payload !== 'object') {
      throw new Error(`market sec filings ${response.status}`);
    }
    return {
      ok: Boolean(payload.ok),
      code: typeof payload.code === 'string' ? payload.code : undefined,
      message: typeof payload.message === 'string' ? payload.message : undefined,
      items: Array.isArray(payload.items) ? payload.items : [],
      meta: {
        ...emptySecFilingsMeta,
        ...(payload.meta && typeof payload.meta === 'object' ? payload.meta : {}),
        source: 'sec-edgar',
        trackedCompanyCount: enabledSecTrackedCompanies.length,
      },
    };
  } catch {
    return {
      ok: false,
      code: 'SEC_FILINGS_FETCH_FAILED',
      message: '미국 공시 정보를 일시적으로 불러오지 못했습니다.',
      items: [],
      meta: emptySecFilingsMeta,
    };
  }
}

export function isDisclosureSyncedAtStale(value?: string | null, staleHours = 2) {
  if (!value) return true;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return true;
  return Date.now() - timestamp > staleHours * 60 * 60 * 1000;
}
