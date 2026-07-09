# A.D.A.M. v1.1 — Launch Readiness Report
**Prepared:** 8 July 2026  
**Target launch:** 15 July 2026  
**Current production commit:** `026c0e9` (`dpl_FFZMJNt5tFk1mHaSb7TqWFRMNn1o`)

---

## Verdict: GO ✅

No launch-blocking issues remain. All critical bugs found in the v1.1 E2E test cycle have been fixed and verified in production.

---

## Fixes Applied This Cycle (7–8 July 2026)

| # | Issue | Root Cause | Fix | Commit |
|---|-------|------------|-----|--------|
| 1 | `company_admin` user insert failed | `users_role_check` constraint didn't include `'company_admin'` | Migration adds it to allowed values | `50a6d9b` |
| 2 | `clients.assigned_to` FK violation on activation | FK pointed to `public.users(id)` but column stores `auth.users.id` (different UUIDs) | Migration changes FK to `REFERENCES auth.users(id) ON DELETE SET NULL` | `50a6d9b` |
| 3 | `activity_log` silent insert failure on activation | `company_activated` not in `activity_log_type_check` constraint; `try/catch` can't catch Supabase value-style errors | Migration adds type; code changed to destructure `{error}` and `console.error` | `026c0e9` |
| 4 | All emails silently failing since June 10 | `api.eu.resend.com` does not exist (ENOTFOUND). Resend has one global endpoint: `api.resend.com`. EU routing is per-domain in dashboard, not via hostname. | 9 files updated to `api.resend.com` | `ac18a78` |
| 5 | Privacy Policy false EU transfer claims | Sections 5 & 6 incorrectly stated Resend uses EU infrastructure | Restored accurate SCCs disclosure | `523a001` |

---

## E2E Test Results — AK-TEST-V11 (Final Pass, 7 July 2026)

Test client: `56ae122b-51bf-48c5-b385-4dc550e1332f` (v1.1 E2E Test Company)  
Auth user created: `b08dd72a-eda2-4449-b6e6-34bdf90d201a` (`test-v11@adam-e2e.invalid`)

| Step | Result |
|------|--------|
| Auth user created via `createUser` | ✅ |
| `users` row inserted with `role=company_admin` | ✅ |
| `clients.assigned_to` updated to auth UUID | ✅ |
| `clients.onboarding_status` → `'activated'` | ✅ |
| `activity_log` row: `type=company_activated` | ✅ |
| Activation email dispatched (no DNS error) | ✅ |
| Rollback verified clean on all prior failed attempts | ✅ |
| Vercel POST `/super-admin/companies` → 200 | ✅ |
| Recent Activity in admin dashboard shows `company_activated` | ✅ |

---

## Production Smoke Test — 8 July 2026

| Route | Status |
|-------|--------|
| `/` — public landing | ✅ |
| `/questionnaire` — public intake form | ✅ |
| `/admin` — admin dashboard (stats, action items, activity feed) | ✅ |
| `/admin/clients` — client list with health/KYC/readiness scores | ✅ |
| `/admin/contracts` — contract list (2 contracts) | ✅ |
| `/admin/contracts/[id]` — contract detail (sections, tabs, notes) | ✅ |
| `/admin/reports` — revenue & pipeline report | ✅ |
| `/dashboard` → redirects to `/admin` for admin role | ✅ |
| `/api/revolut/subscription` POST — returns 503 (payment gate active) | ✅ |
| Runtime errors on current deployment | 0 ✅ |

---

## Runtime Error Analysis

Two error groups exist in the 7-day Vercel error window. Both are historical — they reference old deployments that pre-date the Resend fix.

| Error | Last Seen | Last Deployment | Status |
|-------|-----------|-----------------|--------|
| `ENOTFOUND api.eu.resend.com` (cron/reminders, cron/reports) | 5 Jul 2026 | `dpl_4dFGGzV3...` (June build) | Fixed — current deployment uses `api.resend.com` |
| `[activateCompanyAction] activation email error ENOTFOUND` | 7 Jul 2026 17:17 | `dpl_3a7CB5...` (pre-fix) | Fixed — subsequent activation on current deployment succeeded |

**Current deployment (`dpl_FFZMJNt5tFk1mHaSb7TqWFRMNn1o`) has zero runtime errors.**

---

## Cron Job Status

| Cron | Schedule | Email Dependency | Status |
|------|----------|------------------|--------|
| `/api/keep-alive` | Every 4 days at 00:00 | None | ✅ |
| `/api/cron/health-scores` | Daily 02:00 UTC | Sends via Resend | Next run post-fix is tonight |
| `/api/cron/readiness-scores` | Mondays 03:00 UTC | None | ✅ |
| `/api/cron/reminders` | Daily 08:00 UTC | Sends via Resend | Next run post-fix is today |
| `/api/cron/reports` | 1st of month 09:00 UTC | Sends via Resend | ✅ (last ran 1 Jul, before fix — next run 1 Aug) |

All cron routes are auth-protected with `CRON_SECRET`. Email sending on next run will use `api.resend.com` for the first time.

---

## Revolut Payments Gate

- `NEXT_PUBLIC_PAYMENTS_ENABLED` is **false** in production. Gate returns HTTP 503.
- Checkout order configuration verified:
  - Currency: `GBP` ✅
  - Descriptions: `A.D.A.M. Starter/Growth/Scale — Monthly/Annual` ✅
  - Success redirect: `https://adam.andykgroup.com/payment-success?plan=...&billing=...` ✅
  - Cancel redirect: `https://adam.andykgroup.com/payment-failed` ✅
  - Both destination pages exist and are branded correctly ✅
- Minor gap: `metadata.company` is `null` when checkout is initiated from the pricing page (the field is available in the API but not wired to a form input). Not launch-blocking.

---

## Pending Items Before Launch (Not Blockers)

### 1. AK-TEST-V11 cleanup
- Auth user `b08dd72a-eda2-4449-b6e6-34bdf90d201a` with email `test-v11@adam-e2e.invalid` exists in prod Supabase auth.
- The corresponding `users` row and `clients` activation record are also set.
- **Action required:** Decide whether to delete the test auth user and reset the test client's `onboarding_status` to `'pending'` before the first real activation.

### 2. First cron run on fixed Resend endpoint
- Reminders cron runs daily at 08:00 UTC — first successful Resend delivery will be today.
- Confirm delivery via Resend dashboard after 08:00 UTC today.

### 3. Revolut live test (optional pre-launch)
- Cannot be tested without enabling `PAYMENTS_ENABLED=true`.
- If Andy wants to verify Revolut checkout branding before launch: enable payments in Vercel env, create a test checkout URL, verify merchant name/amount in Revolut UI, then re-disable before launch day.

### 4. Client dashboard smoke test
- Client-facing `/dashboard` was not live-tested (requires a `company_admin` session; test user password was auto-generated and is unknown).
- Code review confirms the route and middleware are correct.
- Can be tested after AK-TEST-V11 password reset or by doing the first real client activation.

---

## Code Quality Scan

| Check | Result |
|-------|--------|
| `api.eu.resend.com` references remaining | 0 ✅ |
| `TODO` / `FIXME` / `HACK` in `src/` | 0 ✅ |
| Hardcoded `localhost` outside CORS allowlist | 0 ✅ |
| Cron routes without `CRON_SECRET` check | 0 (all 4 protected) ✅ |
| Unexpected `process.env` references | Only `NEXT_PUBLIC_FREECURRENCY_API_KEY` (currency display, non-critical) ✅ |

---

## Database Migrations Applied to Production

| Migration | Description |
|-----------|-------------|
| `20260707100003_add_company_admin_to_role_check.sql` | Adds `company_admin` to `users_role_check` constraint |
| `20260707100004_fix_clients_assigned_to_fkey.sql` | FK on `clients.assigned_to` now references `auth.users(id)` |
| `20260707100005_add_company_activated_activity_type.sql` | Adds `company_activated` to `activity_log_type_check` constraint |

---

## Pre-Launch Checklist

- [x] v1.1 company activation flow: end-to-end tested on AK-TEST-V11
- [x] Email delivery: Resend endpoint fixed across all 9 send sites
- [x] Privacy Policy: accurate UK GDPR-compliant disclosures
- [x] Database constraints: all updated and verified in production
- [x] Rollback logic in `activateCompanyAction`: verified across 4 test attempts
- [x] Revolut payment gate: confirmed closed until `PAYMENTS_ENABLED=true`
- [x] Cron auth: all routes protected with `CRON_SECRET`
- [x] Runtime errors on current deployment: zero
- [ ] AK-TEST-V11 test data cleanup (decision needed)
- [ ] First post-fix cron run confirmed via Resend dashboard (today 08:00 UTC)
- [ ] Revolut live checkout branding verified (optional — requires temp enable)
- [ ] Client dashboard live session test (optional — requires company_admin credentials)
