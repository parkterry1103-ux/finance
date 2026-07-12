import type {
  MarketMapDetailAction,
  MarketMapDetailActionKind,
  MarketMapDetailCompany,
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
