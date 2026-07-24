import { external, secFiling, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'supermicro', fiscalYearEnd: '6월', reportingCurrency: 'USD', filingSystem: 'sec', adr: { enabled: false, ratio: null }, splitHistory: ['2024-10-01 · 10-for-1'],
  latestAnnual: secFiling('1375365', '10-K', '0001375365-25-000027', '2025-08-28', '2025-06-30', 2025, 'FY'), latestQuarter: secFiling('1375365', '10-Q', '0001375365-26-000014', '2026-05-11', '2026-03-31', 2026, 'Q3'), latestAnnualDilutedEps: { value: 1.68, fiscalYear: 2025, sourceFilingId: '0001375365-25-000027' },
  auditedPrice: { value: 30.56, currency: 'USD', asOf: '2026-07-22', session: 'regularClose', sourceId: 'yahoo-chart:SMCI:2026-07-22', sourceUrl: '/api/market-prices?ticker=SMCI' },
  externalPerChecks: [
    external('GuruFocus', 16.17, '정의 미공개 PE · 사이트의 최근 회계연도 희석 EPS fallback과 기간 차이', '2026-07-22', 'https://www.gurufocus.com/term/pe-ratio/SMCI', 'definition_difference', '2026-07-24T02:10:00+09:00'),
    external('StockAnalysis', 14.10, 'GAAP trailing PE · 최근 회계연도 fallback과 기간·분모 차이', '2026-07-13', 'https://stockanalysis.com/stocks/smci/financials/ratios/', 'definition_difference', '2026-07-24T02:10:00+09:00'),
  ],
};
export default entry;
