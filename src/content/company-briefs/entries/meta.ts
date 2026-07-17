import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'meta',
  asOf: '2026-07-14',
  oneLineBusiness: '사용자와 광고주를 소셜·메시징 서비스로 연결하고 디지털 광고 판매로 주로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: '대규모 사용자 활동에서 광고 노출과 전환 기회를 만들고 광고주에게 판매하며, 광고 현금흐름을 AI 추천과 데이터센터에 재투자합니다.', sourceIds: ['meta-q1-2026-results'] },
    recentChange: { summary: '2026년 CAPEX 전망을 1,250억~1,450억 달러로 상향했고 장기 인프라 투자를 위한 선순위 채권 발행도 완료했습니다.', sourceIds: ['meta-q1-2026-results', 'meta-2025-senior-notes-8k'], asOf: '2026-04-29' },
    whyItMatters: { summary: 'AI 투자가 광고 효율과 신규 매출을 높여야 하지만 CAPEX·감가상각·이자비용보다 현금흐름이 빠르게 늘어야 장기 가치를 지킬 수 있습니다.', sourceIds: ['meta-q1-2026-results', 'meta-2025-senior-notes-8k'] },
    keyRisk: { summary: '광고 성장이나 사용자 참여가 둔화하는 가운데 인프라 비용과 부채비용이 늘면 FCFF 전환율과 자본수익률이 낮아질 수 있습니다.', sourceIds: ['meta-q1-2026-results', 'meta-2025-senior-notes-8k'] },
    watchNext: { summary: '광고 단가·노출·사용자 참여, CAPEX 실제 집행, 감가상각·영업현금흐름과 신규 비광고 매출을 확인합니다.', sourceIds: ['meta-q1-2026-results', 'meta-2025-senior-notes-8k'] },
  },
  keyMetricSelections: [
    { metricId: 'meta-2026-capex-low', comparison: { label: '기존 전망 하단', referenceValue: 115, formattedReferenceValue: '$115B', difference: 10, formattedDifference: '+$10B', differenceUnit: 'absolute', referencePeriod: '이전 2026년 전망' } },
    { metricId: 'meta-2026-capex-high', comparison: { label: '기존 전망 상단', referenceValue: 135, formattedReferenceValue: '$135B', difference: 10, formattedDifference: '+$10B', differenceUnit: 'absolute', referencePeriod: '이전 2026년 전망' } },
    { metricId: 'meta-2025-senior-notes' },
  ],
  relatedEditorialIds: [],
  reportSlug: 'meta',
};

export default config;
