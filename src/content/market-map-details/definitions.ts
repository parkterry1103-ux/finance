import type {
  MarketMapCategory,
  MarketMapDefinition,
  MarketMapRegion,
} from './types.js';

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
    scopeLabel: '6단계 산업 흐름',
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
