export type MarketMapRelationType =
  | 'direct-contract'
  | 'official-supply'
  | 'demand-link'
  | 'production-link'
  | 'infrastructure-link'
  | 'market-context';

export type MarketMapEvidenceLevel = 'confirmed' | 'contextual' | 'review-needed';

export type MarketMapRelationDirection = 'directed' | 'contextual';

export type MarketMapRelationDensity = 'core' | 'all';

export type MarketMapRelationTypeFilter = 'all' | MarketMapRelationType;

export type MarketMapCompanyRelation = {
  id: string;
  mapId: string;
  fromCompanyId: string;
  toCompanyId: string;
  direction: MarketMapRelationDirection;
  relationType: MarketMapRelationType;
  evidenceLevel: MarketMapEvidenceLevel;
  shortLabel: string;
  explanation: string;
  caution: string;
  sourceRefs: string[];
  reviewedAt: string;
  relatedReportIds?: string[];
  relatedCompanyEventIds?: string[];
};

export type MarketMapRelationFilterInput = {
  selectedCompanyId: string;
  density: MarketMapRelationDensity;
  relationType: MarketMapRelationTypeFilter;
};

export type MarketMapRelationGraphSelection = {
  relations: MarketMapCompanyRelation[];
  companyIds: string[];
  dimmedCompanyIds: string[];
};
