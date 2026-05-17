export type CountryId = 'KR' | 'US';
export type CompanyTier = 'anchor' | 'tier1' | 'tier2';
export type RiskLevel = 'low' | 'medium' | 'high';
export type CompanyStatus = 'core' | 'watch' | 'opportunity';
export type SourceType = 'official' | 'verified-news' | 'analyst-api-ready' | 'seed-model';
export type CompanyFinancialStatus = 'api-live' | 'fallback' | 'needs-source';
export type FilingSourceStatus = 'direct' | 'search-only' | 'needs-link' | 'private-company' | 'no-public-filing';
export type FinancialMetricKey = 'revenue' | 'operatingIncome' | 'netIncome' | 'debtRatio' | 'operatingMargin' | 'cashFlow';
export type SmartMoneyInvestorType = 'us-politician' | 'insider' | 'institution' | 'fund' | 'nps' | 'kr-politician';
export type SmartMoneyAction = 'buy' | 'sell' | 'increase' | 'decrease' | 'holding';
export type StockAutopsyDirection = 'up' | 'down';
export type StockAutopsyValueChainPosition =
  | 'leader'
  | 'supplier'
  | 'materials'
  | 'equipment'
  | 'customer'
  | 'competitor'
  | 'other';
export type MarketStatus = 'open' | 'closed' | 'premarket' | 'afterhours' | 'delayed' | 'unknown';
export type PriceLabel = 'latest' | 'close' | 'delayed' | 'fallback' | 'unavailable';

export interface CountryDefinition {
  id: CountryId;
  label: string;
  currency: string;
  regulatorSources: string[];
}

export interface SectorDefinition {
  id: string;
  country: CountryId;
  label: string;
  description: string;
  newsKeywords: string[];
}

export interface AnchorCompany {
  id: string;
  country: CountryId;
  sectorId: string;
  rank: 1 | 2 | 3;
  name: string;
  legalName: string;
  ticker: string;
  exchange: string;
  sector: string;
  region: string;
  products: string[];
  newsKeywords: string[];
}

export interface Company {
  id: string;
  anchorId: string;
  country: CountryId;
  sectorId: string;
  name: string;
  legalName: string;
  ticker?: string;
  tier: CompanyTier;
  sector: string;
  region: string;
  products: string[];
  anchorCustomer: string;
  revenue: string;
  revenueUnit: string;
  revenueBasis: string;
  revenueTrend: number;
  growthBasis: string;
  opMargin: string;
  debtRatio: string;
  customerConcentration: string;
  analystSignal: string;
  investmentView: string;
  riskLevel: RiskLevel;
  status: CompanyStatus;
  tags: string[];
  notes: string;
  sourceType: SourceType;
  sourceNote: string;
  filingSourceUrl?: string;
  reportUrl?: string;
  dartRcpNo?: string;
  secAccessionNumber?: string;
  sourceSearchUrl?: string;
  sourceDirectUrl?: string;
  reportType?: string;
  fiscalYear?: string;
  fiscalPeriod?: string;
  filingDate?: string;
  sourceStatus?: FilingSourceStatus;
  corpCode?: string;
  cik?: string;
  layout: {
    column: 0 | 1 | 2;
    row: number;
  };
}

export interface SupplyLink {
  id: string;
  anchorId: string;
  source: string;
  target: string;
  label: string;
  dependency: number;
  value: string;
}

export interface AnalystOpinion {
  id: string;
  companyId: string;
  firm: string;
  stance: string;
  horizon: string;
  date: string;
  summary: string;
  sourceType: SourceType;
}

export interface SourcePolicy {
  label: string;
  domains: string[];
  note: string;
}

export interface FilingSourceLink {
  label: string;
  url: string;
  sourceType: 'direct-report' | 'search' | 'api-docs' | 'news';
  note: string;
  isPrimary?: boolean;
}

export interface FinancialMetric {
  key: FinancialMetricKey;
  label: string;
  value: string;
  unit?: string;
  beginnerExplanation: string;
  keyTakeaway: string;
}

export interface FinancialStatementSummary {
  companyId: string;
  status: CompanyFinancialStatus;
  fiscalYear: string;
  reportType: string;
  updatedAt: string;
  source: 'OpenDART' | 'SEC CompanyFacts' | 'official-filing' | 'fallback-data';
  sourceLabel: string;
  isApiData: boolean;
  isFallbackData: boolean;
  metrics: FinancialMetric[];
  beginnerExplanation: string;
  keyTakeaway: string;
  reportUrl?: string;
  sourceDirectUrl?: string;
  sourceSearchUrl?: string;
  dartRcpNo?: string;
  secAccessionNumber?: string;
  fiscalPeriod?: string;
  filingDate?: string;
  sourceStatus?: FilingSourceStatus;
}

export interface MarketMover {
  id: string;
  companyId: string;
  companyName: string;
  ticker: string;
  market: 'KOSPI' | 'KOSDAQ' | 'NASDAQ' | 'NYSE';
  move: string;
  impactFactor: string;
  additionalFactor?: string;
  interpretation: string;
  reason: string;
  beginnerNote: string;
  sectorId: string;
  sectorLabel: string;
}

export interface SmartMoneyMove {
  id: string;
  investorName: string;
  investorType: SmartMoneyInvestorType;
  investorTypeLabel: string;
  market: CountryId;
  companyId: string;
  relatedCompanyId?: string;
  relatedSupplyChainId?: string;
  companyName: string;
  ticker: string;
  action: SmartMoneyAction;
  actionLabel: string;
  disclosedDate: string;
  tradeDateOptional?: string;
  sectorId: string;
  sector: string;
  sectorLabel: string;
  sourceLabel: string;
  sourceUrl?: string;
  isDelayedDisclosure: boolean;
  note: string;
  beginnerExplanation: string;
}

export interface StockAutopsyPick {
  id: string;
  companyName: string;
  ticker: string;
  market: CountryId;
  movementDirection: StockAutopsyDirection;
  movementLabel: string;
  reasonSummary: string;
  beginnerSummary: string;
  sector: string;
  valueChainPosition: StockAutopsyValueChainPosition;
  connectedLeaders: string[];
  relatedCompanies: string[];
  relatedSupplyChainId?: string;
  relatedCompanyId?: string;
  relatedTradeTags?: string[];
  publishedAt?: string;
}

export interface MarketPrice {
  companyId?: string;
  ticker: string;
  market: 'KOSPI' | 'KOSDAQ' | 'NASDAQ' | 'NYSE' | 'KR' | 'US';
  price: string;
  open?: string;
  previousClose?: string;
  close?: string;
  change: string;
  changePercent: string;
  currency: 'KRW' | 'USD';
  priceLabel?: PriceLabel;
  marketStatus: MarketStatus;
  asOf: string;
  source: string;
  isDelayed: boolean;
}

type SupplierSeed = {
  name: string;
  sector: string;
  products: string[];
  tags: string[];
  risk: RiskLevel;
  status: CompanyStatus;
  region?: string;
};

type ChainTemplate = {
  tier1: Array<{
    company: SupplierSeed;
    children: SupplierSeed[];
  }>;
};

export const countries: CountryDefinition[] = [
  {
    id: 'KR',
    label: '한국',
    currency: 'KRW',
    regulatorSources: ['DART', '금융감독원', '한국거래소', '한국은행', '산업통상자원부'],
  },

{
    "id": "US",
    "label": "미국",
    "currency": "USD",
    "regulatorSources": [
      "SEC EDGAR",
      "NAIC",
      "FDIC",
      "Federal Reserve",
      "BLS",
      "FTC"
    ]
  }
];

export const sectors: SectorDefinition[] = [
  {
    id: 'kr-semiconductors',
    country: 'KR',
    label: '반도체',
    description: '메모리, 파운드리, 후공정, 장비·소재·부품 협력망을 함께 봅니다.',
    newsKeywords: ['반도체', 'HBM', '파운드리', '후공정', 'semiconductor', 'foundry'],
  },
  {
    id: 'kr-mobility',
    country: 'KR',
    label: '자동차·미래차',
    description: '완성차, 전장, ADAS, 배터리 팩, 차량용 소프트웨어 밸류체인입니다.',
    newsKeywords: ['자동차', '전기차', '전장', 'ADAS', 'EV', 'automotive'],
  },
  {
    id: 'kr-battery-materials',
    country: 'KR',
    label: '배터리·소재',
    description: '셀, 양극재, 음극재, 전해액, 장비, 리사이클까지 확장한 협력망입니다.',
    newsKeywords: ['배터리', '양극재', '전해액', '리튬', 'battery', 'cathode'],
  },
  {
    id: 'kr-display',
    country: 'KR',
    label: '디스플레이·OLED',
    description: 'OLED 패널, 유기재료, 증착·검사 장비, 디스플레이 IC 중심입니다.',
    newsKeywords: ['디스플레이', 'OLED', '패널', '증착', 'display'],
  },
  {
    id: 'kr-ship-defense',
    country: 'KR',
    label: '조선·방산',
    description: '선박, LNG 보냉재, 피팅·밸브, 유도무기·위성·통신 장비까지 봅니다.',
    newsKeywords: ['조선', '방산', 'LNG선', '함정', 'defense', 'shipbuilding'],
  },
  {
    id: 'kr-bio-healthcare',
    country: 'KR',
    label: '바이오·헬스케어',
    description: 'CDMO, 바이오시밀러, 신약 플랫폼, 의료기기·진단 기업을 묶었습니다.',
    newsKeywords: ['바이오', '헬스케어', 'CDMO', '의료기기', 'bio', 'healthcare'],
  },
  {
    id: 'kr-ai-datacenter',
    country: 'KR',
    label: 'AI·데이터센터',
    description: '클라우드, AI 반도체 설계, PCB, 서버·네트워크·IDC 인프라 협력망입니다.',
    newsKeywords: ['AI', '데이터센터', '클라우드', 'PCB', '반도체 설계', 'IDC'],
  },
  {
    id: 'kr-robotics-automation',
    country: 'KR',
    label: '로봇·자동화',
    description: '협동로봇, 감속기, 스마트팩토리, 머신비전, 물류 자동화 기업군입니다.',
    newsKeywords: ['로봇', '자동화', '스마트팩토리', '감속기', 'robotics', 'automation'],
  },
  {
    id: 'kr-cosmetics-consumer',
    country: 'KR',
    label: '화장품·소비재',
    description: '브랜드, ODM/OEM, 용기·부자재, 글로벌 유통·인디브랜드 생태계입니다.',
    newsKeywords: ['화장품', 'ODM', 'K뷰티', '소비재', 'cosmetics', 'beauty'],
  },

{
    "id": "kr-insurance-financials",
    "country": "KR",
    "label": "보험·금융지주",
    "description": "생명보험, 손해보험, 재보험, GA, 보험 IT와 금융지주 노출도를 함께 봅니다.",
    "newsKeywords": [
      "보험",
      "손해보험",
      "생명보험",
      "재보험",
      "금융지주",
      "GA",
      "insurance"
    ]
  },
  {
    "id": "kr-banking-fintech",
    "country": "KR",
    "label": "은행·핀테크",
    "description": "은행, 인터넷은행, 지급결제, 신용정보, 핀테크 인프라와 B2B 금융 SaaS 생태계입니다.",
    "newsKeywords": [
      "은행",
      "핀테크",
      "간편결제",
      "인터넷은행",
      "신용정보",
      "payment",
      "fintech"
    ]
  },
  {
    "id": "kr-energy-utilities",
    "country": "KR",
    "label": "에너지·유틸리티",
    "description": "전력망, 가스, 원전·SMR, 재생에너지 기자재, 전력기기 협력망을 추적합니다.",
    "newsKeywords": [
      "전력망",
      "유틸리티",
      "원전",
      "SMR",
      "재생에너지",
      "전력기기",
      "grid"
    ]
  },
  {
    "id": "us-semiconductors",
    "country": "US",
    "label": "미국 반도체",
    "description": "AI GPU, CPU, 파운드리, 반도체 장비·소재·테스트 기업을 미국 기준으로 봅니다.",
    "newsKeywords": [
      "NVIDIA",
      "AMD",
      "Intel",
      "semiconductor",
      "AI chip",
      "foundry",
      "chip equipment"
    ]
  },
  {
    "id": "us-ai-cloud-datacenter",
    "country": "US",
    "label": "미국 AI·클라우드",
    "description": "하이퍼스케일러, 데이터센터 인프라, 네트워크, 광통신, 서버·전력 설비 생태계입니다.",
    "newsKeywords": [
      "Microsoft",
      "Amazon",
      "Google",
      "AI data center",
      "cloud",
      "server",
      "networking"
    ]
  },
  {
    "id": "us-ev-mobility",
    "country": "US",
    "label": "미국 EV·모빌리티",
    "description": "전기차, ADAS, 충전, 차량용 반도체, 배터리·센서·차체 부품 후보군을 묶었습니다.",
    "newsKeywords": [
      "Tesla",
      "GM",
      "Rivian",
      "EV",
      "ADAS",
      "charging",
      "automotive"
    ]
  },
  {
    "id": "us-energy-grid",
    "country": "US",
    "label": "미국 에너지·전력망",
    "description": "전력망 투자, 신재생, 전력기기, ESS, 전력 인프라 시공·운영 기업을 추적합니다.",
    "newsKeywords": [
      "grid",
      "utilities",
      "renewable energy",
      "power equipment",
      "transmission",
      "storage"
    ]
  },
  {
    "id": "us-insurance-financials",
    "country": "US",
    "label": "미국 보험·금융",
    "description": "보험사, 손보·생보, 재보험, 브로커, 인슈어테크, 리스크 데이터 기업군입니다.",
    "newsKeywords": [
      "insurance",
      "reinsurance",
      "insurtech",
      "brokerage",
      "property casualty",
      "life insurance"
    ]
  },
  {
    "id": "us-banking-fintech",
    "country": "US",
    "label": "미국 은행·핀테크",
    "description": "대형은행, 카드 네트워크, 결제, 코어뱅킹, 디지털 대출·자산관리 인프라입니다.",
    "newsKeywords": [
      "JPMorgan",
      "Visa",
      "fintech",
      "payments",
      "banking",
      "digital lending",
      "card network"
    ]
  },
  {
    "id": "us-healthcare-biopharma",
    "country": "US",
    "label": "미국 헬스케어·바이오",
    "description": "빅파마, 의료보험, CRO/CDMO, 진단, 생명과학 장비·소모품 생태계입니다.",
    "newsKeywords": [
      "healthcare",
      "biopharma",
      "CRO",
      "CDMO",
      "diagnostics",
      "medical device"
    ]
  },
  {
    "id": "us-aerospace-defense",
    "country": "US",
    "label": "미국 항공우주·방산",
    "description": "상업항공, 방산 프라임, 우주·드론, 항공 전장·부품 협력망을 함께 봅니다.",
    "newsKeywords": [
      "aerospace",
      "defense",
      "space",
      "drone",
      "Boeing",
      "Lockheed",
      "RTX"
    ]
  }
];

export const anchors: AnchorCompany[] = [
  {
    id: 'kr-semiconductors-samsung',
    country: 'KR',
    sectorId: 'kr-semiconductors',
    rank: 1,
    name: '삼성전자',
    legalName: '삼성전자',
    ticker: '005930.KS',
    exchange: 'KRX',
    sector: '메모리·파운드리',
    region: '경기 수원',
    products: ['메모리', '파운드리', '시스템LSI'],
    newsKeywords: ['삼성전자', 'Samsung Electronics', 'HBM', '파운드리'],
  },
  {
    id: 'kr-semiconductors-sk-hynix',
    country: 'KR',
    sectorId: 'kr-semiconductors',
    rank: 2,
    name: 'SK하이닉스',
    legalName: 'SK하이닉스',
    ticker: '000660.KS',
    exchange: 'KRX',
    sector: '메모리 반도체',
    region: '경기 이천',
    products: ['DRAM', 'NAND', 'HBM'],
    newsKeywords: ['SK하이닉스', 'SK hynix', 'HBM', '메모리'],
  },
  {
    id: 'kr-semiconductors-db-hitek',
    country: 'KR',
    sectorId: 'kr-semiconductors',
    rank: 3,
    name: 'DB하이텍',
    legalName: 'DB하이텍',
    ticker: '000990.KS',
    exchange: 'KRX',
    sector: '8인치 파운드리',
    region: '경기 부천',
    products: ['8인치 파운드리', '전력반도체'],
    newsKeywords: ['DB하이텍', 'DB HiTek', '파운드리'],
  },
  {
    id: 'kr-mobility-hyundai',
    country: 'KR',
    sectorId: 'kr-mobility',
    rank: 1,
    name: '현대차',
    legalName: '현대자동차',
    ticker: '005380.KS',
    exchange: 'KRX',
    sector: '완성차',
    region: '서울 서초',
    products: ['전기차', '상용차', 'PBV'],
    newsKeywords: ['현대차', 'Hyundai Motor', '전기차', 'PBV'],
  },
  {
    id: 'kr-mobility-kia',
    country: 'KR',
    sectorId: 'kr-mobility',
    rank: 2,
    name: '기아',
    legalName: '기아',
    ticker: '000270.KS',
    exchange: 'KRX',
    sector: '완성차',
    region: '서울 서초',
    products: ['전기차', 'SUV', 'PBV'],
    newsKeywords: ['기아', 'Kia', '전기차', 'PBV'],
  },
  {
    id: 'kr-mobility-mobis',
    country: 'KR',
    sectorId: 'kr-mobility',
    rank: 3,
    name: '현대모비스',
    legalName: '현대모비스',
    ticker: '012330.KS',
    exchange: 'KRX',
    sector: '자동차 부품',
    region: '서울 강남',
    products: ['전장', '모듈', '램프'],
    newsKeywords: ['현대모비스', 'Hyundai Mobis', '전장'],
  },
  {
    id: 'kr-battery-materials-lg-energy',
    country: 'KR',
    sectorId: 'kr-battery-materials',
    rank: 1,
    name: 'LG에너지솔루션',
    legalName: 'LG에너지솔루션',
    ticker: '373220.KS',
    exchange: 'KRX',
    sector: '배터리 셀',
    region: '서울 영등포',
    products: ['전기차 배터리', 'ESS', '원통형 셀'],
    newsKeywords: ['LG에너지솔루션', 'LG Energy Solution', '배터리'],
  },
  {
    id: 'kr-battery-materials-samsung-sdi',
    country: 'KR',
    sectorId: 'kr-battery-materials',
    rank: 2,
    name: '삼성SDI',
    legalName: '삼성SDI',
    ticker: '006400.KS',
    exchange: 'KRX',
    sector: '배터리·전자재료',
    region: '경기 용인',
    products: ['전기차 배터리', '소형전지', '전자재료'],
    newsKeywords: ['삼성SDI', 'Samsung SDI', '배터리'],
  },
  {
    id: 'kr-battery-materials-posco-futurem',
    country: 'KR',
    sectorId: 'kr-battery-materials',
    rank: 3,
    name: '포스코퓨처엠',
    legalName: '포스코퓨처엠',
    ticker: '003670.KS',
    exchange: 'KRX',
    sector: '배터리 소재',
    region: '경북 포항',
    products: ['양극재', '음극재'],
    newsKeywords: ['포스코퓨처엠', 'POSCO Future M', '양극재'],
  },
  {
    id: 'kr-display-lg-display',
    country: 'KR',
    sectorId: 'kr-display',
    rank: 1,
    name: 'LG디스플레이',
    legalName: 'LG디스플레이',
    ticker: '034220.KS',
    exchange: 'KRX',
    sector: '디스플레이 패널',
    region: '서울 영등포',
    products: ['OLED', 'LCD', '차량용 디스플레이'],
    newsKeywords: ['LG디스플레이', 'LG Display', 'OLED'],
  },
  {
    id: 'kr-display-samsung-display',
    country: 'KR',
    sectorId: 'kr-display',
    rank: 2,
    name: '삼성디스플레이',
    legalName: '삼성디스플레이',
    ticker: '비상장',
    exchange: '비상장',
    sector: 'OLED 패널',
    region: '충남 아산',
    products: ['QD-OLED', 'OLED', 'IT 패널'],
    newsKeywords: ['삼성디스플레이', 'Samsung Display', 'OLED'],
  },
  {
    id: 'kr-display-lx-semicon',
    country: 'KR',
    sectorId: 'kr-display',
    rank: 3,
    name: 'LX세미콘',
    legalName: 'LX세미콘',
    ticker: '108320.KS',
    exchange: 'KRX',
    sector: '디스플레이 IC',
    region: '대전 유성',
    products: ['DDI', '타이밍 컨트롤러'],
    newsKeywords: ['LX세미콘', 'LX Semicon', '디스플레이 IC'],
  },
  {
    id: 'kr-ship-defense-hd-hhi',
    country: 'KR',
    sectorId: 'kr-ship-defense',
    rank: 1,
    name: 'HD현대중공업',
    legalName: 'HD현대중공업',
    ticker: '329180.KS',
    exchange: 'KRX',
    sector: '조선·해양',
    region: '울산 동구',
    products: ['LNG선', '함정', '해양플랜트'],
    newsKeywords: ['HD현대중공업', '조선', 'LNG선'],
  },
  {
    id: 'kr-ship-defense-hanwha-ocean',
    country: 'KR',
    sectorId: 'kr-ship-defense',
    rank: 2,
    name: '한화오션',
    legalName: '한화오션',
    ticker: '042660.KS',
    exchange: 'KRX',
    sector: '조선·방산',
    region: '경남 거제',
    products: ['LNG선', '잠수함', '특수선'],
    newsKeywords: ['한화오션', 'Hanwha Ocean', '잠수함'],
  },
  {
    id: 'kr-ship-defense-lig-nex1',
    country: 'KR',
    sectorId: 'kr-ship-defense',
    rank: 3,
    name: 'LIG넥스원',
    legalName: 'LIG넥스원',
    ticker: '079550.KS',
    exchange: 'KRX',
    sector: '방산 전자',
    region: '경기 성남',
    products: ['유도무기', '레이더', '통신'],
    newsKeywords: ['LIG넥스원', '방산', '유도무기'],
  },
  {
    id: 'kr-bio-healthcare-samsung-biologics',
    country: 'KR',
    sectorId: 'kr-bio-healthcare',
    rank: 1,
    name: '삼성바이오로직스',
    legalName: '삼성바이오로직스',
    ticker: '207940.KS',
    exchange: 'KRX',
    sector: '바이오 CDMO',
    region: '인천 송도',
    products: ['항체의약품 CDMO', '바이오 생산'],
    newsKeywords: ['삼성바이오로직스', 'Samsung Biologics', 'CDMO'],
  },
  {
    id: 'kr-bio-healthcare-celltrion',
    country: 'KR',
    sectorId: 'kr-bio-healthcare',
    rank: 2,
    name: '셀트리온',
    legalName: '셀트리온',
    ticker: '068270.KS',
    exchange: 'KRX',
    sector: '바이오시밀러',
    region: '인천 송도',
    products: ['바이오시밀러', '항체의약품'],
    newsKeywords: ['셀트리온', 'Celltrion', '바이오시밀러'],
  },
  {
    id: 'kr-bio-healthcare-sk-biopharm',
    country: 'KR',
    sectorId: 'kr-bio-healthcare',
    rank: 3,
    name: 'SK바이오팜',
    legalName: 'SK바이오팜',
    ticker: '326030.KS',
    exchange: 'KRX',
    sector: '신약 개발',
    region: '경기 성남',
    products: ['중추신경계 신약', '항암 파이프라인'],
    newsKeywords: ['SK바이오팜', 'SK Biopharmaceuticals', '신약'],
  },
  {
    id: 'kr-ai-datacenter-naver',
    country: 'KR',
    sectorId: 'kr-ai-datacenter',
    rank: 1,
    name: 'NAVER',
    legalName: '네이버',
    ticker: '035420.KS',
    exchange: 'KRX',
    sector: '클라우드·AI',
    region: '경기 성남',
    products: ['AI 서비스', '클라우드', '데이터센터'],
    newsKeywords: ['네이버', 'NAVER', 'AI', '데이터센터'],
  },
  {
    id: 'kr-ai-datacenter-kakao',
    country: 'KR',
    sectorId: 'kr-ai-datacenter',
    rank: 2,
    name: '카카오',
    legalName: '카카오',
    ticker: '035720.KS',
    exchange: 'KRX',
    sector: '플랫폼·AI',
    region: '경기 성남',
    products: ['AI 서비스', '플랫폼', '데이터센터'],
    newsKeywords: ['카카오', 'Kakao', 'AI', '데이터센터'],
  },
  {
    id: 'kr-ai-datacenter-samsung-sds',
    country: 'KR',
    sectorId: 'kr-ai-datacenter',
    rank: 3,
    name: '삼성SDS',
    legalName: '삼성에스디에스',
    ticker: '018260.KS',
    exchange: 'KRX',
    sector: 'IT서비스·클라우드',
    region: '서울 송파',
    products: ['클라우드', '물류 IT', '생성형 AI'],
    newsKeywords: ['삼성SDS', 'Samsung SDS', '클라우드'],
  },
  {
    id: 'kr-robotics-automation-doosan-robotics',
    country: 'KR',
    sectorId: 'kr-robotics-automation',
    rank: 1,
    name: '두산로보틱스',
    legalName: '두산로보틱스',
    ticker: '454910.KS',
    exchange: 'KRX',
    sector: '협동로봇',
    region: '경기 수원',
    products: ['협동로봇', '로봇 플랫폼'],
    newsKeywords: ['두산로보틱스', '협동로봇', '로봇'],
  },
  {
    id: 'kr-robotics-automation-rainbow',
    country: 'KR',
    sectorId: 'kr-robotics-automation',
    rank: 2,
    name: '레인보우로보틱스',
    legalName: '레인보우로보틱스',
    ticker: '277810.KQ',
    exchange: 'KOSDAQ',
    sector: '로봇 플랫폼',
    region: '대전 유성',
    products: ['휴머노이드', '협동로봇'],
    newsKeywords: ['레인보우로보틱스', 'Rainbow Robotics', '로봇'],
  },
  {
    id: 'kr-robotics-automation-robotis',
    country: 'KR',
    sectorId: 'kr-robotics-automation',
    rank: 3,
    name: '로보티즈',
    legalName: '로보티즈',
    ticker: '108490.KQ',
    exchange: 'KOSDAQ',
    sector: '로봇 부품·플랫폼',
    region: '서울 강서',
    products: ['액추에이터', '자율주행 로봇'],
    newsKeywords: ['로보티즈', 'ROBOTIS', '로봇'],
  },
  {
    id: 'kr-cosmetics-consumer-amorepacific',
    country: 'KR',
    sectorId: 'kr-cosmetics-consumer',
    rank: 1,
    name: '아모레퍼시픽',
    legalName: '아모레퍼시픽',
    ticker: '090430.KS',
    exchange: 'KRX',
    sector: '화장품 브랜드',
    region: '서울 용산',
    products: ['스킨케어', '메이크업', '럭셔리 브랜드'],
    newsKeywords: ['아모레퍼시픽', 'Amorepacific', '화장품'],
  },
  {
    id: 'kr-cosmetics-consumer-lg-hnh',
    country: 'KR',
    sectorId: 'kr-cosmetics-consumer',
    rank: 2,
    name: 'LG생활건강',
    legalName: 'LG생활건강',
    ticker: '051900.KS',
    exchange: 'KRX',
    sector: '생활소비재',
    region: '서울 종로',
    products: ['화장품', '생활용품', '음료'],
    newsKeywords: ['LG생활건강', 'LG H&H', '화장품'],
  },
  {
    id: 'kr-cosmetics-consumer-silicontwo',
    country: 'KR',
    sectorId: 'kr-cosmetics-consumer',
    rank: 3,
    name: '실리콘투',
    legalName: '실리콘투',
    ticker: '257720.KQ',
    exchange: 'KOSDAQ',
    sector: 'K뷰티 유통',
    region: '경기 성남',
    products: ['글로벌 유통', '인디브랜드'],
    newsKeywords: ['실리콘투', 'Silicon2', 'K뷰티'],
  },

{
    "id": "kr-insurance-financials-samsung-life",
    "country": "KR",
    "sectorId": "kr-insurance-financials",
    "rank": 1,
    "name": "삼성생명",
    "legalName": "삼성생명",
    "ticker": "032830.KS",
    "exchange": "KRX",
    "sector": "생명보험",
    "region": "서울 서초",
    "products": [
      "생명보험",
      "퇴직연금",
      "자산운용"
    ],
    "newsKeywords": [
      "삼성생명",
      "Samsung Life",
      "보험"
    ]
  },
  {
    "id": "kr-insurance-financials-db-insurance",
    "country": "KR",
    "sectorId": "kr-insurance-financials",
    "rank": 2,
    "name": "DB손해보험",
    "legalName": "DB손해보험",
    "ticker": "005830.KS",
    "exchange": "KRX",
    "sector": "손해보험",
    "region": "서울 강남",
    "products": [
      "자동차보험",
      "장기보험",
      "기업보험"
    ],
    "newsKeywords": [
      "DB손해보험",
      "DB Insurance",
      "손해보험"
    ]
  },
  {
    "id": "kr-insurance-financials-korean-re",
    "country": "KR",
    "sectorId": "kr-insurance-financials",
    "rank": 3,
    "name": "코리안리",
    "legalName": "코리안리재보험",
    "ticker": "003690.KS",
    "exchange": "KRX",
    "sector": "재보험",
    "region": "서울 종로",
    "products": [
      "재보험",
      "기업위험",
      "해외 재보험"
    ],
    "newsKeywords": [
      "코리안리",
      "Korean Re",
      "재보험"
    ]
  },
  {
    "id": "kr-banking-fintech-kb",
    "country": "KR",
    "sectorId": "kr-banking-fintech",
    "rank": 1,
    "name": "KB금융",
    "legalName": "KB금융지주",
    "ticker": "105560.KS",
    "exchange": "KRX",
    "sector": "금융지주",
    "region": "서울 영등포",
    "products": [
      "은행",
      "카드",
      "증권",
      "보험"
    ],
    "newsKeywords": [
      "KB금융",
      "KB Financial",
      "은행"
    ]
  },
  {
    "id": "kr-banking-fintech-shinhan",
    "country": "KR",
    "sectorId": "kr-banking-fintech",
    "rank": 2,
    "name": "신한지주",
    "legalName": "신한금융지주회사",
    "ticker": "055550.KS",
    "exchange": "KRX",
    "sector": "금융지주",
    "region": "서울 중구",
    "products": [
      "은행",
      "카드",
      "증권",
      "자산운용"
    ],
    "newsKeywords": [
      "신한지주",
      "Shinhan Financial",
      "은행"
    ]
  },
  {
    "id": "kr-banking-fintech-kakaobank",
    "country": "KR",
    "sectorId": "kr-banking-fintech",
    "rank": 3,
    "name": "카카오뱅크",
    "legalName": "카카오뱅크",
    "ticker": "323410.KS",
    "exchange": "KRX",
    "sector": "인터넷은행",
    "region": "경기 성남",
    "products": [
      "모바일뱅킹",
      "대출",
      "예금",
      "플랫폼 금융"
    ],
    "newsKeywords": [
      "카카오뱅크",
      "KakaoBank",
      "인터넷은행"
    ]
  },
  {
    "id": "kr-energy-utilities-kepco",
    "country": "KR",
    "sectorId": "kr-energy-utilities",
    "rank": 1,
    "name": "한국전력",
    "legalName": "한국전력공사",
    "ticker": "015760.KS",
    "exchange": "KRX",
    "sector": "전력 유틸리티",
    "region": "전남 나주",
    "products": [
      "전력망",
      "송배전",
      "전력 판매"
    ],
    "newsKeywords": [
      "한국전력",
      "KEPCO",
      "전력망"
    ]
  },
  {
    "id": "kr-energy-utilities-kogas",
    "country": "KR",
    "sectorId": "kr-energy-utilities",
    "rank": 2,
    "name": "한국가스공사",
    "legalName": "한국가스공사",
    "ticker": "036460.KS",
    "exchange": "KRX",
    "sector": "가스 유틸리티",
    "region": "대구 동구",
    "products": [
      "LNG",
      "천연가스",
      "수소"
    ],
    "newsKeywords": [
      "한국가스공사",
      "KOGAS",
      "LNG"
    ]
  },
  {
    "id": "kr-energy-utilities-doosan-enerbility",
    "country": "KR",
    "sectorId": "kr-energy-utilities",
    "rank": 3,
    "name": "두산에너빌리티",
    "legalName": "두산에너빌리티",
    "ticker": "034020.KS",
    "exchange": "KRX",
    "sector": "전력·원전 기자재",
    "region": "경남 창원",
    "products": [
      "원전",
      "가스터빈",
      "SMR",
      "해상풍력"
    ],
    "newsKeywords": [
      "두산에너빌리티",
      "Doosan Enerbility",
      "SMR",
      "원전"
    ]
  },
  {
    "id": "us-semiconductors-nvidia",
    "country": "US",
    "sectorId": "us-semiconductors",
    "rank": 1,
    "name": "NVIDIA",
    "legalName": "NVIDIA Corporation",
    "ticker": "NVDA",
    "exchange": "NASDAQ",
    "sector": "AI GPU·가속기",
    "region": "California",
    "products": [
      "GPU",
      "AI accelerator",
      "networking"
    ],
    "newsKeywords": [
      "NVIDIA",
      "NVDA",
      "AI chip"
    ]
  },
  {
    "id": "us-semiconductors-amd",
    "country": "US",
    "sectorId": "us-semiconductors",
    "rank": 2,
    "name": "AMD",
    "legalName": "Advanced Micro Devices, Inc.",
    "ticker": "AMD",
    "exchange": "NASDAQ",
    "sector": "CPU·GPU",
    "region": "California",
    "products": [
      "CPU",
      "GPU",
      "data center accelerator"
    ],
    "newsKeywords": [
      "AMD",
      "Advanced Micro Devices",
      "AI chip"
    ]
  },
  {
    "id": "us-semiconductors-intel",
    "country": "US",
    "sectorId": "us-semiconductors",
    "rank": 3,
    "name": "Intel",
    "legalName": "Intel Corporation",
    "ticker": "INTC",
    "exchange": "NASDAQ",
    "sector": "CPU·파운드리",
    "region": "California",
    "products": [
      "CPU",
      "foundry",
      "advanced packaging"
    ],
    "newsKeywords": [
      "Intel",
      "INTC",
      "foundry"
    ]
  },
  {
    "id": "us-ai-cloud-datacenter-microsoft",
    "country": "US",
    "sectorId": "us-ai-cloud-datacenter",
    "rank": 1,
    "name": "Microsoft",
    "legalName": "Microsoft Corporation",
    "ticker": "MSFT",
    "exchange": "NASDAQ",
    "sector": "클라우드·AI",
    "region": "Washington",
    "products": [
      "Azure",
      "AI software",
      "data center"
    ],
    "newsKeywords": [
      "Microsoft",
      "Azure",
      "AI data center"
    ]
  },
  {
    "id": "us-ai-cloud-datacenter-amazon",
    "country": "US",
    "sectorId": "us-ai-cloud-datacenter",
    "rank": 2,
    "name": "Amazon",
    "legalName": "Amazon.com, Inc.",
    "ticker": "AMZN",
    "exchange": "NASDAQ",
    "sector": "클라우드·커머스",
    "region": "Washington",
    "products": [
      "AWS",
      "e-commerce",
      "logistics"
    ],
    "newsKeywords": [
      "Amazon",
      "AWS",
      "data center"
    ]
  },
  {
    "id": "us-ai-cloud-datacenter-alphabet",
    "country": "US",
    "sectorId": "us-ai-cloud-datacenter",
    "rank": 3,
    "name": "Alphabet",
    "legalName": "Alphabet Inc.",
    "ticker": "GOOGL",
    "exchange": "NASDAQ",
    "sector": "검색·클라우드·AI",
    "region": "California",
    "products": [
      "Google Cloud",
      "AI model",
      "advertising"
    ],
    "newsKeywords": [
      "Alphabet",
      "Google Cloud",
      "AI"
    ]
  },
  {
    "id": "us-ev-mobility-tesla",
    "country": "US",
    "sectorId": "us-ev-mobility",
    "rank": 1,
    "name": "Tesla",
    "legalName": "Tesla, Inc.",
    "ticker": "TSLA",
    "exchange": "NASDAQ",
    "sector": "전기차·에너지",
    "region": "Texas",
    "products": [
      "EV",
      "battery storage",
      "charging"
    ],
    "newsKeywords": [
      "Tesla",
      "TSLA",
      "EV"
    ]
  },
  {
    "id": "us-ev-mobility-gm",
    "country": "US",
    "sectorId": "us-ev-mobility",
    "rank": 2,
    "name": "General Motors",
    "legalName": "General Motors Company",
    "ticker": "GM",
    "exchange": "NYSE",
    "sector": "완성차",
    "region": "Michigan",
    "products": [
      "vehicle",
      "EV",
      "autonomous"
    ],
    "newsKeywords": [
      "General Motors",
      "GM",
      "EV"
    ]
  },
  {
    "id": "us-ev-mobility-rivian",
    "country": "US",
    "sectorId": "us-ev-mobility",
    "rank": 3,
    "name": "Rivian",
    "legalName": "Rivian Automotive, Inc.",
    "ticker": "RIVN",
    "exchange": "NASDAQ",
    "sector": "전기트럭·상용 EV",
    "region": "California",
    "products": [
      "electric truck",
      "delivery van",
      "software"
    ],
    "newsKeywords": [
      "Rivian",
      "RIVN",
      "EV"
    ]
  },
  {
    "id": "us-energy-grid-nextera",
    "country": "US",
    "sectorId": "us-energy-grid",
    "rank": 1,
    "name": "NextEra Energy",
    "legalName": "NextEra Energy, Inc.",
    "ticker": "NEE",
    "exchange": "NYSE",
    "sector": "전력·재생에너지",
    "region": "Florida",
    "products": [
      "utility",
      "renewables",
      "grid"
    ],
    "newsKeywords": [
      "NextEra Energy",
      "NEE",
      "renewable energy"
    ]
  },
  {
    "id": "us-energy-grid-ge-vernova",
    "country": "US",
    "sectorId": "us-energy-grid",
    "rank": 2,
    "name": "GE Vernova",
    "legalName": "GE Vernova Inc.",
    "ticker": "GEV",
    "exchange": "NYSE",
    "sector": "전력기기·터빈",
    "region": "Massachusetts",
    "products": [
      "gas turbine",
      "grid equipment",
      "wind"
    ],
    "newsKeywords": [
      "GE Vernova",
      "GEV",
      "grid"
    ]
  },
  {
    "id": "us-energy-grid-eaton",
    "country": "US",
    "sectorId": "us-energy-grid",
    "rank": 3,
    "name": "Eaton",
    "legalName": "Eaton Corporation plc",
    "ticker": "ETN",
    "exchange": "NYSE",
    "sector": "전력관리",
    "region": "Ireland / Ohio",
    "products": [
      "electrical equipment",
      "power management",
      "data center power"
    ],
    "newsKeywords": [
      "Eaton",
      "ETN",
      "power management"
    ]
  },
  {
    "id": "us-insurance-financials-berkshire",
    "country": "US",
    "sectorId": "us-insurance-financials",
    "rank": 1,
    "name": "Berkshire Hathaway",
    "legalName": "Berkshire Hathaway Inc.",
    "ticker": "BRK.B",
    "exchange": "NYSE",
    "sector": "보험·투자지주",
    "region": "Nebraska",
    "products": [
      "insurance",
      "reinsurance",
      "investment"
    ],
    "newsKeywords": [
      "Berkshire Hathaway",
      "GEICO",
      "insurance"
    ]
  },
  {
    "id": "us-insurance-financials-progressive",
    "country": "US",
    "sectorId": "us-insurance-financials",
    "rank": 2,
    "name": "Progressive",
    "legalName": "The Progressive Corporation",
    "ticker": "PGR",
    "exchange": "NYSE",
    "sector": "손해보험",
    "region": "Ohio",
    "products": [
      "auto insurance",
      "property casualty",
      "usage-based insurance"
    ],
    "newsKeywords": [
      "Progressive",
      "PGR",
      "auto insurance"
    ]
  },
  {
    "id": "us-insurance-financials-chubb",
    "country": "US",
    "sectorId": "us-insurance-financials",
    "rank": 3,
    "name": "Chubb",
    "legalName": "Chubb Limited",
    "ticker": "CB",
    "exchange": "NYSE",
    "sector": "기업·손해보험",
    "region": "Switzerland / New Jersey",
    "products": [
      "commercial insurance",
      "property casualty",
      "specialty risk"
    ],
    "newsKeywords": [
      "Chubb",
      "CB",
      "commercial insurance"
    ]
  },
  {
    "id": "us-banking-fintech-jpmorgan",
    "country": "US",
    "sectorId": "us-banking-fintech",
    "rank": 1,
    "name": "JPMorgan Chase",
    "legalName": "JPMorgan Chase & Co.",
    "ticker": "JPM",
    "exchange": "NYSE",
    "sector": "대형은행",
    "region": "New York",
    "products": [
      "banking",
      "investment banking",
      "payments"
    ],
    "newsKeywords": [
      "JPMorgan",
      "JPM",
      "banking"
    ]
  },
  {
    "id": "us-banking-fintech-visa",
    "country": "US",
    "sectorId": "us-banking-fintech",
    "rank": 2,
    "name": "Visa",
    "legalName": "Visa Inc.",
    "ticker": "V",
    "exchange": "NYSE",
    "sector": "카드 네트워크",
    "region": "California",
    "products": [
      "card network",
      "payments",
      "fraud data"
    ],
    "newsKeywords": [
      "Visa",
      "payments",
      "card network"
    ]
  },
  {
    "id": "us-banking-fintech-block",
    "country": "US",
    "sectorId": "us-banking-fintech",
    "rank": 3,
    "name": "Block",
    "legalName": "Block, Inc.",
    "ticker": "SQ",
    "exchange": "NYSE",
    "sector": "핀테크·결제",
    "region": "California",
    "products": [
      "Square",
      "Cash App",
      "merchant payment"
    ],
    "newsKeywords": [
      "Block Inc",
      "Square",
      "Cash App"
    ]
  },
  {
    "id": "us-healthcare-biopharma-unitedhealth",
    "country": "US",
    "sectorId": "us-healthcare-biopharma",
    "rank": 1,
    "name": "UnitedHealth Group",
    "legalName": "UnitedHealth Group Incorporated",
    "ticker": "UNH",
    "exchange": "NYSE",
    "sector": "의료보험·헬스서비스",
    "region": "Minnesota",
    "products": [
      "health insurance",
      "Optum",
      "care delivery"
    ],
    "newsKeywords": [
      "UnitedHealth",
      "Optum",
      "health insurance"
    ]
  },
  {
    "id": "us-healthcare-biopharma-lilly",
    "country": "US",
    "sectorId": "us-healthcare-biopharma",
    "rank": 2,
    "name": "Eli Lilly",
    "legalName": "Eli Lilly and Company",
    "ticker": "LLY",
    "exchange": "NYSE",
    "sector": "제약",
    "region": "Indiana",
    "products": [
      "diabetes",
      "obesity drug",
      "biologics"
    ],
    "newsKeywords": [
      "Eli Lilly",
      "LLY",
      "obesity drug"
    ]
  },
  {
    "id": "us-healthcare-biopharma-pfizer",
    "country": "US",
    "sectorId": "us-healthcare-biopharma",
    "rank": 3,
    "name": "Pfizer",
    "legalName": "Pfizer Inc.",
    "ticker": "PFE",
    "exchange": "NYSE",
    "sector": "제약·백신",
    "region": "New York",
    "products": [
      "vaccine",
      "oncology",
      "biopharma"
    ],
    "newsKeywords": [
      "Pfizer",
      "PFE",
      "biopharma"
    ]
  },
  {
    "id": "us-aerospace-defense-boeing",
    "country": "US",
    "sectorId": "us-aerospace-defense",
    "rank": 1,
    "name": "Boeing",
    "legalName": "The Boeing Company",
    "ticker": "BA",
    "exchange": "NYSE",
    "sector": "상업항공·방산",
    "region": "Virginia",
    "products": [
      "commercial aircraft",
      "defense",
      "space"
    ],
    "newsKeywords": [
      "Boeing",
      "BA",
      "aerospace"
    ]
  },
  {
    "id": "us-aerospace-defense-lockheed",
    "country": "US",
    "sectorId": "us-aerospace-defense",
    "rank": 2,
    "name": "Lockheed Martin",
    "legalName": "Lockheed Martin Corporation",
    "ticker": "LMT",
    "exchange": "NYSE",
    "sector": "방산·우주",
    "region": "Maryland",
    "products": [
      "missile",
      "aircraft",
      "space systems"
    ],
    "newsKeywords": [
      "Lockheed Martin",
      "LMT",
      "defense"
    ]
  },
  {
    "id": "us-aerospace-defense-rtx",
    "country": "US",
    "sectorId": "us-aerospace-defense",
    "rank": 3,
    "name": "RTX",
    "legalName": "RTX Corporation",
    "ticker": "RTX",
    "exchange": "NYSE",
    "sector": "항공엔진·방산 전장",
    "region": "Virginia",
    "products": [
      "Pratt & Whitney",
      "Collins Aerospace",
      "missile systems"
    ],
    "newsKeywords": [
      "RTX",
      "Pratt Whitney",
      "Raytheon"
    ]
  }
];

const chainTemplates: Record<string, ChainTemplate> = {
  'kr-semiconductors': {
    tier1: [
      {
        company: { name: '한미반도체', sector: '후공정 장비', products: ['TC 본더', '패키징 장비'], tags: ['HBM', '후공정', '장비 사이클'], risk: 'medium', status: 'opportunity', region: '인천 서구' },
        children: [
          { name: '테크윙', sector: '테스트 핸들러', products: ['메모리 테스트 핸들러', '자동화'], tags: ['테스트', '장비'], risk: 'medium', status: 'core' },
          { name: '인텍플러스', sector: '검사 장비', products: ['외관 검사', '패키지 검사'], tags: ['검사', 'AI 비전'], risk: 'low', status: 'opportunity' },
          { name: '고영', sector: '검사·계측', products: ['3D 검사', '반도체 검사'], tags: ['머신비전', '정밀검사'], risk: 'low', status: 'core' },
        ],
      },
      {
        company: { name: '원익IPS', sector: '전공정 장비', products: ['증착 장비', '열처리 장비'], tags: ['CAPEX', '국산화'], risk: 'medium', status: 'core', region: '경기 평택' },
        children: [
          { name: '주성엔지니어링', sector: '증착 장비', products: ['ALD', 'CVD'], tags: ['공정 미세화', '장비'], risk: 'medium', status: 'opportunity' },
          { name: '유진테크', sector: '반도체 장비', products: ['LPCVD', '플라즈마 장비'], tags: ['메모리 투자', '수주'], risk: 'medium', status: 'watch' },
          { name: '피에스케이', sector: '공정 장비', products: ['드라이 스트립', '클리닝'], tags: ['전공정', '수익성'], risk: 'low', status: 'core' },
        ],
      },
      {
        company: { name: '솔브레인', sector: '반도체 소재', products: ['식각액', '전해액', 'CMP 소재'], tags: ['소재', '고객 다변화'], risk: 'low', status: 'core', region: '경기 성남' },
        children: [
          { name: '동진쎄미켐', sector: '전자재료', products: ['포토레지스트', '습식 화학'], tags: ['소재 국산화', '포토'], risk: 'medium', status: 'core' },
          { name: '이엔에프테크놀로지', sector: '전자화학', products: ['신너', '식각액'], tags: ['원재료', '고객집중'], risk: 'medium', status: 'watch' },
          { name: '켐트로닉스', sector: '전자화학·부품', products: ['식각', '전자부품'], tags: ['소재', '디스플레이'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '하나마이크론', sector: '패키징·테스트', products: ['OSAT', '패키징'], tags: ['후공정', '가동률'], risk: 'high', status: 'watch', region: '충남 아산' },
        children: [
          { name: '네패스', sector: '후공정', products: ['WLP', '팬아웃 패키징'], tags: ['패키징', '전력반도체'], risk: 'high', status: 'watch' },
          { name: 'SFA반도체', sector: '패키징', products: ['패키징', '테스트'], tags: ['OSAT', '수주'], risk: 'medium', status: 'core' },
          { name: '리노공업', sector: '테스트 소켓', products: ['IC 테스트 소켓', '핀'], tags: ['고마진', '소모품'], risk: 'low', status: 'opportunity' },
        ],
      },
    ],
  },
  'kr-mobility': {
    tier1: [
      {
        company: { name: 'HL만도', sector: '제동·조향·ADAS', products: ['브레이크', '조향', 'ADAS'], tags: ['전장화', '글로벌 OEM'], risk: 'medium', status: 'core', region: '경기 평택' },
        children: [
          { name: '에스엘', sector: '램프·전장', products: ['헤드램프', '전장 모듈'], tags: ['램프', 'EV'], risk: 'low', status: 'core' },
          { name: '우리산업', sector: '열관리 부품', products: ['PTC 히터', '공조 부품'], tags: ['열관리', 'EV'], risk: 'medium', status: 'opportunity' },
          { name: '모트렉스', sector: 'IVI·전장', products: ['인포테인먼트', 'ADAS 단말'], tags: ['차량 SW', '수출'], risk: 'medium', status: 'watch' },
        ],
      },
      {
        company: { name: '성우하이텍', sector: '차체 부품', products: ['차체', '배터리 케이스'], tags: ['경량화', '해외 법인'], risk: 'medium', status: 'core', region: '부산 기장' },
        children: [
          { name: '화신', sector: '샤시·차체', products: ['샤시', '차체 부품'], tags: ['플랫폼', '가동률'], risk: 'medium', status: 'core' },
          { name: '서연이화', sector: '내장재', products: ['도어트림', '시트 부품'], tags: ['실내', '원가'], risk: 'medium', status: 'watch' },
          { name: '대원강업', sector: '스프링·시트', products: ['현가 스프링', '시트 부품'], tags: ['상용차', '원재료'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '현대오토에버', sector: '차량 소프트웨어', products: ['커넥티드카', '내비게이션', 'OTA'], tags: ['SDV', '소프트웨어'], risk: 'low', status: 'opportunity', region: '서울 강남' },
        children: [
          { name: '오비고', sector: '차량용 SW', products: ['스마트카 플랫폼', '브라우저'], tags: ['SDV', '고성장'], risk: 'medium', status: 'opportunity' },
          { name: '팅크웨어', sector: '모빌리티 단말', products: ['블랙박스', '지도 데이터'], tags: ['데이터', '소비재'], risk: 'medium', status: 'watch' },
          { name: '모바일어플라이언스', sector: 'ADAS 단말', products: ['블랙박스', 'ADAS', 'HUD'], tags: ['전장', '수주'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '엠씨넥스', sector: '차량용 카메라', products: ['카메라 모듈', '센서'], tags: ['자율주행', '카메라'], risk: 'medium', status: 'opportunity', region: '인천 연수' },
        children: [
          { name: '세코닉스', sector: '광학 부품', products: ['렌즈', '카메라 모듈'], tags: ['차량 카메라', '광학'], risk: 'medium', status: 'core' },
          { name: '캠시스', sector: '카메라 모듈', products: ['모바일·차량 카메라'], tags: ['모듈', '고객집중'], risk: 'high', status: 'watch' },
          { name: '파트론', sector: '센서·모듈', products: ['센서', '카메라 모듈'], tags: ['전장', '모바일'], risk: 'medium', status: 'core' },
        ],
      },
    ],
  },
  'kr-battery-materials': {
    tier1: [
      {
        company: { name: '에코프로비엠', sector: '양극재', products: ['NCA', 'NCM 양극재'], tags: ['메탈 가격', '증설'], risk: 'high', status: 'watch', region: '충북 청주' },
        children: [
          { name: '엘앤에프', sector: '양극재', products: ['하이니켈 양극재'], tags: ['수출', '메탈'], risk: 'high', status: 'watch' },
          { name: '코스모신소재', sector: '양극재·필름', products: ['양극재', 'MLCC 이형필름'], tags: ['증설', '소재'], risk: 'medium', status: 'core' },
          { name: '나노신소재', sector: '도전재', products: ['CNT 도전재', '디스플레이 소재'], tags: ['실리콘 음극재', '고성장'], risk: 'medium', status: 'opportunity' },
        ],
      },
      {
        company: { name: '엔켐', sector: '전해액', products: ['전해액', '첨가제'], tags: ['미국 증설', '고객 다변화'], risk: 'high', status: 'opportunity', region: '충북 제천' },
        children: [
          { name: '천보', sector: '전해질', products: ['리튬염', '첨가제'], tags: ['소재', '마진'], risk: 'medium', status: 'core' },
          { name: '후성', sector: '불소화학', products: ['전해질 소재', '냉매'], tags: ['원재료', '규제'], risk: 'high', status: 'watch' },
          { name: '솔브레인홀딩스', sector: '배터리 소재', products: ['전해액', '전자재료'], tags: ['소재', '다각화'], risk: 'medium', status: 'core' },
        ],
      },
      {
        company: { name: '피엔티', sector: '전극 공정 장비', products: ['롤투롤 장비', '전극 장비'], tags: ['장비 수주', '증설'], risk: 'medium', status: 'opportunity', region: '경북 구미' },
        children: [
          { name: '씨아이에스', sector: '전극 장비', products: ['코터', '캘린더'], tags: ['장비', '턴키'], risk: 'medium', status: 'core' },
          { name: '하나기술', sector: '조립·화성 장비', products: ['조립 장비', '검사 장비'], tags: ['수주', '해외'], risk: 'medium', status: 'opportunity' },
          { name: '필옵틱스', sector: '레이저 장비', products: ['레이저 노칭', '디스플레이 장비'], tags: ['레이저', '공정 전환'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '신흥에스이씨', sector: '배터리 부품', products: ['캡 어셈블리', 'CID'], tags: ['원통형', '안전 부품'], risk: 'medium', status: 'core', region: '경기 오산' },
        children: [
          { name: '상신이디피', sector: '배터리 캔', products: ['원통형 캔', '부품'], tags: ['원통형', '가동률'], risk: 'medium', status: 'core' },
          { name: '삼기이브이', sector: '배터리 케이스', products: ['엔드플레이트', '알루미늄 부품'], tags: ['경량화', 'EV'], risk: 'high', status: 'watch' },
          { name: '나라엠앤디', sector: '금형·부품', products: ['배터리 팩 부품', '금형'], tags: ['금형', '고객집중'], risk: 'medium', status: 'watch' },
        ],
      },
    ],
  },
  'kr-display': {
    tier1: [
      {
        company: { name: '덕산네오룩스', sector: 'OLED 유기재료', products: ['발광 재료', '공통층 재료'], tags: ['OLED', '소재'], risk: 'medium', status: 'core', region: '충남 천안' },
        children: [
          { name: '이녹스첨단소재', sector: '디스플레이 필름', products: ['OLED 소재', 'FPCB 소재'], tags: ['IT OLED', '소재'], risk: 'medium', status: 'core' },
          { name: '피엔에이치테크', sector: 'OLED 소재', products: ['OLED 중간체', '전자재료'], tags: ['소재', '고객집중'], risk: 'high', status: 'watch' },
          { name: '솔루스첨단소재', sector: '첨단소재', products: ['전자소재', '동박'], tags: ['소재', '전방 다변화'], risk: 'medium', status: 'opportunity' },
        ],
      },
      {
        company: { name: 'AP시스템', sector: 'OLED 장비', products: ['레이저 결정화', '증착 장비'], tags: ['장비', 'IT OLED'], risk: 'medium', status: 'opportunity', region: '경기 화성' },
        children: [
          { name: '선익시스템', sector: '증착 장비', products: ['OLED 증착기', '마이크로 OLED'], tags: ['증착', 'XR'], risk: 'medium', status: 'opportunity' },
          { name: '야스', sector: 'OLED 장비', products: ['증착 장비', '소스'], tags: ['OLED', '수주'], risk: 'high', status: 'watch' },
          { name: '주성엔지니어링', sector: '디스플레이 장비', products: ['증착', '태양광·반도체 장비'], tags: ['공정 장비', '다각화'], risk: 'medium', status: 'core' },
        ],
      },
      {
        company: { name: 'LX세미콘', sector: '디스플레이 IC', products: ['DDI', 'T-Con'], tags: ['패널 수요', '차량용'], risk: 'medium', status: 'core', region: '대전 유성' },
        children: [
          { name: '토비스', sector: '디스플레이 모듈', products: ['전장 디스플레이', '산업용 모니터'], tags: ['전장', '카지노'], risk: 'medium', status: 'opportunity' },
          { name: '제주반도체', sector: '메모리 반도체', products: ['모바일 메모리', '저전력 메모리'], tags: ['저전력', '온디바이스'], risk: 'medium', status: 'opportunity' },
          { name: '네패스아크', sector: '반도체 테스트', products: ['시스템반도체 테스트'], tags: ['테스트', '가동률'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '원익머트리얼즈', sector: '특수가스', products: ['공정가스', '전자재료'], tags: ['소재', '안정성'], risk: 'low', status: 'core', region: '충북 청주' },
        children: [
          { name: '덕산테코피아', sector: '전자재료', products: ['OLED 중간체', '반도체 소재'], tags: ['중간체', '증설'], risk: 'medium', status: 'core' },
          { name: '램테크놀러지', sector: '전자화학', products: ['식각액', '박리액'], tags: ['소재', '원재료'], risk: 'high', status: 'watch' },
          { name: '켐트로닉스', sector: '전자부품·화학', products: ['식각', '무선충전 부품'], tags: ['디스플레이', '전장'], risk: 'medium', status: 'watch' },
        ],
      },
    ],
  },
  'kr-ship-defense': {
    tier1: [
      {
        company: { name: '한국카본', sector: 'LNG 보냉재', products: ['LNG 보냉재', '복합소재'], tags: ['LNG선', '수주잔고'], risk: 'medium', status: 'core', region: '경남 밀양' },
        children: [
          { name: '동성화인텍', sector: '보냉재', products: ['LNG 보냉재', '단열재'], tags: ['LNG선', '수주'], risk: 'medium', status: 'core' },
          { name: '세진중공업', sector: '선박 구조물', products: ['데크하우스', 'LPG 탱크'], tags: ['조선 기자재', '가동률'], risk: 'medium', status: 'watch' },
          { name: '오리엔탈정공', sector: '선박 상부구조', products: ['선박 블록', '기자재'], tags: ['중소형 조선', '수주'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '하이록코리아', sector: '피팅·밸브', products: ['피팅', '밸브'], tags: ['조선', '플랜트'], risk: 'low', status: 'core', region: '부산 강서' },
        children: [
          { name: '성광벤드', sector: '관이음쇠', products: ['피팅', '플랜트 기자재'], tags: ['플랜트', '수출'], risk: 'medium', status: 'core' },
          { name: '태광', sector: '피팅', products: ['산업용 피팅', '플랜트 부품'], tags: ['원자재', '수주'], risk: 'medium', status: 'watch' },
          { name: '비엠티', sector: '밸브·피팅', products: ['계장용 피팅', '밸브'], tags: ['반도체', '조선'], risk: 'low', status: 'opportunity' },
        ],
      },
      {
        company: { name: '한화시스템', sector: '방산 전자', products: ['레이더', '위성통신', 'C4I'], tags: ['방산', '우주'], risk: 'low', status: 'opportunity', region: '경북 구미' },
        children: [
          { name: '인텔리안테크', sector: '위성통신 안테나', products: ['해상 안테나', '저궤도 통신'], tags: ['위성', '해상'], risk: 'medium', status: 'opportunity' },
          { name: '쎄트렉아이', sector: '위성 시스템', products: ['소형 위성', '지상국'], tags: ['우주', '국방'], risk: 'medium', status: 'opportunity' },
          { name: '제노코', sector: '우주·방산 부품', products: ['위성 탑재체', '방산 케이블'], tags: ['방산', '위성'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: 'STX엔진', sector: '엔진·동력', products: ['선박 엔진', '방산 엔진'], tags: ['함정', '엔진'], risk: 'medium', status: 'core', region: '경남 창원' },
        children: [
          { name: 'SNT다이내믹스', sector: '방산 구동장치', products: ['변속기', '총포 부품'], tags: ['방산', '기계'], risk: 'medium', status: 'core' },
          { name: '풍산', sector: '탄약·소재', products: ['탄약', '동합금'], tags: ['방산', '원자재'], risk: 'medium', status: 'watch' },
          { name: '퍼스텍', sector: '방산 부품', products: ['유도무기 부품', '무인기 부품'], tags: ['드론', '방산'], risk: 'high', status: 'watch' },
        ],
      },
    ],
  },
  'kr-bio-healthcare': {
    tier1: [
      {
        company: { name: '에스티팜', sector: '원료의약품·CDMO', products: ['올리고핵산', 'API'], tags: ['CDMO', '신약'], risk: 'medium', status: 'opportunity', region: '경기 시흥' },
        children: [
          { name: '바이넥스', sector: '바이오 위탁생산', products: ['바이오의약품 CMO', '주사제'], tags: ['생산', '가동률'], risk: 'high', status: 'watch' },
          { name: '프레스티지바이오로직스', sector: '바이오 CDMO', products: ['항체의약품 생산'], tags: ['CDMO', '수주'], risk: 'high', status: 'watch' },
          { name: '차바이오텍', sector: '세포치료제', products: ['세포치료', '위탁개발'], tags: ['세포치료', '장기투자'], risk: 'medium', status: 'opportunity' },
        ],
      },
      {
        company: { name: '알테오젠', sector: '바이오 플랫폼', products: ['SC 제형 기술', '바이오베터'], tags: ['기술이전', '플랫폼'], risk: 'medium', status: 'opportunity', region: '대전 유성' },
        children: [
          { name: '리가켐바이오', sector: 'ADC 플랫폼', products: ['ADC 신약', '링커 기술'], tags: ['ADC', '기술이전'], risk: 'medium', status: 'opportunity' },
          { name: '앱클론', sector: '항체 신약', products: ['CAR-T', '항체치료제'], tags: ['임상', '라이선스'], risk: 'high', status: 'watch' },
          { name: '와이바이오로직스', sector: '항체 플랫폼', products: ['항체 라이브러리', '면역항암제'], tags: ['플랫폼', '파트너십'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '클래시스', sector: '미용 의료기기', products: ['HIFU 장비', '소모품'], tags: ['소모품', '수출'], risk: 'low', status: 'core', region: '서울 강남' },
        children: [
          { name: '파마리서치', sector: '의료미용·재생', products: ['리쥬란', 'PN 제품'], tags: ['미용', '고마진'], risk: 'low', status: 'core' },
          { name: '메디톡스', sector: '보툴리눔 톡신', products: ['톡신', '필러'], tags: ['소송', '수출'], risk: 'high', status: 'watch' },
          { name: '휴젤', sector: '톡신·필러', products: ['톡신', '필러'], tags: ['글로벌 허가', '미용'], risk: 'medium', status: 'core' },
        ],
      },
      {
        company: { name: '씨젠', sector: '분자진단', products: ['진단키트', 'PCR 장비'], tags: ['진단', '현금흐름'], risk: 'medium', status: 'watch', region: '서울 송파' },
        children: [
          { name: '랩지노믹스', sector: '진단 서비스', products: ['유전체 분석', '진단'], tags: ['검사', '미국 확장'], risk: 'high', status: 'watch' },
          { name: '바디텍메드', sector: '현장진단', products: ['면역진단', 'POCT'], tags: ['수출', '소모품'], risk: 'medium', status: 'core' },
          { name: '엑세스바이오', sector: '진단키트', products: ['신속진단', '진단키트'], tags: ['수요 변동', '현금'], risk: 'high', status: 'watch' },
        ],
      },
    ],
  },
  'kr-ai-datacenter': {
    tier1: [
      {
        company: { name: '이수페타시스', sector: '고다층 PCB', products: ['서버 PCB', '네트워크 장비 PCB'], tags: ['AI 서버', '수주'], risk: 'medium', status: 'opportunity', region: '대구 달성' },
        children: [
          { name: '대덕전자', sector: '반도체 기판', products: ['FC-BGA', 'PCB'], tags: ['기판', 'AI 서버'], risk: 'medium', status: 'core' },
          { name: '심텍', sector: '패키지 기판', products: ['메모리 기판', 'FC-CSP'], tags: ['메모리', '가동률'], risk: 'high', status: 'watch' },
          { name: '코리아써키트', sector: 'PCB', products: ['HDI', '패키지 기판'], tags: ['전자부품', '수요 회복'], risk: 'medium', status: 'watch' },
        ],
      },
      {
        company: { name: '가온칩스', sector: '시스템반도체 디자인하우스', products: ['ASIC 설계', 'SoC 개발'], tags: ['AI 칩', '디자인하우스'], risk: 'medium', status: 'opportunity', region: '경기 성남' },
        children: [
          { name: '에이디테크놀로지', sector: '디자인하우스', products: ['SoC 설계', '칩 개발'], tags: ['팹리스', '수주'], risk: 'medium', status: 'opportunity' },
          { name: '칩스앤미디어', sector: '반도체 IP', products: ['비디오 IP', 'NPU IP'], tags: ['IP', '온디바이스 AI'], risk: 'medium', status: 'core' },
          { name: '오픈엣지테크놀로지', sector: 'AI 반도체 IP', products: ['NPU IP', '메모리 시스템 IP'], tags: ['AI IP', '라이선스'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '케이아이엔엑스', sector: 'IDC·인터넷 인프라', products: ['IDC', 'IX', '클라우드 연결'], tags: ['데이터센터', '트래픽'], risk: 'low', status: 'core', region: '서울 강남' },
        children: [
          { name: '가비아', sector: '클라우드·도메인', products: ['클라우드', '호스팅', '보안'], tags: ['중소기업 IT', '구독'], risk: 'low', status: 'core' },
          { name: '데이타솔루션', sector: '데이터 플랫폼', products: ['데이터 분석', 'AI 솔루션'], tags: ['공공', 'AI 도입'], risk: 'medium', status: 'watch' },
          { name: '더존비즈온', sector: '기업 SW', products: ['ERP', 'AI 업무 플랫폼'], tags: ['SaaS', '구독'], risk: 'medium', status: 'opportunity' },
        ],
      },
      {
        company: { name: '파두', sector: '데이터센터 반도체', products: ['SSD 컨트롤러', '스토리지 반도체'], tags: ['데이터센터', '고객 검증'], risk: 'high', status: 'watch', region: '서울 강남' },
        children: [
          { name: '텔레칩스', sector: '차량·AI 반도체', products: ['AP', 'AI 가속기'], tags: ['팹리스', '전장'], risk: 'medium', status: 'opportunity' },
          { name: '제주반도체', sector: '저전력 메모리', products: ['LPDDR', 'IoT 메모리'], tags: ['온디바이스 AI', '메모리'], risk: 'medium', status: 'opportunity' },
          { name: '네패스아크', sector: '반도체 테스트', products: ['시스템반도체 테스트'], tags: ['테스트', '가동률'], risk: 'high', status: 'watch' },
        ],
      },
    ],
  },
  'kr-robotics-automation': {
    tier1: [
      {
        company: { name: '에스피지', sector: '감속기·모터', products: ['정밀 감속기', '기어드 모터'], tags: ['로봇 부품', '국산화'], risk: 'medium', status: 'opportunity', region: '인천 남동' },
        children: [
          { name: '에스비비테크', sector: '하모닉 감속기', products: ['정밀 감속기', '베어링'], tags: ['감속기', '소형주'], risk: 'high', status: 'watch' },
          { name: '하이젠알앤엠', sector: '모터·로봇 부품', products: ['서보모터', '액추에이터'], tags: ['모터', '자동화'], risk: 'medium', status: 'opportunity' },
          { name: '삼익THK', sector: '직선운동 시스템', products: ['LM가이드', '메카트로닉스'], tags: ['자동화', '공작기계'], risk: 'low', status: 'core' },
        ],
      },
      {
        company: { name: '뉴로메카', sector: '협동로봇', products: ['협동로봇', '제어기'], tags: ['협동로봇', '중소 제조'], risk: 'high', status: 'opportunity', region: '서울 성동' },
        children: [
          { name: '유진로봇', sector: '서비스 로봇', products: ['자율주행 솔루션', '청소로봇'], tags: ['자율주행', '로봇'], risk: 'high', status: 'watch' },
          { name: '티로보틱스', sector: '물류·이송 로봇', products: ['AMR', '진공 로봇'], tags: ['물류', '디스플레이'], risk: 'medium', status: 'opportunity' },
          { name: '로보스타', sector: '산업용 로봇', products: ['직교 로봇', '스카라 로봇'], tags: ['산업 자동화', 'LG그룹'], risk: 'medium', status: 'core' },
        ],
      },
      {
        company: { name: '고영', sector: '머신비전·검사', products: ['3D 검사 장비', '스마트팩토리'], tags: ['머신비전', '의료로봇'], risk: 'low', status: 'core', region: '서울 금천' },
        children: [
          { name: '라온테크', sector: '진공 로봇', products: ['반도체 이송 로봇', '진공 로봇'], tags: ['반도체', '로봇'], risk: 'medium', status: 'opportunity' },
          { name: '코윈테크', sector: '물류 자동화', products: ['2차전지 자동화', '물류 시스템'], tags: ['배터리', '자동화'], risk: 'medium', status: 'core' },
          { name: '아진엑스텍', sector: '모션제어', products: ['모션 컨트롤러', '로봇 제어'], tags: ['제어기', '소형주'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '레인보우로보틱스', sector: '로봇 플랫폼', products: ['협동로봇', '휴머노이드'], tags: ['휴머노이드', '플랫폼'], risk: 'medium', status: 'opportunity', region: '대전 유성' },
        children: [
          { name: '로보티즈', sector: '액추에이터', products: ['다이나믹셀', '자율주행 로봇'], tags: ['부품', '서비스로봇'], risk: 'medium', status: 'core' },
          { name: '휴림로봇', sector: '산업용 로봇', products: ['제조 로봇', '서비스 로봇'], tags: ['테마성', '변동성'], risk: 'high', status: 'watch' },
          { name: '브이원텍', sector: '검사 자동화', products: ['검사 장비', '2차전지 장비'], tags: ['비전검사', '배터리'], risk: 'medium', status: 'watch' },
        ],
      },
    ],
  },
  'kr-cosmetics-consumer': {
    tier1: [
      {
        company: { name: '한국콜마', sector: '화장품 ODM', products: ['기초·색조 ODM', '건기식'], tags: ['ODM', 'K뷰티'], risk: 'low', status: 'core', region: '세종' },
        children: [
          { name: '코스메카코리아', sector: '화장품 ODM', products: ['기초·색조 ODM'], tags: ['인디브랜드', '미국'], risk: 'medium', status: 'opportunity' },
          { name: '한국화장품제조', sector: '화장품 제조', products: ['화장품 OEM', 'ODM'], tags: ['제조', '브랜드 고객'], risk: 'medium', status: 'watch' },
          { name: '콜마비앤에이치', sector: '건기식 ODM', products: ['건강기능식품', '소재'], tags: ['건기식', '수출'], risk: 'medium', status: 'core' },
        ],
      },
      {
        company: { name: '씨앤씨인터내셔널', sector: '색조 화장품 ODM', products: ['립', '색조 ODM'], tags: ['색조', '수출'], risk: 'medium', status: 'opportunity', region: '경기 화성' },
        children: [
          { name: '클리오', sector: '색조 브랜드', products: ['색조', '온라인 채널'], tags: ['브랜드', '일본·미국'], risk: 'medium', status: 'core' },
          { name: '아이패밀리에스씨', sector: '인디 화장품', products: ['롬앤', '색조'], tags: ['인디브랜드', '글로벌'], risk: 'medium', status: 'opportunity' },
          { name: '브이티', sector: '스킨케어 브랜드', products: ['리들샷', '마스크팩'], tags: ['일본', '인디브랜드'], risk: 'high', status: 'watch' },
        ],
      },
      {
        company: { name: '펌텍코리아', sector: '화장품 용기', products: ['펌프', '튜브', '친환경 용기'], tags: ['부자재', '친환경'], risk: 'low', status: 'core', region: '인천 부평' },
        children: [
          { name: '연우', sector: '화장품 용기', products: ['펌프 용기', '튜브'], tags: ['용기', '글로벌 고객'], risk: 'medium', status: 'core' },
          { name: '선진뷰티사이언스', sector: '화장품 소재', products: ['자외선 차단 소재', '파우더'], tags: ['소재', '수출'], risk: 'medium', status: 'opportunity' },
          { name: '현대바이오랜드', sector: '천연물 소재', products: ['화장품 소재', '건기식 소재'], tags: ['소재', '중국'], risk: 'medium', status: 'watch' },
        ],
      },
      {
        company: { name: '실리콘투', sector: 'K뷰티 유통', products: ['글로벌 유통', '물류 플랫폼'], tags: ['수출', '인디브랜드'], risk: 'medium', status: 'opportunity', region: '경기 성남' },
        children: [
          { name: '대봉엘에스', sector: '화장품·의약 소재', products: ['화장품 원료', 'API'], tags: ['소재', '제약'], risk: 'low', status: 'core' },
          { name: '케어젠', sector: '펩타이드 소재', products: ['펩타이드', '건기식'], tags: ['고마진', '소재'], risk: 'medium', status: 'opportunity' },
          { name: '토니모리', sector: '화장품 브랜드', products: ['로드숍', '스킨케어'], tags: ['턴어라운드', '브랜드'], risk: 'high', status: 'watch' },
        ],
      },
    ],
  },

"kr-insurance-financials": {
  "tier1": [
    {
      "company": {
        "name": "메리츠금융지주",
        "sector": "금융지주·보험",
        "products": [
          "손해보험",
          "증권",
          "자본정책"
        ],
        "tags": [
          "보험",
          "주주환원",
          "금융지주"
        ],
        "risk": "medium",
        "status": "core",
        "region": "서울 강남"
      },
      "children": [
        {
          "name": "에이플러스에셋",
          "sector": "보험 GA",
          "products": [
            "보험 판매",
            "설계사 플랫폼"
          ],
          "tags": [
            "GA",
            "채널"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "인카금융서비스",
          "sector": "보험 GA",
          "products": [
            "보험 비교·판매",
            "설계사 네트워크"
          ],
          "tags": [
            "GA",
            "플랫폼"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "헥토이노베이션",
          "sector": "인증·마이데이터",
          "products": [
            "본인인증",
            "마이데이터",
            "알림 서비스"
          ],
          "tags": [
            "핀테크",
            "인증"
          ],
          "risk": "low",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "한화생명",
        "sector": "생명보험",
        "products": [
          "보장성보험",
          "퇴직연금",
          "GA"
        ],
        "tags": [
          "생보",
          "자회사형 GA"
        ],
        "risk": "medium",
        "status": "core",
        "region": "서울 영등포"
      },
      "children": [
        {
          "name": "미래에셋생명",
          "sector": "생명보험",
          "products": [
            "변액보험",
            "퇴직연금"
          ],
          "tags": [
            "생보",
            "자산운용"
          ],
          "risk": "medium",
          "status": "watch"
        },
        {
          "name": "동양생명",
          "sector": "생명보험",
          "products": [
            "보장성보험",
            "저축성보험"
          ],
          "tags": [
            "생보",
            "채널"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "한화손해보험",
          "sector": "손해보험",
          "products": [
            "장기보험",
            "자동차보험"
          ],
          "tags": [
            "손보",
            "계열"
          ],
          "risk": "medium",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "현대해상",
        "sector": "손해보험",
        "products": [
          "자동차보험",
          "장기보험",
          "기업보험"
        ],
        "tags": [
          "손보",
          "자동차보험"
        ],
        "risk": "low",
        "status": "core",
        "region": "서울 종로"
      },
      "children": [
        {
          "name": "롯데손해보험",
          "sector": "손해보험",
          "products": [
            "장기보험",
            "기업보험"
          ],
          "tags": [
            "손보",
            "M&A"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "흥국화재",
          "sector": "손해보험",
          "products": [
            "자동차보험",
            "장기보험"
          ],
          "tags": [
            "손보",
            "중소형"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "파수",
          "sector": "보안·문서관리",
          "products": [
            "데이터 보안",
            "문서보안",
            "개인정보보호"
          ],
          "tags": [
            "보안",
            "금융 IT"
          ],
          "risk": "medium",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "코리안리",
        "sector": "재보험",
        "products": [
          "재보험",
          "기업 리스크",
          "해외 인수"
        ],
        "tags": [
          "재보험",
          "리스크"
        ],
        "risk": "medium",
        "status": "core",
        "region": "서울 종로"
      },
      "children": [
        {
          "name": "케이사인",
          "sector": "보안 인증",
          "products": [
            "PKI",
            "DB암호화",
            "인증"
          ],
          "tags": [
            "금융 보안",
            "인증"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "라온시큐어",
          "sector": "인증·보안",
          "products": [
            "모바일 보안",
            "생체인증",
            "DID"
          ],
          "tags": [
            "인증",
            "보안"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "더존비즈온",
          "sector": "금융·ERP SaaS",
          "products": [
            "ERP",
            "전자세금계산서",
            "금융 데이터"
          ],
          "tags": [
            "SaaS",
            "금융 데이터"
          ],
          "risk": "medium",
          "status": "core"
        }
      ]
    }
  ]
},
  "kr-banking-fintech": {
  "tier1": [
    {
      "company": {
        "name": "NICE평가정보",
        "sector": "신용정보",
        "products": [
          "개인신용평가",
          "본인인증",
          "데이터"
        ],
        "tags": [
          "신용정보",
          "데이터"
        ],
        "risk": "low",
        "status": "core",
        "region": "서울 영등포"
      },
      "children": [
        {
          "name": "쿠콘",
          "sector": "금융 데이터 API",
          "products": [
            "마이데이터",
            "계좌 API",
            "기업 데이터"
          ],
          "tags": [
            "API",
            "마이데이터"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "아톤",
          "sector": "핀테크 보안",
          "products": [
            "인증",
            "보안 매체",
            "모바일 OTP"
          ],
          "tags": [
            "인증",
            "보안"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "한국정보인증",
          "sector": "전자서명",
          "products": [
            "공동인증서",
            "전자계약",
            "보안"
          ],
          "tags": [
            "인증",
            "전자서명"
          ],
          "risk": "low",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "NHN KCP",
        "sector": "전자결제",
        "products": [
          "PG",
          "온라인 결제",
          "가맹점 정산"
        ],
        "tags": [
          "결제",
          "커머스"
        ],
        "risk": "medium",
        "status": "core",
        "region": "서울 구로"
      },
      "children": [
        {
          "name": "KG이니시스",
          "sector": "전자결제",
          "products": [
            "PG",
            "간편결제",
            "정산"
          ],
          "tags": [
            "결제",
            "PG"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "한국정보통신",
          "sector": "VAN·결제 단말",
          "products": [
            "VAN",
            "POS",
            "가맹점 네트워크"
          ],
          "tags": [
            "VAN",
            "오프라인 결제"
          ],
          "risk": "medium",
          "status": "watch"
        },
        {
          "name": "갤럭시아머니트리",
          "sector": "전자결제·상품권",
          "products": [
            "모바일 상품권",
            "전자결제",
            "머니트리"
          ],
          "tags": [
            "결제",
            "상품권"
          ],
          "risk": "high",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "카카오페이",
        "sector": "간편결제·금융 플랫폼",
        "products": [
          "간편결제",
          "송금",
          "증권",
          "보험 비교"
        ],
        "tags": [
          "플랫폼",
          "간편결제"
        ],
        "risk": "medium",
        "status": "opportunity",
        "region": "경기 성남"
      },
      "children": [
        {
          "name": "웹케시",
          "sector": "B2B 핀테크",
          "products": [
            "기업 자금관리",
            "경리나라",
            "금융 연동"
          ],
          "tags": [
            "B2B",
            "SaaS"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "핑거",
          "sector": "금융 플랫폼 SI",
          "products": [
            "스마트뱅킹",
            "마이데이터",
            "금융 플랫폼"
          ],
          "tags": [
            "SI",
            "디지털뱅킹"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "뱅크웨어글로벌",
          "sector": "코어뱅킹 소프트웨어",
          "products": [
            "코어뱅킹",
            "클라우드 금융",
            "계정계"
          ],
          "tags": [
            "코어뱅킹",
            "SaaS"
          ],
          "risk": "medium",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "비바리퍼블리카",
        "sector": "핀테크 플랫폼",
        "products": [
          "토스",
          "토스뱅크",
          "토스증권",
          "결제"
        ],
        "tags": [
          "비상장",
          "슈퍼앱"
        ],
        "risk": "medium",
        "status": "opportunity",
        "region": "서울 강남"
      },
      "children": [
        {
          "name": "다날",
          "sector": "휴대폰 결제",
          "products": [
            "휴대폰 결제",
            "페이먼트",
            "디지털 콘텐츠 정산"
          ],
          "tags": [
            "결제",
            "콘텐츠"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "헥토파이낸셜",
          "sector": "계좌 기반 결제",
          "products": [
            "가상계좌",
            "펌뱅킹",
            "간편현금결제"
          ],
          "tags": [
            "결제 인프라",
            "펌뱅킹"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "드림시큐리티",
          "sector": "보안 인증",
          "products": [
            "인증",
            "암호화",
            "전자문서"
          ],
          "tags": [
            "보안",
            "인증"
          ],
          "risk": "medium",
          "status": "opportunity"
        }
      ]
    }
  ]
},
  "kr-energy-utilities": {
  "tier1": [
    {
      "company": {
        "name": "LS ELECTRIC",
        "sector": "전력기기·자동화",
        "products": [
          "배전반",
          "인버터",
          "스마트그리드"
        ],
        "tags": [
          "전력기기",
          "자동화"
        ],
        "risk": "low",
        "status": "core",
        "region": "경기 안양"
      },
      "children": [
        {
          "name": "제룡전기",
          "sector": "변압기",
          "products": [
            "배전 변압기",
            "전력기기"
          ],
          "tags": [
            "변압기",
            "수출"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "일진전기",
          "sector": "전선·전력기기",
          "products": [
            "초고압 케이블",
            "변압기"
          ],
          "tags": [
            "전선",
            "전력망"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "비츠로테크",
          "sector": "전력 제어",
          "products": [
            "개폐기",
            "전력 제어"
          ],
          "tags": [
            "전력기기",
            "제어"
          ],
          "risk": "medium",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "효성중공업",
        "sector": "변압기·전력설비",
        "products": [
          "초고압 변압기",
          "차단기",
          "수소충전"
        ],
        "tags": [
          "변압기",
          "전력망"
        ],
        "risk": "low",
        "status": "core",
        "region": "서울 마포"
      },
      "children": [
        {
          "name": "HD현대일렉트릭",
          "sector": "전력기기",
          "products": [
            "변압기",
            "배전반",
            "회전기"
          ],
          "tags": [
            "전력망",
            "수출"
          ],
          "risk": "low",
          "status": "core"
        },
        {
          "name": "대한전선",
          "sector": "전선",
          "products": [
            "초고압 케이블",
            "해저케이블"
          ],
          "tags": [
            "케이블",
            "전력망"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "가온전선",
          "sector": "전선",
          "products": [
            "전력 케이블",
            "통신 케이블"
          ],
          "tags": [
            "케이블",
            "건설"
          ],
          "risk": "medium",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "한전기술",
        "sector": "원전 설계",
        "products": [
          "원전 설계",
          "SMR 엔지니어링"
        ],
        "tags": [
          "원전",
          "SMR"
        ],
        "risk": "medium",
        "status": "core",
        "region": "경북 김천"
      },
      "children": [
        {
          "name": "우진",
          "sector": "원전 계측기",
          "products": [
            "계측기",
            "방사선 감시"
          ],
          "tags": [
            "원전",
            "계측"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "비에이치아이",
          "sector": "발전 설비",
          "products": [
            "HRSG",
            "보일러",
            "복수기"
          ],
          "tags": [
            "발전설비",
            "원전"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "오르비텍",
          "sector": "원전 검사",
          "products": [
            "비파괴검사",
            "방사선 관리"
          ],
          "tags": [
            "검사",
            "원전"
          ],
          "risk": "high",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "씨에스윈드",
        "sector": "풍력 기자재",
        "products": [
          "풍력 타워",
          "해상풍력 구조물"
        ],
        "tags": [
          "풍력",
          "수출"
        ],
        "risk": "medium",
        "status": "opportunity",
        "region": "서울 강남"
      },
      "children": [
        {
          "name": "씨에스베어링",
          "sector": "풍력 베어링",
          "products": [
            "피치 베어링",
            "요 베어링"
          ],
          "tags": [
            "풍력",
            "부품"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "동국S&C",
          "sector": "풍력 타워",
          "products": [
            "풍력 타워",
            "철 구조물"
          ],
          "tags": [
            "풍력",
            "구조물"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "유니슨",
          "sector": "풍력 발전기",
          "products": [
            "풍력 터빈",
            "운영관리"
          ],
          "tags": [
            "풍력",
            "터빈"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    }
  ]
},
  "us-semiconductors": {
  "tier1": [
    {
      "company": {
        "name": "Applied Materials",
        "sector": "반도체 장비",
        "products": [
          "deposition",
          "etch",
          "process control"
        ],
        "tags": [
          "equipment",
          "capex"
        ],
        "risk": "medium",
        "status": "core",
        "region": "California"
      },
      "children": [
        {
          "name": "Onto Innovation",
          "sector": "공정 제어·검사",
          "products": [
            "metrology",
            "inspection"
          ],
          "tags": [
            "inspection",
            "advanced packaging"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Axcelis Technologies",
          "sector": "이온 주입 장비",
          "products": [
            "ion implanter",
            "power device tool"
          ],
          "tags": [
            "power semiconductor",
            "equipment"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "MKS Instruments",
          "sector": "공정 부품",
          "products": [
            "vacuum",
            "photonics",
            "process control"
          ],
          "tags": [
            "components",
            "semicap"
          ],
          "risk": "medium",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "Lam Research",
        "sector": "식각·증착 장비",
        "products": [
          "etch",
          "deposition",
          "clean"
        ],
        "tags": [
          "memory",
          "equipment"
        ],
        "risk": "medium",
        "status": "core",
        "region": "California"
      },
      "children": [
        {
          "name": "Ultra Clean Holdings",
          "sector": "장비 서브시스템",
          "products": [
            "gas delivery",
            "subsystems"
          ],
          "tags": [
            "subsystem",
            "semicap"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "Entegris",
          "sector": "소재·공정 솔루션",
          "products": [
            "filters",
            "specialty chemicals",
            "containers"
          ],
          "tags": [
            "materials",
            "purity"
          ],
          "risk": "low",
          "status": "core"
        },
        {
          "name": "FormFactor",
          "sector": "테스트 인터페이스",
          "products": [
            "probe cards",
            "test systems"
          ],
          "tags": [
            "test",
            "advanced packaging"
          ],
          "risk": "medium",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "KLA",
        "sector": "검사·계측",
        "products": [
          "inspection",
          "metrology",
          "process control"
        ],
        "tags": [
          "yield",
          "inspection"
        ],
        "risk": "low",
        "status": "core",
        "region": "California"
      },
      "children": [
        {
          "name": "Cohu",
          "sector": "테스트 핸들러",
          "products": [
            "test handlers",
            "inspection"
          ],
          "tags": [
            "test",
            "auto semis"
          ],
          "risk": "medium",
          "status": "watch"
        },
        {
          "name": "Teradyne",
          "sector": "반도체 테스트",
          "products": [
            "ATE",
            "wireless test"
          ],
          "tags": [
            "test",
            "AI chip"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "Kulicke & Soffa",
          "sector": "패키징 장비",
          "products": [
            "wire bonders",
            "advanced packaging"
          ],
          "tags": [
            "packaging",
            "assembly"
          ],
          "risk": "medium",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "Amkor Technology",
        "sector": "OSAT·패키징",
        "products": [
          "advanced packaging",
          "test",
          "assembly"
        ],
        "tags": [
          "OSAT",
          "packaging"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Arizona"
      },
      "children": [
        {
          "name": "Photronics",
          "sector": "포토마스크",
          "products": [
            "photomasks",
            "display masks"
          ],
          "tags": [
            "mask",
            "lithography"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "ACM Research",
          "sector": "웨이퍼 세정 장비",
          "products": [
            "cleaning tools",
            "plating"
          ],
          "tags": [
            "clean",
            "China exposure"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "SkyWater Technology",
          "sector": "특수 파운드리",
          "products": [
            "foundry",
            "advanced packaging"
          ],
          "tags": [
            "foundry",
            "defense"
          ],
          "risk": "high",
          "status": "opportunity"
        }
      ]
    }
  ]
},
  "us-ai-cloud-datacenter": {
  "tier1": [
    {
      "company": {
        "name": "Super Micro Computer",
        "sector": "AI 서버",
        "products": [
          "GPU server",
          "rack-scale systems"
        ],
        "tags": [
          "AI server",
          "rack"
        ],
        "risk": "high",
        "status": "opportunity",
        "region": "California"
      },
      "children": [
        {
          "name": "Celestica",
          "sector": "전자 제조 서비스",
          "products": [
            "EMS",
            "network hardware"
          ],
          "tags": [
            "EMS",
            "AI infrastructure"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "Jabil",
          "sector": "EMS",
          "products": [
            "manufacturing",
            "cloud hardware"
          ],
          "tags": [
            "EMS",
            "data center"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "Flex",
          "sector": "EMS·전력 모듈",
          "products": [
            "server manufacturing",
            "power systems"
          ],
          "tags": [
            "EMS",
            "power"
          ],
          "risk": "medium",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "Vertiv",
        "sector": "데이터센터 전력·냉각",
        "products": [
          "UPS",
          "thermal management",
          "racks"
        ],
        "tags": [
          "power",
          "cooling"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Ohio"
      },
      "children": [
        {
          "name": "Modine",
          "sector": "열관리",
          "products": [
            "cooling systems",
            "HVAC"
          ],
          "tags": [
            "cooling",
            "thermal"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "nVent Electric",
          "sector": "전기 인클로저",
          "products": [
            "enclosures",
            "thermal management"
          ],
          "tags": [
            "electrical",
            "data center"
          ],
          "risk": "low",
          "status": "core"
        },
        {
          "name": "Belden",
          "sector": "네트워크 케이블",
          "products": [
            "cable",
            "connectivity",
            "industrial network"
          ],
          "tags": [
            "cabling",
            "network"
          ],
          "risk": "medium",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "Arista Networks",
        "sector": "클라우드 네트워킹",
        "products": [
          "switching",
          "routing",
          "network OS"
        ],
        "tags": [
          "networking",
          "AI cluster"
        ],
        "risk": "medium",
        "status": "core",
        "region": "California"
      },
      "children": [
        {
          "name": "Coherent",
          "sector": "광통신 부품",
          "products": [
            "optical transceivers",
            "lasers"
          ],
          "tags": [
            "optics",
            "AI interconnect"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Lumentum",
          "sector": "광부품",
          "products": [
            "lasers",
            "optical modules"
          ],
          "tags": [
            "optics",
            "datacenter"
          ],
          "risk": "medium",
          "status": "watch"
        },
        {
          "name": "Fabrinet",
          "sector": "광통신 제조",
          "products": [
            "optical manufacturing",
            "precision assembly"
          ],
          "tags": [
            "optical EMS",
            "components"
          ],
          "risk": "medium",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "Dell Technologies",
        "sector": "서버·스토리지",
        "products": [
          "server",
          "storage",
          "AI infrastructure"
        ],
        "tags": [
          "server",
          "enterprise"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Texas"
      },
      "children": [
        {
          "name": "Pure Storage",
          "sector": "데이터 스토리지",
          "products": [
            "flash storage",
            "data platform"
          ],
          "tags": [
            "storage",
            "AI data"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Digital Realty",
          "sector": "데이터센터 리츠",
          "products": [
            "colocation",
            "data center"
          ],
          "tags": [
            "REIT",
            "capacity"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "Equinix",
          "sector": "데이터센터 인터커넥션",
          "products": [
            "colocation",
            "interconnection"
          ],
          "tags": [
            "REIT",
            "network"
          ],
          "risk": "low",
          "status": "core"
        }
      ]
    }
  ]
},
  "us-ev-mobility": {
  "tier1": [
    {
      "company": {
        "name": "Aptiv",
        "sector": "전장·ADAS",
        "products": [
          "ADAS",
          "vehicle architecture",
          "connectors"
        ],
        "tags": [
          "ADAS",
          "electrical architecture"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Ireland / Michigan"
      },
      "children": [
        {
          "name": "indie Semiconductor",
          "sector": "차량용 반도체",
          "products": [
            "ADAS chips",
            "mixed signal"
          ],
          "tags": [
            "auto semis",
            "ADAS"
          ],
          "risk": "high",
          "status": "opportunity"
        },
        {
          "name": "Ambarella",
          "sector": "AI 비전 SoC",
          "products": [
            "computer vision SoC",
            "edge AI"
          ],
          "tags": [
            "vision",
            "ADAS"
          ],
          "risk": "medium",
          "status": "watch"
        },
        {
          "name": "Gentex",
          "sector": "차량 전장",
          "products": [
            "mirrors",
            "camera systems"
          ],
          "tags": [
            "auto electronics",
            "safety"
          ],
          "risk": "low",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "BorgWarner",
        "sector": "파워트레인·전동화",
        "products": [
          "e-motor",
          "inverter",
          "thermal"
        ],
        "tags": [
          "EV parts",
          "powertrain"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Michigan"
      },
      "children": [
        {
          "name": "Dana",
          "sector": "구동계",
          "products": [
            "driveline",
            "e-propulsion"
          ],
          "tags": [
            "drivetrain",
            "EV"
          ],
          "risk": "medium",
          "status": "watch"
        },
        {
          "name": "American Axle",
          "sector": "구동계 부품",
          "products": [
            "axle",
            "driveline"
          ],
          "tags": [
            "legacy auto",
            "parts"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "Lear",
          "sector": "좌석·전장",
          "products": [
            "seating",
            "E-systems"
          ],
          "tags": [
            "interior",
            "electronics"
          ],
          "risk": "medium",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "Mobileye",
        "sector": "자율주행·ADAS",
        "products": [
          "ADAS chips",
          "autonomous driving"
        ],
        "tags": [
          "ADAS",
          "autonomy"
        ],
        "risk": "medium",
        "status": "opportunity",
        "region": "Israel / New York"
      },
      "children": [
        {
          "name": "Luminar",
          "sector": "라이다",
          "products": [
            "lidar sensors",
            "software"
          ],
          "tags": [
            "lidar",
            "autonomy"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "Ouster",
          "sector": "라이다 센서",
          "products": [
            "digital lidar",
            "perception"
          ],
          "tags": [
            "lidar",
            "robotics"
          ],
          "risk": "high",
          "status": "opportunity"
        },
        {
          "name": "Cepton",
          "sector": "라이다",
          "products": [
            "automotive lidar",
            "perception"
          ],
          "tags": [
            "lidar",
            "ADAS"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "ChargePoint",
        "sector": "EV 충전",
        "products": [
          "charging network",
          "fleet charging"
        ],
        "tags": [
          "charging",
          "infrastructure"
        ],
        "risk": "high",
        "status": "watch",
        "region": "California"
      },
      "children": [
        {
          "name": "Blink Charging",
          "sector": "EV 충전",
          "products": [
            "charging stations",
            "network"
          ],
          "tags": [
            "charging",
            "SME"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "EVgo",
          "sector": "급속충전",
          "products": [
            "fast charging",
            "network"
          ],
          "tags": [
            "charging",
            "infrastructure"
          ],
          "risk": "high",
          "status": "opportunity"
        },
        {
          "name": "Wallbox",
          "sector": "충전기",
          "products": [
            "home charger",
            "energy management"
          ],
          "tags": [
            "charger",
            "Europe"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    }
  ]
},
  "us-energy-grid": {
  "tier1": [
    {
      "company": {
        "name": "Quanta Services",
        "sector": "전력망 시공",
        "products": [
          "transmission construction",
          "grid services"
        ],
        "tags": [
          "grid",
          "infrastructure"
        ],
        "risk": "low",
        "status": "core",
        "region": "Texas"
      },
      "children": [
        {
          "name": "MYR Group",
          "sector": "전력 인프라 시공",
          "products": [
            "transmission",
            "distribution construction"
          ],
          "tags": [
            "grid construction",
            "utility"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Primoris Services",
          "sector": "에너지 인프라 EPC",
          "products": [
            "utility EPC",
            "renewables construction"
          ],
          "tags": [
            "EPC",
            "grid"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "MasTec",
          "sector": "인프라 시공",
          "products": [
            "power delivery",
            "communications"
          ],
          "tags": [
            "infrastructure",
            "grid"
          ],
          "risk": "medium",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "Hubbell",
        "sector": "전력기기",
        "products": [
          "utility connectors",
          "electrical products"
        ],
        "tags": [
          "power equipment",
          "utility"
        ],
        "risk": "low",
        "status": "core",
        "region": "Connecticut"
      },
      "children": [
        {
          "name": "Powell Industries",
          "sector": "전력 배전 장비",
          "products": [
            "switchgear",
            "power control rooms"
          ],
          "tags": [
            "switchgear",
            "data center"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Itron",
          "sector": "스마트미터",
          "products": [
            "smart meters",
            "grid analytics"
          ],
          "tags": [
            "metering",
            "grid data"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "Atkore",
          "sector": "전기 배관·케이블 관리",
          "products": [
            "conduit",
            "cable management"
          ],
          "tags": [
            "electrical infra",
            "construction"
          ],
          "risk": "medium",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "First Solar",
        "sector": "태양광 모듈",
        "products": [
          "thin-film modules",
          "utility solar"
        ],
        "tags": [
          "solar",
          "US manufacturing"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Arizona"
      },
      "children": [
        {
          "name": "Nextracker",
          "sector": "태양광 추적기",
          "products": [
            "solar trackers",
            "software"
          ],
          "tags": [
            "solar",
            "tracker"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Array Technologies",
          "sector": "태양광 추적기",
          "products": [
            "solar tracking systems"
          ],
          "tags": [
            "solar",
            "utility"
          ],
          "risk": "medium",
          "status": "watch"
        },
        {
          "name": "Shoals Technologies",
          "sector": "태양광 전기부품",
          "products": [
            "EBOS",
            "connectors"
          ],
          "tags": [
            "solar BOS",
            "components"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "Fluence Energy",
        "sector": "ESS",
        "products": [
          "battery storage",
          "energy management software"
        ],
        "tags": [
          "storage",
          "grid"
        ],
        "risk": "high",
        "status": "opportunity",
        "region": "Virginia"
      },
      "children": [
        {
          "name": "Stem",
          "sector": "에너지 소프트웨어",
          "products": [
            "storage AI",
            "energy management"
          ],
          "tags": [
            "software",
            "storage"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "Enphase Energy",
          "sector": "태양광 인버터",
          "products": [
            "microinverter",
            "storage"
          ],
          "tags": [
            "solar",
            "inverter"
          ],
          "risk": "medium",
          "status": "watch"
        },
        {
          "name": "SolarEdge",
          "sector": "태양광 인버터",
          "products": [
            "inverter",
            "optimizer"
          ],
          "tags": [
            "solar",
            "power electronics"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    }
  ]
},
  "us-insurance-financials": {
  "tier1": [
    {
      "company": {
        "name": "Marsh McLennan",
        "sector": "보험 브로커·리스크 자문",
        "products": [
          "brokerage",
          "risk consulting"
        ],
        "tags": [
          "broker",
          "risk"
        ],
        "risk": "low",
        "status": "core",
        "region": "New York"
      },
      "children": [
        {
          "name": "Ryan Specialty",
          "sector": "특수보험 브로커",
          "products": [
            "wholesale brokerage",
            "specialty insurance"
          ],
          "tags": [
            "specialty",
            "broker"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Goosehead Insurance",
          "sector": "개인보험 플랫폼",
          "products": [
            "insurance agency",
            "franchise"
          ],
          "tags": [
            "agency",
            "personal lines"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "eHealth",
          "sector": "보험 마켓플레이스",
          "products": [
            "health insurance marketplace"
          ],
          "tags": [
            "marketplace",
            "health"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "Aon",
        "sector": "보험 브로커·재보험",
        "products": [
          "risk",
          "reinsurance",
          "benefits"
        ],
        "tags": [
          "broker",
          "reinsurance"
        ],
        "risk": "low",
        "status": "core",
        "region": "Ireland / Illinois"
      },
      "children": [
        {
          "name": "Reinsurance Group of America",
          "sector": "생명 재보험",
          "products": [
            "life reinsurance",
            "risk solutions"
          ],
          "tags": [
            "reinsurance",
            "life"
          ],
          "risk": "low",
          "status": "core"
        },
        {
          "name": "Kinsale Capital",
          "sector": "E&S 보험",
          "products": [
            "excess and surplus insurance"
          ],
          "tags": [
            "specialty P&C",
            "underwriting"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Palomar Holdings",
          "sector": "특수재난 보험",
          "products": [
            "earthquake insurance",
            "specialty property"
          ],
          "tags": [
            "cat risk",
            "specialty"
          ],
          "risk": "high",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "Guidewire Software",
        "sector": "보험 코어 시스템",
        "products": [
          "P&C core platform",
          "claims software"
        ],
        "tags": [
          "insurance SaaS",
          "core system"
        ],
        "risk": "medium",
        "status": "core",
        "region": "California"
      },
      "children": [
        {
          "name": "Verisk Analytics",
          "sector": "보험 데이터·분석",
          "products": [
            "risk data",
            "analytics"
          ],
          "tags": [
            "data",
            "underwriting"
          ],
          "risk": "low",
          "status": "core"
        },
        {
          "name": "CCC Intelligent Solutions",
          "sector": "보험 청구 SW",
          "products": [
            "auto claims software",
            "AI estimating"
          ],
          "tags": [
            "claims",
            "software"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "Lemonade",
          "sector": "인슈어테크",
          "products": [
            "digital insurance",
            "AI claims"
          ],
          "tags": [
            "insurtech",
            "digital"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "Brown & Brown",
        "sector": "보험 중개",
        "products": [
          "brokerage",
          "program business"
        ],
        "tags": [
          "broker",
          "roll-up"
        ],
        "risk": "low",
        "status": "core",
        "region": "Florida"
      },
      "children": [
        {
          "name": "RLI",
          "sector": "특수보험",
          "products": [
            "specialty insurance",
            "surety"
          ],
          "tags": [
            "specialty",
            "P&C"
          ],
          "risk": "low",
          "status": "core"
        },
        {
          "name": "Skyward Specialty",
          "sector": "특수보험",
          "products": [
            "specialty P&C",
            "program insurance"
          ],
          "tags": [
            "specialty",
            "SMID"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Root",
          "sector": "자동차 인슈어테크",
          "products": [
            "telematics auto insurance"
          ],
          "tags": [
            "insurtech",
            "telematics"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    }
  ]
},
  "us-banking-fintech": {
  "tier1": [
    {
      "company": {
        "name": "Fiserv",
        "sector": "결제·은행 IT",
        "products": [
          "merchant acquiring",
          "core processing"
        ],
        "tags": [
          "payments",
          "bank tech"
        ],
        "risk": "low",
        "status": "core",
        "region": "Wisconsin"
      },
      "children": [
        {
          "name": "Marqeta",
          "sector": "카드 발급 플랫폼",
          "products": [
            "card issuing",
            "payment API"
          ],
          "tags": [
            "API",
            "cards"
          ],
          "risk": "high",
          "status": "opportunity"
        },
        {
          "name": "Flywire",
          "sector": "수직 특화 결제",
          "products": [
            "education payments",
            "healthcare payments"
          ],
          "tags": [
            "payments",
            "vertical SaaS"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Shift4 Payments",
          "sector": "가맹점 결제",
          "products": [
            "integrated payments",
            "POS"
          ],
          "tags": [
            "merchant",
            "payments"
          ],
          "risk": "medium",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "FIS",
        "sector": "코어뱅킹·자본시장 IT",
        "products": [
          "core banking",
          "capital markets software"
        ],
        "tags": [
          "bank tech",
          "core"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Florida"
      },
      "children": [
        {
          "name": "nCino",
          "sector": "은행 SaaS",
          "products": [
            "loan origination",
            "commercial banking SaaS"
          ],
          "tags": [
            "bank SaaS",
            "lending"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Alkami Technology",
          "sector": "디지털뱅킹 SaaS",
          "products": [
            "digital banking platform"
          ],
          "tags": [
            "digital banking",
            "SaaS"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Q2 Holdings",
          "sector": "은행 디지털 플랫폼",
          "products": [
            "digital banking",
            "lending software"
          ],
          "tags": [
            "bank SaaS",
            "community banks"
          ],
          "risk": "medium",
          "status": "core"
        }
      ]
    },
    {
      "company": {
        "name": "Jack Henry",
        "sector": "지역은행 코어 시스템",
        "products": [
          "core processing",
          "digital banking"
        ],
        "tags": [
          "community bank",
          "core"
        ],
        "risk": "low",
        "status": "core",
        "region": "Missouri"
      },
      "children": [
        {
          "name": "Upstart",
          "sector": "AI 대출 플랫폼",
          "products": [
            "AI lending",
            "personal loans"
          ],
          "tags": [
            "AI credit",
            "lending"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "Affirm",
          "sector": "BNPL·소비자 금융",
          "products": [
            "buy now pay later",
            "merchant financing"
          ],
          "tags": [
            "BNPL",
            "consumer credit"
          ],
          "risk": "high",
          "status": "opportunity"
        },
        {
          "name": "SoFi Technologies",
          "sector": "디지털 금융 플랫폼",
          "products": [
            "loans",
            "banking",
            "brokerage"
          ],
          "tags": [
            "digital bank",
            "consumer finance"
          ],
          "risk": "medium",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "Global Payments",
        "sector": "결제 처리",
        "products": [
          "merchant acquiring",
          "issuer processing"
        ],
        "tags": [
          "payments",
          "merchant"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Georgia"
      },
      "children": [
        {
          "name": "Remitly",
          "sector": "송금 핀테크",
          "products": [
            "international remittance",
            "digital wallet"
          ],
          "tags": [
            "remittance",
            "fintech"
          ],
          "risk": "high",
          "status": "opportunity"
        },
        {
          "name": "Payoneer",
          "sector": "크로스보더 결제",
          "products": [
            "B2B payments",
            "merchant payout"
          ],
          "tags": [
            "cross-border",
            "payments"
          ],
          "risk": "medium",
          "status": "watch"
        },
        {
          "name": "Bill.com",
          "sector": "B2B 결제 SaaS",
          "products": [
            "AP/AR automation",
            "B2B payments"
          ],
          "tags": [
            "B2B",
            "SaaS"
          ],
          "risk": "medium",
          "status": "core"
        }
      ]
    }
  ]
},
  "us-healthcare-biopharma": {
  "tier1": [
    {
      "company": {
        "name": "Thermo Fisher Scientific",
        "sector": "생명과학 장비·소모품",
        "products": [
          "lab equipment",
          "CDMO",
          "diagnostics"
        ],
        "tags": [
          "life science tools",
          "CDMO"
        ],
        "risk": "low",
        "status": "core",
        "region": "Massachusetts"
      },
      "children": [
        {
          "name": "Repligen",
          "sector": "바이오공정 소모품",
          "products": [
            "filtration",
            "chromatography"
          ],
          "tags": [
            "bioprocess",
            "consumables"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Maravai LifeSciences",
          "sector": "핵산·시약",
          "products": [
            "nucleic acid production",
            "reagents"
          ],
          "tags": [
            "reagents",
            "mRNA"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "Twist Bioscience",
          "sector": "합성 DNA",
          "products": [
            "synthetic DNA",
            "NGS tools"
          ],
          "tags": [
            "synthetic biology",
            "NGS"
          ],
          "risk": "high",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "Danaher",
        "sector": "생명과학·진단 장비",
        "products": [
          "bioprocess",
          "diagnostics",
          "water quality"
        ],
        "tags": [
          "life science",
          "diagnostics"
        ],
        "risk": "low",
        "status": "core",
        "region": "Washington DC"
      },
      "children": [
        {
          "name": "Sotera Health",
          "sector": "멸균·랩서비스",
          "products": [
            "sterilization",
            "lab testing"
          ],
          "tags": [
            "medtech services",
            "sterilization"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "10x Genomics",
          "sector": "싱글셀 분석",
          "products": [
            "single-cell sequencing",
            "spatial biology"
          ],
          "tags": [
            "genomics",
            "tools"
          ],
          "risk": "high",
          "status": "opportunity"
        },
        {
          "name": "Quanterix",
          "sector": "초고감도 진단",
          "products": [
            "biomarker detection",
            "Simoa"
          ],
          "tags": [
            "diagnostics",
            "neurology"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "IQVIA",
        "sector": "CRO·헬스 데이터",
        "products": [
          "clinical research",
          "real-world data"
        ],
        "tags": [
          "CRO",
          "data"
        ],
        "risk": "medium",
        "status": "core",
        "region": "North Carolina"
      },
      "children": [
        {
          "name": "Medpace",
          "sector": "CRO",
          "products": [
            "clinical trials",
            "drug development services"
          ],
          "tags": [
            "CRO",
            "SMID"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "Veeva Systems",
          "sector": "제약 SaaS",
          "products": [
            "CRM",
            "clinical data cloud"
          ],
          "tags": [
            "SaaS",
            "pharma"
          ],
          "risk": "low",
          "status": "core"
        },
        {
          "name": "Schrödinger",
          "sector": "AI 신약개발 SW",
          "products": [
            "molecular modeling",
            "drug discovery"
          ],
          "tags": [
            "AI drug",
            "software"
          ],
          "risk": "high",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "Labcorp",
        "sector": "진단·임상시험 서비스",
        "products": [
          "diagnostic testing",
          "central lab"
        ],
        "tags": [
          "diagnostics",
          "CRO"
        ],
        "risk": "medium",
        "status": "core",
        "region": "North Carolina"
      },
      "children": [
        {
          "name": "Guardant Health",
          "sector": "액체생검",
          "products": [
            "cancer diagnostics",
            "liquid biopsy"
          ],
          "tags": [
            "diagnostics",
            "oncology"
          ],
          "risk": "high",
          "status": "opportunity"
        },
        {
          "name": "Natera",
          "sector": "유전자 진단",
          "products": [
            "prenatal testing",
            "oncology testing"
          ],
          "tags": [
            "genomics",
            "diagnostics"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "Exact Sciences",
          "sector": "암 진단",
          "products": [
            "Cologuard",
            "cancer screening"
          ],
          "tags": [
            "screening",
            "diagnostics"
          ],
          "risk": "medium",
          "status": "watch"
        }
      ]
    }
  ]
},
  "us-aerospace-defense": {
  "tier1": [
    {
      "company": {
        "name": "Northrop Grumman",
        "sector": "방산·우주 시스템",
        "products": [
          "space systems",
          "missile defense",
          "sensors"
        ],
        "tags": [
          "defense prime",
          "space"
        ],
        "risk": "low",
        "status": "core",
        "region": "Virginia"
      },
      "children": [
        {
          "name": "Kratos Defense",
          "sector": "무인기·방산 전자",
          "products": [
            "target drones",
            "defense electronics"
          ],
          "tags": [
            "drone",
            "defense"
          ],
          "risk": "medium",
          "status": "opportunity"
        },
        {
          "name": "Redwire",
          "sector": "우주 인프라",
          "products": [
            "space components",
            "in-space manufacturing"
          ],
          "tags": [
            "space",
            "SMID"
          ],
          "risk": "high",
          "status": "opportunity"
        },
        {
          "name": "Rocket Lab",
          "sector": "소형 발사체·우주 시스템",
          "products": [
            "launch",
            "spacecraft components"
          ],
          "tags": [
            "space",
            "launch"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    },
    {
      "company": {
        "name": "L3Harris",
        "sector": "방산 통신·전자",
        "products": [
          "radios",
          "sensors",
          "space payloads"
        ],
        "tags": [
          "defense electronics",
          "communications"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Florida"
      },
      "children": [
        {
          "name": "Mercury Systems",
          "sector": "방산 전자 모듈",
          "products": [
            "rugged electronics",
            "mission systems"
          ],
          "tags": [
            "defense electronics",
            "modules"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "Viasat",
          "sector": "위성통신",
          "products": [
            "satellite communications",
            "defense connectivity"
          ],
          "tags": [
            "satcom",
            "defense"
          ],
          "risk": "high",
          "status": "watch"
        },
        {
          "name": "Comtech",
          "sector": "위성·지상 통신",
          "products": [
            "satellite ground systems",
            "public safety"
          ],
          "tags": [
            "communications",
            "satellite"
          ],
          "risk": "high",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "Textron",
        "sector": "항공·방산 플랫폼",
        "products": [
          "business jet",
          "helicopter",
          "military vehicles"
        ],
        "tags": [
          "aviation",
          "defense"
        ],
        "risk": "medium",
        "status": "core",
        "region": "Rhode Island"
      },
      "children": [
        {
          "name": "Curtiss-Wright",
          "sector": "방산·항공 부품",
          "products": [
            "actuation",
            "sensors",
            "defense electronics"
          ],
          "tags": [
            "components",
            "defense"
          ],
          "risk": "low",
          "status": "core"
        },
        {
          "name": "Woodward",
          "sector": "항공·에너지 제어",
          "products": [
            "engine control",
            "fuel systems"
          ],
          "tags": [
            "aerospace parts",
            "control"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "Astronics",
          "sector": "항공 전기 시스템",
          "products": [
            "aircraft power",
            "lighting",
            "test"
          ],
          "tags": [
            "aircraft electronics",
            "supplier"
          ],
          "risk": "high",
          "status": "opportunity"
        }
      ]
    },
    {
      "company": {
        "name": "AeroVironment",
        "sector": "드론·배회탄약",
        "products": [
          "UAS",
          "loitering munition"
        ],
        "tags": [
          "drone",
          "defense"
        ],
        "risk": "medium",
        "status": "opportunity",
        "region": "Virginia"
      },
      "children": [
        {
          "name": "Leonardo DRS",
          "sector": "방산 전자·센서",
          "products": [
            "sensors",
            "naval power",
            "electro-optics"
          ],
          "tags": [
            "defense electronics",
            "sensor"
          ],
          "risk": "medium",
          "status": "core"
        },
        {
          "name": "BWX Technologies",
          "sector": "원자력 방산 부품",
          "products": [
            "naval nuclear components",
            "reactors"
          ],
          "tags": [
            "nuclear",
            "defense"
          ],
          "risk": "low",
          "status": "core"
        },
        {
          "name": "Triumph Group",
          "sector": "항공 부품",
          "products": [
            "structures",
            "systems",
            "MRO"
          ],
          "tags": [
            "aerospace parts",
            "turnaround"
          ],
          "risk": "high",
          "status": "watch"
        }
      ]
    }
  ]
},
};

const defaultTemplate = chainTemplates['kr-semiconductors'];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, '-')
    .replace(/^-|-$/g, '');
}

function metric(seed: number, base: number, step: number, unit = '') {
  return `${base + seed * step}${unit}`;
}

function metricValue(seed: number, base: number, step: number) {
  return base + seed * step;
}

function revenueUnit(country: CountryId) {
  return country === 'KR' ? '단위: 백만원' : '단위: 백만달러';
}

function revenueBasis(country: CountryId, sourceType: SourceType) {
  if (sourceType === 'official') {
    return country === 'KR'
      ? 'DART 최근 사업보고서 연결 손익계산서 원문 확인'
      : 'SEC 최근 10-K 연결 손익계산서 원문 확인';
  }
  return country === 'KR'
    ? 'DART 표시 방식에 맞춘 스크리닝 값. 실제 수치는 사업보고서 원문으로 확인'
    : 'SEC 10-K 표시 방식에 맞춘 스크리닝 값. 실제 수치는 원문으로 확인';
}

function growthBasis(country: CountryId) {
  return country === 'KR'
    ? '전년 동기 또는 전 사업연도 연결 매출액 대비. 원문 연결 전에는 후보 스크리닝 기준'
    : '전년 동기 또는 전 회계연도 revenue 대비. 원문 연결 전에는 후보 스크리닝 기준';
}

function formatDisclosureRevenue(country: CountryId, amount: number) {
  const value = country === 'KR' ? amount * 100 : amount;
  return value.toLocaleString(country === 'KR' ? 'ko-KR' : 'en-US');
}

function companySourceNote(tier: CompanyTier) {
  if (tier === 'anchor') return '공시·IR·거래소·감독기관 데이터 연결 대상';
  return '실명 기업 기반 검증 후보입니다. 특정 앵커 납품 관계는 공시·IR·계약·뉴스 API로 추가 확인해야 합니다.';
}

function buildCompanies() {
  const generatedCompanies: Company[] = [];
  const generatedLinks: SupplyLink[] = [];
  const generatedOpinions: AnalystOpinion[] = [];

  anchors.forEach((anchor, anchorIndex) => {
    const template = chainTemplates[anchor.sectorId] ?? defaultTemplate;
    const anchorCompany: Company = {
      id: anchor.id,
      anchorId: anchor.id,
      country: anchor.country,
      sectorId: anchor.sectorId,
      name: anchor.name,
      legalName: anchor.legalName,
      ticker: anchor.ticker,
      tier: 'anchor',
      sector: anchor.sector,
      region: anchor.region,
      products: anchor.products,
      anchorCustomer: '기준 기업',
      revenue: anchor.country === 'KR' ? 'DART 원문 확인' : 'SEC 원문 확인',
      revenueUnit: revenueUnit(anchor.country),
      revenueBasis: revenueBasis(anchor.country, 'official'),
      revenueTrend: 4.8 + anchor.rank * 1.4,
      growthBasis: growthBasis(anchor.country),
      opMargin: '공시 연결',
      debtRatio: '공시 연결',
      customerConcentration: 'N/A',
      analystSignal: '컨센서스·공시 API 연결 대상',
      investmentView: `${anchor.sector} 섹터의 수요·투자 사이클 기준 기업`,
      riskLevel: 'low',
      status: 'core',
      tags: ['앵커 기업', anchor.exchange, anchor.ticker],
      notes: '하위 협력 기업을 스크리닝하기 위한 기준 노드입니다. 실제 공급 관계는 연결된 공시·뉴스·계약 데이터로 검증하도록 설계했습니다.',
      sourceType: 'official',
      sourceNote: companySourceNote('anchor'),
      layout: { column: 0, row: 1 },
    };
    generatedCompanies.push(anchorCompany);

    generatedOpinions.push(
      {
        id: `${anchor.id}-cycle`,
        companyId: anchor.id,
        firm: '공급망 스코어링 모델',
        stance: anchor.rank === 1 ? '섹터 기준 기업' : anchor.rank === 2 ? '수혜 확산 관찰' : '변곡점 관찰',
        horizon: '6~12개월',
        date: 'seed',
        summary: `${anchor.name}의 투자·수주·재고 사이클은 하위 협력 기업의 매출 가시성과 밸류에이션에 직접적인 선행 신호가 됩니다.`,
        sourceType: 'seed-model',
      },
      {
        id: `${anchor.id}-policy`,
        companyId: anchor.id,
        firm: '검증 정책',
        stance: '관계 검증 필요',
        horizon: '상시',
        date: 'seed',
        summary: '현재 데이터는 실명 기업 기반 후보군이며, 특정 앵커와의 납품 여부는 DART/SEC, IR, 수주 공시, 감독기관 자료, 기사 원문으로 확인해야 합니다.',
        sourceType: 'seed-model',
      },
    );

    template.tier1.forEach((tier1, tier1Index) => {
      const tier1Id = `${anchor.id}-${slugify(tier1.company.name)}`;
      const trendSeed = anchorIndex + tier1Index + 1;
      const tier1Revenue = metricValue(trendSeed, 2_400, 520);
      const tier1Company: Company = {
        id: tier1Id,
        anchorId: anchor.id,
        country: anchor.country,
        sectorId: anchor.sectorId,
        name: tier1.company.name,
        legalName: tier1.company.name,
        tier: 'tier1',
        sector: tier1.company.sector,
        region: tier1.company.region ?? '국내 주요 협력 기업군',
        products: tier1.company.products,
        anchorCustomer: anchor.name,
        revenue: formatDisclosureRevenue(anchor.country, tier1Revenue),
        revenueUnit: revenueUnit(anchor.country),
        revenueBasis: revenueBasis(anchor.country, 'seed-model'),
        revenueTrend: tier1.company.status === 'opportunity' ? 11.4 + trendSeed * 1.2 : 5.2 + trendSeed * 0.8,
        growthBasis: growthBasis(anchor.country),
        opMargin: `${(6.2 + trendSeed * 0.75).toFixed(1)}%`,
        debtRatio: tier1.company.risk === 'high' ? `${metric(trendSeed, 88, 7)}%` : `${metric(trendSeed, 42, 6)}%`,
        customerConcentration: `${metric(trendSeed, 34, 4)}%`,
        analystSignal: '1차 협력 기업 스코어',
        investmentView: `${anchor.name} 투자·수요 사이클과 함께 확인할 1차 협력 기업`,
        riskLevel: tier1.company.risk,
        status: tier1.company.status,
        tags: tier1.company.tags,
        notes: '실제 상장·비상장 기업명을 넣은 1차 협력 후보입니다. 관계 확정 전에는 공급 가능 영역과 전방 노출도를 중심으로 해석해야 합니다.',
        sourceType: 'seed-model',
        sourceNote: companySourceNote('tier1'),
        layout: { column: 1, row: tier1Index },
      };
      generatedCompanies.push(tier1Company);
      generatedLinks.push({
        id: `${anchor.id}-${tier1Id}`,
        anchorId: anchor.id,
        source: anchor.id,
        target: tier1Id,
        label: tier1.company.sector,
        dependency: 36 + tier1Index * 8 + anchor.rank,
        value: `검증 노출도 ${metric(trendSeed, 41, 5)}점`,
      });

      generatedOpinions.push({
        id: `${tier1Id}-opinion`,
        companyId: tier1Id,
        firm: '협력망 후보 모델',
        stance: tier1.company.status === 'opportunity' ? '우선 검토' : tier1.company.status === 'watch' ? '리스크 확인' : '핵심 관찰',
        horizon: '3~6개월',
        date: 'seed',
        summary: `${tier1.company.name}은 ${tier1.company.sector} 영역에서 ${anchor.name} 관련 수요 변화와 함께 추적할 후보입니다. 고객 집중도와 수주 공시 확인이 필요합니다.`,
        sourceType: 'seed-model',
      });

      tier1.children.forEach((child, childIndex) => {
        const childId = `${tier1Id}-${slugify(child.name)}`;
        const childSeed = anchorIndex + tier1Index * 3 + childIndex + 2;
        const childRevenue = metricValue(childSeed, 620, 88);
        const childCompany: Company = {
          id: childId,
          anchorId: anchor.id,
          country: anchor.country,
          sectorId: anchor.sectorId,
          name: child.name,
          legalName: child.name,
          tier: 'tier2',
          sector: child.sector,
          region: child.region ?? '국내 하청·중소형 협력 기업군',
          products: child.products,
          anchorCustomer: tier1.company.name,
          revenue: formatDisclosureRevenue(anchor.country, childRevenue),
          revenueUnit: revenueUnit(anchor.country),
          revenueBasis: revenueBasis(anchor.country, 'seed-model'),
          revenueTrend: child.status === 'opportunity' ? 13.6 + childSeed * 0.85 : 3.8 + childSeed * 0.65,
          growthBasis: growthBasis(anchor.country),
          opMargin: `${(4.8 + childSeed * 0.45).toFixed(1)}%`,
          debtRatio: child.risk === 'high' ? `${metric(childSeed, 92, 6)}%` : `${metric(childSeed, 38, 5)}%`,
          customerConcentration: child.risk === 'high' ? `${metric(childSeed, 57, 3)}%` : `${metric(childSeed, 27, 3)}%`,
          analystSignal: child.status === 'opportunity' ? '수혜 후보' : child.status === 'watch' ? '주의 관찰' : '핵심 추적',
          investmentView: child.status === 'opportunity' ? '전방 투자 확대 시 탄력 가능한 하청 기업' : child.status === 'watch' ? '재무·고객집중 리스크 확인 필요' : '전방 수요와 함께 꾸준히 추적할 기업',
          riskLevel: child.risk,
          status: child.status,
          tags: child.tags,
          notes: '실명 하청·협력 후보 기업입니다. 특정 원청 납품 관계를 단정하지 않고, 공시·수주·IR·감독기관·뉴스 원문으로 검증하는 전제로 배치했습니다.',
          sourceType: 'seed-model',
          sourceNote: companySourceNote('tier2'),
          layout: { column: 2, row: tier1Index * 3 + childIndex },
        };
        generatedCompanies.push(childCompany);
        generatedLinks.push({
          id: `${tier1Id}-${childId}`,
          anchorId: anchor.id,
          source: tier1Id,
          target: childId,
          label: child.sector,
          dependency: 28 + childIndex * 7 + tier1Index * 3,
          value: `검증 노출도 ${metric(childSeed, 28, 4)}점`,
        });

        generatedOpinions.push({
          id: `${childId}-opinion`,
          companyId: childId,
          firm: '하청 기업 스크리너',
          stance: child.status === 'opportunity' ? '수혜 후보' : child.status === 'watch' ? '주의 관찰' : '핵심 추적',
          horizon: '1~3개월',
          date: 'seed',
          summary: `${child.name}은 ${child.products.join(', ')} 영역의 실명 기업 후보입니다. 매출 성장률, 부채비율, 고객 집중도와 기사 이벤트를 함께 봐야 합니다.`,
          sourceType: 'seed-model',
        });
      });
    });
  });

  return { generatedCompanies, generatedLinks, generatedOpinions };
}

const built = buildCompanies();

type CompanyFilingSource = Partial<
  Pick<
    Company,
    | 'filingSourceUrl'
    | 'reportUrl'
    | 'dartRcpNo'
    | 'secAccessionNumber'
    | 'sourceSearchUrl'
    | 'sourceDirectUrl'
    | 'corpCode'
    | 'cik'
    | 'reportType'
    | 'fiscalYear'
    | 'fiscalPeriod'
    | 'filingDate'
    | 'sourceStatus'
  >
>;

const companyFilingSources: Record<string, CompanyFilingSource> = {
  'kr-semiconductors-samsung': {
    corpCode: '00126380',
    dartRcpNo: '20260515002181',
    reportUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002181',
    filingSourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002181',
    sourceDirectUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002181',
    sourceSearchUrl: 'https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90',
    reportType: '분기보고서',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-05-15',
    sourceStatus: 'direct',
  },
  'kr-semiconductors-sk-hynix': {
    corpCode: '00164779',
    dartRcpNo: '20260515002287',
    reportUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002287',
    filingSourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002287',
    sourceDirectUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002287',
    sourceSearchUrl: 'https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=SK%ED%95%98%EC%9D%B4%EB%8B%89%EC%8A%A4',
    reportType: '분기보고서',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-05-15',
    sourceStatus: 'direct',
  },
  'kr-semiconductors-db-hitek': {
    dartRcpNo: '20260515001650',
    reportUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001650',
    filingSourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001650',
    sourceDirectUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001650',
    sourceSearchUrl: 'https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=DB%ED%95%98%EC%9D%B4%ED%85%8D',
    reportType: '분기보고서',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-05-15',
    sourceStatus: 'direct',
  },
  'kr-semiconductors-samsung-한미반도체': {
    dartRcpNo: '20260515001572',
    reportUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001572',
    filingSourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001572',
    sourceDirectUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001572',
    sourceSearchUrl: 'https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=%ED%95%9C%EB%AF%B8%EB%B0%98%EB%8F%84%EC%B2%B4',
    reportType: '분기보고서',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-05-15',
    sourceStatus: 'direct',
  },
  'us-semiconductors-nvidia': {
    cik: '1045810',
    secAccessionNumber: '0001045810-26-000021',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=NVIDIA%20Corporation',
    reportType: '10-K',
    fiscalYear: '2026',
    fiscalPeriod: 'FY',
    filingDate: '2026-02-25',
    sourceStatus: 'direct',
  },
  'us-semiconductors-amd': {
    cik: '2488',
    secAccessionNumber: '0000002488-26-000021',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/0000002488/000000248826000021/amd-20251227.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/0000002488/000000248826000021/amd-20251227.htm',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/0000002488/000000248826000021/amd-20251227.htm',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Advanced%20Micro%20Devices',
    reportType: '10-K',
    fiscalYear: '2025',
    fiscalPeriod: 'FY',
    filingDate: '2026-02-25',
    sourceStatus: 'direct',
  },
  'us-semiconductors-intel': {
    cik: '50863',
    secAccessionNumber: '0000050863-26-000011',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/50863/000005086326000011/intc-20251227.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/50863/000005086326000011/intc-20251227.htm',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/50863/000005086326000011/intc-20251227.htm',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Intel%20Corporation',
    reportType: '10-K',
    fiscalYear: '2025',
    fiscalPeriod: 'FY',
    filingDate: '2026-01-23',
    sourceStatus: 'direct',
  },
};

export const companies = built.generatedCompanies.map((company) => {
  const filingSource = companyFilingSources[company.id] ?? {};
  const hasDirectSource = Boolean(
    filingSource.reportUrl ||
      filingSource.filingSourceUrl ||
      filingSource.sourceDirectUrl ||
      filingSource.dartRcpNo,
  );

  return {
    ...company,
    ...filingSource,
    sourceStatus: filingSource.sourceStatus ?? (hasDirectSource ? 'direct' : filingSource.sourceSearchUrl ? 'search-only' : 'needs-link'),
  };
});
export const links = built.generatedLinks;
export const analystOpinions = built.generatedOpinions;

export const financialMetricGuides: Record<FinancialMetricKey, string> = {
  revenue: '회사가 얼마나 팔았는지 보여주는 숫자',
  operatingIncome: '본업으로 얼마나 벌었는지 보여주는 숫자',
  netIncome: '세금과 비용까지 반영한 최종 이익',
  debtRatio: '빚 부담이 얼마나 큰지 보는 지표',
  operatingMargin: '매출 중 본업 이익으로 남는 비율',
  cashFlow: '실제로 현금이 들어오고 나가는 흐름',
};

export const marketMovers: MarketMover[] = [
  {
    id: 'mover-samsung-hbm',
    companyId: 'kr-semiconductors-samsung',
    companyName: '삼성전자',
    ticker: '005930.KS',
    market: 'KOSPI',
    move: '+3.2%',
    impactFactor: 'HBM 공급 확대 기대',
    additionalFactor: '메모리 가격 회복 기대',
    interpretation: '두 요인이 실적 회복 기대를 키웠습니다.',
    reason: 'HBM 공급 확대 기대와 메모리 가격 회복 기대가 같이 반영됐습니다.',
    beginnerNote: '주가가 왜 움직였는지 뉴스와 재무 흐름을 함께 봅니다.',
    sectorId: 'kr-semiconductors',
    sectorLabel: '반도체',
  },
  {
    id: 'mover-sk-hynix-ai-memory',
    companyId: 'kr-semiconductors-sk-hynix',
    companyName: 'SK하이닉스',
    ticker: '000660.KS',
    market: 'KOSPI',
    move: '+4.1%',
    impactFactor: 'AI 서버용 메모리 수요',
    additionalFactor: 'HBM 실적 기대',
    interpretation: '수요 기대가 다음 분기 실적 눈높이를 높였습니다.',
    reason: 'AI 서버용 메모리 수요가 실적 기대를 끌어올렸습니다.',
    beginnerNote: '성장 기대가 실제 매출과 현금흐름으로 이어지는지 확인합니다.',
    sectorId: 'kr-semiconductors',
    sectorLabel: '반도체',
  },
  {
    id: 'mover-hanmi-packaging',
    companyId: 'kr-semiconductors-samsung-한미반도체',
    companyName: '한미반도체',
    ticker: '042700.KS',
    market: 'KOSPI',
    move: '+2.8%',
    impactFactor: '후공정 장비 수주 기대',
    additionalFactor: 'HBM 투자 확대 관심',
    interpretation: '공급망 안에서 장비 기업 관심이 커졌습니다.',
    reason: '후공정 장비 수주 기대가 공급망 관심을 키웠습니다.',
    beginnerNote: '수주 뉴스가 매출로 잡히는 시점과 재고 변화를 같이 봅니다.',
    sectorId: 'kr-semiconductors',
    sectorLabel: '반도체 장비',
  },
  {
    id: 'mover-nvidia-datacenter',
    companyId: 'us-semiconductors-nvidia',
    companyName: 'NVIDIA',
    ticker: 'NVDA',
    market: 'NASDAQ',
    move: '+1.9%',
    impactFactor: '데이터센터 매출 성장',
    additionalFactor: '다음 분기 가이던스 기대',
    interpretation: '경영진 수요 전망이 실적 기대를 뒷받침했습니다.',
    reason: '데이터센터 매출 성장과 다음 분기 가이던스 기대가 반영됐습니다.',
    beginnerNote: '미국 기업은 MD&A에서 경영진이 수요를 어떻게 설명했는지 봅니다.',
    sectorId: 'us-semiconductors',
    sectorLabel: 'AI 반도체',
  },
];

export const mockMarketPrices: MarketPrice[] = [
  {
    companyId: 'kr-semiconductors-samsung',
    ticker: '005930.KS',
    market: 'KOSPI',
    price: '82,400',
    change: '+2,100',
    changePercent: '+2.61%',
    currency: 'KRW',
    marketStatus: 'closed',
    asOf: '2026-05-15 15:30 KST',
    source: 'mock close price',
    isDelayed: true,
  },
  {
    companyId: 'kr-semiconductors-sk-hynix',
    ticker: '000660.KS',
    market: 'KOSPI',
    price: '214,500',
    change: '+6,500',
    changePercent: '+3.13%',
    currency: 'KRW',
    marketStatus: 'closed',
    asOf: '2026-05-15 15:30 KST',
    source: 'mock close price',
    isDelayed: true,
  },
  {
    companyId: 'kr-semiconductors-samsung-한미반도체',
    ticker: '042700.KS',
    market: 'KOSPI',
    price: '147,300',
    change: '+4,000',
    changePercent: '+2.79%',
    currency: 'KRW',
    marketStatus: 'closed',
    asOf: '2026-05-15 15:30 KST',
    source: 'mock close price',
    isDelayed: true,
  },
  {
    companyId: 'kr-battery-materials-posco-futurem',
    ticker: '003670.KS',
    market: 'KOSPI',
    price: '248,000',
    change: '-3,500',
    changePercent: '-1.39%',
    currency: 'KRW',
    marketStatus: 'closed',
    asOf: '2026-05-15 15:30 KST',
    source: 'mock close price',
    isDelayed: true,
  },
  {
    companyId: 'us-semiconductors-nvidia',
    ticker: 'NVDA',
    market: 'NASDAQ',
    price: '1,126.40',
    change: '+34.10',
    changePercent: '+3.12%',
    currency: 'USD',
    marketStatus: 'afterhours',
    asOf: '2026-05-15 20:00 ET',
    source: 'mock delayed quote',
    isDelayed: true,
  },
  {
    companyId: 'us-semiconductors-amd',
    ticker: 'AMD',
    market: 'NASDAQ',
    price: '168.22',
    change: '-2.47',
    changePercent: '-1.45%',
    currency: 'USD',
    marketStatus: 'afterhours',
    asOf: '2026-05-15 20:00 ET',
    source: 'mock delayed quote',
    isDelayed: true,
  },
  {
    companyId: 'us-ai-cloud-datacenter-microsoft',
    ticker: 'MSFT',
    market: 'NASDAQ',
    price: '487.90',
    change: '+5.24',
    changePercent: '+1.09%',
    currency: 'USD',
    marketStatus: 'afterhours',
    asOf: '2026-05-15 20:00 ET',
    source: 'mock delayed quote',
    isDelayed: true,
  },
  {
    companyId: 'us-ai-cloud-datacenter-amazon',
    ticker: 'AMZN',
    market: 'NASDAQ',
    price: '224.18',
    change: '+1.44',
    changePercent: '+0.65%',
    currency: 'USD',
    marketStatus: 'afterhours',
    asOf: '2026-05-15 20:00 ET',
    source: 'mock delayed quote',
    isDelayed: true,
  },
  {
    companyId: 'us-ev-mobility-tesla',
    ticker: 'TSLA',
    market: 'NYSE',
    price: '178.80',
    change: '-1.20',
    changePercent: '-0.67%',
    currency: 'USD',
    marketStatus: 'afterhours',
    asOf: '2026-05-15 20:00 ET',
    source: 'mock delayed quote',
    isDelayed: true,
  },
];

export const stockAutopsyPicks: StockAutopsyPick[] = [
  {
    id: 'pick-nvidia-ai-demand',
    companyName: 'NVIDIA',
    ticker: 'NVDA',
    market: 'US',
    movementDirection: 'up',
    movementLabel: '실적 기대감',
    reasonSummary: 'AI 데이터센터 수요 기대가 다음 분기 실적 눈높이를 높였습니다.',
    beginnerSummary: 'AI 서버가 늘수록 GPU, 메모리, 장비 기업을 함께 봐야 합니다.',
    sector: 'AI 반도체',
    valueChainPosition: 'leader',
    connectedLeaders: ['TSMC', 'SK하이닉스', 'ASML', 'AMD'],
    relatedCompanies: ['TSMC', 'SK하이닉스', 'ASML', 'AMD'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'us-semiconductors-nvidia',
    relatedTradeTags: ['13F', 'AI 데이터센터', 'GPU'],
    publishedAt: '2026-05-17',
  },
  {
    id: 'pick-hanmi-packaging-equipment',
    companyName: '한미반도체',
    ticker: '042700.KS',
    market: 'KR',
    movementDirection: 'up',
    movementLabel: '후공정 장비 기대',
    reasonSummary: 'HBM 후공정 투자 기대가 장비 기업 관심으로 이어졌습니다.',
    beginnerSummary: '장비주는 수주가 매출로 잡히는 시점과 재고 변화를 같이 봐야 합니다.',
    sector: '반도체 장비',
    valueChainPosition: 'equipment',
    connectedLeaders: ['삼성전자', 'SK하이닉스', 'NVIDIA', 'TSMC'],
    relatedCompanies: ['삼성전자', 'SK하이닉스', '원익IPS', '주성엔지니어링'],
    relatedSupplyChainId: 'kr-semiconductors',
    relatedCompanyId: 'kr-semiconductors-samsung-한미반도체',
    relatedTradeTags: ['DART', 'HBM', '후공정'],
    publishedAt: '2026-05-17',
  },
  {
    id: 'pick-sk-hynix-hbm',
    companyName: 'SK하이닉스',
    ticker: '000660.KS',
    market: 'KR',
    movementDirection: 'up',
    movementLabel: 'AI 메모리 수요',
    reasonSummary: 'AI 서버용 메모리 수요 기대가 실적 전망에 반영됐습니다.',
    beginnerSummary: '메모리는 가격과 출하량이 같이 좋아지는지 확인해야 합니다.',
    sector: 'AI 메모리',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'AMD', '삼성전자', 'TSMC'],
    relatedCompanies: ['한미반도체', '원익IPS', '솔브레인', '리노공업'],
    relatedSupplyChainId: 'kr-semiconductors',
    relatedCompanyId: 'kr-semiconductors-sk-hynix',
    relatedTradeTags: ['HBM', '기관 수급', 'DART'],
    publishedAt: '2026-05-17',
  },
  {
    id: 'pick-ai-server-parts',
    companyName: 'AI 서버 부품업체',
    ticker: 'WATCH',
    market: 'US',
    movementDirection: 'up',
    movementLabel: '서버 투자 기대',
    reasonSummary: 'AI 서버 증설 기대가 전력, 냉각, 부품 기업 관심으로 번졌습니다.',
    beginnerSummary: '같은 밸류체인에서 함께 봐야 할 대표 기업을 먼저 확인합니다.',
    sector: 'AI 서버',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'Dell', 'Super Micro', 'Vertiv'],
    relatedCompanies: ['Microsoft', 'Amazon', 'Alphabet', 'Eaton'],
    relatedSupplyChainId: 'us-ai-cloud-datacenter',
    relatedTradeTags: ['AI 서버', '데이터센터', '전력·냉각'],
    publishedAt: '2026-05-17',
  },
  {
    id: 'pick-battery-materials-watch',
    companyName: '배터리 소재업체',
    ticker: 'WATCH',
    market: 'KR',
    movementDirection: 'down',
    movementLabel: '전기차 수요 부담',
    reasonSummary: '전기차 수요 둔화와 소재 가격 변동이 투자심리에 부담으로 작용했습니다.',
    beginnerSummary: '소재 기업은 판매량뿐 아니라 원재료 가격과 고객사 투자 계획도 함께 봅니다.',
    sector: '2차전지 소재',
    valueChainPosition: 'materials',
    connectedLeaders: ['Tesla', 'BYD', 'CATL', 'LG에너지솔루션'],
    relatedCompanies: ['포스코퓨처엠', '삼성SDI', 'GM', 'Rivian'],
    relatedSupplyChainId: 'kr-battery-materials',
    relatedCompanyId: 'kr-battery-materials-posco-futurem',
    relatedTradeTags: ['배터리', '소재 가격', '전기차'],
    publishedAt: '2026-05-17',
  },
];

export const smartMoneyMoves: SmartMoneyMove[] = [
  {
    id: 'smart-nps-samsung',
    investorName: '국민연금',
    investorType: 'nps',
    investorTypeLabel: '국민연금 / 한국 공개 포트폴리오',
    market: 'KR',
    companyId: 'kr-semiconductors-samsung',
    relatedCompanyId: 'kr-semiconductors-samsung',
    relatedSupplyChainId: 'kr-semiconductors',
    companyName: '삼성전자',
    ticker: '005930.KS',
    action: 'increase',
    actionLabel: '비중확대',
    disclosedDate: '2026-05-10',
    tradeDateOptional: '2026-04-30',
    sectorId: 'kr-semiconductors',
    sector: '반도체',
    sectorLabel: '반도체',
    sourceLabel: '국민연금 공개 보유자료 mock',
    isDelayedDisclosure: true,
    note: '공개 포트폴리오 기반 예시 데이터입니다.',
    beginnerExplanation: '공개 보유 변화는 확정 신호가 아니라 추가로 확인할 참고 정보입니다.',
  },
  {
    id: 'smart-institution-sk-hynix',
    investorName: '국내 기관 합산',
    investorType: 'institution',
    investorTypeLabel: '기관 수급 mock',
    market: 'KR',
    companyId: 'kr-semiconductors-sk-hynix',
    relatedCompanyId: 'kr-semiconductors-sk-hynix',
    relatedSupplyChainId: 'kr-semiconductors',
    companyName: 'SK하이닉스',
    ticker: '000660.KS',
    action: 'buy',
    actionLabel: '매수',
    disclosedDate: '2026-05-12',
    tradeDateOptional: '2026-05-09',
    sectorId: 'kr-semiconductors',
    sector: '반도체',
    sectorLabel: '반도체',
    sourceLabel: 'KRX/증권사 API 연결 예정',
    isDelayedDisclosure: true,
    note: '기관 수급 API 연결 전 화면 검증용 mock 데이터입니다.',
    beginnerExplanation: '기관 수급은 실적과 업황이 같이 개선되는지 확인할 때 더 의미가 있습니다.',
  },
  {
    id: 'smart-us-insider-amd',
    investorName: 'AMD 내부자 공시',
    investorType: 'insider',
    investorTypeLabel: '미국 내부자 매매',
    market: 'US',
    companyId: 'us-semiconductors-amd',
    relatedCompanyId: 'us-semiconductors-amd',
    relatedSupplyChainId: 'us-semiconductors',
    companyName: 'AMD',
    ticker: 'AMD',
    action: 'decrease',
    actionLabel: '비중축소',
    disclosedDate: '2026-05-08',
    tradeDateOptional: '2026-05-06',
    sectorId: 'us-semiconductors',
    sector: 'AI 반도체',
    sectorLabel: 'AI 반도체',
    sourceLabel: 'SEC Form 4 연결 예정',
    sourceUrl: 'https://www.sec.gov/edgar/search/#/category=form-cat2',
    isDelayedDisclosure: true,
    note: 'Form 4는 실제 거래 후 며칠 뒤 공개될 수 있습니다.',
    beginnerExplanation: '내부자 매도는 세금·보상 계획 때문일 수도 있어 MD&A와 실적을 함께 봅니다.',
  },
  {
    id: 'smart-us-fund-nvidia',
    investorName: 'ARK Investment Management',
    investorType: 'fund',
    investorTypeLabel: '기관 13F 분기 포트폴리오',
    market: 'US',
    companyId: 'us-semiconductors-nvidia',
    relatedCompanyId: 'us-semiconductors-nvidia',
    relatedSupplyChainId: 'us-semiconductors',
    companyName: 'NVIDIA',
    ticker: 'NVDA',
    action: 'holding',
    actionLabel: '13F 보유 변화',
    disclosedDate: '2026-05-13',
    tradeDateOptional: '2026-03-31',
    sectorId: 'us-semiconductors',
    sector: 'AI 반도체',
    sectorLabel: 'AI 반도체',
    sourceLabel: 'SEC 13F 분기 포트폴리오 mock',
    sourceUrl: 'https://www.sec.gov/edgar/search/#/category=form-cat5',
    isDelayedDisclosure: true,
    note: '13F는 분기 말 보유 현황이라 실제 매수·매도 시점과 다를 수 있습니다.',
    beginnerExplanation: '13F 보유 변화는 기관 관심 흐름을 보여주지만, 보고가 지연되고 분기 말 보유 기준이라 당일 매매 신호가 아닙니다.',
  },
];

export const sourcePolicies: SourcePolicy[] = [
  {
    label: '공시·거래소',
    domains: ['dart.fss.or.kr', 'kind.krx.co.kr', 'krx.co.kr', 'fss.or.kr'],
    note: '매출, 고객 집중도, 수주, 증설, 특수관계 거래를 우선 확인하는 기준 소스입니다.',
  },
  {
    label: '회사 공식 채널',
    domains: ['ir page', 'press release', 'annual report', 'sustainability report'],
    note: '제품 포트폴리오, 고객사 언급, 투자 계획, 공장 증설, 인증 취득을 확인합니다.',
  },
  {
    label: '뉴스·산업 데이터',
    domains: ['reuters.com', 'yna.co.kr', 'hankyung.com', 'mk.co.kr', 'etnews.com', 'thelec.kr'],
    note: '수주, 공급계약, 정책, 업황, 가격 변동성 이벤트를 뉴스 API로 보강합니다.',
  },

  {
    label: '미국 공시·감독기관',
    domains: ['sec.gov', 'investor.gov', 'federalreserve.gov', 'fdic.gov', 'naic.org'],
    note: '미국 상장사 10-K·10-Q·8-K, 은행 통계, 보험 산업 통계와 감독기관 데이터를 확인하는 기준 소스입니다.',
  },
  {
    label: '보험·금융 특화 검증',
    domains: ['content.naic.org', 'insurancejournal.com', 'bankingdive.com', 'fdic.gov'],
    note: '보험은 지급여력, 손해율, 재보험, 채널·GA, 규제 이벤트를 따로 확인합니다.',
  },
  {
    label: '주의 문구',
    domains: ['seed data'],
    note: '현재 내장 데이터는 투자 검토용 후보군입니다. 특정 원청 납품 관계와 투자 판단은 원문 검증 후 확정해야 합니다.',
  },
];
