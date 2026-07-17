import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import nvidiaReport from '../src/content/research-reports/nvidia.js';
import metaReport from '../src/content/research-reports/meta.js';
import { calculateModelGapRate, describeModelGap } from '../src/content/research-reports/build-report.js';
import { researchReportSlugs } from '../src/content/research-reports/registry.js';
import type { ResearchReportArtifactSet, ResearchReportModel } from '../src/content/research-reports/types.js';
import nvidiaValuation from '../artifacts/phase-4a-valuation/nvidia/valuation-result.json' with { type: 'json' };
import metaValuation from '../artifacts/phase-4a-valuation/meta/valuation-result.json' with { type: 'json' };
import nvidiaAssumptions from '../artifacts/phase-4a-valuation/nvidia/assumptions.json' with { type: 'json' };
import metaAssumptions from '../artifacts/phase-4a-valuation/meta/assumptions.json' with { type: 'json' };
import nvidiaReverse from '../artifacts/phase-4a-valuation/nvidia/reverse-dcf.json' with { type: 'json' };
import metaReverse from '../artifacts/phase-4a-valuation/meta/reverse-dcf.json' with { type: 'json' };

const root = process.cwd();
const reports = [nvidiaReport, metaReport];
const storedValuations = [nvidiaValuation, metaValuation];
const storedAssumptions = [nvidiaAssumptions, metaAssumptions];
const storedReverse = [nvidiaReverse, metaReverse];
const forbiddenTerms = [
  'BUY', 'HOLD', 'SELL', '목표주가', '적정주가', '적극 매수', '추천 종목', '유망주',
  '급등주', '수익 보장', '확실한 상승', '저평가 확정', '고평가 확정', '무조건',
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function closeTo(actual: number, expected: number, label: string, tolerance = 1e-8) {
  assert(Number.isFinite(actual), `${label}: non-finite result`);
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected}`);
}

function allClaims(report: ResearchReportModel) {
  return [
    ...Object.values(report.sections).flat(),
    ...report.executiveSummary.strengths,
    ...report.executiveSummary.risks,
    ...report.executiveSummary.nextChecks,
  ];
}

function validateReport(
  report: ResearchReportModel,
  stored: typeof nvidiaValuation,
  assumptions: ResearchReportArtifactSet['assumptions'],
  reverse: ResearchReportArtifactSet['reverse'],
) {
  assert(report.scenarios.length === 3, `${report.slug}: scenario count`);
  assert(report.glossary.length >= 4 && report.glossary.length <= 7, `${report.slug}: glossary count outside 4-7`);
  report.glossary.forEach((item) => {
    assert(Boolean(item.term && item.english && item.definition && item.easyExplanation && item.relevance), `${report.slug}: incomplete glossary item`);
  });
  Object.values(report.executiveSummary).forEach((items) => assert(items.length > 0 && items.length <= 3, `${report.slug}: executive summary count`));
  assert(report.waccGrowthSensitivity.cells.length === 25, `${report.slug}: WACC × g matrix must be 5x5`);
  assert(report.driverSensitivity.cells.length === 25, `${report.slug}: company driver matrix must be 5x5`);
  assert(report.charts.length >= 2 && report.charts.length <= 4, `${report.slug}: chart count outside 2-4`);
  assert(report.reverseDcf.converged, `${report.slug}: reverse DCF did not converge`);
  report.scenarios.forEach((scenario) => {
    assert(scenario.input.forecastAssumptions.years.length > 0, `${report.slug}: scenario forecast missing`);
    closeTo(scenario.result.dilutedShares, scenario.input.capitalStructure.dilutedShares, `${report.slug}: scenario shares`);
  });
  assert(report.reportDate !== report.priceAsOf.slice(0, 10), `${report.slug}: report and price dates must be explicit, not aliased`);
  assert(report.snapshot.version.length > 0, `${report.slug}: snapshot version missing`);
  assert(report.snapshot.newsCutoffAt.length > 0, `${report.slug}: news cutoff missing`);
  assert(report.snapshot.priceAsOf === report.priceAsOf, `${report.slug}: snapshot price mismatch`);
  assert(report.snapshot.financialDataAsOf === report.financialsAsOf, `${report.slug}: snapshot financial date mismatch`);
  assert(report.snapshot.valuationAsOf === report.valuationDate, `${report.slug}: snapshot valuation date mismatch`);
  assert(report.snapshot.benchmarkAsOf === report.benchmarkAsOf, `${report.slug}: snapshot benchmark date mismatch`);
  assert(report.judgments.length === 4, `${report.slug}: four current judgments required`);
  report.judgments.forEach((item) => {
    assert(Boolean(item.label && item.status && item.reason && item.changeCondition && item.evidenceIds.length), `${report.slug}: incomplete judgment ${item.label}`);
  });
  assert(report.materialNewsEvents.length > 0 && report.materialNewsEvents.length <= 3, `${report.slug}: material news count`);
  const newsIds = new Set(report.materialNewsEvents.map((event) => event.id));
  assert(newsIds.size === report.materialNewsEvents.length, `${report.slug}: duplicate material news`);
  report.materialNewsEvents.forEach((event) => {
    assert(event.publishedAt <= report.snapshot.newsCutoffAt.slice(0, 10), `${report.slug}: news after cutoff ${event.id}`);
    assert(Boolean(event.sourceId && event.whyItMatters && event.transmissionPath.length && event.watchItems.length), `${report.slug}: incomplete news analysis ${event.id}`);
    assert(event.affectedAssumptionIds.length + event.affectedMetricIds.length > 0, `${report.slug}: news without affected input ${event.id}`);
    assert(['confirmed', 'developing'].includes(event.confidence), `${report.slug}: invalid confidence ${event.id}`);
  });
  assert(report.moat.length >= 2, `${report.slug}: moat evidence missing`);
  report.moat.forEach((item) => assert(Boolean(item.source && item.evidence && item.earningsPath && item.weakeningCondition && item.nextMetric), `${report.slug}: incomplete moat ${item.source}`));
  assert(report.financialHealth.metrics.length >= 6, `${report.slug}: financial health metrics missing`);
  report.financialHealth.metrics.forEach((metric) => {
    assert(Number.isFinite(metric.value), `${report.slug}: invalid financial metric ${metric.label}`);
    assert(metric.sourceIds.length > 0, `${report.slug}: financial metric without source ${metric.label}`);
    assert(metric.metricIds.length > 0, `${report.slug}: financial metric without metric id ${metric.label}`);
  });
  assert(Boolean(report.cycleRole.role && report.cycleRole.changeCondition), `${report.slug}: cycle role incomplete`);
  assert(report.valuationMethod.name === 'Driver-based FCFF DCF', `${report.slug}: valuation method changed`);
  assert(report.valuationMethod.unusedMethods.length >= 2 && report.valuationMethod.unusedMethods.length <= 3, `${report.slug}: unused method count`);
  assert(report.benchmark.isDirectPeerMedian === false, `${report.slug}: industry aggregate mislabeled as peer median`);
  assert(report.benchmark.comparisons.length > 0, `${report.slug}: benchmark comparisons missing`);
  assert(report.newsValuationImpacts.length === report.materialNewsEvents.length, `${report.slug}: news valuation links incomplete`);
  report.newsValuationImpacts.forEach((impact) => assert(newsIds.has(impact.eventId), `${report.slug}: broken news valuation event ${impact.eventId}`));

  closeTo(report.baseResult.estimatedValuePerShare, stored.result.estimatedValuePerShare, `${report.slug}: base per share`);
  closeTo(report.baseResult.enterpriseValue, stored.result.enterpriseValue, `${report.slug}: enterprise value`, 1e-5);
  closeTo(report.baseResult.equityBridge.equityValue, stored.result.equityBridge.equityValue, `${report.slug}: equity value`, 1e-5);
  closeTo(report.baseResult.wacc, stored.result.wacc, `${report.slug}: WACC`);
  closeTo(report.currentPrice, stored.currentPrice, `${report.slug}: current price`);
  closeTo(report.baseInput.terminalAssumptions.stableGrowthRate, assumptions.baseInput.terminalAssumptions.stableGrowthRate, `${report.slug}: terminal growth`);
  closeTo(report.baseInput.terminalAssumptions.stableRoic ?? 0, assumptions.baseInput.terminalAssumptions.stableRoic ?? 0, `${report.slug}: terminal ROIC`);
  closeTo(report.reverseDcf.solvedRevenueCagr, reverse.result.solvedValue, `${report.slug}: reverse DCF`);
  closeTo(report.modelGapRate, report.currentPrice / report.baseResult.estimatedValuePerShare - 1, `${report.slug}: market/model gap`);
  assumptions.scenarioInputs.forEach((storedScenario) => {
    const scenario = report.scenarios.find((item) => item.name === storedScenario.name);
    assert(Boolean(scenario), `${report.slug}: missing scenario ${storedScenario.name}`);
  });

  const sourceIds = new Set(report.sources.map((source) => source.id));
  const evidenceIds = new Set(report.evidence.map((item) => item.id));
  assert(sourceIds.size === report.sources.length, `${report.slug}: duplicate source id`);
  assert(evidenceIds.size === report.evidence.length, `${report.slug}: duplicate evidence id`);
  report.evidence.forEach((item) => {
    assert(item.statement.trim().length > 0, `${report.slug}: empty evidence statement ${item.id}`);
    item.sourceIds.forEach((id) => assert(sourceIds.has(id), `${report.slug}: missing source ${id}`));
    item.dependsOnEvidenceIds?.forEach((id) => assert(evidenceIds.has(id), `${report.slug}: missing evidence dependency ${id}`));
    if (item.type === 'fact') assert(item.sourceIds.length > 0, `${report.slug}: fact without source ${item.id}`);
    if (item.type === 'calculation') assert(Boolean(item.formula || item.dependsOnEvidenceIds?.length), `${report.slug}: calculation without method ${item.id}`);
    if (item.type === 'interpretation') assert(Boolean(item.sourceIds.length || item.dependsOnEvidenceIds?.length), `${report.slug}: interpretation without evidence ${item.id}`);
  });
  report.materialNewsEvents.forEach((event) => assert(sourceIds.has(event.sourceId), `${report.slug}: material news source missing ${event.sourceId}`));
  report.financialHealth.metrics.forEach((metric) => metric.sourceIds.forEach((id) => assert(sourceIds.has(id), `${report.slug}: financial source missing ${id}`)));
  allClaims(report).forEach((claim) => {
    assert(claim.evidenceIds.length > 0, `${report.slug}: claim without evidence ${claim.title}`);
    claim.evidenceIds.forEach((id) => assert(evidenceIds.has(id), `${report.slug}: claim missing evidence ${id}`));
  });
  report.charts.forEach((chart) => chart.series.forEach((series) => series.points.forEach((point) => {
    assert(Number.isFinite(point.value), `${report.slug}: non-finite chart point`);
    assert(point.sourceIds.length > 0, `${report.slug}: chart point without source`);
    point.sourceIds.forEach((id) => assert(sourceIds.has(id), `${report.slug}: chart source missing ${id}`));
  })));
  const publicCopy = JSON.stringify({
    companyName: report.companyName,
    conclusion: report.conclusion,
    watchStatement: report.watchStatement,
    sections: report.sections,
    evidence: report.evidence.map(({ statement, formula }) => ({ statement, formula })),
    limitations: report.limitations,
  });
  forbiddenTerms.forEach((term) => assert(!publicCopy.includes(term), `${report.slug}: forbidden term ${term}`));
}

assert(researchReportSlugs.length === 2, `report registry must contain exactly 2 entries, received ${researchReportSlugs.length}`);
assert(JSON.stringify([...researchReportSlugs].sort()) === JSON.stringify(['meta', 'nvidia']), 'report registry slugs changed');
reports.forEach((report, index) => validateReport(
  report,
  storedValuations[index],
  storedAssumptions[index] as unknown as ResearchReportArtifactSet['assumptions'],
  storedReverse[index] as unknown as ResearchReportArtifactSet['reverse'],
));

closeTo(calculateModelGapRate(150, 120), 0.25, 'premium fixture');
closeTo(calculateModelGapRate(90, 120), -0.25, 'discount fixture');
closeTo(calculateModelGapRate(120, 120), 0, 'equal fixture');
assert(describeModelGap(0.25).includes('프리미엄'), 'premium label fixture');
assert(describeModelGap(-0.25).includes('할인'), 'discount label fixture');
assert(describeModelGap(0).includes('유사한 수준'), 'equal label fixture');

const appSource = readFileSync(join(root, 'src', 'App.tsx'), 'utf8');
const routeSource = readFileSync(join(root, 'src', 'routes', 'ResearchReportRoute.tsx'), 'utf8');
const profileSource = readFileSync(join(root, 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
const cssSource = readFileSync(join(root, 'src', 'styles.css'), 'utf8');
assert(appSource.includes("lazy(() => import('./routes/ResearchReportRoute'))"), 'research report route is not lazy');
assert(appSource.includes('/^\\/ko\\/companies\\/([^/]+)\\/report\\/?$/'), 'canonical report route matcher missing');
assert(!profileSource.includes("content/research-reports"), 'dashboard bundle imports report content');
assert(profileSource.includes('brief.reportSlug ?') && profileSource.includes('심층 리포트 읽기'), 'dashboard report CTA is not controlled by Company Brief');
const briefReportConfigs = ['nvidia', 'meta'].map((slug) => readFileSync(join(root, 'src', 'content', 'company-briefs', 'entries', `${slug}.ts`), 'utf8'));
assert(briefReportConfigs.every((source, index) => source.includes(`reportSlug: '${['nvidia', 'meta'][index]}'`)), 'dashboard CTA scope is not exactly NVIDIA and Meta');
assert(!routeSource.includes('window.print()'), 'print action must be removed');
assert(!routeSource.includes('Printer'), 'print icon must be removed');
assert(!routeSource.includes('인쇄·PDF 저장'), 'print/PDF label must be removed');
assert(routeSource.includes('왜 이 가치평가 방식을 사용했나요?'), 'valuation-method explanation missing');
assert(routeSource.includes('시장가격과 모형 가치의 차이'), 'market/model comparison missing');
assert(routeSource.includes('현재 가격에는 어떤 기대가 반영돼 있나요?'), 'required reverse DCF section title missing');
assert(routeSource.includes('산업 기준과 비교'), 'industry benchmark section missing');
assert(routeSource.includes('기준 가정'), 'sensitivity base-state text missing');
assert(!routeSource.includes("fact: '사실'"), 'public evidence label mapping must be removed');
assert(!routeSource.includes('EvidenceLedger'), 'public evidence ledger must be removed');
assert(cssSource.includes('.research-paragraph {') && cssSource.includes('min-width: 0;'), 'single-column paragraph width guard missing');
assert(cssSource.includes('word-break: keep-all;') && cssSource.includes('overflow-wrap: break-word;'), 'Korean wrapping guard missing');
assert(cssSource.includes('.research-citations { display: inline-flex;'), 'inline citations layout missing');
assert(!cssSource.includes('@page { size: A4;'), 'PDF-specific page sizing must be removed');

const counts = reports.map((report) => {
  const evidenceCounts = report.evidence.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.type] = (accumulator[item.type] ?? 0) + 1;
    return accumulator;
  }, {});
  return `${report.slug}: sources ${report.sources.length}, fact ${evidenceCounts.fact}, calculation ${evidenceCounts.calculation}, interpretation ${evidenceCounts.interpretation}`;
});
console.log(`✓ Research report registry ${researchReportSlugs.length}개 검증`);
console.log(`✓ 4A numeric match, current-context snapshot, evidence integrity, valuation UX 검증`);
counts.forEach((count) => console.log(`✓ ${count}`));
