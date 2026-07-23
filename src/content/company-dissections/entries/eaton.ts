import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const config: CompanyDissectionConfig = {
  companySlug: 'eaton',
  industryProfile: {
    primaryIndustry: '전기 장비·전력관리',
    classificationSources: classificationSources({
      gicsSector: 'Industrials', gicsIndustry: 'Electrical Components & Equipment',
      icbSector: 'Industrials', icbIndustry: 'Electrical Components',
      marketProvider: 'NYSE Company Profile', marketSector: 'Industrials', marketIndustry: 'Specialty Industrial Machinery',
      marketUrl: 'https://www.nyse.com/quote/XNYS:ETN',
    }),
    businessSegments: [
      { id: 'electrical-americas', label: 'Electrical Americas', revenueShareAvailable: true },
      { id: 'electrical-global', label: 'Electrical Global', revenueShareAvailable: true },
      { id: 'aerospace', label: 'Aerospace', revenueShareAvailable: true },
      { id: 'vehicle-emobility', label: 'Vehicle·eMobility', revenueShareAvailable: true },
    ],
  },
  axes: {
    growth: { key: 'growth', state: 'high', position: 5, statusLabel: '전기 주문·수주잔고 증가', evidenceMetricId: 'etn-q1-2026-electrical-backlog-growth', comparison: { kind: 'segmentPeer', label: 'Electrical segment 전년 대비' }, interpretation: '전기 부문 주문과 수주잔고 증가가 확인됐으며 매출 전환이 다음 판단 기준입니다.', nextCheck: '수주잔고의 실제 매출 전환', sourceIds: ['eaton-q1-2026-results'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'insufficientData', position: null, statusLabel: '동일 기준 마진 필요', evidenceMetricId: 'etn-q1-2026-revenue', comparison: { kind: 'segmentPeer', label: 'Electrical Americas 마진 비교 부족' }, interpretation: '분기 매출만으로 가격 결정력과 수익성을 판단하지 않습니다.', nextCheck: 'Electrical Americas 영업이익률', sourceIds: ['eaton-q1-2026-results'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'aboveAverage', position: 4, statusLabel: '인증·설치 기반 확인', evidenceText: '배전·전력관리 포트폴리오', comparison: { kind: 'officialEvidence', label: '공식 제품·수주 기반' }, interpretation: '전력 장비의 인증·설치기반과 긴 교체주기가 전환비용을 만들 수 있습니다.', nextCheck: '리드타임·서비스 매출·점유율', sourceIds: ['eaton-q1-2026-results'], detailSurface: 'financials', moatEvidence: ['인증된 전력 장비', '설치기반', '서비스·교체 수요'], weakeningRisks: ['생산 병목', '가격 경쟁', '프로젝트 지연'] },
    financialHealth: { key: 'financialHealth', state: 'insufficientData', position: null, statusLabel: '현금 전환 확인 필요', evidenceText: '동일 기간 FCF 미수집', comparison: { kind: 'ownHistory', label: '자체 과거 현금흐름 우선' }, interpretation: '수주 증가가 재고와 CAPEX 부담 없이 현금으로 전환되는지 확인해야 합니다.', nextCheck: '영업현금흐름·운전자본·CAPEX', sourceIds: ['eaton-q1-2026-results'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '공개 모형 미지원', evidenceText: '검증 모형 없음', comparison: { kind: 'ownHistory', label: '자체 과거와 전기장비 peer 검증 필요' }, interpretation: '데이터센터 기대만으로 전체 회사 밸류에이션 위치를 정하지 않습니다.', nextCheck: 'segment 성장·마진과 동일 정의 배수', sourceIds: ['eaton-q1-2026-results'], detailSurface: 'financials' },
  },
};

export default config;
