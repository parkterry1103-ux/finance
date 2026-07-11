import { macroIndicatorDefinitions } from '../../src/content/macro/indicators.js';
import type {
  MacroIndicatorDefinition,
  MacroIndicatorsResponse,
  MacroSeriesChanges,
  MacroSeriesResult,
} from '../../src/content/macro/types.js';
import { getProviderEnvStatus } from './provider-env.js';
import type { FredNumericObservation } from './providers/fred.js';
import { fetchFredSeriesBatch, normalizeFredErrorCode } from './providers/fred.js';

type MacroApiResponse = {
  status: (code: number) => MacroApiResponse;
  json: (body: MacroIndicatorsResponse) => void;
  setHeader: (name: string, value: string) => void;
};

function round(value: number, digits = 6) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function percentageChange(current: number, comparison?: number) {
  if (!Number.isFinite(comparison) || comparison === 0) return undefined;
  return round(((current - comparison) / comparison) * 100);
}

function difference(current: number, comparison?: number, multiplier = 1) {
  if (!Number.isFinite(comparison)) return undefined;
  return round((current - comparison) * multiplier);
}

function atOffset(values: FredNumericObservation[], offset: number) {
  return values.at(-(offset + 1))?.value;
}

function displayValue(definition: MacroIndicatorDefinition, value: number) {
  if (definition.unitKind === 'millions-usd') return round(value / 1_000_000);
  if (definition.unitKind === 'billions-usd') return round(value / 1_000);
  return round(value);
}

export function calculateMacroChanges(
  definition: MacroIndicatorDefinition,
  history: FredNumericObservation[],
): MacroSeriesChanges {
  const current = history.at(-1)?.value;
  if (!Number.isFinite(current)) return {};

  if (definition.seriesId === 'DGS2' || definition.seriesId === 'DGS10') {
    return {
      previous: difference(current, atOffset(history, 1), 100),
      shortTerm: difference(current, atOffset(history, 20), 100),
    };
  }
  if (definition.seriesId === 'T10Y2Y') {
    return {
      currentBasisPoints: round(current * 100),
      previous: difference(current, atOffset(history, 1), 100),
      shortTerm: difference(current, atOffset(history, 20), 100),
    };
  }
  if (definition.seriesId === 'NFCI') {
    return {
      previous: difference(current, atOffset(history, 1)),
      shortTerm: difference(current, atOffset(history, 4)),
      mediumTerm: difference(current, atOffset(history, 13)),
    };
  }
  if (definition.seriesId === 'WALCL') {
    return {
      previous: difference(current, atOffset(history, 1), 1 / 1_000),
      shortTerm: difference(current, atOffset(history, 4), 1 / 1_000),
      mediumTerm: difference(current, atOffset(history, 13), 1 / 1_000),
    };
  }
  if (definition.seriesId === 'M2SL' || definition.seriesId === 'INDPRO' || definition.seriesId === 'PERMIT') {
    return {
      previous: percentageChange(current, atOffset(history, 1)),
      yearOverYear: percentageChange(current, atOffset(history, 12)),
    };
  }
  if (definition.seriesId === 'CUMFNS') {
    return {
      previous: difference(current, atOffset(history, 1)),
      yearOverYear: difference(current, atOffset(history, 12)),
    };
  }
  return {};
}

export function buildMacroSeriesResult(
  definition: MacroIndicatorDefinition,
  rawHistory: FredNumericObservation[],
): MacroSeriesResult {
  const history = rawHistory.slice(-definition.historyLimit);
  const latest = history.at(-1);
  if (!latest) throw new Error('FRED_EMPTY_SERIES');

  return {
    id: definition.id,
    seriesId: definition.seriesId,
    label: definition.label,
    domain: definition.domain,
    frequency: definition.frequency,
    unit: definition.displayUnit,
    sourceInstitution: definition.sourceInstitution,
    latest: { date: latest.date, value: displayValue(definition, latest.value) },
    changes: calculateMacroChanges(definition, history),
    history: history.map((point) => ({ date: point.date, value: displayValue(definition, point.value) })),
  };
}

export function buildMacroIndicatorsResponse(
  settled: Array<PromiseSettledResult<FredNumericObservation[]>>,
  fetchedAt = new Date().toISOString(),
): MacroIndicatorsResponse {
  const series: MacroSeriesResult[] = [];
  const errors: MacroIndicatorsResponse['errors'] = [];

  macroIndicatorDefinitions.forEach((definition, index) => {
    const result = settled[index];
    if (result?.status === 'fulfilled') {
      try {
        series.push(buildMacroSeriesResult(definition, result.value));
      } catch (error) {
        errors.push({ id: definition.id, seriesId: definition.seriesId, code: normalizeFredErrorCode(error) });
      }
      return;
    }
    errors.push({
      id: definition.id,
      seriesId: definition.seriesId,
      code: normalizeFredErrorCode(result?.status === 'rejected' ? result.reason : new Error('FRED_UPSTREAM_ERROR')),
    });
  });

  return {
    ok: series.length > 0,
    partial: series.length > 0 && errors.length > 0,
    provider: 'fred',
    fetchedAt,
    series,
    errors,
  };
}

export function topLevelFredError(errors: MacroIndicatorsResponse['errors']) {
  const codes = new Set(errors.map((entry) => entry.code));
  if (codes.size === 1 && codes.has('FRED_AUTH_FAILED')) return 'FRED_AUTH_FAILED';
  if (codes.size === 1 && codes.has('FRED_RATE_LIMITED')) return 'FRED_RATE_LIMITED';
  return 'FRED_UPSTREAM_ERROR';
}

function emptyMacroResponse(error: string): MacroIndicatorsResponse {
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

export async function handleMacroIndicators(_req: unknown, res: MacroApiResponse) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  if (!getProviderEnvStatus().fredConfigured) {
    res.status(503).json(emptyMacroResponse('FRED_NOT_CONFIGURED'));
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
