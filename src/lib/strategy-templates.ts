export type StrategyTemplateKey = "b2g" | "adam_license" | "end_to_end";

export const STRATEGY_TEMPLATE_LABELS: Record<StrategyTemplateKey, string> = {
  b2g:          "B2G Government Procurement",
  adam_license: "A.D.A.M. Implementation",
  end_to_end:   "End-to-End Business Development",
};

// ─── Template: End-to-End Business Development ───────────────────────────────

const END_TO_END = `# End-to-End Business Development Strategy
## {{company_name}}

---

## 1. Executive Overview

- **Client:** {{company_name}}
- **Industry / Segments:** {{segments}}
- **Annual Revenue:** {{annual_revenue}}
- **Markets:** {{countries_of_operation}}
- **Engagement Type:** End-to-End Business Development
- **Andy'K Group Role:** Strategic partner — responsible for strategy design, operational implementation, and ongoing growth management
- **Engagement Objective:**
- **Date Prepared:**

---

## 2. Current State Assessment

### Core Business Model
-

### Main Revenue Streams
-

### Key Bottlenecks
- Bottleneck 1:
- Bottleneck 2:
- Bottleneck 3:

### Previous Growth Attempts
- What was tried:
- What failed and why:
- Key lessons:

### Current Limitations
- Team capacity:
- Systems / tools:
- Market reach:
- Operational constraints:

---

## 3. Strategic Priorities

*Top 3–5 priorities agreed with the client. These drive the entire engagement.*

1. **Priority 1:**
   - Why this first:
   - Expected impact:

2. **Priority 2:**
   - Why this second:
   - Expected impact:

3. **Priority 3:**
   - Why this third:
   - Expected impact:

4. **Priority 4 (optional):**

5. **Priority 5 (optional):**

---

## 4. Revenue Growth Architecture

### Short-Term (0–3 months) — Quick Wins
- Target: {{annual_revenue}} → [short-term revenue target]
- Actions:
  -
  -
- Expected revenue impact:
- KPI to track:

### Medium-Term (3–12 months) — Growth Layer
- Growth initiatives:
  -
  -
- Market expansion activities:
- Expected revenue impact:
- KPI to track:

### Long-Term (12+ months) — Scale & Position
- Strategic vision:
- Target market position:
- Revenue target (12 months):
- Revenue target (24 months):
- Key dependencies:

---

## 5. Operational Improvement Layer

### Process Optimisation Areas
- Process 1:
- Process 2:
- Process 3:

### Automation Opportunities
- What can be automated now:
- What requires A.D.A.M. implementation:
- What must remain manual:

### Systems to Implement or Replace
- Current tools:
- Recommended tools / systems:
- Migration plan:

### Reporting & Visibility
- What metrics the client currently tracks:
- What metrics they should track:
- Reporting cadence:

---

## 6. Market Expansion Strategy

### Current Geographic Presence
-

### New Geographic Markets
- Market 1: [Country/Region] — Rationale:
- Market 2: [Country/Region] — Rationale:

### New Customer Segments
-

### International Opportunities
-

### B2G / Public Sector Opportunities (if applicable)
- Applicable: Yes / No
- Target authorities:
- CPV relevance:

### Partnership & Channel Strategy
- Strategic partners to pursue:
- Distribution channels:
- Consortium opportunities:

---

## 7. Team & Operational Structure

### Current Team Structure
-

### Gaps Identified
-

### Recommended Hires or Restructuring
-

### Decision-Making Framework
- Who approves strategic decisions:
- Who approves commercial commitments:
- Escalation path:

### Client Primary Contact (for this Engagement)
- Name:
- Role:
- Email:
- Availability:

---

## 8. Human-Controlled Processes

> **A.D.A.M. structures operations — humans make strategic decisions.**

The following processes must remain under direct human control and must NOT be delegated to automated systems:

- [ ] Strategic direction and pivots
- [ ] Negotiations with partners, clients, and investors
- [ ] Partnership agreements and commercial commitments
- [ ] Sensitive client approvals and escalations
- [ ] Final pricing decisions
- [ ] Leadership direction and team restructuring
- [ ] Legal and compliance decisions
- [ ] Media, PR, and public communications
- [ ] Investor relations and funding decisions
- [ ] Any decision with material financial or reputational consequences

**Designated Decision-Maker:**
**Backup / Deputy:**
**Escalation Protocol:**

---

## 9. Implementation Roadmap

### Phase 1 (Month 1–2): Foundation
**Objective:**

Key activities:
- [ ]
- [ ]
- [ ]

Milestone / Completion criteria:
Dependencies:

### Phase 2 (Month 3–6): Growth
**Objective:**

Key activities:
- [ ]
- [ ]
- [ ]

Milestone / Completion criteria:
Dependencies:

### Phase 3 (Month 6–12): Scale
**Objective:**

Key activities:
- [ ]
- [ ]
- [ ]

Milestone / Completion criteria:
Dependencies:

---

## 10. KPI & Success Metrics

| KPI | Baseline | 3-Month Target | 12-Month Target | Owner |
|-----|----------|----------------|-----------------|-------|
| Monthly Revenue | | | | |
| New Clients / Month | | | | |
| Pipeline Value | | | | |
| Conversion Rate | | | | |
| Markets Active | | | | |
| Operational Efficiency | | | | |

**Review Cadence:**
- Monthly: KPI review call
- Quarterly: Full business review (QBR)
- Annual: Full strategy reassessment

---

## 11. Next Steps

- [ ] Week 1: Strategy review and alignment call
- [ ] Week 1: Confirm priorities and Phase 1 scope
- [ ] Week 2: Confirm primary contact and decision-maker
- [ ] Week 2: Grant required system and operational access
- [ ] Week 3: Phase 1 kick-off — first deliverable in progress
- [ ] Week 4: First Monthly Progress Report
- [ ] Month 1 end: Phase 1 milestone review

**Open Items / Blockers:**
-

**Notes:**
-`;

// ─── Template: B2G Government Procurement ────────────────────────────────────

const B2G = `# B2G Government Procurement Strategy
## {{company_name}}

---

## 1. Executive Procurement Overview

- **Client:** {{company_name}}
- **Company Registration:** {{company_registration}}
- **Markets:** {{countries_of_operation}}
- **Industry / Segments:** {{segments}}
- **Engagement Type:** B2G Government Procurement Support
- **Andy'K Group Role:** Procurement strategy, tender identification, CPV architecture, bid preparation
- **Strategic Objective:**
- **Date Prepared:**

---

## 2. Procurement Readiness Assessment

### Current Procurement Experience
- Has the client previously bid for government contracts? Yes / No
- Prior bids submitted:
- Prior wins:
- Frameworks registered on:

### Existing Certifications & Accreditations
- ISO certifications:
- Sector-specific licences:
- Insurance coverage (level & type):
- Security clearances (if applicable):

### Financial Standing
- Last 2 years accounts: Available / Pending
- Credit rating / financial health:
- Minimum contract value the client can support:

### Compliance Gaps
- Gap 1:
- Gap 2:
- Gap 3:

### Readiness Score
- Overall procurement readiness: [Low / Medium / High]
- Estimated time to first submission: [weeks]
- Key actions before first bid:
  - [ ]
  - [ ]

---

## 3. CPV Code Architecture

*CPV = Common Procurement Vocabulary. Defines which tenders the client is eligible to pursue.*

### Primary CPV Codes
| Code | Description | Rationale |
|------|-------------|-----------|
| | | |
| | | |
| | | |

### Secondary CPV Codes (Adjacent Opportunities)
| Code | Description | Rationale |
|------|-------------|-----------|
| | | |

### CPV Exclusions
- Codes to avoid (outside capability):

### Keyword Search Terms
- Portal search terms for daily monitoring:
  -
  -

---

## 4. Government Target Structure

### National Government (Central)
- Target ministries / departments:
- Framework agreements to register on:
- Estimated contract value range:

### Regional / Local Authorities
- Priority regions:
- Local councils / authorities:
- Procurement portals to monitor:

### NHS / Healthcare Bodies (if applicable)
-

### EU Institutions / International Bodies (if applicable)
- TED (Tenders Electronic Daily) relevance:
- UN / World Bank procurement relevance:

### Consortium & Sub-Contracting Opportunities
- Potential prime contractors to partner with:
- Sub-contracting opportunities:
- Framework lots available:

---

## 5. Tender Strategy

### Bid / No-Bid Criteria
A bid should be pursued when:
- [ ] CPV codes match primary or secondary codes
- [ ] Contract value is within the client's capacity
- [ ] Submission deadline allows adequate preparation time
- [ ] Win probability is assessed at ≥30%
- [ ] No disqualifying compliance gaps

A bid should NOT be pursued when:
- Contract requirements exceed current capability
- Timeline is less than [X] working days
- Price competition makes margin unviable

### Win Themes
- Differentiator 1:
- Differentiator 2:
- Differentiator 3:

### Pricing Strategy
- Pricing approach (cost-plus / market-rate / competitive):
- Margin target:
- Flexibility range:

### Sub-Contracting & Consortium Strategy
- Preferred consortium roles (prime / sub):
- Target consortium partners:

---

## 6. Compliance Structure

### Documentation Checklist
- [ ] Company registration documents (Companies House)
- [ ] Certificate of incorporation
- [ ] VAT registration certificate
- [ ] Tax compliance certificate / clearance
- [ ] Public liability insurance (min. £[X]m)
- [ ] Professional indemnity insurance (min. £[X]m)
- [ ] Employer's liability insurance (if applicable)
- [ ] Audited financial statements (last 2 years)
- [ ] Bank reference letter
- [ ] References / past performance evidence (min. 3)
- [ ] GDPR / data protection policy
- [ ] Modern Slavery Act statement
- [ ] Equality & Diversity policy
- [ ] Environmental policy / ISO 14001 (if required)
- [ ] Health & Safety policy / ISO 45001 (if required)

### Supplier Registration Portals
- [ ] Find a Tender Service (FTS)
- [ ] Contracts Finder
- [ ] Crown Commercial Service (CCS)
- [ ] Procontract / Delta eSourcing
- [ ] Jaggaer / Bravo / Coupa (authority-specific)
- [ ] Local authority portals

---

## 7. Tender Pipeline Management

### Active Pipeline (updated monthly)

| Tender Reference | Authority | CPV | Value | Deadline | Status | Priority |
|-----------------|-----------|-----|-------|----------|--------|----------|
| | | | | | | |
| | | | | | | |

### Forthcoming Tenders (upcoming 90 days)

| Tender Title | Authority | Est. Value | Expected Issue | Action |
|-------------|-----------|------------|----------------|--------|
| | | | | |

### Submitted Bids — Outcome Tracker

| Reference | Authority | Submitted | Outcome | Score (if available) | Debrief Notes |
|-----------|-----------|-----------|---------|----------------------|---------------|
| | | | | | |

---

## 8. Internal Procurement Workflow

### Tender Opportunity Received
1. Andy'K Group identifies opportunity → sends to client primary contact
2. Client reviews and confirms bid/no-bid within [X] business days
3. Andy'K Group confirms deadline and documents required

### Bid Preparation Process
1. Andy'K Group prepares bid structure and questions schedule
2. Client provides technical content, case studies, and data
3. Andy'K Group drafts written responses
4. Client reviews and approves draft (within [X] days)
5. Final compliance check by Andy'K Group
6. Client authorises submission
7. Andy'K Group submits on behalf of client (where portal allows) or provides final package

### Post-Submission
1. Confirm receipt from authority
2. Log outcome in pipeline tracker
3. Request debrief (win or lose)
4. Update strategy based on feedback

---

## 9. Operational Scaling

### Capacity Planning for Growing Bid Volume
- Current internal resource for procurement (hours/week):
- Target bid volume per month:
- Resource requirement at scale:

### Framework Agreement Strategy
- Frameworks to target for long-term pipeline stability:
- Qualification requirements:
- Timeline to register:

### Geographic Scaling
- Expansion into new regions / countries:
- International procurement portals:

---

## 10. KPI Structure

| KPI | Month 1 Target | Month 3 Target | Month 6 Target | Owner |
|-----|----------------|----------------|----------------|-------|
| Tenders identified / month | | | | |
| Tenders pursued / month | | | | |
| Bids submitted / month | | | | |
| Win rate (%) | — | | | |
| Pipeline value (£) | | | | |
| Framework registrations | | | | |
| Compliance docs completed | | | | |

**Review Cadence:**
- Monthly: Pipeline report + bid review
- Quarterly: Strategy review + CPV reassessment

---

## 11. Next Steps

- [ ] Week 1: Compliance gap analysis — documents to gather
- [ ] Week 1: Supplier portal registrations initiated
- [ ] Week 1: CPV code confirmation and keyword setup
- [ ] Week 2: First tender opportunity shortlist delivered
- [ ] Week 2: Bid/no-bid decision on first shortlist
- [ ] Week 3: First bid preparation commenced
- [ ] Month 1: First bid submitted

**Open Items / Blockers:**
-

**Notes:**
-`;

// ─── Template: A.D.A.M. Implementation ───────────────────────────────────────

const ADAM_LICENSE = `# A.D.A.M. Implementation Strategy
## {{company_name}}

---

## 1. Executive Implementation Overview

- **Client:** {{company_name}}
- **Industry / Segments:** {{segments}}
- **Engagement Type:** A.D.A.M. System Licensing & Implementation
- **Plan Tier:**
- **Andy'K Group Role:** System configuration, onboarding, and implementation support
- **Implementation Objective:**
- **Go-Live Target Date:**
- **Date Prepared:**

---

## 2. Current Operational Assessment

### Current Tools & Systems
| Function | Current Tool | Replace / Integrate / Retire |
|----------|-------------|------------------------------|
| CRM | | |
| Proposals | | |
| Contracts | | |
| Invoicing | | |
| Document storage | | |
| Email | | |
| Client comms | | |

### Current Pain Points
- Pain Point 1:
- Pain Point 2:
- Pain Point 3:

### Primary Automation Goals
-

### Expected Time Savings (post-implementation)
- Per client onboarding:
- Per proposal cycle:
- Per contract cycle:
- Per invoice cycle:

---

## 3. Operational Maturity Assessment

*Rate each dimension 1 (low) – 5 (high)*

| Dimension | Score (1–5) | Notes |
|-----------|-------------|-------|
| Existing systems quality | | |
| Document / template quality | | |
| Process consistency | | |
| Team readiness for change | | |
| Automation readiness | | |
| Data quality / completeness | | |
| Rollout complexity | | |

**Overall Maturity Level:** [Low / Medium / High]
**Key Risk Areas:**
-

**Recommended Implementation Pace:** [Standard 30-day / Extended 45-day / Phased]

---

## 4. Client Lifecycle Architecture

*Map the full client journey inside A.D.A.M.*

### Stage 1: Lead Intake
- Source: [Landing page form / manual / import]
- Auto-scoring: Yes / No
- Qualification threshold:
- Auto-rejection threshold:

### Stage 2: Questionnaire
- Full questionnaire: Yes / No
- Which sections to activate:
- Custom questions to add:

### Stage 3: Proposal
- Templates to activate: [B2G / ADAM / E2E / all]
- Proposal approval workflow:
- Client portal access: Yes / No

### Stage 4: Contract
- Contract types to activate:
- Signature method: [Electronic canvas / DocuSign / manual]
- Appendix requirements per contract type:

### Stage 5: Invoicing
- Currency: {{company_name}} billing currency
- Payment terms: [7 / 14 / 30 days]
- Invoice numbering format:
- Auto-send on creation: Yes / No

### Stage 6: Kick-off
- Kick-off checklist items:
- Welcome email: Yes / No
- Client dashboard access: Yes / No

---

## 5. Workflow Architecture

### Automated Workflows to Configure
| Trigger | Action | Status |
|---------|--------|--------|
| Lead submitted | Score + route to pipeline | |
| Questionnaire completed | Notify admin | |
| Proposal sent to client | Send client email | |
| Proposal approved | Trigger contract creation | |
| Contract published | Notify client | |
| Contract signed | Update stage | |
| Invoice issued | Send to client | |
| Invoice overdue | Send reminder | |
| Kick-off confirmed | Send welcome email | |

### Notification Structure
- Admin email notifications: On / Off per trigger
- Client email notifications: On / Off per trigger
- Internal review reminders:

---

## 6. Team & Permission Structure

### A.D.A.M. Roles
| Team Member | Name | Role (Admin / Staff / Client) | Access Level |
|-------------|------|-------------------------------|--------------|
| | | Admin | Full access |
| | | Staff | Proposals + Contracts |
| | | Staff | Invoicing only |

### Client Portal Access
- Clients who will have portal access at launch:
  -
  -

### Permission Notes
-

---

## 7. Automation Strategy

### What to Automate
- Lead scoring and routing
- Email notifications (all triggers above)
- Status progression on signature / payment
- Invoice generation on milestone completion
- Reminder emails for overdue invoices
- Questionnaire access link delivery

### What Stays Manual
- Strategy note authoring
- Proposal content writing
- Contract clause customisation
- Final approval before sending to client
- Pricing decisions

### Where Approvals Are Required Before Automation Proceeds
- [ ] Proposal requires admin approval before client send
- [ ] Contract requires admin review before publish
- [ ] Invoice requires admin confirm before auto-send
- [ ] Lead rejection requires manual review above threshold [X]

---

## 8. Human-Controlled Processes

> **CRITICAL: A.D.A.M. structures operations. Humans make strategic decisions.**

The following processes must remain under direct human control at all times. These are NOT to be automated, delegated to AI, or processed without an authorised human sign-off:

- [ ] Pricing and commercial terms decisions
- [ ] Contract clause modifications or custom terms
- [ ] Strategic advice to clients
- [ ] Partnership or third-party engagement decisions
- [ ] Client rejection decisions (borderline cases)
- [ ] Sensitive client communications and escalations
- [ ] Legal and compliance decisions
- [ ] Any contract above value threshold: £[X]
- [ ] Media and public-facing communications
- [ ] Financial approvals above threshold: £[X]
- [ ] Team hiring, firing, or restructuring
- [ ] Investor or board communications

**System Administrator (primary):**
**System Administrator (backup):**
**Approval Authority for High-Value Actions:**

---

## 9. Implementation & Activation Plan

### Week 1: Environment Setup
- [ ] System access provisioned for admin users
- [ ] Company profile configured (name, logo, address, registration)
- [ ] Email settings configured (Resend / SMTP)
- [ ] Billing currency and payment terms set
- [ ] Initial user accounts created

### Week 2: Workflow Configuration
- [ ] Questionnaire sections activated and customised
- [ ] Proposal templates selected and reviewed
- [ ] Contract templates reviewed and clause additions noted
- [ ] Invoice template configured (numbering, payment terms)
- [ ] Email notification triggers confirmed

### Week 3: Testing & Validation
- [ ] Internal test run: full lead → invoice cycle with dummy data
- [ ] Proposal generation tested
- [ ] Contract generation and signature tested
- [ ] Invoice generation tested
- [ ] Email notifications validated (all triggers)
- [ ] Client portal access tested

### Week 4: Go-Live Preparation
- [ ] Staff training completed
- [ ] First real client entered into system
- [ ] Go-live confirmed with Andy'K Group
- [ ] Support contact confirmed: {{support_email}}

### Month 2+: Optimisation
- Review first month performance data
- Identify bottlenecks in the workflow
- Activate advanced features as team capability grows
- Introduce automation for additional triggers
- Review KPIs against targets

---

## 10. Integration Structure

### Existing CRM
- Integration approach: [Migrate / Replace / Run in parallel]
- Data migration required: Yes / No
- Migration scope:

### Email System
- Provider: [Resend / SMTP custom]
- Domain for sending: [info@{{client_domain}}]
- SPF / DKIM setup: Pending / Complete

### Document Storage
- Storage: Supabase (included)
- External storage sync: Yes / No
- Document naming convention:

### Accounting / Finance
- Current accounting software:
- Export format needed:
- Invoice sync required: Yes / No

### Other Integrations
-

---

## 11. KPI & Success Metrics

| KPI | Baseline | Month 1 Target | Month 3 Target | Owner |
|-----|----------|----------------|----------------|-------|
| Time per client onboarding (hrs) | | | | |
| Proposals generated / month | | | | |
| Contracts processed / month | | | | |
| Invoices automated / month | | | | |
| Outstanding invoices (%) | | | | |
| Client portal adoption (%) | | | | |
| Admin hours saved / month | | | | |
| ROI vs. manual process | | | | |

**Review Cadence:**
- Monthly: System usage and KPI review
- Quarterly: Feature expansion review

---

## 12. Next Steps

- [ ] Week 1, Day 1: System access provisioned
- [ ] Week 1, Day 2: Onboarding call — configuration walkthrough
- [ ] Week 1, Day 3: Company profile and email configured
- [ ] Week 2: Workflow configuration and template review
- [ ] Week 3: Internal test run completed
- [ ] Week 4: Go-live with first real client
- [ ] Month 1 end: First KPI review — implementation performance report

**Open Items / Blockers:**
-

**Notes:**
-`;

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
    support_email?: string;
    client_domain?: string;
  }
): string {
  return TEMPLATES[type]
    .replace(/{{company_name}}/g,            vars.company_name            ?? "")
    .replace(/{{company_registration}}/g,    vars.company_registration    ?? "")
    .replace(/{{countries_of_operation}}/g,  vars.countries_of_operation  ?? "")
    .replace(/{{segments}}/g,               (vars.segments ?? []).join(", "))
    .replace(/{{annual_revenue}}/g,          vars.annual_revenue          ?? "")
    .replace(/{{support_email}}/g,           vars.support_email           ?? "info@andykgroup.com")
    .replace(/{{client_domain}}/g,           vars.client_domain           ?? "");
}
