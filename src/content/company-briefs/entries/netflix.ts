import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'netflix',
  asOf: '2026-07-18',
  oneLineBusiness: '전 세계 이용자에게 영화·시리즈·라이브 콘텐츠를 제공하고 구독료와 광고 판매로 돈을 법니다.',
  questions: {
    revenueEngine: {
      summary: '유료 회원이 선택한 요금제의 구독료가 핵심 수익이며 광고 포함 요금제에서는 광고주 지출도 매출이 됩니다. 가격, 회원 수, 광고 판매가 콘텐츠 투자비를 웃돌아 현금으로 남아야 합니다.',
      sourceIds: ['netflix-q2-2026-10q', 'netflix-q2-2026-letter'],
    },
    recentChange: {
      summary: '2분기 매출은 전년 동기 대비 13.4% 늘었지만 회사의 3분기 매출 성장 전망은 11.7%로 낮아졌습니다. 2027년부터 종합 시청시간 보고 빈도도 연 1회로 줄어듭니다.',
      sourceIds: ['netflix-q2-2026-letter'],
      asOf: '2026-07-16',
    },
    whyItMatters: {
      summary: '현재 실적보다 다음 분기의 성장 속도와 참여도 가시성이 낮아지면 시장이 기대한 성장 지속기간을 다시 볼 수 있습니다. 반면 2026년 연간 매출과 영업이익률 전망의 큰 방향은 유지됐습니다.',
      sourceIds: ['netflix-q2-2026-letter'],
    },
    keyRisk: {
      summary: '콘텐츠 투자에도 회원 참여·가격 수용력·광고 성장이 기대에 못 미치거나, 시청 데이터가 줄어 성장의 질을 확인하기 어려워지면 매출 성장과 현금 회수 기간이 약해질 수 있습니다.',
      sourceIds: ['netflix-q2-2026-10q', 'netflix-q2-2026-letter'],
    },
    watchNext: {
      summary: '3분기 매출 128억6,000만달러와 영업이익률 33.2% 전망 달성, 광고·가격·회원 증가의 기여, 주간 Top 10과 2027년 연간 시청시간 보고의 세분성을 확인합니다.',
      sourceIds: ['netflix-q2-2026-letter'],
    },
  },
  keyMetricSelections: [
    {
      metricId: 'nflx-q2-2026-revenue-growth',
      comparison: { label: '전년 동기 대비', difference: 13.4, formattedDifference: '+13.4%', differenceUnit: 'percent', referencePeriod: '2025년 2분기' },
    },
    {
      metricId: 'nflx-q2-2026-operating-margin',
      comparison: { label: '전년 동기 대비', referenceValue: 34.1, formattedReferenceValue: '34.1%', difference: -0.7, formattedDifference: '-0.7%p', differenceUnit: 'percentagePoint', referencePeriod: '2025년 2분기' },
    },
    {
      metricId: 'nflx-q2-2026-free-cash-flow',
      comparison: { label: '전년 동기 대비', referenceValue: 2.267, formattedReferenceValue: '$2.267B', difference: -32.7, formattedDifference: '-32.7%', differenceUnit: 'percent', referencePeriod: '2025년 2분기' },
    },
  ],
  relatedEditorialIds: ['stock-2026-07-18-netflix-guidance-disclosure-reset'],
};

export default config;
