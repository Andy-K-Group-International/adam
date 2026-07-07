-- Backfill onboarding_status for clients that existed before v1.1.
-- The previous migration set all rows to DEFAULT 'pending', which incorrectly shows
-- the "Activate Company" button on clients that are already active or not in the v1.1 flow.
--
-- Rules:
--   already have a company_admin user  → 'activated'
--   all other pre-existing clients     → 'not_applicable' (regular clients; never show Activate button)
--   new clients created after v1.1     → stay 'pending' (the correct DEFAULT for new rows)

-- Pass 1: clients that already have a company_admin user in users table → 'activated'
UPDATE public.clients c
SET onboarding_status = 'activated'
WHERE EXISTS (
  SELECT 1 FROM public.users u
  WHERE u.client_id = c.id
    AND u.role = 'company_admin'
);

-- Pass 2: all remaining pre-existing clients (no company_admin user) → 'not_applicable'
-- Leaves 'activated' rows from pass 1 untouched.
UPDATE public.clients c
SET onboarding_status = 'not_applicable'
WHERE onboarding_status = 'pending';
