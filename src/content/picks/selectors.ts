import type { StockAutopsyPick, WeeklyDigest, WeeklyDigestRecentItem } from '../../data.js';
import { legacyArchiveGroupCopy } from './legacy.js';
import { pickRegistry, resolvePick, stockAutopsyPicks } from './registry.js';
import type { ArchivedWeeklyPickGroup, WeeklyPickCollection } from './types.js';
import { weeklyPickCollections } from './weeks/index.js';

const archiveGroupCopy = [
  {
    id: 'previous-week',
    title: '지난주 Pick',
  },
  {
    id: 'two-weeks-ago',
    title: '그 이전 주 Pick',
  },
  {
    id: 'three-weeks-ago',
    title: '3주 전 Pick',
  },
] as const;

const currentWeeklyDigestShell = {
  headline: '이번 주 시장은 AI 인프라 수익화, 메모리 변동성, 데이터센터 소재, 반도체 클러스터 기대에 반응했습니다.',
  subheadline: 'SK하이닉스 급락은 확인된 주문 취소가 아니라 AI 과잉투자 우려와 수급 변동성을 따로 봅니다.',
  sourceNote: '정적 콘텐츠에는 가격·재무 숫자를 만들지 않고, 기준일은 가격 배지와 원문 링크로 확인합니다.',
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
      status: 'active',
      href: '/ko/category/datacenter-power-cooling',
      sectorId: 'datacenter-power-cooling',
      note: 'AI 서버가 늘 때 전력 관리, 냉각, HVAC, 운영 안정성이 함께 움직이는 흐름',
    },
    {
      title: '재건 / 인프라',
      status: 'active',
      href: '/ko/category/reconstruction-infrastructure',
      sectorId: 'reconstruction-infrastructure',
      note: '종전 기대감이 커질 때 시장이 보는 건설사, 중장비, 철강·소재 흐름입니다.',
      ctaLabel: '시장 지도 보기',
    },
    {
      title: '반도체 클러스터 / 산업단지 인프라',
      status: 'active',
      href: '/ko/category/semiconductor-cluster-infrastructure',
      sectorId: 'semiconductor-cluster-infrastructure',
      note: '반도체 공장이 들어서기 전 필요한 부지, 기초 공사, 전력, 건축·소재와 실제 발주 흐름을 살펴봅니다.',
      supportingNote: '정책 기대가 실제 예산·착공·공급계약과 실적으로 이어지는지는 따로 확인해야 합니다.',
      ctaLabel: '시장 지도 보기',
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
} satisfies Omit<WeeklyDigest, 'weekLabel' | 'kicker' | 'featuredPickId' | 'featured' | 'recentItems'>;

const featuredPickTemplates: Record<string, WeeklyDigest['featured']> = {
  'pick-sk-hynix-ai-overbuild-selloff': {
    marketLabel: '한국',
    theme: 'AI 메모리 / 변동성',
    question: 'SK하이닉스, 왜 하루 만에 14.57%나 빠졌을까?',
    meta: '000660.KS · KOSPI · HBM / AI 인프라',
    headline: '확인된 수요 감소가 아니라, AI 인프라 과잉투자 우려가 메모리주 밸류에이션을 흔들었습니다.',
    summary: 'Meta 클라우드 보도는 공식 출시가 아닌 보도 단계입니다. HBM 실적, 메모리 가격, 수급 변동성을 나눠 봅니다.',
    metricLabels: ['7월 2일 -14.57%', 'HBM / DRAM', '보도 단계 ≠ 공식 출시'],
    primaryCtaLabel: 'SK하이닉스 해부 보기',
    secondaryCtaLabel: '이번 주 Pick 전체 보기',
  },
  'pick-dongyang-pile-semiconductor-cluster-infrastructure': {
    marketLabel: '한국',
    theme: '정책 기대 / 산업단지 인프라',
    question: '반도체 회사가 아닌데 동양파일은 왜 상한가를 갔을까요?',
    meta: '228340.KQ · KOSDAQ · PHC 파일',
    headline: '반도체 생산 기대가 아니라, 반도체 공장과 산업단지를 짓는 인프라 기대가 움직였습니다.',
    summary: '정책 기대는 직접 수주가 아닙니다. 예산, 착공, 공급계약과 실적을 따로 확인해야 합니다.',
    metricLabels: ['6월 26일 +29.91%', 'PHC 파일', '정책 기대 ≠ 직접 수주'],
    primaryCtaLabel: '동양파일 해부 보기',
    secondaryCtaLabel: '이번 주 Pick 전체 보기',
  },
};

const currentWeeklyRecentItemTemplates: Record<string, Omit<WeeklyDigestRecentItem, 'pickId'>> = {
  'pick-sk-hynix-ai-overbuild-selloff': {
    id: 'weekly-sk-hynix-ai-overbuild-selloff',
    market: 'KR',
    theme: 'AI 메모리 / 변동성',
    movementLabel: 'AI 과잉투자 우려 / 7월 2일 -14.57%',
    question: 'SK하이닉스, 왜 하루 만에 14.57%나 빠졌을까?',
    summary: '공식 수요 감소가 아니라 Meta 관련 보도 이후 AI 인프라 투자 과열 우려가 메모리주로 번진 흐름입니다.',
    relatedCompanies: ['HBM', 'AI capex', '수급 변동성'],
  },
  'pick-meta-ai-compute-cloud-option': {
    id: 'weekly-meta-ai-compute-cloud-option',
    market: 'US',
    theme: 'AI 인프라 / 클라우드 옵션',
    movementLabel: 'AI 컴퓨팅 외부 판매 보도 / 7월 1일 +8.8%',
    question: 'Meta는 왜 AI 지출 부담이 클라우드 옵션으로 다시 읽혔을까?',
    summary: '대규모 AI 설비투자가 비용 부담에서 외부 판매 옵션으로 해석된 장면입니다.',
    relatedCompanies: ['Meta Compute', 'AI capex', 'cloud option'],
  },
  'pick-spolytech-datacenter-polycarbonate-ramp': {
    id: 'weekly-spolytech-datacenter-polycarbonate-ramp',
    market: 'KR',
    theme: '데이터센터 소재 / 엔지니어링 플라스틱',
    movementLabel: 'AI 데이터센터용 폴리카보네이트 양산 보도 / 6월 30일 +30.00%',
    question: '에스폴리텍, 데이터센터 소재 기대를 실적과 어떻게 나눠 봐야 할까?',
    summary: '데이터센터 냉각 소재 기대와 실제 반복 공급, 납품 규모, 마진 확인을 분리해서 봅니다.',
    relatedCompanies: ['폴리카보네이트', '냉각 격납', '소재 테마'],
  },
  'pick-kumho-enc-honam-cluster-volatility': {
    id: 'weekly-kumho-enc-honam-cluster-volatility',
    market: 'KR',
    theme: '건설 / 정책 기대 / 변동성',
    movementLabel: '호남 반도체 클러스터 기대 / 6월 29일 +29.86%',
    question: '금호건설, 호남 반도체 클러스터 기대를 직접 수주처럼 보면 안 되는 이유',
    summary: '정책 기대가 건설주로 번진 흐름이지만, 직접 계약과 실적 반영은 공시로 따로 확인해야 합니다.',
    relatedCompanies: ['호남 반도체 클러스터', '건설 발주', '시장경보'],
  },
  'pick-dongyang-pile-semiconductor-cluster-infrastructure': {
    id: 'weekly-dongyang-pile-semiconductor-cluster-infrastructure',
    market: 'KR',
    theme: '정책 기대 / 산업단지 인프라',
    movementLabel: '호남권 반도체 클러스터 기대 / 6월 26일 +29.91%',
    question: '반도체 회사가 아닌데 동양파일은 왜 상한가를 갔을까요?',
    summary: '반도체 생산이 아니라 공장과 산업단지를 짓는 인프라 기대를 봅니다.',
    relatedCompanies: ['PHC 파일', '산업단지 인프라', '정책 기대'],
  },
  'pick-kcc-silicone-margin-asset-value': {
    id: 'weekly-kcc-silicone-margin-asset-value',
    market: 'KR',
    theme: '실적 회복 / 자산가치',
    movementLabel: '실적·자산가치 재평가 / 6월 25일 +11.27%',
    question: 'KCC는 페인트 회사인데 왜 실리콘과 자산가치가 중요할까요?',
    summary: '실리콘 수익성, 도료 이익, 투자자산 가치와 주주환원 기대를 함께 봅니다.',
    relatedCompanies: ['실리콘 사업', '도료 사업', '투자자산'],
  },
  'pick-hertz-used-car-depreciation-financing': {
    id: 'weekly-hertz-used-car-depreciation-financing',
    market: 'US',
    theme: '감가상각 / 자금조달',
    movementLabel: '자금조달·잔존가치 부담 / 6월 24일 -40.71%',
    question: '렌터카 이용객이 줄어서 Hertz가 폭락한 걸까요?',
    summary: 'PIK 채권과 주식 관련 자금조달 조건, 차량 잔존가치 부담을 분리해서 봅니다.',
    relatedCompanies: ['PIK 채권', '주식 관련 자금조달', '중고차 가치'],
  },
  'pick-jeju-semiconductor-export-fabless-rally': {
    id: 'weekly-jeju-semiconductor-export-fabless-rally',
    market: 'KR',
    theme: '반도체 업황 / 팹리스',
    movementLabel: '반도체 수출 호조 / 6월 22일 +17.24%',
    question: '반도체가 좋아지면 삼성전자와 SK하이닉스만 오를까요?',
    summary: '반도체 수출 호조가 중소형 저전력 메모리 설계 기업 관심으로 확산된 흐름입니다.',
    relatedCompanies: ['저전력 메모리', '모바일·IoT·전장', '외부 파운드리'],
  },
};

export const sortedWeeklyPickCollections: WeeklyPickCollection[] = [...weeklyPickCollections].sort(
  (a, b) => Date.parse(b.weekOf) - Date.parse(a.weekOf),
);

export const currentWeeklyCollection = sortedWeeklyPickCollections[0];

if (!currentWeeklyCollection) {
  throw new Error('At least one weekly Pick collection is required.');
}

export const currentWeeklyPickOrder = currentWeeklyCollection.pickIds;
export const previousWeekArchivePickOrder = sortedWeeklyPickCollections[1]?.pickIds ?? [];

export const currentWeeklyPicks = currentWeeklyPickOrder.map(resolvePick);
export const representativePick = resolvePick(currentWeeklyCollection.representativePickId);
export const currentWeeklyPickIds = new Set(currentWeeklyPickOrder);

const allWeeklyPickIds = new Set(sortedWeeklyPickCollections.flatMap((week) => week.pickIds));

function sortPicksByPublishedAt(picks: StockAutopsyPick[]) {
  return [...picks].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

export const archivedStockAutopsyPicks = sortPicksByPublishedAt(
  stockAutopsyPicks.filter((pick) => !currentWeeklyPickIds.has(pick.id)),
);

export const legacyArchivePicks = sortPicksByPublishedAt(
  stockAutopsyPicks.filter((pick) => !allWeeklyPickIds.has(pick.id)),
);

export const legacyArchivePickIds = legacyArchivePicks.map((pick) => pick.id);

function fallbackFeaturedPick(pick: StockAutopsyPick): WeeklyDigest['featured'] {
  const marketLabel = pick.market === 'KR' ? '한국' : '미국';
  return {
    marketLabel,
    theme: pick.flowLabel ?? pick.sector,
    question: pick.title ?? `${pick.companyName} Pick`,
    meta: `${pick.ticker} · ${marketLabel} · ${pick.flowStage ?? pick.sector}`,
    headline: pick.oneLineConclusion ?? pick.beginnerSummary,
    summary: pick.reasonSummary,
    metricLabels: (pick.watchMetrics ?? []).slice(0, 3).map((metric) => metric.label),
    primaryCtaLabel: `${pick.companyName} 해부 보기`,
    secondaryCtaLabel: '이번 주 Pick 전체 보기',
  };
}

function weeklyRecentItemForPick(pick: StockAutopsyPick): WeeklyDigestRecentItem {
  const template = currentWeeklyRecentItemTemplates[pick.id];
  if (template) {
    return { ...template, pickId: pick.id };
  }

  return {
    id: `weekly-${pick.id.replace(/^pick-/, '')}`,
    pickId: pick.id,
    market: pick.market,
    theme: pick.flowLabel ?? pick.sector,
    movementLabel: pick.movementLabel,
    question: pick.title ?? `${pick.companyName} Pick`,
    summary: pick.beginnerSummary,
    relatedCompanies: (pick.relatedTradeTags ?? pick.connectedLeaders).slice(0, 3),
  };
}

function archiveGroupForWeek(week: WeeklyPickCollection, index: number): ArchivedWeeklyPickGroup {
  const copy = archiveGroupCopy[index];
  return {
    id: copy?.id ?? `week-${week.weekOf}`,
    weekOf: week.weekOf,
    label: week.label,
    title: copy?.title ?? `${week.label ?? week.weekOf} Pick`,
    description: week.archiveDescription ?? `${week.label ?? week.weekOf}에 다룬 시장 흐름입니다.`,
    picks: week.pickIds.map(resolvePick),
  };
}

const weeklyArchiveGroups = sortedWeeklyPickCollections
  .slice(1)
  .map(archiveGroupForWeek)
  .filter((group) => group.picks.length);

export const archivedWeeklyPickGroups: ArchivedWeeklyPickGroup[] = [
  ...weeklyArchiveGroups,
  ...(legacyArchivePicks.length
    ? [
        {
          ...legacyArchiveGroupCopy,
          picks: legacyArchivePicks,
        },
      ]
    : []),
];

export const archivedStockAutopsyPickGroups = archivedWeeklyPickGroups;

const currentWeekLabel = currentWeeklyCollection.label ?? currentWeeklyCollection.weekOf;

export const currentWeeklyDigest: WeeklyDigest = {
  weekLabel: currentWeekLabel,
  kicker: `${currentWeekLabel} 해부`,
  headline: currentWeeklyDigestShell.headline,
  subheadline: currentWeeklyDigestShell.subheadline,
  sourceNote: currentWeeklyDigestShell.sourceNote,
  featuredPickId: representativePick.id,
  featured: featuredPickTemplates[representativePick.id] ?? fallbackFeaturedPick(representativePick),
  recentItems: currentWeeklyPicks.map(weeklyRecentItemForPick),
  marketTabs: currentWeeklyDigestShell.marketTabs,
  marketMapItems: currentWeeklyDigestShell.marketMapItems,
};

export const weeklyDigest = currentWeeklyDigest;
