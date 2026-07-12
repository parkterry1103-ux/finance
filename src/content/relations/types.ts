export type RelationId =
  | 'rates-nasdaq'
  | 'financial-conditions-sp500'
  | 'industrial-production-copper';

export type RelationWindow = '3m' | '6m' | '1y' | '2y';
export type RelationFrequency = 'daily' | 'weekly' | 'monthly';
export type RelationOrientation = 'raw' | 'inverse';
export type RelationState = 'same-direction' | 'opposite-direction' | 'weak' | 'limited';

export type RelationDefinition = {
  id: RelationId;
  title: string;
  shortTitle: string;
  beginnerQuestion: string;
  macroSeriesId: 'DGS10' | 'NFCI' | 'INDPRO';
  macroLabel: string;
  macroComparisonLabel: string;
  macroUnit: string;
  marketSymbol: '^IXIC' | '^GSPC' | 'HG=F';
  marketLabel: string;
  marketCurrency?: string;
  frequency: RelationFrequency;
  macroOrientation: RelationOrientation;
  defaultWindow: RelationWindow;
  availableWindows: RelationWindow[];
  interpretation: string;
  comparisonDescription: string;
  whyDifferent: string;
  caveats: string[];
  sourceRefs: string[];
  reportIds: string[];
  marketMapIds: string[];
  fredLimit: number;
  yahooRange: '2y' | '3y';
};

export type RelationPoint = {
  date: string;
  macroValue: number;
  marketValue: number;
  macroChange: number | null;
  marketChange: number | null;
};

export type RelationWindowResult = {
  label: string;
  relationState: RelationState;
  correlation: number | null;
  sampleSize: number;
  startDate: string | null;
  endDate: string | null;
  points: RelationPoint[];
};

export type MarketRelationResult = {
  id: RelationId;
  title: string;
  question: string;
  macro: {
    seriesId: RelationDefinition['macroSeriesId'];
    label: string;
    comparisonLabel: string;
    unit: string;
    orientation: RelationOrientation;
  };
  market: {
    symbol: RelationDefinition['marketSymbol'];
    label: string;
    currency?: string;
  };
  availableWindows: RelationWindow[];
  defaultWindow: RelationWindow;
  windows: Partial<Record<RelationWindow, RelationWindowResult>>;
  interpretation: string;
  comparisonDescription: string;
  whyDifferent: string;
  caveats: string[];
  sourceRefs: string[];
  reportIds: string[];
  marketMapIds: string[];
};

export type MarketRelationError = {
  id: RelationId;
  code: string;
};

export type MarketRelationsResponse = {
  ok: boolean;
  partial: boolean;
  fetchedAt: string;
  relations: MarketRelationResult[];
  errors: MarketRelationError[];
  methodology: {
    correlation: 'pearson';
    usesChanges: true;
    minimumSampleSize: number;
  };
  error?: string;
};
