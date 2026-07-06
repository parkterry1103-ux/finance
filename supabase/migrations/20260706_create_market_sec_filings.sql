create table if not exists market_sec_filings (
  accession_number text primary key,
  cik text not null,
  company_name text not null,
  ticker text not null,
  form_type text not null,
  filing_category text not null check (
    filing_category in (
      'current-report',
      'quarterly-report',
      'annual-report',
      'insider-transaction',
      'ownership',
      'proxy',
      'capital-markets',
      'foreign-report',
      'other'
    )
  ),
  filed_at timestamptz not null,
  report_date date,
  primary_document text,
  source_url text not null,
  source text not null default 'sec-edgar',
  synced_at timestamptz not null default now()
);

create index if not exists market_sec_filings_filed_at_idx
  on market_sec_filings (filed_at desc);

create index if not exists market_sec_filings_ticker_idx
  on market_sec_filings (ticker);

create index if not exists market_sec_filings_cik_idx
  on market_sec_filings (cik);

create index if not exists market_sec_filings_form_type_idx
  on market_sec_filings (form_type);
