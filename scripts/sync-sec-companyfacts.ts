import { companies } from '../src/data.ts';
import { fetchUSFinancialsFromSEC } from '../src/services/financials.ts';
import { errorMessage, isDirectRun, nowIso, recordSyncRun, upsertRows } from './sync-utils.ts';

function metricValue(summary, key) {
  return summary.metrics.find((metric) => metric.key === key)?.value ?? null;
}

export async function syncSecCompanyFacts() {
  const startedAt = nowIso();
  let insertedCount = 0;
  let updatedCount = 0;
  const errors = [];

  for (const company of companies.filter((item) => item.country === 'US')) {
    if (!company.cik) {
      console.log(`[sec-companyfacts] skip ${company.name}: secCik missing`);
      continue;
    }

    try {
      const summary = await fetchUSFinancialsFromSEC(company.cik);
      if (!summary) continue;

      await upsertRows(
        'companies',
        {
          id: company.id,
          name: company.name,
          ticker: company.ticker ?? null,
          market: 'US',
          sector: company.sector,
          dart_corp_code: null,
          sec_cik: company.cik,
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
          market: 'US',
          source: 'SEC CompanyFacts',
          form_type: summary.reportType,
          report_type: summary.reportType,
          fiscal_year: summary.fiscalYear,
          fiscal_period: null,
          filed_at: summary.updatedAt,
          accession_number: company.secAccessionNumber ?? null,
          dart_rcept_no: null,
          direct_url: company.reportUrl ?? company.filingSourceUrl ?? company.sourceDirectUrl ?? null,
          search_url: company.sourceSearchUrl ?? null,
          raw_url: `https://data.sec.gov/api/xbrl/companyfacts/CIK${company.cik.padStart(10, '0')}.json`,
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
          source: 'SEC CompanyFacts',
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
  await recordSyncRun({ source: 'sec-companyfacts', status, startedAt, insertedCount, updatedCount, errorMessage: errors.join('\n') });
  return { source: 'sec-companyfacts', status, insertedCount, updatedCount, errors };
}

if (isDirectRun(import.meta.url)) {
  syncSecCompanyFacts()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch(async (error) => {
      await recordSyncRun({ source: 'sec-companyfacts', status: 'failed', startedAt: nowIso(), errorMessage: errorMessage(error) });
      console.error(error);
      globalThis.process?.exit?.(1);
    });
}
