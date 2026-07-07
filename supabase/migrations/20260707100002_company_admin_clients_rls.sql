-- RLS: allow company_admin to SELECT their own client row.
--
-- company_admin users have no existing SELECT policy on the clients table.
-- Without this, listClients() returns 0 rows for company_admin, making their
-- /admin dashboard completely empty despite correct assigned_to linkage.
--
-- Scope: SELECT only, own row only, matched via assigned_to = auth.uid().
-- Intentionally narrower than clients_admin_staff_all (which grants ALL ops).
-- Consistent pattern with clients_client_select_own (role check + row scope).
--
-- NOTE: this migration is intentionally NOT applied to adam-prod until the full
-- branch review is complete. Apply via Supabase MCP when approved.

CREATE POLICY "clients_company_admin_select_own"
ON public.clients
FOR SELECT
TO authenticated
USING (
  get_my_role() = 'company_admin'
  AND assigned_to = auth.uid()
);
