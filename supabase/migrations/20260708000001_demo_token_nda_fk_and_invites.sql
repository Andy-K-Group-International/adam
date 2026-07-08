-- Enforce "NDA signed before demo_token exists" at the schema level, and add a
-- lightweight log so admins can see who was personally invited to a demo.

-- 1. Link demo_tokens to the NDA signature that authorized it.
alter table demo_tokens
  add column if not exists nda_signature_id uuid references nda_signatures(id);

-- Backfill existing rows by matching email (verified: all existing rows have
-- a matching nda_signatures record at time of writing).
update demo_tokens dt
set nda_signature_id = (
  select n.id from nda_signatures n
  where n.email = dt.email
  order by n.signed_at asc
  limit 1
)
where dt.nda_signature_id is null;

-- Now make it mandatory: a demo_token cannot exist without a signed NDA.
alter table demo_tokens
  alter column nda_signature_id set not null;

create index if not exists demo_tokens_nda_signature_id_idx
  on demo_tokens (nda_signature_id);

-- 2. Log of admin-initiated demo invites (pre-invite emails), separate from
-- nda_signatures/demo_tokens so admins can track who was invited vs. who
-- signed up organically, and follow up on invites that haven't converted.
create table if not exists demo_invites (
  id             uuid        primary key default gen_random_uuid(),
  company_name   text        not null,
  contact_name   text        not null,
  contact_email  text        not null,
  invited_by     text        not null,
  invited_at     timestamptz not null default now()
);

create index if not exists demo_invites_contact_email_idx on demo_invites (contact_email);

alter table demo_invites enable row level security;
-- Service role bypasses RLS; no client-facing access needed.
