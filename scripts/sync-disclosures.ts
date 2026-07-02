import {
  classifyDisclosure,
  enabledDartTrackedCompanies,
  type DartTrackedCompany,
  type MarketDisclosure,
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

const OPENDART_LIST_URL = 'https://opendart.fss.or.kr/api/list.json';
const REQUEST_TIMEOUT_MS = 12_000;
const REQUEST_RETRIES = 2;
const REQUEST_DELAY_MS = 180;
const DEFAULT_SYNC_DAYS = 7;
const MAX_SYNC_DAYS = 30;

type OpenDartDisclosureRow = {
  corp_code?: string;
  corp_name?: string;
  stock_code?: string;
  corp_cls?: string;
  report_nm?: string;
  rcept_no?: string;
  flr_nm?: string;
  rcept_dt?: string;
  rm?: string;
};

type OpenDartListPayload = {
  status?: string;
  message?: string;
  list?: OpenDartDisclosureRow[];
};

type CompanySyncResult = {
  ticker: string;
  companyName: string;
  status: 'success' | 'failed';
  disclosures: number;
  error?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function yyyymmdd(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function dateRange(days: number) {
  const clampedDays = Math.min(Math.max(days, 1), MAX_SYNC_DAYS);
  const end = new Date();
  const start = new Date(end.getTime() - (clampedDays - 1) * 86_400_000);
  return {
    bgnDe: yyyymmdd(start),
    endDe: yyyymmdd(end),
  };
}

function syncDays() {
  const parsed = Number.parseInt(envValue('DISCLOSURE_SYNC_DAYS', String(DEFAULT_SYNC_DAYS)), 10);
  if (!Number.isFinite(parsed)) return DEFAULT_SYNC_DAYS;
  return Math.min(Math.max(parsed, 1), MAX_SYNC_DAYS);
}

function dartSourceUrl(receiptNumber: string) {
  return `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${encodeURIComponent(receiptNumber)}`;
}

function normalizeReceivedAt(value?: string) {
  if (!value || !/^\d{8}$/.test(value)) return nowIso();
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00+09:00`;
}

function normalizeDisclosure(row: OpenDartDisclosureRow, company: DartTrackedCompany): MarketDisclosure | null {
  const receiptNumber = String(row.rcept_no ?? '').trim();
  const reportName = String(row.report_nm ?? '').trim();
  if (!receiptNumber || !reportName) return null;

  return {
    receiptNumber,
    corpCode: String(row.corp_code ?? company.corpCode).trim() || company.corpCode,
    companyName: String(row.corp_name ?? company.companyName).trim() || company.companyName,
    ticker: company.ticker,
    reportName,
    filerName: String(row.flr_nm ?? '').trim() || null,
    category: classifyDisclosure(reportName),
    receivedAt: normalizeReceivedAt(row.rcept_dt),
    source: 'opendart',
    sourceUrl: dartSourceUrl(receiptNumber),
  };
}

function toDatabaseRow(item: MarketDisclosure, syncedAt: string) {
  return {
    receipt_number: item.receiptNumber,
    corp_code: item.corpCode,
    company_name: item.companyName,
    ticker: item.ticker,
    report_name: item.reportName,
    filer_name: item.filerName,
    disclosure_category: item.category,
    received_at: item.receivedAt,
    source_url: item.sourceUrl,
    source: item.source,
    synced_at: syncedAt,
  };
}

async function fetchWithTimeout(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchOpenDartList(company: DartTrackedCompany, range: { bgnDe: string; endDe: string }) {
  const apiKey = envValue('OPENDART_API_KEY');
  const url = new URL(OPENDART_LIST_URL);
  url.searchParams.set('crtfc_key', apiKey);
  url.searchParams.set('corp_code', company.corpCode);
  url.searchParams.set('bgn_de', range.bgnDe);
  url.searchParams.set('end_de', range.endDe);
  url.searchParams.set('page_count', '100');

  let lastError = '';
  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        lastError = `OpenDART HTTP ${response.status}`;
        throw new Error(lastError);
      }
      const payload = (await response.json()) as OpenDartListPayload;
      if (payload.status === '000') return payload.list ?? [];
      if (payload.status === '013') return [];
      lastError = `OpenDART ${payload.status ?? 'unknown'} ${payload.message ?? ''}`.trim();
      throw new Error(lastError);
    } catch (error) {
      lastError = errorMessage(error);
      if (attempt >= REQUEST_RETRIES) break;
      await sleep(350 * (attempt + 1));
    }
  }
  throw new Error(lastError || 'OpenDART request failed');
}

async function existingReceiptNumbers(receiptNumbers: string[]) {
  const uniqueReceipts = Array.from(new Set(receiptNumbers.filter(Boolean)));
  if (!uniqueReceipts.length || !hasSupabaseConfig()) return new Set<string>();

  const existing = new Set<string>();
  for (let index = 0; index < uniqueReceipts.length; index += 80) {
    const chunk = uniqueReceipts.slice(index, index + 80);
    const url = new URL('/rest/v1/market_disclosures', envValue('SUPABASE_URL'));
    url.searchParams.set('select', 'receipt_number');
    url.searchParams.set('receipt_number', `in.(${chunk.join(',')})`);

    const response = await fetch(url, {
      headers: {
        apikey: envValue('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${envValue('SUPABASE_SERVICE_ROLE_KEY')}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase market_disclosures existing query failed: ${response.status}`);
    }

    const rows = await response.json();
    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        if (row?.receipt_number) existing.add(String(row.receipt_number));
      });
    }
  }

  return existing;
}

function printSummary(result: Awaited<ReturnType<typeof syncDisclosures>>) {
  console.log('OpenDART disclosure sync');
  console.log(`Tracked companies: ${result.trackedCompanies}`);
  console.log(`Successful companies: ${result.successfulCompanies}`);
  console.log(`Failed companies: ${result.failedCompanies}`);
  console.log(`Fetched disclosures: ${result.fetched}`);
  console.log(`Inserted: ${result.inserted}`);
  console.log(`Updated: ${result.updated}`);
  console.log(`Skipped duplicates: ${result.skippedDuplicates}`);
  result.companyResults.forEach((item) => {
    const suffix = item.status === 'failed' && item.error ? ` · ${item.error}` : ` · ${item.disclosures} disclosures`;
    console.log(`${item.ticker} · ${item.companyName} · ${item.status}${suffix}`);
  });
}

export async function syncDisclosures() {
  const startedAt = nowIso();
  const syncedAt = nowIso();
  const apiKey = envValue('OPENDART_API_KEY');
  const companies = enabledDartTrackedCompanies;
  const companyResults: CompanySyncResult[] = [];
  const errors: string[] = [];

  if (!apiKey) {
    const message = 'OpenDART disclosure sync skipped: API key is not configured.';
    await recordSyncRun({
      source: 'opendart-disclosures',
      status: 'skipped',
      startedAt,
      errorMessage: message,
    });
    return {
      source: 'opendart-disclosures',
      status: 'skipped' as const,
      code: 'OPENDART_NOT_CONFIGURED',
      message: '공시 데이터가 아직 연결되지 않았습니다.',
      trackedCompanies: companies.length,
      successfulCompanies: 0,
      failedCompanies: 0,
      fetched: 0,
      inserted: 0,
      updated: 0,
      skippedDuplicates: 0,
      syncedAt,
      companyResults,
      errors: [message],
    };
  }

  const range = dateRange(syncDays());
  const disclosuresByReceipt = new Map<string, MarketDisclosure>();

  for (const company of companies) {
    try {
      const rows = await fetchOpenDartList(company, range);
      const normalizedRows = rows
        .map((row) => normalizeDisclosure(row, company))
        .filter((item): item is MarketDisclosure => Boolean(item));

      normalizedRows.forEach((item) => {
        if (!disclosuresByReceipt.has(item.receiptNumber)) disclosuresByReceipt.set(item.receiptNumber, item);
      });
      companyResults.push({
        ticker: company.ticker,
        companyName: company.companyName,
        status: 'success',
        disclosures: normalizedRows.length,
      });
    } catch (error) {
      const message = `${company.ticker} ${company.companyName}: ${errorMessage(error)}`;
      errors.push(message);
      companyResults.push({
        ticker: company.ticker,
        companyName: company.companyName,
        status: 'failed',
        disclosures: 0,
        error: errorMessage(error),
      });
    }
    await sleep(REQUEST_DELAY_MS);
  }

  const disclosures = Array.from(disclosuresByReceipt.values()).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  let inserted = 0;
  let updated = 0;
  let skippedDuplicates = 0;

  if (disclosures.length) {
    const existing = await existingReceiptNumbers(disclosures.map((item) => item.receiptNumber));
    inserted = disclosures.filter((item) => !existing.has(item.receiptNumber)).length;
    updated = disclosures.filter((item) => existing.has(item.receiptNumber)).length;
    skippedDuplicates = Math.max(0, companyResults.reduce((sum, item) => sum + item.disclosures, 0) - disclosures.length);
    await upsertRows(
      'market_disclosures',
      disclosures.map((item) => toDatabaseRow(item, syncedAt)),
      ['receipt_number'],
    );
  }

  const successfulCompanies = companyResults.filter((item) => item.status === 'success').length;
  const failedCompanies = companyResults.filter((item) => item.status === 'failed').length;
  const status = failedCompanies ? 'partial' : 'success';

  await recordSyncRun({
    source: 'opendart-disclosures',
    status,
    startedAt,
    insertedCount: inserted,
    updatedCount: updated,
    errorMessage: errors.join('\n'),
  });

  return {
    source: 'opendart-disclosures',
    status,
    trackedCompanies: companies.length,
    successfulCompanies,
    failedCompanies,
    fetched: disclosures.length,
    inserted,
    updated,
    skippedDuplicates,
    syncedAt,
    companyResults,
    errors,
  };
}

if (isDirectRun(import.meta.url)) {
  syncDisclosures()
    .then((result) => {
      printSummary(result);
    })
    .catch(async (error) => {
      await recordSyncRun({
        source: 'opendart-disclosures',
        status: 'failed',
        startedAt: nowIso(),
        errorMessage: errorMessage(error),
      });
      console.error(errorMessage(error));
      globalThis.process?.exit?.(1);
    });
}
