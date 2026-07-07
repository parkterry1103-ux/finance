import {
  classifySecFilingForm,
  enabledSecTrackedCompanies,
  matchesSecFormPattern,
  normalizeSecFormType,
  type MarketSecFiling,
  type SecTrackedCompany,
} from '../src/content/disclosures/index.js';
import {
  envValue,
  errorMessage,
  hasSupabaseConfig,
  isDirectRun,
  nowIso,
  recordSyncRun,
  upsertRows,
} from './sync-utils.js';

const REQUEST_TIMEOUT_MS = 12_000;
const REQUEST_RETRIES = 2;
const REQUEST_DELAY_MS = 450;
const DEFAULT_SYNC_DAYS = 30;
const MAX_SYNC_DAYS = 90;
const MAX_RETRY_AFTER_MS = 5_000;

type SecRecentFilings = {
  accessionNumber?: unknown[];
  filingDate?: unknown[];
  reportDate?: unknown[];
  acceptanceDateTime?: unknown[];
  form?: unknown[];
  primaryDocument?: unknown[];
  items?: unknown[];
};

export type SecSubmissionPayload = {
  cik?: unknown;
  name?: unknown;
  filings?: {
    recent?: SecRecentFilings;
  };
};

type CompanySyncResult = {
  ticker: string;
  companyName: string;
  cik: string;
  status: 'success' | 'failed';
  filings: number;
  error?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeSecCik(value: string | number) {
  const digits = String(value).replace(/\D/g, '');
  return digits.padStart(10, '0').slice(-10);
}

export function secSubmissionsUrl(cik: string | number) {
  return `https://data.sec.gov/submissions/CIK${normalizeSecCik(cik)}.json`;
}

export function secArchiveIndexUrl(cik: string | number, accessionNumber: string) {
  const normalizedCik = String(Number(normalizeSecCik(cik)));
  const accessionPath = accessionNumber.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${normalizedCik}/${accessionPath}/${accessionNumber}-index.html`;
}

export function secPrimaryDocumentUrl(cik: string | number, accessionNumber: string, primaryDocument?: string | null) {
  const documentName = String(primaryDocument ?? '').trim();
  if (!documentName) return '';
  const normalizedCik = String(Number(normalizeSecCik(cik)));
  const accessionPath = accessionNumber.replace(/-/g, '');
  return `https://www.sec.gov/Archives/edgar/data/${normalizedCik}/${accessionPath}/${documentName}`;
}

function syncDays() {
  const parsed = Number.parseInt(envValue('SEC_FILINGS_SYNC_DAYS', String(DEFAULT_SYNC_DAYS)), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_SYNC_DAYS;
  return Math.min(Math.max(parsed, 1), MAX_SYNC_DAYS);
}

function secUserAgent() {
  return envValue('SEC_USER_AGENT').trim();
}

function retryDelayMs(response: Response | null, attempt: number) {
  const retryAfter = response?.headers.get('retry-after');
  const retryAfterSeconds = retryAfter ? Number.parseInt(retryAfter, 10) : 0;
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, MAX_RETRY_AFTER_MS);
  }
  return 650 * (attempt + 1);
}

function shouldRetry(response: Response) {
  return response.status === 429 || response.status >= 500;
}

async function fetchSecSubmission(company: SecTrackedCompany, userAgent: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(secSubmissionsUrl(company.cik), {
      signal: controller.signal,
      headers: {
        'User-Agent': userAgent,
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchSecSubmissionWithRetry(company: SecTrackedCompany, userAgent: string) {
  let lastError = '';
  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt += 1) {
    let response: Response | null = null;
    try {
      response = await fetchSecSubmission(company, userAgent);
      if (response.ok) return (await response.json()) as SecSubmissionPayload;
      lastError = `SEC EDGAR HTTP ${response.status}`;
      if (!shouldRetry(response) || attempt >= REQUEST_RETRIES) break;
    } catch (error) {
      lastError = errorMessage(error);
      if (attempt >= REQUEST_RETRIES) break;
    }
    await sleep(retryDelayMs(response, attempt));
  }
  throw new Error(lastError || 'SEC EDGAR request failed');
}

function arrayValue(rows: unknown[] | undefined, index: number) {
  return Array.isArray(rows) ? rows[index] : undefined;
}

function normalizeReportDate(value: unknown) {
  const text = String(value ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function normalizeFiledAt(filingDate: unknown, acceptanceDateTime: unknown) {
  const accepted = String(acceptanceDateTime ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(accepted)) {
    const iso = accepted.endsWith('Z') ? accepted : `${accepted.replace(/\.\d+$/, '')}Z`;
    const timestamp = Date.parse(iso);
    if (!Number.isNaN(timestamp)) return new Date(timestamp).toISOString();
  }
  if (/^\d{14}$/.test(accepted)) {
    const iso = `${accepted.slice(0, 4)}-${accepted.slice(4, 6)}-${accepted.slice(6, 8)}T${accepted.slice(8, 10)}:${accepted.slice(10, 12)}:${accepted.slice(12, 14)}Z`;
    const timestamp = Date.parse(iso);
    if (!Number.isNaN(timestamp)) return new Date(timestamp).toISOString();
  }
  const filed = String(filingDate ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(filed)) return `${filed}T00:00:00.000Z`;
  return nowIso();
}

function filingMatchesCompanyForms(formType: string, company: SecTrackedCompany) {
  return company.forms.some((pattern) => matchesSecFormPattern(formType, pattern));
}

export function normalizeSecFilingRows(payload: SecSubmissionPayload, company: SecTrackedCompany, sinceMs = 0) {
  const recent = payload.filings?.recent;
  const accessionNumbers = recent?.accessionNumber ?? [];
  const rows: MarketSecFiling[] = [];
  const count = Array.isArray(accessionNumbers) ? accessionNumbers.length : 0;

  for (let index = 0; index < count; index += 1) {
    const accessionNumber = String(arrayValue(recent?.accessionNumber, index) ?? '').trim();
    const formType = normalizeSecFormType(String(arrayValue(recent?.form, index) ?? ''));
    if (!accessionNumber || !formType) continue;
    if (!filingMatchesCompanyForms(formType, company)) continue;

    const filedAt = normalizeFiledAt(arrayValue(recent?.filingDate, index), arrayValue(recent?.acceptanceDateTime, index));
    const filedTimestamp = Date.parse(filedAt);
    if (sinceMs && (!Number.isFinite(filedTimestamp) || filedTimestamp < sinceMs)) continue;

    const primaryDocument = String(arrayValue(recent?.primaryDocument, index) ?? '').trim() || null;
    rows.push({
      accessionNumber,
      cik: normalizeSecCik(company.cik),
      companyName: company.companyName,
      ticker: company.ticker,
      formType,
      category: classifySecFilingForm(formType),
      filedAt,
      reportDate: normalizeReportDate(arrayValue(recent?.reportDate, index)),
      primaryDocument,
      source: 'sec-edgar',
      sourceUrl: secArchiveIndexUrl(company.cik, accessionNumber),
    });
  }

  return rows;
}

function toDatabaseRow(item: MarketSecFiling, syncedAt: string) {
  return {
    accession_number: item.accessionNumber,
    cik: item.cik,
    company_name: item.companyName,
    ticker: item.ticker,
    form_type: item.formType,
    filing_category: item.category,
    filed_at: item.filedAt,
    report_date: item.reportDate,
    primary_document: item.primaryDocument,
    source_url: item.sourceUrl,
    source: item.source,
    synced_at: syncedAt,
  };
}

async function existingAccessionNumbers(accessionNumbers: string[]) {
  const uniqueAccessions = Array.from(new Set(accessionNumbers.filter(Boolean)));
  if (!uniqueAccessions.length || !hasSupabaseConfig()) return new Set<string>();

  const existing = new Set<string>();
  for (let index = 0; index < uniqueAccessions.length; index += 80) {
    const chunk = uniqueAccessions.slice(index, index + 80);
    const url = new URL('/rest/v1/market_sec_filings', envValue('SUPABASE_URL'));
    url.searchParams.set('select', 'accession_number');
    url.searchParams.set('accession_number', `in.(${chunk.join(',')})`);

    const response = await fetch(url, {
      headers: {
        apikey: envValue('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${envValue('SUPABASE_SERVICE_ROLE_KEY')}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase market_sec_filings existing query failed: ${response.status}`);
    }

    const rows = await response.json();
    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        if (row?.accession_number) existing.add(String(row.accession_number));
      });
    }
  }

  return existing;
}

function printSummary(result: Awaited<ReturnType<typeof syncSecFilings>>) {
  console.log('SEC EDGAR filing sync');
  console.log(`Tracked companies: ${result.trackedCompanies}`);
  console.log(`Successful companies: ${result.successfulCompanies}`);
  console.log(`Failed companies: ${result.failedCompanies}`);
  console.log(`Fetched filings: ${result.fetched}`);
  console.log(`Inserted: ${result.inserted}`);
  console.log(`Updated: ${result.updated}`);
  result.companyResults.forEach((item) => {
    const suffix = item.status === 'failed' && item.error ? ` · ${item.error}` : ` · ${item.filings} filings`;
    console.log(`${item.ticker} · ${item.companyName} · ${item.status}${suffix}`);
  });
}

export async function syncSecFilings() {
  const startedAt = nowIso();
  const syncedAt = nowIso();
  const companies = enabledSecTrackedCompanies;
  const companyResults: CompanySyncResult[] = [];
  const errors: string[] = [];
  const userAgent = secUserAgent();

  if (!userAgent) {
    const message = 'SEC EDGAR filing sync skipped: SEC_USER_AGENT is not configured.';
    await recordSyncRun({
      source: 'sec-edgar-filings',
      status: 'skipped',
      startedAt,
      errorMessage: message,
    });
    return {
      source: 'sec-edgar-filings',
      status: 'skipped' as const,
      code: 'SEC_USER_AGENT_NOT_CONFIGURED',
      message: 'SEC EDGAR 공시 수집을 위한 User-Agent가 설정되지 않았습니다.',
      trackedCompanies: companies.length,
      successfulCompanies: 0,
      failedCompanies: 0,
      fetched: 0,
      inserted: 0,
      updated: 0,
      syncedAt,
      companyResults,
      errors: [message],
    };
  }

  const sinceMs = Date.now() - syncDays() * 86_400_000;
  const filingsByAccession = new Map<string, MarketSecFiling>();

  for (const company of companies) {
    try {
      const payload = await fetchSecSubmissionWithRetry(company, userAgent);
      const normalizedRows = normalizeSecFilingRows(payload, company, sinceMs);
      normalizedRows.forEach((item) => {
        if (!filingsByAccession.has(item.accessionNumber)) filingsByAccession.set(item.accessionNumber, item);
      });
      companyResults.push({
        ticker: company.ticker,
        companyName: company.companyName,
        cik: company.cik,
        status: 'success',
        filings: normalizedRows.length,
      });
    } catch (error) {
      const message = `${company.ticker} ${company.companyName}: ${errorMessage(error)}`;
      errors.push(message);
      companyResults.push({
        ticker: company.ticker,
        companyName: company.companyName,
        cik: company.cik,
        status: 'failed',
        filings: 0,
        error: errorMessage(error),
      });
    }
    await sleep(REQUEST_DELAY_MS);
  }

  const filings = Array.from(filingsByAccession.values()).sort((a, b) => b.filedAt.localeCompare(a.filedAt));
  let inserted = 0;
  let updated = 0;

  if (filings.length) {
    const existing = await existingAccessionNumbers(filings.map((item) => item.accessionNumber));
    inserted = filings.filter((item) => !existing.has(item.accessionNumber)).length;
    updated = filings.filter((item) => existing.has(item.accessionNumber)).length;
    await upsertRows(
      'market_sec_filings',
      filings.map((item) => toDatabaseRow(item, syncedAt)),
      ['accession_number'],
    );
  }

  const successfulCompanies = companyResults.filter((item) => item.status === 'success').length;
  const failedCompanies = companyResults.filter((item) => item.status === 'failed').length;
  const status = failedCompanies ? 'partial' : 'success';

  await recordSyncRun({
    source: 'sec-edgar-filings',
    status,
    startedAt,
    insertedCount: inserted,
    updatedCount: updated,
    errorMessage: errors.join('\n'),
  });

  return {
    source: 'sec-edgar-filings',
    status,
    trackedCompanies: companies.length,
    successfulCompanies,
    failedCompanies,
    fetched: filings.length,
    inserted,
    updated,
    syncedAt,
    companyResults,
    errors,
  };
}

if (isDirectRun(import.meta.url)) {
  syncSecFilings()
    .then((result) => {
      printSummary(result);
    })
    .catch(async (error) => {
      await recordSyncRun({
        source: 'sec-edgar-filings',
        status: 'failed',
        startedAt: nowIso(),
        errorMessage: errorMessage(error),
      });
      console.error(errorMessage(error));
      globalThis.process?.exit?.(1);
    });
}
