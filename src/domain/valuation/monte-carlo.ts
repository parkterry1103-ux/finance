import { runScenario } from './scenarios.js';
import { calculateTerminalReinvestmentRate } from './terminal-value.js';
import type { ScenarioName, ValuationModelInput, ValuationScenario } from './types.js';

export const monteCarloAssumptionIds = [
  'futureRevenueCagr',
  'normalizedOperatingMargin',
  'capexAsPercentRevenue',
  'workingCapitalAsPercentRevenue',
  'wacc',
  'terminalGrowth',
] as const;

export type MonteCarloAssumptionId = (typeof monteCarloAssumptionIds)[number];

export type AssumptionDistribution = {
  assumptionId: MonteCarloAssumptionId;
  label: string;
  unit: 'decimal';
  distribution: 'triangular';
  minimum: number;
  mode: number;
  maximum: number;
  scenarioAnchors: Record<ScenarioName, number>;
  rationale: string;
  sourceIds: string[];
  affectedModelPaths: string[];
};

export type DistributionAdjustment = {
  newsEventId: string;
  assumptionId: MonteCarloAssumptionId;
  previousDistribution: AssumptionDistribution;
  adjustedDistribution: AssumptionDistribution;
  reason: string;
  sourceIds: string[];
  effectiveAt: string;
  confidence: 'confirmed' | 'developing';
};

export type MonteCarloRunConfig = {
  seed: number;
  iterations: number;
  engineVersion: string;
  reportVersion: string;
  generatedAt: string;
};

export type MonteCarloDriverImportance = {
  assumptionId: MonteCarloAssumptionId;
  label: string;
  spearmanCorrelation: number;
  rank: number;
};

export type MonteCarloConvergencePoint = {
  iterations: number;
  validIterations: number;
  rejectedIterations: number;
  p10: number;
  p50: number;
  p90: number;
  mean: number;
  standardDeviation: number;
  topDriverIds: MonteCarloAssumptionId[];
};

export type MonteCarloHistogramBin = {
  lower: number;
  upper: number;
  count: number;
};

export type MonteCarloValuationResult = {
  companySlug: string;
  run: MonteCarloRunConfig & {
    validIterations: number;
    rejectedIterations: number;
    rejectionRate: number;
    rejectionReasons: Record<string, number>;
  };
  valuationDate: string;
  currency: string;
  distributions: AssumptionDistribution[];
  percentiles: {
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
  mean: number;
  standardDeviation: number;
  min: number;
  max: number;
  currentMarketPrice?: {
    value: number;
    asOfDate: string;
    modelDistributionPercentile: number;
  };
  deterministicComparison: Record<ScenarioName, number>;
  driverImportance: MonteCarloDriverImportance[];
  terminalValueDiagnostics: {
    medianShare: number;
    p90Share: number;
    overEightyPercentShare: number;
  };
  convergence: MonteCarloConvergencePoint[];
  convergencePassed: boolean;
  convergenceRelativeDifferences: { p10: number; p50: number; p90: number };
  histogram: MonteCarloHistogramBin[];
  distributionAdjustments: DistributionAdjustment[];
  warnings: string[];
  limitations: string[];
  sourceIds: string[];
};

export type MonteCarloCompanyConfig = {
  run: MonteCarloRunConfig;
  baseInput: ValuationModelInput;
  scenarios: ValuationScenario[];
  distributions: AssumptionDistribution[];
  distributionAdjustments: DistributionAdjustment[];
  currentMarketPrice?: { value: number; asOfDate: string };
};

export type MonteCarloSampleRow = {
  attempt: number;
  assumptions: Record<MonteCarloAssumptionId, number>;
  estimatedValuePerShare: number;
  terminalValueShare: number;
  terminalReinvestmentRate: number;
};

export type MonteCarloRunOutput = {
  result: MonteCarloValuationResult;
  samples: MonteCarloSampleRow[];
};

type RandomSource = () => number;

const distributionLabelById = new Map<MonteCarloAssumptionId, string>();

export function createSeededRandom(seed: number): RandomSource {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new Error('Monte Carlo seed must be an unsigned 32-bit integer.');
  }
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleTriangular(random: RandomSource, minimum: number, mode: number, maximum: number) {
  if (![minimum, mode, maximum].every(Number.isFinite) || minimum > mode || mode > maximum || minimum === maximum) {
    throw new Error('Triangular distribution requires finite minimum <= mode <= maximum and a non-zero range.');
  }
  const draw = random();
  const split = (mode - minimum) / (maximum - minimum);
  if (draw < split) return minimum + Math.sqrt(draw * (maximum - minimum) * (mode - minimum));
  return maximum - Math.sqrt((1 - draw) * (maximum - minimum) * (maximum - mode));
}

export function quantile(values: number[], probability: number) {
  if (!values.length) throw new Error('Cannot calculate a quantile from an empty sample.');
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) throw new Error('Quantile probability must be between 0 and 1.');
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[], mean = average(values)) {
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
}

function ranks(values: number[]) {
  const ordered = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const output = new Array<number>(values.length);
  let start = 0;
  while (start < ordered.length) {
    let end = start + 1;
    while (end < ordered.length && ordered[end].value === ordered[start].value) end += 1;
    const rank = (start + 1 + end) / 2;
    for (let index = start; index < end; index += 1) output[ordered[index].index] = rank;
    start = end;
  }
  return output;
}

export function spearmanRankCorrelation(first: number[], second: number[]) {
  if (first.length !== second.length || first.length < 2) throw new Error('Spearman inputs must have the same length of at least two.');
  const firstRanks = ranks(first);
  const secondRanks = ranks(second);
  const firstMean = average(firstRanks);
  const secondMean = average(secondRanks);
  let covariance = 0;
  let firstVariance = 0;
  let secondVariance = 0;
  for (let index = 0; index < firstRanks.length; index += 1) {
    const firstDelta = firstRanks[index] - firstMean;
    const secondDelta = secondRanks[index] - secondMean;
    covariance += firstDelta * secondDelta;
    firstVariance += firstDelta ** 2;
    secondVariance += secondDelta ** 2;
  }
  if (firstVariance === 0 || secondVariance === 0) return 0;
  return covariance / Math.sqrt(firstVariance * secondVariance);
}

function forecastRevenueCagr(input: ValuationModelInput) {
  const endingFactor = input.forecastAssumptions.years.reduce((factor, year) => factor * (1 + year.revenueGrowthRate), 1);
  return endingFactor ** (1 / input.forecastAssumptions.years.length) - 1;
}

function scenarioScalar(input: ValuationModelInput, assumptionId: MonteCarloAssumptionId) {
  const finalYear = input.forecastAssumptions.years[input.forecastAssumptions.years.length - 1]!;
  if (assumptionId === 'futureRevenueCagr') return forecastRevenueCagr(input);
  if (assumptionId === 'normalizedOperatingMargin') return finalYear.operatingMargin;
  if (assumptionId === 'capexAsPercentRevenue') return finalYear.capexAsPercentRevenue;
  if (assumptionId === 'workingCapitalAsPercentRevenue') return finalYear.changeInWorkingCapitalAsPercentRevenue;
  if (assumptionId === 'terminalGrowth') return input.terminalAssumptions.stableGrowthRate;
  const discount = input.discountRateAssumptions;
  const costOfEquity = discount.riskFreeRate + discount.leveredBeta * discount.equityRiskPremium + (discount.countryRiskPremium ?? 0);
  const afterTaxCostOfDebt = discount.preTaxCostOfDebt * (1 - discount.normalizedTaxRate);
  return costOfEquity * discount.equityWeight + afterTaxCostOfDebt * discount.debtWeight;
}

function interpolationPair(scenarios: ValuationScenario[], assumptionId: MonteCarloAssumptionId, sampledValue: number) {
  const points = scenarios
    .map((scenario) => ({ input: scenario.input, value: scenarioScalar(scenario.input, assumptionId) }))
    .sort((a, b) => a.value - b.value);
  const lower = sampledValue <= points[1].value ? points[0] : points[1];
  const upper = sampledValue <= points[1].value ? points[1] : points[2];
  const range = upper.value - lower.value;
  const ratio = range === 0 ? 0 : (sampledValue - lower.value) / range;
  return { lower: lower.input, upper: upper.input, ratio };
}

function interpolate(lower: number, upper: number, ratio: number) {
  return lower + (upper - lower) * ratio;
}

function applyForecastPath(
  input: ValuationModelInput,
  scenarios: ValuationScenario[],
  assumptionId: MonteCarloAssumptionId,
  sampledValue: number,
  property: 'revenueGrowthRate' | 'operatingMargin' | 'capexAsPercentRevenue' | 'changeInWorkingCapitalAsPercentRevenue',
) {
  const pair = interpolationPair(scenarios, assumptionId, sampledValue);
  input.forecastAssumptions.years.forEach((year, index) => {
    year[property] = interpolate(
      pair.lower.forecastAssumptions.years[index][property],
      pair.upper.forecastAssumptions.years[index][property],
      pair.ratio,
    );
  });
}

function buildSampleInput(config: MonteCarloCompanyConfig, assumptions: Record<MonteCarloAssumptionId, number>) {
  const input = structuredClone(config.baseInput);
  applyForecastPath(input, config.scenarios, 'futureRevenueCagr', assumptions.futureRevenueCagr, 'revenueGrowthRate');
  applyForecastPath(input, config.scenarios, 'normalizedOperatingMargin', assumptions.normalizedOperatingMargin, 'operatingMargin');
  applyForecastPath(input, config.scenarios, 'capexAsPercentRevenue', assumptions.capexAsPercentRevenue, 'capexAsPercentRevenue');
  applyForecastPath(input, config.scenarios, 'workingCapitalAsPercentRevenue', assumptions.workingCapitalAsPercentRevenue, 'changeInWorkingCapitalAsPercentRevenue');
  input.terminalAssumptions.stableGrowthRate = assumptions.terminalGrowth;

  const discount = input.discountRateAssumptions;
  const countryRisk = discount.countryRiskPremium ?? 0;
  const debtContribution = discount.preTaxCostOfDebt * (1 - discount.normalizedTaxRate) * discount.debtWeight;
  const baseEquityContribution = (discount.riskFreeRate + countryRisk) * discount.equityWeight;
  discount.leveredBeta = (assumptions.wacc - debtContribution - baseEquityContribution)
    / (discount.equityRiskPremium * discount.equityWeight);
  return input;
}

function validateDistributions(config: MonteCarloCompanyConfig) {
  if (config.run.iterations < 10_000) throw new Error('Monte Carlo runs require at least 10,000 iterations.');
  if (config.distributions.length < 4 || config.distributions.length > 7) throw new Error('Monte Carlo requires four to seven meaningful assumptions.');
  const ids = new Set(config.distributions.map((distribution) => distribution.assumptionId));
  if (ids.size !== config.distributions.length) throw new Error('Monte Carlo assumption IDs must be unique.');
  monteCarloAssumptionIds.forEach((id) => {
    if (!ids.has(id)) throw new Error(`Missing required Monte Carlo assumption ${id}.`);
  });
  config.distributions.forEach((distribution) => {
    if (distribution.distribution !== 'triangular') throw new Error(`Unsupported distribution for ${distribution.assumptionId}.`);
    if (distribution.minimum > distribution.mode || distribution.mode > distribution.maximum || distribution.minimum === distribution.maximum) {
      throw new Error(`Invalid triangular distribution for ${distribution.assumptionId}.`);
    }
    distributionLabelById.set(distribution.assumptionId, distribution.label);
  });
}

function rejectionReason(input: ValuationModelInput) {
  if (input.currency !== input.historicals[input.historicals.length - 1]?.currency) return 'currency-mismatch';
  if (input.capitalStructure.dilutedShares <= 0) return 'non-positive-diluted-shares';
  const years = input.forecastAssumptions.years;
  if (years.some((year) => !Object.values(year).every(Number.isFinite))) return 'non-finite-forecast';
  if (years.some((year) => year.revenueGrowthRate <= -1 || year.revenueGrowthRate > 2)) return 'economically-impossible-revenue-growth';
  if (years.some((year) => year.operatingMargin < 0 || year.operatingMargin > 0.85)) return 'operating-margin-outside-economic-range';
  if (years.some((year) => year.capexAsPercentRevenue < 0 || year.capexAsPercentRevenue > 0.75)) return 'capex-outside-economic-range';
  if (years.some((year) => year.changeInWorkingCapitalAsPercentRevenue < -0.25 || year.changeInWorkingCapitalAsPercentRevenue > 0.25)) return 'working-capital-outside-economic-range';
  const reinvestmentRate = calculateTerminalReinvestmentRate(
    input.terminalAssumptions.stableGrowthRate,
    input.terminalAssumptions.stableRoic,
  );
  if (reinvestmentRate !== null && (reinvestmentRate < 0 || reinvestmentRate > 1)) return 'terminal-reinvestment-outside-range';
  return null;
}

function summarize(values: number[]) {
  const mean = average(values);
  return {
    p5: quantile(values, 0.05),
    p10: quantile(values, 0.1),
    p25: quantile(values, 0.25),
    p50: quantile(values, 0.5),
    p75: quantile(values, 0.75),
    p90: quantile(values, 0.9),
    p95: quantile(values, 0.95),
    mean,
    standardDeviation: standardDeviation(values, mean),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function driverImportance(samples: MonteCarloSampleRow[]) {
  const results = samples.map((sample) => sample.estimatedValuePerShare);
  return monteCarloAssumptionIds
    .map((assumptionId) => ({
      assumptionId,
      label: distributionLabelById.get(assumptionId) ?? assumptionId,
      spearmanCorrelation: spearmanRankCorrelation(samples.map((sample) => sample.assumptions[assumptionId]), results),
      rank: 0,
    }))
    .sort((a, b) => Math.abs(b.spearmanCorrelation) - Math.abs(a.spearmanCorrelation))
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

function convergencePoint(samples: MonteCarloSampleRow[], attempts: number): MonteCarloConvergencePoint {
  const subset = samples.filter((sample) => sample.attempt <= attempts);
  const stats = summarize(subset.map((sample) => sample.estimatedValuePerShare));
  return {
    iterations: attempts,
    validIterations: subset.length,
    rejectedIterations: attempts - subset.length,
    p10: stats.p10,
    p50: stats.p50,
    p90: stats.p90,
    mean: stats.mean,
    standardDeviation: stats.standardDeviation,
    topDriverIds: driverImportance(subset).slice(0, 3).map((item) => item.assumptionId),
  };
}

function relativeDifference(first: number, second: number) {
  return second === 0 ? Math.abs(first - second) : Math.abs(first - second) / Math.abs(second);
}

function currentPricePercentile(values: number[], price: number) {
  const sorted = [...values].sort((a, b) => a - b);
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (sorted[middle] <= price) low = middle + 1;
    else high = middle;
  }
  return (low / sorted.length) * 100;
}

function buildHistogram(values: number[], binCount = 24) {
  const lower = quantile(values, 0.01);
  const upper = quantile(values, 0.99);
  const width = (upper - lower) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    lower: lower + index * width,
    upper: index === binCount - 1 ? upper : lower + (index + 1) * width,
    count: 0,
  }));
  values.forEach((value) => {
    if (value < lower || value > upper) return;
    const index = Math.min(Math.floor((value - lower) / width), binCount - 1);
    bins[index].count += 1;
  });
  return bins;
}

export function runMonteCarlo(config: MonteCarloCompanyConfig): MonteCarloRunOutput {
  validateDistributions(config);
  const random = createSeededRandom(config.run.seed);
  const samples: MonteCarloSampleRow[] = [];
  const rejectionReasons: Record<string, number> = {};

  for (let attempt = 1; attempt <= config.run.iterations; attempt += 1) {
    const assumptions = Object.fromEntries(config.distributions.map((distribution) => [
      distribution.assumptionId,
      sampleTriangular(random, distribution.minimum, distribution.mode, distribution.maximum),
    ])) as Record<MonteCarloAssumptionId, number>;
    const input = buildSampleInput(config, assumptions);
    let reason: string | null = null;
    try {
      reason = rejectionReason(input);
      if (reason) throw new Error(reason);
      const result = runScenario(input);
      const terminalReinvestmentRate = calculateTerminalReinvestmentRate(
        input.terminalAssumptions.stableGrowthRate,
        input.terminalAssumptions.stableRoic,
      ) ?? 0;
      const outputs = [result.estimatedValuePerShare, result.terminalValueShareOfEnterpriseValue, result.wacc, terminalReinvestmentRate];
      if (!outputs.every(Number.isFinite)) throw new Error('non-finite-valuation-output');
      if (result.estimatedValuePerShare <= 0) throw new Error('non-positive-equity-value');
      samples.push({
        attempt,
        assumptions,
        estimatedValuePerShare: result.estimatedValuePerShare,
        terminalValueShare: result.terminalValueShareOfEnterpriseValue,
        terminalReinvestmentRate,
      });
    } catch (error) {
      const message = reason ?? (error instanceof Error ? error.message : 'unknown-rejection');
      rejectionReasons[message] = (rejectionReasons[message] ?? 0) + 1;
    }
  }

  if (samples.length < 10_000) throw new Error(`Only ${samples.length} valid Monte Carlo samples were produced.`);
  const values = samples.map((sample) => sample.estimatedValuePerShare);
  const statistics = summarize(values);
  const importance = driverImportance(samples);
  const terminalShares = samples.map((sample) => sample.terminalValueShare);
  const convergenceIterations = [10_000, 25_000, config.run.iterations]
    .filter((value, index, list) => value <= config.run.iterations && list.indexOf(value) === index);
  const convergence = convergenceIterations.map((iterations) => convergencePoint(samples, iterations));
  const point25 = convergence.find((point) => point.iterations === 25_000);
  const pointFinal = convergence[convergence.length - 1]!;
  const convergenceRelativeDifferences = point25 ? {
    p10: relativeDifference(point25.p10, pointFinal.p10),
    p50: relativeDifference(point25.p50, pointFinal.p50),
    p90: relativeDifference(point25.p90, pointFinal.p90),
  } : { p10: Number.POSITIVE_INFINITY, p50: Number.POSITIVE_INFINITY, p90: Number.POSITIVE_INFINITY };
  const convergencePassed = Object.values(convergenceRelativeDifferences).every((difference) => difference <= 0.01);
  const rejectedIterations = config.run.iterations - samples.length;
  const rejectionRate = rejectedIterations / config.run.iterations;
  if (rejectionRate > 0.05) throw new Error(`Monte Carlo rejection rate ${(rejectionRate * 100).toFixed(2)}% exceeds 5%.`);
  if (!convergencePassed) throw new Error('25,000 and final-run P10/P50/P90 differ by more than 1%.');

  const deterministicComparison = Object.fromEntries(config.scenarios.map((scenario) => [
    scenario.name,
    runScenario(scenario.input).estimatedValuePerShare,
  ])) as Record<ScenarioName, number>;
  const warnings: string[] = [];
  const overEightyPercentShare = terminalShares.filter((share) => share > 0.8).length / terminalShares.length;
  if (overEightyPercentShare > 0.2) warnings.push('Terminal Value 비중이 80%를 넘는 표본이 20%보다 많아 장기 가정 의존도가 높습니다.');
  const currentMarketPrice = config.currentMarketPrice?.asOfDate === config.baseInput.valuationDate
    ? {
        ...config.currentMarketPrice,
        modelDistributionPercentile: currentPricePercentile(values, config.currentMarketPrice.value),
      }
    : undefined;
  if (config.currentMarketPrice && !currentMarketPrice) warnings.push('시장가격 기준일과 가치평가 기준일이 달라 모형 분포상 위치를 계산하지 않았습니다.');

  return {
    samples,
    result: {
      companySlug: config.baseInput.companySlug,
      run: {
        ...config.run,
        validIterations: samples.length,
        rejectedIterations,
        rejectionRate,
        rejectionReasons,
      },
      valuationDate: config.baseInput.valuationDate,
      currency: config.baseInput.currency,
      distributions: config.distributions,
      percentiles: {
        p5: statistics.p5,
        p10: statistics.p10,
        p25: statistics.p25,
        p50: statistics.p50,
        p75: statistics.p75,
        p90: statistics.p90,
        p95: statistics.p95,
      },
      mean: statistics.mean,
      standardDeviation: statistics.standardDeviation,
      min: statistics.min,
      max: statistics.max,
      currentMarketPrice,
      deterministicComparison,
      driverImportance: importance,
      terminalValueDiagnostics: {
        medianShare: quantile(terminalShares, 0.5),
        p90Share: quantile(terminalShares, 0.9),
        overEightyPercentShare,
      },
      convergence,
      convergencePassed,
      convergenceRelativeDifferences,
      histogram: buildHistogram(values),
      distributionAdjustments: config.distributionAdjustments,
      warnings,
      limitations: [
        '이 분포는 미래 주가 확률이 아니라 선택한 DCF 입력 범위가 만드는 모형 결과의 분포입니다.',
        '입력 범위는 4A 보수·기준·낙관 시나리오에 묶여 있으며 범위 밖 사건은 표현하지 않습니다.',
        'Terminal ROIC와 감가상각률은 세 시나리오가 동일해 임의 변동을 만들지 않았습니다.',
        '입력 간 완전한 현실 상관구조를 추정할 표본이 없어 각 분포를 독립 추출하되 4A의 연도별 경로를 보간했습니다.',
        'Spearman 순위상관은 모형 내부 영향도이며 실제 사업이나 시장가격의 인과관계를 뜻하지 않습니다.',
      ],
      sourceIds: [...new Set([
        ...config.distributions.flatMap((distribution) => distribution.sourceIds),
        ...config.distributionAdjustments.flatMap((adjustment) => adjustment.sourceIds),
      ])],
    },
  };
}
