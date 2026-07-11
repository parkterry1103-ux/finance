import {
  buildMacroIndicatorsResponse,
  buildMacroSeriesResult,
  calculateMacroChanges,
  topLevelFredError,
} from '../api/_lib/macro-indicators.js';
import { requireFredApiKey } from '../api/_lib/provider-env.js';
import { normalizeFredErrorCode, parseFredObservations, type FredNumericObservation } from '../api/_lib/providers/fred.js';
import { macroIndicatorDefinitions } from '../src/content/macro/indicators.js';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`macro indicator unit check failed: ${message}`);
}

function observations(length: number, start: number, step = 1): FredNumericObservation[] {
  return Array.from({ length }, (_, index) => ({
    date: new Date(Date.UTC(2024, 0, index + 1)).toISOString().slice(0, 10),
    value: start + index * step,
  }));
}

export function runMacroIndicatorUnitChecks() {
  const parsed = parseFredObservations([
    { date: '2026-07-01', value: '4.10' },
    { date: '2026-07-02', value: '.' },
    { date: '2026-07-03', value: '4.20' },
  ], 60);
  assert(parsed.length === 2, '"." observations must be excluded');
  assert(parsed.at(-1)?.value === 4.2, 'latest non-missing observation must be selected');

  const dgs2 = macroIndicatorDefinitions.find((entry) => entry.seriesId === 'DGS2')!;
  const dgsHistory = observations(61, 3);
  const dgsResult = buildMacroSeriesResult(dgs2, dgsHistory);
  assert(dgsResult.history.length === 60, 'daily history must be limited to 60');
  const dgsChanges = calculateMacroChanges(dgs2, dgsHistory);
  assert(dgsChanges.previous === 100, 'rate previous change must convert percentage points to bp');
  assert(dgsChanges.shortTerm === 2000, '20-observation rate change must convert to bp');

  const nfci = macroIndicatorDefinitions.find((entry) => entry.seriesId === 'NFCI')!;
  const nfciResult = buildMacroSeriesResult(nfci, observations(60, -1, 0.01));
  assert(nfciResult.history.length === 52, 'weekly history must be limited to 52');
  assert(/타이트/.test(nfci.higherMeaning) && /느슨/.test(nfci.lowerMeaning), 'NFCI inverse meaning must be explicit');

  const walcl = macroIndicatorDefinitions.find((entry) => entry.seriesId === 'WALCL')!;
  const walclHistory = observations(52, 6_000_000, 1_000);
  const walclResult = buildMacroSeriesResult(walcl, walclHistory);
  assert(walclResult.latest.value === 6.051, 'WALCL millions must convert to trillions');
  assert(walclResult.changes.previous === 1, 'WALCL changes must convert to billions');

  const m2 = macroIndicatorDefinitions.find((entry) => entry.seriesId === 'M2SL')!;
  const m2Result = buildMacroSeriesResult(m2, observations(30, 20_000, 100));
  assert(m2Result.history.length === 24, 'monthly history must be limited to 24');
  assert(m2Result.latest.value === 22.9, 'M2 billions must convert to trillions');

  const utilization = macroIndicatorDefinitions.find((entry) => entry.seriesId === 'CUMFNS')!;
  const utilizationChanges = calculateMacroChanges(utilization, observations(24, 70, 0.25));
  assert(utilizationChanges.previous === 0.25, 'capacity utilization change must remain percentage points');

  const fulfilled = observations(60, 1, 0.01);
  const partial = buildMacroIndicatorsResponse([
    { status: 'fulfilled', value: fulfilled },
    ...macroIndicatorDefinitions.slice(1).map(() => ({ status: 'rejected', reason: new Error('FRED_TIMEOUT') } as PromiseRejectedResult)),
  ]);
  assert(partial.ok && partial.partial && partial.series.length === 1 && partial.errors.length === 8, 'partial success must preserve successful series');

  const allFailed = buildMacroIndicatorsResponse(
    macroIndicatorDefinitions.map(() => ({ status: 'rejected', reason: new Error('FRED_NETWORK_ERROR') } as PromiseRejectedResult)),
  );
  assert(!allFailed.ok && !allFailed.partial && allFailed.series.length === 0, 'total failure must be reported safely');
  assert(topLevelFredError(allFailed.errors) === 'FRED_UPSTREAM_ERROR', 'total upstream failure must use safe top-level code');

  const originalKey = process.env.FRED_API_KEY;
  delete process.env.FRED_API_KEY;
  try {
    let missingCode = '';
    try {
      requireFredApiKey();
    } catch (error) {
      missingCode = normalizeFredErrorCode(error);
    }
    assert(missingCode === 'FRED_NOT_CONFIGURED', 'missing key must return FRED_NOT_CONFIGURED');
  } finally {
    if (originalKey === undefined) delete process.env.FRED_API_KEY;
    else process.env.FRED_API_KEY = originalKey;
  }

  const fakeKey = 'unit-test-secret-key';
  const safeCode = normalizeFredErrorCode(new Error(`provider failed with ${fakeKey}`));
  assert(safeCode === 'FRED_UPSTREAM_ERROR' && !safeCode.includes(fakeKey), 'raw key or error must not be exposed');
}
