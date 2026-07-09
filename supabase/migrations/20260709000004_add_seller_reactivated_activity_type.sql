-- Add 'seller_reactivated' to activity_log_type_check. unsuspendSeller
-- (src/app/actions/sellers.ts) is the first code path that moves a seller
-- back from 'suspended' to 'active' — before this, suspension was a one-way
-- door with no in-app recovery.

alter table activity_log drop constraint activity_log_type_check;
alter table activity_log add constraint activity_log_type_check
  check (type = any (array[
    'contract_created',
    'contract_published',
    'contract_viewed',
    'contract_changes_requested',
    'contract_client_signed',
    'contract_countersigned',
    'contract_finalized',
    'appendix_uploaded',
    'appendix_verified',
    'appendix_rejected',
    'comment_added',
    'client_created',
    'questionnaire_submitted',
    'questionnaire_ai_evaluated',
    'questionnaire_proceed',
    'questionnaire_flag',
    'questionnaire_reject',
    'client_stage_changed',
    'company_activated',
    'launch_invite_sent',
    'seller_registered',
    'seller_activated',
    'seller_suspended',
    'seller_reactivated',
    'commission_created',
    'commission_approved',
    'commission_paid'
  ]));
