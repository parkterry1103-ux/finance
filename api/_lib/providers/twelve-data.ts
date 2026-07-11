/**
 * api/_lib/providers/twelve-data.ts
 * Server-only Twelve Data fetch utility.
 * Uses native fetch - no additional dependencies.
 * Never logs key values or full request URLs.
 */

import { requireTwelveDataApiKey } from '../provider-env.js';

const TWELVE_DATA_BASE = 'https://api.twelvedata.com';
const DEFAULT_TIMEOUT_MS = 8000;

type FetchOptions = {
  timeoutMs?: number;
};

function classifyHttpStatus(status: number): string {
  if (status === 401 || status === 403) return 'TWELVE_DATA_AUTH_FAILED';
  if (status === 429) return 'TWELVE_DATA_RATE_LIMITED';
  return 'TWELVE_DATA_UPSTREAM_ERROR';
}

async function twelveDataFetch(
  path: string,
  params: Record<string, string> = {},
  opts: FetchOptions = {}
): Promise<unknown> {
  const key = requireTwelveDataApiKey();
  const url = new URL(`${TWELVE_DATA_BASE}${path}`);
  url.searchParams.set('apikey', key);
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
        ? 'TWELVE_DATA_TIMEOUT'
        : 'TWELVE_DATA_NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error(classifyHttpStatus(res.status));

  const data: unknown = await res.json();
  // Twelve Data returns 200 with {code, message} on auth errors
  if (
    typeof data === 'object' &&
    data !== null &&
    (data as Record<string, unknown>).code === 401
  ) {
    throw new Error('TWELVE_DATA_AUTH_FAILED');
  }
  return data;
}

// -------------------------------------------------------------------------
// Public helpers
// -------------------------------------------------------------------------

/**
 * Minimal connectivity check: fetch AAPL price.
 * Returns true if the request succeeds, false otherwise.
 */
export async function checkTwelveDataConnection(): Promise<boolean> {
  try {
    await twelveDataFetch('/price', { symbol: 'AAPL' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch latest price for a symbol.
 */
export async function fetchTwelveDataPrice(
  symbol: string
): Promise<{ price: string }> {
  const data = await twelveDataFetch('/price', { symbol });
  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as Record<string, unknown>).price !== 'string'
  ) {
    throw new Error('TWELVE_DATA_INVALID_RESPONSE');
  }
  return { price: (data as Record<string, unknown>).price as string };
}
