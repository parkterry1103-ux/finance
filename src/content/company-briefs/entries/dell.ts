import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'dell',
  asOf: '2026-07-14',
  oneLineBusiness: '기업 고객에게 서버·스토리지·AI 인프라를 공급하고 하드웨어·솔루션 판매와 서비스로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: 'GPU·메모리·네트워크를 서버와 랙 시스템으로 통합해 공급하며 주문이 출하·매출·서비스로 전환될 때 수익이 발생합니다.', sourceIds: ['dell-fy2027-q1-results', 'dell-technologies-delivers-fourth-quarter-and-full-year-fiscal-2026-results'] },
    recentChange: { summary: 'FY2027 1분기 AI 서버 주문 244억 달러와 매출 161억 달러를 발표했고 연간 AI 서버 매출 전망을 600억 달러로 제시했습니다.', sourceIds: ['dell-fy2027-q1-results'], asOf: '2026-05-28' },
    whyItMatters: { summary: '큰 주문이 취소 없이 출하되고 매출로 인식되는 속도와 서버 마진·운전자본이 실제 기업가치를 결정합니다.', sourceIds: ['dell-fy2027-q1-results', 'dell-technologies-delivers-fourth-quarter-and-full-year-fiscal-2026-results'] },
    keyRisk: { summary: 'GPU·메모리 조달 차질, 주문 취소, 낮은 하드웨어 마진이나 재고·매출채권 증가가 매출 성장의 현금 기여를 약화할 수 있습니다.', sourceIds: ['dell-fy2027-q1-results'] },
    watchNext: { summary: 'AI 주문의 매출 전환율, 기말 수주잔고, 서버 마진, 부품 조달과 영업현금흐름을 확인합니다.', sourceIds: ['dell-fy2027-q1-results', 'dell-technologies-delivers-fourth-quarter-and-full-year-fiscal-2026-results'] },
  },
  keyMetricSelections: [{ metricId: 'dell-fy2027-q1-ai-orders' }, { metricId: 'dell-fy2027-q1-ai-revenue' }, { metricId: 'dell-fy2027-ai-revenue-guidance' }],
  relatedEditorialIds: [],
};

export default config;
