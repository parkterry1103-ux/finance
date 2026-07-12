import { relationDefinitions } from '../../src/content/relations/entries.js';
import { relationWindowLabels } from '../../src/content/relations/selectors.js';
import type {
  MarketRelationResult,
  MarketRelationsResponse,
  RelationDefinition,
  RelationPoint,
  RelationState,
  RelationWindow,
  RelationWindowResult,
} from '../../src/content/relations/types.js';
import { getProviderEnvStatus } from './provider-env.js';
import type { FredNumericObservation } from './providers/fred.js';
import { fetchFredSeriesBatch, normalizeFredErrorCode } from './providers/fred.js';
import type { YahooHistoryPoint } from './providers/yahoo-history.js';
import { fetchYahooHistory, normalizeYahooHistoryError } from './providers/yahoo-history.js';

export const MINIMUM_RELATION_SAMPLE_SIZE = 8;

type MarketRelationsApiResponse = {
  status: (code: number) => MarketRelationsApiResponse;
  json: (body: MarketRelationsResponse) => void;
  setHeader: (name: string, value: string) => void;
};

function round(value: number, digits = 6) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function percentageChange(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return round(((current - previous) / previous) * 100);
}

function difference(current: number, previous: number, orientation: RelationDefinition['macroOrientation']) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  return round((current - previous) * (orientation === 'inverse' ? -1 : 1));
}

function dateDaysBefore(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

export function alignDailySeries(
  macro: FredNumericObservation[],
  market: YahooHistoryPoint[],
  orientation: RelationDefinition['macroOrientation'] = 'inverse',
): RelationPoint[] {
  const macroChanges = new Map<string, number | null>();
  macro.forEach((point, index) => macroChanges.set(point.date, index ? difference(point.value, macro[index - 1].value, orientation) : null));
  const marketChanges = new Map<string, number | null>();
  market.forEach((point, index) => marketChanges.set(point.date, index ? percentageChange(point.value, market[index - 1].value) : null));
  const marketByDate = new Map(market.map((point) => [point.date, point]));
  return macro.flatMap((macroPoint) => {
    const marketPoint = marketByDate.get(macroPoint.date);
    return marketPoint ? [{
      date: macroPoint.date,
      macroValue: macroPoint.value,
      marketValue: marketPoint.value,
      macroChange: macroChanges.get(macroPoint.date) ?? null,
      marketChange: marketChanges.get(macroPoint.date) ?? null,
    }] : [];
  });
}

export function alignWeeklySeries(
  macro: FredNumericObservation[],
  market: YahooHistoryPoint[],
  orientation: RelationDefinition['macroOrientation'] = 'inverse',
): RelationPoint[] {
  const marketByDate = new Map(market.map((point) => [point.date, point]));
  const aligned = macro.flatMap((macroPoint) => {
    let marketPoint: YahooHistoryPoint | undefined;
    for (let lag = 0; lag <= 4 && !marketPoint; lag += 1) marketPoint = marketByDate.get(dateDaysBefore(macroPoint.date, lag));
    return marketPoint ? [{ date: macroPoint.date, macroValue: macroPoint.value, marketValue: marketPoint.value }] : [];
  });
  return aligned.map((point, index) => ({
    ...point,
    macroChange: index ? difference(point.macroValue, aligned[index - 1].macroValue, orientation) : null,
    marketChange: index ? percentageChange(point.marketValue, aligned[index - 1].marketValue) : null,
  }));
}

export function alignMonthlySeries(
  macro: FredNumericObservation[],
  market: YahooHistoryPoint[],
): RelationPoint[] {
  const macroByMonth = new Map<string, FredNumericObservation>();
  macro.forEach((point) => macroByMonth.set(point.date.slice(0, 7), point));
  const marketByMonth = new Map<string, YahooHistoryPoint>();
  market.forEach((point) => marketByMonth.set(point.date.slice(0, 7), point));
  const aligned = Array.from(macroByMonth.entries()).flatMap(([month, macroPoint]) => {
    const marketPoint = marketByMonth.get(month);
    return marketPoint ? [{ date: macroPoint.date, macroValue: macroPoint.value, marketValue: marketPoint.value }] : [];
  }).sort((left, right) => left.date.localeCompare(right.date));
  return aligned.map((point, index) => ({
    ...point,
    macroChange: index ? percentageChange(point.macroValue, aligned[index - 1].macroValue) : null,
    marketChange: index ? percentageChange(point.marketValue, aligned[index - 1].marketValue) : null,
  }));
}

export function pearsonCorrelation(points: RelationPoint[]) {
  const pairs = points.flatMap((point) => Number.isFinite(point.macroChange) && Number.isFinite(point.marketChange)
    ? [[point.macroChange as number, point.marketChange as number] as const]
    : []);
  if (pairs.length < MINIMUM_RELATION_SAMPLE_SIZE) return null;
  const macroMean = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length;
  const marketMean = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length;
  let numerator = 0;
  let macroVariance = 0;
  let marketVariance = 0;
  pairs.forEach(([macro, market]) => {
    const macroDelta = macro - macroMean;
    const marketDelta = market - marketMean;
    numerator += macroDelta * marketDelta;
    macroVariance += macroDelta ** 2;
    marketVariance += marketDelta ** 2;
  });
  if (macroVariance === 0 || marketVariance === 0) return null;
  return round(numerator / Math.sqrt(macroVariance * marketVariance), 4);
}

export function relationState(correlation: number | null, sampleSize: number): RelationState {
  if (sampleSize < MINIMUM_RELATION_SAMPLE_SIZE || correlation === null) return 'limited';
  if (correlation >= 0.35) return 'same-direction';
  if (correlation <= -0.35) return 'opposite-direction';
  return 'weak';
}

function windowStart(endDate: string, window: RelationWindow) {
  const date = new Date(`${endDate}T00:00:00Z`);
  if (window === '3m') date.setUTCMonth(date.getUTCMonth() - 3);
  if (window === '6m') date.setUTCMonth(date.getUTCMonth() - 6);
  if (window === '1y') date.setUTCFullYear(date.getUTCFullYear() - 1);
  if (window === '2y') date.setUTCFullYear(date.getUTCFullYear() - 2);
  return date.toISOString().slice(0, 10);
}

export function buildWindowResult(points: RelationPoint[], window: RelationWindow): RelationWindowResult {
  const endDate = points.at(-1)?.date ?? null;
  const selected = endDate ? points.filter((point) => point.date >= windowStart(endDate, window)) : [];
  const sampleSize = selected.filter((point) => Number.isFinite(point.macroChange) && Number.isFinite(point.marketChange)).length;
  const correlation = pearsonCorrelation(selected);
  return {
    label: `최근 ${relationWindowLabels[window]}`,
    relationState: relationState(correlation, sampleSize),
    correlation,
    sampleSize,
    startDate: selected[0]?.date ?? null,
    endDate: selected.at(-1)?.date ?? null,
    points: selected,
  };
}

export function buildRelationResult(
  definition: RelationDefinition,
  macro: FredNumericObservation[],
  market: YahooHistoryPoint[],
): MarketRelationResult {
  const points = definition.frequency === 'daily'
    ? alignDailySeries(macro, market, definition.macroOrientation)
    : definition.frequency === 'weekly'
      ? alignWeeklySeries(macro, market, definition.macroOrientation)
      : alignMonthlySeries(macro, market);
  if (!points.length) throw new Error('ALIGNMENT_EMPTY');
  const windows = Object.fromEntries(definition.availableWindows.map((window) => [window, buildWindowResult(points, window)]));
  return {
    id: definition.id,
    title: definition.title,
    question: definition.beginnerQuestion,
    macro: {
      seriesId: definition.macroSeriesId,
      label: definition.macroLabel,
      comparisonLabel: definition.macroComparisonLabel,
      unit: definition.macroUnit,
      orientation: definition.macroOrientation,
    },
    market: {
      symbol: definition.marketSymbol,
      label: definition.marketLabel,
      currency: definition.marketCurrency,
    },
    availableWindows: definition.availableWindows,
    defaultWindow: definition.defaultWindow,
    windows,
    interpretation: definition.interpretation,
    comparisonDescription: definition.comparisonDescription,
    whyDifferent: definition.whyDifferent,
    caveats: definition.caveats,
    sourceRefs: definition.sourceRefs,
    reportIds: definition.reportIds,
    marketMapIds: definition.marketMapIds,
  };
}

function baseResponse(): Pick<MarketRelationsResponse, 'fetchedAt' | 'methodology'> {
  return {
    fetchedAt: new Date().toISOString(),
    methodology: { correlation: 'pearson', usesChanges: true, minimumSampleSize: MINIMUM_RELATION_SAMPLE_SIZE },
  };
}

export async function buildMarketRelationsResponse(): Promise<MarketRelationsResponse> {
  const fred = await fetchFredSeriesBatch(relationDefinitions.map((definition) => ({
    seriesId: definition.macroSeriesId,
    limit: definition.fredLimit,
  })), 3);
  const yahoo = await Promise.allSettled(relationDefinitions.map((definition) => fetchYahooHistory(definition.marketSymbol, definition.yahooRange)));
  return buildMarketRelationsFromSettled(fred, yahoo);
}

export function buildMarketRelationsFromSettled(
  fred: Array<PromiseSettledResult<FredNumericObservation[]>>,
  yahoo: Array<PromiseSettledResult<YahooHistoryPoint[]>>,
): MarketRelationsResponse {
  const relations: MarketRelationResult[] = [];
  const errors: MarketRelationsResponse['errors'] = [];
  relationDefinitions.forEach((definition, index) => {
    const macroResult = fred[index];
    const marketResult = yahoo[index];
    if (macroResult?.status !== 'fulfilled') {
      errors.push({ id: definition.id, code: normalizeFredErrorCode(macroResult?.status === 'rejected' ? macroResult.reason : undefined) });
      return;
    }
    if (marketResult?.status !== 'fulfilled') {
      errors.push({ id: definition.id, code: normalizeYahooHistoryError(marketResult?.status === 'rejected' ? marketResult.reason : undefined) });
      return;
    }
    try {
      relations.push(buildRelationResult(definition, macroResult.value, marketResult.value));
    } catch (error) {
      const code = error instanceof Error && ['ALIGNMENT_EMPTY', 'CALCULATION_UNAVAILABLE', 'INSUFFICIENT_HISTORY'].includes(error.message)
        ? error.message
        : 'CALCULATION_UNAVAILABLE';
      errors.push({ id: definition.id, code });
    }
  });
  return {
    ...baseResponse(),
    ok: relations.length > 0,
    partial: relations.length > 0 && errors.length > 0,
    relations,
    errors,
    ...(relations.length ? {} : { error: 'MARKET_RELATIONS_UNAVAILABLE' }),
  };
}

export async function handleMarketRelations(_req: unknown, res: MarketRelationsApiResponse) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  if (!getProviderEnvStatus().fredConfigured) {
    res.status(503).json({
      ...baseResponse(), ok: false, partial: false, relations: [],
      errors: relationDefinitions.map((definition) => ({ id: definition.id, code: 'FRED_NOT_CONFIGURED' })),
      error: 'MARKET_RELATIONS_UNAVAILABLE',
    });
    return;
  }
  const response = await buildMarketRelationsResponse();
  res.status(response.ok ? 200 : 502).json(response);
}
