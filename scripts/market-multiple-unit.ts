import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  calculatePbr,
  calculatePsr,
  calculateTrailingPer,
  calculateTtmMetric,
  convertOrdinaryEpsToAdr,
  deriveStandaloneFlow,
  reconcileMultiple,
  sameFiscalPeriodReference,
  type DerivationBasis,
  type FinancialSeriesPeriod,
} from '../src/content/financial-pivots/index.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`market multiple unit failed: ${label}`);
}

const basis: DerivationBasis = { companySlug: 'micron', metricId: 'revenue', value: 78_959, periodStart: '2025-08-29', periodEnd: '2026-05-28', currency: 'USD', unit: 'million', consolidation: 'consolidated', conceptOrAccountId: 'us-gaap:Revenue', restatementKey: '2026-Q3' };
const previous: DerivationBasis = { ...basis, value: 46_423, periodEnd: '2026-02-26' };
const standalone = deriveStandaloneFlow(basis, previous);
check(standalone.ok && standalone.value === 32_536, 'nine-month minus six-month produces standalone Q3');
check(!deriveStandaloneFlow(basis, { ...previous, periodStart: '2025-09-01' }).ok, 'different cumulative start rejected');
check(!deriveStandaloneFlow(basis, { ...previous, consolidation: 'separate' }).ok, 'consolidation mismatch rejected');
check(!deriveStandaloneFlow(basis, { ...previous, conceptOrAccountId: 'other' }).ok, 'definition mismatch rejected');
check(!deriveStandaloneFlow(basis, { ...previous, currency: 'KRW' }).ok, 'currency mismatch rejected');
const q4 = deriveStandaloneFlow({ ...basis, value: 1_000, periodEnd: '2026-08-28', restatementKey: 'FY2026-restated' }, { ...previous, value: 720, periodEnd: '2026-05-28', restatementKey: 'FY2026-restated' });
check(q4.ok && q4.value === 280, 'annual minus nine-month produces standalone Q4');
check(!deriveStandaloneFlow({ ...basis, value: 1_000, restatementKey: 'restated' }, { ...previous, value: 720, restatementKey: 'original' }).ok, 'mixed restatement basis rejected');

const quarters: FinancialSeriesPeriod[] = [
  ['2025-06-30', 1.0, 100], ['2025-09-30', 1.2, 110], ['2025-12-31', 1.4, 120], ['2026-03-31', 1.6, 130],
].map(([periodEnd, eps, revenue], index) => ({ label: `Q${index + 1}`, periodEnd: String(periodEnd), fiscalYear: 2026, fiscalPeriod: `Q${index + 1}`, periodBasis: 'standalone', consolidation: 'consolidated', currency: 'USD', unit: 'million', metrics: { dilutedEps: Number(eps), revenue: Number(revenue) }, sourceIds: [`fixture:${index}`], filingType: '10-Q', filedAt: String(periodEnd), accessionOrReceiptNumber: `fixture-${index}` }));
const ttmEps = calculateTtmMetric(quarters, 'dilutedEps');
const ttmRevenue = calculateTtmMetric(quarters, 'revenue');
check(ttmEps.ok && Math.abs(ttmEps.value - 5.2) < 1e-9, 'four standalone diluted EPS periods form TTM');
check(ttmRevenue.ok && ttmRevenue.value === 460, 'four standalone revenue periods form TTM');
check(!calculateTtmMetric(quarters.slice(1), 'revenue').ok, 'fewer than four quarters rejected');
check(!calculateTtmMetric([{ ...quarters[0], periodEnd: '2025-01-01' }, ...quarters.slice(1)], 'revenue').ok, 'non-continuous quarters rejected');

const per = calculateTrailingPer(52, 5.2);
check(per.ok && per.value === 10, 'trailing PER formula');
check(!calculateTrailingPer(52, -1).ok, 'negative EPS does not produce PER');
const pbr = calculatePbr(50, 1_000, 100);
check(pbr.ok && pbr.value === 5, 'PBR formula uses equity per share');
const psr = calculatePsr(50, 100, 2_000);
check(psr.ok && psr.value === 2.5, 'PSR formula uses market cap and TTM revenue');
check(!calculatePbr(50, -1, 100).ok && !calculatePsr(50, 100, 0).ok, 'non-positive denominators rejected');
const adrEps = convertOrdinaryEpsToAdr(2, 5);
check(adrEps.ok && adrEps.value === 10, 'ADR ratio conversion explicit');
check(!convertOrdinaryEpsToAdr(2, 0).ok, 'invalid ADR ratio rejected');
check(reconcileMultiple(20, 20) === 'matched', 'exact external match');
check(reconcileMultiple(20, 20.2) === 'matched_with_rounding', 'rounding tolerance classified');
check(reconcileMultiple(20, 30) === 'unresolved_difference', 'large discrepancy stays unresolved');

const current = { ...quarters[3], fiscalYear: 2026, fiscalPeriod: 'Q1' };
const prior = { ...quarters[0], fiscalYear: 2025, fiscalPeriod: 'Q1' };
check(sameFiscalPeriodReference([prior, current], current) === prior, 'YoY reference uses same fiscal period');

const routeSource = readFileSync(join(process.cwd(), 'src', 'routes', 'FinancialPivotRoute.tsx'), 'utf8');
check(routeSource.includes("useState<FinancialPivotPeriodType>('quarterly')"), 'quarterly is the default view');
check(routeSource.includes('latestAnnualDilutedEps') && routeSource.includes('최근 회계연도'), 'unsafe TTM PER has an explicit annual fallback');
check(!routeSource.includes('비교 자료 없음') && !routeSource.includes('비교 대상 없음'), 'generic comparison copy absent');

console.log(`✓ Market multiple unit ${checks}개 검증 · 독립 분기 · TTM · PER/PBR/PSR · ADR · 외부 검산`);
