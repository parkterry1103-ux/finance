import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'lg-electronics',
  asOf: '2026-07-14',
  oneLineBusiness: '가정·기업 고객에게 가전과 HVAC·칠러·냉각 솔루션을 판매하고 제품·서비스 매출로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: '가전과 상업용 HVAC·칠러를 판매하며, 데이터센터에서는 고밀도 서버의 열을 관리하는 냉각 장비와 솔루션이 수익 기회가 됩니다.', sourceIds: ['lge-story-newsroom-235685-63746d17'] },
    recentChange: { summary: '완주 20MW급 AI 데이터센터 HVAC 공급 협약을 공개했지만 아직 본계약·설치 완료·매출 인식 단계는 아닙니다.', sourceIds: ['lge-story-newsroom-235685-63746d17'], asOf: '2026-03-04' },
    whyItMatters: { summary: 'AI 서버 밀도가 높아질수록 냉각 수요가 커질 수 있지만 협약이 수주와 납품, 반복 매출로 전환돼야 기업가치에 의미가 생깁니다.', sourceIds: ['lge-story-newsroom-235685-63746d17'] },
    keyRisk: { summary: '프로젝트가 본계약으로 이어지지 않거나 냉각 사업의 매출·마진이 별도로 확인되지 않으면 성장 기여도를 판단하기 어렵습니다.', sourceIds: ['lge-story-newsroom-235685-63746d17'] },
    watchNext: { summary: '본계약 체결, 장비 납품과 설치 일정, 데이터센터 냉각 매출 구분, 수익성과 현금 유입을 확인합니다.', sourceIds: ['lge-story-newsroom-235685-63746d17'] },
  },
  keyMetricSelections: [{ metricId: 'lge-wanju-project-capacity' }],
  relatedEditorialIds: [],
};

export default config;
