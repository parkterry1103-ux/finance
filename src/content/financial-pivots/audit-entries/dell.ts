import { external, secFiling, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'dell', fiscalYearEnd: '1월', reportingCurrency: 'USD', filingSystem: 'sec', adr: { enabled: false, ratio: null }, splitHistory: [],
  latestAnnual: secFiling('1571996', '10-K', '0001571996-26-000008', '2026-03-16', '2026-01-30', 2026, 'FY'), latestQuarter: secFiling('1571996', '10-Q', '0001571996-26-000030', '2026-06-09', '2026-05-01', 2027, 'Q1'), latestAnnualDilutedEps: { value: 8.68, fiscalYear: 2026, sourceFilingId: '0001571996-26-000008' },
  auditedPrice: { value: 396.34, currency: 'USD', asOf: '2026-07-17', session: 'regularClose', sourceId: 'yahoo-chart:DELL:2026-07-17', sourceUrl: '/api/market-prices?ticker=DELL' },
  externalPerChecks: [external('StockAnalysis', 31.6824, 'GAAP trailing PE · 사이트의 최근 회계연도 fallback과 기간 차이', '2026-07-15', 'https://stockanalysis.com/stocks/dell/financials/ratios/', 'definition_difference'), external('CompaniesMarketCap', 45.1, '최근 회계연도 희석 EPS에 가까운 분모', '2026-07-18', 'https://companiesmarketcap.com/dell/pe-ratio/', 'matched_with_rounding')],
};
export default entry;
