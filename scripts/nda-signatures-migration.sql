-- NDA Signatures table
-- Run on data-server via: ssh data-server "psql $DATABASE_URL" < scripts/nda-signatures-migration.sql

create table if not exists nda_signatures (
  id             uuid        primary key default gen_random_uuid(),
  full_name      text        not null,
  company        text        not null,
  email          text        not null,
  job_title      text        not null,
  signature_data text        not null,  -- base64 PNG data URL
  signed_at      timestamptz not null default now(),
  ip_address     text
);

-- RLS: deny all public access; only service-role can read/write
alter table nda_signatures enable row level security;

-- Index for admin lookups
create index if not exists nda_signatures_email_idx   on nda_signatures (email);
create index if not exists nda_signatures_signed_at_idx on nda_signatures (signed_at desc);
