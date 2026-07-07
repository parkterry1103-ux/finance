create table if not exists market_sec_filing_details (
  accession_number text primary key
    references market_sec_filings (accession_number)
    on delete cascade,
  form_type text not null,
  parser_version text not null,
  parsing_status text not null check (
    parsing_status in (
      'pending',
      'parsed',
      'not-applicable',
      'source-unavailable',
      'parse-error'
    )
  ),
  eight_k_items jsonb,
  reporting_owners jsonb,
  non_derivative_transactions jsonb,
  derivative_transactions jsonb,
  footnotes jsonb,
  footnote_count integer not null default 0,
  source_document_url text,
  parsed_at timestamptz,
  parse_error text
);

create index if not exists market_sec_filing_details_form_type_idx
  on market_sec_filing_details (form_type);

create index if not exists market_sec_filing_details_parsing_status_idx
  on market_sec_filing_details (parsing_status);

create index if not exists market_sec_filing_details_parsed_at_idx
  on market_sec_filing_details (parsed_at desc);

alter table market_sec_filing_details enable row level security;
