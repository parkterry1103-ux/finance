/**
 * api/_lib/providers/finnhub.ts
 * Server-only Finnhub fetch utility.
 * Uses native fetch - no additional dependencies.
 * Never logs key values or full request URLs.
 */

import { requireFinnhubApiKey } from '../provider-env.js';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const DEFAULT_TIMEOUT_MS = 8000;

type FetchOptions = {
  timeoutMs?: number;
};

function classifyHttpStatus(status: number): string {
  if (status === 401 || status === 403) return 'FINNHUB_AUTH_FAILED';
  if (status === 429) return 'FINNHUB_RATE_LIMITED';
  return 'FINNHUB_UPSTREAM_ERROR';
}

async function finnhubFetch(
  path: string,
  params: Record<string, string> = {},
  opts: FetchOptions = {}
): Promise<unknown> {
  const key = requireFinnhubApiKey();
  const url = new URL(`${FINNHUB_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { 'X-Finnhub-Token': key },
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      msg.toLowerCase().includes('abort')
        ? 'FINNHUB_TIMEOUT'
        : 'FINNHUB_NETWORK_ERROR'
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
 * Minimal connectivity check: fetch AAPL quote.
 * Returns true if the request succeeds, false otherwise.
 * Never exposes key or response body to caller.
 */
export async function checkFinnhubConnection(): Promise<boolean> {
  try {
    await finnhubFetch('/quote', { symbol: 'AAPL' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch latest quote for a given symbol.
 */
export async function fetchFinnhubQuote(
  symbol: string
): Promise<{ c: number; pc: number; t: number }> {
  const data = await finnhubFetch('/quote', { symbol });
  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as Record<string, unknown>).c !== 'number'
  ) {
    throw new Error('FINNHUB_INVALID_RESPONSE');
  }
  const d = data as Record<string, unknown>;
  return {
    c: d.c as number,
    pc: d.pc as number,
    t: d.t as number,
  };
}
