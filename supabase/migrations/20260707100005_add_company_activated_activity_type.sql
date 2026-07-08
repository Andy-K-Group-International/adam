ALTER TABLE public.activity_log DROP CONSTRAINT activity_log_type_check;
ALTER TABLE public.activity_log ADD CONSTRAINT activity_log_type_check
  CHECK (type = ANY (ARRAY[
    'contract_created'::text,
    'contract_published'::text,
    'contract_viewed'::text,
    'contract_changes_requested'::text,
    'contract_client_signed'::text,
    'contract_countersigned'::text,
    'contract_finalized'::text,
    'appendix_uploaded'::text,
    'appendix_verified'::text,
    'appendix_rejected'::text,
    'comment_added'::text,
    'client_created'::text,
    'questionnaire_submitted'::text,
    'questionnaire_ai_evaluated'::text,
    'questionnaire_proceed'::text,
    'questionnaire_flag'::text,
    'questionnaire_reject'::text,
    'client_stage_changed'::text,
    'company_activated'::text
  ]));
