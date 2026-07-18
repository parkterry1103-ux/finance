import {
  financialPivotCompanies,
  isFilingAvailableAtPriceDate,
  validateFinancialPivotRegistry,
} from '../src/content/financial-pivots/index.js';
import { financialAuditRegistry } from '../src/content/financial-pivots/audit-all.js';

let checks = 0;
function check(condition: unknown, label: string) {
  checks += 1;
  if (!condition) throw new Error(`filing freshness unit failed: ${label}`);
}

const errors = validateFinancialPivotRegistry();
check(errors.length === 0, `registry validation: ${errors.join(' | ')}`);
check(financialAuditRegistry.length === 9 && financialPivotCompanies.length === 9, 'all nine companies covered');
check(new Set(financialAuditRegistry.map((item) => item.companySlug)).size === 9, 'audit slugs unique');
check(financialPivotCompanies.every((company) => financialAuditRegistry.some((audit) => audit.companySlug === company.companySlug)), 'audit covers supported companies');
check(financialAuditRegistry.every((item) => item.latestAnnual.consolidated && item.latestQuarter.consolidated), 'consolidated filings only');
check(financialAuditRegistry.every((item) => isFilingAvailableAtPriceDate(item.latestAnnual.filedAt, item.auditedPrice.asOf)), 'annual filings available before price date');
check(financialAuditRegistry.every((item) => isFilingAvailableAtPriceDate(item.latestQuarter.filedAt, item.auditedPrice.asOf)), 'quarter filings available before price date');
check(financialAuditRegistry.every((item) => item.externalPerChecks.length >= 2), 'two external checks per company');
check(financialAuditRegistry.flatMap((item) => item.externalPerChecks).every((item) => item.retrievedAt && item.sourceUrl.startsWith('https://')), 'external provenance complete');
check(financialAuditRegistry.flatMap((item) => item.externalPerChecks).every((item) => item.multipleBasis && item.epsBasis && item.accountingBasis && item.priceAsOf && item.financialPeriod), 'external definition fields complete');
check(financialAuditRegistry.every((item) => !item.adr.enabled || Boolean(item.adr.ratio)), 'ADR ratios explicit');
check(financialAuditRegistry.filter((item) => item.filingSystem === 'sec').every((item) => item.latestAnnualDilutedEps?.sourceFilingId === item.latestAnnual.accessionOrReceiptNumber), 'SEC annual EPS fallback traces to latest 10-K');
check(!isFilingAvailableAtPriceDate('2026-07-19', '2026-07-18'), 'look-ahead fixture rejected');
check(isFilingAvailableAtPriceDate('2026-07-18', '2026-07-18'), 'same-day filing fixture accepted');

console.log(`✓ Filing freshness unit ${checks}개 검증 · 9개 기업 · 최신 연간/분기 · no look-ahead · 외부 2곳`);
