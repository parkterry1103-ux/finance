import type { BusinessDriverDefinition } from './types.js';

export const businessDriverRegistry: BusinessDriverDefinition[] = [
  {
    id: 'nvidia-ai-accelerator-demand',
    companySlug: 'nvidia',
    label: 'AI 가속기 수요',
    description: '클라우드·기업·국가 고객의 가속 컴퓨팅 수요가 출하와 매출로 이어지는 경로입니다.',
    financialMetricIds: ['revenue', 'operatingIncome', 'freeCashFlow'],
    valuationAssumptionIds: ['revenue_growth', 'growth_duration'],
  },
  {
    id: 'nvidia-product-geographic-mix',
    companySlug: 'nvidia',
    label: '제품·지역 구성',
    description: '고성능 제품 구성과 지역별 판매 제한이 매출총이익률과 영업이익률에 미치는 경로입니다.',
    financialMetricIds: ['grossMargin', 'operatingMargin', 'freeCashFlow'],
    valuationAssumptionIds: ['gross_margin', 'operating_margin'],
  },
  {
    id: 'nvidia-platform-competition',
    companySlug: 'nvidia',
    label: '플랫폼 경쟁력',
    description: '가속기·네트워킹·소프트웨어 결합이 성장 지속기간과 장기 수익성을 지지하는 경로입니다.',
    financialMetricIds: ['revenue', 'grossMargin', 'operatingMargin'],
    valuationAssumptionIds: ['growth_duration', 'terminal_roic'],
  },
  {
    id: 'meta-advertising-demand',
    companySlug: 'meta',
    label: '광고 수요와 단가',
    description: '광고 노출과 광고당 가격이 광고 매출과 영업현금흐름으로 이어지는 경로입니다.',
    financialMetricIds: ['revenue', 'operatingIncome', 'operatingCashFlow'],
    valuationAssumptionIds: ['revenue_growth', 'operating_margin', 'growth_duration'],
  },
  {
    id: 'meta-ai-infrastructure-investment',
    companySlug: 'meta',
    label: 'AI 인프라 재투자',
    description: '데이터센터 설비투자가 추천·광고 효율과 미래 현금흐름으로 회수되는 경로입니다.',
    financialMetricIds: ['capitalExpenditure', 'freeCashFlow', 'freeCashFlowMargin'],
    valuationAssumptionIds: ['capex_ratio', 'reinvestment_rate', 'terminal_roic'],
  },
  {
    id: 'meta-platform-engagement',
    companySlug: 'meta',
    label: '플랫폼 참여',
    description: '사용자 참여와 추천 품질이 광고 노출·단가·매출 성장으로 이어지는 경로입니다.',
    financialMetricIds: ['revenue', 'operatingMargin'],
    valuationAssumptionIds: ['revenue_growth', 'growth_duration'],
  },
];

export const businessDriverById = new Map(businessDriverRegistry.map((driver) => [driver.id, driver]));
