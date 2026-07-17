import type {
  BusinessDriverDirection,
  EventImpactConfidence,
  EventImpactReviewStage,
  EventImpactReviewStatus,
  FinancialMetricDirection,
  ValuationAssumptionId,
} from './types.js';

export const eventImpactConfidenceLabels: Record<EventImpactConfidence, string> = {
  confirmed: '확인된 근거',
  partially_supported: '부분적으로 뒷받침',
  editorial_inference: '편집자 판단',
  unresolved: '아직 확인되지 않음',
};
export const eventImpactReviewStageLabels: Record<EventImpactReviewStage, string> = {
  monitor_only: '모니터링',
  scenario_review: '시나리오 검토',
  base_case_review: '기준 가정 검토',
  thesis_reassessment: '핵심 판단 재검토',
};

export const eventImpactReviewStatusLabels: Record<EventImpactReviewStatus, string> = {
  pending: '검토 대기',
  reviewed_no_change: '기준 가정 유지',
  scenario_updated: '시나리오 변경',
  base_case_updated: '기준 가정 변경',
  thesis_revised: '핵심 판단 변경',
  superseded: '후속 기록으로 대체',
};

export const businessDriverDirectionLabels: Record<BusinessDriverDirection, string> = {
  strengthening: '강화 방향',
  weakening: '약화 방향',
  mixed: '엇갈린 영향',
  unclear: '방향 확인 필요',
};

export const financialMetricDirectionLabels: Record<FinancialMetricDirection, string> = {
  increase: '증가 경로',
  decrease: '감소 경로',
  mixed: '엇갈린 경로',
  unclear: '방향 확인 필요',
};

export const valuationAssumptionLabels: Record<ValuationAssumptionId, string> = {
  revenue_growth: '매출 성장률',
  gross_margin: '매출총이익률',
  operating_margin: '영업이익률',
  capex_ratio: '설비투자율',
  reinvestment_rate: '재투자율',
  growth_duration: '성장 지속기간',
  wacc: 'WACC',
  terminal_growth: '영구성장률',
  terminal_roic: '장기 ROIC',
  capital_structure: '자본구조',
};
