# Invite → Activation Flow Audit

**Date:** 2026-06-09  
**Status:** Read-only trace. No fixes applied.

---

## Step 1 — Launch Invite Email

### Trigger
Two places in the UI send the invite:

| Location | File | Lines |
|---|---|---|
| Admin dashboard (Dashboard tab) | `src/app/admin/page.tsx` | 240–254 |
| Super-Admin applications list | `src/app/super-admin/applications/page.tsx` | 63–90 |

Both POST to `/api/admin/launch-invite`.

### API Route
**File:** `src/app/api/admin/launch-invite/route.ts`

```
POST /api/admin/launch-invite
Body: { lead_id, email, name, company?, plan? }
```

1. Gets session user from `supabase.auth.getUser()` (line 9)  
2. Queries `users` table for role check (lines 15–19):  
   ```ts
   adminClient.from("users").select("role").eq("id", user.id)
   ```
3. Rejects if `profile?.role !== "admin"` (line 21)  
4. Calls `sendLaunchInvitation({ name, email, company, plan })` (line 53)  
5. Updates `leads` row: `launch_invite_sent = true`, `status = "qualified"` (lines 57–65)  
6. Inserts `activity_log` entry of type `"launch_invite_sent"` (lines 68–79)

### Email sent
**Function:** `sendLaunchInvitation` — `src/app/actions/email.ts` lines 1397–1439

- **Subject:** `"Your A.D.A.M. License Activation Invitation — Founding Client Program"`
- **From:** `info@andykgroup.com`
- **Label:** `"Founding Client Program"`
- **Body copy:** "Payment is now open. Your license will be activated by our team following business verification."
- **CTA label:** `"Confirm Your Place →"`
- **CTA URL (hard-coded):**
  ```ts
  const applyUrl = "https://adam.andykgroup.com/questionnaire";  // line 1408
  ```
- **No token, no query param, no tracking** — bare URL to the public intake form.

---

## Step 2 — Invite Link Handler

The invite email sends the user to **`/questionnaire`** — the public application intake page, not a dedicated account-setup or payment route.

**File:** `src/app/questionnaire/page.tsx`

- Collects: company name, contact info, services, revenue, timeline, decision authority, optional document
- On submit → POSTs to `/api/leads/submit` with `source: "website"`
- Creates a new `leads` row — **a second lead entry, separate from the first**
- No token validation. No link between the invite and the new submission.

There is **no dedicated invite-link handler route**. The `/questionnaire` page has no awareness of the invitation.

---

## Step 3 — Account Creation

There is no self-serve account creation flow for invited companies.

Accounts are created **by admin only**, after a questionnaire submission is reviewed and approved:

**File:** `src/app/actions/questionnaires.ts` — `convertToClientAction` (lines 15–128)

1. Fetches the questionnaire (lines 21–26)
2. Generates `client_ref = AK-YYYY-NNNN` (lines 32–37)
3. Inserts `clients` row (lines 40–57):
   - `stage: "questionnaire"`
   - `assigned_to`: **not set** — remains `null`
4. Updates questionnaire to `status: "converted"` (lines 64–67)
5. Creates Supabase Auth user with a random 12-char temp password (lines 77–83)
6. Inserts `users` row (lines 97–108):
   ```ts
   {
     auth_id: authData.user.id,
     role: "client",            // always "client" — never "company_admin"
     client_id: client.id,      // correctly linked
     account_status: "active",  // immediately active
   }
   ```
7. Sends welcome email with temp password (lines 115–122)

**Welcome email** (`sendWelcomeEmail`, email.ts lines 979–1034):
- **Subject:** `"Welcome to A.D.A.M. — Your account is ready"`
- Contains: Client ID, email, temp password
- CTA: `https://adam.andykgroup.com/sign-in`
- Copy says "change your password after first login" — but `account_status` is already `"active"`, so no forced change-password redirect occurs

---

## Step 4 — users.client_id Assignment

### Where it's set
**File:** `src/app/actions/questionnaires.ts` line 104

```ts
client_id: client.id,
```

Set only inside `convertToClientAction`, triggered manually by an admin clicking "Convert to Client" on a questionnaire.

### When it's set
At `users` row creation time — simultaneously with the Supabase Auth user. Not set retroactively.

### What triggers it
Admin action only. No automation. No webhook. No self-service.

### What is NOT set
- `clients.assigned_to` — never set by any code path. Stays `null` for all clients.
- `users.role = "company_admin"` — never set by any code path. All converted clients get `role = "client"`.

---

## Step 5 — Post-Activation State

### Sign-in routing
**File:** `src/app/actions/auth.ts` lines 36–40

```ts
if (profile?.role === "client") {
  redirect("/dashboard");
} else {
  redirect("/admin");       // catches staff, admin, company_admin
}
```

A `company_admin` user would redirect to `/admin`. Correct in principle.

### Auth callback routing
**File:** `src/app/auth/callback/route.ts` lines 28–36

```ts
if (profile?.role === "client") return redirect("/dashboard");
if (profile?.role === "admin" || profile?.role === "staff") return redirect("/admin");
// company_admin falls through to:
return NextResponse.redirect(`${origin}${next}`);  // next defaults to "/"
```

`company_admin` is not handled — falls through to `/` (landing page).

### Dashboard layout
**File:** `src/app/dashboard/layout.tsx` line 29

```ts
if (profile.role !== "client" && profile.role !== "admin") {
  redirect("/admin");
}
```

`company_admin` would be redirected to `/admin` here — correct.

### Admin layout
**File:** `src/app/admin/layout.tsx` line 24

```ts
if (!profile || !['admin', 'staff', 'company_admin'].includes(profile.role)) {
  redirect("/sign-in");
}
```

Correctly allows `company_admin` through (added in the v1.0 safety commit).

### What company_admin sees after login
If a `company_admin` user existed and logged in:
- They'd reach `/admin` correctly
- They'd call `listClients(supabase, { userId: user.auth_id })`
- But `clients.assigned_to` is never set, so **they'd see zero clients**
- Same for contracts, proposals, invoices — all empty

---

## Overall Assessment

**Does this flow work end-to-end today?**

### For the standard `client` role (Andy'K Group managing client portals):
**Partial** — the core path from questionnaire → client conversion → welcome email → sign-in → dashboard works. Two hard bugs exist.

### For the `company_admin` multi-tenant flow:
**Broken** — the role exists only in TypeScript types. No creation path, no data assignment, no routing support in the auth callback.

---

## Gaps and Broken Steps

### GAP 1 — Launch invite API: wrong column in admin role check
**File:** `src/app/api/admin/launch-invite/route.ts` **line 18**

```ts
// CURRENT (BROKEN):
adminClient.from("users").select("role").eq("id", user.id)

// The users table uses auth_id for the Supabase auth UUID.
// users.id is a separate PostgreSQL-generated UUID.
// This query returns null for any admin → profile?.role is undefined
// → "Forbidden" 403 for everyone.
//
// CORRECT SHOULD BE:
.eq("auth_id", user.id)
```

**Impact:** Any admin calling the launch invite endpoint gets 403. The invite button silently fails.  
**Note:** If the CEO's `users.id` was manually set equal to their Supabase `auth.user.id` during initial setup, it would work for that one account only. Any new staff/admin would be blocked.

**Minimum fix:** Change `.eq("id", user.id)` → `.eq("auth_id", user.id)` on line 18.

---

### GAP 2 — Launch invite sends tokenless link to the wrong destination
**File:** `src/app/actions/email.ts` **line 1408**

```ts
const applyUrl = "https://adam.andykgroup.com/questionnaire";
```

The invite email says "Payment is now open. Confirm your place." but links to the public intake questionnaire — not a payment page. The company would fill out a new form, become a second lead, and the connection to the original invite is lost.

There is no:
- Token in the URL  
- `?invite=xxx` tracking param  
- Dedicated `/activate` or `/join` route  
- Way to know which invited lead actually completed the process

**Minimum fix:** Change `applyUrl` to point to the pricing/checkout page (e.g. `https://andykgroup.com/#pricing` or `https://adam.andykgroup.com/payment`). Or add a token param and create a dedicated route.

---

### GAP 3 — No `company_admin` user creation path
**Files:** `src/app/actions/questionnaires.ts` **line 103**, `src/lib/supabase/types.ts` **line 4**

`company_admin` was added to `UserRole` but there is no code that creates a user with this role. `convertToClientAction` always sets `role: "client"`. There is no admin UI to create a company_admin, no API endpoint, no invite flow for it.

**Minimum fix:** Add a new server action (e.g. `createCompanyAdminAction`) or extend `convertToClientAction` with an optional `role` parameter so a company can be onboarded with `role: "company_admin"` instead of `"client"`.

---

### GAP 4 — `clients.assigned_to` is never set
**All files that write to `clients` table** — none set `assigned_to`.

The entire scoped-query system added in v1.0 depends on `clients.assigned_to` matching a `company_admin`'s `auth_id`. But no code path ever writes this column. Every client has `assigned_to = null`.

**Minimum fix:** When creating a `company_admin` user (once GAP 3 is fixed), set `clients.assigned_to = auth_id` for their assigned clients. Or add a UI field in the admin client detail page to assign a company admin to a client.

---

### GAP 5 — Auth callback doesn't route `company_admin`
**File:** `src/app/auth/callback/route.ts` **lines 31–36**

```ts
if (profile?.role === "admin" || profile?.role === "staff") {
  return NextResponse.redirect(`${origin}/admin`);
}
// company_admin falls through to redirect("/") — the landing page
return NextResponse.redirect(`${origin}${next}`);
```

Any `company_admin` using OAuth (magic link, etc.) lands on the homepage instead of `/admin`.

**Minimum fix:** Add `|| profile?.role === "company_admin"` to the admin redirect condition on line 31.

---

### GAP 6 — Welcome email instructs password change, but no prompt is shown
**File:** `src/app/actions/questionnaires.ts` **line 105**  
**File:** `src/app/actions/email.ts` **line 1016**

Email says: *"Please change your password after your first login."*  
But `account_status` is set to `"active"` immediately (not `"pending"`), so the sign-in flow never redirects to `/change-password`.

Users receive a temp password with no system enforcement to change it.

**Minimum fix:** Set `account_status: "pending"` in `convertToClientAction` line 105. The `changePasswordAction` in `auth.ts` line 67 already sets it back to `"active"` after the change.

---

## Summary Table

| # | Gap | File | Line | Severity | Fix size |
|---|---|---|---|---|---|
| 1 | Launch invite API: `.eq("id")` should be `.eq("auth_id")` | `api/admin/launch-invite/route.ts` | 18 | **Critical** | 1 line |
| 2 | Invite email links to `/questionnaire` not checkout | `actions/email.ts` | 1408 | **High** | 1 line (URL) |
| 3 | No `company_admin` user creation path | `actions/questionnaires.ts` | 103 | **High** | New action needed |
| 4 | `clients.assigned_to` never set by any code | (all client-write paths) | — | **High** | New field in create flow |
| 5 | Auth callback doesn't route `company_admin` | `auth/callback/route.ts` | 31 | Medium | 1 line |
| 6 | Account set to `"active"` immediately, no forced password change | `actions/questionnaires.ts` | 105 | Low | 1 word |
