-- Fix contract_comments_client_insert_own policy.
--
-- BEFORE:
--   FOR INSERT TO authenticated  (no WITH CHECK)
--   A client could insert a comment with any contract_id, including contracts
--   belonging to other clients, even though SELECT is already scoped correctly.
--
-- AFTER:
--   WITH CHECK verifies the target contract_id belongs to the inserting client's
--   own client record, using the same get_my_role() / get_my_client_id() helpers
--   used by every other client-scoped policy in this schema.
--
-- Admin/staff policy (contract_comments_admin_staff_all) covers ALL operations
-- for admin and staff and is completely unaffected by this change.

DROP POLICY IF EXISTS "contract_comments_client_insert_own" ON public.contract_comments;

CREATE POLICY "contract_comments_client_insert_own"
  ON public.contract_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    get_my_role() = 'client'::text
    AND contract_id IN (
      SELECT id FROM public.contracts
      WHERE client_id = get_my_client_id()
    )
  );
