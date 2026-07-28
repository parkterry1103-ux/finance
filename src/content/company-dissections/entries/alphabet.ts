import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const sourceIds = ['alphabet-2026-q1-10q'];
const config: CompanyDissectionConfig = {
  companySlug: 'alphabet',
  industryProfile: {
    primaryIndustry: '인터랙티브 미디어·클라우드 플랫폼',
    classificationSources: classificationSources({
      gicsSector: '커뮤니케이션 서비스', gicsIndustry: '인터랙티브 미디어 및 서비스',
      icbSector: 'Technology', icbIndustry: 'Digital Consumer Services',
      marketProvider: 'NASDAQ', marketSector: 'Technology', marketIndustry: 'Internet Content & Information',
      marketUrl: 'https://www.nasdaq.com/market-activity/stocks/googl',
    }),
    businessSegments: [
      { id: 'google-services', label: 'Google Services', revenueShareAvailable: true },
      { id: 'google-cloud', label: 'Google Cloud', revenueShareAvailable: true },
      { id: 'other-bets', label: 'Other Bets', revenueShareAvailable: true },
    ],
    classificationNote: '대표 업종과 별개로 광고·Cloud 세그먼트를 나눠 판단합니다.',
  },
  axes: {
    growth: { key: 'growth', state: 'high', position: 5, statusLabel: 'Cloud 중심 성장 확대', evidenceMetricId: 'alphabet-q1-2026-cloud-growth', comparison: { kind: 'ownHistory', label: '최신 분기·전년 동기 비교' }, interpretation: 'Services와 Cloud가 함께 성장했습니다.', nextCheck: '다음 분기 Cloud 성장', sourceIds, detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'aboveAverage', position: 4, statusLabel: 'Cloud 마진 개선', evidenceText: 'Cloud 영업이익률 32.9%', comparison: { kind: 'ownHistory', label: '최신 분기·전년 동기 비교' }, interpretation: 'Cloud 규모 확대가 세그먼트 이익으로 이어졌습니다.', nextCheck: '감가상각 이후 마진', sourceIds, detailSurface: 'financials' },
    moat: { key: 'moat', state: 'insufficientData', position: null, statusLabel: '구조 분석 비노출', evidenceText: '완성 분석 없음', comparison: { kind: 'officialEvidence', label: '공식 사업 구조' }, interpretation: '이번 단계에서는 경쟁력 분석을 완료된 오각형으로 게시하지 않습니다.', nextCheck: '광고·Cloud 전환비용과 경쟁 자료', sourceIds, moatEvidence: ['광고 생태계', 'Cloud 계약 잔고'], weakeningRisks: ['AI 검색 경쟁', 'Cloud 경쟁'] },
    financialHealth: { key: 'financialHealth', state: 'aboveAverage', position: 4, statusLabel: '현금 여력 충분', evidenceText: '현금·시장성증권 $126.84B', comparison: { kind: 'ownHistory', label: '직전 연말 자체 비교' }, interpretation: '대규모 투자 후에도 현금성 자산이 충분합니다.', nextCheck: 'CAPEX 이후 잉여현금', sourceIds, detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '검증 모형 미지원', evidenceText: '공개 모형 없음', comparison: { kind: 'ownHistory', label: '동일 정의 비교 없음' }, interpretation: '외부 배수만으로 위치를 정하지 않습니다.', nextCheck: '검증된 가치평가 모델', sourceIds, detailSurface: 'financials' },
  },
};

export default config;
