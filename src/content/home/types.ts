export type HomeFeatureId =
  | 'macro'
  | 'bottlenecks'
  | 'reports'
  | 'disclosures'
  | 'demand-supply'
  | 'picks';

export type HomeFeatureLabel = {
  id: HomeFeatureId;
  easyName: string;
  professionalName: string;
  description: string;
  href: string;
};

export type HomeNavigationItem = {
  id: string;
  label: string;
  href: string;
  activeKey: 'today' | 'macro' | 'relations' | 'demand-supply' | 'bottlenecks' | 'companies' | 'picks' | 'analysis' | 'company-events' | 'disclosures' | 'reports';
};

export type HomeNavigationGroup = {
  id: 'today' | 'industry' | 'company' | 'resources';
  label: string;
  items: HomeNavigationItem[];
};

export type HomeInsightReference = {
  id: string;
  kind: 'market-driver' | 'macro-brief' | 'bottleneck';
  referenceId: string;
  eyebrow: string;
  title: string;
  whyItMatters: string;
  href: string;
};

export type HomeMacroReference = {
  id: string;
  briefId: string;
  indicatorId: string;
  easyLabel: string;
};

export type HomeReportReference = {
  reportId: string;
  metricLabel: string;
};

export type DisclosureEventType =
  | 'earnings'
  | 'investment'
  | 'contract'
  | 'financing'
  | 'insider'
  | 'merger'
  | 'other';

export type DisclosureEventDefinition = {
  id: DisclosureEventType;
  label: string;
  description: string;
};

export type BeginnerTermId =
  | 'yield-spread'
  | 'financial-conditions'
  | 'liquidity'
  | 'industrial-production'
  | 'capacity-utilization'
  | 'supply-chain-bottleneck'
  | 'disclosure'
  | 'order-backlog'
  | 'lead-time';

export type BeginnerTermDefinition = {
  id: BeginnerTermId;
  term: string;
  shortDefinition: string;
  whyItMatters: string;
};
