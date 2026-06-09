# A.D.A.M. v2.0 — Multi-Tenant Architecture Plan

**Version**: 2.0 (planned)  
**Target**: Q4 2026  
**v2.1 follow-on**: Q1 2027  
**Depends on**: v1.0 launch complete (15 July 2026)

---

## Overview

v2.0 transforms A.D.A.M. from a single-operator platform into a **multi-tenant white-label product**. Each Company Admin (a business that licenses A.D.A.M.) operates an isolated tenant. Their end clients see only their own data. Andy'K Group (Super Admin) retains cross-tenant visibility and controls the permission model.

---

## Three-Tier Permission Model

```
Super Admin (Andy'K Group — ceo@andykgroup.com)
  └─ Company Admin (businesses that license A.D.A.M.)
       └─ End Client (the clients of those businesses)
```

### Super Admin
- Full cross-tenant access to all data
- Controls which AI modes each Company Admin may use (`ai_allow_*`)
- Can lock AI settings for a Company Admin (`ai_settings_locked`)
- Manages billing, plan assignments, and activation globally
- Identified by: `user_roles.role = 'super_admin'` (v2.0 DB role) OR email check as interim measure

### Company Admin
- Manages their own tenant's clients end-to-end
- Can access `/admin` scoped to their tenant only (sees no data from other tenants)
- Can configure AI mode within bounds set by Super Admin
- Cannot see other tenants' clients, contracts, proposals, or invoices
- Identified by: `user_roles.role = 'company_admin'` with a `company_id` foreign key

### End Client
- The client of a Company Admin
- Accesses `/dashboard` — sees only their own proposals, contracts, invoices
- No AI settings exposure
- Identified by: `user_roles.role = 'client'` with `company_id` and `client_id`

---

## New Database Schema

### `companies` table

```sql
CREATE TABLE companies (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name                text NOT NULL,
  slug                text UNIQUE NOT NULL,           -- used in subdomain / URL path
  plan_name           text,
  billing_cycle       text,
  subscription_status text DEFAULT 'none',
  paid_until          timestamptz,
  owner_user_id       uuid REFERENCES users(id),      -- the Company Admin user
  ai_allow_basic      boolean DEFAULT true,
  ai_allow_managed    boolean DEFAULT false,
  ai_allow_openai     boolean DEFAULT false,
  ai_allow_anthropic  boolean DEFAULT false,
  ai_settings_locked  boolean DEFAULT false,
  ai_usage_limit_monthly integer,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
```

### `user_roles` table (replaces `users.role`)

```sql
CREATE TABLE user_roles (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  company_id  uuid REFERENCES companies(id) ON DELETE CASCADE,  -- NULL for super_admin
  role        text NOT NULL,  -- 'super_admin' | 'company_admin' | 'staff' | 'client'
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, company_id)
);
```

### `tenant_id` on all data tables

Every data table receives a `company_id` (tenant key) column:

```sql
ALTER TABLE clients     ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE contracts   ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE proposals   ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE invoices    ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE questionnaires ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE activity_log   ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE ai_generation_logs ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE meetings    ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE milestones  ADD COLUMN company_id uuid REFERENCES companies(id);
ALTER TABLE contacts    ADD COLUMN company_id uuid REFERENCES companies(id);
-- ... all remaining data tables
```

Add indexes: `CREATE INDEX ON clients(company_id);` (repeat for each table).

### Updated DB helper functions

```sql
-- Returns the company_id of the calling user (NULL for super_admin)
CREATE OR REPLACE FUNCTION get_my_company_id()
  RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ur.company_id FROM user_roles ur
  JOIN users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid()::text
  LIMIT 1;
$$;

-- Returns the role of the calling user within their company
CREATE OR REPLACE FUNCTION get_my_tenant_role()
  RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ur.role FROM user_roles ur
  JOIN users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid()::text
  LIMIT 1;
$$;
```

---

## RLS Policies (v2.0 pattern)

The v2.0 RLS pattern replaces the binary admin/client split with a three-way tenant-scoped check. Example for `clients` table:

```sql
-- Drop v1 policies
DROP POLICY clients_admin_staff_all ON clients;
DROP POLICY clients_client_select_own ON clients;

-- Super admin: cross-tenant full access
CREATE POLICY "clients_super_admin" ON clients
  FOR ALL USING (get_my_tenant_role() = 'super_admin');

-- Company admin / staff: own tenant only
CREATE POLICY "clients_company_admin" ON clients
  FOR ALL USING (
    get_my_tenant_role() IN ('company_admin', 'staff')
    AND company_id = get_my_company_id()
  );

-- End client: own record only within tenant
CREATE POLICY "clients_end_client" ON clients
  FOR SELECT USING (
    get_my_tenant_role() = 'client'
    AND company_id = get_my_company_id()
    AND id = get_my_client_id()
  );
```

Apply the same three-policy pattern to every data table.

---

## AI Permission Model (v2.0)

AI permissions move from per-client columns to per-company columns on the `companies` table:

| Column | Description |
|---|---|
| `ai_allow_basic` | Company Admin may use built-in A.D.A.M. AI |
| `ai_allow_managed` | Company Admin may use Andy'K Group-managed AI (env keys) |
| `ai_allow_openai` | Company Admin may configure their own OpenAI key |
| `ai_allow_anthropic` | Company Admin may configure their own Anthropic key |
| `ai_settings_locked` | Company Admin cannot change their own AI mode |
| `ai_usage_limit_monthly` | Token cap per month across the whole company |

Super Admin controls these via the admin panel. Company Admin sees only the modes Super Admin has enabled. End Clients see no AI settings.

Encrypted key storage uses Supabase Vault (`vault.create_secret`) or pgcrypto — resolved before v2.0 ships.

---

## Admin Panel Changes (v2.0)

### `/admin` — scoped per role

| Role | What `/admin` shows |
|---|---|
| Super Admin | All companies, all clients, all data, cross-tenant |
| Company Admin | Only their own tenant's clients, proposals, contracts |

Implementation: a `CompanyAdminGuard` server component injects `company_id` into all queries. Super Admin bypasses the guard.

### New `/admin/companies` section (Super Admin only)

- List all licensed companies
- Create / suspend / activate companies
- Set plan, billing, AI permissions per company
- View cross-tenant activity log

### `/admin/clients` (Company Admin view)

All existing pages remain — queries add `.eq('company_id', myCompanyId)`.

---

## Migration Strategy: v1.0 → v2.0

### Phase 1: Schema (non-breaking, additive)

1. Create `companies` table
2. Create `user_roles` table
3. Add `company_id` to all data tables (nullable, no FK enforcement yet)
4. Insert one row into `companies` for Andy'K Group International LTD
5. Backfill `company_id` on all existing rows to the Andy'K Group company ID
6. Add FK constraints (NOT NULL) after backfill

### Phase 2: RLS swap (breaking, requires maintenance window)

7. Replace all v1 RLS policies with v2.0 tenant-scoped policies
8. Migrate `users.role` values to `user_roles` table
9. Update `get_my_role()` and `get_my_client_id()` functions, add `get_my_company_id()` and `get_my_tenant_role()`
10. Smoke-test all three roles against the new policies

### Phase 3: Application layer

11. Update all Supabase queries to include `.eq('company_id', ...)` where needed
12. Update `useCurrentUser` hook to expose `companyId` and `tenantRole`
13. Update middleware to route Company Admin users to their scoped admin panel
14. Add `CompanyAdminGuard` to all admin layouts
15. Update AI settings to read from `companies` table instead of `clients`

### Phase 4: Onboarding flow

16. Build `/admin/companies/new` wizard (Super Admin creates a new tenant)
17. Build Company Admin invite flow (email → account creation → linked to company)
18. Build white-label domain/subdomain routing

---

## Timeline

| Milestone | Target |
|---|---|
| v1.0 launch (Founding Clients) | 15 July 2026 |
| v2.0 schema design finalised | August 2026 |
| v2.0 Phase 1–2 (schema + RLS) | September 2026 |
| v2.0 Phase 3 (application layer) | October 2026 |
| v2.0 Phase 4 (onboarding) | November 2026 |
| **v2.0 GA** | **Q4 2026** |
| v2.1 — encrypted key storage + self-service billing | Q1 2027 |
| v2.1 — automated subscription lifecycle (renewals, expiry, upgrades) | Q1 2027 |

---

## v2.1 Additions (Q1 2027)

- **Encrypted API key storage** — Supabase Vault or pgcrypto for `ai_openai_key_encrypted` / `ai_anthropic_key_encrypted`. Remove "saving disabled" notice from UI.
- **Self-service billing** — Revolut/Stripe integration with automated invoicing, renewal emails, grace periods, and suspension.
- **Automated subscription lifecycle** — cron jobs for expiry warnings (7 days), suspension on non-renewal, and reactivation on payment.
- **Audit log per tenant** — Company Admin can view their own activity log without cross-tenant exposure.
- **White-label domain routing** — `client.mycompany.com` → A.D.A.M. scoped to that company's tenant.

---

## What Does NOT Change in v2.0

- The `questionnaire → proposal → strategy → contract → invoice → kickoff` pipeline stages
- The contract signing, version history, and comment system
- The email system (Resend, existing templates)
- The public landing page and questionnaire flow
- The client dashboard UX (only data scoping changes)
- `PAYMENTS_ENABLED` guard pattern (still baked at build time)
