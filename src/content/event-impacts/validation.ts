import { companyBriefSlugs } from '../company-briefs/registry.js';
import { financialMetricDefinitions } from '../financial-pivots/registry.js';
import { sourceRegistry } from '../sources/registry.js';
import { businessDriverById, businessDriverRegistry } from './drivers.js';
import { editorialImpactIndexEntries, loadAllEventImpacts, valuationAssumptionChanges } from './registry.js';
import type { EventImpactRecord, ValuationAssumptionChange } from './types.js';

const datePattern = /^\d{4}-\d{2}-\d{2}(?:T[^\s]+)?$/;
const updateStatuses = new Set(['scenario_updated', 'base_case_updated', 'thesis_revised']);

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

function validateChange(change: ValuationAssumptionChange, impactById: Map<string, EventImpactRecord>) {
  const errors: string[] = [];
  const prefix = `change ${change.id}`;
  const impact = impactById.get(change.impactId);
  if (!impact) errors.push(`${prefix}: broken impactId ${change.impactId}`);
  if (impact && impact.companySlug !== change.companySlug) errors.push(`${prefix}: companySlug mismatch`);
  if (impact && !impact.valuationAssumptionLinks.some((link) => link.assumptionId === change.assumptionId)) errors.push(`${prefix}: broken assumption link ${change.assumptionId}`);
  if (![change.beforeValue, change.afterValue].every(Number.isFinite)) errors.push(`${prefix}: NaN or Infinity`);
  if (change.beforeValue === change.afterValue) errors.push(`${prefix}: before and after values are identical`);
  if (!change.beforeModelVersion || !change.afterModelVersion || change.beforeModelVersion === change.afterModelVersion) errors.push(`${prefix}: model versions must change`);
  if (!change.rationale.trim() || !datePattern.test(change.changedAt)) errors.push(`${prefix}: change metadata missing`);
  if (!change.sourceIds.length || change.sourceIds.some((id) => !sourceRegistry[id])) errors.push(`${prefix}: broken source`);
  return errors;
}

export function validateEventImpactRecords(impacts: EventImpactRecord[], changes: ValuationAssumptionChange[] = valuationAssumptionChanges) {
  const errors: string[] = [];
  const supportedCompanies = new Set<string>(companyBriefSlugs);
  const metricIds = new Set(financialMetricDefinitions.map((metric) => metric.id));
  const ids = new Set<string>();
  const impactById = new Map(impacts.map((impact) => [impact.id, impact]));

  businessDriverRegistry.forEach((driver) => {
    if (!supportedCompanies.has(driver.companySlug)) errors.push(`driver ${driver.id}: unsupported companySlug`);
    if (!driver.label.trim() || !driver.description.trim()) errors.push(`driver ${driver.id}: empty copy`);
    if (!unique(driver.financialMetricIds) || driver.financialMetricIds.some((id) => !metricIds.has(id))) errors.push(`driver ${driver.id}: broken metric ID`);
    if (!unique(driver.valuationAssumptionIds)) errors.push(`driver ${driver.id}: duplicate assumption ID`);
  });

  impacts.forEach((impact) => {
    const prefix = `impact ${impact.id}`;
    if (ids.has(impact.id)) errors.push(`${prefix}: duplicate ID`);
    ids.add(impact.id);
    if (!supportedCompanies.has(impact.companySlug)) errors.push(`${prefix}: unsupported companySlug`);
    if (!impact.event.title.trim() || !impact.summary.trim()) errors.push(`${prefix}: empty event copy`);
    if (!datePattern.test(impact.event.eventAsOf) || !datePattern.test(impact.event.publishedAt)) errors.push(`${prefix}: invalid event date`);
    if (!impact.event.sourceIds.length || impact.event.sourceIds.some((id) => !sourceRegistry[id])) errors.push(`${prefix}: broken event source`);
    if (impact.reviewOrigin !== 'manual_research_review') errors.push(`${prefix}: automatic review origin prohibited`);
    if (!impact.confirmedFacts.length || !impact.unresolvedItems.length || !impact.watchItems.length) errors.push(`${prefix}: fact, unresolved, or watch inventory missing`);
    [...impact.confirmedFacts, ...impact.unresolvedItems].forEach((item) => {
      if (!item.id.trim() || !item.statement.trim() || !item.sourceIds.length || item.sourceIds.some((id) => !sourceRegistry[id])) errors.push(`${prefix}: broken evidence ${item.id}`);
    });
    if (impact.confirmedFacts.some((item) => item.confidence === 'unresolved')) errors.push(`${prefix}: confirmed fact marked unresolved`);
    if (impact.unresolvedItems.some((item) => item.confidence !== 'unresolved')) errors.push(`${prefix}: unresolved item confidence mismatch`);
    if (!unique(impact.businessDriverImpacts.map((item) => item.driverId))) errors.push(`${prefix}: duplicate business driver link`);
    impact.businessDriverImpacts.forEach((link) => {
      const driver = businessDriverById.get(link.driverId);
      if (!driver || driver.companySlug !== impact.companySlug) errors.push(`${prefix}: broken business driver ${link.driverId}`);
      if (!link.explanation.trim()) errors.push(`${prefix}: empty business driver explanation`);
    });
    if (!unique(impact.financialMetricLinks.map((item) => item.metricId))) errors.push(`${prefix}: duplicate financial metric link`);
    impact.financialMetricLinks.forEach((link) => {
      if (!metricIds.has(link.metricId)) errors.push(`${prefix}: broken financial metric ${link.metricId}`);
      if (!link.explanation.trim()) errors.push(`${prefix}: empty financial explanation`);
    });
    if (!unique(impact.valuationAssumptionLinks.map((item) => item.assumptionId))) errors.push(`${prefix}: duplicate valuation assumption link`);
    impact.valuationAssumptionLinks.forEach((link) => {
      if (!link.explanation.trim()) errors.push(`${prefix}: empty valuation explanation`);
    });
    if (impact.reviewStatus === 'pending' && impact.decision) errors.push(`${prefix}: pending review cannot have decision`);
    if (impact.reviewStatus !== 'pending' && impact.reviewStatus !== 'superseded' && !impact.decision) errors.push(`${prefix}: reviewed status requires decision`);
    if (impact.reviewStatus === 'reviewed_no_change') {
      if (!impact.decision?.beforeModelVersion || impact.decision.beforeModelVersion !== impact.decision.afterModelVersion) errors.push(`${prefix}: no-change model versions must match`);
      if (changes.some((change) => change.impactId === impact.id)) errors.push(`${prefix}: no-change review cannot have assumption change`);
    }
    if (updateStatuses.has(impact.reviewStatus) && !changes.some((change) => change.impactId === impact.id)) errors.push(`${prefix}: updated status requires assumption change`);
    if (impact.reviewStatus === 'scenario_updated' && impact.reviewStage === 'monitor_only') errors.push(`${prefix}: scenario update stage mismatch`);
    if (impact.reviewStatus === 'base_case_updated' && !['base_case_review', 'thesis_reassessment'].includes(impact.reviewStage)) errors.push(`${prefix}: base case update stage mismatch`);
    if (impact.reviewStatus === 'thesis_revised' && impact.reviewStage !== 'thesis_reassessment') errors.push(`${prefix}: thesis revision stage mismatch`);
    if (impact.reviewStatus === 'superseded' && (!impact.supersededById || !impactById.has(impact.supersededById))) errors.push(`${prefix}: supersededById missing or broken`);
    if (impact.decision && (!datePattern.test(impact.decision.reviewedAt) || !impact.decision.summary.trim())) errors.push(`${prefix}: decision metadata missing`);
  });

  if (!unique(changes.map((change) => change.id))) errors.push('duplicate valuation assumption change ID');
  changes.forEach((change) => errors.push(...validateChange(change, impactById)));

  editorialImpactIndexEntries().forEach(([editorialId, companySlug]) => {
    if (!impacts.some((impact) => impact.companySlug === companySlug && impact.event.editorialId === editorialId)) errors.push(`broken editorial impact index: ${editorialId}`);
  });
  return errors;
}

export async function validateEventImpactRegistry() {
  const impacts = await loadAllEventImpacts();
  return { impacts, changes: valuationAssumptionChanges, errors: validateEventImpactRecords(impacts) };
}
