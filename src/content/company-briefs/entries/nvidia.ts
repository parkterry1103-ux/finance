import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'nvidia',
  asOf: '2026-07-14',
  oneLineBusiness: '클라우드·기업 고객에게 AI GPU·네트워킹·소프트웨어 플랫폼을 공급하고 제품·플랫폼 매출로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: 'AI 가속기, 네트워킹과 소프트웨어를 하나의 데이터센터 플랫폼으로 공급하며 고객의 컴퓨팅 투자가 출하와 매출로 전환될 때 수익이 발생합니다.', sourceIds: ['nvidia-fy2027-q1-results'] },
    recentChange: { summary: 'FY2027 1분기 데이터센터 매출이 752억 달러였고 회사 발표 기준 전년 동기 대비 92% 증가했습니다.', sourceIds: ['nvidia-fy2027-q1-results'], asOf: '2026-04-26' },
    whyItMatters: { summary: '데이터센터 매출 성장은 GPU뿐 아니라 HBM·서버·전력·냉각 수요를 함께 움직이지만 공급 전환과 높은 기대를 계속 충족해야 합니다.', sourceIds: ['nvidia-fy2027-q1-results'] },
    keyRisk: { summary: '고객 투자 둔화, 신제품 전환 지연, 공급 제약이나 대체 가속기 확산이 출하 성장과 플랫폼 수익성을 낮출 수 있습니다.', sourceIds: ['nvidia-fy2027-q1-results'] },
    watchNext: { summary: '신제품 출하 일정, 데이터센터 성장률, 고객별 투자 집행, 공급능력과 마진·현금흐름을 확인합니다.', sourceIds: ['nvidia-fy2027-q1-results'] },
  },
  keyMetricSelections: [
    { metricId: 'nvda-fy2027-q1-revenue' },
    { metricId: 'nvda-fy2027-q1-datacenter-revenue' },
    { metricId: 'nvda-fy2027-q1-datacenter-growth', comparison: { label: '전년 동기 대비', difference: 92, formattedDifference: '+92%', differenceUnit: 'percent', referencePeriod: 'Q1 FY2026' } },
  ],
  relatedEditorialIds: [],
  reportSlug: 'nvidia',
};

export default config;
