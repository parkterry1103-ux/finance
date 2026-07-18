import type { ExternalMultipleCheck, FinancialFilingIdentity } from './types.js';

export type FinancialAuditCompany = {
  companySlug: string;
  fiscalYearEnd: string;
  reportingCurrency: 'KRW' | 'USD';
  filingSystem: 'sec' | 'opendart';
  adr: { enabled: boolean; ratio: string | null };
  splitHistory: string[];
  latestAnnual: FinancialFilingIdentity;
  latestQuarter: FinancialFilingIdentity;
  latestAnnualDilutedEps: { value: number; fiscalYear: number; sourceFilingId: string } | null;
  auditedPrice: { value: number; currency: 'KRW' | 'USD'; asOf: '2026-07-17'; session: 'regularClose'; sourceId: string; sourceUrl: string };
  externalPerChecks: ExternalMultipleCheck[];
};

const retrievedAt = '2026-07-18T15:30:00+09:00';
const secUrl = (cik: string, accession: string) => `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accession.replace(/-/g, '')}/${accession}-index.htm`;
export const secFiling = (cik: string, form: '10-Q' | '10-K', accession: string, filedAt: string, reportPeriod: string, fiscalYear: number, fiscalQuarter: string): FinancialFilingIdentity => ({ system: 'sec', formOrReportCode: form, accessionOrReceiptNumber: accession, filedAt, reportPeriod, fiscalYear, fiscalQuarter, consolidated: true, amended: false, sourceUrl: secUrl(cik, accession) });
export const dartFiling = (receipt: string, reportCode: '11011' | '11013', reportPeriod: string, fiscalYear: number, fiscalQuarter: string): FinancialFilingIdentity => ({ system: 'opendart', formOrReportCode: reportCode, accessionOrReceiptNumber: receipt, filedAt: `${receipt.slice(0, 4)}-${receipt.slice(4, 6)}-${receipt.slice(6, 8)}`, reportPeriod, fiscalYear, fiscalQuarter, consolidated: true, amended: false, sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${receipt}` });
export const external = (provider: string, value: number, definition: string, asOf: string, sourceUrl: string, matchStatus: ExternalMultipleCheck['matchStatus']): ExternalMultipleCheck => ({
  provider,
  value,
  definition,
  asOf,
  multipleBasis: /forward|선행/i.test(definition) ? 'forward' : /trailing|ttm|최근 4분기|최근 회계연도/i.test(definition) ? 'trailing' : 'definition_not_disclosed',
  epsBasis: /diluted|희석/i.test(definition) ? 'diluted' : /basic|기본/i.test(definition) ? 'basic' : 'definition_not_disclosed',
  accountingBasis: /gaap/i.test(definition) ? 'gaap' : /adjusted|조정/i.test(definition) ? 'adjusted' : 'definition_not_disclosed',
  priceAsOf: asOf,
  financialPeriod: /최근 회계연도/i.test(definition) ? '최근 완료 회계연도 · provider 세부 기간 미표시' : /trailing|ttm|최근 4분기/i.test(definition) ? '최근 4분기 · provider 세부 분기 미표시' : 'provider 재무 기간 미표시',
  retrievedAt,
  sourceUrl,
  matchStatus,
});
