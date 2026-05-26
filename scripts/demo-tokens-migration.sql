-- Demo tokens table for protected /demo page access
-- Run: ssh data-server "psql $DATABASE_URL" < scripts/demo-tokens-migration.sql

create table if not exists demo_tokens (
  id         uuid primary key default gen_random_uuid(),
  token      text unique not null,
  email      text,
  name       text,
  company    text,
  created_at timestamptz not null default now(),
  used_at    timestamptz
);

create index if not exists demo_tokens_token_idx on demo_tokens(token);

alter table demo_tokens enable row level security;
-- Service role bypasses RLS; no client-facing access needed.
