import type {
  BeginnerTermDefinition,
  DisclosureEventDefinition,
  HomeFeatureLabel,
  HomeInsightReference,
  HomeMacroReference,
  PrimaryNavigationItem,
  HomeReportReference,
} from './types.js';

export const homeFeatureLabels: HomeFeatureLabel[] = [
  {
    id: 'macro',
    easyName: '돈의 흐름과 경기',
    professionalName: '금리·유동성·산업 수요',
    description: '금리와 돈의 흐름이 산업 수요에 어떤 배경이 되는지 봅니다.',
    href: '/ko/macro-dashboard',
  },
  {
    id: 'bottlenecks',
    easyName: '공급이 부족한 곳',
    professionalName: '공급망 병목 레이더',
    description: '수요에 비해 공급이 빠듯한 산업 구간을 근거와 함께 봅니다.',
    href: '/ko/bottlenecks',
  },
  {
    id: 'reports',
    easyName: '산업을 이해하는 자료',
    professionalName: '공식 보고서·기업 자료',
    description: '공공기관·산업단체·기업이 낸 자료에서 산업의 배경을 확인합니다.',
    href: '/ko/reports',
  },
  {
    id: 'disclosures',
    easyName: '기업이 직접 밝힌 변화',
    professionalName: '공식 공시',
    description: '한국 OpenDART와 미국 SEC EDGAR 원문에 새로 나온 변화를 봅니다.',
    href: '/ko/disclosures',
  },
  {
    id: 'demand-supply',
    easyName: '산업이 연결되는 구조',
    professionalName: '수요·공급과 산업 흐름',
    description: '수요 배경, 공급 제약과 다섯 단계 산업 흐름을 함께 봅니다.',
    href: '/ko/demand-supply',
  },
  {
    id: 'picks',
    easyName: '이번 주에 살펴볼 기업',
    professionalName: '주가해부실 Pick',
    description: '이번 주 시장 움직임과 연결해 확인할 기업을 살펴봅니다.',
    href: '/ko/picks',
  },
];

export const primaryNavigationItems: PrimaryNavigationItem[] = [
  { id: 'today', label: '생각 실험', href: '/ko/#thinking-lab', activeKey: 'today' },
  { id: 'companies', label: '기업 찾기', href: '/ko/companies', activeKey: 'companies' },
  { id: 'insights', label: '리서치', href: '/ko/insights', activeKey: 'insights' },
];

export const homeInsightReferences: HomeInsightReference[] = [
  {
    id: 'today-rates-oil',
    kind: 'market-driver',
    referenceId: 'rates-and-oil-crosscurrents-2026-07-10',
    eyebrow: '오늘 시장',
    title: '금리와 유가는 서로 다른 방향으로 움직였습니다',
    whyItMatters: '한 가지 뉴스만으로 시장 전체를 설명하기 어려운 날이라는 뜻입니다.',
    href: '#daily-market-detail',
  },
  {
    id: 'macro-financial-conditions',
    kind: 'macro-brief',
    referenceId: 'financial-conditions-brief',
    eyebrow: '돈의 흐름',
    title: '금융여건은 평균보다 느슨한 구간입니다',
    whyItMatters: '기업과 시장이 자금을 구하기 쉬운지 판단하는 배경이 됩니다.',
    href: '/ko/macro-dashboard',
  },
  {
    id: 'bottleneck-transformers',
    kind: 'bottleneck',
    referenceId: 'grid-transformers-high-voltage',
    eyebrow: '공급 상황',
    title: '변압기와 고압 전력기기는 공급이 빠듯합니다',
    whyItMatters: '전력망과 데이터센터 투자가 늘어도 장비 공급이 늦으면 일정이 밀릴 수 있습니다.',
    href: '/ko/bottlenecks/grid-transformers-high-voltage',
  },
];

export const homeMarketAssetIds = ['kospi', 'nasdaq-composite', 'usd-krw', 'copper'] as const;

export const homeMacroReferences: HomeMacroReference[] = [
  { id: 'rates', briefId: 'rates-structure-brief', indicatorId: 'us-treasury-2y', easyLabel: '금리 부담' },
  { id: 'financial-conditions', briefId: 'financial-conditions-brief', indicatorId: 'us-financial-conditions', easyLabel: '금융여건' },
  { id: 'liquidity', briefId: 'liquidity-brief', indicatorId: 'fed-total-assets', easyLabel: '시중 유동성' },
  { id: 'industry-demand', briefId: 'industry-demand-brief', indicatorId: 'us-industrial-production', easyLabel: '산업 수요' },
];

export const homeOfficialReportReferences: HomeReportReference[] = [
  { reportId: 'iea-electricity-2026', metricLabel: '필요 전력망 투자' },
  { reportId: 'semi-300mm-memory-2026', metricLabel: '2026 장비 투자' },
  { reportId: 'us-census-construction-spending-may-2026', metricLabel: '전체 건설지출' },
];

export const homeContentLimits = {
  marketAssets: 4,
  marketDrivers: 2,
  insights: 3,
  industryFlows: 2,
  disclosures: 3,
  deeperCards: 4,
  picks: 3,
  reports: 3,
  macroCards: 4,
  bottlenecks: 3,
} as const;

export const homeDeeperFeatureIds = ['macro', 'bottlenecks', 'demand-supply', 'reports'] as const;

export const disclosureEventDefinitions: DisclosureEventDefinition[] = [
  { id: 'earnings', label: '실적', description: '매출·이익·전망이 새로 공개된 공시입니다.' },
  { id: 'investment', label: '투자·증설', description: '공장·설비·사업 투자가 공개된 공시입니다.' },
  { id: 'contract', label: '계약·수주', description: '공급계약이나 중요한 거래가 공개된 공시입니다.' },
  { id: 'financing', label: '자금 조달', description: '증자·채권·대출 등 자금 변화가 공개된 공시입니다.' },
  { id: 'insider', label: '임원·주주 거래', description: '임원이나 주요 주주의 보유 변화가 공개된 공시입니다.' },
  { id: 'merger', label: '인수·합병', description: '사업 결합이나 주요 자산 거래가 공개된 공시입니다.' },
  { id: 'other', label: '그 밖의 변화', description: '경영·지배구조 등 다른 중요한 변화가 공개된 공시입니다.' },
];

export const beginnerTermDefinitions: BeginnerTermDefinition[] = [
  {
    id: 'yield-spread',
    term: '장단기 금리차',
    shortDefinition: '만기가 긴 국채 금리와 짧은 국채 금리의 차이입니다.',
    whyItMatters: '시장 참여자가 앞으로의 성장과 물가를 어떻게 보는지 살피는 단서입니다.',
  },
  {
    id: 'financial-conditions',
    term: '금융여건',
    shortDefinition: '금리·주가·신용·환율을 묶어 돈을 빌리고 투자하기 쉬운 정도를 본 개념입니다.',
    whyItMatters: '여건이 빠듯해지면 기업의 자금 조달과 투자 속도가 느려질 수 있습니다.',
  },
  {
    id: 'liquidity',
    term: '유동성',
    shortDefinition: '경제와 금융시장 안에서 사용할 수 있는 돈과 자금의 흐름입니다.',
    whyItMatters: '같은 실적이라도 자금이 풍부한지에 따라 시장 반응이 달라질 수 있습니다.',
  },
  {
    id: 'industrial-production',
    term: '산업생산',
    shortDefinition: '공장·광업·전력 등 산업 부문이 실제로 얼마나 생산했는지 보여주는 지표입니다.',
    whyItMatters: '기업 주문과 설비 수요가 실제 생산으로 이어지는지 확인할 수 있습니다.',
  },
  {
    id: 'capacity-utilization',
    term: '가동률',
    shortDefinition: '공장이 낼 수 있는 최대 생산능력 가운데 실제로 사용한 비율입니다.',
    whyItMatters: '높은 가동률이 오래 이어지면 증설이나 공급 부족 가능성을 살펴봐야 합니다.',
  },
  {
    id: 'supply-chain-bottleneck',
    term: '공급망 병목',
    shortDefinition: '수요에 비해 부품·장비·운송·생산능력 가운데 한 구간이 부족한 상태입니다.',
    whyItMatters: '한 구간의 지연이 뒤에 연결된 산업과 기업의 생산 일정에 영향을 줄 수 있습니다.',
  },
  {
    id: 'disclosure',
    term: '공시',
    shortDefinition: '기업이 법과 규정에 따라 투자자에게 공개하는 공식 문서입니다.',
    whyItMatters: '뉴스 해석보다 앞서 계약·실적·지분 변화의 원문을 확인할 수 있습니다.',
  },
  {
    id: 'order-backlog',
    term: '수주잔고',
    shortDefinition: '계약은 했지만 아직 제품이나 서비스를 제공하지 않은 주문의 금액 또는 물량입니다.',
    whyItMatters: '앞으로의 매출 단서가 되지만 취소·납기·원가를 함께 확인해야 합니다.',
  },
  {
    id: 'lead-time',
    term: '리드타임',
    shortDefinition: '주문한 뒤 제품을 받거나 설치를 마치기까지 걸리는 시간입니다.',
    whyItMatters: '리드타임이 길어지면 공급이 수요를 따라가지 못한다는 신호일 수 있습니다.',
  },
];
