import type { CompanyBriefConfig } from '../types.js';

const sourceIds = ['hana-financial-1h26-presentation', 'hana-financial-1h26-databook'];
const config: CompanyBriefConfig = {
  companySlug: 'hana-financial',
  asOf: '2026-07-24',
  oneLineBusiness: '예금으로 자금을 조달해 대출·투자를 운용하고 이자와 수수료로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: '은행 순이자이익을 중심으로 증권·카드·자산관리의 수수료와 비이자이익을 더합니다.', sourceIds },
    recentChange: { summary: '비이자·수수료 이익이 늘었지만 고정이하여신과 대손비용도 함께 상승했습니다.', sourceIds, asOf: '2026-07-24' },
    whyItMatters: { summary: '순이익 크기보다 이익 원천과 이를 만들기 위해 부담한 신용위험·자본 소모가 지속성을 좌우합니다.', sourceIds },
    keyRisk: { summary: '부실채권과 대손비용이 더 늘면 이익 성장과 주주환원에 쓸 자본 여력이 줄 수 있습니다.', sourceIds },
    watchNext: { summary: 'NIM, 비이자이익, 대손비용, 고정이하여신과 CET1 비율을 함께 확인합니다.', sourceIds },
  },
  keyMetricSelections: [
    { metricId: 'hana-1h26-operating-income-growth' },
    { metricId: 'hana-2q26-npl-ratio' },
    { metricId: 'hana-2q26-cet1-ratio' },
  ],
  relatedEditorialIds: [],
};

export default config;
