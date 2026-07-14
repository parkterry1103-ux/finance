import type { IndustryFlowEntry } from './types.js';

export const industryFlows: IndustryFlowEntry[] = [
  {
    id: 'us-semiconductors',
    title: 'AI 반도체·서버',
    summary: 'AI 서비스 수요가 계산용 칩, 메모리, 서버와 실제 데이터센터 운영으로 이어지는 과정을 다섯 단계로 봅니다.',
    category: 'semiconductor-ai',
    steps: [
      {
        id: 'ai-demand', type: 'demand', title: 'AI 서비스와 클라우드 투자가 수요를 만듭니다',
        description: 'AI 사용이 늘면 클라우드 사업자의 서버·데이터센터 투자가 함께 커질 수 있습니다.',
        companyIds: ['meta-platforms'],
      },
      {
        id: 'ai-requirements', type: 'requirements', title: '계산 성능과 고속 메모리가 필요합니다',
        description: 'GPU·가속기뿐 아니라 대량의 데이터를 빠르게 전달할 HBM과 DRAM이 필요합니다.',
        companyIds: ['ai-datacenter-sk-hynix', 'ai-datacenter-micron'],
      },
      {
        id: 'ai-suppliers', type: 'suppliers', title: '전문 기업이 칩과 시스템을 공급합니다',
        description: '칩 설계, 메모리, 제조와 서버 기업의 역할을 구분해 확인합니다.',
        companyIds: ['us-semiconductors-nvidia'],
      },
      {
        id: 'ai-use-cases', type: 'use-cases', title: 'AI 서버와 데이터센터에 사용됩니다',
        description: '칩과 부품은 서버로 조립되고 데이터센터에서 실제 AI 서비스를 처리합니다.',
        companyIds: ['ai-datacenter-dell', 'ai-datacenter-supermicro'],
      },
      {
        id: 'ai-evidence', type: 'evidence', title: '출하·매출·현금흐름을 확인합니다',
        description: '수요 기대만 보지 않고 데이터센터 매출, HBM 출하, 주문과 현금흐름을 함께 확인합니다.',
      },
    ],
    demandSupplyIds: ['semiconductor-fab-infrastructure-demand-supply'],
    bottleneckIds: ['hbm-advanced-packaging', 'data-center-power-cooling'],
    reportIds: ['nvidia-fy2027-q1', 'micron-fy2026-q3', 'semi-300mm-memory-2026'],
    sourceRefs: ['nvidia-fy2027-q1-results', 'micron-fy2026-q3-results', 'semi-memory-fab-outlook-q2-2026'],
    reviewedAt: '2026-07-14',
  },
  {
    id: 'datacenter-power-cooling',
    title: '데이터센터 전력·냉각',
    summary: 'AI 서버 증설이 전력 인입, 배전, 냉각 설비와 운영 안정성 수요로 이어지는 과정을 봅니다.',
    category: 'power-datacenter',
    steps: [
      {
        id: 'power-demand', type: 'demand', title: '고밀도 서버 증설이 수요를 만듭니다',
        description: '서버 밀도가 높아질수록 데이터센터가 쓰는 전력과 처리해야 하는 열이 늘어납니다.',
      },
      {
        id: 'power-requirements', type: 'requirements', title: '안정적인 전력과 냉각이 필요합니다',
        description: 'UPS, 배전, 전력 관리, 칠러와 HVAC가 데이터센터 운영을 받칩니다.',
      },
      {
        id: 'power-suppliers', type: 'suppliers', title: '전력·냉각 기업이 설비를 공급합니다',
        description: '배전·전력관리와 HVAC·액체냉각 기업을 역할별로 나눠 봅니다.',
        companyIds: ['ai-datacenter-eaton', 'datacenter-power-lg-electronics'],
      },
      {
        id: 'power-use-cases', type: 'use-cases', title: '서버실과 데이터센터 운영에 사용됩니다',
        description: '설비는 전력 경로, 서버실 냉각과 운영 자동화에 설치됩니다.',
      },
      {
        id: 'power-evidence', type: 'evidence', title: '수주·납품·매출을 확인합니다',
        description: '투자 계획이 실제 수주잔고, 납품 일정, 매출과 현금흐름으로 바뀌는지 확인합니다.',
      },
    ],
    demandSupplyIds: ['data-center-power-cooling-demand-supply'],
    bottleneckIds: ['grid-transformers-high-voltage', 'data-center-power-cooling'],
    reportIds: ['iea-energy-and-ai-2025', 'iea-electricity-2026', 'eaton-q1-2026'],
    sourceRefs: ['iea-energy-and-ai-2025', 'iea-electricity-2026', 'eaton-q1-2026-results'],
    reviewedAt: '2026-07-14',
  },
  {
    id: 'reconstruction-infrastructure',
    title: '재건·인프라',
    summary: '복구 계획과 재원이 실제 발주, 시공·장비·소재 수요와 실적으로 이어지는 순서를 봅니다.',
    category: 'construction-infrastructure',
    steps: [
      {
        id: 'reconstruction-demand', type: 'demand', title: '복구 계획과 재원이 수요를 만듭니다',
        description: '정부·국제기구의 복구 계획, 예산과 프로젝트 발주가 실제 수요의 출발점입니다.',
      },
      {
        id: 'reconstruction-requirements', type: 'requirements', title: '설계·시공·장비·소재가 필요합니다',
        description: '프로젝트가 발주되면 EPC 역량, 건설장비와 인프라 소재를 조달해야 합니다.',
      },
      {
        id: 'reconstruction-suppliers', type: 'suppliers', title: '건설·장비·소재 기업이 공급합니다',
        description: '건설사와 장비·소재 기업을 같은 역할로 묶지 않고 공급 단계별로 구분합니다.',
      },
      {
        id: 'reconstruction-use-cases', type: 'use-cases', title: '교통·주거·산업시설 복구에 사용됩니다',
        description: '공사 역량과 장비·소재는 도로, 항만, 주택, 전력과 산업시설 복구에 투입됩니다.',
      },
      {
        id: 'reconstruction-evidence', type: 'evidence', title: '발주·계약·착공을 확인합니다',
        description: '정책 기대를 실제 수혜로 단정하지 않고 공식 발주, 수주 공시와 매출 인식을 확인합니다.',
      },
    ],
    demandSupplyIds: ['copper-grid-metals-demand-supply'],
    bottleneckIds: ['copper-grid-metals'],
    reportIds: ['world-bank-infrastructure-foundations-2026', 'molit-work-plan-2026', 'us-census-construction-spending-may-2026'],
    sourceRefs: ['world-bank-infrastructure-foundations-2026', 'molit-work-plan-2026', 'us-census-construction-spending-may-2026'],
    reviewedAt: '2026-07-14',
  },
  {
    id: 'semiconductor-cluster-infrastructure',
    title: '반도체 클러스터·산업단지',
    summary: '반도체 생산능력 투자가 부지, 전력, 기초 공사와 공장 인프라로 이어지는 과정을 봅니다.',
    category: 'industrial-facilities',
    steps: [
      {
        id: 'cluster-demand', type: 'demand', title: '공장 투자와 생산능력 확대가 수요를 만듭니다',
        description: '정책 발표만이 아니라 기업의 공장 투자 계획과 생산능력 확대 필요를 함께 봅니다.',
      },
      {
        id: 'cluster-requirements', type: 'requirements', title: '부지·전력·기초·건축 설비가 필요합니다',
        description: '착공 전에는 부지와 전력 계획이, 착공 뒤에는 기초·EPC·전력설비와 소재가 필요합니다.',
      },
      {
        id: 'cluster-suppliers', type: 'suppliers', title: '기초·건설·전력·소재 기업이 공급합니다',
        description: '각 기업은 공장 건설 과정의 역할로 분류하며 특정 단지의 계약사로 단정하지 않습니다.',
      },
      {
        id: 'cluster-use-cases', type: 'use-cases', title: '산업단지와 반도체 공장에 사용됩니다',
        description: '공사·설비·소재는 산업단지 기반시설, 팹 건물과 전력 공급 계통에 투입됩니다.',
      },
      {
        id: 'cluster-evidence', type: 'evidence', title: '예산·착공·계약과 실적을 확인합니다',
        description: '계획이 실제 사업으로 바뀌는지 예산, 인허가, 발주, 계약과 매출 인식 순서로 확인합니다.',
      },
    ],
    demandSupplyIds: ['grid-equipment-demand-supply'],
    bottleneckIds: ['semiconductor-fab-infrastructure', 'grid-transformers-high-voltage'],
    reportIds: ['semi-300mm-memory-2026', 'iea-electricity-2026'],
    sourceRefs: ['semi-memory-fab-outlook-q2-2026', 'iea-electricity-2026'],
    reviewedAt: '2026-07-14',
  },
];
