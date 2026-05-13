-- ============================================================================
-- ADAM — Full Schema Migration (Phases 1, 2, 3)
-- Apply to a fresh Supabase project via the SQL Editor or psql.
-- Consolidates all phases into a single idempotent script.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────────────────────────
-- 1. QUESTION SECTIONS  (no FK deps)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE question_sections (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  TEXT        NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  subsections JSONB       NOT NULL DEFAULT '[]',
  "order"     INTEGER     NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. QUESTION ITEMS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE question_items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id    TEXT        NOT NULL UNIQUE,
  number         INTEGER     NOT NULL,
  question       TEXT        NOT NULL,
  type           TEXT        NOT NULL CHECK (type IN (
    'text','url','email','phone','long-text',
    'single-select','multi-select','checkbox','address','file','group'
  )),
  required       BOOLEAN     NOT NULL DEFAULT FALSE,
  options        JSONB,
  placeholder    TEXT,
  conditional_on JSONB,
  section        TEXT        NOT NULL REFERENCES question_sections(section_id) ON DELETE RESTRICT,
  subsection     TEXT        NOT NULL,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX question_items_section_idx ON question_items(section);
CREATE INDEX question_items_number_idx  ON question_items(number);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. PROPOSAL TEMPLATES  (created_by FK added later after users table)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE proposal_templates (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  version       INTEGER     NOT NULL DEFAULT 1,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  system_prompt TEXT        NOT NULL,
  sections      JSONB       NOT NULL DEFAULT '[]',
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. CLIENTS
--    assigned_to (→ users) and questionnaire_id (→ questionnaires) are circular;
--    added as ALTER TABLE constraints after their target tables exist.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE clients (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name     TEXT        NOT NULL,
  contact_name     TEXT        NOT NULL,
  contact_email    TEXT        NOT NULL,
  contact_phone    TEXT,
  website_url      TEXT,
  address          JSONB,
  billing_currency TEXT,
  segments         TEXT[],
  stage            TEXT        NOT NULL DEFAULT 'questionnaire' CHECK (stage IN (
    'questionnaire','proposal','strategy','contract','invoice','kickoff'
  )),
  assigned_to      UUID,                     -- FK to users added later
  questionnaire_id UUID,                     -- FK to questionnaires added later
  notes            TEXT,
  -- Phase 2
  strategy_notes   TEXT,
  strategy_type    TEXT CHECK (strategy_type IN ('b2b','b2g','adam_license','end_to_end')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX clients_stage_idx      ON clients(stage);
CREATE INDEX clients_assigned_to_idx ON clients(assigned_to);
CREATE INDEX clients_created_at_idx ON clients(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. USERS  (references clients)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id        TEXT        NOT NULL UNIQUE,
  email          TEXT        NOT NULL,
  first_name     TEXT        NOT NULL,
  last_name      TEXT        NOT NULL,
  image_url      TEXT,
  role           TEXT        NOT NULL CHECK (role IN ('admin','staff','client')),
  client_id      UUID        REFERENCES clients(id) ON DELETE SET NULL,
  account_status TEXT        NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending','active')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX users_auth_id_idx  ON users(auth_id);
CREATE INDEX users_email_idx    ON users(email);
CREATE INDEX users_client_id_idx ON users(client_id);
CREATE INDEX users_role_idx     ON users(role);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. QUESTIONNAIRES
--    converted_to_client_id (→ clients) added later to break the circle.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE questionnaires (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name            TEXT        NOT NULL,
  website_url             TEXT,
  billing_currency        TEXT        NOT NULL,
  contact_name            TEXT        NOT NULL,
  contact_phone           TEXT        NOT NULL,
  contact_email           TEXT        NOT NULL,
  address                 JSONB       NOT NULL DEFAULT '{}',
  data_enrichment_consent BOOLEAN     NOT NULL DEFAULT FALSE,
  social_profiles         TEXT,
  countries_of_operation  TEXT        NOT NULL,
  years_in_business       TEXT        NOT NULL,
  annual_revenue          TEXT,
  products_services       TEXT        NOT NULL,
  business_goals          TEXT        NOT NULL,
  challenges              TEXT        NOT NULL,
  competitors             TEXT,
  usp                     TEXT        NOT NULL,
  communication_channels  TEXT[]      NOT NULL DEFAULT '{}',
  security_requirements   TEXT[],
  privacy_policy_agreed   BOOLEAN     NOT NULL DEFAULT FALSE,
  segments                TEXT[]      NOT NULL DEFAULT '{}',
  b2b_data                JSONB,
  b2g_data                JSONB,
  adam_data               JSONB,
  attachment_ids          UUID[],
  user_id                 UUID        REFERENCES users(id) ON DELETE SET NULL,
  status                  TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','converted')),
  session_id              TEXT        NOT NULL DEFAULT '',
  submitted_at            TIMESTAMPTZ,
  converted_to_client_id  UUID,                 -- FK to clients added later
  -- Phase 3
  ai_evaluation           JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX questionnaires_status_idx     ON questionnaires(status);
CREATE INDEX questionnaires_session_id_idx ON questionnaires(session_id);
CREATE INDEX questionnaires_user_id_idx    ON questionnaires(user_id);
CREATE INDEX questionnaires_created_at_idx ON questionnaires(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. LEADS  (Phase 2)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE leads (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT        NOT NULL,
  email                  TEXT        NOT NULL,
  phone                  TEXT,
  company                TEXT,
  source                 TEXT        NOT NULL DEFAULT 'direct' CHECK (source IN (
    'website','referral','outreach','direct','social','partnership'
  )),
  status                 TEXT        NOT NULL DEFAULT 'new' CHECK (status IN (
    'new','contacted','qualified','rejected','converted'
  )),
  notes                  TEXT,
  converted_to_client_id UUID        REFERENCES clients(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX leads_status_idx     ON leads(status);
CREATE INDEX leads_created_at_idx ON leads(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. PROPOSALS  (contract_id FK added later after contracts table)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE proposals (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id     UUID        NOT NULL REFERENCES questionnaires(id) ON DELETE RESTRICT,
  client_id            UUID        REFERENCES clients(id) ON DELETE SET NULL,
  template_id          UUID        REFERENCES proposal_templates(id) ON DELETE SET NULL,
  title                TEXT        NOT NULL,
  proposal_ref         TEXT,
  status               TEXT        NOT NULL DEFAULT 'evaluating' CHECK (status IN (
    'evaluating','flagged','draft','sent','changes_requested','approved','declined'
  )),
  sections             JSONB       NOT NULL DEFAULT '[]',
  ai_evaluation        JSONB,
  admin_notes          TEXT,
  client_comment       TEXT,
  approved_by_admin_at TIMESTAMPTZ,
  sent_to_client_at    TIMESTAMPTZ,
  client_approved_at   TIMESTAMPTZ,
  contract_id          UUID,                 -- FK to contracts added later
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX proposals_status_idx          ON proposals(status);
CREATE INDEX proposals_client_id_idx       ON proposals(client_id);
CREATE INDEX proposals_questionnaire_id_idx ON proposals(questionnaire_id);
CREATE INDEX proposals_created_at_idx      ON proposals(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 9. CONTRACTS  (Phase 2 adds contract_type)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE contracts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID        NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  proposal_id      UUID        REFERENCES proposals(id) ON DELETE SET NULL,
  title            TEXT        NOT NULL,
  content          TEXT        NOT NULL DEFAULT '',
  status           TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','published','viewed','changes_requested',
    'client_signed','countersigned','final'
  )),
  -- Phase 2
  contract_type    TEXT        NOT NULL DEFAULT 'service_agreement' CHECK (contract_type IN (
    'nda','service_agreement','retainer','amendment'
  )),
  version          INTEGER     NOT NULL DEFAULT 1,
  sections         JSONB,
  client_signature TEXT,
  client_signed_at TIMESTAMPTZ,
  client_signed_by UUID        REFERENCES users(id) ON DELETE SET NULL,
  admin_signature  TEXT,
  admin_signed_at  TIMESTAMPTZ,
  admin_signed_by  UUID        REFERENCES users(id) ON DELETE SET NULL,
  appendices       JSONB,
  created_by       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  published_at     TIMESTAMPTZ,
  viewed_at        TIMESTAMPTZ,
  finalized_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX contracts_client_id_idx    ON contracts(client_id);
CREATE INDEX contracts_status_idx       ON contracts(status);
CREATE INDEX contracts_contract_type_idx ON contracts(contract_type);
CREATE INDEX contracts_created_at_idx   ON contracts(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 10. CONTRACT VERSIONS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE contract_versions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID        NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  version     INTEGER     NOT NULL,
  content     TEXT        NOT NULL,
  sections    JSONB,
  changed_by  UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  change_note TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (contract_id, version)
);

CREATE INDEX contract_versions_contract_id_idx ON contract_versions(contract_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 11. CONTRACT FILES
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE contract_files (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID        NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  storage_key TEXT        NOT NULL,
  file_name   TEXT        NOT NULL,
  file_type   TEXT        NOT NULL,
  file_size   INTEGER     NOT NULL,
  category    TEXT        NOT NULL CHECK (category IN ('appendix','signature','attachment')),
  slot        TEXT,
  uploaded_by UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX contract_files_contract_id_idx ON contract_files(contract_id);
CREATE INDEX contract_files_category_idx    ON contract_files(category);

-- ────────────────────────────────────────────────────────────────────────────
-- 12. CONTRACT COMMENTS
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE contract_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID        NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  section_id  TEXT,
  parent_id   UUID        REFERENCES contract_comments(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  author_id   UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX contract_comments_contract_id_idx ON contract_comments(contract_id);
CREATE INDEX contract_comments_parent_id_idx   ON contract_comments(parent_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 13. INVOICES
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE invoices (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID           NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  contract_id    UUID           REFERENCES contracts(id) ON DELETE SET NULL,
  invoice_number TEXT           NOT NULL,
  status         TEXT           NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','sent','paid','overdue','cancelled'
  )),
  currency       TEXT           NOT NULL DEFAULT 'EUR',
  amount         NUMERIC(12, 2) NOT NULL,
  tax_amount     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_amount   NUMERIC(12, 2) NOT NULL,
  due_date       DATE,
  paid_at        TIMESTAMPTZ,
  notes          TEXT,
  line_items     JSONB          NOT NULL DEFAULT '[]',
  created_by     UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX invoices_client_id_idx  ON invoices(client_id);
CREATE INDEX invoices_status_idx     ON invoices(status);
CREATE INDEX invoices_created_at_idx ON invoices(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 14. ACTIVITY LOG
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE activity_log (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  type             TEXT        NOT NULL CHECK (type IN (
    'contract_created','contract_published','contract_viewed',
    'contract_changes_requested','contract_client_signed',
    'contract_countersigned','contract_finalized',
    'appendix_uploaded','appendix_verified','appendix_rejected',
    'comment_added','client_created','questionnaire_submitted',
    -- Phase 3
    'questionnaire_ai_evaluated','questionnaire_proceed',
    'questionnaire_flag','questionnaire_reject',
    'client_stage_changed'
  )),
  actor_id         UUID        REFERENCES users(id) ON DELETE SET NULL,
  client_id        UUID        REFERENCES clients(id) ON DELETE SET NULL,
  contract_id      UUID        REFERENCES contracts(id) ON DELETE SET NULL,
  proposal_id      UUID        REFERENCES proposals(id) ON DELETE SET NULL,
  questionnaire_id UUID        REFERENCES questionnaires(id) ON DELETE SET NULL,
  metadata         JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX activity_log_client_id_idx      ON activity_log(client_id);
CREATE INDEX activity_log_contract_id_idx    ON activity_log(contract_id);
CREATE INDEX activity_log_type_idx           ON activity_log(type);
CREATE INDEX activity_log_actor_id_idx       ON activity_log(actor_id);
CREATE INDEX activity_log_created_at_idx     ON activity_log(created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- DEFERRED / CIRCULAR FOREIGN KEYS
-- ────────────────────────────────────────────────────────────────────────────

-- clients.assigned_to → users
ALTER TABLE clients
  ADD CONSTRAINT clients_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- clients.questionnaire_id → questionnaires
ALTER TABLE clients
  ADD CONSTRAINT clients_questionnaire_id_fkey
  FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE SET NULL;

-- questionnaires.converted_to_client_id → clients
ALTER TABLE questionnaires
  ADD CONSTRAINT questionnaires_converted_to_client_id_fkey
  FOREIGN KEY (converted_to_client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- proposals.contract_id → contracts
ALTER TABLE proposals
  ADD CONSTRAINT proposals_contract_id_fkey
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL;

-- proposal_templates.created_by → users
ALTER TABLE proposal_templates
  ADD CONSTRAINT proposal_templates_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON questionnaires
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON proposal_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON contract_comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON question_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON question_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- RLS HELPER FUNCTIONS
-- Security-definer so the lookup runs with elevated privileges, but the
-- result is scoped to the calling user's auth_id.
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT role FROM users WHERE auth_id = auth.uid()::TEXT
$$;

CREATE OR REPLACE FUNCTION get_my_client_id()
RETURNS UUID LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT client_id FROM users WHERE auth_id = auth.uid()::TEXT
$$;

CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS UUID LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT id FROM users WHERE auth_id = auth.uid()::TEXT
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — enable on all tables
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires      ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_versions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_files      ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_comments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices            ENABLE ROW LEVEL SECURITY;

-- ── users ────────────────────────────────────────────────────────────────────
CREATE POLICY "users_admin_staff_all" ON users
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

CREATE POLICY "users_self_select" ON users
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid()::TEXT);

CREATE POLICY "users_self_update" ON users
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid()::TEXT)
  WITH CHECK (auth_id = auth.uid()::TEXT);

-- ── clients ──────────────────────────────────────────────────────────────────
CREATE POLICY "clients_admin_staff_all" ON clients
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

CREATE POLICY "clients_client_select_own" ON clients
  FOR SELECT TO authenticated
  USING (get_my_role() = 'client' AND id = get_my_client_id());

-- ── questionnaires ───────────────────────────────────────────────────────────
CREATE POLICY "questionnaires_admin_staff_all" ON questionnaires
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

-- Public intake form — anon users can create draft questionnaires
CREATE POLICY "questionnaires_anon_insert" ON questionnaires
  FOR INSERT TO anon
  WITH CHECK (status = 'draft');

-- Anon users can update their own session (tracks progress through form)
CREATE POLICY "questionnaires_anon_update_own_session" ON questionnaires
  FOR UPDATE TO anon
  USING (status = 'draft');

CREATE POLICY "questionnaires_client_select_own" ON questionnaires
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'client'
    AND converted_to_client_id = get_my_client_id()
  );

-- ── leads ────────────────────────────────────────────────────────────────────
CREATE POLICY "leads_admin_staff_all" ON leads
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

-- ── proposals ────────────────────────────────────────────────────────────────
CREATE POLICY "proposals_admin_staff_all" ON proposals
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

-- Clients see sent/approved/declined proposals (not internal draft/evaluating)
CREATE POLICY "proposals_client_select_own" ON proposals
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'client'
    AND client_id = get_my_client_id()
    AND status IN ('sent','changes_requested','approved','declined')
  );

-- Clients can add their comment to a sent proposal
CREATE POLICY "proposals_client_update_comment" ON proposals
  FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'client'
    AND client_id = get_my_client_id()
    AND status IN ('sent','changes_requested')
  )
  WITH CHECK (
    get_my_role() = 'client'
    AND client_id = get_my_client_id()
  );

-- ── proposal_templates ───────────────────────────────────────────────────────
CREATE POLICY "proposal_templates_admin_staff_all" ON proposal_templates
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

-- ── contracts ────────────────────────────────────────────────────────────────
CREATE POLICY "contracts_admin_staff_all" ON contracts
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

-- Clients see published and later-stage contracts
CREATE POLICY "contracts_client_select_own" ON contracts
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'client'
    AND client_id = get_my_client_id()
    AND status NOT IN ('draft')
  );

-- Clients can sign (update) a published contract
CREATE POLICY "contracts_client_update_signature" ON contracts
  FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'client'
    AND client_id = get_my_client_id()
    AND status IN ('published','viewed')
  )
  WITH CHECK (
    get_my_role() = 'client'
    AND client_id = get_my_client_id()
  );

-- ── contract_versions ────────────────────────────────────────────────────────
CREATE POLICY "contract_versions_admin_staff_all" ON contract_versions
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

CREATE POLICY "contract_versions_client_select_own" ON contract_versions
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'client'
    AND contract_id IN (
      SELECT id FROM contracts WHERE client_id = get_my_client_id()
    )
  );

-- ── contract_files ───────────────────────────────────────────────────────────
CREATE POLICY "contract_files_admin_staff_all" ON contract_files
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

CREATE POLICY "contract_files_client_select_own" ON contract_files
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'client'
    AND contract_id IN (
      SELECT id FROM contracts WHERE client_id = get_my_client_id()
    )
  );

-- Clients can upload appendices to their own contracts
CREATE POLICY "contract_files_client_insert_appendix" ON contract_files
  FOR INSERT TO authenticated
  WITH CHECK (
    get_my_role() = 'client'
    AND category = 'appendix'
    AND contract_id IN (
      SELECT id FROM contracts WHERE client_id = get_my_client_id()
    )
    AND uploaded_by = get_my_user_id()
  );

-- ── contract_comments ────────────────────────────────────────────────────────
CREATE POLICY "contract_comments_admin_staff_all" ON contract_comments
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

CREATE POLICY "contract_comments_client_select_own" ON contract_comments
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'client'
    AND contract_id IN (
      SELECT id FROM contracts WHERE client_id = get_my_client_id()
    )
  );

CREATE POLICY "contract_comments_client_insert_own" ON contract_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    get_my_role() = 'client'
    AND author_id = get_my_user_id()
    AND contract_id IN (
      SELECT id FROM contracts WHERE client_id = get_my_client_id()
    )
  );

-- ── activity_log ─────────────────────────────────────────────────────────────
CREATE POLICY "activity_log_admin_staff_all" ON activity_log
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

CREATE POLICY "activity_log_client_select_own" ON activity_log
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'client'
    AND client_id = get_my_client_id()
  );

-- ── question_sections ────────────────────────────────────────────────────────
-- Active sections are public (used in the intake questionnaire form)
CREATE POLICY "question_sections_public_read" ON question_sections
  FOR SELECT TO anon
  USING (is_active = TRUE);

CREATE POLICY "question_sections_auth_read" ON question_sections
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "question_sections_admin_staff_write" ON question_sections
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

-- ── question_items ───────────────────────────────────────────────────────────
CREATE POLICY "question_items_public_read" ON question_items
  FOR SELECT TO anon
  USING (is_active = TRUE);

CREATE POLICY "question_items_auth_read" ON question_items
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "question_items_admin_staff_write" ON question_items
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

-- ── invoices ─────────────────────────────────────────────────────────────────
CREATE POLICY "invoices_admin_staff_all" ON invoices
  FOR ALL TO authenticated
  USING (get_my_role() IN ('admin','staff'))
  WITH CHECK (get_my_role() IN ('admin','staff'));

-- Clients see sent/paid/overdue invoices (not drafts)
CREATE POLICY "invoices_client_select_own" ON invoices
  FOR SELECT TO authenticated
  USING (
    get_my_role() = 'client'
    AND client_id = get_my_client_id()
    AND status NOT IN ('draft')
  );

COMMIT;
