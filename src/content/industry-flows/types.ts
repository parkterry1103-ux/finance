export type IndustryFlowStepType =
  | 'demand'
  | 'requirements'
  | 'suppliers'
  | 'use-cases'
  | 'evidence';

export type IndustryFlowStep = {
  id: string;
  type: IndustryFlowStepType;
  title: string;
  description: string;
  companyIds?: string[];
};

export type IndustryFlowCardVariant = 'summary' | 'detail';

export type IndustryFlowStepViewModel = Omit<IndustryFlowStep, 'description'> & {
  number: string;
  typeLabel: string;
  description: string | null;
};

export type IndustryFlowViewModel = Omit<IndustryFlowEntry, 'steps'> & {
  variant: IndustryFlowCardVariant;
  steps: IndustryFlowStepViewModel[];
};

export type IndustryFlowCategory =
  | 'semiconductor-ai'
  | 'power-datacenter'
  | 'construction-infrastructure'
  | 'industrial-facilities';

export type IndustryFlowEntry = {
  id: string;
  title: string;
  summary: string;
  category: IndustryFlowCategory;
  steps: [IndustryFlowStep, IndustryFlowStep, IndustryFlowStep, IndustryFlowStep, IndustryFlowStep];
  demandSupplyIds: string[];
  bottleneckIds: string[];
  reportIds: string[];
  sourceRefs: string[];
  reviewedAt: string;
};
