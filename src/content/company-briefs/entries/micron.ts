import type { CompanyBriefConfig } from '../types.js';

const config: CompanyBriefConfig = {
  companySlug: 'micron',
  asOf: '2026-07-14',
  oneLineBusiness: '서버·PC·모바일 고객에게 DRAM·NAND·HBM을 공급하고 메모리 제품 판매로 돈을 법니다.',
  questions: {
    revenueEngine: { summary: 'HBM과 범용 DRAM·NAND의 출하량·가격·제품 구성이 매출을 만들고, 생산수율과 설비 활용도가 현금창출력을 좌우합니다.', sourceIds: ['micron-fy2026-q3-results'] },
    recentChange: { summary: 'FY2026 3분기 메모리 실적을 발표했고 버지니아 DRAM 생산 확대가 실제 생산 시작 단계로 이동했습니다.', sourceIds: ['micron-fy2026-q3-results', 'micron-virginia-expansion-2026'], asOf: '2026-06-24' },
    whyItMatters: { summary: 'HBM 공급 확대와 메모리 가격 회복이 매출뿐 아니라 영업현금흐름으로 이어져야 증설의 경제성을 확인할 수 있습니다.', sourceIds: ['micron-fy2026-q3-results', 'micron-virginia-expansion-2026'] },
    keyRisk: { summary: '범용 메모리 가격 하락, HBM 인증·출하 지연이나 CAPEX 확대가 영업현금흐름보다 빨라지면 사이클 변동성이 커질 수 있습니다.', sourceIds: ['micron-fy2026-q3-results', 'micron-virginia-expansion-2026'] },
    watchNext: { summary: 'HBM과 범용 메모리 매출 구분, 가격·재고, 신규 생산 수율과 CAPEX를 차감한 현금흐름을 확인합니다.', sourceIds: ['micron-fy2026-q3-results', 'micron-virginia-expansion-2026'] },
  },
  keyMetricSelections: [{ metricId: 'mu-fy2026-q3-revenue' }, { metricId: 'mu-fy2026-q3-operating-cash-flow' }],
  relatedEditorialIds: [],
};

export default config;
