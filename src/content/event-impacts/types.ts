import type { FinancialPivotMetricId } from '../financial-pivots/types.js';

export type EventImpactCompanySlug = 'nvidia' | 'meta' | 'netflix' | 'supermicro';

export type EventImpactConfidence =
  | 'confirmed'
  | 'partially_supported'
  | 'editorial_inference'
  | 'unresolved';

export type EventImpactReviewStage =
  | 'monitor_only'
  | 'scenario_review'
  | 'base_case_review'
  | 'thesis_reassessment';

export type EventImpactReviewStatus =
  | 'pending'
  | 'reviewed_no_change'
  | 'scenario_updated'
  | 'base_case_updated'
  | 'thesis_revised'
  | 'superseded';

export type BusinessDriverDirection = 'strengthening' | 'weakening' | 'mixed' | 'unclear';
export type FinancialMetricDirection = 'increase' | 'decrease' | 'mixed' | 'unclear';
export type EventImpactMateriality = 'medium' | 'high';
export type EventImpactStrength = 'low' | 'medium' | 'high';

export type ValuationAssumptionId =
  | 'revenue_growth'
  | 'gross_margin'
  | 'operating_margin'
  | 'capex_ratio'
  | 'reinvestment_rate'
  | 'growth_duration'
  | 'wacc'
  | 'terminal_growth'
  | 'terminal_roic'
  | 'capital_structure';

export type ValuationReviewAction =
  | 'monitor'
  | 'review_scenario'
  | 'review_base_case'
  | 'reassess_thesis';

export type BusinessDriverId =
  | 'nvidia-ai-accelerator-demand'
  | 'nvidia-product-geographic-mix'
  | 'nvidia-platform-competition'
  | 'meta-advertising-demand'
  | 'meta-ai-infrastructure-investment'
  | 'meta-platform-engagement'
  | 'netflix-member-price-ad-demand'
  | 'netflix-content-engagement'
  | 'netflix-disclosure-visibility'
  | 'supermicro-ai-server-demand'
  | 'supermicro-backlog-conversion'
  | 'supermicro-product-customer-mix'
  | 'supermicro-working-capital-delivery';

export type EventImpactEvidenceItem = {
  id: string;
  statement: string;
  confidence: EventImpactConfidence;
  sourceIds: string[];
};
export type BusinessDriverDefinition = {
  id: BusinessDriverId;
  companySlug: EventImpactCompanySlug;
  label: string;
  description: string;
  financialMetricIds: FinancialPivotMetricId[];
  valuationAssumptionIds: ValuationAssumptionId[];
};

export type BusinessDriverImpact = {
  driverId: BusinessDriverId;
  direction: BusinessDriverDirection;
  strength: EventImpactStrength;
  confidence: EventImpactConfidence;
  explanation: string;
};

export type FinancialMetricImpactLink = {
  metricId: FinancialPivotMetricId;
  direction: FinancialMetricDirection;
  confidence: EventImpactConfidence;
  explanation: string;
};

export type ValuationAssumptionImpactLink = {
  assumptionId: ValuationAssumptionId;
  action: ValuationReviewAction;
  confidence: EventImpactConfidence;
  explanation: string;
};

export type EventImpactDecision = {
  reviewedAt: string;
  reviewedBy: 'owner';
  summary: string;
  beforeModelVersion?: string;
  afterModelVersion?: string;
};

export type EventImpactRecord = {
  id: string;
  companySlug: EventImpactCompanySlug;
  event: {
    title: string;
    eventAsOf: string;
    publishedAt: string;
    sourceIds: string[];
    editorialId?: string;
  };
  summary: string;
  materiality: EventImpactMateriality;
  reviewOrigin: 'manual_research_review';
  confirmedFacts: EventImpactEvidenceItem[];
  unresolvedItems: EventImpactEvidenceItem[];
  businessDriverImpacts: BusinessDriverImpact[];
  financialMetricLinks: FinancialMetricImpactLink[];
  valuationAssumptionLinks: ValuationAssumptionImpactLink[];
  reviewStage: EventImpactReviewStage;
  reviewStatus: EventImpactReviewStatus;
  decision?: EventImpactDecision;
  watchItems: string[];
  supersededById?: string;
};

export type ValuationAssumptionChange = {
  id: string;
  impactId: string;
  companySlug: EventImpactCompanySlug;
  assumptionId: ValuationAssumptionId;
  changedAt: string;
  changedBy: 'owner';
  beforeValue: number;
  afterValue: number;
  unit: 'percent' | 'percentagePoint' | 'absolute' | 'multiple';
  beforeModelVersion: string;
  afterModelVersion: string;
  rationale: string;
  sourceIds: string[];
};
