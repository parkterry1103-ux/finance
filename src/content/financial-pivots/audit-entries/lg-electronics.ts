import { dartFiling, external, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'lg-electronics', fiscalYearEnd: '12월', reportingCurrency: 'KRW', filingSystem: 'opendart', adr: { enabled: false, ratio: null }, splitHistory: [],
  latestAnnual: { ...dartFiling('20260706000276', '11011', '2025-12-31', 2025, 'FY'), amended: true }, latestQuarter: dartFiling('20260515000856', '11013', '2026-03-31', 2026, 'Q1'), latestAnnualDilutedEps: null,
  auditedPrice: { value: 179_000, currency: 'KRW', asOf: '2026-07-17', session: 'regularClose', sourceId: 'kis-openapi:066570.KS:2026-07-17', sourceUrl: '/api/market-prices?ticker=066570.KS' },
  externalPerChecks: [external('Npay 증권', 33.03, '지배기업 귀속 최근 4분기 순이익과 수정평균발행주식수 · 내부 공시 EPS 미확보', '2026-07-17', 'https://finance.naver.com/item/main.naver?code=066570', 'definition_difference'), external('Daum 금융', 36.4, '표시 가격과 EPS 기준시점 차이', '2026-07-16', 'https://finance.daum.net/quotes/A066570', 'timing_difference')],
};
export default entry;
