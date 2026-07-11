import { getProviderEnvStatus } from './_lib/provider-env.js';
import { buildMacroIndicatorsResponse, topLevelFredError } from './_lib/macro-indicators.js';
import { fetchFredSeriesBatch } from './_lib/providers/fred.js';
import { macroIndicatorDefinitions } from '../src/content/macro/indicators.js';
import type { MacroIndicatorsResponse } from '../src/content/macro/types.js';

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: MacroIndicatorsResponse) => void;
  setHeader: (name: string, value: string) => void;
};

function emptyResponse(error: string): MacroIndicatorsResponse {
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

export default async function handler(_req: unknown, res: ApiResponse) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  if (!getProviderEnvStatus().fredConfigured) {
    res.status(503).json(emptyResponse('FRED_NOT_CONFIGURED'));
    return;
  }

  const settled = await fetchFredSeriesBatch(
    macroIndicatorDefinitions.map((definition) => ({
      seriesId: definition.seriesId,
      limit: definition.historyLimit,
    })),
    3,
  );
  const response = buildMacroIndicatorsResponse(settled);

  if (!response.ok) {
    res.status(502).json({ ...response, error: topLevelFredError(response.errors) });
    return;
  }

  res.status(200).json(response);
}
