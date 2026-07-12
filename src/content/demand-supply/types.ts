import type { MacroSeriesResult } from '../macro/types.js';
import type { SupplyChainBottleneck } from '../bottlenecks/types.js';

export type DemandBackgroundState = 'improving' | 'weakening' | 'mixed' | 'limited';

export type DemandSupplyCombination =
  | 'demand-improving-supply-tight'
  | 'demand-mixed-supply-tight'
  | 'demand-weakening-supply-tight'
  | 'demand-improving-supply-watch'
  | 'demand-mixed-supply-watch'
  | 'limited';

export type DemandSupplyEntryId =
  | 'grid-equipment-demand-supply'
  | 'data-center-power-cooling-demand-supply'
  | 'copper-grid-metals-demand-supply'
  | 'semiconductor-fab-infrastructure-demand-supply';

export type DemandSupplyEntry = {
  id: DemandSupplyEntryId;
  title: string;
  shortTitle: string;
  beginnerQuestion: string;
  bottleneckId: string;
  macroIndicatorIds: Array<'us-industrial-production' | 'us-manufacturing-utilization' | 'us-building-permits'>;
  relationIds?: Array<'industrial-production-copper'>;
  reportIds: string[];
  marketMapIds: string[];
  demandContext: string;
  supplyContext: string;
  caution: string;
};

export type DemandIndicatorResult = {
  indicatorId: string;
  series?: MacroSeriesResult;
  state: DemandBackgroundState;
};

export type DemandSupplyResult = {
  entry: DemandSupplyEntry;
  bottleneck?: SupplyChainBottleneck;
  indicators: DemandIndicatorResult[];
  demandState: DemandBackgroundState;
  combination: DemandSupplyCombination;
  latestObservationDate: string | null;
  validIndicatorCount: number;
};
