import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  calculateCagr,
  calculateChange,
  aggregateMargin,
  canCompareAbsoluteCurrency,
  canComparePeriods,
  financialMetricDefinitions,
  financialPivotCompanies,
  median,
  validateFinancialPivotRegistry,
  withDerivedMetrics,
  type FinancialSeriesPeriod,
} from '../src/content/financial-pivots/index.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`financial pivot unit failed: ${label}`);
}

const validationErrors = validateFinancialPivotRegistry();
check(validationErrors.length === 0, `registry validation: ${validationErrors.join(' | ')}`);
check(financialPivotCompanies.length === 8, 'eight supported companies');
check(new Set(financialPivotCompanies.map((company) => company.companySlug)).size === 8, 'company slugs unique');
check(financialPivotCompanies.every((company) => company.companyId && company.currency && (company.country === 'US' ? company.cik : company.corpCode)), 'official identifiers complete');
check(financialPivotCompanies.flatMap((company) => company.peerSlugs).every((slug) => financialPivotCompanies.some((company) => company.companySlug === slug)), 'peer slugs valid');
check(financialMetricDefinitions.every((metric) => metric.label && metric.description && metric.group && metric.format), 'metric metadata complete');

check(calculateChange(120, 100, 'percent').label === '+20.0%', 'positive percent change');
check(calculateChange(80, 100, 'percent').label === '-20.0%', 'negative percent change');
check(calculateChange(10, 0, 'percent').label === '0에서 증가', 'zero comparison base not divided');
check(calculateChange(10, -5, 'percent').label === '흑자전환', 'loss to profit is turnaround');
check(calculateChange(-10, 5, 'percent').label === '적자전환', 'profit to loss is turnaround');
check(calculateChange(-5, -20, 'percent').label === '적자축소', 'narrower loss is not percent growth');
check(calculateChange(-25, -20, 'percent').label === '적자확대', 'wider loss is not percent growth');
check(calculateChange(undefined, 5, 'percent').status === 'missing', 'missing value remains missing');
check(calculateChange(24.3, 19.8, 'percentagePoint').label === '+4.5%p', 'margin change uses percentage points');
check(calculateCagr(100, 133.1, 3)?.toFixed(1) === '10.0', 'positive CAGR with three intervals');
check(calculateCagr(100, 121, 2) === null, 'insufficient CAGR periods rejected');
check(calculateCagr(-100, 121, 2) === null, 'negative CAGR base rejected');
check(median([1, 4, 2, 3]) === 2.5 && median([null, undefined]) === null, 'peer median ignores missing values');
check(aggregateMargin([{ numerator: 10, denominator: 100 }, { numerator: 40, denominator: 200 }]) === (50 / 300) * 100, 'industry aggregate margin uses summed values');
check(!canComparePeriods({ fiscalYear: 2025, fiscalPeriod: 'FY' }, { fiscalYear: 2024, fiscalPeriod: 'FY' }), 'mismatched fiscal periods rejected');
check(!canCompareAbsoluteCurrency('USD', 'KRW') && canCompareAbsoluteCurrency('USD', 'KRW', '2026-07-17 FX'), 'absolute currency comparison requires conversion basis');

const fixture: FinancialSeriesPeriod = {
  label: 'FY 2026',
  periodEnd: '2026-12-31',
  fiscalYear: 2026,
  fiscalPeriod: 'FY',
  currency: 'USD',
  unit: 'million',
  metrics: { revenue: 200, operatingIncome: 40, netIncome: 30, operatingCashFlow: 55, capitalExpenditure: 20, freeCashFlow: 35, currentAssets: 90, currentLiabilities: 45 },
  sourceIds: ['sec:fixture'],
  filingType: '10-K',
  filedAt: '2027-02-01',
  accessionOrReceiptNumber: 'fixture',
};
const derived = withDerivedMetrics(fixture);
check(derived.metrics.operatingMargin === 20, 'operating margin derived');
check(derived.metrics.freeCashFlowMargin === 17.5, 'free cash flow margin derived');
check(derived.metrics.currentRatio === 2, 'current ratio derived');
check(derived.metrics.returnOnAssets === undefined && derived.metrics.debtToCapital === undefined, 'missing inputs do not become zero');

const appSource = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8');
check(appSource.includes("lazy(() => import('./routes/FinancialPivotRoute'))"), 'financial route lazy loaded');
check(appSource.includes('routeFinancialPivotMatch'), 'financial route parsed before company profile');
const routeSource = readFileSync(join(process.cwd(), 'src', 'routes', 'FinancialPivotRoute.tsx'), 'utf8');
check(routeSource.includes('비교 자료 없음') && routeSource.includes('자료 미수집'), 'missing-data language present');
check(routeSource.includes('peerPayloads') && routeSource.includes("comparisonMode !== 'peer'"), 'peer data loads on demand');
check(routeSource.includes('<table>') && routeSource.includes('scope="row"') && routeSource.includes('scope="col"'), 'semantic table structure');
const profileSource = readFileSync(join(process.cwd(), 'src', 'components', 'company-profiles', 'CompanyProfiles.tsx'), 'utf8');
check(profileSource.includes('/financials') && profileSource.includes('숫자와 비교 보기'), 'company brief CTA connects financial route');

console.log(`✓ Financial Pivot unit ${checks}개 검증 · 기업 8 · 안전 계산 · lazy route · semantic table`);
