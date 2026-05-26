export type StrategyTemplateKey = "b2g" | "adam_license" | "end_to_end";

export const STRATEGY_TEMPLATE_LABELS: Record<StrategyTemplateKey, string> = {
  b2g:          "B2G Government Procurement",
  adam_license: "A.D.A.M. Implementation",
  end_to_end:   "End-to-End Business Development",
};

// ─── Raw templates ────────────────────────────────────────────────────────────

const B2G = `# B2G Government Procurement Strategy

## Client Profile
- Company: {{company_name}}
- Registration: {{company_registration}}
- Markets: {{countries_of_operation}}

## Procurement Assessment
- Current procurement experience:
- Existing certifications:
- Compliance gaps:

## CPV Code Analysis
- Primary CPV codes (to identify):
- Secondary CPV codes:
- Opportunity mapping:

## Target Authorities
- National government targets:
- Regional/local authorities:
- EU institutions (if applicable):
- Estimated tender value range:

## Tender Strategy
- Bid/no-bid criteria:
- Consortium opportunities:
- Key differentiators for public sector:

## Compliance Checklist
- [ ] Company registration documents
- [ ] Tax clearance certificate
- [ ] Insurance certificates
- [ ] Financial statements (last 2 years)
- [ ] References/past performance
- [ ] GDPR compliance documentation

## Implementation Timeline
- Month 1: Profile setup + CPV analysis + first tender identification
- Month 2: First bid submission
- Month 3+: Pipeline management + ongoing submissions

## KPIs
- Tenders submitted per month:
- Win rate target:
- Pipeline value:`;

const ADAM_LICENSE = `# A.D.A.M. Implementation Strategy

## Client Profile
- Company: {{company_name}}
- Industry: {{segments}}
- Team size:
- Current tools being replaced:

## Pain Points & Goals
- Current workflow problems:
- Automation goals:
- Expected time savings:

## Module Configuration Plan
- Questionnaire setup: (which sections to activate)
- Proposal templates: (which service types)
- Contract types: (which templates)
- Invoice setup: (currency, payment terms)
- Email notifications: (which triggers)

## Implementation Timeline
- Week 1: System access + initial setup
- Week 2: Questionnaire configuration + team training
- Week 3: Test runs with internal data
- Week 4: Go-live with first real client
- Month 2+: Optimization + advanced features

## Integration Plan
- Existing CRM: (migrate or replace)
- Email system: (Resend configuration)
- Document storage: (Supabase setup)
- Team access: (admin/staff roles)

## Success Metrics
- Time saved per client onboarding:
- Documents automated per month:
- Client satisfaction score:
- ROI target:

## Support Structure
- Primary contact: info@andykgroup.com
- Implementation support: first 30 days included
- Ongoing: per plan tier`;

const END_TO_END = `# End-to-End Business Development Strategy

## Client Profile
- Company: {{company_name}}
- Revenue: {{annual_revenue}}
- Markets: {{countries_of_operation}}
- Team:

## Current State Assessment
- Core business model:
- Main revenue streams:
- Current challenges:
- Previous growth attempts:
- What has failed before:

## Strategic Priorities (Top 3)
1.
2.
3.

## Revenue Growth Plan

### Short-term (0-3 months)
- Quick wins:
- Immediate actions:
- Expected revenue impact:

### Medium-term (3-12 months)
- Growth initiatives:
- Market expansion:
- Expected revenue impact:

### Long-term (12+ months)
- Strategic vision:
- Market position target:
- Revenue target:

## Operational Improvements
- Process optimization areas:
- Team structure changes:
- Systems to implement:
- Automation opportunities:

## Market Expansion
- New geographic markets:
- New customer segments:
- International opportunities:
- B2G opportunities (if applicable):

## Implementation Roadmap

### Phase 1 (Month 1-2): Foundation
-
### Phase 2 (Month 3-6): Growth
-
### Phase 3 (Month 6-12): Scale
-

## Success Metrics
- Revenue target 12 months:
- New clients target:
- Market expansion milestones:
- Operational efficiency gains:

## Next Steps
- [ ] Week 1: Strategy review call
- [ ] Week 2: Priority alignment
- [ ] Week 3: Action plan finalization
- [ ] Month 1: First milestone review`;

// ─── Builder ──────────────────────────────────────────────────────────────────

const TEMPLATES: Record<StrategyTemplateKey, string> = {
  b2g:          B2G,
  adam_license: ADAM_LICENSE,
  end_to_end:   END_TO_END,
};

export function buildStrategyTemplate(
  type: StrategyTemplateKey,
  vars: {
    company_name?: string;
    company_registration?: string;
    countries_of_operation?: string;
    segments?: string[] | null;
    annual_revenue?: string | null;
  }
): string {
  return TEMPLATES[type]
    .replace(/{{company_name}}/g,          vars.company_name          ?? "")
    .replace(/{{company_registration}}/g,  vars.company_registration  ?? "")
    .replace(/{{countries_of_operation}}/g, vars.countries_of_operation ?? "")
    .replace(/{{segments}}/g,              (vars.segments ?? []).join(", "))
    .replace(/{{annual_revenue}}/g,        vars.annual_revenue        ?? "");
}
