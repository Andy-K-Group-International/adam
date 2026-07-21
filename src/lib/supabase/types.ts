// Database types for Supabase — generated from migration schema
// These types mirror the PostgreSQL tables created in supabase_migration.sql

export type UserRole = "admin" | "staff" | "client" | "company_admin" | "seller";
export type AccountStatus = "pending" | "active";

export type ClientStage =
  | "questionnaire"
  | "proposal"
  | "strategy"
  | "contract"
  | "invoice"
  | "kickoff"
  | "active";

export interface ActivationChecklistItem {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
}

export type QuestionnaireStatus = "draft" | "submitted" | "converted";

export type ContractStatus =
  | "draft"
  | "published"
  | "viewed"
  | "changes_requested"
  | "client_signed"
  | "countersigned"
  | "final";

export type ProposalStatus =
  | "draft"
  | "published"
  | "changes_requested"
  | "confirmed"
  | "unlocked"
  // Legacy values kept for backward compat with existing data:
  | "evaluating"
  | "flagged"
  | "sent"
  | "approved"
  | "declined";

export type FileCategory = "appendix" | "signature" | "attachment";
export type AppendixStatus = "empty" | "uploaded" | "verified" | "rejected" | "completed";

export type LeadSource = "website" | "referral" | "outreach" | "direct" | "social" | "partnership";
export type LeadStatus = "new" | "contacted" | "qualified" | "rejected" | "converted";
export type ContractType = "nda" | "service_agreement" | "retainer" | "amendment";
export type StrategyType = "b2b" | "b2g" | "adam_license" | "end_to_end";

export type QuestionType =
  | "text"
  | "url"
  | "email"
  | "phone"
  | "long-text"
  | "single-select"
  | "multi-select"
  | "checkbox"
  | "address"
  | "file"
  | "group";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type ContactRole = "primary" | "billing" | "legal" | "operations" | "signatory";

export type MilestoneStatus = "pending" | "in_progress" | "completed" | "blocked";
export type KycStatus = "pending" | "verified" | "rejected" | "expired";
export type KycDocumentType = "registry_extract" | "id_passport" | "power_of_attorney";
export type ReportPeriod = "monthly" | "quarterly";
export type ReportStatus = "draft" | "sent";
export type MeetingType = "discovery" | "strategy" | "review" | "kickoff" | "other";

export interface KycDocument {
  type: KycDocumentType;
  path: string;
  name: string;
  uploaded_at: string;
}

export interface KycVerification {
  id: string;
  client_id: string;
  status: KycStatus;
  company_name: string | null;
  company_reg_number: string | null;
  vat_number: string | null;
  country: string | null;
  director_name: string | null;
  director_email: string | null;
  documents: KycDocument[];
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  due_date: string | null;
  completed_at: string | null;
  order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientReport {
  id: string;
  client_id: string;
  title: string;
  period: ReportPeriod;
  content: Record<string, string>;
  status: ReportStatus;
  created_by: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingActionItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Meeting {
  id: string;
  client_id: string;
  date: string;
  type: MeetingType;
  attendees: string[];
  notes: string | null;
  action_items: MeetingActionItem[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string | null;
  job_title: string | null;
  role: ContactRole;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export type ActivityType =
  | "contract_created"
  | "contract_published"
  | "contract_viewed"
  | "contract_changes_requested"
  | "contract_client_signed"
  | "contract_countersigned"
  | "contract_finalized"
  | "appendix_uploaded"
  | "appendix_verified"
  | "appendix_rejected"
  | "comment_added"
  | "client_created"
  | "questionnaire_submitted"
  | "questionnaire_ai_evaluated"
  | "questionnaire_proceed"
  | "questionnaire_flag"
  | "questionnaire_reject"
  | "client_stage_changed";

// ── Row types ──

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

export interface User {
  id: string;
  auth_id: string;
  email: string;
  first_name: string;
  last_name: string;
  image_url: string | null;
  role: UserRole;
  client_id: string | null;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_ref: string | null;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  website_url: string | null;
  address: Address | null;
  billing_currency: string | null;
  segments: string[] | null;
  stage: ClientStage;
  assigned_to: string | null;
  questionnaire_id: string | null;
  notes: string | null;
  strategy_notes: string | null;
  strategy_type: StrategyType | null;
  kickoff_date: string | null;
  kickoff_notes: string | null;
  kickoff_checklist: { id: string; label: string; checked: boolean }[];
  kickoff_confirmed_at: string | null;
  health_score: number | null;
  health_score_updated_at: string | null;
  market_analysis: {
    market_overview: string;
    icp_definition: string;
    market_opportunities: string;
    risks_challenges: string;
    competitors: { name: string; strengths: string; weaknesses: string; market_share: string }[];
  } | null;
  archived: boolean;
  archived_at: string | null;
  activation_checklist: ActivationChecklistItem[];
  activated_at: string | null;
  activation_approved_by: string | null;
  founder_notes: string | null;
  founder_notes_updated_at: string | null;
  readiness_score: number | null;
  readiness_score_updated_at: string | null;
  readiness_breakdown: Record<string, unknown> | null;
  referral_code: string | null;
  referred_by: string | null;
  plan_name: string | null;
  billing_cycle: "monthly" | "annual" | null;
  subscription_status: "none" | "paid_pending_verification" | "active" | "suspended" | "cancelled" | null;
  payment_date: string | null;
  activation_date: string | null;
  paid_until: string | null;
  founding_client: boolean;
  founding_code_used: string | null;
  license_tier: "trial" | "full" | "founding" | null;
  terms_version_accepted: string | null;
  terms_accepted_at: string | null;
  payment_provider: string | null;
  revolut_order_id: string | null;
  sender_name: string | null;
  sender_email: string | null;
  // v1.1 company_admin activation
  company_admin_email: string | null;
  onboarding_status: "pending" | "activated" | "completed";
  activation_token: string | null;
  activation_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event: string;
  payload: Record<string, unknown>;
  status: "pending" | "delivered" | "failed";
  http_status: number | null;
  error: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  contract_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  currency: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  line_items: InvoiceLineItem[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LeadScoreBreakdown {
  revenue:             { value: string; label: string; score: number; max: number };
  timeline:            { value: string; label: string; score: number; max: number };
  decision_authority:  { value: string; label: string; score: number; max: number };
  service_interest?:   { value: string; label: string; score: number; max: number };
}

export interface LeadMetadata {
  score?: number;
  breakdown?: LeadScoreBreakdown;
  questionnaire?: Record<string, unknown>;
  scored_at?: string;
  service_interest?: string;
  demo_request?: boolean;
  /** True when this lead was created via a CEO personal demo invite, bypassing
   * the public pre-qualification questionnaire (see bridgeCeoInviteToQuestionnaire). */
  ceo_demo_invite?: boolean;
  demo_invite_id?: string;
  invited_by?: string;
}

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version: number;
  sections: unknown[];
  addons: unknown | null;
  service_type: string | null;
  snapshot_label: string | null;
  created_by: string | null;
  created_at: string;
}

export interface StrategyVersion {
  id: string;
  client_id: string;
  version: number;
  strategy_type: string | null;
  strategy_notes: string | null;
  snapshot_label: string | null;
  created_by: string | null;
  created_at: string;
}

export interface DemoToken {
  id: string;
  token: string;
  email: string;
  name: string | null;
  company: string | null;
  company_name: string | null;
  contact_name: string | null;
  ip_address: string | null;
  used_at: string | null;
  expires_at: string | null;
  revoked: boolean;
  revoked_at: string | null;
  last_accessed_at: string | null;
  access_count: number;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  service_interest: string | null;
  metadata: LeadMetadata | null;
  rejected_at: string | null;
  cooling_period_until: string | null;
  questionnaire_token: string | null;
  token_expires_at: string | null;
  token_sent_at: string | null;
  converted_to_client_id: string | null;
  launch_invite_sent: boolean;
  launch_invite_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Questionnaire {
  id: string;
  company_name: string;
  website_url: string | null;
  billing_currency: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address: Address;
  data_enrichment_consent: boolean;
  social_profiles: string | null;
  countries_of_operation: string;
  years_in_business: string;
  annual_revenue: string | null;
  products_services: string;
  business_goals: string;
  challenges: string;
  competitors: string | null;
  usp: string;
  communication_channels: string[];
  security_requirements: string[] | null;
  privacy_policy_agreed: boolean;
  segments: string[];
  b2b_data: Record<string, unknown> | null;
  b2g_data: Record<string, unknown> | null;
  adam_data: Record<string, unknown> | null;
  attachment_ids: string[] | null;
  user_id: string | null;
  status: QuestionnaireStatus;
  session_id: string | null;
  answers: Record<string, unknown>;
  selected_segments: string[];
  current_page_index: number;
  submitted_at: string | null;
  converted_to_client_id: string | null;
  ai_evaluation: {
    recommendation: "proceed" | "flag" | "reject";
    reasoning: string;
    qualityScore: number;
    evaluatedAt: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface AppendixDFormData {
  name: string;
  role: string;
  email: string;
  phone: string;
  preferredChannel: string;
}

export interface ContractAppendix {
  slot: string;
  label: string;
  required: boolean;
  fileId?: string;
  status: AppendixStatus;
  rejectionNote?: string;
  formData?: AppendixDFormData;
}

export interface CommercialsSnapshot {
  proposalRef: string | null;
  proposalTitle: string;
  snapshotAt: string;
  sections: { title: string; content: string }[];
}

export interface Contract {
  id: string;
  client_id: string;
  proposal_id: string | null;
  title: string;
  content: string;
  status: ContractStatus;
  contract_type: ContractType;
  service_type: StrategyType | null;
  commercials_snapshot: CommercialsSnapshot | null;
  version: number;
  sections: { id: string; title: string; content: string }[] | null;
  client_signature: string | null;
  client_signed_at: string | null;
  client_signed_by: string | null;
  admin_signature: string | null;
  admin_signed_at: string | null;
  admin_signed_by: string | null;
  appendices: ContractAppendix[] | null;
  created_by: string;
  published_at: string | null;
  viewed_at: string | null;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractVersion {
  id: string;
  contract_id: string;
  version: number;
  content: string;
  sections: { id: string; title: string; content: string }[] | null;
  changed_by: string;
  change_note: string | null;
  created_at: string;
}

export interface ContractFile {
  id: string;
  contract_id: string;
  storage_key: string;
  file_name: string;
  file_type: string;
  file_size: number;
  category: FileCategory;
  slot: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface ContractComment {
  id: string;
  contract_id: string;
  section_id: string | null;
  parent_id: string | null;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export type NoteDocumentType = "proposal" | "strategy" | "contract";
export type NoteVisibility = "operational" | "legal" | "onboarding" | "billing" | "implementation" | "escalation";
export type ClientRequestStatus = "pending" | "acknowledged" | "resolved" | "declined";
export type ClientRequestPriority = "low" | "medium" | "high" | "urgent";

export interface DocumentNote {
  id: string;
  document_type: NoteDocumentType;
  document_id: string;
  section_id: string | null;
  content: string;
  author_id: string;
  parent_id: string | null;
  is_resolved: boolean;
  is_pinned: boolean;
  edited: boolean;
  visibility: NoteVisibility;
  created_at: string;
  updated_at: string;
  author?: Pick<User, "id" | "first_name" | "last_name" | "email">;
  replies?: DocumentNote[];
}

export interface ClientRequest {
  id: string;
  document_type: NoteDocumentType;
  document_id: string;
  section_id: string | null;
  content: string;
  client_id: string;
  status: ClientRequestStatus;
  priority: ClientRequestPriority;
  admin_response: string | null;
  admin_responded_by: string | null;
  admin_responded_at: string | null;
  edited: boolean;
  created_at: string;
  updated_at: string;
  client?: Pick<Client, "id" | "company_name" | "contact_name" | "contact_email">;
}

export interface ProposalRecurringItem {
  name: string;
  monthly: number;
}

export interface ProposalOneTimeItem {
  name: string;
  amount: number;
}

export interface ProposalInvestment {
  currency: string;
  billingCycle: "monthly" | "quarterly" | "yearly" | "one-time";
  paymentTerms: 7 | 15 | 21 | 30;
  paymentMethod: string;
  recurringItems: ProposalRecurringItem[];
  oneTimeItems: ProposalOneTimeItem[];
}

export interface Proposal {
  id: string;
  questionnaire_id: string;
  client_id: string | null;
  template_id: string | null;
  title: string;
  proposal_ref: string | null;
  valid_until: string | null;
  service_type: StrategyType | null;
  commercials_locked: boolean;
  addons: ProposalInvestment | null;
  status: ProposalStatus;
  sections: { key: string; title: string; content: string; order: number; isVisible: boolean }[];
  admin_notes: string | null;
  client_comment: string | null;
  approved_by_admin_at: string | null;
  sent_to_client_at: string | null;
  client_approved_at: string | null;
  contract_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  version: number;
  is_active: boolean;
  system_prompt: string;
  sections: { key: string; title: string; content: string; order: number; isVisible: boolean }[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionSection {
  id: string;
  section_id: string;
  title: string;
  subsections: { id: string; title: string }[];
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionItem {
  id: string;
  question_id: string;
  number: number;
  question: string;
  type: QuestionType;
  required: boolean;
  options: { label: string; value: string }[] | null;
  placeholder: string | null;
  conditional_on: { questionId: string; value: string } | null;
  section: string;
  subsection: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  actor_id: string | null;
  client_id: string | null;
  contract_id: string | null;
  proposal_id: string | null;
  questionnaire_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
