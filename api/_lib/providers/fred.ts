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
  // FRED reports malformed or invalid api_key values as HTTP 400 as well as
  // conventional 401/403 statuses. Series IDs are fixed to a validated list.
  if (status === 400 || status === 401 || status === 403) return 'FRED_AUTH_FAILED';
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

export type FredObservation = {
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

export type FredNumericObservation = {
  date: string;
  value: number;
};

const SAFE_FRED_ERROR_CODES = new Set([
  'FRED_NOT_CONFIGURED',
  'FRED_AUTH_FAILED',
  'FRED_RATE_LIMITED',
  'FRED_TIMEOUT',
  'FRED_NETWORK_ERROR',
  'FRED_INVALID_RESPONSE',
  'FRED_EMPTY_SERIES',
  'FRED_UPSTREAM_ERROR',
]);

export function normalizeFredErrorCode(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return SAFE_FRED_ERROR_CODES.has(message) ? message : 'FRED_UPSTREAM_ERROR';
}

export function parseFredObservations(
  observations: FredObservation[],
  limit: number,
): FredNumericObservation[] {
  return observations
    .filter((observation) => /^\d{4}-\d{2}-\d{2}$/.test(observation.date))
    .map((observation) => ({
      date: observation.date,
      value: observation.value === '.' ? Number.NaN : Number(observation.value),
    }))
    .filter((observation) => Number.isFinite(observation.value))
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-Math.max(1, limit));
}

/**
 * Fetches a compact recent history and removes FRED's "." missing values.
 * A buffer is requested so holidays or revised missing observations do not
 * reduce the valid history length returned to the caller.
 */
export async function fetchFredSeriesHistory(
  seriesId: string,
  limit: number,
): Promise<FredNumericObservation[]> {
  const requestLimit = Math.min(Math.max(limit * 2, limit + 12), 240);
  const observations = await fetchFredSeriesLatest(seriesId, requestLimit);
  const history = parseFredObservations(observations, limit);
  if (!history.length) throw new Error('FRED_EMPTY_SERIES');
  return history;
}

export async function fetchFredSeriesBatch(
  requests: Array<{ seriesId: string; limit: number }>,
  concurrency = 3,
): Promise<Array<PromiseSettledResult<FredNumericObservation[]>>> {
  const results: Array<PromiseSettledResult<FredNumericObservation[]>> = new Array(requests.length);
  let cursor = 0;

  async function worker() {
    while (cursor < requests.length) {
      const index = cursor;
      cursor += 1;
      const request = requests[index];
      try {
        const value = await fetchFredSeriesHistory(request.seriesId, request.limit);
        results[index] = { status: 'fulfilled', value };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(Math.max(concurrency, 1), requests.length) }, worker));
  return results;
}
