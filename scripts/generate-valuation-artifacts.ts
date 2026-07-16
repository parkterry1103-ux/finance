import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { valuationBenchmarkSnapshot } from '../src/content/valuation/benchmarks/industry-2026-01.js';
import { valuationReadinessCompanies, type ValuationReadinessCompany } from '../src/content/valuation/companies.js';
import {
  buildGrowthMarginSensitivity,
  buildWaccGrowthSensitivity,
  factsToAnnualPeriods,
  normalizeSecCompanyFacts,
  runScenario,
  runScenarios,
  solveReverseDcf,
  type NormalizedFinancialFact,
  type NormalizedFinancialPeriod,
  type SecCompanyFactsPayload,
  type ValuationBenchmark,
  type ValuationModelInput,
  type ValuationScenario,
} from '../src/domain/valuation/index.js';

const root = process.cwd();
const artifactRoot = join(root, 'artifacts', 'phase-4a-valuation');
const valuationDate = '2026-07-15';
const retrievedAt = new Date().toISOString();
const userAgent = process.env.SEC_USER_AGENT || 'finance1 valuation readiness audit contact@example.com';
const productionBaseUrl = 'https://finance1-flax.vercel.app';

type ReadinessStatus = '충분' | '제한적' | '계산 가능' | '보조 가정 필요' | '계산 부적합' | '자료 없음';

type PriceRow = {
  ticker?: string;
  price?: string;
  currency?: string;
  asOf?: string;
  source?: string;
};

type ReadinessRow = {
  companySlug: string;
  companyName: string;
  country: string;
  identifier: string;
  sourceSystem: string;
  annualRevenue: ReadinessStatus;
  annualOperatingIncome: ReadinessStatus;
  taxes: ReadinessStatus;
  depreciation: ReadinessStatus;
  capex: ReadinessStatus;
  operatingCashFlow: ReadinessStatus;
  workingCapital: ReadinessStatus;
  cash: ReadinessStatus;
  debt: ReadinessStatus;
  leaseLiabilities: ReadinessStatus;
  minorityInterest: ReadinessStatus;
  dilutedShares: ReadinessStatus;
  referencePrice: ReadinessStatus;
  segmentData: ReadinessStatus;
  companyKpis: ReadinessStatus;
  dcfStatus: '가능' | '제한적' | '부적합';
  primaryMethod: string;
  secondaryMethods: string[];
  unsuitableMethods: string[];
  blockers: string[];
  availableAnnualPeriods: number;
  filingCount: number;
  amendmentSelections: number;
  excludedContexts: number;
};

type CompanyAudit = {
  company: ValuationReadinessCompany;
  readiness: ReadinessRow;
  facts: NormalizedFinancialFact[];
  periods: NormalizedFinancialPeriod[];
  price?: PriceRow;
};

function ensureDirectory(path: string) {
  mkdirSync(path, { recursive: true });
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(path: string, rows: Array<Record<string, unknown>>) {
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [headers.map(csvEscape).join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))];
  writeFileSync(path, `${lines.join('\n')}\n`, 'utf8');
}

function median(values: number[], fallback = 0) {
  const finite = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!finite.length) return fallback;
  const middle = Math.floor(finite.length / 2);
  return finite.length % 2 ? finite[middle] : (finite[middle - 1] + finite[middle]) / 2;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function annualCount(facts: NormalizedFinancialFact[], metricId: string) {
  return new Set(facts.filter((fact) => fact.metricId === metricId && fact.periodType === 'annual').map((fact) => fact.periodEnd)).size;
}

function latestFact(facts: NormalizedFinancialFact[], metricId: string, allowedPeriodTypes?: Set<string>) {
  return facts
    .filter((fact) => fact.metricId === metricId && fact.periodEnd <= valuationDate && (!allowedPeriodTypes || allowedPeriodTypes.has(fact.periodType)))
    .sort((a, b) => a.periodEnd.localeCompare(b.periodEnd) || a.filedAt.localeCompare(b.filedAt))
    .pop();
}

function statusForCount(count: number, sufficient: number, calculable: number): ReadinessStatus {
  if (count >= sufficient) return '충분';
  if (count >= calculable) return '계산 가능';
  if (count > 0) return '제한적';
  return '자료 없음';
}

async function fetchJson(url: string, headers: Record<string, string> = {}) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${url} returned ${response.status}.`);
  return response.json();
}

async function fetchPrices() {
  const payload = await fetchJson(`${productionBaseUrl}/api/market-prices?limit=200`) as { prices?: PriceRow[] };
  return payload.prices ?? [];
}

async function auditUsCompany(company: ValuationReadinessCompany, prices: PriceRow[]): Promise<CompanyAudit> {
  const paddedCik = company.cik!.padStart(10, '0');
  const payload = await fetchJson(`https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCik}.json`, { 'User-Agent': userAgent }) as SecCompanyFactsPayload;
  const normalized = normalizeSecCompanyFacts(payload, company.companySlug);
  const periods = factsToAnnualPeriods(normalized.facts).slice(-7);
  const count = (metricId: string) => annualCount(normalized.facts, metricId);
  const hasLatest = (metricId: string) => Boolean(latestFact(normalized.facts, metricId));
  const price = prices.find((row) => row.ticker?.toUpperCase() === company.ticker.toUpperCase());
  const workingCapitalAvailable = ['currentAssets', 'currentLiabilities', 'cashAndEquivalents'].every(hasLatest);
  const debtAvailable = hasLatest('totalDebt') || hasLatest('longTermDebt') || hasLatest('shortTermDebt');
  const dcfReady = count('revenue') >= 5
    && count('operatingIncome') >= 5
    && count('incomeTaxExpense') >= 3
    && count('depreciationAndAmortization') >= 3
    && count('capitalExpenditure') >= 3
    && workingCapitalAvailable
    && hasLatest('cashAndEquivalents')
    && debtAvailable
    && count('dilutedShares') >= 1
    && Boolean(price);
  const dcfStatus = dcfReady ? '가능' : count('revenue') >= 3 && count('operatingIncome') >= 3 ? '제한적' : '부적합';
  const blockers = [
    ...(count('capitalExpenditure') < 3 ? ['Capex 시계열 부족'] : []),
    ...(count('depreciationAndAmortization') < 3 ? ['감가상각 시계열 부족'] : []),
    ...(!workingCapitalAvailable ? ['영업 운전자본 계정 부족'] : []),
    ...(!price ? ['기존 가격 데이터 없음'] : []),
    'Companyfacts만으로 사업부·기업별 KPI를 완전하게 정규화할 수 없음',
  ];
  const readiness: ReadinessRow = {
    companySlug: company.companySlug,
    companyName: company.companyName,
    country: company.country,
    identifier: `CIK ${paddedCik}`,
    sourceSystem: 'SEC Companyfacts',
    annualRevenue: statusForCount(count('revenue'), 5, 3),
    annualOperatingIncome: statusForCount(count('operatingIncome'), 5, 3),
    taxes: statusForCount(count('incomeTaxExpense'), 3, 2),
    depreciation: statusForCount(count('depreciationAndAmortization'), 3, 2),
    capex: statusForCount(count('capitalExpenditure'), 3, 2),
    operatingCashFlow: statusForCount(count('operatingCashFlow'), 3, 2),
    workingCapital: workingCapitalAvailable ? '계산 가능' : '자료 없음',
    cash: hasLatest('cashAndEquivalents') ? '충분' : '자료 없음',
    debt: debtAvailable ? '계산 가능' : '자료 없음',
    leaseLiabilities: hasLatest('leaseLiabilities') ? '계산 가능' : '자료 없음',
    minorityInterest: hasLatest('minorityInterest') ? '계산 가능' : '제한적',
    dilutedShares: count('dilutedShares') ? '충분' : '자료 없음',
    referencePrice: price ? '충분' : '자료 없음',
    segmentData: '제한적',
    companyKpis: '보조 가정 필요',
    dcfStatus,
    primaryMethod: company.primaryMethod,
    secondaryMethods: company.secondaryMethods,
    unsuitableMethods: company.unsuitableMethods,
    blockers,
    availableAnnualPeriods: periods.length,
    filingCount: new Set(normalized.facts.map((fact) => fact.accessionOrReceiptNumber)).size,
    amendmentSelections: normalized.audit.filter((entry) => entry.action === 'selected' && /latest applicable/.test(entry.reason)).length,
    excludedContexts: normalized.audit.filter((entry) => entry.action === 'excluded').length,
  };
  return { company, readiness, facts: normalized.facts, periods, price };
}

async function auditKoreanCompany(company: ValuationReadinessCompany, prices: PriceRow[]): Promise<CompanyAudit> {
  const url = new URL('/api/financials', productionBaseUrl);
  url.searchParams.set('country', 'KR');
  url.searchParams.set('companyId', company.companySlug === 'sk-hynix' ? 'ai-datacenter-sk-hynix' : 'datacenter-power-lg-electronics');
  url.searchParams.set('corpCode', company.corpCode!);
  const payload = await fetchJson(url.toString()) as {
    sourceStatus?: string;
    reportType?: string;
    fiscalYear?: string;
    fiscalPeriod?: string;
    asOf?: string;
    rawAvailable?: Record<string, boolean>;
  };
  const price = prices.find((row) => row.ticker?.toUpperCase() === company.ticker.toUpperCase());
  const available = payload.rawAvailable ?? {};
  const blockers = [
    '현재 read-only API가 최신 기간 요약만 반환해 5개 연간 시계열을 구성할 수 없음',
    ...(!available.depreciationAndAmortization ? ['감가상각 자료 없음'] : []),
    '희석주식 수 자료 없음',
    '연결 사업부·기업별 KPI 정규화 추가 필요',
  ];
  const readiness: ReadinessRow = {
    companySlug: company.companySlug,
    companyName: company.companyName,
    country: company.country,
    identifier: `corp_code ${company.corpCode}`,
    sourceSystem: 'OpenDART CFS via existing read-only API',
    annualRevenue: '제한적',
    annualOperatingIncome: '제한적',
    taxes: available.netIncome ? '제한적' : '자료 없음',
    depreciation: available.depreciationAndAmortization ? '제한적' : '자료 없음',
    capex: available.capitalExpenditures ? '제한적' : '자료 없음',
    operatingCashFlow: available.operatingCashFlow ? '제한적' : '자료 없음',
    workingCapital: available.assetsCurrent && available.liabilitiesCurrent ? '제한적' : '자료 없음',
    cash: '자료 없음',
    debt: available.totalLiabilities ? '보조 가정 필요' : '자료 없음',
    leaseLiabilities: '자료 없음',
    minorityInterest: '자료 없음',
    dilutedShares: '자료 없음',
    referencePrice: price ? '충분' : '자료 없음',
    segmentData: '제한적',
    companyKpis: '제한적',
    dcfStatus: '제한적',
    primaryMethod: company.primaryMethod,
    secondaryMethods: company.secondaryMethods,
    unsuitableMethods: company.unsuitableMethods,
    blockers,
    availableAnnualPeriods: 0,
    filingCount: payload.sourceStatus === 'direct' ? 1 : 0,
    amendmentSelections: 0,
    excludedContexts: 0,
  };
  return { company, readiness, facts: [], periods: [], price };
}

function benchmarkFor(company: ValuationReadinessCompany): ValuationBenchmark {
  const benchmark = valuationBenchmarkSnapshot.benchmarks.find((item) => item.industry === company.benchmarkIndustry);
  if (!benchmark) throw new Error(`Benchmark missing for ${company.companySlug}.`);
  return benchmark;
}

function operatingWorkingCapital(period: NormalizedFinancialPeriod) {
  const metrics = period.metrics;
  if (metrics.currentAssets === undefined || metrics.currentLiabilities === undefined || metrics.cashAndEquivalents === undefined) return null;
  return metrics.currentAssets
    - metrics.cashAndEquivalents
    - (metrics.shortTermInvestments ?? 0)
    - (metrics.currentLiabilities - (metrics.shortTermDebt ?? 0));
}

function latestMetric(audit: CompanyAudit, metricId: string) {
  return latestFact(audit.facts, metricId)?.value ?? 0;
}

function setTargetWacc(input: ValuationModelInput, targetWacc: number) {
  const discount = input.discountRateAssumptions;
  const afterTaxDebt = discount.preTaxCostOfDebt * (1 - discount.normalizedTaxRate);
  const requiredCostOfEquity = (targetWacc - afterTaxDebt * discount.debtWeight) / discount.equityWeight;
  discount.leveredBeta = (requiredCostOfEquity - discount.riskFreeRate - (discount.countryRiskPremium ?? 0)) / discount.equityRiskPremium;
}

function buildPilotInput(audit: CompanyAudit) {
  const historicals = audit.periods.slice(-6);
  const latest = historicals[historicals.length - 1];
  const benchmark = benchmarkFor(audit.company);
  const revenues = historicals.map((period) => period.metrics.revenue!).filter(Number.isFinite);
  const margins = historicals.flatMap((period) => {
    const operatingIncome = period.metrics.operatingIncome;
    return operatingIncome === undefined || !period.metrics.revenue ? [] : [operatingIncome / period.metrics.revenue];
  });
  const taxRates = historicals.flatMap((period) => {
    const taxes = period.metrics.incomeTaxExpense;
    const pretax = period.metrics.pretaxIncome;
    return taxes === undefined || !pretax || pretax <= 0 ? [] : [clamp(taxes / pretax, 0, 0.35)];
  });
  const depreciationRatios = historicals.flatMap((period) => period.metrics.depreciationAndAmortization === undefined || !period.metrics.revenue ? [] : [period.metrics.depreciationAndAmortization / period.metrics.revenue]);
  const capexRatios = historicals.flatMap((period) => period.metrics.capitalExpenditure === undefined || !period.metrics.revenue ? [] : [period.metrics.capitalExpenditure / period.metrics.revenue]);
  const workingCapital = historicals.map((period) => ({ revenue: period.metrics.revenue!, value: operatingWorkingCapital(period) }));
  const workingCapitalRatios = workingCapital.slice(1).flatMap((current, index) => current.value === null || workingCapital[index].value === null || !current.revenue ? [] : [(current.value - workingCapital[index].value!) / current.revenue]);
  const recentCagr = revenues.length >= 3 ? (revenues[revenues.length - 1] / revenues[revenues.length - 3]) ** 0.5 - 1 : 0.1;
  const startingGrowth = clamp(recentCagr, 0.08, audit.company.companySlug === 'nvidia' ? 0.3 : 0.22);
  const normalizedMargin = clamp(median(margins.slice(-3), median(margins)), 0.05, 0.65);
  const normalizedTaxRate = clamp(median(taxRates.slice(-5), 0.21), 0.1, 0.25);
  const depreciationRatio = clamp(median(depreciationRatios.slice(-3), 0.03), 0.005, 0.15);
  const capexRatio = clamp(median(capexRatios.slice(-3), depreciationRatio * 1.2), depreciationRatio, 0.4);
  const workingCapitalRatio = clamp(median(workingCapitalRatios.slice(-4), 0.01), -0.05, 0.08);
  const years = 7;
  const stableGrowthRate = 0.03;
  const forecastYears = Array.from({ length: years }, (_, index) => {
    const progress = index / (years - 1);
    return {
      year: Number(valuationDate.slice(0, 4)) + index + 1,
      revenueGrowthRate: startingGrowth + (stableGrowthRate + 0.015 - startingGrowth) * progress,
      operatingMargin: normalizedMargin,
      normalizedTaxRate,
      depreciationAsPercentRevenue: depreciationRatio,
      capexAsPercentRevenue: capexRatio,
      changeInWorkingCapitalAsPercentRevenue: workingCapitalRatio,
    };
  });
  const cash = latestMetric(audit, 'cashAndEquivalents');
  const nonOperatingAssets = latestMetric(audit, 'shortTermInvestments');
  const debt = latestMetric(audit, 'totalDebt') || latestMetric(audit, 'shortTermDebt') + latestMetric(audit, 'longTermDebt');
  const leaseLiabilities = latestMetric(audit, 'leaseLiabilities');
  const minorityInterest = latestMetric(audit, 'minorityInterest');
  const dilutedShares = latest.metrics.dilutedShares || latestMetric(audit, 'dilutedShares');
  const currentPrice = Number(audit.price?.price);
  const marketEquity = currentPrice * dilutedShares;
  const debtForWacc = debt + leaseLiabilities;
  const debtWeight = debtForWacc / (marketEquity + debtForWacc);
  const equityWeight = 1 - debtWeight;
  const unleveredBeta = benchmark.unleveredBeta ?? 1;
  const leveredBeta = unleveredBeta * (1 + (1 - normalizedTaxRate) * (debtForWacc / marketEquity));
  const input: ValuationModelInput = {
    companySlug: audit.company.companySlug,
    valuationDate,
    currency: audit.company.currency,
    historicals,
    forecastAssumptions: { years: forecastYears },
    capitalStructure: { cash, nonOperatingAssets, debt, leaseLiabilities, minorityInterest, dilutedShares },
    discountRateAssumptions: {
      riskFreeRate: 0.0458,
      equityRiskPremium: 0.0446,
      leveredBeta,
      countryRiskPremium: 0,
      preTaxCostOfDebt: benchmark.preTaxCostOfDebt ?? 0.055,
      normalizedTaxRate,
      equityWeight,
      debtWeight,
    },
    terminalAssumptions: {
      stableGrowthRate,
      stableRoic: clamp(benchmark.roic ?? 0.2, 0.12, 0.4),
      exitMultiple: benchmark.evToEbitda,
    },
    sources: [...new Set(historicals.flatMap((period) => period.sourceIds))],
  };
  return {
    input,
    currentPrice,
    assumptions: {
      startingGrowth,
      normalizedMargin,
      normalizedTaxRate,
      depreciationRatio,
      capexRatio,
      workingCapitalRatio,
      riskFreeAsOf: '2026-07-14',
      priceAsOf: audit.price?.asOf,
      financialsAsOf: latest.periodEnd,
      dilutedSharesAsOf: latestFact(audit.facts, 'dilutedShares', new Set(['annual']))?.periodEnd,
      capitalStructureAsOf: latestFact(audit.facts, 'cashAndEquivalents', new Set(['pointInTime']))?.periodEnd,
      benchmarkId: benchmark.id,
    },
  };
}

function scenarioSet(baseInput: ValuationModelInput): ValuationScenario[] {
  const conservative = structuredClone(baseInput);
  conservative.forecastAssumptions.years.forEach((year) => {
    year.revenueGrowthRate *= 0.75;
    year.operatingMargin = Math.max(0.01, year.operatingMargin - 0.03);
    year.capexAsPercentRevenue += 0.01;
    year.changeInWorkingCapitalAsPercentRevenue += 0.005;
  });
  conservative.terminalAssumptions.stableGrowthRate -= 0.005;
  const baseWacc = runScenario(baseInput).wacc;
  setTargetWacc(conservative, baseWacc + 0.01);

  const optimistic = structuredClone(baseInput);
  optimistic.forecastAssumptions.years.forEach((year) => {
    year.revenueGrowthRate = Math.min(0.6, year.revenueGrowthRate * 1.2);
    year.operatingMargin = Math.min(0.75, year.operatingMargin + 0.02);
    year.capexAsPercentRevenue = Math.max(year.depreciationAsPercentRevenue, year.capexAsPercentRevenue - 0.005);
    year.changeInWorkingCapitalAsPercentRevenue -= 0.0025;
  });
  optimistic.terminalAssumptions.stableGrowthRate += 0.005;
  setTargetWacc(optimistic, baseWacc - 0.0075);
  return [
    { name: 'conservative', input: conservative },
    { name: 'base', input: structuredClone(baseInput) },
    { name: 'optimistic', input: optimistic },
  ];
}

function sourceRows(facts: NormalizedFinancialFact[]) {
  const unique = new Map<string, NormalizedFinancialFact>();
  facts.forEach((fact) => unique.set(fact.sourceId, fact));
  return [...unique.values()].map((fact) => ({
    sourceId: fact.sourceId,
    sourceSystem: fact.sourceSystem,
    accessionOrReceiptNumber: fact.accessionOrReceiptNumber,
    filingType: fact.filingType,
    filedAt: fact.filedAt,
    periodEnd: fact.periodEnd,
    taxonomyConcept: fact.taxonomyConcept,
    url: `https://www.sec.gov/Archives/edgar/data/${Number(fact.sourceId.split(':')[1])}/${fact.accessionOrReceiptNumber.replace(/-/g, '')}/`,
  }));
}

function writePilotArtifacts(audit: CompanyAudit) {
  const directory = join(artifactRoot, audit.company.companySlug);
  ensureDirectory(directory);
  const { input, currentPrice, assumptions } = buildPilotInput(audit);
  const scenarios = scenarioSet(input);
  const scenarioResults = runScenarios(scenarios);
  const baseResult = scenarioResults.find((scenario) => scenario.name === 'base')!.result;
  const waccValues = [-0.01, -0.005, 0, 0.005, 0.01].map((delta) => baseResult.wacc + delta);
  const growthValues = [-0.01, -0.005, 0, 0.005, 0.01].map((delta) => input.terminalAssumptions.stableGrowthRate + delta);
  const baseGrowth = input.forecastAssumptions.years[0].revenueGrowthRate;
  const baseMargin = input.forecastAssumptions.years[0].operatingMargin;
  const driverGrowth = [0.75, 0.875, 1, 1.125, 1.25].map((factor) => baseGrowth * factor);
  const driverMargins = [-0.04, -0.02, 0, 0.02, 0.04].map((delta) => baseMargin + delta);
  const waccGrowth = buildWaccGrowthSensitivity(input, waccValues, growthValues);
  const driver = buildGrowthMarginSensitivity(input, driverGrowth, driverMargins);
  const reverse = solveReverseDcf({ input, variable: 'revenueCagr', lowerBound: -0.2, upperBound: 1, currentPrice, tolerance: 1e-7 });
  const historicalRows = input.historicals.map((period) => ({ periodEnd: period.periodEnd, fiscalYear: period.fiscalYear, currency: period.currency, unit: period.unit, ...period.metrics, sourceIds: period.sourceIds.join('|') }));
  writeCsv(join(directory, 'normalized-historicals.csv'), historicalRows);
  writeJson(join(directory, 'assumptions.json'), {
    internalAnalysisOnly: true,
    valuationDate,
    price: { value: currentPrice, currency: audit.price?.currency, asOf: audit.price?.asOf, source: audit.price?.source },
    companySpecific: assumptions,
    baseInput: input,
    scenarioInputs: scenarios.map((scenario) => ({ name: scenario.name, forecastAssumptions: scenario.input.forecastAssumptions, discountRateAssumptions: scenario.input.discountRateAssumptions, terminalAssumptions: scenario.input.terminalAssumptions })),
    limitations: ['분석가 컨센서스가 아닌 공식 과거 공시와 명시적 내부 가정으로 구성', '업종 benchmark는 sanity check이며 기업 누락값 대체에 사용하지 않음', '공개 UI 노출 금지'],
  });
  writeCsv(join(directory, 'fcff-forecast.csv'), baseResult.forecast);
  writeJson(join(directory, 'valuation-result.json'), { internalAnalysisOnly: true, currentPrice, result: baseResult });
  writeCsv(join(directory, 'scenario-summary.csv'), scenarioResults.map(({ name, result }) => ({ name, wacc: result.wacc, stableGrowthRate: scenarios.find((scenario) => scenario.name === name)!.input.terminalAssumptions.stableGrowthRate, enterpriseValue: result.enterpriseValue, equityValue: result.equityBridge.equityValue, estimatedValuePerShare: result.estimatedValuePerShare, terminalValueShare: result.terminalValueShareOfEnterpriseValue })));
  writeCsv(join(directory, 'wacc-growth-sensitivity.csv'), waccGrowth.cells);
  writeCsv(join(directory, 'driver-sensitivity.csv'), driver.cells);
  writeJson(join(directory, 'reverse-dcf.json'), { internalAnalysisOnly: true, currentPrice, priceAsOf: audit.price?.asOf, result: reverse });
  writeJson(join(directory, 'sources.json'), sourceRows(audit.facts.filter((fact) => input.sources.includes(fact.sourceId))));
  writeJson(join(directory, 'warnings.json'), scenarioResults.map(({ name, result }) => ({ name, warnings: result.warnings })));
  return { audit, input, currentPrice, scenarioResults, reverse, matrices: { waccGrowth, driver } };
}

function readinessMarkdown(rows: ReadinessRow[]) {
  const tableRows = rows.map((row) => `| ${row.companyName} | ${row.sourceSystem} | ${row.annualRevenue} | ${row.annualOperatingIncome} | ${row.depreciation} | ${row.capex} | ${row.operatingCashFlow} | ${row.dilutedShares} | ${row.referencePrice} | ${row.dcfStatus} | ${row.primaryMethod} |`).join('\n');
  return `# 가치평가 준비도 요약\n\n- 기준일: ${valuationDate}\n- 생성일: ${retrievedAt}\n- 원칙: 기업 공시 우선, 업종 benchmark는 검증용이며 누락 회사 수치를 대체하지 않음\n- OpenDART: 기존 Production read-only API만 조회, sync·DB·Production write 0\n- SEC: Companyfacts 6개 CIK 순차 조회, runtime route 추가 0\n\n| 기업 | 공식 연결 | 매출 5년 | 영업이익 5년 | 감가상각 | Capex | OCF | 희석주식 | 가격 | DCF | 주 방법 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${tableRows}\n\n## 공통 제한\n\n- OpenDART 기존 read-only 응답은 최신 기간 요약이라 한국 기업의 5년 DCF 공개 준비가 완료되지 않았습니다.\n- SEC Companyfacts는 사업부 KPI와 일회성 정상화 판단을 완전하게 제공하지 않으므로 원문 10-K MD&A 검토가 후속으로 필요합니다.\n- 결과는 내부 계산 검증용이며 목표주가·투자의견이 아닙니다.\n`;
}

async function main() {
  ensureDirectory(artifactRoot);
  const prices = await fetchPrices();
  const audits: CompanyAudit[] = [];
  for (const company of valuationReadinessCompanies) {
    const audit = company.country === 'US' ? await auditUsCompany(company, prices) : await auditKoreanCompany(company, prices);
    audits.push(audit);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  const ready = audits.filter((audit) => audit.readiness.dcfStatus === '가능' && audit.price && audit.periods.length >= 5);
  const first = ready.find((audit) => audit.company.companySlug === 'nvidia') ?? ready[0];
  const second = ready.find((audit) => audit.company.companySlug === 'meta' && audit.company.benchmarkIndustry !== first?.company.benchmarkIndustry)
    ?? ready.find((audit) => audit.company.benchmarkIndustry !== first?.company.benchmarkIndustry);
  if (!first || !second) throw new Error('Two data-complete, industry-diverse pilot companies were not available.');
  const pilots = [writePilotArtifacts(first), writePilotArtifacts(second)];
  const readinessRows = audits.map((audit) => audit.readiness);
  writeJson(join(artifactRoot, 'valuation-readiness.json'), {
    valuationDate,
    retrievedAt,
    sourcePolicy: ['company filings', 'company guidance', 'peer median when available', 'industry benchmark sanity check', 'explicit analyst assumptions'],
    companies: readinessRows,
  });
  writeFileSync(join(artifactRoot, 'valuation-readiness-summary.md'), readinessMarkdown(readinessRows), 'utf8');
  writeFileSync(join(artifactRoot, 'selected-pilots.md'), `# 파일럿 선정\n\n- ${first.company.companyName} (${first.company.country}, ${first.company.industry}): 5개 이상 연간 손익·현금흐름, 자본구조, 희석주식, 기존 가격 기준일을 추적할 수 있습니다.\n- ${second.company.companyName} (${second.company.country}, ${second.company.industry}): 동일 품질 기준을 충족하며 첫 기업과 업종 driver가 다릅니다.\n- 한국 1개·미국 1개 예외: 한국 두 기업은 기존 OpenDART read-only 응답에서 5년 감가상각·희석주식 시계열이 확보되지 않아 공개 가능한 DCF 품질에 미달했습니다.\n- 선정은 국적 할당보다 계산 품질과 출처 추적을 우선했습니다.\n- 모든 결과는 내부 계산 검증용이며 목표주가 또는 투자의견이 아닙니다.\n`, 'utf8');
  writeJson(join(artifactRoot, 'benchmark-snapshot.json'), valuationBenchmarkSnapshot);
  const validation = {
    generatedAt: retrievedAt,
    companiesAudited: audits.length,
    secMappings: audits.filter((audit) => audit.company.country === 'US' && audit.facts.length > 0).length,
    dartMappings: audits.filter((audit) => audit.company.country === 'KR' && audit.readiness.filingCount > 0).length,
    pilots: pilots.map((pilot) => pilot.audit.company.companySlug),
    scenarioCount: pilots.reduce((sum, pilot) => sum + pilot.scenarioResults.length, 0),
    sensitivityMatrices: pilots.flatMap((pilot) => [
      { companySlug: pilot.audit.company.companySlug, type: 'wacc-growth', rows: pilot.matrices.waccGrowth.rowValues.length, columns: pilot.matrices.waccGrowth.columnValues.length },
      { companySlug: pilot.audit.company.companySlug, type: 'driver', rows: pilot.matrices.driver.rowValues.length, columns: pilot.matrices.driver.columnValues.length },
    ]),
    reverseDcfMaxRelativeError: Math.max(...pilots.map((pilot) => pilot.reverse.relativeError)),
    nonFiniteValues: JSON.stringify(pilots).match(/NaN|Infinity/g)?.length ?? 0,
    productionWrites: 0,
    syncExecutions: 0,
  };
  writeFileSync(join(artifactRoot, 'validation-summary.md'), `# 4A 가치평가 검증\n\n- 8개 기업 감사: ${validation.companiesAudited}\n- SEC CIK 연결: ${validation.secMappings}/6\n- OpenDART corp_code 연결: ${validation.dartMappings}/2\n- 파일럿: ${validation.pilots.join(', ')}\n- 시나리오: ${validation.scenarioCount}\n- 민감도: 기업별 5×5 두 개\n- 역산 DCF 최대 상대오차: ${validation.reverseDcfMaxRelativeError}\n- NaN·Infinity: ${validation.nonFiniteValues}\n- 실제 sync·Production write: 0\n- 사용자-facing 가치평가: 0\n`, 'utf8');
  console.log(`Valuation artifacts generated for ${audits.length} companies and pilots ${validation.pilots.join(', ')}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit?.(1);
});
