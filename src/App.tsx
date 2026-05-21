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
  ChevronDown,
  CircleDollarSign,
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
} from 'lucide-react';
import {
  analystOpinions,
  AnchorCompany,
  anchors,
  companies,
  Company,
  CompanyTier,
  countries,
  CountryId,
  FilingSourceStatus,
  FinancialStatementSummary,
  links,
  marketMovers,
  MarketPrice,
  RiskLevel,
  sectors,
  SmartMoneyMove,
  smartMoneyMoves,
  sourcePolicies,
  StockAutopsyPick,
  stockAutopsyPicks,
} from './data';
import { buildFallbackFinancials, fetchFinancialsByCompany } from './services/financials';
import {
  externalDisclosureLinks,
  resolveCompanyFilingLinks,
} from './services/filings';
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

const aiCoreCompanyIds = new Set([
  'ai-datacenter-google',
  'ai-datacenter-microsoft',
  'ai-datacenter-amazon',
  'us-semiconductors-nvidia',
  'ai-datacenter-amd',
  'ai-datacenter-broadcom',
  'ai-datacenter-sk-hynix',
  'ai-datacenter-samsung',
  'ai-datacenter-micron',
  'ai-datacenter-tsmc',
  'ai-datacenter-asml',
  'ai-datacenter-hanmi',
  'ai-datacenter-supermicro',
  'ai-datacenter-dell',
  'ai-datacenter-vertiv',
]);

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
  'ai-v01-us-semiconductors-nvidia-ai-datacenter-micron',
  'ai-v01-us-semiconductors-nvidia-ai-datacenter-vertiv',
  'ai-v01-us-semiconductors-nvidia-ai-datacenter-supermicro',
  'ai-v01-us-semiconductors-nvidia-ai-datacenter-dell',
  'ai-v01-ai-datacenter-asml-ai-datacenter-tsmc',
  'ai-v01-ai-datacenter-hanmi-ai-datacenter-sk-hynix',
]);

const aiStageColumns = [
  'AI 서버 수요',
  'AI 칩 / GPU',
  'HBM / 메모리',
  '파운드리',
  '장비 / 소재 / 후공정',
  '서버 / 네트워크',
  '전력·냉각',
];

const aiFlowStages = [
  {
    stage: 'AI 서버 수요',
    symbol: '수요',
    summary: '클라우드 기업과 AI 서비스 기업이 더 많은 계산 능력을 필요로 하는 출발점입니다.',
    companyIds: ['ai-datacenter-microsoft', 'ai-datacenter-google', 'ai-datacenter-amazon'],
  },
  {
    stage: 'AI 칩 / GPU',
    symbol: 'GPU',
    summary: 'AI 계산을 빠르게 처리하는 핵심 칩입니다.',
    companyIds: ['us-semiconductors-nvidia', 'ai-datacenter-amd', 'ai-datacenter-broadcom'],
  },
  {
    stage: 'HBM / 메모리',
    symbol: 'HBM',
    summary: 'AI 칩이 데이터를 빠르게 처리하기 위해 필요한 고성능 메모리입니다.',
    companyIds: ['ai-datacenter-sk-hynix', 'ai-datacenter-samsung', 'ai-datacenter-micron'],
  },
  {
    stage: '파운드리',
    symbol: 'FAB',
    summary: '설계된 칩을 실제로 생산하는 제조 단계입니다.',
    companyIds: ['ai-datacenter-tsmc', 'ai-datacenter-samsung', 'ai-datacenter-intel'],
  },
  {
    stage: '장비 / 소재 / 후공정',
    symbol: '장비',
    summary: '반도체를 만들고 패키징하고 테스트하는 데 필요한 장비와 소재입니다.',
    companyIds: ['ai-datacenter-asml', 'ai-datacenter-hanmi', 'ai-datacenter-wonikips'],
  },
  {
    stage: '서버 / 네트워크',
    symbol: '서버',
    summary: 'AI 칩을 장착한 서버와 데이터 이동 인프라입니다.',
    companyIds: ['ai-datacenter-supermicro', 'ai-datacenter-dell', 'ai-datacenter-arista'],
  },
  {
    stage: '전력·냉각',
    symbol: '전력',
    summary: '데이터센터가 커질수록 전기와 열 관리가 중요해집니다.',
    companyIds: ['ai-datacenter-vertiv', 'ai-datacenter-eaton', 'ai-datacenter-schneider'],
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
  'ai-datacenter-tsmc': { label: 'TSM', tone: 'tsmc' },
  'ai-datacenter-sk-hynix': { label: 'SK', tone: 'hynix' },
  'ai-datacenter-samsung': { label: 'SEC', tone: 'samsung' },
  'ai-datacenter-asml': { label: 'ASML', tone: 'asml' },
  'ai-datacenter-vertiv': { label: 'VRT', tone: 'vertiv' },
  'ai-datacenter-amd': { label: 'AMD', tone: 'amd' },
  'ai-datacenter-supermicro': { label: 'SMCI', tone: 'supermicro' },
  'ai-datacenter-dell': { label: 'DELL', tone: 'dell' },
  'ai-datacenter-arista': { label: 'ANET', tone: 'arista' },
  'ai-datacenter-hanmi': { label: 'HMI', tone: 'kr' },
  'ai-datacenter-leeno': { label: 'LNO', tone: 'kr' },
  'ai-datacenter-isc': { label: 'ISC', tone: 'kr' },
  'ai-datacenter-wonikips': { label: 'WON', tone: 'kr' },
  'ai-datacenter-soulbrain': { label: 'SOL', tone: 'kr' },
};

function companySymbol(company: Company) {
  const mapped = companyVisualSymbols[company.id];
  if (mapped) return mapped;
  const source = company.ticker && !company.ticker.includes('비상장') ? company.ticker : company.name;
  const label = source
    .replace(/\.(KS|KQ|US)$/i, '')
    .replace(/[^a-zA-Z0-9가-힣]/g, '')
    .slice(0, 4)
    .toUpperCase();
  return {
    label: label || company.name.slice(0, 2),
    tone: isMainListedCompany(company) ? 'default' : 'reference',
  };
}

function SupplyNode({ data }: NodeProps<Node<NodeData>>) {
  const { company, isSelected, isDimmed, isExpanded, marketLabel, price, onSelect, onToggleExpand } = data;
  const role = companyRoleProfile(company);
  const symbol = companySymbol(company);

  return (
    <div
      className={[
        'supply-node',
        `tier-${company.tier}`,
        `role-${role.className}`,
        isMainListedCompany(company) ? 'listed-node' : 'reference-node',
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
        <span>{companyValueChainStage(company)}</span>
      </div>
      <div className="node-market-line">
        {isMainListedCompany(company) && price ? (
          <PriceBadge price={price} compact />
        ) : (
          <span className={`node-market-pill ${isMainListedCompany(company) ? 'listed' : 'reference'}`}>{marketLabel}</span>
        )}
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
  if (stage.includes('서버') || stage.includes('네트워크')) return 5;
  if (stage.includes('전력') || stage.includes('냉각')) return 6;
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
  const x = 34 + stageColumn * 304;
  const y = 64 + row * 126;
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

function analysisPath(company: Company) {
  return `/ko/analysis/${encodeURIComponent(company.id)}`;
}

function categoryPath(sectorId: string, selectedCompanyId?: string) {
  const basePath = `/ko/category/${encodeURIComponent(sectorId)}`;
  return selectedCompanyId ? `${basePath}?company=${encodeURIComponent(selectedCompanyId)}` : basePath;
}

function picksPath(pick?: StockAutopsyPick) {
  return pick ? `/ko/picks/${encodeURIComponent(pick.id)}` : '/ko/picks';
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

function companyScopeLabel(company: Company) {
  const listing = inferCompanyListing(company);
  if (listing.listed) return '상장기업';
  if (listing.listingStatus === 'unknown') return '상장 여부 확인 필요';
  if (listing.filingStatus === 'listing-unknown') return '상장 정보 확인 필요';
  if (listing.filingStatus === 'no-public-filing') return '공개 공시 확인 불가';
  return '비상장 참고 기업';
}

function companyScopeDetail(company: Company) {
  const listing = inferCompanyListing(company);
  if (listing.listed) return '주가, 공시, 재무제표, 기관 보유 보고를 연결해 보는 메인 분석 대상입니다.';
  if (listing.listingStatus === 'unknown') return '상장 여부와 공시 연결을 먼저 확인해야 합니다. 확인 전에는 관계 이해용으로 봅니다.';
  return '비상장 또는 공시 확인이 어려운 기업입니다. 투자 분석보다 관계 이해용 보조 노드로 봅니다.';
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
  if (!isMainListedCompany(company)) {
    return {
      primary: '비상장 참고',
      secondary: '관계 참고용',
      className: 'reference',
      filterGroup: 'reference' as RoleFilter,
      explanation: '공시 확인이 어려운 보조 노드입니다.',
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
  if (roleFilter === 'listed') return isMainListedCompany(company);
  if (roleFilter === 'reference') return !isMainListedCompany(company);
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
  if (company.id === 'us-semiconductors-nvidia') {
    return 'NVIDIA는 AI 서버 수요의 중심에 있는 AI 칩 기업으로, GPU와 CUDA 생태계가 핵심 경쟁력입니다.';
  }
  if (company.id === 'kr-semiconductors-sk-hynix' || company.id === 'ai-datacenter-sk-hynix') {
    return 'SK하이닉스는 AI 서버에 필요한 HBM 수요와 연결된 메모리 기업으로, HBM 경쟁력과 현금흐름 회복이 핵심입니다.';
  }
  if (company.id === 'kr-semiconductors-samsung' || company.id === 'ai-datacenter-samsung') {
    return '삼성전자는 메모리와 파운드리를 모두 가진 반도체 기업으로, 업황 회복과 HBM 경쟁력 확보가 중요합니다.';
  }

  return `${company.name}${topicParticle(company.name)} ${productText(company)} 중심 기업입니다. ${companyCustomerSummary(company)} 흐름과 연결되며, ${companyInvestorWatchPoint(company)}를 먼저 확인합니다.`;
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
}: {
  company: Company;
  displayMetrics: CompanyDisplayMetrics;
  quickMetrics: Array<{ label: string; value: string; note: string }>;
}) {
  const revenueValue = quickMetrics.find((metric) => metric.label === '매출')?.value ?? displayMetrics.revenue;
  const cashFlowValue = quickMetrics.find((metric) => metric.label === '현금흐름')?.value ?? '원문 확인';
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
          value: '데이터 연결 필요',
          benchmark: '산업 평균 데이터 연결 필요',
          interpretation: '자기자본으로 얼마나 효율적으로 이익을 냈는지 봅니다.',
          why: '자본을 얼마나 잘 굴리는지 보여주지만 산업마다 적정 수준이 다릅니다.',
          caution: '부채를 많이 써서 ROE가 높아질 수 있어 부채비율과 같이 봐야 합니다.',
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
          value: '데이터 연결 필요',
          benchmark: '경쟁사 비교 데이터 연결 필요',
          interpretation: '주당순이익이 늘었는지 확인합니다.',
          why: '전체 이익보다 주식 한 주당 이익이 늘었는지가 주주에게 중요합니다.',
          caution: '자사주 매입이나 일회성 이익으로 좋아 보일 수 있습니다.',
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
          value: displayMetrics.debtRatio,
          benchmark: '산업 평균 데이터 연결 필요',
          interpretation: '자본 대비 빚 부담이 얼마나 큰지 봅니다.',
          why: '업황이 꺾일 때 빚 부담이 큰 회사는 선택지가 줄어들 수 있습니다.',
          caution: '금융업은 일반 제조업과 부채 구조가 달라 같은 기준으로 보면 안 됩니다.',
        },
        {
          name: '유동비율',
          value: '데이터 연결 필요',
          benchmark: '원문 재무상태표 기준',
          interpretation: '단기적으로 갚아야 할 돈을 감당할 수 있는지 봅니다.',
          why: '현금과 단기자산이 충분해야 투자와 운영을 이어갈 수 있습니다.',
          caution: '재고가 많아 유동비율이 좋아 보여도 실제 현금화가 늦을 수 있습니다.',
        },
        {
          name: '이자보상배율',
          value: '데이터 연결 필요',
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
          value: '데이터 연결 필요',
          benchmark: '영업현금흐름 - CAPEX',
          interpretation: '투자와 운영을 하고도 남는 현금입니다.',
          why: '배당, 자사주, 부채 상환, 재투자 여력을 보여줍니다.',
          caution: '성장기 CAPEX가 큰 산업은 단기 FCF가 낮아도 무조건 나쁜 것은 아닙니다.',
        },
        {
          name: '감가상각비',
          value: '원문 확인',
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
          value: '데이터 연결 필요',
          benchmark: '산업 평균 데이터 연결 필요',
          interpretation: '이익 대비 주가가 비싼지 보는 지표입니다.',
          why: '같은 이익을 내는 회사라도 성장 기대가 다르면 PER이 달라집니다.',
          caution: '반도체처럼 이익 변동이 큰 산업은 바닥에서 PER이 높아 보여 오해할 수 있습니다.',
        },
        {
          name: 'EPS',
          value: '데이터 연결 필요',
          benchmark: '전년 대비 / 경쟁사 비교 필요',
          interpretation: '회사 이익을 주식 한 주당으로 나눈 값입니다.',
          why: '주주 입장에서 한 주당 이익이 늘어나는지 확인합니다.',
          caution: '일회성 이익이 포함되었는지, 주식 수가 줄었는지도 봐야 합니다.',
        },
        {
          name: 'PBR',
          value: '데이터 연결 필요',
          benchmark: '산업 평균 데이터 연결 필요',
          interpretation: '자산가치 대비 주가 수준을 보는 지표입니다.',
          why: '금융주나 자산 많은 기업은 PER보다 PBR과 ROE를 같이 보는 경우가 많습니다.',
          caution: '자산의 질이 낮거나 수익성이 약하면 낮은 PBR도 싸다고 단정할 수 없습니다.',
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

function PriceBadge({ price, compact = false }: { price?: MarketPrice | null; compact?: boolean }) {
  if (price === undefined) {
    return <span className={`price-badge pending ${compact ? 'compact' : ''}`}>가격 불러오는 중</span>;
  }
  const direction = priceDirection(price);
  if (!price) {
    return <span className={`price-badge pending ${compact ? 'compact' : ''}`}>가격 준비 중</span>;
  }
  const display = priceDisplay(price);

  return (
    <span className={`price-badge ${direction} ${compact ? 'compact' : ''}`} title={`${price.source} · ${price.asOf}`}>
      <strong>{display.amount}</strong>
      {display.percent && <em>{display.percent}</em>}
      <small>{[display.status, display.basis, formatPriceAsOf(price.asOf)].filter(Boolean).join(' · ')}</small>
    </span>
  );
}

function formatPriceAsOf(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  onOpenAnalysis: (company: Company) => void;
  onRefreshNews: () => void;
  marketPrices: MarketPrice[];
};

type LandingPageProps = {
  onOpenCategory: (sectorId: string, selectedCompanyId?: string) => void;
  onOpenAnalysis: (company: Company) => void;
  onOpenPicks: () => void;
  onOpenPick: (pick: StockAutopsyPick) => void;
  marketPrices: MarketPrice[];
};

function LandingPage({ onOpenCategory, onOpenAnalysis, onOpenPicks, onOpenPick, marketPrices }: LandingPageProps) {
  const aiFlowPreview = [
    { title: 'AI 서버 수요', companies: ['Microsoft', 'Google'] },
    { title: 'AI 칩', companies: ['NVIDIA', 'AMD'] },
    { title: 'HBM', companies: ['SK하이닉스', '삼성전자'] },
    { title: '파운드리', companies: ['TSMC'] },
    { title: '장비', companies: ['ASML', '한미반도체'] },
    { title: '전력·냉각', companies: ['Vertiv'] },
  ];
  const featuredPicks = stockAutopsyPicks.filter((pick) => pick.status !== 'archived').slice(0, 3);
  const guideNvidia = companies.find((company) => company.id === 'us-semiconductors-nvidia') ?? companies[0];
  const guideSkHynix = companies.find((company) => company.id === 'ai-datacenter-sk-hynix') ?? guideNvidia;

  return (
    <div className="home-shell">
      <header className="home-nav">
        <a href="/ko/" onClick={(event) => event.preventDefault()} className="home-brand">
          <span className="home-logo">
            <Network size={20} />
          </span>
          <strong>주가해부실</strong>
        </a>
        <nav>
          <a href="/ko/" onClick={(event) => event.preventDefault()}>홈</a>
          <a
            href="/ko/picks"
            onClick={(event) => {
              event.preventDefault();
              onOpenPicks();
            }}
          >
            Pick
          </a>
          <a href="#market-flow-map">시장 흐름 지도</a>
          <a href="#beginner-guide">기업 해설</a>
          <a href="#beginner-guide">재무 쉽게 보기</a>
        </nav>
      </header>

      <main>
        <section className="home-hero mvp-hero">
          <div className="home-hero-copy">
            <p className="home-kicker">주가해부실</p>
            <h1>어려운 시장 흐름을 쉽게.</h1>
            <p>오늘의 이슈가 어떤 기업으로 이어지는지 한눈에 봅니다.</p>
            <div className="hero-principle-row" aria-label="사이트 사용 흐름">
              <span>왜 움직였나</span>
              <span>같이 볼 기업</span>
              <span>먼저 볼 지표</span>
            </div>
            <div className="home-hero-actions">
              <button type="button" onClick={onOpenPicks}>
                이번 주 Pick 보기
                <ArrowRight size={16} />
              </button>
              <button type="button" className="secondary" onClick={() => onOpenCategory('us-semiconductors')}>
                AI 반도체 흐름 보기
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="home-mvp-note">투자 추천이 아니라, 뉴스와 종목을 이해하기 위한 해설형 포트폴리오 사이트입니다.</p>
          </div>
        </section>

        <section className="home-section pick-home-section" id="picks-preview">
          <div className="home-section-head">
            <span>1</span>
            <div>
              <h2>이번 주 Pick</h2>
              <p>인스타그램에서 다룬 종목을 “왜 움직였나”와 “같이 볼 기업” 중심으로 봅니다.</p>
            </div>
          </div>
          <div className="pick-home-grid">
            {featuredPicks.map((pick) => (
              <article className="pick-home-card" key={pick.id}>
                <div className="card-topline">
                  <span>{pick.companyName} · {pick.ticker}</span>
                  <em>{pickMarketLabel(pick)}</em>
                </div>
                <h3>{pick.movementLabel}</h3>
                <p>{pick.reasonSummary}</p>
                <div className="mini-tag-row">
                  <span>{pickFlowLabel(pick)}</span>
                  <span>{pickFlowStage(pick)}</span>
                </div>
                <small>같이 볼 기업: {pick.connectedLeaders.slice(0, 3).join(', ')}</small>
                <button type="button" onClick={() => onOpenPick(pick)}>
                  해부 보기
                  <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="flow-preview-section mvp-flow-preview" id="market-flow-map">
          <div className="home-section-head">
            <span>2</span>
            <div>
              <h2>AI 반도체 & 데이터센터 흐름 미리보기</h2>
              <p>지금은 이 대표 흐름 하나를 가장 완성도 있게 보여줍니다.</p>
            </div>
          </div>
          <div className="flow-preview-map compact-flow-map" aria-label="AI 반도체와 데이터센터 흐름 미리보기">
            {aiFlowPreview.map((step, index) => (
              <article className="flow-step-card" key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.companies.join(' · ')}</p>
              </article>
            ))}
          </div>
          <div className="flow-preview-copy">
            <strong>AI 서버 수요가 AI 칩, HBM, 파운드리, 장비, 전력·냉각 기업으로 이어지는지 순서대로 봅니다.</strong>
            <p>직접 납품 관계가 확인되지 않은 기업은 “수요 연결” 또는 “같은 흐름에서 함께 볼 기업”으로 표시합니다.</p>
            <button type="button" onClick={() => onOpenCategory('us-semiconductors')}>
              시장 흐름 지도 보기
              <ArrowRight size={16} />
            </button>
            <small>다음에 추가할 흐름: 전력·냉각, 2차전지, 바이오/CDMO, 방산·우주, 소비·유통</small>
          </div>
        </section>

        <section className="home-section beginner-guide-section" id="beginner-guide">
          <div className="home-section-head">
            <span>3</span>
            <div>
              <h2>처음 오신 분은 여기부터</h2>
              <p>한 번에 많은 금융 데이터를 보지 않고, 회사와 숫자를 읽는 순서만 잡습니다.</p>
            </div>
          </div>
          <div className="beginner-guide-grid">
            <article>
              <span>기업 해설</span>
              <h3>이 회사가 뭘 파는지 쉽게 보기</h3>
              <p>사업보고서식 문장보다 제품, 고객, 경제적 해자부터 봅니다.</p>
              <button type="button" onClick={() => onOpenAnalysis(guideNvidia)}>기업 해설 보기</button>
            </article>
            <article>
              <span>재무 쉽게 보기</span>
              <h3>먼저 볼 숫자 3개만 보기</h3>
              <p>매출, 이익률, 현금흐름을 왜 봐야 하는지 짧게 해석합니다.</p>
              <button type="button" onClick={() => onOpenAnalysis(guideSkHynix)}>재무 쉽게 보기</button>
            </article>
            <article>
              <span>뉴스 요약</span>
              <h3>오늘의 핵심 이슈만 보기</h3>
              <p>뉴스가 어떤 기업 수요와 연결되는지 Pick에서 빠르게 확인합니다.</p>
              <button type="button" onClick={onOpenPicks}>Pick 목록 보기</button>
            </article>
          </div>
          <div className="advanced-reference-note">
            <strong>고급 참고자료는 숨겨두었습니다.</strong>
            <p>13F, Form 4, 공시 원문, 관계 출처, 공급망 참고, 가격 상세는 기업 해설과 더 깊게 보기에서 확인할 수 있습니다.</p>
          </div>
        </section>

      </main>
    </div>
  );
}

type StockAutopsyPicksPageProps = {
  selectedPickId?: string;
  onHome: () => void;
  onOpenCategory: (sectorId: string, selectedCompanyId?: string) => void;
  onOpenAnalysis: (company: Company) => void;
  onOpenPick: (pick: StockAutopsyPick) => void;
  onOpenPicks: () => void;
  onOpenSmartMoney: () => void;
  marketPrices: MarketPrice[];
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
  if (pick.watchMetrics?.length) return pick.watchMetrics.map((metric) => ({ ...metric, value: '값은 재무제표 해설에서 확인' }));
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

function StockAutopsyPicksPage({
  selectedPickId,
  onHome,
  onOpenCategory,
  onOpenAnalysis,
  onOpenPick,
  onOpenPicks,
  onOpenSmartMoney,
  marketPrices,
}: StockAutopsyPicksPageProps) {
  const selectedPick = selectedPickId ? stockAutopsyPicks.find((pick) => pick.id === selectedPickId) : undefined;
  const detailPick = selectedPickId ? selectedPick : undefined;

  if (selectedPickId && !detailPick) {
    return (
      <div className="pick-shell">
        <header className="pick-nav">
          <button type="button" onClick={onHome}>홈</button>
          <button type="button" onClick={onOpenPicks}>Pick 목록</button>
        </header>
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
    const reportLink = relatedCompany ? getPrimaryReportLink(relatedCompany) : null;
    const price = getPriceForPick(detailPick, marketPrices);
    const highlightedStep = valueChainStepByPosition[detailPick.valueChainPosition];
    const reasonLines = (detailPick.beginnerExplanation ?? detailPick.beginnerSummary)
      .split(/(?<=\.)\s+/)
      .filter(Boolean)
      .slice(0, 3);
    const relatedPickCompanies = pickRelatedCompanyList(detailPick).slice(0, 5);
    const watchMetricCards = pickWatchMetricCards(detailPick, relatedCompany).slice(0, 3);
    const signalSet = pickSignalSet(detailPick, relatedCompany);
    const conclusion = detailPick.oneLineConclusion ?? detailPick.reasonSummary;
    const flowLabel = pickFlowLabel(detailPick);
    const flowStage = pickFlowStage(detailPick);

    return (
      <div className="pick-shell">
        <header className="pick-nav">
          <div className="breadcrumb" aria-label="현재 위치">
            <button type="button" onClick={onHome}>홈</button>
            <button type="button" onClick={onOpenPicks}>주가해부실 Pick</button>
            <strong>{detailPick.companyName}</strong>
          </div>
          <button type="button" className="ghost-action" onClick={onOpenPicks}>
            <ArrowRight size={15} />
            Pick 목록
          </button>
        </header>

        <main className="pick-detail">
          <section className="pick-detail-hero">
            <div>
              <span className={`pick-move ${detailPick.movementDirection}`}>
                {detailPick.movementDirection === 'up' ? '상승' : '하락'} · {detailPick.movementLabel}
              </span>
              <h1>{detailPick.title ?? `${detailPick.companyName} 해부`}</h1>
              <p>{detailPick.ticker} · {pickMarketLabel(detailPick)} · {flowLabel}</p>
            </div>
            <div className="pick-hero-side">
              <PriceBadge price={price} />
              <strong>{conclusion}</strong>
            </div>
          </section>

          <section className="pick-detail-card">
            <span className="pick-section-kicker">한 줄 결론</span>
            <h2>{conclusion}</h2>
            <p>이 종목은 {flowLabel} 흐름 안에서 {flowStage} 단계로 함께 봅니다.</p>
          </section>

          <section className="pick-detail-card">
            <span className="pick-section-kicker">왜 움직였나</span>
            <div className="pick-reason-list">
              <p>{detailPick.reasonSummary}</p>
              {reasonLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </section>

          <section className="pick-detail-card">
            <span className="pick-section-kicker">어떤 시장 흐름인가</span>
            <h2>{flowLabel}</h2>
            <p>{detailPick.beginnerSummary}</p>
            <div className="value-chain-steps" aria-label="밸류체인 단계">
              {valueChainSteps.map((step) => (
                <span key={step} className={step === highlightedStep ? 'active' : ''}>
                  {step}
                </span>
              ))}
            </div>
            <p className="pick-helper-copy">
              거래 관계를 단정하지 않고, 같은 밸류체인에서 함께 봐야 할 대표 기업을 연결합니다.
            </p>
          </section>

          <section className="pick-detail-card">
            <span className="pick-section-kicker">같이 볼 기업</span>
            <div className="pick-related-company-grid">
              {relatedPickCompanies.map((company) => (
                <article key={company.id}>
                  <div>
                    <strong>{company.name}</strong>
                    <small>{marketDisplayLabel(company)} · {company.ticker ?? '티커 확인 필요'}</small>
                  </div>
                  <p>{pickRelationCopy(company, detailPick)}</p>
                  <button type="button" onClick={() => onOpenAnalysis(company)}>기업 해설 보기</button>
                </article>
              ))}
            </div>
            {relatedPickCompanies.length === 0 && (
              <p className="pick-helper-copy">아직 연결 기업 데이터가 충분하지 않습니다. 시장 흐름 지도에서 관련 기업을 확인해주세요.</p>
            )}
            <p className="pick-helper-copy">직접 납품이나 확정 수혜가 아니라, 같은 시장 흐름에서 같이 볼 기업입니다.</p>
          </section>

          <section className="pick-detail-card">
            <span className="pick-section-kicker">이 회사는 무엇을 파나</span>
            <h2>{relatedCompany ? relatedCompany.name : detailPick.companyName}</h2>
            <p>{relatedCompany ? companyBusinessSummary(relatedCompany) : detailPick.beginnerSummary}</p>
            <div className="pick-chip-row soft">
              {(relatedCompany?.mainProducts ?? relatedCompany?.products ?? [detailPick.sector]).slice(0, 4).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>

          <section className="pick-detail-card">
            <span className="pick-section-kicker">먼저 볼 재무지표 3개</span>
            <div className="pick-metric-grid">
              {watchMetricCards.map((metric) => (
                <article key={metric.label}>
                  <strong>{metric.label}</strong>
                  <small>{metric.value}</small>
                  <p>{metric.note}</p>
                </article>
              ))}
            </div>
            <p className="pick-helper-copy">실제 값이 연결되지 않은 지표는 가짜 숫자 대신 재무제표 해설에서 원문 기준으로 확인합니다.</p>
          </section>

          <section className="pick-detail-card">
            <span className="pick-section-kicker">좋은 신호 / 조심할 신호</span>
            <div className="pick-signal-grid">
              <article>
                <strong>좋은 신호</strong>
                {signalSet.good.slice(0, 3).map((item) => <p key={item}>{item}</p>)}
              </article>
              <article>
                <strong>조심할 신호</strong>
                {signalSet.caution.slice(0, 3).map((item) => <p key={item}>{item}</p>)}
              </article>
            </div>
          </section>

          <section className="pick-detail-card pick-detail-actions">
            <button type="button" onClick={() => detailPick.relatedSupplyChainId && onOpenCategory(detailPick.relatedSupplyChainId, detailPick.relatedCompanyId)}>
              시장 흐름 지도에서 보기
            </button>
            {relatedCompany ? (
              <button type="button" onClick={() => onOpenAnalysis(relatedCompany)}>
                기업 해설 보기
              </button>
            ) : (
              <span className="pick-disabled-action">기업 해설 연결 준비 중</span>
            )}
            {relatedCompany ? (
              <button type="button" onClick={() => onOpenAnalysis(relatedCompany)}>
                재무제표 해설 보기
              </button>
            ) : (
              <span className="pick-disabled-action">재무제표 연결 준비 중</span>
            )}
            {reportLink ? (
              <ReportAction reportLink={reportLink} className="compact-report-action" iconSize={14} />
            ) : (
              <span className="pick-disabled-action">원문 보고서 연결 준비 중</span>
            )}
            <button type="button" onClick={() => detailPick.relatedSupplyChainId && onOpenCategory(detailPick.relatedSupplyChainId, detailPick.relatedCompanyId)}>
              관계 출처 보기
            </button>
            {relatedCompany ? (
              <button type="button" onClick={() => onOpenAnalysis(relatedCompany)}>
                관련 뉴스 보기
              </button>
            ) : (
              <span className="pick-disabled-action">관련 뉴스 연결 준비 중</span>
            )}
            <button type="button" onClick={onOpenSmartMoney}>
              기관 동향 보기
            </button>
            {detailPick.sourceLinks?.map((source) =>
              source.url ? (
                <a key={source.label} href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              ) : (
                <span key={source.label} className="pick-disabled-action">{source.label} 준비 중</span>
              ),
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="pick-shell">
      <header className="pick-nav">
        <a href="/ko/" onClick={(event) => { event.preventDefault(); onHome(); }} className="home-brand">
          <span className="home-logo">
            <Network size={20} />
          </span>
          <strong>FINANCE</strong>
        </a>
        <nav>
          <button type="button" onClick={onHome}>홈</button>
          <button type="button" onClick={onOpenPicks}>주가해부실 Pick</button>
        </nav>
      </header>

      <main>
        <section className="pick-hero">
          <p className="home-kicker">주가해부실 Pick</p>
          <h1>이번 주 해부 종목</h1>
          <p>급등·급락한 이유를 시장 흐름과 함께 쉽게 정리했습니다.</p>
          <small>인스타그램에서 다룬 종목이 어떤 기업들과 연결되는지 확인해보세요.</small>
        </section>

        <section className="pick-grid" aria-label="주가해부실 Pick 목록">
          {stockAutopsyPicks.filter((pick) => pick.status !== 'archived').map((pick) => (
            <article className="pick-card" key={pick.id}>
              <div className="card-topline">
                <span>{pickMarketLabel(pick)} · {pick.ticker}</span>
                <strong className={pick.movementDirection === 'up' ? 'up' : 'down'}>
                  {pick.movementDirection === 'up' ? '상승' : '하락'}
                </strong>
              </div>
              <h2>{pick.companyName}</h2>
              <PriceBadge price={getPriceForPick(pick, marketPrices)} compact />
              <div className="pick-movement-line">
                <span>움직임</span>
                <strong>{pick.movementLabel}</strong>
              </div>
              <p>{pick.reasonSummary}</p>
              <div className="pick-meta-grid">
                <div>
                  <span>연결된 시장 흐름</span>
                  <strong>{pickFlowLabel(pick)}</strong>
                </div>
                <div>
                  <span>흐름 단계</span>
                  <strong>{pickFlowStage(pick)}</strong>
                </div>
              </div>
              <span className="pick-section-kicker inline">같이 볼 기업</span>
              <div className="pick-chip-row">
                {pick.connectedLeaders.slice(0, 5).map((leader) => (
                  <span key={leader}>{leader}</span>
                ))}
              </div>
              <p className="pick-helper-copy">{pick.beginnerSummary}</p>
              <button type="button" className="pick-primary-action" onClick={() => onOpenPick(pick)}>
                해부 보기
                <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function AnalysisPage({ company, anchor, newsState, onHome, onBack, onOpenAnalysis, onRefreshNews, marketPrices }: AnalysisPageProps) {
  const primaryReportLink = getPrimaryReportLink(company);
  const dataFreshness = dataFreshnessInfo(company, primaryReportLink);
  const disclosureLinks = externalDisclosureLinks(company).filter((link) => link.sourceType !== 'api-docs' && !(primaryReportLink.isDirect && link.url === primaryReportLink.url));
  const disclosureAnalysis = buildCompanyDisclosureAnalysis(company, anchor);
  const displayMetrics = disclosureAnalysis.displayMetrics;
  const insights = disclosureAnalysis.insights;
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

  const metricByKey = new Map(financialSummary.metrics.map((metric) => [metric.key, metric]));
  const revenueMetric = metricByKey.get('revenue');
  const operatingIncomeMetric = metricByKey.get('operatingIncome');
  const netIncomeMetric = metricByKey.get('netIncome');
  const cashFlowMetric = metricByKey.get('cashFlow');
  const debtRatioMetric = metricByKey.get('debtRatio');
  const operatingMarginMetric = metricByKey.get('operatingMargin');
  const analysisRevenueDisplay = revenueDisplayForCompany(company, displayMetrics);
  const beginnerConclusion = beginnerInterpretation(disclosureAnalysis, company);
  const firstWatchPoint = watchPoints[0] ?? '다음 공시에서 매출, 현금흐름, 부채가 같은 방향으로 개선되는지 확인합니다.';
  const hasDetailedFinancialAnalysis = Boolean(getCompanyFilingAnalysis(company));
  const missingFinancialValue = missingFinancialValueLabel(company, hasDetailedFinancialAnalysis);
  const quickMetrics = [
    {
      label: '매출',
      value: financialSummary.isApiData && revenueMetric ? revenueMetric.value : analysisRevenueDisplay.primary,
      note:
        financialSummary.isApiData && revenueMetric
          ? `${revenueMetric.beginnerExplanation} · ${revenueMetric.unit ?? sourceUnitShort(displayMetrics.revenueUnit, company.country)}`
          : analysisRevenueDisplay.sourceUnit,
    },
    {
      label: operatingIncomeMetric ? '영업이익' : '영업마진',
      value: operatingIncomeMetric?.value ?? displayMetrics.opMargin,
      note: operatingIncomeMetric ? operatingIncomeMetric.beginnerExplanation : '영업이익 금액은 원문 해설에서 확인하고, 첫 화면에서는 본업 수익성 비율을 먼저 봅니다.',
    },
    {
      label: '순이익',
      value: netIncomeMetric?.value ?? missingFinancialValue,
      note: netIncomeMetric?.beginnerExplanation ?? '세금과 비용까지 반영한 최종 이익입니다. 숫자가 없으면 원문을 실제 금액처럼 꾸미지 않습니다.',
    },
    {
      label: '현금흐름',
      value: cashFlowMetric?.value ?? missingFinancialValue,
      note: cashFlowMetric?.beginnerExplanation ?? '실제로 현금이 들어오고 나가는 흐름입니다. 이익과 같이 움직이는지 봅니다.',
    },
    {
      label: debtRatioMetric ? '부채비율' : '영업마진',
      value: financialSummary.isApiData ? debtRatioMetric?.value ?? operatingMarginMetric?.value ?? displayMetrics.debtRatio : displayMetrics.debtRatio,
      note: debtRatioMetric?.beginnerExplanation ?? operatingMarginMetric?.beginnerExplanation ?? '빚 부담과 본업 수익성을 같이 봅니다.',
    },
  ];
  const recentMover = marketMovers.find((mover) => mover.companyId === company.id);
  const recentMovementSummary = recentMover?.reason ?? `${company.analystSignal} ${company.investmentView}`;
  const companyPrice = getPriceForCompany(company, marketPrices);
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
  const explainerSymbol = companySymbol(company);
  const explainerMoat = companyMoatSummary(company);
  const explainerMetrics = beginnerIndustryMetrics(company, displayMetrics);
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
    .slice(0, 5);
  const scrollToAnalysisSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const financialConclusion = financialOneLineConclusion(company, disclosureAnalysis);
  const financialMetricBranches = buildMetricBranchGroups({ company, displayMetrics, quickMetrics });

  return (
    <div className="analysis-shell">
      <header className="analysis-hero">
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
            기업 관계 지도
          </button>
        </div>
        <div>
          <p className="eyebrow">초보자용 기업 설명서</p>
          <h1>{company.name} 기업 해설</h1>
          <p>이 회사가 무엇을 팔고, 누구의 수요와 연결되는지 쉽게 정리했습니다. 숫자는 재무제표와 공시 해석으로 더 깊게 확인할 수 있습니다.</p>
        </div>
        <div className="analysis-actions">
          <ReportAction reportLink={primaryReportLink} />
        </div>
      </header>

      <main className="analysis-detail-flow">
        <section className="analysis-card company-explainer-card">
          <div className="company-explainer-top">
            <span className={`company-symbol large symbol-${explainerSymbol.tone}`} aria-hidden="true">
              {explainerSymbol.label}
            </span>
            <div>
              <span className="analysis-market-pill">{companyScopeLabel(company)} · {marketDisplayLabel(company)}</span>
              <h2>{beginnerCompanyConclusion(company)}</h2>
              <p>{isMainListedCompany(company) ? companyScopeDetail(company) : '공식 공시가 제한적인 기업은 관계 이해용으로 보고, 출처 없는 재무 숫자는 표시하지 않습니다.'}</p>
            </div>
            <div className="company-explainer-price">
              {hasTradableTicker(company) ? <PriceBadge price={companyPrice} compact /> : <span className="reference-status-pill">{companyScopeLabel(company)}</span>}
            </div>
          </div>

          <div className="explainer-card-grid">
            <article>
              <Factory size={18} />
              <span>무엇을 파는 회사인가</span>
              <strong>{productText(company)}</strong>
              <p>{companyBusinessSummary(company)}</p>
            </article>
            <article>
              <Network size={18} />
              <span>누구의 수요와 연결되는가</span>
              <strong>{companyCustomerSummary(company)}</strong>
              <p>{companyCustomerExposure(company)}</p>
            </article>
            <article>
              <ShieldAlert size={18} />
              <span>경제적 해자</span>
              <strong>{explainerMoat.title}</strong>
              <p>{explainerMoat.explanation}</p>
            </article>
            <article>
              <Target size={18} />
              <span>투자자가 볼 포인트</span>
              <strong>{companyInvestorWatchPoint(company)}</strong>
              <p>{companyRevenueExposure(company)}</p>
            </article>
          </div>

          <div className="explainer-lower-grid">
            <section className="explainer-metric-card">
              <div className="section-title">
                <BarChart3 size={16} />
                <span>이 산업에서 먼저 볼 지표 3개</span>
              </div>
              <div>
                {explainerMetrics.map((metric) => (
                  <article key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <p>{metric.note}</p>
                  </article>
                ))}
              </div>
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
          </div>

          <section className="explainer-related-card" id="related-companies">
            <div className="section-title">
              <ArrowRight size={16} />
              <span>{company.name}와 함께 볼 기업</span>
            </div>
            {relatedCompanies.length ? (
              <div className="explainer-related-list">
                {relatedCompanies.map((item) => (
                  <button key={item.company.id} type="button" onClick={() => onOpenAnalysis(item.company)}>
                    <strong>{item.company.name}</strong>
                    <span>{shortRelationshipLabel(item.relationship.type)} · {item.relationship.confidence}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="explainer-empty-copy">현재 공개 데이터 기준 정리된 관련 기업이 아직 없습니다.</p>
            )}
          </section>

          <div className="explainer-action-row">
            <button type="button" onClick={() => onBack(company)}>
              <Network size={15} />
              시장 흐름 지도에서 보기
            </button>
            <button type="button" onClick={() => scrollToAnalysisSection('financial-analysis-details')}>
              <CircleDollarSign size={15} />
              재무제표 해설 보기
            </button>
            <ReportAction reportLink={primaryReportLink} className="explainer-report-action" iconSize={15} label="공시 원문 보기" />
            <button type="button" onClick={() => scrollToAnalysisSection('relationship-details')}>
              <FileSearch size={15} />
              관계 출처 보기
            </button>
            <button type="button" onClick={() => scrollToAnalysisSection('related-companies')}>
              <ArrowRight size={15} />
              관련 기업 보기
            </button>
            <button type="button" onClick={() => scrollToAnalysisSection('trade-report-details')}>
              <Database size={15} />
              기관 동향 보기
            </button>
          </div>
        </section>

        <section className="analysis-card analysis-overview-card financial-learning-card">
          <div className="analysis-overview-head financial-learning-head">
            <div>
              <span className="analysis-market-pill">재무제표 해설 · {marketDisplayLabel(company)}</span>
              <h2>재무제표는 숫자를 외우는 것이 아니라, 회사의 상태를 해석하는 도구입니다.</h2>
              <p>이 산업에서 먼저 볼 지표부터 확인하고, 더 깊은 지표는 단계적으로 열어보세요.</p>
            </div>
            <div className="analysis-overview-side">
              <PriceBadge price={companyPrice} compact />
              <span className={`analysis-source-pill ${reportLinkClass(primaryReportLink)}`}>{sourceStatusShort}</span>
              <div className="data-freshness-card" aria-label="재무 데이터 기준">
                <strong>기준 보고서: {dataFreshness.reportName}</strong>
                <span>공시일: {dataFreshness.filingDate}</span>
                <em>{dataFreshness.status}</em>
              </div>
              <small className="analysis-report-meta">{primaryReportLink.statusDetail}</small>
            </div>
          </div>

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

          <section className="financial-priority-card">
            <div className="section-title">
              <BarChart3 size={16} />
              <span>이 산업에서 먼저 볼 지표 3개</span>
            </div>
            <p>모든 기업에 같은 지표를 억지로 적용하지 않고, {companyValueChainStage(company)} 맥락에서 먼저 확인할 숫자만 보여줍니다.</p>
            <div className="financial-priority-grid">
              {explainerMetrics.map((metric) => (
                <article key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.note}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="financial-signal-grid">
            <section>
              <strong>좋은 신호</strong>
              {explainerSignals.good.map((signal) => <span key={signal}>{signal}</span>)}
            </section>
            <section>
              <strong>조심할 신호</strong>
              {explainerSignals.caution.map((signal) => <span key={signal}>{signal}</span>)}
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

          <div className="financial-more-actions" aria-label="재무제표 상세 보기">
            <button type="button" onClick={() => scrollToAnalysisSection('financial-metric-branches')}>
              지표 더 깊게 보기
            </button>
            <button type="button" onClick={() => scrollToAnalysisSection('financial-analysis-details')}>
              손익·현금흐름 해설
            </button>
            <button type="button" onClick={() => scrollToAnalysisSection('disclosure-analysis-details')}>
              MD&A / 공시 해설
            </button>
            <button type="button" onClick={() => scrollToAnalysisSection('source-report-details')}>
              원문 보고서 확인
            </button>
          </div>
        </section>

        <div className="analysis-detail-stack">
          <details className="analysis-card analysis-disclosure-section financial-branch-section" id="financial-metric-branches">
            <summary>
              <span>
                <BarChart3 size={16} />
                <strong>지표 더 깊게 보기</strong>
                <small>수익성, 성장성, 안정성, 현금흐름, 밸류에이션을 단계적으로 펼쳐 봅니다.</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div className="analysis-detail-content">
              <div className="metric-branch-grid">
                {financialMetricBranches.map((group) => (
                  <details className="metric-branch-card" key={group.title}>
                    <summary>
                      <span>
                        <strong>{group.title}</strong>
                        <small>{group.summary}</small>
                      </span>
                      <ChevronDown size={15} />
                    </summary>
                    <div className="metric-branch-items">
                      {group.items.map((metric) => (
                        <article className="metric-detail-card" key={metric.name}>
                          <div>
                            <span>{metric.name}</span>
                            <strong>{metric.value}</strong>
                          </div>
                          <div className="metric-detail-grid">
                            <p><b>비교 기준</b>{metric.benchmark}</p>
                            <p><b>한 줄 해석</b>{metric.interpretation}</p>
                            <p><b>왜 보는지</b>{metric.why}</p>
                            <p><b>주의할 점</b>{metric.caution}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </details>

          <details className="analysis-card analysis-disclosure-section" id="financial-analysis-details">
            <summary>
              <span>
                <CircleDollarSign size={16} />
                <strong>재무제표 해설 더 보기</strong>
                <small>손익계산서, 현금흐름표, 재무상태표 해설을 펼쳐 봅니다.</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div className="analysis-detail-content">
              <div className="section-title">
                <BarChart3 size={16} />
                <span>{disclosureAnalysis.isCurated ? '재무제표 해설' : '초보자용 공시 확인 포인트'}</span>
              </div>
              <div className="insight-grid">
                {insights.map((insight, index) => (
                  <article className="insight-card" key={insight.title}>
                    <span>{insight.kicker}</span>
                    <strong>{insight.title}</strong>
                    <div className="so-what-list">
                      <p><b>무슨 일이 있었나</b>{insight.body}</p>
                      <p><b>그래서 왜 중요한가</b>{insight.point}</p>
                      <p><b>앞으로 볼 것</b>{watchPoints[index] ?? '다음 공시에서 같은 흐름이 숫자로 이어지는지 확인합니다.'}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </details>

          <details className="analysis-card analysis-disclosure-section" id="disclosure-analysis-details">
            <summary>
              <span>
                <FileSearch size={16} />
                <strong>{isKorea ? '공시·감사 분석 더 보기' : 'MD&A / Risk Factors 더 보기'}</strong>
                <small>{isKorea ? '감사·검토 기록과 미래 반영 포인트를 봅니다.' : '경영진 설명, 위험요인, SEC 해설을 봅니다.'}</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div className="analysis-detail-content">
              <div className="section-title">
                <FileSearch size={16} />
                <span>{disclosureAnalysis.isCurated ? '공시 원문 해석' : '회사별 공시 검증 상태'}</span>
              </div>
              <div className="analysis-status-row">
                <span className={`analysis-status-pill ${primaryReportLink.status === 'direct' ? 'complete' : 'pending'}`}>
                  {primaryReportLink.statusLabel}
                </span>
                <small>{primaryReportLink.statusDetail}</small>
              </div>
              <p className="source-status-copy">{sourceStatusCopy}</p>
              <div className="filing-brief-body">
                <span>{disclosureAnalysis.reportDate}</span>
                <strong>{disclosureAnalysis.headline}</strong>
                <p>{disclosureAnalysis.verdict}</p>
                {primaryReportLink.isNavigable ? (
                  <a href={primaryReportLink.url} target="_blank" rel="noreferrer">
                    {primaryReportLink.label}
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="filing-source-pending">
                    {primaryReportLink.label}
                    <FileSearch size={14} />
                  </span>
                )}
              </div>

              <div className="analysis-divider" />

              <div className="section-title">
                <ShieldAlert size={16} />
                <span>{isKorea ? '감사·검토 기록' : 'MD&A / 경영진 해설'}</span>
              </div>
              <ul className="plain-list">
                {disclosureAnalysis.auditNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>

              <div className="analysis-divider" />

              <div className="section-title">
                <Target size={16} />
                <span>{isKorea ? '미래 반영 포인트' : 'Risk Factors / 미래 반영 포인트'}</span>
              </div>
              <ul className="plain-list">
                {watchPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </details>

          <details className="analysis-card analysis-disclosure-section" id="source-report-details">
            <summary>
              <span>
                <FileSearch size={16} />
                <strong>원문 보고서 확인</strong>
                <small>{sourceStatusShort}</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div className="analysis-detail-content">
              <div className="analysis-status-row">
                <span className={`analysis-status-pill ${primaryReportLink.status === 'direct' ? 'complete' : 'pending'}`}>
                  {sourceStatusShort}
                </span>
                <small>{primaryReportLink.statusDetail}</small>
              </div>
              <div className="report-meta-grid" aria-label="원문 보고서 기준 정보">
                {reportMetaItems(company).map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              <div className="disclosure-list">
                {primaryReportLink.isNavigable ? (
                  <a
                    href={primaryReportLink.url}
                    target="_blank"
                    rel="noreferrer"
                    className={primaryReportLink.isDirect ? 'direct-report-link' : 'pending-report-link'}
                  >
                    <strong>{primaryReportLink.label}</strong>
                    <span>{primaryReportLink.note}</span>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <div className="pending-report-link report-status-card">
                    <strong>{primaryReportLink.label}</strong>
                    <span>{primaryReportLink.note}</span>
                    <FileSearch size={14} />
                  </div>
                )}
                {disclosureLinks.map((link) => (
                  <a href={link.url} key={link.label} target="_blank" rel="noreferrer">
                    <strong>{link.label}</strong>
                    <span>{link.note}</span>
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            </div>
          </details>

          <details className="analysis-card analysis-disclosure-section" id="relationship-details">
            <summary>
              <span>
                <Network size={16} />
                <strong>관련 기업 관계 보기</strong>
                <small>이 회사가 어느 산업 흐름에 있는지 봅니다.</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div className="analysis-detail-content">
              <div className="analysis-supply-box">
                <div>
                  <span>무엇을 파는 회사인가</span>
                  <strong>{productText(company)}</strong>
                  <p>{companyBusinessSummary(company)}</p>
                </div>
                <div>
                  <span>밸류체인 위치</span>
                  <strong>{companyValueChainStage(company)}</strong>
                  <p>{companyCustomerSummary(company)}</p>
                </div>
                <div>
                  <span>경제적 해자</span>
                  <strong>{companyMoatSummary(company).title}</strong>
                  <p>{companyMoatSummary(company).explanation}</p>
                </div>
                <button type="button" onClick={() => onBack(company)}>
                  기업 관계 지도에서 보기
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </details>

          <details className="analysis-card analysis-disclosure-section" id="trade-report-details">
            <summary>
              <span>
                <CircleDollarSign size={16} />
                <strong>관련 보유·거래 보고</strong>
                <small>13F 분기 보유 보고와 내부자·국회의원 공개 거래 보고를 참고합니다.</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div className="analysis-detail-content">
              {companyTrades.length === 0 ? (
                <div className="trade-empty">아직 확인된 보유·거래 보고가 없습니다. 현재 공개 자료 기준으로 관련 보고가 확인되지 않았습니다.</div>
              ) : (
                <div className="related-trade-list">
                  {companyTrades.slice(0, 4).map((move) => (
                    <article key={move.id}>
                      <div>
                        <strong>{move.investorName}</strong>
                        <span>{move.investorTypeLabel} · {publicReportActionLabel(move)}</span>
                      </div>
                      <p>{move.beginnerExplanation}</p>
                      <small>
                        공개일 {move.disclosedDate}
                        {move.tradeDateOptional
                          ? ` · ${publicReportDateLabel(move)} ${move.tradeDateOptional}`
                          : ` · ${publicReportDateLabel(move)} 확인 필요`}
                        {' · '}
                        {move.sourceLabel}
                      </small>
                    </article>
                  ))}
                </div>
              )}
              <div className="home-note">
                <p>13F는 분기 말 기관 보유 보고이며 실제 매수·매도 시점과 차이가 있습니다.</p>
                <p>국회의원 거래는 공개된 거래 보고 기준이며 실제 매매일과 공개일이 다를 수 있습니다.</p>
                <p>보유·거래 보고는 투자 권유가 아닌 참고용 데이터입니다.</p>
              </div>
            </div>
          </details>

          <details className="analysis-card analysis-disclosure-section">
            <summary>
              <span>
                <Newspaper size={16} />
                <strong>관련 뉴스 보기</strong>
                <small>실적과 공시를 이해할 때 같이 볼 기사입니다.</small>
              </span>
              <ChevronDown size={16} />
            </summary>
            <div className="analysis-detail-content">
              <div className="news-header">
                <div className="section-title">
                  <Newspaper size={16} />
                  <span>관련 뉴스</span>
                </div>
                <button type="button" className="refresh-action" onClick={onRefreshNews} disabled={newsState.status === 'loading'}>
                  <RefreshCw size={14} />
                  새로고침
                </button>
              </div>
              <div className="analysis-news-list">
                {newsState.status === 'loading' && <div className="news-empty">뉴스 수집 중</div>}
                {newsState.status === 'empty' && <div className="news-empty">최근 24시간 신뢰 도메인 뉴스가 없습니다.</div>}
                {newsState.status === 'error' && <div className="news-empty">뉴스 API 확인 필요</div>}
                {newsState.status === 'success' &&
                  newsState.items.slice(0, 5).map((item) => (
                    <a className="news-item" href={item.url} key={item.url} target="_blank" rel="noreferrer">
                      <span>
                        <Newspaper size={14} />
                        {item.domain || item.source}
                      </span>
                      <strong>{item.title}</strong>
                      <div className="news-keyword-row">
                        {newsKeywords(company).map((keyword) => (
                          <em key={keyword}>{keyword}</em>
                        ))}
                      </div>
                      <small>
                        {formatNewsDate(item.seendate)}
                        <ExternalLink size={12} />
                      </small>
                    </a>
                  ))}
              </div>
            </div>
          </details>
        </div>
      </main>
    </div>
  );
}

type OwnershipReportsPageProps = {
  onHome: () => void;
  onOpenAnalysis: (company: Company) => void;
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
                  <strong>{move.companyName}</strong>
                  <small>{move.ticker}</small>
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
  const [route, setRoute] = useState(() => `${window.location.pathname}${window.location.search}`);
  const [isMapLocked, setIsMapLocked] = useState(false);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const graphWrapRef = useRef<HTMLElement | null>(null);

  const country = countries.find((item) => item.id === selectedCountry) ?? countries[0];
  const countrySectors = sectors.filter((sector) => sector.country === selectedCountry);
  const selectedSector = sectors.find((sector) => sector.id === selectedSectorId) ?? countrySectors[0];
  const topAnchors = anchors.filter((anchor) => anchor.sectorId === selectedSector.id).sort((a, b) => a.rank - b.rank);
  const selectedAnchor = anchors.find((anchor) => anchor.id === selectedAnchorId) ?? topAnchors[0];
  const groupCompanies = companies.filter((company) => company.anchorId === selectedAnchor.id);
  const groupLinks = links.filter((link) => link.anchorId === selectedAnchor.id);
  const isAiRelationshipMap = selectedSector.id === aiRelationshipSectorId && selectedAnchor.id === aiRelationshipAnchorId;
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
      (listingFilter === 'listed' ? isMainListedCompany(company) : !isMainListedCompany(company));
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
      isMainListedCompany(company) ||
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
  const selectedAnalystSummary = classifyAnalystOpinion(selectedOpinions);
  const selectedReportLink = selectedCompany ? getPrimaryReportLink(selectedCompany) : null;
  const selectedIsMainListed = selectedCompany ? isMainListedCompany(selectedCompany) : false;
  const selectedCompanyPrice = selectedCompany && hasTradableTicker(selectedCompany) ? getPriceForCompany(selectedCompany, marketPrices) : null;
  const connectedIds = selectedCompany ? getConnectedIds(selectedCompany.id, groupLinks) : new Set<string>();
  const selectedDirectLinks = selectedCompany
    ? groupLinks.filter((link) => link.source === selectedCompany.id || link.target === selectedCompany.id)
    : [];
  const primaryDirectLinks = selectedDirectLinks.slice(0, isAiRelationshipMap ? 3 : 6);
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
    const stageCompanies = visibleCompanies.filter((company) => matchesAiFlowStage(stage.stage, company));
    const displayCompanies = (representativeCompanies.length ? representativeCompanies : stageCompanies).slice(0, 3);
    const hiddenCount = Math.max(0, stageCompanies.length - displayCompanies.filter((company) => stageCompanies.some((item) => item.id === company.id)).length);
    return {
      ...stage,
      companies: displayCompanies,
      hiddenCount,
    };
  });
  const aiKoreaListedCompanies = aiKoreaListedPriorityNames
    .map((name) =>
      groupCompanies.find((company) => company.name === name && isMainListedCompany(company)) ??
      companies.find((company) => company.name === name && isMainListedCompany(company)),
    )
    .filter((company): company is Company => Boolean(company))
    .filter((company, index, list) => list.findIndex((item) => item.name === company.name) === index);
  const aiKoreaListedPreview = aiKoreaListedCompanies.slice(0, 8);
  const roleFilterOptions: Array<{ value: RoleFilter; label: string; note: string }> = [
    { value: 'all', label: mapViewMode === 'core' ? '핵심 관계' : '전체', note: '기본 흐름' },
    { value: 'leader', label: '대장주', note: '먼저 볼 기업' },
    { value: 'bottleneck', label: '핵심 병목', note: '흐름의 관문' },
    { value: 'beneficiary', label: '수요 수혜', note: '함께 볼 기업' },
    { value: 'listed', label: '상장기업', note: '분석 대상' },
    { value: 'reference', label: '비상장 참고', note: '관계 보조' },
  ];
  const flowModeOptions: Array<{ value: FlowViewMode; label: string; note: string }> = [
    { value: 'core', label: '핵심 관계', note: '대표 흐름' },
    { value: 'all', label: '전체 관계', note: '상장기업 전체' },
    { value: 'kr', label: '한국 관련주', note: '한국 상장기업' },
    { value: 'us', label: '미국 기업', note: '미국 상장기업' },
    { value: 'reference', label: '공급망 참고', note: '비상장/보조' },
    { value: 'sources', label: '관계 출처', note: '근거 확인' },
  ];
  const routePath = route.split('?')[0];
  const routeQuery = route.includes('?') ? route.slice(route.indexOf('?')) : '';
  const routeParams = new URLSearchParams(routeQuery);
  const routeAnalysisMatch = routePath.match(/^\/ko\/analysis\/([^/]+)$/);
  const routeCategoryMatch = routePath.match(/^\/ko\/category\/([^/]+)$/);
  const routePickMatch =
    routePath.match(/^\/ko\/picks(?:\/([^/]+))?$/) ??
    routePath.match(/^\/picks(?:\/([^/]+))?$/) ??
    routePath.match(/^\/stock-autopsy-picks(?:\/([^/]+))?$/);
  const routeOwnershipMatch = routePath.match(/^\/ko\/ownership(?:\/)?$/) ?? routePath.match(/^\/ownership-trades(?:\/)?$/);
  const routeAnalysisCompanyId = routeAnalysisMatch ? decodeURIComponent(routeAnalysisMatch[1]) : routeParams.get('company');
  const routeCategoryId = routeCategoryMatch ? decodeURIComponent(routeCategoryMatch[1]) : undefined;
  const routeCategoryCompanyId = routeCategoryId ? routeParams.get('company') ?? undefined : undefined;
  const routePickId = routePickMatch?.[1] ? decodeURIComponent(routePickMatch[1]) : undefined;
  const routeCompany = companies.find((company) => company.id === routeAnalysisCompanyId);
  const analysisCompany = routeCompany ?? selectedCompany;
  const analysisAnchor = analysisCompany ? anchors.find((anchor) => anchor.id === analysisCompany.anchorId) : undefined;
  const isAnalysisRoute = routePath === '/analysis' || Boolean(routeAnalysisMatch);
  const isPicksRoute = Boolean(routePickMatch);
  const isOwnershipRoute = Boolean(routeOwnershipMatch);
  const isCategoryRoute = Boolean(routeCategoryMatch) || routePath === '/dashboard' || routePath === '/app';
  const newsCompany = isAnalysisRoute && analysisCompany ? analysisCompany : selectedCompany;
  const newsSector = isAnalysisRoute && analysisCompany ? sectors.find((sector) => sector.id === analysisCompany.sectorId) ?? selectedSector : selectedSector;
  const newsAnchor = isAnalysisRoute && analysisCompany ? analysisCompany.anchorId : selectedAnchor.id;
  const newsCountry = isAnalysisRoute && analysisCompany ? analysisCompany.country : selectedCountry;

  useEffect(() => {
    const syncRoute = () => setRoute(`${window.location.pathname}${window.location.search}`);
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

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
    window.requestAnimationFrame(() => {
      flowInstance.fitView({
        padding: isAiRelationshipMap ? 0.2 : 0.22,
        duration: 420,
        includeHiddenNodes: false,
      });
    });
  }

  function scheduleFitVisibleMap(delay = 120) {
    window.setTimeout(() => fitVisibleMap(), delay);
    window.setTimeout(() => fitVisibleMap(), delay + 220);
  }

  function centerCompanyInMap(companyId: string) {
    if (!flowInstance) return;
    const company = groupCompanies.find((item) => item.id === companyId);
    if (!company) return;
    const position = getNodePosition(company);
    window.requestAnimationFrame(() => {
      flowInstance.setCenter(position.x + 112, position.y + 58, {
        zoom: isAiRelationshipMap ? 0.72 : Math.max(flowInstance.getZoom(), 0.58),
        duration: 420,
      });
    });
  }

  function focusCompany(companyId: string) {
    setSelectedCompanyId(companyId);
    if (isAiRelationshipMap) {
      setExpandedCompanyIds((current) => new Set([...current, companyId]));
    }
    centerCompanyInMap(companyId);
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

  function showFullRelationshipMap() {
    setFlowViewMode('all');
    setMapViewMode('all');
    setShowReferenceNodes(true);
    setShowNeedsVerification(true);
    setShowDetailedLinks(true);
    scheduleFitVisibleMap(80);
  }

  function applyFlowViewMode(mode: FlowViewMode) {
    setFlowViewMode(mode);
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
      if (mode === 'kr') return company.country === 'KR' && isMainListedCompany(company);
      if (mode === 'us') return company.country === 'US' && isMainListedCompany(company);
      if (mode === 'reference') return !isMainListedCompany(company);
      return aiCoreCompanyIds.has(company.id);
    });
    if (nextFocus) setSelectedCompanyId(nextFocus.id);
    scheduleFitVisibleMap(80);
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
          label: showDetailedLinks || flowViewMode === 'sources' ? relationship.type : shortRelationshipLabel(relationship.type),
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
    [activeRelationshipId, flowViewMode, groupLinks, isAiRelationshipMap, selectedCompany, showDetailedLinks, visibleLinks],
  );

  useEffect(() => {
    if (!flowInstance || !isCategoryRoute || !flowNodes.length) return;
    const timer = window.setTimeout(() => {
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
  }, [flowInstance, isAiRelationshipMap, isCategoryRoute]);

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

  function openAnalysis(company: Company) {
    window.history.pushState({}, '', analysisPath(company));
    setRoute(`${window.location.pathname}${window.location.search}`);
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
    setHoveredLinkId(null);
    setSelectedLinkId(null);
    setSourcePanelLinkId(null);
  }

  function openCategory(sectorId: string, selectedCompanyIdToFocus?: string) {
    const focusCompany = selectedCompanyIdToFocus ? companies.find((company) => company.id === selectedCompanyIdToFocus) : undefined;
    const nextSectorId = focusCompany?.sectorId ?? sectorId;
    selectSectorScope(nextSectorId, focusCompany?.id);
    window.history.pushState({}, '', categoryPath(nextSectorId, focusCompany?.id));
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openHome() {
    window.history.pushState({}, '', '/ko/');
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openPicks() {
    window.history.pushState({}, '', picksPath());
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openPick(pick: StockAutopsyPick) {
    window.history.pushState({}, '', picksPath(pick));
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function openSmartMoneyFromPick() {
    window.history.pushState({}, '', '/ko/');
    setRoute(`${window.location.pathname}${window.location.search}`);
    window.setTimeout(() => {
      document.getElementById('smart-money')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
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
    setHoveredLinkId(null);
    setSelectedLinkId(null);
    setSourcePanelLinkId(null);
  }

  if (isPicksRoute) {
    return (
      <StockAutopsyPicksPage
        selectedPickId={routePickId}
        onHome={openHome}
        onOpenCategory={openCategory}
        onOpenAnalysis={openAnalysis}
        onOpenPick={openPick}
        onOpenPicks={openPicks}
        onOpenSmartMoney={openSmartMoneyFromPick}
        marketPrices={marketPrices}
      />
    );
  }

  if (isOwnershipRoute) {
    return <OwnershipReportsPage onHome={openHome} onOpenAnalysis={openAnalysis} onOpenCategory={openCategory} />;
  }

  if (isAnalysisRoute && analysisCompany) {
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

  if (!isCategoryRoute) {
    return (
      <LandingPage
        onOpenCategory={openCategory}
        onOpenAnalysis={openAnalysis}
        onOpenPicks={openPicks}
        onOpenPick={openPick}
        marketPrices={marketPrices}
      />
    );
  }

  return (
    <ReactFlowProvider>
      <div className={`app-shell ${isDetailCollapsed ? 'detail-collapsed' : ''}`}>
        <aside className="left-panel">
          <div className="brand-block">
            <div className="brand-mark">
              <Network size={22} />
            </div>
            <div>
              <p className="eyebrow">초보 투자자용 흐름 학습</p>
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
                      <strong>{company.name}</strong>
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
                  <strong>{anchor.name}</strong>
                  <small>
                    {anchor.exchange} · {anchor.ticker}
                  </small>
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
              return (
                <div className={`company-row-card ${selectedCompany?.id === company.id ? 'selected' : ''}`} key={company.id}>
                  <button
                    className="company-row"
                    onClick={() => focusCompany(company.id)}
                    type="button"
                  >
                    <span className={`role-badge role-${role.className}`}>{role.primary}</span>
                    <span className="company-row-main">
                      <strong>{company.name}</strong>
                      <small>{role.secondary} · {productText(company)}</small>
                      <em>{companyScopeLabel(company)}</em>
                    </span>
                    <span className={`risk-dot ${riskClass[company.riskLevel]}`} />
                  </button>
                  {isMainListedCompany(company) ? (
                    <button className="company-row-action" type="button" onClick={() => openAnalysis(company)}>
                      재무·공시 보기
                    </button>
                  ) : (
                    <span className="company-row-disabled">관계 참고용</span>
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
                <span>기업 관계</span>
                <span>{selectedSector.label}</span>
                <strong>{selectedAnchor.name}</strong>
              </nav>
              <p className="eyebrow">
                {country.label} · {selectedSector.label}
              </p>
              <h2>{isAiRelationshipMap ? 'AI 반도체 & 데이터센터 흐름도' : `${selectedAnchor.name} 기업 관계 지도`}</h2>
              <p className="topbar-subcopy">
                {isAiRelationshipMap
                  ? 'AI 서버 수요가 늘면 AI 칩, HBM 메모리, 파운드리, 장비, 서버, 전력·냉각 기업으로 관심이 이어질 수 있습니다.'
                  : selectedSector.description}
              </p>
              {selectedCompany && (
                <div className="selected-company-context">
                  <span>선택한 기업</span>
                  <strong>{selectedCompany.name}</strong>
                  {selectedCompany.id === selectedAnchor.id && <em>섹터 중심 기업</em>}
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
                disabled={!selectedIsMainListed}
                onClick={() => selectedCompany && openAnalysis(selectedCompany)}
              >
                <Database size={18} />
                {selectedIsMainListed ? '재무·공시' : '관계 참고용'}
              </button>
              <button type="button" className="icon-action text-action" onClick={() => setIsDetailCollapsed((current) => !current)}>
                <PanelRightOpen size={18} />
                {isDetailCollapsed ? '상세 열기' : '상세 접기'}
              </button>
              {selectedReportLink && selectedIsMainListed && (
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
              {selectedCompany && !selectedIsMainListed && <span className="topbar-reference-note">비상장 / 공시 확인 어려움</span>}
            </div>
          </header>

          {isAiRelationshipMap && (
            <section className="sector-flow-card" aria-label="AI 반도체와 데이터센터 핵심 흐름">
              <div className="sector-flow-copy">
                <span>시장 흐름 지도</span>
                <strong>AI 서버 수요가 어떤 기업으로 이어지는지 단계별로 정리했습니다.</strong>
                <p>직접 납품 관계가 확인되지 않은 경우에는 “수요 연결” 또는 “산업상 관련”으로 표시합니다.</p>
              </div>
              <div className="map-mode-strip" aria-label="지도 표시 모드">
                {flowModeOptions.map((option) => (
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
              <div className="flow-help-pills" aria-label="지도 사용 팁">
                <span>진한 선: 선택 기업 직접 관계</span>
                <span>연한 선: 보조 관계</span>
                <span>회사를 클릭하면 오른쪽에서 핵심 정보 확인</span>
              </div>
              <div className="market-flow-board" aria-label="AI 반도체와 데이터센터 단계형 흐름">
                {flowStageCards.map((stage) => (
                  <article key={stage.stage} className="market-flow-stage-card">
                    <div className="stage-heading">
                      <span>{stage.symbol}</span>
                      <strong>{stage.stage}</strong>
                    </div>
                    <p>{stage.summary}</p>
                    <div>
                      {stage.companies.map((company) => {
                        const role = companyRoleProfile(company);
                        const symbol = companySymbol(company);
                        return (
                          <button key={company.id} type="button" onClick={() => focusCompany(company.id)}>
                            <span className={`company-symbol small symbol-${symbol.tone}`} aria-hidden="true">{symbol.label}</span>
                            <span>
                              <strong>{company.name}</strong>
                              <small>{role.primary}</small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {stage.hiddenCount > 0 && (
                      <button type="button" className="stage-more-button" onClick={() => applyFlowViewMode('all')}>
                        {stage.hiddenCount}개 더보기
                      </button>
                    )}
                  </article>
                ))}
              </div>
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
                      return (
                        <article key={company.id} className="korea-listed-item">
                          <div>
                            <strong>{company.name}</strong>
                            <small>{marketDisplayLabel(company)} · {company.ticker ?? '티커 확인 필요'}</small>
                          </div>
                          <p>{companyBusinessSummary(company)}</p>
                          <span>{company.relationshipSummary ?? companyCustomerSummary(company)}</span>
                          <div className="korea-listed-actions">
                            <button type="button" onClick={() => openAnalysis(company)}>기업 해설 보기</button>
                            <button type="button" onClick={() => openCompanyMap(company)}>지도에서 보기</button>
                            <ReportAction reportLink={reportLink} className="mini-report-action" iconSize={13} />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {aiKoreaListedCompanies.length > aiKoreaListedPreview.length && (
                    <button type="button" className="support-more-button" onClick={() => applyFlowViewMode('kr')}>
                      한국 관련주 더 보기
                    </button>
                  )}
                </section>

                <section className="ai-finance-focus-card" aria-label="AI 반도체와 데이터센터에서 먼저 볼 재무지표">
                  <div className="support-card-head">
                    <span>먼저 볼 재무지표</span>
                    <strong>기업 종류마다 먼저 볼 숫자가 다릅니다</strong>
                    <p>값이 없으면 가짜 숫자를 만들지 않고, 지표 이름과 해석 기준만 안내합니다.</p>
                  </div>
                  <div className="ai-finance-focus-grid">
                    {aiFinancialFocusCards.map((item) => (
                      <article key={item.label}>
                        <strong>{item.label}</strong>
                        <div>
                          {item.metrics.map((metric) => <span key={metric}>{metric}</span>)}
                        </div>
                        <p>{item.note}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </section>
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
              <button type="button" onClick={fitVisibleMap}>화면 맞춤</button>
              <button type="button" onClick={() => selectedCompany && centerCompanyInMap(selectedCompany.id)}>초기 위치</button>
              {isAiRelationshipMap && <button type="button" onClick={showFullRelationshipMap}>전체 보기</button>}
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
              fitView
              fitViewOptions={{ padding: isAiRelationshipMap ? 0.18 : 0.2, duration: 420 }}
              minZoom={isAiRelationshipMap ? 0.24 : 0.32}
              maxZoom={isAiRelationshipMap ? 1.32 : 1.45}
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
              <Background color={isAiRelationshipMap ? '#eef2f7' : '#d1d5db'} gap={isAiRelationshipMap ? 36 : 22} />
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
        </main>

        <aside className="right-panel">
          {selectedCompany && selectedDisplayMetrics && (
            <>
              <div className="panel-heading">
                <div className="panel-title-row">
                  <span className={`company-symbol large symbol-${companySymbol(selectedCompany).tone}`} aria-hidden="true">
                    {companySymbol(selectedCompany).label}
                  </span>
                  <div>
                    <p className="eyebrow">현재 선택한 기업</p>
                    <h2>{selectedCompany.name}</h2>
                    <span>
                      {hasTradableTicker(selectedCompany) && selectedCompany.ticker ? `${selectedCompany.ticker} · ` : ''}
                      {marketDisplayLabel(selectedCompany)}
                    </span>
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
                  <span className={`scope-pill ${selectedIsMainListed ? 'listed' : 'reference'}`}>{companyScopeLabel(selectedCompany)}</span>
                  {selectedRole && <p className="role-explanation">{selectedRole.explanation}</p>}
                  <strong>{companyBusinessSummary(selectedCompany)}</strong>
                  <p>{companyScopeDetail(selectedCompany)}</p>
                  {selectedIsMainListed ? (
                    <button type="button" className="analysis-link-button" onClick={() => openAnalysis(selectedCompany)}>
                      <FileSearch size={15} />
                      기업 해설 보기
                    </button>
                  ) : (
                    <span className="reference-status-card">주가·기관 보유·공식 재무분석은 상장기업 중심으로 제공합니다.</span>
                  )}
                  {selectedReportLink && selectedIsMainListed && <ReportAction reportLink={selectedReportLink} className="analysis-link-button" iconSize={15} />}
                  {selectedReportLink && selectedIsMainListed && (
                    <div className={`report-state-note ${selectedReportLink.status}`}>
                      <strong>{selectedReportLink.statusLabel}</strong>
                      <span>{selectedReportLink.statusDetail}</span>
                    </div>
                  )}
                  <div className="summary-action-row">
                    {selectedIsMainListed && (
                      <button type="button" className="analysis-link-button" onClick={() => openAnalysis(selectedCompany)}>
                        <Database size={15} />
                        재무제표 해설 보기
                      </button>
                    )}
                    {isAiRelationshipMap && (
                      <button type="button" className="analysis-link-button" onClick={() => toggleCompanyExpansion(selectedCompany.id)}>
                        <Network size={15} />
                        {expandedCompanyIds.has(selectedCompany.id) ? '관계 접기' : '관련 기업 보기'}
                      </button>
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
                </div>
              </div>

              <div className="relationship-brief-grid" aria-label="선택 기업 핵심 관계">
                <article>
                  <span>무엇을 파는 회사인가</span>
                  <strong>{productText(selectedCompany)}</strong>
                  <p>{companyBusinessSummary(selectedCompany)}</p>
                </article>
                <article>
                  <span>누구 수요와 연결되는가</span>
                  <strong>{companyCustomerSummary(selectedCompany)}</strong>
                  <p>{companyCustomerExposure(selectedCompany)}</p>
                </article>
                <article>
                  <span>밸류체인 단계 <em>제품이 만들어지고 팔리기까지의 연결 구조</em></span>
                  <strong>{companyValueChainStage(selectedCompany)}</strong>
                  <p>{relationshipTypeLabel(selectedCompany)}</p>
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

              {selectedIsMainListed ? (
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
                  <strong>공식 재무정보 확인 어려움</strong>
                  <p>비상장 또는 공시 연결 전 기업은 출처 없는 매출·영업이익률·부채비율을 표시하지 않습니다.</p>
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
