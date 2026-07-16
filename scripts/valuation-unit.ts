import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildGrowthMarginSensitivity,
  buildTtm,
  calculateEquityValue,
  calculateFcff,
  calculatePerShareValue,
  calculateTerminalFcff,
  calculateTerminalValue,
  calculateWacc,
  deriveSingleQuarter,
  normalizeOpenDartRows,
  runScenario,
  runScenarios,
  selectPreferredFacts,
  solveReverseDcf,
  validateValuationInput,
  type NormalizedFinancialFact,
  type ValuationModelInput,
} from '../src/domain/valuation/index.js';
import { valuationReadinessCompanies } from '../src/content/valuation/companies.js';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function close(actual: number, expected: number, tolerance = 1e-8) {
  assert(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `expected ${expected}, received ${actual}`);
}

function expectError(action: () => unknown, pattern: RegExp) {
  try {
    action();
  } catch (error) {
    assert(pattern.test(error instanceof Error ? error.message : String(error)), `unexpected error: ${String(error)}`);
    return;
  }
  throw new Error(`Expected error matching ${pattern}.`);
}

const baseInput: ValuationModelInput = {
  companySlug: 'fixture-company',
  valuationDate: '2026-07-15',
  currency: 'USD',
  historicals: [{
    periodEnd: '2026-12-31',
    periodType: 'annual',
    fiscalYear: 2026,
    currency: 'USD',
    unit: 'million',
    metrics: { revenue: 100, operatingIncome: 20 },
    sourceIds: ['fixture-source'],
  }],
  forecastAssumptions: {
    years: [{
      year: 2027,
      revenueGrowthRate: 0.1,
      operatingMargin: 0.2,
      normalizedTaxRate: 0.25,
      depreciationAsPercentRevenue: 0.05,
      capexAsPercentRevenue: 0.07,
      changeInWorkingCapitalAsPercentRevenue: 0.02,
    }],
  },
  capitalStructure: { cash: 10, nonOperatingAssets: 2, debt: 20, leaseLiabilities: 3, minorityInterest: 1, otherClaims: 0, dilutedShares: 10 },
  discountRateAssumptions: {
    riskFreeRate: 0.04,
    equityRiskPremium: 0.05,
    leveredBeta: 1.2,
    preTaxCostOfDebt: 0.06,
    normalizedTaxRate: 0.25,
    equityWeight: 0.8,
    debtWeight: 0.2,
  },
  terminalAssumptions: { stableGrowthRate: 0.03, stableRoic: 0.15, exitMultiple: 12 },
  sources: ['fixture-source'],
};

const fcff = calculateFcff({ ebit: 22, normalizedTaxRate: 0.25, depreciationAndAmortization: 5.5, capitalExpenditure: 7.7, changeInWorkingCapital: 2.2 });
close(fcff.nopat, 16.5);
close(fcff.fcff, 12.1);

const wacc = calculateWacc(baseInput.discountRateAssumptions);
close(wacc.costOfEquity, 0.1);
close(wacc.afterTaxCostOfDebt, 0.045);
close(wacc.wacc, 0.089);

const terminalFcff = calculateTerminalFcff(22, 0.25, 0.03, 0.15);
close(terminalFcff, 13.596);
close(calculateTerminalValue(terminalFcff, 0.089, 0.03), terminalFcff / 0.059);
expectError(() => calculateTerminalValue(10, 0.03, 0.03), /WACC must be greater/);

const bridge = calculateEquityValue({ enterpriseValue: 100, cash: 10, nonOperatingAssets: 2, debt: 20, leaseLiabilities: 3, minorityInterest: 1 });
close(bridge.equityValue, 88);
close(calculatePerShareValue(bridge.equityValue, 10), 8.8);
expectError(() => calculatePerShareValue(10, 0), /greater than zero/);

const result = runScenario(baseInput);
close(result.forecast[0].revenue, 110);
close(result.forecast[0].fcff, 12.1);
assert(Number.isFinite(result.enterpriseValue) && Number.isFinite(result.estimatedValuePerShare), 'scenario result must be finite');
assert(result.sourceIds[0] === 'fixture-source', 'source provenance missing');

const scenarioResults = runScenarios([
  { name: 'conservative', input: { ...structuredClone(baseInput), forecastAssumptions: { years: [{ ...baseInput.forecastAssumptions.years[0], revenueGrowthRate: 0.05 }] } } },
  { name: 'base', input: structuredClone(baseInput) },
  { name: 'optimistic', input: { ...structuredClone(baseInput), forecastAssumptions: { years: [{ ...baseInput.forecastAssumptions.years[0], revenueGrowthRate: 0.15 }] } } },
]);
assert(scenarioResults.length === 3, 'three scenarios required');
assert(new Set(scenarioResults.map((scenario) => scenario.result.forecast[0].revenue)).size === 3, 'scenarios must recalculate different business assumptions');

const sensitivity = buildGrowthMarginSensitivity(baseInput, [0.05, 0.1, 0.15, 0.2, 0.25], [0.1, 0.15, 0.2, 0.25, 0.3]);
assert(sensitivity.cells.length === 25, '5x5 sensitivity matrix required');
assert(sensitivity.cells.every((cell) => cell.estimatedValuePerShare !== null), 'fixture sensitivity cells should calculate');

const reverse = solveReverseDcf({ input: baseInput, variable: 'revenueCagr', lowerBound: 0, upperBound: 0.2, currentPrice: result.estimatedValuePerShare, tolerance: 1e-9 });
assert(reverse.converged, 'reverse DCF should converge');
close(reverse.solvedValue, 0.1, 1e-7);
assert(reverse.relativeError <= 1e-9, 'reverse DCF reinsertion error exceeded tolerance');

const factBase: NormalizedFinancialFact = {
  companySlug: 'fixture-company',
  metricId: 'revenue',
  value: 100,
  currency: 'USD',
  unit: 'million',
  periodStart: '2025-01-01',
  periodEnd: '2025-12-31',
  periodType: 'annual',
  fiscalYear: 2025,
  sourceSystem: 'sec',
  sourceId: 'sec:old',
  filingType: '10-K',
  filedAt: '2026-02-01',
  accessionOrReceiptNumber: '0000000000-26-000001',
  taxonomyConcept: 'us-gaap:Revenues',
  statementType: 'incomeStatement',
  consolidation: 'consolidated',
  qualityStatus: 'ok',
};
const amended = { ...factBase, value: 110, sourceId: 'sec:amended', filingType: '10-K/A', filedAt: '2026-03-01' };
const preferred = selectPreferredFacts([factBase, amended]);
assert(preferred.facts.length === 1 && preferred.facts[0].value === 110, 'amendment should supersede original filing');
assert(preferred.facts[0].qualityStatus === 'restated', 'amended selection should be marked restated');
assert(preferred.audit.some((entry) => entry.action === 'excluded'), 'excluded duplicate context should be audited');

const dartCfs = normalizeOpenDartRows({
  rows: [{ account_id: 'ifrs-full_Revenue', account_nm: '매출액', sj_div: 'IS', thstrm_amount: '1,000,000,000', currency: 'KRW' }],
  companySlug: 'fixture-kr',
  periodStart: '2025-01-01',
  periodEnd: '2025-12-31',
  fiscalYear: 2025,
  reportCode: '11011',
  receiptNumber: '20260301000001',
  filedAt: '2026-03-01',
  fsDiv: 'CFS',
});
const dartOfsFact = { ...dartCfs.facts[0], value: 700, sourceId: 'opendart:separate', consolidation: 'separate' as const };
const dartPreferred = selectPreferredFacts([dartCfs.facts[0], dartOfsFact]);
assert(dartPreferred.facts.length === 1 && dartPreferred.facts[0].consolidation === 'consolidated', 'CFS must supersede OFS for the same period');

const ytdQ2 = { ...factBase, value: 70, periodStart: '2025-01-01', periodEnd: '2025-06-30', periodType: 'quarterly' as const, fiscalQuarter: 'Q2', sourceId: 'sec:q2-ytd' };
const ytdQ1 = { ...factBase, value: 30, periodStart: '2025-01-01', periodEnd: '2025-03-31', periodType: 'quarterly' as const, fiscalQuarter: 'Q1', sourceId: 'sec:q1' };
const q2 = deriveSingleQuarter(ytdQ2, ytdQ1, 'Q2').fact;
close(q2.value, 40);
const quarters = [1, 2, 3, 4].map((quarter) => ({ ...q2, value: quarter * 10, periodStart: `2025-0${(quarter - 1) * 3 + 1}-01`, periodEnd: `2025-${String(quarter * 3).padStart(2, '0')}-28`, fiscalQuarter: `Q${quarter}`, sourceId: `sec:q${quarter}` }));
close(buildTtm(quarters).value, 100);
expectError(() => buildTtm(quarters.slice(0, 3)), /exactly four/);

const mixedInput = structuredClone(baseInput);
mixedInput.historicals.push({ ...mixedInput.historicals[0], periodEnd: '2026-09-30', periodType: 'quarterly' });
expectError(() => validateValuationInput(mixedInput), /cannot be mixed/);
expectError(() => validateValuationInput(baseInput, { knownSourceIds: new Set(['different-source']) }), /Unknown valuation source ID/);

assert(valuationReadinessCompanies.length === 8, 'valuation registry must include eight companies');
assert(new Set(valuationReadinessCompanies.map((company) => company.companySlug)).size === 8, 'valuation company slugs must be unique');
assert(valuationReadinessCompanies.filter((company) => company.country === 'US').every((company) => /^\d+$/.test(company.cik ?? '')), 'US CIK mapping missing');
assert(valuationReadinessCompanies.filter((company) => company.country === 'KR').every((company) => /^\d{8}$/.test(company.corpCode ?? '')), 'Korean corp_code must preserve eight digits');

const artifactRoot = join(process.cwd(), 'artifacts', 'phase-4a-valuation');
const requiredRootFiles = ['valuation-readiness-summary.md', 'valuation-readiness.json', 'selected-pilots.md', 'benchmark-snapshot.json', 'validation-summary.md'];
requiredRootFiles.forEach((file) => assert(existsSync(join(artifactRoot, file)), `valuation artifact missing: ${file}`));
const readiness = JSON.parse(readFileSync(join(artifactRoot, 'valuation-readiness.json'), 'utf8')) as { companies?: unknown[] };
assert(readiness.companies?.length === 8, 'readiness artifact must include eight companies');
for (const slug of ['nvidia', 'meta']) {
  const directory = join(artifactRoot, slug);
  const requiredPilotFiles = ['normalized-historicals.csv', 'assumptions.json', 'fcff-forecast.csv', 'valuation-result.json', 'scenario-summary.csv', 'wacc-growth-sensitivity.csv', 'driver-sensitivity.csv', 'reverse-dcf.json', 'sources.json', 'warnings.json'];
  requiredPilotFiles.forEach((file) => assert(existsSync(join(directory, file)), `${slug} artifact missing: ${file}`));
  const combined = requiredPilotFiles.map((file) => readFileSync(join(directory, file), 'utf8')).join('\n');
  assert(!/NaN|Infinity|undefined/.test(combined), `${slug} artifact contains a non-finite or undefined value`);
  assert(!/targetPrice/.test(combined), `${slug} artifact uses forbidden targetPrice field`);
  const sources = JSON.parse(readFileSync(join(directory, 'sources.json'), 'utf8')) as Array<{ sourceId?: string }>;
  const resultPayload = JSON.parse(readFileSync(join(directory, 'valuation-result.json'), 'utf8')) as { result?: { sourceIds?: string[] } };
  const sourceIds = new Set(sources.map((source) => source.sourceId));
  assert(resultPayload.result?.sourceIds?.every((sourceId) => sourceIds.has(sourceId)), `${slug} result contains a broken source ID`);
  const reversePayload = JSON.parse(readFileSync(join(directory, 'reverse-dcf.json'), 'utf8')) as { result?: { converged?: boolean; relativeError?: number } };
  assert(reversePayload.result?.converged && (reversePayload.result.relativeError ?? 1) < 1e-6, `${slug} reverse DCF did not revalidate`);
}

console.log('✓ valuation formulas, normalization, scenarios, sensitivity, reverse DCF, provenance, and artifacts validated');
