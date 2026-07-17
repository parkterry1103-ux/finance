import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'supermicro',
  asOf: '2026-07-14',
  oneLineBusiness: '클라우드·기업 고객에게 AI 서버와 랙 단위 시스템을 공급하고 하드웨어·통합 솔루션 판매로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: 'GPU·네트워크·냉각 부품을 서버와 랙으로 통합해 공급하며 주문이 생산·출하·매출로 전환될 때 수익이 발생합니다.', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'] },
    recentChange: { summary: '약 390억 달러의 AI 서버 주문에 대응하기 위해 보통주·전환우선주·ATM을 합친 최대 70억 달러 잠재 자금조달 조건을 발표했습니다.', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'], asOf: '2026-06-11' },
    whyItMatters: { summary: '큰 주문이 매출로 전환되려면 부품과 운전자본이 필요하며, 자금조달의 실제 유입과 주식 수 변화가 주주가치에 함께 영향을 줍니다.', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'] },
    keyRisk: { summary: '부품 조달 지연, 주문 취소, 재고·매출채권 확대나 예상보다 큰 희석이 매출 성장의 현금 기여를 약화할 수 있습니다.', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'] },
    watchNext: { summary: 'AI 주문의 출하·매출 전환, 실제 조달액과 주식 수, 재고·운전자본, 영업현금흐름을 확인합니다.', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'] },
  },
  keyMetricSelections: [{ metricId: 'smci-2026-ai-orders' }, { metricId: 'smci-2026-potential-financing' }],
  relatedEditorialIds: [],
};

export default config;
