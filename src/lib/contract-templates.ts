import type { ContractAppendix, StrategyType } from "@/lib/supabase/types";

export interface ContractClientData {
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientRef: string;
  date: string;
  packageName: string;
  monthlyFee: string;
  currency: string;
}

interface ContractSection {
  id: string;
  title: string;
  content: string;
}

interface ContractTemplate {
  title: string;
  sections: ContractSection[];
  appendices: ContractAppendix[];
}

const COMPANY      = "Andy'K Group International LTD";
const COMPANY_REG  = "16453500";
const COMPANY_ADDR = "86-90 Paul Street, London, EC2A 4NE, United Kingdom";
const COMPANY_EMAIL = "info@andykgroup.com";

function baseAppendices(extras: ContractAppendix[] = []): ContractAppendix[] {
  return [
    { slot: "appendix_a", label: "Appendix A — Scope of Work",            required: true,  status: "empty" },
    { slot: "appendix_b", label: "Appendix B — Commercial Terms",         required: true,  status: "empty" },
    { slot: "appendix_c", label: "Appendix C — Service Level Agreement",  required: false, status: "empty" },
    { slot: "appendix_d", label: "Appendix D — Primary Contact Person",   required: true,  status: "empty" },
    ...extras,
  ];
}

export function getContractTemplate(
  serviceType: StrategyType,
  data: ContractClientData
): ContractTemplate {
  switch (serviceType) {
    case "b2g":          return b2gTemplate(data);
    case "adam_license": return adamTemplate(data);
    case "end_to_end":   return endToEndTemplate(data);
    default:             return b2gTemplate(data);
  }
}

export function serviceTypeLabel(type: StrategyType | null): string {
  switch (type) {
    case "b2b":          return "B2B Service Agreement";
    case "b2g":          return "B2G Service Agreement";
    case "adam_license": return "A.D.A.M. License Agreement";
    case "end_to_end":   return "End-to-End Business Development";
    default:             return "Service Agreement";
  }
}

export function serviceTypeStyle(type: StrategyType | null): string {
  switch (type) {
    case "b2b":          return "bg-info/10 text-info";
    case "b2g":          return "bg-violet-500/10 text-violet-600";
    case "adam_license": return "bg-highlight/10 text-highlight";
    case "end_to_end":   return "bg-success/10 text-success";
    default:             return "bg-grid-300 text-muted";
  }
}

// ─── Shared parties block ───────────────────────────────────────────────────

function partiesBlock(data: ContractClientData, agreementType: string, companyRole: string, clientRole: string): string {
  const ref = data.clientRef ? `${data.clientRef}-CONT-001` : "—";
  return `This ${agreementType} ("Agreement") is entered into as of ${data.date} between:

${COMPANY} (Company Registration No. ${COMPANY_REG}), ${COMPANY_ADDR} (hereinafter referred to as "${companyRole}"); and

${data.clientCompany}${data.clientAddress ? `\n${data.clientAddress}` : ""}${data.clientRef ? `\nClient ID: ${data.clientRef}` : ""}
(hereinafter referred to as "${clientRole}").

Agreement Reference: ${ref}

Collectively referred to as the "Parties".`;
}

// ─── Template 1: B2G Service Agreement ──────────────────────────────────────

function b2gTemplate(data: ContractClientData): ContractTemplate {
  const feeClause = data.monthlyFee
    ? `The monthly retainer fee for the Services is ${data.monthlyFee} (exclusive of VAT) as agreed in the approved commercial proposal and set out in Appendix B (Commercial Terms).`
    : `The fees for the Services are as agreed in the approved commercial proposal and set out in full in Appendix B (Commercial Terms).`;

  return {
    title: `B2G Service Agreement — ${data.clientCompany}`,
    sections: [
      {
        id: "parties",
        title: "1. Parties",
        content: partiesBlock(data, "Business-to-Government Service Agreement", "The Company", "The Client"),
      },
      {
        id: "scope",
        title: "2. Scope of Services",
        content: `The Company agrees to provide the following business-to-government procurement support services to The Client (the "Services"):

(a) Identification and monitoring of relevant public sector tender opportunities across UK and international government procurement portals, including analysis of CPV (Common Procurement Vocabulary) codes applicable to The Client's offer;

(b) Strategic bid preparation support, including development of bid structure, compliance matrices, win themes, and written responses to tender specifications and evaluation criteria;

(c) Review and quality assurance of bid documentation prior to submission, including commercial and technical narrative, pricing schedules, and mandatory attachments;

(d) Compliance documentation support, including preparation or review of supplier registration forms, pre-qualification questionnaires (PQQ), selection questionnaires (SQ), and standard selection criteria;

(e) Post-submission debrief support and pipeline management.

The specific scope, target sectors, geographic focus, and deliverable standards are defined in detail in Appendix A (Scope of Work), which forms an integral part of this Agreement. Any material change to the scope must be agreed in writing by both Parties prior to implementation.`,
      },
      {
        id: "term",
        title: "3. Term",
        content: `This Agreement shall commence on ${data.date} and shall continue for a minimum initial term of three (3) calendar months (the "Minimum Term").

Following the expiry of the Minimum Term, this Agreement shall automatically renew on a rolling monthly basis unless terminated in accordance with Clause 9 of this Agreement.

The minimum term is required to allow sufficient time for pipeline development, tender identification, and initial bid delivery. Both Parties acknowledge that government procurement cycles operate on their own timelines and early termination during the Minimum Term shall not relieve The Client of payment obligations for the full Minimum Term.`,
      },
      {
        id: "deliverables",
        title: "4. Deliverables",
        content: `The Company shall deliver the following during each calendar month of the Agreement (the "Monthly Deliverables"):

(a) Tender Pipeline Report: A structured report identifying active and forthcoming tender opportunities relevant to The Client's offer, including tender reference numbers, contracting authorities, estimated values, submission deadlines, and The Company's recommended pursuit strategy;

(b) Bid Submissions: Where The Client has authorised pursuit of a specific opportunity, preparation and coordination of the bid submission, including all written technical and commercial content, in accordance with the tender specification;

(c) Compliance Documentation: Preparation or review of all mandatory compliance documentation required for supplier registration, pre-qualification, or selection stages, as applicable to each opportunity;

(d) Monthly Progress Summary: A written summary of activities completed during the month, submissions made, outcomes received, and priorities for the following month.

All deliverables shall be provided in the formats specified by The Client or, absent such specification, in formats customary to the professional services sector. Final submission decisions remain the sole responsibility of The Client.`,
      },
      {
        id: "fees",
        title: "5. Fees",
        content: `${feeClause}

All fees are stated exclusive of Value Added Tax (VAT). Where applicable, VAT shall be charged at the prevailing rate and shown separately on all invoices.

The fees set out in Appendix B represent the full retainer for the Monthly Deliverables described in Clause 4. Out-of-scope work, including additional bid submissions beyond those agreed in Appendix A, shall be subject to separate written agreement.

The Company reserves the right to review and adjust the fee structure upon 60 days' written notice, such adjustment to take effect at the start of the next renewal period following notice.`,
      },
      {
        id: "payment_terms",
        title: "6. Payment Terms",
        content: `The Company shall issue an invoice to The Client on or before the 1st day of each calendar month, in respect of the retainer fee for that month.

Payment is due within fourteen (14) calendar days of the invoice date. Invoices shall be settled by bank transfer to the account details specified on the invoice.

In the event of late payment, The Company reserves the right to charge interest on overdue amounts at the rate of 8% per annum above the Bank of England base rate, pursuant to the Late Payment of Commercial Debts (Interest) Act 1998, accruing daily from the due date until the date of actual payment.

Where payment remains outstanding for more than 30 days after the due date, The Company may, at its discretion, suspend delivery of the Services until all outstanding amounts have been paid in full.`,
      },
      {
        id: "confidentiality",
        title: "7. Confidentiality",
        content: `Each Party agrees to treat as strictly confidential all information received from the other Party that is designated as confidential, or that ought reasonably to be regarded as confidential given the nature of the information and the circumstances of disclosure ("Confidential Information"), and not to use such information for any purpose other than performance of obligations under this Agreement.

Each Party shall restrict disclosure of Confidential Information to those of its employees, officers, agents, and sub-contractors who need to know it for the purposes of this Agreement, and shall ensure that such persons are bound by equivalent confidentiality obligations.

This obligation shall not apply to information that: (a) is or becomes publicly available other than through breach of this Agreement; (b) was already known to the receiving Party prior to disclosure; (c) is independently developed by the receiving Party without reference to the Confidential Information; or (d) is required to be disclosed by applicable law or court order, provided that the disclosing Party gives prior written notice to the other Party where permissible.

This confidentiality obligation shall survive termination of this Agreement for a period of two (2) years from the date of termination.`,
      },
      {
        id: "ip",
        title: "8. Intellectual Property",
        content: `All pre-existing intellectual property of each Party shall remain the exclusive property of that Party. Nothing in this Agreement transfers any ownership rights in either Party's pre-existing intellectual property.

All strategy documents, frameworks, methodologies, bid templates, and know-how developed by The Company in the course of providing the Services shall remain the exclusive property of The Company. The Client is granted a non-exclusive licence to use any such materials solely for the purposes of the bid opportunities for which they were specifically developed under this Agreement.

All client-specific deliverables — including completed bid responses, supplier registration forms, and compliance documentation prepared specifically for The Client — shall become the property of The Client upon full payment of all fees due at the time of delivery.

The Client grants The Company a limited, non-exclusive licence to use The Client's name, branding, and factual capability information solely as necessary to prepare and submit bid documentation under this Agreement.`,
      },
      {
        id: "liability",
        title: "9. Limitation of Liability",
        content: `The Company provides B2G procurement support services and shall use reasonable professional skill and care in delivering the Services. However, The Company gives no warranty or guarantee that any tender bid will be successful or that any government contract will be awarded to The Client.

Tender award decisions are made entirely at the discretion of the relevant contracting authority. The Company shall not be liable for any failure to win a tender, regardless of the quality of the bid prepared.

The total aggregate liability of The Company to The Client under or in connection with this Agreement, whether arising in contract, tort (including negligence), breach of statutory duty, or otherwise, shall not exceed the total fees paid by The Client to The Company in the twelve (12) months immediately preceding the event giving rise to the claim.

Neither Party shall be liable to the other for any indirect, special, or consequential losses, including but not limited to loss of anticipated business, loss of profit, loss of revenue, loss of reputation, or loss of contract.

Nothing in this Agreement limits or excludes liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited by English law.`,
      },
      {
        id: "termination",
        title: "10. Termination",
        content: `Either Party may terminate this Agreement after the expiry of the Minimum Term by giving not less than thirty (30) calendar days' written notice to the other Party. Notice must be given in writing by email to the primary contacts identified in Appendix D.

During the Minimum Term, this Agreement may only be terminated:
(a) By mutual written agreement of both Parties; or
(b) By either Party with immediate effect in the event of a material breach by the other Party that is incapable of remedy, or that remains unremedied for fourteen (14) days after written notice specifying the breach.

Upon termination for any reason: (i) The Client shall pay all fees accrued and invoiced up to the effective date of termination; (ii) The Company shall deliver all completed work product to The Client within 14 days; and (iii) each Party shall promptly return or destroy the other Party's Confidential Information.`,
      },
      {
        id: "governing_law",
        title: "11. Governing Law",
        content: `This Agreement and any dispute, controversy, or claim arising out of or in connection with it (including any non-contractual dispute or claim) shall be governed by and construed in accordance with the laws of England and Wales.

The Parties irrevocably submit to the exclusive jurisdiction of the courts of England and Wales to settle any dispute arising out of or in connection with this Agreement.

In the event of any dispute, the Parties agree to attempt resolution through good-faith senior management negotiation for a period of not less than 21 days before commencing formal legal proceedings. This obligation does not prevent either Party from seeking urgent injunctive or interim relief.`,
      },
    ],
    appendices: baseAppendices([
      { slot: "appendix_e", label: "Appendix E — Sector & CPV Code Schedule", required: false, status: "empty" },
    ]),
  };
}

// ─── Template 2: A.D.A.M. License Agreement ─────────────────────────────────

function adamTemplate(data: ContractClientData): ContractTemplate {
  const planLabel = data.packageName ? `the "${data.packageName}" plan` : "the selected subscription plan";
  const feeClause = data.monthlyFee
    ? `The License Fee for ${planLabel} is ${data.monthlyFee} per month (exclusive of VAT), as set out in the approved commercial proposal and detailed in Appendix B (Commercial Terms).`
    : `The License Fee for ${planLabel} is as set out in the approved commercial proposal and detailed in Appendix B (Commercial Terms).`;

  return {
    title: `A.D.A.M. License Agreement — ${data.clientCompany}`,
    sections: [
      {
        id: "parties",
        title: "1. Parties",
        content: partiesBlock(data, "A.D.A.M. System License Agreement", "The Company", "The Client"),
      },
      {
        id: "grant",
        title: "2. License Grant",
        content: `Subject to the terms and conditions of this Agreement and full payment of the License Fee, The Company grants The Client a limited, non-exclusive, non-transferable, revocable license (the "License") to access and use the A.D.A.M. (Automated Document & Account Manager) system and any associated modules, interfaces, and documentation (collectively, the "System") during the License Term.

The License is granted solely for The Client's internal business operations and shall not be extended to any third party without the express prior written consent of The Company, except as expressly permitted under Clause 4 (White-Label Rights).

The Client may not:
(a) Sublicense, resell, transfer, assign, or otherwise make the System available to any third party;
(b) Copy, modify, adapt, translate, reverse-engineer, decompile, disassemble, or create derivative works based on the System or any part thereof;
(c) Remove, alter, or obscure any proprietary notices, marks, or labels on the System;
(d) Use the System to provide bureau services, outsourcing, or time-sharing to third parties;
(e) Use the System in any way that violates applicable laws or regulations.`,
      },
      {
        id: "implementation",
        title: "3. Implementation Phase",
        content: `The Parties agree that the first thirty (30) calendar days following the commencement date of this Agreement shall constitute the "Implementation Phase".

During the Implementation Phase, The Company shall:
(a) Configure The Client's A.D.A.M. system environment and user accounts;
(b) Migrate or import any agreed initial data sets;
(c) Conduct a system orientation and onboarding session for The Client's designated users;
(d) Make the System available for testing and acceptance.

The License Fee billing shall commence on the first day of the calendar month following the conclusion of the Implementation Phase. No License Fee is charged during the Implementation Phase.

The Client shall provide reasonable cooperation and timely access to information, personnel, and systems required to complete the Implementation Phase. Delays caused by The Client's failure to cooperate may extend the Implementation Phase at The Company's discretion.`,
      },
      {
        id: "permitted_use",
        title: "4. Permitted Use",
        content: `The License granted under Clause 2 permits The Client to use the System exclusively for The Client's own internal business operations, including but not limited to: client lifecycle management, document management, contract administration, and internal workflow automation.

The Client shall not use the System to provide services to, or process the data of, any entity other than The Client, unless The Client has separately purchased a White-Label Plan as described in Clause 5.

The Client is responsible for ensuring that all persons using the System under The Client's account comply with the terms of this Agreement. The Client shall promptly notify The Company of any unauthorised use of the System or any suspected breach of this Agreement.

The number of user accounts, storage limits, and feature access rights are governed by the plan tier selected by The Client, as set out in Appendix B.`,
      },
      {
        id: "whitelabel",
        title: "5. White-Label Rights",
        content: `White-label rights — the right to rebrand, resell, or deploy the System to third-party clients under The Client's own brand — are not included in the standard License and are available only under a separately agreed White-Label Plan.

Where The Client has purchased a White-Label Plan (as confirmed in Appendix B), The Company grants The Client the additional right to rebrand the System interface with The Client's own branding and to make the System available to The Client's end-customers, subject to the following conditions:

(a) The Client shall not represent the System as The Client's own proprietary software to any regulatory body, investor, or lender;
(b) The Client shall ensure that all end-customers are bound by terms of use no less restrictive than those applicable to The Client under this Agreement;
(c) The Client shall be responsible for first-line support to its end-customers and shall not direct end-customer queries to The Company without prior agreement;
(d) The white-label right is co-terminous with this Agreement and ceases immediately upon termination.

Where no White-Label Plan has been purchased, any attempt to sublicense, resell, or deploy the System to third parties shall constitute a material breach of this Agreement.`,
      },
      {
        id: "term",
        title: "6. Term",
        content: `This Agreement shall commence on ${data.date} and shall continue for the subscription period selected by The Client at onboarding — either monthly or annual — as confirmed in Appendix B (the "License Term").

Monthly subscriptions: The License Term shall renew automatically each calendar month unless terminated in accordance with Clause 13.

Annual subscriptions: The License Term shall renew automatically for successive 12-month periods unless either Party gives written notice of non-renewal at least 30 days prior to the end of the then-current annual term.

The Client acknowledges that the A.D.A.M. system is provided as a live, continuously developed platform and that The Company may update, modify, or improve the System at any time during the License Term, subject to the obligations in Clause 11.`,
      },
      {
        id: "fees",
        title: "7. Fees",
        content: `${feeClause}

All fees are exclusive of Value Added Tax (VAT) or any equivalent applicable taxes, which shall be charged at the prevailing statutory rate and shown separately on all invoices.

Annual subscriptions paid upfront receive a discount of forty percent (40%) on the total annual fee, as set out in Appendix B.

All License Fees are non-refundable except where The Company fails to provide a material feature of the System for a continuous period exceeding 30 days due to circumstances within The Company's reasonable control, in which case a pro-rata credit shall be applied to future invoices.

The Company reserves the right to revise the License Fee at the time of each renewal by giving not less than 60 days' prior written notice to The Client. If The Client does not accept the revised fee, it may terminate this Agreement in accordance with Clause 13 before the revised fee takes effect.`,
      },
      {
        id: "payment_terms",
        title: "8. Payment Terms",
        content: `Monthly subscriptions: The Company shall issue an invoice on or before the 1st day of each calendar month, payable in advance. Payment is due within seven (7) calendar days of the invoice date.

Annual subscriptions: The Company shall issue an invoice for the full annual fee at the start of each License Term. Payment is due within fourteen (14) calendar days of the invoice date.

All payments shall be made by bank transfer to the account details specified on each invoice. Payments by any other method require prior written agreement.

In the event of non-payment within 14 days of the due date, The Company shall issue a written payment reminder. If payment is not received within a further 14 days of the reminder, The Company reserves the right to suspend access to the System without further notice until the outstanding balance is settled in full. Suspension of access shall not relieve The Client of any payment obligation.`,
      },
      {
        id: "data_processing",
        title: "9. Data Processing",
        content: `The Client retains full ownership of all data it uploads, creates, or stores within the System ("Client Data"). The Company processes Client Data solely as a data processor acting on The Client's documented instructions, in accordance with applicable data protection legislation including the UK General Data Protection Regulation ("UK GDPR") and the Data Protection Act 2018.

Client Data is stored on Supabase infrastructure hosted in the EU-West region (Dublin, Ireland). The Company shall not transfer Client Data outside the European Economic Area without The Client's prior written consent, except where required by applicable law.

The Company implements appropriate technical and organisational security measures to protect Client Data against unauthorised access, disclosure, alteration, or destruction, including encryption in transit and at rest, access controls, and regular security assessments.

The Company shall notify The Client without undue delay, and in any event within 72 hours of becoming aware, of any personal data breach affecting Client Data.

A full Data Processing Agreement ("DPA"), compliant with Article 28 UK GDPR, is provided as Appendix E and forms an integral part of this Agreement.`,
      },
      {
        id: "support",
        title: "10. Support",
        content: `The Company shall provide technical and operational support in respect of the System as follows:

(a) Email support: The Client may direct support queries to ${COMPANY_EMAIL}. The Company shall acknowledge support requests within forty-eight (48) business hours of receipt and provide a substantive response or resolution timeline within five (5) business days.

(b) Priority support: Where The Client has subscribed to a plan tier that includes priority support (as specified in Appendix B), response times shall be as set out in Appendix C (Service Level Agreement).

(c) Support scope: Support covers access issues, system functionality queries, configuration guidance, and bug reporting. It does not include data entry, content creation, or training beyond the initial onboarding session.

(d) Scheduled maintenance: The Company shall use reasonable efforts to schedule planned maintenance outside of business hours (09:00–18:00 GMT, Monday to Friday) and shall give at least 48 hours' prior notice where planned downtime is expected to exceed 2 hours.

The Company shall use commercially reasonable efforts to ensure the System is available 99.5% of the time in any given calendar month, excluding scheduled maintenance windows.`,
      },
      {
        id: "updates",
        title: "11. Updates and Development",
        content: `System updates, improvements, and new features developed by The Company are included in the License Fee and shall be made available to The Client as part of its active subscription, unless a specific update constitutes a separately licensed module or plan tier.

The Company retains full discretion over the development roadmap, feature prioritisation, and release schedule of the System. The Company does not guarantee the availability of any specific future feature or the implementation of any feature request submitted by The Client.

The Company shall provide reasonable advance notice of any update that materially affects existing workflows or requires action by The Client. Where an update introduces a breaking change, The Company shall provide a migration guide and a minimum of 14 days for The Client to adapt its processes.

The Company shall maintain the System in a commercially reasonable state of repair and shall promptly address confirmed bugs that materially impair The Client's use of the System.`,
      },
      {
        id: "confidentiality",
        title: "12. Confidentiality",
        content: `The System, including its architecture, algorithms, business logic, source code, user interface design, integration methods, and all associated documentation and know-how, constitutes the proprietary and confidential information of The Company ("System Confidential Information").

The Client agrees to keep all System Confidential Information strictly confidential and not to disclose it to any third party or use it for any purpose other than as permitted under this Agreement.

The Client shall restrict access to System Confidential Information to those of its employees and contractors who have a genuine need to know it for the purposes of this Agreement, and shall ensure such persons are bound by confidentiality obligations no less protective than those set out herein.

This obligation shall survive termination of this Agreement for a period of three (3) years.`,
      },
      {
        id: "termination",
        title: "13. Termination",
        content: `Either Party may terminate this Agreement by giving not less than thirty (30) calendar days' written notice to the other Party, with effect from the end of the then-current billing period.

Either Party may terminate this Agreement with immediate effect by written notice if:
(a) The other Party commits a material breach and fails to remedy it within fourteen (14) days of receiving written notice specifying the breach in reasonable detail;
(b) The other Party becomes insolvent, enters administration, liquidation, or any analogous process, or makes a general assignment for the benefit of its creditors;
(c) The Client uses the System in a manner that violates applicable law or infringes third-party rights.

Upon termination, The Company shall:
(i) Continue to make Client Data accessible for a period of fourteen (14) calendar days following the effective date of termination, during which The Client may export its data;
(ii) Permanently delete all Client Data from The Company's systems at the end of the 14-day export window, unless earlier deletion is requested by The Client;
(iii) Provide The Client with written confirmation of deletion upon request.

The Client's access to the System shall be revoked at the effective date of termination.`,
      },
      {
        id: "liability",
        title: "14. Limitation of Liability",
        content: `The System is provided on an "as-is" basis. While The Company uses reasonable care and skill in developing and maintaining the System, it does not warrant that the System will be error-free, uninterrupted, or fit for any particular purpose beyond its documented functionality.

The Company gives no warranty or guarantee as to business outcomes, revenue generation, efficiency gains, or any other commercial result arising from The Client's use of the System.

The total aggregate liability of The Company to The Client under or in connection with this Agreement, whether in contract, tort, breach of statutory duty, or otherwise, shall not exceed the total License Fees paid by The Client in the twelve (12) months immediately preceding the event giving rise to the claim.

Neither Party shall be liable to the other for any indirect, incidental, special, or consequential losses, including loss of profit, loss of revenue, loss of business, loss of anticipated savings, or loss of goodwill.

Nothing in this Agreement excludes or limits liability for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation, or any other liability that cannot be excluded by English law.`,
      },
      {
        id: "governing_law",
        title: "15. Governing Law",
        content: `This Agreement and any dispute, controversy, or claim arising out of or in connection with it (including any non-contractual dispute or claim) shall be governed by and construed in accordance with the laws of England and Wales.

The Parties irrevocably submit to the exclusive jurisdiction of the courts of England and Wales to settle any dispute arising under or in connection with this Agreement.

In the event of any dispute, the Parties agree to use reasonable endeavours to resolve the matter through good-faith senior management negotiations for a period of 21 days before commencing formal legal or arbitration proceedings.`,
      },
    ],
    appendices: baseAppendices([
      { slot: "appendix_e", label: "Appendix E — Data Processing Agreement (DPA)", required: true,  status: "empty" },
    ]),
  };
}

// ─── Template 3: End-to-End Service Agreement ───────────────────────────────

function endToEndTemplate(data: ContractClientData): ContractTemplate {
  const feeClause = data.monthlyFee
    ? `The monthly retainer for the engagement is ${data.monthlyFee} (exclusive of VAT), as set out in the approved proposal and detailed in Appendix B (Commercial Terms).`
    : `The fees for the engagement are as set out in the approved proposal and detailed in Appendix B (Commercial Terms).`;

  return {
    title: `End-to-End Business Development Agreement — ${data.clientCompany}`,
    sections: [
      {
        id: "parties",
        title: "1. Parties",
        content: partiesBlock(data, "End-to-End Business Development Agreement", "The Company", "The Client"),
      },
      {
        id: "scope",
        title: "2. Scope of Engagement",
        content: `The Company agrees to provide a comprehensive end-to-end business development engagement (the "Engagement") encompassing the following core service areas:

(a) Strategic Architecture: Full analysis of The Client's current market position, competitive landscape, and growth potential; development of a bespoke business development strategy aligned with The Client's stated objectives and approved as part of the Proposal;

(b) Operational Implementation: Active delivery and management of the agreed growth strategy, including pipeline development, partner identification, lead generation, and conversion support across The Client's target markets;

(c) Systems and Process Design: Where agreed, deployment and configuration of the A.D.A.M. system and supporting operational workflows to embed the strategy into The Client's day-to-day operations;

(d) Ongoing Account Management: Dedicated relationship management, progress tracking, and iterative refinement of the strategy in response to market feedback and milestone reviews.

The Engagement is designed to produce measurable, sustainable improvements in The Client's business development capacity. The Company shall act as a strategic partner to The Client throughout the Engagement Term.`,
      },
      {
        id: "custom_scope",
        title: "3. Custom Scope and Deliverables",
        content: `The specific deliverables, phase structure, milestones, success metrics, and any sector-specific or market-specific workstreams applicable to The Client's Engagement are set out in Appendix A (Scope of Work), which has been agreed by both Parties and forms an integral part of this Agreement.

Appendix A is derived directly from the approved Proposal and reflects the specific objectives, constraints, and commercial context presented by The Client during the pre-engagement assessment process.

Where The Client requests additional workstreams or deliverables not described in Appendix A, such additions shall be subject to a separate Change Order, signed in writing by both Parties, specifying the scope, timeline, and commercial terms of the additional work before it commences.

Both Parties acknowledge that the Engagement is iterative in nature. Priorities and delivery sequencing may be adjusted at monthly review meetings by mutual written agreement, provided that the overall scope and commercial terms remain as agreed.`,
      },
      {
        id: "term",
        title: "4. Term",
        content: `This Agreement shall commence on ${data.date} and shall continue for a minimum initial term of three (3) calendar months (the "Minimum Term"). The Minimum Term reflects the lead time required for strategic design, implementation, and initial market validation phases to yield meaningful results.

Following the expiry of the Minimum Term, this Agreement shall continue for the programme term specified in Appendix B and shall renew on a rolling monthly basis thereafter unless terminated in accordance with Clause 14.

The Engagement is structured in phases as set out in Appendix A. Phase transitions and milestone completion shall be documented in written Monthly Progress Reports.

Early termination during the Minimum Term by The Client (other than due to an unremedied material breach by The Company) shall require payment of all fees accrued to date plus a termination fee equivalent to the remaining months of the Minimum Term, reflecting the strategic planning and resource commitment made by The Company at the outset.`,
      },
      {
        id: "strategic_reviews",
        title: "5. Strategic Reviews",
        content: `The Company shall conduct the following structured review process throughout the Engagement:

(a) Monthly Review Calls: A standing scheduled call or meeting (in person or via video conference) to review the previous month's deliverables, pipeline status, and KPIs; agree priorities for the following month; and address any issues or strategic adjustments required. Monthly review notes shall be circulated by The Company within 5 business days of each meeting;

(b) Quarterly Business Reviews ("QBR"): A comprehensive formal review held every three (3) months, covering: cumulative performance against strategic objectives; market conditions and intelligence updates; strategic plan refinement; resource and capacity review; and forward planning for the next quarter.

Both Parties commit to attending monthly and quarterly reviews through suitably senior representatives with decision-making authority. The Client shall appoint a primary contact, identified in Appendix D, who shall be responsible for timely approvals and information required to deliver the Engagement.

All review outputs shall be documented in writing and retained by both Parties as part of the engagement record.`,
      },
      {
        id: "fees",
        title: "6. Fees",
        content: `${feeClause}

All fees are exclusive of Value Added Tax (VAT) and any other applicable taxes, which shall be charged at the prevailing statutory rate and shown separately on all invoices.

The fees reflect the full commercial commitment required to deliver the Engagement and associated strategic oversight. They do not include third-party costs such as market research subscriptions, event fees, advertising spend, or other agreed out-of-pocket expenses, which shall be invoiced separately with supporting receipts.

The Company reserves the right to adjust the fee upon renewal beyond the initial programme term by giving not less than 60 days' prior written notice. If The Client does not accept the revised fee, it may terminate this Agreement in accordance with Clause 14, effective from the end of the then-current billing period.`,
      },
      {
        id: "payment_structure",
        title: "7. Payment Structure",
        content: `The commercial structure for this Engagement is as follows:

(a) Upfront Payment: Fifty percent (50%) of the total Minimum Term fee is due upon execution of this Agreement (the "Commencement Payment"). The Commencement Payment confirms The Client's commitment to the Engagement and enables The Company to allocate dedicated resources and begin Phase 1 activities;

(b) Phase 1 Completion Payment: The remaining fifty percent (50%) of the Minimum Term fee is due upon written confirmation by The Client that Phase 1 deliverables have been completed, or within 30 days of Phase 1 completion notification from The Company, whichever is earlier.

The Commencement Payment shall be invoiced upon signing of this Agreement and is due within seven (7) calendar days. This Agreement shall not be treated as binding on The Company until the Commencement Payment has been received in cleared funds.`,
      },
      {
        id: "milestone_payments",
        title: "8. Milestone Payments",
        content: `Following the Minimum Term, fees for subsequent phases of the Engagement shall be invoiced on a milestone basis as defined in Appendix B (Commercial Terms) and Appendix A (Scope of Work).

Each milestone invoice shall be issued by The Company upon completion of the relevant milestone deliverable, with supporting documentation evidencing completion. The Client shall confirm acceptance or raise any substantive objections within ten (10) business days of receipt of the milestone invoice and supporting documentation.

Where The Client raises no substantive objection within the 10-day review period, the milestone shall be deemed accepted and payment shall be due within fourteen (14) calendar days of the invoice date.

Where The Client disputes completion of a milestone, the Parties shall resolve the dispute in good faith within a further ten (10) business days before either Party may escalate. Disputes that cannot be resolved at operational level shall be escalated to senior management of both Parties.`,
      },
      {
        id: "confidentiality",
        title: "9. Confidentiality",
        content: `Each Party acknowledges that in the course of this Engagement it will receive highly sensitive Confidential Information of the other Party, including but not limited to strategic plans, commercial terms, market intelligence, technical know-how, client and partner relationships, financial data, and operational systems.

Both Parties agree to:
(a) Keep all Confidential Information strictly confidential and not disclose it to any third party without the prior written consent of the disclosing Party;
(b) Use Confidential Information only for the purposes of this Agreement;
(c) Implement reasonable security measures to protect Confidential Information against unauthorised access or disclosure;
(d) Promptly notify the disclosing Party upon becoming aware of any unauthorised use or disclosure of Confidential Information.

This obligation shall survive termination of this Agreement for a period of three (3) years.

The standard exceptions to confidentiality apply: information that is publicly known other than through breach of this Agreement; information already lawfully known to the receiving Party; information independently developed; or information required by law to be disclosed.`,
      },
      {
        id: "non_disclosure",
        title: "10. Non-Disclosure of Methodology",
        content: `The Client acknowledges that the business development frameworks, strategic methodologies, market entry playbooks, systems architecture, and operational processes developed and deployed by The Company constitute proprietary intellectual property of significant commercial value to The Company.

The Client agrees that it shall not, during the Engagement or at any time thereafter:
(a) Disclose, share, or describe The Company's strategic frameworks, methodologies, or systems — in whole or in part — to any competitor of The Company, any third-party service provider in the same or similar field, or any other party without the prior written consent of The Company;
(b) Engage, hire, or instruct any person or entity to replicate, reverse-engineer, or reconstruct The Company's methodologies based on knowledge acquired through this Engagement;
(c) Publish, present, or promote any account of The Company's proprietary methods that could be identified as originating from this Engagement, without The Company's prior written approval.

This obligation shall survive the termination of this Agreement indefinitely with respect to information that constitutes trade secrets, and for a period of three (3) years with respect to all other proprietary information.`,
      },
      {
        id: "ip",
        title: "11. Intellectual Property",
        content: `The Company retains all right, title, and interest in its pre-existing intellectual property and in all strategic frameworks, methodologies, tools, templates, systems, and processes used in the delivery of the Engagement.

Upon full payment of all fees due under this Agreement, The Company assigns to The Client all right, title, and interest in the following client-specific deliverables:
(a) Market research reports and sector analyses prepared exclusively for The Client;
(b) Bespoke strategic plans, go-to-market strategies, and growth roadmaps;
(c) Sales materials, pitch decks, and communication assets created specifically for The Client;
(d) Process maps and operational documentation developed specifically for The Client's business.

General frameworks, methodologies, templates, and know-how used in producing the above deliverables do not form part of the assignment and remain the exclusive property of The Company.

The Client grants The Company a non-exclusive licence to use The Client's name, logo, and factual business information for the purposes of delivering the Engagement. The Company may reference The Client as a client in its portfolio and marketing materials unless The Client provides written objection within 30 days of the commencement of this Agreement.`,
      },
      {
        id: "deliverables_ownership",
        title: "12. Deliverables Ownership",
        content: `All client-specific documents, strategies, plans, reports, and materials produced by The Company under this Agreement and listed as deliverables in Appendix A shall be delivered to The Client in agreed formats upon completion of the relevant phase, subject to full payment of all fees due at the time of delivery.

Delivery of completed deliverables shall be conditional upon The Client's account being current and no invoices being overdue at the time of delivery. Where outstanding fees are disputed in good faith, The Company shall not withhold non-disputed deliverables.

The Client shall be entitled to use, adapt, and build upon the deliverables for The Client's own internal business purposes. The Client shall not resell, licence, or commercially exploit the deliverables to third parties without The Company's prior written consent.

Where The Client has not paid all outstanding fees within 60 days of the relevant due date, The Company reserves the right to revoke the assignment of intellectual property in the unpaid deliverables until payment is received.`,
      },
      {
        id: "exclusivity",
        title: "13. Exclusivity",
        content: `Upon written request by The Client and subject to The Company's written confirmation, The Company may agree to refrain from engaging as a primary business development partner for a direct competitor of The Client within The Client's primary target market, for the duration of the active Engagement.

"Direct competitor" means a business that: (i) operates in the same primary sector as The Client; (ii) targets the same geographic market; and (iii) offers substantially similar products or services to the same customer segment. The scope of any exclusivity commitment shall be agreed in writing by the Parties and appended to Appendix A before taking effect.

Exclusivity does not prevent The Company from: (a) providing the A.D.A.M. license to any entity; (b) engaging with businesses in overlapping but non-directly competing sectors; or (c) delivering B2G tender support or other non-competing services to any entity.

The Client acknowledges that The Company serves multiple clients and that the nature of its services is broadly applicable across industries. This clause does not create an implied exclusivity arrangement beyond what is expressly agreed in writing.`,
      },
      {
        id: "liability",
        title: "14. Limitation of Liability",
        content: `The Company provides strategic advisory and business development services and shall use reasonable professional skill and care in delivering the Engagement. However, The Company gives no warranty, guarantee, or representation as to specific business outcomes, revenue targets, client acquisition volumes, market penetration levels, or any other commercial results.

Business outcomes are dependent on numerous factors outside The Company's control, including market conditions, The Client's operational capacity, pricing decisions, competitive activity, and economic circumstances. The Client's success depends in part on its own execution of the agreed strategy.

The total aggregate liability of The Company to The Client under or in connection with this Agreement, whether arising in contract, tort, breach of statutory duty, or otherwise, shall not exceed the total fees paid by The Client to The Company in the twelve (12) months immediately preceding the event giving rise to the claim.

Neither Party shall be liable for any indirect, incidental, special, or consequential losses, including loss of anticipated revenue, loss of profit, loss of business opportunity, loss of goodwill, or loss of reputation.

Nothing in this Agreement limits liability for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation, or any other liability that cannot be excluded or limited by English law.`,
      },
      {
        id: "termination",
        title: "15. Termination",
        content: `Either Party may terminate this Agreement after the expiry of the Minimum Term by giving not less than thirty (30) calendar days' written notice to the other Party. Written notice must be delivered to the primary contacts identified in Appendix D.

During the Minimum Term, termination by The Client (other than due to an unremedied material breach by The Company) shall require payment of: (i) all fees accrued to the date of termination; and (ii) a termination fee equal to the monthly retainer multiplied by the remaining months of the Minimum Term.

Either Party may terminate this Agreement with immediate effect upon written notice if the other Party:
(a) Commits a material breach that is incapable of remedy;
(b) Fails to remedy a material breach within fourteen (14) days of written notice specifying the breach;
(c) Becomes insolvent, enters administration or receivership, or makes a general assignment for the benefit of creditors.

Upon termination for any reason: (i) The Company shall complete and deliver all work product at the stage reached as at the termination date, subject to payment of fees accrued to that date; (ii) each Party shall promptly return or securely destroy the other Party's Confidential Information; and (iii) all licences granted under this Agreement shall cease.`,
      },
      {
        id: "governing_law",
        title: "16. Governing Law",
        content: `This Agreement and any dispute, controversy, or claim arising out of or in connection with it (including any non-contractual dispute or claim) shall be governed by and construed in accordance with the laws of England and Wales.

The Parties irrevocably submit to the exclusive jurisdiction of the courts of England and Wales to settle any dispute arising out of or in connection with this Agreement.

The Parties agree that in the event of any dispute they shall first attempt to resolve the matter through good-faith negotiations between senior representatives of both Parties for a period of not less than 21 calendar days before commencing formal legal proceedings. Nothing in this clause prevents either Party from seeking urgent injunctive or other interim relief from the courts.`,
      },
    ],
    appendices: baseAppendices([
      { slot: "appendix_e", label: "Appendix E — Target Market & Competitor Scope Definition", required: false, status: "empty" },
    ]),
  };
}
