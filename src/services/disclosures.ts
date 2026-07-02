import {
  enabledDartTrackedCompanies,
  type DisclosureCategory,
  type MarketDisclosureApiResponse,
} from '../content/disclosures/index.js';

const emptyMeta = {
  count: 0,
  lastSyncedAt: null,
  source: 'opendart' as const,
  stale: true,
  trackedCompanyCount: enabledDartTrackedCompanies.length,
};

export type FetchMarketDisclosuresOptions = {
  limit?: number;
  ticker?: string;
  category?: DisclosureCategory | 'all';
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
        ...emptyMeta,
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
      meta: emptyMeta,
    };
  }
}

export function isDisclosureSyncedAtStale(value?: string | null, staleHours = 2) {
  if (!value) return true;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return true;
  return Date.now() - timestamp > staleHours * 60 * 60 * 1000;
}
