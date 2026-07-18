import { external, secFiling, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'meta', fiscalYearEnd: '12월', reportingCurrency: 'USD', filingSystem: 'sec', adr: { enabled: false, ratio: null }, splitHistory: [],
  latestAnnual: secFiling('1326801', '10-K', '0001628280-26-003942', '2026-01-29', '2025-12-31', 2025, 'FY'), latestQuarter: secFiling('1326801', '10-Q', '0001628280-26-028526', '2026-04-30', '2026-03-31', 2026, 'Q1'), latestAnnualDilutedEps: { value: 23.49, fiscalYear: 2025, sourceFilingId: '0001628280-26-003942' },
  auditedPrice: { value: 646.01, currency: 'USD', asOf: '2026-07-17', session: 'regularClose', sourceId: 'yahoo-chart:META:2026-07-17', sourceUrl: '/api/market-prices?ticker=META' },
  externalPerChecks: [external('StockAnalysis', 23.5008, 'GAAP trailing PE · 사이트의 최근 회계연도 fallback과 기간 차이', '2026-07-15', 'https://stockanalysis.com/stocks/meta/financials/ratios/', 'definition_difference'), external('CompaniesMarketCap', 23.2, 'TTM PE · 최근 회계연도 fallback과 기간 차이', '2026-07-18', 'https://companiesmarketcap.com/meta-platforms/pe-ratio/', 'definition_difference')],
};
export default entry;
