-- ============================================================================
-- ADAM Phase 2 Migration
-- Run on data-server: ssh data-server, then psql into the adam database
-- ============================================================================

BEGIN;

-- 1. Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  source TEXT NOT NULL DEFAULT 'direct'
    CHECK (source IN ('website','referral','outreach','direct','social','partnership')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','qualified','rejected','converted')),
  notes TEXT,
  converted_to_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);

-- 2. Contract type
ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS contract_type TEXT NOT NULL DEFAULT 'service_agreement'
    CHECK (contract_type IN ('nda','service_agreement','retainer','amendment'));

-- Backfill existing rows (safe no-op if column already existed)
UPDATE contracts SET contract_type = 'service_agreement' WHERE contract_type IS NULL;

-- 3. Strategy fields on clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS strategy_notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS strategy_type TEXT
  CHECK (strategy_type IN ('b2b','b2g','adam_license','end_to_end'));

COMMIT;
