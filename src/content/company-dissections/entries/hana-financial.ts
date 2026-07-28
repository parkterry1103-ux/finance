import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const sourceIds = ['hana-financial-1h26-presentation', 'hana-financial-1h26-databook'];
const config: CompanyDissectionConfig = {
  companySlug: 'hana-financial',
  industryProfile: {
    primaryIndustry: '금융지주·은행',
    classificationSources: classificationSources({
      gicsSector: '금융', gicsIndustry: '은행',
      icbSector: 'Financials', icbIndustry: 'Banks',
      marketProvider: 'KRX 정보데이터시스템', marketSector: '금융업', marketIndustry: '금융지주',
      marketUrl: 'https://data.krx.co.kr/',
    }),
    businessSegments: [
      { id: 'bank', label: '하나은행', revenueShareAvailable: true },
      { id: 'securities', label: '하나증권', revenueShareAvailable: true },
      { id: 'card-capital', label: '카드·캐피탈 등', revenueShareAvailable: true },
    ],
    classificationNote: '은행 중심 금융지주로 분류하고 자회사별 이익과 그룹 자본을 함께 봅니다.',
  },
  axes: {
    growth: { key: 'growth', state: 'aboveAverage', position: 4, statusLabel: '영업이익 성장', evidenceMetricId: 'hana-1h26-operating-income-growth', comparison: { kind: 'ownHistory', label: '전년 상반기 자체 비교' }, interpretation: '순이자와 비이자 이익이 함께 성장했습니다.', nextCheck: 'NIM과 수수료 이익', sourceIds, detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'middle', position: 3, statusLabel: '이익·위험비용 혼재', evidenceText: '지배주주 순이익 +4.4%', comparison: { kind: 'ownHistory', label: '전년 상반기 자체 비교' }, interpretation: '순이익은 늘었지만 대손비용도 증가했습니다.', nextCheck: '대손비용률', sourceIds, detailSurface: 'financials' },
    moat: { key: 'moat', state: 'insufficientData', position: null, statusLabel: '구조 분석 비노출', evidenceText: '완성 분석 없음', comparison: { kind: 'officialEvidence', label: '공식 사업 구조' }, interpretation: '이번 단계에서는 경쟁력 분석을 완료된 오각형으로 게시하지 않습니다.', nextCheck: '예금 기반과 고객 유지 자료', sourceIds, moatEvidence: ['예금 기반', '금융 자회사'], weakeningRisks: ['조달 경쟁', '신용비용 상승'] },
    financialHealth: { key: 'financialHealth', state: 'middle', position: 3, statusLabel: '자본 여력 유지', evidenceMetricId: 'hana-2q26-cet1-ratio', comparison: { kind: 'ownHistory', label: '전년 동기 자체 비교' }, interpretation: 'CET1은 13%대를 유지하지만 소폭 하락했습니다.', nextCheck: 'CET1과 위험가중자산', sourceIds, detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '검증 모형 미지원', evidenceText: '공개 모형 없음', comparison: { kind: 'ownHistory', label: '동일 정의 비교 없음' }, interpretation: '외부 PBR만으로 위치를 정하지 않습니다.', nextCheck: '검증된 가치평가 모델', sourceIds, detailSurface: 'financials' },
  },
};

export default config;
