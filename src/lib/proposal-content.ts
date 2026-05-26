import type { StrategyType, ProposalInvestment } from "@/lib/supabase/types";

export interface ProposalSection {
  key: string;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
  locked?: boolean; // if true, about_you is read-only
}

export const SECTION_KEYS = [
  "executive_summary",
  "about_you",
  "recommended_services",
  "investment_overview",
  "how_we_work",
  "why_andyk",
  "what_happens_next",
  "terms_summary",
] as const;

export type SectionKey = typeof SECTION_KEYS[number];

export function proposalStatusLabel(status: string): string {
  switch (status) {
    case "draft": return "Draft";
    case "published": return "Published";
    case "changes_requested": return "Changes Requested";
    case "confirmed": return "Confirmed";
    case "unlocked": return "Unlocked";
    case "sent": return "Published";
    case "approved": return "Confirmed";
    case "declined": return "Declined";
    case "evaluating": return "Evaluating";
    case "flagged": return "Flagged";
    default: return status;
  }
}

export function proposalStatusStyle(status: string): string {
  switch (status) {
    case "draft": return "bg-grid-300 text-muted";
    case "published": case "sent": return "bg-info/10 text-info";
    case "changes_requested": return "bg-warning/10 text-warning";
    case "confirmed": case "approved": return "bg-success/10 text-success";
    case "unlocked": return "bg-highlight/10 text-highlight";
    case "declined": return "bg-error/10 text-error";
    case "evaluating": case "flagged": return "bg-warning/10 text-warning";
    default: return "bg-grid-300 text-muted";
  }
}

export function isClientVisible(status: string): boolean {
  return ["published", "sent", "changes_requested", "confirmed", "approved", "unlocked"].includes(status);
}

export function buildAboutYouContent(q: {
  company_name: string;
  business_goals: string;
  challenges: string;
  usp: string;
  countries_of_operation: string;
  products_services?: string;
  years_in_business?: string;
  annual_revenue?: string | null;
}): string {
  const lines: string[] = [];
  lines.push(`Company: ${q.company_name}`);
  if (q.countries_of_operation) lines.push(`Markets: ${q.countries_of_operation}`);
  if (q.years_in_business) lines.push(`Years in operation: ${q.years_in_business}`);
  if (q.annual_revenue) lines.push(`Annual revenue: ${q.annual_revenue}`);
  if (q.products_services) {
    lines.push(`\nProducts & Services:\n${q.products_services}`);
  }
  lines.push(`\nBusiness Goals:\n${q.business_goals}`);
  lines.push(`\nKey Challenges:\n${q.challenges}`);
  lines.push(`\nUnique Strengths & Differentiators:\n${q.usp}`);
  return lines.join("\n");
}

export function buildRecommendedServicesContent(serviceType: StrategyType, companyName = ""): string {
  switch (serviceType) {
    case "b2b":
      return `Service Package: B2B Lead Generation & Sales Development\n\nBased on our assessment of your business goals and challenges, we recommend our B2B Sales Development programme. This engagement is designed to build and accelerate your outbound pipeline, opening new commercial relationships and converting prospects into signed clients.\n\nTarget Audience:\n• Decision-makers within your defined industry verticals\n• Companies matching your ideal customer profile (ICP)\n• Accounts with demonstrated budget and purchase authority\n\nCampaign Approach:\n• Multi-channel outreach (email, LinkedIn, telephone)\n• Personalised messaging sequences aligned to your value proposition\n• CRM-integrated pipeline reporting\n• Monthly performance reviews and optimisation cycles\n\nAvailable Add-Ons:\n• Content production (case studies, whitepapers)\n• Sales enablement material design\n• Market research and competitor analysis\n• CRM setup and integration`;

    case "b2g":
      return `Based on your procurement profile and target markets, we recommend our B2G Tender Strategy service. Our approach includes:
- Full CPV code analysis and opportunity mapping
- Tender pipeline management and bid preparation
- Compliance documentation support
- Consortium partnership identification
- Monthly tender calendar and deadline tracking`;

    case "adam_license":
      return `We recommend implementing A.D.A.M. — our AI-Powered Business Development Operating System — configured specifically for ${companyName}'s workflows. Your implementation includes:
- Full system setup and configuration
- Custom questionnaire for your client intake
- Proposal and contract templates for your services
- Invoice and payment tracking
- Client portal access for your clients
- 30-day implementation support`;

    case "end_to_end":
      return `Based on our assessment of ${companyName}, we propose a full End-to-End Business Development engagement. This is a custom, implementation-based partnership covering:
- Business architecture review and strategic alignment
- Revenue growth planning and market expansion
- Operational improvement and process optimization
- Go-to-market strategy and execution support
- Monthly strategic reviews and course corrections
This is not a template service — every deliverable is built specifically for your business.`;
  }
}

export function buildHowWeWorkContent(serviceType: StrategyType): string {
  switch (serviceType) {
    case "b2b":
      return HOW_WE_WORK;

    case "b2g":
      return `Our B2G engagement follows a structured monthly cycle:
- Week 1: Tender identification and pipeline review
- Week 2: Bid/no-bid decisions and preparation
- Week 3: Document preparation and submission
- Week 4: Review, feedback analysis and next cycle planning
Monthly reporting includes: tenders submitted, pipeline value, win/loss analysis`;

    case "adam_license":
      return `Your A.D.A.M. implementation follows 4 phases:
Phase 1 (Week 1-2): System access, initial configuration, team onboarding
Phase 2 (Week 3-4): Template setup, test runs, workflow calibration
Phase 3 (Month 2): Go-live with first real client, monitoring and optimization
Phase 4 (Month 3+): Advanced features, reporting, scaling
Weekly check-in calls during implementation. Dedicated support via info@andykgroup.com`;

    case "end_to_end":
      return `Our End-to-End engagement operates on a structured monthly rhythm:
Weekly: Progress calls, action item reviews, obstacle resolution
Monthly: Strategic review, KPI analysis, plan adjustment
Quarterly: Full business review, pivot decisions, next quarter planning
You will have direct access to senior consultants. All strategy documents, reports and deliverables are delivered through A.D.A.M. — your dedicated client portal.`;
  }
}

const HOW_WE_WORK = `Our engagement model is built on transparency, accountability, and regular communication. We operate on a structured sprint cycle, delivering measurable outputs at defined milestones. You will have a dedicated point of contact and access to your client portal (A.D.A.M.) throughout the engagement.

Communication cadence:
• Weekly progress updates via your preferred channel
• Monthly strategy review calls
• Real-time access to documents, proposals, and reports via A.D.A.M.
• Direct escalation route to senior leadership when needed

We do not operate on retainers where work is invisible. Every deliverable is logged, every milestone is tracked, and every invoice is backed by measurable output.`;

const WHY_ANDYK = `Andy'K Group International LTD is a specialist in cross-sector business development, combining deep market intelligence with a hands-on commercial approach. We operate at the intersection of B2B strategy, public sector procurement, digital transformation, and organisational growth — providing bespoke solutions, not templates.

What sets us apart:
• Senior-led delivery — no junior handoffs
• Sector expertise across finance, technology, professional services, and public sector
• Proven track record in complex procurement environments and regulated markets
• Transparent commercial model — you see what you pay for
• Integrated tooling via A.D.A.M. — one platform, full lifecycle visibility

We measure our success by yours. Our incentive is to deliver outcomes, not activity.

Company Registration No. 16453500 | Registered in England and Wales
86-90 Paul Street, London, EC2A 4NE`;

const WHAT_HAPPENS_NEXT = `1. Review this proposal carefully
   Take your time to read through each section. If anything requires clarification or amendment, use the "Request Changes" option to share your feedback and our team will respond within one business day.

2. Confirm the Proposal
   Once you are satisfied with the terms and scope, click "Confirm Proposal" to lock the commercial terms and initiate the contract stage. Confirmation constitutes acceptance of the scope and pricing as stated.

3. Contract issued within 5 business days
   Our team will draft and publish the formal Service Agreement for your electronic signature through your client portal. You will receive an email notification when it is ready.

4. Onboarding & Kickoff
   Upon contract execution, your dedicated onboarding session and project kickoff will be arranged within 5–10 business days. All relevant access, introductions, and initial deliverables will be confirmed at this stage.`;

const TERMS_SUMMARY = `This proposal is valid for 30 days from the date of issue. All services are subject to Andy'K Group International LTD's standard Terms & Conditions, a copy of which is available on request.

Scope & Pricing Lock
Upon your acceptance (by clicking "Confirm Proposal"), the commercial terms set out in this proposal — including service scope, pricing, billing cycle, and payment terms — are confirmed and locked ("Locked"). These locked terms will be incorporated verbatim into all subsequent contractual documents, including the Service Agreement. No amendments to locked terms may be made without a signed Change Request executed by both parties.

Payment
All amounts are stated exclusive of VAT unless otherwise indicated. Invoices are due within the payment terms stated in the Investment Overview section. Andy'K Group International LTD reserves the right to suspend services in the event of non-payment after 14 days' written notice.

Confidentiality
By receiving this proposal, you agree to treat all information contained herein as confidential and not to share it with third parties without prior written consent from Andy'K Group International LTD.

Withdrawal
Andy'K Group International LTD reserves the right to withdraw or amend this proposal at any time before acceptance. If the proposal is not accepted within the validity period, it will lapse automatically.`;

export function buildDefaultSections(
  serviceType: StrategyType,
  aboutYouContent: string,
  companyName = ""
): ProposalSection[] {
  return [
    {
      key: "executive_summary",
      title: "Executive Summary",
      content: "",
      order: 0,
      isVisible: true,
    },
    {
      key: "about_you",
      title: "About You — Our Understanding",
      content: aboutYouContent,
      order: 1,
      isVisible: true,
      locked: true,
    },
    {
      key: "recommended_services",
      title: "Recommended Services",
      content: buildRecommendedServicesContent(serviceType, companyName),
      order: 2,
      isVisible: true,
    },
    {
      key: "investment_overview",
      title: "Investment Overview",
      content: "",
      order: 3,
      isVisible: true,
    },
    {
      key: "how_we_work",
      title: "How We Work Together",
      content: buildHowWeWorkContent(serviceType),
      order: 4,
      isVisible: true,
    },
    {
      key: "why_andyk",
      title: "Why Andy'K Group International LTD",
      content: WHY_ANDYK,
      order: 5,
      isVisible: true,
    },
    {
      key: "what_happens_next",
      title: "What Happens Next",
      content: WHAT_HAPPENS_NEXT,
      order: 6,
      isVisible: true,
    },
    {
      key: "terms_summary",
      title: "Terms & Conditions Summary",
      content: TERMS_SUMMARY,
      order: 7,
      isVisible: true,
    },
  ];
}

export function defaultInvestment(): ProposalInvestment {
  return {
    currency: "GBP",
    billingCycle: "monthly",
    paymentTerms: 30,
    paymentMethod: "Bank transfer (Revolut Business)",
    recurringItems: [{ name: "", monthly: 0 }],
    oneTimeItems: [],
  };
}

export function calcTotals(inv: ProposalInvestment): { totalMonthly: number; totalOneTime: number } {
  const totalMonthly = inv.recurringItems.reduce((s, i) => s + (Number(i.monthly) || 0), 0);
  const totalOneTime = inv.oneTimeItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  return { totalMonthly, totalOneTime };
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);
}
