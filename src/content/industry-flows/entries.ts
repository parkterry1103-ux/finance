import type { IndustryFlowEntry } from './types.js';

export const industryFlows: IndustryFlowEntry[] = [
  {
    id: 'us-semiconductors',
    title: 'AI 반도체·서버',
    summary: 'AI 서비스 수요가 계산용 칩, 메모리, 서버와 실제 데이터센터 운영으로 이어지는 과정을 다섯 단계로 봅니다.',
    category: 'semiconductor-ai',
    steps: [
      {
        id: 'ai-demand', type: 'demand', title: 'AI 서비스 수요',
        description: 'AI 서비스와 클라우드 투자가 늘면 서버와 데이터센터 수요도 함께 커질 수 있습니다.',
        companyIds: ['meta-platforms'],
      },
      {
        id: 'ai-requirements', type: 'requirements', title: 'GPU·고속 메모리',
        description: 'AI 계산에는 GPU와 HBM·DRAM 같은 고속 메모리가 필요합니다.',
        companyIds: ['ai-datacenter-sk-hynix', 'ai-datacenter-micron'],
      },
      {
        id: 'ai-suppliers', type: 'suppliers', title: '칩·서버 시스템 공급',
        description: '설계·메모리·서버 기업이 각 생산 단계에서 필요한 제품을 공급합니다.',
        companyIds: ['us-semiconductors-nvidia'],
      },
      {
        id: 'ai-use-cases', type: 'use-cases', title: 'AI 서버·데이터센터',
        description: '칩과 메모리는 서버로 조립되어 데이터센터의 AI 서비스를 처리합니다.',
        companyIds: ['ai-datacenter-dell', 'ai-datacenter-supermicro'],
      },
      {
        id: 'ai-evidence', type: 'evidence', title: '출하·매출 확인',
        description: '기대가 실제 수요로 이어지는지 출하, 주문, 매출과 현금흐름을 확인합니다.',
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
        id: 'power-demand', type: 'demand', title: '고밀도 서버 증설',
        description: '서버 밀도가 높아지면 데이터센터가 쓰는 전력과 처리해야 할 열도 늘어납니다.',
      },
      {
        id: 'power-requirements', type: 'requirements', title: '전력·냉각 설비',
        description: 'UPS와 배전, 전력 관리, 칠러와 HVAC가 안정적인 운영을 받칩니다.',
      },
      {
        id: 'power-suppliers', type: 'suppliers', title: '전력·냉각 장비 공급',
        description: '배전·전력 관리와 HVAC·액체냉각 기업을 역할별로 나눠 봅니다.',
        companyIds: ['ai-datacenter-eaton', 'datacenter-power-lg-electronics'],
      },
      {
        id: 'power-use-cases', type: 'use-cases', title: '서버실·데이터센터',
        description: '관련 설비는 전력 경로와 서버실 냉각, 운영 자동화에 사용됩니다.',
      },
      {
        id: 'power-evidence', type: 'evidence', title: '수주·납품 확인',
        description: '투자 계획이 수주잔고와 납품 일정, 매출로 이어지는지 확인합니다.',
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
        id: 'reconstruction-demand', type: 'demand', title: '복구 사업 발주',
        description: '정부와 국제기구의 복구 계획, 예산과 사업 발주가 수요의 출발점입니다.',
      },
      {
        id: 'reconstruction-requirements', type: 'requirements', title: '설계·장비·소재',
        description: '사업을 진행하려면 설계·시공 역량과 건설장비, 인프라 소재가 필요합니다.',
      },
      {
        id: 'reconstruction-suppliers', type: 'suppliers', title: '건설·장비·소재 공급',
        description: '건설사와 장비·소재 기업을 공급 단계와 역할에 따라 구분합니다.',
      },
      {
        id: 'reconstruction-use-cases', type: 'use-cases', title: '교통·주거·산업시설',
        description: '공사 역량과 장비·소재는 도로, 항만, 주택과 산업시설 복구에 사용됩니다.',
      },
      {
        id: 'reconstruction-evidence', type: 'evidence', title: '계약·착공 확인',
        description: '정책 기대를 확정 수혜로 보지 않고 공식 발주, 계약, 착공과 매출을 확인합니다.',
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
        id: 'cluster-demand', type: 'demand', title: '공장 투자 확대',
        description: '정책 발표와 함께 기업의 공장 투자 계획과 생산능력 확대 필요를 봅니다.',
      },
      {
        id: 'cluster-requirements', type: 'requirements', title: '부지·전력·건축',
        description: '착공 전에는 부지와 전력이, 착공 뒤에는 기초·건축·전력 설비가 필요합니다.',
      },
      {
        id: 'cluster-suppliers', type: 'suppliers', title: '건설·전력·소재 공급',
        description: '기업은 공장 건설 과정의 역할로 분류하며 특정 단지의 계약사로 단정하지 않습니다.',
      },
      {
        id: 'cluster-use-cases', type: 'use-cases', title: '산업단지·반도체 공장',
        description: '공사·설비·소재는 산업단지 기반시설과 팹 건물, 전력 계통에 사용됩니다.',
      },
      {
        id: 'cluster-evidence', type: 'evidence', title: '예산·발주·실적 확인',
        description: '계획이 실제 사업으로 바뀌는지 예산, 인허가, 발주와 매출 순서로 확인합니다.',
      },
    ],
    demandSupplyIds: ['grid-equipment-demand-supply'],
    bottleneckIds: ['semiconductor-fab-infrastructure', 'grid-transformers-high-voltage'],
    reportIds: ['semi-300mm-memory-2026', 'iea-electricity-2026'],
    sourceRefs: ['semi-memory-fab-outlook-q2-2026', 'iea-electricity-2026'],
    reviewedAt: '2026-07-14',
  },
];
