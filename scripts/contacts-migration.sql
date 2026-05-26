-- Client Contacts table
-- Run on data-server via: ssh data-server "psql $DATABASE_URL" < scripts/contacts-migration.sql

create type contact_role as enum ('primary', 'billing', 'legal', 'operations', 'signatory');

create table if not exists contacts (
  id          uuid         primary key default gen_random_uuid(),
  client_id   uuid         not null references clients(id) on delete cascade,
  name        text         not null,
  email       text         not null,
  phone       text,
  job_title   text,
  role        contact_role not null default 'primary',
  is_primary  boolean      not null default false,
  notes       text,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

-- Only one primary per client (partial unique index)
create unique index if not exists contacts_one_primary_per_client
  on contacts (client_id)
  where is_primary = true;

-- RLS: admins/staff via service-role; clients cannot access directly
alter table contacts enable row level security;

-- Indexes
create index if not exists contacts_client_id_idx on contacts (client_id);
create index if not exists contacts_role_idx       on contacts (client_id, role);
