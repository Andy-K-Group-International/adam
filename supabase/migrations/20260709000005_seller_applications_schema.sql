-- "Become a Seller" public application flow.
--
-- Deliberately a separate table from `leads` — this is a different kind of
-- applicant (someone applying to become a sales partner, not a prospective
-- A.D.A.M. client) with a different review workflow (approve -> inviteSeller,
-- not convert-to-client). Mirrors the sellers/commissions RLS convention
-- exactly: no admin/staff policy at all (admin reads/writes go through
-- service-role server actions, per the Phase A/B self-review conclusion that
-- this project's default grants give `authenticated` full column access —
-- RLS alone can't safely scope admin "own this row" access the way a
-- narrower policy might suggest), anon INSERT only, matching
-- leads_anon_insert / nda_anon_insert.

create table if not exists seller_applications (
  id                uuid        primary key default gen_random_uuid(),
  full_name         text        not null,
  email             text        not null,
  phone             text        not null,
  message           text,
  status            text        not null default 'pending'
                       check (status = any (array['pending', 'approved', 'rejected'])),
  created_at        timestamptz not null default now(),
  reviewed_at       timestamptz,
  reviewed_by       uuid        references auth.users(id),
  rejection_reason  text
);

create index if not exists seller_applications_status_idx on seller_applications (status);
create index if not exists seller_applications_email_idx on seller_applications (email);

alter table seller_applications enable row level security;

create policy "seller_applications_anon_insert"
on seller_applications for insert
to anon
with check (true);
