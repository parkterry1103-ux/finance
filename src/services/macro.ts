import type { MacroIndicatorsResponse } from '../content/macro/types.js';

let macroIndicatorsRequest: Promise<MacroIndicatorsResponse> | null = null;

function unavailableResponse(error = 'FRED_UPSTREAM_ERROR'): MacroIndicatorsResponse {
  return {
    ok: false,
    partial: false,
    provider: 'fred',
    fetchedAt: new Date().toISOString(),
    series: [],
    errors: [],
    error,
  };
}

export function fetchMacroIndicators(): Promise<MacroIndicatorsResponse> {
  if (macroIndicatorsRequest) return macroIndicatorsRequest;

  macroIndicatorsRequest = fetch('/api/macro-indicators')
    .then(async (response) => {
      const payload = await response.json().catch(() => null);
      if (!payload || typeof payload !== 'object' || payload.provider !== 'fred') {
        return unavailableResponse();
      }
      return {
        ok: Boolean(payload.ok),
        partial: Boolean(payload.partial),
        provider: 'fred' as const,
        fetchedAt: typeof payload.fetchedAt === 'string' ? payload.fetchedAt : new Date().toISOString(),
        series: Array.isArray(payload.series) ? payload.series : [],
        errors: Array.isArray(payload.errors) ? payload.errors : [],
        error: typeof payload.error === 'string' ? payload.error : undefined,
      };
    })
    .catch(() => unavailableResponse());

  return macroIndicatorsRequest;
}
