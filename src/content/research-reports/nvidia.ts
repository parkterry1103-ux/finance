import assumptionsJson from '../../../artifacts/phase-4a-valuation/nvidia/assumptions.json' with { type: 'json' };
import reverseJson from '../../../artifacts/phase-4a-valuation/nvidia/reverse-dcf.json' with { type: 'json' };
import sourcesJson from '../../../artifacts/phase-4a-valuation/nvidia/sources.json' with { type: 'json' };
import valuationJson from '../../../artifacts/phase-4a-valuation/nvidia/valuation-result.json' with { type: 'json' };
import { buildResearchReport } from './build-report.js';
import type { ResearchReportArtifactSet, ResearchReportCompanyConfig } from './types.js';

const config: ResearchReportCompanyConfig = {
  slug: 'nvidia',
  companyName: '엔비디아',
  englishName: 'NVIDIA Corporation',
  ticker: 'NVDA',
  industry: 'AI 가속 컴퓨팅·반도체',
  reportTitle: 'AI 인프라 성장과 장기 초과수익 가정의 지속성',
  conclusion: '데이터센터 중심의 높은 성장과 현금창출력이 핵심이지만, 현재 가격이 요구하는 성장 경로와 장기 수익성 유지 여부를 함께 확인해야 합니다.',
  watchStatement: '다음 분기에는 데이터센터 성장률, 공급 제약 완화, 영업이익률과 운전자본의 동행 여부를 우선 확인합니다.',
  executiveSummary: {
    strengths: [
      { title: '플랫폼 범위', body: '가속기·네트워킹·시스템·소프트웨어를 함께 공급합니다.', evidenceIds: ['nvidia-q1-platform-fact'] },
      { title: '현금창출 기반', body: '최근 연간 영업이익과 영업현금흐름이 함께 확대됐습니다.', evidenceIds: ['nvidia-historical-calculation'] },
    ],
    risks: [
      { title: '높은 장기 가정', body: '계속가치는 장기 자본수익률 유지 여부에 민감합니다.', evidenceIds: ['nvidia-dcf-calculation', 'nvidia-roic-fade-calculation'] },
      { title: '인프라·규제 제약', body: '전력·냉각·공급과 수출 규제가 실제 인도 경로에 영향을 줄 수 있습니다.', evidenceIds: ['nvidia-macro-fact'] },
    ],
    nextChecks: [
      { title: '핵심 사업 성장', body: '데이터센터 매출 성장률과 신제품 전환을 확인합니다.', evidenceIds: ['nvidia-q1-results-fact'] },
      { title: '마진과 현금', body: '영업이익률·운전자본·설비투자의 동행을 확인합니다.', evidenceIds: ['nvidia-historical-calculation'] },
    ],
  },
  business: [
    {
      title: '가속기와 네트워킹을 묶은 데이터센터 플랫폼',
      body: 'GPU만이 아니라 네트워킹·시스템·소프트웨어를 함께 공급하는 구조가 고객의 AI 인프라 투자에서 차지하는 범위를 넓힙니다.',
      evidenceIds: ['nvidia-q1-platform-fact', 'nvidia-business-interpretation'],
    },
    {
      title: '경쟁의 초점은 칩 한 개보다 전체 시스템 효율',
      body: '대체 가속기, 고객 자체 칩, 전력·냉각 제약은 성능뿐 아니라 총소유비용과 공급 속도를 함께 비교하게 만듭니다.',
      evidenceIds: ['nvidia-q1-platform-fact', 'nvidia-macro-fact'],
    },
  ],
  earnings: [
    {
      title: 'FY2027 1분기 데이터센터가 성장의 중심',
      body: '공식 발표 기준 분기 매출은 816억 달러, 데이터센터 매출은 752억 달러였고 데이터센터 매출은 전년 동기 대비 92% 증가했습니다.',
      evidenceIds: ['nvidia-q1-results-fact'],
    },
    {
      title: '과거 이익률 급상승의 지속 가능성이 핵심 변수',
      body: '연간 매출과 영업이익의 확대는 분명하지만, 모델은 높은 정상 영업이익률을 사용하므로 제품 전환 비용과 공급 구성이 중요합니다.',
      evidenceIds: ['nvidia-historical-calculation', 'nvidia-model-interpretation'],
    },
  ],
  financial: [
    {
      title: '현금창출과 재투자 요구를 함께 점검',
      body: '영업현금흐름이 확대됐지만 고성장 과정의 운전자본과 설비·공급 투자 가정이 FCFF에 직접 영향을 줍니다.',
      evidenceIds: ['nvidia-historical-calculation', 'nvidia-dcf-calculation'],
    },
    {
      title: '장기 ROIC 가정은 계속가치의 핵심',
      body: '기준 조건은 장기 ROIC 40%를 사용합니다. 경쟁 심화로 이 수치가 자본비용에 가까워질 때의 진단을 별도로 제시합니다.',
      evidenceIds: ['nvidia-dcf-calculation', 'nvidia-roic-fade-calculation'],
    },
  ],
  industryClaims: [
    {
      title: 'AI 인프라 투자와 전력 제약을 같이 봐야 함',
      body: '컴퓨팅 수요가 커져도 데이터센터 전력·냉각·네트워크 조달이 지연되면 실제 시스템 인도와 사용 시점이 달라질 수 있습니다.',
      evidenceIds: ['nvidia-macro-fact', 'nvidia-business-interpretation'],
    },
    {
      title: '장기금리는 현금흐름의 할인율 경로',
      body: '장기금리 변화는 WACC를 통해 먼 미래 현금흐름의 현재가치에 영향을 주므로 성장률만 분리해 보지 않습니다.',
      evidenceIds: ['nvidia-rate-fact', 'nvidia-scenario-calculation'],
    },
  ],
  outlook: [
    {
      title: '확인 계기',
      body: '신제품 램프업, 네트워킹 결합 판매, 공급 확대가 매출 성장과 현금흐름으로 이어지는지 확인합니다.',
      evidenceIds: ['nvidia-q1-platform-fact', 'nvidia-business-interpretation'],
    },
    {
      title: '주요 위험',
      body: '고객 투자 속도 둔화, 자체 가속기 확대, 수출 규제, 전력 인프라 지연, 높은 장기 수익성 가정의 훼손이 핵심 점검 항목입니다.',
      evidenceIds: ['nvidia-macro-fact', 'nvidia-model-interpretation'],
    },
  ],
  glossary: [
    {
      term: 'FCFF', english: 'Free Cash Flow to Firm',
      definition: '채권자와 주주에게 귀속되기 전 사업 전체가 창출한 잉여현금흐름입니다.',
      easyExplanation: '영업으로 번 현금에서 사업 유지와 성장에 필요한 투자를 뺀 금액입니다.',
      relevance: 'NVIDIA의 성장 과정에서 운전자본과 공급·설비 투자가 현금으로 얼마나 전환되는지 보여줍니다.',
    },
    {
      term: 'WACC', english: 'Weighted Average Cost of Capital',
      definition: '자기자본비용과 세후부채비용을 자본구조 비중으로 가중한 할인율입니다.',
      easyExplanation: '미래 현금을 오늘의 가치로 바꿀 때 적용하는 사업 전체의 요구수익률입니다.',
      relevance: 'AI 인프라 성장의 먼 미래 현금흐름을 현재가치로 환산하는 기준입니다.',
    },
    {
      term: 'ROIC', english: 'Return on Invested Capital',
      definition: '영업에 투입된 자본이 세후 영업이익을 만들어 내는 효율을 나타냅니다.',
      easyExplanation: '사업에 넣은 돈 1원이 얼마나 효율적으로 이익을 만드는지 보는 지표입니다.',
      relevance: '높은 장기 ROIC가 유지되는지가 NVIDIA 계속가치의 핵심 가정입니다.',
    },
    {
      term: 'Terminal Value', english: 'Terminal Value',
      definition: '명시적 전망기간 이후의 현금흐름을 하나의 현재가치로 환산한 계속가치입니다.',
      easyExplanation: '상세 예측이 끝난 뒤에도 사업이 이어진다고 보고 계산한 장기 가치입니다.',
      relevance: '장기 성장률과 자본수익률 가정에 결과가 얼마나 의존하는지 확인하게 합니다.',
    },
    {
      term: '역산 DCF', english: 'Reverse Discounted Cash Flow',
      definition: '관측 가격에 맞도록 하나의 핵심 사업 가정을 역으로 푸는 진단입니다.',
      easyExplanation: '현재 가격이 성립하려면 모형 안에서 어떤 성장 경로가 필요한지 거꾸로 계산합니다.',
      relevance: 'NVIDIA의 관측 가격과 기준 조건 사이의 매출 성장 가정 차이를 비교합니다.',
    },
  ],
  officialSources: [
    {
      id: 'nvidia-fy2027-q1-results', title: 'NVIDIA Announces Financial Results for First Quarter Fiscal 2027',
      publisher: 'NVIDIA', url: 'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027', publishedAt: '2026-05-20',
    },
    {
      id: 'fred-series-dgs10', title: 'DGS10 · 미국 국채 10년물 시장수익률',
      publisher: 'FRED', url: 'https://fred.stlouisfed.org/series/DGS10', publishedAt: '2026-07-14',
    },
    {
      id: 'iea-energy-and-ai-2025', title: 'Energy and AI', publisher: 'IEA',
      url: 'https://www.iea.org/reports/energy-and-ai', publishedAt: '2025-04-10',
    },
  ],
  factEvidence: [
    {
      id: 'nvidia-q1-results-fact', type: 'fact',
      statement: 'FY2027 1분기 매출 816억 달러, 데이터센터 매출 752억 달러, 데이터센터 전년 동기 대비 성장률 92%.',
      sourceIds: ['nvidia-fy2027-q1-results'], metricIds: ['quarterlyRevenue', 'dataCenterRevenue', 'dataCenterYoY'], asOf: '2026-04-26',
    },
    {
      id: 'nvidia-q1-platform-fact', type: 'fact',
      statement: 'NVIDIA는 FY2027 1분기 실적에서 가속 컴퓨팅과 네트워킹을 포함한 데이터센터 실적을 공식 발표했습니다.',
      sourceIds: ['nvidia-fy2027-q1-results'], metricIds: ['dataCenterRevenue'], asOf: '2026-04-26',
    },
    {
      id: 'nvidia-rate-fact', type: 'fact', statement: '모형의 무위험수익률 기준일은 2026년 7월 14일입니다.',
      sourceIds: ['fred-series-dgs10'], metricIds: ['riskFreeRate'], asOf: '2026-07-14',
    },
    {
      id: 'nvidia-macro-fact', type: 'fact', statement: 'IEA는 AI와 데이터센터 전력 수요의 연결을 별도 보고서에서 다룹니다.',
      sourceIds: ['iea-energy-and-ai-2025'], metricIds: ['dataCenterElectricityDemand'], asOf: '2025-04-10',
    },
  ],
};

const artifacts = {
  assumptions: assumptionsJson,
  valuation: valuationJson,
  reverse: reverseJson,
  sources: sourcesJson,
} as unknown as ResearchReportArtifactSet;

export default buildResearchReport(config, artifacts);
