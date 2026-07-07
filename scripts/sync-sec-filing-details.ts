import {
  SEC_FILING_DETAIL_PARSER_VERSION,
  normalizeEightKItems,
  parseForm4OwnershipXml,
  type SecFilingParsingStatus,
} from '../src/lib/sec/index.js';
import {
  enabledSecTrackedCompanies,
  normalizeSecFormType,
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
import {
  fetchSecSubmissionWithRetry,
  secPrimaryDocumentUrl,
  type SecSubmissionPayload,
} from './sync-sec-filings.js';

const DETAIL_TARGET_FORMS = new Set(['8-K', '8-K/A', '4', '4/A']);
const EIGHT_K_FORMS = new Set(['8-K', '8-K/A']);
const FORM_4_FORMS = new Set(['4', '4/A']);
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;
const FETCH_LIMIT = 500;
const REQUEST_TIMEOUT_MS = 12_000;
const REQUEST_RETRIES = 2;
const REQUEST_DELAY_MS = 550;
const MAX_RETRY_AFTER_MS = 6_000;

type QueryValue = string | string[] | undefined;

type SecFilingRow = {
  accession_number: string;
  cik: string;
  company_name: string;
  ticker: string;
  form_type: string;
  filed_at: string;
  primary_document?: string | null;
  source_url: string;
};

type SecFilingDetailRow = {
  accession_number: string;
  parser_version: string;
  parsing_status: SecFilingParsingStatus;
};

export type SyncSecFilingDetailsOptions = {
  limit?: number;
  ticker?: string;
  form?: string;
  status?: SecFilingParsingStatus | 'all';
  parserVersion?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampLimit(value: unknown) {
  const parsed = Number.parseInt(String(value ?? DEFAULT_LIMIT), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

function retryDelayMs(response: Response | null, attempt: number) {
  const retryAfter = response?.headers.get('retry-after');
  const retryAfterSeconds = retryAfter ? Number.parseInt(retryAfter, 10) : 0;
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, MAX_RETRY_AFTER_MS);
  }
  return 900 * (attempt + 1);
}

function shouldRetry(response: Response) {
  return response.status === 429 || response.status >= 500;
}

function normalizeFormFilter(value?: string | null) {
  const normalized = normalizeSecFormType(value);
  return DETAIL_TARGET_FORMS.has(normalized) ? normalized : '';
}

function normalizeTickerFilter(value?: string | null) {
  return String(value ?? '').trim().toUpperCase();
}

function detailStatus(value?: string | null): SecFilingParsingStatus | 'all' {
  const normalized = String(value ?? '').trim();
  if (normalized === 'all') return 'all';
  if (['pending', 'parsed', 'not-applicable', 'source-unavailable', 'parse-error'].includes(normalized)) {
    return normalized as SecFilingParsingStatus;
  }
  return 'all';
}

function parseOptionsFromQuery(query?: Record<string, QueryValue>): SyncSecFilingDetailsOptions {
  const first = (value: QueryValue) => (Array.isArray(value) ? value[0] ?? '' : value ?? '');
  return {
    limit: clampLimit(first(query?.limit)),
    ticker: normalizeTickerFilter(first(query?.ticker)),
    form: normalizeFormFilter(first(query?.form)),
    status: detailStatus(first(query?.status)),
    parserVersion: String(first(query?.parserVersion) || SEC_FILING_DETAIL_PARSER_VERSION),
  };
}

function formIsTarget(formType: string) {
  return DETAIL_TARGET_FORMS.has(normalizeSecFormType(formType));
}

function formIsEightK(formType: string) {
  return EIGHT_K_FORMS.has(normalizeSecFormType(formType));
}

function formIsForm4(formType: string) {
  return FORM_4_FORMS.has(normalizeSecFormType(formType));
}

function companyByCik(cik: string): SecTrackedCompany | undefined {
  const normalized = String(cik).replace(/\D/g, '').padStart(10, '0').slice(-10);
  return enabledSecTrackedCompanies.find((company) => company.cik === normalized);
}

async function fetchJson(url: URL) {
  const response = await fetch(url, {
    headers: {
      apikey: envValue('SUPABASE_SERVICE_ROLE_KEY'),
      Authorization: `Bearer ${envValue('SUPABASE_SERVICE_ROLE_KEY')}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Supabase query failed: ${response.status}`);
  return response.json();
}

async function fetchTargetFilings(options: SyncSecFilingDetailsOptions) {
  if (!hasSupabaseConfig()) return [] as SecFilingRow[];
  const url = new URL('/rest/v1/market_sec_filings', envValue('SUPABASE_URL'));
  url.searchParams.set('select', 'accession_number,cik,company_name,ticker,form_type,filed_at,primary_document,source_url');
  url.searchParams.set('order', 'filed_at.desc,synced_at.desc');
  url.searchParams.set('limit', String(FETCH_LIMIT));
  if (options.ticker) url.searchParams.set('ticker', `eq.${options.ticker}`);
  if (options.form) url.searchParams.set('form_type', `eq.${options.form}`);

  const rows = await fetchJson(url);
  return Array.isArray(rows)
    ? rows.filter((row) => row?.accession_number && formIsTarget(String(row.form_type)))
    : [];
}

async function fetchExistingDetails(accessions: string[]) {
  if (!hasSupabaseConfig() || !accessions.length) return new Map<string, SecFilingDetailRow>();
  const existing = new Map<string, SecFilingDetailRow>();
  for (let index = 0; index < accessions.length; index += 80) {
    const chunk = accessions.slice(index, index + 80);
    const url = new URL('/rest/v1/market_sec_filing_details', envValue('SUPABASE_URL'));
    url.searchParams.set('select', 'accession_number,parser_version,parsing_status');
    url.searchParams.set('accession_number', `in.(${chunk.join(',')})`);
    const rows = await fetchJson(url);
    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        if (row?.accession_number) existing.set(String(row.accession_number), row as SecFilingDetailRow);
      });
    }
  }
  return existing;
}

function recentArrayValue(payload: SecSubmissionPayload, key: string, accessionNumber: string) {
  const recent = payload.filings?.recent as Record<string, unknown[] | undefined> | undefined;
  const accessions = recent?.accessionNumber;
  const index = Array.isArray(accessions) ? accessions.findIndex((value) => String(value).trim() === accessionNumber) : -1;
  if (index < 0) return undefined;
  const values = recent?.[key];
  return Array.isArray(values) ? values[index] : undefined;
}

async function fetchSubmissionsForRows(rows: SecFilingRow[], userAgent: string) {
  const byCik = new Map<string, SecSubmissionPayload>();
  const uniqueCiks = Array.from(new Set(rows.filter((row) => formIsEightK(row.form_type)).map((row) => row.cik)));
  for (const cik of uniqueCiks) {
    const company = companyByCik(cik);
    if (!company) continue;
    byCik.set(cik, await fetchSecSubmissionWithRetry(company, userAgent));
    await sleep(REQUEST_DELAY_MS);
  }
  return byCik;
}

async function fetchTextWithRetry(url: string, userAgent: string, counters: { sec429: number; sec5xx: number }) {
  let lastError = '';
  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt += 1) {
    let response: Response | null = null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/xml, text/xml, text/plain;q=0.9, */*;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
        },
      });
      if (response.ok) return await response.text();
      if (response.status === 404) return null;
      if (response.status === 429) counters.sec429 += 1;
      if (response.status >= 500) counters.sec5xx += 1;
      lastError = `SEC_ARCHIVE_HTTP_${response.status}`;
      if (!shouldRetry(response) || attempt >= REQUEST_RETRIES) break;
    } catch (error) {
      lastError = errorMessage(error);
      if (attempt >= REQUEST_RETRIES) break;
    } finally {
      clearTimeout(timeout);
    }
    await sleep(retryDelayMs(response, attempt));
  }
  throw new Error(lastError || 'SEC_ARCHIVE_REQUEST_FAILED');
}

function baseDetailRow(row: SecFilingRow, status: SecFilingParsingStatus, sourceDocumentUrl: string | null, parseError = '') {
  return {
    accession_number: row.accession_number,
    form_type: normalizeSecFormType(row.form_type),
    parser_version: SEC_FILING_DETAIL_PARSER_VERSION,
    parsing_status: status,
    eight_k_items: [],
    reporting_owners: [],
    non_derivative_transactions: [],
    derivative_transactions: [],
    footnotes: [],
    footnote_count: 0,
    source_document_url: sourceDocumentUrl,
    parsed_at: nowIso(),
    parse_error: parseError || null,
  };
}

export async function syncSecFilingDetails(rawOptions: SyncSecFilingDetailsOptions = {}) {
  const startedAt = nowIso();
  const options = {
    limit: clampLimit(rawOptions.limit),
    ticker: normalizeTickerFilter(rawOptions.ticker),
    form: normalizeFormFilter(rawOptions.form),
    status: detailStatus(rawOptions.status),
    parserVersion: rawOptions.parserVersion || SEC_FILING_DETAIL_PARSER_VERSION,
  };
  const userAgent = envValue('SEC_USER_AGENT').trim();
  const counters = {
    targetEightK: 0,
    parsedEightK: 0,
    itemlessEightK: 0,
    targetForm4: 0,
    parsedForm4: 0,
    reportingOwnerCount: 0,
    nonDerivativeTransactionCount: 0,
    derivativeTransactionCount: 0,
    footnoteCount: 0,
    sourceUnavailable: 0,
    parseError: 0,
    skipped: 0,
    sec429: 0,
    sec5xx: 0,
    detailRowsWritten: 0,
  };

  if (!userAgent) {
    await recordSyncRun({
      source: 'sec-edgar-filing-details',
      status: 'skipped',
      startedAt,
      errorMessage: 'SEC_USER_AGENT_NOT_CONFIGURED',
    });
    return {
      source: 'sec-edgar-filing-details',
      status: 'skipped' as const,
      code: 'SEC_USER_AGENT_NOT_CONFIGURED',
      message: 'SEC filing detail parsing requires SEC_USER_AGENT.',
      parserVersion: SEC_FILING_DETAIL_PARSER_VERSION,
      requested: 0,
      processed: 0,
      ...counters,
    };
  }

  const rows = (await fetchTargetFilings(options)).slice(0, options.limit);
  const existing = await fetchExistingDetails(rows.map((row) => row.accession_number));
  const toProcess = rows.filter((row) => {
    if (formIsEightK(row.form_type)) counters.targetEightK += 1;
    if (formIsForm4(row.form_type)) counters.targetForm4 += 1;
    const detail = existing.get(row.accession_number);
    if (!detail) return options.status === 'all';
    const sameParser = detail.parser_version === options.parserVersion;
    const shouldSkip = sameParser && detail.parsing_status === 'parsed' && options.status === 'all';
    if (shouldSkip) {
      counters.skipped += 1;
      return false;
    }
    if (options.status !== 'all') return detail.parsing_status === options.status;
    return true;
  });

  const submissionsByCik = await fetchSubmissionsForRows(toProcess, userAgent);
  const detailRows = [];

  for (const row of toProcess) {
    if (formIsEightK(row.form_type)) {
      const payload = submissionsByCik.get(row.cik);
      const items = normalizeEightKItems(payload ? recentArrayValue(payload, 'items', row.accession_number) : '');
      if (!items.length) counters.itemlessEightK += 1;
      counters.parsedEightK += 1;
      detailRows.push({
        ...baseDetailRow(row, 'parsed', row.source_url),
        eight_k_items: items,
      });
      continue;
    }

    if (formIsForm4(row.form_type)) {
      const sourceDocumentUrl = secPrimaryDocumentUrl(row.cik, row.accession_number, row.primary_document);
      if (!sourceDocumentUrl) {
        counters.sourceUnavailable += 1;
        detailRows.push(baseDetailRow(row, 'source-unavailable', null, 'PRIMARY_DOCUMENT_MISSING'));
        continue;
      }

      try {
        const xml = await fetchTextWithRetry(sourceDocumentUrl, userAgent, counters);
        if (!xml) {
          counters.sourceUnavailable += 1;
          detailRows.push(baseDetailRow(row, 'source-unavailable', sourceDocumentUrl, 'SOURCE_DOCUMENT_404'));
          continue;
        }
        const parsed = parseForm4OwnershipXml(xml);
        counters.parsedForm4 += 1;
        counters.reportingOwnerCount += parsed.reportingOwners.length;
        counters.nonDerivativeTransactionCount += parsed.nonDerivativeTransactions.length;
        counters.derivativeTransactionCount += parsed.derivativeTransactions.length;
        counters.footnoteCount += parsed.footnoteCount;
        detailRows.push({
          ...baseDetailRow(row, 'parsed', sourceDocumentUrl),
          reporting_owners: parsed.reportingOwners,
          non_derivative_transactions: parsed.nonDerivativeTransactions,
          derivative_transactions: parsed.derivativeTransactions,
          footnotes: parsed.footnotes,
          footnote_count: parsed.footnoteCount,
        });
      } catch (error) {
        counters.parseError += 1;
        detailRows.push(baseDetailRow(row, 'parse-error', sourceDocumentUrl, errorMessage(error).slice(0, 180)));
      }
      await sleep(REQUEST_DELAY_MS);
    }
  }

  if (detailRows.length) {
    await upsertRows('market_sec_filing_details', detailRows, ['accession_number']);
    counters.detailRowsWritten = detailRows.length;
  }

  const status = counters.parseError || counters.sourceUnavailable ? 'partial' : 'success';
  await recordSyncRun({
    source: 'sec-edgar-filing-details',
    status,
    startedAt,
    insertedCount: counters.detailRowsWritten,
    updatedCount: 0,
    errorMessage: counters.parseError ? 'Some SEC filing details failed to parse.' : '',
  });

  return {
    source: 'sec-edgar-filing-details',
    status,
    parserVersion: SEC_FILING_DETAIL_PARSER_VERSION,
    requested: rows.length,
    processed: toProcess.length,
    ...counters,
  };
}

function printSummary(result: Awaited<ReturnType<typeof syncSecFilingDetails>>) {
  console.log('SEC EDGAR filing detail sync');
  console.log(`Parser version: ${result.parserVersion ?? SEC_FILING_DETAIL_PARSER_VERSION}`);
  console.log(`Requested: ${result.requested ?? 0}`);
  console.log(`Processed: ${result.processed ?? 0}`);
  console.log(`8-K target/parsed/itemless: ${result.targetEightK}/${result.parsedEightK}/${result.itemlessEightK}`);
  console.log(`Form 4 target/parsed: ${result.targetForm4}/${result.parsedForm4}`);
  console.log(`Reporting owners: ${result.reportingOwnerCount}`);
  console.log(`Non-derivative transactions: ${result.nonDerivativeTransactionCount}`);
  console.log(`Derivative transactions: ${result.derivativeTransactionCount}`);
  console.log(`Footnotes: ${result.footnoteCount}`);
  console.log(`Source unavailable: ${result.sourceUnavailable}`);
  console.log(`Parse errors: ${result.parseError}`);
  console.log(`Skipped: ${result.skipped}`);
  console.log(`SEC 429/5xx: ${result.sec429}/${result.sec5xx}`);
}

if (isDirectRun(import.meta.url)) {
  const query: Record<string, string> = {};
  (globalThis.process?.argv ?? [])
    .slice(2)
    .join('&')
    .split('&')
    .filter(Boolean)
    .forEach((pair) => {
      const separatorIndex = pair.indexOf('=');
      if (separatorIndex < 1) return;
      query[decodeURIComponent(pair.slice(0, separatorIndex))] = decodeURIComponent(pair.slice(separatorIndex + 1));
    });
  syncSecFilingDetails(parseOptionsFromQuery(query))
    .then((result) => printSummary(result))
    .catch(async (error) => {
      await recordSyncRun({
        source: 'sec-edgar-filing-details',
        status: 'failed',
        startedAt: nowIso(),
        errorMessage: errorMessage(error),
      });
      console.error(errorMessage(error));
      globalThis.process?.exit?.(1);
    });
}

export { parseOptionsFromQuery };
