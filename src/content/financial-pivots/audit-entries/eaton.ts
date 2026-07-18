import { external, secFiling, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'eaton', fiscalYearEnd: '12월', reportingCurrency: 'USD', filingSystem: 'sec', adr: { enabled: false, ratio: null }, splitHistory: [],
  latestAnnual: secFiling('1551182', '10-K', '0001551182-26-000007', '2026-02-26', '2025-12-31', 2025, 'FY'), latestQuarter: secFiling('1551182', '10-Q', '0001551182-26-000013', '2026-05-05', '2026-03-31', 2026, 'Q1'), latestAnnualDilutedEps: { value: 10.45, fiscalYear: 2025, sourceFilingId: '0001551182-26-000007' },
  auditedPrice: { value: 399.99, currency: 'USD', asOf: '2026-07-17', session: 'regularClose', sourceId: 'yahoo-chart:ETN:2026-07-17', sourceUrl: '/api/market-prices?ticker=ETN' },
  externalPerChecks: [external('StockAnalysis', 39.1289, 'GAAP trailing PE · 사이트 최근 회계연도 fallback과 기준시점 차이', '2026-07-15', 'https://stockanalysis.com/stocks/etn/financials/ratios/', 'timing_difference'), external('CompaniesMarketCap', 39.1, 'TTM PE · 사이트 최근 회계연도 fallback과 기준시점 차이', '2026-07-18', 'https://companiesmarketcap.com/eaton/pe-ratio/', 'timing_difference')],
};
export default entry;
