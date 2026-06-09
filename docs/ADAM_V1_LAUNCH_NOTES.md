# A.D.A.M. v1.0 — Launch Notes & Design Decisions

**Version**: 1.0  
**Launch target**: 15 July 2026  
**Operator**: Andy'K Group International LTD (ceo@andykgroup.com)

---

## What v1.0 Is

A.D.A.M. v1.0 is a **single-tenant, operator-managed** client lifecycle platform. Andy'K Group is the sole operator. All admin accounts belong to Andy'K Group staff. Clients (Founding Clients and future subscribers) interact through the `/dashboard` and `/questionnaire` surfaces only.

---

## Deliberate Constraints

### Single-tenant by design

The database has no `company_id`, `tenant_id`, or organisation isolation. All clients share one dataset. All admin and staff accounts have full read/write access to all client records via RLS (`get_my_role() = 'admin' OR 'staff'`).

This is intentional for v1.0. Multi-tenancy (white-label Company Admin isolation) is planned for v2.0 (see `ADAM_V2_MULTITENANT_PLAN.md`).

### No Company Admin role

There are three roles in the system: `admin`, `staff`, `client`. There is no `company_admin` role. The three-tier permission model (Super Admin → Company Admin → End Client) described in v2.0 plans does not exist in the database yet.

The AI Settings tab in the admin panel implements a client-side Super Admin check (`user.email === 'ceo@andykgroup.com'`) for UI gating only. This is not enforced at the database level — all `admin` users have identical DB permissions in v1.0.

### No multi-tenancy

White-label clients (companies that license A.D.A.M. to manage their own clients) cannot be given admin accounts in v1.0 without gaining full visibility into all other clients. Do not create admin accounts for white-label customers until v2.0 tenant isolation is implemented.

### Founding Clients — manual application and activation

Founding Clients apply via the public questionnaire (`/questionnaire`) or the contact form. The admin panel includes a LaunchApplicantsWidget on `/admin` for:

- Reviewing lead applications
- Marking leads as reviewed / approved
- Sending launch invitation emails (via `/api/admin/launch-invite`)

Payment opens 15 July 2026. `NEXT_PUBLIC_PAYMENTS_ENABLED=false` remains set until that date. The pricing page shows a pre-launch notice and "Official payment launch: 15 July 2026" banner.

Activation after payment is **manual and controlled** — an admin must activate each client account in the admin panel after business verification (KYC). Billing begins from activation date, not payment date.

### AI keys disabled pending encryption

AI mode can be set per client (`basic`, `client_openai`, `client_anthropic`, `managed`, `disabled`). The database columns `ai_openai_key_encrypted` and `ai_anthropic_key_encrypted` exist but API key saving is disabled in the UI:

- Key input fields are rendered as `disabled`
- A warning states: "Secure key storage is pending implementation. Do not enter live API keys until encrypted storage is confirmed."

Do not enable key saving until server-side encryption (e.g. Vault, KMS, or pgcrypto) is implemented. The `managed` mode (Andy'K Group provides keys via environment variables) is the only production-ready AI mode at launch.

### Payment guard

`NEXT_PUBLIC_PAYMENTS_ENABLED` is baked at build time. The Revolut checkout and payment flows are behind a `paymentsEnabled` guard throughout the UI. Do not set this to `true` in Vercel environment variables until 15 July 2026.

---

## RLS Summary (v1.0)

| Table | Admin/Staff | Client |
|---|---|---|
| clients | ALL | SELECT own row only |
| contracts | ALL | SELECT + UPDATE (published/viewed only) |
| proposals | ALL | SELECT (non-draft) + UPDATE (comment) |
| invoices | ALL | SELECT (non-draft) |
| questionnaires | ALL | SELECT own |
| activity_log | ALL | SELECT own |
| ai_generation_logs | ALL | SELECT own |
| leads | ALL | INSERT (anon) |
| users | ALL | SELECT + UPDATE self |

`get_my_role()` and `get_my_client_id()` are SECURITY DEFINER functions that read from the `users` table.

---

## Known Limitations to Address Before White-Label Sales

1. No tenant isolation — admin accounts see all clients
2. No Company Admin role or scoped admin panel
3. No encrypted API key storage
4. No automated billing / subscription lifecycle (manual activation)
5. No self-service plan upgrades or downgrades

All five are addressed in the v2.0 roadmap.
