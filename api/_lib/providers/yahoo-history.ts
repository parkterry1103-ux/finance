const YAHOO_HOSTS = ['query1.finance.yahoo.com'];

export type YahooHistoryPoint = {
  date: string;
  value: number;
};

type YahooChartPayload = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        adjclose?: Array<{ adjclose?: Array<number | null> }>;
        quote?: Array<{ close?: Array<number | null> }>;
      };
    }>;
    error?: unknown;
  };
};

export function parseYahooHistory(payload: YahooChartPayload): YahooHistoryPoint[] {
  const result = payload?.chart?.result?.[0];
  if (!result || payload?.chart?.error) throw new Error('YAHOO_INVALID_RESPONSE');
  const timestamps = result.timestamp ?? [];
  const adjusted = result.indicators?.adjclose?.[0]?.adjclose ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const byDate = new Map<string, number>();
  timestamps.forEach((timestamp, index) => {
    const value = Number(adjusted[index] ?? closes[index]);
    if (!Number.isFinite(timestamp) || !Number.isFinite(value) || value <= 0) return;
    byDate.set(new Date(timestamp * 1000).toISOString().slice(0, 10), value);
  });
  const history = Array.from(byDate, ([date, value]) => ({ date, value }))
    .sort((left, right) => left.date.localeCompare(right.date));
  if (!history.length) throw new Error('YAHOO_EMPTY_SERIES');
  return history;
}

export async function fetchYahooHistory(
  symbol: string,
  range: '2y' | '3y',
): Promise<YahooHistoryPoint[]> {
  let lastStatus = 0;
  for (const host of YAHOO_HOSTS) {
    const url = new URL(`https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}`);
    url.searchParams.set('range', range);
    url.searchParams.set('interval', '1d');
    url.searchParams.set('events', 'history');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 finance-market-relations contact@example.com',
        },
      });
      lastStatus = response.status;
      if (response.ok) return parseYahooHistory(await response.json() as YahooChartPayload);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw new Error('YAHOO_UPSTREAM_ERROR');
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(lastStatus === 429 ? 'YAHOO_RATE_LIMITED' : 'YAHOO_UPSTREAM_ERROR');
}

export function normalizeYahooHistoryError(_error: unknown) {
  return 'YAHOO_UPSTREAM_ERROR';
}
