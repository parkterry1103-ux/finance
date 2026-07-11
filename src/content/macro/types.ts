export type MacroDomain =
  | 'rates'
  | 'financial-conditions'
  | 'liquidity'
  | 'industry-infrastructure';

export type MacroFrequency = 'daily' | 'weekly' | 'monthly';

export type MacroUnitKind =
  | 'percent'
  | 'index'
  | 'millions-usd'
  | 'billions-usd'
  | 'thousands-saar';

export type MacroChangeMode =
  | 'basis-points'
  | 'absolute'
  | 'percentage'
  | 'percentage-points';

export interface MacroIndicatorDefinition {
  id: string;
  seriesId: string;
  label: string;
  shortLabel: string;
  officialTitle: string;
  domain: MacroDomain;
  frequency: MacroFrequency;
  unitKind: MacroUnitKind;
  displayUnit: string;
  changeMode: MacroChangeMode;
  historyLimit: number;
  sourceInstitution: string;
  sourceRef: string;
  interpretation: string;
  higherMeaning: string;
  lowerMeaning: string;
  caution: string;
}

export type MacroBriefTrend = 'improving' | 'stable' | 'worsening';

export interface MacroDomainBrief {
  id: string;
  domain: MacroDomain;
  state: string;
  trend: MacroBriefTrend;
  summary: string;
  evidenceIndicatorIds: string[];
  sourceRefs: string[];
  reportIds: string[];
  bottleneckIds: string[];
  asOf: string;
  reviewedAt: string;
}

export interface MacroHistoryPoint {
  date: string;
  value: number;
}

export interface MacroSeriesChanges {
  previous?: number;
  shortTerm?: number;
  mediumTerm?: number;
  yearOverYear?: number;
  currentBasisPoints?: number;
}

export interface MacroSeriesResult {
  id: string;
  seriesId: string;
  label: string;
  domain: MacroDomain;
  frequency: MacroFrequency;
  unit: string;
  sourceInstitution: string;
  latest: MacroHistoryPoint;
  changes: MacroSeriesChanges;
  history: MacroHistoryPoint[];
}

export interface MacroSeriesError {
  id: string;
  seriesId: string;
  code: string;
}

export interface MacroIndicatorsResponse {
  ok: boolean;
  partial: boolean;
  provider: 'fred';
  fetchedAt: string;
  series: MacroSeriesResult[];
  errors: MacroSeriesError[];
  error?: string;
}
