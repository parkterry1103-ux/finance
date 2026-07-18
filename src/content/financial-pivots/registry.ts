import { companyProfiles } from '../company-profiles/entries.js';
import { valuationReadinessCompanies } from '../valuation/companies.js';
import { valuationBenchmarkSnapshot } from '../valuation/benchmarks/industry-2026-01.js';
import type {
  FinancialMetricDefinition,
  FinancialMetricGroupId,
  FinancialPivotCompany,
  IndustryComparison,
} from './types.js';

const peerGroups: Record<string, string[]> = {
  'sk-hynix': ['nvidia', 'micron'],
  nvidia: ['sk-hynix', 'micron'],
  micron: ['sk-hynix', 'nvidia'],
  dell: ['supermicro'],
  supermicro: ['dell'],
};

export const financialPivotCompanies: FinancialPivotCompany[] = valuationReadinessCompanies.map((company) => {
  const profile = companyProfiles.find((item) => item.slug === company.companySlug);
  if (!profile) throw new Error(`Company profile missing for financial pivot: ${company.companySlug}`);
  return {
    companySlug: company.companySlug,
    companyId: profile.companyId,
    companyName: company.companyName,
    englishName: profile.englishName,
    ticker: company.ticker,
    exchange: profile.exchange,
    country: company.country,
    currency: company.currency,
    corpCode: company.corpCode,
    cik: company.cik,
    industry: company.industry,
    benchmarkIndustry: company.benchmarkIndustry,
    peerSlugs: peerGroups[company.companySlug] ?? [],
  };
});

export const financialMetricGroupLabels: Record<FinancialMetricGroupId, string> = {
  growth: '성장',
  profitability: '수익성',
  cashFlow: '현금흐름',
  capitalEfficiency: '자본효율',
  balanceSheet: '재무안전성',
  perShare: '주당지표',
};

export const financialMetricDefinitions: FinancialMetricDefinition[] = [
  { id: 'revenue', label: '매출', group: 'growth', format: 'amount', change: 'percent', description: '고객에게 제품과 서비스를 제공해 인식한 수익입니다.' },
  { id: 'grossProfit', label: '매출총이익', group: 'growth', format: 'amount', change: 'percent', description: '매출에서 직접 원가를 뺀 금액입니다.' },
  { id: 'operatingIncome', label: '영업이익', group: 'growth', format: 'amount', change: 'percent', description: '본업에서 남긴 이익입니다.' },
  { id: 'netIncome', label: '순이익', group: 'growth', format: 'amount', change: 'percent', description: '금융·세금 등을 반영한 최종 이익입니다.' },
  { id: 'grossMargin', label: '매출총이익률', group: 'profitability', format: 'percent', change: 'percentagePoint', description: '매출 100원 중 직접 원가를 빼고 남긴 비율입니다.', calculation: '매출총이익 ÷ 매출' },
  { id: 'operatingMargin', label: '영업이익률', group: 'profitability', format: 'percent', change: 'percentagePoint', description: '매출 100원 중 본업에서 남긴 이익의 비율입니다.', calculation: '영업이익 ÷ 매출' },
  { id: 'netMargin', label: '순이익률', group: 'profitability', format: 'percent', change: 'percentagePoint', description: '매출 100원 중 최종적으로 남긴 이익의 비율입니다.', calculation: '순이익 ÷ 매출' },
  { id: 'operatingCashFlow', label: '영업현금흐름', group: 'cashFlow', format: 'amount', change: 'percent', description: '본업으로 실제 유입된 현금입니다.' },
  { id: 'capitalExpenditure', label: '설비투자', group: 'cashFlow', format: 'amount', change: 'percent', description: '생산·운영 설비를 확보하는 데 쓴 현금입니다.' },
  { id: 'freeCashFlow', label: '잉여현금흐름', group: 'cashFlow', format: 'amount', change: 'percent', description: '영업현금흐름에서 설비투자를 뺀 값입니다.', calculation: '영업현금흐름 - 설비투자' },
  { id: 'freeCashFlowMargin', label: '잉여현금흐름률', group: 'cashFlow', format: 'percent', change: 'percentagePoint', description: '매출 중 잉여현금흐름으로 남은 비율입니다.', calculation: '잉여현금흐름 ÷ 매출' },
  { id: 'returnOnAssets', label: '총자산이익률', group: 'capitalEfficiency', format: 'percent', change: 'percentagePoint', description: '자산 대비 순이익 비율입니다.', calculation: '순이익 ÷ 총자산' },
  { id: 'returnOnEquity', label: '자기자본이익률', group: 'capitalEfficiency', format: 'percent', change: 'percentagePoint', description: '자기자본 대비 순이익 비율입니다.', calculation: '순이익 ÷ 자기자본' },
  { id: 'cashAndEquivalents', label: '현금성자산', group: 'balanceSheet', format: 'amount', change: 'percent', description: '즉시 사용할 수 있는 현금과 현금성 자산입니다.' },
  { id: 'totalDebt', label: '총차입금', group: 'balanceSheet', format: 'amount', change: 'percent', description: '단기와 장기 이자부 부채의 합계입니다.' },
  { id: 'debtToCapital', label: '자본 대비 차입금', group: 'balanceSheet', format: 'percent', change: 'percentagePoint', description: '차입금과 자기자본을 합친 자본 중 차입금의 비율입니다.', calculation: '총차입금 ÷ (총차입금 + 자기자본)' },
  { id: 'currentRatio', label: '유동비율', group: 'balanceSheet', format: 'multiple', change: 'absolute', description: '단기 의무를 유동자산으로 감당할 수 있는 정도입니다.', calculation: '유동자산 ÷ 유동부채' },
  { id: 'basicEps', label: '기본 주당순이익', group: 'perShare', format: 'perShare', change: 'percent', description: '희석성 증권을 반영하기 전 보통주 1주당 순이익입니다.' },
  { id: 'dilutedEps', label: '희석 주당순이익', group: 'perShare', format: 'perShare', change: 'percent', description: '잠재 주식 희석을 반영한 주당 순이익입니다.' },
  { id: 'sharesOutstanding', label: '기말 발행주식수', group: 'perShare', format: 'shares', change: 'percent', description: '해당 공시일 현재 실제 발행된 보통주 수입니다.' },
];

export function financialPivotCompany(slug: string) {
  return financialPivotCompanies.find((company) => company.companySlug === slug);
}

export function industryComparisonFor(company: FinancialPivotCompany): IndustryComparison | null {
  const benchmark = valuationBenchmarkSnapshot.benchmarks.find((item) => item.industry === company.benchmarkIndustry);
  return benchmark && typeof benchmark.debtToCapital === 'number' && typeof benchmark.roic === 'number' && typeof benchmark.sampleSize === 'number' ? {
    id: benchmark.id,
    industry: benchmark.industry,
    asOfDate: benchmark.asOfDate,
    sourceName: benchmark.sourceName,
    sourceReference: benchmark.sourceReference,
    sampleSize: benchmark.sampleSize,
    debtToCapital: benchmark.debtToCapital * 100,
    roic: benchmark.roic * 100,
  } : null;
}
