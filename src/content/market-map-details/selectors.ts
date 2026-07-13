import type {
  MarketMapDetailAction,
  MarketMapDetailActionKind,
  MarketMapDetailCompany,
  MarketMapGraphRegion,
  MarketMapGraphViewMode,
  MarketMapDetailViewMode,
  MarketMapDetailViewModel,
  MarketMapDetailViewModelInput,
} from './types.js';

const actionPriority: Record<MarketMapDetailActionKind, number> = {
  analysis: 0,
  financials: 1,
  pick: 2,
  flow: 3,
};

const statusAliases: Record<string, string> = {
  'Pick only': '관련 Pick 있음',
  '관련 Pick': '관련 Pick 있음',
  'Pick 연결': '관련 Pick 있음',
  '해설 준비 중': '기업 해설 준비 중',
  '대장주': '핵심 기업',
};

export function normalizeMarketMapStatusLabel(value: string) {
  return statusAliases[value.trim()] ?? value.trim();
}

export function selectMarketMapActions(actions: MarketMapDetailAction[], limit: 1 | 2) {
  return [...actions]
    .sort((first, second) => actionPriority[first.kind] - actionPriority[second.kind] || first.id.localeCompare(second.id))
    .filter((action, index, list) => list.findIndex((candidate) => candidate.kind === action.kind) === index)
    .slice(0, limit);
}

export function normalizeMarketMapCompany(company: MarketMapDetailCompany, actionLimit: 1 | 2): MarketMapDetailCompany {
  return {
    ...company,
    statusLabel: normalizeMarketMapStatusLabel(company.statusLabel),
    role: normalizeMarketMapStatusLabel(company.role),
    actions: selectMarketMapActions(company.actions, actionLimit),
  };
}

export function createMarketMapDetailViewModel(input: MarketMapDetailViewModelInput): MarketMapDetailViewModel {
  return {
    ...input,
    selectedCompany: normalizeMarketMapCompany(input.selectedCompany, 2),
    relatedCompanies: input.relatedCompanies.map((company) => normalizeMarketMapCompany(company, 1)),
    flowSteps: input.flowSteps.map((step) => ({
      ...step,
      items: step.items.slice(0, 5),
      representativeCompanies: step.representativeCompanies.slice(0, 2),
    })),
  };
}

export function resolveMarketMapCompanyQuery(
  companyIds: string[],
  aliases: Record<string, string>,
  requestedCompanyId: string | null | undefined,
  fallbackCompanyId: string,
) {
  if (!requestedCompanyId) return { companyId: fallbackCompanyId, didFallback: false };
  const resolvedCompanyId = aliases[requestedCompanyId] ?? requestedCompanyId;
  return companyIds.includes(resolvedCompanyId)
    ? { companyId: resolvedCompanyId, didFallback: false }
    : { companyId: fallbackCompanyId, didFallback: true };
}

export function marketMapGraphRegionForCountryLabel(countryLabel?: string | null): Exclude<MarketMapGraphRegion, 'all'> {
  const normalized = String(countryLabel ?? '').trim().toLowerCase();
  if (['미국', 'us', 'usa', 'united states'].includes(normalized)) return 'us';
  if (['한국', '대한민국', 'kr', 'korea', 'south korea'].includes(normalized)) return 'kr';
  return 'other';
}

export function resolveMarketMapGraphRegion(value?: string | null): MarketMapGraphRegion {
  return value === 'us' || value === 'kr' || value === 'other' ? value : 'all';
}

export function resolveMarketMapGraphViewMode(value?: string | null): MarketMapGraphViewMode {
  return value === 'fit' ? 'fit' : 'selected';
}

export function resolveMarketMapDetailViewMode(
  value?: string | null,
  hasCompanyQuery = false,
): MarketMapDetailViewMode {
  if (value === 'industry') return 'industry';
  if (value === 'companies' || hasCompanyQuery) return 'companies';
  return 'industry';
}

export function selectMarketMapGraphCompanyIds(
  companies: Array<{ id: string; countryLabel?: string | null }>,
  region: MarketMapGraphRegion,
) {
  return companies
    .filter((company) => region === 'all' || marketMapGraphRegionForCountryLabel(company.countryLabel) === region)
    .map((company) => company.id);
}

export function selectConnectedMarketMapNodeIds(
  selectedNodeId: string,
  edges: Array<{ source: string; target: string }>,
) {
  const ids = new Set([selectedNodeId]);
  edges.forEach((edge) => {
    if (edge.source === selectedNodeId) ids.add(edge.target);
    if (edge.target === selectedNodeId) ids.add(edge.source);
  });
  return [...ids];
}
