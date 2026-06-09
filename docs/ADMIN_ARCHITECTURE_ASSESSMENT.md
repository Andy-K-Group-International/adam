# A.D.A.M. Admin Architecture Assessment

**Date:** 9 June 2026  
**Scope:** Code-level read-only analysis of `/app/admin`, `/app/dashboard`, auth logic, and all admin components.  
**Purpose:** Assess multi-tenant readiness for first 5–20 Founding Client companies.

---

## Q1 — Route Classification

Every classification is based on observed query behavior, not intended purpose.

### Legend
- **[COCKPIT]** — Andy'K Group internal only; a licensed company has no business here
- **[COMPANY_ADMIN]** — a licensed company needs this to run their own business
- **[BOTH]** — useful to both, but requires separate scoping per role

| Route | Classification | Reason |
|---|---|---|
| `/admin` | **[COCKPIT]** | Dashboard aggregates ALL clients, ALL invoices, ALL leads, risk matrix, and Launch Applicants widget — Andy'K Group operational HQ |
| `/admin/pipeline` | **[COMPANY_ADMIN]** | Visual pipeline is exactly what a licensed company needs to track their own clients through stages |
| `/admin/leads` | **[COCKPIT]** | These are A.D.A.M. license applicants — people applying to Andy'K Group's program; unrelated to a licensed company's own client funnel |
| `/admin/leads/new` | **[COCKPIT]** | Manual lead entry for Andy'K Group's own sales funnel |
| `/admin/leads/[id]` | **[COCKPIT]** | License applicant detail; Andy'K Group only |
| `/admin/clients` | **[COMPANY_ADMIN]** | A licensed company's core client list — but currently returns ALL clients with zero scoping |
| `/admin/clients/[id]` | **[COMPANY_ADMIN]** | 19-tab client management (overview, contacts, milestones, meetings, analysis, strategy, contracts, KYC, activation, reports, billing, AI, etc.) — exactly what a Company Admin needs per client |
| `/admin/contracts` | **[COMPANY_ADMIN]** | Licensed company manages contracts with their own clients |
| `/admin/contracts/new` | **[COMPANY_ADMIN]** | Licensed company creates contracts — dangerous today because the client picker shows all clients |
| `/admin/contracts/[id]` | **[COMPANY_ADMIN]** | Contract detail, countersign, version history, comments |
| `/admin/proposals` | **[COMPANY_ADMIN]** | Licensed company creates and sends proposals to their clients |
| `/admin/proposals/new` | **[COMPANY_ADMIN]** | Proposal creation — client picker currently unscoped |
| `/admin/proposals/[id]` | **[COMPANY_ADMIN]** | Proposal detail and publish management |
| `/admin/proposals/templates` | **[BOTH]** | Andy'K Group would maintain global templates; licensed companies could have company-specific ones; currently no scoping |
| `/admin/invoices` | **[COMPANY_ADMIN]** | Licensed company bills their clients; currently returns ALL invoices from all companies |
| `/admin/invoices/new` | **[COMPANY_ADMIN]** | Invoice creation — client picker currently unscoped |
| `/admin/invoices/[id]` | **[COMPANY_ADMIN]** | Invoice detail, PDF, send action |
| `/admin/questionnaires` | **[BOTH]** | Andy'K Group uses this for license intake; a licensed company could use it for their own client onboarding — but currently a shared pool |
| `/admin/questionnaires/[id]` | **[BOTH]** | Questionnaire detail and AI evaluation |
| `/admin/questions` | **[COCKPIT]** | Question editor for the A.D.A.M. intake form — global, controlled by Andy'K Group only |
| `/admin/strategy` | **[COMPANY_ADMIN]** | Strategy documents written by a company for their clients |
| `/admin/reports` | **[COCKPIT]** | Business analytics with revenue charts, lead conversion, and health scores across ALL companies and ALL clients — Andy'K Group executive view only |
| `/admin/reports/client/[clientId]/new` | **[COMPANY_ADMIN]** | Create monthly/quarterly report for a specific client — scoped to one client by URL param |
| `/admin/founding-codes` | **[COCKPIT]** | Founding Client Program code generation, `MAX_CODES = 20` hardcoded — Andy'K Group program management only |

---

## Q2 — What Is Hardcoded to Andy'K Group

### Email transport (`src/app/actions/email.ts`)

```
from = "info@andykgroup.com"                          // default sender, every email
from: `Andy'K Group International LTD <${from}>`     // display name, every email
LOGO_URL = "https://adam.andykgroup.com/images/..."   // logo in every email header
```

Every email sent by the system — proposals, contracts, invoices, KYC confirmations, launch invitations — displays "Andy'K Group International LTD" as the sender. A licensed company's outbound emails would arrive appearing to be from Andy'K Group.

### Site config (`src/lib/data.ts`)

```typescript
siteConfig.company  = "Andy'K Group International LTD"
siteConfig.email    = "info@andykgroup.com"
siteConfig.companyReg = "16453500"          // UK company reg number
siteConfig.address  = "86-90 Paul Street, London, EC2A 4NE"
```

Used in `sendProposalResponse()`, email footer, and anywhere `siteConfig` is imported.

### Admin dashboard page header (`/app/admin/page.tsx` line ~511)

```tsx
<p className="label-mono mb-2">Andy'K Group International LTD — A.D.A.M.</p>
```

Hardcoded string in JSX, not pulled from config.

### EnterpriseTab (`src/components/admin/EnterpriseTab.tsx`)

```
mailto:ceo@andykgroup.com?subject=Enterprise Features Request
```

Hardcoded CEO email in the Enterprise features tab for every client.

### ReferralTab (`src/components/admin/ReferralTab.tsx`)

```typescript
referralLink = code ? `https://adam.andykgroup.com/r/${code}` : null
```

Referral links point to Andy'K Group's domain. A licensed company's referral links would send prospects to Andy'K Group's landing page.

### Founding codes page (`/app/admin/founding-codes/page.tsx`)

```typescript
const MAX_CODES = 20
```

Andy'K Group's Founding Client Program cap, hardcoded.

### Super admin layout (just created)

```typescript
user.email !== "ceo@andykgroup.com"
```

Hardcoded CEO email for gate check.

### Auth routing (`src/app/actions/auth.ts`)

```typescript
if (profile?.role === "client") {
  redirect("/dashboard");
} else {
  redirect("/admin");
}
```

Binary: client goes to `/dashboard`, everyone else goes to `/admin`. A `company_admin` role doesn't exist yet — they'd have to be assigned `admin` and land in Andy'K Group's panel.

---

## Q3 — What Breaks If a Licensed Company Logs In Today

Assuming a licensed company admin is given `role = 'admin'` (the only way to access `/admin` today):

### Hard data leaks — all rows from all companies

**Table: `clients`**  
RLS policy: `FOR ALL USING (get_my_role() = ANY(ARRAY['admin','staff']))` — no company filter.  
`listClients(supabase)` in `/admin/clients` runs with no `WHERE company_id =`. Returns every client in the database across every licensed company. Company A sees Company B's clients.

**Table: `contracts`**  
`listAllContracts(supabase)` in `/admin/contracts` — no client or company filter. Returns every contract. Commercially sensitive.

**Table: `proposals`**  
`listProposals(supabase)` — no client or company filter. All proposals, including commercial terms and pricing, visible.

**Table: `invoices`**  
`listAllInvoices(supabase)` — all invoices. Every company's billing data exposed.

**Table: `leads`**  
`listLeads(supabase)` — Andy'K Group's full prospect list visible. License applicants, their emails, company names, lead scores, metadata.

**Table: `questionnaires`**  
`listQuestionnaires(supabase)` — all submitted questionnaires. Personal contact details and business information from all applicants.

### Broken creation flows — wrong-company client picker

In `/admin/contracts/new`, `/admin/invoices/new`, `/admin/proposals/new`:

```typescript
// All three pages run:
listClients(supabase).then(setClients)
```

The client dropdown would populate with ALL clients. A licensed company admin could accidentally — or deliberately — create contracts and invoices for another company's clients.

### Routes that expose Andy'K Group internal operations

- `/admin/leads` — Andy'K Group's full sales funnel
- `/admin/founding-codes` — Founding Client Program management
- `/admin/questions` — intake questionnaire editor
- `/admin/reports` — full business analytics: revenue by month, conversion rates, health scores across all clients
- `/admin/page.tsx` — Launch Applicants widget and Implementation Risks across all companies

### Email sender identity theft

Any email sent via the system (proposals, contracts, invoices) would arrive as:
```
From: Andy'K Group International LTD <info@andykgroup.com>
```
A licensed company sending its own client a contract would be sending Andy'K Group's contact details.

### What actually works correctly (scoped by URL param)

- `/admin/clients/[id]` — fetches by `id`, if a company admin only knows their own client IDs, they'd see only those records
- `/admin/reports/client/[clientId]/new` — scoped to `clientId` in the URL
- `MilestonesTab`, `MeetingsTab`, `KycTab`, `ActivationTab`, `BillingTab`, `ContactsTab` — all scoped to `clientId` prop. Safe in isolation, but the list pages that link to them are not.

---

## Q4 — Minimum Viable Code for First 5–20 Founding Clients

**Core constraint**: Andy'K Group manually onboards each company. We can exploit this — during onboarding Andy'K Group sets data per company; licensed companies don't self-configure.

**The smallest path that is safe and practical:**

### Step 1 — Add `company_admin` role (DB + types, tiny)

```sql
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'staff', 'client', 'company_admin'));
```

Add to `UserRole` type in `types.ts`. No RLS changes needed.

### Step 2 — Use the existing `assigned_to` column on `clients` as owner scope

`clients.assigned_to` (`string | null`) already exists. During onboarding, Andy'K Group sets `assigned_to = <company_admin_user_id>` for every client that belongs to a licensed company. Cost: one DB update per client, done manually during onboarding. No schema change required.

### Step 3 — Inject scope into the admin layout

The admin layout (`/app/admin/layout.tsx`) is a server component that already reads the session. Add:

```typescript
const scopedAdminId = profile.role === 'company_admin' ? user.id : null;
```

Pass `scopedAdminId` to `AdminSidebar` and expose it via a context provider so all pages can read it client-side.

### Step 4 — Scope the four dangerous list queries

Four query functions need one extra optional filter:

```typescript
// listClients.ts
if (options.scopedAdminId) {
  query = query.eq('assigned_to', options.scopedAdminId);
}

// listAllContracts.ts — join through client
// listProposals.ts — join through client
// listAllInvoices.ts — join through client
```

For contracts/proposals/invoices: fetch the scoped client IDs first, then `.in('client_id', scopedClientIds)`. This is ~10 lines of code per query function.

### Step 5 — Hide cockpit-only pages for company_admin role

In `AdminSidebar.tsx`, read the role and conditionally exclude:
- `/admin/leads` and `/admin/leads/*`
- `/admin/founding-codes`
- `/admin/questions`
- `/admin/reports` (the analytics page)

Add a redirect in these pages' layout or early in the page body:
```typescript
if (role === 'company_admin') redirect('/admin');
```

### Step 6 — Fix the email sender for company admins

Pass a `fromEmail` and `fromName` parameter to `sendEmail()`. Read these from the client's record (or a company config row). For v1.0, Andy'K Group sets these during manual onboarding:

```typescript
// clients table, two new optional columns:
// sender_email: string | null
// sender_name: string | null
```

If null, fall back to Andy'K Group defaults.

### What this does NOT require

- No RLS overhaul (existing policies remain untouched)
- No `company_id` column (reuses `assigned_to`)
- No new tables
- No auth provider changes
- No dashboard (`/dashboard`) changes — still works for end-clients

### Total scope

| Item | Effort |
|---|---|
| DB: role constraint + `sender_email`/`sender_name` columns on clients | 1 migration, 10 minutes |
| types.ts: add `company_admin` to `UserRole` | 1 line |
| Admin layout: read scope, expose via context | ~20 lines |
| 4 query functions: add scopedAdminId filter | ~40 lines total |
| AdminSidebar: hide 4 cockpit routes | ~10 lines |
| Page-level guard in 4 cockpit pages | ~5 lines each |
| Email: add `sender_email`/`sender_name` passthrough | ~15 lines |

Realistic estimate: **1–2 days of focused work**, zero risk to existing functionality.

---

## Q5 — Recommended Implementation Order

### 1. `company_admin` role + DB scope column — **Small**

**Why first**: Everything else depends on being able to identify a company admin and scope their data. Without this, nothing can be built or tested.

Deliverable: `company_admin` in role CHECK constraint, `assigned_to` documented as ownership scope, two optional email sender columns on `clients`.

---

### 2. Admin layout scope injection + scoped list queries — **Medium**

**Why second**: This is the single most important safety change. Until the list queries are scoped, no company admin can safely access `/admin`. Once this is done, a licensed company can log in and see only their own clients, contracts, proposals, and invoices.

Deliverable: `AdminScopeContext`, scoped variants of `listClients`, `listAllContracts`, `listProposals`, `listAllInvoices`.

---

### 3. Cockpit route hiding + redirects — **Small**

**Why third**: After scoping the data, the remaining risk is company admins landing on cockpit-only pages (leads, founding codes, question editor, analytics). These pages show unscoped Andy'K Group operational data. Quick to fix once role is established.

Deliverable: Conditional sidebar items, page-level guards for 4 routes.

---

### 4. Email sender per-company config — **Small**

**Why fourth**: For v1.0 with 5 founding clients, this is a UX issue (not a security issue). Clients of a licensed company will receive emails from Andy'K Group. Fixing this after the data isolation is safer and lower risk.

Deliverable: `sender_email`/`sender_name` passthrough in `sendEmail()`, Andy'K Group sets these in admin during onboarding.

---

### 5. Scoped `/admin` dashboard for company admins — **Medium**

**Why fifth**: The current `/admin/page.tsx` dashboard shows Andy'K Group's operational view (all clients, risks, launch applicants). A company admin needs a scoped equivalent. This is not a blocker — company admins can land on `/admin/clients` instead — but it's the right UX endpoint.

Deliverable: Either scope the existing dashboard page based on role, or create a lightweight `/admin/company` dashboard that only shows the logged-in company's stats.

---

### 6. Per-company questionnaire intake — **Large**

**Why last**: Currently the `/questionnaire` public form feeds Andy'K Group's intake. A licensed company's clients need their own intake form (or a scoped version). This requires either a separate questionnaire routing mechanism (subdomain or token) or a new multi-tenant questionnaire flow. Not needed for 5 founding clients who are manually onboarded.

Deliverable: Questionnaire routing with `company_id` context, scoped `question_items` per company, separate submission pipeline.

---

## Summary

The codebase is a single-tenant admin panel that works correctly for Andy'K Group. It is 3–5 focused changes away from safely supporting 5–20 Founding Client companies. The critical safety change is **scoping the four list queries** (`clients`, `contracts`, `proposals`, `invoices`) — everything else is polish. The existing `assigned_to` column on `clients` is sufficient to implement ownership scoping without any new tables or RLS changes.

The email sender identity issue is the most visible UX problem at launch — a licensed company's clients will receive emails appearing to be from Andy'K Group.
