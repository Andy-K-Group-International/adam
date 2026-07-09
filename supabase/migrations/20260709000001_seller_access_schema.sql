-- Seller Access, Phase A: schema for external sales partners.
--
-- Sellers get a minimal public.users row (role='seller', client_id null) on
-- registration, same as every other role, so get_my_role()/middleware/the
-- auth callback keep working uniformly — Phase B's seller auth-callback
-- routing depends on that. The `sellers` table still holds all
-- seller-specific business data (referral_code, commission_rate,
-- nda_signature_id, status) and is linked back via auth_id, same
-- relationship shape as clients.assigned_to. get_my_seller_id() is a join
-- helper for resolving users.auth_id -> sellers.id where RLS needs to
-- scope rows on other tables — it is never the sole role gate; every
-- policy below pairs it with get_my_role() = 'seller'.

-- 0. users: add 'seller' to the role check, same pattern as company_admin.

alter table users drop constraint users_role_check;
alter table users add constraint users_role_check
  check (role = any (array['admin'::text, 'staff'::text, 'client'::text, 'company_admin'::text, 'seller'::text]));

-- 1. sellers -------------------------------------------------------------

create table if not exists sellers (
  id                             uuid        primary key default gen_random_uuid(),
  auth_id                        uuid        unique references auth.users(id) on delete set null,
  full_name                      text        not null,
  email                          text        not null unique,
  referral_code                  text        not null unique,
  status                         text        not null default 'invited'
                                    check (status = any (array['invited', 'pending_nda', 'active', 'suspended'])),
  nda_signature_id               uuid        references nda_signatures(id),
  seller_agreement_accepted_at   timestamptz,
  commission_rate                numeric(5, 2) not null default 10.00,
  invited_by                     text        not null,
  invited_at                     timestamptz not null default now(),
  registered_at                  timestamptz,
  activated_at                   timestamptz,
  registration_token             text,
  registration_token_expires_at  timestamptz,
  created_at                     timestamptz not null default now(),
  updated_at                     timestamptz not null default now()
);

-- Mirrors the demo_tokens -> nda_signatures guarantee: a seller cannot
-- reach 'active' without a real signed NDA behind them. Expressed as a
-- check (not NOT NULL on the column) because the row must exist in
-- 'invited'/'pending_nda' state before the NDA is signed.
alter table sellers
  add constraint sellers_active_requires_nda
  check (status <> 'active' or nda_signature_id is not null);

create index if not exists sellers_registration_token_idx on sellers (registration_token);

alter table sellers enable row level security;

-- 2. commissions -----------------------------------------------------------

create table if not exists commissions (
  id                 uuid        primary key default gen_random_uuid(),
  seller_id          uuid        not null references sellers(id),
  client_id          uuid        not null references clients(id),
  lead_id            uuid        references leads(id),
  deal_value         numeric(12, 2) not null,
  commission_amount  numeric(12, 2) not null,
  status             text        not null default 'pending'
                        check (status = any (array['pending', 'approved', 'paid', 'disputed'])),
  trigger_event      text        not null,
  created_at         timestamptz not null default now(),
  approved_at        timestamptz,
  approved_by        uuid        references auth.users(id),
  paid_at            timestamptz,
  paid_by            uuid        references auth.users(id),
  notes              text
);

create index if not exists commissions_seller_id_idx on commissions (seller_id);
create index if not exists commissions_client_id_idx on commissions (client_id);
create index if not exists commissions_status_idx on commissions (status);

alter table commissions enable row level security;

-- 3. leads: real column for seller-referral RLS scoping --------------------
-- Chosen over a jsonb-only approach after review: casting
-- metadata->>'referred_by_seller_id' to uuid inside an RLS predicate throws
-- for the *entire query* if any row's jsonb is malformed or missing the
-- key — that would break seller access to leads outright, not just
-- underperform. metadata.referral_code and metadata.referred_by_seller_id
-- are still written by the referral-tracking code for display/audit
-- continuity with the existing ceo_demo_invite pattern; this column is the
-- authoritative one for access control.

alter table leads
  add column if not exists referred_by_seller_id uuid references sellers(id) on delete set null;

create index if not exists leads_referred_by_seller_id_idx on leads (referred_by_seller_id);

-- 4. RLS helper: resolves the current auth user to their sellers.id, for
-- joining to seller-owned rows on other tables (leads, commissions). Scoped
-- to status = 'active' as defense-in-depth — a suspended seller loses
-- access even if their users.role row is somehow still 'seller' — but this
-- is never the sole gate: every policy below also checks get_my_role().

create or replace function get_my_seller_id()
returns uuid
language sql
security definer
stable
as $$
  select id from sellers where auth_id = auth.uid() and status = 'active'
$$;

-- 5. RLS policies ------------------------------------------------------------

-- sellers: can see/update only their own row, once linked via auth_id.
-- Role check + row scope, same shape as clients_company_admin_select_own.
-- Narrow and additive — there is no admin/staff policy on this table yet
-- (service-role only, used by the admin-only inviteSeller action), so
-- nothing existing to disturb.
create policy "sellers_select_own"
on sellers for select
to authenticated
using (
  get_my_role() = 'seller'
  and auth_id = auth.uid()
);

create policy "sellers_update_own"
on sellers for update
to authenticated
using (
  get_my_role() = 'seller'
  and auth_id = auth.uid()
)
with check (
  get_my_role() = 'seller'
  and auth_id = auth.uid()
);

-- leads: sellers can see only leads referred through their own code.
create policy "leads_seller_select_own"
on leads for select
to authenticated
using (
  get_my_role() = 'seller'
  and referred_by_seller_id = get_my_seller_id()
);

-- commissions: sellers can see only their own commission rows.
create policy "commissions_seller_select_own"
on commissions for select
to authenticated
using (
  get_my_role() = 'seller'
  and seller_id = get_my_seller_id()
);

-- 6. activity_log_type_check: add seller/commission types, and fix a
-- pre-existing bug found in audit — launch-invite/route.ts has been
-- inserting type: 'launch_invite_sent' since it shipped, but that value
-- was never added to this constraint, so every one of those inserts has
-- been silently failing (the route doesn't check the insert's error).

alter table activity_log drop constraint activity_log_type_check;
alter table activity_log add constraint activity_log_type_check
  check (type = any (array[
    'contract_created',
    'contract_published',
    'contract_viewed',
    'contract_changes_requested',
    'contract_client_signed',
    'contract_countersigned',
    'contract_finalized',
    'appendix_uploaded',
    'appendix_verified',
    'appendix_rejected',
    'comment_added',
    'client_created',
    'questionnaire_submitted',
    'questionnaire_ai_evaluated',
    'questionnaire_proceed',
    'questionnaire_flag',
    'questionnaire_reject',
    'client_stage_changed',
    'company_activated',
    'launch_invite_sent',
    'seller_registered',
    'seller_activated',
    'commission_created',
    'commission_approved',
    'commission_paid'
  ]));
