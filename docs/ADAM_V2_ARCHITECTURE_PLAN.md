# A.D.A.M. v2.0 — Multi-Tenant Architecture Plan

**Status**: Planning only — no code changes  
**Based on**: Full audit of codebase, migration scripts, RLS policies, and DB live schema  
**v1.0 launch target**: 15 July 2026  
**v2.0 target**: Q4 2026

---

## SECTION A — CURRENT BLOCKERS

Every item below is a concrete blocker confirmed by reading the actual source and schema.

### Schema blockers

| # | Blocker | Location |
|---|---|---|
| 1 | No `company_id` on any data table | `clients`, `leads`, `proposals`, `contracts`, `invoices`, `questionnaires`, `activity_log`, `ai_generation_logs`, `milestones`, `meetings`, `contacts`, `kyc_verifications`, `client_reports`, `nda_signatures`, `business_verifications`, `client_agreement_snapshots`, `founding_codes`, `webhook_endpoints` |
| 2 | No `companies` table | Schema — does not exist |
| 3 | No `user_roles` table | Schema — does not exist |
| 4 | `users.role` is a CHECK-constrained enum `('admin','staff','client')` | `full-migration.sql:111` — adding `company_admin` or `super_admin` requires an ALTER TABLE + constraint update |
| 5 | No `get_my_company_id()` DB function | Confirmed absent — tenant-scoped RLS is impossible without it |
| 6 | AI settings live on `clients` table per-client | `clients.ai_mode`, `ai_usage_limit_monthly`, `ai_fallback_provider`, `ai_generation_logs_enabled`, `ai_openai_key_encrypted`, `ai_anthropic_key_encrypted` — no per-company model exists |
| 7 | `proposal_templates` has no `company_id` | Would be shared across all tenants |
| 8 | `question_sections` / `question_items` have no `company_id` | Questionnaire forms would be shared across all tenants |

### RLS blockers

| # | Blocker | Detail |
|---|---|---|
| 9 | All RLS policies are binary: `admin/staff = ALL`, `client = own row` | No tenant scoping. Any admin sees all tenants. |
| 10 | `get_my_role()` returns a flat string — no company context | Cannot express "is this user a Company Admin for company X?" |
| 11 | `activity_log.type` uses a CHECK constraint | New activity types (`company_created`, `company_admin_invited`, etc.) require a schema migration |

### Application layer blockers

| # | Blocker | Location |
|---|---|---|
| 12 | All admin queries return ALL data, no company filter | `src/lib/supabase/queries/*.ts` — `listClients()`, `listLeads()`, `listContracts()`, etc. |
| 13 | Auth routing is binary: `role=client → /dashboard`, `role=admin → /admin` | `src/app/actions/auth.ts:36–40`, `src/app/auth/callback/route.ts:31` — no `/company-admin` path |
| 14 | API route auth checks `role !== 'admin'` hardcoded | `src/app/api/admin/launch-invite/route.ts:21`, `src/app/api/admin/founding-codes/route.ts:20`, `src/app/api/webhooks/route.ts:21` |
| 15 | Super Admin detection is client-side only | `src/app/dashboard/ai-settings/page.tsx:75` — email === 'ceo@andykgroup.com' UI check only, zero DB enforcement |
| 16 | `src/middleware.ts` has empty matcher — no route protection at edge | All protection lives in layout server components; Company Admin routes would need middleware guards |
| 17 | No `/admin/super` or `/admin/company` route groups exist | `src/app/admin/` is a flat single namespace |
| 18 | Email actions reference client data directly — no company context | `src/app/actions/email.ts` — no company name, slug, or branding injected |
| 19 | `useCurrentUser` hook returns only `{ role, client_id }` — no `company_id` | `src/hooks/useCurrentUser.ts:79–88` |

---

## SECTION B — REQUIRED NEW TABLES

### 1. `companies` (tenant registry)

**Purpose**: Each row represents a licensed company (a Company Admin's organisation). This is the root tenant record.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid DEFAULT gen_random_uuid()` | PK |
| `name` | `text NOT NULL` | Company display name |
| `slug` | `text UNIQUE NOT NULL` | URL-safe identifier (e.g. `acme-corp`) |
| `status` | `text DEFAULT 'pending'` | `pending \| active \| suspended \| cancelled` |
| `plan_tier` | `text` | `starter \| growth \| scale \| enterprise` |
| `admin_email` | `text NOT NULL` | Primary Company Admin email |
| `billing_email` | `text` | Billing contact |
| `created_at` | `timestamptz DEFAULT now()` | — |
| `updated_at` | `timestamptz DEFAULT now()` | — |

**RLS strategy**: Super Admin has ALL access. Company Admin can SELECT their own row only. Writes to `companies` are Super Admin only.

---

### 2. `user_roles` (replaces `users.role` for the 3-tier model)

**Purpose**: Maps users to companies and assigns them a role within that company. Replaces the flat `users.role` column for v2.0.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid DEFAULT gen_random_uuid()` | PK |
| `user_id` | `uuid REFERENCES users(id) ON DELETE CASCADE` | — |
| `company_id` | `uuid REFERENCES companies(id) ON DELETE CASCADE` | NULL for super_admin |
| `role` | `text NOT NULL` | `super_admin \| company_admin \| staff \| client` |
| `created_at` | `timestamptz DEFAULT now()` | — |
| UNIQUE | `(user_id, company_id)` | One role per user per company |

**RLS strategy**: Super Admin reads all. Company Admin reads rows within their company only. Individual users can read their own row.

**Migration note**: Existing `users.role` values must be backfilled into `user_roles` before `users.role` is deprecated. The flat column is kept and kept in sync during the transition.

---

### 3. `company_branding`

**Purpose**: White-label visual identity per company.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid DEFAULT gen_random_uuid()` | PK |
| `company_id` | `uuid REFERENCES companies(id) ON DELETE CASCADE UNIQUE` | One row per company |
| `logo_url` | `text` | Hosted in Supabase Storage |
| `primary_color` | `text` | Hex (e.g. `#2F9E9A`) |
| `email_from_name` | `text` | e.g. `Acme Corp via A.D.A.M.` |
| `custom_domain` | `text` | e.g. `adam.acme.com` (optional) |
| `created_at` | `timestamptz DEFAULT now()` | — |
| `updated_at` | `timestamptz DEFAULT now()` | — |

**RLS strategy**: Super Admin ALL. Company Admin SELECT + UPDATE own row only.

---

### 4. `company_ai_settings`

**Purpose**: Super Admin controls which AI modes a Company Admin may use. Separates AI permissions from per-client AI config.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid DEFAULT gen_random_uuid()` | PK |
| `company_id` | `uuid REFERENCES companies(id) ON DELETE CASCADE UNIQUE` | One row per company |
| `ai_allow_basic` | `boolean DEFAULT true` | Super Admin grants basic AI |
| `ai_allow_managed` | `boolean DEFAULT false` | Super Admin grants managed AI |
| `ai_allow_openai` | `boolean DEFAULT false` | Super Admin grants client OpenAI key mode |
| `ai_allow_anthropic` | `boolean DEFAULT false` | Super Admin grants client Anthropic key mode |
| `ai_settings_locked` | `boolean DEFAULT false` | Company Admin cannot change their AI mode |
| `ai_usage_limit_monthly` | `integer` | Token cap for the whole company |
| `ai_fallback_provider` | `text` | Fallback when primary fails |
| `updated_at` | `timestamptz DEFAULT now()` | — |

**RLS strategy**: Super Admin ALL. Company Admin SELECT own row only (cannot write without Super Admin unlock).

---

### 5. `company_billing`

**Purpose**: Subscription and payment state per licensed company.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid DEFAULT gen_random_uuid()` | PK |
| `company_id` | `uuid REFERENCES companies(id) ON DELETE CASCADE UNIQUE` | One row per company |
| `plan_name` | `text` | Human-readable plan label |
| `billing_cycle` | `text` | `monthly \| annual` |
| `subscription_status` | `text DEFAULT 'none'` | `none \| paid_pending \| active \| suspended \| cancelled` |
| `payment_date` | `timestamptz` | Last payment date |
| `paid_until` | `timestamptz` | Subscription expiry |
| `activation_date` | `timestamptz` | When Andy'K Group activated this company |
| `founding_client` | `boolean DEFAULT false` | Founding Client Program membership |
| `revolut_order_id` | `text` | Payment reference |
| `created_at` | `timestamptz DEFAULT now()` | — |
| `updated_at` | `timestamptz DEFAULT now()` | — |

**RLS strategy**: Super Admin ALL. Company Admin SELECT own row. No client access.

---

## SECTION C — REQUIRED COLUMN ADDITIONS

Every table below needs `company_id uuid REFERENCES companies(id)`. All have existing live data that must be backfilled to the Andy'K Group company record before the column can be made `NOT NULL`.

| Table | Has live data | FK cascade behaviour |
|---|---|---|
| `clients` | **Yes** | `ON DELETE CASCADE` — if company deleted, all clients deleted |
| `leads` | **Yes** | `ON DELETE CASCADE` |
| `proposals` | **Yes** | `ON DELETE CASCADE` |
| `contracts` | **Yes** | `ON DELETE CASCADE` |
| `invoices` | **Yes** | `ON DELETE CASCADE` |
| `questionnaires` | **Yes** | `ON DELETE SET NULL` — questionnaires survive company deletion |
| `activity_log` | **Yes** | `ON DELETE SET NULL` — preserve audit history |
| `ai_generation_logs` | No (new table) | `ON DELETE CASCADE` |
| `milestones` | Possibly | `ON DELETE CASCADE` |
| `meetings` | Possibly | `ON DELETE CASCADE` |
| `contacts` | Possibly | `ON DELETE CASCADE` |
| `kyc_verifications` | Possibly | `ON DELETE CASCADE` |
| `client_reports` | Possibly | `ON DELETE CASCADE` |
| `nda_signatures` | Possibly | `ON DELETE SET NULL` |
| `business_verifications` | Possibly | `ON DELETE CASCADE` |
| `client_agreement_snapshots` | Possibly | `ON DELETE SET NULL` |
| `founding_codes` | Yes | `ON DELETE SET NULL` |
| `webhook_endpoints` | Possibly | `ON DELETE CASCADE` |

**Tables that need a different strategy (shared/global content):**

| Table | Strategy |
|---|---|
| `proposal_templates` | Add `company_id NULL` — NULL means global/shared template, non-null means company-specific override |
| `question_sections` / `question_items` | Add `company_id NULL` — NULL means global questionnaire (used by public `/questionnaire`), non-null means company-specific form |

**Tables that do NOT need company_id (no tenant data):**

`users`, `contract_versions`, `contract_files`, `contract_comments` — these cascade from their parent tables which carry `company_id`. RLS on parent provides sufficient isolation. Direct `company_id` on child tables would be redundant and create sync risk.

---

## SECTION D — RLS ISOLATION STRATEGY

### New DB helper functions (must be created before any policy changes)

```sql
-- Returns the company_id the calling user belongs to (NULL for super_admin)
CREATE OR REPLACE FUNCTION get_my_company_id()
  RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ur.company_id FROM user_roles ur
  JOIN users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid()::text
  LIMIT 1;
$$;

-- Returns the calling user's role within their company
CREATE OR REPLACE FUNCTION get_my_tenant_role()
  RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ur.role FROM user_roles ur
  JOIN users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid()::text
  LIMIT 1;
$$;
```

### Policy replacement pattern (applied to every data table)

The v1.0 two-policy pattern (admin-all + client-own) is replaced with a three-policy tenant pattern:

**Example: `clients` table**

```sql
-- Drop v1.0 policies
DROP POLICY "clients_admin_staff_all" ON clients;
DROP POLICY "clients_client_select_own" ON clients;

-- Super Admin: cross-tenant, full access
CREATE POLICY "clients_super_admin" ON clients
  FOR ALL USING (get_my_tenant_role() = 'super_admin');

-- Company Admin / Staff: own tenant only
CREATE POLICY "clients_company_admin" ON clients
  FOR ALL USING (
    get_my_tenant_role() IN ('company_admin', 'staff')
    AND company_id = get_my_company_id()
  )
  WITH CHECK (
    get_my_tenant_role() IN ('company_admin', 'staff')
    AND company_id = get_my_company_id()
  );

-- End Client: own record within own tenant only
CREATE POLICY "clients_end_client" ON clients
  FOR SELECT USING (
    get_my_tenant_role() = 'client'
    AND company_id = get_my_company_id()
    AND id = get_my_client_id()
  );
```

**Example: `invoices` table**

```sql
DROP POLICY "invoices_admin_staff_all" ON invoices;
DROP POLICY "invoices_client_select_own" ON invoices;

CREATE POLICY "invoices_super_admin" ON invoices
  FOR ALL USING (get_my_tenant_role() = 'super_admin');

CREATE POLICY "invoices_company_admin" ON invoices
  FOR ALL USING (
    get_my_tenant_role() IN ('company_admin', 'staff')
    AND company_id = get_my_company_id()
  )
  WITH CHECK (
    get_my_tenant_role() IN ('company_admin', 'staff')
    AND company_id = get_my_company_id()
  );

CREATE POLICY "invoices_end_client" ON invoices
  FOR SELECT USING (
    get_my_tenant_role() = 'client'
    AND company_id = get_my_company_id()
    AND client_id = get_my_client_id()
    AND status NOT IN ('draft')
  );
```

**Apply the same three-policy pattern to**: `leads`, `proposals`, `contracts`, `contract_versions`, `contract_files`, `contract_comments`, `questionnaires`, `activity_log`, `ai_generation_logs`, `milestones`, `meetings`, `contacts`, `kyc_verifications`, `client_reports`.

**Critical**: RLS policy swap and `company_id NOT NULL` enforcement must happen atomically in a single transaction during the maintenance window.

---

## SECTION E — ROLE ARCHITECTURE

### Three tiers

```
Super Admin (Andy'K Group)
  └─ Company Admin (Licensed external company)
       └─ End Client (User within that company)
```

### Super Admin

- **Who**: Andy'K Group operators (`ceo@andykgroup.com` + designated staff)
- **DB storage**: `user_roles.role = 'super_admin'`, `user_roles.company_id = NULL`
- **Access**: All data across all companies. Can read, write, delete any tenant.
- **Enforcement**: `get_my_tenant_role() = 'super_admin'` in RLS policies (replaces hardcoded email check)
- **Routes**: `/admin/super/*` (new), full access to all existing `/admin/*` routes

### Company Admin

- **Who**: The primary user account for a licensed company
- **DB storage**: `user_roles.role = 'company_admin'`, `user_roles.company_id = <their company UUID>`
- **Access**: Only rows where `company_id = their company UUID`. Cannot see other tenants.
- **Enforcement**: `get_my_tenant_role() IN ('company_admin', 'staff') AND company_id = get_my_company_id()` in RLS
- **Routes**: `/admin/company/*` (new) — scoped admin panel showing only their data

### End Client

- **Who**: A user (client contact) within a licensed company's system
- **DB storage**: `user_roles.role = 'client'`, `user_roles.company_id = <company UUID>`, `users.client_id = <client UUID>`
- **Access**: Only their own client record and associated contracts/proposals/invoices
- **Enforcement**: `get_my_tenant_role() = 'client' AND company_id = get_my_company_id() AND client_id = get_my_client_id()`
- **Routes**: `/dashboard/*` (unchanged)

### Role storage transition

| Phase | Where role is stored | How it's read |
|---|---|---|
| v1.0 now | `users.role` column | `get_my_role()` → reads `users.role` |
| v2.0 transition | Both `users.role` + `user_roles` (in sync) | `get_my_tenant_role()` → reads `user_roles.role` |
| v2.0 stable | `user_roles` only; `users.role` kept as legacy cache | `get_my_tenant_role()` is authoritative |

`users.role` is NOT dropped in v2.0 — it remains for backward compatibility with all existing code that reads it. The column is kept in sync via a trigger when `user_roles` is updated.

---

## SECTION F — MIGRATION PLAN (safe order)

Steps are ordered from zero-risk to highest-risk. No step breaks v1.0 until Step 9.

| Step | Action | Risk | Breaking? |
|---|---|---|---|
| 1 | Create `companies` table | Zero | No |
| 2 | Create `user_roles` table | Zero | No |
| 3 | Create `company_branding` table | Zero | No |
| 4 | Create `company_ai_settings` table | Zero | No |
| 5 | Create `company_billing` table | Zero | No |
| 6 | Insert Andy'K Group as default company (id stored in env/config) | Zero | No |
| 7 | Insert `ceo@andykgroup.com` as `super_admin` in `user_roles` | Zero | No |
| 8 | Add `company_id` column (nullable) to all data tables — no FK enforcement yet | Low | No |
| 9 | Backfill `company_id` on all existing rows → Andy'K Group company UUID | **Medium** — data migration, must be transactional | No (RLS unchanged) |
| 10 | Add FK constraints (`company_id REFERENCES companies(id)`) after backfill | **Medium** — schema lock during constraint addition | No |
| 11 | Create `get_my_company_id()` and `get_my_tenant_role()` DB functions | Low | No |
| 12 | Backfill `user_roles` from existing `users.role` values | **Medium** — data migration | No |
| 13 | **MAINTENANCE WINDOW START**: Swap RLS policies to three-policy tenant pattern on all tables | **High** — brief window where admin queries may fail mid-swap | Brief yes |
| 14 | Add `NOT NULL` constraint to `company_id` on all data tables (after RLS swap) | **High** — schema lock | No (RLS now enforces it) |
| 15 | Update application auth layer: `useCurrentUser`, `auth.ts`, routing | **Medium** — requires deploy | No (old code still works during deploy) |
| 16 | Add `company_admin` and `super_admin` values to `users.role` CHECK constraint | **Medium** — constraint migration | No |
| 17 | Add `/admin/super` and `/admin/company` route groups | Low | No |
| 18 | Update all admin queries to scope by `company_id` for Company Admin role | **Medium** — application code | No |
| 19 | Test end-to-end: Company A cannot read Company B data | Verification | — |
| 20 | **MAINTENANCE WINDOW END** | — | — |

**Steps requiring a maintenance window**: 13 (RLS swap) and 14 (NOT NULL constraint). These should be executed together in a single transaction in under 60 seconds on a healthy DB.

---

## SECTION G — FIRST SAFE STEP

**Create the five new foundation tables — zero risk, no alterations to existing tables.**

This single migration can be applied immediately to the live database without touching any v1.0 table, without altering any RLS policy, and without any data migration:

```sql
-- companies (tenant registry)
-- user_roles (3-tier role system)
-- company_branding (white-label settings)
-- company_ai_settings (per-company AI permissions)
-- company_billing (subscription data)
```

After this step: v1.0 is 100% functional and unchanged. The new tables exist but are empty and unused. This gives a safe checkpoint to validate the schema before any data or RLS work begins.

The second safe step (can follow immediately after): Insert Andy'K Group as the first company and `ceo@andykgroup.com` as `super_admin` in `user_roles`. Still zero risk to v1.0.

---

## SECTION H — IMPLEMENTATION PHASES

### Phase 1 — Foundation (no breaking changes, new tables only)

**Target**: v1.0 launch + 2 weeks (by end of July 2026)

| Action | Files to create | Complexity | v1.0 functional? |
|---|---|---|---|
| Create 5 new tables (Section G) | `scripts/v2-foundation-migration.sql` | Low | **Yes** |
| Insert Andy'K Group company row | In migration script | Low | **Yes** |
| Insert super_admin user_role for ceo@ | In migration script | Low | **Yes** |
| Update `src/lib/supabase/types.ts` with new interfaces | `types.ts` | Low | **Yes** |
| Add `get_my_company_id()` + `get_my_tenant_role()` DB functions | In migration script | Low | **Yes** |

---

### Phase 2 — Column additions + RLS update (requires maintenance window)

**Target**: August–September 2026

| Action | Files to modify | Complexity | v1.0 functional? |
|---|---|---|---|
| Add `company_id` (nullable) to all 18 data tables | `scripts/v2-add-company-id.sql` | Medium | **Yes** |
| Backfill all rows to Andy'K Group company UUID | In migration script | Medium | **Yes** |
| Add FK constraints after backfill | In migration script | Medium | **Yes** |
| Backfill `user_roles` from `users.role` | In migration script | Medium | **Yes** |
| **MAINTENANCE WINDOW**: Swap all RLS policies | `scripts/v2-rls-swap.sql` | High | **Brief interruption** |
| Add NOT NULL constraint post-swap | In migration script | Medium | **Yes** |
| Update `users.role` CHECK to include `company_admin`, `super_admin` | In migration script | Low | **Yes** |
| Add sync trigger: `user_roles` → `users.role` | In migration script | Low | **Yes** |

---

### Phase 3 — Admin dashboards (Super Admin + Company Admin)

**Target**: September–October 2026

| Action | Files to create/modify | Complexity |
|---|---|---|
| New route group `/admin/super/*` | `src/app/admin/super/layout.tsx`, `page.tsx`, `companies/page.tsx`, `companies/[id]/page.tsx` | High |
| New route group `/admin/company/*` | `src/app/admin/company/layout.tsx`, `page.tsx`, `clients/page.tsx`, `settings/page.tsx` | High |
| Update `src/middleware.ts` to guard `/admin/super` and `/admin/company` | `src/middleware.ts` | Medium |
| Update auth routing: Company Admin → `/admin/company` | `src/app/actions/auth.ts`, `src/app/auth/callback/route.ts` | Medium |
| Update `useCurrentUser` hook: add `companyId`, `tenantRole` | `src/hooks/useCurrentUser.ts` | Medium |
| Update all admin queries to scope by `company_id` for Company Admin | `src/lib/supabase/queries/*.ts` | High |
| Update API routes: role checks to support `company_admin` | `src/app/api/admin/*/route.ts` | Medium |
| Update `sign-in` routing | `src/app/sign-in/page.tsx` | Low |
| Add `CompanyAdminGuard` server component | `src/components/admin/CompanyAdminGuard.tsx` | Medium |
| Add `SuperAdminGuard` server component | `src/components/admin/SuperAdminGuard.tsx` | Medium |

---

### Phase 4 — Company-specific settings (AI, branding, billing)

**Target**: October–November 2026

| Action | Files to create/modify | Complexity |
|---|---|---|
| Move AI settings from `clients` to `company_ai_settings` | `src/components/admin/AiSettingsTab.tsx`, `src/app/dashboard/ai-settings/page.tsx` | Medium |
| Company branding upload UI | `src/app/admin/company/settings/page.tsx` | Medium |
| Company billing view | `src/app/admin/company/billing/page.tsx` | Medium |
| Super Admin AI permissions panel | `src/app/admin/super/companies/[id]/page.tsx` | Medium |
| Per-company email from-name branding | `src/app/actions/email.ts` | Low |
| Update `src/lib/ai/config.ts` to read from company | `src/lib/ai/config.ts` | Low |
| Company branding Supabase Storage bucket | Migration | Low |

---

### Phase 5 — Full multi-tenant SaaS launch (v2.0 GA)

**Target**: Q4 2026

| Action | Complexity |
|---|---|
| Company Admin self-service onboarding flow | High |
| Company Admin invite flow (email → account creation → company link) | High |
| White-label domain routing (optional subdomain per company) | High |
| End-to-end isolation test suite: Company A cannot read Company B | High |
| Automated subscription lifecycle (renewals, expiry, suspension) | High |
| v2.1 planning: encrypted API key storage (Vault/pgcrypto) | Medium |

---

## SECTION I — FILES TO CREATE OR MODIFY

### New migration scripts

| File | Content |
|---|---|
| `scripts/v2-foundation-migration.sql` | Create 5 new tables, insert Andy'K Group, insert super_admin role, add DB functions |
| `scripts/v2-add-company-id.sql` | Add nullable `company_id` to all 18 data tables, backfill, add FK constraints |
| `scripts/v2-rls-swap.sql` | Drop v1.0 RLS policies, apply three-policy tenant pattern to all tables (run in maintenance window) |
| `scripts/v2-role-constraint-update.sql` | Update `users.role` CHECK, add sync trigger |

### New source files to create

| File | Purpose |
|---|---|
| `src/app/admin/super/layout.tsx` | Super Admin route guard + layout |
| `src/app/admin/super/page.tsx` | Super Admin dashboard (all tenants overview) |
| `src/app/admin/super/companies/page.tsx` | Company list with status, billing, AI settings |
| `src/app/admin/super/companies/[id]/page.tsx` | Per-company management: AI permissions, billing, activation |
| `src/app/admin/company/layout.tsx` | Company Admin route guard + layout |
| `src/app/admin/company/page.tsx` | Company Admin dashboard (own clients only) |
| `src/app/admin/company/clients/page.tsx` | Company Admin client list |
| `src/app/admin/company/settings/page.tsx` | Branding + AI settings (within Super Admin limits) |
| `src/app/admin/company/billing/page.tsx` | Subscription view |
| `src/components/admin/SuperAdminGuard.tsx` | Server component: blocks non-super-admin |
| `src/components/admin/CompanyAdminGuard.tsx` | Server component: blocks non-company-admin |
| `src/components/admin/TenantScopedProvider.tsx` | Context: injects company_id into admin queries |
| `src/lib/supabase/queries/companies.ts` | CRUD for companies, company_branding, company_ai_settings, company_billing |

### Existing files to modify

| File | What changes |
|---|---|
| `src/lib/supabase/types.ts` | Add `Company`, `UserRole`, `CompanyBranding`, `CompanyAiSettings`, `CompanyBilling` interfaces |
| `src/hooks/useCurrentUser.ts` | Add `companyId`, `tenantRole`, `isSuperAdmin`, `isCompanyAdmin` |
| `src/app/actions/auth.ts` | Add Company Admin routing path after sign-in |
| `src/app/auth/callback/route.ts` | Add Company Admin routing in callback |
| `src/app/admin/layout.tsx` | Add Super Admin detection; keep backward compat for existing admin route |
| `src/middleware.ts` | Add route matchers for `/admin/super` and `/admin/company` |
| `src/lib/supabase/queries/clients.ts` | Add optional `company_id` filter to all queries |
| `src/lib/supabase/queries/leads.ts` | Add optional `company_id` filter |
| `src/lib/supabase/queries/contracts.ts` | Add optional `company_id` filter |
| `src/lib/supabase/queries/proposals.ts` | Add optional `company_id` filter |
| `src/lib/supabase/queries/questionnaires.ts` | Add optional `company_id` filter |
| `src/components/admin/AiSettingsTab.tsx` | Read AI settings from `company_ai_settings`, not `clients` |
| `src/app/dashboard/ai-settings/page.tsx` | Read from `company_ai_settings`, apply lock |
| `src/lib/ai/config.ts` | Update `getAIConfig()` to accept company-level config |
| `src/app/actions/email.ts` | Accept optional `companyName` / `brandingFromName` params |
| `src/app/api/admin/launch-invite/route.ts` | Update role check to include `super_admin` |
| `src/app/api/admin/founding-codes/route.ts` | Update role check to include `super_admin` |
| `src/app/api/notes/route.ts` | Update role check to include `company_admin` |
| `src/app/api/client-requests/[id]/route.ts` | Update role check to include `company_admin` |
| `src/app/api/webhooks/route.ts` | Update role check to include `company_admin` |
| `src/app/sign-in/page.tsx` | Add Company Admin routing after auth |
| `docs/ADAM_V2_MULTITENANT_PLAN.md` | Update with final implementation decisions |

### New route groups summary

| Route group | Who accesses it | Guard |
|---|---|---|
| `/admin/super/*` | Super Admin only | `SuperAdminGuard` — `tenantRole === 'super_admin'` |
| `/admin/company/*` | Company Admin only | `CompanyAdminGuard` — `tenantRole === 'company_admin'` |
| `/admin/*` (existing) | Both Super Admin + Company Admin (scoped) | Existing `admin/layout.tsx`, upgraded |
| `/dashboard/*` (existing) | End Client only | Unchanged |

---

## Key Design Decisions

1. **`users.role` is NOT dropped in v2.0** — kept for backward compatibility. `user_roles` is authoritative but `users.role` is kept in sync via trigger. This avoids rewriting every query that reads `users.role` on day one.

2. **`proposal_templates` and `question_sections` use NULL = global** — a `company_id = NULL` row is a platform-wide template available to all tenants. A `company_id = <uuid>` row is a tenant override. This avoids duplicating global content per company.

3. **Child tables (`contract_versions`, `contract_files`, `contract_comments`) do NOT get `company_id`** — they inherit tenant scope from their parent `contracts.company_id` via subquery in RLS. Direct `company_id` on child tables would create sync risk.

4. **Super Admin email check is eliminated at DB level** — `user_roles.role = 'super_admin'` is the canonical truth. The `ceo@andykgroup.com` email is used only as a display label in the UI, not as an auth gate.

5. **AI settings migrate from per-client to per-company** — `company_ai_settings` replaces the `ai_*` columns on `clients` for the Company Admin permission model. Per-client overrides (usage limits, mode selection) remain on `clients` but within the bounds set by `company_ai_settings`.
