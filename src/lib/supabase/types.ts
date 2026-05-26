// Database types for Supabase — generated from migration schema
// These types mirror the PostgreSQL tables created in supabase_migration.sql

export type UserRole = "admin" | "staff" | "client";
export type AccountStatus = "pending" | "active";

export type ClientStage =
  | "questionnaire"
  | "proposal"
  | "strategy"
  | "contract"
  | "invoice"
  | "kickoff";

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
  created_at: string;
  updated_at: string;
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
  score: number;
  breakdown: LeadScoreBreakdown;
  questionnaire: Record<string, unknown>;
  scored_at: string;
  service_interest?: string;
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
  session_id: string;
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
  ai_evaluation: {
    recommendation: string;
    reasoning: string;
    qualityScore: number;
    evaluatedAt: string;
  } | null;
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
