import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import nvidiaReport from '../src/content/research-reports/nvidia.js';
import metaReport from '../src/content/research-reports/meta.js';
import { researchReportSlugs } from '../src/content/research-reports/registry.js';
import type { ResearchReportModel } from '../src/content/research-reports/types.js';
import nvidiaValuation from '../artifacts/phase-4a-valuation/nvidia/valuation-result.json' with { type: 'json' };
import metaValuation from '../artifacts/phase-4a-valuation/meta/valuation-result.json' with { type: 'json' };

const root = process.cwd();
const reports = [nvidiaReport, metaReport];
const storedValuations = [nvidiaValuation, metaValuation];
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
  return Object.values(report.sections).flat();
}

function validateReport(report: ResearchReportModel, stored: typeof nvidiaValuation) {
  assert(report.scenarios.length === 3, `${report.slug}: scenario count`);
  assert(report.waccGrowthSensitivity.cells.length === 25, `${report.slug}: WACC × g matrix must be 5x5`);
  assert(report.driverSensitivity.cells.length === 25, `${report.slug}: company driver matrix must be 5x5`);
  assert(report.charts.length >= 2 && report.charts.length <= 4, `${report.slug}: chart count outside 2-4`);
  assert(report.reverseDcf.converged, `${report.slug}: reverse DCF did not converge`);
  assert(report.reportDate !== report.priceAsOf.slice(0, 10), `${report.slug}: report and price dates must be explicit, not aliased`);

  closeTo(report.baseResult.estimatedValuePerShare, stored.result.estimatedValuePerShare, `${report.slug}: base per share`);
  closeTo(report.baseResult.enterpriseValue, stored.result.enterpriseValue, `${report.slug}: enterprise value`, 1e-5);
  closeTo(report.baseResult.equityBridge.equityValue, stored.result.equityBridge.equityValue, `${report.slug}: equity value`, 1e-5);
  closeTo(report.baseResult.wacc, stored.result.wacc, `${report.slug}: WACC`);
  closeTo(report.currentPrice, stored.currentPrice, `${report.slug}: current price`);

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
reports.forEach((report, index) => validateReport(report, storedValuations[index]));

const appSource = readFileSync(join(root, 'src', 'App.tsx'), 'utf8');
const routeSource = readFileSync(join(root, 'src', 'routes', 'ResearchReportRoute.tsx'), 'utf8');
const profileSource = readFileSync(join(root, 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
const cssSource = readFileSync(join(root, 'src', 'styles.css'), 'utf8');
assert(appSource.includes("lazy(() => import('./routes/ResearchReportRoute'))"), 'research report route is not lazy');
assert(appSource.includes('/^\\/ko\\/companies\\/([^/]+)\\/report\\/?$/'), 'canonical report route matcher missing');
assert(!profileSource.includes("content/research-reports"), 'dashboard bundle imports report content');
assert(profileSource.includes("profile.slug === 'nvidia' || profile.slug === 'meta'"), 'dashboard CTA scope is not exactly NVIDIA and Meta');
assert(routeSource.includes('window.print()'), 'print action missing');
assert(cssSource.includes('@page { size: A4; margin: 16mm 14mm 18mm; }'), 'A4 print margins missing');
assert(cssSource.includes('.research-screen-navigation,') && cssSource.includes('display: none !important'), 'print navigation hiding missing');

const counts = reports.map((report) => {
  const evidenceCounts = report.evidence.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.type] = (accumulator[item.type] ?? 0) + 1;
    return accumulator;
  }, {});
  return `${report.slug}: sources ${report.sources.length}, fact ${evidenceCounts.fact}, calculation ${evidenceCounts.calculation}, interpretation ${evidenceCounts.interpretation}`;
});
console.log(`✓ Research report registry ${researchReportSlugs.length}개 검증`);
console.log(`✓ 4A valuation numeric match, evidence integrity, route, print, forbidden terms 검증`);
counts.forEach((count) => console.log(`✓ ${count}`));
