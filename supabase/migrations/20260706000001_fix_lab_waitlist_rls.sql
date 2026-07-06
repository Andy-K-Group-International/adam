-- Fix lab_waitlist RLS policies.
--
-- BEFORE:
--   admin_read_waitlist: FOR SELECT TO public USING (true)  -- any authenticated user could read all rows
--   update_waitlist:     FOR UPDATE TO public USING (true)  -- any authenticated user could update any row
--   insert_waitlist:     FOR INSERT TO public              -- intentionally public for external waitlist form
--
-- AFTER:
--   SELECT and UPDATE restricted to admin/staff via get_my_role() (consistent with all other admin-only policies)
--   INSERT left unchanged — the public waitlist form on lab.djandykofficial.com inserts via the anon key

-- Drop the over-permissive policies
DROP POLICY IF EXISTS "admin_read_waitlist" ON public.lab_waitlist;
DROP POLICY IF EXISTS "update_waitlist"     ON public.lab_waitlist;

-- SELECT: admin and staff only
CREATE POLICY "lab_waitlist_admin_staff_select"
  ON public.lab_waitlist
  FOR SELECT
  TO authenticated
  USING (get_my_role() = ANY (ARRAY['admin'::text, 'staff'::text]));

-- UPDATE: admin and staff only
CREATE POLICY "lab_waitlist_admin_staff_update"
  ON public.lab_waitlist
  FOR UPDATE
  TO authenticated
  USING     (get_my_role() = ANY (ARRAY['admin'::text, 'staff'::text]))
  WITH CHECK (get_my_role() = ANY (ARRAY['admin'::text, 'staff'::text]));
