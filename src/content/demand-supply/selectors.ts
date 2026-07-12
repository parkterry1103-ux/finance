import { bottleneckById } from '../bottlenecks/index.js';
import type { BottleneckStatus } from '../bottlenecks/types.js';
import type { MacroSeriesChanges, MacroSeriesResult } from '../macro/types.js';
import { demandSupplyEntries } from './entries.js';
import type {
  DemandBackgroundState,
  DemandSupplyCombination,
  DemandSupplyEntry,
  DemandSupplyEntryId,
  DemandSupplyResult,
} from './types.js';

export const demandStateLabels: Record<DemandBackgroundState, string> = {
  improving: '개선',
  weakening: '약화',
  mixed: '혼조',
  limited: '판단 제한',
};

export const combinationLabels: Record<DemandSupplyCombination, string> = {
  'demand-improving-supply-tight': '수요 배경은 개선되는 가운데 공급 제약이 이어지고 있습니다.',
  'demand-mixed-supply-tight': '수요 신호는 엇갈리지만 공급 제약은 여전히 남아 있습니다.',
  'demand-weakening-supply-tight': '수요 배경은 약해지는 방향이지만 기존 공급 제약은 아직 남아 있습니다.',
  'demand-improving-supply-watch': '수요 배경은 개선되는 가운데 공급 상태는 관찰 단계입니다.',
  'demand-mixed-supply-watch': '수요와 공급의 방향을 조금 더 확인할 필요가 있습니다.',
  limited: '비교 가능한 거시 관측값이 충분하지 않습니다.',
};

export function demandSupplyEntryById(id?: string | null) {
  return demandSupplyEntries.find((entry) => entry.id === id);
}

export function safeDemandSupplyEntryId(id?: string | null): DemandSupplyEntryId {
  return demandSupplyEntryById(id)?.id ?? demandSupplyEntries[0].id;
}

export function classifyDemandIndicator(changes?: MacroSeriesChanges): DemandBackgroundState {
  const shortTerm = changes?.previous;
  const mediumTerm = changes?.yearOverYear;
  if (!Number.isFinite(shortTerm) || !Number.isFinite(mediumTerm)) return 'limited';
  if (shortTerm! > 0 && mediumTerm! > 0) return 'improving';
  if (shortTerm! < 0 && mediumTerm! < 0) return 'weakening';
  return 'mixed';
}

export function combineDemandIndicators(states: DemandBackgroundState[]): DemandBackgroundState {
  const valid = states.filter((state) => state !== 'limited');
  if (valid.length < 2) return 'limited';
  const improving = valid.filter((state) => state === 'improving').length;
  const weakening = valid.filter((state) => state === 'weakening').length;
  if (improving > weakening && weakening === 0) return 'improving';
  if (weakening > improving && improving === 0) return 'weakening';
  return 'mixed';
}

export function classifyDemandSupplyCombination(
  demand: DemandBackgroundState,
  supply?: BottleneckStatus,
): DemandSupplyCombination {
  if (demand === 'limited' || !supply) return 'limited';
  const tight = supply === 'tight' || supply === 'critical';
  if (tight && demand === 'improving') return 'demand-improving-supply-tight';
  if (tight && demand === 'weakening') return 'demand-weakening-supply-tight';
  if (tight) return 'demand-mixed-supply-tight';
  if (demand === 'improving') return 'demand-improving-supply-watch';
  return 'demand-mixed-supply-watch';
}

export function buildDemandSupplyResult(
  entry: DemandSupplyEntry,
  macroSeries: MacroSeriesResult[],
): DemandSupplyResult {
  const byId = new Map(macroSeries.map((series) => [series.id, series]));
  const indicators = entry.macroIndicatorIds.map((indicatorId) => {
    const series = byId.get(indicatorId);
    return { indicatorId, series, state: classifyDemandIndicator(series?.changes) };
  });
  const demandState = combineDemandIndicators(indicators.map((indicator) => indicator.state));
  const bottleneck = bottleneckById(entry.bottleneckId);
  const latestObservationDate = indicators.flatMap((indicator) => indicator.series?.latest.date ? [indicator.series.latest.date] : [])
    .sort((left, right) => right.localeCompare(left))[0] ?? null;
  return {
    entry,
    bottleneck,
    indicators,
    demandState,
    combination: classifyDemandSupplyCombination(demandState, bottleneck?.status),
    latestObservationDate,
    validIndicatorCount: indicators.filter((indicator) => indicator.state !== 'limited').length,
  };
}

export function buildDemandSupplyResults(macroSeries: MacroSeriesResult[]) {
  return demandSupplyEntries.map((entry) => buildDemandSupplyResult(entry, macroSeries));
}
