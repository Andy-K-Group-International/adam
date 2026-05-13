-- Phase 3: AI qualification column on questionnaires

ALTER TABLE questionnaires
  ADD COLUMN IF NOT EXISTS ai_evaluation JSONB;

-- ai_evaluation shape:
-- {
--   recommendation: 'proceed' | 'flag' | 'reject',
--   reasoning: text,
--   qualityScore: integer 0-100,
--   evaluatedAt: ISO timestamp
-- }

-- New activity_log type values used by Phase 3:
--   questionnaire_ai_evaluated
--   questionnaire_proceed
--   questionnaire_flag
--   questionnaire_reject
--
-- The activity_log.type column is TEXT — no ALTER needed if it's unconstrained.
-- If there is a CHECK constraint, add the new values:
--
-- ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_type_check;
-- ALTER TABLE activity_log ADD CONSTRAINT activity_log_type_check CHECK (type IN (
--   'contract_created','contract_published','contract_viewed',
--   'contract_changes_requested','contract_client_signed',
--   'contract_countersigned','contract_finalized',
--   'appendix_uploaded','appendix_verified','appendix_rejected',
--   'comment_added','client_created','questionnaire_submitted',
--   'questionnaire_ai_evaluated','questionnaire_proceed',
--   'questionnaire_flag','questionnaire_reject',
--   'client_stage_changed'
-- ));
