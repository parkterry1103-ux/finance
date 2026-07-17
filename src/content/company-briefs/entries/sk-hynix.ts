import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'sk-hynix',
  asOf: '2026-07-14',
  oneLineBusiness: '서버·모바일 고객에게 HBM·DRAM·NAND를 공급하고 메모리 제품 판매로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: 'HBM·DRAM·NAND의 출하량과 판매가격이 매출을 만들고, 제품 구성과 생산수율이 수익성을 좌우합니다.', sourceIds: ['sk-hynix-q1-2026-results'] },
    recentChange: { summary: '1분기 실적과 AI 메모리 투자 방향을 발표했고 HBM4 개발 완료와 양산 준비 단계도 공개했습니다.', sourceIds: ['sk-hynix-q1-2026-results', 'sk-hynix-hbm4-production-2025'], asOf: '2026-04-23' },
    whyItMatters: { summary: 'HBM 수요가 실제 출하와 매출로 이어지고 신규 생산기반이 계획대로 가동돼야 투자 이후 현금흐름을 설명할 수 있습니다.', sourceIds: ['sk-hynix-q1-2026-results', 'sk-hynix-hbm4-production-2025'] },
    keyRisk: { summary: '메모리 가격과 고객 수요가 약해지거나 HBM4 인증·수율·양산이 늦어지면 큰 설비투자가 현금흐름 부담으로 바뀔 수 있습니다.', sourceIds: ['sk-hynix-q1-2026-results', 'sk-hynix-hbm4-production-2025'] },
    watchNext: { summary: 'M15X 양산 일정, HBM4 고객 인증과 실제 출하, 재고·메모리 가격, CAPEX 이후 현금흐름을 확인합니다.', sourceIds: ['sk-hynix-q1-2026-results', 'sk-hynix-hbm4-production-2025'] },
  },
  keyMetricSelections: [{ metricId: 'skh-q1-2026-revenue' }, { metricId: 'skh-q1-2026-operating-income' }],
  relatedEditorialIds: [],
};

export default config;
