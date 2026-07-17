import type { FinancialPivotCompany, FinancialPivotPeriodType, FinancialSeriesResponse } from '../content/financial-pivots/types.js';

const REQUEST_TIMEOUT_MS = 65_000;

export async function fetchFinancialSeries(company: FinancialPivotCompany, period: FinancialPivotPeriodType) {
  const params = new URLSearchParams({
    country: company.country,
    companyId: company.companyId,
    period,
  });
  if (company.cik) params.set('cik', company.cik);
  if (company.corpCode) params.set('corpCode', company.corpCode);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`/api/financials?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`financials ${response.status}`);
    return (await response.json()) as FinancialSeriesResponse;
  } finally {
    window.clearTimeout(timeout);
  }
}
