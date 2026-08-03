import type { CompanyBriefConfig } from '../types.js';

const sourceIds = ['alphabet-2026-q1-10q'];
const config: CompanyBriefConfig = {
  companySlug: 'alphabet',
  asOf: '2026-04-30',
  oneLineBusiness: '검색·YouTube 광고와 구독, Google Cloud 사용료로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: 'Google Services의 광고·구독과 Google Cloud 사용료가 핵심 매출원입니다.', sourceIds },
    recentChange: { summary: 'Cloud 매출과 마진이 빠르게 확대됐고 AI 인프라 설비투자와 Wiz 인수가 함께 늘었습니다.', sourceIds: [...sourceIds, 'alphabet-wiz-completion-2026'], asOf: '2026-04-30' },
    whyItMatters: { summary: 'Cloud 수익화가 빨라질수록 대규모 AI 투자 이후의 현금 회수 가능성을 높입니다.', sourceIds },
    keyRisk: { summary: '설비투자와 감가상각이 매출·현금 성장보다 오래 빠르게 늘면 잉여현금과 마진을 누를 수 있습니다.', sourceIds },
    watchNext: { summary: 'Cloud 성장과 마진, 광고 성장, CAPEX와 잉여현금, Wiz 통합 성과를 확인합니다.', sourceIds: [...sourceIds, 'alphabet-wiz-completion-2026'] },
  },
  keyMetricSelections: [
    { metricId: 'alphabet-q1-2026-revenue-growth' },
    { metricId: 'alphabet-q1-2026-cloud-growth' },
    { metricId: 'alphabet-q1-2026-free-cash-flow' },
  ],
  relatedEditorialIds: [],
};

export default config;
