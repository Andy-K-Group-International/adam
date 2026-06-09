# A.D.A.M. v1.0 — Company Admin Gap Analysis

**Date:** 9 June 2026  
**Context:** Controlled SaaS License Launch. First 3–5 Founding Clients onboarded manually by Andy'K Group. Pricing: Trial License €499 / Full License €999/year / Branding Add-On from €350. Max 20 companies in Founding Client Program. Launch: 15 July 2026.  
**Scope:** Read-only analysis. No code changes. v1.0 reality only.

---

## Q1 — What Company Admin capabilities already exist today?

### Client Dashboard (what a Founding Client user can do)

Navigation: Overview · Milestones · Reports · Proposals · Contracts · Invoices · Documents · Profile

| Page | What the client can do |
|---|---|
| **Overview** (`/dashboard`) | View lifecycle progress bar (questionnaire→kickoff→active), status cards (total/pending/completed contracts), contract list, last 10 activity events |
| **Milestones** (`/dashboard/milestones`) | Read-only progress view of milestones set by admin. Progress bars. No create/edit. |
| **Reports** (`/dashboard/reports`) | List and read monthly/quarterly reports published by Andy'K Group. Download as `.txt` |
| **Proposals** (`/dashboard/proposals`) | List all proposals. Open detail → Approve or Decline with optional comment. Print/PDF. Request section-level changes via `ClientRequestForm`. |
| **Contracts** (`/dashboard/contracts`) | List non-draft contracts. Open detail → read full contract, sign via `SignatureCanvas`, request changes, view version history, post comments. Request section-level changes via `ClientRequestForm`. |
| **Invoices** (`/dashboard/invoices`) | View invoice list with amounts and dates. Download PDF. |
| **Documents** (`/dashboard/documents`) | View and access finalized (`status = 'final'`) contracts as downloadable files. |
| **Profile** (`/dashboard/profile`) | Upload KYC documents (company registry extract, ID/passport, power of attorney). View KYC status (pending / verified / rejected). |
| **AI Settings** (`/dashboard/ai-settings`) | View AI mode, monthly token limit, and logging status. **Read-only** — no editing by client. |
| **Change Password** (`/change-password`) | Standalone page to update account password. |
| **Forgot Password / Reset** (`/forgot-password`, `/reset-password`) | Standard Supabase password reset via email. |

### Admin can do for each client (19-tab admin client detail)

`overview` · `contacts` · `milestones` · `meetings` · `analysis` · `strategy` · `contracts` · `questionnaire` · `kickoff` · `kyc` · `activation` · `reports` · `activity` · `referral` · `billing` · `ai` · `business-verification` · `agreement-history` · `enterprise`

Admin controls the full lifecycle. Client users observe and respond — they do not drive.

### Also exists

- `LaunchApplicantsWidget` on admin dashboard: new leads visible with status workflow (new → contacted → qualified), "Mark Reviewed", "Approve", "Send Launch Invitation" actions
- `/nda-sign` route: standalone NDA signing flow (separate from contract flow)
- Admin "Preview Mode": admin can view the dashboard as any client (`?preview=clientId`), with signing/change-request actions disabled

---

## Q2 — What Company Admin capabilities are completely missing?

A "Company Admin" means a person at the licensed company managing their own operations within A.D.A.M. That role does not exist in v1.0. All management is done by Andy'K Group through the admin panel.

### Not present in client dashboard at all

| Missing capability | Why it matters |
|---|---|
| **Invite additional team members** | Multiple people at the company cannot share access. One auth user = one company in v1.0. |
| **Company profile editing** | Client cannot update their company name, address, or logo. Admin must do it. |
| **Billing / subscription view** | No "My Plan" page. Client cannot see which license tier they're on, next renewal date, or payment history beyond invoice PDFs. |
| **Milestone creation** | Client sees milestones; cannot create, rename, or reorder them. |
| **Meeting scheduling** | Meetings tab exists for admin only. Client has no meeting scheduling capability. |
| **Contact management** | Client cannot add, edit, or delete contacts on their account. Admin creates contacts. |
| **Self-service account creation** | No self-signup with plan selection. Account creation requires admin intervention. |
| **AI key configuration** | AI Settings page is read-only for clients. No self-serve AI key input (intentionally disabled, secure key storage pending). |
| **Internal notes** | Clients can submit change requests; they cannot write internal company notes inside the platform. |

---

## Q3 — For the first 3–5 Founding Clients, what is the minimum viable feature set?

For Andy'K Group to onboard and run the first 3–5 clients, the complete required workflow is:

| Step | Feature | Status |
|---|---|---|
| 1 | Client submits questionnaire at `/questionnaire` | ✅ Works |
| 2 | Admin reviews submission in admin dashboard | ✅ Works |
| 3 | Admin creates proposal, publishes to client | ✅ Works |
| 4 | Client reviews and approves/declines proposal | ✅ Works |
| 5 | Admin creates strategy, drafts contract | ✅ Works |
| 6 | Client signs contract (digital signature) | ✅ Works |
| 7 | Admin issues invoice | ✅ Works |
| 8 | Client views invoice, downloads PDF | ✅ Works |
| 9 | Admin confirms kickoff | ✅ Works |
| 10 | Client tracks milestones and receives reports | ✅ Works |
| 11 | Client submits KYC documents via profile | ✅ Works |
| 12 | Admin runs KYC verification | ✅ Works |

**The complete v1.0 Founding Client lifecycle is fully functional today.** All steps from application to active engagement work without additional development.

---

## Q4 — Which missing features are true launch blockers?

**No hard launch blockers exist for the first 3–5 manually-onboarded clients.**

However, two friction points require a manual workaround:

### Near-blocker 1 — Account creation flow for invited clients
The admin dashboard can send a "Launch Invitation" email via the `LaunchApplicantsWidget`. What the invitation email links to (sign-up page or create-account page) needs to be confirmed. If the flow requires Andy'K Group to manually create Supabase auth accounts for clients, this is operational friction — not a technical blocker — but it must be established before July 15.

**Required action:** Confirm and document the exact account activation flow for invited leads before launch.

### Near-blocker 2 — One user per company
If a Founding Client's primary contact leaves or needs to share access, there is no way to transfer or share account access without admin intervention in the Supabase dashboard. For 3–5 clients this is manageable, but must be acknowledged in onboarding docs.

---

## Q5 — Which missing features can safely wait until v2.0?

All of the following are non-blocking for the Founding Client launch:

| Feature | Why it can wait |
|---|---|
| Team member invitation | Andy'K Group designates one user per client for v1.0 |
| Company profile self-editing | Admin edits client profile directly |
| "My Plan" / billing overview page | License tier communicated via contract and email |
| Milestone / meeting creation by client | Admin sets all milestones; client tracks read-only |
| Contact self-management | Admin creates contacts; reads from admin tabs |
| Self-service payment + checkout | `PAYMENTS_ENABLED=false`; invoices handled manually |
| AI key self-configuration | Disabled intentionally; pending secure key storage |
| Company Admin role + permissions | No multi-tenancy needed for ≤5 clients |
| White-label branding per company | Founding Clients accept Andy'K Group branding |
| Internal client notes | Client-to-admin requests handled via `ClientRequestForm` |

---

## Q6 — If we onboard the first licensed company manually today, what exactly breaks?

Nothing breaks structurally. The following require manual steps by Andy'K Group:

1. **Account creation**: Admin must trigger the launch invitation or manually create the auth account. Client account cannot self-initiate without an invitation link.

2. **Client record linking**: After account creation, the Supabase `users` record must have `client_id` set and `role = 'client'`. This is likely done via the admin dashboard or direct DB edit. If not automated by the invite flow, it requires a manual DB update per client.

3. **Plan tracking**: There is no database field that stores which pricing tier (Trial License €499 vs Full License €999/year) a client is on. If this distinction matters for feature access or reporting, it must be tracked outside the system (spreadsheet, email, contract) for v1.0.

4. **Multiple contacts**: If the client has 3 people who need dashboard access, only 1 can have an account. The other 2 must share credentials or wait for v2.0 team features — neither is ideal.

5. **License metadata**: No `license_type`, `license_start`, or `license_renewal_date` fields visible to the client. They see invoices but not their license status as a structured record.

---

## Q7 — What is the single most important missing Company Admin feature right now?

**Multi-user access per company** — the ability for a Founding Client organization to have more than one authenticated user linked to their client record.

In every real-world scenario, the company that signs a contract has more than one person involved. The CEO may have signed the contract, but the operations manager needs to track milestones, and the finance contact needs to access invoices. In v1.0, all three must share one login.

This is the gap most likely to cause friction at launch — not a crash, but an early complaint that signals the platform isn't quite ready for a real organization.

**Workaround for v1.0**: During manual onboarding, designate one primary user per company. Include a note in the onboarding email: "Additional team members will be supported in a future update."

**Build order**: This is the first feature that should be prioritized after launch stabilizes — before any other Company Admin capability.

---

## Summary

| Category | Assessment |
|---|---|
| Core client lifecycle | **Complete** — proposal, contract, invoice, kickoff all work |
| Launch readiness (3–5 clients) | **Ready** — manual onboarding covers all gaps |
| Account creation flow | **Needs confirmation** — verify invitation → account link flow before July 15 |
| Plan / license tracking | **Gap** — no structured license tier field; track externally for v1.0 |
| Multi-user access | **Missing** — top priority after launch; manageable for 3–5 clients |
| Self-service everything | **Intentionally deferred** — correct for controlled license launch |
