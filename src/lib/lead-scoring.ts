export interface ShortQuestionnaireAnswers {
  revenue: string;
  timeline: string;
  decision_authority: string;
  service_interest?: string;
  services?: string[];
  business_description?: string;
  biggest_challenge?: string;
  website?: string;
  document_uploaded?: boolean;
}

export interface ScoreDimension {
  value: string;
  label: string;
  score: number;
  max: number;
}

export interface LeadScoreResult {
  total: number;
  dimensions: {
    revenue:            ScoreDimension;
    timeline:           ScoreDimension;
    decision_authority: ScoreDimension;
    service_interest?:  ScoreDimension;
  };
  scored_at: string;
}

const REVENUE: Record<string, { score: number; label: string }> = {
  "<250k":   { score: 10, label: "Under €250K" },
  "250k-1m": { score: 25, label: "€250K – €1M" },
  "1m-5m":   { score: 40, label: "€1M – €5M" },
  "5m+":     { score: 60, label: "€5M+" },
};

const TIMELINE: Record<string, { score: number; label: string }> = {
  "immediate":  { score: 20, label: "Immediate" },
  "1-3months":  { score: 15, label: "1–3 months" },
  "3-6months":  { score: 8,  label: "3–6 months" },
  "exploring":  { score: 2,  label: "Just exploring" },
};

const AUTHORITY: Record<string, { score: number; label: string }> = {
  "final_decision_maker": { score: 20, label: "Final decision maker" },
  "part_of_leadership":   { score: 12, label: "Part of leadership" },
  "exploring":            { score: 4,  label: "Just exploring" },
};

const SERVICE_INTEREST: Record<string, { score: number; label: string }> = {
  "end_to_end": { score: 10, label: "End-to-End Business Development" },
  "b2b":        { score: 5,  label: "B2B Lead Generation" },
  "b2g":        { score: 5,  label: "B2G Government Tenders" },
  "adam":       { score: 5,  label: "A.D.A.M. System Licensing" },
  "not_sure":   { score: 0,  label: "Not sure yet" },
};

export function calculateLeadScore(answers: ShortQuestionnaireAnswers): LeadScoreResult {
  const rev  = REVENUE[answers.revenue]              ?? { score: 0, label: answers.revenue ?? "Unknown" };
  const tim  = TIMELINE[answers.timeline]            ?? { score: 0, label: answers.timeline ?? "Unknown" };
  const auth = AUTHORITY[answers.decision_authority] ?? { score: 0, label: answers.decision_authority ?? "Unknown" };

  const dimensions: LeadScoreResult["dimensions"] = {
    revenue:            { value: answers.revenue,            label: rev.label,  score: rev.score,  max: 60 },
    timeline:           { value: answers.timeline,           label: tim.label,  score: tim.score,  max: 20 },
    decision_authority: { value: answers.decision_authority, label: auth.label, score: auth.score, max: 20 },
  };

  let total = rev.score + tim.score + auth.score;

  if (answers.service_interest) {
    const svc = SERVICE_INTEREST[answers.service_interest] ?? { score: 0, label: answers.service_interest };
    dimensions.service_interest = { value: answers.service_interest, label: svc.label, score: svc.score, max: 10 };
    total += svc.score;
  }

  if (answers.service_interest === "end_to_end" && answers.document_uploaded) {
    total += 20;
  }

  return { total, dimensions, scored_at: new Date().toISOString() };
}

export function scoreTier(total: number): { label: string; color: string } {
  if (total >= 66) return { label: "High Priority",   color: "success" };
  if (total >= 36) return { label: "Medium Priority", color: "warning" };
  return               { label: "Low Priority",    color: "error"   };
}
