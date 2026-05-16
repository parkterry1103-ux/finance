import { useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Database,
  ExternalLink,
  Factory,
  FileSearch,
  Filter,
  Globe2,
  LineChart,
  Network,
  Newspaper,
  PanelRightOpen,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
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
  links,
  RiskLevel,
  sectors,
  sourcePolicies,
} from './data';

type NodeData = {
  company: Company;
  isSelected: boolean;
  isDimmed: boolean;
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
  anchor: '앵커 기업',
  tier1: '1차 협력 기업',
  tier2: '하청·중소형 기업',
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

function SupplyNode({ data }: NodeProps<Node<NodeData>>) {
  const { company, isSelected, isDimmed } = data;
  const isAnchor = company.tier === 'anchor';
  const StatusIcon = company.status === 'opportunity' ? Sparkles : company.status === 'watch' ? ShieldAlert : CheckCircle2;

  return (
    <button
      className={[
        'supply-node',
        `tier-${company.tier}`,
        isSelected ? 'selected' : '',
        isDimmed ? 'dimmed' : '',
      ].join(' ')}
      type="button"
    >
      <Handle type="target" position={Position.Left} className="node-handle" />
      <div className="node-topline">
        <span className="node-tier">{tierLabels[company.tier]}</span>
        <span className={`risk-dot ${riskClass[company.riskLevel]}`} title={`리스크 ${riskLabels[company.riskLevel]}`} />
      </div>
      <div className="node-main">
        <span className="node-icon">{isAnchor ? <Building2 size={18} /> : <Factory size={18} />}</span>
        <span className="node-name">{company.name}</span>
      </div>
      <div className="node-meta">
        <span>{company.sector}</span>
        <StatusIcon size={14} />
      </div>
      <Handle type="source" position={Position.Right} className="node-handle" />
    </button>
  );
}

const nodeTypes = {
  supplyNode: SupplyNode,
};

function getNodePosition(company: Company) {
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
  return `/analysis?company=${encodeURIComponent(company.id)}`;
}

function externalDisclosureLinks(company: Company) {
  const keyword = encodeURIComponent(company.legalName || company.name);
  if (company.country === 'KR') {
    return [
      {
        label: 'DART 공시 통합검색',
        url: `https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=${keyword}`,
        note: '사업보고서, 감사보고서, 수주·증설 공시를 원문으로 확인합니다.',
      },
      {
        label: 'OpenDART 재무정보 API',
        url: 'https://opendart.fss.or.kr/guide/main.do?apiGrpCd=DE003',
        note: 'API 키를 연결하면 손익계산서·재무상태표·현금흐름표를 자동 수집할 수 있습니다.',
      },
    ];
  }

  return [
    {
      label: 'SEC Search Filings',
      url: `https://www.sec.gov/search-filings?keys=${keyword}`,
      note: '10-K, 10-Q, 8-K와 감사 재무제표 원문을 검색합니다.',
    },
    {
      label: 'SEC EDGAR 본문 검색',
      url: `https://www.sec.gov/edgar/search/#/q=${keyword}`,
      note: 'MD&A, Risk Factors, 재무제표 주석을 원문에서 확인합니다.',
    },
  ];
}

function newsSearchUrl(company: Company) {
  const query = encodeURIComponent(`${company.legalName || company.name} ${company.sector} 실적 투자 공시`);
  return `https://news.google.com/search?q=${query}`;
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
};

function getCompanyFilingAnalysis(company: Company) {
  return filingAnalyses[company.id];
}

function getDisplayMetrics(company: Company): CompanyDisplayMetrics {
  const filingAnalysis = getCompanyFilingAnalysis(company);
  if (filingAnalysis) {
    return filingAnalysis.displayMetrics;
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

function getFinancialInsights(company: Company) {
  const productText = company.products.slice(0, 2).join('·') || company.sector;
  const isKorea = company.country === 'KR';
  const filingSystem = isKorea ? 'DART' : 'SEC';
  const annualReport = isKorea ? '사업보고서' : '10-K';
  const auditText = isKorea ? '감사의견과 강조사항' : '감사의견과 내부통제 의견';

  return [
    {
      title: '손익계산서',
      kicker: '매출과 이익의 질',
      body: `${company.name}의 매출은 ${company.revenueUnit} 기준으로 봅니다. 매출이 늘어도 영업이익률이 같이 오르지 않으면 원재료비, 인건비, 고객 단가 압박을 의심해야 합니다.`,
      point: `${productText} 수요가 실제 매출로 이어지는지 ${annualReport}의 제품별 매출과 주석을 같이 봅니다.`,
    },
    {
      title: '현금흐름표',
      kicker: '돈이 실제로 들어왔는지',
      body: '영업활동현금흐름이 플러스면 장사가 현금으로 이어진다는 뜻입니다. 반대로 이익은 나는데 현금이 약하면 매출채권 회수나 재고 부담을 확인해야 합니다.',
      point: '투자활동현금흐름이 크게 마이너스면 나쁜 신호만은 아닙니다. 공장, 장비, 데이터센터 같은 대규모 증설 투자라면 다음 매출 사이클을 준비하는 지출일 수 있습니다.',
    },
    {
      title: '투자와 감가상각',
      kicker: '미래 비용과 절세 효과',
      body: '설비 투자는 한 번에 비용 처리되지 않고 여러 해에 걸쳐 감가상각비로 나뉘어 반영됩니다. 그래서 초기에는 현금이 나가지만 이후에는 현금 유출 없는 비용이 생깁니다.',
      point: '감가상각비는 회계상 비용이라 영업이익을 낮출 수 있지만, 과세소득을 줄여 세금 부담을 낮추는 효과도 있습니다. 투자 규모가 매출 증가로 연결되는지가 핵심입니다.',
    },
    {
      title: isKorea ? '감사기록' : 'MD&A',
      kicker: isKorea ? auditText : '경영진의 실적 해설',
      body: isKorea
        ? `${filingSystem}의 감사보고서에서 한정·부적정·의견거절, 계속기업 불확실성, 내부회계관리제도 지적이 있는지 먼저 봅니다. 초보 투자자는 이 부분만 확인해도 큰 회계 리스크를 줄일 수 있습니다.`
        : 'SEC 10-K의 MD&A는 경영진이 매출, 비용, 현금흐름 변화 이유를 직접 설명하는 구간입니다. 숫자보다 “왜 변했는지”를 한국어로 풀어 읽는 것이 중요합니다.',
      point: `${filingSystem} 원문에서 숫자, 주석, 경영진 설명이 같은 방향을 가리키는지 확인합니다.`,
    },
  ];
}

type AnalysisPageProps = {
  company: Company;
  anchor?: AnchorCompany;
  newsState: NewsState;
  onBack: () => void;
  onRefreshNews: () => void;
};

function AnalysisPage({ company, anchor, newsState, onBack, onRefreshNews }: AnalysisPageProps) {
  const disclosureLinks = externalDisclosureLinks(company);
  const filingAnalysis = getCompanyFilingAnalysis(company);
  const displayMetrics = getDisplayMetrics(company);
  const insights = filingAnalysis?.insights ?? getFinancialInsights(company);
  const isKorea = company.country === 'KR';
  const watchPoints =
    filingAnalysis?.watchPoints ?? [
      '투자활동현금흐름 감소가 설비투자라면 생산능력 확대와 감가상각비 증가를 함께 봅니다.',
      '감가상각비 증가는 단기 이익을 눌러도 현금 유출이 없는 비용이라 세금 부담 완화 효과가 생길 수 있습니다.',
      '매출 성장률은 전년 대비 기준을 우선 보고, 고객 집중도가 높으면 특정 고객 투자 사이클 의존도를 따로 봅니다.',
      isKorea ? '감사보고서의 강조사항과 내부회계관리제도 지적을 숫자보다 먼저 읽습니다.' : 'MD&A의 유동성, 자본지출, 리스크 요인을 숫자보다 먼저 읽습니다.',
    ];

  return (
    <div className="analysis-shell">
      <header className="analysis-hero">
        <button type="button" className="ghost-action" onClick={onBack}>
          <ArrowRight size={16} />
          대시보드로 돌아가기
        </button>
        <div>
          <p className="eyebrow">{filingAnalysis ? 'DART 원문 기반 재무제표 해석' : isKorea ? 'DART 재무제표 해설' : 'SEC 재무제표·MD&A 해설'}</p>
          <h1>{company.name} 재무분석</h1>
          <p>
            {filingAnalysis
              ? `${filingAnalysis.reportTitle} 숫자를 기준으로 손익, 현금흐름, 감사기록을 초보 투자자도 판단할 수 있게 해석합니다.`
              : `${company.sector} · ${anchor?.name ?? company.anchorCustomer} 공급망 후보를 초보 투자자도 읽을 수 있게 풀어봅니다.`}
          </p>
        </div>
        <div className="analysis-actions">
          {filingAnalysis && (
            <a href={filingAnalysis.sourceUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={15} />
              원문 보고서
            </a>
          )}
          {disclosureLinks.map((link) => (
            <a href={link.url} key={link.label} target="_blank" rel="noreferrer">
              <ExternalLink size={15} />
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <main className="analysis-grid">
        <section className="analysis-card analysis-summary">
          <div className="section-title">
            <CircleDollarSign size={16} />
            <span>공시 단위로 다시 보기</span>
          </div>
          <div className="statement-metrics">
            <div>
              <span>매출액</span>
              <strong>{displayMetrics.revenue}</strong>
              <small>{displayMetrics.revenueUnit}</small>
            </div>
            <div>
              <span>성장률</span>
              <strong>{displayMetrics.growth}</strong>
              <small>{displayMetrics.growthBasis}</small>
            </div>
            <div>
              <span>영업이익률</span>
              <strong>{displayMetrics.opMargin}</strong>
              <small>매출에서 영업비용을 뺀 본업 수익성</small>
            </div>
            <div>
              <span>부채비율</span>
              <strong>{displayMetrics.debtRatio}</strong>
              <small>자기자본 대비 빚의 부담</small>
            </div>
          </div>
          <p className="basis-note">{displayMetrics.revenueBasis}</p>
        </section>

        {filingAnalysis && (
          <section className="analysis-card filing-brief">
            <div className="section-title">
              <FileSearch size={16} />
              <span>공시 원문 해석</span>
            </div>
            <div className="filing-brief-body">
              <span>{filingAnalysis.reportDate}</span>
              <strong>{filingAnalysis.headline}</strong>
              <p>{filingAnalysis.verdict}</p>
              <a href={filingAnalysis.sourceUrl} target="_blank" rel="noreferrer">
                {filingAnalysis.sourceLabel}
                <ExternalLink size={14} />
              </a>
            </div>
          </section>
        )}

        <section className="analysis-card">
          <div className="section-title">
            <FileSearch size={16} />
            <span>원문 확인 루트</span>
          </div>
          <div className="disclosure-list">
            {disclosureLinks.map((link) => (
              <a href={link.url} key={link.label} target="_blank" rel="noreferrer">
                <strong>{link.label}</strong>
                <span>{link.note}</span>
                <ExternalLink size={14} />
              </a>
            ))}
            <a href={newsSearchUrl(company)} target="_blank" rel="noreferrer">
              <strong>관련 뉴스 검색</strong>
              <span>실적, 투자, 수주, 규제 뉴스를 원문 링크로 확인합니다.</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </section>

        <section className="analysis-card insight-wide">
          <div className="section-title">
            <BarChart3 size={16} />
            <span>{filingAnalysis ? '공시 숫자로 읽은 해석' : '쉬운 재무제표 해설'}</span>
          </div>
          <div className="insight-grid">
            {insights.map((insight) => (
              <article className="insight-card" key={insight.title}>
                <span>{insight.kicker}</span>
                <strong>{insight.title}</strong>
                <p>{insight.body}</p>
                <small>{insight.point}</small>
              </article>
            ))}
          </div>
        </section>

        {filingAnalysis && (
          <section className="analysis-card">
            <div className="section-title">
              <ShieldAlert size={16} />
              <span>감사·검토 기록</span>
            </div>
            <ul className="plain-list">
              {filingAnalysis.auditNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="analysis-card">
          <div className="section-title">
            <Target size={16} />
            <span>미래 반영 포인트</span>
          </div>
          <ul className="plain-list">
            {watchPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>

        <section className="analysis-card related-news">
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
                  <strong>이 뉴스가 있었습니다: {item.title}</strong>
                  <small>
                    {formatNewsDate(item.seendate)}
                    <ExternalLink size={12} />
                  </small>
                </a>
              ))}
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
  const [newsState, setNewsState] = useState<NewsState>({ status: 'idle', items: [] });
  const [newsRefreshKey, setNewsRefreshKey] = useState(0);
  const [route, setRoute] = useState(() => `${window.location.pathname}${window.location.search}`);

  const country = countries.find((item) => item.id === selectedCountry) ?? countries[0];
  const countrySectors = sectors.filter((sector) => sector.country === selectedCountry);
  const selectedSector = sectors.find((sector) => sector.id === selectedSectorId) ?? countrySectors[0];
  const topAnchors = anchors.filter((anchor) => anchor.sectorId === selectedSector.id).sort((a, b) => a.rank - b.rank);
  const selectedAnchor = anchors.find((anchor) => anchor.id === selectedAnchorId) ?? topAnchors[0];
  const groupCompanies = companies.filter((company) => company.anchorId === selectedAnchor.id);
  const groupLinks = links.filter((link) => link.anchorId === selectedAnchor.id);
  const visibleCompanies = getVisibleCompanies(selectedAnchor.id, query, riskFilter);
  const visibleIds = new Set(visibleCompanies.map((company) => company.id));
  const visibleLinks = groupLinks.filter((link) => visibleIds.has(link.source) && visibleIds.has(link.target));
  const selectedCompany =
    groupCompanies.find((company) => company.id === selectedCompanyId) ??
    visibleCompanies.find((company) => company.tier !== 'anchor') ??
    groupCompanies.find((company) => company.tier !== 'anchor') ??
    groupCompanies[0];
  const selectedOpinions = analystOpinions.filter((opinion) => opinion.companyId === selectedCompany?.id);
  const selectedDisplayMetrics = selectedCompany ? getDisplayMetrics(selectedCompany) : null;
  const connectedIds = selectedCompany ? getConnectedIds(selectedCompany.id, groupLinks) : new Set<string>();
  const filteredOutCount = groupCompanies.length - visibleCompanies.length;
  const opportunityCount = groupCompanies.filter((company) => company.status === 'opportunity').length;
  const highRiskCount = groupCompanies.filter((company) => company.riskLevel === 'high').length;
  const routePath = route.split('?')[0];
  const routeQuery = route.includes('?') ? route.slice(route.indexOf('?')) : '';
  const routeParams = new URLSearchParams(routeQuery);
  const routeCompany = companies.find((company) => company.id === routeParams.get('company'));
  const analysisCompany = routeCompany ?? selectedCompany;
  const analysisAnchor = analysisCompany ? anchors.find((anchor) => anchor.id === analysisCompany.anchorId) : undefined;
  const newsCompany = routePath === '/analysis' && analysisCompany ? analysisCompany : selectedCompany;
  const newsSector = routePath === '/analysis' && analysisCompany ? sectors.find((sector) => sector.id === analysisCompany.sectorId) ?? selectedSector : selectedSector;
  const newsAnchor = routePath === '/analysis' && analysisCompany ? analysisCompany.anchorId : selectedAnchor.id;
  const newsCountry = routePath === '/analysis' && analysisCompany ? analysisCompany.country : selectedCountry;

  useEffect(() => {
    const syncRoute = () => setRoute(`${window.location.pathname}${window.location.search}`);
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const flowNodes: Node<NodeData>[] = useMemo(
    () =>
      groupCompanies.map((company) => {
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
          },
        };
      }),
    [connectedIds, groupCompanies, selectedCompany, visibleIds],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      groupLinks.map((link) => {
        const isVisible = visibleLinks.some((visibleLink) => visibleLink.id === link.id);
        const isConnected = selectedCompany ? link.source === selectedCompany.id || link.target === selectedCompany.id : false;
        return {
          id: link.id,
          source: link.source,
          target: link.target,
          label: `${link.dependency}%`,
          animated: isConnected,
          type: 'smoothstep',
          className: [isVisible ? '' : 'edge-hidden', isConnected ? 'edge-active' : ''].join(' '),
          style: {
            strokeWidth: isConnected ? 3 : 2,
            stroke: isConnected ? '#2563eb' : '#9ca3af',
          },
          labelStyle: {
            fill: isConnected ? '#0057d9' : '#475569',
            fontWeight: isConnected ? 800 : 700,
            fontSize: 13,
          },
          labelBgStyle: {
            fill: '#f8fafc',
            fillOpacity: 1,
            stroke: isConnected ? '#7bb5ff' : '#d8dee8',
            strokeWidth: 1,
          },
          labelBgPadding: [11, 7],
          labelBgBorderRadius: 8,
        };
      }),
    [groupLinks, selectedCompany, visibleLinks],
  );

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

  function closeAnalysis() {
    window.history.pushState({}, '', '/');
    setRoute(`${window.location.pathname}${window.location.search}`);
  }

  function changeCountry(countryId: CountryId) {
    const nextSector = sectors.find((sector) => sector.country === countryId) ?? sectors[0];
    const nextAnchor = anchors.find((anchor) => anchor.sectorId === nextSector.id) ?? anchors[0];
    const nextCompany = companies.find((company) => company.anchorId === nextAnchor.id && company.tier !== 'anchor') ?? companies[0];
    setSelectedCountry(countryId);
    setSelectedSectorId(nextSector.id);
    setSelectedAnchorId(nextAnchor.id);
    setSelectedCompanyId(nextCompany.id);
    setQuery('');
    setRiskFilter('all');
  }

  function changeSector(sectorId: string) {
    const nextAnchor = anchors.find((anchor) => anchor.sectorId === sectorId) ?? anchors[0];
    const nextCompany = companies.find((company) => company.anchorId === nextAnchor.id && company.tier !== 'anchor') ?? companies[0];
    setSelectedSectorId(sectorId);
    setSelectedAnchorId(nextAnchor.id);
    setSelectedCompanyId(nextCompany.id);
    setQuery('');
    setRiskFilter('all');
  }

  function changeAnchor(anchorId: string) {
    const nextCompany = companies.find((company) => company.anchorId === anchorId && company.tier !== 'anchor') ?? companies[0];
    setSelectedAnchorId(anchorId);
    setSelectedCompanyId(nextCompany.id);
    setQuery('');
    setRiskFilter('all');
  }

  if (routePath === '/analysis' && analysisCompany) {
    return (
      <ReactFlowProvider>
        <AnalysisPage
          company={analysisCompany}
          anchor={analysisAnchor}
          newsState={newsState}
          onBack={closeAnalysis}
          onRefreshNews={() => setNewsRefreshKey((current) => current + 1)}
        />
      </ReactFlowProvider>
    );
  }

  return (
    <ReactFlowProvider>
      <div className="app-shell">
        <aside className="left-panel">
          <div className="brand-block">
            <div className="brand-mark">
              <Network size={22} />
            </div>
            <div>
              <p className="eyebrow">한국·미국 공급망 인텔리전스</p>
              <h1>섹터별 협력 후보 맵</h1>
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

          <div className="anchor-list">
            <div className="section-title">
              <Target size={16} />
              <span>섹터 기준 기업 3개</span>
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
            공급망 검색
          </label>
          <div className="search-box">
            <Search size={17} />
            <input
              id="company-search"
              type="search"
              placeholder="기업, 제품, 리스크, 소스"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

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

          <div className="metric-grid">
            <div className="metric">
              <span>앵커</span>
              <strong>3</strong>
            </div>
            <div className="metric">
              <span>하청 기업</span>
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
              <span>선택 앵커 공급망</span>
            </div>
            {visibleCompanies.map((company) => (
              <button
                className={`company-row ${selectedCompany?.id === company.id ? 'selected' : ''}`}
                key={company.id}
                onClick={() => setSelectedCompanyId(company.id)}
                type="button"
              >
                <span className={`tier-pill ${company.tier}`}>{tierLabels[company.tier]}</span>
                <span className="company-row-main">
                  <strong>{company.name}</strong>
                  <small>{company.sector}</small>
                </span>
                <span className={`risk-dot ${riskClass[company.riskLevel]}`} />
              </button>
            ))}
          </div>
        </aside>

        <main className="map-panel">
          <header className="topbar">
            <div>
              <p className="eyebrow">
                {country.label} · {selectedSector.label}
              </p>
              <h2>{selectedAnchor.name} 공급망</h2>
            </div>
            <div className="topbar-actions">
              <button type="button" className="icon-action" aria-label="공급망 맵">
                <Network size={18} />
              </button>
              <button
                type="button"
                className="icon-action"
                aria-label="재무제표 분석"
                onClick={() => selectedCompany && openAnalysis(selectedCompany)}
              >
                <Database size={18} />
              </button>
              <button type="button" className="primary-action">
                <Target size={17} />
                관심 기업 저장
              </button>
            </div>
          </header>

          <section className="graph-wrap" aria-label="공급망 관계도">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedCompanyId(node.id)}
              fitView
              minZoom={0.32}
              maxZoom={1.45}
              nodesDraggable={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#d1d5db" gap={22} />
              <Controls position="bottom-left" />
              <MiniMap
                position="bottom-right"
                nodeColor={(node) => {
                  const company = (node.data as NodeData).company;
                  if (company.tier === 'anchor') return '#1d4ed8';
                  if (company.riskLevel === 'high') return '#dc2626';
                  if (company.riskLevel === 'medium') return '#d97706';
                  return '#059669';
                }}
                maskColor="rgba(248, 250, 252, 0.74)"
              />
            </ReactFlow>
          </section>

          <section className="bottom-panel intelligence-panel">
            <div className="signal-strip">
              <div>
                <span className="signal-label">고객집중 경고</span>
                <strong>{groupCompanies.filter((company) => parseInt(company.customerConcentration, 10) >= 60).length}개</strong>
              </div>
              <div>
                <span className="signal-label">기회 기업</span>
                <strong>{opportunityCount}개</strong>
              </div>
              <div>
                <span className="signal-label">부채 부담</span>
                <strong>{groupCompanies.filter((company) => parseInt(company.debtRatio, 10) >= 100).length}개</strong>
              </div>
            </div>

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
                <div>
                  <p className="eyebrow">선택한 기업</p>
                  <h2>{selectedCompany.name}</h2>
                  <span>{selectedCompany.legalName}</span>
                </div>
                <span className={`risk-badge ${riskClass[selectedCompany.riskLevel]}`}>
                  리스크 {riskLabels[selectedCompany.riskLevel]}
                </span>
              </div>

              <div className="detail-card summary">
                <div className="summary-main">
                  <span className={`tier-pill ${selectedCompany.tier}`}>{tierLabels[selectedCompany.tier]}</span>
                  <strong>{selectedCompany.investmentView}</strong>
                  <p>{selectedCompany.notes}</p>
                  <button type="button" className="analysis-link-button" onClick={() => openAnalysis(selectedCompany)}>
                    <FileSearch size={15} />
                    재무제표 분석 열기
                  </button>
                </div>
              </div>

              <div className="finance-grid">
                <div className="finance-item">
                  <CircleDollarSign size={17} />
                  <span>매출</span>
                  <strong>{selectedDisplayMetrics.revenue}</strong>
                  <small>{selectedDisplayMetrics.revenueUnit}</small>
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
              <p className="finance-basis">{selectedDisplayMetrics.revenueBasis}</p>

              <div className="detail-card">
                <div className="section-title">
                  <FileSearch size={16} />
                  <span>애널리스트/리스크 의견</span>
                </div>
                <div className="opinion-list">
                  {selectedOpinions.map((opinion) => (
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
                    <dt>주요 고객</dt>
                    <dd>{selectedCompany.anchorCustomer}</dd>
                  </div>
                  <div>
                    <dt>고객집중도</dt>
                    <dd>{selectedCompany.customerConcentration}</dd>
                  </div>
                  <div>
                    <dt>소스 상태</dt>
                    <dd>{selectedCompany.sourceNote}</dd>
                  </div>
                  <div>
                    <dt>지역</dt>
                    <dd>{selectedCompany.region}</dd>
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
                      return (
                        <button key={link.id} type="button" onClick={() => setSelectedCompanyId(counterpartId)}>
                          <span>{counterpart?.name}</span>
                          <small>
                            {link.label} · {link.value}
                          </small>
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
