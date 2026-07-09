-- Add seller_application_* activity_log types for the "Become a Seller"
-- public application flow.

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
    'commission_paid',
    'seller_application_submitted',
    'seller_application_approved',
    'seller_application_rejected'
  ]));
