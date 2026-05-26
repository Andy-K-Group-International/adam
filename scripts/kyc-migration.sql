-- KYC Verifications table
-- Run via Supabase MCP or: psql $DATABASE_URL < scripts/kyc-migration.sql

do $$ begin
  create type kyc_status as enum ('pending', 'verified', 'rejected', 'expired');
exception when duplicate_object then null; end $$;

create table if not exists kyc_verifications (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references clients(id) on delete cascade,
  status              kyc_status not null default 'pending',
  company_name        text,
  company_reg_number  text,
  vat_number          text,
  country             text,
  director_name       text,
  director_email      text,
  documents           jsonb not null default '[]'::jsonb,
  verified_by         uuid references auth.users(id),
  verified_at         timestamptz,
  rejection_reason    text,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint kyc_verifications_client_id_key unique (client_id)
);

alter table kyc_verifications enable row level security;

create policy "kyc_admin_staff_all" on kyc_verifications
  for all to authenticated
  using (get_my_role() in ('admin', 'staff'))
  with check (get_my_role() in ('admin', 'staff'));

create policy "kyc_client_own" on kyc_verifications
  for all to authenticated
  using (get_my_role() = 'client' and client_id = get_my_client_id())
  with check (get_my_role() = 'client' and client_id = get_my_client_id());

-- Storage bucket for KYC documents (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
