import type { EventImpactRecord } from '../types.js';

const nvidiaEventImpacts: EventImpactRecord[] = [
  {
    id: 'nvidia-fy2027-q1-assumption-review',
    companySlug: 'nvidia',
    event: {
      title: 'FY2027 1분기 데이터센터 성장과 중국 제외 가이던스',
      eventAsOf: '2026-05-20',
      publishedAt: '2026-05-20',
      sourceIds: ['nvidia-fy2027-q1-results'],
    },
    summary: '공식 실적에서 강한 데이터센터 수요와 지역별 판매 제약이 함께 확인돼 성장 지속성과 제품·지역 구성 가정을 시나리오 수준에서 점검했습니다.',
    materiality: 'high',
    reviewOrigin: 'manual_research_review',
    confirmedFacts: [
      {
        id: 'nvidia-q1-revenue-fact',
        statement: 'FY2027 1분기 매출은 816억 달러, 데이터센터 매출은 752억 달러였습니다.',
        confidence: 'confirmed',
        sourceIds: ['nvidia-fy2027-q1-results'],
      },
      {
        id: 'nvidia-q2-china-guidance-fact',
        statement: '회사는 다음 분기 전망에 중국 데이터센터 컴퓨팅 매출을 포함하지 않았습니다.',
        confidence: 'confirmed',
        sourceIds: ['nvidia-fy2027-q1-results'],
      },
    ],
    unresolvedItems: [
      {
        id: 'nvidia-growth-duration-unresolved',
        statement: '현재 데이터센터 성장 속도가 장기 전망기간 동안 얼마나 지속될지는 아직 확인되지 않았습니다.',
        confidence: 'unresolved',
        sourceIds: ['nvidia-fy2027-q1-results'],
      },
      {
        id: 'nvidia-mix-margin-unresolved',
        statement: '지역 제한과 신제품 전환이 장기 제품 구성과 마진에 미칠 순효과는 다음 실적에서 더 확인해야 합니다.',
        confidence: 'unresolved',
        sourceIds: ['nvidia-fy2027-q1-results'],
      },
    ],
    businessDriverImpacts: [
      {
        driverId: 'nvidia-ai-accelerator-demand',
        direction: 'strengthening',
        strength: 'high',
        confidence: 'confirmed',
        explanation: '데이터센터 매출은 수요 강도가 실제 매출로 이어졌음을 보여줍니다.',
      },
      {
        driverId: 'nvidia-product-geographic-mix',
        direction: 'mixed',
        strength: 'high',
        confidence: 'partially_supported',
        explanation: '높은 수요와 중국 제외 가이던스가 동시에 존재해 지역·제품 구성의 마진 효과를 분리해 봐야 합니다.',
      },
    ],
    financialMetricLinks: [
      { metricId: 'revenue', direction: 'increase', confidence: 'confirmed', explanation: '데이터센터 매출 증가가 전체 매출 성장의 핵심 경로입니다.' },
      { metricId: 'grossMargin', direction: 'mixed', confidence: 'partially_supported', explanation: '제품 전환과 지역별 판매 제한의 순효과를 다음 공시에서 확인해야 합니다.' },
      { metricId: 'operatingMargin', direction: 'mixed', confidence: 'partially_supported', explanation: '매출 성장과 신제품·지역 구성 변화가 함께 영업이익률에 전달됩니다.' },
      { metricId: 'freeCashFlow', direction: 'mixed', confidence: 'partially_supported', explanation: '매출 증가와 공급·운전자본 부담이 현금흐름에 함께 반영됩니다.' },
    ],
    valuationAssumptionLinks: [
      { assumptionId: 'revenue_growth', action: 'review_scenario', confidence: 'confirmed', explanation: '확인된 데이터센터 수요를 보수·기준·낙관 성장 경로와 대조했습니다.' },
      { assumptionId: 'operating_margin', action: 'review_scenario', confidence: 'partially_supported', explanation: '지역·제품 구성의 순효과가 확정되지 않아 시나리오 범위만 점검했습니다.' },
      { assumptionId: 'growth_duration', action: 'review_scenario', confidence: 'unresolved', explanation: '한 분기의 수요 강도를 장기 성장기간으로 자동 연장하지 않았습니다.' },
    ],
    reviewStage: 'scenario_review',
    reviewStatus: 'reviewed_no_change',
    decision: {
      reviewedAt: '2026-07-15',
      reviewedBy: 'owner',
      summary: 'Phase 5D 기준 모형은 이 공식 실적 이후 작성돼 해당 정보를 이미 반영합니다. 추가 자동 조정 없이 기준 가정을 유지하고 다음 분기를 확인합니다.',
      beforeModelVersion: 'nvidia-phase-5d-2026.07.17-final',
      afterModelVersion: 'nvidia-phase-5d-2026.07.17-final',
    },
    watchItems: ['다음 분기 데이터센터 매출', '중국 제외 매출 구성', '총마진과 운전자본'],
  },
];

export default nvidiaEventImpacts;
