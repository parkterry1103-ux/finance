import { external, secFiling, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'nvidia', fiscalYearEnd: '1월', reportingCurrency: 'USD', filingSystem: 'sec', adr: { enabled: false, ratio: null }, splitHistory: ['2024-06-10 · 10-for-1'],
  latestAnnual: secFiling('1045810', '10-K', '0001045810-26-000021', '2026-02-25', '2026-01-25', 2026, 'FY'), latestQuarter: secFiling('1045810', '10-Q', '0001045810-26-000052', '2026-05-20', '2026-04-26', 2027, 'Q1'), latestAnnualDilutedEps: { value: 4.9, fiscalYear: 2026, sourceFilingId: '0001045810-26-000021' },
  auditedPrice: { value: 202.81, currency: 'USD', asOf: '2026-07-17', session: 'regularClose', sourceId: 'yahoo-chart:NVDA:2026-07-17', sourceUrl: '/api/market-prices?ticker=NVDA' },
  externalPerChecks: [external('StockAnalysis', 31.0599, 'GAAP trailing PE · 사이트의 최근 회계연도 fallback과 기간 차이', '2026-07-15', 'https://stockanalysis.com/stocks/nvda/financials/ratios/', 'definition_difference'), external('CompaniesMarketCap', 41.5, '최근 회계연도 희석 EPS에 가까운 분모', '2026-07-18', 'https://companiesmarketcap.com/nvidia/pe-ratio/', 'matched_with_rounding')],
};
export default entry;
