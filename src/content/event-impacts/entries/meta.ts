import type { EventImpactRecord } from '../types.js';

const metaEventImpacts: EventImpactRecord[] = [
  {
    id: 'meta-q1-2026-assumption-review',
    companySlug: 'meta',
    event: {
      title: '2026년 1분기 광고 성장과 설비투자 전망 상향',
      eventAsOf: '2026-04-29',
      publishedAt: '2026-04-29',
      sourceIds: ['meta-q1-2026-results'],
    },
    summary: '광고 노출·가격 성장과 대규모 AI 설비투자 전망이 함께 확인돼 매출 성장, 재투자율과 현금흐름 가정을 기준 시나리오 수준에서 점검했습니다.',
    materiality: 'high',
    reviewOrigin: 'manual_research_review',
    confirmedFacts: [
      {
        id: 'meta-q1-ad-growth-fact',
        statement: '2026년 1분기 광고 노출은 19%, 광고당 평균 가격은 12% 증가했습니다.',
        confidence: 'confirmed',
        sourceIds: ['meta-q1-2026-results'],
      },
      {
        id: 'meta-q1-capex-guidance-fact',
        statement: '회사는 2026년 설비투자 전망을 1,250억~1,450억 달러로 제시했습니다.',
        confidence: 'confirmed',
        sourceIds: ['meta-q1-2026-results'],
      },
    ],
    unresolvedItems: [
      {
        id: 'meta-ad-growth-duration-unresolved',
        statement: '광고 노출과 가격의 동시 증가가 장기 성장률로 얼마나 이어질지는 아직 확인되지 않았습니다.',
        confidence: 'unresolved',
        sourceIds: ['meta-q1-2026-results'],
      },
      {
        id: 'meta-capex-payback-unresolved',
        statement: 'AI 인프라 투자의 회수 속도와 증분 현금흐름은 향후 공시에서 더 확인해야 합니다.',
        confidence: 'unresolved',
        sourceIds: ['meta-q1-2026-results'],
      },
    ],
    businessDriverImpacts: [
      {
        driverId: 'meta-advertising-demand',
        direction: 'strengthening',
        strength: 'high',
        confidence: 'confirmed',
        explanation: '광고 노출과 광고당 가격이 함께 증가해 광고 매출의 두 핵심 동인이 동시에 강화됐습니다.',
      },
      {
        driverId: 'meta-ai-infrastructure-investment',
        direction: 'mixed',
        strength: 'high',
        confidence: 'confirmed',
        explanation: '투자 규모는 확인됐지만 비용 증가와 장기 효율 개선의 순효과는 아직 나눠 봐야 합니다.',
      },
    ],
    financialMetricLinks: [
      { metricId: 'revenue', direction: 'increase', confidence: 'confirmed', explanation: '광고 노출과 가격 증가는 광고 매출 성장에 직접 연결됩니다.' },
      { metricId: 'capitalExpenditure', direction: 'increase', confidence: 'confirmed', explanation: '상향된 연간 가이던스는 향후 설비투자 집행을 확인할 기준입니다.' },
      { metricId: 'operatingMargin', direction: 'mixed', confidence: 'partially_supported', explanation: '광고 성장과 인프라 비용·감가상각 증가가 함께 마진에 전달됩니다.' },
      { metricId: 'freeCashFlow', direction: 'mixed', confidence: 'partially_supported', explanation: '광고 현금창출과 설비투자 증가의 차이가 잉여현금흐름을 결정합니다.' },
    ],
    valuationAssumptionLinks: [
      { assumptionId: 'revenue_growth', action: 'review_base_case', confidence: 'confirmed', explanation: '광고 노출·가격 성장과 기존 기준 성장 경로를 대조했습니다.' },
      { assumptionId: 'operating_margin', action: 'review_base_case', confidence: 'partially_supported', explanation: '인프라 비용의 마진 전달 속도가 확정되지 않아 기준 가정 범위를 점검했습니다.' },
      { assumptionId: 'capex_ratio', action: 'review_base_case', confidence: 'confirmed', explanation: '공식 Capex 가이던스를 기준 모형의 재투자 경로와 대조했습니다.' },
      { assumptionId: 'reinvestment_rate', action: 'review_base_case', confidence: 'unresolved', explanation: '투자 규모는 확인됐지만 장기 회수율은 다음 공시를 기다립니다.' },
    ],
    reviewStage: 'base_case_review',
    reviewStatus: 'reviewed_no_change',
    decision: {
      reviewedAt: '2026-07-15',
      reviewedBy: 'owner',
      summary: 'Phase 5D 기준 모형은 이 공식 가이던스 이후 작성돼 광고 성장과 AI 재투자 경로를 이미 반영합니다. 추가 자동 조정 없이 기준 가정을 유지합니다.',
      beforeModelVersion: 'meta-phase-5d-2026.07.17-final',
      afterModelVersion: 'meta-phase-5d-2026.07.17-final',
    },
    watchItems: ['광고 노출과 광고당 가격', '분기별 Capex 집행', '영업현금흐름과 감가상각'],
  },
];

export default metaEventImpacts;
