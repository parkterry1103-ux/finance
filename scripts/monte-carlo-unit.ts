import { readFileSync } from 'node:fs';
import metaResultJson from '../src/content/monte-carlo/generated/meta.json' with { type: 'json' };
import nvidiaResultJson from '../src/content/monte-carlo/generated/nvidia.json' with { type: 'json' };
import metaReport from '../src/content/research-reports/meta.js';
import nvidiaReport from '../src/content/research-reports/nvidia.js';
import {
  createSeededRandom,
  quantile,
  runMonteCarlo,
  sampleTriangular,
  spearmanRankCorrelation,
  type MonteCarloCompanyConfig,
  type MonteCarloValuationResult,
} from '../src/domain/valuation/index.js';

const nvidiaResult = nvidiaResultJson as unknown as MonteCarloValuationResult;
const metaResult = metaResultJson as unknown as MonteCarloValuationResult;
const results = [nvidiaResult, metaResult];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function closeTo(actual: number, expected: number, message: string, tolerance = 1e-10) {
  assert(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);
}

const randomA = createSeededRandom(42);
const randomB = createSeededRandom(42);
const sequenceA = Array.from({ length: 12 }, () => randomA());
const sequenceB = Array.from({ length: 12 }, () => randomB());
assert(JSON.stringify(sequenceA) === JSON.stringify(sequenceB), 'seeded PRNG sequence changed');
assert(new Set(sequenceA).size === sequenceA.length, 'seeded PRNG fixture is degenerate');

const triangularRandom = createSeededRandom(20260717);
const triangularSamples = Array.from({ length: 10_000 }, () => sampleTriangular(triangularRandom, -0.1, 0.2, 0.5));
assert(triangularSamples.every((value) => value >= -0.1 && value <= 0.5), 'triangular sample escaped its bounds');
assert(Math.abs(quantile(triangularSamples, 0.5) - 0.2) < 0.04, 'triangular sample median is implausible');
closeTo(quantile([1, 2, 3, 4, 5], 0.5), 3, 'quantile median fixture');
closeTo(spearmanRankCorrelation([1, 2, 3, 4], [10, 20, 30, 40]), 1, 'positive Spearman fixture');
closeTo(spearmanRankCorrelation([1, 2, 3, 4], [40, 30, 20, 10]), -1, 'negative Spearman fixture');

results.forEach((result) => {
  assert(result.run.iterations === 50_000, `${result.companySlug}: final attempt count`);
  assert(result.run.validIterations + result.run.rejectedIterations === result.run.iterations, `${result.companySlug}: attempt reconciliation`);
  assert(result.run.rejectionRate <= 0.05, `${result.companySlug}: rejection rate above 5%`);
  assert(result.distributions.length >= 4 && result.distributions.length <= 7, `${result.companySlug}: distribution count`);
  assert(new Set(result.distributions.map((item) => item.assumptionId)).size === result.distributions.length, `${result.companySlug}: duplicate distribution`);
  result.distributions.forEach((item) => {
    assert(item.distribution === 'triangular', `${result.companySlug}: unsupported distribution`);
    assert(item.minimum <= item.mode && item.mode <= item.maximum, `${result.companySlug}: triangular bounds`);
    closeTo(item.mode, item.scenarioAnchors.base, `${result.companySlug}: base mode ${item.assumptionId}`);
    assert(item.rationale.length > 20 && item.sourceIds.length > 0 && item.affectedModelPaths.length > 0, `${result.companySlug}: distribution evidence ${item.assumptionId}`);
  });
  const orderedPercentiles = [result.percentiles.p5, result.percentiles.p10, result.percentiles.p25, result.percentiles.p50, result.percentiles.p75, result.percentiles.p90, result.percentiles.p95];
  assert(orderedPercentiles.every((value, index) => index === 0 || value >= orderedPercentiles[index - 1]), `${result.companySlug}: percentile order`);
  assert(result.convergence.map((point) => point.iterations).join(',') === '10000,25000,50000', `${result.companySlug}: convergence checkpoints`);
  assert(result.convergencePassed, `${result.companySlug}: convergence failed`);
  assert(Object.values(result.convergenceRelativeDifferences).every((value) => value <= 0.01), `${result.companySlug}: convergence relative difference`);
  assert(result.convergence.every((point) => point.topDriverIds.join(',') === result.convergence[0].topDriverIds.join(',')), `${result.companySlug}: top driver order unstable`);
  assert(result.currentMarketPrice?.asOfDate === result.valuationDate, `${result.companySlug}: price and valuation date mismatch`);
  assert((result.currentMarketPrice?.modelDistributionPercentile ?? -1) >= 0 && (result.currentMarketPrice?.modelDistributionPercentile ?? 101) <= 100, `${result.companySlug}: invalid market percentile`);
  assert(result.driverImportance.length === result.distributions.length, `${result.companySlug}: incomplete driver importance`);
  assert(result.driverImportance.every((item, index) => item.rank === index + 1 && Math.abs(item.spearmanCorrelation) <= 1), `${result.companySlug}: invalid Spearman output`);
  assert(result.terminalValueDiagnostics.medianShare <= result.terminalValueDiagnostics.p90Share, `${result.companySlug}: terminal share order`);
  assert(result.terminalValueDiagnostics.overEightyPercentShare >= 0 && result.terminalValueDiagnostics.overEightyPercentShare <= 1, `${result.companySlug}: terminal over-80 share`);
  assert(result.distributionAdjustments.length === 0, `${result.companySlug}: unsubstantiated news distribution adjustment`);
});

const reportPairs = [
  { report: nvidiaReport, result: nvidiaResult },
  { report: metaReport, result: metaResult },
];
reportPairs.forEach(({ report, result }) => {
  report.scenarios.forEach((scenario) => closeTo(
    result.deterministicComparison[scenario.name],
    scenario.result.estimatedValuePerShare,
    `${report.slug}: 4A deterministic regression ${scenario.name}`,
  ));
  closeTo(result.deterministicComparison.base, report.baseResult.estimatedValuePerShare, `${report.slug}: 4A base regression`);
});

const reproducibilityConfig: MonteCarloCompanyConfig = {
  run: { ...nvidiaResult.run, iterations: 25_000 },
  baseInput: structuredClone(nvidiaReport.baseInput),
  scenarios: nvidiaReport.scenarios.map((scenario) => ({ name: scenario.name, input: structuredClone(scenario.input) })),
  distributions: structuredClone(nvidiaResult.distributions),
  distributionAdjustments: [],
  currentMarketPrice: nvidiaResult.currentMarketPrice ? {
    value: nvidiaResult.currentMarketPrice.value,
    asOfDate: nvidiaResult.currentMarketPrice.asOfDate,
  } : undefined,
};
const reproducibilityA = runMonteCarlo(reproducibilityConfig).result;
const reproducibilityB = runMonteCarlo(reproducibilityConfig).result;
assert(JSON.stringify(reproducibilityA.percentiles) === JSON.stringify(reproducibilityB.percentiles), 'same seed did not reproduce percentiles');
assert(JSON.stringify(reproducibilityA.driverImportance) === JSON.stringify(reproducibilityB.driverImportance), 'same seed did not reproduce driver importance');

const domainSource = readFileSync('src/domain/valuation/monte-carlo.ts', 'utf8');
const routeSource = readFileSync('src/routes/ResearchReportRoute.tsx', 'utf8');
const registrySource = readFileSync('src/content/monte-carlo/registry.ts', 'utf8');
assert(!domainSource.includes('Math.random'), 'Monte Carlo domain uses Math.random');
assert(!routeSource.includes('runMonteCarlo'), 'browser route executes Monte Carlo');
assert(routeSource.includes('가치평가의 불확실성') && routeSource.includes('상세 가정·방법론'), 'required uncertainty UI missing');
['주가 상승 확률', '수익 확률', '손실 확률', '목표주가', '상승여력', '하락여력', 'BUY', 'HOLD', 'SELL'].forEach((term) => {
  assert(!routeSource.includes(term), `forbidden public term ${term}`);
});
assert(registrySource.includes("nvidia: () => import('./nvidia.js')"), 'NVIDIA Monte Carlo snapshot is not lazy');
assert(registrySource.includes("meta: () => import('./meta.js')"), 'Meta Monte Carlo snapshot is not lazy');

console.log('✓ Monte Carlo seeded PRNG, distributions, quantiles and Spearman fixtures');
console.log('✓ NVIDIA/Meta 50,000-attempt snapshots, convergence and terminal diagnostics');
console.log('✓ 4A deterministic regression and 25,000-attempt reproducibility rerun');
console.log('✓ static lazy-load and prohibited public-expression checks');
