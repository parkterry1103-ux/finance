import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const config: CompanyDissectionConfig = {
  companySlug: 'micron',
  industryProfile: {
    primaryIndustry: '메모리 반도체',
    classificationSources: classificationSources({
      gicsSector: 'Information Technology', gicsIndustry: 'Semiconductors',
      icbSector: 'Technology', icbIndustry: 'Semiconductors',
      marketProvider: 'Nasdaq Company Profile', marketSector: 'Technology', marketIndustry: 'Semiconductors',
      marketUrl: 'https://www.nasdaq.com/market-activity/stocks/mu',
    }),
    businessSegments: [
      { id: 'cloud-memory', label: 'Cloud Memory', revenueShareAvailable: true },
      { id: 'core-data-center', label: 'Core Data Center', revenueShareAvailable: true },
      { id: 'mobile-client', label: 'Mobile & Client', revenueShareAvailable: true },
      { id: 'automotive-embedded', label: 'Automotive & Embedded', revenueShareAvailable: true },
    ],
  },
  axes: {
    growth: { key: 'growth', state: 'insufficientData', position: null, statusLabel: '같은 기준 성장률 부족', evidenceMetricId: 'mu-fy2026-q3-revenue', comparison: { kind: 'ownHistory', label: '메모리 사이클 자체 추세 우선' }, interpretation: '분기 매출만으로 사이클 성장 위치를 정하지 않습니다.', nextCheck: 'HBM·범용 메모리별 전년 동기 성장', sourceIds: ['micron-fy2026-q3-results'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'insufficientData', position: null, statusLabel: '마진 추세 확인 필요', evidenceText: '자료 미수집', comparison: { kind: 'ownHistory', label: '동일 회계분기 자체 마진 추세' }, interpretation: '메모리 가격과 제품 구성이 마진에 미친 영향을 같은 기준으로 확인해야 합니다.', nextCheck: '매출총이익률·영업이익률', sourceIds: ['micron-fy2026-q3-results'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'aboveAverage', position: 4, statusLabel: '공정·메모리 포트폴리오', evidenceText: 'DRAM·NAND·HBM 생산', comparison: { kind: 'officialEvidence', label: '공식 제품·생산 기반' }, interpretation: '메모리 공정과 생산기반은 진입장벽이지만 가격 사이클과 선단 공정 수율이 지속성을 좌우합니다.', nextCheck: 'HBM 인증·수율·원가 경쟁력', sourceIds: ['micron-fy2026-q3-results'], detailSurface: 'financials', moatEvidence: ['메모리 공정 기술', '글로벌 생산기반', 'HBM 제품군'], weakeningRisks: ['가격 사이클', '수율 지연', 'CAPEX 부담'] },
    financialHealth: { key: 'financialHealth', state: 'middle', position: 3, statusLabel: '현금 유입은 확인', evidenceMetricId: 'mu-fy2026-q3-operating-cash-flow', comparison: { kind: 'ownHistory', label: 'CAPEX 차감 전 자체 현금흐름' }, interpretation: '영업현금흐름은 확인됐지만 FCF와 CAPEX를 함께 봐야 합니다.', nextCheck: 'CAPEX 차감 후 FCF와 순현금', sourceIds: ['micron-fy2026-q3-results'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '공개 모형 미지원', evidenceText: '검증 모형 없음', comparison: { kind: 'ownHistory', label: '사이클 자체 과거 멀티플 우선' }, interpretation: '이익 사이클의 위치가 다른 peer 단일 배수로 판단하지 않습니다.', nextCheck: '정상화 이익과 자체 과거 배수', sourceIds: ['micron-fy2026-q3-results'], detailSurface: 'financials' },
  },
};

export default config;
