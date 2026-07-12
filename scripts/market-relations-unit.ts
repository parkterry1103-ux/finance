import {
  alignDailySeries,
  alignMonthlySeries,
  alignWeeklySeries,
  buildMarketRelationsFromSettled,
  buildRelationResult,
  pearsonCorrelation,
  relationState,
} from '../api/_lib/market-relations.js';
import { parseFredObservations } from '../api/_lib/providers/fred.js';
import { parseYahooHistory } from '../api/_lib/providers/yahoo-history.js';
import { relationDefinitions, safeRelationId, safeRelationWindow } from '../src/content/relations/index.js';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`market relations unit: ${message}`);
}

function date(value: string) {
  return Math.floor(new Date(`${value}T00:00:00Z`).getTime() / 1000);
}

function dailyFixtures() {
  const macro = [
    { date: '2026-01-02', value: 4.5 },
    { date: '2026-01-05', value: 4.4 },
    { date: '2026-01-06', value: 4.3 },
  ];
  const market = [
    { date: '2026-01-02', value: 100 },
    { date: '2026-01-03', value: 101 },
    { date: '2026-01-05', value: 102 },
    { date: '2026-01-06', value: 103 },
  ];
  return { macro, market };
}

export function runMarketRelationsUnitChecks() {
  const parsedFred = parseFredObservations([
    { date: '2026-01-01', value: '.' },
    { date: '2026-01-02', value: '4.5' },
  ], 10);
  assert(parsedFred.length === 1 && parsedFred[0].value === 4.5, 'FRED missing values are excluded');

  const parsedYahoo = parseYahooHistory({ chart: { result: [{
    timestamp: [date('2026-01-02'), date('2026-01-03')],
    indicators: { adjclose: [{ adjclose: [100, null] }], quote: [{ close: [99, null] }] },
  }] } });
  assert(parsedYahoo.length === 1 && parsedYahoo[0].value === 100, 'Yahoo null values are excluded and adjclose is preferred');

  const { macro, market } = dailyFixtures();
  const daily = alignDailySeries(macro, market, 'inverse');
  assert(daily.length === 3 && daily.every((point) => point.date !== '2026-01-03'), 'daily alignment uses identical dates and excludes holidays');
  assert(daily[1].macroChange === 0.1, 'DGS10 inverse change is positive when rates fall');
  assert(Number.isFinite(daily[1].marketChange), 'daily market return is calculated');

  const weekly = alignWeeklySeries([
    { date: '2026-01-05', value: 0.1 },
    { date: '2026-01-12', value: 0.0 },
  ], [
    { date: '2026-01-02', value: 100 },
    { date: '2026-01-09', value: 102 },
    { date: '2026-01-13', value: 999 },
  ], 'inverse');
  assert(weekly.length === 2 && weekly[0].marketValue === 100 && weekly[1].marketValue === 102, 'weekly uses up to four prior days and never a future day');
  assert(weekly[1].macroChange === 0.1, 'NFCI inverse change is positive when NFCI falls');

  const monthly = alignMonthlySeries([
    { date: '2026-01-01', value: 100 },
    { date: '2026-02-01', value: 101 },
  ], [
    { date: '2026-01-29', value: 9 },
    { date: '2026-01-30', value: 10 },
    { date: '2026-02-27', value: 11 },
  ]);
  assert(monthly.length === 2 && monthly[0].marketValue === 10, 'monthly uses the last valid close');
  assert(monthly[1].macroChange === 1 && monthly[1].marketChange === 10, 'INDPRO MoM and market monthly return are calculated');

  const correlated = Array.from({ length: 8 }, (_, index) => ({
    date: `2026-01-${String(index + 1).padStart(2, '0')}`,
    macroValue: index,
    marketValue: index,
    macroChange: index + 1,
    marketChange: index + 1,
  }));
  assert(pearsonCorrelation(correlated) === 1, 'Pearson correlation is calculated');
  assert(pearsonCorrelation(correlated.slice(0, 7)) === null, 'minimum sample size is eight');
  assert(pearsonCorrelation(correlated.map((point) => ({ ...point, macroChange: 1 }))) === null, 'constant variance is limited');
  assert(relationState(0.35, 8) === 'same-direction', 'same-direction threshold');
  assert(relationState(-0.35, 8) === 'opposite-direction', 'opposite-direction threshold');
  assert(relationState(0.349, 8) === 'weak', 'weak threshold');
  assert(relationState(null, 8) === 'limited', 'unavailable correlation is limited');

  assert(safeRelationId('invalid') === 'rates-nasdaq', 'invalid relation falls back');
  assert(safeRelationWindow('rates-nasdaq', '2y') === '3m', 'invalid period falls back');

  const fulfilledFred = relationDefinitions.map(() => ({ status: 'fulfilled', value: macro } as const));
  const fulfilledYahoo = relationDefinitions.map(() => ({ status: 'fulfilled', value: market } as const));
  const partial = buildMarketRelationsFromSettled(
    fulfilledFred,
    fulfilledYahoo.map((result, index) => index === 1 ? ({ status: 'rejected', reason: new Error('provider raw secret') } as const) : result),
  );
  assert(partial.ok && partial.partial && partial.relations.length === 2 && partial.errors.length === 1, 'partial success preserves available relations');
  assert(!JSON.stringify(partial).includes('provider raw secret'), 'raw provider error is not exposed');

  const result = buildRelationResult(relationDefinitions[0], macro, market);
  assert(result.id === 'rates-nasdaq' && result.availableWindows.length === 3, 'relation result keeps approved windows');
  return 17;
}

const checks = runMarketRelationsUnitChecks();
console.log(`✓ 거시·시장 교차 관계 단위 검증 (${checks}개)`);
