# A.D.A.M. v2.0 — Full Multi-Tenant SaaS Architecture Plan

## Vision

A.D.A.M. v2.0 enables each licensed company to manage their own clients independently, with full data isolation, company-specific branding, billing and AI settings.

---

## Permission Levels

| Level | Who | Access |
|---|---|---|
| **Super Admin** | Andy'K Group (`ceo@andykgroup.com`) | Full platform control — all companies, all data |
| **Company Admin** | Licensed company | Manages own clients only — no cross-tenant visibility |
| **End Client** | Client of a licensed company | Own portal only — proposals, contracts, invoices |

---

## New Database Tables Required

### `companies` (tenants)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Company display name |
| `slug` | text | Unique slug (used in subdomains/URLs) |
| `plan_tier` | text | starter / growth / scale / enterprise |
| `status` | text | pending / active / suspended / cancelled |
| `billing_email` | text | Billing contact |
| `admin_email` | text | Company Admin primary email |
| `branding_logo_url` | text | White-label logo |
| `branding_primary_color` | text | White-label brand colour (hex) |
| `ai_mode` | text | Current AI mode for this company |
| `ai_allow_basic` | boolean | Super Admin grants basic AI access |
| `ai_allow_managed` | boolean | Super Admin grants managed AI access |
| `ai_allow_openai` | boolean | Super Admin grants OpenAI key mode |
| `ai_allow_anthropic` | boolean | Super Admin grants Anthropic key mode |
| `ai_settings_locked` | boolean | Prevents Company Admin changing AI mode |
| `plan_name` | text | Human-readable plan label |
| `billing_cycle` | text | monthly / annual |
| `paid_until` | timestamptz | Subscription expiry |
| `created_at` | timestamptz | — |

### `user_roles`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `auth.users` |
| `company_id` | uuid | References `companies` — NULL for super_admin |
| `role` | text | `super_admin` / `company_admin` / `end_client` |
| `created_at` | timestamptz | — |

---

## Tables Requiring `company_id` (Tenant Isolation)

Every data table must carry a `company_id` foreign key to enforce row-level tenant separation:

- `clients`
- `leads`
- `proposals`
- `contracts`
- `invoices`
- `milestones`
- `meetings`
- `activity_log`
- `ai_generation_logs`
- `founding_codes`
- `client_agreement_snapshots`
- `business_verifications`
- `webhook_endpoints`

---

## RLS Policy Changes

Replace the current binary `admin / client` policies with three-tier tenant-scoped policies on every table:

```sql
-- Super Admin: cross-tenant full access
CREATE POLICY "super_admin_all" ON <table>
  FOR ALL USING (get_my_tenant_role() = 'super_admin');

-- Company Admin: own tenant only
CREATE POLICY "company_admin_own_tenant" ON <table>
  FOR ALL USING (
    get_my_tenant_role() = 'company_admin'
    AND company_id = get_my_company_id()
  );

-- End Client: own record only within tenant
CREATE POLICY "end_client_own_record" ON <table>
  FOR SELECT USING (
    get_my_tenant_role() = 'end_client'
    AND company_id = get_my_company_id()
    AND client_id = get_my_client_id()
  );
```

New DB helper functions required:

```sql
-- Returns calling user's company_id (NULL for super_admin)
CREATE OR REPLACE FUNCTION get_my_company_id()
  RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ur.company_id FROM user_roles ur
  JOIN users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid()::text LIMIT 1;
$$;

-- Returns calling user's role within their company
CREATE OR REPLACE FUNCTION get_my_tenant_role()
  RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT ur.role FROM user_roles ur
  JOIN users u ON u.id = ur.user_id
  WHERE u.auth_id = auth.uid()::text LIMIT 1;
$$;
```

---

## Auth Changes

- Replace hardcoded `ceo@andykgroup.com` email checks throughout the codebase
- Update `getCurrentUser()` to return `{ role, company_id, client_id }`
- Add helper functions: `isSuperAdmin()`, `isCompanyAdmin()`, `isEndClient()`
- Update `useCurrentUser` hook to expose `companyId` and `tenantRole`

---

## New Routes Required

| Route | Who | Purpose |
|---|---|---|
| `/super-admin` | Super Admin | Cross-tenant platform dashboard |
| `/super-admin/companies` | Super Admin | List and manage all licensed companies |
| `/super-admin/companies/[id]` | Super Admin | Per-company settings, AI permissions, billing |
| `/company-admin` | Company Admin | Scoped admin dashboard (own clients only) |
| `/company-admin/clients` | Company Admin | Client list within own tenant |
| `/company-admin/settings` | Company Admin | Branding and AI settings |
| `/company-admin/billing` | Company Admin | Company subscription and billing |

---

## White-Label / Branding

- Per-company: logo, primary colour, company name displayed in the client zone
- Optional custom subdomain: `company.adam.andykgroup.com`
- Email sender name: `[Company Name] via A.D.A.M.`
- Branding stored on the `companies` table (`branding_logo_url`, `branding_primary_color`)

---

## Migration Strategy from v1.0

1. Create `companies` table
2. Insert Andy'K Group as the default company (all existing data belongs to this tenant)
3. Add `company_id` to all data tables — default value = Andy'K Group company ID
4. Create `user_roles` table
5. Insert `ceo@andykgroup.com` as `super_admin` in `user_roles`
6. Migrate existing `users.role` values to `user_roles` (admin → company_admin, client → end_client)
7. Replace all v1.0 RLS policies with the v2.0 three-policy tenant pattern
8. Update `get_my_role()` / `get_my_client_id()` functions; add `get_my_company_id()` / `get_my_tenant_role()`
9. Update application auth layer to use `user_roles`
10. Add Company Admin routes and scoped admin panel
11. **Test isolation**: confirm Company A cannot read Company B rows
12. Launch Company Admin self-service onboarding flow

---

## Timeline

| Milestone | Target |
|---|---|
| **v1.0** — Controlled SaaS License Launch (Founding Clients) | **15 July 2026** |
| v2.0 schema design finalised | August 2026 |
| v2.0 — Schema + RLS migration | September 2026 |
| v2.0 — Application auth + Company Admin routes | October 2026 |
| v2.0 — Company Admin onboarding flow | November 2026 |
| **v2.0 GA** — Full multi-tenant, Company Admin, tenant isolation | **Q4 2026** |
| v2.1 — White-label branding, custom subdomains | Q1 2027 |
| v2.1 — Encrypted API key storage (Vault / pgcrypto) | Q1 2027 |
| v2.1 — Self-service onboarding + automated billing lifecycle | Q1 2027 |
