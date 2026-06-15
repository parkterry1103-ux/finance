export type CountryId = 'KR' | 'US';
export type CompanyTier = 'anchor' | 'tier1' | 'tier2';
export type RiskLevel = 'low' | 'medium' | 'high';
export type CompanyStatus = 'core' | 'watch' | 'opportunity';
export type SourceType = 'official' | 'verified-news' | 'analyst-api-ready' | 'seed-model';
export type CompanyFinancialStatus = 'api-live' | 'fallback' | 'needs-source';
export type FilingSourceStatus = 'direct' | 'partial' | 'search-only' | 'needs-link' | 'private-company' | 'no-public-filing' | 'listing-unknown';
export type FinancialMetricKey =
  | 'revenue'
  | 'operatingIncome'
  | 'netIncome'
  | 'debtRatio'
  | 'operatingMargin'
  | 'cashFlow'
  | 'capitalExpenditures'
  | 'currentRatio'
  | 'interestCoverage'
  | 'freeCashFlow'
  | 'eps'
  | 'depreciationAndAmortization';
export type RelationshipEvidenceType =
  | 'company-filing'
  | 'annual-report'
  | 'investor-presentation'
  | 'earnings-call'
  | 'press-release'
  | 'credible-news'
  | 'industry-analysis'
  | 'manual-note';
export type SourceReliability = 'high' | 'medium' | 'low' | 'needs-review';
export type SmartMoneyInvestorType = 'us-politician' | 'insider' | 'institution' | 'fund' | 'nps' | 'kr-politician';
export type SmartMoneyAction = 'buy' | 'sell' | 'increase' | 'decrease' | 'holding';
export type ListingStatus = 'listed' | 'private' | 'unknown' | 'delisted' | 'no-public-filing';
export type ListingMarket = 'KOSPI' | 'KOSDAQ' | 'KONEX' | 'NASDAQ' | 'NYSE' | 'AMEX' | 'OTC' | 'Private' | 'Unknown' | 'KRX' | string;
export type FilingSourceKind = 'DART' | 'SEC' | 'manual' | 'none';
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
  exchange?: string;
  listed?: boolean;
  listingStatus?: ListingStatus;
  market?: ListingMarket;
  filingSource?: FilingSourceKind;
  filingStatus?: FilingSourceStatus;
  isInvestmentAnalyzable?: boolean;
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
  businessSummary?: string;
  mainProducts?: string[];
  valueChainStage?: string;
  mainCustomers?: string[];
  mainCustomersOrDemand?: string[];
  relationshipSummary?: string;
  customerExposure?: string;
  revenueExposure?: string;
  moat?: string;
  economicMoat?: string;
  moatExplanation?: string;
  investorWatchPoint?: string;
  relationshipType?: string;
  relationshipConfidence?: string;
  sourceNotes?: string;
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
  sourceCompany?: string;
  targetCompany?: string;
  label: string;
  dependency: number;
  value: string;
  relationshipType?: string;
  relationshipDirection?: string;
  relationshipConfidence?: string;
  description?: string;
  whatIsSold?: string;
  demandConnection?: string;
  revenueExposure?: string;
  revenueExposureStatus?: string;
  confidence?: string;
  evidenceSummary?: string;
  evidenceType?: RelationshipEvidenceType;
  sourceName?: string;
  sourceUrl?: string;
  sourceDate?: string;
  sourceReliability?: SourceReliability;
  lastVerifiedAt?: string;
  sourceNotes?: string;
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
  comparison?: {
    yoy?: number | null;
    qoq?: number | null;
  };
  beginnerExplanation: string;
  keyTakeaway: string;
}

export interface FinancialRawMetricSet {
  revenue?: number | null;
  operatingIncome?: number | null;
  netIncome?: number | null;
  operatingCashFlow?: number | null;
  debtToEquity?: number | null;
  currentRatio?: number | null;
  interestCoverage?: number | null;
  capitalExpenditures?: number | null;
  freeCashFlow?: number | null;
  eps?: number | null;
  depreciationAndAmortization?: number | null;
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
  rawMetrics?: FinancialRawMetricSet;
  beginnerExplanation: string;
  keyTakeaway: string;
  currency?: string;
  amountBasis?: string;
  periodBasis?: string;
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
  pickId?: string;
  companyName: string;
  companyId?: string;
  title?: string;
  ticker: string;
  market: CountryId;
  movementDirection: StockAutopsyDirection;
  movementLabel: string;
  reasonSummary: string;
  beginnerSummary: string;
  sector: string;
  flowId?: string;
  flowLabel?: string;
  flowStage?: string;
  valueChainPosition: StockAutopsyValueChainPosition;
  connectedLeaders: string[];
  relatedCompanies: string[];
  relatedCompanyIds?: string[];
  relatedSupplyChainId?: string;
  relatedCompanyId?: string;
  relatedTradeTags?: string[];
  oneLineConclusion?: string;
  beginnerExplanation?: string;
  watchMetrics?: Array<{ label: string; note: string }>;
  goodSignals?: string[];
  cautionSignals?: string[];
  sourceLinks?: Array<{ label: string; url?: string; note?: string }>;
  publishedAt?: string;
  status?: 'draft' | 'published' | 'archived';
}

export type WeeklyDigestMarketTabId = 'ALL' | CountryId;
export type WeeklyDigestMarketMapStatus = 'active' | 'coming-soon';
export type WeeklyDigestTarget = 'pick' | 'analysis' | 'coming-soon';

export interface WeeklyDigestRecentItem {
  id: string;
  pickId?: string;
  companyId?: string;
  market?: CountryId;
  theme: string;
  movementLabel?: string;
  question: string;
  summary: string;
  relatedCompanies?: string[];
  target?: WeeklyDigestTarget;
}

export interface WeeklyDigestMarketMapItem {
  title: string;
  status: WeeklyDigestMarketMapStatus;
  href?: string;
  sectorId?: string;
  note: string;
}

export interface WeeklyDigest {
  weekLabel: string;
  kicker: string;
  headline: string;
  subheadline: string;
  sourceNote: string;
  featuredPickId: string;
  featured: {
    marketLabel: string;
    theme: string;
    question: string;
    meta: string;
    headline: string;
    summary: string;
    metricLabels: string[];
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  recentItems: WeeklyDigestRecentItem[];
  marketTabs: Array<{ id: WeeklyDigestMarketTabId; label: string }>;
  marketMapItems: WeeklyDigestMarketMapItem[];
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
    description: '메모리, 파운드리, 후공정, 장비·소재·부품 관계망을 함께 봅니다.',
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
    description: '셀, 양극재, 음극재, 전해액, 장비, 리사이클까지 확장한 관계망입니다.',
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
    description: '클라우드, AI 반도체 설계, PCB, 서버·네트워크·IDC 인프라 관계망입니다.',
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
    "description": "전력망, 가스, 원전·SMR, 재생에너지 기자재, 전력기기 관계망을 추적합니다.",
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
    "label": "AI 반도체 & 데이터센터",
    "description": "AI 서버 수요가 늘 때 어떤 반도체, 메모리, 파운드리, 장비, 전력·냉각 기업이 함께 움직이는지 보여줍니다.",
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
    "description": "상업항공, 방산 프라임, 우주·드론, 항공 전장·부품 관계망을 함께 봅니다.",
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
    "ticker": "XYZ",
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
  return '실명 기업 기반 관계 후보입니다. 특정 고객·납품 관계는 공시·IR·계약·뉴스 API로 추가 확인해야 합니다.';
}

function simpleProductText(products: string[]) {
  if (!products.length) return '주요 제품 확인 필요';
  return products.slice(0, 2).join('·');
}

function inferValueChainStage(sector: string, products: string[], tier: CompanyTier) {
  const text = `${sector} ${products.join(' ')}`.toLowerCase();
  if (text.includes('hbm') || text.includes('dram') || text.includes('nand') || text.includes('memory') || sector.includes('메모리')) return '메모리';
  if (text.includes('foundry') || sector.includes('파운드리') || sector.includes('제조')) return '제조/파운드리';
  if (sector.includes('장비') || text.includes('equipment') || text.includes('tool')) return '장비';
  if (sector.includes('소재') || text.includes('materials') || text.includes('chemical')) return '소재';
  if (sector.includes('부품') || text.includes('parts') || text.includes('module') || text.includes('component')) return '부품';
  if (sector.includes('테스트') || text.includes('test') || text.includes('socket')) return '테스트';
  if (sector.includes('후공정') || text.includes('packaging') || text.includes('패키징')) return '후공정/패키징';
  if (sector.includes('냉각') || text.includes('cooling')) return '전력/냉각';
  if (sector.includes('클라우드') || text.includes('cloud')) return '클라우드 고객';
  if (tier === 'anchor') return '중심 상장기업';
  return '같은 밸류체인';
}

function inferRelationshipType(sector: string, products: string[]) {
  const stage = inferValueChainStage(sector, products, 'tier1');
  if (stage === '중심 상장기업') return '같은 밸류체인';
  return stage;
}

function inferMoat(sector: string, products: string[]) {
  const text = `${sector} ${products.join(' ')}`.toLowerCase();
  if (sector.includes('장비') || text.includes('equipment') || text.includes('tool')) {
    return {
      moat: '장비 레퍼런스 / 고객 인증',
      moatExplanation: '장비는 한 번 공정에 들어가면 품질 검증과 교체 비용이 커서 레퍼런스가 진입장벽이 될 수 있습니다.',
    };
  }
  if (sector.includes('소재') || text.includes('materials') || text.includes('chemical')) {
    return {
      moat: '품질 안정성 / 공급 안정성',
      moatExplanation: '소재는 불량이 나면 전체 생산에 영향을 주기 때문에 안정적으로 공급한 기록이 경쟁력으로 볼 수 있습니다.',
    };
  }
  if (sector.includes('테스트') || text.includes('test') || text.includes('socket')) {
    return {
      moat: '기술 난이도 / 고객 인증',
      moatExplanation: '테스트 부품은 정확도와 내구성이 중요해 고객사 인증을 통과하면 바꾸기 어려운 관계가 될 수 있습니다.',
    };
  }
  if (sector.includes('냉각') || sector.includes('전력') || text.includes('cooling') || text.includes('power')) {
    return {
      moat: '운영 신뢰도 / 장기 고객 관계',
      moatExplanation: '데이터센터 인프라는 멈추면 손실이 커서 안정적으로 운영한 경험이 진입장벽이 될 수 있습니다.',
    };
  }
  return {
    moat: '기술 난이도 / 고객 신뢰',
    moatExplanation: '품질, 납기, 고객 인증이 쌓이면 새 경쟁자가 쉽게 대체하기 어려운 경쟁력이 될 수 있습니다.',
  };
}

function tierTemplateForAnchor(template: ChainTemplate, anchor: AnchorCompany) {
  if (template.tier1.length <= 3 || anchor.rank === 1) return template.tier1;
  const startIndex = (anchor.rank - 1) % template.tier1.length;
  const rotated = template.tier1.slice(startIndex).concat(template.tier1.slice(0, startIndex));
  return rotated.slice(0, Math.max(3, template.tier1.length - 1));
}

function hasListedAnchorTicker(anchor: AnchorCompany) {
  const ticker = anchor.ticker.trim().toUpperCase();
  return Boolean(ticker && !['비상장', 'PRIVATE', 'N/A', '-', 'WATCH'].includes(ticker));
}

function buildCompanies() {
  const generatedCompanies: Company[] = [];
  const generatedLinks: SupplyLink[] = [];
  const generatedOpinions: AnalystOpinion[] = [];

  anchors.forEach((anchor, anchorIndex) => {
    const template = chainTemplates[anchor.sectorId] ?? defaultTemplate;
    const anchorMoat = inferMoat(anchor.sector, anchor.products);
    const anchorListed = hasListedAnchorTicker(anchor);
    const anchorCompany: Company = {
      id: anchor.id,
      anchorId: anchor.id,
      country: anchor.country,
      sectorId: anchor.sectorId,
      name: anchor.name,
      legalName: anchor.legalName,
      ticker: anchor.ticker,
      exchange: anchor.exchange,
      listed: anchorListed,
      listingStatus: anchorListed ? 'listed' : 'private',
      market: anchorListed ? (anchor.country === 'KR' && anchor.ticker.endsWith('.KS') ? 'KOSPI' : anchor.country === 'KR' && anchor.ticker.endsWith('.KQ') ? 'KOSDAQ' : anchor.exchange) : 'Private',
      filingSource: anchorListed ? (anchor.country === 'KR' ? 'DART' : 'SEC') : 'none',
      filingStatus: anchorListed ? undefined : 'private-company',
      isInvestmentAnalyzable: anchorListed,
      tier: 'anchor',
      sector: anchor.sector,
      region: anchor.region,
      products: anchor.products,
      anchorCustomer: '기준 기업',
      revenue: anchorListed ? (anchor.country === 'KR' ? 'DART 원문 확인' : 'SEC 원문 확인') : '공개 재무정보 제한',
      revenueUnit: anchorListed ? revenueUnit(anchor.country) : '공개 재무정보 제한',
      revenueBasis: anchorListed ? revenueBasis(anchor.country, 'official') : '비상장 또는 공시 확인이 어려운 기업은 출처 없는 재무 숫자를 표시하지 않습니다.',
      revenueTrend: 4.8 + anchor.rank * 1.4,
      growthBasis: growthBasis(anchor.country),
      opMargin: anchorListed ? '공시 연결' : '공식 공시 확인 불가',
      debtRatio: anchorListed ? '공시 연결' : '공식 공시 확인 불가',
      customerConcentration: 'N/A',
      analystSignal: anchorListed ? '컨센서스·공시 API 연결 대상' : '관계 이해용 참고 기업',
      investmentView: `${anchor.sector} 섹터의 수요·투자 사이클 기준 기업`,
      riskLevel: 'low',
      status: 'core',
      tags: ['중심 기업', anchor.exchange, anchor.ticker],
      notes: '관계 기업을 이해하기 위한 기준 노드입니다. 실제 고객·공급 관계는 연결된 공시·뉴스·계약 데이터로 검증하도록 설계했습니다.',
      sourceType: anchorListed ? 'official' : 'seed-model',
      sourceNote: anchorListed ? companySourceNote('anchor') : '비상장 또는 공시 확인이 어려운 기업은 관계 이해용으로만 표시합니다.',
      businessSummary: `${simpleProductText(anchor.products)} 등을 만드는 ${anchor.sector} ${anchorListed ? '중심 상장기업' : '관계 참고 기업'}입니다.`,
      mainProducts: anchor.products,
      valueChainStage: inferValueChainStage(anchor.sector, anchor.products, 'anchor'),
      mainCustomers: ['최종 수요처와 산업 고객', '공식 고객별 비중은 공시·IR에서 확인'],
      customerExposure: '고객별 매출 비중은 회사가 공개한 원문 기준으로 확인합니다.',
      revenueExposure: '제품별·지역별 매출 비중은 공시 원문에서 확인합니다.',
      moat: anchorMoat.moat,
      moatExplanation: anchorMoat.moatExplanation,
      investorWatchPoint: `${anchor.sector} 수요, 재고, 투자 계획이 실제 매출과 현금흐름으로 이어지는지 봅니다.`,
      relationshipType: '중심 기업',
      relationshipConfidence: '공시·IR 기준',
      sourceNotes: anchorListed ? companySourceNote('anchor') : '비상장 또는 공시 확인이 어려운 기업은 관계 이해용으로만 표시합니다.',
      sourceStatus: anchorListed ? undefined : 'private-company',
      layout: { column: 0, row: 1 },
    };
    generatedCompanies.push(anchorCompany);

    generatedOpinions.push(
      {
        id: `${anchor.id}-cycle`,
        companyId: anchor.id,
        firm: '기업 관계 스코어링 모델',
        stance: anchor.rank === 1 ? '섹터 기준 기업' : anchor.rank === 2 ? '수혜 확산 관찰' : '변곡점 관찰',
        horizon: '6~12개월',
        date: 'seed',
        summary: `${anchor.name}의 투자·수주·재고 사이클은 관련 기업의 매출 가시성과 밸류에이션에 중요한 선행 신호가 됩니다.`,
        sourceType: 'seed-model',
      },
      {
        id: `${anchor.id}-policy`,
        companyId: anchor.id,
        firm: '검증 정책',
        stance: '관계 검증 필요',
        horizon: '상시',
        date: 'seed',
        summary: '현재 데이터는 실명 기업 기반 관계 후보군이며, 특정 고객·납품 여부는 DART/SEC, IR, 수주 공시, 감독기관 자료, 기사 원문으로 확인해야 합니다.',
        sourceType: 'seed-model',
      },
    );

    tierTemplateForAnchor(template, anchor).forEach((tier1, tier1Index) => {
      const tier1Id = `${anchor.id}-${slugify(tier1.company.name)}`;
      const trendSeed = anchorIndex + tier1Index + 1;
      const tier1Revenue = metricValue(trendSeed, 2_400, 520);
      const tier1Stage = inferValueChainStage(tier1.company.sector, tier1.company.products, 'tier1');
      const tier1Moat = inferMoat(tier1.company.sector, tier1.company.products);
      const tier1RelationType = inferRelationshipType(tier1.company.sector, tier1.company.products);
      const tier1Company: Company = {
        id: tier1Id,
        anchorId: anchor.id,
        country: anchor.country,
        sectorId: anchor.sectorId,
        name: tier1.company.name,
        legalName: tier1.company.name,
        tier: 'tier1',
        sector: tier1.company.sector,
        region: tier1.company.region ?? '국내 주요 관계 기업군',
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
        analystSignal: '1차 관계 기업 스코어',
        investmentView: `${anchor.name} 투자·수요 사이클과 함께 확인할 1차 관계 기업`,
        riskLevel: tier1.company.risk,
        status: tier1.company.status,
        tags: tier1.company.tags,
        notes: '실제 상장·비상장 기업명을 넣은 1차 관계 후보입니다. 관계 확정 전에는 제품 영역과 전방 수요 노출도를 중심으로 해석해야 합니다.',
        sourceType: 'seed-model',
        sourceNote: companySourceNote('tier1'),
        businessSummary: `${simpleProductText(tier1.company.products)} 관련 제품·서비스를 제공하는 ${tier1.company.sector} 기업입니다.`,
        mainProducts: tier1.company.products,
        valueChainStage: tier1Stage,
        mainCustomers: [`${anchor.name} 같은 전방 기업의 투자와 함께 볼 기업`, `${anchor.sector} 산업 고객`],
        customerExposure: '공식 고객사와 고객별 매출 비중은 공시·IR 기준 확인 필요',
        revenueExposure: '고객별 매출 비중 미공개. 출처 확인 전에는 숫자로 표시하지 않습니다.',
        moat: tier1Moat.moat,
        moatExplanation: tier1Moat.moatExplanation,
        investorWatchPoint: '전방 고객 투자, 수주 공시, 고객 다변화 여부를 함께 확인합니다.',
        relationshipType: tier1RelationType,
        relationshipConfidence: '산업상 관련',
        sourceNotes: companySourceNote('tier1'),
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
        relationshipType: tier1RelationType,
        relationshipConfidence: '산업상 관련',
        sourceNotes: '직접 납품 관계가 아니라 같은 밸류체인에서 함께 볼 후보입니다.',
      });

      generatedOpinions.push({
        id: `${tier1Id}-opinion`,
        companyId: tier1Id,
        firm: '기업 관계 후보 모델',
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
        const childStage = inferValueChainStage(child.sector, child.products, 'tier2');
        const childMoat = inferMoat(child.sector, child.products);
        const childRelationType = inferRelationshipType(child.sector, child.products);
        const childCompany: Company = {
          id: childId,
          anchorId: anchor.id,
          country: anchor.country,
          sectorId: anchor.sectorId,
          name: child.name,
          legalName: child.name,
          tier: 'tier2',
          sector: child.sector,
          region: child.region ?? '국내 중소형 관계 후보 기업군',
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
          investmentView: child.status === 'opportunity' ? '전방 투자 확대 시 탄력 가능한 관계 후보 기업' : child.status === 'watch' ? '재무·고객집중 리스크 확인 필요' : '전방 수요와 함께 꾸준히 추적할 기업',
          riskLevel: child.risk,
          status: child.status,
          tags: child.tags,
          notes: '실명 관계 후보 기업입니다. 특정 고객 납품 관계를 단정하지 않고, 공시·수주·IR·감독기관·뉴스 원문으로 검증하는 전제로 배치했습니다.',
          sourceType: 'seed-model',
          sourceNote: companySourceNote('tier2'),
          businessSummary: `${simpleProductText(child.products)} 영역에서 관계를 확인할 ${child.sector} 후보 기업입니다.`,
          mainProducts: child.products,
          valueChainStage: childStage,
          mainCustomers: [`${tier1.company.name} 등 상위 단계 기업과 함께 볼 후보`, '공식 고객사는 원문 확인 필요'],
          customerExposure: '고객별 매출 비중 미공개. 공식 공시 또는 IR 확인 전에는 의존도 숫자를 표시하지 않습니다.',
          revenueExposure: '공개 공시 기준 매출 확인 불가 또는 원문 연결 필요',
          moat: childMoat.moat,
          moatExplanation: childMoat.moatExplanation,
          investorWatchPoint: '상장 여부, 공식 공시 유무, 실제 고객 관계가 확인되는지 먼저 봅니다.',
          relationshipType: childRelationType,
          relationshipConfidence: '검증 필요',
          sourceNotes: companySourceNote('tier2'),
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
          relationshipType: childRelationType,
          relationshipConfidence: '검증 필요',
          sourceNotes: '관계 이해용 보조 노드입니다. 직접 고객·납품 관계는 원문으로 확인해야 합니다.',
        });

        generatedOpinions.push({
          id: `${childId}-opinion`,
          companyId: childId,
          firm: '관계 후보 스크리너',
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

function dartSearchUrl(companyName: string) {
  return `https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=${encodeURIComponent(companyName)}`;
}

function listedDartSupplier(ticker: string, market: 'KOSPI' | 'KOSDAQ' | 'KONEX', searchName: string): Partial<Company> {
  return {
    ticker,
    exchange: market,
    market,
    listed: true,
    listingStatus: 'listed',
    filingSource: 'DART',
    filingStatus: 'search-only',
    isInvestmentAnalyzable: true,
    sourceSearchUrl: dartSearchUrl(searchName),
    sourceStatus: 'search-only',
  };
}

const listedSupplierOverridesByName: Record<string, Partial<Company>> = {
  한미반도체: listedDartSupplier('042700.KS', 'KOSPI', '한미반도체'),
  주성엔지니어링: listedDartSupplier('036930.KQ', 'KOSDAQ', '주성엔지니어링'),
  리노공업: listedDartSupplier('058470.KQ', 'KOSDAQ', '리노공업'),
  ISC: listedDartSupplier('095340.KQ', 'KOSDAQ', 'ISC'),
  원익IPS: listedDartSupplier('240810.KQ', 'KOSDAQ', '원익IPS'),
  솔브레인: listedDartSupplier('357780.KQ', 'KOSDAQ', '솔브레인'),
  이오테크닉스: listedDartSupplier('039030.KQ', 'KOSDAQ', '이오테크닉스'),
  DB하이텍: listedDartSupplier('000990.KS', 'KOSPI', 'DB하이텍'),
  하나마이크론: listedDartSupplier('067310.KQ', 'KOSDAQ', '하나마이크론'),
  심텍: listedDartSupplier('222800.KQ', 'KOSDAQ', '심텍'),
  덕산네오룩스: listedDartSupplier('213420.KQ', 'KOSDAQ', '덕산네오룩스'),
  피에스케이: listedDartSupplier('319660.KQ', 'KOSDAQ', '피에스케이'),
  테스: listedDartSupplier('095610.KQ', 'KOSDAQ', '테스'),
  에스앤에스텍: listedDartSupplier('101490.KQ', 'KOSDAQ', '에스앤에스텍'),
};

type AiRelationshipCompanyInput = {
  id: string;
  country: CountryId;
  name: string;
  legalName: string;
  ticker: string;
  exchange: string;
  sector: string;
  region: string;
  mainProducts: string[];
  valueChainStage: string;
  businessSummary: string;
  mainCustomersOrDemand: string[];
  relationshipSummary: string;
  economicMoat: string;
  moatExplanation: string;
  investorWatchPoint: string;
  customerExposure?: string;
  revenueExposure?: string;
  relationshipType?: string;
  relationshipConfidence?: string;
  sourceNotes?: string;
  riskLevel?: RiskLevel;
  status?: CompanyStatus;
  layout: Company['layout'];
  sourceSearchUrl?: string;
  sourceDirectUrl?: string;
  reportUrl?: string;
  filingSourceUrl?: string;
  dartRcpNo?: string;
  secAccessionNumber?: string;
  sourceStatus?: FilingSourceStatus;
  reportType?: string;
  fiscalYear?: string;
  fiscalPeriod?: string;
  filingDate?: string;
  corpCode?: string;
  cik?: string;
};

function makeAiRelationshipCompany(input: AiRelationshipCompanyInput): Company {
  return {
    id: input.id,
    anchorId: 'us-semiconductors-nvidia',
    country: input.country,
    sectorId: 'us-semiconductors',
    name: input.name,
    legalName: input.legalName,
    ticker: input.ticker,
    exchange: input.exchange,
    listed: true,
    listingStatus: 'listed',
    market: input.country === 'KR' && input.ticker.endsWith('.KS') ? 'KOSPI' : input.country === 'KR' && input.ticker.endsWith('.KQ') ? 'KOSDAQ' : input.exchange,
    filingSource: input.country === 'KR' ? 'DART' : 'SEC',
    isInvestmentAnalyzable: true,
    tier: 'tier1',
    sector: input.sector,
    region: input.region,
    products: input.mainProducts,
    anchorCustomer: input.mainCustomersOrDemand[0] ?? 'AI 서버 수요',
    revenue: '원문확인',
    revenueUnit: input.country === 'KR' ? '원문 기준: 백만원 단위' : 'Source unit: USD',
    revenueBasis: '고객별 매출 비중은 공식 공시·IR 확인 전까지 숫자로 표시하지 않습니다.',
    revenueTrend: 0,
    growthBasis: '성장률은 원문 공시와 실적 발표 기준으로 확인합니다.',
    opMargin: '원문 확인',
    debtRatio: '원문 확인',
    customerConcentration: '공시·IR 기준 확인 필요',
    analystSignal: 'AI 반도체 & 데이터센터 관계 지도 v0.1',
    investmentView: input.investorWatchPoint,
    riskLevel: input.riskLevel ?? 'medium',
    status: input.status ?? 'core',
    tags: ['AI 반도체 & 데이터센터', input.valueChainStage, input.exchange, input.ticker],
    notes: input.relationshipSummary,
    sourceType: 'official',
    sourceNote: input.sourceNotes ?? '공식 고객·매출 비중은 공시·IR 기준으로 확인해야 합니다.',
    businessSummary: input.businessSummary,
    mainProducts: input.mainProducts,
    valueChainStage: input.valueChainStage,
    mainCustomers: input.mainCustomersOrDemand,
    mainCustomersOrDemand: input.mainCustomersOrDemand,
    relationshipSummary: input.relationshipSummary,
    customerExposure: input.customerExposure ?? '고객별 매출 비중은 공식 공시 기준 확인 필요',
    revenueExposure: input.revenueExposure ?? '고객별 매출 비중 미공개 또는 확인 필요',
    moat: input.economicMoat,
    economicMoat: input.economicMoat,
    moatExplanation: input.moatExplanation,
    investorWatchPoint: input.investorWatchPoint,
    relationshipType: input.relationshipType ?? input.valueChainStage,
    relationshipConfidence: input.relationshipConfidence ?? '산업상 관련',
    sourceNotes: input.sourceNotes ?? '직접 고객·납품 관계와 매출 비중은 공시·IR 원문으로 확인해야 합니다.',
    sourceSearchUrl: input.sourceSearchUrl,
    sourceDirectUrl: input.sourceDirectUrl,
    reportUrl: input.reportUrl,
    filingSourceUrl: input.filingSourceUrl,
    dartRcpNo: input.dartRcpNo,
    secAccessionNumber: input.secAccessionNumber,
    sourceStatus: input.sourceStatus ?? (input.sourceDirectUrl || input.reportUrl ? 'direct' : input.sourceSearchUrl ? 'search-only' : 'needs-link'),
    reportType: input.reportType,
    fiscalYear: input.fiscalYear,
    fiscalPeriod: input.fiscalPeriod,
    filingDate: input.filingDate,
    corpCode: input.corpCode,
    cik: input.cik,
    layout: input.layout,
  };
}

const aiRelationshipCompanies: Company[] = [
  makeAiRelationshipCompany({
    id: 'ai-datacenter-google',
    country: 'US',
    name: 'Google / Alphabet',
    legalName: 'Alphabet Inc.',
    ticker: 'GOOGL',
    exchange: 'NASDAQ',
    sector: 'AI 플랫폼·클라우드',
    region: 'California',
    mainProducts: ['검색·광고', 'Google Cloud', 'AI 인프라'],
    valueChainStage: '최종 수요 / 플랫폼',
    businessSummary: '검색·광고와 Google Cloud를 운영하는 플랫폼 기업입니다. AI 서비스가 커질수록 자체 칩, 외부 GPU, 데이터센터 투자를 함께 확인합니다.',
    mainCustomersOrDemand: ['AI 서비스 사용자', 'Google Cloud 고객', '데이터센터 투자'],
    relationshipSummary: 'AI 서비스와 클라우드 투자가 맞춤형 칩, GPU, 네트워크, 데이터센터 인프라 수요와 연결될 수 있습니다.',
    economicMoat: '검색·광고 데이터, 클라우드 고객 기반, AI 모델·인프라 경험',
    moatExplanation: '사용자 데이터와 클라우드 고객 기반이 커서 AI 서비스를 실사용 제품으로 연결할 수 있는 힘이 있습니다.',
    investorWatchPoint: 'Google Cloud 성장, AI 인프라 투자, 자체 칩과 외부 GPU 사용 흐름을 같이 봅니다.',
    relationshipType: '클라우드 고객',
    relationshipConfidence: '공시·IR 기준 확인 필요',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Alphabet%20Inc',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000048/goog-20260331.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000048/goog-20260331.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000048/goog-20260331.htm',
    cik: '1652044',
    secAccessionNumber: '0001652044-26-000048',
    reportType: '10-Q',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-04-30',
    layout: { column: 1, row: 0 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-microsoft',
    country: 'US',
    name: 'Microsoft',
    legalName: 'Microsoft Corporation',
    ticker: 'MSFT',
    exchange: 'NASDAQ',
    sector: '클라우드·AI 플랫폼',
    region: 'Washington',
    mainProducts: ['Azure', 'AI 서비스', '클라우드 소프트웨어'],
    valueChainStage: '최종 수요 / 플랫폼',
    businessSummary: 'Azure 클라우드와 AI 서비스를 운영하는 플랫폼 기업입니다. 기업 고객의 AI 사용이 늘면 서버와 데이터센터 투자를 함께 확인합니다.',
    mainCustomersOrDemand: ['Azure 고객', 'AI 서비스 수요', '데이터센터 투자'],
    relationshipSummary: 'Azure AI 서비스 확산은 GPU 서버, 네트워크, 전력·냉각 인프라 수요와 연결될 수 있습니다.',
    economicMoat: '클라우드 고객 기반, 엔터프라이즈 소프트웨어, AI 서비스 생태계',
    moatExplanation: '기업 고객이 이미 Microsoft 소프트웨어와 Azure를 쓰고 있으면 AI 서비스도 같은 플랫폼에서 확장하기 쉽습니다.',
    investorWatchPoint: 'Azure 성장률과 AI 설비투자가 매출 성장과 비용 부담에 어떻게 반영되는지 봅니다.',
    relationshipType: '클라우드 고객',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Microsoft%20Corporation',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/789019/000119312526191507/msft-20260331.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/789019/000119312526191507/msft-20260331.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/789019/000119312526191507/msft-20260331.htm',
    cik: '789019',
    secAccessionNumber: '0001193125-26-191507',
    reportType: '10-Q',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-04-29',
    layout: { column: 1, row: 1 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-amazon',
    country: 'US',
    name: 'Amazon',
    legalName: 'Amazon.com, Inc.',
    ticker: 'AMZN',
    exchange: 'NASDAQ',
    sector: '클라우드·플랫폼',
    region: 'Washington',
    mainProducts: ['AWS', '클라우드 서버', 'AI 인프라'],
    valueChainStage: '최종 수요 / 플랫폼',
    businessSummary: 'AWS 클라우드를 운영하는 기업입니다. 클라우드 서버와 데이터센터 인프라 수요와 연결됩니다.',
    mainCustomersOrDemand: ['AWS 고객', 'AI 클라우드 수요', '데이터센터 투자'],
    relationshipSummary: 'AWS 투자는 AI 서버, 네트워크, 전력·냉각 장비 수요와 함께 봐야 합니다.',
    economicMoat: 'AWS 규모의 경제, 클라우드 운영 경험, 고객 기반',
    moatExplanation: '대규모 클라우드를 안정적으로 운영한 경험과 고객 기반이 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: 'AWS 성장률과 데이터센터 투자 속도가 유지되는지 봅니다.',
    relationshipType: '클라우드 고객',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Amazon.com%20Inc',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000014/amzn-20260331.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000014/amzn-20260331.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000014/amzn-20260331.htm',
    cik: '1018724',
    secAccessionNumber: '0001018724-26-000014',
    reportType: '10-Q',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-04-30',
    layout: { column: 1, row: 2 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-broadcom',
    country: 'US',
    name: 'Broadcom',
    legalName: 'Broadcom Inc.',
    ticker: 'AVGO',
    exchange: 'NASDAQ',
    sector: 'AI ASIC·네트워크 반도체',
    region: 'California',
    mainProducts: ['AI 맞춤형 반도체', '네트워크 반도체', '스위칭 칩'],
    valueChainStage: '맞춤형 반도체 / ASIC',
    businessSummary: '클라우드 고객이 원하는 기능에 맞춘 AI 칩과 네트워크 반도체를 설계하는 기업입니다.',
    mainCustomersOrDemand: ['AI 인프라 투자', '클라우드 데이터센터', '네트워크 장비 수요'],
    relationshipSummary: '클라우드 기업의 AI 인프라 투자가 맞춤형 칩과 데이터 이동용 네트워크 반도체 수요로 연결될 수 있습니다.',
    economicMoat: '네트워크 칩 설계 경험, 고객 맞춤형 ASIC 역량, 장기 고객 관계',
    moatExplanation: '고객 맞춤형 칩은 설계와 검증에 시간이 오래 걸려, 채택 뒤에는 바꾸기 쉽지 않은 장벽이 될 수 있습니다.',
    investorWatchPoint: 'AI 맞춤형 칩 매출, 네트워크 반도체 수요, 고객 집중 리스크를 함께 확인합니다.',
    relationshipType: '맞춤형 반도체 / ASIC',
    relationshipConfidence: '공시·IR 기준 확인 필요',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Broadcom%20Inc',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/1730168/000173016826000016/avgo-20260201.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/1730168/000173016826000016/avgo-20260201.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/1730168/000173016826000016/avgo-20260201.htm',
    cik: '1730168',
    secAccessionNumber: '0001730168-26-000016',
    reportType: '10-Q',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-03-11',
    layout: { column: 1, row: 3 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-tsmc',
    country: 'US',
    name: 'TSMC',
    legalName: 'Taiwan Semiconductor Manufacturing Company Limited',
    ticker: 'TSM',
    exchange: 'NYSE',
    sector: '파운드리',
    region: 'Taiwan',
    mainProducts: ['첨단 반도체 위탁생산', '파운드리', '첨단 공정'],
    valueChainStage: '파운드리 / 제조',
    businessSummary: 'NVIDIA, AMD, Broadcom 같은 설계 기업의 칩을 실제 반도체로 생산하는 파운드리 기업입니다.',
    mainCustomersOrDemand: ['AI 칩 설계 기업', '팹리스 반도체 기업', '첨단 공정 수요'],
    relationshipSummary: 'AI 칩 설계 기업의 주문이 첨단 공정 생산과 가동률로 이어지는지 확인합니다.',
    economicMoat: '첨단 공정 기술, 대규모 생산 경험, 고객 신뢰',
    moatExplanation: '작고 복잡한 칩을 안정적으로 대량 생산할 수 있는 기업이 제한적이라 고객 신뢰가 중요합니다.',
    investorWatchPoint: '첨단 공정 가동률, AI 칩 고객 주문, 설비투자 속도를 함께 봅니다.',
    relationshipType: '파운드리 / 제조',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Taiwan%20Semiconductor%20Manufacturing',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/1046179/000162828026025362/tsm-20251231.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/1046179/000162828026025362/tsm-20251231.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/1046179/000162828026025362/tsm-20251231.htm',
    cik: '1046179',
    secAccessionNumber: '0001628280-26-025362',
    reportType: '20-F',
    fiscalYear: '2025',
    fiscalPeriod: 'FY',
    filingDate: '2026-04-16',
    layout: { column: 1, row: 4 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-amd',
    country: 'US',
    name: 'AMD',
    legalName: 'Advanced Micro Devices, Inc.',
    ticker: 'AMD',
    exchange: 'NASDAQ',
    sector: 'AI GPU·CPU',
    region: 'California',
    mainProducts: ['CPU', 'GPU', '데이터센터 가속기'],
    valueChainStage: 'AI 칩 / GPU',
    businessSummary: 'CPU와 GPU, 데이터센터 가속기를 설계하는 기업입니다. NVIDIA와 함께 AI 칩 수요를 볼 때 비교 대상이 됩니다.',
    mainCustomersOrDemand: ['클라우드 데이터센터', 'AI 서버 수요', 'PC·서버 CPU 수요'],
    relationshipSummary: 'AI 서버 수요와 파운드리 생산, 고성능 메모리 수요와 함께 움직일 수 있습니다.',
    economicMoat: 'CPU·GPU 설계 경험, 데이터센터 제품 로드맵, 파트너 생태계',
    moatExplanation: '고성능 칩은 설계 난이도와 고객 검증 기간이 길어 제품 로드맵이 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: 'AI 가속기 매출과 데이터센터 고객 확대가 실제 실적으로 이어지는지 봅니다.',
    relationshipType: 'AI 칩 / GPU',
    relationshipConfidence: '산업상 관련',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/0000002488/000000248826000021/amd-20251227.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/0000002488/000000248826000021/amd-20251227.htm',
    cik: '2488',
    reportType: '10-K',
    fiscalYear: '2025',
    fiscalPeriod: 'FY',
    filingDate: '2026-02-25',
    layout: { column: 1, row: 5 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-intel',
    country: 'US',
    name: 'Intel',
    legalName: 'Intel Corporation',
    ticker: 'INTC',
    exchange: 'NASDAQ',
    sector: 'CPU·파운드리',
    region: 'California',
    mainProducts: ['CPU', '파운드리', '첨단 패키징'],
    valueChainStage: '파운드리 / 제조',
    businessSummary: 'CPU와 파운드리, 첨단 패키징을 추진하는 반도체 기업입니다.',
    mainCustomersOrDemand: ['서버 CPU 수요', '파운드리 고객', '첨단 패키징 수요'],
    relationshipSummary: 'AI 인프라 확대는 서버 CPU, 파운드리, 패키징 수요와 함께 볼 수 있습니다.',
    economicMoat: 'x86 CPU 기반, 제조 경험, 패키징 기술',
    moatExplanation: '오랜 CPU 고객 기반과 제조 경험은 경쟁력으로 볼 수 있지만, 파운드리 전환 성과는 계속 확인해야 합니다.',
    investorWatchPoint: '파운드리 고객 확보와 제조 수율 개선이 실제 실적으로 이어지는지 봅니다.',
    relationshipType: '파운드리 / 제조',
    relationshipConfidence: '공시·IR 기준',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/50863/000005086326000011/intc-20251227.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/50863/000005086326000011/intc-20251227.htm',
    reportType: '10-K',
    fiscalYear: '2025',
    fiscalPeriod: 'FY',
    filingDate: '2026-01-23',
    layout: { column: 1, row: 6 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-sk-hynix',
    country: 'KR',
    name: 'SK하이닉스',
    legalName: 'SK하이닉스',
    ticker: '000660.KS',
    exchange: 'KRX',
    sector: '메모리·HBM',
    region: '경기 이천',
    mainProducts: ['HBM', 'DRAM', 'NAND'],
    valueChainStage: '메모리 / HBM',
    businessSummary: 'HBM, DRAM, NAND 같은 메모리를 만드는 기업입니다. AI 서버에서는 GPU 옆에 붙는 HBM 수요를 먼저 확인합니다.',
    mainCustomersOrDemand: ['AI GPU 생태계', 'AI 서버 수요', '고성능 메모리 수요'],
    relationshipSummary: 'AI GPU 서버가 늘면 빠른 데이터 처리를 돕는 HBM 수요도 함께 커질 수 있습니다.',
    economicMoat: 'HBM 양산 경험, 고성능 메모리 기술, 고객 인증',
    moatExplanation: 'HBM은 성능과 안정성이 중요해 양산 경험과 고객 인증이 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: 'HBM 출하, 메모리 가격, 매출채권 회수가 현금흐름으로 이어지는지 봅니다.',
    relationshipType: '메모리 / HBM',
    relationshipConfidence: '산업상 관련',
    sourceDirectUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002287',
    reportUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002287',
    corpCode: '00164779',
    reportType: '분기보고서',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-05-15',
    layout: { column: 2, row: 0 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-samsung',
    country: 'KR',
    name: '삼성전자',
    legalName: '삼성전자',
    ticker: '005930.KS',
    exchange: 'KRX',
    sector: '메모리·파운드리',
    region: '경기 수원',
    mainProducts: ['메모리', '파운드리', '스마트폰'],
    valueChainStage: '메모리 / HBM',
    businessSummary: '메모리 반도체와 파운드리를 함께 운영하는 글로벌 제조 기업입니다. AI 서버 메모리와 첨단 생산 투자를 같이 봅니다.',
    mainCustomersOrDemand: ['AI 서버 메모리 수요', '파운드리 고객', '스마트폰 수요'],
    relationshipSummary: 'AI 서버 수요는 메모리 판매, HBM 경쟁력, 파운드리 가동률 흐름과 함께 봐야 합니다.',
    economicMoat: '메모리 양산 경험, 제조 규모, 파운드리 기술',
    moatExplanation: '대규모 생산 경험과 메모리·파운드리 기술을 함께 가진 점이 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: 'HBM 경쟁력, 파운드리 가동률, 메모리 가격이 같은 방향으로 좋아지는지 봅니다.',
    relationshipType: '메모리 / HBM',
    relationshipConfidence: '산업상 관련',
    sourceDirectUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002181',
    reportUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002181',
    corpCode: '00126380',
    reportType: '분기보고서',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-05-15',
    layout: { column: 2, row: 1 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-micron',
    country: 'US',
    name: 'Micron',
    legalName: 'Micron Technology, Inc.',
    ticker: 'MU',
    exchange: 'NASDAQ',
    sector: '메모리 반도체',
    region: 'Idaho',
    mainProducts: ['DRAM', 'NAND', 'HBM'],
    valueChainStage: '메모리 / HBM',
    businessSummary: 'DRAM, NAND, HBM 같은 메모리를 만드는 미국 기업입니다. AI 서버와 PC·서버 메모리 사이클을 함께 확인합니다.',
    mainCustomersOrDemand: ['AI 서버 수요', '데이터센터 메모리 수요'],
    relationshipSummary: 'AI 서버와 GPU 수요는 HBM과 고성능 DRAM 수요로 이어질 수 있습니다.',
    economicMoat: '메모리 양산 경험, 공정 기술, 제품 포트폴리오',
    moatExplanation: '메모리는 가격 사이클이 크지만, 양산 품질과 원가 경쟁력이 오래 쌓인 기업일수록 버틸 힘이 커집니다.',
    investorWatchPoint: 'HBM 전환, 메모리 가격 회복, 재고와 현금흐름 개선을 함께 봅니다.',
    relationshipType: '메모리 / HBM',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Micron%20Technology',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/723125/000072312526000006/mu-20260226.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/723125/000072312526000006/mu-20260226.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/723125/000072312526000006/mu-20260226.htm',
    cik: '723125',
    secAccessionNumber: '0000723125-26-000006',
    reportType: '10-Q',
    fiscalYear: '2026',
    fiscalPeriod: '2Q',
    filingDate: '2026-03-19',
    layout: { column: 2, row: 2 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-asml',
    country: 'US',
    name: 'ASML',
    legalName: 'ASML Holding N.V.',
    ticker: 'ASML',
    exchange: 'NASDAQ',
    sector: '반도체 장비',
    region: 'Netherlands',
    mainProducts: ['EUV 노광장비', 'DUV 장비', '반도체 장비 서비스'],
    valueChainStage: '반도체 장비',
    businessSummary: '반도체 회로를 아주 미세하게 새기는 EUV 노광장비를 만드는 기업입니다.',
    mainCustomersOrDemand: ['첨단 파운드리', '메모리 제조사', '반도체 설비투자'],
    relationshipSummary: 'TSMC·삼성전자 같은 제조사가 첨단 공정을 늘릴 때 핵심 장비 수요와 연결됩니다.',
    economicMoat: 'EUV 노광장비 기술, 장비 생태계, 고객 설치 기반',
    moatExplanation: 'EUV 장비는 기술 난이도와 협력 생태계가 높아 대체 공급자가 제한적입니다.',
    investorWatchPoint: 'EUV 수주, 고객 설비투자, 장비 인도 지연 여부를 확인합니다.',
    relationshipType: '반도체 장비',
    relationshipConfidence: '공시·IR 기준 확인 필요',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=ASML%20Holding',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/937966/000162828026011378/asml-20251231.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/937966/000162828026011378/asml-20251231.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/937966/000162828026011378/asml-20251231.htm',
    cik: '937966',
    secAccessionNumber: '0001628280-26-011378',
    reportType: '20-F',
    fiscalYear: '2025',
    fiscalPeriod: 'FY',
    filingDate: '2026-02-25',
    layout: { column: 2, row: 3 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-marvell',
    country: 'US',
    name: 'Marvell',
    legalName: 'Marvell Technology, Inc.',
    ticker: 'MRVL',
    exchange: 'NASDAQ',
    sector: '네트워크·맞춤형 반도체',
    region: 'Delaware',
    mainProducts: ['데이터센터 반도체', '네트워크 칩', '맞춤형 실리콘'],
    valueChainStage: '맞춤형 반도체 / ASIC',
    businessSummary: '데이터센터 네트워크와 맞춤형 반도체를 제공하는 기업입니다.',
    mainCustomersOrDemand: ['클라우드 데이터센터', 'AI 네트워크 수요'],
    relationshipSummary: 'AI 데이터센터가 커질수록 네트워크와 맞춤형 반도체 수요를 함께 봐야 합니다.',
    economicMoat: '데이터센터 반도체 설계 경험, 고객 맞춤형 설계 역량',
    moatExplanation: '고객 요구에 맞춘 반도체는 설계와 검증 기간이 길어 진입장벽이 될 수 있습니다.',
    investorWatchPoint: 'AI 데이터센터 관련 매출 성장과 고객 집중도를 확인합니다.',
    relationshipType: '맞춤형 반도체 / ASIC',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Marvell%20Technology',
    layout: { column: 2, row: 4 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-supermicro',
    country: 'US',
    name: 'Super Micro',
    legalName: 'Super Micro Computer, Inc.',
    ticker: 'SMCI',
    exchange: 'NASDAQ',
    sector: 'AI 서버',
    region: 'California',
    mainProducts: ['AI 서버', '고성능 서버', '랙 솔루션'],
    valueChainStage: '서버 / 네트워크',
    businessSummary: 'AI 서버와 고성능 서버를 공급하는 기업입니다.',
    mainCustomersOrDemand: ['AI 서버 수요', '데이터센터 투자'],
    relationshipSummary: 'AI 서버 수요는 GPU, 메모리, 전력·냉각 인프라 수요와 함께 움직일 수 있습니다.',
    economicMoat: '빠른 서버 설계·출시 역량, AI 서버 레퍼런스',
    moatExplanation: '고객이 원하는 서버 구성을 빠르게 제공하는 능력은 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: 'AI 서버 매출 성장과 재고·마진 변동을 함께 봅니다.',
    relationshipType: '서버 / 네트워크',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Super%20Micro%20Computer',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/1375365/000137536526000014/smci-20260331.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/1375365/000137536526000014/smci-20260331.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/1375365/000137536526000014/smci-20260331.htm',
    cik: '1375365',
    secAccessionNumber: '0001375365-26-000014',
    reportType: '10-Q',
    fiscalYear: '2026',
    fiscalPeriod: '3Q',
    filingDate: '2026-05-11',
    layout: { column: 2, row: 5 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-dell',
    country: 'US',
    name: 'Dell',
    legalName: 'Dell Technologies Inc.',
    ticker: 'DELL',
    exchange: 'NYSE',
    sector: '서버·IT 인프라',
    region: 'Texas',
    mainProducts: ['서버', '스토리지', 'IT 인프라'],
    valueChainStage: '서버 / 네트워크',
    businessSummary: '서버와 IT 인프라 장비를 공급하는 기업입니다.',
    mainCustomersOrDemand: ['기업 IT 투자', 'AI 서버 수요', '데이터센터 인프라'],
    relationshipSummary: 'AI 서버 수요는 서버 제조·공급 기업과 연결됩니다.',
    economicMoat: '기업 고객 기반, 서버 공급 경험, IT 인프라 채널',
    moatExplanation: '기업 고객과 공급 채널이 넓으면 대규모 서버 수요를 흡수하는 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: 'AI 서버 주문이 매출과 마진으로 이어지는지 봅니다.',
    relationshipType: '서버 / 네트워크',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Dell%20Technologies',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/1571996/000157199626000008/dell-20260130.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/1571996/000157199626000008/dell-20260130.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/1571996/000157199626000008/dell-20260130.htm',
    cik: '1571996',
    secAccessionNumber: '0001571996-26-000008',
    reportType: '10-K',
    fiscalYear: '2026',
    fiscalPeriod: 'FY',
    filingDate: '2026-03-16',
    layout: { column: 2, row: 6 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-arista',
    country: 'US',
    name: 'Arista Networks',
    legalName: 'Arista Networks, Inc.',
    ticker: 'ANET',
    exchange: 'NYSE',
    sector: '데이터센터 네트워크',
    region: 'California',
    mainProducts: ['이더넷 스위치', '데이터센터 네트워크', '클라우드 네트워킹'],
    valueChainStage: '서버 / 네트워크',
    businessSummary: '데이터센터 네트워크 장비를 공급하는 기업입니다.',
    mainCustomersOrDemand: ['클라우드 데이터센터', 'AI 네트워크 수요'],
    relationshipSummary: 'AI 서버가 늘면 서버 사이를 연결하는 네트워크 장비 수요도 커질 수 있습니다.',
    economicMoat: '클라우드 네트워크 레퍼런스, 소프트웨어 운영 경험',
    moatExplanation: '대형 데이터센터에서 검증된 장비와 운영 소프트웨어는 고객 신뢰를 만들 수 있습니다.',
    investorWatchPoint: '클라우드 고객 투자와 AI 네트워크 수요가 이어지는지 봅니다.',
    relationshipType: '서버 / 네트워크',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Arista%20Networks',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/1596532/000159653226000078/anet-20260331.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/1596532/000159653226000078/anet-20260331.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/1596532/000159653226000078/anet-20260331.htm',
    cik: '1596532',
    secAccessionNumber: '0001596532-26-000078',
    reportType: '10-Q',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-05-06',
    layout: { column: 2, row: 7 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-vertiv',
    country: 'US',
    name: 'Vertiv',
    legalName: 'Vertiv Holdings Co.',
    ticker: 'VRT',
    exchange: 'NYSE',
    sector: '데이터센터 전력·냉각',
    region: 'Ohio',
    mainProducts: ['전력 장비', '냉각 인프라', '데이터센터 운영 솔루션'],
    valueChainStage: '데이터센터 전력·냉각',
    businessSummary: '데이터센터가 안정적으로 돌아가도록 전력 공급과 냉각 인프라를 제공하는 기업입니다.',
    mainCustomersOrDemand: ['AI 데이터센터', '전력·냉각 증설 수요'],
    relationshipSummary: 'AI 서버가 늘면 전력 사용과 발열이 커져 전력·냉각 설비 수요도 함께 확인합니다.',
    economicMoat: '데이터센터 전력·냉각 운영 경험, 고객 설치 기반',
    moatExplanation: '데이터센터는 멈추면 손실이 커서 검증된 전력·냉각 장비와 운영 경험이 중요합니다.',
    investorWatchPoint: '전력·냉각 수주와 마진이 AI 데이터센터 투자와 함께 움직이는지 봅니다.',
    relationshipType: '데이터센터 전력·냉각',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Vertiv%20Holdings',
    sourceDirectUrl: 'https://www.sec.gov/Archives/edgar/data/1674101/000162828026026556/vrt-20260331.htm',
    reportUrl: 'https://www.sec.gov/Archives/edgar/data/1674101/000162828026026556/vrt-20260331.htm',
    filingSourceUrl: 'https://www.sec.gov/Archives/edgar/data/1674101/000162828026026556/vrt-20260331.htm',
    cik: '1674101',
    secAccessionNumber: '0001628280-26-026556',
    reportType: '10-Q',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-04-22',
    layout: { column: 2, row: 8 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-eaton',
    country: 'US',
    name: 'Eaton',
    legalName: 'Eaton Corporation plc',
    ticker: 'ETN',
    exchange: 'NYSE',
    sector: '전력 장비',
    region: 'Ireland / US',
    mainProducts: ['전력관리 장비', '배전 솔루션', '전기 인프라'],
    valueChainStage: '데이터센터 전력',
    businessSummary: '데이터센터와 산업 현장에 필요한 전력관리 장비를 공급하는 기업입니다.',
    mainCustomersOrDemand: ['데이터센터 전력 증설', '전력 인프라 투자'],
    relationshipSummary: 'AI 데이터센터가 늘면 전력관리와 배전 장비 수요도 함께 봐야 합니다.',
    economicMoat: '전력 장비 브랜드, 고객 인증, 장기 설치 기반',
    moatExplanation: '전력 인프라는 안정성이 중요해 검증된 장비와 서비스망이 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: '데이터센터 전력 투자와 수주잔고 변화를 봅니다.',
    relationshipType: '데이터센터 전력',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.sec.gov/search-filings?keys=Eaton%20Corporation',
    layout: { column: 2, row: 9 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-schneider',
    country: 'US',
    name: 'Schneider Electric',
    legalName: 'Schneider Electric SE',
    ticker: 'SBGSY',
    exchange: 'OTC',
    sector: '전력·자동화',
    region: 'France',
    mainProducts: ['전력관리', '자동화', '데이터센터 인프라'],
    valueChainStage: '데이터센터 전력',
    businessSummary: '데이터센터 전력관리와 자동화 솔루션을 제공하는 기업입니다.',
    mainCustomersOrDemand: ['데이터센터 전력 효율', '전력관리 수요'],
    relationshipSummary: 'AI 데이터센터 증설은 전력관리와 자동화 솔루션 수요와 연결될 수 있습니다.',
    economicMoat: '전력관리 기술, 글로벌 고객 기반, 설치 경험',
    moatExplanation: '전력관리 시스템은 안정성과 운영 경험이 중요해 기존 고객 기반이 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: '데이터센터 전력관리 수요와 글로벌 수주 흐름을 봅니다.',
    relationshipType: '데이터센터 전력',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://www.se.com/ww/en/about-us/investor-relations/',
    layout: { column: 2, row: 10 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-hanmi',
    country: 'KR',
    name: '한미반도체',
    legalName: '한미반도체',
    ticker: '042700.KS',
    exchange: 'KRX',
    sector: '후공정 장비',
    region: '인천',
    mainProducts: ['HBM 후공정 장비', 'TC 본더', '패키징 장비'],
    valueChainStage: '후공정 / 패키징',
    businessSummary: 'HBM과 반도체 후공정에 필요한 장비를 만드는 기업입니다.',
    mainCustomersOrDemand: ['HBM 생산 확대', '후공정 투자', '메모리 고객 수요'],
    relationshipSummary: 'HBM 생산 확대 국면에서 후공정 장비 수요와 연결될 수 있습니다.',
    economicMoat: 'HBM 후공정 장비 경험, 고객사 공정 인증',
    moatExplanation: '반도체 장비는 고객사 공정에 한 번 들어가면 검증과 교체 비용이 커서 경쟁사가 쉽게 대체하기 어렵습니다.',
    investorWatchPoint: '수주가 실제 매출로 잡히는 시점과 고객 다변화 여부를 봅니다.',
    relationshipType: '후공정 / 패키징',
    relationshipConfidence: '공시·IR 기준 확인 필요',
    sourceDirectUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001572',
    reportUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001572',
    reportType: '분기보고서',
    fiscalYear: '2026',
    fiscalPeriod: '1Q',
    filingDate: '2026-05-15',
    layout: { column: 2, row: 11 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-leeno',
    country: 'KR',
    name: '리노공업',
    legalName: '리노공업',
    ticker: '058470.KQ',
    exchange: 'KOSDAQ',
    sector: '반도체 테스트 부품',
    region: '부산',
    mainProducts: ['테스트 소켓', '테스트 핀', '반도체 검사용 부품'],
    valueChainStage: '테스트',
    businessSummary: '반도체 테스트용 소켓과 핀을 만드는 기업입니다.',
    mainCustomersOrDemand: ['반도체 테스트 공정', '고성능 칩 검증 수요'],
    relationshipSummary: '반도체 성능을 확인하는 테스트 공정에서 소켓과 핀 같은 부품 수요와 연결됩니다.',
    economicMoat: '정밀 가공 기술, 테스트 부품 품질 안정성',
    moatExplanation: '테스트 부품은 정확도와 내구성이 중요해 품질 안정성이 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: '고성능 반도체 테스트 수요와 마진 흐름을 봅니다.',
    relationshipType: '테스트',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=%EB%A6%AC%EB%85%B8%EA%B3%B5%EC%97%85',
    layout: { column: 2, row: 12 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-isc',
    country: 'KR',
    name: 'ISC',
    legalName: '아이에스시',
    ticker: '095340.KQ',
    exchange: 'KOSDAQ',
    sector: '반도체 테스트 소켓',
    region: '경기 성남',
    mainProducts: ['테스트 소켓', '실리콘 러버 소켓'],
    valueChainStage: '테스트',
    businessSummary: '반도체 테스트 소켓을 만드는 기업입니다.',
    mainCustomersOrDemand: ['반도체 테스트 공정', 'AI 칩·메모리 검증 수요'],
    relationshipSummary: 'AI 반도체와 고성능 메모리 생산이 늘면 테스트 소켓 수요도 함께 볼 수 있습니다.',
    economicMoat: '소켓 소재·설계 기술, 고객 인증',
    moatExplanation: '테스트 소켓은 고객 공정에 맞춘 품질 검증이 중요해 인증과 설계 경험이 진입장벽이 될 수 있습니다.',
    investorWatchPoint: '고부가 제품 비중과 고객 다변화 여부를 봅니다.',
    relationshipType: '테스트',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=ISC',
    layout: { column: 2, row: 13 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-wonikips',
    country: 'KR',
    name: '원익IPS',
    legalName: '원익아이피에스',
    ticker: '240810.KQ',
    exchange: 'KOSDAQ',
    sector: '반도체 장비',
    region: '경기 평택',
    mainProducts: ['증착 장비', '반도체 공정 장비'],
    valueChainStage: '반도체 장비',
    businessSummary: '반도체 제조 공정에 필요한 장비를 만드는 기업입니다.',
    mainCustomersOrDemand: ['메모리·파운드리 설비투자', '반도체 공정 장비 수요'],
    relationshipSummary: '반도체 설비투자가 늘면 공정 장비 수요와 함께 볼 수 있습니다.',
    economicMoat: '공정 장비 레퍼런스, 고객 인증',
    moatExplanation: '공정 장비는 고객사 인증과 양산 레퍼런스가 쌓일수록 대체가 어려워질 수 있습니다.',
    investorWatchPoint: '메모리·파운드리 투자 재개가 수주로 이어지는지 봅니다.',
    relationshipType: '반도체 장비',
    relationshipConfidence: '공시·IR 기준 확인 필요',
    sourceSearchUrl: 'https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=%EC%9B%90%EC%9D%B5IPS',
    layout: { column: 2, row: 14 },
  }),
  makeAiRelationshipCompany({
    id: 'ai-datacenter-soulbrain',
    country: 'KR',
    name: '솔브레인',
    legalName: '솔브레인',
    ticker: '357780.KQ',
    exchange: 'KOSDAQ',
    sector: '반도체 소재',
    region: '경기 성남',
    mainProducts: ['반도체 공정 소재', '식각액', '세정 소재'],
    valueChainStage: '소재 / 부품',
    businessSummary: '반도체 공정에 쓰이는 소재를 공급하는 기업입니다.',
    mainCustomersOrDemand: ['반도체 제조 공정', '메모리·파운드리 가동률'],
    relationshipSummary: '반도체 생산이 늘면 공정 소재 수요도 함께 볼 수 있습니다.',
    economicMoat: '소재 품질 안정성, 고객 공정 인증, 공급 안정성',
    moatExplanation: '반도체 소재는 불량이 전체 생산에 영향을 줄 수 있어 품질과 공급 안정성이 경쟁력으로 볼 수 있습니다.',
    investorWatchPoint: '반도체 가동률과 소재 단가·물량 흐름을 함께 봅니다.',
    relationshipType: '소재 / 부품',
    relationshipConfidence: '산업상 관련',
    sourceSearchUrl: 'https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=%EC%86%94%EB%B8%8C%EB%A0%88%EC%9D%B8',
    layout: { column: 2, row: 15 },
  }),
];

function makeAiRelationshipLink(input: {
  source: string;
  target: string;
  sourceCompany: string;
  targetCompany: string;
  relationshipType: string;
  relationshipDirection: string;
  description: string;
  whatIsSold: string;
  demandConnection: string;
  revenueExposure?: string;
  confidence: string;
  evidenceSummary?: string;
  evidenceType?: RelationshipEvidenceType;
  sourceName?: string;
  sourceUrl?: string;
  sourceDate?: string;
  sourceReliability?: SourceReliability;
  revenueExposureStatus?: string;
  lastVerifiedAt?: string;
  sourceNotes?: string;
  dependency?: number;
}): SupplyLink {
  const defaultEvidenceType: RelationshipEvidenceType = input.confidence.includes('공식 확인')
    ? 'company-filing'
    : input.confidence.includes('공시') || input.confidence.includes('IR')
      ? 'investor-presentation'
      : input.confidence.includes('검증')
        ? 'manual-note'
        : 'industry-analysis';
  const defaultReliability: SourceReliability = input.confidence.includes('공식 확인')
    ? 'high'
    : input.confidence.includes('공시') || input.confidence.includes('IR') || input.confidence.includes('산업상')
      ? 'medium'
      : 'needs-review';
  const defaultEvidenceSummary = input.confidence.includes('공식 확인')
    ? '회사 공시나 공식 발표에서 직접 확인된 관계로 정리했습니다.'
    : input.confidence.includes('공시') || input.confidence.includes('IR')
      ? '공시·IR·실적 발표에서 관련성을 확인하거나 추론할 수 있지만, 직접 고객·매출 비중은 원문 확인이 필요합니다.'
      : input.confidence.includes('검증')
        ? '관계 이해를 돕기 위한 수동 메모입니다. 공식 자료나 신뢰 가능한 원문으로 추가 확인이 필요합니다.'
        : '산업 구조상 함께 움직일 수 있는 관계로 정리했습니다. 직접 거래 여부와 고객별 매출 비중은 단정하지 않습니다.';

  return {
    id: `ai-v01-${input.source}-${input.target}`,
    anchorId: 'us-semiconductors-nvidia',
    source: input.source,
    target: input.target,
    sourceCompany: input.sourceCompany,
    targetCompany: input.targetCompany,
    label: input.relationshipType,
    dependency: input.dependency ?? 0,
    value: input.confidence,
    relationshipType: input.relationshipType,
    relationshipDirection: input.relationshipDirection,
    relationshipConfidence: input.confidence,
    description: input.description,
    whatIsSold: input.whatIsSold,
    demandConnection: input.demandConnection,
    revenueExposure: input.revenueExposure ?? '고객별 매출 비중은 공식 공시 기준 확인 필요',
    revenueExposureStatus: input.revenueExposureStatus ?? input.revenueExposure ?? '고객별 매출 비중 미공개 또는 공식 공시 기준 확인 필요',
    confidence: input.confidence,
    evidenceSummary: input.evidenceSummary ?? defaultEvidenceSummary,
    evidenceType: input.evidenceType ?? defaultEvidenceType,
    sourceName: input.sourceName ?? (input.sourceUrl ? '관계 근거 원문' : '출처 확인 필요'),
    sourceUrl: input.sourceUrl,
    sourceDate: input.sourceDate ?? '확인 필요',
    sourceReliability: input.sourceReliability ?? defaultReliability,
    lastVerifiedAt: input.lastVerifiedAt ?? '2026-05-18',
    sourceNotes: input.sourceNotes ?? '직접 납품 관계나 고객별 매출 비중은 공시·IR 원문 확인이 필요합니다.',
  };
}

const aiRelationshipLinks: SupplyLink[] = [
  makeAiRelationshipLink({
    source: 'ai-datacenter-google',
    target: 'ai-datacenter-broadcom',
    sourceCompany: 'Google / Alphabet',
    targetCompany: 'Broadcom',
    relationshipType: '고객·수요 연결',
    relationshipDirection: 'Google AI 인프라 투자 -> Broadcom 반도체 수요',
    description: 'Google의 AI 인프라 투자는 Broadcom의 AI 맞춤형 반도체 및 네트워크 반도체 수요와 연결될 수 있습니다.',
    whatIsSold: 'AI 맞춤형 반도체 관련 솔루션 / 네트워크 반도체',
    demandConnection: '클라우드 AI 인프라 투자가 맞춤형 칩 수요로 이어질 수 있습니다.',
    confidence: '공시·IR 기준 확인 필요',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-google',
    target: 'us-semiconductors-nvidia',
    sourceCompany: 'Google / Alphabet',
    targetCompany: 'NVIDIA',
    relationshipType: '클라우드 고객 / 수요 연결',
    relationshipDirection: 'Google AI 서비스 수요 -> AI GPU 수요',
    description: 'Google의 AI 서비스와 클라우드 투자는 GPU 서버 수요와 함께 확인할 수 있습니다. 특정 구매 비중은 공시 원문에서 확인해야 합니다.',
    whatIsSold: 'AI GPU·가속기',
    demandConnection: 'AI 서비스 사용이 늘면 GPU 기반 서버 수요도 커질 수 있습니다.',
    revenueExposure: '고객별 매출 비중은 공시·IR 기준 확인 필요',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-broadcom',
    target: 'ai-datacenter-tsmc',
    sourceCompany: 'Broadcom',
    targetCompany: 'TSMC',
    relationshipType: '위탁생산',
    relationshipDirection: 'Broadcom 칩 설계 -> TSMC 파운드리 생산',
    description: 'Broadcom은 칩을 설계하고, TSMC는 이를 생산하는 파운드리 역할을 합니다.',
    whatIsSold: '반도체 위탁생산',
    demandConnection: 'AI ASIC과 네트워크 칩 수요가 파운드리 생산 수요와 연결됩니다.',
    revenueExposure: '고객별 매출 비중 미공개 또는 확인 필요',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'us-semiconductors-nvidia',
    target: 'ai-datacenter-tsmc',
    sourceCompany: 'NVIDIA',
    targetCompany: 'TSMC',
    relationshipType: '위탁생산',
    relationshipDirection: 'NVIDIA AI GPU 설계 -> 파운드리 생산 생태계',
    description: 'NVIDIA는 AI GPU를 설계하고, 첨단 칩 생산은 파운드리 생태계와 연결됩니다.',
    whatIsSold: '첨단 반도체 생산',
    demandConnection: 'AI GPU 수요가 첨단 공정 생산 수요와 연결될 수 있습니다.',
    revenueExposure: '고객별 매출 비중은 공시·IR 기준 확인 필요',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'us-semiconductors-nvidia',
    target: 'ai-datacenter-sk-hynix',
    sourceCompany: 'NVIDIA',
    targetCompany: 'SK하이닉스',
    relationshipType: '수요 연결 / HBM 수요',
    relationshipDirection: 'AI GPU 수요 -> HBM 메모리 수요',
    description: 'AI GPU 수요가 늘면 GPU에 필요한 HBM 수요도 함께 커질 수 있습니다.',
    whatIsSold: 'HBM 메모리',
    demandConnection: 'AI 서버용 GPU는 고성능 메모리 수요와 같이 봐야 합니다.',
    revenueExposure: '고객별 HBM 매출 비중은 회사가 별도 공개하지 않으면 미공개로 표시합니다.',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-sk-hynix',
    target: 'ai-datacenter-samsung',
    sourceCompany: 'SK하이닉스',
    targetCompany: '삼성전자',
    relationshipType: '메모리 업황 비교',
    relationshipDirection: 'AI 서버 메모리 수요 -> HBM·DRAM 경쟁 흐름',
    description: '두 회사는 AI 서버용 HBM과 메모리 가격 흐름을 비교해서 볼 수 있는 메모리 기업입니다. 직접 거래 관계가 아니라 같은 시장 흐름에서 함께 확인합니다.',
    whatIsSold: 'HBM·DRAM·NAND 메모리',
    demandConnection: 'AI 서버 메모리 수요와 가격 사이클이 두 회사 실적에 다르게 반영될 수 있습니다.',
    revenueExposure: '직접 거래 관계가 아니라 업황 비교용 관계입니다.',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'us-semiconductors-nvidia',
    target: 'ai-datacenter-micron',
    sourceCompany: 'NVIDIA',
    targetCompany: 'Micron',
    relationshipType: '수요 연결 / HBM 수요',
    relationshipDirection: 'AI 서버 수요 -> 고성능 메모리 수요',
    description: 'AI 서버와 GPU 수요는 고성능 메모리 수요와 연결됩니다.',
    whatIsSold: 'HBM·DRAM 메모리',
    demandConnection: 'AI 서버 증설은 고성능 메모리 수요와 함께 볼 수 있습니다.',
    revenueExposure: '고객별 매출 비중 미공개 또는 확인 필요',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'us-semiconductors-nvidia',
    target: 'ai-datacenter-vertiv',
    sourceCompany: 'NVIDIA',
    targetCompany: 'Vertiv',
    relationshipType: '데이터센터 수요',
    relationshipDirection: 'AI 서버 수요 -> 전력·냉각 인프라 수요',
    description: 'AI 서버 수요가 늘면 데이터센터 전력·냉각 인프라 수요도 함께 커질 수 있습니다.',
    whatIsSold: '전력·냉각 인프라',
    demandConnection: 'GPU 기반 서버가 늘수록 데이터센터의 전력과 냉각 부담도 커질 수 있습니다.',
    revenueExposure: '프로젝트별 매출 비중은 공시·IR 기준 확인 필요',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'us-semiconductors-nvidia',
    target: 'ai-datacenter-dell',
    sourceCompany: 'NVIDIA',
    targetCompany: 'Dell',
    relationshipType: '서버 / AI 인프라 수요',
    relationshipDirection: 'AI GPU 수요 -> AI 서버 공급 수요',
    description: 'AI 서버 수요는 서버 제조·공급 기업과 연결됩니다.',
    whatIsSold: 'AI 서버·IT 인프라',
    demandConnection: 'GPU 수요 확대는 서버 구성과 데이터센터 인프라 수요로 번질 수 있습니다.',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'us-semiconductors-nvidia',
    target: 'ai-datacenter-supermicro',
    sourceCompany: 'NVIDIA',
    targetCompany: 'Super Micro',
    relationshipType: '서버 / AI 인프라 수요',
    relationshipDirection: 'AI GPU 수요 -> AI 서버 공급 수요',
    description: 'AI 서버 수요는 서버 제조·공급 기업과 연결됩니다.',
    whatIsSold: 'AI 서버·고성능 서버',
    demandConnection: 'AI 서버 증설은 GPU, 메모리, 전력·냉각 인프라와 함께 움직일 수 있습니다.',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'us-semiconductors-nvidia',
    target: 'ai-datacenter-arista',
    sourceCompany: 'NVIDIA',
    targetCompany: 'Arista Networks',
    relationshipType: '서버 / 네트워크 수요',
    relationshipDirection: 'AI 서버 증가 -> 데이터센터 네트워크 수요',
    description: 'AI 서버가 늘면 서버 간 데이터를 이동시키는 네트워크 장비 수요도 함께 커질 수 있습니다.',
    whatIsSold: '데이터센터 네트워크 장비',
    demandConnection: 'AI 워크로드는 고속 네트워크 인프라 수요와 연결될 수 있습니다.',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'us-semiconductors-nvidia',
    target: 'ai-datacenter-marvell',
    sourceCompany: 'NVIDIA',
    targetCompany: 'Marvell',
    relationshipType: '맞춤형 반도체 / 인터커넥트',
    relationshipDirection: 'NVIDIA AI 인프라 생태계 -> Marvell custom XPU·인터커넥트 협력',
    description: 'NVIDIA와 Marvell은 NVLink Fusion 기반 AI 인프라 협력을 발표했습니다. AI 서버가 늘수록 맞춤형 반도체와 고속 인터커넥트 수요를 함께 봐야 합니다.',
    whatIsSold: '맞춤형 XPU, scale-up networking, 광인터커넥트 관련 반도체',
    demandConnection: 'AI 데이터센터가 커질수록 GPU 간, 서버 간 데이터 이동을 돕는 연결 반도체가 중요해질 수 있습니다.',
    revenueExposure: '파트너십 기대가 고객별 매출로 얼마나 이어지는지는 공시·실적 발표 기준 확인 필요',
    confidence: '공식 확인',
    evidenceSummary: 'Marvell과 NVIDIA가 2026년 3월 31일 전략적 파트너십과 NVLink Fusion 협력을 공동 발표했습니다.',
    evidenceType: 'press-release',
    sourceName: 'Marvell Newsroom',
    sourceUrl: 'https://www.marvell.com/company/newsroom/nvidia-ai-ecosystem-expands-marvell-joins-forces-through-nvlink-fusion.html',
    sourceDate: '2026-03-31',
    sourceReliability: 'high',
    lastVerifiedAt: '2026-06-08',
    sourceNotes: '공식 파트너십 발표는 확인됐지만 고객별 매출 비중과 실적 기여는 후속 공시에서 확인합니다.',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-asml',
    target: 'ai-datacenter-tsmc',
    sourceCompany: 'ASML',
    targetCompany: 'TSMC',
    relationshipType: '장비 공급 / 핵심 장비',
    relationshipDirection: 'ASML 장비 -> 첨단 파운드리 생산',
    description: 'TSMC가 첨단 칩을 생산하려면 회로를 미세하게 새기는 ASML의 EUV 노광장비 같은 핵심 장비가 필요합니다.',
    whatIsSold: 'EUV 노광장비',
    demandConnection: '첨단 공정 투자가 핵심 장비 수요와 연결됩니다.',
    confidence: '공시·IR 기준 확인 필요',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-asml',
    target: 'ai-datacenter-samsung',
    sourceCompany: 'ASML',
    targetCompany: '삼성전자',
    relationshipType: '장비 공급 / 핵심 장비',
    relationshipDirection: 'ASML 장비 -> 메모리·파운드리 첨단 공정',
    description: '첨단 반도체 제조에는 ASML의 EUV 노광장비 같은 핵심 장비가 필요합니다.',
    whatIsSold: 'EUV 노광장비',
    demandConnection: '메모리와 파운드리 첨단 공정 투자가 핵심 장비 수요와 연결됩니다.',
    confidence: '공시·IR 기준 확인 필요',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-asml',
    target: 'ai-datacenter-intel',
    sourceCompany: 'ASML',
    targetCompany: 'Intel',
    relationshipType: '장비 공급 / 핵심 장비',
    relationshipDirection: 'ASML 장비 -> Intel 첨단 제조·파운드리',
    description: '첨단 반도체 제조에는 ASML의 EUV 노광장비 같은 핵심 장비가 필요합니다.',
    whatIsSold: 'EUV 노광장비',
    demandConnection: '첨단 제조와 파운드리 투자가 핵심 장비 수요와 연결됩니다.',
    confidence: '공시·IR 기준 확인 필요',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-hanmi',
    target: 'ai-datacenter-sk-hynix',
    sourceCompany: '한미반도체',
    targetCompany: 'SK하이닉스',
    relationshipType: '장비 공급 / 후공정',
    relationshipDirection: 'HBM 후공정 장비 수요 -> HBM 생산 확대',
    description: 'HBM 생산 확대 국면에서 후공정 장비 수요와 연결될 수 있습니다.',
    whatIsSold: 'HBM 후공정 장비',
    demandConnection: 'HBM 생산 확대가 후공정 장비 수요와 연결될 수 있습니다.',
    revenueExposure: '고객별 매출 비중은 공식 공시·IR 기준 확인 필요',
    confidence: '공시·IR 기준 확인 필요',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-leeno',
    target: 'us-semiconductors-nvidia',
    sourceCompany: '리노공업',
    targetCompany: 'NVIDIA',
    relationshipType: '테스트 부품 / 수요 연결',
    relationshipDirection: 'AI 칩 수요 -> 반도체 테스트 부품 수요',
    description: '반도체 성능을 확인하는 테스트 공정에서 소켓과 핀 같은 부품 수요와 연결됩니다.',
    whatIsSold: '테스트 소켓·핀',
    demandConnection: '고성능 반도체가 늘면 테스트 부품 수요도 함께 볼 수 있습니다.',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-isc',
    target: 'us-semiconductors-nvidia',
    sourceCompany: 'ISC',
    targetCompany: 'NVIDIA',
    relationshipType: '테스트 부품 / 수요 연결',
    relationshipDirection: 'AI 칩 수요 -> 반도체 테스트 소켓 수요',
    description: '반도체 성능을 확인하는 테스트 공정에서 테스트 소켓 수요와 연결됩니다.',
    whatIsSold: '테스트 소켓',
    demandConnection: 'AI 반도체와 고성능 메모리 생산 확대는 테스트 부품 수요와 함께 볼 수 있습니다.',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-wonikips',
    target: 'ai-datacenter-samsung',
    sourceCompany: '원익IPS',
    targetCompany: '삼성전자',
    relationshipType: '장비 공급 / 공정 장비',
    relationshipDirection: '반도체 설비투자 -> 공정 장비 수요',
    description: '반도체 설비투자가 늘면 공정 장비 수요와 함께 볼 수 있습니다.',
    whatIsSold: '증착·공정 장비',
    demandConnection: '메모리·파운드리 투자 확대는 장비 수요와 연결될 수 있습니다.',
    confidence: '공시·IR 기준 확인 필요',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-soulbrain',
    target: 'ai-datacenter-samsung',
    sourceCompany: '솔브레인',
    targetCompany: '삼성전자',
    relationshipType: '소재 공급 / 공정 소재',
    relationshipDirection: '반도체 생산 증가 -> 공정 소재 수요',
    description: '반도체 생산이 늘면 공정 소재 수요도 함께 볼 수 있습니다.',
    whatIsSold: '반도체 공정 소재',
    demandConnection: '반도체 가동률과 첨단 공정 투자가 소재 수요와 연결될 수 있습니다.',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-microsoft',
    target: 'us-semiconductors-nvidia',
    sourceCompany: 'Microsoft',
    targetCompany: 'NVIDIA',
    relationshipType: '클라우드 고객 / 수요 연결',
    relationshipDirection: 'Azure AI 투자 -> AI GPU 수요',
    description: '클라우드 AI 서비스 확대는 AI GPU와 서버 인프라 수요와 연결될 수 있습니다.',
    whatIsSold: 'AI GPU·가속기',
    demandConnection: 'AI 서비스가 늘면 GPU 기반 서버 수요도 커질 수 있습니다.',
    confidence: '산업상 관련',
  }),
  makeAiRelationshipLink({
    source: 'ai-datacenter-amazon',
    target: 'us-semiconductors-nvidia',
    sourceCompany: 'Amazon',
    targetCompany: 'NVIDIA',
    relationshipType: '클라우드 고객 / 수요 연결',
    relationshipDirection: 'AWS AI 투자 -> AI GPU 수요',
    description: 'AWS AI 인프라 확대는 AI GPU와 데이터센터 인프라 수요와 함께 볼 수 있습니다.',
    whatIsSold: 'AI GPU·가속기',
    demandConnection: '클라우드 AI 수요가 AI 서버 수요로 이어질 수 있습니다.',
    confidence: '산업상 관련',
  }),
];

const companyRelationshipOverrides: Record<string, Partial<Company>> = {
  'us-semiconductors-nvidia': {
    sector: 'AI GPU·가속기',
    products: ['AI GPU', 'AI accelerator', 'networking'],
    businessSummary: 'AI 계산에 필요한 GPU, AI 가속기, 네트워킹 칩을 설계하는 기업입니다. 클라우드 기업의 AI 서버 투자와 함께 확인합니다.',
    mainProducts: ['AI GPU', 'AI 가속기', '네트워킹'],
    valueChainStage: 'AI 칩 / GPU',
    mainCustomers: ['클라우드 데이터센터', 'AI 서버 수요', 'AI 개발 생태계'],
    mainCustomersOrDemand: ['클라우드 데이터센터', 'AI 서버 수요', 'AI 개발 생태계'],
    relationshipSummary: 'AI 서비스와 데이터센터 투자가 늘면 GPU, HBM, 서버, 전력·냉각 인프라 수요를 함께 확인합니다.',
    customerExposure: '주요 고객과 매출 비중은 공식 공시·IR 기준으로 확인합니다.',
    revenueExposure: '데이터센터 매출 비중은 공시 원문에서 확인하고, 고객별 비중은 공개 범위를 확인해야 합니다.',
    moat: 'GPU 생태계, CUDA 소프트웨어 플랫폼, 네트워킹 제품군',
    economicMoat: 'GPU 생태계, CUDA 소프트웨어 플랫폼, 네트워킹 제품군',
    moatExplanation: 'AI 개발자와 기업이 CUDA와 NVIDIA 장비에 맞춰 시스템을 만들수록 다른 제품으로 바꾸는 비용이 커질 수 있습니다.',
    investorWatchPoint: '데이터센터 매출 성장, 고객 설비투자, 마진, 제품 전환 리스크를 함께 봅니다.',
    relationshipType: 'AI 칩 / GPU',
    relationshipConfidence: '공시·IR 기준',
    sourceNotes: 'NVIDIA 자체 실적은 SEC 원문 기준으로 확인하고, 개별 고객 관계와 매출 비중은 별도 공시 확인이 필요합니다.',
  },
};

function applyCompanyFilingAndOverrides(company: Company): Company {
  const filingSource = companyFilingSources[company.id] ?? {};
  const listedSupplierOverride = listedSupplierOverridesByName[company.name] ?? {};
  const override = companyRelationshipOverrides[company.id] ?? {};
  const merged = {
    ...company,
    ...listedSupplierOverride,
    ...override,
    ...filingSource,
  };
  const hasDirectSource = Boolean(
    merged.reportUrl ||
      merged.filingSourceUrl ||
      merged.sourceDirectUrl ||
      merged.dartRcpNo,
  );
  const resolvedSourceStatus = hasDirectSource ? 'direct' : merged.sourceStatus ?? (merged.sourceSearchUrl ? 'search-only' : 'needs-link');

  return {
    ...merged,
    sourceStatus: resolvedSourceStatus,
    filingStatus: hasDirectSource ? 'direct' : merged.filingStatus ?? resolvedSourceStatus,
  };
}

export const companies = [
  ...built.generatedCompanies.map(applyCompanyFilingAndOverrides),
  ...aiRelationshipCompanies.map(applyCompanyFilingAndOverrides),
];
export const links = [...built.generatedLinks, ...aiRelationshipLinks];
export const analystOpinions = built.generatedOpinions;

export const financialMetricGuides: Record<FinancialMetricKey, string> = {
  revenue: '회사가 얼마나 팔았는지 보여주는 숫자',
  operatingIncome: '본업으로 얼마나 벌었는지 보여주는 숫자',
  netIncome: '세금과 비용까지 반영한 최종 이익',
  debtRatio: '빚 부담이 얼마나 큰지 보는 지표',
  operatingMargin: '매출 중 본업 이익으로 남는 비율',
  cashFlow: '실제로 현금이 들어오고 나가는 흐름',
  capitalExpenditures: '미래 생산능력을 위해 설비와 자산에 투자한 금액',
  currentRatio: '단기 부채를 감당할 유동자산 여력을 보는 지표',
  interestCoverage: '영업이익으로 이자비용을 얼마나 감당하는지 보는 지표',
  freeCashFlow: '투자를 하고도 남는 현금 여력을 보는 지표',
  eps: '주식 한 주당 이익을 보여주는 지표',
  depreciationAndAmortization: '설비와 무형자산 비용이 기간별로 반영되는 금액',
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
    interpretation: '기업 관계 안에서 장비 기업 관심이 커졌습니다.',
    reason: '후공정 장비 수주 기대가 관련 기업 관심을 키웠습니다.',
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
    id: 'pick-marvell-nvlink-fusion-ai-interconnect',
    pickId: 'pick-marvell-nvlink-fusion-ai-interconnect',
    companyId: 'ai-datacenter-marvell',
    title: 'Marvell도 AI 인프라 수혜주로 봐야 할까?',
    companyName: 'Marvell Technology',
    ticker: 'MRVL',
    market: 'US',
    movementDirection: 'up',
    movementLabel: 'AI 연결 반도체 기대',
    reasonSummary: 'AI 수혜주를 NVIDIA만 보고 있었다면, 이번 주는 Marvell도 함께 봐야 합니다. AI 서버가 늘수록 서버와 서버를 잇는 네트워크·인터커넥트 반도체가 중요해집니다.',
    beginnerSummary: 'NVIDIA가 AI의 두뇌라면, Marvell은 그 두뇌들이 서로 말하게 해주는 통신망 쪽에 가까운 회사입니다.',
    sector: 'AI 인프라 연결 반도체',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: '네트워크 / 인터커넥트 반도체',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'Broadcom', 'Arista Networks'],
    relatedCompanies: ['NVIDIA', 'Broadcom', 'Arista Networks'],
    relatedCompanyIds: ['us-semiconductors-nvidia', 'ai-datacenter-broadcom', 'ai-datacenter-arista'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'ai-datacenter-marvell',
    relatedTradeTags: ['NVLink Fusion', 'AI 데이터센터', '인터커넥트'],
    oneLineConclusion: 'NVIDIA가 AI의 두뇌라면, Marvell은 그 두뇌들이 서로 말하게 해주는 통신망입니다.',
    beginnerExplanation: 'AI 데이터센터가 커질수록 GPU 자체만큼 서버끼리 빠르게 데이터를 주고받는 네트워크와 인터커넥트가 중요해집니다. Marvell은 맞춤형 실리콘, 광통신, 고속 연결 반도체 흐름에서 함께 확인할 참고 기업입니다.',
    watchMetrics: [
      { label: 'AI 커스텀 반도체 매출', note: 'NVIDIA 생태계 기대가 실제 고객 주문과 매출로 이어지는지 봅니다.' },
      { label: '광통신 / 인터커넥트 수요', note: 'AI 서버 증가가 데이터 이동 병목을 키우며 관련 수요로 연결되는지 확인합니다.' },
      { label: '실적 연결 여부', note: '파트너십 기대가 다음 실적 설명과 가이던스에 어떻게 반영되는지 봅니다.' },
    ],
    goodSignals: [
      '맞춤형 반도체와 데이터센터 매출 설명이 강화됨',
      '광통신·인터커넥트 수요가 실제 주문으로 연결',
      'NVIDIA 생태계 기대가 실적 가이던스에 반영',
    ],
    cautionSignals: [
      '파트너십 기대가 매출로 확인되기까지 시간이 걸림',
      '고객 집중도와 경쟁 ASIC 업체 부담',
      'AI 인프라 투자 속도 둔화',
    ],
    sourceLinks: [
      {
        label: 'Marvell·NVIDIA NVLink Fusion 발표',
        url: 'https://www.marvell.com/company/newsroom/nvidia-ai-ecosystem-expands-marvell-joins-forces-through-nvlink-fusion.html',
        note: '전략적 파트너십, NVLink Fusion, 광인터커넥트 협력은 회사 발표 기준으로 확인합니다.',
      },
      {
        label: 'NVIDIA NVLink Fusion 발표',
        url: 'https://investor.nvidia.com/news/press-release-details/2025/NVIDIA-Unveils-NVLink-Fusion-for-Industry-to-Build-Semi-Custom-AI-Infrastructure-With-NVIDIA-Partner-Ecosystem/default.aspx',
        note: 'NVLink Fusion 파트너 생태계 문맥을 확인하는 보조 원문입니다.',
      },
    ],
    publishedAt: '2026-06-08',
    status: 'published',
  },
  {
    id: 'pick-lg-electronics-ai-datacenter-cooling',
    pickId: 'pick-lg-electronics-ai-datacenter-cooling',
    title: 'LG전자는 왜 AI 냉각 흐름에 묶였을까?',
    companyName: 'LG전자',
    ticker: '066570.KS',
    market: 'KR',
    movementDirection: 'down',
    movementLabel: 'AI 냉각 기대 / 변동성',
    reasonSummary: 'AI 서버가 늘어나면 반도체만 필요한 것이 아니라 전력, 냉각, 공조 인프라도 중요해집니다. 단기 급등 뒤에는 차익실현 흐름으로 해석될 수 있습니다.',
    beginnerSummary: 'NVIDIA가 AI의 두뇌를 만든다면, LG전자는 그 두뇌가 과열되지 않도록 식혀주는 쪽에 기대감이 붙은 회사입니다.',
    sector: 'AI 데이터센터 냉각/HVAC',
    flowLabel: 'AI 데이터센터 냉각/HVAC',
    flowStage: '냉각 / 공조 인프라',
    valueChainPosition: 'supplier',
    connectedLeaders: ['Vertiv', 'Schneider Electric', 'Eaton'],
    relatedCompanies: ['데이터센터 운영사', '전력 인프라 기업', '냉각 장비 기업'],
    relatedTradeTags: ['AI 데이터센터', 'HVAC', '냉각 인프라'],
    oneLineConclusion: 'AI 서버가 늘면 GPU만이 아니라 열을 빼내는 냉각·공조 인프라도 같이 봐야 합니다.',
    beginnerExplanation: '고성능 AI 서버는 많은 전력을 쓰고 열도 많이 냅니다. 그래서 데이터센터 냉각, 칠러, 공조, 전력 효율은 AI 인프라 투자에서 함께 확인할 영역입니다. 다만 단기 주가 움직임은 테마 기대와 차익실현이 섞일 수 있어 이유를 단정하지 않습니다.',
    watchMetrics: [
      { label: 'AI 인프라 수주', note: '기대가 실제 데이터센터 냉각·HVAC 수주로 이어지는지 봅니다.' },
      { label: 'HVAC / 냉각 실적', note: '관련 사업이 매출과 이익에 의미 있게 찍히는지 확인합니다.' },
      { label: '밸류 부담', note: '단기 테마성 급등 이후 기대와 실적 사이의 간격이 줄어드는지 봅니다.' },
    ],
    goodSignals: [
      'AI 데이터센터 냉각 수주가 추가로 확인',
      'HVAC 사업 매출과 마진 기여가 커짐',
      '전력·냉각 효율 경쟁력이 고객 채택으로 연결',
    ],
    cautionSignals: [
      '단기 급등 뒤 차익실현 흐름이 이어짐',
      '수주 기대가 실제 실적으로 찍히는 시점이 늦어짐',
      '테마 기대가 밸류에이션 부담으로 바뀜',
    ],
    sourceLinks: [
      {
        label: 'LG전자 완주 AI 데이터센터 HVAC 협약',
        url: 'https://www.lge.co.kr/story/newsroom/235685',
        note: 'AI 데이터센터 토털 HVAC 솔루션 공급 추진과 수주 확대 문맥은 LG전자 뉴스룸 기준으로 확인합니다.',
      },
      {
        label: 'LG AI 데이터센터 냉각 솔루션',
        url: 'https://www.lg.com/global/newsroom/news/eco-solution/lg-electronics-showcases-ai-data-center-cooling-solutions-at-data-center-world-2026/',
        note: 'Data Center World 2026에서 공개한 냉각 포트폴리오 문맥을 확인합니다.',
      },
    ],
    publishedAt: '2026-06-08',
    status: 'published',
  },
  {
    id: 'pick-taylor-morrison-berkshire-acquisition',
    pickId: 'pick-taylor-morrison-berkshire-acquisition',
    title: 'Taylor Morrison은 왜 인수 프리미엄이 붙었을까?',
    companyName: 'Taylor Morrison',
    ticker: 'TMHC',
    market: 'US',
    movementDirection: 'up',
    movementLabel: 'Berkshire 현금 인수 발표',
    reasonSummary: 'AI 종목만 움직인 것이 아니라 Taylor Morrison은 Berkshire Hathaway의 현금 인수 발표로 움직인 사례입니다.',
    beginnerSummary: '집을 산 게 아니라 집을 짓는 회사를 통째로 산 것입니다. 그래서 주택경기와 인수 승인 여부를 같이 봅니다.',
    sector: '주택건설 / 인수 프리미엄',
    flowLabel: 'Berkshire 인수 프리미엄',
    flowStage: '주택건설 / M&A',
    valueChainPosition: 'leader',
    connectedLeaders: ['Berkshire Hathaway', 'Clayton Homes', '미국 주택경기'],
    relatedCompanies: ['Berkshire Hathaway', 'Clayton Homes', '미국 주택건설사'],
    relatedTradeTags: ['M&A', '주택경기', 'Berkshire Hathaway'],
    oneLineConclusion: '집을 산 게 아니라 집을 짓는 회사를 통째로 산 인수 프리미엄 사례입니다.',
    beginnerExplanation: 'Berkshire Hathaway가 Taylor Morrison을 현금으로 인수하겠다고 발표하면서, 시장은 인수 가격과 승인 가능성을 먼저 반영했습니다. 이 흐름은 AI 테마와 별개로 M&A 프리미엄, 금리 부담, 주택경기를 함께 보는 사례입니다.',
    watchMetrics: [
      { label: '인수 승인 여부', note: '주주 승인과 규제 승인 등 최종 종결 조건을 확인합니다.' },
      { label: '주택경기와 금리', note: '주택 수요가 금리 부담을 이겨내는지 봅니다.' },
      { label: 'Berkshire 주택 사업 시너지', note: '기존 주택·건축자재 사업과 함께 운영될 여지가 있는지 확인합니다.' },
    ],
    goodSignals: [
      '인수 절차가 예정대로 진행',
      '주택 수요와 주문 흐름이 금리 부담을 흡수',
      'Berkshire의 기존 주택 관련 사업과 운영 시너지 확인',
    ],
    cautionSignals: [
      '승인 절차 지연 또는 조건 변경',
      '금리 부담으로 신규 주택 수요 둔화',
      '인수 프리미엄 이후 추가 상승 여력 제한',
    ],
    sourceLinks: [
      {
        label: 'Taylor Morrison·Berkshire 인수 발표',
        url: 'https://s27.q4cdn.com/448041563/files/doc_news/Berkshire-Hathaway-to-Acquire-Taylor-Morrison-Home-Corporation-for-8-5-Billion-2026.pdf',
        note: '주당 72.50달러 현금 인수 조건, 승인 절차, 종결 예상 시점은 공동 발표 원문 기준으로만 확인합니다.',
      },
    ],
    publishedAt: '2026-06-08',
    status: 'published',
  },
  {
    id: 'pick-smci-ai-server-funding-dilution',
    pickId: 'pick-smci-ai-server-funding-dilution',
    companyId: 'ai-datacenter-supermicro',
    title: 'AI 서버 주문은 많은데, 왜 SMCI는 흔들렸을까?',
    companyName: 'Super Micro Computer',
    ticker: 'SMCI',
    market: 'US',
    movementDirection: 'down',
    movementLabel: 'AI 서버 자금조달 부담',
    reasonSummary: 'AI 서버 주문은 많았지만, 그 주문을 감당하기 위한 대규모 자금조달 계획이 희석 부담으로 해석됐습니다.',
    beginnerSummary: '주문이 많아도 먼저 부품을 사고 생산해야 합니다. 시장은 성장 자금과 기존 주주 부담을 함께 봤습니다.',
    sector: 'AI 서버 / 데이터센터',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: 'AI 서버 조립 / 랙 서버',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'Micron', 'SK하이닉스', 'Vertiv'],
    relatedCompanies: ['NVIDIA', 'Micron', 'SK하이닉스', 'Vertiv'],
    relatedCompanyIds: ['us-semiconductors-nvidia', 'ai-datacenter-micron', 'ai-datacenter-sk-hynix', 'ai-datacenter-vertiv'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'ai-datacenter-supermicro',
    relatedTradeTags: ['AI 서버', '자금조달', '희석 부담'],
    oneLineConclusion: 'AI 서버 수요는 강했지만, 그 수요를 감당할 돈을 마련하는 방식이 주가를 눌렀습니다.',
    beginnerExplanation: 'AI 서버를 만들려면 GPU, 메모리, 전력, 냉각, 부품 재고가 먼저 필요합니다. 주문이 바로 매출이 되는 것이 아니라 부품 구매, 생산, 납품 과정을 거치므로 자금조달 방식과 현금흐름을 같이 확인해야 합니다.',
    watchMetrics: [
      { label: '주문 -> 매출 전환', note: '최근 주문이 실제 매출로 찍히는지 봅니다.' },
      { label: '마진', note: '서버를 많이 팔아도 부품 원가를 빼고 이익이 남는지 확인합니다.' },
      { label: '영업현금흐름', note: '재고와 부품 구매 부담 이후 현금흐름이 회복되는지 봅니다.' },
      { label: '희석 부담', note: '자금조달 이후 기존 주주의 지분 희석 가능성을 확인합니다.' },
    ],
    goodSignals: [
      'AI 서버 주문이 실제 매출로 전환',
      '매출 증가와 함께 마진 유지',
      '재고 부담 완화와 영업현금흐름 회복',
    ],
    cautionSignals: [
      '자금조달 이후 희석 부담 확대',
      '부품 선구매로 현금흐름 악화',
      '매출은 늘지만 마진이 낮아짐',
    ],
    sourceLinks: [
      {
        label: 'Supermicro 자금조달 발표',
        url: 'https://ir.supermicro.com/news/news-details/2026/Supermicro-Announces-Proposed-7-0-Billion-of-Equity-and-Equity-linked-Financing-Transactions-To-Fund-AI-Orders/default.aspx',
        note: 'AI 서버 주문을 충족하기 위한 70억 달러 규모 자금조달 계획은 회사 발표 기준으로 확인합니다.',
      },
      {
        label: 'Supermicro 자금조달 가격 확정',
        url: 'https://ir.supermicro.com/news/news-details/2026/Supermicro-Announces-Pricing-of-Equity-and-Equity-Linked-Financing-Transactions-To-Fund-AI-Orders/default.aspx',
        note: '보통주, 의무전환우선주, ATM 프로그램 조건은 회사 발표 기준으로 확인합니다.',
      },
    ],
    publishedAt: '2026-06-12',
    status: 'archived',
  },
  {
    id: 'pick-hyundai-engineering-reconstruction-expectation',
    pickId: 'pick-hyundai-engineering-reconstruction-expectation',
    title: '종전 기대감이 커지면 시장은 왜 건설주를 볼까?',
    companyName: '현대건설',
    ticker: '000720.KS',
    market: 'KR',
    movementDirection: 'up',
    movementLabel: '중동 재건 기대',
    reasonSummary: '미국·이란 종전 기대감이 커지며 시장은 전쟁 이후 복구와 인프라 발주 가능성을 먼저 봤습니다.',
    beginnerSummary: '전쟁이 멈출 수 있다는 기대가 도로, 플랜트, 주택, 항만처럼 다시 지어야 하는 영역으로 관심을 옮겼습니다.',
    sector: '재건 / 인프라 / 해외수주',
    flowLabel: '재건 / 인프라',
    flowStage: '해외수주 / 인프라 복구',
    valueChainPosition: 'leader',
    connectedLeaders: ['삼성물산', 'GS건설', '대우건설'],
    relatedCompanies: ['삼성물산', 'GS건설', '대우건설'],
    relatedTradeTags: ['중동 재건', '해외수주', '인프라'],
    oneLineConclusion: '전쟁이 멈출 수 있다는 기대가 시장을 먼저 다시 짓는 회사로 움직였습니다.',
    beginnerExplanation: '도로, 플랜트, 주택, 항만 같은 인프라는 전쟁 이후 복구 과정에서 다시 발주될 수 있는 영역입니다. 다만 기대가 실제 발주와 수주, 매출과 이익으로 이어지는지는 별도로 확인해야 합니다.',
    watchMetrics: [
      { label: '재건 발주', note: '종전 기대가 실제 인프라 발주로 이어지는지 봅니다.' },
      { label: '수주', note: '현대건설이 실제 수주를 따내는지 확인합니다.' },
      { label: '매출과 이익', note: '수주가 매출과 이익으로 연결되는지 봅니다.' },
      { label: '테마 과열', note: '단기 기대와 실제 수주 사이의 간격을 확인합니다.' },
    ],
    goodSignals: [
      '재건 관련 실제 발주 확인',
      '현대건설의 해외 수주 공시 또는 계약 확인',
      '수주가 매출과 이익으로 연결',
    ],
    cautionSignals: [
      '종전 기대가 실제 발주로 이어지지 않음',
      '수주 경쟁 심화 또는 마진 부담',
      '단기 테마 과열 이후 변동성 확대',
    ],
    sourceLinks: [
      {
        label: '연합뉴스 재건주 급등 보도',
        url: 'https://www.yna.co.kr/view/AKR20260612043100008',
        note: '미국·이란 종전 기대와 현대건설을 포함한 재건 관련주 움직임은 보도 기준으로 확인합니다.',
      },
      {
        label: '현대건설 회사 소개',
        url: 'https://www.hdec.kr/en/main.aspx',
        note: '해외 인프라와 건설 사업 회사 맥락을 확인하는 보조 원문입니다.',
      },
    ],
    publishedAt: '2026-06-12',
    status: 'archived',
  },
  {
    id: 'pick-draftkings-sports-prediction-platform',
    pickId: 'pick-draftkings-sports-prediction-platform',
    title: 'DraftKings는 스포츠 관심을 어떻게 돈이 도는 플랫폼으로 바꿀까?',
    companyName: 'DraftKings',
    ticker: 'DKNG',
    market: 'US',
    movementDirection: 'up',
    movementLabel: '예측 플랫폼 성장',
    reasonSummary: 'DraftKings는 스포츠 베팅 앱을 넘어 이용자의 예측 수요를 거래와 재방문으로 바꾸는 플랫폼으로 주목받았습니다.',
    beginnerSummary: '경기 결과를 맞히고 싶어 하는 관심을 베팅, 거래, 결제, 재방문으로 연결하는 구조를 봅니다.',
    sector: '스포츠 베팅 / 예측 플랫폼',
    flowLabel: '스포츠·예측 플랫폼',
    flowStage: '이용자 예측 수요 / 거래 플랫폼',
    valueChainPosition: 'leader',
    connectedLeaders: ['FanDuel', 'Kalshi', 'Polymarket'],
    relatedCompanies: ['FanDuel', 'Kalshi', 'Polymarket'],
    relatedTradeTags: ['스포츠 베팅', '예측시장', '플랫폼'],
    oneLineConclusion: 'DraftKings는 경기장 밖에서 스포츠 관심을 돈이 도는 플랫폼으로 바꾸는 회사입니다.',
    beginnerExplanation: '스포츠 경기가 열리면 이용자는 승패와 결과를 예측합니다. DraftKings는 이 예측 수요를 베팅, 거래, 결제, 재방문으로 연결하려는 플랫폼입니다. 규제와 주별 확장, 상품 확장 여부를 함께 봅니다.',
    watchMetrics: [
      { label: '이용자 증가', note: '예측 상품과 스포츠 베팅 이용자가 계속 늘어나는지 봅니다.' },
      { label: '마진 구조', note: '거래와 베팅이 실제로 남는 구조인지 확인합니다.' },
      { label: '신규 주 / 상품 확장', note: '규제와 상품 확장이 이어지는지 봅니다.' },
    ],
    goodSignals: [
      '예측 상품 이용량 증가',
      '스포츠 베팅과 예측 상품의 교차 사용 확대',
      '규제 명확성과 상품 확장',
    ],
    cautionSignals: [
      '예측시장 규제 불확실성',
      '이용자 증가 대비 낮은 수익성',
      '경쟁 플랫폼과 마케팅 비용 부담',
    ],
    sourceLinks: [
      {
        label: 'DraftKings SEC 8-K',
        url: 'https://www.sec.gov/Archives/edgar/data/1883685/000110465926071581/tm2617134d1_8k.htm',
        note: 'Predictions offering의 월간 증가율과 거래량은 회사 8-K 기준으로 확인합니다.',
      },
      {
        label: 'Barron’s DraftKings 예측시장 보도',
        url: 'https://www.barrons.com/articles/draftkings-stock-prediction-market-trading-volume-e9754687',
        note: '주가 반응과 예측시장 경쟁 구도는 보도 기준으로만 참고합니다.',
      },
    ],
    publishedAt: '2026-06-12',
    status: 'archived',
  },
  {
    id: 'pick-micron-ai-memory-hbm-demand',
    pickId: 'pick-micron-ai-memory-hbm-demand',
    companyId: 'ai-datacenter-micron',
    title: 'AI 서버가 늘면 왜 Micron도 같이 봐야 할까?',
    companyName: 'Micron',
    ticker: 'MU',
    market: 'US',
    movementDirection: 'up',
    movementLabel: 'AI 메모리 반등',
    reasonSummary: '반도체주 반등 속에서 AI 서버에 필요한 HBM, DRAM, NAND 같은 고성능 메모리 수요가 다시 주목받았습니다.',
    beginnerSummary: 'GPU가 AI의 계산을 맡는다면, Micron의 메모리는 그 계산에 필요한 데이터를 빠르게 저장하고 불러오는 공간입니다.',
    sector: 'AI 메모리 / HBM',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: 'HBM / DRAM 메모리',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'SK하이닉스', '삼성전자', 'TSMC'],
    relatedCompanies: ['NVIDIA', 'SK하이닉스', '삼성전자', 'TSMC'],
    relatedCompanyIds: ['us-semiconductors-nvidia', 'ai-datacenter-sk-hynix', 'ai-datacenter-samsung', 'ai-datacenter-tsmc'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'ai-datacenter-micron',
    relatedTradeTags: ['HBM', 'DRAM', 'AI 서버'],
    oneLineConclusion: '엔비디아가 AI의 두뇌라면 Micron은 그 두뇌가 기억하는 공간입니다.',
    beginnerExplanation: 'AI 서버가 늘어나면 GPU뿐 아니라 데이터를 빠르게 저장하고 불러올 고성능 메모리도 필요합니다. HBM, DRAM, NAND 가격과 출하량이 실제 매출과 현금흐름으로 이어지는지 확인합니다.',
    watchMetrics: [
      { label: 'HBM 매출', note: 'AI 서버용 고성능 메모리 매출이 실제로 커지는지 봅니다.' },
      { label: 'DRAM / NAND 가격', note: '메모리 가격 회복이 실적에 반영되는지 확인합니다.' },
      { label: '실적 재평가 여부', note: '단순 섹터 반등인지 실적 전망 변화인지 봅니다.' },
    ],
    goodSignals: [
      'HBM과 데이터센터 메모리 수요 확대',
      'DRAM·NAND 가격 회복',
      '매출 증가와 현금흐름 개선',
    ],
    cautionSignals: [
      '메모리 가격 사이클 둔화',
      'HBM 공급 경쟁 심화',
      '섹터 반등이 실적 확인 없이 앞서감',
    ],
    sourceLinks: [
      {
        label: 'Micron FY26 2Q 실적 발표',
        url: 'https://investors.micron.com/news-releases/news-release-details/micron-technology-inc-reports-results-second-quarter-fiscal-2026',
        note: 'AI 시대 메모리 수요, 매출, 현금흐름 설명은 회사 발표 기준으로 확인합니다.',
      },
      {
        label: 'MarketWatch 메모리주 반등 보도',
        url: 'https://www.marketwatch.com/story/microns-stock-bounces-back-in-a-big-way-the-memory-trade-is-alive-and-well-3466929f',
        note: '메모리 업종 반등과 HBM/DRAM 수요 해석은 보도 기준으로 참고합니다.',
      },
    ],
    publishedAt: '2026-06-12',
    status: 'archived',
  },
  {
    id: 'pick-dell-ai-server-earnings-check',
    pickId: 'pick-dell-ai-server-earnings-check',
    companyId: 'ai-datacenter-dell',
    title: 'Dell은 왜 또 급등했을까?',
    companyName: 'Dell Technologies',
    ticker: 'DELL',
    market: 'US',
    movementDirection: 'up',
    movementLabel: '실적 / 급등',
    reasonSummary: '지난번엔 기대감, 이번엔 숫자 확인. AI 서버 기대감이 주문·매출·가이던스 숫자로 확인됐습니다.',
    beginnerSummary: 'AI 뉴스는 먼저 기대감을 만들고, 이후 주문·매출·가이던스가 그 기대를 확인하는지 봅니다.',
    sector: 'AI 서버',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: 'AI 서버 / 데이터센터 인프라',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'Super Micro', 'Vertiv'],
    relatedCompanies: ['NVIDIA', 'Super Micro', 'Vertiv'],
    relatedCompanyIds: ['us-semiconductors-nvidia', 'ai-datacenter-supermicro', 'ai-datacenter-vertiv'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'ai-datacenter-dell',
    relatedTradeTags: ['AI 서버', '실적', 'SEC'],
    oneLineConclusion: 'AI 뉴스는 기대감을 만들고, 주문·매출·가이던스가 주가를 검증합니다.',
    beginnerExplanation: 'Dell은 AI 서버와 인프라를 기업에 공급하는 단계에 있습니다. 이번 후속편에서는 AI 서버 수요가 실제 주문, 매출, 다음 전망으로 이어지는지를 확인합니다.',
    watchMetrics: [
      { label: '매출', note: 'AI 서버 수요가 전체 판매 흐름에 반영되는지 봅니다.' },
      { label: 'AI 서버 주문 / 백로그', note: '들어온 주문이 쌓이고, 이후 매출로 이어지는지 확인합니다.' },
      { label: '가이던스', note: '회사가 다음 기간 수요를 어떻게 설명하는지 봅니다. 자동 API 숫자와 섞지 않습니다.' },
    ],
    goodSignals: [
      'AI 서버 마진이 남는지',
      '백로그가 매출로 이어지는지',
      '다음 가이던스가 더 올라가는지',
    ],
    cautionSignals: [
      '서버 매출은 늘지만 이익률이 낮아짐',
      '백로그가 실제 매출로 늦게 전환됨',
      '가이던스가 기대보다 보수적으로 바뀜',
    ],
    sourceLinks: [
      {
        label: 'Dell 실적 발표 원문 확인',
        note: '주문, 백로그, 가이던스 수치는 회사 발표 원문에서 별도로 확인합니다.',
      },
    ],
    publishedAt: '2026-05-30',
    status: 'published',
  },
  {
    id: 'pick-snowflake-ai-data-platform',
    pickId: 'pick-snowflake-ai-data-platform',
    title: 'Snowflake는 왜 폭등했을까?',
    companyName: 'Snowflake',
    ticker: 'SNOW',
    market: 'US',
    movementDirection: 'up',
    movementLabel: '실적 / 급등',
    reasonSummary: 'AI 기능이 기업 데이터 정리와 실제 사용량 증가로 이어지는지 보려는 기대가 커졌습니다.',
    beginnerSummary: 'AI는 반도체만 필요한 게 아니라 데이터를 정리하고 연결하는 플랫폼도 필요합니다.',
    sector: 'AI 데이터 플랫폼',
    flowId: 'us-ai-cloud-datacenter',
    flowLabel: 'AI 데이터 플랫폼',
    flowStage: '데이터 플랫폼 / 클라우드',
    valueChainPosition: 'supplier',
    connectedLeaders: ['Amazon / AWS', 'Microsoft', 'Datadog'],
    relatedCompanies: ['Amazon / AWS', 'Microsoft', 'Datadog', 'MongoDB'],
    relatedCompanyIds: ['ai-datacenter-amazon', 'ai-datacenter-microsoft'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedTradeTags: ['AI 데이터 플랫폼', '클라우드', 'AI 워크로드'],
    oneLineConclusion: 'AI 데이터 뉴스는 기대감을 만들고, 사용량과 마진이 주가를 검증합니다.',
    beginnerExplanation: 'Snowflake는 기업 데이터가 AI에 쓰일 수 있도록 모으고 정리하는 쪽에 있습니다. AI 기능이 실제 사용량 증가와 대기업 고객 지출로 이어지는지 확인합니다.',
    watchMetrics: [
      { label: '매출', note: '데이터 플랫폼 사용이 실제 판매 증가로 이어지는지 봅니다.' },
      { label: '제품 매출 가이던스', note: '회사가 다음 수요를 어떻게 설명하는지 보는 참고 포인트입니다. 자동 API와 연결하지 않습니다.' },
      { label: '대형 고객 / 사용량', note: 'AI 기능이 실제 사용량과 큰 고객 지출로 이어지는지 확인합니다.' },
    ],
    goodSignals: [
      'AI 기능이 실제 사용량 증가로 이어지는지',
      '대기업 고객 지출이 유지되는지',
      '클라우드 비용보다 수익성이 좋아지는지',
    ],
    cautionSignals: [
      'AI 기대가 실제 사용량으로 늦게 이어짐',
      '대형 고객 지출 둔화',
      '클라우드 비용 부담으로 수익성 개선이 늦어짐',
    ],
    sourceLinks: [
      {
        label: 'Snowflake 공식 데이터 연결 필요',
        note: '매출, 제품 매출 가이던스, 대형 고객·사용량은 다음 단계에서 공식 자료 기준으로 연결합니다.',
      },
    ],
    publishedAt: '2026-05-30',
    status: 'published',
  },
  {
    id: 'pick-dell-ai-server-demand',
    pickId: 'pick-dell-ai-server-demand',
    companyId: 'ai-datacenter-dell',
    title: 'Dell AI 서버 수요 해부',
    companyName: 'Dell Technologies',
    ticker: 'DELL',
    market: 'US',
    movementDirection: 'up',
    movementLabel: 'AI 서버 수요 기대',
    reasonSummary: 'Dell 주가는 AI 서버 수요 기대감으로 움직였습니다. 시장은 서버 주문과 매출, 마진이 같이 확인되는지 보고 있습니다.',
    beginnerSummary: 'Dell은 AI 칩을 직접 설계하는 회사는 아니지만, AI 서버를 구축하는 과정에서 수요가 연결되는 인프라 기업입니다.',
    sector: 'AI 서버·데이터센터 인프라',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: 'AI 서버 / 데이터센터 인프라',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'Super Micro', 'Vertiv'],
    relatedCompanies: ['NVIDIA', 'Super Micro', 'Vertiv'],
    relatedCompanyIds: ['us-semiconductors-nvidia', 'ai-datacenter-supermicro', 'ai-datacenter-vertiv'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'ai-datacenter-dell',
    relatedTradeTags: ['AI 서버', '데이터센터', 'SEC'],
    oneLineConclusion: 'AI 서버 수요가 Dell의 매출과 수주잔고로 이어지는지가 핵심입니다.',
    beginnerExplanation: 'Dell은 AI 칩을 직접 설계하는 회사는 아니지만, NVIDIA GPU 같은 고성능 부품을 서버 형태로 고객에게 공급하는 쪽에 가깝습니다. 클라우드, 기업, 데이터센터 고객의 AI 인프라 투자가 실제 매출과 현금흐름으로 이어지는지 확인해야 합니다.',
    watchMetrics: [
      { label: '서버/인프라 매출', note: 'AI 서버 수요가 실제 매출로 이어지는지 확인합니다.' },
      { label: '영업이익 또는 영업이익률', note: '서버를 많이 팔아도 이익이 남는지 봅니다.' },
      { label: '영업현금흐름 또는 FCF', note: '수주와 매출이 실제 현금흐름으로 이어지는지 확인합니다.' },
    ],
    goodSignals: [
      'AI 서버 주문과 수주잔고 증가',
      '서버 매출 증가가 실제 실적으로 연결',
      '영업이익률 또는 현금흐름 유지',
      '데이터센터 고객 수요 지속',
    ],
    cautionSignals: [
      'AI 서버 매출은 늘지만 마진이 낮아짐',
      'GPU·메모리 등 부품 원가 부담 증가',
      '수주잔고가 실제 매출로 전환되는 속도 둔화',
      '특정 대형 고객 의존도 확대',
    ],
    sourceLinks: [
      {
        label: 'Dell 공식 FY26 실적 발표',
        url: 'https://www.dell.com/en-us/dt/corporate/newsroom/announcements/detailpage.press-releases~usa~2026~2~dell-technologies-delivers-fourth-quarter-and-full-year-fiscal-2026-results.htm',
        note: 'AI 최적화 서버 주문, 매출, 수주잔고는 회사 발표 기준으로 확인합니다.',
      },
      {
        label: 'SEC 10-K 원문',
        url: 'https://www.sec.gov/Archives/edgar/data/1571996/000157199626000008/dell-20260130.htm',
        note: '재무제표와 MD&A는 SEC 원문 기준으로 확인합니다.',
      },
    ],
    publishedAt: '2026-05-25',
    status: 'archived',
  },
  {
    id: 'pick-nvidia-ai-demand',
    pickId: 'pick-nvidia-ai-demand',
    companyId: 'us-semiconductors-nvidia',
    title: 'NVIDIA AI 서버 수요 해부',
    companyName: 'NVIDIA',
    ticker: 'NVDA',
    market: 'US',
    movementDirection: 'up',
    movementLabel: '실적 기대감',
    reasonSummary: 'AI 데이터센터 수요 기대가 다음 분기 실적 눈높이를 높였습니다.',
    beginnerSummary: 'AI 서버가 늘수록 GPU, 메모리, 장비 기업을 함께 봐야 합니다.',
    sector: 'AI 반도체',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: 'AI 칩 / GPU',
    valueChainPosition: 'leader',
    connectedLeaders: ['TSMC', 'SK하이닉스', 'ASML', 'AMD'],
    relatedCompanies: ['TSMC', 'SK하이닉스', 'ASML', 'AMD'],
    relatedCompanyIds: ['ai-datacenter-tsmc', 'ai-datacenter-sk-hynix', 'ai-datacenter-asml', 'ai-datacenter-amd', 'ai-datacenter-vertiv'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'us-semiconductors-nvidia',
    relatedTradeTags: ['13F', 'AI 데이터센터', 'GPU'],
    oneLineConclusion: 'NVIDIA는 AI 서버 수요의 중심에 있는 AI 칩 기업으로, GPU와 CUDA 생태계가 핵심 경쟁력입니다.',
    beginnerExplanation: 'AI 서버 투자가 늘면 NVIDIA의 GPU 수요가 커질 수 있습니다. GPU 수요가 커지면 HBM, 파운드리, 서버, 전력·냉각 기업도 함께 관심을 받을 수 있습니다.',
    watchMetrics: [
      { label: '데이터센터 매출 성장률', note: 'AI 서버 수요가 실제 매출로 이어지는지 봅니다.' },
      { label: '영업이익률', note: '고성능 칩 경쟁력이 이익으로 남는지 확인합니다.' },
      { label: '잉여현금흐름 / R&D 투자', note: '생태계와 기술 우위를 유지할 현금과 투자를 같이 봅니다.' },
    ],
    goodSignals: ['데이터센터 매출 성장 지속', '높은 영업이익률 유지', '현금흐름과 생태계 투자 확대'],
    cautionSignals: ['고객 투자 둔화', 'ASIC·AMD와 경쟁 심화', '규제나 제품 전환에 따른 재고 부담'],
    sourceLinks: [{ label: 'SEC 원문 보고서', url: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm', note: '실적과 MD&A는 원문 기준으로 확인합니다.' }],
    publishedAt: '2026-05-17',
    status: 'published',
  },
  {
    id: 'pick-samsung-hbm-foundry',
    pickId: 'pick-samsung-hbm-foundry',
    companyId: 'ai-datacenter-samsung',
    title: '삼성전자 HBM·파운드리 흐름 해부',
    companyName: '삼성전자',
    ticker: '005930.KS',
    market: 'KR',
    movementDirection: 'up',
    movementLabel: 'HBM·파운드리 확인',
    reasonSummary: 'AI 반도체 수요가 메모리와 파운드리 경쟁력 확인으로 이어졌습니다.',
    beginnerSummary: '삼성전자는 메모리와 파운드리를 함께 봐야 하는 대표 한국 상장기업입니다.',
    sector: 'AI 반도체',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: 'HBM / 메모리 · 파운드리',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'SK하이닉스', 'TSMC', 'ASML'],
    relatedCompanies: ['SK하이닉스', '한미반도체', '원익IPS', '솔브레인'],
    relatedCompanyIds: ['us-semiconductors-nvidia', 'ai-datacenter-sk-hynix', 'ai-datacenter-tsmc', 'ai-datacenter-asml', 'ai-datacenter-hanmi'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'ai-datacenter-samsung',
    relatedTradeTags: ['HBM', '파운드리', 'DART'],
    oneLineConclusion: '삼성전자는 메모리와 파운드리를 모두 가진 반도체 기업으로, HBM 경쟁력과 업황 회복이 핵심 확인 포인트입니다.',
    beginnerExplanation: 'AI 서버 수요가 늘면 HBM 같은 고성능 메모리와 첨단 칩 생산 능력을 함께 확인해야 합니다. 직접 고객과 매출 비중은 공시와 IR에서 확인해야 합니다.',
    watchMetrics: [
      { label: '영업이익률', note: '메모리 업황 회복이 이익으로 이어지는지 봅니다.' },
      { label: '재고자산', note: '제품이 쌓이는지, 수요 회복과 맞는지 확인합니다.' },
      { label: '영업현금흐름', note: '장부상 이익이 실제 현금으로 들어오는지 봅니다.' },
    ],
    goodSignals: ['HBM 경쟁력 개선', '영업이익률 회복', '현금흐름 개선'],
    cautionSignals: ['재고 증가', '파운드리 투자 부담', '고객 인증 지연'],
    publishedAt: '2026-05-17',
    status: 'published',
  },
  {
    id: 'pick-hanmi-packaging-equipment',
    pickId: 'pick-hanmi-packaging-equipment',
    companyId: 'ai-datacenter-hanmi',
    title: '한미반도체 HBM 후공정 장비 해부',
    companyName: '한미반도체',
    ticker: '042700.KS',
    market: 'KR',
    movementDirection: 'up',
    movementLabel: '후공정 장비 기대',
    reasonSummary: 'HBM 후공정 투자 기대가 장비 기업 관심으로 이어졌습니다.',
    beginnerSummary: '장비주는 수주가 매출로 잡히는 시점과 재고 변화를 같이 봐야 합니다.',
    sector: '반도체 장비',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: '장비 / 소재 / 후공정',
    valueChainPosition: 'equipment',
    connectedLeaders: ['삼성전자', 'SK하이닉스', 'NVIDIA', 'TSMC'],
    relatedCompanies: ['삼성전자', 'SK하이닉스', '원익IPS', '주성엔지니어링'],
    relatedCompanyIds: ['ai-datacenter-sk-hynix', 'ai-datacenter-samsung', 'us-semiconductors-nvidia', 'ai-datacenter-asml', 'ai-datacenter-wonikips'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'ai-datacenter-hanmi',
    relatedTradeTags: ['DART', 'HBM', '후공정'],
    oneLineConclusion: '한미반도체는 HBM 후공정 장비 기대와 연결되는 한국 장비 기업입니다.',
    beginnerExplanation: 'HBM 생산이 늘면 후공정 장비 수요도 커질 수 있습니다. 다만 직접 고객별 매출 비중은 공시와 IR에서 확인해야 합니다.',
    watchMetrics: [
      { label: '수주 / 매출 성장률', note: '장비 주문이 실제 매출로 잡히는지 봅니다.' },
      { label: '영업이익률', note: '고부가 장비 경쟁력이 이익률로 남는지 확인합니다.' },
      { label: '영업현금흐름', note: '수주와 매출이 실제 현금 회수로 이어지는지 봅니다.' },
    ],
    goodSignals: ['수주잔고 증가', '고객 인증 확대', '설비투자가 매출로 전환'],
    cautionSignals: ['고객 투자 지연', '특정 고객 의존도 확대', '수주가 매출로 늦게 반영'],
    sourceLinks: [{ label: 'DART 원문 보고서', url: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001572', note: '분기보고서 원문 기준으로 확인합니다.' }],
    publishedAt: '2026-05-17',
    status: 'published',
  },
  {
    id: 'pick-sk-hynix-hbm',
    pickId: 'pick-sk-hynix-hbm',
    companyId: 'ai-datacenter-sk-hynix',
    title: 'SK하이닉스 HBM 수요 해부',
    companyName: 'SK하이닉스',
    ticker: '000660.KS',
    market: 'KR',
    movementDirection: 'up',
    movementLabel: 'AI 메모리 수요',
    reasonSummary: 'AI 서버용 메모리 수요 기대가 실적 전망에 반영됐습니다.',
    beginnerSummary: '메모리는 가격과 출하량이 같이 좋아지는지 확인해야 합니다.',
    sector: 'AI 메모리',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: 'HBM / 메모리',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'AMD', '삼성전자', 'TSMC'],
    relatedCompanies: ['한미반도체', '원익IPS', '솔브레인', '리노공업'],
    relatedCompanyIds: ['us-semiconductors-nvidia', 'ai-datacenter-hanmi', 'ai-datacenter-samsung', 'ai-datacenter-tsmc', 'ai-datacenter-micron'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedCompanyId: 'ai-datacenter-sk-hynix',
    relatedTradeTags: ['HBM', '기관 수급', 'DART'],
    oneLineConclusion: 'SK하이닉스는 AI 서버에 필요한 HBM 수요와 연결된 메모리 기업입니다.',
    beginnerExplanation: 'AI GPU가 더 많이 쓰이면 함께 붙는 고성능 메모리 수요도 커질 수 있습니다. 메모리는 업황 사이클이 커서 재고와 현금흐름을 같이 봐야 합니다.',
    watchMetrics: [
      { label: '영업이익률', note: '메모리 가격과 제품 믹스가 이익으로 남는지 봅니다.' },
      { label: '재고자산', note: '팔릴 제품이 쌓이는지, 수요 회복과 맞는지 확인합니다.' },
      { label: '영업현금흐름', note: '장부상 이익이 실제 현금으로 들어오는지 봅니다.' },
    ],
    goodSignals: ['HBM 수요와 고객 인증 확대', '영업이익률 유지', '재고 회전과 현금흐름 개선'],
    cautionSignals: ['재고 증가', '매출채권 회수 지연', '메모리 가격 둔화'],
    sourceLinks: [{ label: 'DART 원문 보고서', url: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002287', note: '분기보고서 원문 기준으로 확인합니다.' }],
    publishedAt: '2026-05-17',
    status: 'published',
  },
  {
    id: 'pick-ai-server-parts',
    pickId: 'pick-ai-server-parts',
    title: 'AI 서버 인프라 흐름 해부',
    companyName: 'AI 서버 부품업체',
    ticker: 'WATCH',
    market: 'US',
    movementDirection: 'up',
    movementLabel: '서버 투자 기대',
    reasonSummary: 'AI 서버 증설 기대가 전력, 냉각, 부품 기업 관심으로 번졌습니다.',
    beginnerSummary: '같은 밸류체인에서 함께 봐야 할 대표 기업을 먼저 확인합니다.',
    sector: 'AI 서버',
    flowId: 'us-semiconductors',
    flowLabel: 'AI 반도체 & 데이터센터',
    flowStage: '서버 / 네트워크 · 전력·냉각',
    valueChainPosition: 'supplier',
    connectedLeaders: ['NVIDIA', 'Dell', 'Super Micro', 'Vertiv'],
    relatedCompanies: ['Microsoft', 'Amazon', 'Alphabet', 'Eaton'],
    relatedCompanyIds: ['ai-datacenter-supermicro', 'ai-datacenter-dell', 'ai-datacenter-vertiv', 'ai-datacenter-eaton', 'ai-datacenter-microsoft'],
    relatedSupplyChainId: 'us-semiconductors',
    relatedTradeTags: ['AI 서버', '데이터센터', '전력·냉각'],
    oneLineConclusion: 'AI 서버 투자는 서버, 네트워크, 전력·냉각 기업까지 함께 확인해야 하는 흐름입니다.',
    beginnerExplanation: 'AI 서버가 늘면 GPU뿐 아니라 서버 조립, 네트워크, 전력 공급, 냉각 인프라 수요도 커질 수 있습니다. 직접 납품 관계는 기업별 공시와 계약 자료로 확인해야 합니다.',
    watchMetrics: [
      { label: '데이터센터 수주 / 백로그', note: 'AI 인프라 투자가 실제 주문으로 이어지는지 봅니다.' },
      { label: '매출 성장률', note: '관심이 실제 판매 증가로 이어지는지 확인합니다.' },
      { label: '잉여현금흐름', note: '프로젝트 매출이 현금으로 남는지 봅니다.' },
    ],
    goodSignals: ['데이터센터 수주 증가', '마진 유지', '현금흐름 개선'],
    cautionSignals: ['고객 투자 지연', '재고 증가', '매출 증가 대비 낮은 현금흐름'],
    publishedAt: '2026-05-17',
    status: 'published',
  },
  {
    id: 'pick-battery-materials-watch',
    pickId: 'pick-battery-materials-watch',
    title: '배터리 소재 수요 부담 해부',
    companyName: '배터리 소재업체',
    ticker: 'WATCH',
    market: 'KR',
    movementDirection: 'down',
    movementLabel: '전기차 수요 부담',
    reasonSummary: '전기차 수요 둔화와 소재 가격 변동이 투자심리에 부담으로 작용했습니다.',
    beginnerSummary: '소재 기업은 판매량뿐 아니라 원재료 가격과 고객사 투자 계획도 함께 봅니다.',
    sector: '2차전지 소재',
    flowId: 'kr-battery-materials',
    flowLabel: '2차전지 / 전기차',
    flowStage: '소재',
    valueChainPosition: 'materials',
    connectedLeaders: ['Tesla', 'BYD', 'CATL', 'LG에너지솔루션'],
    relatedCompanies: ['포스코퓨처엠', '삼성SDI', 'GM', 'Rivian'],
    relatedCompanyIds: ['kr-battery-materials-posco-futurem'],
    relatedSupplyChainId: 'kr-battery-materials',
    relatedCompanyId: 'kr-battery-materials-posco-futurem',
    relatedTradeTags: ['배터리', '소재 가격', '전기차'],
    oneLineConclusion: '배터리 소재 기업은 전기차 수요와 원재료 가격 변화가 실적 기대에 함께 영향을 줍니다.',
    beginnerExplanation: '전기차 판매가 둔화되면 소재 주문과 가격 기대가 낮아질 수 있습니다. 많이 파는지뿐 아니라 원가와 고객사 투자 계획을 함께 확인해야 합니다.',
    watchMetrics: [
      { label: '매출 성장률', note: '전기차 수요가 실제 판매 증가로 이어졌는지 봅니다.' },
      { label: '영업이익률', note: '원재료 가격 변화가 이익률을 누르는지 확인합니다.' },
      { label: '재고 / 현금흐름', note: '재고 부담과 실제 현금 회수를 함께 봅니다.' },
    ],
    goodSignals: ['고객사 투자 재개', '원재료 가격 안정', '영업현금흐름 개선'],
    cautionSignals: ['전기차 수요 둔화', '소재 가격 하락', '재고 부담 증가'],
    publishedAt: '2026-05-17',
    status: 'published',
  },
];

export const currentWeeklyDigest: WeeklyDigest = {
  weekLabel: '2026년 6월 둘째 주',
  kicker: '2026년 6월 둘째 주 해부',
  headline: '이번 주 시장은 AI 연결 반도체, 데이터센터 냉각, 인수 프리미엄으로 갈렸습니다.',
  subheadline: 'Marvell은 인터커넥트, LG전자는 냉각/HVAC, Taylor Morrison은 Berkshire 인수 발표로 봅니다.',
  sourceNote: '정적 콘텐츠에는 가격·재무 숫자를 만들지 않고, 기준일은 가격 배지와 원문 링크로 확인합니다.',
  featuredPickId: 'pick-marvell-nvlink-fusion-ai-interconnect',
  featured: {
    marketLabel: '미국',
    theme: 'AI 연결 반도체',
    question: 'Marvell도 AI 인프라 수혜주로 봐야 할까?',
    meta: 'MRVL · AI 연결 반도체 기대 · NVLink Fusion',
    headline: 'AI 서버가 늘수록 GPU뿐 아니라 서버끼리 말하게 해주는 연결 반도체도 중요해집니다.',
    summary: 'NVIDIA 생태계 기대가 Marvell의 맞춤형 반도체와 인터커넥트 수요로 이어지는지 봅니다.',
    metricLabels: ['AI 커스텀 반도체 매출', '광통신 / 인터커넥트 수요', '실적 연결 여부'],
    primaryCtaLabel: 'Marvell 해부 보기',
    secondaryCtaLabel: '이번 주 Pick 전체 보기',
  },
  recentItems: [
    {
      id: 'weekly-marvell-nvlink-fusion-ai-interconnect',
      pickId: 'pick-marvell-nvlink-fusion-ai-interconnect',
      market: 'US',
      theme: 'AI 연결 반도체',
      movementLabel: 'AI 연결 반도체 기대',
      question: 'Marvell도 AI 인프라 수혜주로 봐야 할까?',
      summary: 'NVLink Fusion 기대가 맞춤형 반도체와 인터커넥트 수요로 이어지는지 봅니다.',
      relatedCompanies: ['NVIDIA', 'Broadcom', 'Arista'],
    },
    {
      id: 'weekly-lg-electronics-ai-datacenter-cooling',
      pickId: 'pick-lg-electronics-ai-datacenter-cooling',
      market: 'KR',
      theme: '데이터센터 냉각/HVAC',
      movementLabel: 'AI 냉각 기대 / 변동성',
      question: 'LG전자는 왜 AI 냉각 흐름에 묶였을까?',
      summary: 'AI 서버가 늘 때 전력·냉각·공조 인프라가 함께 중요해지는지 봅니다.',
      relatedCompanies: ['Vertiv', 'Schneider Electric', 'Eaton'],
    },
    {
      id: 'weekly-taylor-morrison-berkshire-acquisition',
      pickId: 'pick-taylor-morrison-berkshire-acquisition',
      market: 'US',
      theme: 'Berkshire 인수 프리미엄',
      movementLabel: '현금 인수 발표',
      question: 'Taylor Morrison은 왜 인수 프리미엄이 붙었을까?',
      summary: 'AI 테마와 별개로 현금 인수 발표가 주택건설사 가격에 반영된 사례입니다.',
      relatedCompanies: ['Berkshire Hathaway', 'Clayton Homes', '미국 주택경기'],
    },
  ],
  marketTabs: [
    { id: 'ALL', label: '전체' },
    { id: 'US', label: '미국' },
    { id: 'KR', label: '한국' },
  ],
  marketMapItems: [
    {
      title: 'AI 반도체 / 데이터센터',
      status: 'active',
      href: '/ko/category/us-semiconductors',
      sectorId: 'us-semiconductors',
      note: 'GPU, 메모리, 파운드리, 전력·냉각으로 이어지는 흐름',
    },
    {
      title: '데이터센터 냉각 / 전력 인프라',
      status: 'coming-soon',
      note: 'AI 서버가 늘 때 냉각, 공조, 전력 장비가 함께 움직이는 흐름',
    },
    {
      title: 'M&A / 인수 프리미엄',
      status: 'coming-soon',
      note: 'Taylor Morrison처럼 인수 가격과 승인 절차를 따로 보는 흐름',
    },
    {
      title: '클라우드 / 데이터 플랫폼',
      status: 'coming-soon',
      note: 'AI 워크로드가 클라우드와 데이터 플랫폼 수요로 번지는 흐름',
    },
  ],
};

export const weeklyDigest = currentWeeklyDigest;

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
