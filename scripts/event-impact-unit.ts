import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadResearchReport } from '../src/content/research-reports/registry.js';
import {
  businessDriverRegistry,
  eventImpactCompanySlugs,
  loadAllEventImpacts,
  loadEditorialEventImpacts,
  loadEventImpacts,
  validateEventImpactRecords,
  validateEventImpactRegistry,
  valuationAssumptionChanges,
  type EventImpactRecord,
  type EventImpactReviewStage,
  type ValuationAssumptionChange,
} from '../src/content/event-impacts/index.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`event impact unit failed: ${label}`);
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

const validation = await validateEventImpactRegistry();
check(validation.errors.length === 0, `registry validation: ${validation.errors.join(' | ')}`);
check(eventImpactCompanySlugs.length === 3, 'three company-specific dynamic registries');
check(validation.impacts.length === 3, 'three source-backed production impact records');
check(new Set(validation.impacts.map((impact) => impact.id)).size === 3, 'impact IDs unique');
check(validation.impacts.every((impact) => impact.reviewOrigin === 'manual_research_review'), 'manual review origin only');
check(validation.impacts.every((impact) => impact.confirmedFacts.length >= 1 && impact.unresolvedItems.length >= 1), 'confirmed and unresolved separated');
check(validation.impacts.every((impact) => impact.businessDriverImpacts.length >= 1), 'business driver links present');
check(validation.impacts.reduce((sum, impact) => sum + impact.financialMetricLinks.length, 0) === 11, 'eleven financial metric links');
check(validation.impacts.reduce((sum, impact) => sum + impact.valuationAssumptionLinks.length, 0) === 10, 'ten valuation assumption review links');
check(validation.impacts.filter((impact) => impact.companySlug !== 'netflix').every((impact) => impact.reviewStatus === 'reviewed_no_change'), 'existing model reviews explicitly preserve base assumptions');
check(validation.impacts.find((impact) => impact.companySlug === 'netflix')?.reviewStatus === 'pending', 'Netflix scenario review remains pending without model mutation');
check(valuationAssumptionChanges.length === 0, 'zero production assumption changes');
check(validation.impacts.filter((impact) => impact.decision).every((impact) => impact.decision?.beforeModelVersion === impact.decision?.afterModelVersion), 'no-change model versions remain identical');
check(businessDriverRegistry.length === 9, 'nine normalized business drivers');
check((await loadEventImpacts('sk-hynix')).length === 0, 'unsupported impact company renders no section');
check((await loadEditorialEventImpacts('three-reads-2026-07-17-standards-set-price')).length === 0, 'published editorial without supported link renders no impact');

for (const slug of ['nvidia', 'meta'] as const) {
  const report = await loadResearchReport(slug);
  const impact = (await loadEventImpacts(slug))[0];
  check(Boolean(report && impact), `${slug} report and impact load`);
  if (!report || !impact) continue;
  const currentVersion = `${slug}-phase-5d-${report.snapshot.version}`;
  check(impact.decision?.beforeModelVersion === currentVersion && impact.decision.afterModelVersion === currentVersion, `${slug} decision tied to current model version`);
  check(impact.event.sourceIds.every((sourceId) => report.sources.some((source) => source.id === sourceId)), `${slug} impact source also exists in research report`);
}
check((await loadEventImpacts('netflix'))[0]?.event.editorialId === 'stock-2026-07-18-netflix-guidance-disclosure-reset', 'Netflix impact connects to published stock dissection');
check((await loadEditorialEventImpacts('stock-2026-07-18-netflix-guidance-disclosure-reset')).length === 1, 'editorial impact index loads Netflix review');

const base = validation.impacts.find((impact) => impact.companySlug === 'nvidia')!;
const netflixImpact = validation.impacts.find((impact) => impact.companySlug === 'netflix')!;
const stageFixtures: EventImpactRecord[] = (['monitor_only', 'scenario_review', 'base_case_review', 'thesis_reassessment'] as EventImpactReviewStage[]).map((stage, index) => ({
  ...clone(base),
  id: `stage-fixture-${stage}`,
  reviewStage: stage,
  reviewStatus: 'pending',
  decision: undefined,
  event: { ...clone(base.event), title: `stage fixture ${index + 1}` },
}));
check(validateEventImpactRecords([...stageFixtures, clone(netflixImpact)], []).length === 0, 'all four review stages accepted as pending fixtures');

const autoOrigin = { ...clone(base), reviewOrigin: 'automatic_editorial_update' } as unknown as EventImpactRecord;
check(validateEventImpactRecords([autoOrigin], []).some((error) => error.includes('automatic review origin prohibited')), 'automatic model mutation origin rejected');

const brokenSource = clone(base);
brokenSource.event.sourceIds = ['missing-source'];
check(validateEventImpactRecords([brokenSource], []).some((error) => error.includes('broken event source')), 'broken event source rejected');

const brokenMetric = clone(base);
brokenMetric.financialMetricLinks[0].metricId = 'totalAssets';
check(validateEventImpactRecords([brokenMetric], []).some((error) => error.includes('broken financial metric')), 'metric outside published Phase 5C definitions rejected');

const mixedFactState = clone(base);
mixedFactState.unresolvedItems[0].confidence = 'confirmed';
check(validateEventImpactRecords([mixedFactState], []).some((error) => error.includes('unresolved item confidence mismatch')), 'unresolved fact cannot be labeled confirmed');

const pendingWithDecision = clone(base);
pendingWithDecision.reviewStatus = 'pending';
check(validateEventImpactRecords([pendingWithDecision], []).some((error) => error.includes('pending review cannot have decision')), 'pending review decision rejected');

const falseNoChange = clone(base);
falseNoChange.decision!.afterModelVersion = 'nvidia-phase-5e-fabricated';
check(validateEventImpactRecords([falseNoChange], []).some((error) => error.includes('no-change model versions must match')), 'no-change status cannot hide model version change');

const updated = clone(base);
updated.id = 'scenario-update-fixture';
updated.reviewStatus = 'scenario_updated';
updated.decision = {
  reviewedAt: '2026-07-18',
  reviewedBy: 'owner',
  summary: 'unit fixture only',
  beforeModelVersion: 'fixture-v1',
  afterModelVersion: 'fixture-v2',
};
const validChange: ValuationAssumptionChange = {
  id: 'fixture-change',
  impactId: updated.id,
  companySlug: updated.companySlug,
  assumptionId: updated.valuationAssumptionLinks[0].assumptionId,
  changedAt: '2026-07-18',
  changedBy: 'owner',
  beforeValue: 0.2,
  afterValue: 0.21,
  unit: 'percent',
  beforeModelVersion: 'fixture-v1',
  afterModelVersion: 'fixture-v2',
  rationale: 'validation fixture only',
  sourceIds: [...updated.event.sourceIds],
};
check(validateEventImpactRecords([updated, clone(netflixImpact)], [validChange]).length === 0, 'explicit scenario update with complete before/after record accepted');
check(validateEventImpactRecords([updated], []).some((error) => error.includes('updated status requires assumption change')), 'updated status without change record rejected');
const nonFiniteChange = clone(validChange);
nonFiniteChange.afterValue = Number.NaN;
check(validateEventImpactRecords([updated], [nonFiniteChange]).some((error) => error.includes('NaN or Infinity')), 'non-finite assumption change rejected');

const allImpacts = await loadAllEventImpacts();
check(allImpacts.length === validation.impacts.length, 'all-impact loader inventory stable');
const registrySource = readFileSync(join(process.cwd(), 'src', 'content', 'event-impacts', 'registry.ts'), 'utf8');
check(registrySource.includes("import('./entries/nvidia.js')") && registrySource.includes("import('./entries/meta.js')") && registrySource.includes("import('./entries/netflix.js')"), 'company impact modules are dynamic imports');
const companiesRoute = readFileSync(join(process.cwd(), 'src', 'routes', 'CompaniesRoute.tsx'), 'utf8');
const financialRoute = readFileSync(join(process.cwd(), 'src', 'routes', 'FinancialPivotRoute.tsx'), 'utf8');
const valuationRoute = readFileSync(join(process.cwd(), 'src', 'routes', 'ValuationExpectationsRoute.tsx'), 'utf8');
const stockRoute = readFileSync(join(process.cwd(), 'src', 'routes', 'StockDissectionRoute.tsx'), 'utf8');
const threeReadsRoute = readFileSync(join(process.cwd(), 'src', 'routes', 'ThreeReadsRoute.tsx'), 'utf8');
const eventImpactUi = readFileSync(join(process.cwd(), 'src', 'components', 'event-impacts', 'EventImpactUi.tsx'), 'utf8');
const companyProfilesUi = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
check(companiesRoute.includes('loadEventImpacts') && companiesRoute.includes('CompanyResearchProfilePage'), 'company detail loads current-company impacts');
check(financialRoute.includes('FinancialMetricImpactRecords'), 'financial pivot links impacts to metric rows');
check(valuationRoute.includes('ValuationAssumptionReviewSection'), 'valuation route renders review records');
check(stockRoute.includes('loadEditorialEventImpacts') && threeReadsRoute.includes('loadEditorialEventImpacts'), 'editorial routes use conditional indexed impact loading');
check(eventImpactUi.includes('showValuationReview ?') && companyProfilesUi.includes('showValuationReview={Boolean(brief.reportSlug)}'), 'valuation review CTA only renders for full valuation companies');

console.log(`✓ Event impact unit ${checks}개 검증 · 사건 3 · 사업 동인 ${businessDriverRegistry.length} · 재무 연결 11 · 가정 검토 10 · 실제 변경 0`);
