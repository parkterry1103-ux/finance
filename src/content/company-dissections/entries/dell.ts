import { classificationSources } from '../classification.js';
import type { CompanyDissectionConfig } from '../types.js';

const config: CompanyDissectionConfig = {
  companySlug: 'dell',
  industryProfile: {
    primaryIndustry: 'IT 하드웨어·인프라',
    classificationSources: classificationSources({
      gicsSector: 'Information Technology', gicsIndustry: 'Technology Hardware, Storage & Peripherals',
      icbSector: 'Technology', icbIndustry: 'Computer Services',
      marketProvider: 'NYSE Company Profile', marketSector: 'Technology', marketIndustry: 'Computer Hardware',
      marketUrl: 'https://www.nyse.com/quote/XNYS:DELL',
    }),
    businessSegments: [
      { id: 'isg', label: 'Infrastructure Solutions Group', revenueShareAvailable: true },
      { id: 'csg', label: 'Client Solutions Group', revenueShareAvailable: true },
    ],
  },
  axes: {
    growth: { key: 'growth', state: 'aboveAverage', position: 4, statusLabel: 'AI 주문·매출 확대', evidenceMetricId: 'dell-fy2027-q1-ai-orders', comparison: { kind: 'segmentPeer', label: 'AI 서버 segment 주문→매출 전환' }, interpretation: '큰 AI 서버 주문이 확인됐지만 성장의 질은 출하·취소·매출 전환으로 판단합니다.', nextCheck: '주문 전환율과 기말 수주잔고', sourceIds: ['dell-fy2027-q1-results'], detailSurface: 'financials' },
    profitability: { key: 'profitability', state: 'insufficientData', position: null, statusLabel: 'AI 서버 마진 미분리', evidenceMetricId: 'dell-fy2027-q1-ai-revenue', comparison: { kind: 'segmentPeer', label: '동일 정의 AI 서버 마진 필요' }, interpretation: '매출 규모가 커도 하드웨어 마진과 서비스 구성을 확인해야 합니다.', nextCheck: 'ISG·AI 서버 영업이익률', sourceIds: ['dell-fy2027-q1-results'], detailSurface: 'financials' },
    moat: { key: 'moat', state: 'middle', position: 3, statusLabel: '통합·유통 기반 확인', evidenceText: '서버·스토리지 통합', comparison: { kind: 'officialEvidence', label: '공식 제품·고객 공급 기반' }, interpretation: '조달·통합·기업 고객 관계가 강점이지만 부품 공급자와 가격 경쟁의 영향을 받습니다.', nextCheck: '서비스 비중·반복 매출·고객 유지', sourceIds: ['dell-fy2027-q1-results'], detailSurface: 'financials', moatEvidence: ['기업 고객 유통망', '서버·스토리지 통합', '서비스 역량'], weakeningRisks: ['낮은 하드웨어 마진', '부품 의존', '가격 경쟁'] },
    financialHealth: { key: 'financialHealth', state: 'insufficientData', position: null, statusLabel: '운전자본 확인 필요', evidenceText: '동일 기간 FCF 미수집', comparison: { kind: 'ownHistory', label: '자체 과거 현금 전환 우선' }, interpretation: '큰 주문 대응에 필요한 재고·매출채권과 현금흐름을 함께 봐야 합니다.', nextCheck: '운전자본·영업현금흐름·부채', sourceIds: ['dell-technologies-delivers-fourth-quarter-and-full-year-fiscal-2026-results'], detailSurface: 'financials' },
    valuation: { key: 'valuation', state: 'insufficientData', position: null, statusLabel: '공개 모형 미지원', evidenceText: '검증 모형 없음', comparison: { kind: 'ownHistory', label: '자체 과거와 제한적 하드웨어 peer' }, interpretation: '서버 성장만을 전체 회사 peer 배수로 단정하지 않습니다.', nextCheck: 'segment 수익성과 자체 과거 배수', sourceIds: ['dell-fy2027-q1-results'], detailSurface: 'financials' },
  },
};

export default config;
