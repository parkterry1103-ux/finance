export type BottleneckStatus = 'normal' | 'watch' | 'tight' | 'critical';
export type BottleneckTrend = 'easing' | 'stable' | 'tightening';
export type BottleneckConfidence = 'high' | 'medium' | 'low';

export type BottleneckEvidenceKind =
  | 'official-data'
  | 'company-disclosure'
  | 'industry-report'
  | 'editorial-assessment';

export type BottleneckCompanyRole =
  | 'constrained-supplier'
  | 'capacity-provider'
  | 'demand-driver'
  | 'procurement-exposure'
  | 'alternative-supplier';

export type BottleneckCategory =
  | 'power-grid'
  | 'data-centers'
  | 'generation'
  | 'semiconductors'
  | 'critical-minerals'
  | 'industrial-infrastructure';

export interface BottleneckEvidence {
  id: string;
  label: string;
  value?: string;
  unit?: string;
  context: string;
  asOf: string;
  sourceRef: string;
  kind: BottleneckEvidenceKind;
}

export interface BottleneckCompanyLink {
  companyId: string;
  role: BottleneckCompanyRole;
  reason: string;
}

export interface SupplyChainBottleneck {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: BottleneckCategory;
  status: BottleneckStatus;
  trend: BottleneckTrend;
  confidence: BottleneckConfidence;
  summary: string;
  assessment: string;
  pressureSignals: string[];
  reliefSignals: string[];
  uncertainties: string[];
  evidence: BottleneckEvidence[];
  sourceRefs: string[];
  reportIds: string[];
  marketMapIds: string[];
  companyLinks: BottleneckCompanyLink[];
  pickIds: string[];
  asOf: string;
  reviewedAt: string;
  featured?: boolean;
}
