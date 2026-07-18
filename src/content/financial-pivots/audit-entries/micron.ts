import { external, secFiling, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'micron', fiscalYearEnd: '8월', reportingCurrency: 'USD', filingSystem: 'sec', adr: { enabled: false, ratio: null }, splitHistory: [],
  latestAnnual: secFiling('723125', '10-K', '0000723125-25-000028', '2025-10-03', '2025-08-28', 2025, 'FY'), latestQuarter: secFiling('723125', '10-Q', '0000723125-26-000015', '2026-06-25', '2026-05-28', 2026, 'Q3'), latestAnnualDilutedEps: { value: 7.59, fiscalYear: 2025, sourceFilingId: '0000723125-25-000028' },
  auditedPrice: { value: 848.95, currency: 'USD', asOf: '2026-07-17', session: 'regularClose', sourceId: 'yahoo-chart:MU:2026-07-17', sourceUrl: '/api/market-prices?ticker=MU' },
  externalPerChecks: [external('StockAnalysis', 19.1581, 'GAAP trailing PE · 사이트의 최근 회계연도 fallback과 기간 차이', '2026-07-15', 'https://stockanalysis.com/stocks/mu/financials/ratios/', 'definition_difference'), external('CompaniesMarketCap', 41.1, '최신 Q3 및 최근 회계연도 기준과 다른 분모', '2026-07-18', 'https://companiesmarketcap.com/micron-technology/pe-ratio/', 'definition_difference')],
};
export default entry;
