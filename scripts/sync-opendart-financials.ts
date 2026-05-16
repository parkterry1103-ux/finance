import { companies } from '../src/data.js';
import { fetchKoreanFinancialsFromOpenDart } from '../src/services/financials.js';
import { envValue, errorMessage, isDirectRun, nowIso, recordSyncRun, upsertRows } from './sync-utils.js';

function metricValue(summary, key) {
  return summary.metrics.find((metric) => metric.key === key)?.value ?? null;
}

export async function syncOpenDartFinancials() {
  const startedAt = nowIso();
  let insertedCount = 0;
  let updatedCount = 0;
  const errors = [];

  if (!envValue('OPENDART_API_KEY')) {
    const message = 'OPENDART_API_KEY missing. OpenDART sync skipped and frontend fallback remains active.';
    await recordSyncRun({ source: 'opendart-financials', status: 'skipped', startedAt, errorMessage: message });
    return { source: 'opendart-financials', status: 'skipped', insertedCount, updatedCount, errors: [message] };
  }

  for (const company of companies.filter((item) => item.country === 'KR')) {
    if (!company.corpCode) {
      console.log(`[opendart] skip ${company.name}: dart corpCode missing`);
      continue;
    }

    try {
      const summary = await fetchKoreanFinancialsFromOpenDart(company.corpCode);
      if (!summary) continue;

      await upsertRows(
        'companies',
        {
          id: company.id,
          name: company.name,
          ticker: company.ticker ?? null,
          market: 'KR',
          sector: company.sector,
          dart_corp_code: company.corpCode,
          sec_cik: null,
          updated_at: nowIso(),
        },
        ['id'],
      );

      const filingId = `${company.id}-${summary.fiscalYear}-${summary.reportType}`;
      await upsertRows(
        'filings',
        {
          id: filingId,
          company_id: company.id,
          market: 'KR',
          source: 'OpenDART',
          form_type: summary.reportType,
          report_type: summary.reportType,
          fiscal_year: summary.fiscalYear,
          fiscal_period: null,
          filed_at: summary.updatedAt,
          accession_number: null,
          dart_rcept_no: company.dartRcpNo ?? null,
          direct_url: company.reportUrl ?? company.filingSourceUrl ?? company.sourceDirectUrl ?? null,
          search_url: company.sourceSearchUrl ?? null,
          raw_url: null,
          created_at: nowIso(),
        },
        ['id'],
      );

      await upsertRows(
        'financial_metrics',
        {
          company_id: company.id,
          filing_id: filingId,
          fiscal_year: summary.fiscalYear,
          fiscal_period: summary.reportType,
          revenue: metricValue(summary, 'revenue'),
          operating_income: metricValue(summary, 'operatingIncome'),
          net_income: metricValue(summary, 'netIncome'),
          operating_cash_flow: metricValue(summary, 'cashFlow'),
          debt_ratio: metricValue(summary, 'debtRatio'),
          source: 'OpenDART',
          updated_at: nowIso(),
        },
        ['company_id', 'fiscal_year', 'fiscal_period', 'source'],
      );
      insertedCount += 1;
    } catch (error) {
      errors.push(`${company.name}: ${errorMessage(error)}`);
    }
  }

  const status = errors.length ? 'partial' : 'success';
  await recordSyncRun({ source: 'opendart-financials', status, startedAt, insertedCount, updatedCount, errorMessage: errors.join('\n') });
  return { source: 'opendart-financials', status, insertedCount, updatedCount, errors };
}

if (isDirectRun(import.meta.url)) {
  syncOpenDartFinancials()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch(async (error) => {
      await recordSyncRun({ source: 'opendart-financials', status: 'failed', startedAt: nowIso(), errorMessage: errorMessage(error) });
      console.error(error);
      globalThis.process?.exit?.(1);
    });
}
