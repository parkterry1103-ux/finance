import type {
  MarketMapCompanyRelation,
  MarketMapEvidenceLevel,
  MarketMapRelationDensity,
  MarketMapRelationFilterInput,
  MarketMapRelationGraphSelection,
  MarketMapRelationType,
  MarketMapRelationTypeFilter,
} from './types.js';

export const marketMapRelationTypeOrder: MarketMapRelationType[] = [
  'direct-contract',
  'official-supply',
  'demand-link',
  'production-link',
  'infrastructure-link',
  'market-context',
];

export const marketMapRelationTypeLabels: Record<MarketMapRelationType, string> = {
  'direct-contract': '직접 계약 확인',
  'official-supply': '공식 공급 관계',
  'demand-link': '수요 연관',
  'production-link': '생산 연관',
  'infrastructure-link': '인프라 연관',
  'market-context': '시장 흐름 참고',
};

export const marketMapEvidenceLevelLabels: Record<MarketMapEvidenceLevel, string> = {
  confirmed: '공식 확인',
  contextual: '산업 맥락',
  'review-needed': '추가 확인 필요',
};

export function marketMapRelationsForMap(relations: MarketMapCompanyRelation[], mapId: string) {
  return relations.filter((relation) => relation.mapId === mapId);
}

export function resolveMarketMapRelationDensity(value?: string | null): MarketMapRelationDensity {
  return value === 'all' ? 'all' : 'core';
}

export function resolveMarketMapRelationTypeFilter(value?: string | null): MarketMapRelationTypeFilter {
  return value && marketMapRelationTypeOrder.includes(value as MarketMapRelationType)
    ? value as MarketMapRelationType
    : 'all';
}

export function resolveMarketMapRelationQuery(
  value: string | null | undefined,
  relations: MarketMapCompanyRelation[],
) {
  if (!value) return null;
  return relations.some((relation) => relation.id === value) ? value : null;
}

export function filterMarketMapRelations(
  relations: MarketMapCompanyRelation[],
  input: MarketMapRelationFilterInput,
) {
  return relations
    .filter((relation) => input.relationType === 'all' || relation.relationType === input.relationType)
    .filter((relation) => input.density === 'all' || (
      relation.evidenceLevel !== 'review-needed'
      && (relation.fromCompanyId === input.selectedCompanyId || relation.toCompanyId === input.selectedCompanyId)
    ));
}

export function selectMarketMapRelationGraph(input: {
  relations: MarketMapCompanyRelation[];
  companyIds: string[];
  companyCountryById: Map<string, string>;
  selectedCompanyId: string;
  density: MarketMapRelationDensity;
  relationType: MarketMapRelationTypeFilter;
  region: 'all' | 'us' | 'kr' | 'other';
}): MarketMapRelationGraphSelection {
  const filteredRelations = filterMarketMapRelations(input.relations, input);
  const includedIds = new Set<string>([input.selectedCompanyId]);
  if (input.density === 'all' && input.relationType === 'all') {
    input.companyIds.forEach((companyId) => includedIds.add(companyId));
  } else {
    filteredRelations.forEach((relation) => {
      includedIds.add(relation.fromCompanyId);
      includedIds.add(relation.toCompanyId);
    });
  }
  const companyIds = input.companyIds.filter((companyId) => includedIds.has(companyId));
  const dimmedCompanyIds = companyIds.filter((companyId) => (
    companyId !== input.selectedCompanyId
    && input.region !== 'all'
    && input.companyCountryById.get(companyId) !== input.region
  ));
  return { relations: filteredRelations, companyIds, dimmedCompanyIds };
}

export function availableMarketMapRelationTypes(relations: MarketMapCompanyRelation[]) {
  const available = new Set(relations.map((relation) => relation.relationType));
  return marketMapRelationTypeOrder.filter((relationType) => available.has(relationType));
}

export function sortAccessibleMarketMapRelations(relations: MarketMapCompanyRelation[]) {
  const order = new Map(marketMapRelationTypeOrder.map((type, index) => [type, index]));
  return [...relations].sort((first, second) => (
    (order.get(first.relationType) ?? 99) - (order.get(second.relationType) ?? 99)
    || first.fromCompanyId.localeCompare(second.fromCompanyId)
    || first.toCompanyId.localeCompare(second.toCompanyId)
    || first.id.localeCompare(second.id)
  ));
}

export function isConfirmedRelationType(relationType: MarketMapRelationType) {
  return relationType === 'direct-contract' || relationType === 'official-supply';
}

export function selectMarketMapRelationSourceRefs(relation: MarketMapCompanyRelation, maximum = 3) {
  return relation.sourceRefs.slice(0, Math.max(0, maximum));
}
