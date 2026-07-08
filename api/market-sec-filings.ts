import {
  enabledSecTrackedCompanies,
  normalizeSecFormType,
  secFilingCategoryOrder,
  type MarketSecFiling,
  type SecFilingCategory,
} from '../src/content/disclosures/index.js';
import {
  isEightKItemCode,
  isSupportedTransactionCode,
  normalizeTransactionCode,
} from '../src/lib/sec/index.js';
import type {
  EightKItemDetail,
  SecDerivativeTransaction,
  SecFilingParsingStatus,
  SecFootnote,
  SecNonDerivativeTransaction,
  SecReportingOwner,
} from '../src/lib/sec/index.js';

declare const process: {
  env: Record<string, string | undefined>;
};

type QueryValue = string | string[] | undefined;

type ApiRequest = {
  query?: Record<string, QueryValue>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

type SecFilingRow = {
  accession_number: string;
  cik: string;
  company_name: string;
  ticker: string;
  form_type: string;
  filing_category: SecFilingCategory;
  filed_at: string;
  report_date?: string | null;
  primary_document?: string | null;
  source_url: string;
  source?: 'sec-edgar';
  synced_at?: string | null;
};

type SecFilingDetailRow = {
  accession_number: string;
  form_type: string;
  parser_version: string;
  parsing_status: SecFilingParsingStatus;
  eight_k_items?: unknown;
  reporting_owners?: unknown;
  non_derivative_transactions?: unknown;
  derivative_transactions?: unknown;
  footnotes?: unknown;
  footnote_count?: number | null;
  source_document_url?: string | null;
  parsed_at?: string | null;
  parse_error?: string | null;
};

type OwnerRoleFilter = 'director' | 'officer' | 'ten-percent-owner' | 'other';
type OwnershipFilter = 'direct' | 'indirect';

const MAX_LIMIT = 100;
const DETAIL_FILTER_FETCH_LIMIT = 500;

function env(key: string) {
  return process.env[key] || '';
}

function hasSupabase() {
  return Boolean(env('SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY'));
}

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function sinceIso(query: Record<string, unknown>) {
  const hours = query.hours ? clampNumber(query.hours, 0, 1, 24 * 90) : 0;
  const days = clampNumber(query.days, 30, 1, 90);
  const durationMs = (hours || days * 24) * 60 * 60 * 1000;
  return new Date(Date.now() - durationMs).toISOString();
}

function isStale(value?: string | null) {
  if (!value) return true;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return true;
  return Date.now() - timestamp > 36 * 60 * 60 * 1000;
}

function normalizeSecFiling(row: SecFilingRow): MarketSecFiling {
  return {
    accessionNumber: row.accession_number,
    cik: row.cik,
    companyName: row.company_name,
    ticker: row.ticker,
    formType: row.form_type,
    category: row.filing_category,
    filedAt: row.filed_at,
    reportDate: row.report_date ?? null,
    primaryDocument: row.primary_document ?? null,
    source: 'sec-edgar',
    sourceUrl: row.source_url,
  };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function normalizeDetailRow(row: SecFilingDetailRow) {
  return {
    accessionNumber: row.accession_number,
    formType: row.form_type,
    parserVersion: row.parser_version,
    parsingStatus: row.parsing_status,
    eightKItems: asArray<EightKItemDetail>(row.eight_k_items),
    reportingOwners: asArray<SecReportingOwner>(row.reporting_owners),
    nonDerivativeTransactions: asArray<SecNonDerivativeTransaction>(row.non_derivative_transactions),
    derivativeTransactions: asArray<SecDerivativeTransaction>(row.derivative_transactions),
    footnotes: asArray<SecFootnote>(row.footnotes),
    footnoteCount: typeof row.footnote_count === 'number' && Number.isFinite(row.footnote_count) ? row.footnote_count : 0,
    sourceDocumentUrl: row.source_document_url ?? null,
    parseError: row.parse_error ?? null,
  };
}

function mergeSecFilingDetail(item: MarketSecFiling, detail?: ReturnType<typeof normalizeDetailRow>): MarketSecFiling {
  if (!detail) return item;
  return {
    ...item,
    parsingStatus: detail.parsingStatus,
    eightKItems: detail.eightKItems,
    reportingOwners: detail.reportingOwners,
    nonDerivativeTransactions: detail.nonDerivativeTransactions,
    derivativeTransactions: detail.derivativeTransactions,
    footnotes: detail.footnotes,
    footnoteCount: detail.footnoteCount,
    sourceDocumentUrl: detail.sourceDocumentUrl,
    parseError: detail.parseError,
  };
}

function normalizeOwnerRole(value: QueryValue): OwnerRoleFilter | '' {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = String(raw ?? '').trim().toLowerCase();
  if (['director', 'officer', 'ten-percent-owner', 'other'].includes(normalized)) return normalized as OwnerRoleFilter;
  return '';
}

function normalizeOwnership(value: QueryValue): OwnershipFilter | '' {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = String(raw ?? '').trim().toLowerCase();
  if (normalized === 'direct' || normalized === 'indirect') return normalized;
  return '';
}

function ownerMatchesRole(owner: SecReportingOwner, role: OwnerRoleFilter) {
  if (role === 'director') return owner.isDirector;
  if (role === 'officer') return owner.isOfficer;
  if (role === 'ten-percent-owner') return owner.isTenPercentOwner;
  return owner.isOther;
}

function transactionMatchesOwnership(
  transaction: SecNonDerivativeTransaction | SecDerivativeTransaction,
  ownership: OwnershipFilter,
) {
  const code = String(transaction.directOrIndirectOwnership ?? '').trim().toUpperCase();
  return ownership === 'direct' ? code === 'D' : code === 'I';
}

function filingMatchesDetailFilters(
  filing: MarketSecFiling,
  filters: {
    item: string;
    transactionCode: string;
    ownerRole: OwnerRoleFilter | '';
    ownership: OwnershipFilter | '';
  },
) {
  if (filters.item && !filing.eightKItems?.some((detail) => detail.item === filters.item)) return false;
  if (filters.transactionCode) {
    const transactions = [
      ...(filing.nonDerivativeTransactions ?? []),
      ...(filing.derivativeTransactions ?? []),
    ];
    if (!transactions.some((transaction) => transaction.transactionCode === filters.transactionCode)) return false;
  }
  if (filters.ownerRole && !filing.reportingOwners?.some((owner) => ownerMatchesRole(owner, filters.ownerRole as OwnerRoleFilter))) {
    return false;
  }
  if (filters.ownership) {
    const transactions = [
      ...(filing.nonDerivativeTransactions ?? []),
      ...(filing.derivativeTransactions ?? []),
    ];
    if (!transactions.some((transaction) => transactionMatchesOwnership(transaction, filters.ownership as OwnershipFilter))) return false;
  }
  return true;
}

function emptyResponse(code: string, message: string) {
  return {
    ok: false,
    code,
    message,
    items: [],
    meta: {
      count: 0,
      lastSyncedAt: null,
      source: 'sec-edgar',
      stale: true,
      trackedCompanyCount: enabledSecTrackedCompanies.length,
    },
  };
}

async function latestSecFilingSync() {
  const url = new URL('/rest/v1/sync_runs', env('SUPABASE_URL'));
  url.searchParams.set('select', 'ended_at,started_at,status');
  url.searchParams.set('source', 'eq.sec-edgar-filings');
  url.searchParams.set('order', 'started_at.desc');
  url.searchParams.set('limit', '1');

  const response = await fetch(url, {
    headers: {
      apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
      Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) return null;
  const rows = await response.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  return row?.ended_at ?? row?.started_at ?? null;
}

async function fetchSecFilingDetails(accessionNumbers: string[]) {
  const details = new Map<string, ReturnType<typeof normalizeDetailRow>>();
  const uniqueAccessions = Array.from(new Set(accessionNumbers.filter(Boolean)));
  if (!uniqueAccessions.length) return details;

  for (let index = 0; index < uniqueAccessions.length; index += 80) {
    const chunk = uniqueAccessions.slice(index, index + 80);
    const url = new URL('/rest/v1/market_sec_filing_details', env('SUPABASE_URL'));
    url.searchParams.set(
      'select',
      'accession_number,form_type,parser_version,parsing_status,eight_k_items,reporting_owners,non_derivative_transactions,derivative_transactions,footnotes,footnote_count,source_document_url,parsed_at,parse_error',
    );
    url.searchParams.set('accession_number', `in.(${chunk.join(',')})`);

    const response = await fetch(url, {
      headers: {
        apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) return new Map();

    const rows = await response.json();
    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        if (row?.accession_number) details.set(String(row.accession_number), normalizeDetailRow(row as SecFilingDetailRow));
      });
    }
  }

  return details;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (!hasSupabase()) {
    res.status(200).json(emptyResponse('SEC_FILINGS_NOT_CONFIGURED', '미국 공시 데이터가 아직 연결되지 않았습니다.'));
    return;
  }

  const limit = clampNumber(req.query?.limit, 30, 1, MAX_LIMIT);
  const ticker = typeof req.query?.ticker === 'string' ? req.query.ticker.trim().toUpperCase() : '';
  const form = typeof req.query?.form === 'string' ? normalizeSecFormType(req.query.form) : '';
  const category = typeof req.query?.category === 'string' ? req.query.category.trim() as SecFilingCategory : '';
  const validCategory = secFilingCategoryOrder.includes(category as SecFilingCategory) ? category : '';
  const itemFilter = typeof req.query?.item === 'string' ? req.query.item.trim() : '';
  const transactionCode = typeof req.query?.transactionCode === 'string' ? normalizeTransactionCode(req.query.transactionCode) : '';
  const ownerRole = normalizeOwnerRole(req.query?.ownerRole);
  const ownership = normalizeOwnership(req.query?.ownership);
  const hasDetailFilter = Boolean(itemFilter || transactionCode || ownerRole || ownership);

  if (itemFilter && !isEightKItemCode(itemFilter)) {
    res.status(400).json(emptyResponse('SEC_FILINGS_INVALID_ITEM', 'SEC 8-K Item 형식이 올바르지 않습니다.'));
    return;
  }
  if (transactionCode && !isSupportedTransactionCode(transactionCode)) {
    res.status(400).json(emptyResponse('SEC_FILINGS_INVALID_TRANSACTION_CODE', 'SEC Form 4 transaction code가 올바르지 않습니다.'));
    return;
  }
  if (req.query?.ownerRole && !ownerRole) {
    res.status(400).json(emptyResponse('SEC_FILINGS_INVALID_OWNER_ROLE', 'SEC reporting owner role 필터가 올바르지 않습니다.'));
    return;
  }
  if (req.query?.ownership && !ownership) {
    res.status(400).json(emptyResponse('SEC_FILINGS_INVALID_OWNERSHIP', 'SEC ownership 필터가 올바르지 않습니다.'));
    return;
  }

  try {
    const url = new URL('/rest/v1/market_sec_filings', env('SUPABASE_URL'));
    url.searchParams.set(
      'select',
      'accession_number,cik,company_name,ticker,form_type,filing_category,filed_at,report_date,primary_document,source_url,source,synced_at',
    );
    url.searchParams.set('filed_at', `gte.${sinceIso(req.query ?? {})}`);
    url.searchParams.set('order', 'filed_at.desc,synced_at.desc');
    url.searchParams.set('limit', String(hasDetailFilter ? DETAIL_FILTER_FETCH_LIMIT : limit));
    if (ticker) url.searchParams.set('ticker', `eq.${ticker}`);
    if (form) url.searchParams.set('form_type', form === '424B' ? 'like.424B*' : `eq.${form}`);
    if (validCategory) url.searchParams.set('filing_category', `eq.${validCategory}`);

    const response = await fetch(url, {
      headers: {
        apikey: env('SUPABASE_SERVICE_ROLE_KEY'),
        Authorization: `Bearer ${env('SUPABASE_SERVICE_ROLE_KEY')}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) throw new Error(`market_sec_filings ${response.status}`);

    const rows = await response.json();
    const baseItems = Array.isArray(rows) ? rows.map(normalizeSecFiling) : [];
    const details = await fetchSecFilingDetails(baseItems.map((item) => item.accessionNumber));
    const items = baseItems
      .map((item) => mergeSecFilingDetail(item, details.get(item.accessionNumber)))
      .filter((item) => filingMatchesDetailFilters(item, { item: itemFilter, transactionCode, ownerRole, ownership }))
      .slice(0, limit);
    const rowSyncedAt = Array.isArray(rows)
      ? rows
          .map((row) => row.synced_at)
          .filter(Boolean)
          .sort()
          .at(-1)
      : null;
    const lastSyncedAt = rowSyncedAt ?? (await latestSecFilingSync());

    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=900');
    res.status(200).json({
      ok: true,
      items,
      meta: {
        count: items.length,
        lastSyncedAt,
        source: 'sec-edgar',
        stale: isStale(lastSyncedAt),
        trackedCompanyCount: enabledSecTrackedCompanies.length,
      },
    });
  } catch {
    res.status(200).json(emptyResponse('SEC_FILINGS_UNAVAILABLE', '미국 공시 정보를 일시적으로 불러오지 못했습니다.'));
  }
}
