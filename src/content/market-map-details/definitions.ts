import type {
  MarketMapCategory,
  MarketMapDefinition,
  MarketMapIndustryNodeKind,
  MarketMapRegion,
} from './types.js';

export const marketMapIndustryNodeOrder: MarketMapIndustryNodeKind[] = [
  'demand',
  'requirement',
  'supplier',
  'use',
  'verification',
];

export const marketMapNodeKindLabels: Record<MarketMapIndustryNodeKind | 'company', string> = {
  demand: '수요',
  requirement: '필요 요소',
  supplier: '공급 기업',
  use: '사용처',
  verification: '확인 항목',
  company: '기업',
};

export const marketMapIndustryQuestions: Record<MarketMapIndustryNodeKind, string> = {
  demand: '수요는 어디서 생기나요?',
  requirement: '무엇이 필요해지나요?',
  supplier: '어떤 기업이 공급하나요?',
  use: '어디에 사용되나요?',
  verification: '무엇을 확인해야 하나요?',
};

export const marketMapRegionLabels: Record<MarketMapRegion, string> = {
  'us-focused': '미국 중심',
  'kr-focused': '한국 중심',
  global: '글로벌',
};

export const marketMapCategoryLabels: Record<MarketMapCategory, string> = {
  'semiconductor-ai': '반도체·AI',
  'power-datacenter': '전력·데이터센터',
  'construction-infrastructure': '건설·재건·인프라',
  'industrial-facilities': '산업단지·설비',
};

export const marketMapDefinitions: MarketMapDefinition[] = [
  {
    id: 'us-semiconductors',
    route: '/ko/category/us-semiconductors',
    region: 'us-focused',
    category: 'semiconductor-ai',
    status: 'available',
    order: 1,
    title: 'AI 서버는 누가 만드는가',
    subtitle: 'GPU·메모리·파운드리·전력 인프라',
    description: 'AI 서비스 수요가 계산용 칩, HBM, 파운드리, 전력·냉각 인프라로 이어지는 구조를 살펴봅니다.',
    scopeLabel: '5단계 산업 흐름',
    industryStages: [
      {
        id: 'ai-demand',
        kind: 'demand',
        question: marketMapIndustryQuestions.demand,
        title: 'AI 서비스와 클라우드 투자가 수요를 만듭니다',
        description: '기업과 사용자가 AI 서비스를 더 많이 쓰면 클라우드 사업자의 서버·데이터센터 투자가 늘어납니다.',
        items: ['생성형 AI 사용', '클라우드 AI 워크로드', '데이터센터 CAPEX'],
        representativeCompanyIds: ['ai-datacenter-google', 'ai-datacenter-microsoft', 'ai-datacenter-amazon'],
      },
      {
        id: 'ai-requirement',
        kind: 'requirement',
        question: marketMapIndustryQuestions.requirement,
        title: '계산·메모리·생산·서버 인프라가 필요합니다',
        description: 'AI 계산용 GPU·ASIC, HBM, 첨단 파운드리, 서버·네트워크와 전력·냉각 설비가 함께 필요해집니다.',
        items: ['GPU·ASIC', 'HBM', '파운드리·장비', '서버·네트워크', '전력·냉각'],
        representativeCompanyIds: [],
      },
      {
        id: 'ai-supplier',
        kind: 'supplier',
        question: marketMapIndustryQuestions.supplier,
        title: '각 단계의 전문 기업이 공급합니다',
        description: '칩 설계, 메모리, 제조, 장비와 데이터센터 인프라 기업을 역할별로 구분해 봅니다.',
        items: ['칩 설계', '메모리', '파운드리', '장비·소재', '인프라'],
        representativeCompanyIds: ['us-semiconductors-nvidia', 'ai-datacenter-sk-hynix', 'ai-datacenter-tsmc', 'ai-datacenter-asml', 'ai-datacenter-vertiv'],
      },
      {
        id: 'ai-use',
        kind: 'use',
        question: marketMapIndustryQuestions.use,
        title: 'AI 데이터센터와 클라우드 서비스에 사용됩니다',
        description: '공급된 칩과 장비는 AI 서버에 조립되고 클라우드 데이터센터에서 실제 AI 서비스를 처리합니다.',
        items: ['AI 서버', '클라우드 데이터센터', '기업 AI 서비스', '고속 네트워크'],
        representativeCompanyIds: ['ai-datacenter-dell', 'ai-datacenter-supermicro', 'ai-datacenter-google', 'ai-datacenter-microsoft'],
      },
      {
        id: 'ai-verification',
        kind: 'verification',
        question: marketMapIndustryQuestions.verification,
        title: '투자가 출하·매출·현금흐름으로 이어지는지 확인합니다',
        description: '수요 기대만 보지 않고 데이터센터 매출, HBM 출하, 첨단 공정 가동률, 수주와 현금흐름을 함께 봅니다.',
        items: ['데이터센터 매출', 'HBM 출하·가격', '파운드리 가동률', '수주·백로그', '마진·현금흐름'],
        representativeCompanyIds: [],
      },
    ],
    companyNetwork: {
      companyIds: [
        'ai-datacenter-google', 'ai-datacenter-microsoft', 'ai-datacenter-amazon',
        'us-semiconductors-nvidia', 'ai-datacenter-amd', 'ai-datacenter-broadcom', 'ai-datacenter-marvell',
        'ai-datacenter-sk-hynix', 'ai-datacenter-samsung', 'ai-datacenter-micron',
        'ai-datacenter-tsmc', 'ai-datacenter-intel', 'ai-datacenter-asml',
        'ai-datacenter-hanmi', 'ai-datacenter-leeno', 'ai-datacenter-isc', 'ai-datacenter-wonikips', 'ai-datacenter-soulbrain',
        'ai-datacenter-dell', 'ai-datacenter-supermicro', 'ai-datacenter-arista',
        'ai-datacenter-vertiv', 'ai-datacenter-eaton', 'ai-datacenter-schneider',
      ],
    },
  },
  {
    id: 'datacenter-power-cooling',
    route: '/ko/category/datacenter-power-cooling',
    region: 'us-focused',
    category: 'power-datacenter',
    status: 'available',
    order: 2,
    title: '데이터센터 전력은 어디서 오는가',
    subtitle: '전력 관리·냉각·운영 안정성',
    description: 'AI 서버가 늘 때 전력 공급, UPS, 배전, 냉각과 운영 안정성이 함께 움직이는 흐름을 봅니다.',
    scopeLabel: '5단계 산업 흐름',
    industryStages: [
      {
        id: 'power-demand',
        kind: 'demand',
        question: marketMapIndustryQuestions.demand,
        title: 'AI 서버와 데이터센터 증설이 수요를 만듭니다',
        description: 'AI 워크로드와 서버 밀도가 높아질수록 데이터센터가 써야 하는 전력과 처리해야 하는 열이 늘어납니다.',
        items: ['AI 서버 증가', '고밀도 랙', '데이터센터 증설'],
        representativeCompanyIds: [],
      },
      {
        id: 'power-requirement',
        kind: 'requirement',
        question: marketMapIndustryQuestions.requirement,
        title: '안정적인 전력과 냉각 설비가 필요합니다',
        description: 'UPS, 배전, 전력 관리, 자동화, 칠러와 HVAC가 데이터센터 운영을 받칩니다.',
        items: ['UPS·배전', '전력 관리', '자동화', '칠러·HVAC', '열 관리'],
        representativeCompanyIds: [],
      },
      {
        id: 'power-supplier',
        kind: 'supplier',
        question: marketMapIndustryQuestions.supplier,
        title: '전력·에너지 관리와 냉각 기업이 공급합니다',
        description: '전력과 냉각을 모두 다루는 기업, 전력 관리 전문 기업, HVAC 기업을 역할별로 나눠 봅니다.',
        items: ['통합 전력·냉각', '배전·전기 장비', '에너지 관리', 'HVAC'],
        representativeCompanyIds: ['datacenter-power-vertiv', 'datacenter-power-eaton', 'datacenter-power-schneider', 'datacenter-power-lg-electronics'],
      },
      {
        id: 'power-use',
        kind: 'use',
        question: marketMapIndustryQuestions.use,
        title: '서버실과 데이터센터 운영에 사용됩니다',
        description: '공급 장비는 데이터센터의 전력 경로, 서버실 냉각과 운영 자동화에 설치됩니다.',
        items: ['데이터센터 전력 경로', '서버실·랙', '냉각 플랜트', '운영 자동화'],
        representativeCompanyIds: [],
      },
      {
        id: 'power-verification',
        kind: 'verification',
        question: marketMapIndustryQuestions.verification,
        title: '투자 계획이 수주와 실적으로 이어지는지 확인합니다',
        description: '데이터센터 투자 규모와 함께 기업의 수주잔고, 납품, 매출, 마진과 현금흐름을 확인합니다.',
        items: ['데이터센터 CAPEX', '수주·백로그', '납품 일정', '매출·마진', '현금흐름'],
        representativeCompanyIds: [],
      },
    ],
    companyNetwork: {
      companyIds: ['datacenter-power-vertiv', 'datacenter-power-eaton', 'datacenter-power-schneider', 'datacenter-power-lg-electronics'],
    },
  },
  {
    id: 'reconstruction-infrastructure',
    route: '/ko/category/reconstruction-infrastructure',
    region: 'kr-focused',
    category: 'construction-infrastructure',
    status: 'available',
    order: 3,
    title: '재건 수요는 어떤 기업으로 이어지는가',
    subtitle: '건설·중장비·철강·기반시설',
    description: '재건 기대가 실제 인프라 발주, 수주 경쟁, 장비·소재 수요와 실적으로 이어지는 순서를 봅니다.',
    scopeLabel: '5단계 산업 흐름',
    industryStages: [
      {
        id: 'reconstruction-demand', kind: 'demand', question: marketMapIndustryQuestions.demand,
        title: '복구 계획과 재건 재원이 수요를 만듭니다',
        description: '종전 기대만이 아니라 정부·국제기구의 복구 계획, 예산과 프로젝트 발주가 실제 수요의 출발점입니다.',
        items: ['복구 계획', '재건 예산·재원', '정부·공공 프로젝트'], representativeCompanyIds: [],
      },
      {
        id: 'reconstruction-requirement', kind: 'requirement', question: marketMapIndustryQuestions.requirement,
        title: '설계·시공·중장비·철강과 소재가 필요합니다',
        description: '프로젝트가 발주되면 EPC 역량, 건설장비와 인프라 소재를 조달해야 합니다.',
        items: ['EPC·시공', '건설장비', '철강·인프라 소재', '플랜트 역량'], representativeCompanyIds: [],
      },
      {
        id: 'reconstruction-supplier', kind: 'supplier', question: marketMapIndustryQuestions.supplier,
        title: '건설사·장비사·소재 기업이 공급합니다',
        description: '건설사와 장비·소재 기업을 같은 노드로 섞지 않고 역할별 기업으로 구분합니다.',
        items: ['건설·EPC', '중장비', '철강·소재'],
        representativeCompanyIds: ['reconstruction-hyundai-ec', 'reconstruction-samsung-ct', 'reconstruction-daewoo-ec', 'reconstruction-hd-infracore', 'reconstruction-caterpillar', 'reconstruction-posco-holdings'],
      },
      {
        id: 'reconstruction-use', kind: 'use', question: marketMapIndustryQuestions.use,
        title: '도로·항만·주택·플랜트 복구에 사용됩니다',
        description: '조달된 공사 역량과 장비·소재는 교통, 주거, 에너지와 산업시설 복구에 투입됩니다.',
        items: ['도로·항만', '주택', '전력·기반시설', '산업 플랜트'], representativeCompanyIds: [],
      },
      {
        id: 'reconstruction-verification', kind: 'verification', question: marketMapIndustryQuestions.verification,
        title: '발주·계약·착공과 실적을 순서대로 확인합니다',
        description: '정책 기대와 후보 기업 관심을 실제 수혜로 단정하지 않고 공식 발주, 수주 공시와 매출 인식을 확인합니다.',
        items: ['공식 발주', '수주·계약', '착공', '수주잔고', '매출·마진·현금흐름'], representativeCompanyIds: [],
      },
    ],
    companyNetwork: {
      companyIds: ['reconstruction-hyundai-ec', 'reconstruction-samsung-ct', 'reconstruction-daewoo-ec', 'reconstruction-hd-infracore', 'reconstruction-caterpillar', 'reconstruction-posco-holdings'],
    },
  },
  {
    id: 'semiconductor-cluster-infrastructure',
    route: '/ko/category/semiconductor-cluster-infrastructure',
    region: 'kr-focused',
    category: 'industrial-facilities',
    status: 'available',
    order: 4,
    title: '반도체 공장에는 무엇이 필요한가',
    subtitle: '부지·기초 공사·전력·건축 소재',
    description: '반도체 공장이 들어서기 전 필요한 부지, 기초 공사, 전력, 건축·소재와 실제 발주 흐름을 살펴봅니다.',
    supportingNote: '정책 기대가 실제 예산·착공·공급계약과 실적으로 이어지는지는 따로 확인해야 합니다.',
    scopeLabel: '5단계 산업 흐름',
    industryStages: [
      {
        id: 'cluster-demand', kind: 'demand', question: marketMapIndustryQuestions.demand,
        title: '반도체 생산능력 확대와 기업 투자가 수요를 만듭니다',
        description: '정책 발표만이 아니라 반도체 기업의 공장 투자 계획과 생산능력 확대 필요가 산업단지 수요를 만듭니다.',
        items: ['반도체 공장 투자', '생산능력 확대', '클러스터 정책'], representativeCompanyIds: [],
      },
      {
        id: 'cluster-requirement', kind: 'requirement', question: marketMapIndustryQuestions.requirement,
        title: '부지·인허가·전력·기초·건축 설비가 필요합니다',
        description: '공장 발주 전에는 부지와 전력 계획이, 착공 뒤에는 기초 공사·EPC·전력설비·건축 소재가 필요합니다.',
        items: ['부지·인허가', '전력 공급', '기초 파일', 'EPC·건축', '전력설비·소재'], representativeCompanyIds: [],
      },
      {
        id: 'cluster-supplier', kind: 'supplier', question: marketMapIndustryQuestions.supplier,
        title: '기초·건설·전력·소재 기업이 공급합니다',
        description: '각 기업을 공장 건설 과정에서 맡는 역할로 분류하며 특정 클러스터 계약사로 단정하지 않습니다.',
        items: ['기초 공사', '건설·EPC', '배전·변압기', '건축·산업 소재'],
        representativeCompanyIds: ['cluster-dongyang-pile', 'cluster-hyundai-ec', 'cluster-samsung-ct', 'cluster-ls-electric', 'cluster-hyosung-heavy', 'cluster-kcc'],
      },
      {
        id: 'cluster-use', kind: 'use', question: marketMapIndustryQuestions.use,
        title: '산업단지와 반도체 공장 건설에 사용됩니다',
        description: '조달된 공사·설비·소재는 산업단지 기반시설, 팹 건물과 전력 공급 계통에 투입됩니다.',
        items: ['산업단지 기반시설', '반도체 팹', '전력 계통', '공장 건축물'], representativeCompanyIds: [],
      },
      {
        id: 'cluster-verification', kind: 'verification', question: marketMapIndustryQuestions.verification,
        title: '예산·착공·공급계약과 실적을 확인합니다',
        description: '정책 기대가 실제 사업으로 바뀌는지 예산, 인허가, 발주, 계약과 매출 인식 순서로 확인합니다.',
        items: ['예산·사업 주체', '인허가·전력 계획', '발주·착공', '공급계약·수주잔고', '매출·마진·현금흐름'], representativeCompanyIds: [],
      },
    ],
    companyNetwork: {
      companyIds: ['cluster-dongyang-pile', 'cluster-hyundai-ec', 'cluster-samsung-ct', 'cluster-ls-electric', 'cluster-hyosung-heavy', 'cluster-kcc'],
    },
  },
  {
    id: 'ma-acquisition-premium',
    region: 'global',
    category: 'construction-infrastructure',
    status: 'planned',
    order: 5,
    title: 'M&A와 인수 프리미엄은 어떻게 읽는가',
    subtitle: '인수가격·승인 절차·주택 산업',
    description: 'Taylor Morrison처럼 인수 가격과 승인 절차를 따로 보는 흐름을 준비하고 있습니다.',
    scopeLabel: '상세 경로 준비 중',
  },
  {
    id: 'cloud-data-platform',
    region: 'us-focused',
    category: 'semiconductor-ai',
    status: 'planned',
    order: 6,
    title: 'AI 수요는 클라우드로 어떻게 이어지는가',
    subtitle: '클라우드·데이터 플랫폼',
    description: 'AI 워크로드가 클라우드와 데이터 플랫폼 수요로 번지는 흐름을 준비하고 있습니다.',
    scopeLabel: '상세 경로 준비 중',
  },
];

export const marketMapDefinitionById = new Map(marketMapDefinitions.map((definition) => [definition.id, definition]));

export function resolveMarketMapRegion(value: string | null | undefined): MarketMapRegion | 'all' {
  return value === 'us' || value === 'us-focused'
    ? 'us-focused'
    : value === 'kr' || value === 'kr-focused'
      ? 'kr-focused'
      : value === 'global'
        ? 'global'
        : 'all';
}

export function resolveMarketMapCategory(value: string | null | undefined): MarketMapCategory | 'all' {
  return value === 'semiconductor-ai'
    || value === 'power-datacenter'
    || value === 'construction-infrastructure'
    || value === 'industrial-facilities'
    ? value
    : 'all';
}

export function filterMarketMapDefinitions(
  definitions: MarketMapDefinition[],
  region: MarketMapRegion | 'all',
  category: MarketMapCategory | 'all',
) {
  return definitions
    .filter((definition) => region === 'all' || definition.region === region)
    .filter((definition) => category === 'all' || definition.category === category)
    .sort((first, second) => first.order - second.order);
}
