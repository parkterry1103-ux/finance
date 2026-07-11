/**
 * api/_lib/providers/fred.ts
 * Server-only FRED (Federal Reserve Economic Data) fetch utility.
 * Uses native fetch - no additional dependencies.
 * Never logs key values or full request URLs.
 */

import { requireFredApiKey } from '../provider-env.js';

const FRED_BASE = 'https://api.stlouisfed.org/fred';
const DEFAULT_TIMEOUT_MS = 8000;

type FetchOptions = {
  timeoutMs?: number;
};

function classifyHttpStatus(status: number): string {
  if (status === 401 || status === 403) return 'FRED_AUTH_FAILED';
  if (status === 429) return 'FRED_RATE_LIMITED';
  return 'FRED_UPSTREAM_ERROR';
}

async function fredFetch(
  path: string,
  params: Record<string, string> = {},
  opts: FetchOptions = {}
): Promise<unknown> {
  const key = requireFredApiKey();
  const url = new URL(`${FRED_BASE}${path}`);
  url.searchParams.set('api_key', key);
  url.searchParams.set('file_type', 'json');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      msg.toLowerCase().includes('abort')
        ? 'FRED_TIMEOUT'
        : 'FRED_NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error(classifyHttpStatus(res.status));

  const data: unknown = await res.json();
  return data;
}

// -------------------------------------------------------------------------
// Public helpers
// -------------------------------------------------------------------------

/**
 * Minimal connectivity check: fetch latest FEDFUNDS observation.
 * Returns true if the request succeeds, false otherwise.
 */
export async function checkFredConnection(): Promise<boolean> {
  try {
    await fredFetch('/series/observations', {
      series_id: 'FEDFUNDS',
      limit: '1',
      sort_order: 'desc',
    });
    return true;
  } catch {
    return false;
  }
}

type FredObservation = {
  date: string;
  value: string;
};

type FredObservationsResponse = {
  observations: FredObservation[];
};

/**
 * Fetch the latest N observations for a FRED series.
 * @param seriesId  e.g. 'FEDFUNDS', 'DGS10', 'UNRATE'
 * @param limit     number of most-recent observations to return (default 1)
 */
export async function fetchFredSeriesLatest(
  seriesId: string,
  limit = 1
): Promise<FredObservation[]> {
  const data = await fredFetch('/series/observations', {
    series_id: seriesId,
    limit: String(limit),
    sort_order: 'desc',
  });

  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as FredObservationsResponse).observations)
  ) {
    throw new Error('FRED_INVALID_RESPONSE');
  }

  return (data as FredObservationsResponse).observations;
}
