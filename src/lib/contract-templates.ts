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

const COMPANY       = "Andy'K Group International LTD";
const COMPANY_REG   = "16453500";
const COMPANY_ADDR  = "86-90 Paul Street, London, EC2A 4NE, United Kingdom";
const COMPANY_EMAIL = "info@andykgroup.com";

function baseAppendices(extras: ContractAppendix[] = []): ContractAppendix[] {
  return [
    { slot: "appendix_a", label: "Appendix A — Scope of Work",           required: true,  status: "empty" },
    { slot: "appendix_b", label: "Appendix B — Commercial Terms",        required: true,  status: "empty" },
    { slot: "appendix_c", label: "Appendix C — Service Level Agreement", required: false, status: "empty" },
    { slot: "appendix_d", label: "Appendix D — Primary Contact Person",  required: true,  status: "empty" },
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

// ─── Shared helpers ──────────────────────────────────────────────────────────

function partiesBlock(
  data: ContractClientData,
  agreementType: string,
  companyRole: string,
  clientRole: string
): string {
  const ref = data.clientRef ? `${data.clientRef}-CONT-001` : "—";
  return `This ${agreementType} ("Agreement") is entered into as of ${data.date} between:

${COMPANY} (Company Registration No. ${COMPANY_REG}), ${COMPANY_ADDR} (hereinafter referred to as "${companyRole}"); and

${data.clientCompany}${data.clientAddress ? `\n${data.clientAddress}` : ""}${data.clientRef ? `\nClient ID: ${data.clientRef}` : ""}
(hereinafter referred to as "${clientRole}").

Agreement Reference: ${ref}

Collectively referred to as the "Parties".`;
}

// ─── Shared mandatory clause builders ────────────────────────────────────────

function clientResponsibilitiesClause(num: number): ContractSection {
  return {
    id: "client_responsibilities",
    title: `${num}. Client Responsibilities`,
    content: `The Client acknowledges that the successful delivery of the Services depends materially on The Client's active co-operation and timely fulfilment of the following obligations:

(a) Accurate Information: The Client shall provide ${COMPANY} with accurate, complete, and up-to-date information about its business, operations, objectives, and constraints as reasonably required for the performance of the Services. The Client warrants that all information provided is true and not materially misleading;

(b) Onboarding Cooperation: The Client shall actively participate in all onboarding sessions, discovery calls, and strategy meetings as scheduled, and shall ensure that appropriately senior and knowledgeable personnel attend;

(c) Document Provision: The Client shall supply all documents, data, materials, and access credentials requested by ${COMPANY} within reasonable timelines agreed between the Parties. Unreasonable delays in providing required materials shall constitute grounds for an extension of project timelines under Clause ${num + 1} of this Agreement;

(d) Operational Access: Where the Services require access to The Client's internal systems, premises, staff, or processes, The Client shall grant such access promptly and shall obtain any internal approvals required to do so;

(e) Timely Responses: The Client shall respond to queries, review requests, and approval requests from ${COMPANY} within five (5) business days, or as otherwise agreed. Delayed responses that materially impact the delivery of the Services shall be treated as client-side implementation delays under Clause ${num + 1};

(f) Authorised Decision-Maker: The Client shall ensure that the primary contact identified in Appendix D has sufficient authority to give instructions, approve deliverables, and make operational decisions on The Client's behalf without undue escalation delay.

${COMPANY} shall not be held responsible for delays, cost overruns, or failure to achieve outcomes where such failures are attributable to The Client's breach of its obligations under this Clause.`,
  };
}

function implementationDelaysClause(num: number): ContractSection {
  return {
    id: "implementation_delays",
    title: `${num}. Implementation Delays`,
    content: `Project timelines, delivery schedules, and milestone dates set out in Appendix A are contingent upon The Client fulfilling its obligations under the Client Responsibilities Clause of this Agreement. Where implementation is delayed due to circumstances attributable to The Client, timelines shall automatically extend on a day-for-day basis for each day of client-side delay.

Client-side delays include but are not limited to:

(a) Failure to provide required approvals, sign-offs, or authorisations within agreed timelines;
(b) Failure to supply requested documentation, materials, data, or access credentials by the agreed date;
(c) Lack of availability of key personnel for scheduled sessions or review meetings;
(d) Delayed or absent communication in response to time-sensitive queries or decision points;
(e) Outstanding overdue invoices that have not been settled, where ${COMPANY} has exercised its right to suspend services under the Payment Terms Clause of this Agreement;
(f) Changes in The Client's internal structure, personnel, or strategy that necessitate a restart or material revision of agreed deliverables.

Where a client-side delay extends beyond twenty-one (21) calendar days, ${COMPANY} reserves the right to:
(i) Formally notify The Client in writing of the delay and its impact on the project timeline;
(ii) Revise the delivery schedule unilaterally to reflect the adjusted timeline;
(iii) Charge a re-engagement fee if The Client wishes to resume a project that has been paused for 30 or more days due to client-side inaction.

${COMPANY} shall promptly notify The Client upon becoming aware of any delay attributable to The Client and shall use reasonable endeavours to minimise the impact of such delays on overall delivery.`,
  };
}

function limitedLiabilityClientDecisionsClause(num: number): ContractSection {
  return {
    id: "limitation_of_liability",
    title: `${num}. Limitation of Liability`,
    content: `${COMPANY} provides strategic advisory, implementation, and technology services and shall deploy reasonable professional skill and care in all service delivery. However, The Client acknowledges and agrees to the following limitations:

(a) Advisory Nature of Services: All strategies, plans, frameworks, recommendations, and analysis provided by ${COMPANY} are advisory in nature. Final business decisions — including but not limited to strategic direction, investment decisions, hiring, pricing, market entry, partnership agreements, and commercial commitments — remain exclusively The Client's responsibility. ${COMPANY} does not make such decisions on behalf of The Client;

(b) No Guarantee of Outcomes: ${COMPANY} gives no warranty, representation, or guarantee of specific business outcomes, including but not limited to: revenue growth targets, procurement success, tender wins, investment returns, market expansion outcomes, funding rounds, customer acquisition volumes, or any other commercial performance metric. Business results depend on multiple factors outside ${COMPANY}'s control including market conditions, competitive dynamics, execution quality, and economic circumstances;

(c) Aggregate Liability Cap: The total aggregate liability of ${COMPANY} to The Client under or in connection with this Agreement — whether in contract, tort (including negligence), breach of statutory duty, or otherwise — shall not exceed the total fees paid by The Client in the twelve (12) months immediately preceding the event giving rise to the claim;

(d) Exclusion of Consequential Loss: Neither Party shall be liable to the other for any indirect, incidental, special, or consequential losses, including but not limited to: loss of anticipated revenue, loss of profit, loss of business opportunity, loss of goodwill, or loss of reputation;

(e) Statutory Exceptions: Nothing in this Agreement limits or excludes either Party's liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be lawfully excluded or limited under English law.`,
  };
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

The specific scope, target sectors, geographic focus, and deliverable standards are defined in detail in Appendix A (Scope of Work), which forms an integral part of this Agreement. Any material change to scope must be agreed in writing by both Parties prior to implementation.`,
      },
      {
        id: "term",
        title: "3. Term",
        content: `This Agreement shall commence on ${data.date} and continue for a minimum initial term of three (3) calendar months (the "Minimum Term").

Following the expiry of the Minimum Term, this Agreement shall automatically renew on a rolling monthly basis unless terminated in accordance with Clause 13.

The minimum term is required to allow sufficient time for pipeline development, tender identification, and initial bid delivery. Both Parties acknowledge that government procurement cycles operate on their own timelines and early termination during the Minimum Term shall not relieve The Client of payment obligations for the full Minimum Term.`,
      },
      {
        id: "deliverables",
        title: "4. Deliverables",
        content: `The Company shall deliver the following during each calendar month of the Agreement (the "Monthly Deliverables"):

(a) Tender Pipeline Report: A structured report identifying active and forthcoming tender opportunities relevant to The Client's offer, including tender reference numbers, contracting authorities, estimated values, submission deadlines, and recommended pursuit strategy;

(b) Bid Submissions: Where The Client has authorised pursuit of a specific opportunity, preparation and coordination of the bid submission in accordance with the tender specification;

(c) Compliance Documentation: Preparation or review of all mandatory compliance documentation required for supplier registration, pre-qualification, or selection stages;

(d) Monthly Progress Summary: A written summary of activities completed, submissions made, outcomes received, and priorities for the following month.

All deliverables shall be provided in the formats specified by The Client or, absent such specification, in formats customary to professional services. Final submission decisions remain the sole responsibility of The Client.`,
      },
      clientResponsibilitiesClause(5),
      {
        id: "fees",
        title: "6. Fees",
        content: `${feeClause}

All fees are stated exclusive of Value Added Tax (VAT). Where applicable, VAT shall be charged at the prevailing rate and shown separately on all invoices.

The fees set out in Appendix B represent the full retainer for the Monthly Deliverables described in Clause 4. Out-of-scope work, including additional bid submissions beyond those agreed in Appendix A, shall be subject to separate written agreement.

The Company reserves the right to review and adjust the fee structure upon 60 days' written notice, such adjustment to take effect at the start of the next renewal period following notice.`,
      },
      {
        id: "payment_terms",
        title: "7. Payment Terms",
        content: `The Company shall issue an invoice to The Client on or before the 1st day of each calendar month in respect of the retainer fee for that month.

Payment is due within fourteen (14) calendar days of the invoice date. Invoices shall be settled by bank transfer to the account details specified on each invoice.

In the event of late payment, The Company reserves the right to charge interest on overdue amounts at the rate of 8% per annum above the Bank of England base rate, pursuant to the Late Payment of Commercial Debts (Interest) Act 1998, accruing daily from the due date until the date of actual payment.

Where payment remains outstanding for more than 30 days after the due date, The Company may, at its discretion, suspend delivery of the Services until all outstanding amounts have been paid in full.`,
      },
      implementationDelaysClause(8),
      {
        id: "confidentiality",
        title: "9. Confidentiality",
        content: `Each Party agrees to treat as strictly confidential all information received from the other Party that is designated as confidential or that ought reasonably to be regarded as confidential given the nature of the information and the circumstances of disclosure ("Confidential Information"), and not to use such information for any purpose other than performance of obligations under this Agreement.

Each Party shall restrict disclosure of Confidential Information to those of its employees, officers, agents, and sub-contractors who need to know it for the purposes of this Agreement, and shall ensure that such persons are bound by equivalent confidentiality obligations.

This obligation shall not apply to information that: (a) is or becomes publicly available other than through breach of this Agreement; (b) was already known to the receiving Party; (c) is independently developed by the receiving Party; or (d) is required to be disclosed by applicable law or court order.

This confidentiality obligation shall survive termination of this Agreement for a period of two (2) years from the date of termination.`,
      },
      {
        id: "ip",
        title: "10. Intellectual Property",
        content: `All pre-existing intellectual property of each Party shall remain the exclusive property of that Party. Nothing in this Agreement transfers any ownership rights in either Party's pre-existing intellectual property.

All strategy documents, frameworks, methodologies, bid templates, and know-how developed by The Company in the course of providing the Services shall remain the exclusive property of The Company. The Client is granted a non-exclusive licence to use any such materials solely for the purposes of the bid opportunities for which they were specifically developed under this Agreement.

All client-specific deliverables — including completed bid responses, supplier registration forms, and compliance documentation prepared specifically for The Client — shall become the property of The Client upon full payment of all fees due at the time of delivery.`,
      },
      {
        id: "non_circumvention",
        title: "11. Non-Circumvention",
        content: `The Client acknowledges that in the course of the Engagement, The Company may introduce The Client to contractors, sub-contractors, government contacts, procurement advisors, consortium partners, or other third-party relationships (collectively, "Introduced Parties") in order to deliver the Services.

The Client agrees that it shall not, without The Company's prior written consent:

(a) Directly engage, contract with, or enter into any commercial arrangement with any Introduced Party in relation to services substantially similar to those provided under this Agreement, bypassing The Company as the facilitating or managing party, during the term of this Agreement and for a period of twelve (12) months following its termination;

(b) Circumvent The Company in relation to any partnership, consortium, framework agreement, or procurement opportunity that was introduced or facilitated by The Company under this Agreement;

(c) Encourage, induce, or facilitate any Introduced Party to provide services directly to The Client in a manner that bypasses The Company's involvement, where that involvement was integral to the introduction.

Where The Client wishes to engage directly with an Introduced Party in a manner that would otherwise be restricted under this Clause, The Client shall notify The Company in writing. The Company shall not unreasonably withhold consent and shall respond within ten (10) business days. Where direct engagement is agreed, a referral or facilitation fee may be agreed between the Parties in writing.

This Clause shall not apply to Introduced Parties with whom The Client had a pre-existing direct commercial relationship prior to this Agreement, provided The Client can demonstrate such relationship in writing.`,
      },
      limitedLiabilityClientDecisionsClause(12),
      {
        id: "termination",
        title: "13. Termination",
        content: `Either Party may terminate this Agreement after the expiry of the Minimum Term by giving not less than thirty (30) calendar days' written notice to the other Party. Notice must be given in writing by email to the primary contacts identified in Appendix D.

During the Minimum Term, this Agreement may only be terminated: (a) by mutual written agreement; or (b) by either Party with immediate effect upon a material breach that is incapable of remedy or remains unremedied for fourteen (14) days after written notice.

Upon termination: (i) The Client shall pay all fees accrued and invoiced up to the effective date of termination; (ii) The Company shall deliver all completed work product to The Client within 14 days; and (iii) each Party shall promptly return or destroy the other Party's Confidential Information.`,
      },
      {
        id: "governing_law",
        title: "14. Governing Law",
        content: `This Agreement and any dispute or claim arising out of or in connection with it shall be governed by and construed in accordance with the laws of England and Wales.

The Parties irrevocably submit to the exclusive jurisdiction of the courts of England and Wales.

In the event of any dispute, the Parties shall attempt resolution through good-faith senior management negotiation for a period of not less than 21 days before commencing formal legal proceedings. This obligation does not prevent either Party from seeking urgent injunctive or interim relief.`,
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
        content: `Subject to the terms of this Agreement and full payment of the License Fee, The Company grants The Client a limited, non-exclusive, non-transferable, revocable license (the "License") to access and use the A.D.A.M. (Automated Document & Account Manager) system and associated modules, interfaces, and documentation (collectively, the "System") during the License Term.

The License is granted solely for The Client's internal business operations and shall not be extended to any third party without The Company's express prior written consent, except as expressly permitted under Clause 5 (White-Label Rights).

The Client may not:
(a) Sublicense, resell, transfer, assign, or otherwise make the System available to any third party;
(b) Copy, modify, adapt, translate, reverse-engineer, decompile, or create derivative works based on the System;
(c) Remove, alter, or obscure any proprietary notices or labels on the System;
(d) Use the System to provide bureau services, outsourcing, or time-sharing to third parties;
(e) Use the System in any way that violates applicable laws or regulations.`,
      },
      {
        id: "implementation",
        title: "3. Implementation Phase",
        content: `The first thirty (30) calendar days following the commencement date constitute the "Implementation Phase". During this period, The Company shall:

(a) Configure The Client's A.D.A.M. system environment and user accounts;
(b) Migrate or import any agreed initial data sets;
(c) Conduct a system orientation and onboarding session for The Client's designated users;
(d) Make the System available for testing and acceptance.

The License Fee billing shall commence on the first day of the calendar month following the conclusion of the Implementation Phase. No License Fee is charged during the Implementation Phase.

The Client shall provide reasonable cooperation and timely access to information, personnel, and systems required to complete the Implementation Phase. Delays caused by The Client's failure to cooperate shall extend the Implementation Phase accordingly and do not create any financial liability for The Company.`,
      },
      {
        id: "internal_access",
        title: "4. Internal Access and Data Handling",
        content: `In order to configure, implement, support, optimise, and maintain the System for The Client's operational use, The Company may require access to certain operational data, business workflows, document structures, and related information belonging to The Client (collectively, "Operational Information").

The Client expressly authorises The Company to:
(a) Review, analyse, and process Operational Information for the sole purpose of configuring and implementing the System for The Client's use;
(b) Temporarily access The Client's account environment and configuration settings during support, maintenance, and implementation activities;
(c) Use anonymised or aggregated, non-identifiable operational patterns for the purpose of improving the System.

The Company expressly undertakes that it shall NOT:
(i) Resell, license, or transfer Operational Information to any third party;
(ii) Disclose Operational Information to any third party except as required by law or as necessary to engage authorised sub-processors (who shall be bound by equivalent obligations);
(iii) Commercially exploit, use for its own business development, or derive independent commercial benefit from The Client's Confidential Information beyond the scope of operating and improving the System;
(iv) Use Operational Information to compete with The Client or to provide advantage to The Client's competitors.

This Clause supplements and does not limit the obligations set out in the Data Processing Clause and Confidentiality Clause of this Agreement.`,
      },
      {
        id: "permitted_use",
        title: "5. Permitted Use",
        content: `The License permits The Client to use the System exclusively for The Client's own internal business operations, including client lifecycle management, document management, contract administration, and internal workflow automation.

The Client shall not use the System to provide services to, or process data of, any entity other than The Client, unless The Client has separately purchased a White-Label Plan as described in Clause 6.

The Client is responsible for ensuring all persons using the System under The Client's account comply with the terms of this Agreement. The Client shall promptly notify The Company of any unauthorised use or suspected breach.

User account limits, storage limits, and feature access rights are governed by the plan tier selected, as set out in Appendix B.`,
      },
      {
        id: "whitelabel",
        title: "6. White-Label Rights",
        content: `White-label rights are not included in the standard License and are available only under a separately agreed White-Label Plan.

Where The Client has purchased a White-Label Plan (as confirmed in Appendix B), The Company grants The Client the additional right to rebrand the System interface and make it available to The Client's end-customers, subject to:

(a) The Client not representing the System as its own proprietary software to any regulatory body, investor, or lender;
(b) The Client ensuring all end-customers are bound by terms no less restrictive than those applicable to The Client;
(c) The Client being responsible for first-line support to its end-customers;
(d) The white-label right being co-terminous with this Agreement.

Where no White-Label Plan has been purchased, any attempt to sublicense or deploy the System to third parties shall constitute a material breach of this Agreement.`,
      },
      {
        id: "term",
        title: "7. Term",
        content: `This Agreement commences on ${data.date} and continues for the subscription period selected by The Client — either monthly or annual — as confirmed in Appendix B (the "License Term").

Monthly subscriptions renew automatically each calendar month unless terminated in accordance with Clause 16.

Annual subscriptions renew automatically for successive 12-month periods unless either Party gives written notice of non-renewal at least 30 days prior to the end of the then-current annual term.

The Company may update, modify, or improve the System at any time during the License Term, subject to its obligations under Clause 11.`,
      },
      {
        id: "fees",
        title: "8. Fees",
        content: `${feeClause}

All fees are exclusive of VAT or equivalent applicable taxes, charged at the prevailing statutory rate and shown separately on invoices.

Annual subscriptions paid upfront receive a discount of forty percent (40%) on the total annual fee, as set out in Appendix B.

License Fees are non-refundable except where The Company fails to provide a material feature of the System for a continuous period exceeding 30 days due to circumstances within The Company's reasonable control, in which case a pro-rata credit shall be applied to future invoices.

The Company reserves the right to revise the License Fee at renewal by giving not less than 60 days' prior written notice.`,
      },
      {
        id: "payment_terms",
        title: "9. Payment Terms",
        content: `Monthly subscriptions: The Company shall issue an invoice on or before the 1st day of each calendar month, payable in advance. Payment is due within seven (7) calendar days of the invoice date.

Annual subscriptions: The Company shall issue an invoice for the full annual fee at the start of each License Term. Payment is due within fourteen (14) calendar days.

All payments shall be made by bank transfer to the account details specified on each invoice.

In the event of non-payment within 14 days of the due date, The Company shall issue a written reminder. If payment is not received within a further 14 days, The Company reserves the right to suspend System access without further notice until the outstanding balance is settled. Suspension does not relieve The Client of payment obligations.`,
      },
      {
        id: "data_processing",
        title: "10. Data Processing",
        content: `The Client retains full ownership of all data uploaded, created, or stored within the System ("Client Data"). The Company processes Client Data solely as a data processor acting on The Client's documented instructions, in accordance with UK GDPR and the Data Protection Act 2018.

Client Data is stored on Supabase infrastructure hosted in the EU-West region (Dublin, Ireland). The Company shall not transfer Client Data outside the EEA without The Client's prior written consent.

The Company implements appropriate technical and organisational security measures including encryption in transit and at rest, access controls, and regular security assessments. The Company shall notify The Client within 72 hours of becoming aware of any personal data breach.

A full Data Processing Agreement (DPA) compliant with Article 28 UK GDPR is provided as Appendix E and forms an integral part of this Agreement.`,
      },
      {
        id: "support",
        title: "11. Support",
        content: `The Company shall provide technical and operational support as follows:

(a) Email support to ${COMPANY_EMAIL}; The Company shall acknowledge requests within forty-eight (48) business hours and provide a substantive response within five (5) business days;
(b) Priority support response times apply where The Client has subscribed to a plan tier that includes priority support, as specified in Appendix C;
(c) Support covers access issues, functionality queries, configuration guidance, and bug reporting. It excludes data entry, content creation, or training beyond the initial onboarding;
(d) Scheduled maintenance shall be communicated at least 48 hours in advance and shall, where possible, be conducted outside business hours (09:00–18:00 GMT).

The Company shall use commercially reasonable efforts to ensure the System is available 99.5% of the time in any given calendar month, excluding scheduled maintenance.`,
      },
      {
        id: "updates",
        title: "12. Updates and Development",
        content: `System updates, improvements, and new features are included in the License Fee and shall be made available as part of the active subscription, unless a specific update constitutes a separately licensed module.

The Company retains full discretion over the development roadmap and feature prioritisation. No specific future feature is guaranteed.

The Company shall provide reasonable advance notice of any update that materially affects existing workflows. Where an update introduces a breaking change, The Company shall provide a migration guide and a minimum of 14 days for The Client to adapt its processes.

The Company shall maintain the System in a commercially reasonable state and shall promptly address confirmed bugs that materially impair The Client's use.`,
      },
      clientResponsibilitiesClause(13),
      implementationDelaysClause(14),
      {
        id: "confidentiality",
        title: "15. Confidentiality",
        content: `The System — including its architecture, algorithms, business logic, source code, user interface design, integration methods, and all associated documentation and know-how — constitutes the proprietary and confidential information of The Company ("System Confidential Information").

The Client agrees to keep all System Confidential Information strictly confidential and not to disclose it to any third party or use it for any purpose other than as permitted under this Agreement.

The Client shall restrict access to System Confidential Information to those of its employees and contractors who have a genuine need to know it, and shall ensure such persons are bound by equivalent confidentiality obligations.

This obligation shall survive termination of this Agreement for a period of three (3) years.`,
      },
      {
        id: "termination",
        title: "16. Termination",
        content: `Either Party may terminate this Agreement by giving not less than thirty (30) calendar days' written notice, with effect from the end of the then-current billing period.

Either Party may terminate with immediate effect if:
(a) The other Party commits a material breach and fails to remedy it within fourteen (14) days of written notice;
(b) The other Party becomes insolvent, enters administration, or makes a general assignment for creditors;
(c) The Client uses the System in violation of applicable law or this Agreement.

Upon termination: (i) Client Data shall remain accessible for fourteen (14) calendar days for export; (ii) The Company shall permanently delete all Client Data at the end of the export window; (iii) The Company shall provide written confirmation of deletion upon request; (iv) The Client's access to the System shall be revoked at the effective date of termination.`,
      },
      limitedLiabilityClientDecisionsClause(17),
      {
        id: "governing_law",
        title: "18. Governing Law",
        content: `This Agreement and any dispute arising out of or in connection with it shall be governed by and construed in accordance with the laws of England and Wales.

The Parties irrevocably submit to the exclusive jurisdiction of the courts of England and Wales.

In the event of any dispute, the Parties agree to attempt resolution through good-faith senior management negotiations for a period of 21 days before commencing formal legal proceedings.`,
      },
    ],
    appendices: baseAppendices([
      { slot: "appendix_e", label: "Appendix E — Data Processing Agreement (DPA)", required: true, status: "empty" },
    ]),
  };
}

// ─── Template 3: End-to-End Service Agreement ───────────────────────────────

function endToEndTemplate(data: ContractClientData): ContractTemplate {
  const feeClause = data.monthlyFee
    ? `The monthly retainer for the Engagement is ${data.monthlyFee} (exclusive of VAT), as set out in the approved proposal and detailed in Appendix B (Commercial Terms).`
    : `The fees for the Engagement are as set out in the approved proposal and detailed in Appendix B (Commercial Terms).`;

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
        content: `The Company agrees to provide a comprehensive end-to-end business development engagement (the "Engagement") encompassing:

(a) Strategic Architecture: Full analysis of The Client's current market position, competitive landscape, and growth potential; development of a bespoke business development strategy;

(b) Operational Implementation: Active delivery and management of the agreed growth strategy, including pipeline development, partner identification, lead generation, and conversion support;

(c) Systems and Process Design: Where agreed, deployment and configuration of the A.D.A.M. system and supporting operational workflows;

(d) Ongoing Account Management: Dedicated relationship management, progress tracking, and iterative refinement of strategy in response to market feedback.

The Company shall act as a strategic partner to The Client throughout the Engagement Term.`,
      },
      {
        id: "custom_scope",
        title: "3. Custom Scope and Deliverables",
        content: `The specific deliverables, phase structure, milestones, success metrics, and sector-specific workstreams applicable to The Client's Engagement are set out in Appendix A (Scope of Work), which forms an integral part of this Agreement.

Where The Client requests additions not described in Appendix A, such additions shall be subject to a separate Change Order, signed in writing by both Parties before work commences, specifying scope, timeline, and commercial terms.

Both Parties acknowledge that the Engagement is iterative. Priorities and delivery sequencing may be adjusted at monthly review meetings by mutual written agreement, provided overall scope and commercial terms remain as agreed.`,
      },
      {
        id: "internal_access",
        title: "4. Internal Access and Data Handling",
        content: `In order to deliver the strategic, operational, and implementation services described in this Agreement, The Company may require access to certain operational data, business workflows, financial information, client and partner data, and related information belonging to The Client (collectively, "Operational Information").

The Client expressly authorises The Company to:
(a) Review, analyse, and process Operational Information strictly for the purpose of designing and delivering the agreed Engagement strategy;
(b) Temporarily access The Client's systems, accounts, and operational environments as required for implementation activities;
(c) Use anonymised patterns or aggregated insights derived from Operational Information to improve its methodologies, provided no identifying information is disclosed externally.

The Company expressly undertakes that it shall NOT:
(i) Resell, license, distribute, or transfer Operational Information to any third party for any purpose;
(ii) Disclose Operational Information to any third party except as required by law or to engage authorised advisors bound by equivalent confidentiality obligations;
(iii) Commercially exploit, use for its own business development outside of this Engagement, or derive independent commercial benefit from The Client's Confidential Information;
(iv) Use any Operational Information to benefit The Client's direct competitors.

This Clause supplements the Confidentiality Clause of this Agreement and does not limit the obligations set out therein.`,
      },
      {
        id: "term",
        title: "5. Term",
        content: `This Agreement commences on ${data.date} and continues for a minimum initial term of three (3) calendar months (the "Minimum Term"). The Minimum Term reflects the lead time required for strategic design, implementation, and initial market validation to yield meaningful results.

Following the Minimum Term, the Agreement continues for the programme term specified in Appendix B and renews on a rolling monthly basis unless terminated in accordance with Clause 18.

The Engagement is structured in phases as set out in Appendix A. Phase transitions and milestone completions shall be documented in written Monthly Progress Reports.

Early termination during the Minimum Term by The Client — other than due to an unremedied material breach by The Company — shall require payment of all fees accrued to date plus a termination fee equal to the monthly retainer multiplied by the remaining months of the Minimum Term.`,
      },
      {
        id: "strategic_reviews",
        title: "6. Strategic Reviews",
        content: `The Company shall conduct the following structured review process:

(a) Monthly Review Calls: A standing scheduled call or meeting to review the previous month's deliverables, pipeline status, and KPIs; agree priorities for the following month; and address any issues or strategic adjustments. Notes shall be circulated within 5 business days of each meeting;

(b) Quarterly Business Reviews ("QBR"): A comprehensive formal review held every three (3) months, covering cumulative performance against strategic objectives, market intelligence updates, strategic plan refinement, resource review, and forward planning.

Both Parties commit to attending reviews through senior representatives with decision-making authority. The Client shall appoint a primary contact (identified in Appendix D) responsible for timely approvals and information required for the Engagement.`,
      },
      clientResponsibilitiesClause(7),
      {
        id: "fees",
        title: "8. Fees",
        content: `${feeClause}

All fees are exclusive of VAT and any other applicable taxes, charged at the prevailing statutory rate and shown separately on invoices.

The fees reflect the full commercial commitment required to deliver the Engagement. They do not include third-party costs such as market research subscriptions, event fees, advertising spend, or other agreed out-of-pocket expenses, which shall be invoiced separately with supporting receipts.

The Company reserves the right to adjust the fee upon renewal beyond the initial programme term by giving not less than 60 days' prior written notice.`,
      },
      {
        id: "payment_structure",
        title: "9. Payment Structure",
        content: `(a) Commencement Payment: Fifty percent (50%) of the total Minimum Term fee is due upon execution of this Agreement. The Commencement Payment confirms The Client's commitment and enables The Company to allocate dedicated resources. This Agreement shall not be treated as binding on The Company until the Commencement Payment has been received in cleared funds;

(b) Phase 1 Completion Payment: The remaining fifty percent (50%) of the Minimum Term fee is due upon written confirmation by The Client that Phase 1 deliverables have been completed, or within 30 days of Phase 1 completion notification from The Company, whichever is earlier.

The Commencement Payment shall be invoiced upon signing of this Agreement and is due within seven (7) calendar days.`,
      },
      {
        id: "milestone_payments",
        title: "10. Milestone Payments",
        content: `Following the Minimum Term, fees for subsequent phases shall be invoiced on a milestone basis as defined in Appendix B and Appendix A.

Each milestone invoice shall be issued upon completion of the relevant deliverable, with supporting documentation. The Client shall confirm acceptance or raise substantive objections within ten (10) business days of receipt.

Where The Client raises no substantive objection within the 10-day review period, the milestone shall be deemed accepted and payment shall be due within fourteen (14) calendar days.

Where The Client disputes completion of a milestone, the Parties shall resolve the dispute in good faith within a further ten (10) business days before either Party may escalate.`,
      },
      implementationDelaysClause(11),
      {
        id: "confidentiality",
        title: "12. Confidentiality",
        content: `Each Party acknowledges that in the course of this Engagement it will receive highly sensitive Confidential Information, including strategic plans, commercial terms, market intelligence, financial data, and operational systems.

Both Parties agree to: (a) keep all Confidential Information strictly confidential; (b) use it only for the purposes of this Agreement; (c) implement reasonable security measures; and (d) promptly notify the disclosing Party upon becoming aware of any unauthorised use or disclosure.

This obligation shall survive termination for a period of three (3) years. Standard exceptions apply: information publicly known other than through breach; information already lawfully known; information independently developed; information required by law to be disclosed.`,
      },
      {
        id: "non_disclosure",
        title: "13. Non-Disclosure of Methodology",
        content: `The Client acknowledges that the business development frameworks, strategic methodologies, market entry playbooks, systems architecture, and operational processes deployed by The Company constitute proprietary intellectual property of significant commercial value.

The Client agrees that it shall not, during the Engagement or at any time thereafter:
(a) Disclose, share, or describe The Company's strategic frameworks or systems to any competitor of The Company, any third-party service provider in the same field, or any other party without prior written consent;
(b) Engage any person or entity to replicate or reverse-engineer The Company's methodologies based on knowledge acquired through this Engagement;
(c) Publish or promote any account of The Company's proprietary methods identifiable as originating from this Engagement without prior written approval.

This obligation survives termination indefinitely with respect to trade secrets, and for three (3) years with respect to all other proprietary information.`,
      },
      {
        id: "non_circumvention",
        title: "14. Exclusivity and Non-Circumvention",
        content: `Exclusivity: Upon written request by The Client and subject to The Company's written confirmation, The Company may agree not to engage as primary business development partner for a direct competitor of The Client within The Client's primary target market during the active Engagement. "Direct competitor" means a business operating in the same primary sector, targeting the same geography, and offering substantially similar products or services. Any exclusivity commitment shall be agreed in writing and appended to Appendix A.

Non-Circumvention: The Client acknowledges that in the course of the Engagement, The Company may introduce The Client to contractors, advisors, partners, or other third-party relationships ("Introduced Parties") in order to deliver the Services. The Client agrees that it shall not, without The Company's prior written consent:

(a) Directly engage any Introduced Party in relation to services substantially similar to those provided under this Agreement, bypassing The Company, during the term and for twelve (12) months following termination;

(b) Circumvent The Company in relation to any partnership, consortium, or opportunity introduced or facilitated by The Company under this Agreement;

(c) Encourage any Introduced Party to provide services directly to The Client in a manner that bypasses The Company's involvement.

This Clause does not prevent The Company from serving multiple clients or engaging with businesses in non-directly competing sectors. Non-circumvention does not apply to Introduced Parties with whom The Client had a demonstrable pre-existing direct relationship prior to this Agreement.`,
      },
      {
        id: "ip",
        title: "15. Intellectual Property",
        content: `The Company retains all right, title, and interest in its pre-existing intellectual property and in all strategic frameworks, methodologies, tools, templates, and systems used in the delivery of the Engagement.

Upon full payment of all fees due, The Company assigns to The Client all right, title, and interest in client-specific deliverables including: market research reports; bespoke strategic plans; go-to-market strategies; sales materials and pitch decks; and process documentation created specifically for The Client.

General frameworks, methodologies, and know-how used in producing deliverables remain the exclusive property of The Company and do not form part of the assignment.

The Client grants The Company a non-exclusive licence to use The Client's name, logo, and factual business information for the purposes of delivering the Engagement.`,
      },
      {
        id: "deliverables_ownership",
        title: "16. Deliverables Ownership",
        content: `All client-specific deliverables listed in Appendix A shall be delivered to The Client upon completion of the relevant phase, subject to full payment of all fees due at the time of delivery. Delivery is conditional upon The Client's account being current with no overdue invoices.

The Client may use, adapt, and build upon deliverables for its own internal business purposes. The Client shall not resell or commercially exploit deliverables to third parties without The Company's prior written consent.

Where The Client has not paid outstanding fees within 60 days of the due date, The Company reserves the right to revoke the assignment of intellectual property in unpaid deliverables until payment is received in full.`,
      },
      limitedLiabilityClientDecisionsClause(17),
      {
        id: "termination",
        title: "18. Termination",
        content: `Either Party may terminate after the Minimum Term by giving not less than thirty (30) calendar days' written notice. Notice must be delivered to the primary contacts identified in Appendix D.

Termination by The Client during the Minimum Term (other than due to an unremedied material breach by The Company) requires payment of: (i) all fees accrued to the date of termination; and (ii) a termination fee equal to the monthly retainer multiplied by the remaining months of the Minimum Term.

Either Party may terminate with immediate effect upon written notice if the other Party: (a) commits a material breach incapable of remedy; (b) fails to remedy a material breach within fourteen (14) days of written notice; or (c) becomes insolvent or enters administration.

Upon termination: The Company shall complete and deliver all work product at the stage reached, subject to payment of fees accrued; each Party shall return or destroy the other Party's Confidential Information; and all licences granted under this Agreement shall cease.`,
      },
      {
        id: "governing_law",
        title: "19. Governing Law",
        content: `This Agreement and any dispute arising out of or in connection with it shall be governed by and construed in accordance with the laws of England and Wales.

The Parties irrevocably submit to the exclusive jurisdiction of the courts of England and Wales.

The Parties agree to attempt resolution through good-faith senior management negotiations for a period of not less than 21 calendar days before commencing formal legal proceedings. Nothing in this clause prevents either Party from seeking urgent injunctive or interim relief.`,
      },
    ],
    appendices: baseAppendices([
      { slot: "appendix_e", label: "Appendix E — Target Market & Competitor Scope Definition", required: false, status: "empty" },
    ]),
  };
}
