import { external, secFiling, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'supermicro', fiscalYearEnd: '6월', reportingCurrency: 'USD', filingSystem: 'sec', adr: { enabled: false, ratio: null }, splitHistory: ['2024-10-01 · 10-for-1'],
  latestAnnual: secFiling('1375365', '10-K', '0001375365-25-000027', '2025-08-28', '2025-06-30', 2025, 'FY'), latestQuarter: secFiling('1375365', '10-Q', '0001375365-26-000014', '2026-05-11', '2026-03-31', 2026, 'Q3'), latestAnnualDilutedEps: { value: 1.68, fiscalYear: 2025, sourceFilingId: '0001375365-25-000027' },
  auditedPrice: { value: 24.18, currency: 'USD', asOf: '2026-07-17', session: 'regularClose', sourceId: 'yahoo-chart:SMCI:2026-07-17', sourceUrl: '/api/market-prices?ticker=SMCI' },
  externalPerChecks: [external('StockAnalysis', 12.6763, 'GAAP trailing PE · 사이트의 최근 회계연도 fallback과 기간 차이', '2026-07-15', 'https://stockanalysis.com/stocks/smci/financials/ratios/', 'definition_difference'), external('CompaniesMarketCap', 12.8, 'TTM PE · 최근 회계연도 fallback과 기간 차이', '2026-07-18', 'https://companiesmarketcap.com/supermicro/pe-ratio/', 'definition_difference')],
};
export default entry;
