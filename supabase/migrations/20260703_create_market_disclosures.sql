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
