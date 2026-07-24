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
    growth: { key: 'growth', state: 'aboveAverage', position: 4, statusLabel: '실적 성장·주문 확대', evidenceMetricId: 'smci-fy2026-q3-revenue-growth', comparison: { kind: 'ownHistory', label: '전년 동기 실제 매출과 주문→출하 전환' }, interpretation: '3분기 매출 성장은 확인됐지만 600억달러 초과 신규 주문에는 비확정·취소·지연 가능성이 있어 미래 매출과 동일하게 보지 않습니다.', nextCheck: '4분기 최종 매출과 주문 출하율', sourceIds: ['smci-sec-2026-q3-10q', 'smci-ir-2026-q4-preliminary-update'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'middle', position: 3, statusLabel: '예비 마진 개선 검증 전', evidenceMetricId: 'smci-fy2026-q3-gross-margin', comparison: { kind: 'ownHistory', label: '전년 동기 실제 마진과 4분기 최종치' }, interpretation: '3분기 실제 매출총이익률은 9.9%입니다. 4분기 15~17% 예비 추정은 제품·고객 구성 개선 신호지만 미감사 최종 실적이 아닙니다.', nextCheck: '8월 11일 최종 매출총이익률', sourceIds: ['smci-sec-2026-q3-10q', 'smci-ir-2026-q4-preliminary-update'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'middle', position: 3, statusLabel: '빠른 통합·랙 역량', evidenceText: '모듈형 서버·랙 솔루션', comparison: { kind: 'officialEvidence', label: '공식 사업·제품 근거' }, interpretation: '빠른 제품 통합과 랙 단위 공급은 강점이지만 부품 공급자 의존과 경쟁사의 대체 가능성을 함께 봅니다.', nextCheck: '납기·반복 주문·고객 집중', sourceIds: ['smci-sec-2025-10k'], detailSurface: 'financials', moatEvidence: ['모듈형 설계', '랙 단위 통합', '빠른 제품 전환'], weakeningRisks: ['GPU 공급 의존', '가격 경쟁', '고객 집중과 내재화'] },
    financialHealth: { key: 'financialHealth', state: 'belowAverage', position: 2, statusLabel: '운전자본 부담 확대', evidenceMetricId: 'smci-fy2026-q3-free-cash-flow', comparison: { kind: 'ownHistory', label: '자체 과거 재고·매입채무·현금흐름' }, interpretation: 'FY2026 3분기 잉여현금흐름은 -66.96억달러였습니다. 주문 확대가 재고와 매입채무를 거쳐 현금으로 회수되는 속도를 확인해야 합니다.', nextCheck: '재고·매입채무·영업현금흐름', sourceIds: ['smci-sec-2026-q3-10q'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '공시 배수만 확인', evidenceMetricId: 'smci-fy2025-per-2026-07-22', comparison: { kind: 'ownHistory', label: '검증 가능한 자체 과거 범위 없음' }, interpretation: '7월 22일 종가와 FY2025 희석 EPS 기준 PER은 18.19배지만 검증 모형과 자체 과거 범위가 없어 오각형 위치를 부여하지 않습니다.', nextCheck: '정상화 마진·희석 후 주당 지표', sourceIds: ['smci-sec-2025-10k', 'smci-yahoo-price-2026-07-22'], detailSurface: 'financials' },
  },
};

export default config;
