// @sync: shared with /root/andyk-landing/src/lib/questionnaire-schema.ts
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
  | "group"
  | "number";

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  number: number;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  conditionalOn?: { questionId: string; value: string };
  section: string;
  subsection: string;
  serviceScope?: string[];
}

export interface QuestionSection {
  id: string;
  title: string;
  subsections: { id: string; title: string }[];
  order?: number;
}
