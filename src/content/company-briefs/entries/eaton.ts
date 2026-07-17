import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'eaton',
  asOf: '2026-07-14',
  oneLineBusiness: '데이터센터·유틸리티·산업 고객에게 배전·전력관리 장비를 공급하고 장비·서비스 판매로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: '배전·전력관리 장비 주문이 수주잔고에 쌓인 뒤 생산·납품돼 매출로 인식되며 서비스와 교체 수요가 반복 매출을 보완합니다.', sourceIds: ['eaton-q1-2026-results'] },
    recentChange: { summary: '2026년 1분기 Electrical 수주잔고가 전년 대비 48%, 미주 주문의 12개월 평균이 42% 증가했다고 발표했습니다.', sourceIds: ['eaton-q1-2026-results'], asOf: '2026-04-30' },
    whyItMatters: { summary: '데이터센터와 전력망 투자가 실제 수주로 나타났지만 생산능력·리드타임·납품이 따라야 매출과 현금흐름이 됩니다.', sourceIds: ['eaton-q1-2026-results'] },
    keyRisk: { summary: '설비투자 지연, 생산 병목, 원가 상승이나 수주잔고 취소가 주문 증가를 매출과 수익성으로 전환하는 속도를 늦출 수 있습니다.', sourceIds: ['eaton-q1-2026-results'] },
    watchNext: { summary: '수주잔고의 매출 전환, 생산능력과 리드타임, Electrical Americas 마진과 영업현금흐름을 확인합니다.', sourceIds: ['eaton-q1-2026-results'] },
  },
  keyMetricSelections: [
    { metricId: 'etn-q1-2026-revenue' },
    { metricId: 'etn-q1-2026-electrical-backlog-growth', comparison: { label: '전년 대비', difference: 48, formattedDifference: '+48%', differenceUnit: 'percent', referencePeriod: '2025년 1분기' } },
    { metricId: 'etn-q1-2026-orders-growth', comparison: { label: '전년 대비', difference: 42, formattedDifference: '+42%', differenceUnit: 'percent', referencePeriod: '2025년 동기 12개월 평균' } },
  ],
  relatedEditorialIds: [],
};

export default config;
