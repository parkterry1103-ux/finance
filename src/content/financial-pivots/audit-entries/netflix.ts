import { external, secFiling, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'netflix',
  fiscalYearEnd: '12월',
  reportingCurrency: 'USD',
  filingSystem: 'sec',
  adr: { enabled: false, ratio: null },
  splitHistory: ['2025-11-17 · 10-for-1'],
  latestAnnual: secFiling('1065280', '10-K', '0001065280-26-000034', '2026-01-23', '2025-12-31', 2025, 'FY'),
  latestQuarter: secFiling('1065280', '10-Q', '0001065280-26-000212', '2026-07-17', '2026-06-30', 2026, 'Q2'),
  latestAnnualDilutedEps: { value: 2.53, fiscalYear: 2025, sourceFilingId: '0001065280-26-000034' },
  auditedPrice: { value: 68.95, currency: 'USD', asOf: '2026-07-17', session: 'regularClose', sourceId: 'yahoo-chart:NFLX:2026-07-17', sourceUrl: '/api/market-prices?ticker=NFLX' },
  externalPerChecks: [
    external('StockAnalysis', 21.72, 'GAAP trailing PE · 최근 4분기 분모로 최근 회계연도 희석 EPS fallback과 정의 차이', '2026-07-17', 'https://stockanalysis.com/stocks/nflx/financials/ratios/', 'definition_difference'),
    external('CompaniesMarketCap', 21.8954, 'TTM PE · 최근 4분기 분모로 최근 회계연도 희석 EPS fallback과 정의 차이', '2026-07-18', 'https://companiesmarketcap.com/netflix/pe-ratio/', 'definition_difference'),
  ],
};

export default entry;
