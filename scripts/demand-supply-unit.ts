import {
  buildDemandSupplyResult,
  classifyDemandIndicator,
  classifyDemandSupplyCombination,
  combineDemandIndicators,
  demandSupplyEntries,
  safeDemandSupplyEntryId,
  type DemandSupplyEntry,
} from '../src/content/demand-supply/index.js';
import type { MacroSeriesResult } from '../src/content/macro/types.js';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`demand supply unit: ${message}`);
}

function macroSeries(id: string, previous?: number, yearOverYear?: number): MacroSeriesResult {
  return {
    id,
    seriesId: id === 'us-industrial-production' ? 'INDPRO' : id === 'us-manufacturing-utilization' ? 'CUMFNS' : 'PERMIT',
    label: id,
    domain: 'industry-infrastructure',
    frequency: 'monthly',
    unit: id === 'us-manufacturing-utilization' ? '%' : 'index',
    sourceInstitution: 'fixture',
    latest: { date: '2026-06-01', value: 100 },
    changes: { previous, yearOverYear },
    history: [],
  } as MacroSeriesResult;
}

export function runDemandSupplyUnitChecks() {
  assert(classifyDemandIndicator({ previous: 0.2, yearOverYear: 1.7 }) === 'improving', 'INDPRO improving');
  assert(classifyDemandIndicator({ previous: -0.2, yearOverYear: -1.7 }) === 'weakening', 'INDPRO weakening');
  assert(classifyDemandIndicator({ previous: 0.2, yearOverYear: -1.7 }) === 'mixed', 'INDPRO mixed');
  assert(classifyDemandIndicator({ previous: -0.02, yearOverYear: 0.23 }) === 'mixed', 'CUMFNS percentage point direction');
  assert(classifyDemandIndicator({ previous: 0, yearOverYear: -0.4 }) === 'mixed', 'PERMIT zero and negative is mixed');
  assert(classifyDemandIndicator({ previous: 0.1 }) === 'limited', 'missing value is limited');
  assert(combineDemandIndicators(['improving', 'limited']) === 'limited', 'one valid indicator limits sector');
  assert(combineDemandIndicators(['improving', 'improving', 'mixed']) === 'improving', 'all non-weakening indicators improve');
  assert(combineDemandIndicators(['weakening', 'weakening', 'mixed']) === 'weakening', 'all non-improving indicators weaken');
  assert(combineDemandIndicators(['improving', 'weakening', 'mixed']) === 'mixed', 'simultaneous improving and weakening is mixed');
  assert(classifyDemandSupplyCombination('improving', 'tight') === 'demand-improving-supply-tight', 'improving plus tight');
  assert(classifyDemandSupplyCombination('mixed', 'tight') === 'demand-mixed-supply-tight', 'mixed plus tight');
  assert(classifyDemandSupplyCombination('weakening', 'tight') === 'demand-weakening-supply-tight', 'weakening plus tight');
  assert(classifyDemandSupplyCombination('improving', 'watch') === 'demand-improving-supply-watch', 'improving plus watch');
  assert(classifyDemandSupplyCombination('limited', 'tight') === 'limited', 'limited combination');

  const entry = demandSupplyEntries[0];
  const partial = buildDemandSupplyResult(entry, [
    macroSeries('us-industrial-production', 0.2, 1.2),
    macroSeries('us-manufacturing-utilization', -0.1, 0.3),
  ]);
  assert(partial.validIndicatorCount === 2 && partial.demandState === 'improving', 'macro partial failure preserves two valid indicators');
  const failed = buildDemandSupplyResult(entry, []);
  assert(failed.demandState === 'limited' && Boolean(failed.bottleneck), 'macro full failure preserves bottleneck');
  assert(safeDemandSupplyEntryId('invalid') === demandSupplyEntries[0].id, 'invalid industry fallback');
  const missingBottleneck = buildDemandSupplyResult({ ...entry, bottleneckId: 'missing-bottleneck' } as DemandSupplyEntry, [
    macroSeries('us-industrial-production', 0.2, 1.2),
    macroSeries('us-manufacturing-utilization', 0.1, 0.3),
  ]);
  assert(!missingBottleneck.bottleneck && missingBottleneck.combination === 'limited', 'missing bottleneck ref is handled');
  return 19;
}

const checks = runDemandSupplyUnitChecks();
console.log(`✓ 거시 수요 배경 × 공급망 병목 단위 검증 (${checks}개)`);
