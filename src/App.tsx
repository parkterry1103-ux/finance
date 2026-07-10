import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  ReactFlowInstance,
} from '@xyflow/react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  CircleDollarSign,
  Cloud,
  Cpu,
  Database,
  ExternalLink,
  Factory,
  FileSearch,
  Filter,
  Globe2,
  LineChart,
  Lock,
  Network,
  Newspaper,
  PanelRightOpen,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  Target,
  Unlock,
  Zap,
  CheckCircle,
} from 'lucide-react';
import {
  analystOpinions,
  AnchorCompany,
  anchors,
  archivedStockAutopsyPickGroups as contentArchivedStockAutopsyPickGroups,
  archivedStockAutopsyPicks as contentArchivedStockAutopsyPicks,
  companies,
  Company,
  CompanyTier,
  countries,
  CountryId,
  currentWeeklyDigest,
  currentWeeklyPickIds as contentCurrentWeeklyPickIds,
  currentWeeklyPicks as contentCurrentWeeklyPicks,
  EvidenceGroup,
  EvidenceSource,
  EvidenceSourceType,
  FilingSourceStatus,
  FinancialMetric,
  FinancialStatementSummary,
  IndustryReport,
  industryReports,
  links,
  marketMapEvidencePickIds,
  marketMovers,
  MarketPrice,
  reconstructionInfrastructureMap,
  RiskLevel,
  semiconductorClusterInfrastructureMap,
  sectors,
  SmartMoneyMove,
  smartMoneyMoves,
  sourcePolicies,
  StockAutopsyPick,
  stockAutopsyPicks,
} from './data';
import {
  currentPickDisclosureTickers,
  currentPickSecTickers,
  disclosureCategoryLabels,
  disclosureCategoryOrder,
  disclosureCheckpoints,
  enabledDartTrackedCompanies,
  enabledSecTrackedCompanies,
  findDartTrackedCompanyByTicker,
  findSecTrackedCompanyByTicker,
  marketMapDisclosureTickers,
  matchesSecFormPattern,
  secFilingCategoryLabels,
  secFilingCategoryOrder,
  secFilingCheckpoints,
  secSupportedFormPatterns,
  type DisclosureCategory,
  type MarketDisclosure,
  type MarketDisclosureApiResponse,
  type MarketSecFiling,
  type MarketSecFilingsApiResponse,
  type SecFilingCategory,
} from './content/disclosures';
import {
  eightKItemDefinitionByItem,
  secPrimaryTransactionCodes,
  secTransactionCodeDefinitionByCode,
  type SecDerivativeTransaction,
  type SecNonDerivativeTransaction,
  type SecReportingOwner,
} from './lib/sec';
import { fetchMarketDisclosures, fetchMarketSecFilings } from './services/disclosures';
import { buildFallbackFinancials, fetchFinancialsByCompany } from './services/financials';
import { resolveCompanyFilingLinks } from './services/filings';
import { fetchOwnershipTrades, fetchTradesByCompany } from './services/trades';
import { fetchMarketPrices, getPriceForCompany, getPriceForPick, getPriceForTicker, priceDirection, priceDisplay } from './services/prices';
import { inferCompanyListing, isPriceSyncTarget } from './services/listing';

type NodeData = {
  company: Company;
  isSelected: boolean;
  isDimmed: boolean;
  isExpanded: boolean;
  marketLabel: string;
  price?: MarketPrice | null;
  onSelect?: (companyId: string) => void;
  onToggleExpand?: (companyId: string) => void;
};

type NewsItem = {
  title: string;
  url: string;
  domain: string;
  source: string;
  seendate: string;
  language?: string;
};

type NewsState = {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  items: NewsItem[];
  updatedAt?: string;
  error?: string;
};

const initialDisclosureResponse: MarketDisclosureApiResponse = {
  ok: false,
  code: 'DISCLOSURES_LOADING',
  message: '공시 데이터를 불러오는 중입니다.',
  items: [],
  meta: {
    count: 0,
    lastSyncedAt: null,
    source: 'opendart',
    stale: true,
    trackedCompanyCount: enabledDartTrackedCompanies.length,
  },
};

const initialSecFilingsResponse: MarketSecFilingsApiResponse = {
  ok: false,
  code: 'SEC_FILINGS_LOADING',
  message: '미국 공시 데이터를 불러오는 중입니다.',
  items: [],
  meta: {
    count: 0,
    lastSyncedAt: null,
    source: 'sec-edgar',
    stale: true,
    trackedCompanyCount: enabledSecTrackedCompanies.length,
  },
};

const tierLabels: Record<CompanyTier, string> = {
  anchor: '중심 상장기업',
  tier1: '1차 관계 기업',
  tier2: '보조 관계 기업',
};

const riskLabels: Record<RiskLevel, string> = {
  low: '낮음',
  medium: '중간',
  high: '높음',
};

const riskClass: Record<RiskLevel, string> = {
  low: 'risk-low',
  medium: 'risk-medium',
  high: 'risk-high',
};

const aiRelationshipSectorId = 'us-semiconductors';
const aiRelationshipAnchorId = 'us-semiconductors-nvidia';
const datacenterPowerCoolingSectorId = 'datacenter-power-cooling';
const datacenterPowerCoolingAnchorId = 'datacenter-power-vertiv';

const aiCoreCompanyIds = new Set([
  'ai-datacenter-google',
  'ai-datacenter-microsoft',
  'us-semiconductors-nvidia',
  'ai-datacenter-broadcom',
  'ai-datacenter-sk-hynix',
  'ai-datacenter-samsung',
  'ai-datacenter-tsmc',
  'ai-datacenter-asml',
  'ai-datacenter-vertiv',
]);

type MarketMapConnectionLevel = 'complete' | 'partial' | 'reference' | 'planned';

const aiCompleteConnectionIds = new Set([
  'ai-datacenter-dell',
  'us-semiconductors-nvidia',
  'ai-datacenter-sk-hynix',
  'ai-datacenter-amd',
  'ai-datacenter-tsmc',
  'ai-datacenter-asml',
  'ai-datacenter-micron',
  'ai-datacenter-broadcom',
  'ai-datacenter-microsoft',
  'ai-datacenter-google',
  'ai-datacenter-supermicro',
  'ai-datacenter-vertiv',
  'ai-datacenter-samsung',
]);

const aiReferenceOnlyIds = new Set([
  'ai-datacenter-amazon',
  'ai-datacenter-intel',
  'ai-datacenter-marvell',
  'ai-datacenter-arista',
  'ai-datacenter-eaton',
  'ai-datacenter-schneider',
]);

const aiPlannedConnectionIds = new Set([
  'ai-datacenter-hanmi',
  'ai-datacenter-leeno',
  'ai-datacenter-isc',
  'ai-datacenter-wonikips',
  'ai-datacenter-soulbrain',
]);

const aiAuditedMarketMapIds = new Set([
  ...aiCompleteConnectionIds,
  ...aiReferenceOnlyIds,
  ...aiPlannedConnectionIds,
]);

const datacenterPowerCoolingCompleteIds = new Set(['datacenter-power-vertiv']);

const datacenterPowerCoolingPickOnlyIds = new Set(['datacenter-power-lg-electronics']);

const datacenterPowerCoolingReferenceIds = new Set([
  'datacenter-power-eaton',
  'datacenter-power-schneider',
  'datacenter-power-ai-server-growth',
  'datacenter-power-power-use-growth',
  'datacenter-power-power-management',
  'datacenter-power-cooling-hvac',
  'datacenter-power-operational-stability',
  'datacenter-power-investment-validation',
]);

const datacenterPowerCoolingAuditedIds = new Set([
  ...datacenterPowerCoolingCompleteIds,
  ...datacenterPowerCoolingPickOnlyIds,
  ...datacenterPowerCoolingReferenceIds,
]);

const datacenterPowerCoolingFlowSteps = [
  {
    label: 'AI 서버 증가',
    detail: 'AI 서비스를 처리할 서버가 더 많이 필요해집니다.',
    companyId: 'datacenter-power-ai-server-growth',
    representativeCompanies: ['Super Micro Computer', 'Dell Technologies'],
  },
  {
    label: '전력 사용 증가',
    detail: '서버가 늘면 전기를 더 많이 쓰고 전력 안정성이 중요해집니다.',
    companyId: 'datacenter-power-power-use-growth',
    representativeCompanies: ['Eaton', 'Schneider Electric'],
  },
  {
    label: 'UPS / 전력 관리',
    detail: '정전이나 전압 불안정에도 데이터센터가 멈추지 않게 관리합니다.',
    companyId: 'datacenter-power-power-management',
    representativeCompanies: ['Vertiv', 'Eaton'],
  },
  {
    label: '냉각 / HVAC',
    detail: '서버에서 나는 열을 식혀 장비가 안정적으로 돌아가게 합니다.',
    companyId: 'datacenter-power-cooling-hvac',
    representativeCompanies: ['Vertiv', 'LG전자'],
  },
  {
    label: '운영 안정성',
    detail: '전력과 냉각이 안정적이어야 실제 데이터센터 투자가 숫자로 확인됩니다.',
    companyId: 'datacenter-power-operational-stability',
    representativeCompanies: ['Vertiv', 'Schneider Electric'],
  },
];

const datacenterPowerCoolingEasyCopy: Record<string, { product: string; demand: string }> = {
  'datacenter-power-vertiv': {
    product: '데이터센터가 멈추지 않도록 전력 안정화와 냉각 장비를 제공하는 회사입니다.',
    demand: 'AI 서버가 늘수록 전력 사용량과 발열이 커지기 때문에 전력·냉각 인프라 수요와 함께 봅니다.',
  },
  'datacenter-power-eaton': {
    product: '전기를 안전하게 나누고 관리하는 전력 장비 회사입니다.',
    demand: '데이터센터는 대규모 전력을 안정적으로 받아야 하므로 전력 관리 장비가 중요해집니다.',
  },
  'datacenter-power-schneider': {
    product: '에너지 관리와 자동화 솔루션으로 데이터센터 전력 효율을 돕는 회사입니다.',
    demand: '전력 사용량이 늘수록 에너지 관리와 운영 효율이 중요한 체크포인트가 됩니다.',
  },
  'datacenter-power-lg-electronics': {
    product: 'HVAC와 냉각 기술로 데이터센터 열 관리 흐름에 연결되는 회사입니다.',
    demand: 'AI 서버는 열을 많이 내기 때문에 냉각 설비와 칠러 같은 장비가 함께 주목받을 수 있습니다.',
  },
};

const datacenterPowerCoolingCompanionCompanies: Record<string, Array<{ companyId: string; role: string }>> = {
  'datacenter-power-vertiv': [
    { companyId: 'datacenter-power-eaton', role: '전력 관리 장비' },
    { companyId: 'datacenter-power-schneider', role: '에너지 관리 / 자동화' },
    { companyId: 'datacenter-power-lg-electronics', role: '냉각 / HVAC' },
  ],
  'datacenter-power-eaton': [
    { companyId: 'datacenter-power-vertiv', role: '데이터센터 전력·냉각 인프라' },
    { companyId: 'datacenter-power-schneider', role: '전력 효율 / 자동화' },
    { companyId: 'datacenter-power-lg-electronics', role: '냉각 인프라' },
  ],
  'datacenter-power-schneider': [
    { companyId: 'datacenter-power-eaton', role: '전력 장비' },
    { companyId: 'datacenter-power-vertiv', role: '데이터센터 인프라 장비' },
    { companyId: 'datacenter-power-lg-electronics', role: '냉각 / HVAC' },
  ],
  'datacenter-power-lg-electronics': [
    { companyId: 'datacenter-power-vertiv', role: '냉각과 전력 인프라' },
    { companyId: 'datacenter-power-eaton', role: '전력 관리' },
    { companyId: 'datacenter-power-schneider', role: '에너지 관리' },
  ],
};

const aiFirstLookIds = [
  'us-semiconductors-nvidia',
  'ai-datacenter-tsmc',
  'ai-datacenter-sk-hynix',
  'ai-datacenter-asml',
  'ai-datacenter-vertiv',
];

const aiCoreLinkIds = new Set([
  'ai-v01-ai-datacenter-google-ai-datacenter-broadcom',
  'ai-v01-ai-datacenter-broadcom-ai-datacenter-tsmc',
  'ai-v01-ai-datacenter-microsoft-us-semiconductors-nvidia',
  'ai-v01-ai-datacenter-amazon-us-semiconductors-nvidia',
  'ai-v01-us-semiconductors-nvidia-ai-datacenter-tsmc',
  'ai-v01-us-semiconductors-nvidia-ai-datacenter-sk-hynix',
  'ai-v01-us-semiconductors-nvidia-ai-datacenter-vertiv',
  'ai-v01-us-semiconductors-nvidia-ai-datacenter-marvell',
  'ai-v01-ai-datacenter-asml-ai-datacenter-tsmc',
  'ai-v01-ai-datacenter-asml-ai-datacenter-samsung',
]);

const aiStageColumns = [
  'AI 수요',
  'AI 칩',
  'HBM',
  '파운드리',
  '장비/전력',
];

const aiFlowStages = [
  {
    stage: 'AI 수요',
    symbol: '01',
    easyTitle: 'AI를 많이 써요',
    term: 'AI 수요',
    summary: 'AI 서비스를 쓰면 계산할 서버가 더 필요해집니다.',
    companyIds: ['ai-datacenter-microsoft', 'ai-datacenter-google'],
  },
  {
    stage: 'AI 칩',
    symbol: '02',
    easyTitle: '계산 칩이 필요해요',
    term: 'GPU / AI 칩',
    summary: '서버 안에는 AI 계산용 칩이 들어갑니다.',
    companyIds: ['us-semiconductors-nvidia', 'ai-datacenter-broadcom'],
  },
  {
    stage: 'HBM',
    symbol: '03',
    easyTitle: '빠른 메모리가 필요해요',
    term: 'HBM',
    summary: '칩 옆에서 데이터를 빠르게 꺼내줘야 합니다.',
    companyIds: ['ai-datacenter-sk-hynix', 'ai-datacenter-samsung', 'ai-datacenter-micron'],
  },
  {
    stage: '파운드리',
    symbol: '04',
    easyTitle: '칩을 실제로 만들어요',
    term: '파운드리',
    summary: '설계된 칩을 공장에서 생산합니다.',
    companyIds: ['ai-datacenter-tsmc', 'ai-datacenter-asml'],
  },
  {
    stage: '장비/전력',
    symbol: '05',
    easyTitle: '전기·냉각이 필요해요',
    term: '전력 / 냉각',
    summary: '서버가 많아지면 전기와 열 관리가 중요해집니다.',
    companyIds: ['ai-datacenter-vertiv', 'ai-datacenter-dell'],
  },
];

const aiKoreaListedPriorityNames = [
  'SK하이닉스',
  '삼성전자',
  '한미반도체',
  '리노공업',
  'ISC',
  '원익IPS',
  '솔브레인',
  '주성엔지니어링',
  'DB하이텍',
  '하나마이크론',
];

const aiFinancialFocusCards = [
  {
    label: 'AI 칩 기업',
    metrics: ['데이터센터 매출 성장률', '영업이익률', '잉여현금흐름 / R&D 투자'],
    note: '성장률과 마진이 유지되는지, 기술 우위를 위한 투자가 이어지는지 봅니다.',
  },
  {
    label: '메모리 / HBM',
    metrics: ['영업이익률', '재고자산', '영업현금흐름'],
    note: '메모리는 사이클이 커서 이익률, 재고, 실제 현금 유입을 같이 봐야 합니다.',
  },
  {
    label: '파운드리',
    metrics: ['매출 성장률', '영업이익률', 'CAPEX / 가동률'],
    note: '큰 설비투자가 실제 수요로 채워지는지 확인하는 것이 중요합니다.',
  },
  {
    label: '장비·인프라',
    metrics: ['수주잔고 / 백로그', '매출 성장률', '잉여현금흐름'],
    note: '고객 투자 사이클이 수주와 현금흐름으로 이어지는지 봅니다.',
  },
];

const companyVisualSymbols: Record<string, { label: string; tone: string }> = {
  'us-semiconductors-nvidia': { label: 'NV', tone: 'nvidia' },
  'ai-datacenter-microsoft': { label: 'MS', tone: 'microsoft' },
  'ai-datacenter-google': { label: 'G', tone: 'google' },
  'ai-datacenter-amazon': { label: 'AWS', tone: 'amazon' },
  'ai-datacenter-broadcom': { label: 'AV', tone: 'broadcom' },
  'ai-datacenter-tsmc': { label: 'TSMC', tone: 'tsmc' },
  'ai-datacenter-sk-hynix': { label: 'SK', tone: 'hynix' },
  'ai-datacenter-samsung': { label: '삼성', tone: 'samsung' },
  'ai-datacenter-asml': { label: 'ASML', tone: 'asml' },
  'ai-datacenter-vertiv': { label: 'V', tone: 'vertiv' },
  'ai-datacenter-amd': { label: 'AMD', tone: 'amd' },
  'ai-datacenter-supermicro': { label: 'SMC', tone: 'supermicro' },
  'ai-datacenter-dell': { label: 'Dell', tone: 'dell' },
  'ai-datacenter-arista': { label: 'AR', tone: 'arista' },
  'ai-datacenter-hanmi': { label: '한미', tone: 'kr' },
  'ai-datacenter-leeno': { label: '리노', tone: 'kr' },
  'ai-datacenter-isc': { label: 'ISC', tone: 'kr' },
  'ai-datacenter-wonikips': { label: '원익', tone: 'kr' },
  'ai-datacenter-soulbrain': { label: '솔브', tone: 'kr' },
  'datacenter-power-vertiv': { label: 'V', tone: 'vertiv' },
  'datacenter-power-eaton': { label: 'E', tone: 'energy' },
  'datacenter-power-schneider': { label: 'SE', tone: 'energy' },
  'datacenter-power-lg-electronics': { label: 'LG', tone: 'kr' },
  'datacenter-power-ai-server-growth': { label: 'AI', tone: 'neutral' },
  'datacenter-power-power-use-growth': { label: 'KW', tone: 'energy' },
  'datacenter-power-power-management': { label: 'UPS', tone: 'energy' },
  'datacenter-power-cooling-hvac': { label: 'HVAC', tone: 'vertiv' },
  'datacenter-power-operational-stability': { label: 'OPS', tone: 'neutral' },
  'datacenter-power-investment-validation': { label: 'CHK', tone: 'neutral' },
};

function companyNameSymbolLabel(company: Company) {
  const source = company.name || company.legalName || company.ticker || '';
  const hangul = Array.from(source.match(/[가-힣]/g) ?? []).slice(0, 2).join('');
  if (hangul) return hangul;

  const words = source
    .replace(/[,()]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }

  return source.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || company.name.slice(0, 2);
}

function companySymbol(company: Company) {
  const mapped = companyVisualSymbols[company.id];
  if (mapped) return mapped;
  return {
    label: companyNameSymbolLabel(company),
    tone: isMainListedCompany(company) ? 'default' : 'reference',
  };
}

function flowRepresentativeCompanyName(company: Company) {
  if (company.id === 'ai-datacenter-google') return 'Google';
  return company.name;
}

const companyLogoSources: Array<{ match: string[]; url: string }> = [
  { match: ['nvidia', 'nvda'], url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg' },
  { match: ['microsoft', 'msft'], url: 'https://logo.clearbit.com/microsoft.com' },
  { match: ['google', 'alphabet', 'googl'], url: 'https://logo.clearbit.com/google.com' },
  { match: ['amazon', 'amzn', 'aws'], url: 'https://logo.clearbit.com/amazon.com' },
  { match: ['broadcom', 'avgo'], url: 'https://logo.clearbit.com/broadcom.com' },
  { match: ['sk하이닉스', 'sk hynix', '000660'], url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/SK_Hynix.svg' },
  { match: ['삼성전자', 'samsung', '005930'], url: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Samsung_logo.svg' },
  { match: ['tsmc', 'taiwan semiconductor', 'tsm'], url: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Tsmc-text.svg' },
  { match: ['asml'], url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/ASML_Logo.svg' },
  { match: ['vertiv', 'vrt'], url: 'https://logo.clearbit.com/vertiv.com' },
  { match: ['amd'], url: 'https://logo.clearbit.com/amd.com' },
  { match: ['micron', 'mu'], url: 'https://logo.clearbit.com/micron.com' },
  { match: ['dell'], url: 'https://logo.clearbit.com/dell.com' },
  { match: ['super micro', 'supermicro', 'smci'], url: 'https://logo.clearbit.com/supermicro.com' },
  { match: ['arista', 'anet'], url: 'https://logo.clearbit.com/arista.com' },
  { match: ['eaton'], url: 'https://logo.clearbit.com/eaton.com' },
  { match: ['schneider'], url: 'https://logo.clearbit.com/se.com' },
  { match: ['한미반도체', 'hanmi', '042700'], url: 'https://logo.clearbit.com/hanmisemi.com' },
  { match: ['리노공업', 'leeno', '058470'], url: 'https://logo.clearbit.com/leeno.com' },
  { match: ['isc', '095340'], url: 'https://logo.clearbit.com/isc21.kr' },
  { match: ['원익ips', 'wonik', '240810'], url: 'https://logo.clearbit.com/wonikips.co.kr' },
  { match: ['솔브레인', 'soulbrain', '357780'], url: 'https://logo.clearbit.com/soulbrain.co.kr' },
];

function getCompanyLogoUrl(company: Company) {
  const searchText = [
    company.id,
    company.name,
    company.legalName,
    company.ticker,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return companyLogoSources.find((source) => source.match.some((token) => searchText.includes(token.toLowerCase())))?.url;
}

function CompanyLogo({ company, size = 'medium', className = '' }: { company: Company; size?: 'small' | 'medium' | 'large' | 'hero'; className?: string }) {
  const [failed, setFailed] = useState(false);
  const symbol = companySymbol(company);
  const logoUrl = getCompanyLogoUrl(company);
  const classes = `company-logo ${logoUrl && !failed ? 'has-image' : `fallback symbol-${symbol.tone}`} size-${size} ${className}`.trim();

  if (!logoUrl || failed) {
    return (
      <span className={classes} aria-hidden="true">
        {symbol.label}
      </span>
    );
  }

  return (
    <span className={classes} aria-hidden="true">
      <img src={logoUrl} alt="" loading="lazy" onError={() => setFailed(true)} />
    </span>
  );
}

function SupplyNode({ data }: NodeProps<Node<NodeData>>) {
  const { company, isSelected, isDimmed, isExpanded, onSelect, onToggleExpand } = data;
  const role = companyRoleProfile(company);
  const symbol = companySymbol(company);
  const connection = companyConnectionState(company);
  const compactStage =
    company.sectorId === aiRelationshipSectorId && company.anchorId === aiRelationshipAnchorId
      ? aiStageColumns[aiStageColumn(company)] ?? companyValueChainStage(company)
      : companyValueChainStage(company);

  return (
    <div
      className={[
        'supply-node',
        `tier-${company.tier}`,
        `role-${role.className}`,
        connection.canOpenAnalysis ? 'listed-node' : 'reference-node',
        `connection-${connection.level}`,
        isSelected ? 'selected' : '',
        isDimmed ? 'dimmed' : '',
    ].join(' ')}
    role="button"
    tabIndex={0}
    aria-label={`${company.name} 선택. ${role.primary}, ${companyValueChainStage(company)}`}
    aria-pressed={isSelected}
    onClick={() => onSelect?.(company.id)}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect?.(company.id);
      }
    }}
  >
      <Handle type="target" position={Position.Left} className="node-handle" />
      <div className="node-topline">
        <span className={`company-symbol symbol-${symbol.tone}`} aria-hidden="true">{symbol.label}</span>
        <span className="node-badge-row">
          {isSelected && <span className="selected-company-badge">선택한 기업</span>}
          <span className={`role-badge role-${role.className}`}>{role.primary}</span>
        </span>
        {onToggleExpand && (
          <button
            type="button"
            className={`node-expand-action ${isExpanded ? 'active' : ''}`}
            aria-label={`${company.name} 관련 기업 ${isExpanded ? '접기' : '보기'}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand(company.id);
            }}
          >
            {isExpanded ? '접기' : '관련 기업'}
          </button>
        )}
      </div>
      <div className="node-main">
        <span className="node-name">{company.name}</span>
      </div>
      <div className="node-meta">
        <span>{compactStage}</span>
        {!connection.canOpenAnalysis && <span className={`connection-mini-badge ${connection.level}`}>{connection.label}</span>}
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </div>
  );
}

const nodeTypes = {
  supplyNode: SupplyNode,
};

function aiStageColumn(company: Company) {
  const stage = companyValueChainStage(company);
  if (stage.includes('최종 수요') || stage.includes('플랫폼') || stage.includes('클라우드')) return 0;
  if (stage.includes('AI 칩') || stage.includes('GPU') || stage.includes('ASIC') || stage.includes('맞춤형')) return 1;
  if (stage.includes('메모리') || stage.includes('HBM')) return 2;
  if (stage.includes('파운드리') || stage.includes('제조')) return 3;
  if (stage.includes('장비') || stage.includes('소재') || stage.includes('부품') || stage.includes('후공정') || stage.includes('테스트')) return 4;
  if (stage.includes('서버') || stage.includes('네트워크')) return 4;
  if (stage.includes('전력') || stage.includes('냉각')) return 4;
  return 4;
}

function getAiNodePosition(company: Company) {
  if (company.sectorId !== aiRelationshipSectorId || company.anchorId !== aiRelationshipAnchorId) return undefined;
  const stageColumn = aiStageColumn(company);
  const sameStageCompanies = companies
    .filter((item) => item.anchorId === aiRelationshipAnchorId)
    .filter((item) => aiStageColumn(item) === stageColumn)
    .sort((a, b) => a.name.localeCompare(b.name));
  const row = Math.max(0, sameStageCompanies.findIndex((item) => item.id === company.id));
  const x = 42 + stageColumn * 330;
  const y = 78 + row * 116;
  return { x, y };
}

function matchesAiFlowStage(stage: string, company: Company) {
  return aiStageColumn(company) === aiStageColumns.indexOf(stage);
}

function getNodePosition(company: Company) {
  const aiPosition = getAiNodePosition(company);
  if (aiPosition) return aiPosition;
  const xByColumn = [34, 382, 742];
  if (company.layout.column === 0) {
    return { x: xByColumn[0], y: 380 };
  }
  if (company.layout.column === 1) {
    return { x: xByColumn[1], y: company.layout.row * 210 + 70 };
  }
  return { x: xByColumn[2], y: company.layout.row * 92 + 24 };
}

function getVisibleCompanies(anchorId: string, query: string, riskFilter: RiskLevel | 'all') {
  const lowerQuery = query.trim().toLowerCase();
  return companies
    .filter((company) => company.anchorId === anchorId)
    .filter((company) => {
      const matchesQuery =
        !lowerQuery ||
        [
          company.name,
          company.legalName,
          company.sector,
          company.region,
          company.products.join(' '),
          company.tags.join(' '),
          company.businessSummary,
          company.valueChainStage,
          company.moat,
          company.mainCustomers?.join(' '),
          company.sourceNote,
        ]
          .join(' ')
          .toLowerCase()
          .includes(lowerQuery);
      const matchesRisk = riskFilter === 'all' || company.riskLevel === riskFilter;
      return matchesQuery && matchesRisk;
    });
}

function getConnectedIds(companyId: string, currentLinks: typeof links) {
  const connected = new Set([companyId]);
  currentLinks.forEach((link) => {
    if (link.source === companyId) connected.add(link.target);
    if (link.target === companyId) connected.add(link.source);
  });
  return connected;
}

function formatNewsDate(value: string) {
  if (!value) return '시간 미확인';
  const compact = value.replace(/[^0-9]/g, '');
  if (compact.length >= 14) {
    return `${compact.slice(0, 4)}.${compact.slice(4, 6)}.${compact.slice(6, 8)} ${compact.slice(8, 10)}:${compact.slice(10, 12)} UTC`;
  }
  return value;
}

function analysisPath(company: Company, anchor?: string) {
  const basePath = `/ko/analysis/${encodeURIComponent(company.id)}`;
  return anchor ? `${basePath}#${encodeURIComponent(anchor)}` : basePath;
}

function categoryPath(sectorId: string, selectedCompanyId?: string) {
  const basePath = `/ko/category/${encodeURIComponent(sectorId)}`;
  return selectedCompanyId ? `${basePath}?company=${encodeURIComponent(selectedCompanyId)}` : basePath;
}

function marketMapPath() {
  return '/ko/market-map';
}

function disclosuresPath() {
  return '/ko/disclosures';
}

function reportsPath(reportId?: string) {
  if (!reportId) return '/ko/reports';
  const report = industryReports.find((item) => item.id === reportId || item.slug === reportId);
  return `/ko/reports/${encodeURIComponent(report?.slug ?? reportId)}`;
}

function picksPath(pick?: StockAutopsyPick) {
  return pick ? `/ko/picks/${encodeURIComponent(pick.id)}` : '/ko/picks';
}

function picksArchivePath() {
  return '/ko/picks/archive';
}

type PrimaryNavKey = 'today' | 'picks' | 'market-map' | 'disclosures' | 'reports';

type PrimaryNavigationProps = {
  active: PrimaryNavKey;
  variant?: 'home' | 'compact';
  onHome: () => void;
  onOpenPicks: () => void;
  onOpenMarketMap: () => void;
  onOpenDisclosures: () => void;
  onOpenReports: (reportId?: string) => void;
};

function PrimaryNavigation({
  active,
  variant = 'compact',
  onHome,
  onOpenPicks,
  onOpenMarketMap,
  onOpenDisclosures,
  onOpenReports,
}: PrimaryNavigationProps) {
  const navItems: Array<{ key: PrimaryNavKey; label: string; href: string; onClick: () => void }> = [
    { key: 'today', label: '오늘', href: '/ko/', onClick: onHome },
    { key: 'picks', label: 'Pick', href: picksPath(), onClick: onOpenPicks },
    { key: 'market-map', label: '시장지도', href: marketMapPath(), onClick: onOpenMarketMap },
    { key: 'disclosures', label: '공시', href: disclosuresPath(), onClick: onOpenDisclosures },
    { key: 'reports', label: '보고서', href: reportsPath(), onClick: () => onOpenReports() },
  ];

  return (
    <header className={`${variant === 'home' ? 'home-nav' : 'pick-nav'} primary-navigation`}>
      <a
        href="/ko/"
        onClick={(event) => {
          event.preventDefault();
          onHome();
        }}
        className="home-brand"
      >
        <span className="home-logo">
          <Network size={20} />
        </span>
        <strong>주가해부실</strong>
      </a>
      <nav aria-label="주요 탐색">
        {navItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={active === item.key ? 'active' : ''}
            aria-current={active === item.key ? 'page' : undefined}
            onClick={(event) => {
              event.preventDefault();
              item.onClick();
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

const analysisRouteAliases: Record<string, string> = {
  'ai-datacenter-nvidia': 'us-semiconductors-nvidia',
  'ai-datacenter-smci': 'ai-datacenter-supermicro',
  'datacenter-power-schneider-electric': 'datacenter-power-schneider',
};

function resolveAnalysisRouteCompanyId(companyId?: string | null) {
  if (!companyId) return undefined;
  return analysisRouteAliases[companyId] ?? companyId;
}

function resolveCategoryRouteCompanyId(companyId?: string | null) {
  return resolveAnalysisRouteCompanyId(companyId);
}

const prominentInstitutionFilters = [
  'Berkshire Hathaway',
  'ARK',
  'BlackRock',
  'Goldman Sachs',
  'Vanguard',
  'State Street',
  'JPMorgan',
  'Morgan Stanley',
  'Bridgewater',
  'Citadel',
  'Renaissance',
  'Baupost',
  'Soros',
];

function marketDisplayLabel(company: Company) {
  return inferCompanyListing(company).market;
}

function hasTradableTicker(company: Company) {
  return isPriceSyncTarget(company);
}

function isMainListedCompany(company: Company) {
  return inferCompanyListing(company).isInvestmentAnalyzable;
}

const placeholderTickerLabels = new Set(['WATCH', '비상장', 'PRIVATE', 'N/A', '-']);

type CompanyIdentitySize = 'compact' | 'card' | 'hero';

type CompanyIdentityProps = {
  companyName?: string | null;
  ticker?: string | null;
  countryLabel?: string | null;
  statusLabel?: string | null;
  size?: CompanyIdentitySize;
  className?: string;
};

function cleanIdentityValue(value?: string | null) {
  return String(value ?? '').trim();
}

function isDisplayTicker(ticker?: string | null) {
  const normalized = cleanIdentityValue(ticker).toUpperCase();
  return Boolean(normalized && !placeholderTickerLabels.has(normalized));
}

function countryLabelFromRegion(region?: string | null) {
  const normalized = cleanIdentityValue(region).toLowerCase();
  if (!normalized) return '';
  if (['korea', 'south korea', '대한민국', '한국'].includes(normalized)) return '한국';
  if (['united states', 'usa', 'us', '미국'].includes(normalized)) return '미국';
  if (['taiwan', '대만'].includes(normalized)) return '대만';
  if (['netherlands', 'the netherlands', '네덜란드'].includes(normalized)) return '네덜란드';
  return '';
}

function countryLabelFromMarket(value?: string | null) {
  const normalized = cleanIdentityValue(value).toUpperCase();
  if (!normalized) return '';
  if (['KR', 'KRX', 'KOSPI', 'KOSDAQ', 'KONEX', '한국'].includes(normalized)) return '한국';
  if (['US', 'NASDAQ', 'NYSE', 'AMEX', 'OTC', '미국'].includes(normalized)) return '미국';
  return '';
}

function countryLabelFromTicker(ticker?: string | null) {
  const normalized = cleanIdentityValue(ticker).toUpperCase();
  if (normalized.endsWith('.KS') || normalized.endsWith('.KQ') || normalized.endsWith('.KONEX')) return '한국';
  return '';
}

function countryLabelFromCompany(company?: Company | null) {
  if (!company) return '';
  return (
    countryLabelFromRegion(company.region) ||
    countryLabelFromMarket(company.country) ||
    countryLabelFromMarket(company.market) ||
    countryLabelFromMarket(company.exchange) ||
    countryLabelFromTicker(company.ticker)
  );
}

function resolveCompanyIdentity(input: {
  companyId?: string | null;
  companyName?: string | null;
  ticker?: string | null;
  countryLabel?: string | null;
  statusLabel?: string | null;
}) {
  const ticker = cleanIdentityValue(input.ticker);
  const normalizedTicker = ticker.toUpperCase();
  const company =
    (input.companyId ? companies.find((item) => item.id === input.companyId) : undefined) ??
    (normalizedTicker ? companies.find((item) => cleanIdentityValue(item.ticker).toUpperCase() === normalizedTicker) : undefined);
  const companyName = cleanIdentityValue(input.companyName) || company?.name || company?.legalName || '회사명 확인 필요';
  const resolvedTicker = ticker || company?.ticker || '';
  const countryLabel =
    cleanIdentityValue(input.countryLabel) ||
    countryLabelFromCompany(company) ||
    countryLabelFromTicker(resolvedTicker);
  return {
    companyName,
    ticker: resolvedTicker,
    countryLabel,
    statusLabel: cleanIdentityValue(input.statusLabel),
  };
}

function CompanyIdentity({
  companyName,
  ticker,
  countryLabel,
  statusLabel,
  size = 'card',
  className = '',
}: CompanyIdentityProps) {
  const name = cleanIdentityValue(companyName) || '회사명 확인 필요';
  const displayTicker = isDisplayTicker(ticker) ? cleanIdentityValue(ticker).toUpperCase() : '';
  const status = cleanIdentityValue(statusLabel) || (displayTicker ? '' : '비상장');
  const meta = displayTicker
    ? [cleanIdentityValue(countryLabel), displayTicker].filter(Boolean).join(' · ')
    : status;

  return (
    <span className={`company-identity company-identity--${size} ${className}`.trim()}>
      <strong className="company-identity__name">{name}</strong>
      {meta ? <small className="company-identity__meta">{meta}</small> : null}
    </span>
  );
}

function CompanyIdentityForCompany({ company, size = 'card', className = '', statusLabel }: { company: Company; size?: CompanyIdentitySize; className?: string; statusLabel?: string }) {
  const identity = resolveCompanyIdentity({
    companyId: company.id,
    companyName: company.name,
    ticker: company.ticker,
    countryLabel: countryLabelFromCompany(company),
    statusLabel: statusLabel ?? (!hasTradableTicker(company) ? companyScopeLabel(company) : undefined),
  });
  return <CompanyIdentity {...identity} size={size} className={className} />;
}

function CompanyIdentityForPick({ pick, size = 'card', className = '' }: { pick: StockAutopsyPick; size?: CompanyIdentitySize; className?: string }) {
  const statusLabel = pick.tickerStatus === 'placeholder' ? '관찰 대상' : undefined;
  const identity = resolveCompanyIdentity({
    companyId: pick.relatedCompanyId ?? pick.companyId,
    companyName: pick.companyName,
    ticker: pick.ticker,
    countryLabel: pick.market === 'KR' ? '한국' : '미국',
    statusLabel,
  });
  return <CompanyIdentity {...identity} size={size} className={className} />;
}

function isAuditedAiMarketMapCompany(company: Company) {
  return company.sectorId === aiRelationshipSectorId && aiAuditedMarketMapIds.has(company.id);
}

function isDatacenterPowerCoolingMarketMapCompany(company: Company) {
  return company.sectorId === datacenterPowerCoolingSectorId && datacenterPowerCoolingAuditedIds.has(company.id);
}

function companyConnectionState(company: Company): {
  level: MarketMapConnectionLevel;
  label: string;
  detail: string;
  badges: string[];
  canOpenAnalysis: boolean;
  canOpenFinancials: boolean;
} {
  if (isDatacenterPowerCoolingMarketMapCompany(company)) {
    if (datacenterPowerCoolingCompleteIds.has(company.id)) {
      return {
        level: 'complete',
        label: '기업해설 연결',
        detail: '기업해설과 공식 재무 숫자 연결을 함께 확인할 수 있습니다.',
        badges: ['기업해설 연결', '재무 연결'],
        canOpenAnalysis: true,
        canOpenFinancials: true,
      };
    }

    if (datacenterPowerCoolingPickOnlyIds.has(company.id)) {
      return {
        level: 'reference',
        label: 'Pick only',
        detail: '관련 Pick 상세에서 냉각/HVAC 흐름을 확인합니다. 현재 지도에서는 기업해설이나 숫자 CTA로 이동하지 않습니다.',
        badges: ['Pick only', '시장 흐름 참고'],
        canOpenAnalysis: false,
        canOpenFinancials: false,
      };
    }

    return {
      level: 'reference',
      label: '시장 흐름 참고',
      detail: '전력·냉각 흐름을 이해하기 위한 참고 노드입니다. 현재 화면에서는 상세 해설로 이동하지 않습니다.',
      badges: ['시장 흐름 참고'],
      canOpenAnalysis: false,
      canOpenFinancials: false,
    };
  }

  if (isAuditedAiMarketMapCompany(company)) {
    if (aiCompleteConnectionIds.has(company.id)) {
      return {
        level: 'complete',
        label: '기업해설 연결',
        detail: '기업해설과 공식 재무 숫자 연결을 함께 확인할 수 있습니다.',
        badges: ['기업해설 연결', '재무 연결'],
        canOpenAnalysis: true,
        canOpenFinancials: true,
      };
    }

    if (aiReferenceOnlyIds.has(company.id)) {
      return {
        level: 'reference',
        label: '시장 흐름 참고',
        detail: '전체 관계를 이해하기 위한 참고 기업입니다. 현재 화면에서는 상세 해설로 이동하지 않습니다.',
        badges: ['시장 흐름 참고'],
        canOpenAnalysis: false,
        canOpenFinancials: false,
      };
    }

    return {
      level: 'planned',
      label: '해설 준비 중',
      detail: '후순위 연결 후보입니다. 현재는 관계도에서 흐름 참고용으로만 표시합니다.',
      badges: ['해설 준비 중'],
      canOpenAnalysis: false,
      canOpenFinancials: false,
    };
  }

  if (isMainListedCompany(company)) {
    return {
      level: 'partial',
      label: '기업해설 연결',
      detail: '기업해설은 열 수 있지만 공식 재무 연결 상태는 회사별로 확인이 필요합니다.',
      badges: ['기업해설 연결', '재무 확인 필요'],
      canOpenAnalysis: true,
      canOpenFinancials: false,
    };
  }

  return {
    level: 'reference',
    label: '시장 흐름 참고',
    detail: '시장 흐름 이해를 위한 참고 기업입니다. 공식 재무 화면으로 이동하지 않습니다.',
    badges: ['시장 흐름 참고'],
    canOpenAnalysis: false,
    canOpenFinancials: false,
  };
}

function canOpenCompanyAnalysis(company?: Company) {
  return Boolean(company && companyConnectionState(company).canOpenAnalysis);
}

function canOpenCompanyFinancials(company?: Company) {
  return Boolean(company && companyConnectionState(company).canOpenFinancials);
}

function companyScopeLabel(company: Company) {
  const connection = companyConnectionState(company);
  if (isDatacenterPowerCoolingMarketMapCompany(company) && !connection.canOpenAnalysis) return connection.label;
  if (isAuditedAiMarketMapCompany(company) && !connection.canOpenAnalysis) return connection.label;
  const listing = inferCompanyListing(company);
  if (listing.listed) return '상장기업';
  if (listing.listingStatus === 'unknown') return '상장 여부 확인 필요';
  if (listing.filingStatus === 'listing-unknown') return '상장 정보 확인 필요';
  if (listing.filingStatus === 'no-public-filing') return '공개 공시 확인 불가';
  return '비상장 참고 기업';
}

function companyScopeDetail(company: Company) {
  const connection = companyConnectionState(company);
  if (isDatacenterPowerCoolingMarketMapCompany(company) && !connection.canOpenAnalysis) return connection.detail;
  if (isDatacenterPowerCoolingMarketMapCompany(company) && connection.level === 'complete') return '시장지도, 기업해설, 공식 재무 숫자까지 연결된 우선 확인 기업입니다.';
  if (isAuditedAiMarketMapCompany(company) && !connection.canOpenAnalysis) return connection.detail;
  if (isAuditedAiMarketMapCompany(company) && connection.level === 'complete') return '시장지도, 기업해설, 공식 재무 숫자까지 연결된 우선 확인 기업입니다.';
  const listing = inferCompanyListing(company);
  if (listing.listed) return '주가, 공시, 재무제표, 기관 보유 보고를 연결해 보는 메인 분석 대상입니다.';
  if (listing.listingStatus === 'unknown') return '상장 여부와 공시 연결을 먼저 확인해야 합니다. 확인 전에는 관계 이해용으로 봅니다.';
  return '비상장 또는 공시 확인이 어려운 기업입니다. 투자 분석보다 관계 이해용 보조 노드로 봅니다.';
}

function relatedPickForMarketMapCompany(company?: Company): StockAutopsyPick | undefined {
  if (!company) return undefined;
  if (company.id === 'datacenter-power-lg-electronics') {
    return stockAutopsyPicks.find((pick) => pick.id === 'pick-lg-electronics-ai-datacenter-cooling');
  }
  return undefined;
}

function productText(company: Company) {
  return (company.mainProducts?.length ? company.mainProducts : company.products).slice(0, 3).join(', ') || '주요 제품 확인 필요';
}

function companyBusinessSummary(company: Company) {
  if (company.businessSummary) return company.businessSummary;
  return `${productText(company)} 관련 제품·서비스를 제공하는 기업입니다.`;
}

function companyValueChainStage(company: Company) {
  if (company.valueChainStage) return company.valueChainStage;
  if (company.tier === 'anchor') return '중심 상장기업';
  if (company.sector.includes('장비')) return '장비';
  if (company.sector.includes('소재')) return '소재';
  if (company.sector.includes('부품')) return '부품';
  if (company.sector.includes('테스트')) return '테스트';
  return '같은 밸류체인';
}

function companyCustomerSummary(company: Company) {
  if (company.mainCustomersOrDemand?.length) return company.mainCustomersOrDemand.join(', ');
  if (company.mainCustomers?.length) return company.mainCustomers.join(', ');
  if (company.tier === 'anchor') return '최종 수요처와 산업 고객. 고객별 비중은 공시·IR에서 확인합니다.';
  return `${company.anchorCustomer} 등 상위 단계 기업과 함께 봅니다. 직접 고객 관계는 공시·IR 확인 필요.`;
}

function companyCustomerExposure(company: Company) {
  if (company.customerExposure) return company.customerExposure;
  if (company.sourceType === 'official') return '공식 공시·IR 기준으로 고객 비중을 확인합니다.';
  return '고객별 매출 비중 미공개. 출처 확인 전에는 숫자로 표시하지 않습니다.';
}

function companyRevenueExposure(company: Company) {
  if (company.revenueExposure) return company.revenueExposure;
  if (company.sourceType === 'official') return '제품별·지역별 매출 비중은 원문 보고서에서 확인합니다.';
  return '제품별·고객별 매출 비중은 공식 기준 확인 필요.';
}

function companyMoatSummary(company: Company) {
  return {
    title: company.economicMoat ?? company.moat ?? '기술 난이도 / 고객 신뢰',
    explanation:
      company.moatExplanation ??
      '품질, 납기, 고객 인증이 쌓이면 새 경쟁자가 쉽게 대체하기 어려운 진입장벽이 될 수 있습니다.',
  };
}

function bottleneckSummary(company: Company) {
  const stage = companyValueChainStage(company);
  if (stage.includes('장비') || stage.includes('테스트') || stage.includes('후공정') || stage.includes('전력/냉각')) {
    return '핵심 공정이나 인프라에 가까워 수요가 몰릴 때 병목 기업이 될 수 있습니다. 단, 실제 병목 여부는 수주·CAPA·고객 인증 자료로 확인해야 합니다.';
  }
  if (company.tier === 'anchor') {
    return '섹터 수요를 이끄는 중심 기업입니다. 이 회사의 투자·재고·수요 변화가 주변 기업으로 번질 수 있습니다.';
  }
  return '같은 밸류체인에서 함께 볼 기업입니다. 산업 흐름을 막는 핵심 병목인지는 추가 검증이 필요합니다.';
}

function companyInvestorWatchPoint(company: Company) {
  return company.investorWatchPoint ?? '수요 변화, 원문 공시, 고객 다변화 여부를 함께 확인합니다.';
}

function companyEasyExplanation(company: Company) {
  if (company.id === 'ai-datacenter-microsoft') {
    return 'Azure와 AI 서비스를 운영하며, 더 많은 AI 서버 투자가 필요한 쪽의 수요를 만듭니다.';
  }
  if (company.id === 'ai-datacenter-google') {
    return '검색·광고와 Google Cloud를 운영하며, AI 서비스와 데이터센터 투자 흐름을 확인하는 기업입니다.';
  }
  if (company.id === 'us-semiconductors-nvidia') {
    return 'AI 계산에 필요한 GPU와 네트워킹 칩을 설계해 클라우드 서버 수요와 연결됩니다.';
  }
  if (company.id === 'ai-datacenter-broadcom') {
    return '클라우드 고객이 원하는 기능에 맞춘 AI 칩과 네트워크 반도체를 설계합니다.';
  }
  if (company.id === 'ai-datacenter-tsmc') {
    return '다른 회사가 설계한 첨단 칩을 실제 반도체로 생산하는 파운드리 기업입니다.';
  }
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') {
    return 'GPU가 데이터를 빠르게 쓰도록 돕는 HBM과 DRAM 같은 메모리를 만듭니다.';
  }
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') {
    return '메모리와 파운드리를 함께 운영해 AI 서버용 메모리와 칩 생산 흐름을 같이 봅니다.';
  }
  if (company.id === 'ai-datacenter-micron') {
    return '미국 메모리 기업으로, DRAM·NAND·HBM 수요 회복을 확인할 때 함께 봅니다.';
  }
  if (company.id === 'ai-datacenter-asml') {
    return '칩 회로를 아주 미세하게 새기는 EUV 노광장비를 공급하는 장비 기업입니다.';
  }
  if (company.id === 'ai-datacenter-vertiv') {
    return 'AI 서버가 많은 전기와 냉각을 필요로 할 때 같이 확인하는 데이터센터 인프라 기업입니다.';
  }

  const stage = companyValueChainStage(company);
  if (stage.includes('AI 칩') || stage.includes('GPU')) return 'AI 계산에 필요한 칩을 설계해 서버와 클라우드 수요에 연결됩니다.';
  if (stage.includes('메모리') || stage.includes('HBM')) return '서버가 데이터를 빠르게 주고받도록 메모리를 공급합니다.';
  if (stage.includes('파운드리') || stage.includes('제조')) return '다른 회사가 설계한 칩을 실제 제품으로 만들어 주는 역할을 합니다.';
  if (stage.includes('장비') || stage.includes('소재')) return '반도체를 만들 때 필요한 장비와 소재를 공급하는 역할입니다.';
  return `${productText(company)}가 필요한 고객과 산업 수요를 이어 봅니다.`;
}

function companyDemandTitle(company: Company) {
  if (company.id === 'ai-datacenter-microsoft') return 'Azure 고객과 AI 서비스 수요';
  if (company.id === 'ai-datacenter-google') return 'Google Cloud와 AI 서비스 수요';
  if (company.id === 'us-semiconductors-nvidia') return '클라우드와 AI 데이터센터';
  if (company.id === 'ai-datacenter-broadcom') return '클라우드 맞춤형 칩과 네트워크 수요';
  if (company.id === 'ai-datacenter-tsmc') return 'AI 칩 설계사의 생산 수요';
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') return 'AI 서버와 메모리 업황';
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') return '메모리 고객과 파운드리 고객';
  if (company.id === 'ai-datacenter-micron') return '서버·PC·AI 메모리 수요';
  if (company.id === 'ai-datacenter-asml') return '첨단 공정 설비투자';
  if (company.id === 'ai-datacenter-vertiv') return '데이터센터 전력·냉각 증설';

  const demand = company.mainCustomersOrDemand?.length ? company.mainCustomersOrDemand : company.mainCustomers;
  if (demand?.length) return demand.slice(0, 2).join(', ');
  return companyValueChainStage(company);
}

function companyProductExplanation(company: Company) {
  if (company.id === 'ai-datacenter-microsoft') return 'Azure 클라우드, AI 서비스, 기업용 소프트웨어가 핵심입니다.';
  if (company.id === 'ai-datacenter-google') return '검색·광고, Google Cloud, AI 인프라가 주요 사업입니다.';
  if (company.id === 'us-semiconductors-nvidia') return 'GPU, AI 가속기, 네트워킹 장비가 데이터센터 매출의 핵심입니다.';
  if (company.id === 'ai-datacenter-broadcom') return 'AI 맞춤형 칩, 네트워크 반도체, 스위칭 칩을 제공합니다.';
  if (company.id === 'ai-datacenter-tsmc') return '고객이 설계한 칩을 첨단 공정으로 대신 생산합니다.';
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') return 'HBM, DRAM, NAND가 핵심 제품입니다.';
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') return '메모리 반도체, 파운드리, 스마트폰이 주요 사업입니다.';
  if (company.id === 'ai-datacenter-micron') return 'DRAM, NAND, HBM이 매출을 만드는 핵심 제품입니다.';
  if (company.id === 'ai-datacenter-asml') return 'EUV·DUV 노광장비와 장비 서비스가 핵심입니다.';
  if (company.id === 'ai-datacenter-vertiv') return '전력 장비, 냉각 인프라, 데이터센터 운영 솔루션을 제공합니다.';
  return `${productText(company)}가 매출을 만드는 핵심 제품입니다.`;
}

function companyDemandExplanation(company: Company) {
  if (company.id === 'ai-datacenter-microsoft') return 'Azure에서 AI 서비스 사용이 늘면 GPU 서버와 전력·냉각 인프라 투자도 함께 확인합니다.';
  if (company.id === 'ai-datacenter-google') return 'Google Cloud와 AI 서비스 투자가 맞춤형 칩, GPU, 데이터센터 인프라 수요와 연결될 수 있습니다.';
  if (company.id === 'us-semiconductors-nvidia') return '클라우드 기업의 AI 서버 투자가 GPU와 네트워크 장비 주문으로 이어지는지 봅니다.';
  if (company.id === 'ai-datacenter-broadcom') return '클라우드 고객의 자체 AI 칩과 네트워크 투자가 주문으로 이어지는지 확인합니다.';
  if (company.id === 'ai-datacenter-tsmc') return 'AI 칩 설계사의 주문이 첨단 공정 생산과 가동률로 이어지는지 봅니다.';
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') return 'GPU 서버 증설이 HBM 출하와 메모리 가격 흐름으로 이어지는지 봅니다.';
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') return 'AI 서버 메모리와 파운드리 고객 주문이 각 사업 실적으로 이어지는지 봅니다.';
  if (company.id === 'ai-datacenter-micron') return '서버와 PC 수요, HBM 전환 속도가 메모리 판매에 영향을 줍니다.';
  if (company.id === 'ai-datacenter-asml') return 'TSMC·삼성전자 같은 제조사의 첨단 공정 투자가 장비 주문으로 이어지는지 봅니다.';
  if (company.id === 'ai-datacenter-vertiv') return 'AI 서버가 늘수록 전력 공급과 냉각 부담이 커지는지, 실제 수주로 확인합니다.';
  return `${companyValueChainStage(company)} 단계의 고객 투자와 연결됩니다. 고객별 비중은 원문에서 확인합니다.`;
}

function companyWatchChecklistSummary(company: Company) {
  if (company.id === 'ai-datacenter-microsoft') return 'Azure 성장과 AI 설비투자가 매출과 비용에 어떻게 반영되는지 봅니다.';
  if (company.id === 'ai-datacenter-google') return 'AI 인프라 투자와 Cloud 성장, 자체 칩 전략을 함께 확인합니다.';
  if (company.id === 'us-semiconductors-nvidia') return '데이터센터 매출, 고객 투자, 마진이 유지되는지 봅니다.';
  if (company.id === 'ai-datacenter-broadcom') return 'AI 맞춤형 칩 매출과 네트워크 반도체 수요가 이어지는지 봅니다.';
  if (company.id === 'ai-datacenter-tsmc') return '첨단 공정 가동률과 고객 주문, 설비투자 속도를 봅니다.';
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') return 'HBM 매출, 메모리 가격, 현금흐름이 함께 좋아지는지 봅니다.';
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') return 'HBM 경쟁력, 파운드리 가동률, 메모리 가격을 같이 봅니다.';
  if (company.id === 'ai-datacenter-micron') return 'HBM 전환, 메모리 가격, 현금흐름 개선을 같이 봅니다.';
  if (company.id === 'ai-datacenter-asml') return 'EUV 수주와 장비 인도, 고객 투자 지연 여부를 봅니다.';
  if (company.id === 'ai-datacenter-vertiv') return '전력·냉각 수주와 마진이 데이터센터 투자와 같이 움직이는지 봅니다.';
  return companyInvestorWatchPoint(company);
}

function companyInvestorSignalTitle(company: Company) {
  if (company.id === 'ai-datacenter-microsoft') return 'Azure 성장과 AI 투자';
  if (company.id === 'ai-datacenter-google') return 'Cloud 성장과 AI 인프라';
  if (company.id === 'us-semiconductors-nvidia') return '데이터센터 매출과 마진';
  if (company.id === 'ai-datacenter-broadcom') return 'AI ASIC과 네트워크 수요';
  if (company.id === 'ai-datacenter-tsmc') return '첨단 공정 가동률';
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') return 'HBM 매출과 현금흐름';
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') return 'HBM 경쟁력과 가동률';
  if (company.id === 'ai-datacenter-micron') return 'HBM 전환과 가격 회복';
  if (company.id === 'ai-datacenter-asml') return 'EUV 수주와 인도';
  if (company.id === 'ai-datacenter-vertiv') return '전력·냉각 수주';
  return '다음 공시에서 확인할 신호';
}

function companyInvestorSignalCopy(company: Company) {
  if (company.id === 'ai-datacenter-microsoft') return 'AI 서비스 수요가 Azure 성장과 설비투자 부담에 어떻게 반영되는지 확인합니다.';
  if (company.id === 'ai-datacenter-google') return 'AI 서비스와 Cloud 성장이 반도체·데이터센터 투자로 이어지는지 확인합니다.';
  if (company.id === 'us-semiconductors-nvidia') return '고객 투자가 둔화되지 않는지, 높은 수익성이 유지되는지 확인합니다.';
  if (company.id === 'ai-datacenter-broadcom') return '맞춤형 칩 수요가 실제 매출과 고객 집중 리스크에 어떻게 반영되는지 확인합니다.';
  if (company.id === 'ai-datacenter-tsmc') return 'AI 칩 주문이 가동률과 첨단 공정 매출로 이어지는지 확인합니다.';
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') return '고부가 메모리 판매가 이익과 현금 회수로 이어지는지 확인합니다.';
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') return '메모리 회복과 파운드리 개선이 같은 방향으로 움직이는지 확인합니다.';
  if (company.id === 'ai-datacenter-micron') return '메모리 업황 회복이 매출, 이익, 현금흐름에 같이 반영되는지 확인합니다.';
  if (company.id === 'ai-datacenter-asml') return '고객 설비투자가 장비 수주와 인도 일정으로 이어지는지 확인합니다.';
  if (company.id === 'ai-datacenter-vertiv') return '데이터센터 증설이 전력·냉각 수주와 현금흐름으로 이어지는지 확인합니다.';
  return companyInvestorWatchPoint(company);
}

function shortCardSentence(text: string, fallback: string) {
  const first = text.split(/(?<=\.)\s+/).find(Boolean)?.replace(/\.$/, '') ?? fallback;
  return first.length > 42 ? fallback : first;
}

function companyQuestionProductCopy(company: Company) {
  if (datacenterPowerCoolingEasyCopy[company.id]) return datacenterPowerCoolingEasyCopy[company.id].product;
  if (company.id === 'us-semiconductors-nvidia') return 'AI 계산용 칩을 설계합니다.';
  if (company.id === 'ai-datacenter-dell') return 'AI 서버를 기업에 팝니다.';
  if (company.id === 'ai-datacenter-sk-hynix' || company.id === 'kr-semiconductors-sk-hynix') return 'AI 서버용 메모리를 만듭니다.';
  if (company.id === 'ai-datacenter-micron') return 'AI 서버용 메모리를 만듭니다.';
  return shortCardSentence(companyProductExplanation(company), `${productText(company).split(', ')[0]}를 제공합니다.`);
}

function companyQuestionDemandCopy(company: Company) {
  if (datacenterPowerCoolingEasyCopy[company.id]) return datacenterPowerCoolingEasyCopy[company.id].demand;
  if (company.id === 'us-semiconductors-nvidia') return 'AI 서비스를 만드는 회사들이 씁니다.';
  if (company.id === 'ai-datacenter-dell') return 'AI 서버를 늘리는 기업이 필요합니다.';
  if (company.id === 'ai-datacenter-sk-hynix' || company.id === 'kr-semiconductors-sk-hynix') return 'GPU 서버를 만드는 회사들이 필요합니다.';
  if (company.id === 'ai-datacenter-micron') return 'GPU 서버를 만드는 회사들이 필요합니다.';
  return shortCardSentence(companyDemandExplanation(company), `${companyDemandTitle(company)}가 필요로 합니다.`);
}

function companyQuestionMoatCopy(company: Company) {
  if (company.id === 'us-semiconductors-nvidia') return '칩 설계와 생태계를 따라 하기 어렵습니다.';
  if (company.id === 'ai-datacenter-dell') return '고객 기반과 공급망을 따라 하기 어렵습니다.';
  if (company.id === 'ai-datacenter-sk-hynix' || company.id === 'kr-semiconductors-sk-hynix') return '고성능 메모리 양산이 어렵습니다.';
  if (company.id === 'ai-datacenter-micron') return '메모리 기술과 양산 경험이 필요합니다.';
  return shortCardSentence(companyMoatSummary(company).explanation, '기술과 고객 신뢰를 따라 하기 어렵습니다.');
}

function companyQuestionCheckCopy(company: Company) {
  if (company.id === 'us-semiconductors-nvidia') return '매출, 이익, 현금흐름을 봅니다.';
  if (company.id === 'ai-datacenter-dell') return '서버 매출과 현금흐름을 봅니다.';
  if (company.id === 'ai-datacenter-sk-hynix' || company.id === 'kr-semiconductors-sk-hynix') return 'HBM 매출과 현금흐름을 봅니다.';
  if (company.id === 'ai-datacenter-micron') return '메모리 매출과 현금흐름을 봅니다.';
  return shortCardSentence(companyInvestorSignalCopy(company), '매출, 이익, 현금흐름을 봅니다.');
}

function companyQuestionTermBadges(company: Company) {
  const stage = companyValueChainStage(company);
  return {
    product: stage.includes('GPU') || company.id === 'us-semiconductors-nvidia'
      ? 'GPU'
      : stage.includes('메모리') || stage.includes('HBM')
        ? 'HBM'
        : stage.includes('파운드리')
          ? '파운드리'
          : company.id === 'ai-datacenter-dell'
            ? 'AI 서버'
            : stage,
    demand: company.id === 'us-semiconductors-nvidia' || company.id.includes('datacenter') || stage.includes('전력') || stage.includes('서버')
      ? '데이터센터'
      : companyDemandTitle(company).split(', ')[0],
    moat: '경제적 해자',
    check: '영업현금흐름',
  };
}

function relationshipTypeLabel(company: Company) {
  if (company.relationshipType) return company.relationshipType;
  if (company.tier === 'anchor') return '중심 기업';
  return companyValueChainStage(company);
}

function linkConfidenceLabel(link: (typeof links)[number]) {
  return link.confidence ?? link.relationshipConfidence ?? '산업상 관련';
}

function relationshipConfidenceLabel(company: Company) {
  if (company.relationshipConfidence) return company.relationshipConfidence;
  return company.sourceType === 'official' ? '공시·IR 기준' : '산업상 관련';
}

function relationshipSourceNote(company: Company) {
  return company.sourceNotes ?? company.sourceNote;
}

function relationshipRevenueExposureDisplay(link: (typeof links)[number]) {
  const confidence = linkConfidenceLabel(link);
  const value = link.revenueExposureStatus ?? link.revenueExposure ?? '고객별 매출 비중 미공개 또는 공식 공시 기준 확인 필요';
  const hasPercentage = /[%％]/.test(value);
  if (hasPercentage && !confidence.includes('공식 확인')) {
    return '추정치 / 출처 확인 필요';
  }
  return value;
}

function sourceReliabilityLabel(value?: string) {
  if (value === 'high') return '높음';
  if (value === 'medium') return '중간';
  if (value === 'low') return '낮음';
  return '검토 필요';
}

function evidenceTypeLabel(value?: string) {
  if (value === 'company-filing') return '회사 공시';
  if (value === 'annual-report') return '사업보고서';
  if (value === 'investor-presentation') return 'IR/실적발표';
  if (value === 'earnings-call') return '실적 컨퍼런스콜';
  if (value === 'press-release') return '공식 보도자료';
  if (value === 'credible-news') return '신뢰 뉴스';
  if (value === 'industry-analysis') return '산업 구조 분석';
  return '수동 검토 메모';
}

function linkRelationshipSummary(link: (typeof links)[number]) {
  return {
    type: link.relationshipType ?? link.label,
    confidence: linkConfidenceLabel(link),
    description: link.description ?? link.value,
    whatIsSold: link.whatIsSold ?? link.label,
    demandConnection: link.demandConnection ?? '같은 밸류체인에서 함께 봐야 할 기업입니다.',
    revenueExposure: relationshipRevenueExposureDisplay(link),
    evidenceSummary: link.evidenceSummary ?? '출처 확인 필요: 공식 공시, IR, 신뢰 가능한 원문으로 관계를 추가 검증해야 합니다.',
    evidenceType: link.evidenceType ?? 'manual-note',
    evidenceTypeLabel: evidenceTypeLabel(link.evidenceType),
    sourceName: link.sourceName ?? '출처 확인 필요',
    sourceUrl: link.sourceUrl,
    sourceDate: link.sourceDate ?? '확인 필요',
    sourceReliability: link.sourceReliability ?? 'needs-review',
    sourceReliabilityLabel: sourceReliabilityLabel(link.sourceReliability),
    lastVerifiedAt: link.lastVerifiedAt ?? '확인 필요',
    note: link.sourceNotes ?? '직접 고객 관계는 공시·IR·계약·뉴스 원문으로 검증해야 합니다.',
  };
}

type MapViewMode = 'core' | 'all';
type FlowViewMode = 'core' | 'all' | 'kr' | 'us' | 'reference' | 'sources';
type RoleFilter = 'all' | 'leader' | 'bottleneck' | 'beneficiary' | 'listed' | 'reference';
type ListingFilter = 'all' | 'listed' | 'reference';

function companyRoleProfile(company: Company) {
  const stage = companyValueChainStage(company);
  const connection = companyConnectionState(company);
  if (connection.level === 'planned') {
    return {
      primary: '해설 준비 중',
      secondary: '후순위 연결 후보',
      className: 'planned',
      filterGroup: 'reference' as RoleFilter,
      explanation: '관계도 보조 기업입니다. 공식 해설과 재무 연결은 나중에 검토합니다.',
    };
  }
  if (connection.level === 'reference') {
    return {
      primary: '시장 흐름 참고',
      secondary: '관계 참고용',
      className: 'reference',
      filterGroup: 'reference' as RoleFilter,
      explanation: '전체 흐름을 이해하기 위한 참고 노드입니다.',
    };
  }
  if (company.id === 'us-semiconductors-nvidia') {
    return {
      primary: '대장주',
      secondary: 'AI 칩',
      className: 'leader',
      filterGroup: 'leader' as RoleFilter,
      explanation: 'AI 서버 수요의 중심에 있는 대표 기업입니다.',
    };
  }
  if (['ai-datacenter-google', 'ai-datacenter-microsoft', 'ai-datacenter-amazon'].includes(company.id)) {
    return {
      primary: '플랫폼/최종 수요',
      secondary: 'AI 인프라 투자',
      className: 'platform',
      filterGroup: 'leader' as RoleFilter,
      explanation: '클라우드와 AI 서비스 투자를 통해 하위 기업 수요를 만들 수 있습니다.',
    };
  }
  if (company.id === 'ai-datacenter-broadcom') {
    return {
      primary: '대장주',
      secondary: '맞춤형 반도체',
      className: 'leader',
      filterGroup: 'leader' as RoleFilter,
      explanation: 'AI 맞춤형 칩과 네트워크 반도체 수요와 연결됩니다.',
    };
  }
  if (['ai-datacenter-tsmc', 'ai-datacenter-asml'].includes(company.id)) {
    return {
      primary: '핵심 병목 기업',
      secondary: stage,
      className: 'bottleneck',
      filterGroup: 'bottleneck' as RoleFilter,
      explanation: '없으면 산업 흐름이 막힐 수 있는 핵심 기업으로 볼 수 있습니다.',
    };
  }
  if (stage.includes('메모리') || stage.includes('서버') || stage.includes('네트워크') || stage.includes('전력') || stage.includes('냉각')) {
    return {
      primary: '수요 수혜 기업',
      secondary: stage,
      className: 'beneficiary',
      filterGroup: 'beneficiary' as RoleFilter,
      explanation: 'AI 서버 수요가 늘 때 함께 봐야 할 기업입니다.',
    };
  }
  if (stage.includes('장비') || stage.includes('소재') || stage.includes('부품') || stage.includes('후공정') || stage.includes('테스트')) {
    return {
      primary: '장비/소재 기업',
      secondary: stage,
      className: 'equipment',
      filterGroup: 'beneficiary' as RoleFilter,
      explanation: '설비투자와 생산 확대 국면에서 함께 확인할 기업입니다.',
    };
  }
  if (stage.includes('파운드리') || stage.includes('제조')) {
    return {
      primary: '제조/파운드리',
      secondary: stage,
      className: 'manufacturing',
      filterGroup: 'bottleneck' as RoleFilter,
      explanation: '칩을 실제로 만들거나 제조 역량과 연결된 기업입니다.',
    };
  }
  return {
    primary: '상장기업',
    secondary: stage,
    className: 'listed',
    filterGroup: 'listed' as RoleFilter,
    explanation: '상장기업 중심으로 재무·공시·가격을 함께 확인합니다.',
  };
}

function matchesRoleFilter(company: Company, roleFilter: RoleFilter) {
  if (roleFilter === 'all') return true;
  if (roleFilter === 'listed') return canOpenCompanyAnalysis(company);
  if (roleFilter === 'reference') return !canOpenCompanyAnalysis(company);
  return companyRoleProfile(company).filterGroup === roleFilter;
}

function confidenceClassName(value: string) {
  if (value.includes('공식 확인')) return 'official';
  if (value.includes('공시') || value.includes('IR')) return 'ir';
  if (value.includes('검증')) return 'needs';
  return 'industrial';
}

function confidenceHelpText(value: string) {
  if (value.includes('공식 확인')) return '회사 공시나 공식 자료에서 확인된 관계입니다.';
  if (value.includes('공시') || value.includes('IR')) return '공시/IR에서 관련성이 확인되거나 추론 가능한 관계입니다.';
  if (value.includes('검증')) return '추가 출처 확인이 필요한 관계입니다.';
  return '같은 산업 구조에서 함께 봐야 할 관계입니다.';
}

function relationshipKindClass(value: string) {
  if (value.includes('위탁생산') || value.includes('파운드리')) return 'foundry';
  if (value.includes('장비')) return 'equipment';
  if (value.includes('소재') || value.includes('부품')) return 'material';
  if (value.includes('메모리') || value.includes('HBM')) return 'memory';
  if (value.includes('서버') || value.includes('네트워크')) return 'server';
  if (value.includes('전력') || value.includes('냉각')) return 'power';
  if (value.includes('검증')) return 'needs';
  return 'demand';
}

function relationshipEdgeColor(value: string) {
  const kind = relationshipKindClass(value);
  if (kind === 'foundry') return '#7c3aed';
  if (kind === 'equipment') return '#f59e0b';
  if (kind === 'material') return '#64748b';
  if (kind === 'memory') return '#16a34a';
  if (kind === 'server') return '#0ea5e9';
  if (kind === 'power') return '#dc2626';
  return '#2563eb';
}

function shortRelationshipLabel(value: string) {
  if (value.includes('위탁생산')) return '위탁생산';
  if (value.includes('장비')) return '장비';
  if (value.includes('소재')) return '소재';
  if (value.includes('부품') || value.includes('테스트')) return '부품/테스트';
  if (value.includes('메모리') || value.includes('HBM')) return 'HBM';
  if (value.includes('서버') || value.includes('네트워크')) return '서버/네트워크';
  if (value.includes('전력') || value.includes('냉각')) return '전력·냉각';
  if (value.includes('클라우드')) return '클라우드 수요';
  return '수요 연결';
}

function formatDisplayAmount(value: string, sourceUnit: string, country: CountryId) {
  const numeric = Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(numeric)) {
    return {
      primary: value && value !== '원문확인' ? value : '원문 보고서에서 확인 필요',
      sourceUnit: sourceUnit || '원문 단위 확인 필요',
    };
  }

  if (country === 'KR') {
    if (sourceUnit.includes('백만원')) {
      const primary = Math.abs(numeric) >= 1_000_000 ? `${(numeric / 1_000_000).toFixed(1)}조원` : `${(numeric / 100).toFixed(0)}억원`;
      return { primary, sourceUnit: '원문 기준: 백만원 단위' };
    }
    return { primary: `${numeric.toLocaleString('ko-KR')}원`, sourceUnit: sourceUnit || '원문 기준: 원화' };
  }

  const primary = Math.abs(numeric) >= 1_000 ? `$${(numeric / 1_000).toFixed(1)}B` : `$${numeric.toLocaleString('en-US')}M`;
  return { primary, sourceUnit: sourceUnit || 'Source unit: USD million' };
}

function sourceUnitShort(value: string, country: CountryId) {
  if (country === 'KR') {
    if (value.includes('백만원')) return '원문 기준: 백만원 단위';
    if (value.includes('억원')) return '원문 기준: 억원 단위';
    if (value.includes('조원')) return '원문 기준: 조원 단위';
    return value || '원문 단위 확인 필요';
  }
  return value || 'Source unit: USD';
}

function isPublicRevenueUnavailable(company: Company) {
  const reportLink = getPrimaryReportLink(company);
  return company.sourceType === 'seed-model' && (reportLink.status === 'private-company' || reportLink.status === 'no-public-filing' || reportLink.status === 'listing-unknown');
}

function revenueDisplayForCompany(company: Company, metrics: CompanyDisplayMetrics) {
  if (isPublicRevenueUnavailable(company)) {
    const reportLink = getPrimaryReportLink(company);
    return {
      primary: '공개 공시 기준 매출 확인 불가',
      sourceUnit: reportLink.status === 'private-company' ? '비상장/공시 의무 없음' : reportLink.status === 'listing-unknown' ? '상장 정보 확인 필요' : '공개 보고서 확인 불가',
      basis: '매출 정보: 공식 공시 없음. 출처가 확인되기 전에는 금액을 실제 매출처럼 표시하지 않습니다.',
    };
  }
  const formatted = formatDisplayAmount(metrics.revenue, metrics.revenueUnit, company.country);
  return {
    ...formatted,
    basis: metrics.revenueBasis,
  };
}

function beginnerInterpretation(analysis: FilingAnalysis, company: Company) {
  const firstInsight = analysis.insights[1] ?? analysis.insights[0];
  if (firstInsight) return firstInsight.point;
  if (company.sourceType === 'seed-model') {
    return '현재 숫자는 빠른 비교용입니다. 실제 투자 판단 전에는 공식 공시에서 매출, 현금흐름, 부채를 다시 확인해야 합니다.';
  }
  return analysis.verdict;
}

function missingFinancialValueLabel(company: Company, hasDetailedAnalysis: boolean) {
  if (hasDetailedAnalysis) return '상세 해설에서 확인';
  const reportLink = getPrimaryReportLink(company);
  if (reportLink.status === 'private-company') return '비상장 기업으로 공시 의무 없음';
  if (reportLink.status === 'no-public-filing') return '공식 공시 기준 확인 불가';
  if (reportLink.status === 'listing-unknown') return '상장 정보 확인 필요';
  if (reportLink.status === 'needs-link') return '아직 연결된 원문 보고서가 없습니다';
  return '원문 보고서 확인 필요';
}

function beginnerCompanyConclusion(company: Company) {
  if (company.id === 'ai-datacenter-microsoft') {
    return 'Microsoft는 Azure와 AI 서비스를 운영하며, 기업 고객의 AI 사용 증가와 데이터센터 투자를 함께 볼 기업입니다.';
  }
  if (company.id === 'ai-datacenter-google') {
    return 'Google / Alphabet은 검색·광고와 Google Cloud를 운영하며, AI 서비스와 인프라 투자 흐름을 확인할 기업입니다.';
  }
  if (company.id === 'us-semiconductors-nvidia') {
    return 'NVIDIA는 AI 서버 계산에 필요한 GPU와 네트워킹 칩을 설계하는 회사입니다.';
  }
  if (company.id === 'ai-datacenter-broadcom') {
    return 'Broadcom은 클라우드 고객용 맞춤형 AI 칩과 네트워크 반도체를 설계하는 회사입니다.';
  }
  if (company.id === 'ai-datacenter-tsmc') {
    return 'TSMC는 AI 칩 설계사가 맡긴 칩을 첨단 공정으로 생산하는 파운드리 회사입니다.';
  }
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') {
    return 'SK하이닉스는 AI 서버용 HBM과 메모리를 만드는 회사입니다.';
  }
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') {
    return '삼성전자는 메모리, 파운드리, 스마트폰을 함께 운영하는 글로벌 제조 기업입니다.';
  }
  if (company.id === 'ai-datacenter-micron') {
    return 'Micron은 DRAM, NAND, HBM을 만드는 미국 메모리 반도체 기업입니다.';
  }
  if (company.id === 'ai-datacenter-asml') {
    return 'ASML은 첨단 반도체 회로를 새기는 EUV 노광장비를 만드는 장비 회사입니다.';
  }
  if (company.id === 'ai-datacenter-vertiv') {
    return 'Vertiv는 AI 데이터센터에 필요한 전력 공급과 냉각 인프라를 제공하는 회사입니다.';
  }

  return `${company.name}${topicParticle(company.name)} ${productText(company)}를 제공하는 ${companyValueChainStage(company)} 기업입니다.`;
}

function financialOneLineConclusion(company: Company, analysis: FilingAnalysis) {
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') {
    return '매출과 영업이익은 회복되고 있지만, 재고와 매출채권이 실제 현금 회수로 이어지는지 확인해야 합니다.';
  }
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') {
    return 'HBM 수요로 실적 회복 기대가 커졌지만, 메모리 업황과 재고 흐름이 현금흐름을 좌우합니다.';
  }
  if (company.id === 'us-semiconductors-nvidia') {
    return '데이터센터 매출이 성장을 이끌고 있지만, 높은 기대를 유지하려면 매출 성장률과 마진 방어가 중요합니다.';
  }
  return analysis.headline;
}

function beginnerIndustryMetrics(company: Company, displayMetrics: CompanyDisplayMetrics) {
  const stage = companyValueChainStage(company);
  if (company.id === 'us-semiconductors-nvidia' || stage.includes('AI 칩') || stage.includes('GPU')) {
    return [
      { label: '데이터센터 매출 성장률', value: 'MD&A 확인', note: 'AI 서버 수요가 실제 매출로 이어지는지 보는 첫 지표입니다.' },
      { label: '영업이익률', value: displayMetrics.opMargin, note: '고성능 칩 경쟁력이 이익으로 남는지 확인합니다.' },
      { label: '현금흐름 / R&D 투자', value: '원문 확인', note: '성장 투자가 지속 가능한지 현금창출과 연구개발을 같이 봅니다.' },
    ];
  }
  if (stage.includes('메모리') || stage.includes('HBM')) {
    return [
      { label: 'HBM / 메모리 수요', value: '공시·IR 확인', note: 'AI 서버 수요가 고부가 메모리 판매로 이어지는지 봅니다.' },
      { label: '영업이익률', value: displayMetrics.opMargin, note: '메모리 가격과 제품 믹스가 이익률에 반영됩니다.' },
      { label: '재고 / 영업현금흐름', value: '원문 확인', note: '팔릴 제품과 실제 현금 회수가 같이 좋아지는지 확인합니다.' },
    ];
  }
  if (stage.includes('파운드리') || stage.includes('제조')) {
    return [
      { label: '매출 성장률', value: displayMetrics.growth, note: '고객 칩 생산 수요가 실제 매출로 늘어나는지 봅니다.' },
      { label: '영업이익률', value: displayMetrics.opMargin, note: '가동률과 제품 믹스가 수익성에 직접 영향을 줍니다.' },
      { label: 'CAPEX / 가동률', value: '원문 확인', note: '대규모 투자가 미래 생산능력과 부담으로 어떻게 반영되는지 봅니다.' },
    ];
  }
  if (stage.includes('장비') || stage.includes('소재') || stage.includes('후공정') || stage.includes('테스트')) {
    return [
      { label: '수주잔고', value: '공시·IR 확인', note: '앞으로 납품될 장비와 부품 수요를 미리 보는 지표입니다.' },
      { label: '매출 성장률', value: displayMetrics.growth, note: '설비투자 흐름이 실제 매출로 이어졌는지 봅니다.' },
      { label: '영업이익률', value: displayMetrics.opMargin, note: '기술 난이도와 고객 인증이 수익성으로 남는지 확인합니다.' },
    ];
  }
  if (stage.includes('서버') || stage.includes('네트워크') || stage.includes('전력') || stage.includes('냉각')) {
    return [
      { label: '데이터센터 매출 / 수주', value: '원문 확인', note: 'AI 인프라 투자가 실제 주문과 매출로 이어지는지 봅니다.' },
      { label: '영업이익률', value: displayMetrics.opMargin, note: '장비·인프라 수요가 늘어도 비용이 함께 늘 수 있습니다.' },
      { label: '현금흐름', value: '원문 확인', note: '프로젝트 매출이 실제 현금 회수로 이어지는지 확인합니다.' },
    ];
  }
  return [
    { label: '매출 성장률', value: displayMetrics.growth, note: '뉴스 흐름이 실제 매출 증가로 이어졌는지 봅니다.' },
    { label: '영업이익률', value: displayMetrics.opMargin, note: '본업에서 돈을 얼마나 남기는지 확인합니다.' },
    { label: '영업현금흐름', value: '원문 확인', note: '장부상 이익이 실제 현금으로 들어오는지 봅니다.' },
  ];
}

function isPendingFinancialValue(value: string) {
  const trimmed = value.trim();
  return !trimmed || /원문|MD&A|공시|IR|데이터 연결|확인/i.test(trimmed) || /^\d+(?:\.\d+)?%$/.test(trimmed);
}

function beginnerMetricValueLabel(value: string) {
  if (isPendingFinancialValue(value)) return '공식 데이터 연결 필요';
  return value;
}

function financialMetricSourceNote(value: string, summary: FinancialStatementSummary) {
  if (isPendingFinancialValue(value)) return '값 확인 전, 지표 의미만 표시';
  if (!isConnectedFinancialSummary(summary)) return '연결된 데이터 기준';
  if (summary.source === 'OpenDART') return 'OpenDART 원문 · 공시 기준';
  if (summary.source === 'SEC CompanyFacts') return /20-F/i.test(summary.reportType) ? 'SEC 20-F 원문 기준' : 'SEC 원문 기준';
  return '연결된 데이터 기준';
}

function comparisonPercentLabel(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function financialComparisonNote(comparison?: FinancialMetric['comparison']) {
  const pieces: string[] = [];
  if (typeof comparison?.yoy === 'number' && Number.isFinite(comparison.yoy)) {
    pieces.push(`작년 같은 기간보다 ${comparisonPercentLabel(comparison.yoy)}`);
  }
  if (typeof comparison?.qoq === 'number' && Number.isFinite(comparison.qoq)) {
    pieces.push(`직전 분기보다 ${comparisonPercentLabel(comparison.qoq)}`);
  }
  return pieces.join(' · ');
}

function financialQuestionTitle(index: number) {
  if (index === 0) return '얼마나 팔았나요?';
  if (index === 1) return '팔고 돈이 남았나요?';
  return '현금이 들어왔나요?';
}

function financialTermBadge(label: string, index: number) {
  if (/FCF|잉여현금/i.test(label)) return 'FCF';
  if (/현금흐름|재고|R&D/.test(label) || index === 2) return '영업현금흐름';
  if (/영업이익|영업마진|마진|이익률|수익성/.test(label) || index === 1) return '영업이익';
  return '매출';
}

function financialSimpleSignalSet() {
  return {
    good: ['매출이 실제로 늘어요', '이익이 같이 남아요', '현금흐름이 버텨요'],
    caution: ['매출만 늘고 이익이 줄어요', '현금흐름이 약해져요', '비용 부담이 커져요'],
  };
}

function financialDetailValueClass(value: string) {
  return /공식 데이터 연결 필요|가격 데이터 연결 필요|계산 보류|원문 확인|확인 필요|보류/i.test(value)
    ? 'muted'
    : 'connected';
}

function isConnectedFinancialSummary(summary: FinancialStatementSummary) {
  return summary.isApiData && (summary.sourceStatus === 'direct' || summary.sourceStatus === 'partial');
}

function isSec20FFinancialSummary(summary: FinancialStatementSummary) {
  return summary.source === 'SEC CompanyFacts' && /20-F/i.test(summary.reportType);
}

function shouldDisplayConnectedFinancials(company: Company, summary: FinancialStatementSummary) {
  if (!isConnectedFinancialSummary(summary)) return false;
  if (company.country === 'US') return Boolean(company.cik);
  if (company.country === 'KR') return Boolean(company.corpCode);
  return false;
}

function usableFinancialMetricValue(metric?: FinancialStatementSummary['metrics'][number]) {
  const value = metric?.value ?? '';
  if (!value || /공식 데이터 연결 필요|원문|MD&A|공시|IR|데이터 연결|확인 필요/i.test(value)) return undefined;
  return value;
}

type FinancialMetricItem = FinancialStatementSummary['metrics'][number];
type FinancialMetricItemKey = FinancialMetricItem['key'];
type FinancialRawMetricKey = keyof NonNullable<FinancialStatementSummary['rawMetrics']>;
type FinancialPriorityMetric = {
  label: string;
  value: string;
  note: string;
  comparison?: FinancialMetric['comparison'];
};
type FinancialComparisonPill = {
  label: string;
  value: string;
};
type FinancialComparisonBar = {
  label: string;
  value: string;
  width: number;
  direction: 'up' | 'down' | 'flat';
};
type FinancialInsightCard = {
  title: string;
  value: string;
  note: string;
  detail: string;
  status: 'ready' | 'pending';
  barPercent?: number;
  barLabel?: string;
  comparisonPills?: FinancialComparisonPill[];
  comparisonBars?: FinancialComparisonBar[];
};

function financialMetricByKey(summary: FinancialStatementSummary, key: FinancialMetricItemKey) {
  return summary.metrics.find((item) => item.key === key);
}

const rawMetricKeyByFinancialMetricKey: Partial<Record<FinancialMetricItemKey, FinancialRawMetricKey>> = {
  revenue: 'revenue',
  operatingIncome: 'operatingIncome',
  netIncome: 'netIncome',
  cashFlow: 'operatingCashFlow',
  debtRatio: 'debtToEquity',
  capitalExpenditures: 'capitalExpenditures',
  currentRatio: 'currentRatio',
  interestCoverage: 'interestCoverage',
  freeCashFlow: 'freeCashFlow',
  eps: 'eps',
  depreciationAndAmortization: 'depreciationAndAmortization',
};

function parseCompactFinancialValue(value?: string) {
  if (!value || isPendingFinancialValue(value)) return null;
  const text = String(value).trim();
  if (!text || /공식 데이터 연결 필요|확인 필요|원문|fallback/i.test(text)) return null;
  const match = text.replace(/,/g, '').match(/[-+]?\d+(?:\.\d+)?/);
  if (!match || match.index === undefined) return null;

  const numeric = Number(match[0]);
  if (!Number.isFinite(numeric)) return null;

  const compactText = text.replace(/,/g, '');
  const suffix = compactText.slice(match.index + match[0].length).trim().toUpperCase()[0] ?? '';
  let multiplier = 1;
  if (compactText.includes('조')) multiplier = 1_000_000_000_000;
  else if (compactText.includes('억')) multiplier = 100_000_000;
  else if (compactText.includes('만')) multiplier = 10_000;
  else if (suffix === 'T') multiplier = 1_000_000_000_000;
  else if (suffix === 'B') multiplier = 1_000_000_000;
  else if (suffix === 'M') multiplier = 1_000_000;
  else if (suffix === 'K') multiplier = 1_000;

  const sign = /\(|△/.test(text) ? -1 : 1;
  return Math.abs(numeric) * multiplier * (numeric < 0 ? -1 : sign);
}

function financialMetricNumericValue(summary: FinancialStatementSummary, key: FinancialMetricItemKey) {
  const metricItem = financialMetricByKey(summary, key);
  const rawKey = rawMetricKeyByFinancialMetricKey[key];
  const rawValue = rawKey ? summary.rawMetrics?.[rawKey] : undefined;
  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) return { metricItem, value: rawValue };
  const value = parseCompactFinancialValue(metricItem?.value);
  return value === null ? null : { metricItem, value };
}

function safePercent(numerator: number | null, denominator: number | null) {
  if (
    typeof numerator !== 'number' ||
    typeof denominator !== 'number' ||
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return null;
  }
  return (numerator / denominator) * 100;
}

function clampPercent(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function formatFinancialPercent(value: number) {
  if (!Number.isFinite(value)) return '확인 필요';
  if (Math.abs(value) >= 100) return `${value.toFixed(0)}%`;
  return `${value.toFixed(1)}%`;
}

function financialComparisonPills(metricItem: FinancialMetricItem | undefined, label: string) {
  const pills: FinancialComparisonPill[] = [];
  if (typeof metricItem?.comparison?.yoy === 'number' && Number.isFinite(metricItem.comparison.yoy)) {
    pills.push({ label: `${label} YoY`, value: comparisonPercentLabel(metricItem.comparison.yoy) });
  }
  if (typeof metricItem?.comparison?.qoq === 'number' && Number.isFinite(metricItem.comparison.qoq)) {
    pills.push({ label: `${label} QoQ`, value: comparisonPercentLabel(metricItem.comparison.qoq) });
  }
  return pills;
}

function preferredGrowthComparison(revenueMetric?: FinancialMetricItem, operatingIncomeMetric?: FinancialMetricItem) {
  const revenueYoy = revenueMetric?.comparison?.yoy;
  const operatingIncomeYoy = operatingIncomeMetric?.comparison?.yoy;
  if (typeof revenueYoy === 'number' && Number.isFinite(revenueYoy) && typeof operatingIncomeYoy === 'number' && Number.isFinite(operatingIncomeYoy)) {
    return { label: '작년 같은 기간', revenue: revenueYoy, operatingIncome: operatingIncomeYoy };
  }

  const revenueQoq = revenueMetric?.comparison?.qoq;
  const operatingIncomeQoq = operatingIncomeMetric?.comparison?.qoq;
  if (typeof revenueQoq === 'number' && Number.isFinite(revenueQoq) && typeof operatingIncomeQoq === 'number' && Number.isFinite(operatingIncomeQoq)) {
    return { label: '직전 분기', revenue: revenueQoq, operatingIncome: operatingIncomeQoq };
  }

  return null;
}

function comparisonDirection(value: number): FinancialComparisonBar['direction'] {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

function financialSourceBadgeItems(summary: FinancialStatementSummary, freshness: ReturnType<typeof financialFreshnessInfo>) {
  const isConnected = isConnectedFinancialSummary(summary);
  const currency = summary.metrics
    .map((metricItem) => metricItem.unit)
    .find((unit) => unit && !/share|x/i.test(unit) && !/원문 단위/i.test(unit));
  const reportBadge = isConnected ? [summary.fiscalYear, summary.fiscalPeriod, summary.reportType].filter(Boolean).join(' ') : freshness.reportName;
  const items = [
    isConnected ? summary.sourceLabel : freshness.sourceLabel,
    reportBadge,
    isConnected && summary.filingDate ? `${summary.filingDate} 확인` : freshness.filingDate,
    isConnected ? currency : '',
  ];

  return Array.from(new Set(items.filter((item) => item && !/확인 필요|fallback/i.test(String(item))).map(String)));
}

function buildFinancialInsightCards(company: Company, summary: FinancialStatementSummary): FinancialInsightCard[] {
  const canCalculate = shouldDisplayConnectedFinancials(company, summary);
  const revenue = canCalculate ? financialMetricNumericValue(summary, 'revenue') : null;
  const operatingIncome = canCalculate ? financialMetricNumericValue(summary, 'operatingIncome') : null;
  const operatingCashFlow = canCalculate ? financialMetricNumericValue(summary, 'cashFlow') : null;
  const operatingMargin = safePercent(operatingIncome?.value ?? null, revenue?.value ?? null);
  const cashConversion = safePercent(operatingCashFlow?.value ?? null, operatingIncome?.value ?? null);
  const growthComparison = canCalculate ? preferredGrowthComparison(revenue?.metricItem, operatingIncome?.metricItem) : null;
  const maxGrowth = growthComparison ? Math.max(Math.abs(growthComparison.revenue), Math.abs(growthComparison.operatingIncome), 1) : 1;

  return [
    {
      title: '팔아서 얼마나 남겼나요?',
      value: operatingMargin === null ? '공식 데이터 연결 필요' : `영업이익률 ${formatFinancialPercent(operatingMargin)}`,
      note: operatingMargin === null ? '매출과 영업이익을 함께 확인할 수 있을 때 계산합니다.' : '매출 중 영업이익으로 남은 비율입니다.',
      detail: operatingMargin === null ? '값 확인 전, 지표 의미만 표시합니다.' : '수익성은 매출 규모보다 먼저 확인할 흐름입니다.',
      status: operatingMargin === null ? 'pending' : 'ready',
      barPercent: operatingMargin === null ? undefined : clampPercent(operatingMargin),
      barLabel: operatingMargin === null ? undefined : `매출 대비 영업이익률 ${formatFinancialPercent(operatingMargin)}`,
      comparisonPills: operatingMargin === null ? [] : financialComparisonPills(operatingIncome?.metricItem, '영업이익').slice(0, 1),
    },
    {
      title: '이익이 현금으로 이어졌나요?',
      value: cashConversion === null ? '공식 데이터 연결 필요' : `현금흐름 ${formatFinancialPercent(cashConversion)}`,
      note: cashConversion === null ? '영업이익이 0 이하이거나 현금흐름 값이 없으면 계산하지 않습니다.' : '영업이익과 실제 들어온 현금을 비교합니다.',
      detail: cashConversion === null ? '차트 대신 원문 숫자 연결 상태를 먼저 확인합니다.' : `현금흐름이 영업이익의 ${formatFinancialPercent(cashConversion)} 수준입니다.`,
      status: cashConversion === null ? 'pending' : 'ready',
      barPercent: cashConversion === null ? undefined : clampPercent(cashConversion),
      barLabel: cashConversion === null ? undefined : `영업이익 대비 현금흐름 ${formatFinancialPercent(cashConversion)}`,
      comparisonPills: cashConversion === null ? [] : financialComparisonPills(operatingCashFlow?.metricItem, '현금흐름').slice(0, 1),
    },
    {
      title: '성장이 이익으로 연결됐나요?',
      value: growthComparison ? `${growthComparison.label} 변화` : '비교 데이터 연결 필요',
      note: growthComparison ? '매출 변화와 영업이익 변화를 같은 기준으로 나란히 봅니다.' : '매출과 이익의 변화율을 함께 볼 수 있을 때 더 정확히 판단할 수 있습니다.',
      detail: growthComparison ? `매출 ${comparisonPercentLabel(growthComparison.revenue)} · 영업이익 ${comparisonPercentLabel(growthComparison.operatingIncome)}` : '현재 화면에서는 가능한 comparison만 표시합니다.',
      status: growthComparison ? 'ready' : 'pending',
      comparisonBars: growthComparison
        ? [
            {
              label: '매출',
              value: comparisonPercentLabel(growthComparison.revenue),
              width: clampPercent((Math.abs(growthComparison.revenue) / maxGrowth) * 100),
              direction: comparisonDirection(growthComparison.revenue),
            },
            {
              label: '영업이익',
              value: comparisonPercentLabel(growthComparison.operatingIncome),
              width: clampPercent((Math.abs(growthComparison.operatingIncome) / maxGrowth) * 100),
              direction: comparisonDirection(growthComparison.operatingIncome),
            },
          ]
        : [],
    },
  ];
}

function priorityMetricKeys(label: string, index: number): FinancialMetricItemKey[] {
  if (/CAPEX|가동률/.test(label)) return ['capitalExpenditures', 'cashFlow', 'revenue'];
  if (/현금흐름|재고|R&D/.test(label)) return ['cashFlow', 'freeCashFlow', 'operatingIncome'];
  if (/영업이익|영업이익률|영업마진|마진|수익성/.test(label)) return ['operatingIncome', 'netIncome'];
  if (/순이익/.test(label)) return ['netIncome', 'operatingIncome'];
  if (/부채/.test(label)) return ['debtRatio', 'currentRatio'];
  if (/유동/.test(label)) return ['currentRatio', 'cashFlow'];
  if (/이자/.test(label)) return ['interestCoverage', 'operatingIncome'];
  if (/매출|수요|HBM|메모리|데이터센터|수주잔고/.test(label)) return ['revenue', 'operatingIncome', 'cashFlow'];
  return ([
    ['revenue', 'operatingIncome', 'cashFlow'],
    ['operatingIncome', 'revenue', 'netIncome'],
    ['cashFlow', 'freeCashFlow', 'revenue'],
  ] as FinancialMetricItemKey[][])[index] ?? ['revenue'];
}

function connectedPriorityMetric(
  metricByKey: Map<FinancialMetricItemKey, FinancialMetricItem>,
  keys: FinancialMetricItemKey[],
  usedKeys?: Set<FinancialMetricItemKey>,
) {
  for (const key of keys) {
    if (usedKeys?.has(key)) continue;
    const metricItem = metricByKey.get(key);
    if (usableFinancialMetricValue(metricItem)) return metricItem;
  }
  return undefined;
}

function connectedPriorityLabel(label: string, metricItem: FinancialMetricItem, summary: FinancialStatementSummary) {
  if (isSec20FFinancialSummary(summary)) return metricItem.label;
  if (metricItem.key === 'operatingIncome' && /영업이익률|영업마진|마진|수익성/.test(label)) return '영업이익';
  return label;
}

function connectedPriorityNote(summary: FinancialStatementSummary, metricItem: FinancialMetricItem) {
  if (metricItem.key === 'revenue') return '매출로 수요가 실적에 반영되는지 봅니다.';
  if (metricItem.key === 'operatingIncome') return '팔고 남긴 이익이 얼마나 커졌는지 봅니다.';
  if (metricItem.key === 'netIncome') return '최종 이익이 함께 개선되는지 봅니다.';
  if (metricItem.key === 'cashFlow' || metricItem.key === 'freeCashFlow') return '현금 회수가 실제로 좋아지는지 봅니다.';
  if (metricItem.key === 'capitalExpenditures') return '투자가 생산능력과 부담으로 이어지는지 봅니다.';
  return summary.source === 'OpenDART' ? '공시 숫자가 해설과 같은 방향인지 확인합니다.' : '공식 숫자가 해설과 같은 방향인지 확인합니다.';
}

function connectFinancialPriorityMetrics(
  company: Company,
  summary: FinancialStatementSummary,
  metrics: FinancialPriorityMetric[],
) {
  if (!shouldDisplayConnectedFinancials(company, summary)) return metrics;

  const metricByKey = new Map(summary.metrics.map((metricItem) => [metricItem.key, metricItem]));
  const usedKeys = isSec20FFinancialSummary(summary) ? new Set<FinancialMetricItemKey>() : undefined;
  const sec20FKeys: FinancialMetricItemKey[][] = [
    ['revenue'],
    ['operatingIncome'],
    ['cashFlow'],
  ];
  return metrics.map((item, index) => {
    const candidateKeys = isSec20FFinancialSummary(summary) ? sec20FKeys[index] ?? priorityMetricKeys(item.label, index) : priorityMetricKeys(item.label, index);
    const financialMetric = connectedPriorityMetric(metricByKey, candidateKeys, usedKeys);
    const value = usableFinancialMetricValue(financialMetric);
    if (!value || !financialMetric) return item;
    usedKeys?.add(financialMetric.key);

    return {
      ...item,
      label: connectedPriorityLabel(item.label, financialMetric, summary),
      value,
      note: connectedPriorityNote(summary, financialMetric),
      comparison: financialMetric.comparison,
    };
  });
}

function connectedMetricValue(
  summary: FinancialStatementSummary,
  key: FinancialStatementSummary['metrics'][number]['key'],
  fallback = '공식 데이터 연결 필요',
) {
  if (!isConnectedFinancialSummary(summary)) return fallback;
  const metricItem = summary.metrics.find((item) => item.key === key);
  return usableFinancialMetricValue(metricItem) ?? fallback;
}

function beginnerSignalSet(company: Company) {
  const stage = companyValueChainStage(company);
  if (stage.includes('메모리') || stage.includes('HBM')) {
    return {
      good: ['HBM 수요와 고객 인증 확대', '영업이익률 유지', '재고 회전과 현금흐름 개선'],
      caution: ['재고 증가', '매출채권 회수 지연', '메모리 가격 둔화'],
    };
  }
  if (stage.includes('AI 칩') || stage.includes('GPU') || company.id === 'us-semiconductors-nvidia') {
    return {
      good: ['데이터센터 매출 성장 지속', '높은 영업이익률 유지', '현금흐름과 생태계 투자 확대'],
      caution: ['고객 투자 둔화', 'ASIC·AMD와 경쟁 심화', '규제나 제품 전환에 따른 재고 부담'],
    };
  }
  if (stage.includes('파운드리') || stage.includes('제조')) {
    return {
      good: ['첨단 공정 수요 증가', '가동률 개선', 'CAPEX가 매출 성장으로 연결'],
      caution: ['가동률 하락', '대규모 투자 부담', '고객 주문 변동성'],
    };
  }
  if (stage.includes('장비') || stage.includes('소재') || stage.includes('후공정') || stage.includes('테스트')) {
    return {
      good: ['수주잔고 증가', '고객 인증 확대', '설비투자가 매출로 전환'],
      caution: ['고객 투자 지연', '특정 고객 의존도 확대', '수주가 매출로 늦게 반영'],
    };
  }
  return {
    good: ['관련 수요가 매출로 연결', '마진 유지', '현금흐름 개선'],
    caution: ['수요 둔화', '비용 증가', '매출은 늘었지만 현금흐름 약화'],
  };
}

function buildMetricBranchGroups({
  company,
  displayMetrics,
  quickMetrics,
  financialSummary,
}: {
  company: Company;
  displayMetrics: CompanyDisplayMetrics;
  quickMetrics: Array<{ label: string; value: string; note: string }>;
  financialSummary: FinancialStatementSummary;
}) {
  const revenueValue = quickMetrics.find((metric) => metric.label === '매출')?.value ?? displayMetrics.revenue;
  const cashFlowValue = quickMetrics.find((metric) => metric.label === '현금흐름')?.value ?? '원문 확인';
  const debtRatioValue = connectedMetricValue(financialSummary, 'debtRatio', displayMetrics.debtRatio);
  const currentRatioValue = connectedMetricValue(financialSummary, 'currentRatio');
  const interestCoverageValue = connectedMetricValue(financialSummary, 'interestCoverage');
  const freeCashFlowValue = connectedMetricValue(financialSummary, 'freeCashFlow');
  const epsValue = connectedMetricValue(financialSummary, 'eps');
  const depreciationAndAmortizationValue = connectedMetricValue(financialSummary, 'depreciationAndAmortization');
  const stage = companyValueChainStage(company);
  const industryMetric =
    stage.includes('메모리') || stage.includes('HBM')
      ? 'HBM 수요 / 재고자산'
      : stage.includes('장비') || stage.includes('소재') || stage.includes('후공정')
        ? '수주잔고'
        : stage.includes('파운드리') || stage.includes('제조')
          ? 'CAPEX / 가동률'
          : stage.includes('전력') || stage.includes('냉각') || stage.includes('서버')
            ? '데이터센터 수주 / CAPEX'
            : '산업별 핵심 지표';

  return [
    {
      title: '수익성',
      summary: '본업에서 돈을 얼마나 남기는지 봅니다.',
      items: [
        {
          name: '영업이익률',
          value: displayMetrics.opMargin,
          benchmark: '산업 평균 데이터 연결 필요',
          interpretation: '본업 수익성이 유지되는지 보는 첫 지표입니다.',
          why: '매출이 늘어도 비용이 더 빨리 늘면 주주에게 남는 이익은 줄 수 있습니다.',
          caution: '일회성 이익이나 업황 정점에서는 평소보다 좋아 보일 수 있습니다.',
        },
        {
          name: '순이익률',
          value: quickMetrics.find((metric) => metric.label === '순이익')?.value ?? '원문 확인',
          benchmark: '경쟁사 비교 데이터 연결 필요',
          interpretation: '세금과 비용까지 반영한 최종 이익률입니다.',
          why: '영업 외 손익, 세금, 금융비용까지 반영된 실제 이익 체력을 봅니다.',
          caution: '일회성 매각이익이나 환율 효과가 섞였는지 확인해야 합니다.',
        },
        {
          name: 'ROE',
          value: '계산 보류',
          benchmark: '평균자본 기준 정교화 필요',
          interpretation: '자기자본으로 얼마나 효율적으로 이익을 냈는지 봅니다.',
          why: '자본을 얼마나 잘 굴리는지 보여주지만 산업마다 적정 수준이 다릅니다.',
          caution: '단순 기말 자본으로 계산하면 오해가 생길 수 있어 평균자본 기준 연결 전까지 보류합니다.',
        },
      ],
    },
    {
      title: '성장성',
      summary: '뉴스와 수요가 실제 매출 성장으로 이어졌는지 봅니다.',
      items: [
        {
          name: '매출 성장률',
          value: displayMetrics.growth,
          benchmark: '전년 대비 기준',
          interpretation: '회사가 얼마나 더 많이 팔았는지 보는 지표입니다.',
          why: '성장 산업에서는 매출 증가가 먼저 나타나고 이익은 나중에 따라올 수 있습니다.',
          caution: '매출채권이 같이 늘면 아직 현금으로 못 받은 매출일 수 있습니다.',
        },
        {
          name: 'EPS 성장률',
          value: '계산 보류',
          benchmark: '기간 비교 정합성 필요',
          interpretation: '주당순이익이 늘었는지 확인합니다.',
          why: '전체 이익보다 주식 한 주당 이익이 늘었는지가 주주에게 중요합니다.',
          caution: '분기·연간 기준이 섞이면 잘못 보일 수 있어 기간 비교 로직 연결 전까지 계산하지 않습니다.',
        },
        {
          name: 'CAPEX 증가율',
          value: '원문 확인',
          benchmark: '원문 현금흐름표 기준',
          interpretation: '미래 생산능력을 위해 투자하는 돈의 흐름입니다.',
          why: '단기 현금 유출이지만 수요가 따라오면 미래 매출 기반이 될 수 있습니다.',
          caution: '수요가 확인되지 않은 CAPEX는 감가상각 부담으로 돌아올 수 있습니다.',
        },
      ],
    },
    {
      title: '안정성',
      summary: '빚 부담과 버틸 수 있는 체력을 확인합니다.',
      items: [
        {
          name: '부채비율',
          value: debtRatioValue,
          benchmark: '산업 평균 데이터 연결 필요',
          interpretation: '자본 대비 빚 부담이 얼마나 큰지 봅니다.',
          why: '업황이 꺾일 때 빚 부담이 큰 회사는 선택지가 줄어들 수 있습니다.',
          caution: '금융업은 일반 제조업과 부채 구조가 달라 같은 기준으로 보면 안 됩니다.',
        },
        {
          name: '유동비율',
          value: currentRatioValue,
          benchmark: '원문 재무상태표 기준',
          interpretation: '단기적으로 갚아야 할 돈을 감당할 수 있는지 봅니다.',
          why: '현금과 단기자산이 충분해야 투자와 운영을 이어갈 수 있습니다.',
          caution: '재고가 많아 유동비율이 좋아 보여도 실제 현금화가 늦을 수 있습니다.',
        },
        {
          name: '이자보상배율',
          value: interestCoverageValue,
          benchmark: '경쟁사 비교 데이터 연결 필요',
          interpretation: '영업이익으로 이자를 얼마나 감당할 수 있는지 봅니다.',
          why: '금리가 높거나 차입금이 많을 때 중요한 안정성 지표입니다.',
          caution: '일시적으로 영업이익이 줄면 급격히 나빠질 수 있습니다.',
        },
      ],
    },
    {
      title: '현금흐름',
      summary: '장부상 이익이 실제 현금으로 들어오는지 봅니다.',
      items: [
        {
          name: '영업활동현금흐름',
          value: cashFlowValue,
          benchmark: '순이익과 비교',
          interpretation: '본업에서 실제 현금이 들어오는지 보는 지표입니다.',
          why: '이익이 좋아 보여도 현금이 안 들어오면 지속성이 약할 수 있습니다.',
          caution: '매출채권과 재고 증가가 현금흐름을 눌렀는지 확인해야 합니다.',
        },
        {
          name: 'FCF',
          value: freeCashFlowValue,
          benchmark: '영업현금흐름 - CAPEX',
          interpretation: '투자와 운영을 하고도 남는 현금입니다.',
          why: '배당, 자사주, 부채 상환, 재투자 여력을 보여줍니다.',
          caution: '성장기 CAPEX가 큰 산업은 단기 FCF가 낮아도 무조건 나쁜 것은 아닙니다.',
        },
        {
          name: '감가상각비',
          value: depreciationAndAmortizationValue,
          benchmark: '원문 주석 기준',
          interpretation: '과거 설비투자가 비용으로 나뉘어 반영되는 금액입니다.',
          why: '대규모 투자 산업에서는 미래 이익률과 세금 효과에 영향을 줍니다.',
          caution: '현금 유출은 아니지만 이익률을 낮춰 보이게 할 수 있습니다.',
        },
      ],
    },
    {
      title: '밸류에이션',
      summary: '주가가 이익과 자산 대비 어느 정도 평가받는지 봅니다.',
      items: [
        {
          name: 'PER',
          value: '가격 데이터 연결 필요',
          benchmark: '시가총액 / 이익 데이터 필요',
          interpretation: '이익 대비 주가가 비싼지 보는 지표입니다.',
          why: '같은 이익을 내는 회사라도 성장 기대가 다르면 PER이 달라집니다.',
          caution: '가격과 시가총액 데이터가 필요하므로 이번 단계에서는 계산하지 않습니다.',
        },
        {
          name: 'EPS',
          value: epsValue,
          benchmark: '전년 대비 / 경쟁사 비교 필요',
          interpretation: '회사 이익을 주식 한 주당으로 나눈 값입니다.',
          why: '주주 입장에서 한 주당 이익이 늘어나는지 확인합니다.',
          caution: '일회성 이익이 포함되었는지, 주식 수가 줄었는지도 봐야 합니다.',
        },
        {
          name: 'PBR',
          value: '가격 데이터 연결 필요',
          benchmark: '시가총액 / 순자산 데이터 필요',
          interpretation: '자산가치 대비 주가 수준을 보는 지표입니다.',
          why: '금융주나 자산 많은 기업은 PER보다 PBR과 ROE를 같이 보는 경우가 많습니다.',
          caution: '가격과 시가총액 데이터가 필요하므로 이번 단계에서는 계산하지 않습니다.',
        },
      ],
    },
    {
      title: '산업별 핵심 지표',
      summary: '이 회사가 속한 산업에서 특히 먼저 봐야 하는 지표입니다.',
      items: [
        {
          name: industryMetric,
          value: revenueValue,
          benchmark: '출처 있는 산업 데이터 연결 필요',
          interpretation: `${companyValueChainStage(company)} 기업은 같은 지표라도 산업 맥락과 함께 봐야 합니다.`,
          why: '산업마다 돈을 버는 구조가 달라서 먼저 볼 지표도 달라집니다.',
          caution: '출처 없는 산업 평균이나 고객 비중 숫자는 표시하지 않습니다.',
        },
      ],
    },
  ];
}

function dependencySummary(company: Company, currentLinks: typeof links) {
  if (company.tier === 'anchor') {
    return {
      level: '중심 기업',
      className: 'anchor',
      copy: '이 기업은 관계 지도를 볼 때 기준점이 되는 상장기업입니다. 가격, 공시, 재무제표를 함께 연결합니다.',
    };
  }

  const incoming = currentLinks.find((link) => link.target === company.id);
  if (company.sourceType !== 'official') {
    return {
      level: '확인 필요',
      className: 'unknown',
      copy: '고객별 매출 비중은 공식 공시·IR에서 확인되기 전까지 숫자로 단정하지 않습니다.',
      value: undefined,
    };
  }
  const dependency = incoming?.dependency;
  const level = dependency === undefined ? '확인 필요' : dependency >= 60 ? '높음' : dependency >= 40 ? '중간' : '낮음';
  const className = dependency === undefined ? 'unknown' : dependency >= 60 ? 'high' : dependency >= 40 ? 'medium' : 'low';
  const copy =
    dependency === undefined
      ? '아직 특정 고객 의존도 수치가 없습니다. 공시·IR·뉴스 원문으로 고객 비중을 확인해야 합니다.'
      : dependency >= 60
        ? '특정 대형 고객사의 수요 변화에 영향을 크게 받을 수 있습니다. 동시에 중심 기업 성장의 수혜 가능성도 함께 봅니다.'
        : dependency >= 40
          ? '대형 고객사와 연결되어 있지만 고객 다변화 여부도 함께 봐야 합니다.'
          : '특정 고객 의존도가 낮은 편으로 표시되지만, 실제 고객 비중은 원문에서 다시 확인해야 합니다.';
  return {
    level,
    className,
    copy,
    value: dependency === undefined ? '수치 확인 필요' : `${dependency}%`,
  };
}

function classifyAnalystOpinion(opinions: typeof analystOpinions) {
  const verified = opinions.filter((opinion) => opinion.sourceType !== 'seed-model');
  if (!verified.length) {
    return {
      label: '의견 데이터 없음',
      ratio: '실제 애널리스트 Buy/Hold/Sell 자료가 아직 연결되지 않았습니다.',
      className: 'none',
      sourceCount: 0,
      riskNotes: opinions,
    };
  }

  const counts = { buy: 0, hold: 0, sell: 0 };
  verified.forEach((opinion) => {
    const stance = `${opinion.stance} ${opinion.summary}`.toLowerCase();
    if (stance.includes('sell') || stance.includes('매도') || stance.includes('risk') || stance.includes('리스크')) counts.sell += 1;
    else if (stance.includes('buy') || stance.includes('매수') || stance.includes('positive') || stance.includes('수혜')) counts.buy += 1;
    else counts.hold += 1;
  });
  const total = verified.length || 1;
  const buyRatio = (counts.buy / total) * 100;
  const sellRatio = (counts.sell / total) * 100;
  if (buyRatio >= 80) return { label: 'Strong Buy', ratio: `Buy 비중 ${buyRatio.toFixed(0)}%`, className: 'buy', sourceCount: verified.length, riskNotes: opinions };
  if (sellRatio >= 80) return { label: 'Strong Sell', ratio: `Sell 비중 ${sellRatio.toFixed(0)}%`, className: 'sell', sourceCount: verified.length, riskNotes: opinions };
  if (counts.buy > counts.sell && counts.buy >= counts.hold) return { label: 'Buy', ratio: `Buy 비중 ${buyRatio.toFixed(0)}%`, className: 'buy', sourceCount: verified.length, riskNotes: opinions };
  if (counts.sell > counts.buy && counts.sell >= counts.hold) return { label: 'Sell', ratio: `Sell 비중 ${sellRatio.toFixed(0)}%`, className: 'sell', sourceCount: verified.length, riskNotes: opinions };
  return { label: 'Neutral', ratio: '의견이 엇갈림', className: 'hold', sourceCount: verified.length, riskNotes: opinions };
}

function reportMetaItems(company: Company) {
  return [
    { label: '보고서 종류', value: company.reportType ?? '보고서 종류 확인 필요' },
    { label: '회계연도', value: company.fiscalYear ?? '회계연도 확인 필요' },
    { label: '회계기간', value: company.fiscalPeriod ?? '회계기간 확인 필요' },
    { label: '제출일', value: company.filingDate ?? '제출일 확인 필요' },
  ];
}

function dataFreshnessInfo(company: Company, reportLink: ReportLink) {
  const reportName = [company.fiscalYear, company.fiscalPeriod, company.reportType].filter(Boolean).join(' ') || '기준 보고서 확인 필요';
  const filingDate = company.filingDate ?? '공시일 확인 필요';
  const status =
    reportLink.status === 'direct'
      ? '최신 확인됨'
      : reportLink.status === 'search-only'
        ? '직전 보고서 기준'
        : reportLink.status === 'private-company'
          ? '공개 재무정보 제한'
          : reportLink.status === 'no-public-filing'
            ? '공개 보고서 확인 불가'
            : reportLink.status === 'listing-unknown'
              ? '상장 정보 확인 필요'
              : '원문 연결 필요';
  return { reportName, filingDate, status };
}

function financialFreshnessInfo(
  company: Company,
  reportLink: ReportLink,
  summary: FinancialStatementSummary,
  fallback: ReturnType<typeof dataFreshnessInfo>,
  fallbackSourceLabel: string,
) {
  if (!shouldDisplayConnectedFinancials(company, summary)) {
    return {
      ...fallback,
      sourceLabel: fallbackSourceLabel,
      sourceClass: reportLinkClass(reportLink),
    };
  }

  const reportName = [summary.fiscalYear, summary.fiscalPeriod, summary.reportType].filter(Boolean).join(' ') || fallback.reportName;
  const isSec20F = summary.source === 'SEC CompanyFacts' && /20-F/i.test(summary.reportType);
  const sourceLabel =
    summary.source === 'OpenDART'
      ? summary.sourceStatus === 'partial'
        ? 'OpenDART 일부 원문 연결됨'
        : 'OpenDART 원문 연결됨'
      : isSec20F
        ? summary.sourceStatus === 'partial'
          ? 'SEC 20-F 일부 원문 연결됨'
          : 'SEC 20-F 원문 연결됨'
      : summary.sourceStatus === 'partial'
        ? 'SEC 일부 연결됨'
        : 'SEC 원문 연결됨';
  return {
    reportName,
    filingDate: summary.filingDate ?? fallback.filingDate,
    status: summary.source === 'OpenDART' ? '공시 기준 수치입니다.' : sourceLabel,
    sourceLabel,
    sourceClass: 'direct',
  };
}

function newsKeywords(company: Company) {
  return [company.sector, ...company.tags.slice(0, 2)].filter(Boolean).slice(0, 3);
}

type CompanyDisplayMetrics = {
  revenue: string;
  revenueUnit: string;
  revenueBasis: string;
  growth: string;
  growthBasis: string;
  opMargin: string;
  debtRatio: string;
};

type FilingInsight = {
  title: string;
  kicker: string;
  body: string;
  point: string;
};

type FilingAnalysis = {
  reportTitle: string;
  reportDate: string;
  sourceLabel: string;
  sourceUrl: string;
  displayMetrics: CompanyDisplayMetrics;
  headline: string;
  verdict: string;
  insights: FilingInsight[];
  watchPoints: string[];
  auditNotes: string[];
};

type CompanyDisclosureAnalysis = FilingAnalysis & {
  isCurated: boolean;
  statusLabel: string;
  statusDetail: string;
};

const filingAnalyses: Record<string, FilingAnalysis> = {
  'kr-semiconductors-samsung-한미반도체': {
    reportTitle: '한미반도체 2026년 1분기 분기보고서',
    reportDate: '2026.05.15 공시 · 2026.03 연결 기준',
    sourceLabel: 'DART 분기보고서 원문',
    sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001572',
    displayMetrics: {
      revenue: '50,902',
      revenueUnit: '단위: 백만원 · 2026년 1분기 연결 매출액',
      revenueBasis: 'DART 분기보고서(2026.03) 연결 손익계산서 기준. 전년 동기 비교는 2025년 1분기 연결 금액과 비교했습니다.',
      growth: '-65.5%',
      growthBasis: '2026년 1분기 매출 50,902백만원 vs 2025년 1분기 147,392백만원',
      opMargin: '16.6%',
      debtRatio: '16.8%',
    },
    headline:
      '매출과 영업이익은 전년 동기보다 크게 줄었지만, 더 중요한 신호는 이익이 아니라 현금흐름입니다.',
    verdict:
      '순이익은 190억원이었지만 영업현금흐름은 -384억원입니다. 재고와 매출채권이 늘고 법인세가 크게 나가면서, 장부상 이익이 현금으로 바로 쌓이지 않은 분기였습니다.',
    insights: [
      {
        title: '손익계산서',
        kicker: '매출 509억원 · 영업이익 85억원',
        body:
          '2026년 1분기 연결 매출은 509억원으로 전년 동기 1,474억원보다 65.5% 줄었습니다. 영업이익은 85억원으로 87.9% 감소했고, 영업이익률은 16.6%입니다.',
        point:
          '반도체 후공정 장비 회사는 장비 인도와 고객 검수 시점에 매출이 몰릴 수 있습니다. 그래서 한 분기만 보고 수요가 사라졌다고 단정하기보다 다음 분기의 수주, 검수, 매출채권 회수를 같이 봐야 합니다.',
      },
      {
        title: '현금흐름표',
        kicker: '영업현금흐름 -384억원',
        body:
          '순이익 190억원을 냈는데도 영업활동현금흐름은 -384억원입니다. 매출채권 증가가 약 97억원, 재고 증가가 약 237억원의 현금 부담으로 잡혔고 법인세 납부도 약 224억원 있었습니다.',
        point:
          '이 말은 “적자는 아닌데 돈이 아직 들어오지 않았거나 재고로 묶였다”는 쪽에 가깝습니다. 다음 분기에 재고가 출하되고 매출채권이 회수되면 현금흐름은 빠르게 좋아질 수 있습니다.',
      },
      {
        title: '투자활동',
        kicker: '투자현금흐름 +62억원',
        body:
          '투자활동현금흐름이 플러스인 이유는 설비투자를 크게 줄여서만이 아니라 금융자산 처분으로 약 119억원이 들어왔기 때문입니다. 유형자산 취득은 약 54억원으로 전년 동기 254억원보다 작았습니다.',
        point:
          '공격적인 증설보다 현금 방어와 투자 속도 조절에 가까운 분기입니다. 이후 HBM·TC 본더 수주가 실제 검수 매출로 바뀌는지가 더 중요합니다.',
      },
      {
        title: '재무상태표',
        kicker: '현금 1,747억원 · 부채비율 16.8%',
        body:
          '분기 말 현금성자산은 1,747억원이고 부채총계는 1,068억원, 자본은 6,359억원입니다. 부채비율은 약 16.8%로 매우 낮아 재무 안정성은 강한 편입니다.',
        point:
          '다만 현금이 2025년 말 2,762억원에서 3개월 만에 1,747억원으로 줄었습니다. 대규모 배당과 운전자본 부담이 겹쳤기 때문에 현금 잔고 회복 여부를 확인해야 합니다.',
      },
    ],
    watchPoints: [
      '재고 1,730억원이 다음 분기 매출로 풀리는지 확인합니다. 재고가 계속 늘면 수요 둔화나 검수 지연 신호일 수 있습니다.',
      '매출채권 754억원이 실제 현금으로 회수되는지 봅니다. 이 숫자가 줄면 이번 분기의 약한 영업현금흐름은 일시적일 가능성이 커집니다.',
      '재무활동현금흐름 -763억원 대부분은 배당 -759억원입니다. 주주환원은 강하지만 영업현금흐름이 약한 분기에는 현금 감소 압력이 됩니다.',
      '유형자산 취득은 54억원으로 전년 동기보다 작았습니다. 다시 설비투자가 늘면 미래 성장 준비로 볼 수 있지만, 감가상각비 증가와 현금 유출도 같이 반영됩니다.',
    ],
    auditNotes: [
      '2025년 사업보고서 기준 감사의견은 적정의견이고, 계속기업 불확실성·강조사항은 없었습니다.',
      '핵심감사사항은 “장비제조판매 수익 기간귀속”입니다. 장비 회사는 인도와 검수 시점에 따라 매출 인식 분기가 달라질 수 있어서 감사인이 이 부분을 중점 확인했다는 뜻입니다.',
      '이 자체가 회계 문제라는 의미는 아닙니다. 투자자는 수주 뉴스만 보지 말고 실제 매출채권 회수, 재고 감소, 고객 검수 완료가 이어지는지 확인해야 합니다.',
    ],
  },
  'kr-semiconductors-samsung': {
    reportTitle: '삼성전자 2026년 1분기 분기보고서',
    reportDate: '2026.05.15 공시 · 2026.03 연결 기준',
    sourceLabel: 'DART 분기보고서 원문',
    sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002181',
    displayMetrics: {
      revenue: '133,873,444',
      revenueUnit: '단위: 백만원 · 2026년 1분기 연결 매출액',
      revenueBasis: 'DART 분기보고서(2026.03) 연결 손익계산서 기준. 전년 동기 비교는 2025년 1분기 연결 금액과 비교했습니다.',
      growth: '+69.2%',
      growthBasis: '2026년 1분기 매출 133,873,444백만원 vs 2025년 1분기 79,140,503백만원',
      opMargin: '42.8%',
      debtRatio: '30.1%',
    },
    headline: '삼성전자는 매출과 영업이익이 동시에 크게 회복됐지만, 재고와 매출채권 증가가 현금흐름의 핵심 변수입니다.',
    verdict:
      '연결 매출은 133.9조원, 영업이익은 57.2조원입니다. 영업현금흐름도 40.3조원으로 강하지만, 영업활동 자산부채 변동이 -32.0조원이라 반도체 회복이 재고와 매출채권을 크게 동반한 분기였습니다.',
    insights: [
      {
        title: '손익계산서',
        kicker: '매출 133.9조원 · 영업이익 57.2조원',
        body:
          '2026년 1분기 연결 매출은 전년 동기보다 69.2% 증가했습니다. 영업이익률은 42.8%로, 메모리 가격 회복과 고부가 제품 믹스가 이익에 크게 반영된 모습입니다.',
        point:
          '매출 회복 자체는 매우 강하지만, 메모리 업황은 가격과 출하 시점에 민감합니다. 다음 분기에도 HBM·서버 메모리 수요가 영업이익률을 유지하는지 확인해야 합니다.',
      },
      {
        title: '현금흐름표',
        kicker: '영업현금흐름 40.3조원',
        body:
          '영업현금흐름은 40.3조원으로 전년 동기 16.6조원보다 좋아졌습니다. 다만 영업활동 자산부채 변동은 -32.0조원으로, 매출 회복 과정에서 재고와 매출채권이 크게 늘었습니다.',
        point:
          '이익이 현금으로도 들어오고 있지만 운전자본이 같이 커졌습니다. 재고가 실제 출하로 이어지고 매출채권 회수가 안정적으로 진행되면 업황 회복의 질이 더 좋아집니다.',
      },
      {
        title: '투자활동',
        kicker: '투자현금흐름 -21.5조원',
        body:
          '투자활동현금흐름은 -21.5조원이고 유형자산 취득은 17.1조원입니다. 메모리, 파운드리, 첨단 패키징 투자가 현금 유출로 먼저 반영되는 구조입니다.',
        point:
          '대규모 설비투자는 단기 현금을 줄이지만 다음 사이클 생산능력과 기술 우위의 기반입니다. 이후 감가상각비 증가가 이익률을 얼마나 누르는지도 함께 봐야 합니다.',
      },
      {
        title: '재무상태표',
        kicker: '현금 73.3조원 · 부채비율 30.1%',
        body:
          '분기 말 현금성자산은 73.3조원, 부채총계는 146.7조원, 자본총계는 486.6조원입니다. 부채비율은 30.1%로 재무 안정성은 강합니다.',
        point:
          '매출채권은 82.3조원, 재고는 58.3조원입니다. 업황 회복 국면에서는 이 숫자가 커질 수 있지만, 판매 속도가 꺾이면 현금 회수가 늦어질 수 있습니다.',
      },
    ],
    watchPoints: [
      '메모리와 HBM 수요가 매출뿐 아니라 영업이익률 40%대 유지로 이어지는지 확인합니다.',
      '재고 58.3조원과 매출채권 82.3조원이 다음 분기에 줄거나 매출로 전환되는지가 현금흐름의 핵심입니다.',
      '유형자산 취득 17.1조원은 미래 생산능력 투자입니다. 이후 감가상각비와 가동률이 함께 올라가는지 봐야 합니다.',
      '자기주식 취득 7.6조원과 대규모 투자 집행이 동시에 있어, 주주환원과 성장투자 균형을 계속 확인합니다.',
    ],
    auditNotes: [
      '제58기 1분기는 삼정회계법인의 검토 대상이며, 중요성 관점에서 공정하게 표시하지 않은 사항이 발견되지 않았다고 공시했습니다.',
      '제57기 감사의견은 적정의견이고 계속기업 관련 중요한 불확실성은 해당사항 없음으로 공시됐습니다.',
      '대형 반도체 기업은 재고 평가, 매출 인식, 설비투자와 감가상각이 핵심입니다. 특히 업황 회복기에는 재고가 이익으로 바뀌는 속도를 확인해야 합니다.',
    ],
  },
  'kr-semiconductors-sk-hynix': {
    reportTitle: 'SK하이닉스 2026년 1분기 분기보고서',
    reportDate: '2026.05.15 공시 · 2026.03 연결 기준',
    sourceLabel: 'DART 분기보고서 원문',
    sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515002287',
    displayMetrics: {
      revenue: '52,576,287',
      revenueUnit: '단위: 백만원 · 2026년 1분기 연결 매출액',
      revenueBasis: 'DART 분기보고서(2026.03) 연결 포괄손익계산서 기준. 전년 동기 비교는 2025년 1분기 연결 금액과 비교했습니다.',
      growth: '+198.1%',
      growthBasis: '2026년 1분기 매출 52,576,287백만원 vs 2025년 1분기 17,639,141백만원',
      opMargin: '71.5%',
      debtRatio: '35.6%',
    },
    headline: 'SK하이닉스는 HBM 중심 메모리 사이클에서 매출, 영업이익, 현금흐름이 모두 강하게 개선된 분기입니다.',
    verdict:
      '매출은 52.6조원, 영업이익은 37.6조원입니다. 영업현금흐름 26.3조원은 전년 동기 9.0조원보다 크게 늘었고, 투자현금흐름 -17.6조원은 HBM과 선단 공정 투자 부담을 보여줍니다.',
    insights: [
      {
        title: '손익계산서',
        kicker: '매출 52.6조원 · 영업이익 37.6조원',
        body:
          '연결 매출은 전년 동기 대비 198.1% 증가했고 영업이익률은 71.5%입니다. 메모리 업황 반등과 고부가 HBM 비중이 손익에 강하게 반영된 것으로 해석됩니다.',
        point:
          '이익률이 매우 높아진 만큼, 다음에는 HBM 가격과 고객 인증, 일반 DRAM·NAND 가격이 꺾이지 않는지가 중요합니다.',
      },
      {
        title: '현금흐름표',
        kicker: '영업현금흐름 26.3조원',
        body:
          '영업활동현금흐름은 26.3조원으로 전년 동기보다 약 17.3조원 늘었습니다. 순이익 40.3조원 대비 낮지만, 배당금 수취 4.0조원과 법인세 납부 3.3조원도 같이 반영됐습니다.',
        point:
          '이익이 현금으로 잘 전환되고 있습니다. 다만 매출채권이 33.8조원으로 크게 늘어, 고객사 회수 속도를 같이 봐야 합니다.',
      },
      {
        title: '투자활동',
        kicker: '투자현금흐름 -17.6조원',
        body:
          '투자활동현금흐름은 -17.6조원이고 유형자산 취득은 7.7조원입니다. HBM과 첨단 메모리 생산능력 확대를 위한 투자가 현금 유출로 먼저 잡힌 분기입니다.',
        point:
          '강한 투자는 미래 성장의 준비지만, 메모리 사이클이 식으면 고정비와 감가상각 부담이 커집니다. 투자 속도와 수요 지속성을 함께 봐야 합니다.',
      },
      {
        title: '재무상태표',
        kicker: '현금 21.2조원 · 부채비율 35.6%',
        body:
          '현금성자산은 21.2조원, 부채총계는 58.4조원, 자본총계는 164.4조원입니다. 부채비율은 35.6%로 재무 여력은 양호합니다.',
        point:
          '재고는 16.0조원으로 전년 말보다 늘었고 매출채권은 33.8조원입니다. 성장 구간에서는 자연스러운 증가지만, 출하와 회수 속도가 핵심입니다.',
      },
    ],
    watchPoints: [
      'HBM 매출이 고마진을 유지하는지, 고객 인증과 공급계약이 실제 매출로 이어지는지 봅니다.',
      '매출채권 33.8조원 회수 속도와 재고 16.0조원 회전율이 다음 분기 현금흐름의 핵심입니다.',
      '유형자산 취득 7.7조원은 성장 투자지만, 이후 감가상각비와 가동률이 같이 올라야 이익률이 유지됩니다.',
      '차입금 상환으로 재무활동현금흐름은 -3.0조원입니다. 업황이 좋을 때 재무 부담을 낮추는 흐름은 긍정적입니다.',
    ],
    auditNotes: [
      '분기보고서 기준 외부감사 항목은 분기 검토 성격으로 봐야 하며, 최종 감사의견은 사업보고서에서 확인합니다.',
      '메모리 기업의 핵심 감사 포인트는 재고 평가와 수익 인식입니다. 제품 가격이 빠르게 움직이면 재고평가손실이나 환입이 이익에 크게 영향을 줍니다.',
      '투자자는 HBM 수요 뉴스와 함께 재고, 매출채권, 설비투자 증가가 실제 현금흐름으로 이어지는지 확인해야 합니다.',
    ],
  },
  'kr-semiconductors-db-hitek': {
    reportTitle: 'DB하이텍 2026년 1분기 분기보고서',
    reportDate: '2026.05.15 공시 · 2026.03 연결 기준',
    sourceLabel: 'DART 분기보고서 원문',
    sourceUrl: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260515001650',
    displayMetrics: {
      revenue: '374,629',
      revenueUnit: '단위: 백만원 · 2026년 1분기 연결 매출액',
      revenueBasis: 'DART 분기보고서(2026.03) 연결 손익계산서 기준. 전년 동기 비교는 2025년 1분기 연결 금액과 비교했습니다.',
      growth: '+26.0%',
      growthBasis: '2026년 1분기 매출 374,629백만원 vs 2025년 1분기 297,381백만원',
      opMargin: '17.0%',
      debtRatio: '28.9%',
    },
    headline: 'DB하이텍은 매출과 이익이 개선됐지만, 투자현금흐름과 현금 잔고 감소를 함께 봐야 하는 분기입니다.',
    verdict:
      '매출은 3,746억원, 영업이익은 637억원입니다. 영업현금흐름은 700억원으로 안정적이지만 투자활동현금흐름은 -1,994억원이고, 기말 현금은 2,058억원으로 줄었습니다.',
    insights: [
      {
        title: '손익계산서',
        kicker: '매출 3,746억원 · 영업이익 637억원',
        body:
          '연결 매출은 전년 동기 대비 26.0% 증가했고 영업이익률은 17.0%입니다. 8인치 파운드리와 전력반도체 수요가 손익 개선에 반영된 모습입니다.',
        point:
          '파운드리는 가동률이 이익률에 큰 영향을 줍니다. 매출 성장보다 중요한 것은 웨이퍼 투입량, 제품 믹스, 고객 단가가 유지되는지입니다.',
      },
      {
        title: '현금흐름표',
        kicker: '영업현금흐름 700억원',
        body:
          '영업활동현금흐름은 700억원으로 전년 동기 664억원보다 소폭 개선됐습니다. 순이익 869억원 대비 낮지만 본업 현금창출은 플러스입니다.',
        point:
          '매출채권은 1,536억원으로 늘었고 재고는 921억원으로 줄었습니다. 회수와 출하가 이어지면 현금흐름은 안정적으로 유지될 수 있습니다.',
      },
      {
        title: '투자활동',
        kicker: '투자현금흐름 -1,994억원',
        body:
          '투자활동현금흐름은 -1,994억원입니다. 유형자산 취득은 401억원으로 크지 않지만, 금융상품 운용 등 투자활동 현금 유출이 크게 잡혔습니다.',
        point:
          '현금 감소를 설비투자만으로 단정하면 안 됩니다. 금융상품 이동인지, 생산능력 투자 증가인지 원문 세부 항목을 나눠 봐야 합니다.',
      },
      {
        title: '재무상태표',
        kicker: '현금 2,058억원 · 부채비율 28.9%',
        body:
          '현금성자산은 2,058억원, 부채총계는 6,841억원, 자본총계는 2조3,642억원입니다. 부채비율은 28.9%로 안정적입니다.',
        point:
          '기말 현금은 전년 말 3,231억원에서 감소했습니다. 투자 집행과 현금 회수 사이의 시간차를 다음 분기에 확인해야 합니다.',
      },
    ],
    watchPoints: [
      '8인치 파운드리 가동률과 전력반도체 수요가 매출 성장률 26%를 유지하는지 봅니다.',
      '영업현금흐름은 플러스지만 기말 현금이 줄었습니다. 투자활동 세부 항목을 원문에서 나눠 봐야 합니다.',
      '재고가 975억원에서 921억원으로 줄어든 점은 긍정적입니다. 매출채권 회수까지 이어지는지 확인합니다.',
      '부채비율 28.9%는 안정적이지만, 파운드리 업황이 둔화되면 고정비 부담이 빠르게 커질 수 있습니다.',
    ],
    auditNotes: [
      '분기보고서는 검토 성격입니다. 최종 감사의견과 핵심감사사항은 사업보고서 감사보고서에서 확인합니다.',
      '파운드리 기업은 재고 평가, 유형자산 손상, 고객별 매출 인식이 주요 회계 리스크입니다.',
      '투자자는 공장 가동률 뉴스와 함께 매출채권 회수, 재고 감소, 유형자산 투자 추이를 함께 봐야 합니다.',
    ],
  },
  'us-semiconductors-nvidia': {
    reportTitle: 'NVIDIA fiscal 2026 Form 10-K',
    reportDate: '2026.02.25 filed · fiscal year ended Jan 25, 2026',
    sourceLabel: 'SEC 10-K 원문',
    sourceUrl: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000021/nvda-20260125.htm',
    displayMetrics: {
      revenue: '215,938',
      revenueUnit: '단위: 백만 달러 · FY2026 연결 매출',
      revenueBasis: 'SEC Form 10-K(FY2026) 연결 손익계산서 기준. 성장률은 FY2025 연결 매출 130,497백만 달러와 비교했습니다.',
      growth: '+65.5%',
      growthBasis: 'FY2026 매출 $215,938M vs FY2025 $130,497M',
      opMargin: '60.4%',
      debtRatio: '31.5%',
    },
    headline:
      'NVIDIA는 매출 성장뿐 아니라 영업현금흐름도 강했습니다. 다만 성장의 질은 데이터센터 집중, 고객 집중, AI 인프라 병목을 함께 봐야 합니다.',
    verdict:
      'FY2026 매출은 2,159억 달러, 영업이익은 1,304억 달러입니다. 영업현금흐름은 1,027억 달러로 매우 크지만, 매출채권과 재고가 동시에 늘어 AI 서버 공급망이 빠르게 커지는 부담도 보입니다.',
    insights: [
      {
        title: '손익계산서',
        kicker: '매출 $215.9B · 영업이익률 60.4%',
        body:
          'FY2026 매출은 2,159억 달러로 전년보다 65.5% 늘었습니다. 영업이익은 1,304억 달러이고, 매출의 약 60%가 본업 이익으로 남는 구조입니다.',
        point:
          '성장의 핵심은 Blackwell 기반 데이터센터 컴퓨팅과 네트워킹입니다. SEC MD&A에서는 데이터센터 컴퓨팅 매출 성장과 NVLink, Ethernet, InfiniBand 확산을 주요 원인으로 설명합니다.',
      },
      {
        title: '현금흐름표',
        kicker: '영업현금흐름 $102.7B',
        body:
          '순이익 1,201억 달러보다 영업현금흐름은 1,027억 달러로 낮습니다. 매출채권 증가가 154억 달러, 재고 증가가 113억 달러의 현금 부담으로 잡혔기 때문입니다.',
        point:
          '나쁜 현금흐름은 아닙니다. AI 서버 수요가 커지며 납품, 회수, 재고 준비가 함께 커진 모습입니다. 이후 매출채권 회수와 재고 회전이 유지되는지가 중요합니다.',
      },
      {
        title: '투자활동',
        kicker: '투자현금흐름 -$52.2B',
        body:
          '투자현금흐름 유출은 단순 공장 증설보다 전략 투자 성격이 큽니다. 비상장 지분투자 175억 달러, Groq 비독점 기술 라이선스 130억 달러, 유형·무형자산 취득 60억 달러가 포함됐습니다.',
        point:
          '이는 AI 생태계와 기술 선택지를 넓히는 지출입니다. 미래에는 기술 내재화, 공급망 통제, 소프트웨어·플랫폼 매출 확장으로 이어질 수 있지만 투자 회수 기간은 따로 점검해야 합니다.',
      },
      {
        title: '재무상태표',
        kicker: '현금·유가증권 $62.6B',
        body:
          '현금과 유가증권은 626억 달러이고, 총부채는 495억 달러, 자본은 1,573억 달러입니다. 부채비율은 약 31.5%로 성장 기업치고 재무 여력은 매우 강합니다.',
        point:
          '다만 매출채권은 385억 달러, 재고는 214억 달러로 크게 늘었습니다. 고객 투자 지연이나 데이터센터 전력·자본 병목이 생기면 회전 속도가 느려질 수 있습니다.',
      },
    ],
    watchPoints: [
      'SEC MD&A는 FY2026 성장이 데이터센터 컴퓨팅과 네트워킹 플랫폼에서 나왔다고 설명합니다. Blackwell 수요가 다음 제품 전환에서도 유지되는지가 핵심입니다.',
      '직접 고객 2곳이 각각 매출의 22%, 14%를 차지했습니다. 특정 클라우드·AI 고객의 투자 사이클이 꺾이면 매출 변동성이 커질 수 있습니다.',
      '영업현금흐름은 강하지만 매출채권과 재고가 크게 늘었습니다. 다음 분기에도 현금 회수 속도가 매출 성장과 같이 가는지 확인해야 합니다.',
      '투자현금흐름 -522억 달러는 Groq 라이선스와 지분투자 영향이 큽니다. 단기 비용보다 AI 플랫폼 지배력 강화 투자로 해석하되, 투자 성과가 실제 제품·서비스 매출로 연결되는지 봐야 합니다.',
    ],
    auditNotes: [
      '감사인은 PwC이고 FY2026 재무제표와 내부회계관리제도에 대해 적정 의견을 냈습니다.',
      '핵심감사사항은 초과·진부 재고와 제품 구매 약정 충당부채입니다. AI 반도체는 제품 전환 속도가 빠르기 때문에, 남는 재고나 취소하기 어려운 구매 약정이 손실로 바뀔 수 있는지를 감사인이 중점 확인했다는 뜻입니다.',
      '투자자는 “수요가 많다”는 말만 볼 것이 아니라, H20 관련 재고·구매약정 비용처럼 규제와 제품 전환이 재고 손실로 이어지는 경우를 같이 봐야 합니다.',
    ],
  },
  'us-semiconductors-amd': {
    reportTitle: 'AMD fiscal 2025 Form 10-K',
    reportDate: '2026.02.04 filed · fiscal year ended Dec 27, 2025',
    sourceLabel: 'SEC 10-K 원문',
    sourceUrl: 'https://www.sec.gov/Archives/edgar/data/0000002488/000000248826000021/amd-20251227.htm',
    displayMetrics: {
      revenue: '34,639',
      revenueUnit: '단위: 백만 달러 · FY2025 연결 매출',
      revenueBasis: 'SEC Form 10-K(FY2025) 연결 손익계산서 기준. 성장률은 FY2024 연결 매출 25,785백만 달러와 비교했습니다.',
      growth: '+34.3%',
      growthBasis: 'FY2025 매출 $34,639M vs FY2024 $25,785M',
      opMargin: '10.7%',
      debtRatio: '22.1%',
    },
    headline:
      'AMD는 매출과 현금흐름이 모두 좋아졌지만, MD&A에서 말하는 데이터센터 GPU 성장과 재고 증가를 같이 읽어야 합니다.',
    verdict:
      'FY2025 매출은 346억 달러, 영업이익은 36.9억 달러입니다. 영업현금흐름은 77.1억 달러로 순이익 43.4억 달러보다 강하지만, 재고가 79.2억 달러로 늘어 AI 가속기 전환 속도가 핵심입니다.',
    insights: [
      {
        title: '손익계산서',
        kicker: '매출 $34.6B · 영업이익률 10.7%',
        body:
          'FY2025 매출은 전년 대비 34.3% 증가했습니다. 영업이익률은 10.7%로 NVIDIA보다 낮지만, 데이터센터와 클라이언트 회복이 매출 확대를 이끌었습니다.',
        point:
          'MD&A는 Data Center, Client and Gaming, Embedded 세그먼트의 흐름을 나눠 설명합니다. AMD는 AI GPU 성장이 커졌지만, 제품 믹스와 원가 구조가 이익률 개선의 핵심입니다.',
      },
      {
        title: '현금흐름표',
        kicker: '영업현금흐름 $7.7B',
        body:
          '영업현금흐름은 77.1억 달러로 순이익 43.4억 달러보다 높습니다. 이익이 실제 현금으로 잘 전환된 해였고, AI 서버 수요 확대가 운전자본을 키운 모습입니다.',
        point:
          '매출채권은 63.2억 달러, 재고는 79.2억 달러입니다. AI 가속기 수요가 계속 강하면 준비된 재고가 매출로 바뀌지만, 수요가 늦어지면 현금이 묶일 수 있습니다.',
      },
      {
        title: '투자활동',
        kicker: 'CapEx $1.0B',
        body:
          '유형자산 취득은 9.7억 달러로 팹리스 기업답게 삼성전자나 Intel보다 설비투자 부담이 작습니다. 대신 소프트웨어, IP, 공급망 선점, 파트너십이 더 중요합니다.',
        point:
          'AMD의 투자 포인트는 자체 공장보다 제품 로드맵과 외부 파운드리·패키징 공급망입니다. MD&A에서 제품 전환, 수요 전망, 고객 집중 설명을 같이 봐야 합니다.',
      },
      {
        title: '재무상태표',
        kicker: '현금 $5.5B · 부채비율 22.1%',
        body:
          '현금성자산은 55.4억 달러, 총부채는 139.3억 달러, 자본은 630.0억 달러입니다. 부채비율은 약 22.1%로 재무 부담은 낮은 편입니다.',
        point:
          '재무 안정성보다 중요한 리스크는 AI GPU 재고와 고객 수요 전환입니다. MD&A의 수요 설명이 매출채권 회수와 재고 회전으로 확인되는지 봅니다.',
      },
    ],
    watchPoints: [
      'MD&A에서 Data Center 성장 원인을 MI 시리즈 수요, EPYC 서버 CPU, 고객 채택으로 나눠 봅니다.',
      '재고 79.2억 달러가 빠르게 늘었습니다. AI 가속기 수요가 실제 출하와 매출총이익으로 이어지는지 확인합니다.',
      '영업현금흐름 77.1억 달러는 강합니다. 다음 해에도 순이익보다 현금흐름이 강한 구조가 유지되는지 봅니다.',
      '미국 수출 규제와 특정 AI 제품 재고평가 이슈가 MD&A와 주석에 어떻게 설명되는지 확인해야 합니다.',
    ],
    auditNotes: [
      '감사인은 Ernst & Young이고 FY2025 재무제표와 내부통제에 대한 감사의견을 확인해야 합니다.',
      'AMD는 팹리스 구조라 유형자산보다 재고, 매출 인식, 공급계약, 인수 관련 무형자산이 핵심 회계 포인트입니다.',
      '미국 기업은 숫자 자체보다 MD&A에서 경영진이 왜 변했는지 설명하는 부분이 중요합니다. 이 화면은 그 설명을 한국어 투자 체크포인트로 함께 보여주도록 구성했습니다.',
    ],
  },
  'us-semiconductors-intel': {
    reportTitle: 'Intel fiscal 2025 Form 10-K',
    reportDate: '2026.01.23 filed · fiscal year ended Dec 27, 2025',
    sourceLabel: 'SEC 10-K 원문',
    sourceUrl: 'https://www.sec.gov/Archives/edgar/data/50863/000005086326000011/intc-20251227.htm',
    displayMetrics: {
      revenue: '52,853',
      revenueUnit: '단위: 백만 달러 · FY2025 연결 매출',
      revenueBasis: 'SEC Form 10-K(FY2025) 연결 손익계산서 기준. 성장률은 FY2024 연결 매출 53,101백만 달러와 비교했습니다.',
      growth: '-0.5%',
      growthBasis: 'FY2025 매출 $52,853M vs FY2024 $53,101M',
      opMargin: '-4.2%',
      debtRatio: '85.0%',
    },
    headline:
      'Intel은 매출이 정체되고 영업손실이 이어졌지만, 영업현금흐름은 플러스입니다. 핵심은 MD&A의 파운드리 전환 비용과 CapEx 부담입니다.',
    verdict:
      'FY2025 매출은 528.5억 달러, 영업손실은 22.1억 달러입니다. 영업현금흐름은 97.0억 달러지만 유형자산 취득이 146.5억 달러라, 제조 전환 투자 부담이 현금흐름을 누르고 있습니다.',
    insights: [
      {
        title: '손익계산서',
        kicker: '매출 $52.9B · 영업손실 $2.2B',
        body:
          '매출은 전년 대비 0.5% 감소했고 영업이익률은 -4.2%입니다. 클라이언트와 서버 수요보다 파운드리 전환, 구조조정, 제조 원가 부담이 손익의 핵심입니다.',
        point:
          'Intel은 단순 반도체 설계사가 아니라 제조와 파운드리 전환을 같이 하는 회사입니다. 그래서 매출 성장보다 공정 전환 성공과 가동률 회복이 더 중요합니다.',
      },
      {
        title: '현금흐름표',
        kicker: '영업현금흐름 $9.7B',
        body:
          '순손실에도 영업현금흐름은 97.0억 달러로 플러스입니다. 감가상각과 비현금 비용이 커서 회계상 손실과 현금흐름이 다르게 움직입니다.',
        point:
          '영업현금흐름이 플러스인 점은 버틸 힘을 보여주지만, 투자현금 유출이 더 크면 외부 지원, 자산 매각, 차입 관리가 계속 중요해집니다.',
      },
      {
        title: '투자활동',
        kicker: 'CapEx $14.6B',
        body:
          '유형자산 취득은 146.5억 달러입니다. 파운드리와 선단 공정 전환 투자가 크기 때문에, 당장 손익보다 미래 생산능력과 고객 확보가 관건입니다.',
        point:
          '투자가 미래 매출로 이어지면 회복의 기반이 되지만, 가동률이 낮거나 고객 확보가 늦으면 감가상각비와 고정비가 이익을 계속 누릅니다.',
      },
      {
        title: '재무상태표',
        kicker: '현금 $14.3B · 부채비율 85.0%',
        body:
          '현금성자산은 142.7억 달러, 총부채는 971.5억 달러, 자본은 1,142.8억 달러입니다. 부채비율 85.0%는 NVIDIA·AMD보다 부담이 큰 편입니다.',
        point:
          'Intel의 투자 판단은 재무 여력과 제조 전환 성공을 같이 봐야 합니다. MD&A의 유동성, 정부지원, 자본지출 계획을 특히 중요하게 읽어야 합니다.',
      },
    ],
    watchPoints: [
      'MD&A의 Client Computing, Data Center and AI, Intel Foundry 설명을 나눠서 봅니다. 특히 Foundry 손실 축소 여부가 중요합니다.',
      '영업현금흐름 97.0억 달러보다 CapEx 146.5억 달러가 큽니다. 투자자금 조달과 현금 잔고 방어를 확인해야 합니다.',
      '부채비율이 85.0%로 상대적으로 높습니다. 금리와 차입 만기, 정부 보조금 수령 조건을 함께 봅니다.',
      '재고 116.2억 달러와 매출채권 38.4억 달러가 제품 전환기에 어떻게 움직이는지 확인해야 합니다.',
    ],
    auditNotes: [
      '감사인은 Ernst & Young이고 FY2025 10-K에서 재무제표와 내부통제 의견을 확인해야 합니다.',
      'Intel은 제조 전환 기업이라 유형자산 손상, 재고 평가, 정부 보조금, 구조조정 비용이 핵심 회계 포인트입니다.',
      '미국 기업 분석에서는 MD&A가 매우 중요합니다. Intel은 경영진이 투자 부담, 파운드리 전략, 유동성 계획을 어떻게 설명하는지가 숫자만큼 중요합니다.',
    ],
  },
};

function getCompanyFilingAnalysis(company: Company) {
  return filingAnalyses[company.id];
}

type ReportLink = {
  label: string;
  url: string;
  note: string;
  isDirect: boolean;
  isNavigable: boolean;
  status: FilingSourceStatus;
  statusLabel: string;
  statusDetail: string;
  regulator: 'DART' | 'SEC';
};

function getPrimaryReportLink(company: Company): ReportLink {
  const filing = resolveCompanyFilingLinks(company, getCompanyFilingAnalysis(company)?.sourceUrl);
  return {
    label: filing.primary.label,
    url: filing.primary.url,
    note: filing.primary.note,
    isDirect: filing.primary.isDirect,
    isNavigable: filing.primary.isNavigable,
    status: filing.status,
    statusLabel: filing.statusLabel,
    statusDetail: filing.statusDetail,
    regulator: filing.regulator,
  };
}

function reportLinkClass(reportLink: ReportLink) {
  if (reportLink.status === 'direct') return 'direct';
  if (reportLink.status === 'search-only') return 'search-only';
  if (reportLink.status === 'private-company' || reportLink.status === 'no-public-filing') return 'no-public-filing';
  if (reportLink.status === 'listing-unknown') return 'pending';
  return 'pending';
}

function ReportAction({
  reportLink,
  className = '',
  iconSize = 15,
  label,
}: {
  reportLink: ReportLink;
  className?: string;
  iconSize?: number;
  label?: string;
}) {
  const classes = [className, reportLinkClass(reportLink), reportLink.isDirect ? 'direct-action' : 'pending-action']
    .filter(Boolean)
    .join(' ');
  const displayLabel = label ?? reportLink.label;

  if (reportLink.isNavigable) {
    return (
      <a href={reportLink.url} target="_blank" rel="noreferrer" className={classes}>
        <ExternalLink size={iconSize} />
        {displayLabel}
      </a>
    );
  }

  return (
    <span className={classes} role="status" aria-label={reportLink.label}>
      <FileSearch size={iconSize} />
      {displayLabel}
    </span>
  );
}

function priceSourceInfo(source?: string) {
  const normalized = String(source ?? '').trim().toLowerCase();
  if (!normalized) {
    return {
      shortLabel: '출처 확인 중',
      fullLabel: '가격 출처 확인 중',
      className: 'unknown',
    };
  }
  if (normalized.includes('kis-openapi')) {
    return {
      shortLabel: '한국투자',
      fullLabel: '한국투자증권 Open API',
      className: 'kis',
    };
  }
  if (normalized.includes('yahoo-finance-chart')) {
    return {
      shortLabel: 'Yahoo',
      fullLabel: 'Yahoo Finance chart',
      className: 'yahoo',
    };
  }
  if (/fallback|import|manual|mock|example/.test(normalized)) {
    return {
      shortLabel: '보조',
      fullLabel: '보조 가격 데이터',
      className: 'fallback',
    };
  }
  return {
    shortLabel: '출처 확인 중',
    fullLabel: source || '가격 출처 확인 중',
    className: 'unknown',
  };
}

function parsePriceAsOf(value?: string) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const kstMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(:\d{2})?\s*KST$/i);
  if (kstMatch) {
    const date = new Date(`${kstMatch[1]}T${kstMatch[2]}${kstMatch[3] ?? ':00'}+09:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const easternMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})(:\d{2})?\s*(ET|EST|EDT)$/i);
  if (easternMatch) {
    const year = Number(easternMatch[1]);
    const month = Number(easternMatch[2]);
    const day = Number(easternMatch[3]);
    const zone = easternMatch[6].toUpperCase();
    const offset = zone === 'EDT' ? '-04:00' : zone === 'EST' ? '-05:00' : easternOffsetForDate(year, month, day);
    const date = new Date(`${easternMatch[1]}-${easternMatch[2]}-${easternMatch[3]}T${easternMatch[4]}${easternMatch[5] ?? ':00'}${offset}`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const normalized = trimmed.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2})?)([+-]\d{2}:?\d{2})$/, '$1T$2$3');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function nthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, nth: number) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  return 1 + ((weekday - firstDay + 7) % 7) + (nth - 1) * 7;
}

function easternOffsetForDate(year: number, month: number, day: number) {
  const secondSundayInMarch = nthWeekdayOfMonth(year, 2, 0, 2);
  const firstSundayInNovember = nthWeekdayOfMonth(year, 10, 0, 1);
  const dateKey = Date.UTC(year, month - 1, day);
  const dstStart = Date.UTC(year, 2, secondSundayInMarch);
  const dstEnd = Date.UTC(year, 10, firstSundayInNovember);
  return dateKey >= dstStart && dateKey < dstEnd ? '-04:00' : '-05:00';
}

function kstParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: byType.year ?? '',
    month: byType.month ?? '',
    day: byType.day ?? '',
    hour: byType.hour ?? '',
    minute: byType.minute ?? '',
  };
}

function formatPriceAsOf(value?: string) {
  const date = parsePriceAsOf(value);
  if (!date) return '기준일 확인 중';
  const parts = kstParts(date);
  return `기준 ${parts.month}.${parts.day}`;
}

function formatPriceAsOfFull(value?: string) {
  const date = parsePriceAsOf(value);
  if (!date) return '주가 기준일 확인 중';
  const parts = kstParts(date);
  return `주가 기준 ${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute} KST`;
}

function priceFreshnessInfo(value?: string) {
  const date = parsePriceAsOf(value);
  if (!date) return { label: '기준일 확인 중', className: 'unknown' };
  const diffDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  if (diffDays <= 2) return { label: '최신', className: 'fresh' };
  if (diffDays <= 5) return { label: '업데이트 지연', className: 'delayed' };
  return { label: '오래된 가격', className: 'stale' };
}

function PriceBadge({ price, compact = false }: { price?: MarketPrice | null; compact?: boolean }) {
  if (price === undefined) {
    return (
      <span className={`price-badge pending ${compact ? 'compact' : ''}`}>
        <strong>가격 불러오는 중</strong>
        <span className="price-meta-line">
          <span className="price-meta-source unknown">출처 확인 중</span>
          <span>기준일 확인 중</span>
        </span>
      </span>
    );
  }
  const direction = priceDirection(price);
  if (!price) {
    return (
      <span className={`price-badge pending ${compact ? 'compact' : ''}`}>
        <strong>가격 준비 중</strong>
        <span className="price-meta-line">
          <span className="price-meta-source unknown">출처 확인 중</span>
          <span>기준일 확인 중</span>
        </span>
      </span>
    );
  }
  const display = priceDisplay(price);
  const source = priceSourceInfo(price.source);
  const freshness = priceFreshnessInfo(price.asOf);
  const freshnessIsQuiet = freshness.className === 'fresh' || freshness.className === 'unknown';
  const freshnessLabel = freshness.className === 'unknown' ? '' : freshness.label;
  const title = [source.fullLabel, formatPriceAsOfFull(price.asOf), freshnessLabel].filter(Boolean).join(' · ');
  const ariaLabel = [
    display.amount,
    display.percent,
    source.fullLabel,
    formatPriceAsOfFull(price.asOf),
    freshnessLabel,
  ].filter(Boolean).join(', ');

  return (
    <span
      className={`price-badge ${direction} ${compact ? 'compact' : ''}`}
      title={title}
      aria-label={ariaLabel}
    >
      <strong>{display.amount}</strong>
      {display.percent && <em>{display.percent}</em>}
      <small className="price-status-line">{[display.status, display.basis].filter(Boolean).join(' · ')}</small>
      <span className="price-meta-line">
        <span className={`price-meta-source ${source.className}`}>{source.shortLabel}</span>
        <span>{formatPriceAsOf(price.asOf)}</span>
        {!freshnessIsQuiet && <span className={`price-freshness ${freshness.className}`}>{freshness.label}</span>}
      </span>
    </span>
  );
}

function parseSignedNumber(value?: string) {
  if (!value) return Number.NaN;
  return Number(String(value).replace(/[^0-9.-]/g, ''));
}

function formatKstDateTime(value?: string | null, fallback = '확인 중') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const parts = kstParts(date);
  return `${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

function formatKstDate(value?: string | null, fallback = '접수일 확인 중') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const parts = kstParts(date);
  return `${parts.year}.${parts.month}.${parts.day}`;
}

const secNumberFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 6 });
const secMoneyFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });

function formatSecNumber(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? secNumberFormatter.format(value) : '';
}

function formatSecShares(value?: number | null) {
  const formatted = formatSecNumber(value);
  return formatted ? `${formatted}주` : '';
}

function formatSecPrice(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? `주당 $${secMoneyFormatter.format(value)}` : '';
}

function isSecAmendedFiling(formType: string) {
  return formType.endsWith('/A');
}

function isEightKFiling(formType: string) {
  return formType === '8-K' || formType === '8-K/A';
}

function isForm4Filing(formType: string) {
  return formType === '4' || formType === '4/A';
}

function reportingOwnerRoleLabel(owner: SecReportingOwner) {
  const roles = [
    owner.isDirector ? 'Director' : '',
    owner.isOfficer ? owner.officerTitle || 'Officer' : '',
    owner.isTenPercentOwner ? '10% Owner' : '',
    owner.isOther ? owner.otherText || 'Other' : '',
  ].filter(Boolean);
  return roles.join(' · ') || '관계 정보 없음';
}

type SecTransactionSummary =
  | { kind: 'non-derivative'; transaction: SecNonDerivativeTransaction }
  | { kind: 'derivative'; transaction: SecDerivativeTransaction };

function secTransactionsForFiling(filing: MarketSecFiling): SecTransactionSummary[] {
  return [
    ...(filing.nonDerivativeTransactions ?? []).map((transaction) => ({ kind: 'non-derivative' as const, transaction })),
    ...(filing.derivativeTransactions ?? []).map((transaction) => ({ kind: 'derivative' as const, transaction })),
  ];
}

function secTransactionShares(transaction: SecTransactionSummary) {
  return transaction.kind === 'non-derivative'
    ? transaction.transaction.shares
    : transaction.transaction.transactionShares;
}

function secTransactionPrice(transaction: SecTransactionSummary) {
  return transaction.kind === 'non-derivative'
    ? transaction.transaction.pricePerShare
    : transaction.transaction.transactionPricePerShare;
}

function secTransactionCodeLabel(transaction: SecTransactionSummary) {
  const code = transaction.transaction.transactionCode;
  const label = transaction.transaction.transactionCodeLabelKo;
  if (!code && !label) return transaction.kind === 'derivative' ? '파생상품 거래' : '거래 코드 확인 필요';
  return [code, label].filter(Boolean).join(' · ');
}

function secTransactionMetaLine(transaction: SecTransactionSummary) {
  return [
    formatSecShares(secTransactionShares(transaction)),
    formatSecPrice(secTransactionPrice(transaction)),
    transaction.transaction.ownershipLabelKo,
    transaction.transaction.sharesOwnedFollowingTransaction !== null
      ? `거래 후 ${formatSecShares(transaction.transaction.sharesOwnedFollowingTransaction)}`
      : '',
  ].filter(Boolean).join(' · ');
}

function secFilingMatchesTransactionFilter(filing: MarketSecFiling, filter: string | 'all' | 'other') {
  if (filter === 'all') return true;
  const transactions = secTransactionsForFiling(filing);
  if (filter === 'other') {
    return transactions.some(({ transaction }) => {
      const code = transaction.transactionCode ?? '';
      return code && !secPrimaryTransactionCodes.includes(code as typeof secPrimaryTransactionCodes[number]);
    });
  }
  return transactions.some(({ transaction }) => transaction.transactionCode === filter);
}

function latestPriceAsOfForPicks(picks: StockAutopsyPick[], prices: MarketPrice[]) {
  const timestamps = picks
    .map((pick) => getPriceForPick(pick, prices)?.asOf)
    .map((value) => parsePriceAsOf(value))
    .filter((date): date is Date => Boolean(date))
    .map((date) => date.getTime());
  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function disclosureItemsWithin(items: MarketDisclosure[], hours: number) {
  const threshold = Date.now() - hours * 60 * 60 * 1000;
  return items.filter((item) => {
    const receivedAt = Date.parse(item.receivedAt);
    return !Number.isNaN(receivedAt) && receivedAt >= threshold;
  });
}

function secFilingItemsWithin(items: MarketSecFiling[], hours: number) {
  const threshold = Date.now() - hours * 60 * 60 * 1000;
  return items.filter((item) => {
    const filedAt = Date.parse(item.filedAt);
    return !Number.isNaN(filedAt) && filedAt >= threshold;
  });
}

function recentDisclosureCountForTicker(items: MarketDisclosure[], ticker: string, hours = 24) {
  return disclosureItemsWithin(items, hours).filter((item) => item.ticker === ticker).length;
}

function recentSecFilingCountForTicker(items: MarketSecFiling[], ticker: string, hours = 24) {
  return secFilingItemsWithin(items, hours).filter((item) => item.ticker === ticker).length;
}

function disclosureStateMessage(response: MarketDisclosureApiResponse) {
  if (response.ok) return '';
  if (response.code === 'DISCLOSURES_LOADING') return '공시 데이터를 불러오는 중입니다.';
  if (response.code === 'DISCLOSURES_NOT_CONFIGURED') return '공시 데이터를 준비하고 있습니다.';
  return '공시 정보를 일시적으로 불러오지 못했습니다. 이전 데이터를 표시합니다.';
}

function disclosureSyncLabel(response: MarketDisclosureApiResponse) {
  const lastSyncedAt = response.meta.lastSyncedAt;
  if (!response.ok && response.code === 'DISCLOSURES_NOT_CONFIGURED') return '공시 데이터를 준비하고 있습니다.';
  if (!lastSyncedAt) return 'OpenDART 확인 전';
  if (response.meta.stale) return `업데이트 지연 · 마지막 확인 ${formatKstDateTime(lastSyncedAt)}`;
  return `OpenDART · ${formatKstDateTime(lastSyncedAt)} 기준`;
}

function secFilingStateMessage(response: MarketSecFilingsApiResponse) {
  if (response.ok) return '';
  if (response.code === 'SEC_FILINGS_LOADING') return '미국 공시 데이터를 불러오는 중입니다.';
  if (response.code === 'SEC_FILINGS_NOT_CONFIGURED') return '미국 공시 데이터를 준비하고 있습니다.';
  return '미국 공시 정보를 일시적으로 불러오지 못했습니다. 이전 데이터를 표시합니다.';
}

function secFilingSyncLabel(response: MarketSecFilingsApiResponse) {
  const lastSyncedAt = response.meta.lastSyncedAt;
  if (!response.ok && response.code === 'SEC_FILINGS_NOT_CONFIGURED') return '미국 공시 데이터를 준비하고 있습니다.';
  if (!lastSyncedAt) return 'SEC EDGAR 확인 전';
  if (response.meta.stale) return `업데이트 지연 · 마지막 확인 ${formatKstDateTime(lastSyncedAt)}`;
  return `SEC EDGAR · ${formatKstDateTime(lastSyncedAt)} 기준`;
}

function categoryCountSummary(items: MarketDisclosure[]) {
  const counts = new Map<DisclosureCategory, number>();
  items.forEach((item) => {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  });
  return disclosureCategoryOrder
    .map((category) => ({ category, count: counts.get(category) ?? 0 }))
    .filter((item) => item.count > 0);
}

function firstActionableDisclosureCategory(items: MarketDisclosure[]) {
  return categoryCountSummary(items)[0]?.category ?? null;
}

function secCategoryCountSummary(items: MarketSecFiling[]) {
  const counts = new Map<SecFilingCategory, number>();
  items.forEach((item) => {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  });
  return secFilingCategoryOrder
    .map((category) => ({ category, count: counts.get(category) ?? 0 }))
    .filter((item) => item.count > 0);
}

function firstActionableSecFilingCategory(items: MarketSecFiling[]) {
  return secCategoryCountSummary(items)[0]?.category ?? null;
}

type OfficialDisclosureFeedItem =
  | { source: 'opendart'; id: string; sortAt: string; disclosure: MarketDisclosure }
  | { source: 'sec-edgar'; id: string; sortAt: string; filing: MarketSecFiling };

function officialDisclosureFeedItems(disclosures: MarketDisclosure[], secFilings: MarketSecFiling[]) {
  return [
    ...disclosures.map((disclosure) => ({
      source: 'opendart' as const,
      id: disclosure.receiptNumber,
      sortAt: disclosure.receivedAt,
      disclosure,
    })),
    ...secFilings.map((filing) => ({
      source: 'sec-edgar' as const,
      id: filing.accessionNumber,
      sortAt: filing.filedAt,
      filing,
    })),
  ].sort((a, b) => b.sortAt.localeCompare(a.sortAt));
}

type TodayOverviewProps = {
  marketPrices: MarketPrice[];
  disclosures: MarketDisclosureApiResponse;
  secFilings: MarketSecFilingsApiResponse;
  onOpenPicks: () => void;
  onOpenDisclosures: () => void;
};

function TodayOverview({ marketPrices, disclosures, secFilings, onOpenPicks, onOpenDisclosures }: TodayOverviewProps) {
  const weeklyPicks = weeklyStockAutopsyPicks();
  const sortedPicks = [...weeklyPicks].sort((a, b) => {
    const aMove = Math.abs(parseSignedNumber(getPriceForPick(a, marketPrices)?.changePercent));
    const bMove = Math.abs(parseSignedNumber(getPriceForPick(b, marketPrices)?.changePercent));
    return (Number.isFinite(bMove) ? bMove : -1) - (Number.isFinite(aMove) ? aMove : -1);
  });
  const priceAsOf = latestPriceAsOfForPicks(weeklyPicks, marketPrices);
  const recent24 = disclosureItemsWithin(disclosures.items, 24);
  const recentSec24 = secFilingItemsWithin(secFilings.items, 24);
  const totalRecentOfficialDisclosures = recent24.length + recentSec24.length;
  const recentByCompany = enabledDartTrackedCompanies
    .map((company) => ({
      company,
      count: recentDisclosureCountForTicker(disclosures.items, company.ticker, 24),
    }))
    .filter((item) => item.count > 0)
    .slice(0, 4);
  const recentSecByCompany = enabledSecTrackedCompanies
    .map((company) => ({
      company,
      count: recentSecFilingCountForTicker(secFilings.items, company.ticker, 24),
    }))
    .filter((item) => item.count > 0)
    .slice(0, 4);
  const actionCategory = firstActionableDisclosureCategory(recent24.length ? recent24 : disclosures.items);
  const actionSecCategory = firstActionableSecFilingCategory(recentSec24.length ? recentSec24 : secFilings.items);
  const actionCopy = actionCategory
    ? disclosureCheckpoints[actionCategory]
    : actionSecCategory
      ? secFilingCheckpoints[actionSecCategory]
      : '새 공시보다 기존 Pick의 체크포인트를 계속 관찰할 시점입니다.';
  const disclosureMessage = disclosureStateMessage(disclosures);
  const secFilingMessage = secFilingStateMessage(secFilings);
  const combinedDisclosureMessage = totalRecentOfficialDisclosures
    ? ''
    : [disclosureMessage, secFilingMessage].filter(Boolean).join(' · ');

  return (
    <section className="today-overview-section" aria-labelledby="today-overview-title">
      <div className="today-overview-head">
        <div>
          <p className="home-kicker">오늘</p>
          <h2 id="today-overview-title">오늘 봐야 할 것</h2>
          <p>대표 Pick, 중요 공식 공시, 주요 시장 흐름을 짧게 확인합니다.</p>
        </div>
        <div className="today-asof-stack" aria-label="데이터 기준 시각">
          <span>가격 · {priceAsOf ? formatKstDateTime(priceAsOf) : '기준일 확인 중'}</span>
          <span>OpenDART · {disclosureSyncLabel(disclosures)}</span>
          <span>SEC EDGAR · {secFilingSyncLabel(secFilings)}</span>
        </div>
      </div>

      <div className="today-overview-grid">
        <article className="today-card price-card">
          <div className="today-card-title">
            <BarChart3 size={18} />
            <div>
              <h3>이번 주 Pick 변화</h3>
              <p>가격 변동이 큰 순서입니다. 변동 원인은 공시와 산업 흐름에서 따로 확인하세요.</p>
            </div>
          </div>
          <div className="today-pick-list">
            {sortedPicks.map((pick) => {
              const price = getPriceForPick(pick, marketPrices);
              return (
                <button type="button" key={pick.id} className="today-pick-row" onClick={onOpenPicks}>
                  <CompanyIdentityForPick pick={pick} size="compact" />
                  <PriceBadge price={price} compact />
                </button>
              );
            })}
          </div>
          <button type="button" className="today-card-action" onClick={onOpenPicks}>
            전체 보기
            <ArrowRight size={15} />
          </button>
        </article>

        <article className="today-card disclosure-card">
          <div className="today-card-title">
            <FileSearch size={18} />
            <div>
              <h3>새로 나온 공식 공시</h3>
              <p>OpenDART와 SEC EDGAR에 접수된 감시 기업 공시를 나눠 봅니다.</p>
            </div>
          </div>
          <div className="today-disclosure-count">
            {combinedDisclosureMessage ? (
              <strong>{combinedDisclosureMessage}</strong>
            ) : (
              <>
                <strong>{totalRecentOfficialDisclosures ? `최근 24시간 ${totalRecentOfficialDisclosures}건` : '최근 24시간 새 공식 공시가 없습니다.'}</strong>
                <div className="today-disclosure-source-list" aria-label="출처별 최근 공식 공시 수">
                  <span>OpenDART {recent24.length}건</span>
                  <span>SEC EDGAR {recentSec24.length}건</span>
                </div>
                {recentByCompany.length || recentSecByCompany.length ? (
                  <div className="today-disclosure-company-list">
                    {recentByCompany.map(({ company, count }) => (
                      <span key={company.id}>{company.companyName} {count}건</span>
                    ))}
                    {recentSecByCompany.map(({ company, count }) => (
                      <span key={company.id}>SEC {company.companyName} {count}건</span>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
          <button type="button" className="today-card-action" onClick={onOpenDisclosures}>
            전체 보기
            <ArrowRight size={15} />
          </button>
        </article>

        <article className="today-card action-card">
          <div className="today-card-title">
            <Target size={18} />
            <div>
              <h3>지금 확인할 것</h3>
              <p>공시 유형과 Pick 체크포인트를 단정 없이 연결합니다.</p>
            </div>
          </div>
          <div className="today-action-copy">
            {actionCategory ? (
              <span>{disclosureCategoryLabels[actionCategory]}</span>
            ) : actionSecCategory ? (
              <span>{secFilingCategoryLabels[actionSecCategory]}</span>
            ) : (
              <span>체크포인트</span>
            )}
            <strong>{actionCopy}</strong>
          </div>
          <button type="button" className="today-card-action secondary" onClick={onOpenDisclosures}>
            상세 보기
            <ArrowRight size={15} />
          </button>
        </article>
      </div>
    </section>
  );
}

type MarketDisclosuresPageProps = {
  disclosures: MarketDisclosureApiResponse;
  secFilings: MarketSecFilingsApiResponse;
  onHome: () => void;
  onOpenPicks: () => void;
  onOpenMarketMap: () => void;
  onOpenReports: (reportId?: string) => void;
};

type DisclosureSourceFilter = 'all' | 'opendart' | 'sec-edgar';

function DisclosureCard({ disclosure }: { disclosure: MarketDisclosure }) {
  const categoryLabel = disclosureCategoryLabels[disclosure.category];
  const checkpoint = disclosureCheckpoints[disclosure.category];
  const trackedCompany = findDartTrackedCompanyByTicker(disclosure.ticker);
  const identity = resolveCompanyIdentity({
    companyName: disclosure.companyName,
    ticker: disclosure.ticker,
    countryLabel: trackedCompany ? '한국' : countryLabelFromTicker(disclosure.ticker),
    statusLabel: disclosure.ticker ? undefined : '공시 기업',
  });

  return (
    <article className="disclosure-radar-card">
      <div className="disclosure-card-topline">
        <span>OpenDART</span>
        <span>{categoryLabel}</span>
        <time dateTime={disclosure.receivedAt}>{formatKstDate(disclosure.receivedAt)}</time>
      </div>
      <div className="disclosure-company-line">
        <CompanyIdentity {...identity} size="compact" />
      </div>
      <h2>{disclosure.reportName}</h2>
      <p>
        <b>확인할 것:</b>
        {checkpoint}
      </p>
      <a href={disclosure.sourceUrl} target="_blank" rel="noopener noreferrer">
        OpenDART 원문 보기
        <ExternalLink size={14} />
      </a>
    </article>
  );
}

function SecFilingDetailSummary({ filing, compact = false }: { filing: MarketSecFiling; compact?: boolean }) {
  if (isEightKFiling(filing.formType)) {
    const items = filing.eightKItems ?? [];
    return (
      <div className={`sec-detail-block ${compact ? 'compact' : ''}`}>
        <strong>공시 항목</strong>
        {items.length ? (
          <>
            <ul className="sec-detail-list">
              {items.slice(0, compact ? 2 : 3).map((item) => (
                <li key={item.item}>{item.item} · {item.labelKo}</li>
              ))}
            </ul>
            {items.length > (compact ? 2 : 3) ? <small>외 {items.length - (compact ? 2 : 3)}개</small> : null}
          </>
        ) : (
          <small>공시 항목 정보 없음</small>
        )}
      </div>
    );
  }

  if (isForm4Filing(filing.formType)) {
    const owners = filing.reportingOwners ?? [];
    const transactions = secTransactionsForFiling(filing);
    const detailUnavailable = filing.parsingStatus === 'source-unavailable' || filing.parsingStatus === 'parse-error';

    return (
      <div className={`sec-detail-block ${compact ? 'compact' : ''}`}>
        <strong>공시된 소유권 거래</strong>
        {owners.length ? (
          <div className="sec-owner-list">
            {owners.slice(0, compact ? 1 : 2).map((owner, index) => (
              <span key={`${owner.cik ?? owner.name ?? 'owner'}-${index}`}>
                {owner.name ?? '보고자 이름 확인 필요'} · {reportingOwnerRoleLabel(owner)}
              </span>
            ))}
            {owners.length > (compact ? 1 : 2) ? <small>보고자 외 {owners.length - (compact ? 1 : 2)}명</small> : null}
          </div>
        ) : null}
        {transactions.length ? (
          <>
            <ul className="sec-detail-list">
              {transactions.slice(0, compact ? 2 : 3).map((transaction, index) => (
                <li key={`${transaction.transaction.transactionCode ?? 'code'}-${index}`}>
                  <span>{secTransactionCodeLabel(transaction)}</span>
                  <small>{secTransactionMetaLine(transaction) || '수량·가격 정보 없음'}</small>
                  {transaction.transaction.footnoteIds.length ? <small>각주 {transaction.transaction.footnoteIds.length}개 있음 · 원문 조건 확인</small> : null}
                </li>
              ))}
            </ul>
            {transactions.length > (compact ? 2 : 3) ? <small>거래 외 {transactions.length - (compact ? 2 : 3)}건</small> : null}
            {filing.footnoteCount ? <small>전체 각주 {filing.footnoteCount}개 있음 · SEC 원문에서 확인</small> : null}
          </>
        ) : (
          <small>{detailUnavailable ? '거래 상세를 불러오지 못했습니다. SEC 원문에서 확인하세요.' : '거래 상세 준비 중'}</small>
        )}
      </div>
    );
  }

  return null;
}

function SecFilingCard({ filing }: { filing: MarketSecFiling }) {
  const categoryLabel = secFilingCategoryLabels[filing.category];
  const checkpoint = secFilingCheckpoints[filing.category];
  const trackedCompany = findSecTrackedCompanyByTicker(filing.ticker);
  const identity = resolveCompanyIdentity({
    companyName: filing.companyName,
    ticker: filing.ticker,
    countryLabel: '미국',
    statusLabel: trackedCompany?.source === 'current-pick' ? '현재 Pick' : '미국 Pick',
  });

  return (
    <article className="disclosure-radar-card sec-filing-card">
      <div className="disclosure-card-topline">
        <span>SEC EDGAR</span>
        <span>{filing.formType}</span>
        {isSecAmendedFiling(filing.formType) ? <span>수정 공시</span> : null}
        <time dateTime={filing.filedAt}>{formatKstDate(filing.filedAt)}</time>
      </div>
      <div className="disclosure-company-line">
        <CompanyIdentity {...identity} size="compact" />
      </div>
      <h2>{categoryLabel}</h2>
      <p>
        <b>확인할 것:</b>
        {checkpoint}
      </p>
      <SecFilingDetailSummary filing={filing} />
      {isSecAmendedFiling(filing.formType) ? <small className="disclosure-card-submeta">수정 공시입니다. 원본과 함께 확인하세요.</small> : null}
      {filing.reportDate ? <small className="disclosure-card-submeta">보고 기준일 · {formatKstDate(filing.reportDate)}</small> : null}
      <a href={filing.sourceUrl} target="_blank" rel="noopener noreferrer">
        SEC EDGAR 원문 보기
        <ExternalLink size={14} />
      </a>
    </article>
  );
}

function MarketDisclosuresPage({ disclosures, secFilings, onHome, onOpenPicks, onOpenMarketMap, onOpenReports }: MarketDisclosuresPageProps) {
  const [sourceFilter, setSourceFilter] = useState<DisclosureSourceFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<DisclosureCategory | 'all'>('all');
  const [secCategoryFilter, setSecCategoryFilter] = useState<SecFilingCategory | 'all'>('all');
  const [secFormFilter, setSecFormFilter] = useState<string | 'all'>('all');
  const [secItemFilter, setSecItemFilter] = useState<string | 'all'>('all');
  const [secTransactionFilter, setSecTransactionFilter] = useState<string | 'all' | 'other'>('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const recent24 = disclosureItemsWithin(disclosures.items, 24);
  const recent7 = disclosureItemsWithin(disclosures.items, 24 * 7);
  const recentSec24 = secFilingItemsWithin(secFilings.items, 24);
  const recentSec30 = secFilingItemsWithin(secFilings.items, 24 * 30);
  const shouldShowDart = sourceFilter === 'all' || sourceFilter === 'opendart';
  const shouldShowSec = sourceFilter === 'all' || sourceFilter === 'sec-edgar';
  const showDartSpecificFilters = sourceFilter === 'opendart';
  const showSecSpecificFilters = sourceFilter === 'sec-edgar';

  const filteredDartItems = useMemo(() => {
    if (!shouldShowDart) return [];
    return disclosures.items
      .filter((item) => categoryFilter === 'all' || item.category === categoryFilter)
      .filter((item) => {
        if (companyFilter === 'all') return true;
        if (companyFilter === 'current-pick') return currentPickDisclosureTickers.has(item.ticker ?? '');
        if (companyFilter === 'market-map') return marketMapDisclosureTickers.has(item.ticker ?? '');
        if (companyFilter === 'us-pick') return false;
        return item.ticker === companyFilter;
      })
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }, [categoryFilter, companyFilter, disclosures.items, shouldShowDart]);

  const filteredSecItems = useMemo(() => {
    if (!shouldShowSec) return [];
    return secFilings.items
      .filter((item) => secCategoryFilter === 'all' || item.category === secCategoryFilter)
      .filter((item) => secFormFilter === 'all' || matchesSecFormPattern(item.formType, secFormFilter))
      .filter((item) => secItemFilter === 'all' || item.eightKItems?.some((detail) => detail.item === secItemFilter))
      .filter((item) => secFilingMatchesTransactionFilter(item, secTransactionFilter))
      .filter((item) => {
        if (companyFilter === 'all') return true;
        if (companyFilter === 'current-pick') return currentPickSecTickers.has(item.ticker);
        if (companyFilter === 'market-map') return false;
        if (companyFilter === 'us-pick') return enabledSecTrackedCompanies.some((company) => company.ticker === item.ticker);
        return item.ticker === companyFilter;
      })
      .sort((a, b) => b.filedAt.localeCompare(a.filedAt));
  }, [companyFilter, secCategoryFilter, secFilings.items, secFormFilter, secItemFilter, secTransactionFilter, shouldShowSec]);

  const filteredItems = officialDisclosureFeedItems(filteredDartItems, filteredSecItems);

  const stateMessage = disclosureStateMessage(disclosures);
  const secStateMessage = secFilingStateMessage(secFilings);
  const sourceNotices = [
    shouldShowDart && stateMessage ? `OpenDART · ${stateMessage}` : '',
    shouldShowSec && secStateMessage ? `SEC EDGAR · ${secStateMessage}` : '',
  ].filter(Boolean);

  const updateSourceFilter = (next: DisclosureSourceFilter) => {
    setSourceFilter(next);
    setCategoryFilter('all');
    setSecCategoryFilter('all');
    setSecFormFilter('all');
    setSecItemFilter('all');
    setSecTransactionFilter('all');
    setCompanyFilter('all');
  };
  const secItemFilterOptions = ['2.02', '5.02', '7.01', '8.01', '9.01'];
  const secTransactionFilterOptions = ['P', 'S', 'A', 'F', 'G', 'M'];

  return (
    <div className="pick-shell story-dark-shell disclosure-radar-shell">
      <PrimaryNavigation
        active="disclosures"
        onHome={onHome}
        onOpenPicks={onOpenPicks}
        onOpenMarketMap={onOpenMarketMap}
        onOpenDisclosures={() => undefined}
        onOpenReports={onOpenReports}
      />

      <main className="disclosure-radar-main">
        <section className="disclosure-radar-hero">
          <p className="home-kicker">공식 공시 레이더</p>
          <h1>공시 레이더</h1>
          <p>
            현재 Pick과 시장지도 기업에서 새로 나온 OpenDART·SEC EDGAR 공식 공시를 모아봅니다.
            공시 제목은 신호일 뿐이며, 실제 내용은 원문에서 확인해야 합니다.
          </p>
        </section>

        <section className="disclosure-status-grid" aria-label="공시 레이더 상태">
          <article>
            <span>출처</span>
            <strong>OpenDART · SEC EDGAR</strong>
          </article>
          <article>
            <span>OpenDART 동기화</span>
            <strong>{disclosureSyncLabel(disclosures)}</strong>
          </article>
          <article>
            <span>SEC EDGAR 동기화</span>
            <strong>{secFilingSyncLabel(secFilings)}</strong>
          </article>
          <article>
            <span>감시 기업 수</span>
            <strong>KR {disclosures.meta.trackedCompanyCount}개 · US {secFilings.meta.trackedCompanyCount}개</strong>
          </article>
          <article>
            <span>최근 24시간</span>
            <strong>{recent24.length + recentSec24.length}건</strong>
          </article>
          <article>
            <span>표시 범위</span>
            <strong>OpenDART 7일 {recent7.length}건 · SEC 30일 {recentSec30.length}건</strong>
          </article>
        </section>

        <section className="disclosure-source-tabs" aria-label="공시 출처 선택">
          <button type="button" className={sourceFilter === 'all' ? 'active' : ''} onClick={() => updateSourceFilter('all')}>
            전체
          </button>
          <button type="button" className={sourceFilter === 'opendart' ? 'active' : ''} onClick={() => updateSourceFilter('opendart')}>
            한국 공시
          </button>
          <button type="button" className={sourceFilter === 'sec-edgar' ? 'active' : ''} onClick={() => updateSourceFilter('sec-edgar')}>
            미국 공시
          </button>
        </section>

        <section className="disclosure-filter-panel" aria-label="공시 필터">
          {showDartSpecificFilters ? (
            <div>
              <span><Filter size={14} /> 한국 공시 · OpenDART</span>
              <div className="disclosure-chip-row">
                <button type="button" className={categoryFilter === 'all' ? 'active' : ''} onClick={() => setCategoryFilter('all')}>
                  전체
                </button>
                {disclosureCategoryOrder.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={categoryFilter === category ? 'active' : ''}
                    onClick={() => setCategoryFilter(category)}
                  >
                    {disclosureCategoryLabels[category]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {showSecSpecificFilters ? (
            <>
              <div>
                <span><Filter size={14} /> 미국 공시 · SEC EDGAR</span>
                <div className="disclosure-chip-row">
                  <button type="button" className={secCategoryFilter === 'all' ? 'active' : ''} onClick={() => setSecCategoryFilter('all')}>
                    전체
                  </button>
                  {secFilingCategoryOrder.map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={secCategoryFilter === category ? 'active' : ''}
                      onClick={() => setSecCategoryFilter(category)}
                    >
                      {secFilingCategoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span><Filter size={14} /> SEC Form</span>
                <div className="disclosure-chip-row">
                  <button type="button" className={secFormFilter === 'all' ? 'active' : ''} onClick={() => setSecFormFilter('all')}>
                    전체
                  </button>
                  {secSupportedFormPatterns.map((formType) => (
                    <button
                      type="button"
                      key={formType}
                      className={secFormFilter === formType ? 'active' : ''}
                      onClick={() => setSecFormFilter(formType)}
                    >
                      {formType === '424B' ? '424B 계열' : formType}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span><Filter size={14} /> 8-K Item</span>
                <div className="disclosure-chip-row">
                  <button type="button" className={secItemFilter === 'all' ? 'active' : ''} onClick={() => setSecItemFilter('all')}>
                    전체 Item
                  </button>
                  {secItemFilterOptions.map((item) => {
                    const definition = eightKItemDefinitionByItem.get(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        className={secItemFilter === item ? 'active' : ''}
                        onClick={() => setSecItemFilter(item)}
                      >
                        {definition?.labelKo ?? '공식 설명 확인 필요'} · {item}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <span><Filter size={14} /> Form 4 거래</span>
                <div className="disclosure-chip-row">
                  <button type="button" className={secTransactionFilter === 'all' ? 'active' : ''} onClick={() => setSecTransactionFilter('all')}>
                    전체 거래
                  </button>
                  {secTransactionFilterOptions.map((code) => {
                    const definition = secTransactionCodeDefinitionByCode.get(code);
                    return (
                      <button
                        type="button"
                        key={code}
                        className={secTransactionFilter === code ? 'active' : ''}
                        onClick={() => setSecTransactionFilter(code)}
                      >
                        {code} · {definition?.labelKo ?? '공식 코드 설명 확인 필요'}
                      </button>
                    );
                  })}
                  <button type="button" className={secTransactionFilter === 'other' ? 'active' : ''} onClick={() => setSecTransactionFilter('other')}>
                    기타
                  </button>
                </div>
              </div>
            </>
          ) : null}
          <div>
            <span><Filter size={14} /> 회사</span>
            <div className="disclosure-chip-row">
              <button type="button" className={companyFilter === 'all' ? 'active' : ''} onClick={() => setCompanyFilter('all')}>
                전체
              </button>
              <button type="button" className={companyFilter === 'current-pick' ? 'active' : ''} onClick={() => setCompanyFilter('current-pick')}>
                현재 Pick
              </button>
              {sourceFilter !== 'sec-edgar' ? (
                <button type="button" className={companyFilter === 'market-map' ? 'active' : ''} onClick={() => setCompanyFilter('market-map')}>
                  시장지도 기업
                </button>
              ) : null}
              {sourceFilter !== 'opendart' ? (
                <button type="button" className={companyFilter === 'us-pick' ? 'active' : ''} onClick={() => setCompanyFilter('us-pick')}>
                  미국 Pick
                </button>
              ) : null}
              {sourceFilter === 'opendart' ? enabledDartTrackedCompanies.map((company) => (
                  <button
                    type="button"
                    key={`dart-${company.id}`}
                    className={companyFilter === company.ticker ? 'active' : ''}
                    onClick={() => setCompanyFilter(company.ticker)}
                  >
                    {company.companyName}
                  </button>
                )) : null}
              {sourceFilter === 'sec-edgar' ? enabledSecTrackedCompanies.map((company) => (
                  <button
                    type="button"
                    key={`sec-${company.id}`}
                    className={companyFilter === company.ticker ? 'active' : ''}
                    onClick={() => setCompanyFilter(company.ticker)}
                  >
                    {company.companyName}
                  </button>
                )) : null}
            </div>
          </div>
        </section>

        {sourceNotices.length ? (
          <section className="disclosure-source-notice" aria-label="공시 데이터 상태">
            <RefreshCw size={18} />
            <div>
              {sourceNotices.map((message) => <strong key={message}>{message}</strong>)}
            </div>
          </section>
        ) : null}

        {filteredItems.length ? (
          <section className="disclosure-card-grid" aria-label="공시 목록">
            {filteredItems.map((item) => (
              item.source === 'opendart'
                ? <DisclosureCard key={`dart-${item.id}`} disclosure={item.disclosure} />
                : <SecFilingCard key={`sec-${item.id}`} filing={item.filing} />
            ))}
          </section>
        ) : (
          <section className="disclosure-empty-state">
            <CheckCircle size={18} />
            <strong>선택한 조건에 맞는 새 공식 공시가 없습니다.</strong>
          </section>
        )}
      </main>
    </div>
  );
}

function PickDisclosurePanel({
  pick,
  disclosures,
  secFilings,
}: {
  pick: StockAutopsyPick;
  disclosures: MarketDisclosureApiResponse;
  secFilings: MarketSecFilingsApiResponse;
}) {
  const trackedCompany = findDartTrackedCompanyByTicker(pick.ticker);
  const secTrackedCompany = findSecTrackedCompanyByTicker(pick.ticker);
  if (!trackedCompany && !secTrackedCompany) return null;

  if (secTrackedCompany) {
    const recentSecItems = secFilings.items
      .filter((item) => item.ticker === secTrackedCompany.ticker)
      .sort((a, b) => b.filedAt.localeCompare(a.filedAt))
      .slice(0, 3);
    const stateMessage = secFilingStateMessage(secFilings);

    return (
      <section className="pick-recent-disclosures" aria-labelledby="pick-recent-sec-filings-title">
        <div className="pick-recent-disclosures-head">
          <FileSearch size={17} />
          <div>
            <h2 id="pick-recent-sec-filings-title">최근 SEC 공시</h2>
            <p>{secFilingSyncLabel(secFilings)}</p>
          </div>
        </div>
        {stateMessage ? (
          <p className="pick-disclosure-empty">{stateMessage}</p>
        ) : recentSecItems.length ? (
          <div className="pick-recent-disclosure-list">
            {recentSecItems.map((filing) => (
              <a key={filing.accessionNumber} href={filing.sourceUrl} target="_blank" rel="noopener noreferrer">
                <span>{filing.formType} · {secFilingCategoryLabels[filing.category]} · {formatKstDate(filing.filedAt)}</span>
                <strong>{filing.companyName} SEC 원문 보기</strong>
                <SecFilingDetailSummary filing={filing} compact />
                {isSecAmendedFiling(filing.formType) ? <small>수정 공시 · 원본과 함께 확인</small> : null}
              </a>
            ))}
          </div>
        ) : (
          <p className="pick-disclosure-empty">최근 30일 새 SEC 공시가 없습니다.</p>
        )}
      </section>
    );
  }

  if (!trackedCompany) return null;

  const recentItems = disclosures.items
    .filter((item) => item.ticker === trackedCompany.ticker)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
    .slice(0, 3);
  const stateMessage = disclosureStateMessage(disclosures);

  return (
    <section className="pick-recent-disclosures" aria-labelledby="pick-recent-disclosures-title">
      <div className="pick-recent-disclosures-head">
        <FileSearch size={17} />
        <div>
          <h2 id="pick-recent-disclosures-title">최근 공식 공시</h2>
          <p>{disclosureSyncLabel(disclosures)}</p>
        </div>
      </div>
      {stateMessage ? (
        <p className="pick-disclosure-empty">{stateMessage}</p>
      ) : recentItems.length ? (
        <div className="pick-recent-disclosure-list">
          {recentItems.map((disclosure) => (
            <a key={disclosure.receiptNumber} href={disclosure.sourceUrl} target="_blank" rel="noopener noreferrer">
              <span>{disclosureCategoryLabels[disclosure.category]} · {formatKstDate(disclosure.receivedAt)}</span>
              <strong>{disclosure.reportName}</strong>
              <small>{disclosureCheckpoints[disclosure.category]}</small>
            </a>
          ))}
        </div>
      ) : (
        <p className="pick-disclosure-empty">최근 7일 새 공시가 없습니다.</p>
      )}
    </section>
  );
}

function isQuarterlyHoldingReport(move: SmartMoneyMove) {
  return move.action === 'holding' || move.sourceLabel.includes('13F') || move.investorType === 'fund';
}

function isCongressTradeReport(move: SmartMoneyMove) {
  return move.investorType === 'us-politician' || move.sourceLabel.toLowerCase().includes('congress');
}

function publicReportActionLabel(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) return '13F 보유 변화';
  if (isCongressTradeReport(move)) return `공개 거래 보고${move.actionLabel ? ` · ${move.actionLabel}` : ''}`;
  return move.actionLabel;
}

function publicReportDateLabel(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) return '보고 기준일';
  if (isCongressTradeReport(move)) return '보고된 거래일';
  return '거래일';
}

function publicReportDateFallback(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) return '분기 기준일 확인 필요';
  return '공개 자료에서 확인 필요';
}

function publicReportDelayNote(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) {
    return '13F는 분기 말 기관 보유 현황이며 실제 매수·매도 시점과 차이가 있습니다.';
  }
  if (isCongressTradeReport(move)) {
    return '국회의원 거래는 공개된 거래 보고 기준이며 실제 매매일과 공개일이 다를 수 있습니다.';
  }
  if (move.isDelayedDisclosure) return '공개 자료 기준이며 실제 매매 시점과 차이가 있을 수 있습니다.';
  return move.note;
}

function publicReportTypeBadge(move: SmartMoneyMove) {
  if (isQuarterlyHoldingReport(move)) return '13F 보유 보고';
  if (isCongressTradeReport(move)) return '공개 거래 보고';
  if (move.investorType === 'insider') return 'Form 4 내부자 거래';
  return move.investorTypeLabel;
}

function SourceReportAction({ move }: { move: SmartMoneyMove }) {
  if (move.sourceUrl) {
    return (
      <a href={move.sourceUrl} target="_blank" rel="noreferrer">
        출처 보기
      </a>
    );
  }

  return <span className="source-pending-action">출처 준비 중</span>;
}

function parsePercentValue(value: string) {
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function topicParticle(value: string) {
  const trimmed = value.trim();
  const last = trimmed[trimmed.length - 1];
  if (!last) return '는';
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return '는';
  return (code - 0xac00) % 28 === 0 ? '는' : '은';
}

function directionParticle(value: string) {
  const trimmed = value.trim();
  const last = trimmed[trimmed.length - 1];
  if (!last) return '로';
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return '로';
  const finalConsonant = (code - 0xac00) % 28;
  return finalConsonant === 0 || finalConsonant === 8 ? '로' : '으로';
}

function getDisplayMetrics(company: Company): CompanyDisplayMetrics {
  const filingAnalysis = getCompanyFilingAnalysis(company);
  if (filingAnalysis) {
    return filingAnalysis.displayMetrics;
  }

  const isSeed = company.sourceType === 'seed-model';
  if (isSeed) {
    return {
      revenue: '공식 공시 기준 확인 필요',
      revenueUnit: '출처 확인 전 금액 미표시',
      revenueBasis: '원문 보고서 또는 공식 IR이 연결되기 전에는 스크리닝 숫자를 실제 매출처럼 표시하지 않습니다.',
      growth: '확인 필요',
      growthBasis: '전년 대비 성장률은 공식 공시 원문 연결 후 표시합니다.',
      opMargin: '확인 필요',
      debtRatio: '확인 필요',
    };
  }
  return {
    revenue: company.revenue,
    revenueUnit: company.revenueUnit,
    revenueBasis: company.revenueBasis,
    growth: `${company.revenueTrend > 0 ? '+' : ''}${company.revenueTrend.toFixed(1)}%`,
    growthBasis: company.growthBasis,
    opMargin: company.opMargin,
    debtRatio: company.debtRatio,
  };
}

function buildCompanyDisclosureAnalysis(company: Company, anchor?: AnchorCompany): CompanyDisclosureAnalysis {
  const curated = getCompanyFilingAnalysis(company);
  if (curated) {
    return {
      ...curated,
      isCurated: true,
      statusLabel: company.country === 'KR' ? 'DART 원문 분석 완료' : 'SEC 원문 분석 완료',
      statusDetail:
        company.country === 'KR'
          ? '손익계산서, 재무상태표, 현금흐름표, 감사·검토 기록을 실제 공시 숫자로 해석했습니다.'
          : '손익계산서, 재무상태표, 현금흐름표, 감사의견, MD&A를 실제 공시 숫자로 해석했습니다.',
    };
  }

  const primaryReportLink = getPrimaryReportLink(company);
  const displayMetrics = getDisplayMetrics(company);
  const revenueDisplay = revenueDisplayForCompany(company, displayMetrics);
  const regulator = company.country === 'KR' ? 'DART' : 'SEC';
  const reportName = company.country === 'KR' ? '사업보고서·분기보고서' : '10-K·10-Q';
  const managementSection = company.country === 'KR' ? '감사보고서와 주석' : 'MD&A와 Notes';
  const directCustomer = company.tier === 'anchor' ? '섹터 기준 기업' : `${anchor?.name ?? company.anchorCustomer} 관련 후보`;
  const concentration = parsePercentValue(company.customerConcentration);
  const concentrationText =
    concentration === undefined
      ? '고객 집중도는 원문에서 별도 확인해야 합니다.'
      : concentration >= 60
        ? `고객집중도 ${company.customerConcentration}로 표시되어 있어 특정 고객 투자 사이클에 민감한 편입니다.`
        : `고객집중도 ${company.customerConcentration}로 표시되어 있어 원문에서 주요 고객 비중이 실제로 낮아지는지 확인합니다.`;
  const debt = parsePercentValue(company.debtRatio);
  const debtText =
    debt === undefined
      ? '부채 부담은 원문 재무상태표에서 유동부채와 차입금을 다시 확인해야 합니다.'
      : debt >= 100
        ? `부채비율 ${company.debtRatio}라면 수주가 늘어도 이자비용과 운전자본 부담을 먼저 확인해야 합니다.`
        : `부채비율 ${company.debtRatio} 기준으로는 과도한 레버리지보다 매출 회수와 재고 회전이 더 중요한 체크포인트입니다.`;

  return {
    reportTitle: `${company.name} 회사별 공시 분석`,
    reportDate: `${regulator} ${reportName} 원문 연결형 · ${company.sourceType === 'seed-model' ? '후보 스크리닝 데이터' : '공시 데이터'} 기준`,
    sourceLabel: primaryReportLink.label,
    sourceUrl: primaryReportLink.url,
    displayMetrics,
    headline: `${company.name}${topicParticle(company.name)} ${directCustomer}${directionParticle(directCustomer)}, ${company.sector} 매출이 실제 공시에서 확인되는지가 핵심입니다.`,
    verdict:
      company.sourceType === 'seed-model'
        ? `현재 숫자는 ${company.name}을 빠르게 비교하기 위한 스크리닝 값입니다. 분석 화면은 ${regulator} 원문에서 매출, 영업현금흐름, 감사·주석을 확정해 읽도록 구성했습니다.`
        : `${company.name}의 공시 기반 숫자를 ${regulator} 원문과 대조해 매출 성장, 현금 회수, 재무 부담을 함께 확인합니다.`,
    insights: [
      {
        title: '손익 흐름',
        kicker: `${displayMetrics.growth} · ${company.sector}`,
        body: `${company.name}의 표시 매출은 ${revenueDisplay.primary}이고 기준은 ${revenueDisplay.sourceUnit}입니다. 성장률은 ${displayMetrics.growthBasis} 기준으로 표시됩니다.`,
        point: `${company.products.slice(0, 3).join(', ')} 매출이 실제 원문 주석에서 늘었는지 확인해야 합니다. 단순 수주 뉴스보다 공시 매출 인식 시점이 더 중요합니다.`,
      },
      {
        title: '현금흐름',
        kicker: '이익이 현금으로 바뀌는지',
        body: `${company.name}은 ${company.products.slice(0, 2).join('·') || company.sector} 노출 기업입니다. 원문에서 순이익보다 영업현금흐름이 약하면 매출채권 회수 지연, 재고 증가, 선급금·계약부채 변화를 확인해야 합니다.`,
        point: `${concentrationText} ${company.anchorCustomer} 쪽 수요가 실제 현금 회수로 이어지는지가 다음 분기 핵심입니다.`,
      },
      {
        title: '투자·설비',
        kicker: `${company.products[0] ?? company.sector} 투자 확인`,
        body: `${company.sector} 기업은 성장 구간에서 설비, 장비, 개발비, 데이터센터, 생산능력 투자가 먼저 늘 수 있습니다. 원문의 투자활동현금흐름과 유형·무형자산 증가를 같이 봐야 합니다.`,
        point: `투자가 늘면 단기 현금은 줄지만 미래 매출 기반이 될 수 있습니다. 반대로 매출 증가 없이 재고와 투자만 늘면 부담으로 바뀝니다.`,
      },
      {
        title: company.country === 'KR' ? '감사·주석' : 'MD&A·주석',
        kicker: managementSection,
        body: `${company.name}의 리스크 표시는 ${riskLabels[company.riskLevel]}입니다. 원문에서는 계속기업 불확실성, 강조사항, 핵심감사사항, 고객·재고·매출채권 주석을 먼저 확인해야 합니다.`,
        point: `${debtText} 숫자가 좋아 보여도 감사인이 강조한 항목과 경영진 설명이 같은 방향인지 확인합니다.`,
      },
    ],
    watchPoints: [
      `${regulator}에서 ${company.legalName}의 최신 ${reportName} 원문을 열고 연결 기준 매출, 영업이익, 순이익을 확인합니다.`,
      `성장률 기준은 ${displayMetrics.growthBasis}입니다. 화면 숫자가 스크리닝이면 원문 숫자로 교체해 전년 동기 또는 전 회계연도와 다시 비교합니다.`,
      `현금흐름표에서 영업현금흐름, 매출채권, 재고, 계약부채가 ${company.name}의 매출 방향과 같이 움직이는지 봅니다.`,
      `${company.anchorCustomer} 관련 뉴스와 수주 공시가 실제 매출 인식, 재고 감소, 현금 회수로 이어지는지 확인합니다.`,
    ],
    auditNotes: [
      `${company.country === 'KR' ? 'DART 감사보고서' : 'SEC auditor report'}에서 감사의견, 내부통제 의견, 계속기업 불확실성 여부를 확인합니다.`,
      `${company.name}의 핵심감사사항은 매출 인식, 재고 평가, 손상, 충당부채처럼 ${company.sector} 사업 특성과 연결된 항목을 우선 봅니다.`,
      '이 화면은 회사별 원문 확인 순서를 고정해 둔 구조입니다. 원문 수치가 반영된 기업은 위 카드처럼 실제 금액과 해석으로 계속 확장됩니다.',
    ],
    isCurated: false,
    statusLabel:
      primaryReportLink.status === 'direct'
        ? `${regulator} 원문 연결됨 · 분석 준비 중`
        : primaryReportLink.status === 'search-only'
          ? `${regulator} 검색 링크만 연결됨`
          : primaryReportLink.status === 'private-company'
            ? '비상장/공시 의무 없음'
            : primaryReportLink.status === 'no-public-filing'
              ? '공개 원문 보고서 없음'
              : primaryReportLink.status === 'listing-unknown'
                ? '상장 정보 확인 필요'
                : `${regulator} 원문 연결 필요`,
    statusDetail:
      primaryReportLink.status === 'direct'
        ? '직접 원문 버튼은 연결되어 있지만, 아직 실제 원문 숫자를 회사별 해설에 완전히 반영하지 않은 상태입니다.'
        : primaryReportLink.status === 'search-only'
          ? '직접 원문 URL은 아직 없고 검색 링크만 연결되어 있습니다. 원문 확인 후 reportUrl을 추가하면 바로 직접 연결됩니다.'
          : primaryReportLink.status === 'private-company' || primaryReportLink.status === 'no-public-filing'
            ? '공개 공시 원문이 확인되지 않아 매출 숫자를 공식 매출처럼 표시하지 않습니다.'
            : primaryReportLink.status === 'listing-unknown'
              ? '상장 여부와 공시 식별자가 불완전해 원문 보고서를 연결하지 않았습니다.'
              : '아직 실제 원문 숫자를 직접 반영하지 않은 기업입니다. 화면의 스크리닝 값을 공시 원문으로 검증하도록 표시했습니다.',
  };
}

type AnalysisPageProps = {
  company: Company;
  anchor?: AnchorCompany;
  newsState: NewsState;
  onHome: () => void;
  onBack: (company?: Company) => void;
  onOpenAnalysis: (company: Company, anchor?: string) => void;
  onRefreshNews: () => void;
  marketPrices: MarketPrice[];
};

type LandingPageProps = {
  onHome: () => void;
  onOpenMarketMapLibrary: () => void;
  onOpenPicks: () => void;
  onOpenDisclosures: () => void;
  onOpenReports: (reportId?: string) => void;
  onOpenCategory: (sectorId: string, selectedCompanyId?: string) => void;
  onOpenPick: (pick: StockAutopsyPick) => void;
  marketPrices: MarketPrice[];
  disclosures: MarketDisclosureApiResponse;
  secFilings: MarketSecFilingsApiResponse;
};

function LandingPage({ onHome, onOpenMarketMapLibrary, onOpenPicks, onOpenDisclosures, onOpenReports, onOpenCategory, onOpenPick, marketPrices, disclosures, secFilings }: LandingPageProps) {
  const featuredPick = stockAutopsyPicks.find((pick) => pick.id === currentWeeklyDigest.featuredPickId);
  const featuredCompany = featuredPick ? pickMainCompany(featuredPick) : undefined;
  const featuredConnection = featuredCompany ? companyConnectionState(featuredCompany) : undefined;
  const featuredMovementLabel = featuredPick?.movementDirection === 'down' ? '급락' : '급등';
  const featuredRelatedCompanies = (featuredPick?.connectedLeaders ?? []).slice(0, 3);
  const featuredPickPrice = featuredPick ? getPriceForPick(featuredPick, marketPrices) : null;
  const weeklyCompactPicks = weeklyStockAutopsyPicks().slice(0, 4);
  const recentOfficialItems = officialDisclosureFeedItems(disclosures.items, secFilings.items).slice(0, 6);
  const homeMarketMaps = currentWeeklyDigest.marketMapItems.filter((item) => item.status === 'active').slice(0, 3);
  const latestReports = industryReports
    .filter(isCurrentPublicReport)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
    .slice(0, 3);

  const openWeeklyPick = () => {
    if (featuredPick) {
      onOpenPick(featuredPick);
      return;
    }
    onOpenPicks();
  };

  return (
    <div className="home-shell story-dark-shell story-home-shell" id="top">
      <PrimaryNavigation
        active="today"
        variant="home"
        onHome={onHome}
        onOpenPicks={onOpenPicks}
        onOpenMarketMap={onOpenMarketMapLibrary}
        onOpenDisclosures={onOpenDisclosures}
        onOpenReports={onOpenReports}
      />

      <main>
        <section className="home-hero mvp-hero editorial-feed-hero">
          <div className="home-hero-copy editorial-hero-copy">
            <p className="home-kicker">{currentWeeklyDigest.kicker}</p>
            <h1>{currentWeeklyDigest.headline}</h1>
            <p>{currentWeeklyDigest.subheadline}</p>
            <p className="home-mvp-note">
              <span>원문 기준</span>
              {currentWeeklyDigest.sourceNote}
            </p>
          </div>
          <article className="weekly-autopsy-card" aria-label="이번 주 대표 해부">
            <div className="weekly-autopsy-topline">
              <span>대표 해부</span>
              <span>{currentWeeklyDigest.featured.marketLabel}</span>
              <span>{currentWeeklyDigest.featured.theme}</span>
              <span>{featuredMovementLabel}</span>
              {featuredConnection ? <span>{featuredConnection.label}</span> : null}
            </div>
            {featuredPick ? (
              <div className="weekly-price-row">
                <PriceBadge price={featuredPickPrice} compact />
              </div>
            ) : null}
            <div className="weekly-autopsy-story-head">
              <span className="weekly-autopsy-marker" aria-hidden="true">
                <FileSearch size={18} />
              </span>
              <div>
                <p className="weekly-autopsy-meta-line">{currentWeeklyDigest.featured.meta}</p>
                <h2>{currentWeeklyDigest.featured.question}</h2>
              </div>
            </div>
            <p className="weekly-autopsy-lead">{currentWeeklyDigest.featured.headline}</p>
            <p className="weekly-autopsy-body">{currentWeeklyDigest.featured.summary}</p>
            <div className="weekly-autopsy-reading-list" aria-label="대표 해부 요약">
              <section>
                <span>같이 볼 회사</span>
                <div className="weekly-pill-row">
                  {featuredRelatedCompanies.map((companyName) => (
                    <em key={companyName}>{companyName}</em>
                  ))}
                </div>
              </section>
              <section>
                <span>숫자 3개</span>
                <ol>
                  {currentWeeklyDigest.featured.metricLabels.map((metric) => (
                    <li key={metric}>{metric}</li>
                  ))}
                </ol>
              </section>
            </div>
            <button type="button" className="weekly-primary-action" onClick={openWeeklyPick}>
              {currentWeeklyDigest.featured.primaryCtaLabel}
              <ArrowRight size={16} />
            </button>
          </article>
        </section>

        <TodayOverview
          marketPrices={marketPrices}
          disclosures={disclosures}
          secFilings={secFilings}
          onOpenPicks={onOpenPicks}
          onOpenDisclosures={onOpenDisclosures}
        />

        <section className="home-dashboard-section" aria-labelledby="home-weekly-picks-title">
          <div className="home-dashboard-head">
            <div>
              <span>이번 주 Pick</span>
              <h2 id="home-weekly-picks-title">짧게 보고, 필요하면 해부로 들어갑니다</h2>
            </div>
            <button type="button" onClick={onOpenPicks}>
              전체 보기
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="home-compact-pick-grid">
            {weeklyCompactPicks.map((pick) => (
              <article className="home-compact-pick-card" key={pick.id}>
                <div className="card-company-row">
                  <div className="card-company-copy">
                    <CompanyIdentityForPick pick={pick} size="compact" />
                  </div>
                  <div className="card-status">
                    <span className={`home-status-pill ${pick.movementDirection}`}>{pick.movementDirection === 'up' ? '상승' : '하락'}</span>
                  </div>
                </div>
                <h3>{pick.title}</h3>
                <PriceBadge price={getPriceForPick(pick, marketPrices)} compact />
                <strong className="home-card-one-line">{pick.movementLabel}</strong>
                <p>{pick.reasonSummary}</p>
                <button type="button" onClick={() => onOpenPick(pick)}>
                  해부 보기
                  <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="home-dashboard-section" aria-labelledby="home-disclosures-title">
          <div className="home-dashboard-head">
            <div>
              <span>최근 공식 공시</span>
              <h2 id="home-disclosures-title">공식 원문에서 새로 확인할 것</h2>
            </div>
            <button type="button" onClick={onOpenDisclosures}>
              전체 보기
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="home-official-feed">
            {recentOfficialItems.length ? recentOfficialItems.map((item) => {
              const isDart = item.source === 'opendart';
              const companyName = isDart ? item.disclosure.companyName : item.filing.companyName;
              const ticker = isDart ? item.disclosure.ticker : item.filing.ticker;
              const kind = isDart
                ? disclosureCategoryLabels[item.disclosure.category]
                : `${item.filing.formType} · ${secFilingCategoryLabels[item.filing.category]}`;
              const checkpoint = isDart
                ? disclosureCheckpoints[item.disclosure.category]
                : secFilingCheckpoints[item.filing.category];
              const filedAt = isDart ? item.disclosure.receivedAt : item.filing.filedAt;
              return (
                <article className="home-official-card" key={`${item.source}-${item.id}`}>
                  <span className="home-source-pill">{isDart ? '한국 공시 · OpenDART' : '미국 공시 · SEC EDGAR'}</span>
                  <div className="card-company-row">
                    <div className="card-company-copy">
                      <CompanyIdentity companyName={companyName} ticker={ticker} countryLabel={isDart ? '한국' : '미국'} size="compact" />
                    </div>
                  </div>
                  <strong>{kind}</strong>
                  <p>{checkpoint}</p>
                  <time dateTime={filedAt}>{formatKstDate(filedAt)}</time>
                </article>
              );
            }) : (
              <article className="home-official-card">
                <span className="home-source-pill">공식 공시</span>
                <strong>새 공시 없음</strong>
                <p>현재 선택 범위에서 새 공식 공시가 없습니다.</p>
              </article>
            )}
          </div>
        </section>

        <section className="home-dashboard-section" aria-labelledby="home-market-map-title">
          <div className="home-dashboard-head">
            <div>
              <span>시장을 연결해서 보기</span>
              <h2 id="home-market-map-title">대표 시장지도만 먼저 봅니다</h2>
            </div>
            <button type="button" onClick={onOpenMarketMapLibrary}>
              전체 보기
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="home-market-map-grid">
            {homeMarketMaps.map((item) => {
              const display = marketMapDisplayCopy(item);
              return (
                <article className="home-market-map-card" key={item.title}>
                  <span>{display.subtitle}</span>
                  <h3>{display.title}</h3>
                  <p>{item.note}</p>
                  <button type="button" onClick={() => {
                    const sectorId = marketMapItemSectorId(item);
                    if (sectorId) onOpenCategory(sectorId);
                    else onOpenMarketMapLibrary();
                  }}>
                    시장지도 보기
                    <ArrowRight size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-dashboard-section" aria-labelledby="home-reports-title">
          <div className="home-dashboard-head">
            <div>
              <span>최신 보고서</span>
              <h2 id="home-reports-title">산업 배경은 보고서에서 짧게 확인합니다</h2>
            </div>
            <button type="button" onClick={() => onOpenReports()}>
              전체 보기
              <ArrowRight size={15} />
            </button>
          </div>
          <div className="home-report-grid">
            {latestReports.map((report) => (
              <article className="home-report-card" key={report.id}>
                <span>{report.firm} · {reportPublishedLabel(report)}</span>
                <h3>{report.title}</h3>
                <p>{report.keyIdeas[0]}</p>
                <button type="button" onClick={() => onOpenReports(report.id)}>
                  보고서 보기
                  <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

type StockAutopsyPicksPageProps = {
  selectedPickId?: string;
  isArchive?: boolean;
  onHome: () => void;
  onOpenMarketMap: () => void;
  onOpenCategory: (sectorId: string, selectedCompanyId?: string) => void;
  onOpenAnalysis: (company: Company, anchor?: string) => void;
  onOpenPick: (pick: StockAutopsyPick) => void;
  onOpenPicks: () => void;
  onOpenPicksArchive: () => void;
  onOpenReports: (reportId?: string) => void;
  onOpenDisclosures: () => void;
  marketPrices: MarketPrice[];
  disclosures: MarketDisclosureApiResponse;
  secFilings: MarketSecFilingsApiResponse;
};

type MarketMapLibraryPageProps = {
  onHome: () => void;
  onOpenPicks: () => void;
  onOpenDisclosures: () => void;
  onOpenCategory: (sectorId: string, selectedCompanyId?: string) => void;
  onOpenReports: (reportId?: string) => void;
};

const valueChainSteps = ['원재료', '부품', '장비', '제조', '대장주/최종수요'];

const valueChainPositionLabel: Record<StockAutopsyPick['valueChainPosition'], string> = {
  leader: '대장주',
  supplier: '부품',
  materials: '소재',
  equipment: '장비',
  customer: '고객사',
  competitor: '경쟁사',
  other: '관심 구간',
};

const valueChainStepByPosition: Record<StockAutopsyPick['valueChainPosition'], string> = {
  leader: '대장주/최종수요',
  supplier: '부품',
  materials: '원재료',
  equipment: '장비',
  customer: '대장주/최종수요',
  competitor: '제조',
  other: '제조',
};

function pickMarketLabel(pick: StockAutopsyPick) {
  return pick.market === 'KR' ? '한국' : '미국';
}

function pickFlowLabel(pick: StockAutopsyPick) {
  return pick.flowLabel ?? pick.sector;
}

function pickFlowStage(pick: StockAutopsyPick) {
  return pick.flowStage ?? valueChainPositionLabel[pick.valueChainPosition];
}

function pickMainCompany(pick: StockAutopsyPick) {
  return (
    companies.find((company) => company.id === pick.companyId) ??
    companies.find((company) => company.id === pick.relatedCompanyId) ??
    companies.find((company) => company.ticker === pick.ticker)
  );
}

function pickRelatedCompanyList(pick: StockAutopsyPick) {
  const byIds = (pick.relatedCompanyIds ?? [])
    .map((id) => companies.find((company) => company.id === id))
    .filter((company): company is Company => Boolean(company));
  const byNames = [...pick.connectedLeaders, ...pick.relatedCompanies]
    .map((name) =>
      companies.find((company) => company.name === name || company.legalName === name || company.ticker === name),
    )
    .filter((company): company is Company => Boolean(company));
  return [...byIds, ...byNames].filter(
    (company, index, list) => list.findIndex((item) => item.id === company.id || item.name === company.name) === index,
  );
}

function pickWatchMetricCards(pick: StockAutopsyPick, company?: Company) {
  if (pick.watchMetrics?.length) return pick.watchMetrics.map((metric) => ({ ...metric, value: '원문 확인' }));
  if (!company) {
    return [
      { label: '매출 성장률', note: '이슈가 실제 판매 증가로 이어졌는지 봅니다.', value: '데이터 연결 필요' },
      { label: '영업이익률', note: '많이 팔아도 비용을 빼고 남는 힘이 있는지 봅니다.', value: '데이터 연결 필요' },
      { label: '영업현금흐름', note: '장부상 이익이 실제 현금으로 들어오는지 확인합니다.', value: '데이터 연결 필요' },
    ];
  }
  return beginnerIndustryMetrics(company, getDisplayMetrics(company));
}

function pickSignalSet(pick: StockAutopsyPick, company?: Company) {
  if (pick.goodSignals?.length || pick.cautionSignals?.length) {
    return {
      good: pick.goodSignals?.length ? pick.goodSignals : ['관련 수요가 매출로 연결', '마진 유지', '현금흐름 개선'],
      caution: pick.cautionSignals?.length ? pick.cautionSignals : ['수요 둔화', '비용 증가', '현금흐름 약화'],
    };
  }
  return company ? beginnerSignalSet(company) : beginnerSignalSet({ valueChainStage: pickFlowStage(pick) } as Company);
}

function pickRelationCopy(company: Company, pick: StockAutopsyPick) {
  if (company.id === pick.relatedCompanyId || company.id === pick.companyId) return '이번 Pick의 중심 기업입니다.';
  if (company.relationshipSummary) return company.relationshipSummary;
  return `${companyValueChainStage(company)} 흐름에서 같이 볼 기업입니다. 직접 거래 여부는 공시·IR로 확인합니다.`;
}

function currentWeeklyPickIds() {
  return new Set(contentCurrentWeeklyPickIds);
}

function weeklyStockAutopsyPicks() {
  return contentCurrentWeeklyPicks;
}

function archivedStockAutopsyPicks() {
  return contentArchivedStockAutopsyPicks;
}

function archivedStockAutopsyPickGroups() {
  return contentArchivedStockAutopsyPickGroups;
}

function marketMapItemSectorId(item: { href?: string; sectorId?: string }) {
  if (item.sectorId) return item.sectorId;
  const categoryMatch = item.href?.match(/\/category\/([^/?#]+)/);
  return categoryMatch?.[1] ? decodeURIComponent(categoryMatch[1]) : undefined;
}

const marketMapDisplayLabels: Record<string, { title: string; subtitle: string }> = {
  'us-semiconductors': {
    title: 'AI 서버는 누가 만드는가',
    subtitle: '반도체 · 서버 · 메모리',
  },
  'datacenter-power-cooling': {
    title: '데이터센터 전력은 어디서 오는가',
    subtitle: '전력 · 냉각 · 인프라',
  },
  'semiconductor-cluster-infrastructure': {
    title: '반도체 공장에는 무엇이 필요한가',
    subtitle: '건설 · 전력 · 용수 · 소재',
  },
  'reconstruction-infrastructure': {
    title: '재건 수요는 어떤 기업으로 이어지는가',
    subtitle: '건설 · 중장비 · 기반시설',
  },
};

function marketMapDisplayCopy(item: { title: string; href?: string; sectorId?: string }) {
  const sectorId = marketMapItemSectorId(item);
  const display = sectorId ? marketMapDisplayLabels[sectorId] : undefined;
  return {
    title: display?.title ?? item.title,
    subtitle: display?.subtitle ?? item.title,
  };
}

const reportMapLabels: Record<string, string> = {
  'us-semiconductors': 'AI 반도체 / 데이터센터',
  'datacenter-power-cooling': '데이터센터 냉각 / 전력 인프라',
  'reconstruction-infrastructure': '재건 / 인프라',
  'semiconductor-cluster-infrastructure': '반도체 클러스터 / 산업단지 인프라',
};

function isCurrentPublicReport(report: IndustryReport) {
  return report.accessType === 'public'
    && report.editionStatus === 'current'
    && (report.sourceStatus === 'available' || report.sourceStatus === 'redirected');
}

function industryReportSourceUrl(report: IndustryReport) {
  return report.sourceStatus === 'redirected' && report.canonicalUrl ? report.canonicalUrl : report.url;
}

function reportPublishedLabel(report: IndustryReport) {
  return report.publishedLabel ?? report.publishedYear ?? '발행 시점 확인 필요';
}

function reportsForMap(mapId: string) {
  return industryReports.filter((report) => isCurrentPublicReport(report) && report.relatedMaps.includes(mapId));
}

function reportsForPick(pickId: string) {
  return industryReports.filter((report) => isCurrentPublicReport(report) && report.relatedPicks.includes(pickId));
}

const evidenceSourceTypeLabels: Record<EvidenceSourceType, string> = {
  'industry-report': '산업 보고서',
  'company-filing': '공시',
  'company-ir': '회사 IR',
  'official-announcement': '공식 자료',
  news: '뉴스',
};

const evidenceEnabledPickIds = new Set([
  ...Object.values(marketMapEvidencePickIds).flat(),
  'pick-huntsman-olin-merger-exchange-ratio',
  'pick-uniqure-amt130-fda-regulatory-path',
  'pick-dongyang-pile-semiconductor-cluster-infrastructure',
  'pick-kcc-silicone-margin-asset-value',
  'pick-hertz-used-car-depreciation-financing',
  'pick-jeju-semiconductor-export-fabless-rally',
]);

function evidencePublishedLabel(value?: string) {
  if (!value) return undefined;
  const match = value.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!match) return value;
  return match[3]
    ? `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일`
    : `${match[1]}년 ${Number(match[2])}월`;
}

function evidenceSourceIdentity(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, '');
  if (hostname === 'sec.gov') return { type: 'company-filing' as const, publisher: 'SEC' };
  if (hostname === 'dart.fss.or.kr') return { type: 'company-filing' as const, publisher: 'OpenDART' };
  if (hostname === 'ir.supermicro.com') return { type: 'company-ir' as const, publisher: 'Super Micro Computer' };
  if (hostname === 'investors.micron.com') return { type: 'company-ir' as const, publisher: 'Micron' };
  if (hostname === 'lge.co.kr' || hostname === 'lg.com') return { type: 'official-announcement' as const, publisher: 'LG전자' };
  if (hostname === 'hdec.kr') return { type: 'official-announcement' as const, publisher: '현대건설' };
  if (hostname === 'yna.co.kr') return { type: 'news' as const, publisher: '연합뉴스' };
  if (hostname === 'marketwatch.com') return { type: 'news' as const, publisher: 'MarketWatch' };
  return { type: 'news' as const, publisher: hostname };
}

function reportEvidenceSources(reports: IndustryReport[]): EvidenceSource[] {
  return reports.map((report) => ({
    id: `industry-report-${report.id}`,
    type: 'industry-report',
    title: report.title,
    publisher: report.firm,
    publishedAt: report.publishedAt,
    publishedLabel: reportPublishedLabel(report),
    url: industryReportSourceUrl(report),
    note: '산업 구조와 시장 흐름을 이해하기 위한 참고 자료이며 특정 기업의 계약이나 실적을 보장하지 않습니다.',
    relatedReportId: report.id,
  }));
}

function pickLinkEvidenceSources(pick: StockAutopsyPick): EvidenceSource[] {
  return (pick.sourceLinks ?? []).flatMap((source, index) => {
    if (!source.url || source.accessType === 'restricted') return [];
    const identity = source.type && source.publisher
      ? { type: source.type, publisher: source.publisher }
      : evidenceSourceIdentity(source.url);
    return [{
      id: `${pick.id}-source-${index + 1}`,
      type: identity.type,
      title: source.label,
      publisher: identity.publisher,
      url: source.url,
      note: source.note,
    }];
  });
}

function pickFilingEvidenceSource(pick: StockAutopsyPick): EvidenceSource | undefined {
  const company = pickMainCompany(pick);
  if (!company) return undefined;
  const reportLink = getPrimaryReportLink(company);
  if (!reportLink.isDirect || !reportLink.isNavigable) return undefined;
  return {
    id: `${pick.id}-company-filing`,
    type: 'company-filing',
    title: reportLink.label,
    publisher: reportLink.regulator,
    publishedAt: company.filingDate,
    publishedLabel: evidencePublishedLabel(company.filingDate),
    url: reportLink.url,
    note: reportLink.note,
  };
}

function uniqueEvidenceSources(sources: EvidenceSource[]) {
  return sources.filter((source, index, list) => list.findIndex((item) => item.url === source.url) === index);
}

function evidenceGroupsForPicks(picks: StockAutopsyPick[], reports: IndustryReport[]): EvidenceGroup[] {
  const linkedSources = picks.flatMap(pickLinkEvidenceSources);
  const filingSources = picks.map(pickFilingEvidenceSource).filter((source): source is EvidenceSource => Boolean(source));
  const groups: EvidenceGroup[] = [
    {
      id: 'industry-structure',
      title: '산업 구조',
      description: '산업의 연결 구조와 장기 흐름을 이해하는 참고 자료입니다.',
      sources: reportEvidenceSources(reports),
    },
    {
      id: 'company-activity',
      title: '기업·사업 확인',
      description: '기업 활동과 재무 숫자는 회사 발표와 공시 원문에서 확인합니다.',
      sources: uniqueEvidenceSources([
        ...filingSources,
        ...linkedSources.filter((source) => source.type !== 'news'),
      ]),
    },
    {
      id: 'issue-market',
      title: '이슈·시장 확인',
      description: '사건과 시장 반응은 연결된 보도 원문에서 확인합니다.',
      sources: uniqueEvidenceSources(linkedSources.filter((source) => source.type === 'news')),
    },
  ];
  return groups.filter((group) => group.sources.length > 0);
}

function evidenceGroupsForPick(pick: StockAutopsyPick) {
  const groups = evidenceGroupsForPicks([pick], reportsForPick(pick.id));
  const linkedSources = pickLinkEvidenceSources(pick);
  const groupsWithoutEmptySources = (items: EvidenceGroup[]) => items.filter((group) => group.sources.length > 0);

  if (pick.id === 'pick-dongyang-pile-semiconductor-cluster-infrastructure') {
    const officialSources = linkedSources.filter((source) => source.type !== 'news');
    const marketSources = linkedSources.filter((source) => source.type === 'news');
    return groupsWithoutEmptySources([
      {
        id: 'dongyang-policy-business',
        title: '정책·사업 확인',
        description: 'PHC 파일 사업과 공식 공시는 확인하되, 클러스터 기대는 확정 계획이나 직접 수주로 단정하지 않습니다.',
        sources: officialSources,
      },
      {
        id: 'dongyang-issue-market',
        title: '이슈·시장 확인',
        description: '상한가 날짜와 시장 반응은 공개 시세와 보도 기준으로 확인합니다.',
        sources: marketSources,
      },
    ]);
  }
  if (pick.id === 'pick-kcc-silicone-margin-asset-value') {
    const officialSources = linkedSources.filter((source) => source.type !== 'news');
    const marketSources = linkedSources.filter((source) => source.type === 'news');
    return groupsWithoutEmptySources([
      {
        id: 'kcc-company-results',
        title: '기업·실적 확인',
        description: '실리콘·도료 사업과 투자자산은 공시와 회사 자료를 먼저 확인합니다.',
        sources: officialSources,
      },
      {
        id: 'kcc-issue-market',
        title: '이슈·시장 확인',
        description: '증권사 전망과 목표주가 문구는 공개 접근 가능한 보도 기준으로만 표시합니다.',
        sources: marketSources,
      },
    ]);
  }
  if (pick.id === 'pick-hertz-used-car-depreciation-financing') {
    const financingSources = linkedSources.filter((source) =>
      /PIK|공모|Offering|Pricing|보통주|채권|S-3/i.test(`${source.title} ${source.note ?? ''}`),
    );
    const structureSources = linkedSources.filter((source) =>
      /10-Q|감가상각|잔존가치|depreciation|vehicle|차량/i.test(`${source.title} ${source.note ?? ''}`),
    );
    const marketSources = linkedSources.filter((source) => source.type === 'news');
    return groupsWithoutEmptySources([
      {
        id: 'hertz-financing',
        title: '기업·자금조달 확인',
        description: 'PIK 채권, 보통주 대여 공모, 주식연계 조건은 회사 발표와 SEC 원문으로 확인합니다.',
        sources: uniqueEvidenceSources(financingSources),
      },
      {
        id: 'hertz-business-structure',
        title: '사업 구조 확인',
        description: '차량 감가상각, 중고차 잔존가치, 부채와 유동성 부담은 회사 공시에서 확인합니다.',
        sources: uniqueEvidenceSources(structureSources),
      },
      {
        id: 'hertz-issue-market',
        title: '이슈·시장 확인',
        description: '하락일 주가 반응은 공개 차트 데이터로 확인합니다.',
        sources: marketSources,
      },
    ]);
  }
  if (pick.id === 'pick-jeju-semiconductor-export-fabless-rally') {
    const companySources = linkedSources.filter((source) => source.type === 'company-filing');
    const industrySources = linkedSources.filter((source) => source.type === 'official-announcement');
    const marketSources = linkedSources.filter((source) => source.type === 'news');
    return groupsWithoutEmptySources([
      {
        id: 'jeju-company-business',
        title: '기업·사업 확인',
        description: '팹리스 구조와 저전력 메모리 사업은 공시 원문 기준으로 확인합니다.',
        sources: companySources,
      },
      {
        id: 'jeju-industry',
        title: '업황 확인',
        description: '반도체 수출 호조는 관세청 공식 자료를 산업 배경으로만 사용합니다.',
        sources: industrySources,
      },
      {
        id: 'jeju-issue-market',
        title: '이슈·시장 확인',
        description: '중소형 반도체주로 매수세가 확산됐다는 해석은 공개 보도와 시세 기준으로 낮춰 봅니다.',
        sources: marketSources,
      },
    ]);
  }
  if (pick.id === 'pick-huntsman-olin-merger-exchange-ratio') {
    return groups.map((group) => group.id === 'company-activity'
      ? {
          ...group,
          title: '기업·거래 확인',
          description: '교환비율과 종결 조건은 양사 공동 발표와 SEC 공시 원문에서 확인합니다.',
        }
      : group.id === 'issue-market'
        ? { ...group, description: '발표일 주가와 참고 합병가치는 공개 과거 시세로 확인합니다.' }
        : group);
  }
  if (pick.id === 'pick-uniqure-amt130-fda-regulatory-path') {
    return groups.map((group) => group.id === 'company-activity'
      ? {
          ...group,
          title: '기업·규제 확인',
          description: 'AMT-130의 BLA 계획과 가속승인 절차는 회사 발표, SEC 공시, FDA 안내에서 확인합니다.',
        }
      : group.id === 'issue-market'
        ? { ...group, description: '발표일 주가 반응은 공개 과거 시세로 확인합니다.' }
        : group);
  }
  return groups;
}

const semiconductorClusterMapEvidenceGroups: EvidenceGroup[] = [
  {
    id: 'cluster-policy-stage',
    title: '정책·사업 단계 확인',
    description: '호남권 반도체 클러스터 기대는 공개 보도 기준의 정책 추진 이슈로만 보고, 예산·부지·착공·공급계약 확정으로 단정하지 않습니다.',
    sources: [
      {
        id: 'cluster-policy-sbsbiz',
        type: 'news',
        title: 'SBS Biz 호남권 반도체 클러스터 관련주 시황',
        publisher: 'SBS Biz',
        url: 'https://v.daum.net/v/20260626094305527',
        note: '시장 반응과 관련주 시황을 확인하는 공개 보도입니다. 공식 확정 사업이나 직접 수주 근거로 쓰지 않습니다.',
      },
    ],
  },
  {
    id: 'cluster-company-business',
    title: '기업·사업 확인',
    description: '기업 역할은 공시와 회사 공식 자료 기준으로 확인하고, 특정 클러스터 계약 관계로 표현하지 않습니다.',
    sources: [
      {
        id: 'cluster-dongyang-annual-report',
        type: 'company-filing',
        title: '동양파일 2025 사업보고서',
        publisher: '한국거래소 KIND',
        url: 'https://kind.krx.co.kr/common/disclsviewer.do?acptno=20260318002468&langTpCd=0&method=search&orgid=F&rcpno=20260318001680&tran=Y',
        note: '동양파일의 PHC 파일 사업과 건설 기초자재 성격을 확인합니다.',
      },
      {
        id: 'cluster-dongyang-quarterly-report',
        type: 'company-filing',
        title: '동양파일 2026년 1분기 분기보고서',
        publisher: '한국거래소 KIND',
        url: 'https://kind.krx.co.kr/common/disclsviewer.do?acptno=20260515000989&docno=&method=search&viewerhost=',
        note: '최근 분기 기준 사업과 재무 확인에 사용합니다.',
      },
      {
        id: 'cluster-samsung-ct-construction',
        type: 'company-ir',
        title: '삼성물산 건설부문 공식 사업 소개',
        publisher: '삼성물산',
        url: 'https://www.samsungcnt.com/eng/business/construction.do',
        note: '건설·EPC 사업 흐름을 확인하는 회사 공식 자료입니다.',
      },
      {
        id: 'cluster-ls-electric-power',
        type: 'company-ir',
        title: 'LS ELECTRIC 전력 솔루션 공식 사업 소개',
        publisher: 'LS ELECTRIC',
        url: 'https://www.ls-electric.com/en/business/power-solution',
        note: '배전·전력설비 흐름을 확인하는 회사 공식 자료입니다.',
      },
      {
        id: 'cluster-hyosung-dart-search',
        type: 'company-filing',
        title: '효성중공업 DART 공시 검색',
        publisher: 'OpenDART',
        url: 'https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=%ED%9A%A8%EC%84%B1%EC%A4%91%EA%B3%B5%EC%97%85',
        note: '변압기와 전력설비 사업은 공시 원문으로 재확인합니다. 공식 제품 페이지는 확인 시점에 500 응답이 있어 링크하지 않았습니다.',
      },
      {
        id: 'cluster-kcc-quarterly-report',
        type: 'company-filing',
        title: 'KCC 2026년 1분기 분기보고서',
        publisher: '한국거래소 KIND',
        url: 'https://kind.krx.co.kr/common/disclsviewer.do?acptno=20260515001457&docno=&method=search&viewerhost=',
        note: 'KCC의 소재·도료·건축자재 사업과 재무는 공시 기준으로 확인합니다.',
      },
    ],
  },
  {
    id: 'cluster-contract-status',
    title: '직접 계약 확인',
    description: '현재 확인된 동양파일의 반도체 클러스터 직접 공급계약은 없습니다.',
    sources: [
      {
        id: 'cluster-dongyang-direct-contract-status',
        type: 'company-filing',
        title: 'KIND 공시 검색',
        publisher: '한국거래소 KIND',
        url: 'https://kind.krx.co.kr/disclosure/details.do?method=searchDetailsMain',
        note: 'KIND/DART 공시와 공개 자료 기준으로 별도 직접 공급계약 공시는 확인하지 못했습니다. 새 수주 공시는 추적 대상입니다.',
      },
    ],
  },
];

function evidenceGroupsForMap(mapId: string) {
  if (mapId === semiconductorClusterInfrastructureMap.sectorId) {
    return semiconductorClusterMapEvidenceGroups;
  }
  const picks = (marketMapEvidencePickIds[mapId] ?? [])
    .map((pickId) => stockAutopsyPicks.find((pick) => pick.id === pickId))
    .filter((pick): pick is StockAutopsyPick => Boolean(pick));
  return evidenceGroupsForPicks(picks, reportsForMap(mapId));
}

type EvidenceDetailsProps = {
  description: string;
  groups: EvidenceGroup[];
  onOpenReports: (reportId?: string) => void;
};

function EvidenceDetails({ description, groups, onOpenReports }: EvidenceDetailsProps) {
  if (!groups.length) return null;
  return (
    <details className="evidence-details">
      <summary>
        <span>
          <strong>근거 보기</strong>
          <small>{description}</small>
        </span>
        <ChevronDown size={17} />
      </summary>
      <div className="evidence-details-body">
        {groups.map((group) => (
          <section className="evidence-group" key={group.id} aria-labelledby={`evidence-group-${group.id}`}>
            <div className="evidence-group-head">
              <h3 id={`evidence-group-${group.id}`}>{group.title}</h3>
              {group.description ? <p>{group.description}</p> : null}
            </div>
            <div className="evidence-source-list">
              {group.sources.map((source) => (
                <article className={`evidence-source-card ${source.type}`} key={source.id}>
                  <span>{evidenceSourceTypeLabels[source.type]}</span>
                  <strong>{source.title}</strong>
                  <small>{source.publisher}{source.publishedLabel ? ` · ${source.publishedLabel}` : ''}</small>
                  {source.note ? <p>{source.note}</p> : null}
                  <div className="evidence-source-actions">
                    {source.relatedReportId ? (
                      <a
                        href={reportsPath(source.relatedReportId)}
                        onClick={(event) => { event.preventDefault(); onOpenReports(source.relatedReportId); }}
                      >
                        보고서 요약 보기
                      </a>
                    ) : null}
                    <a href={source.url} target="_blank" rel="noreferrer noopener">
                      원문 보기
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </details>
  );
}

type RelatedIndustryReportsProps = {
  title: string;
  description: string;
  reports: IndustryReport[];
  onOpenReports: (reportId?: string) => void;
};

function RelatedIndustryReports({ title, description, reports, onOpenReports }: RelatedIndustryReportsProps) {
  if (!reports.length) return null;

  return (
    <section className="related-industry-reports" aria-label={title}>
      <div className="related-industry-report-head">
        <span>산업 구조 참고</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="related-industry-report-list">
        {reports.slice(0, 3).map((report) => (
          <article key={report.id}>
            <div>
              <span>{report.firm} · {reportPublishedLabel(report)}</span>
            </div>
            <strong>{report.title}</strong>
            <p>{report.keyIdeas[0]}</p>
            <div className="related-industry-report-actions">
              <button type="button" onClick={() => onOpenReports(report.id)}>보고서 요약 보기</button>
              <a href={industryReportSourceUrl(report)} target="_blank" rel="noreferrer noopener">
                원문 보기
                <ExternalLink size={13} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type IndustryReportsPageProps = {
  onHome: () => void;
  onOpenMarketMap: () => void;
  onOpenPicks: () => void;
  onOpenDisclosures: () => void;
  onOpenCategory: (sectorId: string) => void;
  onOpenReport: (reportId: string) => void;
  onOpenPick: (pick: StockAutopsyPick) => void;
};

function IndustryReportsPage({ onHome, onOpenMarketMap, onOpenPicks, onOpenDisclosures, onOpenCategory, onOpenReport, onOpenPick }: IndustryReportsPageProps) {
  const visibleReports = industryReports.filter(isCurrentPublicReport);
  const mapConnections = Object.entries(reportMapLabels).map(([mapId, label]) => ({
    mapId,
    label,
    reports: reportsForMap(mapId),
  })).filter((connection) => connection.reports.length > 0);

  return (
    <div className="pick-shell story-dark-shell industry-reports-shell">
      <PrimaryNavigation
        active="reports"
        onHome={onHome}
        onOpenPicks={onOpenPicks}
        onOpenMarketMap={onOpenMarketMap}
        onOpenDisclosures={onOpenDisclosures}
        onOpenReports={() => undefined}
      />

      <main>
        <section className="industry-reports-hero">
          <p className="home-kicker industry-reports-kicker">산업 흐름을 넓게 보는 참고 서재</p>
          <div className="industry-reports-hero-mark" aria-hidden="true"><BookOpen size={30} /></div>
          <h1>산업 보고서 서재</h1>
          <p>뉴스는 사건을 보여주고, 공시는 숫자를 보여줍니다. 산업 보고서는 그 사건과 숫자가 어떤 시장 흐름 안에 있는지 넓게 보는 데 도움을 줍니다.</p>
          <small>공개 보고서는 요약과 원문 링크를 연결하고, 로그인이나 유료 접근이 필요한 자료는 사용자 확인 후 반영합니다.</small>
        </section>

        <section className="industry-reports-why" aria-labelledby="industry-reports-why-title">
          <div>
            <span>보고서가 왜 필요한가</span>
            <h2 id="industry-reports-why-title">숫자를 대신하지 않고, 숫자가 놓인 시장을 봅니다</h2>
          </div>
          <div className="industry-reports-principles">
            <article><strong>공식 숫자</strong><p>SEC, OpenDART, IR, 공시를 먼저 확인합니다.</p></article>
            <article><strong>산업 구조</strong><p>공개 산업 보고서에서 흐름과 구조를 참고합니다.</p></article>
            <article><strong>뉴스 이벤트</strong><p>회사 발표, 거래소 공시, 신뢰할 수 있는 보도로 확인합니다.</p></article>
          </div>
        </section>

        <section className="industry-report-library" aria-labelledby="industry-report-library-title">
          <div className="industry-report-section-head">
            <span>현재 공개 자료 {visibleReports.length}건</span>
            <h2 id="industry-report-library-title">산업별 보고서</h2>
            <p>원문의 결론을 투자 추천으로 옮기지 않고, 시장을 이해하는 질문만 남겼습니다.</p>
          </div>
          <div className="industry-report-grid">
            {visibleReports.map((report) => {
              const relatedPickItems = report.relatedPicks
                .map((pickId) => stockAutopsyPicks.find((pick) => pick.id === pickId))
                .filter((pick): pick is StockAutopsyPick => Boolean(pick));
              return (
                <article className="industry-report-card" id={report.id} key={report.id}>
                  <div className="industry-report-card-topline">
                    <span>{report.firm} · {reportPublishedLabel(report)}</span>
                  </div>
                  <span className="industry-report-field">{report.industry}</span>
                  <h3>{report.title}</h3>
                  <ul className="industry-report-summary">
                    {report.summaryBullets.slice(0, 3).map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                  <div className="industry-report-insight">
                    <span>이 보고서에서 얻을 시야</span>
                    <p>{report.keyIdeas[0]}</p>
                  </div>
                  <div className="industry-report-connections">
                    <div>
                      <span>연결된 시장지도</span>
                      <div>{report.relatedMaps.map((mapId) => <button type="button" key={mapId} onClick={() => onOpenCategory(mapId)}>{reportMapLabels[mapId] ?? mapId}</button>)}</div>
                    </div>
                    <div>
                      <span>같이 볼 기업</span>
                      <p>{report.relatedCompanies.slice(0, 6).join(' · ')}</p>
                    </div>
                    {relatedPickItems.length ? (
                      <div>
                        <span>연결된 Pick</span>
                        <div>{relatedPickItems.slice(0, 3).map((pick) => <button type="button" key={pick.id} onClick={() => onOpenPick(pick)}>{pick.companyName}</button>)}</div>
                      </div>
                    ) : null}
                  </div>
                  <div className="industry-report-actions">
                    <button type="button" onClick={() => onOpenReport(report.id)}>보고서 요약 보기</button>
                    <a href={industryReportSourceUrl(report)} target="_blank" rel="noreferrer noopener">
                      원문 보기
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="industry-report-map-connections" aria-labelledby="industry-report-map-title">
          <div className="industry-report-section-head">
            <span>시장지도와 연결된 보고서</span>
            <h2 id="industry-report-map-title">보고서에서 다시 시장 흐름으로</h2>
          </div>
          <div>
            {mapConnections.map((connection) => (
              <article key={connection.mapId}>
                <span>{connection.reports.length}건 연결</span>
                <strong>{connection.label}</strong>
                <p>{connection.reports.map((report) => report.firm).join(' · ')}</p>
                <button type="button" onClick={() => onOpenCategory(connection.mapId)}>시장지도 보기</button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

type IndustryReportDetailPageProps = {
  report?: IndustryReport;
  onHome: () => void;
  onOpenReports: (reportId?: string) => void;
  onOpenPicks: () => void;
  onOpenMarketMap: () => void;
  onOpenDisclosures: () => void;
  onOpenCategory: (sectorId: string) => void;
  onOpenPick: (pick: StockAutopsyPick) => void;
};

function IndustryReportDetailPage({ report, onHome, onOpenReports, onOpenPicks, onOpenMarketMap, onOpenDisclosures, onOpenCategory, onOpenPick }: IndustryReportDetailPageProps) {
  if (!report) {
    return (
      <div className="pick-shell story-dark-shell industry-reports-shell">
        <PrimaryNavigation
          active="reports"
          onHome={onHome}
          onOpenPicks={onOpenPicks}
          onOpenMarketMap={onOpenMarketMap}
          onOpenDisclosures={onOpenDisclosures}
          onOpenReports={onOpenReports}
        />
        <main className="pick-empty industry-report-detail-empty">
          <h1>보고서를 찾을 수 없습니다.</h1>
          <p>공개 상태로 등록된 보고서인지 확인해주세요.</p>
          <button type="button" onClick={() => onOpenReports()}>산업 보고서 서재 보기</button>
        </main>
      </div>
    );
  }

  const relatedPickItems = report.relatedPicks
    .map((pickId) => stockAutopsyPicks.find((pick) => pick.id === pickId))
    .filter((pick): pick is StockAutopsyPick => Boolean(pick));

  return (
    <div className="pick-shell story-dark-shell industry-reports-shell industry-report-detail-shell">
      <PrimaryNavigation
        active="reports"
        onHome={onHome}
        onOpenPicks={onOpenPicks}
        onOpenMarketMap={onOpenMarketMap}
        onOpenDisclosures={onOpenDisclosures}
        onOpenReports={onOpenReports}
      />

      <main className="industry-report-detail-main">
        {report.editionStatus === 'previous' ? (
          <section className="industry-report-status-notice previous" aria-label="이전판 안내">
            <div>
              <strong>이 보고서는 이전판입니다.</strong>
              <span>같은 시리즈의 최신 공개 보고서가 있습니다.</span>
            </div>
            {report.latestReportId ? (
              <button type="button" onClick={() => onOpenReports(report.latestReportId)}>최신판 보기</button>
            ) : null}
          </section>
        ) : null}
        {report.sourceStatus === 'unavailable' ? (
          <section className="industry-report-status-notice unavailable" aria-label="원문 상태 안내">
            <div>
              <strong>현재 원문 링크를 확인할 수 없습니다.</strong>
              <span>공식 출처의 새 주소를 확인 중입니다.</span>
            </div>
          </section>
        ) : null}
        <section className="industry-report-detail-hero">
          <p className="home-kicker">{report.firm} · 산업 보고서</p>
          <div className="industry-report-detail-meta">
            <span>발행 {reportPublishedLabel(report)}</span>
          </div>
          <h1>{report.title}</h1>
          <p>{report.industry}</p>
          <small>산업 구조를 넓게 보는 참고 자료이며, 공식 재무 숫자나 투자 추천을 대신하지 않습니다.</small>
        </section>

        <section className="industry-report-detail-grid">
          <article className="industry-report-detail-card">
            <span>3줄 요약</span>
            <h2>먼저 읽을 핵심</h2>
            <ul>
              {report.summaryBullets.slice(0, 3).map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          </article>
          <article className="industry-report-detail-card">
            <span>이 보고서에서 얻을 시야</span>
            <h2>산업 구조로 읽기</h2>
            <ul>
              {report.keyIdeas.map((idea) => <li key={idea}>{idea}</li>)}
            </ul>
          </article>
          <article className="industry-report-detail-card">
            <span>어떻게 사용할까</span>
            <h2>공시와 함께 확인하기</h2>
            <ul>
              {report.howToUse.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <article className="industry-report-detail-card industry-report-detail-connections">
            <span>연결해서 보기</span>
            <h2>시장지도와 Pick</h2>
            <div>
              {report.relatedMaps.map((mapId) => (
                <button type="button" key={mapId} onClick={() => onOpenCategory(mapId)}>{reportMapLabels[mapId] ?? mapId}</button>
              ))}
            </div>
            {relatedPickItems.length ? (
              <div>
                {relatedPickItems.map((pick) => <button type="button" key={pick.id} onClick={() => onOpenPick(pick)}>{pick.companyName} Pick</button>)}
              </div>
            ) : null}
            <p>{report.relatedCompanies.join(' · ')}</p>
          </article>
        </section>

        <section className="industry-report-detail-source">
          <div>
            <span>공식 공개 원문</span>
            <strong>보고서 전문은 발행처의 공식 페이지에서 확인합니다.</strong>
          </div>
          {report.sourceStatus !== 'unavailable' ? (
            <a href={industryReportSourceUrl(report)} target="_blank" rel="noreferrer noopener">
              원문 보기
              <ExternalLink size={15} />
            </a>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function MarketMapLibraryPage({ onHome, onOpenPicks, onOpenDisclosures, onOpenCategory, onOpenReports }: MarketMapLibraryPageProps) {
  const marketMapItems = currentWeeklyDigest.marketMapItems;
  const openMarketMapItem = (item: (typeof marketMapItems)[number]) => {
    if (item.status !== 'active') return;
    const sectorId = marketMapItemSectorId(item);
    if (sectorId) onOpenCategory(sectorId);
  };

  return (
    <div className="pick-shell story-dark-shell story-market-map-shell">
      <PrimaryNavigation
        active="market-map"
        onHome={onHome}
        onOpenPicks={onOpenPicks}
        onOpenMarketMap={() => undefined}
        onOpenDisclosures={onOpenDisclosures}
        onOpenReports={onOpenReports}
      />

      <main>
        <section className="market-map-library-hero">
          <p className="home-kicker">시장지도 보관함</p>
          <h1>어떤 시장 흐름을 볼까요?</h1>
          <p>대표 해부를 본 뒤, 필요한 시장지도만 선택해서 들어갑니다.</p>
          <small>준비 중 카테고리는 빈 상세 화면으로 보내지 않습니다.</small>
        </section>

        <section className="market-map-library-grid" aria-label="시장지도 카테고리">
          {marketMapItems.map((item) => {
            const isActive = item.status === 'active';
            const display = marketMapDisplayCopy(item);
            return (
              <article className={`market-map-library-card${isActive ? '' : ' disabled'}`} key={item.title} aria-disabled={!isActive}>
                <div className="market-map-library-topline">
                  <span>{isActive ? '상세 지도' : '준비 중'}</span>
                  {isActive ? <Network size={18} /> : <Lock size={18} />}
                </div>
                <h2>{display.title}</h2>
                <small>{display.subtitle}</small>
                <p>{item.note}</p>
                {item.supportingNote ? <small>{item.supportingNote}</small> : null}
                {isActive ? (
                  <button type="button" onClick={() => openMarketMapItem(item)}>
                    {item.ctaLabel ?? '지도 보기'}
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <span className="market-map-coming-soon">준비 중</span>
                )}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

type InfrastructureStoryMap = typeof reconstructionInfrastructureMap | typeof semiconductorClusterInfrastructureMap;
type InfrastructureStoryMapCompany = InfrastructureStoryMap['companies'][number];

type InfrastructureStoryMapPageProps = {
  map: InfrastructureStoryMap;
  kicker: string;
  compactFlowLabel: string;
  graphAriaLabel: string;
  shellClassName?: string;
  requestedCompanyId?: string | null;
  onHome: () => void;
  onOpenMarketMap: () => void;
  onOpenPicks: () => void;
  onOpenPick: (pick: StockAutopsyPick) => void;
  onOpenReports: (reportId?: string) => void;
  onSelectCompany: (companyId: string) => void;
  marketPrices: MarketPrice[];
};

function InfrastructureStoryMapPage({
  map,
  kicker,
  compactFlowLabel,
  graphAriaLabel,
  shellClassName = '',
  requestedCompanyId,
  onHome,
  onOpenMarketMap,
  onOpenPicks,
  onOpenPick,
  onOpenReports,
  onSelectCompany,
  marketPrices,
}: InfrastructureStoryMapPageProps) {
  const [showConnections, setShowConnections] = useState(false);
  const aliasCompanyId = requestedCompanyId && Object.prototype.hasOwnProperty.call(map.companyAliases, requestedCompanyId)
    ? (map.companyAliases as Record<string, string>)[requestedCompanyId]
    : requestedCompanyId;
  const selectedCompany = map.companies.find((company) => company.id === aliasCompanyId)
    ?? map.companies.find((company) => company.id === map.companyId)
    ?? map.companies[0];
  const isKnownCompanyQuery = !requestedCompanyId || map.companies.some((company) => company.id === aliasCompanyId);
  const selectedCompanyId = selectedCompany.id;
  const relatedCompanies = map.companies.filter((company) => company.id !== selectedCompany.id);
  const relatedPick = selectedCompany.pickId
    ? stockAutopsyPicks.find((pick) => pick.id === selectedCompany.pickId)
    : undefined;
  const selectedPrice = relatedPick
    ? getPriceForPick(relatedPick, marketPrices)
    : getPriceForTicker(selectedCompany.ticker, selectedCompany.id, marketPrices);
  const graphNodes = useMemo<Node[]>(
    () => map.graphNodes.map((node) => ({
      id: node.id,
      position: { x: node.x, y: node.y },
      data: { label: node.label },
      className: `reconstruction-flow-node tone-${node.tone}`,
      draggable: false,
      selectable: false,
    })),
    [map.graphNodes],
  );
  const graphEdges = useMemo<Edge[]>(
    () => map.graphEdges.map(([source, target], index) => ({
      id: `reconstruction-edge-${index + 1}`,
      source,
      target,
      type: 'smoothstep',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#7c93b4', strokeWidth: 2 },
    })),
    [map.graphEdges],
  );

  return (
    <div
      className={`pick-shell story-dark-shell reconstruction-map-shell ${shellClassName}${showConnections ? ' connections-open' : ''}`}
      data-selected-company-id={selectedCompanyId}
      data-query-fallback={isKnownCompanyQuery ? 'false' : 'true'}
    >
      <header className="pick-nav">
        <a href="/ko/" onClick={(event) => { event.preventDefault(); onHome(); }} className="home-brand">
          <span className="home-logo"><Network size={20} /></span>
          <strong>주가해부실</strong>
        </a>
        <nav>
          <button type="button" onClick={onHome}>홈</button>
          <button type="button" onClick={onOpenPicks}>이번 주 Pick</button>
          <button type="button" onClick={onOpenMarketMap}>시장지도</button>
        </nav>
      </header>

      <main>
        <section className="reconstruction-hero">
          <p className="home-kicker">{kicker}</p>
          <h1>{map.hero.title}</h1>
          <p>{map.hero.description}</p>
          <strong>{map.hero.note}</strong>
          {'caution' in map.hero && map.hero.caution ? <small>{map.hero.caution}</small> : null}
        </section>

        <div className="reconstruction-selected-pill" aria-label="현재 선택 기업">
          <span>선택 기업</span>
          <CompanyIdentity
            companyName={selectedCompany.name}
            ticker={selectedCompany.ticker}
            countryLabel={countryLabelFromMarket(selectedCompany.exchange) || countryLabelFromTicker(selectedCompany.ticker)}
            statusLabel={selectedCompany.status}
            size="compact"
          />
          <em>{selectedCompany.status}</em>
        </div>

        <section className="reconstruction-focus-grid" aria-label="선택 기업과 같이 볼 회사">
          <article className="reconstruction-company-card" aria-label={`선택 기업 ${selectedCompany.name}`}>
            <div className="reconstruction-company-head">
              <div className="reconstruction-company-mark" aria-hidden="true">{selectedCompany.mark}</div>
              <div>
                <span>선택한 기업</span>
                <CompanyIdentity
                  companyName={selectedCompany.name}
                  ticker={selectedCompany.ticker}
                  countryLabel={countryLabelFromMarket(selectedCompany.exchange) || countryLabelFromTicker(selectedCompany.ticker)}
                  statusLabel={selectedCompany.status}
                  size="hero"
                />
              </div>
            </div>
            <div className="reconstruction-company-badges">
              <em>{selectedCompany.status}</em>
              <span>{selectedCompany.role}</span>
            </div>
            <div className="reconstruction-company-body">
              <div>
                <span>이 회사는 뭐 해요?</span>
                <p>{selectedCompany.description}</p>
              </div>
              <div>
                <span>왜 이 흐름에 있나요?</span>
                <p>{selectedCompany.reason}</p>
              </div>
            </div>
            {'importantNote' in selectedCompany && selectedCompany.importantNote ? (
              <div className="reconstruction-company-warning" role="note">
                <AlertTriangle size={15} />
                <span>{selectedCompany.importantNote}</span>
              </div>
            ) : null}
            {selectedCompany.checks.length ? (
              <div className="reconstruction-checkpoints">
                <span>체크포인트</span>
                <ul>
                  {selectedCompany.checks.map((check) => <li key={check}>{check}</li>)}
                </ul>
              </div>
            ) : null}
            <div className="reconstruction-company-actions">
              <PriceBadge price={selectedPrice} compact />
              {relatedPick ? (
                <button type="button" className="primary" onClick={() => onOpenPick(relatedPick)}>
                  관련 Pick 보기
                  <ArrowRight size={15} />
                </button>
              ) : (
                <span className="reconstruction-reference-action">시장 흐름 참고</span>
              )}
            </div>
          </article>

          <section className="reconstruction-related" aria-labelledby="reconstruction-related-title">
            <div className="reconstruction-section-head">
              <span>같이 볼 회사</span>
              <h2 id="reconstruction-related-title">{selectedCompany.name}과 같이 볼 회사</h2>
              <p>{map.relatedNote}</p>
            </div>
            <div className="reconstruction-related-grid">
              {relatedCompanies.map((company) => {
                const companyPick = company.pickId
                  ? stockAutopsyPicks.find((pick) => pick.id === company.pickId)
                  : undefined;
                const companyPrice = companyPick
                  ? getPriceForPick(companyPick, marketPrices)
                  : getPriceForTicker(company.ticker, company.id, marketPrices);
                return (
                  <article key={company.id}>
                    <div className="reconstruction-related-head">
                      <div className="reconstruction-related-mark" aria-hidden="true">{company.mark}</div>
                      <div>
                        <CompanyIdentity
                          companyName={company.name}
                          ticker={company.ticker}
                          countryLabel={countryLabelFromMarket(company.exchange) || countryLabelFromTicker(company.ticker)}
                          statusLabel={company.status}
                          size="compact"
                        />
                      </div>
                    </div>
                    <div className="reconstruction-related-meta">
                      <span>{company.role}</span>
                      <em>{company.status}</em>
                    </div>
                    <p>{company.description}</p>
                    {'importantNote' in company && company.importantNote ? <small className="reconstruction-related-note">{company.importantNote}</small> : null}
                    <div className="reconstruction-related-actions">
                      <PriceBadge price={companyPrice} compact />
                      <button type="button" onClick={() => onSelectCompany(company.id)}>
                        시장 흐름에서 보기
                        <ArrowRight size={14} />
                      </button>
                      {companyPick ? (
                        <button type="button" className="secondary" onClick={() => onOpenPick(companyPick)}>
                          관련 Pick 보기
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </section>

        <section className="reconstruction-compact-flow" aria-labelledby="reconstruction-flow-title">
          <div className="reconstruction-section-head">
            <span>{compactFlowLabel}</span>
            <h2 id="reconstruction-flow-title">기대가 숫자로 확인되기까지</h2>
          </div>
          <div className="reconstruction-flow-steps">
            {map.flowSteps.map((step, index) => (
              <article key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
                <div className="reconstruction-step-representatives">
                  <b>대표 예시</b>
                  {step.representatives.map((representative) => <small key={representative}>{representative}</small>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="reconstruction-connections" aria-labelledby="reconstruction-connections-title">
          <div className="reconstruction-connection-entry">
            <div>
              <span>{map.graphIntro.eyebrow}</span>
              <h2 id="reconstruction-connections-title">{map.graphIntro.description}</h2>
            </div>
            <button type="button" className="primary" onClick={() => setShowConnections((current) => !current)}>
              {showConnections ? '5단계 흐름으로 돌아가기' : '전체 연결 보기'}
            </button>
          </div>
          {showConnections && (
            <div className="reconstruction-flow-canvas" aria-label={graphAriaLabel}>
              <ReactFlow
                nodes={graphNodes}
                edges={graphEdges}
                fitView
                fitViewOptions={{ padding: 0.18 }}
                minZoom={0.45}
                maxZoom={1.35}
                nodesConnectable={false}
                elementsSelectable={false}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#dbe3ef" gap={20} size={1} />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          )}
        </section>

        <RelatedIndustryReports
          title="산업 보고서로 더 넓게 보기"
          description="이 시장 흐름을 이해하는 데 도움이 되는 공개 보고서입니다. 숫자는 공시로, 산업 구조는 보고서로 함께 확인합니다."
          reports={reportsForMap(map.sectorId)}
          onOpenReports={onOpenReports}
        />
        <EvidenceDetails
          description="산업 구조는 공개 보고서로, 기업 활동과 숫자는 공시·IR로 따로 확인합니다."
          groups={evidenceGroupsForMap(map.sectorId)}
          onOpenReports={onOpenReports}
        />
      </main>
    </div>
  );
}

function StockAutopsyPicksPage({
  selectedPickId,
  isArchive = false,
  onHome,
  onOpenMarketMap,
  onOpenCategory,
  onOpenAnalysis,
  onOpenPick,
  onOpenPicks,
  onOpenPicksArchive,
  onOpenReports,
  onOpenDisclosures,
  marketPrices,
  disclosures,
  secFilings,
}: StockAutopsyPicksPageProps) {
  const selectedPick = selectedPickId ? stockAutopsyPicks.find((pick) => pick.id === selectedPickId) : undefined;
  const detailPick = selectedPickId ? selectedPick : undefined;
  const weeklyPicks = weeklyStockAutopsyPicks();
  const archivePicks = archivedStockAutopsyPicks();
  const archivePickGroups = isArchive ? archivedStockAutopsyPickGroups() : [];
  const [pickMarketFilter, setPickMarketFilter] = useState<'all' | 'KR' | 'US'>('all');
  const baseVisiblePicks = isArchive ? archivePicks : weeklyPicks;
  const visiblePicks = pickMarketFilter === 'all'
    ? baseVisiblePicks
    : baseVisiblePicks.filter((pick) => pick.market === pickMarketFilter);
  const visibleArchivePickGroups = archivePickGroups
    .map((group) => ({
      ...group,
      picks: pickMarketFilter === 'all' ? group.picks : group.picks.filter((pick) => pick.market === pickMarketFilter),
    }))
    .filter((group) => group.picks.length);

  if (selectedPickId && !detailPick) {
    return (
      <div className="pick-shell story-dark-shell story-pick-shell">
        <PrimaryNavigation
          active="picks"
          onHome={onHome}
          onOpenPicks={onOpenPicks}
          onOpenMarketMap={onOpenMarketMap}
          onOpenDisclosures={onOpenDisclosures}
          onOpenReports={onOpenReports}
        />
        <main className="pick-empty">
          <h1>Pick을 찾을 수 없습니다.</h1>
          <p>아직 등록되지 않은 해부 종목입니다. Pick 목록에서 다시 선택해주세요.</p>
          <button type="button" onClick={onOpenPicks}>주가해부실 Pick 보기</button>
        </main>
      </div>
    );
  }

  if (detailPick) {
    const relatedCompany = pickMainCompany(detailPick);
    const relatedCompanyConnection = relatedCompany ? companyConnectionState(relatedCompany) : null;
    const relatedCompanyCanOpenAnalysis = canOpenCompanyAnalysis(relatedCompany);
    const relatedCompanyCanOpenFinancials = canOpenCompanyFinancials(relatedCompany);
    const hasPickMarketFlow = Boolean(detailPick.relatedSupplyChainId);
    const reportLink = relatedCompany ? getPrimaryReportLink(relatedCompany) : null;
    const relatedPickCompanies = pickRelatedCompanyList(detailPick).slice(0, 3);
    const detailPickPrice = getPriceForPick(detailPick, marketPrices);
    const watchMetricCards = pickWatchMetricCards(detailPick, relatedCompany).slice(0, 3);
    const signalSet = pickSignalSet(detailPick, relatedCompany);
    const relatedIndustryReports = reportsForPick(detailPick.id).slice(0, 2);
    const usesEvidenceLayer = evidenceEnabledPickIds.has(detailPick.id);
    const pickEvidenceGroups = usesEvidenceLayer ? evidenceGroupsForPick(detailPick) : [];
    const conclusion = detailPick.oneLineConclusion ?? detailPick.reasonSummary;
    const flowLabel = pickFlowLabel(detailPick);
    const flowStage = pickFlowStage(detailPick);
    const isDellAiServerDemandPick = detailPick.id === 'pick-dell-ai-server-demand';
    const isDellAiServerEarningsPick = detailPick.id === 'pick-dell-ai-server-earnings-check';
    const isSnowflakeAiDataPick = detailPick.id === 'pick-snowflake-ai-data-platform';
    const isDellAiServerPick = isDellAiServerDemandPick || isDellAiServerEarningsPick;
    const isHuntsmanMergerPick = detailPick.id === 'pick-huntsman-olin-merger-exchange-ratio';
    const isUniqureRegulatoryPick = detailPick.id === 'pick-uniqure-amt130-fda-regulatory-path';
    const isDongyangPilePick = detailPick.id === 'pick-dongyang-pile-semiconductor-cluster-infrastructure';
    const isKccPick = detailPick.id === 'pick-kcc-silicone-margin-asset-value';
    const isHertzPick = detailPick.id === 'pick-hertz-used-car-depreciation-financing';
    const isJejuSemiconductorPick = detailPick.id === 'pick-jeju-semiconductor-export-fabless-rally';
    const pendingMarketMapNote = isHuntsmanMergerPick
      ? '관련 시장지도는 준비 중입니다. 향후 화학 업황·원재료·M&A 흐름을 검토합니다.'
      : isUniqureRegulatoryPick
        ? '관련 시장지도는 준비 중입니다. 향후 바이오 임상·FDA 규제 경로를 검토합니다.'
        : isDongyangPilePick
          ? '반도체 클러스터 / 산업단지 인프라 지도는 준비 중입니다. 정책 기대 ≠ 직접 수주, 예산·착공·공급계약은 따로 확인합니다.'
          : isKccPick
            ? '소재 / 실리콘 / 자산가치 지도는 준비 중입니다. 이번 Pick은 공시와 공개 보도 중심으로 봅니다.'
            : isHertzPick
              ? '렌터카 / 차량 잔존가치 / 부채 지도는 준비 중입니다. 자금조달 조건과 사업 구조를 분리해 봅니다.'
              : isJejuSemiconductorPick
                ? '팹리스 / 저전력 메모리 시장지도는 준비 중입니다. AI GPU 기업군으로 분류하지 않습니다.'
        : undefined;
    const storyQuestion = isSnowflakeAiDataPick
      ? 'Snowflake는 왜 폭등했을까?'
      : isDellAiServerEarningsPick
      ? 'Dell은 왜 또 급등했을까?'
      : isDellAiServerDemandPick
      ? 'AI 서버가 늘면 Dell은 왜 같이 움직일까?'
      : detailPick.title ?? `${detailPick.companyName}은 왜 같이 움직일까?`;
    const storyAnswer = isSnowflakeAiDataPick
      ? 'AI는 데이터 플랫폼도 필요합니다.'
      : isDellAiServerEarningsPick
      ? '지난번엔 기대감, 이번엔 숫자 확인'
      : isDellAiServerDemandPick
      ? 'Dell은 AI 서버를 기업에 팝니다.'
      : isHuntsmanMergerPick
      ? '합병 발표 ≠ 무조건 호재. 시장은 교환비율과 합병가치를 함께 봅니다.'
      : isUniqureRegulatoryPick
      ? 'FDA 경로 재개 ≠ 승인 완료. 신청부터 상업화까지는 각각 다른 단계입니다.'
      : detailPick.oneLineConclusion ?? '시장 흐름과 연결해 봅니다.';
    const storyHeroNote = isHuntsmanMergerPick
      ? 'Olin 0.5476주라는 교환조건과 발표 전일의 참고 합병가치를 먼저 봅니다.'
      : isUniqureRegulatoryPick
        ? 'BLA 제출 가능성이 열린 단계와 아직 남은 승인 절차를 구분합니다.'
        : '왜 움직였는지 먼저 봅니다.';
    const storyRelatedLabels = isSnowflakeAiDataPick
      ? ['Amazon / AWS', 'Microsoft', 'Datadog']
      : isDellAiServerPick
      ? ['NVIDIA', 'Super Micro', 'Vertiv']
      : detailPick.relatedCompanyIds?.length
        ? relatedPickCompanies.map((company) => company.name).slice(0, 3)
        : (detailPick.connectedLeaders.length ? detailPick.connectedLeaders : detailPick.relatedCompanies).slice(0, 3);
    const storyMetricLabels = isSnowflakeAiDataPick
      ? ['매출', '제품 매출 가이던스', '대형 고객 / 사용량']
      : isDellAiServerEarningsPick
      ? ['매출', 'AI 서버 주문 / 백로그', '가이던스']
      : detailPick.watchMetrics?.map((metric) => metric.label).slice(0, 3) ?? ['매출', '영업이익', '현금흐름'];
    const storyCompanyByLabel = (label: string) => {
      if (!isSnowflakeAiDataPick && !isDellAiServerPick && !detailPick.relatedCompanyIds?.length) return undefined;
      if (label === 'NVIDIA') return companies.find((company) => company.id === 'us-semiconductors-nvidia');
      if (label === 'Super Micro') return companies.find((company) => company.id === 'ai-datacenter-supermicro');
      if (label === 'Vertiv') return companies.find((company) => company.id === 'ai-datacenter-vertiv');
      if (label === 'Amazon / AWS') return companies.find((company) => company.id === 'ai-datacenter-amazon');
      if (label === 'Microsoft') return companies.find((company) => company.id === 'ai-datacenter-microsoft');
      return relatedPickCompanies.find((company) => company.name === label || company.legalName === label || company.ticker === label);
    };
    const openPickMarketFlow = () => {
      if (detailPick.relatedSupplyChainId) onOpenCategory(detailPick.relatedSupplyChainId, detailPick.relatedCompanyId);
    };
    const standardStoryCards = [
      {
        title: '무슨 일이 있었나요?',
        description: isSnowflakeAiDataPick
          ? '실적 발표 이후 Snowflake가 크게 움직였습니다.'
          : isDellAiServerEarningsPick
          ? '실적 발표 후 Dell이 크게 움직였습니다.'
          : isDellAiServerDemandPick
          ? 'AI 서버 수요가 주목받았습니다.'
          : detailPick.reasonSummary,
        badge: '오늘 이슈',
        icon: <Newspaper size={34} />,
      },
      {
        title: isSnowflakeAiDataPick ? '왜 Snowflake인가요?' : isDellAiServerPick ? '왜 Dell인가요?' : '왜 이 회사인가요?',
        description: isSnowflakeAiDataPick
          ? 'AI를 잘 쓰려면 흩어진 기업 데이터를 모으고 정리해야 합니다.'
          : isDellAiServerEarningsPick
          ? 'AI 서버 수요가 주문과 전망 숫자로 확인됐기 때문입니다.'
          : isDellAiServerDemandPick
          ? 'Dell은 AI 서버를 팝니다.'
          : detailPick.beginnerSummary,
        badge: isSnowflakeAiDataPick ? '데이터 플랫폼' : isDellAiServerPick ? 'AI 서버' : flowStage,
        icon: <Cloud size={34} />,
      },
      {
        title: '어디에 있나요?',
        description: isSnowflakeAiDataPick
          ? '기업 데이터가 AI에 쓰이도록 돕는 단계에 있습니다.'
          : isDellAiServerEarningsPick
          ? 'Dell은 AI 서버와 인프라를 기업에 공급하는 단계에 있습니다.'
          : isDellAiServerDemandPick
          ? '서버와 인프라 단계에 있습니다.'
          : `${flowStage} 단계에 있습니다.`,
        badge: isSnowflakeAiDataPick ? '클라우드' : isDellAiServerPick ? '데이터센터' : flowLabel,
        icon: <Network size={34} />,
        chips: isSnowflakeAiDataPick ? ['데이터 플랫폼', '클라우드', 'AI 워크로드'] : undefined,
        chipType: isSnowflakeAiDataPick ? 'metric' as const : undefined,
      },
      {
        title: '같이 볼 회사',
        description: isSnowflakeAiDataPick
          ? '클라우드 인프라, 기업 AI, 모니터링 회사를 함께 봅니다.'
          : isDellAiServerEarningsPick
          ? 'GPU, 서버 경쟁사, 전력·냉각 인프라를 함께 봅니다.'
          : isDellAiServerDemandPick
          ? 'GPU, 서버, 전력 회사를 봅니다.'
          : storyRelatedLabels.length ? `${storyRelatedLabels.slice(0, 3).join(', ')}를 함께 봅니다.` : '관련 회사를 무리하게 연결하지 않습니다.',
        badge: '3개만',
        icon: <Target size={34} />,
        chips: storyRelatedLabels,
        chipType: 'company' as const,
      },
      {
        title: '숫자 3개',
        description: isSnowflakeAiDataPick
          ? '매출, 제품 매출 가이던스, 대형 고객·사용량을 봅니다.'
          : isDellAiServerEarningsPick
          ? '매출, AI 서버 주문·백로그, 가이던스를 봅니다.'
          : `${storyMetricLabels.join(', ')}를 봅니다.`,
        badge: '핵심 지표',
        icon: <BarChart3 size={34} />,
        chips: storyMetricLabels,
        chipType: 'metric' as const,
      },
    ];
    const storyCards = isHuntsmanMergerPick
      ? [
          {
            title: '오늘 왜 움직였나요?',
            description: '6월 16일 Olin과의 전액 주식 합병 발표 뒤 Huntsman 종가는 약 17.1% 하락했습니다.',
            badge: '합병 발표',
            icon: <Newspaper size={34} />,
            chips: ['2026-06-16', '종가 약 -17.1%', '전액 주식 합병'],
            chipType: 'metric' as const,
          },
          {
            title: '핵심 조건',
            description: 'Huntsman 1주당 Olin 0.5476주를 받습니다. 고정 현금 대가는 없고 단주만 현금 정산합니다.',
            badge: '교환비율',
            icon: <Network size={34} />,
            chips: ['0.5476주', '고정 현금 없음', '단주만 현금'],
            chipType: 'metric' as const,
          },
          {
            title: '한 줄 정리',
            description: detailPick.oneLineConclusion ?? detailPick.reasonSummary,
            badge: '합병 발표 ≠ 무조건 호재',
            icon: <FileSearch size={34} />,
            chips: ['교환비율', '상대 주가', '합병가치'],
            chipType: 'metric' as const,
          },
          {
            title: '진짜 체크포인트',
            description: '조건 변경, 양사 주주·규제 승인, 통합 시너지와 화학 업황을 순서대로 확인합니다.',
            badge: '승인·실행',
            icon: <Target size={34} />,
            chips: ['주주·규제 승인', '합병 시너지', '화학 업황'],
            chipType: 'metric' as const,
          },
          {
            title: '마지막으로',
            description: 'M&A 뉴스는 기대감을 만들고, 합병 조건과 화학 업황이 주가를 검증합니다.',
            badge: '기대와 검증',
            icon: <BarChart3 size={34} />,
            chips: ['기대감', '합병 조건', '업황 검증'],
            chipType: 'metric' as const,
          },
        ]
      : isUniqureRegulatoryPick
        ? [
            {
              title: '오늘 왜 움직였나요?',
              description: '6월 17일 AMT-130의 FDA 규제 경로 발표 뒤 uniQure 종가는 약 78.4% 상승했습니다.',
              badge: 'FDA 경로 재개',
              icon: <Newspaper size={34} />,
              chips: ['2026-06-17', '종가 약 +78.4%', '승인 완료 아님'],
              chipType: 'metric' as const,
            },
            {
              title: '핵심 조건',
              description: 'FDA는 3년차 1/2상 분석을 가속승인 BLA의 주된 근거로 받아들일 수 있다고 전달했습니다.',
              badge: 'BLA 제출 준비',
              icon: <Network size={34} />,
              chips: ['3년차 1/2상', '2026년 3분기 계획', '확증시험 협의'],
              chipType: 'metric' as const,
            },
            {
              title: '한 줄 정리',
              description: detailPick.oneLineConclusion ?? detailPick.reasonSummary,
              badge: '경로 재개 ≠ 승인',
              icon: <FileSearch size={34} />,
              chips: ['제출', '접수·심사', '승인'],
              chipType: 'metric' as const,
            },
            {
              title: '진짜 체크포인트',
              description: 'BLA 제출·접수, 가속승인 심사, 효과·안전성, 추가 임상 요구를 순서대로 확인합니다.',
              badge: '규제 단계',
              icon: <Target size={34} />,
              chips: ['BLA 제출·접수', '효과·안전성', '추가 임상'],
              chipType: 'metric' as const,
            },
            {
              title: '마지막으로',
              description: 'FDA 뉴스는 기대감을 만들고, 임상 데이터와 실제 승인 결과가 주가를 검증합니다.',
              badge: '기대와 검증',
              icon: <BarChart3 size={34} />,
              chips: ['FDA 뉴스', '임상 데이터', '승인 결과'],
              chipType: 'metric' as const,
            },
          ]
        : standardStoryCards;

    return (
      <div className="pick-shell story-dark-shell story-pick-shell">
        <PrimaryNavigation
          active="picks"
          onHome={onHome}
          onOpenPicks={onOpenPicks}
          onOpenMarketMap={onOpenMarketMap}
          onOpenDisclosures={onOpenDisclosures}
          onOpenReports={onOpenReports}
        />

        <main className="pick-detail pick-detail-page">
          <section className="pick-story-hero">
            <div>
              <CompanyIdentityForPick pick={detailPick} size="hero" className={`pick-move ${detailPick.movementDirection}`} />
              <div className="pick-story-price-row">
                <PriceBadge price={detailPickPrice} compact />
              </div>
              <h1>{storyQuestion}</h1>
              <strong>{storyAnswer}</strong>
              <p>{storyHeroNote}</p>
              <div className="pick-story-actions" aria-label="Pick 주요 이동">
                {relatedCompany && relatedCompanyCanOpenFinancials ? (
                  <button type="button" className="pick-primary-action" onClick={() => onOpenAnalysis(relatedCompany, 'financial-easy-view')}>
                    <BarChart3 size={16} />
                    숫자 3개 보기
                  </button>
                ) : relatedCompany && relatedCompanyCanOpenAnalysis ? (
                  <button type="button" className="pick-primary-action" onClick={() => onOpenAnalysis(relatedCompany)}>
                    <FileSearch size={16} />
                    기업 해설 보기
                  </button>
                ) : hasPickMarketFlow ? (
                  <button type="button" className="pick-primary-action" onClick={openPickMarketFlow}>
                    <Network size={16} />
                    시장 흐름 보기
                  </button>
                ) : null}
                {relatedCompany && (relatedCompanyCanOpenAnalysis || relatedCompanyCanOpenFinancials) && hasPickMarketFlow ? (
                  <button type="button" onClick={openPickMarketFlow}>
                    <Network size={16} />
                    시장 흐름 보기
                  </button>
                ) : null}
              </div>
            </div>
            <div className="pick-story-cover" aria-label="Pick 요약">
              {relatedCompany ? (
                <CompanyLogo company={relatedCompany} size="hero" />
              ) : (
                <span className="pick-story-cover-fallback">{detailPick.companyName.slice(0, 2)}</span>
              )}
              <span>{flowLabel}</span>
            </div>
          </section>

          <section className="pick-story-board" aria-label="Pick 카드뉴스 5장">
            {storyCards.map((card, index) => (
              <article className="pick-story-card" key={card.title}>
                <div className="pick-story-card-top">
                  <span className="pick-story-step">{index + 1}</span>
                  <span className="story-term-badge">{card.badge}</span>
                </div>
                <div className="pick-story-icon">{card.icon}</div>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
                {card.chips && (
                  <div className="pick-story-chip-row" aria-label={card.title}>
                    {card.chips.slice(0, 3).map((chip) => {
                      const company = card.chipType === 'company' ? storyCompanyByLabel(chip) : undefined;
                      return company ? (
                        <button key={chip} type="button" onClick={() => onOpenAnalysis(company)}>
                          {chip}
                        </button>
                      ) : (
                        <span key={chip}>{chip}</span>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </section>

          <RelatedIndustryReports
            title="이 이슈를 넓게 보면"
            description="이 Pick은 단기 뉴스에서 시작했지만, 산업 보고서를 보면 어떤 시장 흐름과 연결되는지 더 넓게 볼 수 있습니다."
            reports={relatedIndustryReports}
            onOpenReports={onOpenReports}
          />

          <EvidenceDetails
            description="이 Pick의 해석에 사용된 산업 보고서와 확인 자료입니다. 보고서의 산업 전망이 특정 기업의 실적을 보장하지는 않습니다."
            groups={pickEvidenceGroups}
            onOpenReports={onOpenReports}
          />

          <PickDisclosurePanel pick={detailPick} disclosures={disclosures} secFilings={secFilings} />

          {pendingMarketMapNote ? (
            <aside className="pick-market-map-note" aria-label="관련 시장지도 안내">
              <Network size={16} />
              <span>{pendingMarketMapNote}</span>
            </aside>
          ) : null}

          <section className="pick-story-drawers" aria-label="더 깊게 보기">
            <details>
              <summary>
                <span>자세한 설명</span>
                <ChevronDown size={15} />
              </summary>
              <div className="pick-drawer-body">
                <p>{conclusion}</p>
                <p>{detailPick.reasonSummary}</p>
                <p>{detailPick.beginnerExplanation ?? detailPick.beginnerSummary}</p>
                <div className="pick-drawer-metric-grid">
                  {watchMetricCards.map((metric) => (
                    <article key={metric.label}>
                      <strong>{metric.label}</strong>
                      <span>{metric.value}</span>
                      <small>{metric.note}</small>
                    </article>
                  ))}
                </div>
              </div>
            </details>

            <details>
              <summary>
                <span>좋은 신호</span>
                <ChevronDown size={15} />
              </summary>
              <div className="pick-drawer-list">
                {signalSet.good.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
              </div>
            </details>

            <details>
              <summary>
                <span>조심할 신호</span>
                <ChevronDown size={15} />
              </summary>
              <div className="pick-drawer-list caution">
                {signalSet.caution.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
              </div>
            </details>

            {!usesEvidenceLayer ? <details>
              <summary>
                <span>원문/출처</span>
                <ChevronDown size={15} />
              </summary>
              <div className="pick-drawer-sources">
                {reportLink ? (
                  <ReportAction reportLink={reportLink} className="compact-report-action" iconSize={14} />
                ) : (
                  <span className="pick-disabled-action">원문 보고서 연결 준비 중</span>
                )}
                {detailPick.sourceLinks?.filter((source) => source.accessType !== 'restricted').slice(0, 3).map((source) =>
                  source.url ? (
                    <a key={source.label} href={source.url} target="_blank" rel="noreferrer noopener">
                      {source.label}
                    </a>
                  ) : (
                    <span key={source.label} className="pick-disabled-action">{source.label} 준비 중</span>
                  ),
                )}
              </div>
            </details> : null}

            {(relatedCompany && relatedCompanyCanOpenAnalysis) || hasPickMarketFlow ? (
              <details>
                <summary>
                  <span>더 깊게 보기</span>
                  <ChevronDown size={15} />
                </summary>
                <div className="pick-drawer-actions">
                  {relatedCompany && relatedCompanyCanOpenAnalysis ? (
                    <button type="button" onClick={() => onOpenAnalysis(relatedCompany)}>
                      기업 해설 보기
                    </button>
                  ) : relatedCompanyConnection ? (
                    <span className="pick-disabled-action">{relatedCompanyConnection.label}</span>
                  ) : null}
                  {relatedCompany && relatedCompanyCanOpenFinancials ? (
                    <button type="button" onClick={() => onOpenAnalysis(relatedCompany, 'financial-easy-view')}>
                      숫자 3개 보기
                    </button>
                  ) : relatedCompanyCanOpenAnalysis && relatedCompanyConnection ? (
                    <span className="pick-disabled-action">{relatedCompanyConnection.detail}</span>
                  ) : null}
                  {hasPickMarketFlow ? (
                    <button type="button" onClick={openPickMarketFlow}>
                      시장 흐름 보기
                    </button>
                  ) : null}
                </div>
              </details>
            ) : null}
          </section>
        </main>
      </div>
    );
  }

  const renderPickCard = (pick: StockAutopsyPick) => (
    <article className="pick-card" key={pick.id}>
      <div className="card-company-row">
        <div className="card-company-copy">
          <CompanyIdentityForPick pick={pick} size="card" />
        </div>
        <div className="card-status">
          <span className="pick-archive-badge">{isArchive ? '보관함' : '현재 Pick'}</span>
          <span className={`pick-move-badge ${pick.movementDirection === 'up' ? 'up' : 'down'}`}>
            {pick.movementDirection === 'up' ? '상승' : '하락'}
          </span>
        </div>
      </div>
      <h2>{pick.title}</h2>
      <PriceBadge price={getPriceForPick(pick, marketPrices)} compact />
      <div className="pick-movement-line">
        <span>움직임</span>
        <strong>{pick.movementLabel}</strong>
      </div>
      <p className="pick-card-summary">{pick.reasonSummary}</p>
      <button type="button" className="pick-primary-action" onClick={() => onOpenPick(pick)}>
        해부 보기
        <ArrowRight size={16} />
      </button>
    </article>
  );

  return (
    <div className="pick-shell story-dark-shell story-pick-shell">
      <PrimaryNavigation
        active="picks"
        onHome={onHome}
        onOpenPicks={onOpenPicks}
        onOpenMarketMap={onOpenMarketMap}
        onOpenDisclosures={onOpenDisclosures}
        onOpenReports={onOpenReports}
      />

      <main>
        <section className="pick-hero">
          <p className="home-kicker">{isArchive ? '지난 해부' : '주가해부실 Pick'}</p>
          <h1>{isArchive ? '지난 해부 보관함' : '이번 주 해부 종목'}</h1>
          <p>
            {isArchive
              ? '이번 주 Pick에서 내려간 종목과 이전 시장 흐름을 모아두었습니다.'
              : '급등·급락한 이유를 시장 흐름과 함께 쉽게 정리했습니다.'}
          </p>
          <small>
            {isArchive
              ? '주차별로 묶어 시장이 어떤 이슈를 봤는지 다시 확인할 수 있습니다.'
              : '인스타그램에서 다룬 종목이 어떤 기업들과 연결되는지 확인해보세요.'}
          </small>
          <div className="pick-category-tabs" aria-label="Pick 분류">
            <button
              type="button"
              className={!isArchive ? 'active' : ''}
              aria-pressed={!isArchive}
              onClick={onOpenPicks}
            >
              이번 주
            </button>
            <button
              type="button"
              className={isArchive ? 'active' : ''}
              aria-pressed={isArchive}
              onClick={onOpenPicksArchive}
            >
              보관함
            </button>
          </div>
          <div className="pick-market-filter" aria-label="시장 보조 필터">
            {[
              { value: 'all' as const, label: '전체' },
              { value: 'KR' as const, label: '한국' },
              { value: 'US' as const, label: '미국' },
            ].map((item) => (
              <button
                type="button"
                key={item.value}
                className={pickMarketFilter === item.value ? 'active' : ''}
                aria-pressed={pickMarketFilter === item.value}
                onClick={() => setPickMarketFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {isArchive ? (
          <section className="pick-archive-groups" aria-label="지난 해부 주차별 목록">
            {visibleArchivePickGroups.map((group) => (
              <section className="pick-archive-group" key={group.id} aria-labelledby={`archive-group-${group.id}`}>
                <div className="pick-archive-group-header">
                  <div>
                    <h2 id={`archive-group-${group.id}`}>{group.title}</h2>
                    <p>{group.description}</p>
                  </div>
                  <span>{group.picks.length}개</span>
                </div>
                <div className="pick-grid" aria-label={`${group.title} 목록`}>
                  {group.picks.map(renderPickCard)}
                </div>
              </section>
            ))}
          </section>
        ) : (
          <section className="pick-grid" aria-label="주가해부실 Pick 목록">
            {visiblePicks.map(renderPickCard)}
          </section>
        )}

        {isArchive && !visiblePicks.length ? (
          <section className="pick-empty pick-archive-empty" aria-label="보관함 비어 있음">
            <h1>아직 보관된 해부가 없습니다.</h1>
            <p>이번 주 Pick을 먼저 확인해보세요.</p>
            <button type="button" onClick={onOpenPicks}>
              이번 주 Pick 보기
            </button>
          </section>
        ) : null}

        {isArchive ? (
          <section className="pick-archive-link-panel compact">
            <span>이번 주 해부로 돌아가기</span>
            <p>현재 주간 Pick은 Marvell, LG전자, Taylor Morrison만 따로 모아두었습니다.</p>
            <button type="button" onClick={onOpenPicks}>
              이번 주 Pick 보기
              <ArrowRight size={15} />
            </button>
          </section>
        ) : (
          <section className="pick-archive-link-panel">
            <span>지난 해부를 찾고 있다면</span>
            <p>예전에 다룬 Pick은 보관함에 모아두었습니다.</p>
            <button type="button" onClick={onOpenPicksArchive}>
              지난 해부 보관함 보기
              <ArrowRight size={15} />
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function AnalysisPage({ company, anchor, newsState, onHome, onBack, onOpenAnalysis, onRefreshNews, marketPrices }: AnalysisPageProps) {
  const primaryReportLink = getPrimaryReportLink(company);
  const dataFreshness = dataFreshnessInfo(company, primaryReportLink);
  const disclosureAnalysis = buildCompanyDisclosureAnalysis(company, anchor);
  const displayMetrics = disclosureAnalysis.displayMetrics;
  const isKorea = company.country === 'KR';
  const watchPoints = disclosureAnalysis.watchPoints;
  const [financialSummary, setFinancialSummary] = useState<FinancialStatementSummary>(() => buildFallbackFinancials(company));
  const [companyTrades, setCompanyTrades] = useState<SmartMoneyMove[]>([]);

  useEffect(() => {
    let cancelled = false;
    setFinancialSummary(buildFallbackFinancials(company));
    setCompanyTrades([]);

    fetchFinancialsByCompany(company).then((summary) => {
      if (!cancelled) setFinancialSummary(summary);
    });
    fetchTradesByCompany(company).then((items) => {
      if (!cancelled) setCompanyTrades(items);
    });

    return () => {
      cancelled = true;
    };
  }, [company]);

  const beginnerConclusion = beginnerInterpretation(disclosureAnalysis, company);
  const firstWatchPoint = watchPoints[0] ?? '다음 공시에서 매출, 현금흐름, 부채가 같은 방향으로 개선되는지 확인합니다.';
  const recentMover = marketMovers.find((mover) => mover.companyId === company.id);
  const recentMovementSummary = recentMover?.reason ?? `${company.analystSignal} ${company.investmentView}`;
  const companyPrice = getPriceForCompany(company, marketPrices);
  const companyCanOpenFinancials = canOpenCompanyFinancials(company);
  const sourceStatusShort =
    primaryReportLink.status === 'direct'
      ? '원문 보고서 연결됨'
      : primaryReportLink.status === 'search-only'
        ? '검색으로 원문 확인 가능'
        : primaryReportLink.status === 'private-company'
          ? '비상장/공시 의무 없음'
          : primaryReportLink.status === 'no-public-filing'
            ? '공개 원문 보고서 없음'
            : primaryReportLink.status === 'listing-unknown'
              ? '상장 정보 확인 필요'
              : '원문 연결 준비 중';
  const sourceStatusCopy =
    primaryReportLink.status === 'direct'
      ? '이 해설은 연결된 원문 보고서에서 확인할 수 있습니다.'
      : primaryReportLink.status === 'search-only'
        ? '직접 원문 URL은 아직 없고 검색 링크로 확인할 수 있습니다.'
        : primaryReportLink.status === 'private-company' || primaryReportLink.status === 'no-public-filing'
          ? '상장 공시 원문 확인 대상과 구분해 표시합니다. 공개 보고서가 확인되면 원문 링크를 보강합니다.'
          : primaryReportLink.status === 'listing-unknown'
            ? '상장 여부와 공시 식별자가 아직 불완전합니다. 확인 전에는 원문 링크를 만들지 않습니다.'
            : '직접 원문 URL이 아직 연결되지 않았습니다. 나중에 reportUrl을 넣으면 바로 연결됩니다.';
  const explainerMoat = companyMoatSummary(company);
  const explainerMetrics = beginnerIndustryMetrics(company, displayMetrics);
  const financialPriorityMetrics = connectFinancialPriorityMetrics(company, financialSummary, explainerMetrics);
  const financialDataFreshness = financialFreshnessInfo(company, primaryReportLink, financialSummary, dataFreshness, sourceStatusShort);
  const financialSourceBadges = financialSourceBadgeItems(financialSummary, financialDataFreshness);
  const financialInsightCards = buildFinancialInsightCards(company, financialSummary);
  const explainerSignals = beginnerSignalSet(company);
  const relatedLinks = links.filter((link) => link.source === company.id || link.target === company.id);
  const relatedCompanies = relatedLinks
    .map((link) => {
      const counterpartId = link.source === company.id ? link.target : link.source;
      const counterpart = companies.find((item) => item.id === counterpartId);
      return counterpart
        ? {
            company: counterpart,
            relationship: linkRelationshipSummary(link),
          }
        : undefined;
    })
    .filter((item): item is { company: Company; relationship: ReturnType<typeof linkRelationshipSummary> } => Boolean(item))
    .sort((a, b) => {
      const linkA = relatedLinks.find((link) => link.source === a.company.id || link.target === a.company.id);
      const linkB = relatedLinks.find((link) => link.source === b.company.id || link.target === b.company.id);
      const firstLookA = aiFirstLookIds.indexOf(a.company.id);
      const firstLookB = aiFirstLookIds.indexOf(b.company.id);
      const priorityA =
        (linkA && aiCoreLinkIds.has(linkA.id) ? 0 : 20) +
        (firstLookA >= 0 ? firstLookA : 10) +
        (isMainListedCompany(a.company) ? 0 : 6);
      const priorityB =
        (linkB && aiCoreLinkIds.has(linkB.id) ? 0 : 20) +
        (firstLookB >= 0 ? firstLookB : 10) +
        (isMainListedCompany(b.company) ? 0 : 6);
      return priorityA - priorityB;
    })
    .slice(0, 3);
  const scrollToAnalysisSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const financialConclusion = financialOneLineConclusion(company, disclosureAnalysis);
  const financialNumberCards = financialPriorityMetrics.slice(0, 3).map((metric, index) => ({
    ...metric,
    question: financialQuestionTitle(index),
    badge: financialTermBadge(metric.label, index),
    comparisonNote: financialComparisonNote(metric.comparison),
    sourceNote: financialMetricSourceNote(metric.value, financialSummary),
  }));
  const financialSignals = financialSimpleSignalSet();
  const companyTopConclusion = beginnerCompanyConclusion(company);
  const companyShortDescription = companyEasyExplanation(company);
  const questionTermBadges = companyQuestionTermBadges(company);
  const companyQuestionCards = [
    {
      title: '이 회사는 뭐 해요?',
      description: companyQuestionProductCopy(company),
      badge: questionTermBadges.product,
    },
    {
      title: '누가 이걸 필요로 해요?',
      description: companyQuestionDemandCopy(company),
      badge: questionTermBadges.demand,
    },
    {
      title: '왜 쉽게 못 따라 하나요?',
      description: companyQuestionMoatCopy(company),
      badge: questionTermBadges.moat,
    },
    {
      title: '뭘 확인하면 돼요?',
      description: companyQuestionCheckCopy(company),
      badge: questionTermBadges.check,
    },
  ];
  const deepSummaryCards = [
    {
      title: '한 줄 결론',
      value: beginnerCompanyConclusion(company),
      note: `기준: ${dataFreshness.reportName} · ${dataFreshness.status}`,
    },
    {
      title: '쉽게 말하면',
      value: companyEasyExplanation(company),
      note: `관련 수요: ${companyDemandTitle(company)}`,
    },
    {
      title: '그래서 뭘 볼까?',
      value: companyWatchChecklistSummary(company),
      note: explainerMetrics.slice(0, 3).map((metric) => metric.label).join(', '),
    },
    {
      title: '무엇을 파는 회사인가',
      value: productText(company),
      note: companyProductExplanation(company),
    },
    {
      title: '누구의 수요와 연결되는가',
      value: companyDemandTitle(company),
      note: companyDemandExplanation(company),
    },
    {
      title: '경제적 해자',
      value: explainerMoat.title,
      note: explainerMoat.explanation,
    },
    {
      title: '투자자가 볼 포인트',
      value: companyInvestorSignalTitle(company),
      note: companyInvestorSignalCopy(company),
    },
  ];

  return (
    <div className="analysis-shell story-dark-shell story-analysis-shell">
      <header className="analysis-hero company-explainer-hero">
        <nav className="breadcrumb" aria-label="현재 위치">
          <button type="button" onClick={onHome}>홈</button>
          <span>기업 해설</span>
          <span>{company.name}</span>
          <strong>{company.name} 기업 해설</strong>
        </nav>
        <div className="analysis-nav-actions">
          <button type="button" className="ghost-action" onClick={onHome}>
            <Network size={16} />
            홈
          </button>
          <button type="button" className="ghost-action" onClick={() => onBack(company)}>
            <ArrowRight size={16} />
            시장 흐름 보기
          </button>
        </div>
        <div>
          <p className="eyebrow">주가해부실 · 초보자용 기업 설명서</p>
          <h1>{company.name} 기업 해설</h1>
          <p>이 회사가 뭘 파는지와 누구의 수요와 연결되는지 먼저 봅니다.</p>
        </div>
        <div className="analysis-actions">
          <div className="data-freshness-card compact" aria-label="데이터 기준">
            <strong>{dataFreshness.reportName}</strong>
            <span>{dataFreshness.filingDate}</span>
            <em>{dataFreshness.status}</em>
          </div>
        </div>
      </header>

      <main className="analysis-detail-flow">
        <section className="analysis-card company-explainer-card">
          <div className="company-explainer-top">
            <CompanyLogo company={company} size="hero" className="company-explainer-logo" />
            <div>
              <div className="company-explainer-meta">
                <span className="analysis-market-pill">{companyScopeLabel(company)}</span>
              </div>
              <CompanyIdentityForCompany company={company} size="hero" className="company-explainer-identity" />
              <strong className="company-one-line-conclusion">{companyTopConclusion}</strong>
              <p>{companyShortDescription}</p>
            </div>
            <div className="company-explainer-price">
              {hasTradableTicker(company) && companyPrice && priceDirection(companyPrice) !== 'pending' ? (
                <PriceBadge price={companyPrice} compact />
              ) : hasTradableTicker(company) ? (
                <span className="reference-status-pill">가격 확인 필요</span>
              ) : (
                <span className="reference-status-pill">{companyScopeLabel(company)}</span>
              )}
              <small>{dataFreshness.reportName} · {dataFreshness.status}</small>
            </div>
          </div>

          <section className="company-question-card-grid" aria-label={`${company.name} 질문 카드`}>
            {companyQuestionCards.map((card, index) => (
              <article className="company-question-card" key={card.title}>
                <div className="company-question-top">
                  <span>{index + 1}</span>
                  <em>{card.badge}</em>
                </div>
                <div className="company-question-body">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </article>
            ))}
          </section>

          <div className="explainer-primary-actions">
            {companyCanOpenFinancials ? (
              <button type="button" onClick={() => scrollToAnalysisSection('financial-easy-view')}>
                <CircleDollarSign size={15} />
                숫자 3개 보기
              </button>
            ) : (
              <span className="explainer-disabled-action">
                <CircleDollarSign size={15} />
                재무 연결 준비 중
              </span>
            )}
            <button type="button" onClick={() => onBack(company)}>
              <Network size={15} />
              시장 흐름 보기
            </button>
          </div>

          <details className="explainer-advanced-card">
            <summary>
              <span>
                <FileSearch size={16} />
                <strong>더 깊게 보기</strong>
                <small>긴 설명, 원문, 관계 출처는 필요할 때만 펼쳐 봅니다.</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div>
              <section className="company-deep-summary-grid" aria-label="기업 해설 자세한 설명">
                {deepSummaryCards.map((card) => (
                  <article key={card.title}>
                    <span>{card.title}</span>
                    <strong>{card.value}</strong>
                    <p>{card.note}</p>
                  </article>
                ))}
              </section>

              <section className="explainer-metric-card compact">
                <div className="section-title">
                  <BarChart3 size={16} />
                  <span>이 산업에서 먼저 볼 지표 3개</span>
                </div>
                <div>
                  {explainerMetrics.slice(0, 3).map((metric) => (
                    <article key={metric.label}>
                      <span><BarChart3 size={14} />{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <p>{metric.note}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="explainer-related-card" id="related-companies">
                <div className="section-title">
                  <ArrowRight size={16} />
                  <span>{company.name}와 함께 볼 기업</span>
                </div>
                {relatedCompanies.length ? (
                  <div className="explainer-related-list">
                    {relatedCompanies.map((item) => (
                      <button key={item.company.id} type="button" onClick={() => onOpenAnalysis(item.company)}>
                        <CompanyLogo company={item.company} size="small" />
                        <span>
                          <CompanyIdentityForCompany company={item.company} size="compact" />
                          <em>{shortRelationshipLabel(item.relationship.type)} · {item.relationship.confidence}</em>
                        </span>
                        <b>보기</b>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="explainer-empty-copy">현재 공개 데이터 기준 정리된 관련 기업이 아직 없습니다.</p>
                )}
              </section>

              <section className="explainer-signal-card">
                <div className="section-title">
                  <AlertTriangle size={16} />
                  <span>좋은 신호 / 조심할 신호</span>
                </div>
                <div className="signal-columns">
                  <div>
                    <strong>좋은 신호</strong>
                    {explainerSignals.good.map((signal) => <span key={signal}>{signal}</span>)}
                  </div>
                  <div>
                    <strong>조심할 신호</strong>
                    {explainerSignals.caution.map((signal) => <span key={signal}>{signal}</span>)}
                  </div>
                </div>
              </section>
              <div className="explainer-action-row">
                <ReportAction reportLink={primaryReportLink} className="explainer-report-action" iconSize={15} label="공시 원문 보기" />
                <button type="button" onClick={() => scrollToAnalysisSection('compact-deep-dive')}>
                  <FileSearch size={15} />
                  관계 출처 보기
                </button>
                <button type="button" onClick={() => scrollToAnalysisSection('related-companies')}>
                  <ArrowRight size={15} />
                  관련 기업 보기
                </button>
                <button type="button" onClick={() => scrollToAnalysisSection('compact-deep-dive')}>
                  <CircleDollarSign size={15} />
                  기관 동향 보기
                </button>
              </div>
            </div>
          </details>
        </section>

        <section className="analysis-card analysis-overview-card financial-learning-card" id="financial-easy-view">
          <div className="analysis-overview-head financial-learning-head">
            <div>
              <span className="analysis-market-pill">재무 쉽게 보기 · {marketDisplayLabel(company)}</span>
              <h2>숫자는 마지막 확인입니다</h2>
              <p>이야기가 실제 돈과 수익성으로 이어졌는지 봅니다.</p>
            </div>
            <div className="analysis-overview-side">
              <span className={`analysis-source-pill ${financialDataFreshness.sourceClass}`}>{financialDataFreshness.sourceLabel}</span>
              <div className="data-freshness-card" aria-label="재무 데이터 기준">
                <strong>기준 보고서: {financialDataFreshness.reportName}</strong>
                <span>공시일: {financialDataFreshness.filingDate}</span>
                <em>{financialDataFreshness.status}</em>
              </div>
              {financialSourceBadges.length ? (
                <div className="financial-source-badge-row" aria-label="재무 원문 기준 요약">
                  {financialSourceBadges.map((badge) => <span key={badge}>{badge}</span>)}
                </div>
              ) : null}
              <small className="analysis-report-meta">{primaryReportLink.statusDetail}</small>
            </div>
          </div>

          <section className="financial-visual-summary" aria-label="재무 핵심 흐름 시각 요약">
            {financialInsightCards.map((card) => (
              <article className={`financial-insight-card ${card.status}`} key={card.title}>
                <span className="financial-insight-eyebrow">{card.status === 'ready' ? '공식 숫자 기준' : '계산 대기'}</span>
                <h3>{card.title}</h3>
                <strong>{card.value}</strong>
                <p>{card.note}</p>
                {card.status === 'ready' && typeof card.barPercent === 'number' ? (
                  <div className="financial-ratio-visual" aria-label={card.barLabel ?? card.value}>
                    <div className="financial-ratio-track">
                      <span style={{ width: `${card.barPercent}%` }} />
                    </div>
                    <small>{card.detail}</small>
                  </div>
                ) : null}
                {card.status === 'ready' && card.comparisonBars?.length ? (
                  <div className="financial-comparison-bars" aria-label={card.detail}>
                    {card.comparisonBars.map((item) => (
                      <div className={`financial-comparison-row ${item.direction}`} key={item.label}>
                        <span>{item.label}</span>
                        <div className="financial-comparison-track">
                          <i style={{ width: `${item.width}%` }} />
                        </div>
                        <b>{item.value}</b>
                      </div>
                    ))}
                  </div>
                ) : null}
                {card.comparisonPills?.length ? (
                  <div className="financial-insight-pill-row">
                    {card.comparisonPills.map((pill) => (
                      <span key={`${card.title}-${pill.label}`}>{pill.label} {pill.value}</span>
                    ))}
                  </div>
                ) : null}
                {card.status === 'pending' ? <small className="financial-insight-muted">{card.detail}</small> : null}
              </article>
            ))}
          </section>

          <section className="financial-priority-card">
            <div className="section-title">
              <BarChart3 size={16} />
              <span>먼저 보는 숫자 3개</span>
            </div>
            <div className="financial-inline-help">
              <CheckCircle size={14} />
              <span>먼저 매출, 영업이익, 영업현금흐름을 보고, 그 다음 영업이익률과 현금흐름 비율을 확인합니다.</span>
            </div>
            <div className="financial-priority-grid">
              {financialNumberCards.map((metric, index) => (
                <article key={`${metric.badge}-${metric.label}`}>
                  <span className="financial-card-step">{index + 1}</span>
                  <h3>{metric.question}</h3>
                  <strong>{beginnerMetricValueLabel(metric.value)}</strong>
                  <em>{metric.badge}</em>
                  {metric.comparisonNote ? <small className="financial-comparison-note">{metric.comparisonNote}</small> : null}
                  <small>{metric.sourceNote}</small>
                </article>
              ))}
            </div>
          </section>

          <details className="financial-advanced-card">
            <summary>
              <span>
                <Target size={15} />
                <strong>숫자 더 보기</strong>
                <small>긴 설명과 전체 지표는 필요할 때만 펼쳐 봅니다.</small>
              </span>
              <ChevronDown size={15} />
            </summary>
            <div className="financial-deep-drawer">
              <div className="financial-one-line-panel">
                <span>한 줄 결론</span>
                <strong>{financialConclusion}</strong>
                <div className="financial-beginner-grid">
                  <article>
                    <span>쉽게 말하면</span>
                    <p>{beginnerConclusion}</p>
                  </article>
                  <article>
                    <span>그래서 뭘 봐야 하나요?</span>
                    <p>{firstWatchPoint}</p>
                  </article>
                </div>
              </div>

              <div className="financial-card-note-grid">
                {financialNumberCards.map((metric) => (
                  <article key={`${metric.badge}-${metric.question}-note`}>
                    <span>{metric.badge}</span>
                    <p>{metric.note}</p>
                  </article>
                ))}
              </div>

              <div className="financial-signal-grid">
                <section>
                  <strong><CheckCircle size={15} />좋은 신호</strong>
                  {financialSignals.good.map((signal) => <span key={signal}>{signal}</span>)}
                </section>
                <section>
                  <strong><AlertTriangle size={15} />조심할 신호</strong>
                  {financialSignals.caution.map((signal) => <span key={signal}>{signal}</span>)}
                </section>
              </div>

              <div className="financial-next-watch">
                <strong>다음 분기에 확인할 것</strong>
                <div>
                  {(watchPoints.length ? watchPoints : [firstWatchPoint]).slice(0, 3).map((point) => (
                    <span key={point}>{point}</span>
                  ))}
                </div>
                <small>{recentMovementSummary}</small>
              </div>
            </div>
          </details>
        </section>

        <section className="analysis-card analysis-compact-deep-card" id="compact-deep-dive" aria-label="더 깊게 보기">
          <div className="compact-deep-head">
            <span className="analysis-market-pill">더 깊게 보기</span>
            <h2>필요할 때만 원문과 보조 정보를 확인합니다</h2>
            <p>기업해설 기본 화면은 핵심 설명과 재무 요약만 남기고, 원문·관계·뉴스는 짧은 참고 목록으로 낮췄습니다.</p>
          </div>

          <div className="compact-deep-list">
            <article id="source-report-details">
              <FileSearch size={16} />
              <div>
                <strong>원문 보고서</strong>
                <p>{sourceStatusShort} · {primaryReportLink.statusDetail}</p>
              </div>
              <ReportAction reportLink={primaryReportLink} className="compact-deep-action" iconSize={14} label="원문 보기" />
            </article>

            <article id="disclosure-analysis-details">
              <ShieldAlert size={16} />
              <div>
                <strong>{isKorea ? '공시·감사 포인트' : 'MD&A / Risk Factors'}</strong>
                <p>{disclosureAnalysis.reportDate} · {disclosureAnalysis.headline}</p>
              </div>
              <span className="compact-deep-muted">{watchPoints[0] ?? sourceStatusCopy}</span>
            </article>

            <article id="relationship-details">
              <Network size={16} />
              <div>
                <strong>관련 기업 관계</strong>
                <p>{companyValueChainStage(company)} · {relatedCompanies.length ? `${relatedCompanies.length}개 함께 보기` : '관계 정리 중'}</p>
              </div>
              <button type="button" className="compact-deep-action" onClick={() => onBack(company)}>
                시장 흐름
                <ArrowRight size={14} />
              </button>
            </article>

            <article id="trade-report-details">
              <CircleDollarSign size={16} />
              <div>
                <strong>보유·거래 보고</strong>
                <p>{companyTrades.length ? `${companyTrades.length}건 공개 보고 참고` : '현재 확인된 공개 보고 없음'}</p>
              </div>
              <span className="compact-deep-muted">참고용 공개자료</span>
            </article>

            <article>
              <Newspaper size={16} />
              <div>
                <strong>관련 뉴스</strong>
                <p>
                  {newsState.status === 'success'
                    ? `${newsState.items.length}건 수집됨`
                    : newsState.status === 'loading'
                      ? '뉴스 수집 중'
                      : newsState.status === 'empty'
                        ? '최근 24시간 신뢰 도메인 뉴스 없음'
                        : '뉴스 API 확인 필요'}
                </p>
              </div>
              <button type="button" className="compact-deep-action muted" onClick={onRefreshNews} disabled={newsState.status === 'loading'}>
                <RefreshCw size={14} />
                새로고침
              </button>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

type OwnershipReportsPageProps = {
  onHome: () => void;
  onOpenAnalysis: (company: Company, anchor?: string) => void;
  onOpenCategory: (sectorId: string, selectedCompanyId?: string) => void;
};

function OwnershipReportsPage({ onHome, onOpenAnalysis, onOpenCategory }: OwnershipReportsPageProps) {
  const [sourceFilter, setSourceFilter] = useState<'all' | 'sec-13f' | 'sec-form4'>('all');
  const [investorQuery, setInvestorQuery] = useState('');
  const [tickerQuery, setTickerQuery] = useState('');
  const [items, setItems] = useState<SmartMoneyMove[]>(smartMoneyMoves);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const hasNarrowFilter = Boolean(investorQuery.trim() || tickerQuery.trim() || sourceFilter !== 'all');
    fetchOwnershipTrades({
      source: sourceFilter,
      investor: investorQuery.trim() || undefined,
      ticker: tickerQuery.trim() || undefined,
      limit: 50,
    }).then((rows) => {
      if (cancelled) return;
      if (rows.length) {
        setItems(rows);
        setStatus('ready');
        return;
      }
      setItems(hasNarrowFilter ? [] : smartMoneyMoves);
      setStatus(hasNarrowFilter ? 'ready' : 'fallback');
    });
    return () => {
      cancelled = true;
    };
  }, [investorQuery, sourceFilter, tickerQuery]);

  return (
    <div className="ownership-shell">
      <header className="pick-nav">
        <div className="breadcrumb" aria-label="현재 위치">
          <button type="button" onClick={onHome}>홈</button>
          <strong>기관 보유·거래 보고</strong>
        </div>
        <button type="button" className="ghost-action" onClick={onHome}>
          <Network size={15} />
          홈
        </button>
      </header>

      <main className="ownership-main">
        <section className="ownership-hero">
          <p className="home-kicker">공개 자료 기준</p>
          <h1>최근 공개된 기관 보유·내부자 거래 보고</h1>
          <p>13F는 분기 포트폴리오, Form 4는 내부자 거래 보고입니다. 한 번에 최대 50개만 보여줍니다.</p>
        </section>

        <section className="ownership-filter-panel" aria-label="기관 보유 거래 보고 필터">
          <div className="trade-filter-row">
            {[
              { value: 'all', label: '전체' },
              { value: 'sec-13f', label: '13F 보유 보고' },
              { value: 'sec-form4', label: 'Form 4 내부자' },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={sourceFilter === filter.value ? 'active' : ''}
                onClick={() => setSourceFilter(filter.value as 'all' | 'sec-13f' | 'sec-form4')}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <label>
            <span>기관명</span>
            <input type="search" placeholder="Berkshire, ARK..." value={investorQuery} onChange={(event) => setInvestorQuery(event.target.value)} />
          </label>
          <label>
            <span>종목명/티커</span>
            <input type="search" placeholder="AAPL, NVDA..." value={tickerQuery} onChange={(event) => setTickerQuery(event.target.value)} />
          </label>
          <div className="ownership-chip-row" aria-label="주요 기관 빠른 검색">
            {prominentInstitutionFilters.map((name) => (
              <button key={name} type="button" onClick={() => setInvestorQuery(name)}>
                {name}
              </button>
            ))}
          </div>
        </section>

        <div className="ownership-status-row">
          <span>{status === 'loading' ? '불러오는 중' : status === 'ready' ? 'Supabase 최신 공개 기록' : '예시 공개 보고 데이터 표시 중'}</span>
          <small>기본 50개 제한 · 화면 과밀 방지</small>
        </div>

        <section className="home-card-grid smart-money-grid">
          {items.slice(0, 50).map((move) => {
            const company = companies.find((item) => item.id === (move.relatedCompanyId ?? move.companyId));
            const supplyChainId = move.relatedSupplyChainId ?? move.sectorId;
            return (
              <article className="smart-card" key={move.id}>
                <div className="smart-card-primary">
                  <div>
                    <h3>{move.investorName}</h3>
                  </div>
                  <strong className="trade-action-badge">{publicReportActionLabel(move)}</strong>
                </div>
                <div className="smart-company-focus">
                  <CompanyIdentity
                    companyName={move.companyName}
                    ticker={move.ticker}
                    countryLabel={countryLabelFromMarket(move.market)}
                    size="compact"
                  />
                </div>
                <span className="trade-type-badge">{publicReportTypeBadge(move)}</span>
                <p>{move.beginnerExplanation}</p>
                <dl className="smart-meta-list">
                  <div><dt>공개일</dt><dd>{move.disclosedDate || '확인 필요'}</dd></div>
                  <div><dt>{publicReportDateLabel(move)}</dt><dd>{move.tradeDateOptional ?? publicReportDateFallback(move)}</dd></div>
                  <div><dt>출처</dt><dd>{move.sourceLabel}</dd></div>
                </dl>
                <small className="trade-delay-note">{publicReportDelayNote(move)}</small>
                <div className="card-actions">
                  <button type="button" onClick={() => onOpenCategory(supplyChainId, company?.id ?? move.relatedCompanyId ?? move.companyId)}>기업 관계 보기</button>
                  {company ? <button type="button" onClick={() => onOpenAnalysis(company)}>기업 분석 보기</button> : <button type="button">관련 분석 준비 중</button>}
                  <SourceReportAction move={move} />
                </div>
              </article>
            );
          })}
          {items.length === 0 && <div className="trade-empty">현재 조건에 맞는 공개 보유·거래 보고가 없습니다.</div>}
        </section>

        <div className="home-note">
          <p>13F는 분기 말 기관 보유 보고이며 실제 매수·매도 시점과 차이가 있습니다.</p>
          <p>Form 4 내부자 거래 보고도 공개 시점이 늦을 수 있습니다.</p>
          <p>투자 권유가 아닌 참고용 데이터입니다.</p>
        </div>
      </main>
    </div>
  );
}

type FinancialLearningPageProps = {
  onHome: () => void;
};

function FinancialLearningPage({ onHome }: FinancialLearningPageProps) {
  const coreItems = [
    {
      title: '매출',
      body: '회사가 얼마나 팔았는지 보는 출발점입니다. 매출만 커도 비용이 같이 커지면 남는 돈은 작을 수 있습니다.',
    },
    {
      title: '영업이익률',
      body: '영업이익을 매출로 나눈 비율입니다. 회사 크기보다 본업 수익성이 어떤 흐름인지 볼 때 씁니다.',
    },
    {
      title: '영업현금흐름',
      body: '장부상 이익이 실제 현금 흐름으로 이어졌는지 봅니다. 이익과 현금흐름이 함께 움직이는지가 중요합니다.',
    },
  ];

  return (
    <div className="financial-learn-shell">
      <header className="pick-nav financial-learn-nav">
        <div className="breadcrumb" aria-label="현재 위치">
          <button type="button" onClick={onHome}>홈</button>
          <strong>숫자 읽기</strong>
        </div>
        <button type="button" className="ghost-action" onClick={onHome}>
          <Network size={15} />
          홈
        </button>
      </header>

      <main className="financial-learn-main">
        <section className="financial-learn-hero">
          <span className="home-kicker">재무 숫자 참고</span>
          <h1>숫자 3개 읽는 법</h1>
          <p>기업해설에서 보는 매출, 영업이익률, 현금흐름의 순서를 짧게 정리했습니다.</p>
        </section>

        <section className="financial-learn-guide" aria-label="재무 숫자 읽는 법">
          {coreItems.map((item) => (
            <article key={item.title}>
              <span>{item.title}</span>
              <p>{item.body}</p>
            </article>
          ))}
        </section>

        <section className="financial-learn-note">
          <CheckCircle size={18} />
          <div>
            <strong>비교는 그다음입니다</strong>
            <p>YoY/QoQ, 부채비율, FCF, EPS는 핵심 3개를 본 뒤에 확인합니다.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryId>('KR');
  const [selectedSectorId, setSelectedSectorId] = useState('kr-semiconductors');
  const [selectedAnchorId, setSelectedAnchorId] = useState('kr-semiconductors-samsung');
  const [selectedCompanyId, setSelectedCompanyId] = useState('kr-semiconductors-samsung-한미반도체');
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [listingFilter, setListingFilter] = useState<ListingFilter>('all');
  const [relationshipFilter, setRelationshipFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>('core');
  const [flowViewMode, setFlowViewMode] = useState<FlowViewMode>('core');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [showReferenceNodes, setShowReferenceNodes] = useState(false);
  const [showNeedsVerification, setShowNeedsVerification] = useState(false);
  const [showDetailedLinks, setShowDetailedLinks] = useState(false);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<Node<NodeData>, Edge> | null>(null);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState(false);
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<Set<string>>(() => new Set());
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [sourcePanelLinkId, setSourcePanelLinkId] = useState<string | null>(null);
  const [newsState, setNewsState] = useState<NewsState>({ status: 'idle', items: [] });
  const [newsRefreshKey, setNewsRefreshKey] = useState(0);
  const [route, setRoute] = useState(() => `${window.location.pathname}${window.location.search}${window.location.hash}`);
  const [isMapLocked, setIsMapLocked] = useState(false);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [marketDisclosures, setMarketDisclosures] = useState<MarketDisclosureApiResponse>(initialDisclosureResponse);
  const [marketSecFilings, setMarketSecFilings] = useState<MarketSecFilingsApiResponse>(initialSecFilingsResponse);
  const [selectedFlowStage, setSelectedFlowStage] = useState<string | null>(null);
  const [showAllKoreaRelated, setShowAllKoreaRelated] = useState(false);
  const graphWrapRef = useRef<HTMLElement | null>(null);

  const country = countries.find((item) => item.id === selectedCountry) ?? countries[0];
  const countrySectors = sectors.filter((sector) => sector.country === selectedCountry);
  const selectedSector = sectors.find((sector) => sector.id === selectedSectorId) ?? countrySectors[0];
  const topAnchors = anchors.filter((anchor) => anchor.sectorId === selectedSector.id).sort((a, b) => a.rank - b.rank);
  const selectedAnchor = anchors.find((anchor) => anchor.id === selectedAnchorId) ?? topAnchors[0];
  const groupCompanies = companies.filter((company) => company.anchorId === selectedAnchor.id);
  const groupLinks = links.filter((link) => link.anchorId === selectedAnchor.id);
  const isAiRelationshipMap = selectedSector.id === aiRelationshipSectorId && selectedAnchor.id === aiRelationshipAnchorId;
  const isDatacenterPowerCoolingMap = selectedSector.id === datacenterPowerCoolingSectorId && selectedAnchor.id === datacenterPowerCoolingAnchorId;
  const isStoryMarketMap = isAiRelationshipMap || isDatacenterPowerCoolingMap;
  const hasSearchQuery = Boolean(query.trim());
  const expandedConnectedIds = new Set<string>();
  expandedCompanyIds.forEach((companyId) => {
    expandedConnectedIds.add(companyId);
    groupLinks.forEach((link) => {
      if (link.source === companyId) expandedConnectedIds.add(link.target);
      if (link.target === companyId) expandedConnectedIds.add(link.source);
    });
  });
  const baseVisibleCompanies = getVisibleCompanies(selectedAnchor.id, query, riskFilter);
  const matchesFlowViewMode = (company: Company) => {
    if (!isAiRelationshipMap) return true;
    if (flowViewMode === 'kr') return company.country === 'KR' && isMainListedCompany(company);
    if (flowViewMode === 'us') return company.country === 'US' && isMainListedCompany(company);
    if (flowViewMode === 'reference') return true;
    return true;
  };
  const visibleCompanies = baseVisibleCompanies.filter((company) => {
    const matchesStage = stageFilter === 'all' || companyValueChainStage(company) === stageFilter;
    const matchesListing =
      listingFilter === 'all' ||
      (listingFilter === 'listed' ? canOpenCompanyAnalysis(company) : !canOpenCompanyAnalysis(company));
    const matchesRole = !isAiRelationshipMap || matchesRoleFilter(company, roleFilter);
    const matchesCoreMode =
      !isAiRelationshipMap ||
      mapViewMode === 'all' ||
      flowViewMode !== 'core' ||
      roleFilter !== 'all' ||
      hasSearchQuery ||
      aiCoreCompanyIds.has(company.id) ||
      expandedConnectedIds.has(company.id) ||
      company.id === selectedCompanyId;
    const matchesReferenceVisibility =
      !isAiRelationshipMap ||
      showReferenceNodes ||
      flowViewMode === 'reference' ||
      roleFilter === 'reference' ||
      canOpenCompanyAnalysis(company) ||
      company.id === selectedCompanyId;
    const matchesVerificationVisibility =
      !isAiRelationshipMap ||
      showNeedsVerification ||
      flowViewMode === 'sources' ||
      !relationshipConfidenceLabel(company).includes('검증') ||
      company.id === selectedCompanyId;
    const matchesRelationship =
      relationshipFilter === 'all' ||
      relationshipTypeLabel(company) === relationshipFilter ||
      groupLinks.some((link) => (link.source === company.id || link.target === company.id) && linkRelationshipSummary(link).type === relationshipFilter);
    const matchesConfidence =
      confidenceFilter === 'all' ||
      relationshipConfidenceLabel(company) === confidenceFilter ||
      groupLinks.some((link) => (link.source === company.id || link.target === company.id) && linkConfidenceLabel(link) === confidenceFilter);
    return (
      matchesStage &&
      matchesListing &&
      matchesRole &&
      matchesFlowViewMode(company) &&
      matchesCoreMode &&
      matchesReferenceVisibility &&
      matchesVerificationVisibility &&
      matchesRelationship &&
      matchesConfidence
    );
  });
  const stageOptions = Array.from(new Set(groupCompanies.map((company) => companyValueChainStage(company))));
  const relationshipOptions = Array.from(
    new Set([
      ...groupCompanies.map((company) => relationshipTypeLabel(company)),
      ...groupLinks.map((link) => linkRelationshipSummary(link).type),
    ]),
  );
  const confidenceOptions = ['공식 확인', '공시·IR 기준', '공시·IR 기준 확인 필요', '산업상 관련', '검증 필요'];
  const visibleIds = new Set(visibleCompanies.map((company) => company.id));
  const visibleLinks = groupLinks
    .filter((link) => visibleIds.has(link.source) && visibleIds.has(link.target))
    .filter((link) => {
      if (!isAiRelationshipMap) return true;
      const relationship = linkRelationshipSummary(link);
      if (!showNeedsVerification && flowViewMode !== 'sources' && relationship.confidence.includes('검증')) return false;
      const isExpandedLink = expandedCompanyIds.has(link.source) || expandedCompanyIds.has(link.target);
      if (mapViewMode === 'core' && flowViewMode === 'core' && roleFilter === 'all' && !hasSearchQuery && !showDetailedLinks) return aiCoreLinkIds.has(link.id) || isExpandedLink;
      return true;
    });
  const selectedCompany =
    groupCompanies.find((company) => company.id === selectedCompanyId) ??
    visibleCompanies.find((company) => company.tier !== 'anchor') ??
    groupCompanies.find((company) => company.tier !== 'anchor') ??
    groupCompanies[0];
  const selectedOpinions = analystOpinions.filter((opinion) => opinion.companyId === selectedCompany?.id);
  const selectedDisplayMetrics = selectedCompany ? getDisplayMetrics(selectedCompany) : null;
  const selectedRevenueDisplay =
    selectedCompany && selectedDisplayMetrics
      ? revenueDisplayForCompany(selectedCompany, selectedDisplayMetrics)
      : null;
  const selectedDependency = selectedCompany ? dependencySummary(selectedCompany, groupLinks) : null;
  const selectedMoat = selectedCompany ? companyMoatSummary(selectedCompany) : null;
  const selectedRole = selectedCompany ? companyRoleProfile(selectedCompany) : null;
  const selectedBeginnerMetrics =
    selectedCompany && selectedDisplayMetrics ? beginnerIndustryMetrics(selectedCompany, selectedDisplayMetrics).slice(0, 3) : [];
  const selectedAnalystSummary = classifyAnalystOpinion(selectedOpinions);
  const selectedReportLink = selectedCompany ? getPrimaryReportLink(selectedCompany) : null;
  const selectedIsMainListed = selectedCompany ? isMainListedCompany(selectedCompany) : false;
  const selectedConnectionState = selectedCompany ? companyConnectionState(selectedCompany) : null;
  const selectedCanOpenAnalysis = canOpenCompanyAnalysis(selectedCompany);
  const selectedCanOpenFinancials = canOpenCompanyFinancials(selectedCompany);
  const selectedRelatedPick = relatedPickForMarketMapCompany(selectedCompany);
  const selectedCompanyPrice = selectedCompany && hasTradableTicker(selectedCompany) ? getPriceForCompany(selectedCompany, marketPrices) : null;
  const connectedIds = selectedCompany ? getConnectedIds(selectedCompany.id, groupLinks) : new Set<string>();
  const selectedDirectLinks = selectedCompany
    ? groupLinks.filter((link) => link.source === selectedCompany.id || link.target === selectedCompany.id)
    : [];
  const primaryDirectLinks = selectedDirectLinks.slice(0, isAiRelationshipMap ? 3 : 6);
  const selectedConnectionCards = selectedCompany
    ? selectedDirectLinks
        .map((link) => {
          const counterpartId = link.source === selectedCompany.id ? link.target : link.source;
          const counterpart = companies.find((company) => company.id === counterpartId);
          if (!counterpart) return undefined;
          return {
            link,
            company: counterpart,
            relationship: linkRelationshipSummary(link),
            direction: link.target === selectedCompany.id ? 'incoming' : 'outgoing',
          };
        })
        .filter((item): item is { link: (typeof links)[number]; company: Company; relationship: ReturnType<typeof linkRelationshipSummary>; direction: 'incoming' | 'outgoing' } => Boolean(item))
    : [];
  const prioritizedSelectedConnectionCards = [...selectedConnectionCards].sort((a, b) => {
    const firstLookA = aiFirstLookIds.indexOf(a.company.id);
    const firstLookB = aiFirstLookIds.indexOf(b.company.id);
    const priorityA =
      (aiCoreLinkIds.has(a.link.id) ? 0 : 20) +
      (firstLookA >= 0 ? firstLookA : 10) +
      (canOpenCompanyAnalysis(a.company) ? 0 : 6);
    const priorityB =
      (aiCoreLinkIds.has(b.link.id) ? 0 : 20) +
      (firstLookB >= 0 ? firstLookB : 10) +
      (canOpenCompanyAnalysis(b.company) ? 0 : 6);
    return priorityA - priorityB;
  });
  const incomingConnectionCards = prioritizedSelectedConnectionCards.filter((item) => item.direction === 'incoming').slice(0, 2);
  const outgoingConnectionCards = prioritizedSelectedConnectionCards.filter((item) => item.direction === 'outgoing').slice(0, 3);
  const focusPreviousCards = incomingConnectionCards.length ? incomingConnectionCards : prioritizedSelectedConnectionCards.slice(0, 1);
  const focusNextCards = (outgoingConnectionCards.length ? outgoingConnectionCards : prioritizedSelectedConnectionCards.filter((item) => !focusPreviousCards.some((prev) => prev.company.id === item.company.id))).slice(0, 3);
  const hiddenFocusConnectionCount = Math.max(
    0,
    selectedConnectionCards.length -
      new Set([...focusPreviousCards, ...focusNextCards].map((item) => item.company.id)).size,
  );
  const selectedFocusRelatedCards = prioritizedSelectedConnectionCards
    .filter((item, index, list) => list.findIndex((candidate) => candidate.company.id === item.company.id) === index)
    .slice(0, 4);
  const datacenterCompanionCards =
    selectedCompany && isDatacenterPowerCoolingMap
      ? (datacenterPowerCoolingCompanionCompanies[selectedCompany.id] ?? [])
          .map((item) => {
            const company = companies.find((candidate) => candidate.id === item.companyId);
            return company ? { ...item, company } : undefined;
          })
          .filter((item): item is { companyId: string; role: string; company: Company } => Boolean(item))
      : [];
  const selectedMarketRelatedCards =
    isDatacenterPowerCoolingMap && datacenterCompanionCards.length
      ? datacenterCompanionCards.map((item) => ({
          key: item.company.id,
          company: item.company,
          label: item.role,
          description: item.role,
          connection: companyConnectionState(item.company),
        }))
      : selectedFocusRelatedCards.map((item) => ({
          key: item.link.id,
          company: item.company,
          label: shortRelationshipLabel(item.relationship.type),
          description: item.relationship.demandConnection,
          connection: companyConnectionState(item.company),
        }));
  const selectedRelatedCompanyNames =
    datacenterCompanionCards.length
      ? datacenterCompanionCards.map((item) => item.company.name).join(', ')
      : prioritizedSelectedConnectionCards
          .slice(0, 3)
          .map((item) => item.company.name)
          .join(', ') || '직접 연결 기업 정리 중';
  const selectedRelatedCompanyCopy =
    datacenterCompanionCards.length > 0
      ? `아래 관계는 직접 계약 관계가 아니라, AI 데이터센터 투자 흐름에서 함께 확인하는 기업들입니다. ${datacenterCompanionCards
          .map((item) => `${item.company.name}: ${item.role}`)
          .join(' · ')}`
      : prioritizedSelectedConnectionCards.length > 0
      ? '같은 수요 흐름에서 함께 확인할 기업입니다. 직접 거래 여부는 공시와 출처로 따로 확인합니다.'
      : '아직 연결 기업이 충분히 정리되지 않았습니다. 전체 연결 보기에서 후보를 더 확인합니다.';
  const activeRelationshipId = selectedLinkId ?? hoveredLinkId;
  const activeRelationship = activeRelationshipId ? groupLinks.find((link) => link.id === activeRelationshipId) : undefined;
  const activeRelationshipSummary = activeRelationship ? linkRelationshipSummary(activeRelationship) : undefined;
  const sourcePanelLink = sourcePanelLinkId ? groupLinks.find((link) => link.id === sourcePanelLinkId) : undefined;
  const sourcePanelSummary = sourcePanelLink ? linkRelationshipSummary(sourcePanelLink) : undefined;
  const filteredOutCount = groupCompanies.length - visibleCompanies.length;
  const highRiskCount = groupCompanies.filter((company) => company.riskLevel === 'high').length;
  const firstLookCompanies = aiFirstLookIds
    .map((id) => groupCompanies.find((company) => company.id === id))
    .filter((company): company is Company => Boolean(company));
  const flowStageCards = aiFlowStages.map((stage) => {
    const representativeCompanies = stage.companyIds
      .map((id) => groupCompanies.find((company) => company.id === id))
      .filter((company): company is Company => Boolean(company))
      .filter((company) => visibleIds.has(company.id) || flowViewMode === 'core');
    const stageCompanies = groupCompanies.filter((company) => matchesAiFlowStage(stage.stage, company));
    const stagePool = [...representativeCompanies, ...stageCompanies].filter(
      (company, index, list) => list.findIndex((item) => item.id === company.id) === index,
    );
    const displayCompanies = (representativeCompanies.length ? representativeCompanies : stageCompanies).slice(0, 3);
    const extraCompanies = stagePool.filter((company) => !displayCompanies.some((item) => item.id === company.id)).slice(0, 4);
    const hiddenCount = Math.max(0, stagePool.length - displayCompanies.length);
    return {
      ...stage,
      companies: displayCompanies,
      extraCompanies,
      hiddenCount,
    };
  });
  const activeFlowStageName =
    selectedFlowStage ??
    (selectedCompany ? flowStageCards.find((stage) => matchesAiFlowStage(stage.stage, selectedCompany))?.stage ?? null : null);
  const activeFlowStageCard = activeFlowStageName ? flowStageCards.find((stage) => stage.stage === activeFlowStageName) ?? null : null;
  const selectedFlowStageIndex = activeFlowStageName ? flowStageCards.findIndex((stage) => stage.stage === activeFlowStageName) : -1;
  const selectedCompanyStatusLabel =
    selectedCompany && selectedCompany.id === selectedAnchor.id
      ? '섹터 중심 기업'
      : selectedConnectionState?.label ?? '시장 흐름 참고';
  const aiKoreaListedCompanies = aiKoreaListedPriorityNames
    .map((name) =>
      groupCompanies.find((company) => company.name === name && isMainListedCompany(company)) ??
      companies.find((company) => company.name === name && isMainListedCompany(company)),
    )
    .filter((company): company is Company => Boolean(company))
    .filter((company, index, list) => list.findIndex((item) => item.name === company.name) === index);
  const aiKoreaListedPreview = showAllKoreaRelated ? aiKoreaListedCompanies : aiKoreaListedCompanies.slice(0, 5);
  const roleFilterOptions: Array<{ value: RoleFilter; label: string; note: string }> = [
    { value: 'all', label: mapViewMode === 'core' ? '핵심 관계' : '전체', note: '기본 흐름' },
    { value: 'leader', label: '대장주', note: '먼저 볼 기업' },
    { value: 'bottleneck', label: '핵심 병목', note: '흐름의 관문' },
    { value: 'beneficiary', label: '수요 수혜', note: '함께 볼 기업' },
    { value: 'listed', label: '상장기업', note: '분석 대상' },
    { value: 'reference', label: '비상장 참고', note: '관계 보조' },
  ];
  const flowModeOptions: Array<{ value: FlowViewMode; label: string; note: string; tone?: 'primary' | 'secondary' }> = [
    { value: 'core', label: '핵심 흐름', note: '대표 기업 8~10개', tone: 'primary' },
    { value: 'kr', label: '한국 관련주', note: '한국 상장기업', tone: 'primary' },
    { value: 'all', label: '전체 연결 보기', note: '전체 연결을 한 번에 확인', tone: 'primary' },
    { value: 'sources', label: '출처 보기', note: '관계 근거 확인', tone: 'secondary' },
    { value: 'reference', label: '공급망 참고', note: '비상장/보조', tone: 'secondary' },
  ];
  const shouldShowRelationshipCanvas =
    !isStoryMarketMap || flowViewMode === 'all' || flowViewMode === 'sources' || flowViewMode === 'reference';
  const isAdvancedRelationshipView = isStoryMarketMap && shouldShowRelationshipCanvas;
  const shouldShowReadingTemplate = isStoryMarketMap && !shouldShowRelationshipCanvas;
  const routeHashIndex = route.indexOf('#');
  const routeWithoutHash = routeHashIndex >= 0 ? route.slice(0, routeHashIndex) : route;
  const routeHash = routeHashIndex >= 0 ? decodeURIComponent(route.slice(routeHashIndex + 1)) : '';
  const routePath = routeWithoutHash.split('?')[0];
  const routeQuery = routeWithoutHash.includes('?') ? routeWithoutHash.slice(routeWithoutHash.indexOf('?')) : '';
  const routeParams = new URLSearchParams(routeQuery);
  const routeAnalysisMatch = routePath.match(/^\/ko\/analysis\/([^/]+)$/);
  const routeCategoryMatch = routePath.match(/^\/ko\/category\/([^/]+)$/);
  const routeMarketMapMatch = routePath.match(/^\/ko\/market-map\/?$/) ?? routePath.match(/^\/market-map\/?$/);
  const routeDisclosuresMatch = routePath.match(/^\/ko\/disclosures\/?$/) ?? routePath.match(/^\/disclosures\/?$/);
  const routeReportsMatch = routePath.match(/^\/ko\/reports\/?$/) ?? routePath.match(/^\/reports\/?$/);
  const routeReportDetailMatch = routePath.match(/^\/ko\/reports\/([^/]+)\/?$/) ?? routePath.match(/^\/reports\/([^/]+)\/?$/);
  const routePickArchiveMatch = routePath.match(/^\/ko\/picks\/archive\/?$/);
  const routePickMatch =
    (!routePickArchiveMatch ? routePath.match(/^\/ko\/picks(?:\/([^/]+))?$/) : null) ??
    routePath.match(/^\/picks(?:\/([^/]+))?$/) ??
    routePath.match(/^\/stock-autopsy-picks(?:\/([^/]+))?$/);
  const routeOwnershipMatch = routePath.match(/^\/ko\/ownership(?:\/)?$/) ?? routePath.match(/^\/ownership-trades(?:\/)?$/);
  const routeFinancialLearnMatch = routePath.match(/^\/ko\/learn\/financials\/?$/);
  const routeAnalysisCompanyId = resolveAnalysisRouteCompanyId(routeAnalysisMatch ? decodeURIComponent(routeAnalysisMatch[1]) : routeParams.get('company'));
  const routeCategoryId = routeCategoryMatch ? decodeURIComponent(routeCategoryMatch[1]) : undefined;
  const routeCategoryCompanyId = routeCategoryId ? resolveCategoryRouteCompanyId(routeParams.get('company')) ?? undefined : undefined;
  const routeReportSlug = routeReportDetailMatch?.[1] ? decodeURIComponent(routeReportDetailMatch[1]) : undefined;
  const routeIndustryReport = routeReportSlug
    ? industryReports.find((report) => report.accessType === 'public' && (report.slug === routeReportSlug || report.id === routeReportSlug))
    : undefined;
  const isReconstructionInfrastructureRoute = routeCategoryId === reconstructionInfrastructureMap.sectorId;
  const isSemiconductorClusterInfrastructureRoute = routeCategoryId === semiconductorClusterInfrastructureMap.sectorId;
  const routePickId = routePickArchiveMatch ? undefined : routePickMatch?.[1] ? decodeURIComponent(routePickMatch[1]) : undefined;
  const routeCompany = companies.find((company) => company.id === routeAnalysisCompanyId);
  const analysisCompany = routeAnalysisMatch ? routeCompany : routeCompany ?? selectedCompany;
  const analysisAnchor = analysisCompany ? anchors.find((anchor) => anchor.id === analysisCompany.anchorId) : undefined;
  const isAnalysisRoute = routePath === '/analysis' || Boolean(routeAnalysisMatch);
  const isPickArchiveRoute = Boolean(routePickArchiveMatch);
  const isPicksRoute = isPickArchiveRoute || Boolean(routePickMatch);
  const isMarketMapRoute = Boolean(routeMarketMapMatch);
  const isDisclosuresRoute = Boolean(routeDisclosuresMatch);
  const isReportsRoute = Boolean(routeReportsMatch) || Boolean(routeReportDetailMatch);
  const isOwnershipRoute = Boolean(routeOwnershipMatch);
  const isFinancialLearnRoute = Boolean(routeFinancialLearnMatch);
  const isCategoryRoute = Boolean(routeCategoryMatch) || routePath === '/dashboard' || routePath === '/app';
  const newsCompany = isAnalysisRoute && analysisCompany ? analysisCompany : selectedCompany;
  const newsSector = isAnalysisRoute && analysisCompany ? sectors.find((sector) => sector.id === analysisCompany.sectorId) ?? selectedSector : selectedSector;
  const newsAnchor = isAnalysisRoute && analysisCompany ? analysisCompany.anchorId : selectedAnchor.id;
  const newsCountry = isAnalysisRoute && analysisCompany ? analysisCompany.country : selectedCountry;

  useEffect(() => {
    const syncRoute = () => setRoute(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    if ((!isAnalysisRoute && !isReportsRoute) || !routeHash) return;
    const timer = window.setTimeout(() => {
      document.getElementById(routeHash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [analysisCompany?.id, isAnalysisRoute, isReportsRoute, routeHash]);

  useEffect(() => {
    let cancelled = false;
    fetchMarketPrices().then((items) => {
      if (!cancelled) setMarketPrices(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDisclosures() {
      const [disclosureResponse, secFilingResponse] = await Promise.all([
        fetchMarketDisclosures({ limit: 100, days: 7 }),
        fetchMarketSecFilings({ limit: 100, days: 30 }),
      ]);
      if (!cancelled) {
        setMarketDisclosures(disclosureResponse);
        setMarketSecFilings(secFilingResponse);
      }
    }

    loadDisclosures();
    const timer = window.setInterval(loadDisclosures, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!routeCategoryId) return;
    const routeSector = sectors.find((sector) => sector.id === routeCategoryId);
    const routeFocusCompany = routeCategoryCompanyId ? companies.find((company) => company.id === routeCategoryCompanyId) : undefined;
    if (!routeSector && !routeFocusCompany) return;
    const nextSectorId = routeFocusCompany?.sectorId ?? routeSector?.id ?? selectedSectorId;
    if (
      nextSectorId === selectedSectorId &&
      (!routeFocusCompany || routeFocusCompany.id === selectedCompanyId)
    ) {
      return;
    }
    selectSectorScope(nextSectorId, routeFocusCompany?.id);
  }, [routeCategoryCompanyId, routeCategoryId, selectedCompanyId, selectedSectorId]);

  function fitVisibleMap() {
    if (!flowInstance) return;
    if (isAiRelationshipMap && selectedCompany) {
      centerCompanyInMap(selectedCompany.id);
      return;
    }
    window.requestAnimationFrame(() => {
      flowInstance.fitView({
        padding: isAiRelationshipMap ? 0.14 : 0.22,
        duration: 420,
        includeHiddenNodes: false,
      });
      if (isAiRelationshipMap && selectedCompany) {
        window.setTimeout(() => {
          if (flowInstance.getZoom() < 0.5) centerCompanyInMap(selectedCompany.id);
        }, 460);
      }
    });
  }

  function scheduleFitVisibleMap(delay = 120) {
    window.setTimeout(() => fitVisibleMap(), delay);
    window.setTimeout(() => fitVisibleMap(), delay + 220);
  }

  function fitEntireRelationshipMap() {
    if (!flowInstance) return;
    flowInstance.fitView({
      padding: isAiRelationshipMap ? 0.28 : 0.24,
      duration: 420,
      includeHiddenNodes: false,
    });
  }

  function scheduleCenterCompany(companyId: string, delay = 160) {
    window.setTimeout(() => centerCompanyInMap(companyId), delay);
    window.setTimeout(() => centerCompanyInMap(companyId), delay + 380);
  }

  function centerCompanyInMap(companyId: string) {
    if (!flowInstance) return;
    const company = groupCompanies.find((item) => item.id === companyId);
    if (!company) return;
    const position = getNodePosition(company);
    window.requestAnimationFrame(() => {
      flowInstance.setCenter(position.x + 112, position.y + 58, {
        zoom: isAiRelationshipMap ? (isAdvancedRelationshipView ? 0.72 : 0.9) : Math.max(flowInstance.getZoom(), 0.58),
        duration: 420,
      });
    });
  }

  function focusCompany(companyId: string) {
    setSelectedCompanyId(companyId);
    if (isAiRelationshipMap) {
      setExpandedCompanyIds((current) => new Set([...current, companyId]));
      const nextCompany = groupCompanies.find((company) => company.id === companyId);
      if (nextCompany) setSelectedFlowStage(aiFlowStages.find((stage) => matchesAiFlowStage(stage.stage, nextCompany))?.stage ?? null);
    }
    centerCompanyInMap(companyId);
  }

  function openFlowCompanyAnalysis(company: Company) {
    focusCompany(company.id);
    if (canOpenCompanyAnalysis(company)) openAnalysis(company);
  }

  function selectFlowStage(stageName: string) {
    const nextStage = selectedFlowStage === stageName ? null : stageName;
    setSelectedFlowStage(nextStage);
    if (!nextStage) return;
    const focusCandidate =
      aiFlowStages
        .find((stage) => stage.stage === stageName)
        ?.companyIds.map((id) => groupCompanies.find((company) => company.id === id))
        .find((company): company is Company => Boolean(company)) ??
      visibleCompanies.find((company) => matchesAiFlowStage(stageName, company));
    if (focusCandidate) setSelectedCompanyId(focusCandidate.id);
  }

  function toggleCompanyExpansion(companyId: string) {
    setExpandedCompanyIds((current) => {
      const next = new Set(current);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return next;
    });
    scheduleFitVisibleMap(80);
  }

  function applyFlowViewMode(mode: FlowViewMode) {
    setFlowViewMode(mode);
    if (mode !== 'kr') setShowAllKoreaRelated(false);
    setRoleFilter('all');
    setStageFilter('all');
    setListingFilter('all');
    setRelationshipFilter('all');
    setConfidenceFilter('all');

    if (mode === 'core') {
      setMapViewMode('core');
      setShowReferenceNodes(false);
      setShowNeedsVerification(false);
      setShowDetailedLinks(false);
    } else if (mode === 'reference') {
      setMapViewMode('all');
      setShowReferenceNodes(true);
      setShowNeedsVerification(false);
      setShowDetailedLinks(false);
    } else if (mode === 'sources') {
      setMapViewMode('all');
      setShowReferenceNodes(false);
      setShowNeedsVerification(true);
      setShowDetailedLinks(true);
    } else {
      setMapViewMode('all');
      setShowReferenceNodes(false);
      setShowNeedsVerification(false);
      setShowDetailedLinks(false);
    }

    const nextFocus = groupCompanies.find((company) => {
      if (mode === 'all') return company.id === selectedCompanyId;
      if (mode === 'kr') return company.country === 'KR' && isMainListedCompany(company);
      if (mode === 'us') return company.country === 'US' && isMainListedCompany(company);
      if (mode === 'reference') return !isMainListedCompany(company);
      return aiCoreCompanyIds.has(company.id);
    });
    if (nextFocus) setSelectedCompanyId(nextFocus.id);
    if (mode === 'all' || mode === 'sources' || mode === 'reference') {
      scheduleCenterCompany(nextFocus?.id ?? selectedCompanyId, 220);
    } else {
      scheduleFitVisibleMap(80);
    }
  }

  const flowNodes: Node<NodeData>[] = useMemo(
    () =>
      (isAiRelationshipMap ? visibleCompanies : groupCompanies).map((company) => {
        const isVisible = visibleIds.has(company.id);
        return {
          id: company.id,
          type: 'supplyNode',
          position: getNodePosition(company),
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: {
            company,
            isSelected: selectedCompany?.id === company.id,
            isDimmed: !isVisible || (selectedCompany ? !connectedIds.has(company.id) : false),
            isExpanded: expandedCompanyIds.has(company.id),
            marketLabel: marketDisplayLabel(company),
            price: hasTradableTicker(company) ? getPriceForCompany(company, marketPrices) : null,
            onSelect: focusCompany,
            onToggleExpand: isAiRelationshipMap ? toggleCompanyExpansion : undefined,
          },
        };
      }),
    [connectedIds, expandedCompanyIds, groupCompanies, isAiRelationshipMap, marketPrices, selectedCompany, visibleCompanies, visibleIds],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      (isAiRelationshipMap ? visibleLinks : groupLinks).map((link) => {
        const isVisible = visibleLinks.some((visibleLink) => visibleLink.id === link.id);
        const isConnected = selectedCompany ? link.source === selectedCompany.id || link.target === selectedCompany.id : false;
        const isActiveRelationship = activeRelationshipId === link.id;
        const relationship = linkRelationshipSummary(link);
        const confidenceClass = confidenceClassName(relationship.confidence);
        const edgeColor = relationshipEdgeColor(relationship.type);
        return {
          id: link.id,
          source: link.source,
          target: link.target,
          label:
            isAdvancedRelationshipView && !isActiveRelationship
              ? ''
              : showDetailedLinks || flowViewMode === 'sources'
                ? relationship.type
                : shortRelationshipLabel(relationship.type),
          animated: isConnected || isActiveRelationship,
          type: isAiRelationshipMap ? 'default' : 'smoothstep',
          className: [
            isVisible ? '' : 'edge-hidden',
            isConnected || isActiveRelationship ? 'edge-active' : '',
            selectedCompany && !isConnected && !isActiveRelationship ? 'edge-muted' : '',
            `edge-confidence-${confidenceClass}`,
            `edge-kind-${relationshipKindClass(relationship.type)}`,
          ].join(' '),
          style: {
            strokeWidth: isConnected || isActiveRelationship ? 3.2 : 2,
            stroke: isConnected ? edgeColor : edgeColor,
          },
          markerEnd: isAiRelationshipMap
            ? {
                type: MarkerType.ArrowClosed,
                width: 14,
                height: 14,
                color: isConnected || isActiveRelationship ? edgeColor : '#b9c4d4',
              }
            : undefined,
          labelStyle: {
            fill: isConnected || isActiveRelationship ? edgeColor : '#475569',
            fontWeight: isConnected || isActiveRelationship ? 800 : 700,
            fontSize: showDetailedLinks || flowViewMode === 'sources' ? 12 : 11,
          },
          labelBgStyle: {
            fill: '#f8fafc',
            fillOpacity: 1,
            stroke: isConnected ? edgeColor : '#d8dee8',
            strokeWidth: 1,
          },
          labelBgPadding: [11, 7],
          labelBgBorderRadius: 8,
        };
      }),
    [activeRelationshipId, flowViewMode, groupLinks, isAdvancedRelationshipView, isAiRelationshipMap, selectedCompany, showDetailedLinks, visibleLinks],
  );

  useEffect(() => {
    if (!flowInstance || !isCategoryRoute || !flowNodes.length) return;
    const timer = window.setTimeout(() => {
      if (isAiRelationshipMap && shouldShowRelationshipCanvas && selectedCompany) {
        centerCompanyInMap(selectedCompany.id);
        return;
      }
      flowInstance.fitView({
        padding: isAiRelationshipMap ? 0.2 : 0.22,
        duration: 420,
        includeHiddenNodes: false,
      });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [
    confidenceFilter,
    flowEdges.length,
    flowViewMode,
    flowInstance,
    flowNodes.length,
    isAiRelationshipMap,
    isCategoryRoute,
    isDetailCollapsed,
    selectedCompany?.id,
    shouldShowRelationshipCanvas,
    listingFilter,
    mapViewMode,
    query,
    relationshipFilter,
    roleFilter,
    selectedAnchorId,
    showDetailedLinks,
    showNeedsVerification,
    showReferenceNodes,
    stageFilter,
  ]);

  useEffect(() => {
    if (!flowInstance || !isCategoryRoute) return;
    const element = graphWrapRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    let resizeTimer: number | undefined;

    const fitAfterResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (isAiRelationshipMap && shouldShowRelationshipCanvas && selectedCompany) {
          centerCompanyInMap(selectedCompany.id);
          return;
        }
        flowInstance.fitView({
          padding: isAiRelationshipMap ? 0.2 : 0.22,
          duration: 320,
          includeHiddenNodes: false,
        });
      }, 120);
    };

    const observer = new ResizeObserver(fitAfterResize);
    observer.observe(element);
    return () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [flowInstance, isAiRelationshipMap, isCategoryRoute, selectedCompany?.id, shouldShowRelationshipCanvas]);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setNewsState((current) => ({ ...current, status: 'loading', error: undefined }));
      const params = new URLSearchParams({
        country: newsCountry,
        sector: newsSector.id,
        anchor: newsAnchor,
      });
      if (newsCompany?.name) {
        params.set('company', newsCompany.name);
      }

      try {
        const response = await fetch(`/api/news?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`news api ${response.status}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('news api returned non-JSON. Run `npm run dev:vercel` or deploy to Vercel.');
        }
        const payload = await response.json();
        if (cancelled) return;
        const items = Array.isArray(payload.articles) ? payload.articles : [];
        setNewsState({
          status: items.length ? 'success' : 'empty',
          items,
          updatedAt: payload.updatedAt,
        });
      } catch (error) {
        if (cancelled) return;
        setNewsState({
          status: 'error',
          items: [],
          updatedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'news api error',
        });
      }
    }

    loadNews();
    const timer = window.setInterval(loadNews, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [newsAnchor, newsCompany?.name, newsCountry, newsRefreshKey, newsSector.id]);

  useEffect(() => {
    if (!shouldShowRelationshipCanvas || !isAiRelationshipMap || !selectedCompany) return;
    scheduleCenterCompany(selectedCompany.id, 240);
  }, [flowViewMode, isAiRelationshipMap, selectedCompany?.id, shouldShowRelationshipCanvas]);

  function openAnalysis(company: Company, anchor?: string) {
    if (!canOpenCompanyAnalysis(company)) {
      if (groupCompanies.some((item) => item.id === company.id)) focusCompany(company.id);
      else openCompanyMap(company);
      return;
    }
    window.history.pushState({}, '', analysisPath(company, anchor));
    setRoute(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    if (anchor) {
      window.setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 140);
    }
  }

  function openCompanyMap(company: Company) {
    if (groupCompanies.some((item) => item.id === company.id)) {
      focusCompany(company.id);
      return;
    }
    window.history.pushState({}, '', categoryPath(company.sectorId, company.id));
    setRoute(`${window.location.pathname}${window.location.search}`);
    selectSectorScope(company.sectorId, company.id);
  }

  function closeAnalysis(company?: Company) {
    const focusCompany = company ?? analysisCompany;
    const sectorId = focusCompany?.sectorId ?? selectedSector.id;
    window.history.pushState({}, '', categoryPath(sectorId, focusCompany?.id));
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function selectSectorScope(sectorId: string, selectedCompanyIdToFocus?: string) {
    const focusCompany = selectedCompanyIdToFocus ? companies.find((company) => company.id === selectedCompanyIdToFocus) : undefined;
    const nextSector = (focusCompany ? sectors.find((sector) => sector.id === focusCompany.sectorId) : undefined) ?? sectors.find((sector) => sector.id === sectorId) ?? sectors[0];
    const nextAnchor =
      (focusCompany ? anchors.find((anchor) => anchor.id === focusCompany.anchorId) : undefined) ??
      anchors.find((anchor) => anchor.sectorId === nextSector.id) ??
      anchors[0];
    const nextCompany = focusCompany ?? companies.find((company) => company.id === nextAnchor.id) ?? companies.find((company) => company.anchorId === nextAnchor.id && company.tier !== 'anchor') ?? companies[0];
    setSelectedCountry(nextSector.country);
    setSelectedSectorId(nextSector.id);
    setSelectedAnchorId(nextAnchor.id);
    setSelectedCompanyId(nextCompany.id);
    setQuery('');
    setRiskFilter('all');
    setStageFilter('all');
    setListingFilter('all');
    setRelationshipFilter('all');
    setConfidenceFilter('all');
    setMapViewMode('core');
    setFlowViewMode('core');
    setRoleFilter('all');
    setShowReferenceNodes(false);
    setShowNeedsVerification(false);
    setShowDetailedLinks(false);
    setExpandedCompanyIds(new Set());
    setSelectedFlowStage(null);
    setHoveredLinkId(null);
    setSelectedLinkId(null);
    setSourcePanelLinkId(null);
  }

  function openCategory(sectorId: string, selectedCompanyIdToFocus?: string) {
    if (sectorId === reconstructionInfrastructureMap.sectorId || sectorId === semiconductorClusterInfrastructureMap.sectorId) {
      window.history.pushState({}, '', categoryPath(sectorId, selectedCompanyIdToFocus));
      setRoute(`${window.location.pathname}${window.location.search}`);
      return;
    }
    const focusCompany = selectedCompanyIdToFocus ? companies.find((company) => company.id === selectedCompanyIdToFocus) : undefined;
    const nextSectorId = focusCompany?.sectorId ?? sectorId;
    selectSectorScope(nextSectorId, focusCompany?.id);
    window.history.pushState({}, '', categoryPath(nextSectorId, focusCompany?.id));
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openReconstructionCompany(companyId: string) {
    window.history.pushState({}, '', categoryPath(reconstructionInfrastructureMap.sectorId, companyId));
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openSemiconductorClusterCompany(companyId: string) {
    window.history.pushState({}, '', categoryPath(semiconductorClusterInfrastructureMap.sectorId, companyId));
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openMarketMapLibrary() {
    window.history.pushState({}, '', marketMapPath());
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openDisclosures() {
    window.history.pushState({}, '', disclosuresPath());
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openReports(reportId?: string) {
    window.history.pushState({}, '', reportsPath(reportId));
    setRoute(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  }

  function openHome() {
    window.history.pushState({}, '', '/ko/');
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openPicks() {
    window.history.pushState({}, '', picksPath());
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openPicksArchive() {
    window.history.pushState({}, '', picksArchivePath());
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openPick(pick: StockAutopsyPick) {
    window.history.pushState({}, '', picksPath(pick));
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openOwnershipReports() {
    window.history.pushState({}, '', '/ko/ownership');
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function changeCountry(countryId: CountryId) {
    const nextSector = sectors.find((sector) => sector.country === countryId) ?? sectors[0];
    const nextAnchor = anchors.find((anchor) => anchor.sectorId === nextSector.id) ?? anchors[0];
    setSelectedCountry(countryId);
    setSelectedSectorId(nextSector.id);
    setSelectedAnchorId(nextAnchor.id);
    setSelectedCompanyId(nextAnchor.id);
    setQuery('');
    setRiskFilter('all');
    setStageFilter('all');
    setListingFilter('all');
    setRelationshipFilter('all');
    setConfidenceFilter('all');
    setMapViewMode('core');
    setFlowViewMode('core');
    setRoleFilter('all');
    setShowReferenceNodes(false);
    setShowNeedsVerification(false);
    setShowDetailedLinks(false);
    setExpandedCompanyIds(new Set());
    setSelectedFlowStage(null);
    setHoveredLinkId(null);
    setSelectedLinkId(null);
    setSourcePanelLinkId(null);
    if (isCategoryRoute) {
      window.history.pushState({}, '', categoryPath(nextSector.id));
      setRoute(`${window.location.pathname}${window.location.search}`);
    }
  }

  function changeSector(sectorId: string) {
    const nextAnchor = anchors.find((anchor) => anchor.sectorId === sectorId);
    selectSectorScope(sectorId, nextAnchor?.id);
    if (isCategoryRoute) {
      window.history.pushState({}, '', categoryPath(sectorId));
      setRoute(`${window.location.pathname}${window.location.search}`);
    }
  }

  function changeAnchor(anchorId: string) {
    setSelectedAnchorId(anchorId);
    setSelectedCompanyId(anchorId);
    setQuery('');
    setRiskFilter('all');
    setStageFilter('all');
    setListingFilter('all');
    setRelationshipFilter('all');
    setConfidenceFilter('all');
    setMapViewMode('core');
    setFlowViewMode('core');
    setRoleFilter('all');
    setShowReferenceNodes(false);
    setShowNeedsVerification(false);
    setShowDetailedLinks(false);
    setExpandedCompanyIds(new Set());
    setSelectedFlowStage(null);
    setHoveredLinkId(null);
    setSelectedLinkId(null);
    setSourcePanelLinkId(null);
  }

  if (isPicksRoute) {
    return (
      <StockAutopsyPicksPage
        selectedPickId={routePickId}
        isArchive={isPickArchiveRoute}
        onHome={openHome}
        onOpenMarketMap={openMarketMapLibrary}
        onOpenCategory={openCategory}
        onOpenAnalysis={openAnalysis}
        onOpenPick={openPick}
        onOpenPicks={openPicks}
        onOpenPicksArchive={openPicksArchive}
        onOpenReports={openReports}
        onOpenDisclosures={openDisclosures}
        marketPrices={marketPrices}
        disclosures={marketDisclosures}
        secFilings={marketSecFilings}
      />
    );
  }

  if (isDisclosuresRoute) {
    return (
      <MarketDisclosuresPage
        disclosures={marketDisclosures}
        secFilings={marketSecFilings}
        onHome={openHome}
        onOpenPicks={openPicks}
        onOpenMarketMap={openMarketMapLibrary}
        onOpenReports={openReports}
      />
    );
  }

  if (isMarketMapRoute) {
    return <MarketMapLibraryPage onHome={openHome} onOpenPicks={openPicks} onOpenDisclosures={openDisclosures} onOpenCategory={openCategory} onOpenReports={openReports} />;
  }

  if (routeReportDetailMatch) {
    return (
      <IndustryReportDetailPage
        report={routeIndustryReport}
        onHome={openHome}
        onOpenReports={openReports}
        onOpenPicks={openPicks}
        onOpenMarketMap={openMarketMapLibrary}
        onOpenDisclosures={openDisclosures}
        onOpenCategory={openCategory}
        onOpenPick={openPick}
      />
    );
  }

  if (routeReportsMatch) {
    return (
      <IndustryReportsPage
        onHome={openHome}
        onOpenMarketMap={openMarketMapLibrary}
        onOpenPicks={openPicks}
        onOpenDisclosures={openDisclosures}
        onOpenCategory={openCategory}
        onOpenReport={openReports}
        onOpenPick={openPick}
      />
    );
  }

  if (isReconstructionInfrastructureRoute) {
    return (
      <ReactFlowProvider>
        <InfrastructureStoryMapPage
          map={reconstructionInfrastructureMap}
          kicker="재건 / 인프라 시장지도"
          compactFlowLabel="compact 5단계 흐름"
          graphAriaLabel="재건 인프라 전체 관계도"
          requestedCompanyId={routeParams.get('company')}
          onHome={openHome}
          onOpenMarketMap={openMarketMapLibrary}
          onOpenPicks={openPicks}
          onOpenPick={openPick}
          onOpenReports={openReports}
          onSelectCompany={openReconstructionCompany}
          marketPrices={marketPrices}
        />
      </ReactFlowProvider>
    );
  }

  if (isSemiconductorClusterInfrastructureRoute) {
    return (
      <ReactFlowProvider>
        <InfrastructureStoryMapPage
          map={semiconductorClusterInfrastructureMap}
          kicker="반도체 클러스터 / 산업단지 인프라 시장지도"
          compactFlowLabel="compact 6단계 흐름"
          graphAriaLabel="반도체 클러스터 산업단지 인프라 전체 관계도"
          shellClassName="semiconductor-cluster-map-shell"
          requestedCompanyId={routeParams.get('company')}
          onHome={openHome}
          onOpenMarketMap={openMarketMapLibrary}
          onOpenPicks={openPicks}
          onOpenPick={openPick}
          onOpenReports={openReports}
          onSelectCompany={openSemiconductorClusterCompany}
          marketPrices={marketPrices}
        />
      </ReactFlowProvider>
    );
  }

  if (isOwnershipRoute) {
    return <OwnershipReportsPage onHome={openHome} onOpenAnalysis={openAnalysis} onOpenCategory={openCategory} />;
  }

  if (isFinancialLearnRoute) {
    return <FinancialLearningPage onHome={openHome} />;
  }

  if (isAnalysisRoute && analysisCompany && canOpenCompanyAnalysis(analysisCompany)) {
    return (
      <ReactFlowProvider>
        <AnalysisPage
          company={analysisCompany}
          anchor={analysisAnchor}
          newsState={newsState}
          onHome={openHome}
          onBack={closeAnalysis}
          onOpenAnalysis={openAnalysis}
          onRefreshNews={() => setNewsRefreshKey((current) => current + 1)}
          marketPrices={marketPrices}
        />
      </ReactFlowProvider>
    );
  }

  if (isAnalysisRoute) {
    const fallbackConnection = analysisCompany ? companyConnectionState(analysisCompany) : null;
    return (
      <div className="pick-shell story-dark-shell story-pick-shell">
        <header className="pick-nav">
          <button type="button" onClick={openHome}>홈</button>
          <button type="button" onClick={() => openCategory(analysisCompany?.sectorId ?? 'us-semiconductors', analysisCompany?.id)}>
            시장 흐름 지도
          </button>
        </header>
        <main className="pick-empty">
          <h1>{analysisCompany ? `${analysisCompany.name} 해설 준비 중` : '기업 해설을 찾을 수 없습니다.'}</h1>
          <p>
            {analysisCompany
              ? `${fallbackConnection?.label ?? '해설 준비 중'} 상태입니다. 빈 분석 화면 대신 시장 흐름 지도에서 관계만 확인할 수 있습니다.`
              : '아직 등록되지 않은 기업입니다. 시장 흐름 지도에서 연결된 기업을 다시 선택해주세요.'}
          </p>
          <button type="button" onClick={() => openCategory(analysisCompany?.sectorId ?? 'us-semiconductors', analysisCompany?.id)}>
            시장 흐름에서 보기
          </button>
        </main>
      </div>
    );
  }

  if (!isCategoryRoute) {
    return (
      <LandingPage
        onHome={openHome}
        onOpenMarketMapLibrary={openMarketMapLibrary}
        onOpenPicks={openPicks}
        onOpenDisclosures={openDisclosures}
        onOpenReports={openReports}
        onOpenCategory={openCategory}
        onOpenPick={openPick}
        marketPrices={marketPrices}
        disclosures={marketDisclosures}
        secFilings={marketSecFilings}
      />
    );
  }

  return (
    <ReactFlowProvider>
      <div className={`app-shell ${isStoryMarketMap ? 'ai-mvp-map story-dark-shell' : ''} ${shouldShowReadingTemplate ? 'ai-board-default' : ''} ${isAdvancedRelationshipView ? 'advanced-relationship-view' : ''} ${isDetailCollapsed ? 'detail-collapsed' : ''}`}>
        <aside className="left-panel">
          <div className="brand-block">
            <div className="brand-mark">
              <Network size={22} />
            </div>
            <div>
              <p className="eyebrow">주가해부실 · 초보 투자자용 흐름 학습</p>
              <h1>시장 흐름 지도</h1>
            </div>
          </div>

          <div className="country-toggle" aria-label="국가 선택">
            {countries.map((item) => (
              <button
                key={item.id}
                className={selectedCountry === item.id ? 'active' : ''}
                type="button"
                onClick={() => changeCountry(item.id)}
              >
                <Globe2 size={15} />
                {item.label}
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="sector-select">
            산업 섹터
          </label>
          <div className="select-wrap">
            <select id="sector-select" value={selectedSector.id} onChange={(event) => changeSector(event.target.value)}>
              {countrySectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <p className="context-copy">{selectedSector.description}</p>

          <div className="term-guide" aria-label="초보자용 용어 설명">
            <div><strong>밸류체인</strong><span>제품이 만들어지고 팔리기까지의 연결 구조</span></div>
            <div><strong>경제적 해자</strong><span>경쟁사가 쉽게 따라오기 어려운 이유</span></div>
            <div><strong>고객 의존도</strong><span>매출이 특정 고객에게 얼마나 기대는지</span></div>
            <div><strong>병목 기업</strong><span>없으면 산업 흐름이 막힐 수 있는 핵심 기업</span></div>
          </div>

          {isAiRelationshipMap && (
            <section className="first-look-card" aria-label="먼저 볼 기업">
              <div className="section-title">
                <Target size={16} />
                <span>먼저 볼 기업</span>
              </div>
              <div className="first-look-list">
                {firstLookCompanies.map((company, index) => {
                  const role = companyRoleProfile(company);
                  return (
                    <button key={company.id} type="button" onClick={() => focusCompany(company.id)}>
                      <span>{index + 1}</span>
                      <CompanyIdentityForCompany company={company} size="compact" />
                      <small>{role.primary} · {role.secondary}</small>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <div className="anchor-list">
            <div className="section-title">
              <Target size={16} />
              <span>섹터 중심 기업 3개</span>
            </div>
            {topAnchors.map((anchor) => (
              <button
                key={anchor.id}
                className={`anchor-row ${selectedAnchor.id === anchor.id ? 'selected' : ''}`}
                type="button"
                onClick={() => changeAnchor(anchor.id)}
              >
                <span className="rank-badge">#{anchor.rank}</span>
                <span>
                  <CompanyIdentity
                    companyName={anchor.name}
                    ticker={anchor.ticker}
                    countryLabel={countryLabelFromMarket(anchor.country) || countryLabelFromMarket(anchor.exchange)}
                    size="compact"
                  />
                </span>
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="company-search">
            기업 관계 검색
          </label>
          <div className="search-box">
            <Search size={17} />
            <input
              id="company-search"
              type="search"
              placeholder="기업, 제품, 밸류체인, 해자"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="role-filter-card" aria-label="기본 역할 필터">
            <span>기본 필터</span>
            <div>
              {roleFilterOptions.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={roleFilter === filter.value ? 'active' : ''}
                  onClick={() => setRoleFilter(filter.value)}
                >
                  <strong>{filter.label}</strong>
                  <small>{filter.note}</small>
                </button>
              ))}
            </div>
          </div>

          <details className="advanced-filter-card">
            <summary>고급 필터 열기</summary>
            <div className="filter-row" aria-label="리스크 필터">
              <button className={riskFilter === 'all' ? 'active' : ''} onClick={() => setRiskFilter('all')} type="button">
                전체
              </button>
              <button className={riskFilter === 'high' ? 'active danger' : ''} onClick={() => setRiskFilter('high')} type="button">
                고위험
              </button>
              <button className={riskFilter === 'medium' ? 'active warn' : ''} onClick={() => setRiskFilter('medium')} type="button">
                중간
              </button>
              <button className={riskFilter === 'low' ? 'active stable' : ''} onClick={() => setRiskFilter('low')} type="button">
                낮음
              </button>
            </div>

            <div className="stage-filter" aria-label="밸류체인 단계 필터">
              <span>밸류체인 단계</span>
              <div>
                <button type="button" className={stageFilter === 'all' ? 'active' : ''} onClick={() => setStageFilter('all')}>
                  전체
                </button>
                {stageOptions.map((stage) => (
                  <button key={stage} type="button" className={stageFilter === stage ? 'active' : ''} onClick={() => setStageFilter(stage)}>
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div className="stage-filter" aria-label="상장 여부 필터">
              <span>분석 대상 구분</span>
              <div>
                {[
                  { value: 'all', label: '전체' },
                  { value: 'listed', label: '상장기업' },
                  { value: 'reference', label: '비상장/참고' },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    className={listingFilter === filter.value ? 'active' : ''}
                    onClick={() => setListingFilter(filter.value as ListingFilter)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="stage-filter" aria-label="관계 유형 필터">
              <span>관계 유형</span>
              <div>
                <button type="button" className={relationshipFilter === 'all' ? 'active' : ''} onClick={() => setRelationshipFilter('all')}>
                  전체
                </button>
                {relationshipOptions.map((type) => (
                  <button key={type} type="button" className={relationshipFilter === type ? 'active' : ''} onClick={() => setRelationshipFilter(type)}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="stage-filter" aria-label="관계 확실성 필터">
              <span>관계 확실성</span>
              <div>
                <button type="button" className={confidenceFilter === 'all' ? 'active' : ''} onClick={() => setConfidenceFilter('all')}>
                  전체
                </button>
                {confidenceOptions.map((confidence) => (
                  <button
                    key={confidence}
                    type="button"
                    className={confidenceFilter === confidence ? 'active' : ''}
                    onClick={() => setConfidenceFilter(confidence)}
                  >
                    {confidence}
                  </button>
                ))}
              </div>
            </div>
          </details>

          <div className="metric-grid">
            <div className="metric">
              <span>중심 기업</span>
              <strong>3</strong>
            </div>
            <div className="metric">
              <span>보조 기업</span>
              <strong>{groupCompanies.filter((company) => company.tier === 'tier2').length}</strong>
            </div>
            <div className="metric">
              <span>고위험</span>
              <strong>{highRiskCount}</strong>
            </div>
            <div className="metric">
              <span>필터 제외</span>
              <strong>{filteredOutCount}</strong>
            </div>
          </div>

          <div className="company-list">
            <div className="section-title">
              <Filter size={16} />
              <span>선택 기업 관계</span>
            </div>
            {visibleCompanies.map((company) => {
              const role = companyRoleProfile(company);
              const connection = companyConnectionState(company);
              return (
                <div className={`company-row-card connection-${connection.level} ${selectedCompany?.id === company.id ? 'selected' : ''}`} key={company.id}>
                  <button
                    className="company-row"
                    onClick={() => focusCompany(company.id)}
                    type="button"
                  >
                    <span className={`role-badge role-${role.className}`}>{role.primary}</span>
                    <span className="company-row-main">
                      <CompanyIdentityForCompany company={company} size="compact" />
                      <small>{role.secondary} · {productText(company)}</small>
                      <em>{companyScopeLabel(company)}</em>
                    </span>
                    <span className={`risk-dot ${riskClass[company.riskLevel]}`} />
                  </button>
                  {connection.canOpenAnalysis ? (
                    <button className="company-row-action" type="button" onClick={() => openAnalysis(company)}>
                      {connection.canOpenFinancials ? '재무·공시 보기' : '기업 해설 보기'}
                    </button>
                  ) : (
                    <span className="company-row-disabled">{connection.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="map-panel">
          <header className="topbar">
            <div className="topbar-copy">
              <nav className="breadcrumb" aria-label="현재 위치">
                <button type="button" onClick={openHome}>홈</button>
                <span>주가해부실</span>
                <span>기업 관계</span>
                <span>{selectedSector.label}</span>
                <strong>{isStoryMarketMap && selectedCompany ? selectedCompany.name : selectedAnchor.name}</strong>
              </nav>
              <p className="eyebrow">
                {country.label} · {selectedSector.label}
              </p>
              <h2>
                {isAdvancedRelationshipView
                  ? '전체 연결 보기'
                  : isAiRelationshipMap
                    ? 'AI를 많이 쓰면 어떤 회사들이 같이 움직일까?'
                    : isDatacenterPowerCoolingMap
                      ? 'AI 서버가 늘면 전기와 열 관리도 같이 커집니다'
                    : `${selectedAnchor.name} 기업 관계 지도`}
              </h2>
              <p className="topbar-subcopy">
                {isAdvancedRelationshipView
                  ? '흐름을 다 본 뒤, 회사들이 어떻게 이어지는지 한 번에 확인합니다.'
                  : isAiRelationshipMap
                  ? '어려운 용어보다 흐름부터 봅니다.'
                  : isDatacenterPowerCoolingMap
                  ? 'GPU와 HBM은 AI 인프라의 앞부분입니다. 실제 데이터센터는 전기를 안정적으로 공급하고, 서버에서 나는 열을 식혀야 계속 돌아갑니다.'
                  : selectedSector.description}
              </p>
              {isDatacenterPowerCoolingMap && (
                <p className="topbar-support-copy">
                  그래서 전력 장비, UPS, 배전, 냉각/HVAC 기업을 함께 봅니다.
                </p>
              )}
              {selectedCompany && (
                <div className="selected-company-context">
                  <span>선택한 기업</span>
                  <CompanyIdentityForCompany company={selectedCompany} size="compact" />
                  <em>{selectedCompanyStatusLabel}</em>
                </div>
              )}
            </div>
            <div className="topbar-actions">
              <button type="button" className="icon-action text-action" onClick={openHome}>
                <Network size={18} />
                홈
              </button>
              <button
                type="button"
                className={`icon-action text-action lock-action ${isMapLocked ? 'active' : ''}`}
                onClick={() => setIsMapLocked((current) => !current)}
                aria-pressed={isMapLocked}
              >
                {isMapLocked ? <Lock size={18} /> : <Unlock size={18} />}
                {isMapLocked ? '지도 잠금' : '지도 이동'}
              </button>
              <button
                type="button"
                className="icon-action text-action"
                disabled={!selectedCanOpenFinancials}
                onClick={() => selectedCompany && selectedCanOpenFinancials && openAnalysis(selectedCompany, 'financial-easy-view')}
              >
                <Database size={18} />
                {selectedCanOpenFinancials ? '숫자 3개 보기' : selectedCanOpenAnalysis ? '재무 준비 중' : '관계 참고용'}
              </button>
              <button type="button" className="icon-action text-action detail-action" onClick={() => setIsDetailCollapsed((current) => !current)}>
                <PanelRightOpen size={18} />
                {isDetailCollapsed ? '상세 열기' : '상세 접기'}
              </button>
              {selectedReportLink && selectedCanOpenAnalysis && (
                <ReportAction
                  reportLink={selectedReportLink}
                  className="topbar-report-action"
                  iconSize={15}
                  label={
                    selectedReportLink.status === 'direct'
                      ? '원문 보고서'
                      : selectedReportLink.status === 'search-only'
                        ? '검색으로 확인'
                        : selectedReportLink.status === 'private-company'
                          ? '비상장/공시 없음'
                          : selectedReportLink.status === 'no-public-filing'
                            ? '공개 보고서 없음'
                            : selectedReportLink.status === 'listing-unknown'
                              ? '상장 정보 확인'
                              : '원문 연결 필요'
                  }
                />
              )}
              {selectedCompany && !selectedCanOpenAnalysis && <span className="topbar-reference-note">{selectedConnectionState?.label ?? '시장 흐름 참고'}</span>}
            </div>
          </header>

          {shouldShowReadingTemplate && selectedCompany && (
            <section className="market-detail-focus-grid" aria-label="선택 기업 중심 시장 흐름">
              <article className="market-detail-selected-card">
                <div className="market-detail-selected-head">
                  <CompanyLogo company={selectedCompany} size="large" />
                  <div>
                    <span>선택한 기업</span>
                    <CompanyIdentityForCompany company={selectedCompany} size="hero" />
                    <small>{selectedRole?.primary ?? companyValueChainStage(selectedCompany)}</small>
                  </div>
                </div>
                <div className="connection-badge-row">
                  <span className={`connection-status-badge ${selectedConnectionState?.level ?? 'reference'}`}>{selectedCompanyStatusLabel}</span>
                  {activeFlowStageCard && <span className="connection-status-badge reference">{activeFlowStageCard.term}</span>}
                </div>
                <p>{companyQuestionProductCopy(selectedCompany)}</p>
                <strong>{companyQuestionDemandCopy(selectedCompany)}</strong>
                <div className="market-detail-related-inline" aria-label="같이 볼 회사 요약">
                  <span>같이 볼 회사</span>
                  <div>
                    {selectedMarketRelatedCards.length ? (
                      selectedMarketRelatedCards.slice(0, 4).map((item) => <b key={item.company.id}>{item.company.name}</b>)
                    ) : (
                      <b>직접 연결 기업 정리 중</b>
                    )}
                  </div>
                </div>
                <div className="market-detail-selected-actions">
                  {selectedCanOpenAnalysis ? (
                    <>
                      <button type="button" onClick={() => openAnalysis(selectedCompany)}>
                        기업 해설 보기
                      </button>
                      {selectedCanOpenFinancials ? (
                        <button type="button" onClick={() => openAnalysis(selectedCompany, 'financial-easy-view')}>
                          숫자 3개 보기
                        </button>
                      ) : (
                        <span>재무 연결 준비 중</span>
                      )}
                      {isDatacenterPowerCoolingMap && (
                        <button type="button" onClick={() => applyFlowViewMode('all')}>
                          시장 흐름 보기
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <span>{selectedConnectionState?.detail ?? '시장 흐름 참고 기업입니다.'}</span>
                      {selectedRelatedPick && (
                        <button type="button" onClick={() => openPick(selectedRelatedPick)}>
                          관련 Pick 보기
                        </button>
                      )}
                    </>
                  )}
                </div>
              </article>

              <section className="market-detail-related-card" aria-label="같이 볼 회사">
                <div className="market-detail-section-head">
                  <span>같이 볼 회사</span>
                  <strong>{selectedCompany.name}과 {isDatacenterPowerCoolingMap ? '시장 흐름상 같이 보는 기업' : '바로 이어지는 기업'}</strong>
                  <p>
                    {isDatacenterPowerCoolingMap
                      ? '아래 관계는 직접 계약 관계가 아니라, AI 데이터센터 투자 흐름에서 함께 확인하는 기업들입니다.'
                      : '관계는 시장 흐름 이해용입니다. 직접 거래 여부는 공시·IR로 따로 확인합니다.'}
                  </p>
                </div>
                <div className="market-detail-related-list">
                  {selectedMarketRelatedCards.length ? (
                    selectedMarketRelatedCards.map((item) => {
                      const connection = item.connection;
                      return (
                        <article key={item.key} className={`connection-${connection.level}`}>
                          <div>
                            <CompanyIdentityForCompany company={item.company} size="compact" />
                            <span>{item.label}</span>
                          </div>
                          <p>{item.description}</p>
                          <span className={`connection-mini-badge ${connection.level}`}>{connection.label}</span>
                          {connection.canOpenAnalysis ? (
                            <button type="button" onClick={() => openAnalysis(item.company)}>
                              기업 해설 보기
                            </button>
                          ) : item.company.id === 'datacenter-power-lg-electronics' && relatedPickForMarketMapCompany(item.company) ? (
                            <button type="button" onClick={() => openPick(relatedPickForMarketMapCompany(item.company)!)}>
                              관련 Pick 보기
                            </button>
                          ) : (
                            <em>{connection.label}</em>
                          )}
                        </article>
                      );
                    })
                  ) : (
                    <p className="market-detail-empty">직접 연결 기업은 아직 정리 중입니다.</p>
                  )}
                </div>
              </section>
            </section>
          )}

          {isAiRelationshipMap && (
            <section className="sector-flow-card" aria-label="AI 반도체와 데이터센터 핵심 흐름">
              <div className="sector-flow-copy">
                <span>주가해부실 · 시장 흐름 지도</span>
                <strong>{shouldShowRelationshipCanvas ? '전체 연결 보기' : 'compact 5단계 흐름'}</strong>
                <p>
                  {shouldShowRelationshipCanvas
                    ? '흐름을 다 본 뒤, 회사들이 어떻게 이어지는지 한 번에 확인합니다.'
                    : 'AI 수요 → GPU/AI 칩 → HBM → 파운드리 → 전력/냉각 순서로 봅니다.'}
                </p>
              </div>
              {shouldShowRelationshipCanvas && (
                <div className="relationship-view-intro" aria-label="전체 연결 보기 안내">
                  <div className="relationship-view-copy">
                    <span>고급 참고</span>
                    <p>처음에는 5장 흐름만 봐도 충분합니다. 관계선은 필요할 때 눌러 근거를 확인하세요.</p>
                  </div>
                  {selectedCompany && (
                    <div className="relationship-selected-company-card" aria-label="전체 연결 보기 선택 기업">
                      <span>선택 기업</span>
                      <CompanyIdentityForCompany company={selectedCompany} size="compact" />
                      <small>{selectedRole?.primary ?? companyValueChainStage(selectedCompany)}</small>
                      {selectedConnectionState && (
                        <div className="connection-badge-row">
                          {selectedConnectionState.badges.map((badge) => (
                            <span key={badge} className={`connection-status-badge ${selectedConnectionState.level}`}>{badge}</span>
                          ))}
                        </div>
                      )}
                      {selectedCanOpenAnalysis ? (
                        <button type="button" onClick={() => openAnalysis(selectedCompany)}>
                          기업 해설 보기
                        </button>
                      ) : (
                        <em>{selectedConnectionState?.detail ?? '시장 흐름 참고 기업입니다.'}</em>
                      )}
                    </div>
                  )}
                  <div className="relationship-legend" aria-label="관계도 범례">
                    <span>선택 기업</span>
                    <span>직접 연결</span>
                    <span>보조 연결</span>
                  </div>
                  <div className="relationship-view-actions">
                    <button type="button" onClick={() => applyFlowViewMode('core')}>5장 흐름으로 돌아가기</button>
                    <button type="button" onClick={() => selectedCompany && centerCompanyInMap(selectedCompany.id)}>선택 기업 중심</button>
                  </div>
                </div>
              )}
              <div className="map-mode-strip" aria-label="지도 표시 모드">
                <div>
                  {flowModeOptions
                    .filter((option) => option.tone !== 'secondary')
                    .map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={flowViewMode === option.value ? 'active' : ''}
                        onClick={() => applyFlowViewMode(option.value)}
                        title={option.note}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
                <div className="map-mode-secondary">
                  {flowModeOptions
                    .filter((option) => option.tone === 'secondary')
                    .map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={flowViewMode === option.value ? 'active' : ''}
                        onClick={() => applyFlowViewMode(option.value)}
                        title={option.note}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              </div>
              <div className="flow-help-pills" aria-label="지도 사용 팁">
                <span>5장만 순서대로</span>
                <span>대표 기업은 2~3개만</span>
                <span>전체 관계는 필요할 때만</span>
              </div>
              <nav className="flow-stage-nav" aria-label="AI 반도체와 데이터센터 5단계">
                {flowStageCards.map((stage, index) => (
                  <article
                    key={stage.stage}
                    className={`flow-stage-card ${activeFlowStageName === stage.stage ? 'active' : ''} flow-stage-tone-${index + 1}`}
                    aria-current={activeFlowStageName === stage.stage ? 'step' : undefined}
                  >
                    <button
                      type="button"
                      className="flow-stage-select"
                      onClick={() => selectFlowStage(stage.stage)}
                      aria-label={`${stage.easyTitle} 단계 보기`}
                    >
                      <span>{stage.symbol}</span>
                      <strong>{stage.term}</strong>
                      <small>{stage.summary}</small>
                      <em>{stage.easyTitle}</em>
                    </button>
                    <span className="flow-stage-company-row" aria-label={`${stage.easyTitle} 대표 기업`}>
                      <b>대표 기업</b>
                      <span className="flow-stage-company-chip-row">
                        {stage.companies.slice(0, 2).map((company) =>
                          canOpenCompanyAnalysis(company) ? (
                            <button
                              key={company.id}
                              type="button"
                              className="flow-stage-company-chip"
                              onClick={() => openFlowCompanyAnalysis(company)}
                              aria-label={`${flowRepresentativeCompanyName(company)} 기업 해설 보기`}
                            >
                              {flowRepresentativeCompanyName(company)}
                            </button>
                          ) : (
                            <span key={company.id} className="flow-stage-company-chip disabled" aria-disabled="true">
                              {flowRepresentativeCompanyName(company)}
                              <small>준비 중</small>
                            </span>
                          ),
                        )}
                      </span>
                    </span>
                  </article>
                ))}
              </nav>

              {selectedCompany && (
                <section className="flow-focus-explorer" aria-label="선택 기업 중심 관계 탐색">
                  <div className="flow-connection-column previous">
                    <span>이전 단계 / 수요 연결</span>
                    {focusPreviousCards.length ? (
                      <div className="flow-connection-list">
                        {focusPreviousCards.map((item) => (
                          <button key={item.link.id} type="button" onClick={() => focusCompany(item.company.id)}>
                            <CompanyLogo company={item.company} size="small" />
                            <span>
                              <CompanyIdentityForCompany company={item.company} size="compact" />
                              <small>{shortRelationshipLabel(item.relationship.type)}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p>앞 단계 연결은 아직 정리 중입니다.</p>
                    )}
                  </div>

                  <article className="flow-focus-company-card" aria-label="현재 선택한 기업">
                    <CompanyLogo company={selectedCompany} size="large" />
                    <div>
                      <span>선택한 기업</span>
                      {activeFlowStageCard && <em className="flow-active-stage-label">{activeFlowStageCard.stage}</em>}
                      <CompanyIdentityForCompany company={selectedCompany} size="hero" />
                      <small>{selectedRole?.primary ?? companyValueChainStage(selectedCompany)}</small>
                      {selectedConnectionState && (
                        <div className="connection-badge-row">
                          {selectedConnectionState.badges.map((badge) => (
                            <span key={badge} className={`connection-status-badge ${selectedConnectionState.level}`}>{badge}</span>
                          ))}
                        </div>
                      )}
                      <dl className="flow-focus-qa" aria-label="선택 기업 핵심 질문">
                        <div>
                          <dt>이 회사는 뭐 해요?</dt>
                          <dd>{companyQuestionProductCopy(selectedCompany)}</dd>
                        </div>
                        <div>
                          <dt>왜 이 흐름에 있나요?</dt>
                          <dd>{companyQuestionDemandCopy(selectedCompany)}</dd>
                        </div>
                        <div>
                          <dt>같이 볼 회사는?</dt>
                          <dd>{selectedRelatedCompanyNames}</dd>
                        </div>
                      </dl>
                      <div className="flow-focus-actions">
                        {selectedCanOpenAnalysis ? (
                          <>
                            <button type="button" onClick={() => openAnalysis(selectedCompany)}>
                              기업 해설 보기
                            </button>
                            {selectedCanOpenFinancials ? (
                              <button type="button" onClick={() => openAnalysis(selectedCompany, 'financial-easy-view')}>
                                숫자 3개 보기
                              </button>
                            ) : (
                              <span className="flow-focus-disabled">재무 연결 준비 중</span>
                            )}
                          </>
                        ) : (
                          <span className="flow-focus-disabled">{selectedConnectionState?.label ?? '시장 흐름 참고'}</span>
                        )}
                      </div>
                    </div>
                  </article>

                  <div className="flow-connection-column next">
                    <span>다음에 같이 볼 기업</span>
                    {focusNextCards.length ? (
                      <div className="flow-connection-list">
                        {focusNextCards.map((item) => (
                          <button key={item.link.id} type="button" onClick={() => focusCompany(item.company.id)}>
                            <CompanyLogo company={item.company} size="small" />
                            <span>
                              <CompanyIdentityForCompany company={item.company} size="compact" />
                              <small>{item.relationship.demandConnection}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p>직접 연결 기업은 아직 정리 중입니다.</p>
                    )}
                    {hiddenFocusConnectionCount > 0 && (
                      <button type="button" className="focus-more-button" onClick={() => applyFlowViewMode('all')}>
                        전체 연결 보기
                      </button>
                    )}
                  </div>
                </section>
              )}

              <div className="advanced-map-entry">
                <span>전체 관계를 보고 싶다면</span>
                <strong>NVIDIA, HBM, 파운드리, 전력/냉각 기업 관계를 한 번에 펼쳐봅니다.</strong>
                <button type="button" onClick={() => applyFlowViewMode('all')}>전체 연결 보기</button>
              </div>

              <div className="advanced-map-entry datacenter-semiconductor-entry">
                <span>전력과 냉각까지 이어서 보고 싶다면</span>
                <strong>AI 서버가 늘 때 전력 관리, UPS, 냉각/HVAC 기업이 왜 같이 보이는지 확인합니다.</strong>
                <button type="button" onClick={() => openCategory(datacenterPowerCoolingSectorId)}>전력·냉각 지도 보기</button>
              </div>

              {flowViewMode === 'kr' && (
              <div className="ai-sector-support-grid">
                <section className="ai-korea-listed-card" aria-label="AI 반도체 흐름과 연결된 한국 상장기업">
                  <div className="support-card-head">
                    <span>한국 관련 상장기업</span>
                    <strong>이 흐름과 연결된 한국 기업</strong>
                    <p>상장기업만 추려서 시장, 원문 보고서 상태, 기업 해설 이동 경로를 먼저 보여줍니다.</p>
                  </div>
                  <div className="korea-listed-grid">
                    {aiKoreaListedPreview.map((company) => {
                      const reportLink = getPrimaryReportLink(company);
                      const connection = companyConnectionState(company);
                      return (
                        <article key={company.id} className={`korea-listed-item connection-${connection.level}`}>
                          <div>
                            <CompanyIdentityForCompany company={company} size="compact" />
                          </div>
                          <div className="connection-badge-row">
                            {connection.badges.map((badge) => (
                              <span key={badge} className={`connection-status-badge ${connection.level}`}>{badge}</span>
                            ))}
                          </div>
                          <p>{companyBusinessSummary(company)}</p>
                          <span>{company.relationshipSummary ?? companyCustomerSummary(company)}</span>
                          <div className="korea-listed-actions">
                            {connection.canOpenAnalysis ? (
                              <button type="button" onClick={() => openAnalysis(company)}>기업 해설 보기</button>
                            ) : (
                              <span className="company-row-disabled">{connection.label}</span>
                            )}
                            <button type="button" onClick={() => openCompanyMap(company)}>시장 흐름 보기</button>
                            {connection.canOpenAnalysis && <ReportAction reportLink={reportLink} className="mini-report-action" iconSize={13} />}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {aiKoreaListedCompanies.length > aiKoreaListedPreview.length && (
                    <button type="button" className="support-more-button" onClick={() => setShowAllKoreaRelated(true)}>
                      한국 관련주 더 보기
                    </button>
                  )}
                </section>
              </div>
              )}
            </section>
          )}

          {isDatacenterPowerCoolingMap && (
            <section className="sector-flow-card datacenter-power-flow-card" aria-label="데이터센터 냉각과 전력 인프라 핵심 흐름">
              <div className="sector-flow-copy">
                <span>주가해부실 · 시장 흐름 지도</span>
                <strong>AI 서버는 전기를 많이 쓰고 열도 많이 냅니다</strong>
                <p>전력과 냉각은 직접 계약 관계를 뜻하기보다, AI 데이터센터 투자 흐름에서 함께 확인하는 인프라 축입니다.</p>
              </div>
              <div className="datacenter-power-steps" aria-label="데이터센터 전력 냉각 5단계">
                {datacenterPowerCoolingFlowSteps.map((step, index) => (
                  <button
                    key={step.companyId}
                    type="button"
                    className={`datacenter-power-step ${selectedCompany?.id === step.companyId ? 'active' : ''}`}
                    onClick={() => focusCompany(step.companyId)}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>{step.label}</strong>
                    <small>{step.detail}</small>
                    <em>대표 기업 예: {step.representativeCompanies.join(', ')}</em>
                  </button>
                ))}
              </div>
              <div className="flow-help-pills" aria-label="데이터센터 전력 냉각 지도 사용 팁">
                <span>칩 다음 전력</span>
                <span>전력 다음 냉각</span>
                <span>마지막은 수주와 숫자 확인</span>
              </div>
              <div className="advanced-map-entry datacenter-power-entry">
                <span>전체 관계를 보고 싶다면</span>
                <strong>Vertiv, Eaton, Schneider Electric, LG전자를 전력·냉각 흐름 안에서 함께 봅니다.</strong>
                <button type="button" onClick={() => applyFlowViewMode('all')}>전체 연결 보기</button>
              </div>
              <div className="advanced-map-entry datacenter-semiconductor-entry">
                <span>칩 쪽 흐름도 같이 보고 싶다면</span>
                <strong>GPU, HBM, 파운드리 흐름은 AI 반도체 / 데이터센터 지도에서 확인할 수 있습니다.</strong>
                <button type="button" onClick={() => openCategory(aiRelationshipSectorId)}>AI 반도체 지도 보기</button>
              </div>
            </section>
          )}

          {isStoryMarketMap && (
            <>
              <RelatedIndustryReports
                title="산업 보고서로 더 넓게 보기"
                description="이 시장 흐름을 이해하는 데 도움이 되는 공개 보고서입니다. 숫자는 공시로, 산업 구조는 보고서로 함께 확인합니다."
                reports={reportsForMap(selectedSector.id)}
                onOpenReports={openReports}
              />
              <EvidenceDetails
                description="산업 구조는 공개 보고서로, 기업 활동과 숫자는 공시·IR로 따로 확인합니다."
                groups={evidenceGroupsForMap(selectedSector.id)}
                onOpenReports={openReports}
              />
            </>
          )}

          {shouldShowRelationshipCanvas && (
          <>
          {isAiRelationshipMap && (
            <div className="advanced-map-note">
              전체 연결은 고급 참고입니다. 선을 누르면 관계 요약과 출처를 확인할 수 있습니다.
            </div>
          )}
          <section ref={graphWrapRef} className={`graph-wrap ${isMapLocked ? 'locked' : ''}`} aria-label="기업 관계 지도">
            {isAiRelationshipMap && (
              <div className="map-stage-ribbon" aria-hidden="true">
                {aiStageColumns.map((stage) => (
                  <span key={stage}>{stage}</span>
                ))}
              </div>
            )}
            <div className="canvas-toolbar" aria-label="지도 보기 조정">
              <button type="button" onClick={() => selectedCompany && centerCompanyInMap(selectedCompany.id)}>선택 기업 중심</button>
              <button type="button" onClick={isAiRelationshipMap ? fitEntireRelationshipMap : fitVisibleMap}>전체 맞춤</button>
            </div>
            {activeRelationship && activeRelationshipSummary && (
              <div className="relationship-popover" role="status" aria-live="polite">
                <button type="button" className="relationship-popover-close" onClick={() => { setHoveredLinkId(null); setSelectedLinkId(null); }} aria-label="관계 카드 닫기">
                  ×
                </button>
                <span>관계 카드</span>
                <strong>
                  {companies.find((company) => company.id === activeRelationship.source)?.name}
                  {' → '}
                  {companies.find((company) => company.id === activeRelationship.target)?.name}
                </strong>
                <p>{activeRelationshipSummary.description}</p>
                <dl>
                  <div><dt>관계 유형</dt><dd>{activeRelationshipSummary.type}</dd></div>
                  <div><dt>무엇이 연결되나</dt><dd>{activeRelationshipSummary.whatIsSold}</dd></div>
                  <div>
                    <dt>확실성</dt>
                    <dd>
                      <span className={`confidence-badge tiny ${confidenceClassName(activeRelationshipSummary.confidence)}`} title={confidenceHelpText(activeRelationshipSummary.confidence)}>
                        {activeRelationshipSummary.confidence}
                      </span>
                    </dd>
                  </div>
                  <div><dt>매출 비중</dt><dd>{activeRelationshipSummary.revenueExposure}</dd></div>
                  <div><dt>근거</dt><dd>{activeRelationshipSummary.evidenceSummary}</dd></div>
                </dl>
                <div className="relationship-popover-actions">
                  <button type="button" onClick={() => setSourcePanelLinkId(activeRelationship.id)}>출처 보기</button>
                  {activeRelationshipSummary.sourceUrl ? (
                    <a href={activeRelationshipSummary.sourceUrl} target="_blank" rel="noreferrer">
                      원문 열기
                    </a>
                  ) : (
                    <span>출처 확인 필요</span>
                  )}
                </div>
                <small>{activeRelationshipSummary.note}</small>
              </div>
            )}
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => focusCompany(node.id)}
              onEdgeMouseEnter={(_, edge) => setHoveredLinkId(edge.id)}
              onEdgeMouseLeave={() => setHoveredLinkId(null)}
              onEdgeClick={(_, edge) => setSelectedLinkId((current) => (current === edge.id ? null : edge.id))}
              onInit={(instance) => setFlowInstance(instance)}
              fitView={!isAiRelationshipMap}
              fitViewOptions={{ padding: isAdvancedRelationshipView ? 0.32 : isAiRelationshipMap ? 0.18 : 0.2, duration: 420 }}
              minZoom={isAdvancedRelationshipView ? 0.36 : isAiRelationshipMap ? 0.52 : 0.32}
              maxZoom={isAdvancedRelationshipView ? 1.18 : isAiRelationshipMap ? 1.4 : 1.45}
              nodesDraggable={!isMapLocked}
              nodesConnectable={false}
              elementsSelectable={!isMapLocked}
              panOnDrag={!isMapLocked}
              zoomOnScroll={!isMapLocked}
              zoomOnPinch={!isMapLocked}
              zoomOnDoubleClick={!isMapLocked}
              preventScrolling={!isMapLocked}
              proOptions={{ hideAttribution: true }}
            >
              <Background color={isAdvancedRelationshipView ? '#edf2f7' : isAiRelationshipMap ? '#eef2f7' : '#d1d5db'} gap={isAdvancedRelationshipView ? 42 : isAiRelationshipMap ? 36 : 22} />
              <Controls position="bottom-left" showInteractive={false} />
            </ReactFlow>
          </section>

          {sourcePanelLink && sourcePanelSummary && (
            <div className="relationship-source-backdrop" role="presentation" onClick={() => setSourcePanelLinkId(null)}>
              <aside
                className="relationship-source-panel"
                role="dialog"
                aria-modal="true"
                aria-label="관계 출처 보기"
                onClick={(event) => event.stopPropagation()}
              >
                <button type="button" className="relationship-source-close" onClick={() => setSourcePanelLinkId(null)} aria-label="출처 패널 닫기">
                  ×
                </button>
                <span>관계 출처 보기</span>
                <h3>
                  {companies.find((company) => company.id === sourcePanelLink.source)?.name}
                  {' → '}
                  {companies.find((company) => company.id === sourcePanelLink.target)?.name}
                </h3>
                <p>{sourcePanelSummary.description}</p>
                <dl>
                  <div><dt>관계 유형</dt><dd>{sourcePanelSummary.type}</dd></div>
                  <div>
                    <dt>관계 확실성</dt>
                    <dd>
                      <span className={`confidence-badge ${confidenceClassName(sourcePanelSummary.confidence)}`} title={confidenceHelpText(sourcePanelSummary.confidence)}>
                        {sourcePanelSummary.confidence}
                      </span>
                      <small>{confidenceHelpText(sourcePanelSummary.confidence)}</small>
                    </dd>
                  </div>
                  <div><dt>근거 요약</dt><dd>{sourcePanelSummary.evidenceSummary}</dd></div>
                  <div><dt>근거 종류</dt><dd>{sourcePanelSummary.evidenceTypeLabel}</dd></div>
                  <div><dt>매출 비중</dt><dd>{sourcePanelSummary.revenueExposure}</dd></div>
                  <div><dt>출처 이름</dt><dd>{sourcePanelSummary.sourceName}</dd></div>
                  <div><dt>출처 날짜</dt><dd>{sourcePanelSummary.sourceDate}</dd></div>
                  <div><dt>신뢰도</dt><dd>{sourcePanelSummary.sourceReliabilityLabel}</dd></div>
                  <div><dt>마지막 확인일</dt><dd>{sourcePanelSummary.lastVerifiedAt}</dd></div>
                </dl>
                {sourcePanelSummary.sourceUrl ? (
                  <a className="relationship-source-link" href={sourcePanelSummary.sourceUrl} target="_blank" rel="noreferrer">
                    출처 원문 열기
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="relationship-source-pending">출처 링크 연결 필요</span>
                )}
                <p className="relationship-source-warning">
                  직접 납품, 독점 공급, 고객별 매출 비중은 공식 공시·IR·계약 원문이 확인될 때만 단정합니다.
                </p>
              </aside>
            </div>
          )}

          <section className="bottom-panel intelligence-panel">
            <div className="live-news-panel">
              <div className="news-header">
                <div className="section-title">
                  <Radio size={16} />
                  <span>최근 24시간 뉴스 API</span>
                </div>
                <button
                  type="button"
                  className="refresh-action"
                  onClick={() => setNewsRefreshKey((current) => current + 1)}
                  disabled={newsState.status === 'loading'}
                >
                  <RefreshCw size={14} />
                  새로고침
                </button>
              </div>
              <div className="news-meta">
                <span>GDELT DOC 2.0</span>
                <span>{newsState.updatedAt ? new Date(newsState.updatedAt).toLocaleTimeString() : '대기 중'}</span>
              </div>
              <div className="news-list">
                {newsState.status === 'loading' && <div className="news-empty">뉴스 수집 중</div>}
                {newsState.status === 'error' && (
                  <div className="news-empty">
                    Vercel 배포 또는 `npm run dev:vercel`에서 `/api/news`가 활성화됩니다.
                    {newsState.error && <small>{newsState.error}</small>}
                  </div>
                )}
                {newsState.status === 'empty' && <div className="news-empty">신뢰 도메인 기준 최근 24시간 새 뉴스 없음</div>}
                {newsState.status === 'success' &&
                  newsState.items.slice(0, 4).map((item) => (
                    <a className="news-item" href={item.url} key={item.url} target="_blank" rel="noreferrer">
                      <span>
                        <Newspaper size={14} />
                        {item.domain || item.source}
                      </span>
                      <strong>{item.title}</strong>
                      <small>
                        {formatNewsDate(item.seendate)}
                        <ExternalLink size={12} />
                      </small>
                    </a>
                  ))}
              </div>
            </div>
          </section>
          </>
          )}
        </main>

        <aside className="right-panel">
          {selectedCompany && selectedDisplayMetrics && (
            <>
              <div className="panel-heading">
                <div className="panel-title-row">
                  <CompanyLogo company={selectedCompany} size="large" />
                  <div>
                    <p className="eyebrow">현재 선택한 기업</p>
                    <CompanyIdentityForCompany company={selectedCompany} size="hero" />
                  </div>
                </div>
                <div className="panel-heading-actions">
                  {selectedIsMainListed && hasTradableTicker(selectedCompany) ? (
                    <PriceBadge price={selectedCompanyPrice} compact />
                  ) : (
                    <span className="reference-status-pill">{selectedIsMainListed ? '가격 티커 연결 필요' : companyScopeLabel(selectedCompany)}</span>
                  )}
                  <span className={`risk-badge ${riskClass[selectedCompany.riskLevel]}`}>
                    리스크 {riskLabels[selectedCompany.riskLevel]}
                  </span>
                </div>
              </div>

              <div className="detail-card summary">
                <div className="summary-main">
                  {selectedRole && <span className={`role-badge large role-${selectedRole.className}`}>{selectedRole.primary}</span>}
                  <span className={`scope-pill ${selectedCanOpenAnalysis ? 'listed' : 'reference'}`}>{companyScopeLabel(selectedCompany)}</span>
                  {selectedConnectionState && (
                    <div className="connection-badge-row">
                      {selectedConnectionState.badges.map((badge) => (
                        <span key={badge} className={`connection-status-badge ${selectedConnectionState.level}`}>{badge}</span>
                      ))}
                    </div>
                  )}
                  {selectedRole && <p className="role-explanation">{selectedRole.explanation}</p>}
                  <strong>{companyBusinessSummary(selectedCompany)}</strong>
                  <p>{companyScopeDetail(selectedCompany)}</p>
                  {selectedCanOpenAnalysis ? (
                    <button type="button" className="analysis-link-button" onClick={() => openAnalysis(selectedCompany)}>
                      <FileSearch size={15} />
                      기업 해설 보기
                    </button>
                  ) : (
                    <span className="reference-status-card">{selectedConnectionState?.detail ?? '시장 흐름 참고 기업입니다.'}</span>
                  )}
                  {selectedRelatedPick && !selectedCanOpenAnalysis && (
                    <button type="button" className="analysis-link-button" onClick={() => openPick(selectedRelatedPick)}>
                      <FileSearch size={15} />
                      관련 Pick 보기
                    </button>
                  )}
                  <div className="summary-action-row">
                    {selectedCanOpenFinancials ? (
                      <button type="button" className="analysis-link-button" onClick={() => openAnalysis(selectedCompany, 'financial-easy-view')}>
                        <Database size={15} />
                        숫자 3개 보기
                      </button>
                    ) : selectedCanOpenAnalysis ? (
                      <span className="analysis-link-button pending" aria-disabled="true">
                        <Database size={15} />
                        재무 연결 준비 중
                      </span>
                    ) : null}
                    {isAiRelationshipMap && (
                      <button type="button" className="analysis-link-button" onClick={() => toggleCompanyExpansion(selectedCompany.id)}>
                        <Network size={15} />
                        {expandedCompanyIds.has(selectedCompany.id) ? '관계 접기' : '관련 기업 보기'}
                      </button>
                    )}
                  </div>
                  <details className="map-advanced-actions">
                    <summary>
                      <span>고급 참고자료</span>
                      <ChevronDown size={14} />
                    </summary>
                    <div>
                      {selectedReportLink && selectedCanOpenAnalysis && <ReportAction reportLink={selectedReportLink} className="analysis-link-button" iconSize={15} />}
                      {selectedReportLink && selectedCanOpenAnalysis && (
                        <div className={`report-state-note ${selectedReportLink.status}`}>
                          <strong>{selectedReportLink.statusLabel}</strong>
                          <span>{selectedReportLink.statusDetail}</span>
                        </div>
                      )}
                      {primaryDirectLinks[0] && (
                        <button type="button" className="analysis-link-button" onClick={() => setSourcePanelLinkId(primaryDirectLinks[0].id)}>
                          <FileSearch size={15} />
                          관계 출처 보기
                        </button>
                      )}
                      <button type="button" className="analysis-link-button" onClick={openOwnershipReports}>
                        <Database size={15} />
                        기관 보유 보고 보기
                      </button>
                      <button type="button" className="analysis-link-button" onClick={() => setNewsRefreshKey((current) => current + 1)}>
                        <Newspaper size={15} />
                        관련 뉴스 보기
                      </button>
                    </div>
                  </details>
                </div>
              </div>

              <div className="relationship-brief-grid" aria-label="선택 기업 핵심 관계">
                <article>
                  <span>이 회사는 뭐 해요?</span>
                  <strong>{companyQuestionProductCopy(selectedCompany)}</strong>
                  <p>{productText(selectedCompany)}</p>
                </article>
                <article>
                  <span>왜 이 흐름에 있나요?</span>
                  <strong>{companyQuestionDemandCopy(selectedCompany)}</strong>
                  <p>{companyDemandTitle(selectedCompany)}</p>
                </article>
                <article>
                  <span>같이 볼 회사는?</span>
                  <strong>{selectedRelatedCompanyNames}</strong>
                  <p>{selectedRelatedCompanyCopy}</p>
                  <span className={`confidence-badge ${confidenceClassName(relationshipConfidenceLabel(selectedCompany))}`}>
                    {relationshipConfidenceLabel(selectedCompany)}
                    <em>{confidenceHelpText(relationshipConfidenceLabel(selectedCompany))}</em>
                  </span>
                </article>
                <article>
                  <span>경제적 해자 <em>경쟁사가 쉽게 따라오기 어려운 이유</em></span>
                  <strong>{selectedMoat?.title}</strong>
                  <p>{selectedMoat?.explanation}</p>
                </article>
                <article className="wide">
                  <span>투자자가 볼 포인트</span>
                  <strong>{companyInvestorWatchPoint(selectedCompany)}</strong>
                  <p>{companyRevenueExposure(selectedCompany)}</p>
                </article>
              </div>

              {selectedCanOpenFinancials && selectedBeginnerMetrics.length > 0 && (
                <div className="detail-card beginner-metrics-compact">
                  <div className="section-title">
                    <BarChart3 size={16} />
                    <span>먼저 볼 지표 3개</span>
                  </div>
                  <div>
                    {selectedBeginnerMetrics.map((metric) => (
                      <article key={metric.label}>
                        <strong>{metric.label}</strong>
                        <span>{metric.value}</span>
                        <p>{metric.note}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-card direct-connections-card">
                <div className="section-title">
                  <ArrowRight size={16} />
                  <span>직접 연결된 주요 기업</span>
                </div>
                <div className="direct-connection-list">
                  {primaryDirectLinks.map((link) => {
                    const counterpartId = link.source === selectedCompany.id ? link.target : link.source;
                    const counterpart = companies.find((company) => company.id === counterpartId);
                    const relationship = linkRelationshipSummary(link);
                    return (
                      <article key={link.id}>
                        <button type="button" className="direct-connection-main" onClick={() => { focusCompany(counterpartId); setSelectedLinkId(link.id); }}>
                          <strong>{counterpart?.name ?? '연결 기업'}</strong>
                          <span>{shortRelationshipLabel(relationship.type)}</span>
                          <em className={`confidence-badge tiny ${confidenceClassName(relationship.confidence)}`}>{relationship.confidence}</em>
                        </button>
                        <button type="button" className="direct-source-button" onClick={() => setSourcePanelLinkId(link.id)}>
                          출처
                        </button>
                      </article>
                    );
                  })}
                  {!primaryDirectLinks.length && <p>현재 공개 데이터 기준 직접 연결 관계가 아직 정리되지 않았습니다.</p>}
                </div>
                {selectedDirectLinks.length > primaryDirectLinks.length && (
                  <button type="button" className="more-connections-button" onClick={() => setShowDetailedLinks(true)}>
                    연결 {selectedDirectLinks.length - primaryDirectLinks.length}개 더 보기
                  </button>
                )}
              </div>

              {selectedCanOpenFinancials ? (
                <>
                  <div className="finance-grid">
                    <div className="finance-item">
                      <CircleDollarSign size={17} />
                      <span>매출</span>
                      <strong>{selectedRevenueDisplay?.primary ?? selectedDisplayMetrics.revenue}</strong>
                      <small>{selectedRevenueDisplay?.sourceUnit ?? selectedDisplayMetrics.revenueUnit}</small>
                    </div>
                    <div className="finance-item">
                      <LineChart size={17} />
                      <span>성장률</span>
                      <strong>{selectedDisplayMetrics.growth}</strong>
                      <small>{selectedDisplayMetrics.growthBasis}</small>
                    </div>
                    <div className="finance-item">
                      <BarChart3 size={17} />
                      <span>영업이익률</span>
                      <strong>{selectedDisplayMetrics.opMargin}</strong>
                    </div>
                    <div className="finance-item">
                      <AlertTriangle size={17} />
                      <span>부채비율</span>
                      <strong>{selectedDisplayMetrics.debtRatio}</strong>
                    </div>
                  </div>
                  <p className="finance-basis">{selectedRevenueDisplay?.basis ?? selectedDisplayMetrics.revenueBasis}</p>
                </>
              ) : (
                <div className="reference-finance-note">
                  <strong>{selectedCanOpenAnalysis ? '재무 연결 준비 중' : selectedConnectionState?.label ?? '시장 흐름 참고'}</strong>
                  <p>{selectedConnectionState?.detail ?? '출처 없는 매출·영업이익률·부채비율을 표시하지 않습니다.'}</p>
                </div>
              )}

              {selectedDependency && (
                <div className={`dependency-card ${selectedDependency.className}`}>
                  <span>고객 의존도 <em>매출이 특정 고객에게 얼마나 기대는지</em></span>
                  <strong>{selectedDependency.level}</strong>
                  {selectedDependency.value && <em>{selectedDependency.value}</em>}
                  <p>{selectedDependency.copy}</p>
                </div>
              )}

              <div className="detail-card">
                <div className="section-title">
                  <FileSearch size={16} />
                  <span>애널리스트/리스크 의견</span>
                </div>
                <div className={`opinion-summary ${selectedAnalystSummary.className}`}>
                  <strong>{selectedAnalystSummary.label}</strong>
                  <span>{selectedAnalystSummary.ratio}</span>
                </div>
                <div className="opinion-list">
                  {selectedAnalystSummary.riskNotes.slice(0, 4).map((opinion) => (
                    <article className="opinion-item" key={opinion.id}>
                      <div>
                        <strong>{opinion.stance}</strong>
                        <span>{opinion.firm}</span>
                      </div>
                      <p>{opinion.summary}</p>
                      <small>
                        {opinion.horizon} · {opinion.date}
                      </small>
                    </article>
                  ))}
                </div>
              </div>

              <div className="detail-card">
                <div className="section-title">
                  <PanelRightOpen size={16} />
                  <span>관계 요약</span>
                </div>
                <dl className="relationship-list">
                  <div>
                    <dt>관계 유형</dt>
                    <dd>{relationshipTypeLabel(selectedCompany)}</dd>
                  </div>
                  <div>
                    <dt>관계 확실성</dt>
                    <dd>{relationshipConfidenceLabel(selectedCompany)}</dd>
                  </div>
                  <div>
                    <dt>매출 비중</dt>
                    <dd>{companyRevenueExposure(selectedCompany)}</dd>
                  </div>
                  <div>
                    <dt>검증 상태</dt>
                    <dd>{relationshipSourceNote(selectedCompany)}</dd>
                  </div>
                  <div>
                    <dt>병목 기업</dt>
                    <dd>{bottleneckSummary(selectedCompany)}</dd>
                  </div>
                </dl>
              </div>

              <div className="detail-card">
                <div className="section-title">
                  <Factory size={16} />
                  <span>제품/태그</span>
                </div>
                <div className="tag-cloud">
                  {selectedCompany.products.concat(selectedCompany.tags).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="detail-card">
                <div className="section-title">
                  <ArrowRight size={16} />
                  <span>직접 연결</span>
                </div>
                <div className="link-list">
                  {groupLinks
                    .filter((link) => link.source === selectedCompany.id || link.target === selectedCompany.id)
                    .map((link) => {
                      const counterpartId = link.source === selectedCompany.id ? link.target : link.source;
                      const counterpart = companies.find((company) => company.id === counterpartId);
                      const relationship = linkRelationshipSummary(link);
                      return (
                        <button key={link.id} type="button" onClick={() => focusCompany(counterpartId)}>
                          <span>{counterpart?.name}</span>
                          <small>
                            {relationship.type}
                            <span className={`confidence-badge tiny ${confidenceClassName(relationship.confidence)}`} title={confidenceHelpText(relationship.confidence)}>
                              {relationship.confidence}
                            </span>
                          </small>
                          <em>{relationship.description}</em>
                          <em>무엇을 파는가: {relationship.whatIsSold}</em>
                          <em>수요 연결: {relationship.demandConnection}</em>
                          <em>매출 비중: {relationship.revenueExposure}</em>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="detail-card source-card">
                <div className="section-title">
                  <Database size={16} />
                  <span>검증 소스 정책</span>
                </div>
                {sourcePolicies.map((policy) => (
                  <div className="source-policy" key={policy.label}>
                    <strong>{policy.label}</strong>
                    <p>{policy.note}</p>
                    <span>{policy.domains.slice(0, 5).join(' · ')}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
