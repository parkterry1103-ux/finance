import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const config: CompanyDissectionConfig = {
  companySlug: 'netflix',
  industryProfile: {
    primaryIndustry: '스트리밍 엔터테인먼트',
    classificationSources: classificationSources({
      gicsSector: 'Communication Services', gicsIndustry: 'Movies & Entertainment',
      icbSector: 'Consumer Discretionary', icbIndustry: 'Entertainment',
      marketProvider: 'Nasdaq Company Profile', marketSector: 'Consumer Discretionary', marketIndustry: 'Movies & Entertainment',
      marketUrl: 'https://www.nasdaq.com/market-activity/stocks/nflx',
    }),
    businessSegments: [
      { id: 'streaming', label: '단일 스트리밍 운영 segment', revenueShareAvailable: true },
      { id: 'subscription', label: '구독 요금제', revenueShareAvailable: false },
      { id: 'advertising', label: '광고 수익화', revenueShareAvailable: false },
    ],
    classificationNote: '시장 분류는 Communication Services와 Consumer Discretionary로 갈리지만 공식 공시는 단일 운영 segment를 사용합니다.',
  },
  axes: {
    growth: { key: 'growth', state: 'aboveAverage', position: 4, statusLabel: '두 자릿수 성장 유지', evidenceMetricId: 'nflx-q2-2026-revenue-growth', comparison: { kind: 'ownHistory', label: '전년 동기 대비 자체 성장' }, interpretation: '2분기 두 자릿수 성장은 유지됐지만 다음 분기 회사 전망은 성장 속도 둔화를 가리킵니다.', nextCheck: '3분기 실제 매출과 가이던스', sourceIds: ['netflix-q2-2026-10q', 'netflix-q2-2026-letter'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'aboveAverage', position: 4, statusLabel: '높은 마진·소폭 하락', evidenceMetricId: 'nflx-q2-2026-operating-margin', comparison: { kind: 'ownHistory', label: '전년 동기 대비 -0.7%p' }, interpretation: '영업이익률 수준은 높지만 전년 동기보다 낮아져 콘텐츠·광고 투자 영향을 확인해야 합니다.', nextCheck: '3분기 영업이익률과 콘텐츠 비용', sourceIds: ['netflix-q2-2026-10q'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'aboveAverage', position: 4, statusLabel: '글로벌 규모·추천 기반', evidenceText: '글로벌 콘텐츠·추천 생태계', comparison: { kind: 'officialEvidence', label: '공식 사업·참여도 근거' }, interpretation: '글로벌 유통과 추천 데이터·브랜드가 규모의 경제를 만들지만 참여도 공개 축소는 검증 가시성을 낮춥니다.', nextCheck: '시청시간·이탈·가격 수용력·광고 성장', sourceIds: ['netflix-q2-2026-letter'], detailSurface: 'stockDissection', moatEvidence: ['글로벌 유통 규모', '추천 데이터', '콘텐츠 브랜드'], weakeningRisks: ['경쟁 심화', '참여도 둔화', '정보 가시성 축소'] },
    financialHealth: { key: 'financialHealth', state: 'middle', position: 3, statusLabel: 'FCF 양수·전년 감소', evidenceMetricId: 'nflx-q2-2026-free-cash-flow', comparison: { kind: 'ownHistory', label: '전년 동기 대비 -32.7%' }, interpretation: 'FCF는 양수지만 전년 동기보다 감소해 현금세와 콘텐츠 투자 영향을 분리해 봅니다.', nextCheck: '연간 FCF 전망과 콘텐츠 현금지출', sourceIds: ['netflix-q2-2026-10q', 'netflix-q2-2026-letter'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '자체 공개 모형 미지원', evidenceText: '외부 배수 검산만 제공', comparison: { kind: 'ownHistory', label: '동일 정의 자체 과거 배수 부족' }, interpretation: '외부 TTM 배수와 최근 회계연도 배수의 정의가 달라 단일 위치로 합치지 않습니다.', nextCheck: '동일 분모·동일 기준일 멀티플과 모형 검증', sourceIds: ['netflix-q2-2026-10q'], detailSurface: 'financials' },
  },
};

export default config;
