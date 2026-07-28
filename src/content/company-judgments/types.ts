export type CompanyDirectionState = 'opportunity' | 'balanced' | 'burden';
export type CompanyJudgmentCardState = 'good' | 'caution' | 'bad';
export type CompanyJudgmentTrend = 'improving' | 'steady' | 'worsening';
export type CompanyJudgmentCardKey = 'businessGrowth' | 'earningsQuality' | 'cashQuality' | 'investmentBurden';
export type CompanyJudgmentScope = 'consolidated' | 'separate' | 'segment';
export type CompanyJudgmentSourceType =
  | 'official-filing'
  | 'company-ir'
  | 'exchange-public-data'
  | 'industry-data'
  | 'external-analysis';

export type CompanyJudgmentEvidenceSource = {
  sourceId: string;
  sourceType: CompanyJudgmentSourceType;
  sourceTitle: string;
  sourceUrl: string;
  publishedAt: string;
  asOf: string;
  period: string;
  scope: CompanyJudgmentScope;
  metricDefinition: string;
  limitation?: string;
};

export type CompanyJudgmentFreshness = {
  asOf: string;
  reviewedAt: string;
  analysisVersion: string;
};

export type CompanyDirectionJudgment = CompanyJudgmentFreshness & {
  state: CompanyDirectionState;
  horizon: '향후 6~12개월' | '다음 1~2개 분기';
  reason: string;
  sourceIds: string[];
};

export type CompanyJudgmentMetric = {
  label: string;
  value: string;
  comparison: string;
  period: string;
  metricDefinition: string;
};

export type CompanyJudgmentCard = CompanyJudgmentFreshness & {
  key: CompanyJudgmentCardKey;
  state: CompanyJudgmentCardState;
  reason: string;
  trend: CompanyJudgmentTrend;
  causeFlow: [string, string, string];
  metrics: [CompanyJudgmentMetric, CompanyJudgmentMetric] | [CompanyJudgmentMetric, CompanyJudgmentMetric, CompanyJudgmentMetric];
  reversalCondition: string;
  sourceIds: string[];
};

export type CompanyJudgmentLatestOfficialUpdate = {
  latestQuarterlyResultsAt: string;
  latestMaterialEventAt: string;
};

export type CompanyJudgmentConfig = {
  companySlug: string;
  latestOfficialUpdate: CompanyJudgmentLatestOfficialUpdate;
  companyDirection: CompanyDirectionJudgment;
  marketExpectation: CompanyDirectionJudgment;
  cards: CompanyJudgmentCard[];
  sources: CompanyJudgmentEvidenceSource[];
  anomalyReview: {
    reviewedAt: string;
    findings: string[];
    operatorDecision: string;
  };
};

export type CompanyJudgmentModel = Omit<CompanyJudgmentConfig, 'cards'> & {
  cards: CompanyJudgmentCard[];
};
