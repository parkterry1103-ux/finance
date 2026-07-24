import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'supermicro',
  asOf: '2026-07-24',
  oneLineBusiness: '클라우드·기업 고객에게 AI 서버와 랙 단위 시스템을 공급하고 하드웨어·통합 솔루션 판매로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: 'GPU·네트워크·냉각 부품을 서버와 랙으로 통합해 공급하며 주문이 생산·출하·고객 인수와 매출로 전환될 때 수익이 발생합니다.', sourceIds: ['smci-sec-2025-10k'] },
    recentChange: { summary: '회사는 FY2026 4분기 신규 주문이 600억달러를 넘었고 매출은 기존 110억~125억달러 전망의 하단 부근, 예비 매출총이익률은 15~17%라고 밝혔습니다. 모두 미감사 예비 수치입니다.', sourceIds: ['smci-sec-2026-preliminary-8k', 'smci-ir-2026-q4-preliminary-update'], asOf: '2026-07-21' },
    whyItMatters: { summary: '주문과 제품·고객 구성 개선이 실제 출하와 마진으로 이어지면 수익성 기대가 달라질 수 있습니다. 반면 매출이 전망 하단에 머문 만큼 주문 규모만으로 실행 속도를 확정할 수 없습니다.', sourceIds: ['smci-ir-2026-q4-preliminary-update'] },
    keyRisk: { summary: '일부 주문은 확정되지 않았거나 취소·지연될 수 있습니다. FY2026 3분기 잉여현금흐름이 -66.96억달러였던 만큼 재고·매입채무와 고객 집중이 현금 전환을 제약할 수 있습니다.', sourceIds: ['smci-sec-2026-q3-10q', 'smci-ir-2026-q4-preliminary-update'] },
    watchNext: { summary: '8월 11일 최종 실적에서 매출·매출총이익률·주문 확정성·출하 일정과 재고·매입채무·영업현금흐름을 함께 확인합니다.', sourceIds: ['smci-ir-2026-q4-preliminary-update'], asOf: '2026-08-11' },
  },
  keyMetricSelections: [{ metricId: 'smci-fy2026-q3-revenue-growth' }, { metricId: 'smci-fy2026-q3-gross-margin' }, { metricId: 'smci-fy2026-q3-free-cash-flow' }],
  relatedEditorialIds: ['stock-2026-07-22-smci-orders-margin'],
};

export default config;
