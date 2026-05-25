export type PipelineStage =
  | "lead"
  | "qualified"
  | "nda"
  | "questionnaire"
  | "proposal"
  | "strategy"
  | "contract"
  | "invoice"
  | "kickoff"
  | "active";

export interface PipelineItem {
  id: string;
  itemType: "lead" | "client";
  companyName: string;
  contactName: string;
  clientRef?: string;
  stage: PipelineStage;
  serviceType?: string;
  leadScore?: number;
  daysInStage: number;
  dealValue?: number;
  currency?: string;
  assignedTo?: string | null;
  href: string;
}

export const PIPELINE_COLUMNS: {
  id: PipelineStage;
  label: string;
  accent: string;
}[] = [
  { id: "lead",           label: "Lead",          accent: "bg-muted-2" },
  { id: "qualified",      label: "Qualified",      accent: "bg-info" },
  { id: "nda",            label: "NDA",            accent: "bg-eggplant" },
  { id: "questionnaire",  label: "Questionnaire",  accent: "bg-grid-700" },
  { id: "proposal",       label: "Proposal",       accent: "bg-highlight" },
  { id: "strategy",       label: "Strategy",       accent: "bg-warning" },
  { id: "contract",       label: "Contract",       accent: "bg-warning" },
  { id: "invoice",        label: "Invoice",        accent: "bg-success" },
  { id: "kickoff",        label: "Kickoff",        accent: "bg-success" },
  { id: "active",         label: "Active",         accent: "bg-success" },
];
