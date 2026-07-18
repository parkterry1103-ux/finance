import type { EventImpactRecord } from '../types.js';

const netflixEventImpacts: EventImpactRecord[] = [
  {
    id: 'netflix-q2-2026-guidance-disclosure-review',
    companySlug: 'netflix',
    event: {
      title: '2분기 실적 뒤 낮아진 3분기 성장 전망과 참여도 공시 변경',
      eventAsOf: '2026-07-16',
      publishedAt: '2026-07-18',
      sourceIds: ['netflix-q2-2026-8k', 'netflix-q2-2026-letter'],
      editorialId: 'stock-2026-07-18-netflix-guidance-disclosure-reset',
    },
    summary: '2분기 성장과 연간 전망은 유지됐지만 3분기 성장률 둔화와 종합 시청시간 보고 빈도 축소가 확인돼 성장 지속기간과 정보 가시성을 시나리오 수준에서 다시 볼 사건으로 분류했습니다.',
    materiality: 'high',
    reviewOrigin: 'manual_research_review',
    confirmedFacts: [
      {
        id: 'netflix-q2-growth-fact',
        statement: '2026년 2분기 매출은 125억5,994만달러로 전년 동기 대비 13.4% 증가했습니다.',
        confidence: 'confirmed',
        sourceIds: ['netflix-q2-2026-10q', 'netflix-q2-2026-letter'],
      },
      {
        id: 'netflix-q3-guidance-fact',
        statement: '회사는 3분기 매출 128억6,000만달러와 11.7% 성장, 영업이익률 33.2%, 희석 EPS 0.82달러를 전망했습니다.',
        confidence: 'confirmed',
        sourceIds: ['netflix-q2-2026-letter'],
      },
      {
        id: 'netflix-viewing-report-fact',
        statement: '회사는 2027년부터 종합 시청시간 보고를 연 1회로 전환하고 주간 Top 10은 유지한다고 밝혔습니다.',
        confidence: 'confirmed',
        sourceIds: ['netflix-q2-2026-letter'],
      },
    ],
    unresolvedItems: [
      {
        id: 'netflix-growth-duration-unresolved',
        statement: '3분기 성장률 둔화가 콘텐츠 편성·계절성에 따른 일시적 변화인지 장기 성장기간 단축인지는 확인되지 않았습니다.',
        confidence: 'unresolved',
        sourceIds: ['netflix-q2-2026-letter'],
      },
      {
        id: 'netflix-engagement-visibility-unresolved',
        statement: '종합 시청시간 보고 빈도 축소가 실제 이용자 참여도 악화를 뜻한다는 근거는 확인되지 않았습니다.',
        confidence: 'unresolved',
        sourceIds: ['netflix-q2-2026-letter'],
      },
    ],
    businessDriverImpacts: [
      {
        driverId: 'netflix-member-price-ad-demand',
        direction: 'mixed',
        strength: 'high',
        confidence: 'partially_supported',
        explanation: '2분기 매출 성장은 확인됐지만 3분기 회사 성장 전망은 더 낮아 회원·가격·광고의 다음 분기 기여를 분리해 확인해야 합니다.',
      },
      {
        driverId: 'netflix-content-engagement',
        direction: 'unclear',
        strength: 'medium',
        confidence: 'unresolved',
        explanation: '시청시간 공개 빈도는 달라졌지만 콘텐츠 참여와 회원 유지가 실제로 약해졌는지는 확인되지 않았습니다.',
      },
      {
        driverId: 'netflix-disclosure-visibility',
        direction: 'weakening',
        strength: 'medium',
        confidence: 'confirmed',
        explanation: '종합 시청시간 비교가 반기에서 연간으로 바뀌어 중간 시점에 성장의 질을 확인할 수 있는 정보 빈도는 줄어듭니다.',
      },
    ],
    financialMetricLinks: [
      { metricId: 'revenue', direction: 'mixed', confidence: 'partially_supported', explanation: '2분기 매출 증가는 확인됐지만 3분기 성장률 전망은 낮아졌습니다.' },
      { metricId: 'operatingMargin', direction: 'mixed', confidence: 'confirmed', explanation: '2분기 영업이익률은 전년 동기보다 0.7%p 낮았고 3분기 회사 전망은 33.2%입니다.' },
      { metricId: 'freeCashFlow', direction: 'decrease', confidence: 'confirmed', explanation: '2분기 잉여현금흐름은 전년 동기보다 감소했지만 회사는 연간 전망을 유지했습니다.' },
    ],
    valuationAssumptionLinks: [
      { assumptionId: 'revenue_growth', action: 'review_scenario', confidence: 'confirmed', explanation: '2분기 실제 성장과 3분기 회사 전망의 차이를 향후 성장 시나리오에서 점검해야 합니다.' },
      { assumptionId: 'growth_duration', action: 'review_scenario', confidence: 'partially_supported', explanation: '근거리 성장률과 참여도 정보 빈도 변화가 장기 성장기간을 자동으로 바꾸지는 않지만 재검토 근거가 됩니다.' },
      { assumptionId: 'operating_margin', action: 'monitor', confidence: 'confirmed', explanation: '분기 마진과 연간 회사 전망을 다음 정기공시에서 비교합니다.' },
    ],
    reviewStage: 'scenario_review',
    reviewStatus: 'pending',
    watchItems: ['3분기 매출·영업이익률 전망 달성', '광고·가격·회원 증가의 실제 기여', '주간 Top 10과 연간 시청시간 보고의 보완 관계'],
  },
];

export default netflixEventImpacts;
