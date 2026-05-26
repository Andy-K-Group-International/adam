-- Health score columns on clients table
-- Run on data-server via: ssh data-server "psql $DATABASE_URL" < scripts/health-score-migration.sql

alter table clients
  add column if not exists health_score             integer,
  add column if not exists health_score_updated_at  timestamptz;

-- Index for dashboard "At Risk" query
create index if not exists clients_health_score_idx on clients (health_score);
