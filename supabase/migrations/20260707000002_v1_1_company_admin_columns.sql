-- v1.1 company_admin activation columns
-- Branch: feature/v1-1-automation
-- DO NOT apply to adam-prod without explicit approval

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS company_admin_email  text,
  ADD COLUMN IF NOT EXISTS onboarding_status    text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS activation_token     text,
  ADD COLUMN IF NOT EXISTS activation_sent_at   timestamptz;

COMMENT ON COLUMN public.clients.company_admin_email IS 'Email of the company_admin user created for this client (for reference/display)';
COMMENT ON COLUMN public.clients.onboarding_status   IS 'pending | activated | completed — tracks company_admin onboarding progress';
COMMENT ON COLUMN public.clients.activation_token    IS 'UUID token included in activation email link; cleared after first login';
COMMENT ON COLUMN public.clients.activation_sent_at  IS 'Timestamp when the activation email was sent';
