import { companyEventStageLabels } from '../company-events/selectors.js';
import {
  macroBriefByDomain,
  macroBriefTrendLabels,
  macroIndicatorById,
} from '../macro/selectors.js';
import { sourceRegistry } from '../sources/registry.js';
import { companyProfiles } from './entries.js';
import type {
  CompanyAssessment,
  CompanyDashboardConfig,
  CompanyDashboardModel,
  CompanyMacroVariable,
  CompanyResearchProfileViewModel,
  DashboardChart,
  DashboardMetric,
} from './types.js';

type DashboardInput = Omit<CompanyResearchProfileViewModel, 'dashboard'>;

function metric(input: DashboardMetric): DashboardMetric {
  return input;
}

const dashboardMetricsBySlug: Record<string, DashboardMetric[]> = {
  'sk-hynix': [
    metric({
      id: 'skh-q1-2026-revenue',
      label: '매출',
      value: 52.5763,
      formattedValue: '52조 5,763억원',
      unit: '조원',
      currency: 'KRW',
      period: '2026년 1분기',
      periodType: 'quarterly',
      description: '제품 판매가 실제 실적으로 인식된 분기 매출입니다.',
      sourceIds: ['sk-hynix-q1-2026-results'],
      updatedAt: '2026-04-23',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'skh-q1-2026-operating-income',
      label: '영업이익',
      value: 37.6103,
      formattedValue: '37조 6,103억원',
      unit: '조원',
      currency: 'KRW',
      period: '2026년 1분기',
      periodType: 'quarterly',
      description: '본업에서 남긴 이익입니다. 전년 비교와 현금흐름은 별도 확인이 필요합니다.',
      sourceIds: ['sk-hynix-q1-2026-results'],
      updatedAt: '2026-04-23',
      qualityStatus: 'ok',
    }),
  ],
  'lg-electronics': [
    metric({
      id: 'lge-wanju-project-capacity',
      label: '완주 AI 데이터센터 계획 규모',
      shortLabel: '프로젝트 규모',
      value: 20,
      formattedValue: '20MW급',
      unit: 'MW',
      period: '2026년 3월 협약 기준',
      periodType: 'pointInTime',
      description: 'MOU에 제시된 프로젝트 규모이며 계약 매출이나 설치 완료 실적은 아닙니다.',
      sourceIds: ['lge-story-newsroom-235685-63746d17'],
      updatedAt: '2026-03-04',
      qualityStatus: 'ok',
    }),
  ],
  nvidia: [
    metric({
      id: 'nvda-fy2027-q1-revenue',
      label: '분기 매출',
      value: 81.6,
      formattedValue: '$81.6B',
      unit: '십억 달러',
      currency: 'USD',
      period: 'Q1 FY2027',
      periodType: 'quarterly',
      description: 'FY2027 1분기에 인식한 전체 매출입니다.',
      sourceIds: ['nvidia-fy2027-q1-results'],
      updatedAt: '2026-04-26',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'nvda-fy2027-q1-datacenter-revenue',
      label: '데이터센터 매출',
      value: 75.2,
      formattedValue: '$75.2B',
      unit: '십억 달러',
      currency: 'USD',
      period: 'Q1 FY2027',
      periodType: 'quarterly',
      description: 'AI 가속기와 데이터센터 플랫폼 수요가 반영된 사업 매출입니다.',
      sourceIds: ['nvidia-fy2027-q1-results'],
      updatedAt: '2026-04-26',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'nvda-fy2027-q1-datacenter-growth',
      label: '데이터센터 매출 성장률',
      value: 92,
      formattedValue: '+92%',
      unit: '%',
      period: 'Q1 FY2027',
      periodType: 'quarterly',
      comparison: { label: '전년 동기 대비', value: 92, formattedValue: '+92%', direction: 'up' },
      description: '같은 회계 분기의 전년 대비 데이터센터 매출 변화입니다.',
      sourceIds: ['nvidia-fy2027-q1-results'],
      updatedAt: '2026-04-26',
      qualityStatus: 'ok',
    }),
  ],
  micron: [
    metric({
      id: 'mu-fy2026-q3-revenue',
      label: '분기 매출',
      value: 41.46,
      formattedValue: '$41.46B',
      unit: '십억 달러',
      currency: 'USD',
      period: 'Q3 FY2026',
      periodType: 'quarterly',
      description: 'HBM과 범용 메모리를 포함해 분기에 인식한 매출입니다.',
      sourceIds: ['micron-fy2026-q3-results'],
      updatedAt: '2026-06-24',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'mu-fy2026-q3-operating-cash-flow',
      label: '영업현금흐름',
      value: 25.39,
      formattedValue: '$25.39B',
      unit: '십억 달러',
      currency: 'USD',
      period: 'Q3 FY2026',
      periodType: 'quarterly',
      description: '영업활동으로 들어온 현금입니다. CAPEX를 차감한 FCF와는 다릅니다.',
      sourceIds: ['micron-fy2026-q3-results'],
      updatedAt: '2026-06-24',
      qualityStatus: 'ok',
    }),
  ],
  dell: [
    metric({
      id: 'dell-fy2027-q1-ai-orders',
      label: 'AI 서버 주문',
      value: 24.4,
      formattedValue: '$24.4B',
      unit: '십억 달러',
      currency: 'USD',
      period: 'Q1 FY2027',
      periodType: 'quarterly',
      description: '해당 분기에 확보했다고 발표한 AI 서버 주문입니다. 아직 모두 매출은 아닙니다.',
      sourceIds: ['dell-fy2027-q1-results'],
      updatedAt: '2026-05-28',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'dell-fy2027-q1-ai-revenue',
      label: 'AI 서버 매출',
      value: 16.1,
      formattedValue: '$16.1B',
      unit: '십억 달러',
      currency: 'USD',
      period: 'Q1 FY2027',
      periodType: 'quarterly',
      description: 'AI 서버 주문 중 실제로 출하되어 매출로 인식된 금액입니다.',
      sourceIds: ['dell-fy2027-q1-results'],
      updatedAt: '2026-05-28',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'dell-fy2027-ai-revenue-guidance',
      label: 'AI 서버 연간 매출 전망',
      value: 60,
      formattedValue: '$60B',
      unit: '십억 달러',
      currency: 'USD',
      period: 'FY2027 전망',
      periodType: 'annual',
      description: '회사 전망치이며 실제 연간 매출 확정값이 아닙니다.',
      sourceIds: ['dell-fy2027-q1-results'],
      updatedAt: '2026-05-28',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'dell-fy2026-revenue',
      label: '연간 매출',
      value: 113.5,
      formattedValue: '$113.5B',
      unit: '십억 달러',
      currency: 'USD',
      period: 'FY2026',
      periodType: 'annual',
      description: 'FY2026 전체 회사 매출입니다.',
      sourceIds: ['dell-technologies-delivers-fourth-quarter-and-full-year-fiscal-2026-results'],
      updatedAt: '2026-02-26',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'dell-fy2026-ai-backlog',
      label: 'AI 서버 기말 수주잔고',
      value: 43,
      formattedValue: '$43B',
      unit: '십억 달러',
      currency: 'USD',
      period: 'FY2026 기말',
      periodType: 'pointInTime',
      description: '기말까지 매출로 인식되지 않고 남아 있던 AI 서버 주문입니다.',
      sourceIds: ['dell-technologies-delivers-fourth-quarter-and-full-year-fiscal-2026-results'],
      updatedAt: '2026-02-26',
      qualityStatus: 'ok',
    }),
  ],
  eaton: [
    metric({
      id: 'etn-q1-2026-revenue',
      label: '분기 매출',
      value: 7.5,
      formattedValue: '$7.5B',
      unit: '십억 달러',
      currency: 'USD',
      period: '2026년 1분기',
      periodType: 'quarterly',
      description: '2026년 1분기에 인식한 전체 매출입니다.',
      sourceIds: ['eaton-q1-2026-results'],
      updatedAt: '2026-04-30',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'etn-q1-2026-electrical-americas-revenue',
      label: 'Electrical Americas 매출',
      shortLabel: '미주 전기 매출',
      value: 3.6,
      formattedValue: '$3.6B',
      unit: '십억 달러',
      currency: 'USD',
      period: '2026년 1분기',
      periodType: 'quarterly',
      description: '북미 데이터센터·유틸리티·산업 투자에 노출된 전기 부문 매출입니다.',
      sourceIds: ['eaton-q1-2026-results'],
      updatedAt: '2026-04-30',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'etn-q1-2026-electrical-backlog-growth',
      label: 'Electrical 수주잔고 증가율',
      shortLabel: '수주잔고 증가율',
      value: 48,
      formattedValue: '+48%',
      unit: '%',
      period: '2026년 1분기',
      periodType: 'quarterly',
      comparison: { label: '전년 대비', value: 48, formattedValue: '+48%', direction: 'up' },
      description: '전기 부문에 쌓인 미인식 주문의 전년 대비 변화입니다.',
      sourceIds: ['eaton-q1-2026-results'],
      updatedAt: '2026-04-30',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'etn-q1-2026-orders-growth',
      label: 'Electrical Americas 주문 증가율',
      shortLabel: '미주 주문 증가율',
      value: 42,
      formattedValue: '+42%',
      unit: '%',
      period: '2026년 1분기 · 12개월 평균',
      periodType: 'pointInTime',
      comparison: { label: '전년 대비', value: 42, formattedValue: '+42%', direction: 'up' },
      description: 'Electrical Americas의 12개월 평균 주문이 전년 대비 변한 폭입니다.',
      sourceIds: ['eaton-q1-2026-results'],
      updatedAt: '2026-04-30',
      qualityStatus: 'ok',
    }),
  ],
  meta: [
    metric({
      id: 'meta-2026-capex-low',
      label: 'CAPEX 전망 하단',
      value: 125,
      formattedValue: '$125B',
      unit: '십억 달러',
      currency: 'USD',
      period: '2026년 전망',
      periodType: 'annual',
      comparison: { label: '기존 전망 하단', value: 115, formattedValue: '$115B', direction: 'up' },
      description: '상향된 연간 설비투자 전망의 하단입니다. 실제 집행액이 아닙니다.',
      sourceIds: ['meta-q1-2026-results'],
      updatedAt: '2026-04-29',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'meta-2026-capex-high',
      label: 'CAPEX 전망 상단',
      value: 145,
      formattedValue: '$145B',
      unit: '십억 달러',
      currency: 'USD',
      period: '2026년 전망',
      periodType: 'annual',
      comparison: { label: '기존 전망 상단', value: 135, formattedValue: '$135B', direction: 'up' },
      description: '상향된 연간 설비투자 전망의 상단입니다. 실제 집행액이 아닙니다.',
      sourceIds: ['meta-q1-2026-results'],
      updatedAt: '2026-04-29',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'meta-2025-senior-notes',
      label: '선순위 채권 발행액',
      value: 30,
      formattedValue: '$30B',
      unit: '십억 달러',
      currency: 'USD',
      period: '2025년 11월 발행 완료',
      periodType: 'pointInTime',
      description: '2030~2065년 만기로 나뉜 선순위 채권의 합계 발행액입니다.',
      sourceIds: ['meta-2025-senior-notes-8k'],
      updatedAt: '2025-11-03',
      qualityStatus: 'ok',
    }),
  ],
  supermicro: [
    metric({
      id: 'smci-2026-ai-orders',
      label: '최근 AI 서버 주문',
      value: 39,
      formattedValue: '약 $39B',
      unit: '십억 달러',
      currency: 'USD',
      period: '2026년 6월 발표 기준',
      periodType: 'pointInTime',
      description: '회사가 최근 받았다고 발표한 주문 규모이며 아직 모두 매출은 아닙니다.',
      sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'],
      updatedAt: '2026-06-11',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'smci-2026-potential-financing',
      label: '잠재 자금조달 규모',
      value: 7,
      formattedValue: '최대 $7B',
      unit: '십억 달러',
      currency: 'USD',
      period: '2026년 6월 조건 기준',
      periodType: 'pointInTime',
      description: '보통주·의무전환우선주·ATM을 합친 잠재 규모이며 실제 조달 완료액이 아닙니다.',
      sourceIds: ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243'],
      updatedAt: '2026-06-11',
      qualityStatus: 'ok',
    }),
  ],
  netflix: [
    metric({
      id: 'nflx-q2-2026-revenue-growth',
      label: '분기 매출 성장률',
      value: 13.4,
      formattedValue: '+13.4%',
      unit: '%',
      period: '2026년 2분기',
      periodType: 'quarterly',
      comparison: { label: '전년 동기 대비', value: 13.4, formattedValue: '+13.4%', direction: 'up' },
      description: '2025년 2분기와 비교한 매출 성장률입니다.',
      sourceIds: ['netflix-q2-2026-10q'],
      updatedAt: '2026-07-17',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'nflx-q2-2026-operating-margin',
      label: '영업이익률',
      value: 33.4,
      formattedValue: '33.4%',
      unit: '%',
      period: '2026년 2분기',
      periodType: 'quarterly',
      comparison: { label: '전년 동기 34.1%', value: -0.7, formattedValue: '-0.7%p', direction: 'down' },
      description: '매출 중 본업 이익으로 남은 비율로, 전년 동기보다 0.7%p 낮아졌습니다.',
      sourceIds: ['netflix-q2-2026-10q'],
      updatedAt: '2026-07-17',
      qualityStatus: 'ok',
    }),
    metric({
      id: 'nflx-q2-2026-free-cash-flow',
      label: '잉여현금흐름',
      value: 1.525,
      formattedValue: '$1.525B',
      unit: '십억 달러',
      currency: 'USD',
      period: '2026년 2분기',
      periodType: 'quarterly',
      comparison: { label: '전년 동기 $2.267B', value: -32.7, formattedValue: '-32.7%', direction: 'down' },
      description: '영업현금흐름에서 설비투자를 차감한 금액이며 높은 현금세 납부가 영향을 줬습니다.',
      sourceIds: ['netflix-q2-2026-10q', 'netflix-q2-2026-letter'],
      updatedAt: '2026-07-17',
      qualityStatus: 'ok',
    }),
  ],
};

const dashboardChartsBySlug: Record<string, DashboardChart[]> = {
  'sk-hynix': [{
    id: 'skh-q1-2026-performance',
    title: '분기 실적 규모',
    description: '같은 분기의 매출과 영업이익을 원문 통화 기준으로 비교합니다.',
    metricIds: ['skh-q1-2026-revenue', 'skh-q1-2026-operating-income'],
    unit: '조원',
    currency: 'KRW',
    period: '2026년 1분기',
    accessibleSummary: '매출 52조 5,763억원, 영업이익 37조 6,103억원입니다.',
  }],
  'lg-electronics': [],
  nvidia: [{
    id: 'nvda-fy2027-q1-revenue-mix',
    title: '전체 매출과 데이터센터 매출',
    description: '데이터센터 매출은 전체 매출에 포함되며 두 금액의 규모만 비교합니다.',
    metricIds: ['nvda-fy2027-q1-revenue', 'nvda-fy2027-q1-datacenter-revenue'],
    unit: '십억 달러',
    currency: 'USD',
    period: 'Q1 FY2027',
    accessibleSummary: '전체 매출 81.6십억 달러 중 데이터센터 매출은 75.2십억 달러입니다.',
  }],
  micron: [{
    id: 'mu-fy2026-q3-cash-conversion',
    title: '매출과 영업현금흐름',
    description: '같은 분기의 매출과 영업현금흐름을 비교합니다. FCF 비교는 아닙니다.',
    metricIds: ['mu-fy2026-q3-revenue', 'mu-fy2026-q3-operating-cash-flow'],
    unit: '십억 달러',
    currency: 'USD',
    period: 'Q3 FY2026',
    accessibleSummary: '매출 41.46십억 달러, 영업현금흐름 25.39십억 달러입니다.',
  }],
  dell: [{
    id: 'dell-fy2027-q1-orders-to-revenue',
    title: 'AI 서버 주문과 매출 인식',
    description: '같은 분기에 발표된 AI 서버 주문과 실제 매출 인식 규모를 비교합니다.',
    metricIds: ['dell-fy2027-q1-ai-orders', 'dell-fy2027-q1-ai-revenue'],
    unit: '십억 달러',
    currency: 'USD',
    period: 'Q1 FY2027',
    accessibleSummary: 'AI 서버 주문은 24.4십억 달러, AI 서버 매출은 16.1십억 달러입니다.',
  }],
  eaton: [{
    id: 'etn-q1-2026-revenue-mix',
    title: '전체 매출과 미주 전기 부문',
    description: 'Electrical Americas 매출은 전체 매출에 포함되며 규모만 비교합니다.',
    metricIds: ['etn-q1-2026-revenue', 'etn-q1-2026-electrical-americas-revenue'],
    unit: '십억 달러',
    currency: 'USD',
    period: '2026년 1분기',
    accessibleSummary: '전체 매출 7.5십억 달러 중 Electrical Americas 매출은 3.6십억 달러입니다.',
  }],
  meta: [{
    id: 'meta-2026-capex-range',
    title: '상향된 2026년 CAPEX 전망 범위',
    description: '전망 하단과 상단을 보여주며 실제 집행액과는 구분합니다.',
    metricIds: ['meta-2026-capex-low', 'meta-2026-capex-high'],
    unit: '십억 달러',
    currency: 'USD',
    period: '2026년 전망',
    accessibleSummary: '2026년 CAPEX 전망은 125십억 달러에서 145십억 달러 범위입니다.',
  }],
  supermicro: [],
  netflix: [],
};

function assessment(
  dimension: CompanyAssessment['dimension'],
  label: string,
  state: CompanyAssessment['state'],
  rationale: string,
  evidenceMetricIds: string[],
  sourceIds: string[],
): CompanyAssessment {
  return { dimension, label, state, rationale, evidenceMetricIds, sourceIds };
}

const assessmentsBySlug: Record<string, CompanyAssessment[]> = {
  'sk-hynix': [
    assessment('growth', '성장성', 'needsReview', '분기 매출과 HBM 생산 투자는 확인됐지만 같은 기준의 전년 성장률은 현재 데이터에 없습니다.', ['skh-q1-2026-revenue'], ['sk-hynix-q1-2026-results']),
    assessment('profitability', '수익성', 'needsReview', '영업이익 금액은 확인됐지만 비교 기간과 마진율을 함께 봐야 합니다.', ['skh-q1-2026-operating-income'], ['sk-hynix-q1-2026-results']),
    assessment('cashFlow', '현금창출력', 'insufficientData', '공식 영업현금흐름과 CAPEX를 같은 기간으로 비교할 데이터가 없습니다.', [], ['sk-hynix-q1-2026-results']),
    assessment('valuation', '밸류에이션', 'insufficientData', '검증된 PER·EV/EBITDA 또는 자체 과거 비교 데이터가 없습니다.', [], ['sk-hynix-q1-2026-results']),
  ],
  'lg-electronics': [
    assessment('growth', '성장성', 'needsReview', '20MW급 프로젝트 협약은 확인됐지만 본계약·매출 인식 전 단계입니다.', ['lge-wanju-project-capacity'], ['lge-story-newsroom-235685-63746d17']),
    assessment('profitability', '수익성', 'insufficientData', 'HVAC 사업의 매출과 영업이익률을 구분한 공식 수치가 없습니다.', [], ['lge-story-newsroom-235685-63746d17']),
    assessment('cashFlow', '현금창출력', 'insufficientData', '냉각 사업의 현금흐름과 CAPEX를 확인할 수 없습니다.', [], ['lge-story-newsroom-235685-63746d17']),
    assessment('valuation', '밸류에이션', 'insufficientData', '검증된 평가배수와 과거 비교 데이터가 없습니다.', [], ['lge-story-newsroom-235685-63746d17']),
  ],
  nvidia: [
    assessment('growth', '성장성', 'improving', '데이터센터 매출이 전년 동기 대비 92% 늘었다고 공식 발표했습니다.', ['nvda-fy2027-q1-datacenter-growth'], ['nvidia-fy2027-q1-results']),
    assessment('profitability', '수익성', 'needsReview', '데이터센터 매출 비중은 크지만 현재 registry에는 같은 기간의 마진 지표가 없습니다.', ['nvda-fy2027-q1-datacenter-revenue'], ['nvidia-fy2027-q1-results']),
    assessment('cashFlow', '현금창출력', 'insufficientData', '같은 기간의 영업현금흐름·CAPEX·FCF 데이터가 없습니다.', [], ['nvidia-fy2027-q1-results']),
    assessment('valuation', '밸류에이션', 'insufficientData', '검증된 평가배수와 자체 과거 평균 비교 데이터가 없습니다.', [], ['nvidia-fy2027-q1-results']),
  ],
  micron: [
    assessment('growth', '성장성', 'needsReview', '분기 매출은 확인됐지만 같은 기준의 전년 성장률은 현재 데이터에 없습니다.', ['mu-fy2026-q3-revenue'], ['micron-fy2026-q3-results']),
    assessment('cashFlow', '현금창출력', 'needsReview', '영업현금흐름은 확인됐지만 CAPEX와 FCF가 없어 투자 후 현금을 판단하기 어렵습니다.', ['mu-fy2026-q3-operating-cash-flow'], ['micron-fy2026-q3-results']),
    assessment('profitability', '수익성', 'insufficientData', '같은 기간의 매출총이익률과 영업이익률이 현재 registry에 없습니다.', [], ['micron-fy2026-q3-results']),
    assessment('valuation', '밸류에이션', 'insufficientData', '검증된 평가배수와 과거 비교 데이터가 없습니다.', [], ['micron-fy2026-q3-results']),
  ],
  dell: [
    assessment('growth', '성장성', 'needsReview', 'AI 서버 주문과 매출 인식은 확인됐지만 전년 동기 성장률과 취소율을 더 봐야 합니다.', ['dell-fy2027-q1-ai-orders', 'dell-fy2027-q1-ai-revenue'], ['dell-fy2027-q1-results']),
    assessment('profitability', '수익성', 'insufficientData', 'AI 서버 매출의 매출총이익률과 영업이익률이 없습니다.', [], ['dell-fy2027-q1-results']),
    assessment('cashFlow', '현금창출력', 'insufficientData', '주문·수주잔고와 같은 기간의 영업현금흐름·FCF를 연결할 수 없습니다.', [], ['dell-technologies-delivers-fourth-quarter-and-full-year-fiscal-2026-results']),
    assessment('valuation', '밸류에이션', 'insufficientData', '검증된 평가배수와 과거 비교 데이터가 없습니다.', [], ['dell-fy2027-q1-results']),
  ],
  eaton: [
    assessment('growth', '성장성', 'improving', 'Electrical 수주잔고와 미주 주문의 전년 대비 증가가 확인됐습니다.', ['etn-q1-2026-electrical-backlog-growth', 'etn-q1-2026-orders-growth'], ['eaton-q1-2026-results']),
    assessment('profitability', '수익성', 'needsReview', '분기 매출은 확인됐지만 같은 기간의 영업이익률과 현금 전환을 더 봐야 합니다.', ['etn-q1-2026-revenue'], ['eaton-q1-2026-results']),
    assessment('cashFlow', '현금창출력', 'insufficientData', '수주잔고와 같은 기간의 영업현금흐름·FCF 데이터가 없습니다.', [], ['eaton-q1-2026-results']),
    assessment('valuation', '밸류에이션', 'insufficientData', '검증된 평가배수와 과거 비교 데이터가 없습니다.', [], ['eaton-q1-2026-results']),
  ],
  meta: [
    assessment('growth', '성장성', 'insufficientData', '현재 연결된 공식 데이터에는 광고 매출 성장률과 사용자 지표가 없습니다.', [], ['meta-q1-2026-results']),
    assessment('cashFlow', '현금창출력', 'needsReview', 'CAPEX 전망이 상향됐지만 같은 기간의 영업현금흐름과 FCF가 없습니다.', ['meta-2026-capex-low', 'meta-2026-capex-high'], ['meta-q1-2026-results']),
    assessment('financialHealth', '재무건전성', 'needsReview', '장기 채권 발행은 확인됐지만 순현금·이자비용 변화와 함께 봐야 합니다.', ['meta-2025-senior-notes'], ['meta-2025-senior-notes-8k']),
    assessment('valuation', '밸류에이션', 'insufficientData', '검증된 평가배수와 자체 과거 비교 데이터가 없습니다.', [], ['meta-q1-2026-results']),
  ],
  supermicro: [
    assessment('growth', '성장성', 'needsReview', 'AI 서버 주문 규모는 확인됐지만 출하·매출 전환과 취소 여부를 더 봐야 합니다.', ['smci-2026-ai-orders'], ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243']),
    assessment('cashFlow', '현금창출력', 'needsReview', '주문 대응 자금조달 계획은 확인됐지만 운전자본과 영업현금흐름 수치는 없습니다.', ['smci-2026-potential-financing'], ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243']),
    assessment('financialHealth', '재무건전성', 'needsReview', '주식 관련 자금조달은 생산자금을 늘릴 수 있지만 실제 조달액과 주식 수 변화를 확인해야 합니다.', ['smci-2026-potential-financing'], ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243']),
    assessment('valuation', '밸류에이션', 'insufficientData', '검증된 평가배수와 과거 비교 데이터가 없습니다.', [], ['ir-supermicro-2026-supermicro-announces-pricing-of-equity-and-equity-lin-f33c9243']),
  ],
  netflix: [
    assessment('growth', '성장성', 'needsReview', '2분기 매출은 전년 동기 대비 13.4% 늘었지만 3분기 회사 성장 전망은 11.7%로 낮아졌습니다.', ['nflx-q2-2026-revenue-growth'], ['netflix-q2-2026-10q', 'netflix-q2-2026-letter']),
    assessment('profitability', '수익성', 'stable', '2분기 영업이익률 33.4%는 높은 수준이지만 전년 동기보다 0.7%p 낮았습니다.', ['nflx-q2-2026-operating-margin'], ['netflix-q2-2026-10q']),
    assessment('cashFlow', '현금창출력', 'needsReview', '2분기 잉여현금흐름은 15억2,500만달러로 전년 동기보다 감소했지만 회사는 연간 전망을 유지했습니다.', ['nflx-q2-2026-free-cash-flow'], ['netflix-q2-2026-10q', 'netflix-q2-2026-letter']),
    assessment('valuation', '밸류에이션', 'insufficientData', '외부 배수 검산은 제공하지만 검증된 자체 가치평가 모형은 아직 없습니다.', [], ['netflix-q2-2026-10q']),
  ],
};

export const companyDashboardConfigs: CompanyDashboardConfig[] = [
  { companySlug: 'sk-hynix', metricIds: ['skh-q1-2026-revenue', 'skh-q1-2026-operating-income'], chartIds: ['skh-q1-2026-performance'], macroVariableIds: ['us-treasury-10y', 'us-financial-conditions', 'us-industrial-production', 'us-manufacturing-utilization'] },
  { companySlug: 'lg-electronics', metricIds: ['lge-wanju-project-capacity'], chartIds: [], macroVariableIds: ['us-treasury-10y', 'us-financial-conditions', 'us-industrial-production', 'us-manufacturing-utilization'] },
  { companySlug: 'nvidia', metricIds: ['nvda-fy2027-q1-revenue', 'nvda-fy2027-q1-datacenter-revenue', 'nvda-fy2027-q1-datacenter-growth'], chartIds: ['nvda-fy2027-q1-revenue-mix'], macroVariableIds: ['us-treasury-10y', 'us-financial-conditions', 'us-m2-money-stock', 'us-industrial-production'] },
  { companySlug: 'micron', metricIds: ['mu-fy2026-q3-revenue', 'mu-fy2026-q3-operating-cash-flow'], chartIds: ['mu-fy2026-q3-cash-conversion'], macroVariableIds: ['us-treasury-10y', 'us-financial-conditions', 'us-industrial-production', 'us-manufacturing-utilization'] },
  { companySlug: 'dell', metricIds: ['dell-fy2027-q1-ai-orders', 'dell-fy2027-q1-ai-revenue', 'dell-fy2027-ai-revenue-guidance', 'dell-fy2026-revenue', 'dell-fy2026-ai-backlog'], chartIds: ['dell-fy2027-q1-orders-to-revenue'], macroVariableIds: ['us-treasury-10y', 'us-financial-conditions', 'us-m2-money-stock', 'us-industrial-production'] },
  { companySlug: 'eaton', metricIds: ['etn-q1-2026-revenue', 'etn-q1-2026-electrical-americas-revenue', 'etn-q1-2026-electrical-backlog-growth', 'etn-q1-2026-orders-growth'], chartIds: ['etn-q1-2026-revenue-mix'], macroVariableIds: ['us-treasury-10y', 'us-financial-conditions', 'us-m2-money-stock', 'us-industrial-production', 'us-manufacturing-utilization'] },
  { companySlug: 'meta', metricIds: ['meta-2026-capex-low', 'meta-2026-capex-high', 'meta-2025-senior-notes'], chartIds: ['meta-2026-capex-range'], macroVariableIds: ['us-treasury-10y', 'us-financial-conditions', 'us-m2-money-stock', 'us-industrial-production'] },
  { companySlug: 'supermicro', metricIds: ['smci-2026-ai-orders', 'smci-2026-potential-financing'], chartIds: [], macroVariableIds: ['us-treasury-10y', 'us-financial-conditions', 'us-m2-money-stock', 'us-industrial-production'] },
  { companySlug: 'netflix', metricIds: ['nflx-q2-2026-revenue-growth', 'nflx-q2-2026-operating-margin', 'nflx-q2-2026-free-cash-flow'], chartIds: [], macroVariableIds: ['us-treasury-10y', 'us-financial-conditions', 'us-m2-money-stock', 'us-industrial-production'] },
];

function macroCopy(viewModel: DashboardInput, variableId: string) {
  const role = viewModel.profile.primaryRole;
  if (variableId === 'us-treasury-10y') return {
    impactPath: ['미국 장기금리 변화', '자금조달 비용과 미래 현금흐름의 현재가치 변화', `${role} 투자와 평가 부담 재점검`],
    easyExplanation: '장기금리가 높아지면 고객 투자와 기업의 자금조달, 미래 이익 평가에 부담 요인이 될 수 있습니다.',
    nextCheck: '금리 방향과 회사·고객의 실제 투자 집행을 함께 확인합니다.',
  };
  if (variableId === 'us-financial-conditions') return {
    impactPath: ['금융여건 변화', '기업과 고객의 자금 접근성 변화', `${role} 주문·투자 집행 속도 변화 가능`],
    easyExplanation: '금융여건이 타이트해지면 계획된 주문과 설비투자가 늦어질 수 있지만 단일 지표만으로 확정할 수는 없습니다.',
    nextCheck: '주문·CAPEX와 금융여건의 방향이 실제로 함께 바뀌는지 봅니다.',
  };
  if (variableId === 'us-m2-money-stock') return {
    impactPath: ['광의 통화량 변화', '시장·기업 유동성 배경 변화', `${role} 수요와 조달 환경 재점검`],
    easyExplanation: 'M2 변화는 자금 환경의 배경이지만 회사 매출이나 주가를 직접 결정하지는 않습니다.',
    nextCheck: '금융여건과 실제 고객 지출을 함께 확인합니다.',
  };
  if (variableId === 'us-manufacturing-utilization') return {
    impactPath: ['미국 제조업 가동률 변화', '설비 활용도와 증설 필요성 변화', `${role} 수요·납기 변화 가능`],
    easyExplanation: '가동률이 높아져도 업종별 차이가 크므로 회사의 실제 주문과 생산능력을 따로 봐야 합니다.',
    nextCheck: '회사 수주·출하와 고객 산업의 가동률을 함께 봅니다.',
  };
  return {
    impactPath: ['미국 산업생산 변화', '서버·전력·설비 수요 환경 변화', `${role} 출하와 주문 변화 가능`],
    easyExplanation: '산업생산은 수요 배경을 보여주지만 개별 기업 실적과 같은 지표는 아닙니다.',
    nextCheck: '산업생산 방향이 회사 매출·주문에 실제로 반영되는지 확인합니다.',
  };
}

function buildMacroVariable(viewModel: DashboardInput, variableId: string): CompanyMacroVariable | undefined {
  const definition = macroIndicatorById(variableId);
  if (!definition) return undefined;
  const brief = macroBriefByDomain(definition.domain);
  if (!brief) return undefined;
  const copy = macroCopy(viewModel, variableId);
  return {
    id: definition.id,
    label: definition.label,
    currentDirection: brief.state,
    trendLabel: macroBriefTrendLabels[brief.trend],
    asOf: brief.asOf,
    impactPath: copy.impactPath,
    easyExplanation: copy.easyExplanation,
    nextCheck: copy.nextCheck,
    sourceIds: [...new Set([definition.sourceRef, ...brief.sourceRefs])],
  };
}

function selectedByIds<T extends { id: string }>(items: T[], ids: string[]) {
  return ids.flatMap((id) => {
    const item = items.find((candidate) => candidate.id === id);
    return item ? [item] : [];
  });
}

export function buildCompanyDashboardModel(viewModel: DashboardInput): CompanyDashboardModel {
  const { profile } = viewModel;
  const config = companyDashboardConfigs.find((item) => item.companySlug === profile.slug);
  const availableMetrics = dashboardMetricsBySlug[profile.slug] ?? [];
  const availableCharts = dashboardChartsBySlug[profile.slug] ?? [];
  const metrics = config ? selectedByIds(availableMetrics, config.metricIds) : [];
  const charts = config ? selectedByIds(availableCharts, config.chartIds) : [];
  const assessments = (assessmentsBySlug[profile.slug] ?? []).slice(0, 5);
  const importantChanges = viewModel.companyEvents.slice(0, 3).map((event) => ({
    id: event.id,
    title: event.title,
    eventDate: event.eventDate,
    stageLabel: companyEventStageLabels[event.stage],
    whatHappened: event.factualSummary,
    whyItMatters: event.whyItMatters,
    nextCheckpoints: event.nextCheckpoints,
    sourceIds: event.sourceRefs,
  }));
  const macroVariables = (config?.macroVariableIds ?? [])
    .map((id) => buildMacroVariable(viewModel, id))
    .filter((item): item is CompanyMacroVariable => Boolean(item))
    .slice(0, 5);
  const sourceIds = [...new Set([
    ...metrics.flatMap((item) => item.sourceIds),
    ...assessments.flatMap((item) => item.sourceIds),
    ...importantChanges.flatMap((item) => item.sourceIds),
    ...macroVariables.flatMap((item) => item.sourceIds),
    ...viewModel.reports.flatMap((item) => item.sourceRefs),
  ])];
  const sources = sourceIds.map((id) => sourceRegistry[id]).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const asOfCandidates = [
    profile.reviewedAt,
    ...metrics.map((item) => item.updatedAt),
    ...viewModel.companyEvents.map((item) => item.reviewedAt),
    ...macroVariables.map((item) => item.asOf),
  ].filter(Boolean).sort();
  const missingAreas = assessments
    .filter((item) => item.state === 'insufficientData')
    .map((item) => item.label);
  return {
    asOfDate: asOfCandidates[asOfCandidates.length - 1] ?? null,
    summary: [profile.searchDescription],
    assessments,
    metrics,
    charts,
    importantChanges,
    macroVariables,
    sources,
    dataQuality: {
      missingAreas,
      staleMetricIds: metrics.filter((item) => item.qualityStatus === 'stale').map((item) => item.id),
      hasRestatedData: metrics.some((item) => item.qualityStatus === 'restated'),
      hasInconsistentData: metrics.some((item) => item.qualityStatus === 'inconsistent'),
    },
  };
}

function hasDuplicates(values: string[]) {
  return new Set(values).size !== values.length;
}

export function validateCompanyDashboardRegistry() {
  const errors: string[] = [];
  const profileSlugs = new Set(companyProfiles.map((profile) => profile.slug));
  if (companyDashboardConfigs.length !== companyProfiles.length) errors.push('dashboard config count must match company profiles');
  if (hasDuplicates(companyDashboardConfigs.map((config) => config.companySlug))) errors.push('dashboard config slug duplicated');
  companyDashboardConfigs.forEach((config) => {
    const metrics = dashboardMetricsBySlug[config.companySlug] ?? [];
    const charts = dashboardChartsBySlug[config.companySlug] ?? [];
    const assessments = assessmentsBySlug[config.companySlug] ?? [];
    if (!profileSlugs.has(config.companySlug)) errors.push(`dashboard config profile missing: ${config.companySlug}`);
    if (config.metricIds.length > 6 || hasDuplicates(config.metricIds)) errors.push(`dashboard metric maximum or duplicate: ${config.companySlug}`);
    if (config.chartIds.length > 3 || hasDuplicates(config.chartIds)) errors.push(`dashboard chart maximum or duplicate: ${config.companySlug}`);
    if (config.macroVariableIds.length < 3 || config.macroVariableIds.length > 5 || hasDuplicates(config.macroVariableIds)) errors.push(`dashboard macro count or duplicate: ${config.companySlug}`);
    if (assessments.length > 5) errors.push(`dashboard assessment maximum: ${config.companySlug}`);
    config.metricIds.forEach((id) => { if (!metrics.some((item) => item.id === id)) errors.push(`dashboard metric missing: ${config.companySlug}/${id}`); });
    config.chartIds.forEach((id) => { if (!charts.some((item) => item.id === id)) errors.push(`dashboard chart missing: ${config.companySlug}/${id}`); });
    config.macroVariableIds.forEach((id) => { if (!macroIndicatorById(id)) errors.push(`dashboard macro missing: ${config.companySlug}/${id}`); });
    metrics.forEach((item) => {
      if (item.value !== null && !Number.isFinite(item.value)) errors.push(`dashboard metric non-finite: ${config.companySlug}/${item.id}`);
      if (!item.unit || !item.period || !item.sourceIds.length || !item.updatedAt) errors.push(`dashboard metric metadata missing: ${config.companySlug}/${item.id}`);
      if ((item.value === null) !== (item.formattedValue === null)) errors.push(`dashboard metric null mismatch: ${config.companySlug}/${item.id}`);
      item.sourceIds.forEach((id) => { if (!sourceRegistry[id]) errors.push(`dashboard metric source missing: ${config.companySlug}/${id}`); });
    });
    charts.forEach((chart) => {
      const chartMetrics = selectedByIds(metrics, chart.metricIds);
      if (chartMetrics.length !== chart.metricIds.length || hasDuplicates(chart.metricIds)) errors.push(`dashboard chart metric missing or duplicate: ${config.companySlug}/${chart.id}`);
      if (chartMetrics.some((item) => item.unit !== chart.unit || item.currency !== chart.currency || item.period !== chart.period)) errors.push(`dashboard chart unit, currency, or period mismatch: ${config.companySlug}/${chart.id}`);
    });
    assessments.forEach((item) => {
      if (!item.rationale.trim() || (!item.evidenceMetricIds.length && !item.sourceIds.length)) errors.push(`dashboard assessment evidence missing: ${config.companySlug}/${item.dimension}`);
      item.evidenceMetricIds.forEach((id) => { if (!metrics.some((candidate) => candidate.id === id)) errors.push(`dashboard assessment metric missing: ${config.companySlug}/${id}`); });
      item.sourceIds.forEach((id) => { if (!sourceRegistry[id]) errors.push(`dashboard assessment source missing: ${config.companySlug}/${id}`); });
    });
  });
  return errors;
}
