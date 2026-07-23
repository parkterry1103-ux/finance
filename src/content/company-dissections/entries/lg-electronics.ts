import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const config: CompanyDissectionConfig = {
  companySlug: 'lg-electronics',
  industryProfile: {
    primaryIndustry: '가전·HVAC 솔루션',
    classificationSources: classificationSources({
      gicsSector: '경기소비재', gicsIndustry: '가정용 내구재',
      icbSector: 'Consumer Discretionary', icbIndustry: 'Consumer Electronics',
      marketProvider: 'KRX 정보데이터시스템', marketSector: '전기·전자', marketIndustry: '가전·전자제품',
      marketUrl: 'https://data.krx.co.kr/',
    }),
    businessSegments: [
      { id: 'hs', label: 'Home Appliance Solution', revenueShareAvailable: true },
      { id: 'ms', label: 'Media Entertainment Solution', revenueShareAvailable: true },
      { id: 'vs', label: 'Vehicle Solution', revenueShareAvailable: true },
      { id: 'es', label: 'Eco Solution·HVAC', revenueShareAvailable: true },
    ],
    classificationNote: '대표 업종은 가전 분류 다수결을 따르되 데이터센터 해부는 공식 Eco Solution·HVAC 사업을 별도 분석합니다.',
  },
  axes: {
    growth: { key: 'growth', state: 'insufficientData', position: null, statusLabel: '협약 이후 매출 확인 필요', evidenceMetricId: 'lge-wanju-project-capacity', comparison: { kind: 'segmentPeer', label: 'HVAC segment 실적·peer 비교 전 단계' }, interpretation: '20MW 협약은 수요 신호지만 계약·납품·매출이 아니므로 성장 위치를 정하지 않습니다.', nextCheck: '본계약·설치·HVAC 매출 인식', sourceIds: ['lge-story-newsroom-235685-63746d17'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'insufficientData', position: null, statusLabel: 'HVAC 마진 미분리', evidenceText: '자료 미수집', comparison: { kind: 'segmentPeer', label: '동일 정의 HVAC 마진 필요' }, interpretation: '복합기업 전체 마진을 데이터센터 냉각 수익성으로 대신하지 않습니다.', nextCheck: 'Eco Solution 매출·영업이익률', sourceIds: ['lge-story-newsroom-235685-63746d17'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'middle', position: 3, statusLabel: '제품·서비스 기반 확인', evidenceText: 'HVAC·칠러 포트폴리오', comparison: { kind: 'officialEvidence', label: '공식 제품·프로젝트 근거' }, interpretation: 'HVAC 포트폴리오와 설치 역량은 근거지만 데이터센터 반복 수주가 지속성을 확인합니다.', nextCheck: '후속 수주·서비스 매출·고객 확대', sourceIds: ['lge-story-newsroom-235685-63746d17'], detailSurface: 'financials', moatEvidence: ['HVAC 제품군', '가전·설비 서비스망', '프로젝트 통합 역량'], weakeningRisks: ['본계약 미전환', '가격 경쟁', '사업부 실적 비가시성'] },
    financialHealth: { key: 'financialHealth', state: 'insufficientData', position: null, statusLabel: '사업부 현금흐름 미분리', evidenceText: '자료 미수집', comparison: { kind: 'ownHistory', label: '자체 과거 현금흐름 우선' }, interpretation: 'HVAC 투자와 현금회수 기간을 구분한 자료가 부족합니다.', nextCheck: '사업부 CAPEX·운전자본·현금 유입', sourceIds: ['lge-story-newsroom-235685-63746d17'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '복합기업 모형 미지원', evidenceText: '검증 모형 없음', comparison: { kind: 'ownHistory', label: '복합기업 자체 과거 우선' }, interpretation: '가전·전장·HVAC를 하나의 냉각 peer 배수로 비교하지 않습니다.', nextCheck: 'segment 가치와 연결 기준 검증', sourceIds: ['lge-story-newsroom-235685-63746d17'], detailSurface: 'financials' },
  },
};

export default config;
