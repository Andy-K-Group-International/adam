# A.D.A.M. — Compliance Readiness Audit

**Date:** 9 June 2026
**Auditor:** Claude Code (automated code + DB inspection)
**Scope:** UK GDPR / PECR pre-launch compliance readiness
**Status:** Pre-launch audit — no fixes applied

---

## 1. Privacy Policy

**Status: EXISTS — mostly compliant, gaps noted**

- **Location:** `/privacy-policy` (`src/app/privacy-policy/page.tsx`)
- **Last updated:** 25 May 2026
- **Governing law:** UK GDPR + Data Protection Act 2018

### What it covers (correctly)
- Data collected: contact details, questionnaire responses, company info, contracts/proposals, invoices, auth credentials, activity logs
- Legal basis: contract performance, legitimate interests, legal obligation, consent
- Sub-processors: Supabase (EU-West-1, Ireland) and Resend
- International transfers: Supabase within EEA; Resend may be outside EEA with SCCs noted
- Retention: active account + legal obligations; deletion on written request
- Rights under UK GDPR: access, correction, deletion, portability, object/restrict, ICO complaint
- Security: HTTPS/TLS, RLS, hashed passwords

### Gaps
| Gap | Severity |
|-----|----------|
| **Revolut not listed as sub-processor** — processes payment data (plan, billing, subscription) | High |
| **Anthropic / OpenAI not listed as sub-processors** — questionnaire content sent to AI APIs for evaluation | High |
| **Vercel not listed** — all HTTP traffic routes through Vercel infrastructure | Medium |
| **KYC documents not mentioned in data collection** — ID/passport, company registry extract, power of attorney uploaded via `/dashboard/profile` | High |
| **localStorage not mentioned** — `adam_email` key stored in browser for questionnaire draft | Low |

---

## 2. Terms of Service

**Status: EXISTS — comprehensive and current**

- **Location:** `/terms-and-conditions` (`src/app/terms-and-conditions/page.tsx`)
- **Last updated:** 9 June 2026

### Coverage
- Company details (Andy'K Group International LTD, reg 16453500, EC2A 4NE)
- Service description, eligibility, business verification
- Acceptable use
- Payment/billing — activation vs payment distinction, founding client pricing lock, currency (GBP), price changes (30 days notice), payment failure (7-day grace), activation refusal + full refund
- Cancellation: 30 days notice to ceo@andykgroup.com; 90-day data retention post-cancellation
- AI features: assistance only, no training on client data, opt-out available
- IP, white-label requirements
- Third-party services: Supabase, Resend, Revolut, Anthropic, OpenAI, Vercel (all listed with privacy URLs)
- Governing law: England and Wales

### Gaps
| Gap | Severity |
|-----|----------|
| **No DPA reference** — doesn't link to or mention a Data Processing Agreement for B2B clients | Medium |
| **AI provider data handling** — states "not retained for training under our agreements" but doesn't specify which providers or DPA clauses | Low |

---

## 3. Cookie Policy

**Status: EXISTS — correctly positioned, no action needed**

- **Location:** `/cookies-policy` (`src/app/cookies-policy/page.tsx`)
- **Last updated:** 25 May 2026
- **Governing law:** UK GDPR + DPA 2018 + PECR

### Coverage
- Three strictly necessary Supabase auth cookies listed: `sb-access-token` (1hr), `sb-refresh-token` (60 days), `sb-auth-token` (session)
- No analytics, advertising, or tracking cookies
- No consent banner — correctly states not required for essential-only cookies under UK PECR
- Legal basis: legitimate interest (correct for essential cookies)

### Assessment
No gaps. Policy is legally sound. Supabase cookie names should be verified against actual browser cookies in production to confirm exact names match (Supabase SSR sometimes uses `sb-<project_id>-auth-token` naming pattern).

---

## 4. GDPR Consent — Application Form (`/questionnaire`)

**Status: MISSING — significant gap**

The public application form collects: name, email, phone, company name, website, contact role, company status, service interest, business situation, objective, revenue, timeline, decision authority, and optionally uploaded documents. It writes to the `leads` table.

**What exists:** A small line below the submit button: *"All applications are reviewed manually. We do not share your information."*

**What is missing:**
- No link to the Privacy Policy on the form
- No "I agree to the Privacy Policy" checkbox or consent statement
- No disclosure that data will be used to contact the applicant

### Legal position
Under UK GDPR, the lawful basis for processing an enquiry/application is most likely **legitimate interests** (not consent), so a checkbox is not strictly required. However, a **transparency notice** (privacy link + brief statement of purpose and data use) is required at the point of collection under Articles 13-14. Currently that is absent.

---

## 5. GDPR Consent — Pricing / Payment Flow

**Status: GOOD — 5 mandatory checkboxes**

`src/components/landing/PricingSection.tsx` implements five required checkboxes before payment can be initiated:

1. **T&C + Privacy Policy** — links to both `/terms-and-conditions` and `/privacy-policy` (opens in new tab)
2. **Business verification** — confirms registered business status
3. **AI features** — acknowledges AI-generated content terms
4. **Billing** — confirms understanding of payment and activation terms
5. **Activation** — confirms activation is separate from payment

All five must be checked; submission is blocked otherwise. This is the strongest consent gate in the platform.

---

## 6. Data Processing — Personal Data Collected

| Table / Context | Personal data | Sensitivity |
|---|---|---|
| `leads` | name, email, phone, company, service interest, questionnaire answers, uploaded documents | Medium |
| `users` | first_name, last_name, email, role, auth_id | Medium |
| `clients` | company_name, contact_name, contact_email, contact_phone | Medium |
| `questionnaires` | full deep-dive questionnaire responses | Medium-High |
| `contracts` | signed agreement content, parties | High |
| `proposals` | business strategy content | Medium |
| `invoices` | amounts, billing contact | Medium |
| KYC (`kyc_verifications`) | company_reg_number, VAT, country, director_name, director_email, ID/passport scan, company registry extract, power of attorney | **Very High** |
| Supabase Storage | uploaded documents (E2E applications, KYC documents, contract appendices) | High |
| localStorage (`adam_email`) | email address stored in browser for questionnaire draft continuity | Low |
| Activity logs | login events, document views, timestamps | Low |

### Notes
- No payment card data is stored — Revolut handles all card data directly
- Passwords are never stored — Supabase Auth handles hashed credentials only
- AI evaluation routes send questionnaire content to Anthropic (Claude) via `/api/ai/evaluate-questionnaire`

---

## 7. Resend / Email

**Status: COMPLIANT with noted caveat**

- **Integration:** Direct Resend REST API (`https://api.resend.com/emails`)
- **From domain:** `info@andykgroup.com`, `ceo@andykgroup.com`, `legal@andykgroup.com`
- **Data sent:** recipient name, email, company name, client reference, contract/invoice content in email body/HTML

### Caveat — US API endpoint
The code uses `https://api.resend.com/emails` (US endpoint). Resend offers a separate EU endpoint (`https://api.eu.resend.com/emails`) that keeps data within the EEA.

The Privacy Policy acknowledges this: *"Email delivery via Resend may involve processing outside the EEA; in such cases, appropriate safeguards (Standard Contractual Clauses) are in place."*

This is a **policy-level acknowledgment**, not a technical guarantee. Switching to the EU endpoint (`api.eu.resend.com`) would eliminate the transfer concern entirely. As-is, the disclosure covers it legally, but it should be verified that Resend's SCCs are actually signed/in place on the account.

---

## 8. Supabase — Data Location

**Status: CONFIRMED EU — compliant**

- **Project ID:** `kbdvsqdctgeirakpctoz`
- **Region:** `eu-west-1` (Ireland, within EEA)
- **Services used:** PostgreSQL database, Auth, Storage

Privacy Policy correctly states "EU-West-1 (Ireland)". No data residency issue.

---

## 9. Right to Erasure / Delete Account

**Status: NO SELF-SERVICE — manual process only**

There is no "Delete account" or "Request data deletion" button anywhere in the platform (checked `/dashboard/profile`, all dashboard pages, admin pages).

The Privacy Policy states: *"Account data is deleted or anonymised upon written request to info@andykgroup.com, subject to any legal retention requirements."*

The Terms state data is retained 90 days post-cancellation before permanent deletion.

### Assessment
GDPR Article 17 (right to erasure) does **not** require a self-service deletion button — a manual email process is legally valid. However:
- There is no clear "how to delete your account" link in the dashboard
- The Privacy Policy doesn't surface the email address prominently enough for erasure requests
- There is no documented internal process for handling erasure requests within the required 30-day window

---

## 10. Cookie Banner

**Status: CORRECTLY ABSENT**

No cookie banner is present on any public page. The Cookie Policy (`/cookies-policy`) correctly explains why: A.D.A.M. uses only strictly necessary authentication cookies, which are exempt from consent requirements under UK PECR Regulation 6(4).

This is legally correct. No action needed unless analytics or marketing cookies are introduced in the future.

---

## Summary Table

| Item | Status | Action needed? |
|------|--------|----------------|
| Privacy Policy | ✅ Exists, well-drafted | Update sub-processors list |
| Terms of Service | ✅ Exists, comprehensive | Consider DPA clause |
| Cookie Policy | ✅ Exists, legally correct | None |
| GDPR consent — payment flow | ✅ 5 mandatory checkboxes | None |
| GDPR consent — application form | ❌ Missing transparency notice | Add privacy link + disclosure |
| Data processing — what is collected | ✅ Known and mapped | Add KYC to Privacy Policy |
| Sub-processors listed in Privacy Policy | ❌ Incomplete | Add Revolut, Anthropic, OpenAI, Vercel |
| Supabase EU data residency | ✅ eu-west-1, Ireland | None |
| Resend EU compliance | ⚠️ US endpoint, SCCs disclosed but unverified | Verify SCCs or switch to EU endpoint |
| Right to erasure | ⚠️ Manual email process, no self-service | Add "Request data deletion" link in dashboard |
| Cookie banner | ✅ Correctly absent | None |

---

## Priority Fixes Before Launch

### P1 — Must fix
1. **Application form privacy disclosure** (`/questionnaire/page.tsx`) — Add link to Privacy Policy and a one-line disclosure below the submit button: *"By submitting, you agree to our [Privacy Policy]. We process your data to review your application."*
2. **Privacy Policy sub-processors** — Add Revolut, Anthropic, OpenAI, Vercel to Section 4
3. **Privacy Policy data collection** — Add KYC documents (ID, company registry, director details) to Section 1

### P2 — Should fix before or shortly after launch
4. **Resend EU endpoint** — Switch to `https://api.eu.resend.com/emails` to eliminate cross-border transfer concern. One-line change in `src/app/actions/email.ts` and `src/app/actions/leads.ts`
5. **Dashboard erasure link** — Add a "Request account deletion" link in `/dashboard/profile` pointing to `mailto:info@andykgroup.com?subject=Data Deletion Request`

### P3 — Nice to have
6. **Supabase cookie name verification** — Confirm `sb-access-token`, `sb-refresh-token`, `sb-auth-token` match actual production cookie names (Supabase SSR uses `sb-<project-ref>-auth-token` pattern)
7. **localStorage disclosure** — Add note to Privacy Policy that email may be stored in browser localStorage for draft questionnaire continuity, cleared on completion
