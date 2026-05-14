import type { ContractAppendix, StrategyType } from "@/lib/supabase/types";

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

const COMPANY = "Andy'K Group International LTD";
const COMPANY_REG = "16453500";

function baseAppendices(extras: ContractAppendix[] = []): ContractAppendix[] {
  return [
    { slot: "appendix_a", label: "Appendix A — Scope of Work", required: true, status: "empty" },
    { slot: "appendix_b", label: "Appendix B — Commercial Terms", required: true, status: "empty" },
    { slot: "appendix_c", label: "Appendix C — Service Level Agreement", required: false, status: "empty" },
    {
      slot: "appendix_d",
      label: "Appendix D — Primary Contact Person",
      required: true,
      status: "empty",
    },
    ...extras,
  ];
}

export function getContractTemplate(
  serviceType: StrategyType,
  clientName: string,
  companyName: string,
  date: string
): ContractTemplate {
  switch (serviceType) {
    case "b2b":
      return b2bTemplate(clientName, companyName, date);
    case "b2g":
      return b2gTemplate(clientName, companyName, date);
    case "adam_license":
      return adamTemplate(clientName, companyName, date);
    case "end_to_end":
      return endToEndTemplate(clientName, companyName, date);
    default:
      return b2bTemplate(clientName, companyName, date);
  }
}

export function serviceTypeLabel(type: StrategyType | null): string {
  switch (type) {
    case "b2b": return "B2B Service Agreement";
    case "b2g": return "B2G Service Agreement";
    case "adam_license": return "A.D.A.M. License Agreement";
    case "end_to_end": return "End-to-End Business Development";
    default: return "Service Agreement";
  }
}

export function serviceTypeStyle(type: StrategyType | null): string {
  switch (type) {
    case "b2b": return "bg-info/10 text-info";
    case "b2g": return "bg-violet-500/10 text-violet-600";
    case "adam_license": return "bg-highlight/10 text-highlight";
    case "end_to_end": return "bg-success/10 text-success";
    default: return "bg-grid-300 text-muted";
  }
}

function b2bTemplate(clientName: string, companyName: string, date: string): ContractTemplate {
  return {
    title: `B2B Service Agreement — ${companyName}`,
    sections: [
      {
        id: "parties",
        title: "1. Parties",
        content: `This Business-to-Business Service Agreement ("Agreement") is entered into as of ${date} between:\n\n${COMPANY} (Company Registration No. ${COMPANY_REG}), hereinafter referred to as the "Service Provider"; and\n\n${companyName}, represented by ${clientName}, hereinafter referred to as the "Client".\n\nCollectively referred to as the "Parties".`,
      },
      {
        id: "scope",
        title: "2. Scope of Services",
        content: `The Service Provider agrees to deliver the services as defined in Appendix A (Scope of Work) attached hereto and incorporated by reference.\n\nThe Service Provider shall perform the Services with reasonable care and skill, in accordance with good industry practice and the specifications agreed by the Parties.\n\nAny variation to the agreed Scope of Work shall be documented in a Change Request signed by both Parties before work commences.`,
      },
      {
        id: "commercials",
        title: "3. Commercial Terms",
        content: `The commercial terms applicable to this Agreement, including fees, payment schedules, and milestones, are set out in Appendix B (Commercial Terms), which forms an integral part of this Agreement.\n\nAll amounts are stated exclusive of VAT unless otherwise specified. The Client shall be responsible for any applicable taxes.\n\nInvoices shall be issued in accordance with the payment schedule set out in Appendix B and are due within 30 days of the invoice date unless otherwise agreed.`,
      },
      {
        id: "ip",
        title: "4. Intellectual Property",
        content: `All pre-existing intellectual property of either Party shall remain the property of that Party.\n\nUpon full payment of all fees due under this Agreement, the Service Provider assigns to the Client all right, title, and interest in any deliverables created specifically for the Client under this Agreement, except where otherwise stated in Appendix A.\n\nThe Service Provider retains the right to use the Client's name and project outcomes as a reference or case study unless the Client provides written objection within 30 days of project completion.`,
      },
      {
        id: "confidentiality",
        title: "5. Confidentiality",
        content: `Each Party agrees to keep confidential all information received from the other Party that is marked as confidential or that should reasonably be understood to be confidential ("Confidential Information").\n\nThis obligation shall not apply to information that: (a) is or becomes publicly known through no breach of this Agreement; (b) was already known to the receiving Party; (c) is independently developed without reference to the Confidential Information; or (d) is required to be disclosed by law.\n\nThis confidentiality obligation shall survive termination of this Agreement for a period of three (3) years.`,
      },
      {
        id: "term",
        title: "6. Term and Termination",
        content: `This Agreement shall commence on ${date} and shall continue until completion of the Services, unless terminated earlier in accordance with this clause.\n\nEither Party may terminate this Agreement by giving 30 days' written notice to the other Party.\n\nEither Party may terminate this Agreement with immediate effect if the other Party commits a material breach that is incapable of remedy, or fails to remedy a material breach within 14 days of written notice.\n\nUpon termination, the Client shall pay for all Services rendered up to the date of termination.`,
      },
      {
        id: "liability",
        title: "7. Limitation of Liability",
        content: `The total liability of the Service Provider to the Client under or in connection with this Agreement shall not exceed the total fees paid by the Client in the 12 months preceding the event giving rise to the claim.\n\nNeither Party shall be liable for any indirect, consequential, or special losses, loss of profit, loss of business, or loss of data.\n\nNothing in this Agreement limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.`,
      },
      {
        id: "governing_law",
        title: "8. Governing Law",
        content: `This Agreement and any dispute or claim arising out of or in connection with it shall be governed by and construed in accordance with the laws of England and Wales.\n\nThe Parties agree to submit to the exclusive jurisdiction of the courts of England and Wales.\n\nThe Parties shall attempt to resolve any dispute through good faith negotiation before commencing legal proceedings.`,
      },
    ],
    appendices: baseAppendices(),
  };
}

function b2gTemplate(clientName: string, companyName: string, date: string): ContractTemplate {
  return {
    title: `B2G Service Agreement — ${companyName}`,
    sections: [
      {
        id: "parties",
        title: "1. Parties",
        content: `This Business-to-Government Service Agreement ("Agreement") is entered into as of ${date} between:\n\n${COMPANY} (Company Registration No. ${COMPANY_REG}), hereinafter referred to as the "Contractor"; and\n\n${companyName}, represented by ${clientName}, hereinafter referred to as the "Contracting Authority".\n\nCollectively referred to as the "Parties".`,
      },
      {
        id: "scope",
        title: "2. Scope of Services",
        content: `The Contractor agrees to provide the services as specified in Appendix A (Scope of Work) in accordance with applicable public procurement standards.\n\nThe Contractor shall comply with all applicable legislation, regulations, and codes of practice relevant to the delivery of the Services.\n\nAll personnel engaged by the Contractor in delivering the Services must meet the qualification and security requirements specified by the Contracting Authority.`,
      },
      {
        id: "commercials",
        title: "3. Commercial Terms",
        content: `Fees, payment schedules, and budget provisions are set out in Appendix B (Commercial Terms).\n\nAll invoices must reference the relevant Purchase Order number issued by the Contracting Authority.\n\nPayment shall be made within 30 days of receipt of a valid invoice, subject to the Contracting Authority's verification of satisfactory completion of milestones as defined in Appendix A.\n\nThe Contractor acknowledges that all public expenditure is subject to audit and agrees to maintain accurate records for a minimum of seven (7) years following the expiry of this Agreement.`,
      },
      {
        id: "compliance",
        title: "4. Compliance and Ethics",
        content: `The Contractor shall comply with all applicable anti-bribery and anti-corruption legislation, including the Bribery Act 2010.\n\nThe Contractor shall not engage in any activity that would constitute a conflict of interest and shall promptly disclose any potential conflicts to the Contracting Authority.\n\nThe Contractor shall maintain appropriate policies and procedures to prevent modern slavery and human trafficking in accordance with the Modern Slavery Act 2015.\n\nThe Contractor shall comply with the UK GDPR and the Data Protection Act 2018 in relation to any personal data processed in connection with this Agreement.`,
      },
      {
        id: "ip",
        title: "5. Intellectual Property",
        content: `All deliverables and work products created under this Agreement shall vest in the Contracting Authority upon payment in full, unless otherwise agreed in writing.\n\nThe Contractor grants the Contracting Authority a perpetual, royalty-free licence to use any pre-existing intellectual property of the Contractor that is incorporated into the deliverables, to the extent necessary to use those deliverables.\n\nThe Contracting Authority may share deliverables with other government bodies for the purposes of delivering public services.`,
      },
      {
        id: "confidentiality",
        title: "6. Confidentiality and Data Protection",
        content: `The Contractor acknowledges that information provided by the Contracting Authority may be subject to the Freedom of Information Act 2000 and agrees to assist the Contracting Authority in responding to any relevant requests.\n\nThe Contractor shall not disclose any information relating to this Agreement or the Contracting Authority's activities without prior written consent.\n\nAll personal data processed by the Contractor on behalf of the Contracting Authority shall be processed only on documented instructions from the Contracting Authority and in accordance with a Data Processing Agreement to be agreed separately.`,
      },
      {
        id: "term",
        title: "7. Term and Termination",
        content: `This Agreement shall commence on ${date} and continue for the period specified in Appendix A, subject to renewal by mutual written agreement.\n\nThe Contracting Authority may terminate this Agreement for convenience by giving 30 days' written notice.\n\nThe Contracting Authority may terminate this Agreement with immediate effect in the event of: (a) material breach by the Contractor; (b) insolvency of the Contractor; or (c) any finding of corruption, fraud, or serious misconduct by the Contractor.\n\nUpon termination, the Contractor shall deliver all work in progress and materials to the Contracting Authority.`,
      },
      {
        id: "governing_law",
        title: "8. Governing Law",
        content: `This Agreement shall be governed by and construed in accordance with the laws of England and Wales.\n\nAny disputes shall be subject to the exclusive jurisdiction of the English courts.\n\nThe Parties agree to use the Cabinet Office Model Services Contract dispute resolution procedure prior to initiating formal legal proceedings.`,
      },
    ],
    appendices: baseAppendices([
      { slot: "appendix_e", label: "Appendix E — Security & Compliance Declaration", required: false, status: "empty" },
    ]),
  };
}

function adamTemplate(clientName: string, companyName: string, date: string): ContractTemplate {
  return {
    title: `A.D.A.M. Platform License Agreement — ${companyName}`,
    sections: [
      {
        id: "parties",
        title: "1. Parties",
        content: `This A.D.A.M. Platform License Agreement ("Agreement") is entered into as of ${date} between:\n\n${COMPANY} (Company Registration No. ${COMPANY_REG}), the developer and owner of the A.D.A.M. platform, hereinafter referred to as the "Licensor"; and\n\n${companyName}, represented by ${clientName}, hereinafter referred to as the "Licensee".\n\nCollectively referred to as the "Parties".`,
      },
      {
        id: "grant",
        title: "2. License Grant",
        content: `Subject to the terms of this Agreement and payment of the License Fee, the Licensor grants the Licensee a non-exclusive, non-transferable, revocable license to access and use the A.D.A.M. (Automated Document & Account Manager) platform solely for the Licensee's internal business operations during the License Term.\n\nThe Licensee may not: (a) sublicense, resell, or distribute access to the platform; (b) copy, modify, or create derivative works; (c) reverse-engineer or attempt to extract the source code; (d) use the platform in any way that violates applicable law.`,
      },
      {
        id: "commercials",
        title: "3. License Fees and Payment",
        content: `License fees, billing cycles, and payment terms are set out in Appendix B (Commercial Terms).\n\nThe Licensor reserves the right to suspend access to the platform in the event of non-payment after 14 days' written notice.\n\nAll fees are non-refundable except as required by law or as explicitly stated in Appendix B.`,
      },
      {
        id: "data",
        title: "4. Data and Privacy",
        content: `The Licensee retains ownership of all data uploaded to or processed by the A.D.A.M. platform ("Licensee Data").\n\nThe Licensor shall process Licensee Data only as necessary to provide the platform services and in accordance with the Data Processing Agreement incorporated herein by reference.\n\nThe Licensor shall implement appropriate technical and organisational security measures to protect Licensee Data and shall promptly notify the Licensee of any data breach that may affect Licensee Data.\n\nUpon termination, the Licensor shall provide the Licensee with an export of their data within 30 days, after which all Licensee Data shall be deleted from the Licensor's systems.`,
      },
      {
        id: "sla",
        title: "5. Service Levels and Support",
        content: `The Licensor shall use commercially reasonable efforts to ensure the A.D.A.M. platform is available 99.5% of the time in any given calendar month, excluding scheduled maintenance.\n\nSupport services, response times, and escalation procedures are set out in Appendix C (Service Level Agreement).\n\nScheduled maintenance windows shall be communicated to the Licensee at least 48 hours in advance and shall, where possible, be conducted outside of business hours (09:00–18:00 GMT).`,
      },
      {
        id: "ip",
        title: "6. Intellectual Property",
        content: `The A.D.A.M. platform, including all software, documentation, and associated materials, is and shall remain the exclusive property of the Licensor.\n\nNothing in this Agreement transfers any ownership right in the platform to the Licensee.\n\nThe Licensor may use the Licensee's name and logo for marketing purposes unless the Licensee provides written objection within 30 days of the commencement of this Agreement.`,
      },
      {
        id: "term",
        title: "7. Term and Termination",
        content: `This Agreement shall commence on ${date} and continue for the initial License Term specified in Appendix B, unless terminated earlier.\n\nThe Agreement shall automatically renew for successive terms of equal length unless either Party gives 60 days' written notice of non-renewal prior to the end of the then-current term.\n\nEither Party may terminate this Agreement with immediate effect upon written notice if the other Party commits a material breach and fails to remedy it within 14 days of written notice.\n\nThe Licensor may suspend the Licensee's access immediately if the Licensee uses the platform in violation of this Agreement or applicable law.`,
      },
      {
        id: "governing_law",
        title: "8. Governing Law",
        content: `This Agreement shall be governed by and construed in accordance with the laws of England and Wales.\n\nThe Parties submit to the exclusive jurisdiction of the courts of England and Wales for any disputes arising under or in connection with this Agreement.`,
      },
    ],
    appendices: baseAppendices([
      { slot: "appendix_e", label: "Appendix E — Data Processing Agreement", required: true, status: "empty" },
    ]),
  };
}

function endToEndTemplate(clientName: string, companyName: string, date: string): ContractTemplate {
  return {
    title: `End-to-End Business Development Agreement — ${companyName}`,
    sections: [
      {
        id: "parties",
        title: "1. Parties",
        content: `This End-to-End Business Development Agreement ("Agreement") is entered into as of ${date} between:\n\n${COMPANY} (Company Registration No. ${COMPANY_REG}), hereinafter referred to as the "Development Partner"; and\n\n${companyName}, represented by ${clientName}, hereinafter referred to as the "Client".\n\nCollectively referred to as the "Parties".`,
      },
      {
        id: "scope",
        title: "2. Programme Overview and Scope",
        content: `The Development Partner agrees to deliver a comprehensive, end-to-end business development programme as defined in Appendix A (Programme Scope).\n\nThe programme encompasses strategy design, market entry planning, pipeline development, operational support, and ongoing account management across the Client's target markets.\n\nThe specific phases, deliverables, and success metrics for each stage of the programme are set out in Appendix A. Both Parties acknowledge that the programme is iterative in nature and that objectives may be refined at agreed review milestones.`,
      },
      {
        id: "commercials",
        title: "3. Commercial Terms",
        content: `Fees, retainer arrangements, success-based components, and payment schedules are set out in Appendix B (Commercial Terms).\n\nWhere the commercial structure includes a performance or success component, the specific criteria, measurement methodology, and payment triggers shall be defined in Appendix B.\n\nThe Development Partner shall submit monthly progress reports alongside invoices to support the Client's review and approval process.`,
      },
      {
        id: "exclusivity",
        title: "4. Exclusivity and Non-Compete",
        content: `During the term of this Agreement, the Development Partner shall not enter into any business development engagement with a direct competitor of the Client in the Client's primary target market without the Client's prior written consent.\n\nThe Client acknowledges that the Development Partner serves multiple clients and that this exclusivity is limited to direct competitors in specifically identified market segments as defined in Appendix A.\n\nThe Client shall not engage any third party to provide services substantially similar to those set out in Appendix A without the Development Partner's prior written consent during the term of this Agreement.`,
      },
      {
        id: "ip",
        title: "5. Intellectual Property and Deliverables",
        content: `All strategic frameworks, methodologies, tools, and templates developed by the Development Partner are and shall remain the property of the Development Partner.\n\nAll deliverables produced specifically for the Client under this Agreement, including market research, sales materials, and pipeline databases, shall become the property of the Client upon full payment of all fees due.\n\nThe Client grants the Development Partner a non-exclusive licence to use the Client's brand assets, materials, and information solely for the purpose of delivering the programme services.`,
      },
      {
        id: "reporting",
        title: "6. Reporting and Governance",
        content: `The Development Partner shall provide monthly written reports covering: (a) activities completed; (b) pipeline status and metrics; (c) upcoming activities and priorities; (d) any issues or escalations.\n\nThe Parties shall hold formal review meetings at intervals specified in Appendix A to assess programme performance and agree any necessary adjustments.\n\nThe Client shall appoint a primary contact person, as identified in Appendix D, who shall be responsible for prompt decision-making and approvals required to deliver the programme.`,
      },
      {
        id: "confidentiality",
        title: "7. Confidentiality",
        content: `Each Party acknowledges that in the course of this Agreement they will receive Confidential Information from the other Party.\n\nBoth Parties agree to: (a) keep all Confidential Information strictly confidential; (b) use Confidential Information only for the purposes of this Agreement; (c) not disclose Confidential Information to any third party without prior written consent.\n\nThis obligation shall survive termination of this Agreement for a period of five (5) years.`,
      },
      {
        id: "term",
        title: "8. Term and Termination",
        content: `This Agreement shall commence on ${date} and continue for the initial programme term specified in Appendix B.\n\nEither Party may terminate this Agreement by giving 60 days' written notice. In the event of early termination by the Client, the Client shall pay all fees accrued to the date of termination plus a termination fee equivalent to one additional month's retainer, unless termination follows a material and unremedied breach by the Development Partner.\n\nEither Party may terminate with immediate effect upon material breach that remains unremedied for 14 days after written notice.`,
      },
      {
        id: "governing_law",
        title: "9. Governing Law",
        content: `This Agreement shall be governed by and construed in accordance with the laws of England and Wales.\n\nThe Parties submit to the exclusive jurisdiction of the courts of England and Wales.\n\nThe Parties shall attempt in good faith to resolve any dispute through senior management negotiation before commencing legal proceedings.`,
      },
    ],
    appendices: baseAppendices([
      { slot: "appendix_e", label: "Appendix E — Market Segments & Target Profile", required: false, status: "empty" },
    ]),
  };
}
