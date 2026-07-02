create extension if not exists pgcrypto;

create table if not exists companies (
  id text primary key,
  name text not null,
  ticker text,
  market text not null check (market in ('KR', 'US')),
  sector text,
  dart_corp_code text,
  sec_cik text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists companies_dart_corp_code_key
  on companies (dart_corp_code)
  where dart_corp_code is not null;

create unique index if not exists companies_sec_cik_key
  on companies (sec_cik)
  where sec_cik is not null;

create table if not exists filings (
  id text primary key default gen_random_uuid()::text,
  company_id text references companies(id) on delete set null,
  market text not null check (market in ('KR', 'US')),
  source text not null,
  form_type text,
  report_type text,
  fiscal_year text,
  fiscal_period text,
  filed_at timestamptz,
  accession_number text,
  dart_rcept_no text,
  direct_url text,
  search_url text,
  raw_url text,
  created_at timestamptz not null default now()
);

create unique index if not exists filings_sec_accession_key
  on filings (source, accession_number)
  where accession_number is not null;

create unique index if not exists filings_dart_rcept_key
  on filings (source, dart_rcept_no)
  where dart_rcept_no is not null;

create table if not exists financial_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id text references companies(id) on delete cascade,
  filing_id text references filings(id) on delete set null,
  fiscal_year text,
  fiscal_period text,
  revenue text,
  operating_income text,
  net_income text,
  operating_cash_flow text,
  debt_ratio text,
  source text not null,
  updated_at timestamptz not null default now()
);

create unique index if not exists financial_metrics_company_period_source_key
  on financial_metrics (company_id, fiscal_year, fiscal_period, source);

create table if not exists ownership_trades (
  id uuid primary key default gen_random_uuid(),
  company_id text references companies(id) on delete set null,
  ticker text,
  investor_name text,
  investor_type text,
  action text,
  trade_date date,
  disclosed_date date,
  shares numeric,
  price numeric,
  amount text,
  source text not null,
  source_url text,
  raw_id text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists ownership_trades_source_raw_key
  on ownership_trades (source, raw_id);

create table if not exists market_prices (
  id uuid primary key default gen_random_uuid(),
  company_id text references companies(id) on delete set null,
  ticker text not null,
  market text,
  price text,
  open text,
  previous_close text,
  close text,
  change text,
  change_percent text,
  currency text,
  price_label text check (price_label in ('latest', 'close', 'delayed', 'fallback', 'unavailable')),
  market_status text check (market_status in ('open', 'closed', 'premarket', 'afterhours', 'delayed', 'unknown')),
  as_of text not null,
  source text not null,
  is_delayed boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists market_prices_ticker_source_asof_key
  on market_prices (ticker, source, as_of);

alter table if exists market_prices add column if not exists open text;
alter table if exists market_prices add column if not exists previous_close text;
alter table if exists market_prices add column if not exists close text;
alter table if exists market_prices add column if not exists price_label text;

create table if not exists market_disclosures (
  receipt_number text primary key,
  corp_code text not null,
  company_name text not null,
  ticker text,
  report_name text not null,
  filer_name text,
  disclosure_category text not null check (
    disclosure_category in (
      'supply-contract',
      'earnings',
      'periodic-report',
      'capital',
      'ownership',
      'major-management',
      'investment',
      'governance',
      'other'
    )
  ),
  received_at timestamptz not null,
  source_url text not null,
  source text not null default 'opendart',
  synced_at timestamptz not null default now()
);

create index if not exists market_disclosures_received_at_idx
  on market_disclosures (received_at desc);

create index if not exists market_disclosures_ticker_idx
  on market_disclosures (ticker);

create index if not exists market_disclosures_corp_code_idx
  on market_disclosures (corp_code);

-- 중복 방지 설계:
-- OpenDART: dart_rcept_no
-- SEC filing: accession_number
-- SEC Form 4 transaction: accessionNumber + ownerCik + transactionDate + securityTitle + shares를 raw_id로 저장
-- 13F: accessionNumber + cusip + managerCik를 raw_id로 저장
-- Congress: reportId + transactionDate + assetName + amountRange를 raw_id로 저장
-- Prices: ticker + source + as_of
-- OpenDART disclosure radar: receipt_number

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null check (status in ('success', 'partial', 'failed', 'skipped')),
  started_at timestamptz not null,
  ended_at timestamptz,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  error_message text
);

create index if not exists sync_runs_source_started_at_idx
  on sync_runs (source, started_at desc);
