import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const config: CompanyDissectionConfig = {
  companySlug: 'nvidia',
  industryProfile: {
    primaryIndustry: '반도체·가속 컴퓨팅',
    classificationSources: classificationSources({
      gicsSector: 'Information Technology', gicsIndustry: 'Semiconductors',
      icbSector: 'Technology', icbIndustry: 'Semiconductors',
      marketProvider: 'Nasdaq Company Profile', marketSector: 'Technology', marketIndustry: 'Semiconductors',
      marketUrl: 'https://www.nasdaq.com/market-activity/stocks/nvda',
    }),
    businessSegments: [
      { id: 'compute-networking', label: 'Compute & Networking', revenueShareAvailable: true },
      { id: 'graphics', label: 'Graphics', revenueShareAvailable: true },
    ],
  },
  axes: {
    growth: { key: 'growth', state: 'high', position: 5, statusLabel: '데이터센터 성장 확인', evidenceMetricId: 'nvda-fy2027-q1-datacenter-growth', comparison: { kind: 'ownHistory', label: '전년 동기 대비 자체 성장' }, interpretation: '같은 사업의 전년 동기 대비 성장률이 높지만 다음 제품 전환에서 지속성을 다시 확인해야 합니다.', nextCheck: '차기 분기 데이터센터 성장과 출하 일정', sourceIds: ['nvidia-fy2027-q1-results'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'insufficientData', position: null, statusLabel: '동일 기준 마진 확인 필요', evidenceMetricId: 'nvda-fy2027-q1-datacenter-revenue', comparison: { kind: 'ownHistory', label: '같은 기간 마진 추세 부족' }, interpretation: '매출 규모를 수익성으로 대신하지 않고 공식 마진 추세를 별도로 확인합니다.', nextCheck: '제품 전환 비용과 영업이익률', sourceIds: ['nvidia-fy2027-q1-results'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'high', position: 5, statusLabel: '플랫폼 생태계 근거 확인', evidenceText: 'GPU·네트워킹·소프트웨어', comparison: { kind: 'officialEvidence', label: '공식 플랫폼·개발자 생태계 근거' }, interpretation: '하드웨어와 소프트웨어를 함께 제공하는 생태계가 전환비용과 규모의 경제를 만듭니다.', nextCheck: '고객 자체 가속기·대체 소프트웨어 확산', sourceIds: ['nvidia-fy2027-q1-results'], detailSurface: 'report', moatEvidence: ['가속 컴퓨팅 플랫폼', '개발자 생태계', '네트워킹 결합'], weakeningRisks: ['대체 가속기', '고객 내재화', '수출 규제'] },
    financialHealth: { key: 'financialHealth', state: 'insufficientData', position: null, statusLabel: '동일 기간 FCF 확인 필요', evidenceText: '자료 미수집', comparison: { kind: 'ownHistory', label: '자체 과거 현금흐름 우선' }, interpretation: '매출 성장과 같은 기간의 FCF·재투자 부담을 함께 확인할 데이터가 현재 요약에는 없습니다.', nextCheck: '영업현금흐름·CAPEX·순현금', sourceIds: ['nvidia-fy2027-q1-results'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'aboveAverage', position: 4, statusLabel: '시장 기대가 높은 구간', evidenceText: '검증된 DCF·Reverse DCF 제공', comparison: { kind: 'ownHistory', label: '시장가격과 시점형 모형 범위' }, interpretation: '시장가격이 요구하는 성장과 수익성은 별도 Valuation에서 모형 버전·민감도와 함께 확인합니다.', nextCheck: '실제 성장·마진이 내재 기대에 가까워지는지', sourceIds: ['nvidia-fy2027-q1-results'], detailSurface: 'valuation' },
  },
};

export default config;
