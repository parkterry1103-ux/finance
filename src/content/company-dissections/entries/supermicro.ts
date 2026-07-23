import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const config: CompanyDissectionConfig = {
  companySlug: 'supermicro',
  industryProfile: {
    primaryIndustry: '서버·IT 하드웨어',
    classificationSources: classificationSources({
      gicsSector: 'Information Technology', gicsIndustry: 'Technology Hardware, Storage & Peripherals',
      icbSector: 'Technology', icbIndustry: 'Computer Hardware',
      marketProvider: 'Nasdaq Company Profile', marketSector: 'Technology', marketIndustry: 'Computer Hardware',
      marketUrl: 'https://www.nasdaq.com/market-activity/stocks/smci',
    }),
    businessSegments: [
      { id: 'server-storage', label: 'Server & Storage Systems', revenueShareAvailable: true },
      { id: 'subsystems-accessories', label: 'Subsystems & Accessories', revenueShareAvailable: true },
    ],
  },
  axes: {
    growth: { key: 'growth', state: 'aboveAverage', position: 4, statusLabel: 'AI 서버 주문 확대', evidenceMetricId: 'smci-2026-ai-orders', comparison: { kind: 'ownHistory', label: '주문→출하 자체 전환 추적' }, interpretation: '주문은 성장 신호지만 출하·매출·취소율 확인 전에는 확정 실적으로 보지 않습니다.', nextCheck: '주문 출하율과 매출 인식', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'insufficientData', position: null, statusLabel: '시스템 마진 확인 필요', evidenceText: '자료 미수집', comparison: { kind: 'segmentPeer', label: '서버 시스템 peer 동일 정의 필요' }, interpretation: '주문 규모가 커도 부품 비용과 제품 구성이 마진을 낮출 수 있습니다.', nextCheck: '매출총이익률·영업이익률', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'middle', position: 3, statusLabel: '빠른 통합·랙 역량', evidenceText: '모듈형 서버·랙 솔루션', comparison: { kind: 'officialEvidence', label: '공식 제품·통합 근거' }, interpretation: '빠른 제품 통합은 강점이지만 부품 공급자 의존과 경쟁사의 대체 가능성을 함께 봅니다.', nextCheck: '납기·고객 유지·서비스 비중', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'], detailSurface: 'financials', moatEvidence: ['모듈형 설계', '랙 단위 통합', '빠른 제품 전환'], weakeningRisks: ['GPU 공급 의존', '가격 경쟁', '고객 내재화'] },
    financialHealth: { key: 'financialHealth', state: 'belowAverage', position: 2, statusLabel: '외부 자금 의존 점검', evidenceMetricId: 'smci-2026-potential-financing', comparison: { kind: 'ownHistory', label: '자체 과거 주식 수·현금흐름' }, interpretation: '주문 대응 자금조달은 생산을 돕지만 실제 조달액과 희석·운전자본 부담을 확인해야 합니다.', nextCheck: '실제 조달·주식 수·영업현금흐름', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '공개 모형 미지원', evidenceText: '검증 모형 없음', comparison: { kind: 'ownHistory', label: '변동성 높은 자체 과거 우선' }, interpretation: '주문 headline과 단일 peer 배수만으로 밸류에이션을 정하지 않습니다.', nextCheck: '정상화 마진·희석 후 주당 지표', sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'], detailSurface: 'financials' },
  },
};

export default config;
