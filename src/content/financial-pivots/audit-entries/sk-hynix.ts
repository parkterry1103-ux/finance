import { dartFiling, external, type FinancialAuditCompany } from '../audit-types.js';

const entry: FinancialAuditCompany = {
  companySlug: 'sk-hynix', fiscalYearEnd: '12월', reportingCurrency: 'KRW', filingSystem: 'opendart', adr: { enabled: false, ratio: null }, splitHistory: [],
  latestAnnual: dartFiling('20260317000635', '11011', '2025-12-31', 2025, 'FY'), latestQuarter: dartFiling('20260515002287', '11013', '2026-03-31', 2026, 'Q1'), latestAnnualDilutedEps: null,
  auditedPrice: { value: 1_842_000, currency: 'KRW', asOf: '2026-07-17', session: 'regularClose', sourceId: 'kis-openapi:000660.KS:2026-07-17', sourceUrl: '/api/market-prices?ticker=000660.KS' },
  externalPerChecks: [external('Npay 증권', 17.79, '지배기업 귀속 최근 4분기 순이익과 수정평균발행주식수 · 내부 공시 EPS 미확보', '2026-07-17', 'https://finance.naver.com/item/main.naver?code=000660', 'definition_difference'), external('Daum 금융', 33.56, '표시 EPS의 기간 정의가 최근 4분기 기준과 다름', '2026-07-16', 'https://finance.daum.net/quotes/A000660', 'definition_difference')],
};
export default entry;
