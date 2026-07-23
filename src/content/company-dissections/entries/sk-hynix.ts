import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const config: CompanyDissectionConfig = {
  companySlug: 'sk-hynix',
  industryProfile: {
    primaryIndustry: '메모리 반도체',
    classificationSources: classificationSources({
      gicsSector: '정보기술', gicsIndustry: '반도체',
      icbSector: 'Technology', icbIndustry: 'Semiconductors',
      marketProvider: 'KRX 정보데이터시스템', marketSector: '전기·전자', marketIndustry: '반도체·메모리',
      marketUrl: 'https://data.krx.co.kr/',
    }),
    businessSegments: [
      { id: 'dram', label: 'DRAM·HBM', revenueShareAvailable: true },
      { id: 'nand', label: 'NAND·SSD', revenueShareAvailable: true },
      { id: 'other', label: 'CIS·기타', revenueShareAvailable: false },
    ],
    classificationNote: '거래소의 전기·전자 분류보다 공식 사업보고서의 메모리 제품 구성을 분석 기준으로 우선합니다.',
  },
  axes: {
    growth: { key: 'growth', state: 'insufficientData', position: null, statusLabel: '동일 기준 성장률 확인 필요', evidenceMetricId: 'skh-q1-2026-revenue', comparison: { kind: 'ownHistory', label: '같은 분기 자체 과거 데이터 부족' }, interpretation: '분기 매출은 확인됐지만 같은 정의의 전년 동기 성장률을 현재 핵심 데이터에서 확인할 수 없습니다.', nextCheck: 'HBM 출하와 전체 매출의 전년 동기 변화', sourceIds: ['sk-hynix-q1-2026-results'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'insufficientData', position: null, statusLabel: '마진 비교 확인 필요', evidenceMetricId: 'skh-q1-2026-operating-income', comparison: { kind: 'ownHistory', label: '동일 기간 영업이익률 추세 부족' }, interpretation: '영업이익 금액만으로 수익성 수준을 정하지 않고 동일 기간 마진 추세를 기다립니다.', nextCheck: '제품 구성과 영업이익률의 전년 동기 변화', sourceIds: ['sk-hynix-q1-2026-results'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'aboveAverage', position: 4, statusLabel: 'HBM 기술·양산 근거 확인', evidenceText: 'HBM4 개발·양산 준비', comparison: { kind: 'officialEvidence', label: '공식 제품·생산 근거' }, interpretation: 'HBM 개발과 양산 준비는 구조적 경쟁력 근거지만 고객 인증과 수율이 지속성을 결정합니다.', nextCheck: 'HBM4 고객 인증·수율·실제 출하', sourceIds: ['sk-hynix-hbm4-production-2025'], detailSurface: 'financials', moatEvidence: ['HBM 제품 개발', '메모리 양산 기반', '고객 인증 축적'], weakeningRisks: ['수율 지연', '고객 인증 지연', '범용 메모리 가격 하락'] },
    financialHealth: { key: 'financialHealth', state: 'insufficientData', position: null, statusLabel: '투자 후 현금 확인 부족', evidenceText: '동일 기간 FCF 미수집', comparison: { kind: 'ownHistory', label: '자체 과거 현금흐름 우선' }, interpretation: '큰 설비투자 이후 현금창출력을 같은 기간으로 비교할 데이터가 부족합니다.', nextCheck: '영업현금흐름·CAPEX·순현금 변화', sourceIds: ['sk-hynix-q1-2026-results'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '공개 모형 미지원', evidenceText: '검증 모형 없음', comparison: { kind: 'ownHistory', label: '동일 정의 자체 과거 멀티플 부족' }, interpretation: '외부 배수만으로 구조적 밸류에이션 위치를 정하지 않습니다.', nextCheck: '공개 가능한 기업별 가치평가 가정 검증', sourceIds: ['sk-hynix-q1-2026-results'], detailSurface: 'financials' },
  },
};

export default config;
