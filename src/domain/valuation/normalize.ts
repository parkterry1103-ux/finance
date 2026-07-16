import {
  normalizedMetricIds,
  type Consolidation,
  type FinancialPeriodType,
  type NormalizedFinancialFact,
  type NormalizedFinancialPeriod,
  type NormalizedMetricId,
} from './types.js';

export type NormalizationAuditEntry = {
  action: 'selected' | 'excluded' | 'derived';
  sourceId: string;
  metricId: NormalizedMetricId;
  periodEnd: string;
  reason: string;
};

export type SecCompanyFactValue = {
  val: number;
  accn: string;
  fy?: number;
  fp?: string;
  form: string;
  filed: string;
  start?: string;
  end: string;
  frame?: string;
};

export type SecCompanyFactsPayload = {
  cik: number;
  entityName: string;
  facts?: {
    'us-gaap'?: Record<string, {
      label?: string;
      description?: string;
      units?: Record<string, SecCompanyFactValue[]>;
    }>;
  };
};

type ConceptMapping = {
  metricId: NormalizedMetricId;
  concepts: string[];
  statementType: 'incomeStatement' | 'balanceSheet' | 'cashFlowStatement' | 'shares';
  expectedUnit: 'USD' | 'shares' | 'USD/shares';
  pointInTime?: boolean;
};

export const secConceptMappings: ConceptMapping[] = [
  { metricId: 'revenue', concepts: ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet'], statementType: 'incomeStatement', expectedUnit: 'USD' },
  { metricId: 'costOfRevenue', concepts: ['CostOfRevenue', 'CostOfGoodsAndServicesSold'], statementType: 'incomeStatement', expectedUnit: 'USD' },
  { metricId: 'grossProfit', concepts: ['GrossProfit'], statementType: 'incomeStatement', expectedUnit: 'USD' },
  { metricId: 'operatingIncome', concepts: ['OperatingIncomeLoss'], statementType: 'incomeStatement', expectedUnit: 'USD' },
  { metricId: 'ebit', concepts: ['OperatingIncomeLoss'], statementType: 'incomeStatement', expectedUnit: 'USD' },
  { metricId: 'interestExpense', concepts: ['InterestExpenseNonOperating', 'InterestAndDebtExpense'], statementType: 'incomeStatement', expectedUnit: 'USD' },
  { metricId: 'pretaxIncome', concepts: ['IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest', 'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments'], statementType: 'incomeStatement', expectedUnit: 'USD' },
  { metricId: 'incomeTaxExpense', concepts: ['IncomeTaxExpenseBenefit'], statementType: 'incomeStatement', expectedUnit: 'USD' },
  { metricId: 'netIncome', concepts: ['NetIncomeLoss', 'ProfitLoss'], statementType: 'incomeStatement', expectedUnit: 'USD' },
  { metricId: 'dilutedEps', concepts: ['EarningsPerShareDiluted'], statementType: 'incomeStatement', expectedUnit: 'USD/shares' },
  { metricId: 'cashAndEquivalents', concepts: ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'shortTermInvestments', concepts: ['ShortTermInvestments', 'MarketableSecuritiesCurrent'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'accountsReceivable', concepts: ['AccountsReceivableNetCurrent'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'inventory', concepts: ['InventoryNet'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'accountsPayable', concepts: ['AccountsPayableCurrent'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'currentAssets', concepts: ['AssetsCurrent'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'currentLiabilities', concepts: ['LiabilitiesCurrent'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'shortTermDebt', concepts: ['ShortTermBorrowings', 'LongTermDebtCurrent', 'ShortTermDebtCurrent'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'longTermDebt', concepts: ['LongTermDebtNoncurrent', 'LongTermDebt'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'leaseLiabilities', concepts: ['OperatingLeaseLiability', 'FinanceLeaseLiability'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'totalDebt', concepts: ['LongTermDebtAndFinanceLeaseObligationsCurrent', 'LongTermDebtAndFinanceLeaseObligations'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'totalAssets', concepts: ['Assets'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'totalEquity', concepts: ['StockholdersEquity', 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'minorityInterest', concepts: ['MinorityInterest', 'NoncontrollingInterestInConsolidatedEntity'], statementType: 'balanceSheet', expectedUnit: 'USD', pointInTime: true },
  { metricId: 'operatingCashFlow', concepts: ['NetCashProvidedByUsedInOperatingActivities'], statementType: 'cashFlowStatement', expectedUnit: 'USD' },
  { metricId: 'depreciationAndAmortization', concepts: ['DepreciationDepletionAndAmortization', 'DepreciationDepletionAndAmortizationPropertyPlantAndEquipment', 'Depreciation'], statementType: 'cashFlowStatement', expectedUnit: 'USD' },
  { metricId: 'capitalExpenditure', concepts: ['PaymentsToAcquirePropertyPlantAndEquipment', 'PaymentsToAcquireProductiveAssets'], statementType: 'cashFlowStatement', expectedUnit: 'USD' },
  { metricId: 'purchasesOfPPE', concepts: ['PaymentsToAcquirePropertyPlantAndEquipment', 'PaymentsToAcquireProductiveAssets'], statementType: 'cashFlowStatement', expectedUnit: 'USD' },
  { metricId: 'purchasesOfIntangibles', concepts: ['PaymentsToAcquireIntangibleAssets'], statementType: 'cashFlowStatement', expectedUnit: 'USD' },
  { metricId: 'stockBasedCompensation', concepts: ['ShareBasedCompensation'], statementType: 'cashFlowStatement', expectedUnit: 'USD' },
  { metricId: 'basicShares', concepts: ['WeightedAverageNumberOfSharesOutstandingBasic'], statementType: 'shares', expectedUnit: 'shares' },
  { metricId: 'dilutedShares', concepts: ['WeightedAverageNumberOfDilutedSharesOutstanding'], statementType: 'shares', expectedUnit: 'shares' },
  { metricId: 'sharesOutstanding', concepts: ['CommonStockSharesOutstanding', 'EntityCommonStockSharesOutstanding'], statementType: 'shares', expectedUnit: 'shares', pointInTime: true },
];

function daysBetween(start?: string, end?: string) {
  if (!start || !end) return null;
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000);
}

function sourceRank(fact: NormalizedFinancialFact) {
  const amended = /\/A$/i.test(fact.filingType) ? 1 : 0;
  const consolidated = fact.consolidation === 'consolidated' ? 2 : fact.consolidation === 'unknown' ? 1 : 0;
  const duration = daysBetween(fact.periodStart, fact.periodEnd);
  const durationFit = fact.periodType === 'annual' && duration !== null ? -Math.abs(duration - 365) : 0;
  return [amended, consolidated, durationFit, Date.parse(fact.filedAt) || 0];
}

function compareRank(a: NormalizedFinancialFact, b: NormalizedFinancialFact) {
  const aRank = sourceRank(a);
  const bRank = sourceRank(b);
  for (let index = 0; index < aRank.length; index += 1) {
    if (aRank[index] !== bRank[index]) return bRank[index] - aRank[index];
  }
  return b.sourceId.localeCompare(a.sourceId);
}

export function selectPreferredFacts(facts: NormalizedFinancialFact[]) {
  const audit: NormalizationAuditEntry[] = [];
  const groups = new Map<string, NormalizedFinancialFact[]>();
  facts.forEach((fact) => {
    const contextStart = fact.periodType === 'quarterly' ? fact.periodStart ?? '' : '';
    const key = [fact.companySlug, fact.metricId, fact.periodType, contextStart, fact.periodEnd, fact.currency, fact.unit].join('|');
    groups.set(key, [...(groups.get(key) ?? []), fact]);
  });
  const selected = [...groups.values()].map((candidates) => {
    const ordered = [...candidates].sort(compareRank);
    const winner = ordered[0];
    const hadOlderFiling = ordered.length > 1;
    const chosen = hadOlderFiling && /\/A$/i.test(winner.filingType)
      ? { ...winner, qualityStatus: 'restated' as const }
      : winner;
    audit.push({ action: 'selected', sourceId: chosen.sourceId, metricId: chosen.metricId, periodEnd: chosen.periodEnd, reason: hadOlderFiling ? 'latest applicable filing/context selected' : 'only applicable filing/context' });
    ordered.slice(1).forEach((fact) => audit.push({ action: 'excluded', sourceId: fact.sourceId, metricId: fact.metricId, periodEnd: fact.periodEnd, reason: `superseded by ${chosen.sourceId}` }));
    return chosen;
  });
  return { facts: selected.sort((a, b) => a.periodEnd.localeCompare(b.periodEnd) || a.metricId.localeCompare(b.metricId)), audit };
}

function bestConceptValues(payload: SecCompanyFactsPayload, mapping: ConceptMapping) {
  const facts = payload.facts?.['us-gaap'] ?? {};
  const candidates = mapping.concepts.flatMap((concept, priority) => {
    const values = facts[concept]?.units?.[mapping.expectedUnit] ?? [];
    const usable = values.filter((value) => {
      if (!Number.isFinite(value.val) || !/^10-(?:K|Q)(?:\/A)?$/.test(value.form)) return false;
      if (mapping.pointInTime) return !value.start;
      const duration = daysBetween(value.start, value.end);
      return Boolean(value.start) && duration !== null && duration >= 300 && duration <= 400 && /^10-K(?:\/A)?$/.test(value.form);
    });
    return usable.length ? [{ concept, priority, values: usable }] : [];
  });
  return candidates.sort((a, b) => b.values.length - a.values.length || a.priority - b.priority)[0];
}

function secValueToNormalizedFact(
  payload: SecCompanyFactsPayload,
  companySlug: string,
  mapping: ConceptMapping,
  concept: string,
  value: SecCompanyFactValue,
): NormalizedFinancialFact {
  const isShares = mapping.expectedUnit === 'shares';
  const isPerShare = mapping.expectedUnit === 'USD/shares';
  return {
    companySlug,
    metricId: mapping.metricId,
    value: isPerShare ? value.val : value.val / 1_000_000,
    currency: 'USD',
    unit: isPerShare ? 'USD/share' : isShares ? 'million shares' : 'million',
    periodStart: value.start,
    periodEnd: value.end,
    periodType: mapping.pointInTime ? 'pointInTime' : 'annual',
    fiscalYear: Number(value.end.slice(0, 4)),
    fiscalQuarter: value.fp,
    sourceSystem: 'sec',
    sourceId: `sec:${String(payload.cik).padStart(10, '0')}:${value.accn}:${concept}:${value.end}`,
    filingType: value.form,
    filedAt: value.filed,
    accessionOrReceiptNumber: value.accn,
    taxonomyConcept: `us-gaap:${concept}`,
    statementType: mapping.statementType,
    consolidation: 'consolidated',
    qualityStatus: /\/A$/i.test(value.form) ? 'restated' : 'ok',
    frame: value.frame,
  };
}

export function normalizeSecCompanyFacts(payload: SecCompanyFactsPayload, companySlug: string) {
  const rawFacts = secConceptMappings.flatMap((mapping) => {
    const selectedConcept = bestConceptValues(payload, mapping);
    return selectedConcept
      ? selectedConcept.values.map((value) => secValueToNormalizedFact(payload, companySlug, mapping, selectedConcept.concept, value))
      : [];
  });
  return selectPreferredFacts(rawFacts);
}

export function factsToAnnualPeriods(facts: NormalizedFinancialFact[], minimumMetricCount = 2): NormalizedFinancialPeriod[] {
  const annualFacts = facts.filter((fact) => fact.periodType === 'annual');
  const pointInTimeFacts = facts.filter((fact) => fact.periodType === 'pointInTime');
  const grouped = new Map<string, NormalizedFinancialFact[]>();
  annualFacts.forEach((fact) => grouped.set(fact.periodEnd, [...(grouped.get(fact.periodEnd) ?? []), fact]));
  pointInTimeFacts.forEach((fact) => {
    if (grouped.has(fact.periodEnd)) grouped.set(fact.periodEnd, [...(grouped.get(fact.periodEnd) ?? []), fact]);
  });
  return [...grouped.entries()].flatMap(([periodEnd, periodFacts]) => {
    const metrics = Object.fromEntries(periodFacts.map((fact) => [fact.metricId, fact.value])) as Partial<Record<NormalizedMetricId, number>>;
    if (Object.keys(metrics).length < minimumMetricCount || metrics.revenue === undefined) return [];
    return [{
      periodEnd,
      periodType: 'annual' as const,
      fiscalYear: Math.max(...periodFacts.map((fact) => fact.fiscalYear ?? Number(periodEnd.slice(0, 4)))),
      currency: 'USD',
      unit: 'million' as const,
      metrics,
      sourceIds: [...new Set(periodFacts.map((fact) => fact.sourceId))].sort(),
    }];
  }).sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
}

export function deriveSingleQuarter(currentYtd: NormalizedFinancialFact, previousYtd: NormalizedFinancialFact, fiscalQuarter: string) {
  const comparable = currentYtd.companySlug === previousYtd.companySlug
    && currentYtd.metricId === previousYtd.metricId
    && currentYtd.periodStart === previousYtd.periodStart
    && currentYtd.currency === previousYtd.currency
    && currentYtd.unit === previousYtd.unit
    && currentYtd.consolidation === previousYtd.consolidation
    && currentYtd.sourceSystem === previousYtd.sourceSystem;
  if (!comparable || currentYtd.periodEnd <= previousYtd.periodEnd) {
    throw new Error('YTD facts must have matching basis and increasing period ends.');
  }
  const fact: NormalizedFinancialFact = {
    ...currentYtd,
    value: currentYtd.value - previousYtd.value,
    periodStart: previousYtd.periodEnd,
    periodType: 'quarterly',
    fiscalQuarter,
    sourceId: `derived:${currentYtd.sourceId}:${previousYtd.sourceId}`,
    taxonomyConcept: `derived:${currentYtd.taxonomyConcept}`,
    qualityStatus: 'derived',
    derivedFromMetricIds: [currentYtd.metricId],
  };
  const audit: NormalizationAuditEntry = { action: 'derived', sourceId: fact.sourceId, metricId: fact.metricId, periodEnd: fact.periodEnd, reason: `${fiscalQuarter} single quarter = current YTD - previous YTD` };
  return { fact, audit };
}

export function buildTtm(quarterlyFacts: NormalizedFinancialFact[]) {
  if (quarterlyFacts.length !== 4) throw new Error('TTM requires exactly four single-quarter facts.');
  const ordered = [...quarterlyFacts].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  const basis = ordered[0];
  const comparable = ordered.every((fact) => fact.companySlug === basis.companySlug
    && fact.metricId === basis.metricId
    && fact.periodType === 'quarterly'
    && fact.currency === basis.currency
    && fact.unit === basis.unit
    && fact.consolidation === basis.consolidation);
  if (!comparable || new Set(ordered.map((fact) => fact.periodEnd)).size !== 4) throw new Error('TTM facts must be four unique comparable quarters.');
  return {
    ...basis,
    value: ordered.reduce((sum, fact) => sum + fact.value, 0),
    periodStart: ordered[0].periodStart,
    periodEnd: ordered[3].periodEnd,
    periodType: 'ttm' as const,
    fiscalQuarter: 'TTM',
    sourceId: `derived:ttm:${ordered.map((fact) => fact.sourceId).join(':')}`,
    taxonomyConcept: `derived:ttm:${basis.taxonomyConcept}`,
    qualityStatus: 'derived' as const,
    derivedFromMetricIds: [basis.metricId],
  };
}

export type OpenDartRow = {
  account_id?: string;
  account_nm?: string;
  sj_div?: string;
  thstrm_amount?: string;
  currency?: string;
};

const dartAccountNames: Partial<Record<NormalizedMetricId, string[]>> = {
  revenue: ['매출액', '영업수익'],
  operatingIncome: ['영업이익'],
  pretaxIncome: ['법인세비용차감전순이익'],
  incomeTaxExpense: ['법인세비용'],
  netIncome: ['당기순이익'],
  cashAndEquivalents: ['현금및현금성자산'],
  accountsReceivable: ['매출채권'],
  inventory: ['재고자산'],
  accountsPayable: ['매입채무'],
  currentAssets: ['유동자산'],
  currentLiabilities: ['유동부채'],
  totalAssets: ['자산총계'],
  totalEquity: ['자본총계'],
  operatingCashFlow: ['영업활동 현금흐름', '영업활동으로 인한 현금흐름'],
  depreciationAndAmortization: ['감가상각비', '감가상각비 및 무형자산상각비'],
  capitalExpenditure: ['유형자산의 취득'],
  purchasesOfPPE: ['유형자산의 취득'],
  dilutedShares: ['희석주당이익 산출에 사용된 가중평균유통보통주식수'],
};

function parseDartAmount(value?: string) {
  if (!value) return null;
  const normalized = value.replace(/[\s,]/g, '').replace(/^\((.*)\)$/, '-$1');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeOpenDartRows({
  rows,
  companySlug,
  periodStart,
  periodEnd,
  fiscalYear,
  fiscalQuarter,
  reportCode,
  receiptNumber,
  filedAt,
  fsDiv,
}: {
  rows: OpenDartRow[];
  companySlug: string;
  periodStart?: string;
  periodEnd: string;
  fiscalYear: number;
  fiscalQuarter?: string;
  reportCode: string;
  receiptNumber: string;
  filedAt: string;
  fsDiv: 'CFS' | 'OFS';
}) {
  const consolidation: Consolidation = fsDiv === 'CFS' ? 'consolidated' : 'separate';
  const periodType: FinancialPeriodType = reportCode === '11011' ? 'annual' : 'quarterly';
  const facts = Object.entries(dartAccountNames).flatMap(([metricId, names]) => {
    const row = rows.find((candidate) => names?.some((name) => candidate.account_nm?.replace(/\s/g, '').includes(name.replace(/\s/g, ''))));
    const amount = parseDartAmount(row?.thstrm_amount);
    if (!row || amount === null || !normalizedMetricIds.includes(metricId as NormalizedMetricId)) return [];
    return [{
      companySlug,
      metricId: metricId as NormalizedMetricId,
      value: amount / 1_000_000,
      currency: row.currency || 'KRW',
      unit: 'million',
      periodStart,
      periodEnd,
      periodType,
      fiscalYear,
      fiscalQuarter,
      sourceSystem: 'opendart' as const,
      sourceId: `opendart:${receiptNumber}:${fsDiv}:${row.account_id || metricId}`,
      filingType: reportCode,
      filedAt,
      accessionOrReceiptNumber: receiptNumber,
      taxonomyConcept: row.account_id || row.account_nm || metricId,
      statementType: row.sj_div || 'unknown',
      consolidation,
      qualityStatus: 'ok' as const,
    }];
  });
  return selectPreferredFacts(facts);
}
