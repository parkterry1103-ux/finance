import { companies } from '../src/data.js';
import { resolveCompanyFilingLinks } from '../src/services/filings.js';
import { envValue, errorMessage, hasSupabaseConfig, isDirectRun, normalizeDate, nowIso, recordSyncRun, secHeaders, upsertRows } from './sync-utils.js';

const reportNames = ['분기보고서', '반기보고서', '사업보고서'];

function projectFile(path) {
  const runtime = globalThis as typeof globalThis & { process?: { cwd?: () => string } };
  return `${runtime.process?.cwd?.() ?? '.'}/${path}`;
}

function inferDartReportType(reportName = '') {
  if (reportName.includes('분기보고서')) return '분기보고서';
  if (reportName.includes('반기보고서')) return '반기보고서';
  if (reportName.includes('사업보고서')) return '사업보고서';
  return reportName || 'DART 보고서';
}

function inferDartFiscalPeriod(reportName = '') {
  if (reportName.includes('분기보고서')) return reportName.includes('3') ? '3Q' : '1Q';
  if (reportName.includes('반기보고서')) return '2Q';
  if (reportName.includes('사업보고서')) return 'FY';
  return '';
}

function fiscalYearFromDate(value = '') {
  return String(value).slice(0, 4) || '';
}

async function fetchDartLatestFiling(company) {
  const apiKey = envValue('OPENDART_API_KEY');
  if (!apiKey || !company.corpCode) return null;
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(end.getFullYear() - 2);
  const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
  const params = new URLSearchParams({
    crtfc_key: apiKey,
    corp_code: company.corpCode,
    bgn_de: formatDate(start),
    end_de: formatDate(end),
    page_count: '100',
    sort: 'date',
    sort_mth: 'desc',
  });
  const response = await fetch(`https://opendart.fss.or.kr/api/list.json?${params.toString()}`);
  if (!response.ok) throw new Error(`OpenDART list ${response.status}`);
  const payload = await response.json();
  const rows = Array.isArray(payload.list) ? payload.list : [];
  const row = rows.find((item) => reportNames.some((name) => String(item.report_nm ?? '').includes(name)));
  if (!row?.rcept_no) return null;
  const reportType = inferDartReportType(row.report_nm);
  const filingDate = String(row.rcept_dt ?? '');
  return {
    companyId: company.id,
    market: 'KR',
    source: 'OpenDART',
    formType: reportType,
    reportType,
    fiscalYear: fiscalYearFromDate(filingDate),
    fiscalPeriod: inferDartFiscalPeriod(row.report_nm),
    filingDate,
    accessionNumber: null,
    dartRceptNo: row.rcept_no,
    directUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${row.rcept_no}`,
    searchUrl: company.sourceSearchUrl ?? `https://dart.fss.or.kr/dsab007/main.do?option=corp&keyword=${encodeURIComponent(company.legalName || company.name)}`,
    rawUrl: `https://opendart.fss.or.kr/api/list.json?corp_code=${company.corpCode}`,
  };
}

async function fetchSecLatestFiling(company) {
  if (!company.cik) return null;
  const paddedCik = company.cik.padStart(10, '0');
  const response = await fetch(`https://data.sec.gov/submissions/CIK${paddedCik}.json`, { headers: secHeaders() });
  if (!response.ok) throw new Error(`SEC submissions ${response.status}`);
  const payload = await response.json();
  const recent = payload?.filings?.recent ?? {};
  const forms = recent.form ?? [];
  const accessionNumbers = recent.accessionNumber ?? [];
  const filingDates = recent.filingDate ?? [];
  const reportDates = recent.reportDate ?? [];
  const primaryDocuments = recent.primaryDocument ?? [];
  const index = forms.findIndex((form) => form === '10-K' || form === '10-Q');
  if (index < 0 || !accessionNumbers[index] || !primaryDocuments[index]) return null;
  const accessionNumber = accessionNumbers[index];
  const directUrl = `https://www.sec.gov/Archives/edgar/data/${Number(company.cik)}/${String(accessionNumber).replace(/-/g, '')}/${primaryDocuments[index]}`;
  return {
    companyId: company.id,
    market: 'US',
    source: 'SEC EDGAR',
    formType: forms[index],
    reportType: forms[index],
    fiscalYear: fiscalYearFromDate(reportDates[index] ?? filingDates[index]),
    fiscalPeriod: forms[index] === '10-K' ? 'FY' : 'Quarter',
    filingDate: filingDates[index] ?? '',
    accessionNumber,
    dartRceptNo: null,
    directUrl,
    searchUrl: company.sourceSearchUrl ?? `https://www.sec.gov/search-filings?keys=${encodeURIComponent(company.legalName || company.name)}`,
    rawUrl: `https://data.sec.gov/submissions/CIK${paddedCik}.json`,
  };
}

function toFilingRow(item) {
  return {
    id: item.accessionNumber || item.dartRceptNo || `${item.companyId}-${item.reportType}-${item.filingDate}`,
    company_id: item.companyId,
    market: item.market,
    source: item.source,
    form_type: item.formType,
    report_type: item.reportType,
    fiscal_year: item.fiscalYear,
    fiscal_period: item.fiscalPeriod,
    filed_at: normalizeDate(item.filingDate) || null,
    accession_number: item.accessionNumber,
    dart_rcept_no: item.dartRceptNo,
    direct_url: item.directUrl,
    search_url: item.searchUrl,
    raw_url: item.rawUrl,
    created_at: nowIso(),
  };
}

async function writeJsonReport(result) {
  const fs = await import('node:fs/promises');
  const outputDir = projectFile('reports');
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(projectFile('reports/filing-links-report.json'), JSON.stringify(result, null, 2), 'utf-8');
}

export async function syncFilingLinks() {
  const startedAt = nowIso();
  const linked = [];
  const skipped = [];
  const errors = [];

  for (const company of companies) {
    const current = resolveCompanyFilingLinks(company);
    if (current.status === 'direct') {
      skipped.push({ companyId: company.id, companyName: company.name, status: 'direct-exists' });
      continue;
    }

    try {
      const item = company.country === 'KR' ? await fetchDartLatestFiling(company) : await fetchSecLatestFiling(company);
      if (!item?.directUrl) {
        skipped.push({ companyId: company.id, companyName: company.name, status: 'not-found' });
        continue;
      }
      linked.push(item);
    } catch (error) {
      const message = `${company.id}: ${errorMessage(error)}`;
      errors.push(message);
      skipped.push({ companyId: company.id, companyName: company.name, status: 'error', error: message });
    }
  }

  const rows = linked.map(toFilingRow);
  let dbResult = { inserted: 0, updated: 0, skipped: rows.length };
  if (rows.length && hasSupabaseConfig()) {
    const companyRows = linked
      .map((item) => companies.find((company) => company.id === item.companyId))
      .filter(Boolean)
      .map((company) => ({
        id: company.id,
        name: company.name,
        ticker: company.ticker ?? null,
        market: company.country,
        sector: company.sector,
        dart_corp_code: company.corpCode ?? null,
        sec_cik: company.cik ?? null,
        updated_at: nowIso(),
      }));
    if (companyRows.length) {
      await upsertRows('companies', companyRows, ['id']);
    }

    const secRows = rows.filter((row) => row.accession_number);
    const dartRows = rows.filter((row) => row.dart_rcept_no);
    let inserted = 0;
    let updated = 0;
    if (secRows.length) {
      const secResult = await upsertRows('filings', secRows, ['source', 'accession_number']);
      inserted += secResult.inserted ?? 0;
      updated += secResult.updated ?? 0;
    }
    if (dartRows.length) {
      const dartResult = await upsertRows('filings', dartRows, ['source', 'dart_rcept_no']);
      inserted += dartResult.inserted ?? 0;
      updated += dartResult.updated ?? 0;
    }
    dbResult = { inserted, updated, skipped: 0 };
  }

  const status = errors.length ? 'partial' : 'success';
  const result = {
    source: 'filing-links',
    status,
    insertedCount: dbResult.inserted ?? 0,
    updatedCount: dbResult.updated ?? 0,
    linked,
    skipped,
    errors,
    dbEnabled: hasSupabaseConfig(),
  };

  await writeJsonReport(result);
  await recordSyncRun({
    source: 'filing-links',
    status,
    startedAt,
    insertedCount: result.insertedCount,
    updatedCount: result.updatedCount,
    errorMessage: errors.join('\n'),
  });
  return result;
}

if (isDirectRun(import.meta.url)) {
  syncFilingLinks()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch(async (error) => {
      await recordSyncRun({ source: 'filing-links', status: 'failed', startedAt: nowIso(), errorMessage: errorMessage(error) });
      console.error(error);
      globalThis.process?.exit?.(1);
    });
}
