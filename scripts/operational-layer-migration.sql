-- End-to-End Service Operational Layer migration
-- Run: ssh data-server "psql $DATABASE_URL" < scripts/operational-layer-migration.sql

-- ── milestone_status enum ─────────────────────────────────────────────────────
do $$ begin
  create type milestone_status as enum ('pending', 'in_progress', 'completed', 'blocked');
exception when duplicate_object then null; end $$;

-- ── milestones ────────────────────────────────────────────────────────────────
create table if not exists milestones (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  title       text not null,
  description text,
  status      milestone_status not null default 'pending',
  due_date    date,
  completed_at timestamptz,
  "order"     integer not null default 0,
  created_by  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists milestones_client_id_idx on milestones(client_id);
create index if not exists milestones_order_idx on milestones(client_id, "order");
alter table milestones enable row level security;

-- Service role (admin actions) — bypasses RLS automatically.
-- Authenticated clients can read their own milestones.
do $$ begin
  create policy "clients_view_own_milestones" on milestones
    for select using (
      client_id in (
        select client_id from users
        where auth_id = auth.uid() and client_id is not null
      )
    );
exception when duplicate_object then null; end $$;

-- ── report_period / report_status enums ──────────────────────────────────────
do $$ begin
  create type report_period as enum ('monthly', 'quarterly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('draft', 'sent');
exception when duplicate_object then null; end $$;

-- ── client_reports ────────────────────────────────────────────────────────────
create table if not exists client_reports (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  title       text not null,
  period      report_period not null,
  content     jsonb not null default '{}',
  status      report_status not null default 'draft',
  created_by  uuid,
  sent_at     timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists client_reports_client_id_idx on client_reports(client_id);
create index if not exists client_reports_status_idx on client_reports(client_id, status);
alter table client_reports enable row level security;

-- Clients can only read reports that have been sent to them.
do $$ begin
  create policy "clients_view_own_reports" on client_reports
    for select using (
      status = 'sent' and
      client_id in (
        select client_id from users
        where auth_id = auth.uid() and client_id is not null
      )
    );
exception when duplicate_object then null; end $$;

-- ── meeting_type enum ─────────────────────────────────────────────────────────
do $$ begin
  create type meeting_type as enum ('discovery', 'strategy', 'review', 'kickoff', 'other');
exception when duplicate_object then null; end $$;

-- ── meetings ──────────────────────────────────────────────────────────────────
create table if not exists meetings (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  date         timestamptz not null,
  type         meeting_type not null default 'other',
  attendees    text[] not null default '{}',
  notes        text,
  action_items jsonb not null default '[]',
  created_by   uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists meetings_client_id_idx on meetings(client_id);
create index if not exists meetings_date_idx on meetings(client_id, date desc);
alter table meetings enable row level security;

-- Meetings are internal admin records — no client-facing read policy needed.

-- ── clients: market_analysis JSONB column ────────────────────────────────────
alter table clients add column if not exists market_analysis jsonb;

-- ── clients: archive columns ──────────────────────────────────────────────────
alter table clients add column if not exists archived boolean not null default false;
alter table clients add column if not exists archived_at timestamptz;
create index if not exists clients_archived_idx on clients(archived) where archived = true;
