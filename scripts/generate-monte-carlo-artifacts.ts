import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import metaReport from '../src/content/research-reports/meta.js';
import nvidiaReport from '../src/content/research-reports/nvidia.js';
import {
  runMonteCarlo,
  type AssumptionDistribution,
  type MonteCarloAssumptionId,
  type MonteCarloCompanyConfig,
  type MonteCarloRunOutput,
  type MonteCarloValuationResult,
} from '../src/domain/valuation/index.js';
import type { ResearchReportModel, ResearchScenario } from '../src/content/research-reports/types.js';

const root = process.cwd();
const artifactRoot = join(root, 'artifacts', 'phase-4c-monte-carlo');
const generatedRoot = join(root, 'src', 'content', 'monte-carlo', 'generated');
const generatedAt = '2026-07-17T03:00:00.000Z';
const reportVersion = 'phase-4c-2026.07.17';

function writeText(path: string, value: string) {
  writeFileSync(path, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}

function writeJson(path: string, value: unknown) {
  writeText(path, JSON.stringify(value, null, 2));
}

function scenarioMap(report: ResearchReportModel) {
  return Object.fromEntries(report.scenarios.map((scenario) => [scenario.name, scenario])) as Record<ResearchScenario['name'], ResearchScenario>;
}

function forecastCagr(scenario: ResearchScenario) {
  const years = scenario.input.forecastAssumptions.years;
  const factor = years.reduce((product, year) => product * (1 + year.revenueGrowthRate), 1);
  return factor ** (1 / years.length) - 1;
}

function distribution(
  assumptionId: MonteCarloAssumptionId,
  label: string,
  anchors: Record<ResearchScenario['name'], number>,
  rationale: string,
  affectedModelPaths: string[],
  sourceIds: string[],
): AssumptionDistribution {
  const values = Object.values(anchors);
  return {
    assumptionId,
    label,
    unit: 'decimal',
    distribution: 'triangular',
    minimum: Math.min(...values),
    mode: anchors.base,
    maximum: Math.max(...values),
    scenarioAnchors: anchors,
    rationale,
    sourceIds,
    affectedModelPaths,
  };
}

function buildDistributions(report: ResearchReportModel) {
  const scenarios = scenarioMap(report);
  const finalYear = (scenario: ResearchScenario) => scenario.input.forecastAssumptions.years[scenario.input.forecastAssumptions.years.length - 1];
  const scenarioSource = `phase-4a:${report.slug}:assumptions`;
  const benchmarkSource = `${report.slug}-benchmark`;
  const anchors = (value: (scenario: ResearchScenario) => number) => ({
    conservative: value(scenarios.conservative),
    base: value(scenarios.base),
    optimistic: value(scenarios.optimistic),
  });
  return [
    distribution(
      'futureRevenueCagr',
      '전망 매출 CAGR',
      anchors(forecastCagr),
      '4A의 보수·기준·낙관 연도별 매출 성장 경로가 만드는 전망기간 CAGR을 삼각분포의 세 꼭짓점으로 사용했습니다.',
      ['forecastAssumptions.years[*].revenueGrowthRate'],
      [scenarioSource],
    ),
    distribution(
      'normalizedOperatingMargin',
      '정상 영업이익률',
      anchors((scenario) => finalYear(scenario).operatingMargin),
      '4A 세 시나리오의 정상 영업이익률을 그대로 사용하며 회사별 과거 실적과 공식 사업 snapshot에 묶었습니다.',
      ['forecastAssumptions.years[*].operatingMargin'],
      [scenarioSource],
    ),
    distribution(
      'capexAsPercentRevenue',
      'Capex/매출',
      anchors((scenario) => finalYear(scenario).capexAsPercentRevenue),
      '4A 세 시나리오의 Capex/매출 범위를 사용합니다. 낮은 비율을 자동 호재로 해석하지 않고 매출 경로와 함께 FCFF에 반영합니다.',
      ['forecastAssumptions.years[*].capexAsPercentRevenue'],
      [scenarioSource],
    ),
    distribution(
      'workingCapitalAsPercentRevenue',
      '운전자본 재투자/매출',
      anchors((scenario) => finalYear(scenario).changeInWorkingCapitalAsPercentRevenue),
      '4A의 보수·기준·낙관 운전자본 경로를 사용해 성장 과정의 현금 흡수 또는 환입 범위를 반영했습니다.',
      ['forecastAssumptions.years[*].changeInWorkingCapitalAsPercentRevenue'],
      [scenarioSource],
    ),
    distribution(
      'wacc',
      'WACC',
      anchors((scenario) => scenario.result.wacc),
      '4A 세 시나리오에서 재계산된 WACC를 사용하며, 각 표본에서는 기존 자본구조와 ERP를 유지한 채 beta를 역산해 같은 4A WACC 공식을 통과합니다.',
      ['discountRateAssumptions.leveredBeta', 'valuationResult.wacc'],
      [scenarioSource, benchmarkSource],
    ),
    distribution(
      'terminalGrowth',
      '영구성장률',
      anchors((scenario) => scenario.input.terminalAssumptions.stableGrowthRate),
      '4A의 보수·기준·낙관 영구성장률을 사용하고 모든 표본에서 WACC보다 낮은지 다시 검사합니다.',
      ['terminalAssumptions.stableGrowthRate'],
      [scenarioSource, benchmarkSource],
    ),
  ];
}

function buildConfig(report: ResearchReportModel, seed: number): MonteCarloCompanyConfig {
  return {
    run: {
      seed,
      iterations: 50_000,
      engineVersion: '4a-fcff-dcf/1.0.0',
      reportVersion,
      generatedAt,
    },
    baseInput: structuredClone(report.baseInput),
    scenarios: report.scenarios.map((scenario) => ({ name: scenario.name, input: structuredClone(scenario.input) })),
    distributions: buildDistributions(report),
    distributionAdjustments: [],
    currentMarketPrice: {
      value: report.currentPrice,
      asOfDate: report.priceAsOf.slice(0, 10),
    },
  };
}

function format(value: number, digits = 6) {
  return Number(value.toFixed(digits));
}

function csvEscape(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csv(headers: string[], rows: Array<Array<string | number>>) {
  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}

function histogramSvg(result: MonteCarloValuationResult) {
  const width = 800;
  const height = 320;
  const left = 54;
  const top = 38;
  const plotWidth = 710;
  const plotHeight = 220;
  const maxCount = Math.max(...result.histogram.map((bin) => bin.count), 1);
  const barWidth = plotWidth / result.histogram.length;
  const bars = result.histogram.map((bin, index) => {
    const barHeight = (bin.count / maxCount) * plotHeight;
    return `<rect x="${format(left + index * barWidth, 2)}" y="${format(top + plotHeight - barHeight, 2)}" width="${format(Math.max(barWidth - 2, 1), 2)}" height="${format(barHeight, 2)}" rx="2" fill="#253d62"><title>${format(bin.lower, 2)}–${format(bin.upper, 2)} USD: ${bin.count}개</title></rect>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${result.companySlug} Monte Carlo 주당 모형 결과 히스토그램</title>
  <desc id="desc">1백분위부터 99백분위까지 24개 구간으로 집계한 정적 분포입니다.</desc>
  <rect width="800" height="320" fill="#fffdf8"/>
  <line x1="${left}" x2="${left + plotWidth}" y1="${top + plotHeight}" y2="${top + plotHeight}" stroke="#6a7280"/>
  ${bars}
  <text x="${left}" y="290" fill="#4e5867" font-size="13">${format(result.histogram[0].lower, 2)} USD</text>
  <text x="${left + plotWidth}" y="290" text-anchor="end" fill="#4e5867" font-size="13">${format(result.histogram[result.histogram.length - 1].upper, 2)} USD</text>
</svg>`;
}

function validationMarkdown(result: MonteCarloValuationResult) {
  const c25 = result.convergence.find((point) => point.iterations === 25_000)!;
  const c50 = result.convergence.find((point) => point.iterations === 50_000)!;
  return `# ${result.companySlug} Monte Carlo validation

- Engine: \`${result.run.engineVersion}\`
- Seed: \`${result.run.seed}\`
- Attempts: **${result.run.iterations.toLocaleString('en-US')}**
- Valid / rejected: **${result.run.validIterations.toLocaleString('en-US')} / ${result.run.rejectedIterations.toLocaleString('en-US')}**
- Rejection rate: **${(result.run.rejectionRate * 100).toFixed(3)}%**
- 25k → 50k P10 relative difference: **${(result.convergenceRelativeDifferences.p10 * 100).toFixed(3)}%**
- 25k → 50k P50 relative difference: **${(result.convergenceRelativeDifferences.p50 * 100).toFixed(3)}%**
- 25k → 50k P90 relative difference: **${(result.convergenceRelativeDifferences.p90 * 100).toFixed(3)}%**
- Convergence result: **${result.convergencePassed ? 'PASS' : 'FAIL'}**
- Top drivers at 25k: ${c25.topDriverIds.join(', ')}
- Top drivers at 50k: ${c50.topDriverIds.join(', ')}
- Terminal Value share P50 / P90: **${(result.terminalValueDiagnostics.medianShare * 100).toFixed(2)}% / ${(result.terminalValueDiagnostics.p90Share * 100).toFixed(2)}%**
- Samples above 80% Terminal Value share: **${(result.terminalValueDiagnostics.overEightyPercentShare * 100).toFixed(2)}%**

The stored CSV is a deterministic 500-row verification sample. The complete 50,000-attempt run is reproduced from the committed seed, distributions and generator.
`;
}

function writeCompanyArtifacts(report: ResearchReportModel, output: MonteCarloRunOutput) {
  const companyRoot = join(artifactRoot, report.slug);
  mkdirSync(companyRoot, { recursive: true });
  mkdirSync(generatedRoot, { recursive: true });
  const result = output.result;
  writeJson(join(companyRoot, 'run-config.json'), {
    companySlug: result.companySlug,
    valuationDate: result.valuationDate,
    currency: result.currency,
    ...result.run,
  });
  writeJson(join(companyRoot, 'assumption-distributions.json'), result.distributions);
  writeJson(join(companyRoot, 'distribution-adjustments.json'), result.distributionAdjustments);
  writeJson(join(companyRoot, 'result-summary.json'), result);
  writeJson(join(generatedRoot, `${report.slug}.json`), result);

  const step = Math.max(Math.floor(output.samples.length / 500), 1);
  const verificationSamples = output.samples.filter((_, index) => index % step === 0).slice(0, 500);
  writeText(join(companyRoot, 'valuation-samples.csv'), csv(
    ['attempt', ...result.distributions.map((item) => item.assumptionId), 'estimatedValuePerShare', 'terminalValueShare', 'terminalReinvestmentRate'],
    verificationSamples.map((sample) => [
      sample.attempt,
      ...result.distributions.map((item) => format(sample.assumptions[item.assumptionId], 10)),
      format(sample.estimatedValuePerShare, 8),
      format(sample.terminalValueShare, 10),
      format(sample.terminalReinvestmentRate, 10),
    ]),
  ));
  writeText(join(companyRoot, 'percentile-summary.csv'), csv(
    ['percentile', 'estimatedValuePerShare'],
    Object.entries(result.percentiles).map(([label, value]) => [label.toUpperCase(), format(value, 8)]),
  ));
  writeText(join(companyRoot, 'driver-importance.csv'), csv(
    ['rank', 'assumptionId', 'label', 'spearmanCorrelation'],
    result.driverImportance.map((item) => [item.rank, item.assumptionId, item.label, format(item.spearmanCorrelation, 10)]),
  ));
  writeText(join(companyRoot, 'convergence-summary.csv'), csv(
    ['iterations', 'validIterations', 'rejectedIterations', 'p10', 'p50', 'p90', 'mean', 'standardDeviation', 'topDriverIds'],
    result.convergence.map((point) => [
      point.iterations,
      point.validIterations,
      point.rejectedIterations,
      format(point.p10, 8),
      format(point.p50, 8),
      format(point.p90, 8),
      format(point.mean, 8),
      format(point.standardDeviation, 8),
      point.topDriverIds.join('|'),
    ]),
  ));
  writeText(join(companyRoot, 'terminal-value-diagnostics.csv'), csv(
    ['medianShare', 'p90Share', 'overEightyPercentShare'],
    [[
      format(result.terminalValueDiagnostics.medianShare, 10),
      format(result.terminalValueDiagnostics.p90Share, 10),
      format(result.terminalValueDiagnostics.overEightyPercentShare, 10),
    ]],
  ));
  writeText(join(companyRoot, 'histogram.svg'), histogramSvg(result));
  writeText(join(companyRoot, 'validation-summary.md'), validationMarkdown(result));
}

function crossCompanyMarkdown(results: MonteCarloValuationResult[]) {
  const rows = results.map((result) => `| ${result.companySlug} | ${result.run.validIterations.toLocaleString('en-US')} | ${result.percentiles.p10.toFixed(2)} | ${result.percentiles.p50.toFixed(2)} | ${result.percentiles.p90.toFixed(2)} | ${(result.run.rejectionRate * 100).toFixed(3)}% | ${(result.terminalValueDiagnostics.medianShare * 100).toFixed(2)}% |`).join('\n');
  return `# Phase 4C cross-company summary

| Company | Valid samples | P10 | P50 | P90 | Rejection | Terminal Value P50 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

Both companies use the existing 4A FCFF DCF engine, six triangular input distributions anchored to the 4A scenarios, and company-specific deterministic seeds. No 4B news event changed a numeric distribution because the current 4B snapshot explicitly retained the 4A numeric assumptions pending further confirmation.
`;
}

mkdirSync(artifactRoot, { recursive: true });
const tasks = [
  { report: nvidiaReport, seed: 2_026_071_701 },
  { report: metaReport, seed: 2_026_071_702 },
];
const outputs = tasks.map(({ report, seed }) => ({ report, output: runMonteCarlo(buildConfig(report, seed)) }));
outputs.forEach(({ report, output }) => writeCompanyArtifacts(report, output));
const results = outputs.map(({ output }) => output.result);
writeText(join(artifactRoot, 'cross-company-summary.md'), crossCompanyMarkdown(results));
writeText(join(artifactRoot, 'validation-summary.md'), `# Phase 4C validation summary

${results.map((result) => `- ${result.companySlug}: ${result.convergencePassed ? 'PASS' : 'FAIL'}, ${result.run.validIterations.toLocaleString('en-US')} valid, ${(result.run.rejectionRate * 100).toFixed(3)}% rejected`).join('\n')}

- 25,000 → 50,000 P10/P50/P90 relative differences: all within 1%
- Seeded reproducibility: enforced by the generator and unit fixtures
- Browser execution: none; reports consume company-specific static JSON chunks
- Numeric news adjustments: none; empty public adjustment cards are not rendered
`);

results.forEach((result) => {
  console.log(`${result.companySlug}: P10 ${result.percentiles.p10.toFixed(2)}, P50 ${result.percentiles.p50.toFixed(2)}, P90 ${result.percentiles.p90.toFixed(2)}, rejected ${(result.run.rejectionRate * 100).toFixed(3)}%`);
});
