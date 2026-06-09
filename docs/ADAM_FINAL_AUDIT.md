# A.D.A.M. v1.0 — Final Pre-Launch Audit

Date: 9 June 2026 | Launch: 15 July 2026

---

## 1. Launch Readiness Score

**7.5 / 10**

The core platform is production-ready. The full client lifecycle — from public application through proposal, contract, invoicing, and the client portal — is feature complete, compiles without errors across 81 pages, and has correct role-based access control throughout. Seven P1 compliance and positioning issues identified in the pre-launch review were all resolved on 9 June 2026. One P0 bug remains unfixed: the launch invite API returns a 403 error for all admins due to a one-line column mismatch in the auth check, meaning the invite button currently does nothing. The company_admin multi-tenant path is architecturally designed but not yet wired end-to-end — account creation, data assignment, and email sender identity are all manual or absent. These gaps prevent the invited founding-client onboarding flow from working without engineering intervention before launch day.

---

## 2. P0 Blockers — Must fix before launch

**1. Launch invite button silently fails (403 for all admins)**

The "Send Launch Invite" button on the admin dashboard and the super-admin applications list both call the launch invite API. The API validates the caller's admin role by querying the users table using the wrong column — the session's user ID is compared against the internal record ID instead of the authentication ID. This means the query returns no matching row, the role check evaluates to undefined, and the API rejects every request with a 403. The fix is one word in one file: change the column name in the equality check. Until this is fixed, no launch invite can be sent through the platform.

**2. Invite email links to the public intake form, not checkout**

Even once the 403 is fixed, the invite email sends recipients to the public application questionnaire rather than a checkout or activation page. A recipient who follows the email creates a second unlinked lead record. There is no token, no tracking parameter, and no connection between the original invite and the new submission. The minimum fix is updating the destination URL in the email template to point to the pricing section or a dedicated activation page.

---

## 3. P1 Items — Fixed 9 June 2026

All seven P1 items identified in the pre-launch audit were resolved before this document was generated.

| # | Item | Status |
|---|---|---|
| ✅ 1 | **E.V.E. "Coming soon" label removed** — E.V.E. Intelligence System was displayed as coming soon on the landing page while actively accepting applications. The coming soon flag was removed, the tagline and feature list updated, and E.V.E. now displays as live alongside A.D.A.M. | Done |
| ✅ 2 | **Privacy notice added to application form** — The public questionnaire at `/questionnaire` had no privacy disclosure at the point of data collection. A transparency notice was added below the submit button citing the Privacy Policy and stating the UK GDPR lawful basis. | Done |
| ✅ 3 | **Privacy Policy sub-processors updated** — Revolut, Anthropic, and Vercel were absent from the sub-processors section. All three were added with accurate descriptions of their role and data handling. | Done |
| ✅ 4 | **KYC documents added to Privacy Policy** — Identity documents, company registry extracts, director details, and power of attorney collected via the client portal were not listed in the data collection section. All KYC document types were added to Section 1. | Done |
| ✅ 5 | **Landing page stats replaced** — "200+ Clients onboarded", "98% Client satisfaction", and "12+ Countries served" were aspirational figures not based on actual data. These were replaced with accurate launch stats: 20 founding client slots, 48-hour application review, EU data storage, and 24-hour priority support. | Done |
| ✅ 6 | **Email delivery switched to EU endpoint** — All outbound email was routed through the US Resend endpoint despite the Privacy Policy referencing EU infrastructure. Switched to the EU endpoint in both the email actions file and the leads submission file. All 24 templates and lead notification emails now route through the EU. | Done |
| ✅ 7 | **OG image compressed** — The social sharing image was 6.8 MB at 6250×6250 pixels, excessive for any platform. Compressed to 80 KB at 1200×1200 pixels using sharp. | Done |

---

## 4. P2 Items — Post-launch

Listed in recommended priority order.

| Priority | Item | Notes |
|---|---|---|
| 1 | **Company_admin user creation path** | No server action or admin UI exists to create a user with the company_admin role. The role is defined in the type system but convertToClientAction always assigns the client role. A new action or an optional role parameter is needed before any founding company can be onboarded as a licensed operator. |
| 2 | **clients.assigned_to population** | The data isolation mechanism depends on this column being set to the company admin's authentication ID for each of their clients. No code path currently writes this value — every client row has it as null. Until it is set (manually or via a new admin UI field), company admins see zero records after login. |
| 3 | **Auth callback routing for company_admin** | When a company_admin user authenticates via a magic link or OAuth, the auth callback falls through to the landing page. The admin role redirect condition needs one additional clause to catch this role and send it to the admin panel. |
| 4 | **Email sender override columns** | The architecture plan defines sender_email and sender_name as optional columns on the clients table, allowing Andy'K Group to configure per-company sender identity during onboarding. These columns and the fallback logic in the email sending function are not yet implemented. Until they are, all outbound email displays Andy'K Group as the sender regardless of which company's account triggered it. |
| 5 | **Self-service data deletion link** | GDPR Article 17 is satisfied by the email-based erasure process described in the Privacy Policy, but there is no visible link in the client portal directing users to submit a deletion request. A mailto link in the profile page would surface this without requiring a technical build. |
| 6 | **Service-specific welcome emails** | E.V.E. and B2G clients receive the same generic welcome email as A.D.A.M. license clients. Dedicated first-touch emails for each service type would improve onboarding clarity. |
| 7 | **Supabase cookie name verification** | The Cookie Policy lists three cookie names. Supabase SSR typically uses a project-scoped naming convention. The actual names should be verified against production browser cookies before or shortly after launch. |

---

## 5. Company Admin Readiness

**Status: Partially built — functional scaffolding, incomplete creation path.**

The company_admin role is defined in the type system and the admin layout correctly recognises it, granting access to the operations panel. The scoped query infrastructure is in place: the admin layout reads the logged-in user's authentication ID and the four primary list queries — clients, contracts, proposals, and invoices — all accept a scope filter that restricts results to records assigned to that ID.

**What works today:** A company_admin user who exists in the database, has been manually assigned their role, and has clients.assigned_to set for their clients would log in, reach the admin panel, see only their own clients and associated records, and be redirected away from cockpit-only routes such as leads, founding codes, the question editor, and the analytics dashboard.

**What is manual in v1.0:**
- Andy'K Group must create the user via a direct database operation or a new admin action — no UI exists for this
- Andy'K Group must set clients.assigned_to to the company admin's authentication ID for each client during onboarding — no code does this automatically
- Andy'K Group must set sender_email and sender_name on the clients table row if the company requires their own email identity — the email sending logic does not yet read these columns
- The auth callback route must be patched to route company_admin to the admin panel (one-line fix, currently falls through to the landing page)

In short: v1.0 can support company admins through manual database operations by Andy'K Group staff, but the self-service wiring is incomplete.

---

## 6. Andy'K Group Cockpit Readiness

**Status: Fully functional. All 5 routes operational.**

The cockpit is the CEO-level view of the entire platform, accessible only to the account with the super-admin email. It is separate from the operations panel and gives full visibility across all companies, all license holders, and the founding client program.

| Route | What it shows |
|---|---|
| **Dashboard** | 8 platform-wide stat cards (total applications, qualified leads, active clients, revenue indicators), the Founding Client progress bar tracking slots filled against the 20-slot cap with the 15 July 2026 deadline, and recent activity across all companies |
| **Applications** | Full lead list with status filters — new, qualified, rejected, converted. Each lead shows company, service interest, submission date, and lead score. Convert-to-client action creates the auth user, client record, and sends the welcome email in one operation. |
| **Companies** | All licensed companies with their plan tier, activation status, and assigned clients. Used to onboard and configure each founding client company. |
| **Founding Clients** | Dedicated list of all founding client accounts with their slot number, activation date, and plan details. Used to track the controlled launch cohort. |
| **Licenses** | License management — tier assignments, activation status, billing cycle, and subscription state per licensed company. |

---

## 7. Invite → Activation Flow Status

| Step | Description | Status |
|---|---|---|
| 1 | Admin or super-admin clicks "Send Launch Invite" in the dashboard or applications list | ❌ Returns 403 for all admins — auth check queries by the wrong column |
| 2 | Invite email delivered to the prospect | ⚠️ Delivery works once the 403 is fixed; email subject and copy are correct |
| 3 | Invite email CTA destination | ❌ Links to the public intake questionnaire, not a checkout or activation page |
| 4 | Prospect follows link and submits | ⚠️ Creates a second unlinked lead record — no connection to the original invite |
| 5 | Admin manually reviews the new submission | ✅ Questionnaire received, admin notified, review interface functional |
| 6 | Admin clicks "Convert to Client" | ✅ Auth user and client record created; welcome email with temporary password sent |
| 7 | Client receives welcome email | ✅ Correct branding, client reference, sign-in link, and temporary password |
| 8 | Client signs in at the portal | ✅ Routed to client dashboard; lifecycle progress widget and contract list displayed |
| 9 | Client changes temporary password | ⚠️ Email instructs password change but account is set to active immediately — no system prompt enforces it |

**Summary:** Steps 6 through 8 work correctly for the standard client role. Steps 1 through 4 are broken or misrouted and must be fixed before the invite-based founding client campaign can operate.

---

## 8. Data Isolation Status

**Status: Infrastructure present, population gap means it is not yet active.**

**Scoped queries:** The four queries that drive the main list pages — clients, contracts, proposals, and invoices — all support an optional scope parameter. When the admin layout detects a company_admin user, it passes their authentication ID as the scope value. Each query then adds a filter restricting results to records where clients.assigned_to matches that ID.

**The assigned_to mechanism:** The clients table has an assigned_to column intended to hold the authentication ID of the company admin who owns that client relationship. The admin layout reads this column to build the scope. Contract, proposal, and invoice queries join through the clients table, so all associated records are automatically scoped once the parent client row is correctly assigned.

**What is protected today for company_admin users:** Cockpit routes — leads, founding codes, question editor, and the analytics dashboard — redirect company_admin users back to the operations home. The admin layout enforces this server-side.

**The gap:** No code path ever writes a value to clients.assigned_to. Every client row in the database has this column as null. A company_admin user who logs in will pass authentication and reach the admin panel, but every scoped list query will return zero results. Data isolation is only as effective as the column population. Until Andy'K Group manually sets assigned_to for each client during onboarding, the scoping mechanism is inert.

**What is protected for all users regardless:** Supabase row-level security is active. Client dashboard routes are gated to the client role only. The service-role admin client is used exclusively server-side. No client-side code has direct database access.

---

## 9. Email Sender Override Status

**Status: Designed and planned, not yet implemented in code.**

**The problem:** Every outbound email — proposals, contracts, invoices, welcome messages, notifications — is sent from Andy'K Group International LTD using the address info@andykgroup.com. A company admin using A.D.A.M. to manage their own clients would send contracts to their clients appearing to be from Andy'K Group.

**The designed solution:** The architecture plan adds two nullable columns to the clients table — sender_email and sender_name. The email sending function falls back to Andy'K Group defaults when these are null, and uses the company-specific values when set. Andy'K Group sets these manually during founding client onboarding.

**Current state:** The columns do not yet exist. The email sending function has no fallback logic for per-company identity. All email, regardless of which company_admin account triggered it, arrives from Andy'K Group.

**How to use once implemented:** During onboarding, Andy'K Group sets sender_email and sender_name on the relevant clients table row. No code changes are needed per company — the email function reads the values at send time. For any company where these are left null, Andy'K Group identity is used as the default, which is correct for clients that Andy'K Group manages directly.

---

## 10. Final Verdict

⚠️ READY WITH WARNINGS

A.D.A.M. v1.0 is ready to operate as a single-tenant client lifecycle management system for Andy'K Group. The core platform — application intake, lead management, proposal and contract workflows, invoicing, client portal, and all 24 email templates — is fully functional and legally compliant following the seven P1 fixes applied on 9 June 2026. Two items must be resolved before the launch invite campaign can run: the one-line fix to the launch invite API auth check, and the invite email destination URL. The company_admin multi-tenant path requires additional engineering work and cannot be used for founding client companies until account creation, data assignment, and email sender identity are wired together — all three are achievable within one to two focused days of work ahead of the 15 July 2026 target date.

---

*Generated from automated static analysis of the A.D.A.M. codebase, Supabase database inspection, and review of all five pre-launch audit documents as at 9 June 2026. Dynamic runtime behaviour including Supabase RLS enforcement, Revolut payment flows, and cron job execution should be verified under production conditions before the launch date.*
