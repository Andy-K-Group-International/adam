/**
 * Seeds the "end-to-end" question section and all 48 E2E Business Development
 * questions (numbers 99-146) into the question_sections and question_items tables.
 * Also updates the segment-selection question to include the END_TO_END option.
 *
 * Run:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-e2e-questions.ts
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Section ───────────────────────────────────────────────────────────────────

const E2E_SECTION = {
  section_id: "end-to-end",
  title: "End-to-End Business Development",
  order: 6,
  is_active: true,
  subsections: [
    { id: "e2e-goals",      title: "What You're Trying to Achieve" },
    { id: "e2e-package",    title: "Package Selection" },
    { id: "e2e-current",    title: "Current Business State" },
    { id: "e2e-markets",    title: "Target Markets & Positioning" },
    { id: "e2e-revenue",    title: "Revenue Model & Growth Targets" },
    { id: "e2e-operations", title: "Operations & Team" },
    { id: "e2e-pipeline",   title: "Sales Pipeline & Process" },
    { id: "e2e-systems",    title: "Technology & Systems" },
    { id: "e2e-future",     title: "Strategy & Future Vision" },
  ],
};

// ── Questions ─────────────────────────────────────────────────────────────────

type QuestionRecord = {
  question_id: string;
  number: number;
  question: string;
  type: string;
  required: boolean;
  section: string;
  subsection: string;
  is_active: boolean;
  options: { label: string; value: string }[] | null;
  placeholder: string | null;
  conditional_on: { questionId: string; value: string } | null;
};

const E2E_QUESTIONS: QuestionRecord[] = [
  // ── e2e-goals: What You're Trying to Achieve (99–104) ─────────────────────
  {
    question_id: "e2ePrimaryGoal",
    number: 99,
    question: "What is your primary business development goal over the next 12–18 months?",
    type: "long-text",
    required: true,
    section: "end-to-end",
    subsection: "e2e-goals",
    is_active: true,
    options: null,
    placeholder: "Describe where you want to be in 12–18 months…",
    conditional_on: null,
  },
  {
    question_id: "e2eCurrentStatus",
    number: 100,
    question: "How would you describe your current business development situation?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-goals",
    is_active: true,
    options: [
      { label: "No formal BD function yet", value: "no-bd" },
      { label: "BD function exists but underperforming", value: "underperforming" },
      { label: "Scaling a working model", value: "scaling" },
      { label: "Entering a new market or segment", value: "new-market" },
      { label: "Full strategic restructure needed", value: "restructure" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eBiggestChallenge",
    number: 101,
    question: "What are your biggest business development challenges right now?",
    type: "multi-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-goals",
    is_active: true,
    options: [
      { label: "No consistent pipeline", value: "no-pipeline" },
      { label: "Poor conversion rates", value: "low-conversion" },
      { label: "Unclear value proposition", value: "positioning" },
      { label: "Lack of market access", value: "market-access" },
      { label: "Weak or non-existent sales process", value: "weak-process" },
      { label: "Team capability gaps", value: "team" },
      { label: "Operational chaos blocking growth", value: "operations" },
      { label: "Budget constraints", value: "budget" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eSuccessMetrics",
    number: 102,
    question: "What does success look like to you 18 months from now — in concrete, measurable terms?",
    type: "long-text",
    required: true,
    section: "end-to-end",
    subsection: "e2e-goals",
    is_active: true,
    options: null,
    placeholder: "e.g. 10 new enterprise clients, €2M ARR, operating in 3 markets…",
    conditional_on: null,
  },
  {
    question_id: "e2eTimelineCommitment",
    number: 103,
    question: "How long are you prepared to commit to a full development programme?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-goals",
    is_active: true,
    options: [
      { label: "3 months — prove the concept", value: "3m" },
      { label: "6 months — build momentum", value: "6m" },
      { label: "12 months — full programme", value: "12m" },
      { label: "18–24 months — strategic transformation", value: "18-24m" },
      { label: "Open-ended with quarterly milestones", value: "open" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eDecisionDrivers",
    number: 104,
    question: "What would make you choose one development partner over another at this stage?",
    type: "long-text",
    required: false,
    section: "end-to-end",
    subsection: "e2e-goals",
    is_active: true,
    options: null,
    placeholder: "Track record, industry expertise, pricing model, team access…",
    conditional_on: null,
  },

  // ── e2e-package: Package Selection (105–108) ───────────────────────────────
  {
    question_id: "e2ePackageType",
    number: 105,
    question: "Which end-to-end programme best fits your current stage?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-package",
    is_active: true,
    options: [
      { label: "Launch — market entry and BD infrastructure build", value: "launch" },
      { label: "Accelerate — scale an existing model", value: "accelerate" },
      { label: "Transform — full strategic overhaul", value: "transform" },
      { label: "Enterprise — multi-market full engagement", value: "enterprise" },
      { label: "Not sure yet — help me decide", value: "undecided" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eEngagementModel",
    number: 106,
    question: "What engagement model do you prefer?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-package",
    is_active: true,
    options: [
      { label: "Fully embedded — we act as your BD team", value: "embedded" },
      { label: "Advisory + implementation support", value: "advisory" },
      { label: "Project-based milestones", value: "project" },
      { label: "Hybrid — strategic direction and operational delivery", value: "hybrid" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eMonthlyBudget",
    number: 107,
    question: "What is your monthly investment range for this programme?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-package",
    is_active: true,
    options: [
      { label: "€3K–€6K / month", value: "3k-6k" },
      { label: "€6K–€12K / month", value: "6k-12k" },
      { label: "€12K–€25K / month", value: "12k-25k" },
      { label: "€25K+ / month", value: "25k+" },
      { label: "Flexible / results-based preferred", value: "flexible" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eAdditionalServices",
    number: 108,
    question: "Which additional services are you interested in alongside the core programme?",
    type: "multi-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-package",
    is_active: true,
    options: [
      { label: "B2B lead generation", value: "b2b" },
      { label: "B2G government tenders", value: "b2g" },
      { label: "A.D.A.M. system licensing", value: "adam" },
      { label: "PR and thought leadership", value: "pr" },
      { label: "Investor relations support", value: "investor" },
      { label: "None — core programme only", value: "none" },
    ],
    placeholder: null,
    conditional_on: null,
  },

  // ── e2e-current: Current Business State (109–115) ─────────────────────────
  {
    question_id: "e2eBusinessModel",
    number: 109,
    question: "What is your core business model?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-current",
    is_active: true,
    options: [
      { label: "B2B services", value: "b2b-services" },
      { label: "B2B products or SaaS", value: "b2b-products" },
      { label: "B2G / public sector", value: "b2g" },
      { label: "B2C", value: "b2c" },
      { label: "Mixed / portfolio", value: "mixed" },
      { label: "Other", value: "other" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eTeamSize",
    number: 110,
    question: "What is your total team size (employees and regular contractors)?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-current",
    is_active: true,
    options: [
      { label: "1–5", value: "1-5" },
      { label: "6–20", value: "6-20" },
      { label: "21–50", value: "21-50" },
      { label: "51–200", value: "51-200" },
      { label: "200+", value: "200+" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eBDTeamSize",
    number: 111,
    question: "How many people are currently dedicated to business development or sales?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-current",
    is_active: true,
    options: [
      { label: "None — founder does everything", value: "none" },
      { label: "1 person", value: "1" },
      { label: "2–3 people", value: "2-3" },
      { label: "4–10 people", value: "4-10" },
      { label: "10+ people", value: "10+" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eCurrentRevenue",
    number: 112,
    question: "What is your approximate current annual revenue or turnover?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-current",
    is_active: true,
    options: [
      { label: "Pre-revenue", value: "pre-revenue" },
      { label: "< €250K", value: "lt250k" },
      { label: "€250K–€1M", value: "250k-1m" },
      { label: "€1M–€5M", value: "1m-5m" },
      { label: "€5M–€20M", value: "5m-20m" },
      { label: "€20M+", value: "20m+" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eRevenueGrowth",
    number: 113,
    question: "What has been your revenue growth trend over the past 12 months?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-current",
    is_active: true,
    options: [
      { label: "Declining", value: "declining" },
      { label: "Flat", value: "flat" },
      { label: "Growing 1–20%", value: "grow-low" },
      { label: "Growing 20–50%", value: "grow-mid" },
      { label: "Growing 50%+", value: "grow-high" },
      { label: "Pre-revenue / too early to measure", value: "early" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eCurrentClients",
    number: 114,
    question: "How many active paying clients do you currently have?",
    type: "text",
    required: false,
    section: "end-to-end",
    subsection: "e2e-current",
    is_active: true,
    options: null,
    placeholder: "e.g. 12",
    conditional_on: null,
  },
  {
    question_id: "e2eClientRetention",
    number: 115,
    question: "What is your approximate annual client retention rate?",
    type: "single-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-current",
    is_active: true,
    options: [
      { label: "90%+ retention", value: "excellent" },
      { label: "70–90% retention", value: "good" },
      { label: "50–70% retention", value: "moderate" },
      { label: "Below 50% retention", value: "high-churn" },
      { label: "We don't track this yet", value: "unknown" },
    ],
    placeholder: null,
    conditional_on: null,
  },

  // ── e2e-markets: Target Markets & Positioning (116–121) ───────────────────
  {
    question_id: "e2ePrimaryMarkets",
    number: 116,
    question: "Which geographic markets are you currently active in?",
    type: "multi-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-markets",
    is_active: true,
    options: [
      { label: "Ireland", value: "ireland" },
      { label: "United Kingdom", value: "uk" },
      { label: "EU — Western Europe", value: "eu-west" },
      { label: "EU — Eastern Europe", value: "eu-east" },
      { label: "Middle East & North Africa", value: "mena" },
      { label: "North America", value: "na" },
      { label: "Asia Pacific", value: "apac" },
      { label: "Africa", value: "africa" },
      { label: "Global", value: "global" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eTargetNewMarkets",
    number: 117,
    question: "Which new markets do you want to enter or expand into through this programme?",
    type: "multi-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-markets",
    is_active: true,
    options: [
      { label: "Ireland", value: "ireland" },
      { label: "United Kingdom", value: "uk" },
      { label: "EU — Western Europe", value: "eu-west" },
      { label: "EU — Eastern Europe", value: "eu-east" },
      { label: "Middle East & North Africa", value: "mena" },
      { label: "North America", value: "na" },
      { label: "Asia Pacific", value: "apac" },
      { label: "Africa", value: "africa" },
      { label: "Not expanding geographically", value: "none" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eIdealClientProfile",
    number: 118,
    question: "Describe your ideal client profile — industry, company size, and key decision-maker title",
    type: "long-text",
    required: true,
    section: "end-to-end",
    subsection: "e2e-markets",
    is_active: true,
    options: null,
    placeholder: "e.g. Mid-market SaaS companies (50–500 employees), VP of Sales or CRO…",
    conditional_on: null,
  },
  {
    question_id: "e2eCurrentPositioning",
    number: 119,
    question: "How do you currently position yourself in the market — what category do you lead with?",
    type: "long-text",
    required: true,
    section: "end-to-end",
    subsection: "e2e-markets",
    is_active: true,
    options: null,
    placeholder: "e.g. premium boutique consultancy, tech-enabled outsourced BD, specialist market entry partner…",
    conditional_on: null,
  },
  {
    question_id: "e2eCompetitiveDifferentiator",
    number: 120,
    question: "What do you believe is your single strongest competitive differentiator?",
    type: "long-text",
    required: true,
    section: "end-to-end",
    subsection: "e2e-markets",
    is_active: true,
    options: null,
    placeholder: "What makes clients choose you over alternatives?",
    conditional_on: null,
  },
  {
    question_id: "e2eMainCompetitors",
    number: 121,
    question: "Who are the main competitors or alternatives your prospects typically compare you against?",
    type: "text",
    required: false,
    section: "end-to-end",
    subsection: "e2e-markets",
    is_active: true,
    options: null,
    placeholder: "Competitor 1, Competitor 2…",
    conditional_on: null,
  },

  // ── e2e-revenue: Revenue Model & Growth Targets (122–127) ─────────────────
  {
    question_id: "e2eRevenueModel",
    number: 122,
    question: "What is your primary revenue model? (select all that apply)",
    type: "multi-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-revenue",
    is_active: true,
    options: [
      { label: "Retainer / monthly subscription", value: "retainer" },
      { label: "Project-based fees", value: "project" },
      { label: "Commission or performance fees", value: "commission" },
      { label: "License fees", value: "license" },
      { label: "Consulting day rates", value: "consulting" },
      { label: "Product sales", value: "product" },
      { label: "Other", value: "other" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eAverageContractValue",
    number: 123,
    question: "What is your average contract or deal value?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-revenue",
    is_active: true,
    options: [
      { label: "< €5K", value: "lt5k" },
      { label: "€5K–€25K", value: "5k-25k" },
      { label: "€25K–€100K", value: "25k-100k" },
      { label: "€100K–€500K", value: "100k-500k" },
      { label: "€500K+", value: "500k+" },
      { label: "Highly variable / project dependent", value: "variable" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eSalesCycle",
    number: 124,
    question: "What is your typical sales cycle from first contact to signed contract?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-revenue",
    is_active: true,
    options: [
      { label: "Less than 2 weeks", value: "lt2w" },
      { label: "2–6 weeks", value: "2-6w" },
      { label: "1–3 months", value: "1-3m" },
      { label: "3–6 months", value: "3-6m" },
      { label: "6–12 months", value: "6-12m" },
      { label: "12+ months", value: "12m+" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eRevenueTarget12m",
    number: 125,
    question: "What is your revenue growth ambition for the next 12 months?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-revenue",
    is_active: true,
    options: [
      { label: "Maintain current revenue", value: "maintain" },
      { label: "Grow 10–25%", value: "10-25" },
      { label: "Grow 25–50%", value: "25-50" },
      { label: "Grow 50–100%", value: "50-100" },
      { label: "2× growth or more", value: "2x+" },
      { label: "I have a specific number in mind", value: "specific" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eRevenueTargetAmount",
    number: 126,
    question: "What is your specific revenue target?",
    type: "text",
    required: false,
    section: "end-to-end",
    subsection: "e2e-revenue",
    is_active: true,
    options: null,
    placeholder: "e.g. €2M / £3M / $4M",
    conditional_on: { questionId: "e2eRevenueTarget12m", value: "specific" },
  },
  {
    question_id: "e2eChurnRate",
    number: 127,
    question: "What is your approximate annual client churn or contract non-renewal rate?",
    type: "single-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-revenue",
    is_active: true,
    options: [
      { label: "Less than 10% churn (excellent)", value: "excellent" },
      { label: "10–30% churn (good)", value: "good" },
      { label: "30–50% churn (moderate)", value: "moderate" },
      { label: "Over 50% churn (high — needs addressing)", value: "high" },
      { label: "We don't track this", value: "unknown" },
    ],
    placeholder: null,
    conditional_on: null,
  },

  // ── e2e-operations: Operations & Team (128–133) ───────────────────────────
  {
    question_id: "e2eBusinessProcesses",
    number: 128,
    question: "Which of these business processes are currently documented and followed consistently?",
    type: "multi-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-operations",
    is_active: true,
    options: [
      { label: "Sales and BD process", value: "sales" },
      { label: "Client onboarding", value: "onboarding" },
      { label: "Service delivery", value: "delivery" },
      { label: "Client reporting and reviews", value: "reporting" },
      { label: "Finance and invoicing", value: "finance" },
      { label: "HR and hiring", value: "hr" },
      { label: "None are formally documented", value: "none" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eOperationalBottlenecks",
    number: 129,
    question: "Where are your biggest operational bottlenecks today?",
    type: "multi-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-operations",
    is_active: true,
    options: [
      { label: "Generating qualified leads", value: "leads" },
      { label: "Proposal creation and follow-up", value: "proposals" },
      { label: "Client onboarding and handover", value: "onboarding" },
      { label: "Consistent service delivery", value: "delivery" },
      { label: "Cash flow and invoicing", value: "cashflow" },
      { label: "Team capacity and bandwidth", value: "team" },
      { label: "Technology and tooling", value: "tech" },
      { label: "No significant bottlenecks", value: "none" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eTeamStructure",
    number: 130,
    question: "How would you describe your current leadership structure?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-operations",
    is_active: true,
    options: [
      { label: "Founder-led — I run most things myself", value: "founder-led" },
      { label: "Small leadership team (2–3 people)", value: "small-leadership" },
      { label: "Department heads in place", value: "departments" },
      { label: "Full senior management team", value: "full-smt" },
      { label: "Board-governed with executive team", value: "board" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eHiringPlan",
    number: 131,
    question: "Are you planning to hire in the next 12 months?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-operations",
    is_active: true,
    options: [
      { label: "Yes — BD and sales roles", value: "yes-bd" },
      { label: "Yes — operations and delivery roles", value: "yes-ops" },
      { label: "Yes — multiple across the business", value: "yes-multiple" },
      { label: "No planned hiring", value: "no" },
      { label: "Depends on programme performance", value: "depends" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eOutsourcedFunctions",
    number: 132,
    question: "Which business functions do you currently outsource?",
    type: "multi-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-operations",
    is_active: true,
    options: [
      { label: "Marketing", value: "marketing" },
      { label: "Accounting and finance", value: "finance" },
      { label: "Legal", value: "legal" },
      { label: "IT and technology", value: "it" },
      { label: "HR", value: "hr" },
      { label: "Business development support", value: "bd" },
      { label: "Nothing — all in-house", value: "none" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eKeyManagementChallenge",
    number: 133,
    question: "What is the single most pressing operational challenge holding your growth back?",
    type: "long-text",
    required: true,
    section: "end-to-end",
    subsection: "e2e-operations",
    is_active: true,
    options: null,
    placeholder: "Be as specific as you can…",
    conditional_on: null,
  },

  // ── e2e-pipeline: Sales Pipeline & Process (134–139) ──────────────────────
  {
    question_id: "e2ePipelineSize",
    number: 134,
    question: "How many active opportunities are typically in your pipeline at any given time?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-pipeline",
    is_active: true,
    options: [
      { label: "Fewer than 5", value: "lt5" },
      { label: "5–15", value: "5-15" },
      { label: "15–30", value: "15-30" },
      { label: "30–60", value: "30-60" },
      { label: "60+", value: "60+" },
      { label: "No formal pipeline", value: "none" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eLeadSources",
    number: 135,
    question: "Where do most of your current leads and new business come from?",
    type: "multi-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-pipeline",
    is_active: true,
    options: [
      { label: "Referrals and word of mouth", value: "referrals" },
      { label: "Inbound — website or content", value: "inbound" },
      { label: "Outbound prospecting", value: "outbound" },
      { label: "Events and networking", value: "events" },
      { label: "LinkedIn", value: "linkedin" },
      { label: "Strategic partnerships", value: "partnerships" },
      { label: "Public tenders", value: "tenders" },
      { label: "Cold email or cold calling", value: "cold" },
      { label: "Other", value: "other" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eConversionRate",
    number: 136,
    question: "What is your approximate proposal-to-close conversion rate?",
    type: "single-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-pipeline",
    is_active: true,
    options: [
      { label: "Less than 10%", value: "lt10" },
      { label: "10–25%", value: "10-25" },
      { label: "25–40%", value: "25-40" },
      { label: "40–60%", value: "40-60" },
      { label: "Over 60%", value: "60+" },
      { label: "Not tracked", value: "unknown" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eProposalProcess",
    number: 137,
    question: "How do you currently handle proposal creation and client follow-up?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-pipeline",
    is_active: true,
    options: [
      { label: "Manual and ad hoc — no consistent process", value: "manual" },
      { label: "Templated but no follow-up process", value: "templated" },
      { label: "Structured process with follow-up cadence", value: "structured" },
      { label: "Automated with tools and workflows", value: "automated" },
      { label: "No formal proposal process", value: "none" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eTargetClientsPerMonth",
    number: 138,
    question: "How many new client relationships are you targeting to open each month?",
    type: "text",
    required: true,
    section: "end-to-end",
    subsection: "e2e-pipeline",
    is_active: true,
    options: null,
    placeholder: "e.g. 3",
    conditional_on: null,
  },
  {
    question_id: "e2eLongestSalesChallenge",
    number: 139,
    question: "What is the hardest part of closing a deal for your business?",
    type: "long-text",
    required: true,
    section: "end-to-end",
    subsection: "e2e-pipeline",
    is_active: true,
    options: null,
    placeholder: "Price objections, long procurement cycles, multiple stakeholders…",
    conditional_on: null,
  },

  // ── e2e-systems: Technology & Systems (140–144) ───────────────────────────
  {
    question_id: "e2eCrmSystem",
    number: 140,
    question: "What CRM or pipeline management system do you use?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-systems",
    is_active: true,
    options: [
      { label: "HubSpot", value: "hubspot" },
      { label: "Salesforce", value: "salesforce" },
      { label: "Pipedrive", value: "pipedrive" },
      { label: "Monday.com", value: "monday" },
      { label: "Notion or Airtable", value: "notion" },
      { label: "Spreadsheets", value: "spreadsheets" },
      { label: "No CRM", value: "no-crm" },
      { label: "Other", value: "other" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eMarketingTools",
    number: 141,
    question: "Which marketing or outreach tools do you currently use?",
    type: "multi-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-systems",
    is_active: true,
    options: [
      { label: "Email marketing tools (Mailchimp, Klaviyo, etc.)", value: "email" },
      { label: "LinkedIn Sales Navigator", value: "linkedin-sn" },
      { label: "Data enrichment tools (Lusha, Apollo, etc.)", value: "enrichment" },
      { label: "Automation (Zapier, Make, etc.)", value: "automation" },
      { label: "HubSpot marketing hub", value: "hubspot" },
      { label: "Website and SEO analytics", value: "analytics" },
      { label: "None", value: "none" },
      { label: "Other", value: "other" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eAutomationLevel",
    number: 142,
    question: "How would you rate your current level of business process automation?",
    type: "single-select",
    required: true,
    section: "end-to-end",
    subsection: "e2e-systems",
    is_active: true,
    options: [
      { label: "Mostly manual — people do everything", value: "manual" },
      { label: "Some automation in isolated areas", value: "some" },
      { label: "Well automated across key processes", value: "well" },
      { label: "Highly automated — minimal manual work", value: "high" },
      { label: "AI-driven across most operations", value: "ai" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eDataInfrastructure",
    number: 143,
    question: "What data do you systematically track and report on today?",
    type: "multi-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-systems",
    is_active: true,
    options: [
      { label: "Lead source and volume", value: "leads" },
      { label: "Conversion rates by stage", value: "conversion" },
      { label: "Revenue by client or channel", value: "revenue" },
      { label: "Client satisfaction scores", value: "satisfaction" },
      { label: "Team and individual performance", value: "team" },
      { label: "Operational metrics and SLAs", value: "ops" },
      { label: "We don't track data systematically", value: "none" },
    ],
    placeholder: null,
    conditional_on: null,
  },
  {
    question_id: "e2eIntegrationNeeds",
    number: 144,
    question: "What systems would a BD programme need to integrate with or feed data into?",
    type: "multi-select",
    required: false,
    section: "end-to-end",
    subsection: "e2e-systems",
    is_active: true,
    options: [
      { label: "CRM", value: "crm" },
      { label: "Accounting and invoicing", value: "accounting" },
      { label: "Project management", value: "pm" },
      { label: "Marketing automation", value: "marketing" },
      { label: "Communication tools (Slack, Teams)", value: "comms" },
      { label: "HR and people systems", value: "hr" },
      { label: "Custom or proprietary system", value: "custom" },
      { label: "None", value: "none" },
    ],
    placeholder: null,
    conditional_on: null,
  },

  // ── e2e-future: Strategy & Future Vision (145–146) ────────────────────────
  {
    question_id: "e2eLongTermVision",
    number: 145,
    question: "What is your 3–5 year vision for the business?",
    type: "long-text",
    required: true,
    section: "end-to-end",
    subsection: "e2e-future",
    is_active: true,
    options: null,
    placeholder: "Where do you see the business in 3–5 years — scale, markets, model, exit…",
    conditional_on: null,
  },
  {
    question_id: "e2eSpecialConsiderations",
    number: 146,
    question: "Is there anything unique about your business, market, or situation that we should factor into the programme design?",
    type: "long-text",
    required: false,
    section: "end-to-end",
    subsection: "e2e-future",
    is_active: true,
    options: null,
    placeholder: "Regulatory constraints, partnership restrictions, confidentiality requirements, founder dynamics…",
    conditional_on: null,
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Target: ${url}`);
  console.log(`Questions: ${E2E_QUESTIONS.length} (numbers ${E2E_QUESTIONS[0].number}–${E2E_QUESTIONS[E2E_QUESTIONS.length - 1].number})\n`);

  // 1. Upsert the section (shift proposal-readiness, attachments, review orders up if needed)
  console.log("Upserting end-to-end section…");
  const { error: sectionErr } = await supabase
    .from("question_sections")
    .upsert(
      {
        section_id: E2E_SECTION.section_id,
        title: E2E_SECTION.title,
        subsections: E2E_SECTION.subsections,
        order: E2E_SECTION.order,
        is_active: E2E_SECTION.is_active,
      },
      { onConflict: "section_id" }
    );

  if (sectionErr) {
    console.error("Section upsert error:", sectionErr.message);
    process.exit(1);
  }
  console.log("  Section OK\n");

  // 2. Update the segment-selection question to include END_TO_END option
  console.log("Updating segment-selection options to include END_TO_END…");
  const updatedSegmentOptions = [
    { label: "B2B — Lead Generation & Sales Development", value: "B2B" },
    { label: "B2G — Public Tender & Government Contracts", value: "B2G" },
    { label: "A.D.A.M. — Business Automation System Licensing", value: "ADAM" },
    { label: "End-to-End Business Development", value: "END_TO_END" },
  ];
  const { error: segmentErr } = await supabase
    .from("question_items")
    .update({ options: updatedSegmentOptions })
    .eq("question_id", "segments");

  if (segmentErr) {
    console.error("Segment update error:", segmentErr.message);
    process.exit(1);
  }
  console.log("  Segment question OK\n");

  // 3. Upsert all 48 E2E questions
  console.log("Upserting 48 E2E questions…");
  const CHUNK = 10;
  let inserted = 0;
  for (let i = 0; i < E2E_QUESTIONS.length; i += CHUNK) {
    const chunk = E2E_QUESTIONS.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("question_items")
      .upsert(chunk, { onConflict: "question_id" });

    if (error) {
      console.error(`\nQuestion upsert error (chunk at ${i}):`, error.message);
      process.exit(1);
    }
    inserted += chunk.length;
    process.stdout.write(`  ${inserted}/${E2E_QUESTIONS.length}\r`);
  }

  console.log(`\n\nDone. ${inserted} E2E questions seeded into question_items.`);

  // 4. Verify
  const { count, error: countErr } = await supabase
    .from("question_items")
    .select("*", { count: "exact", head: true })
    .eq("section", "end-to-end");

  if (!countErr) {
    console.log(`Verification: ${count} rows found in question_items where section = 'end-to-end'`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
