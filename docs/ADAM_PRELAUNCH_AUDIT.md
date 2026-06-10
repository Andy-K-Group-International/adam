# A.D.A.M. — Full Pre-Launch Audit

**Date:** 9 June 2026
**Auditor:** Claude Code (automated static analysis + DB inspection)
**Build status at audit:** ✅ Clean — 0 TypeScript errors, 81 pages compiled
**Scope:** Full codebase + DB + compliance pre-launch readiness check
**Mode:** Read-only — no fixes applied

---

## Section 1 — Public Pages & Copy

### Landing Page (`/`)

| Item | Status | Notes |
|------|--------|-------|
| Headline | ⚠️ | "Your Business, Automated." — generic; doesn't reference Controlled License Launch |
| Hero CTA | ✅ | "Start Questionnaire" → `/questionnaire` (application form, not waitlist) |
| Secondary CTA | ✅ | "Learn More" → `#services` |
| Positioning | ⚠️ | Landing copy reads as a general SaaS product, not a Controlled License Launch with limited slots |
| Stats widget | ⚠️ | "200+ Clients onboarded", "12+ Countries served", "98% Client satisfaction", "24h response" — appears aspirational/pre-revenue; if not based on actual data this is misleading advertising |
| E.V.E. listing | ❌ | `integrationFeatures` in `data.ts` has E.V.E. with "Coming soon" tag — E.V.E. questionnaire section just built; positioning inconsistency |
| Legal links in footer | ✅ | Privacy Policy, Terms & Conditions, Cookie Policy, Service Definition all present |
| Cookie banner | ✅ | Correctly absent (essential-only cookies, PECR exempt) |
| Placeholder text | ✅ | None found |
| Logo | ✅ | Present in Navbar and Footer |

### Pricing Section (`/#pricing`)

| Item | Status | Notes |
|------|--------|-------|
| Payment flow | ✅ | Gates behind 5 consent checkboxes (T&C, business verification, AI, billing, activation) |
| Payment disabled path | ✅ | When `NEXT_PUBLIC_PAYMENTS_ENABLED=false`, CTA shows "Apply for License Access" → `/questionnaire` |
| Payment enabled path | ✅ | Revolut checkout URL returned from `/api/revolut/subscription` |
| Founding code input | ✅ | Present for internal tab + monthly + payments enabled |
| Consent checkboxes | ✅ | Links to T&C and Privacy Policy |
| Annual plans | ⚠️ | Consent checkboxes only shown when `paymentsEnabled=true` — annual tab flow unclear without payments |

### Public Application Form (`/questionnaire`)

| Item | Status | Notes |
|------|--------|-------|
| Positioning | ✅ | "Partnership Application" header, manual review messaging |
| Service options | ✅ | B2G, A.D.A.M., E.V.E., End-to-End, Not sure |
| Privacy notice | ❌ | No link to Privacy Policy on the form |
| Consent checkbox | ❌ | No consent statement near submit button |
| Submit disclaimer | ⚠️ | Only: "We do not share your information" — no privacy policy link, no data processing disclosure |
| Business email validation | ✅ | Blocks 14 personal email domains |
| E.V.E. follow-up questions | ✅ | 5 conditional questions appear when E.V.E. selected |
| E2E document upload | ✅ | Required document upload for End-to-End service |

### Apply Redirect (`/apply`)

| Item | Status | Notes |
|------|--------|-------|
| Route exists | ✅ | Redirects to `/questionnaire` (with optional `?ref=` param) |

### Request Demo (`/request-demo`)

| Item | Status | Notes |
|------|--------|-------|
| Form exists | ✅ | Full company profile form with business email validation |
| Privacy notice | ❌ | Not checked — likely has same gap as `/questionnaire` |

---

## Section 2 — Client Flows

### Flow Architecture

Account creation is **admin-initiated only** — there is no self-service sign-up (`/sign-up` does not exist). Clients are created via:
1. Lead submits application → `leads` table
2. Super Admin reviews and clicks "Convert" → auth user + `users` + `clients` records created
3. Welcome email with temp password sent automatically

### E2E (End-to-End Business Development)

| Stage | Status | Notes |
|-------|--------|-------|
| Application | ✅ | `/questionnaire` — requires document upload (company strategy, business plan, etc.) |
| Admin notification | ✅ | `sendLeadAdminNotification` — "HIGH PRIORITY" flag for E2E, score included |
| Approval | ✅ | Super Admin converts lead → client |
| Welcome email | ✅ | `sendWelcomeEmail` with temp password and client reference |
| Questionnaire (deep-dive) | ✅ | `/questionnaire/full` — End-to-End section exists in DB (section_id: end-to-end) |
| Proposal | ✅ | `/admin/proposals/new`, `sendProposalPublished`, `sendProposalSent` |
| Contract | ✅ | `/admin/contracts/new`, signature canvas, version history |
| Invoice | ✅ | `/admin/invoices/new`, `sendInvoiceSent`, overdue reminders |
| Kickoff | ✅ | `sendKickoffConfirmed` email |

### B2G (Government Contracts)

| Stage | Status | Notes |
|-------|--------|-------|
| Application | ✅ | Available on `/questionnaire` |
| Deep-dive questionnaire | ✅ | `section_id: b2g` exists in DB |
| Subsequent flow | ✅ | Same as E2E from proposal onward |

### A.D.A.M. System Licensing

| Stage | Status | Notes |
|-------|--------|-------|
| Application | ✅ | Available on `/questionnaire` |
| Deep-dive questionnaire | ✅ | `section_id: adam` exists in DB |
| Pricing | ✅ | Starter/Growth/Scale/Enterprise tiers defined in `data.ts` |
| company_admin role | ✅ | License clients get `company_admin` role, scoped dashboard at `/admin` |
| White-label flow | ✅ | Defined in T&C; white-label pricing tier exists |

### E.V.E. Intelligence System

| Stage | Status | Notes |
|-------|--------|-------|
| Application | ✅ | Available on `/questionnaire`, 5 follow-up questions |
| Deep-dive questionnaire | ✅ | `section_id: eve` inserted, 12 questions (3 subsections), DB order 6 |
| Landing page positioning | ❌ | Listed as "Coming soon" in `integrationFeatures` in `data.ts` — inconsistent with accepting live applications |
| Email template | ⚠️ | No dedicated E.V.E.-specific onboarding email; uses generic `sendWelcomeEmail` |

### Hardcoded References
- Andy'K Group email addresses: `info@andykgroup.com`, `ceo@andykgroup.com`, `legal@andykgroup.com` — static, not configurable
- Launch date `15 July 2026` hardcoded in: admin dashboard Launch Applicants widget, super-admin Founding Client progress bar

---

## Section 3 — Admin & Super Admin UI

### Admin Routes (24 pages)

| Route | Status | Notes |
|-------|--------|-------|
| `/admin` | ✅ | Dashboard with stats, action items, risk widgets, launch widget |
| `/admin/pipeline` | ✅ | Visual pipeline board |
| `/admin/leads` | ✅ | Lead list with filters |
| `/admin/leads/[id]` | ✅ | Lead detail |
| `/admin/leads/new` | ✅ | Manual lead creation |
| `/admin/clients` | ✅ | Client list |
| `/admin/clients/[id]` | ✅ | Client detail |
| `/admin/proposals` | ✅ | Proposal list |
| `/admin/proposals/new` | ✅ | New proposal form |
| `/admin/proposals/[id]` | ✅ | Proposal editor |
| `/admin/proposals/templates` | ✅ | Template management |
| `/admin/strategy` | ✅ | Strategy management |
| `/admin/contracts` | ✅ | Contract list |
| `/admin/contracts/new` | ✅ | New contract |
| `/admin/contracts/[id]` | ✅ | Contract editor with comments, versions, appendices |
| `/admin/invoices` | ✅ | Invoice list |
| `/admin/invoices/new` | ✅ | New invoice |
| `/admin/invoices/[id]` | ✅ | Invoice detail |
| `/admin/reports` | ✅ | Reports overview |
| `/admin/reports/client/[clientId]/new` | ✅ | New client report |
| `/admin/questionnaires` | ✅ | Submitted questionnaire list |
| `/admin/questionnaires/[id]` | ✅ | Questionnaire detail + AI evaluate |
| `/admin/questions` | ✅ | DB-driven question editor |
| `/admin/founding-codes` | ✅ | Founding client code management |

### Role Gating

| Role | Access | Status |
|------|--------|--------|
| `admin` / `staff` | Full `/admin` access | ✅ |
| `company_admin` | `/admin` with data scoped to `clients.assigned_to = auth_id` | ✅ |
| `client` | Redirected from `/admin` to `/dashboard` | ✅ |
| `ceo` (super-admin) | `/super-admin` + full `/admin` | ✅ |

### Super Admin Routes (5 pages)

| Route | Status | Notes |
|-------|--------|-------|
| `/super-admin` | ✅ | 8 stat cards, Founding Client progress (20 slots, 15 Jul 2026) |
| `/super-admin/applications` | ✅ | Lead management, status filters, convert to client |
| `/super-admin/companies` | ✅ | Company/license management |
| `/super-admin/founding-clients` | ✅ | Founding client list |
| `/super-admin/licenses` | ✅ | License management |

### Admin Sidebar Navigation

All 11 nav items link to existing routes: Dashboard, Pipeline, Leads, Clients, Proposals, Strategy, Contracts, Invoices, Reports, Questionnaires, Questions, Founding Clients. ✅

### TODOs / Placeholders in Admin

| Location | Content | Severity |
|----------|---------|----------|
| `components/admin/AiSettingsTab.tsx:129` | API key input placeholder "sk-… (saving disabled — coming soon)" | Low |
| `components/admin/QuestionEditor.tsx:212` | Form field placeholder "Optional placeholder text" | Low |

---

## Section 4 — Client Zone (`/dashboard`)

| Item | Status | Notes |
|------|--------|-------|
| First login experience | ✅ | Welcome popover, lifecycle progress widget, contract list |
| Application status | ⚠️ | No explicit "Your application is under review" state — clients created only post-conversion, so this is N/A by design |
| Contracts view | ✅ | `/dashboard/contracts` — list + detail with signature canvas |
| Documents | ✅ | `/dashboard/documents` — file management |
| Invoices | ✅ | `/dashboard/invoices` — invoice history |
| Proposals | ✅ | `/dashboard/proposals` — proposal review and response |
| Reports | ✅ | `/dashboard/reports` |
| Milestones | ✅ | `/dashboard/milestones` |
| Profile + KYC | ✅ | `/dashboard/profile` — account info, subscription plan, KYC document upload |
| AI Settings | ✅ | `/dashboard/ai-settings` — exists |
| company_admin in dashboard | ✅ | Redirected to `/admin` from dashboard layout |
| Branding | ✅ | IBM Plex Sans/Mono, Playfair Display, teal highlight |

---

## Section 5 — Emails

All 24 email functions are in `src/app/actions/email.ts`. Default sender: `info@andykgroup.com / Andy'K Group International LTD`.

| # | Function | Subject | CTA | Status |
|---|----------|---------|-----|--------|
| 1 | `sendContractPublished` | "New Contract Available: {title}" | /dashboard/contracts/{id} | ✅ |
| 2 | `sendChangesRequested` | "Changes Requested: {title}" | /admin/contracts/{id} | ✅ |
| 3 | `sendContractSigned` | "Contract Signed by Client: {title}" | /admin/contracts/{id} | ✅ |
| 4 | `sendContractFinalized` | "Contract Finalized: {title}" | /dashboard/contracts/{id} | ✅ |
| 5 | `sendContractSignatureReminder` | "Reminder: Please sign your contract — {title}" | /dashboard/contracts/{id} | ✅ |
| 6 | `sendQuestionnaireReceived` | "New Questionnaire Submitted: {company}" | /admin/questionnaires/{id} | ✅ |
| 7 | `sendQuestionnaireInvite` | "Your Andy'K Group Strategic Assessment is ready" | /questionnaire/full?token={token} | ✅ |
| 8 | `sendProposalPublished` | "Your Proposal is Ready: {title}" | /dashboard/proposals/{id} | ✅ |
| 9 | `sendProposalChangesRequestedByClient` | "Changes Requested on Proposal: {title}" | /admin/proposals/{id} | ✅ |
| 10 | `sendProposalConfirmed` | "Proposal Confirmed: {title}" | /admin/proposals/{id} | ✅ |
| 11 | `sendProposalSent` | "Proposal Ready for Review: {title}" | /dashboard/proposals/{id} | ✅ |
| 12 | `sendProposalResponse` | "Proposal Approved/Declined: {title}" | /admin/proposals/{id} | ✅ |
| 13 | `sendProposalResponseReminder` | "Reminder: Please respond to your proposal — {title}" | /dashboard/proposals/{id} | ✅ |
| 14 | `sendLeadConfirmation` | "Your application has been received — Andy'K Group" | /sign-in (if converted) | ✅ |
| 15 | `sendLeadAdminNotification` | "🔴 END-TO-END or HIGH PRIORITY — New lead: {company}" | /admin/questionnaires/{id} | ✅ |
| 16 | `sendLeadRejection` | "Regarding your Andy'K Group application" | none | ✅ |
| 17 | `sendTokenReminder` | "Reminder: {N} day(s) left to complete your Strategic Assessment" | /questionnaire/full?token={token} | ✅ |
| 18 | `sendInvoiceSent` | "Invoice {number} — {amount} due {date}" | /dashboard/invoices/{id} | ✅ |
| 19 | `sendInvoiceOverdue` | "Overdue: Invoice {number} — {amount}" | /dashboard/invoices/{id} | ✅ |
| 20 | `sendWelcomeEmail` | "Welcome to A.D.A.M. — Your account is ready" | /sign-in, /dashboard | ✅ |
| 21 | `sendKickoffConfirmed` | "Your project with Andy'K Group is now live" | /dashboard | ✅ |
| 22 | `sendClientRequestNotification` | "📋 Client Request: {company} — {docType}" | /admin | ✅ |
| 23 | `sendClientRequestResponse` | "Update on your {docType} request — Andy'K Group" | /dashboard | ✅ |
| 24 | `sendContactForm` | "New Contact Form Submission from {name}" | none | ✅ |

### Email Notes

- **Logo asset:** Templates reference `/images/adam-logo.png` via `https://adam.andykgroup.com/images/adam-logo.png` — file confirmed in `/public/images/adam-logo.png` ✅
- **Branding:** Consistent across all templates — hex `#2F9E9A` teal, `#0E282D` dark, `#f0f4f4` background, Georgia/Courier New serif/mono
- **Hardcoded base URL:** `https://adam.andykgroup.com` in all CTA links — no env var; must update if domain changes
- **Emoji in admin subject:** `sendLeadAdminNotification` uses 🔴 emoji — displays correctly in most clients but verify spam score
- **No service-specific onboarding emails:** E.V.E. and B2G clients receive the same generic `sendWelcomeEmail` — no tailored first-touch messaging for each service

---

## Section 6 — Legal & GDPR

*(Full detail in `docs/ADAM_COMPLIANCE_AUDIT.md` — summary here)*

| Item | Status | Priority |
|------|--------|----------|
| Privacy Policy (`/privacy-policy`) | ✅ Exists | — |
| Terms of Service (`/terms-and-conditions`) | ✅ Exists | — |
| Cookie Policy (`/cookies-policy`) | ✅ Exists | — |
| Legal links in footer | ✅ All 3 linked | — |
| GDPR consent — payment flow | ✅ 5 mandatory checkboxes | — |
| GDPR consent — application form | ❌ No privacy notice on `/questionnaire` | P1 |
| Sub-processors in Privacy Policy | ❌ Missing Revolut, Anthropic, OpenAI, Vercel | P1 |
| KYC data in Privacy Policy | ❌ ID/passport not listed in data collection | P1 |
| Supabase EU data residency | ✅ eu-west-1 (Ireland) | — |
| Resend EU endpoint | ⚠️ US endpoint; SCCs disclosed but unconfirmed | P2 |
| Right to erasure | ⚠️ Manual email only; no dashboard link | P2 |
| Cookie banner | ✅ Correctly absent (essential-only cookies) | — |

---

## Section 7 — Branding & Visual

| Item | Status | Notes |
|------|--------|-------|
| Logo — landing | ✅ | Navbar and footer |
| Logo — questionnaire | ✅ | `/adam-logo-simple-no-bg.png` in questionnaire header |
| Logo — sign-in | ✅ | `/images/adam-logo.png` |
| Logo — emails | ✅ | Inline SVG + `/images/adam-logo.png` |
| Color tokens | ✅ | Teal `#2F9E9A` (highlight), dark `#0E282D` (foreground), cream background |
| Typography | ✅ | IBM Plex Sans, IBM Plex Mono, Playfair Display — loaded via next/font |
| OG Image | ⚠️ | `/ADAM.png` exists (1080×1080) but is **7.1 MB** — too large; social platforms will still display it but adds unnecessary payload |
| Favicon | ✅ | `/favicon.ico` (32×32), `/icon.png` (512×512), `/apple-icon.png` (180×180) |
| Meta tags | ✅ | OG title, description, image, Twitter card all set in root layout |
| Sitemap | ✅ | `/sitemap.xml` (dynamic via `sitemap.ts`) |
| Robots.txt | ✅ | `/robots.txt` (via `robots.ts`) |
| E.V.E. assets | ✅ | `eve-logo.png`, `eve-logo.mp4` in `/public/images/` |
| Broken images | ✅ | None detected in source references |

---

## Section 8 — Technical

### Build

| Item | Status | Notes |
|------|--------|-------|
| TypeScript compilation | ✅ | 0 errors, 81 pages compiled |
| All routes compile | ✅ | Static + dynamic pages all build cleanly |

### Environment Variables

| Variable | Used For | Required |
|----------|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client | ✅ Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client auth | ✅ Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/server-side DB operations | ✅ Required |
| `RESEND_API_KEY` | Email delivery | ✅ Required |
| `ANTHROPIC_API_KEY` | AI evaluation, summaries, analysis | ✅ Required |
| `REVOLUT_SECRET_KEY` | Payment processing | ✅ Required (if payments enabled) |
| `CRON_SECRET` | Cron job authentication (keep-alive, reminders) | ✅ Required |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | Payment flow toggle | ⚠️ Optional — `false` by default |
| `NEXT_PUBLIC_FREECURRENCY_API_KEY` | Currency conversion | ⚠️ Optional |

No OpenAI key found in env references despite T&C and code mentioning OpenAI — likely unused currently.

### Keep-Alive & Crons

| Cron | Schedule | Purpose | Status |
|------|----------|---------|--------|
| `/api/keep-alive` | Every 4 hours | Supabase DB connectivity check | ✅ |
| `/api/cron/reminders` | Daily 8 AM | Token expiry reminders, overdue invoices | ✅ |
| `/api/cron/health-scores` | Daily 2 AM | Client health score recalculation | ✅ |
| `/api/cron/reports` | Monthly 1st 9 AM | Automated report generation | ✅ |

All configured in `vercel.json` with bearer token protection via `CRON_SECRET`.

### Security — Service Role Client Usage

The `createAdminClient()` (service role / RLS bypass) is used in:
- All `/app/api/*` server-side API routes — ✅ appropriate
- `/app/actions/*.ts` server actions — ✅ appropriate (server-side only)
- `/app/demo/page.tsx` — ⚠️ Server component; protected by demo token validation (redirects to `/request-demo` if token missing/expired/revoked) — acceptable

No client-side (browser) usage of the admin client detected. ✅

### RLS Assessment (High-Level)

- Client data isolation: `clients.assigned_to = auth_id` scoping in `company_admin` queries ✅
- Auth middleware active: all `/admin` and `/dashboard` routes gated ✅
- No direct DB access patterns found that bypass user context on client components ✅
- Deep RLS policy audit would require direct DB inspection (beyond static analysis scope)

---

## Section 9 — Database

### Key Tables & Columns

| Table | Key Columns | Status |
|-------|-------------|--------|
| `clients` | `assigned_to`, `stage`, `plan_name`, `billing_cycle`, `subscription_status`, `paid_until`, `founding_client` | ✅ |
| `users` | `auth_id`, `role`, `client_id`, `account_status` | ✅ |
| `leads` | `status`, `service_interest`, `launch_invite_sent`, `questionnaire_token`, `converted_to_client_id` | ✅ |
| `question_sections` | `section_id`, `title`, `order`, `subsections` (JSONB), `is_active` | ✅ |
| `question_items` | `question_id`, `number`, `section`, `subsection`, `type`, `options` (JSONB), `conditional_on` (JSONB) | ✅ |
| `questionnaires` | `segments`, `answers`, `status`, `submitted_at`, `ai_evaluation`, `converted_to_client_id` | ✅ |
| `contracts` | version history, comments, appendices, signature fields | ✅ |
| `kyc_verifications` | `status`, `documents` (JSONB array), `director_name`, `director_email`, `company_reg_number` | ✅ |

### Current Section Order in DB (post-EVE insertion)

```
0: goals-context
1: company-profile
2: segment-selection
3: b2b          ← section exists but B2B removed from segment options; b2b questions may still exist
4: b2g
5: adam
6: eve          ← newly added
7: end-to-end
8: proposal-readiness
9: attachments
10: review
```

### Flags

| Issue | Severity |
|-------|----------|
| `b2b` section still in DB and SECTION_ORDER — B2B removed from segment options so no questions will display, but section rows and questions exist in DB | Low — harmless, no user impact |
| Email hardcoded to `api.resend.com` (US endpoint) — not `api.eu.resend.com` | Medium |
| Indexes not verified — static analysis cannot confirm DB index presence on `email`, `client_id`, `assigned_to` | Unknown |

---

## Section 10 — Launch Readiness Score

| Section | Status | Summary | Priority |
|---------|--------|---------|----------|
| 1. Public Pages & Copy | ⚠️ Needs attention | E.V.E. "Coming soon" label active; no privacy notice on application form; landing stats appear aspirational | P1: remove "coming soon" from E.V.E., P1: add privacy link to form |
| 2. Client Flows | ⚠️ Needs attention | All core flows functional; no E.V.E.-specific onboarding email; E.V.E. "coming soon" on landing | P2: tailored EVE welcome email |
| 3. Admin & Super Admin UI | ✅ Ready | 24 admin routes + 5 super-admin routes fully functional; role gating correct; only minor placeholder text | — |
| 4. Client Zone | ✅ Ready | Full client dashboard functional; KYC, plan, contracts, documents all present | — |
| 5. Emails | ✅ Ready | 24 email templates, correct branding, all CTA links valid; base URL hardcoded | Low risk |
| 6. Legal & GDPR | ⚠️ Needs attention | All 3 legal docs exist; application form missing privacy notice; Privacy Policy sub-processors incomplete | P1: update Privacy Policy + form |
| 7. Branding & Visual | ⚠️ Needs attention | All assets present; OG image 7.1 MB is too large | P2: compress OG image |
| 8. Technical | ✅ Ready | Clean build, env vars documented, crons active, no security issues in static analysis | — |
| 9. Database | ⚠️ Needs attention | Schema complete; B2B section orphaned (harmless); Resend EU endpoint not used | P2 |
| 10. — | — | — | — |

### **Launch Readiness: 5/9 sections fully ready, 4 need attention**

### Blockers before launch (P1)

1. **E.V.E. "Coming soon" label** (`src/lib/data.ts` → `integrationFeatures`) — E.V.E. is live, label must be removed
2. **Privacy notice on `/questionnaire`** — Add privacy policy link and one-line data processing disclosure near submit button
3. **Privacy Policy sub-processors** — Add Revolut, Anthropic, Vercel to Section 4
4. **Privacy Policy data collection** — Add KYC documents (ID, company registry, director details) to Section 1

### Should fix before launch (P1–P2)

5. **Landing page stats** — Verify "200+ Clients onboarded", "12+ Countries served", "98% Client satisfaction" are defensible claims; replace with accurate figures or remove
6. **OG image size** — Compress `/public/ADAM.png` from 7.1 MB to ≤ 200 KB for social sharing
7. **Resend EU endpoint** — Switch from `api.resend.com` to `api.eu.resend.com` (one-line change in `email.ts` and `leads.ts`)

### Post-launch (P2–P3)

8. **Data deletion link in dashboard** — Add "Request data deletion" mailto link in `/dashboard/profile`
9. **Service-specific welcome emails** — Add tailored onboarding email for E.V.E. and B2G
10. **Supabase cookie names** — Verify actual cookie names in production match Cookie Policy table
11. **CRON_SECRET** — Confirm set in Vercel environment for production (cron jobs silently fail without it)

---

*Generated by automated static analysis. Does not substitute a formal legal review. Dynamic runtime behaviour (interactive form flows, Supabase RLS policy enforcement) requires manual testing to fully verify.*
