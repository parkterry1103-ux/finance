import type { MarketMapCompanyRelation } from './types.js';
import { marketMapRelationTypeOrder } from './selectors.js';

export type MarketMapRelationValidationContext = {
  validMapIds: Set<string>;
  validCompanyIds: Set<string>;
  validSourceIds: Set<string>;
  officialSourceIds: Set<string>;
  now: Date;
};

export function validateMarketMapRelationRegistry(
  relations: MarketMapCompanyRelation[],
  context: MarketMapRelationValidationContext,
) {
  const issues: string[] = [];
  const ids = new Set<string>();
  const relationKeys = new Set<string>();
  const validEvidence = new Set(['confirmed', 'contextual', 'review-needed']);
  const validDirections = new Set(['directed', 'contextual']);

  relations.forEach((relation) => {
    if (ids.has(relation.id)) issues.push(`duplicate-id:${relation.id}`);
    ids.add(relation.id);
    if (!context.validMapIds.has(relation.mapId)) issues.push(`invalid-map:${relation.id}`);
    if (!context.validCompanyIds.has(relation.fromCompanyId)) issues.push(`invalid-from:${relation.id}`);
    if (!context.validCompanyIds.has(relation.toCompanyId)) issues.push(`invalid-to:${relation.id}`);
    if (relation.fromCompanyId === relation.toCompanyId) issues.push(`self-relation:${relation.id}`);
    if (!marketMapRelationTypeOrder.includes(relation.relationType)) issues.push(`invalid-type:${relation.id}`);
    if (!validEvidence.has(relation.evidenceLevel)) issues.push(`invalid-evidence:${relation.id}`);
    if (!validDirections.has(relation.direction)) issues.push(`invalid-direction:${relation.id}`);
    if (!relation.sourceRefs.length) issues.push(`missing-source:${relation.id}`);
    relation.sourceRefs.forEach((sourceId) => {
      if (!context.validSourceIds.has(sourceId)) issues.push(`invalid-source:${relation.id}:${sourceId}`);
    });
    if (!relation.shortLabel.trim() || !relation.explanation.trim() || !relation.caution.trim()) issues.push(`missing-copy:${relation.id}`);
    const reviewedAt = Date.parse(`${relation.reviewedAt}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(relation.reviewedAt) || Number.isNaN(reviewedAt)) issues.push(`invalid-reviewed-at:${relation.id}`);
    else if (reviewedAt > context.now.getTime()) issues.push(`future-reviewed-at:${relation.id}`);
    if ((relation.relationType === 'direct-contract' || relation.relationType === 'official-supply') && relation.evidenceLevel !== 'confirmed') {
      issues.push(`confirmed-type-evidence:${relation.id}`);
    }
    if (relation.evidenceLevel === 'confirmed' && !relation.sourceRefs.some((sourceId) => context.officialSourceIds.has(sourceId))) {
      issues.push(`confirmed-source:${relation.id}`);
    }
    if (relation.evidenceLevel === 'review-needed' && relation.relationType !== 'market-context') {
      issues.push(`review-needed-type:${relation.id}`);
    }
    if (relation.relationType === 'market-context' && relation.evidenceLevel === 'confirmed') issues.push(`context-confirmed:${relation.id}`);
    if (relation.relationType === 'market-context' && relation.direction !== 'contextual') issues.push(`context-direction:${relation.id}`);
    if (/https?:\/\//i.test(JSON.stringify(relation))) issues.push(`direct-url:${relation.id}`);
    const endpoints = relation.direction === 'contextual'
      ? [relation.fromCompanyId, relation.toCompanyId].sort().join('|')
      : `${relation.fromCompanyId}|${relation.toCompanyId}`;
    const relationKey = `${relation.mapId}|${endpoints}|${relation.relationType}`;
    if (relationKeys.has(relationKey)) issues.push(`duplicate-relation:${relation.id}`);
    relationKeys.add(relationKey);
  });

  return issues;
}
