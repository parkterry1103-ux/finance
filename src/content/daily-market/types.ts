export type DailyMarketAssetId =
  | 'kospi'
  | 'kosdaq'
  | 'sp500'
  | 'nasdaq-composite'
  | 'usd-krw'
  | 'us-10y'
  | 'gold'
  | 'copper'
  | 'wti';

export type DailyMarketAssetGroup = 'index' | 'macro';
export type DailyMarketAssetFormat = 'index' | 'fx' | 'yield' | 'commodity';
export type MarketFlowEvidenceType = 'fact' | 'relationship' | 'interpretation';

export type DailyMarketAsset = {
  id: DailyMarketAssetId;
  symbol: string;
  label: string;
  shortLabel: string;
  group: DailyMarketAssetGroup;
  format: DailyMarketAssetFormat;
  market: string;
  currency: string;
  unitLabel: string;
  valueDecimals: number;
  provider: 'Yahoo Finance chart';
  sourceRef: string;
  unitSourceRef?: string;
  relationshipNote: string;
};

export type DailyMarketBrief = {
  date: string;
  title: string;
  summary: string;
  indexAssetIds: DailyMarketAssetId[];
  macroAssetIds: DailyMarketAssetId[];
  assetNotes: Partial<Record<DailyMarketAssetId, string>>;
  marketDriverIds: string[];
  flowIds: string[];
  sourceRefs: string[];
  asOf: string;
};

export type MarketDriver = {
  id: string;
  label: string;
  confirmedFact: string;
  marketInterpretation: string;
  affectedAssets: DailyMarketAssetId[];
  sourceRefs: string[];
};

export type MarketFlowStep = {
  label: string;
  detail: string;
  type: MarketFlowEvidenceType;
  marketMapId?: string;
  companyIds?: string[];
};

export type MarketFlow = {
  id: string;
  title: string;
  steps: MarketFlowStep[];
  sourceRefs: string[];
  reportIds?: string[];
};
