# A.D.A.M. v1.1 — Automation Plan
Date: 9 June 2026

---

## 1. Current v1.0 Manual Process

Step by step what Andy'K Group must do manually today:

- Company applies via `/questionnaire`
- Andy'K Group reviews in `/super-admin/applications`
- Andy'K Group approves and sends launch invite
- Andy'K Group manually creates company_admin user in DB
- Andy'K Group manually sets `clients.assigned_to` = company_admin auth_id
- Andy'K Group manually sets `license_tier` (trial / full / founding)
- Andy'K Group manually sends welcome/activation email
- Andy'K Group manually verifies login and scoped data works

**Risk:** Each step is a potential error point. One missed `assigned_to` = company sees no data.

---

## 2. v1.1 Target Process

Admin clicks one button: **"Activate Company"** in `/super-admin/companies` or `/super-admin/applications`.

System automatically:

- Creates Supabase auth user with `company_admin` role
- Creates `users` table row with `role = company_admin`
- Links user to existing client/company record
- Sets `clients.assigned_to` = new user's `auth_id`
- Sets `clients.license_tier` = selected tier (trial / full / founding)
- Sets `account_status = pending` (enforces password change on first login)
- Sends branded activation email with magic link or temp password
- On first login: auth callback routes `company_admin` to `/admin`
- `/admin` shows only scoped data (`assigned_to` already set)
- Andy'K Group Cockpit still sees everything

---

## 3. Required Database Fields

### Already exists:
- `clients.assigned_to`
- `clients.license_tier`
- `clients.sender_name`
- `clients.sender_email`
- `clients.subscription_status`
- `clients.activation_date`
- `clients.paid_until`

### May still be needed:
- `clients.company_admin_email` — to pre-fill during activation
- `clients.company_admin_auth_id` — mirror of `assigned_to` for clarity
- `clients.onboarding_status` — enum: `pending` / `activated` / `completed`
- `clients.activation_token` — for magic link activation
- `clients.activation_sent_at` — timestamp for tracking

---

## 4. Required Code Changes

Each item listed with file location and estimated size.

**1. Server action: `activateCompanyAction(clientId, options)`**
- File: `src/app/actions/companies.ts` (new)
- Creates auth user, sets role, sets `assigned_to`, sets `license_tier`, sends email
- Size: Medium (1 day)

**2. Admin UI: "Activate Company" button**
- File: `src/app/super-admin/companies/page.tsx`
- Button triggers `activateCompanyAction` with confirmation modal
- Size: Small (2–3 hours)

**3. Activation email template**
- File: `src/app/actions/email.ts`
- New function: `sendCompanyActivation(email, companyName, licenseType, activationLink)`
- Size: Small (1–2 hours)

**4. Auth callback routing fix**
- File: `src/app/auth/callback/route.ts`
- Add `company_admin` to redirect logic → `/admin`
- Size: Tiny (already partially done — verify)

**5. Onboarding checklist for company_admin**
- File: `src/app/admin/page.tsx` (dashboard)
- Show first-login checklist: create first client, create proposal, explore tools
- Dismissible after completion
- Size: Small (half day)

**6. Scoped empty state confirmation**
- Already implemented — verify `assigned_to` is set before showing data
- Show friendly empty state if `assigned_to` not yet set
- Size: Tiny

---

## 5. Safety Rules

- No `tenant_id` migration
- No RLS rewrite
- No public self-service activation
- Andy'K Group controls all activations
- Only companies in `/super-admin/companies` can be activated
- Activation requires explicit admin action — no automation without approval

---

## 6. Testing Checklist

Full end-to-end test sequence:

- [ ] Create test company in `/super-admin/companies`
- [ ] Approve company application
- [ ] Click "Activate Company" — select license tier
- [ ] Confirm activation email received
- [ ] Click activation link / create password
- [ ] Login as `company_admin`
- [ ] Verify landing on `/admin` (not landing page)
- [ ] Verify dashboard shows empty state (no clients yet)
- [ ] Create first client as `company_admin`
- [ ] Create proposal for that client
- [ ] Create contract
- [ ] Create invoice
- [ ] Verify Andy'K Group Cockpit still sees all companies and all data
- [ ] Verify `company_admin` cannot access `/super-admin` routes
- [ ] Verify `company_admin` cannot see Andy'K Group clients

---

## 7. Estimated Complexity

| Item | Complexity | Estimated Time |
|---|---|---|
| `activateCompanyAction` server action | Medium | 1 day |
| "Activate Company" UI button + modal | Small | 2–3 hours |
| Activation email template | Small | 1–2 hours |
| Auth callback fix | Tiny | 30 minutes |
| Company_admin onboarding checklist | Small | 4–6 hours |
| Scoped empty state | Tiny | 1 hour |
| **Total v1.1** | **Medium** | **2–3 days** |
| Full self-service automation | Large | v1.2 |
| v2.0 multi-tenant architecture | Very Large | Q4 2026 |

---

## 8. Recommendation

v1.1 should be built immediately after launch — ideally within the first two weeks of July 2026.

The v1.0 manual process works, but it is fragile. Every founding client activation requires Andy'K Group to execute eight sequential steps correctly, with no system enforcement between them. The single most dangerous step is setting `clients.assigned_to`: if it is missed or set to the wrong value, the company_admin user logs in to a blank panel with no clients, no contracts, and no data — with no error message explaining why. Debugging this requires direct database access.

v1.1 collapses all eight manual steps into one admin button click. The `activateCompanyAction` server action handles user creation, role assignment, data linking, and email delivery atomically — either the whole activation succeeds or it fails cleanly with an error the admin can act on. `assigned_to` is set as part of the same operation that creates the user, so it cannot be forgotten.

The total build is 2–3 days of focused work. It requires no schema migrations beyond adding a few nullable columns, no RLS changes, and no changes to the client portal or public pages. Andy'K Group retains full control — activation is always an explicit admin action, never automated. The v2.0 multi-tenant architecture (tenant isolation, self-service onboarding, per-company schemas) can wait until Q4 2026. v1.1 is the right scope for now.
