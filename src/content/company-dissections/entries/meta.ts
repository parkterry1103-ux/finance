import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const config: CompanyDissectionConfig = {
  companySlug: 'meta',
  industryProfile: {
    primaryIndustry: '인터랙티브 미디어·디지털 광고',
    classificationSources: classificationSources({
      gicsSector: 'Communication Services', gicsIndustry: 'Interactive Media & Services',
      icbSector: 'Technology', icbIndustry: 'Consumer Digital Services',
      marketProvider: 'Nasdaq Company Profile', marketSector: 'Technology', marketIndustry: 'Internet Content & Information',
      marketUrl: 'https://www.nasdaq.com/market-activity/stocks/meta',
    }),
    businessSegments: [
      { id: 'family-of-apps', label: 'Family of Apps', revenueShareAvailable: true },
      { id: 'reality-labs', label: 'Reality Labs', revenueShareAvailable: true },
    ],
    classificationNote: '시장 분류가 Communication Services와 Technology로 갈리므로 공식 FoA·Reality Labs segment를 분석 기준으로 우선합니다.',
  },
  axes: {
    growth: { key: 'growth', state: 'insufficientData', position: null, statusLabel: '광고 성장 지표 미수집', evidenceText: '자료 미수집', comparison: { kind: 'segmentPeer', label: 'FoA 광고·참여 지표 필요' }, interpretation: 'CAPEX 확대를 매출 성장으로 대신하지 않고 광고 단가·노출·사용자 참여를 확인합니다.', nextCheck: '광고 매출·단가·노출 성장', sourceIds: ['meta-q1-2026-results'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'insufficientData', position: null, statusLabel: '동일 기간 마진 필요', evidenceText: '자료 미수집', comparison: { kind: 'segmentPeer', label: 'FoA와 Reality Labs 분리' }, interpretation: '광고 사업 이익과 Reality Labs 투자를 분리한 추세가 필요합니다.', nextCheck: 'FoA 영업이익률과 Reality Labs 손실', sourceIds: ['meta-q1-2026-results'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'high', position: 5, statusLabel: '네트워크·데이터 근거 확인', evidenceText: '대규모 서비스·광고 생태계', comparison: { kind: 'officialEvidence', label: '공식 사용자·광고 사업 구조' }, interpretation: '사용자 네트워크와 광고 데이터·도구가 규모의 경제를 만들지만 규제와 이용 행태 변화가 약화 요인입니다.', nextCheck: '사용자 참여·광고 효율·규제 변화', sourceIds: ['meta-q1-2026-results'], detailSurface: 'report', moatEvidence: ['사용자 네트워크', '광고주 생태계', '추천·광고 데이터'], weakeningRisks: ['규제', '플랫폼 전환', '광고 효율 둔화'] },
    financialHealth: { key: 'financialHealth', state: 'middle', position: 3, statusLabel: '투자·채권 부담 점검', evidenceMetricId: 'meta-2025-senior-notes', comparison: { kind: 'ownHistory', label: '자체 과거 순현금·현금흐름 우선' }, interpretation: '장기 채권과 CAPEX 확대를 영업현금흐름·순현금 변화와 함께 봅니다.', nextCheck: 'CAPEX 집행·FCF·이자비용', sourceIds: ['meta-2025-senior-notes-8k', 'meta-q1-2026-results'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'aboveAverage', position: 4, statusLabel: '시장 기대가 높은 구간', evidenceText: '검증된 DCF·Reverse DCF 제공', comparison: { kind: 'ownHistory', label: '시장가격과 시점형 모형 범위' }, interpretation: 'AI 투자와 광고 성장 기대가 현재 가격에 얼마나 반영됐는지 별도 Valuation에서 확인합니다.', nextCheck: '광고 성장·CAPEX·마진의 내재 기대 충족', sourceIds: ['meta-q1-2026-results'], detailSurface: 'valuation' },
  },
};

export default config;
