/**
 * Seeds 3 test clients with full data across all tables for E2E testing.
 *
 * CLIENT 1 — Nexora Group Ltd         — Active (full completed flow)
 * CLIENT 2 — Brightfield Consulting   — Contract stage (awaiting signature)
 * CLIENT 3 — Atlas Ventures GmbH      — Proposal stage (early)
 *
 * Run:
 *   npx tsx scripts/seed-test-clients.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

// ── Env loading ───────────────────────────────────────────────────────────────

function loadEnv(file: string) {
  try {
    const raw = readFileSync(file, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      // Strip literal \n sequences Vercel CLI embeds in quoted values
      val = val.replace(/\\n/g, "").trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // rely on environment
  }
}

loadEnv(join(process.cwd(), ".env.production.local"));
loadEnv(join(process.cwd(), ".env.local"));

// ── Supabase admin client ─────────────────────────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function ok(label: string, data: unknown) {
  console.log(`  ✓ ${label}`);
  return data;
}

function err(label: string, error: { message: string }) {
  console.error(`  ✗ ${label}: ${error.message}`);
  throw new Error(`${label}: ${error.message}`);
}

function iso(daysOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
}

function isoDate(daysOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║     A.D.A.M.  —  Seed Test Clients          ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // ─────────────────────────────────────────────────────────────────────────────
  // CLIENT 1 — Nexora Group Ltd — Active (completed flow)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("── CLIENT 1: Nexora Group Ltd (Active) ─────────────────────────");

  // Auth user
  const { data: authUser1, error: authErr1 } = await supabase.auth.admin.createUser({
    email: "james.mitchell@nexoragroup.co.uk",
    password: "TestClient1!",
    email_confirm: true,
    user_metadata: { first_name: "James", last_name: "Mitchell" },
  });
  if (authErr1) err("Auth user 1", authErr1);
  ok("Auth user — james.mitchell@nexoragroup.co.uk", authUser1);
  const authId1 = authUser1!.user!.id;

  // Client record
  const { data: client1, error: clientErr1 } = await supabase
    .from("clients")
    .insert({
      client_ref: "AK-2025-0001",
      company_name: "Nexora Group Ltd",
      contact_name: "James Mitchell",
      contact_email: "james.mitchell@nexoragroup.co.uk",
      contact_phone: "+44 20 7946 0101",
      website_url: "https://nexoragroup.co.uk",
      address: {
        line1: "12 Harrington Gardens",
        line2: "Kensington",
        city: "London",
        postcode: "SW7 4JJ",
        country: "GB",
      },
      billing_currency: "GBP",
      segments: ["end_to_end"],
      stage: "active",
      strategy_type: "end_to_end",
      health_score: 87,
      health_score_updated_at: iso(-5),
      readiness_score: 85,
      readiness_score_updated_at: iso(-5),
      readiness_breakdown: {
        market_clarity: 90,
        budget_alignment: 88,
        team_readiness: 82,
        timeline_commitment: 80,
      },
      notes:
        "Strong UK-based group with multiple subsidiaries. Decision-maker is the CEO. Clear budget allocated for Q1.",
      strategy_notes:
        "End-to-end market entry for EU markets. Primary focus on DACH and Nordics in 2025.",
      kickoff_date: isoDate(-30),
      kickoff_notes: "Smooth kickoff. All key stakeholders attended. Kick-off deck delivered.",
      kickoff_confirmed_at: iso(-30),
      kickoff_checklist: [
        { id: "intro-call", label: "Intro call completed", checked: true },
        { id: "nda-signed", label: "NDA signed", checked: true },
        { id: "onboarding-doc", label: "Onboarding document sent", checked: true },
        { id: "access-granted", label: "Portal access granted", checked: true },
      ],
      activation_checklist: [
        { id: "kyc-complete", label: "KYC verified", required: true, checked: true },
        { id: "contract-signed", label: "Contract countersigned", required: true, checked: true },
        { id: "invoice-paid", label: "First invoice paid", required: true, checked: true },
        { id: "kickoff-done", label: "Kickoff completed", required: true, checked: true },
      ],
      activated_at: iso(-28),
      founder_notes:
        "James is a strong operator. Potential to upsell additional markets in Q3. Keep engagement high.",
      archived: false,
      created_at: iso(-90),
      updated_at: iso(-5),
    })
    .select("*")
    .single();
  if (clientErr1) err("Client 1", clientErr1);
  ok("Client record — Nexora Group Ltd", client1);
  const c1 = client1!;

  // User record
  const { data: user1, error: userErr1 } = await supabase
    .from("users")
    .insert({
      auth_id: authId1,
      email: "james.mitchell@nexoragroup.co.uk",
      first_name: "James",
      last_name: "Mitchell",
      role: "client",
      client_id: c1.id,
      account_status: "active",
      created_at: iso(-90),
      updated_at: iso(-90),
    })
    .select("*")
    .single();
  if (userErr1) err("User 1", userErr1);
  ok("User record — James Mitchell", user1);

  // Questionnaire
  const { data: q1, error: qErr1 } = await supabase
    .from("questionnaires")
    .insert({
      company_name: "Nexora Group Ltd",
      website_url: "https://nexoragroup.co.uk",
      billing_currency: "GBP",
      contact_name: "James Mitchell",
      contact_email: "james.mitchell@nexoragroup.co.uk",
      contact_phone: "+44 20 7946 0101",
      address: {
        line1: "12 Harrington Gardens",
        line2: "Kensington",
        city: "London",
        postcode: "SW7 4JJ",
        country: "GB",
      },
      data_enrichment_consent: true,
      countries_of_operation: "United Kingdom, Germany, France",
      years_in_business: "8",
      annual_revenue: "£5M–£15M",
      products_services:
        "Enterprise software solutions and managed IT services for mid-market companies.",
      business_goals:
        "Expand into DACH markets, establish partnerships with 3 key resellers, achieve €2M ARR in Europe within 18 months.",
      challenges:
        "Brand recognition in new markets, local regulatory compliance, building a partner network from scratch.",
      competitors: "Sage, SAP Business One, Microsoft Dynamics",
      usp: "Proprietary AI-driven analytics layer that reduces reporting time by 60%. UK-grade security standards.",
      communication_channels: ["email", "phone", "video"],
      security_requirements: ["GDPR", "ISO27001"],
      privacy_policy_agreed: true,
      segments: ["end_to_end"],
      b2b_data: {
        target_company_sizes: ["50-200", "200-1000"],
        decision_makers: ["CTO", "CFO", "CEO"],
        avg_deal_size: "£45,000",
        sales_cycle: "3-6 months",
      },
      status: "converted",
      session_id: `sess_nexora_${Date.now()}`,
      submitted_at: iso(-88),
      converted_to_client_id: c1.id,
      ai_evaluation: {
        recommendation: "proceed",
        reasoning:
          "High revenue, clear decision authority, well-defined international goals. Strong ICP fit for end-to-end.",
        qualityScore: 91,
        evaluatedAt: iso(-87),
      },
      created_at: iso(-90),
      updated_at: iso(-88),
    })
    .select("*")
    .single();
  if (qErr1) err("Questionnaire 1", qErr1);
  ok("Questionnaire — Nexora Group Ltd", q1);

  // Update client with questionnaire_id
  await supabase.from("clients").update({ questionnaire_id: q1!.id }).eq("id", c1.id);

  // Contact
  const { error: contactErr1 } = await supabase.from("contacts").insert({
    client_id: c1.id,
    name: "James Mitchell",
    email: "james.mitchell@nexoragroup.co.uk",
    phone: "+44 20 7946 0101",
    job_title: "Chief Executive Officer",
    role: "primary",
    is_primary: true,
    notes: "Primary decision-maker. Prefers video calls, Tues/Thurs mornings.",
    created_at: iso(-90),
    updated_at: iso(-90),
  });
  if (contactErr1) err("Contact 1", contactErr1);
  ok("Contact — James Mitchell (CEO)", null);

  // Proposal
  const { data: prop1, error: propErr1 } = await supabase
    .from("proposals")
    .insert({
      questionnaire_id: q1!.id,
      client_id: c1.id,
      title: "End-to-End Business Development — Nexora Group Ltd",
      proposal_ref: "AK-2025-0001-PROP-001",
      service_type: "end_to_end",
      status: "confirmed",
      valid_until: isoDate(-30),
      commercials_locked: true,
      addons: {
        currency: "GBP",
        billingCycle: "monthly",
        paymentTerms: 30,
        paymentMethod: "bank_transfer",
        recurringItems: [
          { name: "Strategy & Market Intelligence Retainer", monthly: 4500 },
          { name: "Business Development Execution", monthly: 3200 },
          { name: "Reporting & Analytics Dashboard", monthly: 800 },
        ],
        oneTimeItems: [
          { name: "Market Entry Research Package", amount: 7500 },
          { name: "Partner Network Setup", amount: 4000 },
        ],
      },
      sections: [
        {
          key: "executive_summary",
          title: "Executive Summary",
          content:
            "Nexora Group Ltd presents a compelling opportunity for accelerated European expansion. With a strong UK foundation and proven software solutions, our end-to-end programme will establish market presence in DACH and Nordic regions within 12 months.",
          order: 1,
          isVisible: true,
        },
        {
          key: "scope",
          title: "Scope of Services",
          content:
            "Full market entry strategy, partner identification and onboarding, pipeline development, regulatory mapping, and ongoing business development execution across Germany, Austria, Switzerland, and Scandinavia.",
          order: 2,
          isVisible: true,
        },
        {
          key: "timeline",
          title: "Delivery Timeline",
          content:
            "Month 1–2: Market analysis and ICP refinement. Month 3–4: Partner outreach and pipeline seeding. Month 5–6: First partnerships signed. Month 7–12: Revenue execution and scaling.",
          order: 3,
          isVisible: true,
        },
        {
          key: "commercials",
          title: "Commercial Terms",
          content:
            "Monthly retainer of £8,500 covering all execution activities, plus one-time setup fee of £11,500. 30-day payment terms via bank transfer.",
          order: 4,
          isVisible: true,
        },
        {
          key: "team",
          title: "Delivery Team",
          content:
            "Dedicated account lead with DACH market expertise. Senior BD strategist with 10+ years pan-European experience. Analyst support and quarterly executive review.",
          order: 5,
          isVisible: true,
        },
      ],
      approved_by_admin_at: iso(-75),
      sent_to_client_at: iso(-72),
      client_approved_at: iso(-65),
      admin_notes: "Client confirmed via email on day 7 after sending. No changes requested.",
      created_at: iso(-78),
      updated_at: iso(-65),
    })
    .select("*")
    .single();
  if (propErr1) err("Proposal 1", propErr1);
  ok("Proposal — AK-2025-0001-PROP-001 (confirmed)", prop1);

  // Contract
  const { data: contract1, error: contractErr1 } = await supabase
    .from("contracts")
    .insert({
      client_id: c1.id,
      proposal_id: prop1!.id,
      title: "Service Agreement — Nexora Group Ltd",
      contract_type: "service_agreement",
      service_type: "end_to_end",
      status: "final",
      version: 1,
      content:
        "This Service Agreement is entered into between Andrey Kneisl Consulting Ltd and Nexora Group Ltd...",
      sections: [
        {
          id: "s1",
          title: "Parties",
          content:
            "This agreement is between Andrey Kneisl Consulting Ltd (Provider) and Nexora Group Ltd (Client).",
        },
        {
          id: "s2",
          title: "Services",
          content:
            "Provider will deliver end-to-end business development services as detailed in Proposal AK-2025-0001-PROP-001.",
        },
        {
          id: "s3",
          title: "Term",
          content: "12-month initial term commencing on the Effective Date, with automatic renewal.",
        },
        {
          id: "s4",
          title: "Fees",
          content:
            "Monthly retainer of GBP 8,500 plus one-time setup fee of GBP 11,500, payable within 30 days.",
        },
        {
          id: "s5",
          title: "Confidentiality",
          content:
            "Both parties agree to maintain strict confidentiality of all proprietary information exchanged.",
        },
        {
          id: "s6",
          title: "Governing Law",
          content: "This agreement is governed by the laws of England and Wales.",
        },
      ],
      commercials_snapshot: {
        proposalRef: "AK-2025-0001-PROP-001",
        proposalTitle: "End-to-End Business Development — Nexora Group Ltd",
        snapshotAt: iso(-62),
        sections: [
          { title: "Monthly Retainer", content: "GBP 8,500/month" },
          { title: "One-Time Setup", content: "GBP 11,500" },
        ],
      },
      appendices: [
        {
          slot: "appendix_a",
          label: "Statement of Work",
          required: true,
          status: "completed",
        },
        {
          slot: "appendix_b",
          label: "Data Processing Agreement",
          required: true,
          status: "completed",
        },
        {
          slot: "appendix_c",
          label: "Contact Details Form",
          required: false,
          status: "completed",
          formData: {
            name: "James Mitchell",
            role: "CEO",
            email: "james.mitchell@nexoragroup.co.uk",
            phone: "+44 20 7946 0101",
            preferredChannel: "video",
          },
        },
      ],
      client_signature: "James Mitchell",
      client_signed_at: iso(-58),
      client_signed_by: user1!.id,
      admin_signature: "Andrey Kneisl",
      admin_signed_at: iso(-56),
      created_by: "b97ebac3-4209-410d-95a1-5bf262a71f28",
      published_at: iso(-60),
      viewed_at: iso(-59),
      finalized_at: iso(-56),
      created_at: iso(-63),
      updated_at: iso(-56),
    })
    .select("*")
    .single();
  if (contractErr1) err("Contract 1", contractErr1);
  ok("Contract — Service Agreement (final/countersigned)", contract1);

  // Update proposal with contract_id
  await supabase.from("proposals").update({ contract_id: contract1!.id }).eq("id", prop1!.id);

  // Invoice
  const { data: invoice1, error: invoiceErr1 } = await supabase
    .from("invoices")
    .insert({
      client_id: c1.id,
      contract_id: contract1!.id,
      invoice_number: "INV-2025-0001",
      status: "paid",
      currency: "GBP",
      amount: 20000,
      tax_amount: 4000,
      total_amount: 24000,
      due_date: isoDate(-45),
      paid_at: iso(-48),
      notes: "Setup fee + first month retainer. Paid 3 days early.",
      line_items: [
        { description: "One-Time Market Entry Research Package", quantity: 1, unit_price: 7500 },
        { description: "One-Time Partner Network Setup", quantity: 1, unit_price: 4000 },
        { description: "Monthly Retainer (Month 1)", quantity: 1, unit_price: 4500 },
        { description: "Business Development Execution (Month 1)", quantity: 1, unit_price: 3200 },
        { description: "Reporting & Analytics Dashboard (Month 1)", quantity: 1, unit_price: 800 },
      ],
      created_by: "b97ebac3-4209-410d-95a1-5bf262a71f28",
      created_at: iso(-55),
      updated_at: iso(-48),
    })
    .select("*")
    .single();
  if (invoiceErr1) err("Invoice 1", invoiceErr1);
  ok("Invoice — INV-2025-0001 (paid, GBP 24,000)", invoice1);

  // KYC
  const { error: kycErr1 } = await supabase.from("kyc_verifications").insert({
    client_id: c1.id,
    status: "verified",
    company_name: "Nexora Group Ltd",
    company_reg_number: "12345678",
    vat_number: "GB123456789",
    country: "GB",
    director_name: "James Mitchell",
    director_email: "james.mitchell@nexoragroup.co.uk",
    documents: [
      {
        type: "registry_extract",
        path: "kyc/nexora/companies-house-extract.pdf",
        name: "Companies House Extract",
        uploaded_at: iso(-80),
      },
      {
        type: "id_passport",
        path: "kyc/nexora/director-passport.pdf",
        name: "Director Passport",
        uploaded_at: iso(-80),
      },
    ],
    verified_by: "6d1dc2d3-525a-43ed-9d1b-131757136f66",
    verified_at: iso(-78),
    notes: "All documents verified. Companies House confirmed active status.",
    created_at: iso(-82),
    updated_at: iso(-78),
  });
  if (kycErr1) err("KYC 1", kycErr1);
  ok("KYC — verified (Nexora Group Ltd)", null);

  // Milestones (3: 2 completed, 1 in_progress)
  const milestones1 = [
    {
      client_id: c1.id,
      title: "Market Analysis & ICP Definition",
      description:
        "Complete DACH market analysis, define ideal customer profile, identify top 20 target accounts.",
      status: "completed",
      due_date: isoDate(-60),
      completed_at: iso(-62),
      order: 1,
      created_at: iso(-88),
      updated_at: iso(-62),
    },
    {
      client_id: c1.id,
      title: "Partner Network Seeding",
      description:
        "Identify and initiate conversations with 15 potential resellers and integration partners in Germany and Austria.",
      status: "completed",
      due_date: isoDate(-30),
      completed_at: iso(-32),
      order: 2,
      created_at: iso(-88),
      updated_at: iso(-32),
    },
    {
      client_id: c1.id,
      title: "First Partnership Agreement",
      description:
        "Close the first signed reseller partnership agreement in the DACH region.",
      status: "in_progress",
      due_date: isoDate(14),
      completed_at: null,
      order: 3,
      created_at: iso(-88),
      updated_at: iso(-7),
    },
  ];
  const { error: milestoneErr1 } = await supabase.from("milestones").insert(milestones1);
  if (milestoneErr1) err("Milestones 1", milestoneErr1);
  ok("Milestones — 3 created (2 completed, 1 in_progress)", null);

  // Meetings (2 logged)
  const meetings1 = [
    {
      client_id: c1.id,
      date: iso(-65),
      type: "kickoff",
      attendees: ["James Mitchell", "Sarah Thompson (Nexora COO)", "Andrey Kneisl", "BD Lead"],
      notes:
        "Smooth kickoff. James confirmed DACH as primary focus. Agreed on monthly check-in cadence. SOW approved. Timeline confirmed.",
      action_items: [
        { id: "ai1", text: "Send onboarding document pack to James", done: true },
        { id: "ai2", text: "Set up shared project workspace", done: true },
        { id: "ai3", text: "Schedule monthly review cadence (every 3rd Tuesday)", done: true },
      ],
      created_at: iso(-65),
    },
    {
      client_id: c1.id,
      date: iso(-30),
      type: "review",
      attendees: ["James Mitchell", "Andrey Kneisl"],
      notes:
        "Month 2 review. Market analysis delivered and approved by client. Partner longlist of 18 companies presented. James particularly interested in Munich-based VAR Softline GmbH. Budget confirmed for next phase.",
      action_items: [
        { id: "ai4", text: "Send partner outreach templates to James for approval", done: true },
        { id: "ai5", text: "Initiate intro to Softline GmbH", done: false },
        { id: "ai6", text: "Prepare Q2 pipeline forecast", done: false },
      ],
      created_at: iso(-30),
    },
  ];
  const { error: meetingErr1 } = await supabase.from("meetings").insert(meetings1);
  if (meetingErr1) err("Meetings 1", meetingErr1);
  ok("Meetings — 2 logged (kickoff + month-2 review)", null);

  // Activity log
  const activityLog1 = [
    {
      type: "client_created",
      client_id: c1.id,
      questionnaire_id: q1!.id,
      metadata: { source: "questionnaire", company: "Nexora Group Ltd" },
      created_at: iso(-90),
    },
    {
      type: "questionnaire_submitted",
      client_id: c1.id,
      questionnaire_id: q1!.id,
      metadata: { contact: "James Mitchell", score: 91 },
      created_at: iso(-88),
    },
    {
      type: "questionnaire_proceed",
      client_id: c1.id,
      questionnaire_id: q1!.id,
      metadata: { recommendation: "proceed" },
      created_at: iso(-87),
    },
    {
      type: "client_stage_changed",
      client_id: c1.id,
      metadata: { from: "questionnaire", to: "proposal" },
      created_at: iso(-78),
    },
    {
      type: "client_stage_changed",
      client_id: c1.id,
      proposal_id: prop1!.id,
      metadata: { from: "proposal", to: "contract" },
      created_at: iso(-63),
    },
    {
      type: "contract_created",
      client_id: c1.id,
      contract_id: contract1!.id,
      metadata: { title: "Service Agreement" },
      created_at: iso(-63),
    },
    {
      type: "contract_published",
      client_id: c1.id,
      contract_id: contract1!.id,
      metadata: {},
      created_at: iso(-60),
    },
    {
      type: "contract_viewed",
      client_id: c1.id,
      contract_id: contract1!.id,
      metadata: { viewer: "client" },
      created_at: iso(-59),
    },
    {
      type: "contract_client_signed",
      client_id: c1.id,
      contract_id: contract1!.id,
      metadata: { signatory: "James Mitchell" },
      created_at: iso(-58),
    },
    {
      type: "contract_countersigned",
      client_id: c1.id,
      contract_id: contract1!.id,
      metadata: { signatory: "Andrey Kneisl" },
      created_at: iso(-56),
    },
    {
      type: "contract_finalized",
      client_id: c1.id,
      contract_id: contract1!.id,
      metadata: {},
      created_at: iso(-56),
    },
    {
      type: "client_stage_changed",
      client_id: c1.id,
      metadata: { from: "contract", to: "invoice" },
      created_at: iso(-55),
    },
    {
      type: "client_stage_changed",
      client_id: c1.id,
      metadata: { from: "invoice", to: "kickoff" },
      created_at: iso(-48),
    },
    {
      type: "client_stage_changed",
      client_id: c1.id,
      metadata: { from: "kickoff", to: "active" },
      created_at: iso(-28),
    },
  ];
  const { error: actErr1 } = await supabase.from("activity_log").insert(activityLog1);
  if (actErr1) err("Activity log 1", actErr1);
  ok(`Activity log — ${activityLog1.length} entries`, null);

  console.log(`  → Client 1 ID: ${c1.id}\n`);

  // ─────────────────────────────────────────────────────────────────────────────
  // CLIENT 2 — Brightfield Consulting Ltd — Contract stage
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("── CLIENT 2: Brightfield Consulting Ltd (Contract) ─────────────");

  const { data: authUser2, error: authErr2 } = await supabase.auth.admin.createUser({
    email: "s.chen@brightfieldconsulting.com",
    password: "TestClient2!",
    email_confirm: true,
    user_metadata: { first_name: "Sarah", last_name: "Chen" },
  });
  if (authErr2) err("Auth user 2", authErr2);
  ok("Auth user — s.chen@brightfieldconsulting.com", authUser2);
  const authId2 = authUser2!.user!.id;

  const { data: client2, error: clientErr2 } = await supabase
    .from("clients")
    .insert({
      client_ref: "AK-2025-0002",
      company_name: "Brightfield Consulting Ltd",
      contact_name: "Sarah Chen",
      contact_email: "s.chen@brightfieldconsulting.com",
      contact_phone: "+44 161 850 2200",
      website_url: "https://brightfieldconsulting.com",
      address: {
        line1: "88 Deansgate",
        city: "Manchester",
        postcode: "M3 2EF",
        country: "GB",
      },
      billing_currency: "GBP",
      segments: ["adam_license"],
      stage: "contract",
      strategy_type: "adam_license",
      health_score: 62,
      health_score_updated_at: iso(-3),
      readiness_score: 71,
      readiness_score_updated_at: iso(-3),
      readiness_breakdown: {
        market_clarity: 75,
        budget_alignment: 68,
        team_readiness: 65,
        timeline_commitment: 72,
      },
      notes:
        "Brightfield is a 50-person consulting firm looking to white-label A.D.A.M. for their own client onboarding. Sarah is COO and primary contact, but the CEO (Mark Fields) will be the final signatory.",
      archived: false,
      created_at: iso(-45),
      updated_at: iso(-3),
    })
    .select("*")
    .single();
  if (clientErr2) err("Client 2", clientErr2);
  ok("Client record — Brightfield Consulting Ltd", client2);
  const c2 = client2!;

  const { data: user2, error: userErr2 } = await supabase
    .from("users")
    .insert({
      auth_id: authId2,
      email: "s.chen@brightfieldconsulting.com",
      first_name: "Sarah",
      last_name: "Chen",
      role: "client",
      client_id: c2.id,
      account_status: "active",
      created_at: iso(-45),
      updated_at: iso(-45),
    })
    .select("*")
    .single();
  if (userErr2) err("User 2", userErr2);
  ok("User record — Sarah Chen", user2);

  const { data: q2, error: qErr2 } = await supabase
    .from("questionnaires")
    .insert({
      company_name: "Brightfield Consulting Ltd",
      website_url: "https://brightfieldconsulting.com",
      billing_currency: "GBP",
      contact_name: "Sarah Chen",
      contact_email: "s.chen@brightfieldconsulting.com",
      contact_phone: "+44 161 850 2200",
      address: {
        line1: "88 Deansgate",
        city: "Manchester",
        postcode: "M3 2EF",
        country: "GB",
      },
      data_enrichment_consent: true,
      countries_of_operation: "United Kingdom",
      years_in_business: "12",
      annual_revenue: "£2M–£5M",
      products_services:
        "Management consulting, transformation advisory, and digital operations for UK SMEs.",
      business_goals:
        "Automate client onboarding and document management. Reduce administrative overhead by 40% using A.D.A.M. License.",
      challenges:
        "Manual onboarding takes 3 weeks per client. Document control is fragmented across email and SharePoint.",
      usp: "Deep domain expertise in operational transformation. 92% client retention rate.",
      communication_channels: ["email", "video"],
      privacy_policy_agreed: true,
      segments: ["adam_license"],
      adam_data: {
        intended_use: "white_label",
        expected_clients: "50-100 per year",
        integration_requirements: ["CRM sync", "DocuSign"],
        deployment_preference: "cloud",
      },
      status: "converted",
      session_id: `sess_brightfield_${Date.now()}`,
      submitted_at: iso(-43),
      converted_to_client_id: c2.id,
      ai_evaluation: {
        recommendation: "proceed",
        reasoning:
          "Clear use-case for A.D.A.M. license. Established firm with budget authority. White-label deployment interest is a strong signal.",
        qualityScore: 78,
        evaluatedAt: iso(-42),
      },
      created_at: iso(-45),
      updated_at: iso(-43),
    })
    .select("*")
    .single();
  if (qErr2) err("Questionnaire 2", qErr2);
  ok("Questionnaire — Brightfield Consulting Ltd", q2);

  await supabase.from("clients").update({ questionnaire_id: q2!.id }).eq("id", c2.id);

  const { error: contactErr2 } = await supabase.from("contacts").insert({
    client_id: c2.id,
    name: "Sarah Chen",
    email: "s.chen@brightfieldconsulting.com",
    phone: "+44 161 850 2200",
    job_title: "Chief Operating Officer",
    role: "primary",
    is_primary: true,
    notes: "Primary contact and project sponsor. CEO (Mark Fields) will countersign contract.",
    created_at: iso(-45),
    updated_at: iso(-45),
  });
  if (contactErr2) err("Contact 2", contactErr2);
  ok("Contact — Sarah Chen (COO)", null);

  const { data: prop2, error: propErr2 } = await supabase
    .from("proposals")
    .insert({
      questionnaire_id: q2!.id,
      client_id: c2.id,
      title: "A.D.A.M. License — Brightfield Consulting Ltd",
      proposal_ref: "AK-2025-0002-PROP-001",
      service_type: "adam_license",
      status: "approved",
      valid_until: isoDate(30),
      commercials_locked: true,
      addons: {
        currency: "GBP",
        billingCycle: "monthly",
        paymentTerms: 30,
        paymentMethod: "bank_transfer",
        recurringItems: [
          { name: "A.D.A.M. Platform License (up to 100 client seats)", monthly: 2800 },
          { name: "White-Label Customisation Maintenance", monthly: 600 },
        ],
        oneTimeItems: [
          { name: "Implementation & Setup", amount: 6500 },
          { name: "Staff Training (2 sessions)", amount: 1800 },
        ],
      },
      sections: [
        {
          key: "executive_summary",
          title: "Executive Summary",
          content:
            "Brightfield Consulting Ltd will deploy A.D.A.M. under a white-label license to transform their client onboarding and document management operations.",
          order: 1,
          isVisible: true,
        },
        {
          key: "scope",
          title: "License Scope",
          content:
            "Full A.D.A.M. platform license including questionnaire engine, proposal builder, contract management, invoicing module, and client portal. Up to 100 active client seats.",
          order: 2,
          isVisible: true,
        },
        {
          key: "commercials",
          title: "Commercial Terms",
          content:
            "Monthly license fee of £3,400 plus one-time implementation fee of £8,300. Annual commitment with 30-day payment terms.",
          order: 3,
          isVisible: true,
        },
        {
          key: "sla",
          title: "SLA & Support",
          content:
            "99.5% uptime SLA. Business-hours email and chat support. Monthly maintenance window. Priority support escalation available.",
          order: 4,
          isVisible: true,
        },
      ],
      approved_by_admin_at: iso(-30),
      sent_to_client_at: iso(-28),
      client_approved_at: iso(-20),
      admin_notes: "Client approved after a minor clarification on seat limits.",
      created_at: iso(-35),
      updated_at: iso(-20),
    })
    .select("*")
    .single();
  if (propErr2) err("Proposal 2", propErr2);
  ok("Proposal — AK-2025-0002-PROP-001 (approved)", prop2);

  const { data: contract2, error: contractErr2 } = await supabase
    .from("contracts")
    .insert({
      client_id: c2.id,
      proposal_id: prop2!.id,
      title: "A.D.A.M. Platform License Agreement — Brightfield Consulting Ltd",
      contract_type: "service_agreement",
      service_type: "adam_license",
      status: "published",
      version: 1,
      content:
        "This Platform License Agreement governs the use of A.D.A.M. by Brightfield Consulting Ltd...",
      sections: [
        {
          id: "s1",
          title: "License Grant",
          content:
            "Provider grants Client a non-exclusive, non-transferable white-label license to operate the A.D.A.M. platform.",
        },
        {
          id: "s2",
          title: "License Scope",
          content:
            "License covers up to 100 concurrent client seats. Additional seats available at £28/seat/month.",
        },
        {
          id: "s3",
          title: "Term & Renewal",
          content: "Annual license with automatic renewal unless terminated with 60 days notice.",
        },
        {
          id: "s4",
          title: "Fees",
          content: "Monthly license fee GBP 3,400 plus one-time setup GBP 8,300.",
        },
        {
          id: "s5",
          title: "Data Protection",
          content:
            "Client is responsible as Data Controller. Provider acts as Data Processor. Full DPA in Appendix B.",
        },
      ],
      commercials_snapshot: {
        proposalRef: "AK-2025-0002-PROP-001",
        proposalTitle: "A.D.A.M. License — Brightfield Consulting Ltd",
        snapshotAt: iso(-18),
        sections: [
          { title: "Monthly License", content: "GBP 3,400/month" },
          { title: "One-Time Setup", content: "GBP 8,300" },
        ],
      },
      appendices: [
        {
          slot: "appendix_a",
          label: "Technical Specification",
          required: true,
          status: "uploaded",
        },
        {
          slot: "appendix_b",
          label: "Data Processing Agreement",
          required: true,
          status: "empty",
        },
      ],
      created_by: "b97ebac3-4209-410d-95a1-5bf262a71f28",
      published_at: iso(-15),
      viewed_at: null,
      finalized_at: null,
      created_at: iso(-18),
      updated_at: iso(-15),
    })
    .select("*")
    .single();
  if (contractErr2) err("Contract 2", contractErr2);
  ok("Contract — Platform License Agreement (published, awaiting signature)", contract2);

  await supabase.from("proposals").update({ contract_id: contract2!.id }).eq("id", prop2!.id);

  const { data: invoice2, error: invoiceErr2 } = await supabase
    .from("invoices")
    .insert({
      client_id: c2.id,
      contract_id: contract2!.id,
      invoice_number: "INV-2025-0002",
      status: "sent",
      currency: "GBP",
      amount: 11900,
      tax_amount: 2380,
      total_amount: 14280,
      due_date: isoDate(15),
      paid_at: null,
      notes:
        "Setup fee + first month license. Sent with contract — payment due on contract countersigning.",
      line_items: [
        { description: "One-Time Implementation & Setup", quantity: 1, unit_price: 6500 },
        { description: "One-Time Staff Training (2 sessions)", quantity: 1, unit_price: 1800 },
        { description: "A.D.A.M. Platform License — Month 1", quantity: 1, unit_price: 2800 },
        { description: "White-Label Customisation Maintenance — Month 1", quantity: 1, unit_price: 600 },
        { description: "Contract Administration Fee", quantity: 1, unit_price: 200 },
      ],
      created_by: "b97ebac3-4209-410d-95a1-5bf262a71f28",
      created_at: iso(-15),
      updated_at: iso(-15),
    })
    .select("*")
    .single();
  if (invoiceErr2) err("Invoice 2", invoiceErr2);
  ok("Invoice — INV-2025-0002 (sent, GBP 14,280)", invoice2);

  const { error: kycErr2 } = await supabase.from("kyc_verifications").insert({
    client_id: c2.id,
    status: "verified",
    company_name: "Brightfield Consulting Ltd",
    company_reg_number: "09876543",
    vat_number: "GB987654321",
    country: "GB",
    director_name: "Mark Fields",
    director_email: "m.fields@brightfieldconsulting.com",
    documents: [
      {
        type: "registry_extract",
        path: "kyc/brightfield/companies-house-extract.pdf",
        name: "Companies House Extract",
        uploaded_at: iso(-40),
      },
    ],
    verified_by: "6d1dc2d3-525a-43ed-9d1b-131757136f66",
    verified_at: iso(-38),
    notes: "Verified Companies House filing. Director confirmed via LinkedIn.",
    created_at: iso(-42),
    updated_at: iso(-38),
  });
  if (kycErr2) err("KYC 2", kycErr2);
  ok("KYC — verified (Brightfield Consulting Ltd)", null);

  const activityLog2 = [
    {
      type: "client_created",
      client_id: c2.id,
      questionnaire_id: q2!.id,
      metadata: { source: "questionnaire", company: "Brightfield Consulting Ltd" },
      created_at: iso(-45),
    },
    {
      type: "questionnaire_submitted",
      client_id: c2.id,
      questionnaire_id: q2!.id,
      metadata: { contact: "Sarah Chen", score: 78 },
      created_at: iso(-43),
    },
    {
      type: "questionnaire_proceed",
      client_id: c2.id,
      questionnaire_id: q2!.id,
      metadata: { recommendation: "proceed" },
      created_at: iso(-42),
    },
    {
      type: "client_stage_changed",
      client_id: c2.id,
      metadata: { from: "questionnaire", to: "proposal" },
      created_at: iso(-35),
    },
    {
      type: "client_stage_changed",
      client_id: c2.id,
      proposal_id: prop2!.id,
      metadata: { from: "proposal", to: "contract" },
      created_at: iso(-18),
    },
    {
      type: "contract_created",
      client_id: c2.id,
      contract_id: contract2!.id,
      metadata: { title: "A.D.A.M. Platform License Agreement" },
      created_at: iso(-18),
    },
    {
      type: "contract_published",
      client_id: c2.id,
      contract_id: contract2!.id,
      metadata: {},
      created_at: iso(-15),
    },
  ];
  const { error: actErr2 } = await supabase.from("activity_log").insert(activityLog2);
  if (actErr2) err("Activity log 2", actErr2);
  ok(`Activity log — ${activityLog2.length} entries`, null);

  console.log(`  → Client 2 ID: ${c2.id}\n`);

  // ─────────────────────────────────────────────────────────────────────────────
  // CLIENT 3 — Atlas Ventures GmbH — Proposal stage (early)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("── CLIENT 3: Atlas Ventures GmbH (Proposal) ────────────────────");

  const { data: authUser3, error: authErr3 } = await supabase.auth.admin.createUser({
    email: "k.weber@atlasventures.de",
    password: "TestClient3!",
    email_confirm: true,
    user_metadata: { first_name: "Klaus", last_name: "Weber" },
  });
  if (authErr3) err("Auth user 3", authErr3);
  ok("Auth user — k.weber@atlasventures.de", authUser3);
  const authId3 = authUser3!.user!.id;

  const { data: client3, error: clientErr3 } = await supabase
    .from("clients")
    .insert({
      client_ref: "AK-2025-0003",
      company_name: "Atlas Ventures GmbH",
      contact_name: "Klaus Weber",
      contact_email: "k.weber@atlasventures.de",
      contact_phone: "+49 89 21456789",
      website_url: "https://atlasventures.de",
      address: {
        line1: "Maximilianstraße 35",
        city: "Munich",
        postcode: "80539",
        country: "DE",
      },
      billing_currency: "EUR",
      segments: ["b2g"],
      stage: "proposal",
      strategy_type: "b2g",
      health_score: 45,
      health_score_updated_at: iso(-2),
      readiness_score: 52,
      readiness_score_updated_at: iso(-2),
      readiness_breakdown: {
        market_clarity: 60,
        budget_alignment: 45,
        team_readiness: 50,
        timeline_commitment: 48,
      },
      notes:
        "Munich-based early-stage venture. Klaus wants to enter the German public sector procurement market. KYC documents not yet submitted — chased twice.",
      archived: false,
      created_at: iso(-18),
      updated_at: iso(-2),
    })
    .select("*")
    .single();
  if (clientErr3) err("Client 3", clientErr3);
  ok("Client record — Atlas Ventures GmbH", client3);
  const c3 = client3!;

  const { data: user3, error: userErr3 } = await supabase
    .from("users")
    .insert({
      auth_id: authId3,
      email: "k.weber@atlasventures.de",
      first_name: "Klaus",
      last_name: "Weber",
      role: "client",
      client_id: c3.id,
      account_status: "active",
      created_at: iso(-18),
      updated_at: iso(-18),
    })
    .select("*")
    .single();
  if (userErr3) err("User 3", userErr3);
  ok("User record — Klaus Weber", user3);

  const { data: q3, error: qErr3 } = await supabase
    .from("questionnaires")
    .insert({
      company_name: "Atlas Ventures GmbH",
      website_url: "https://atlasventures.de",
      billing_currency: "EUR",
      contact_name: "Klaus Weber",
      contact_email: "k.weber@atlasventures.de",
      contact_phone: "+49 89 21456789",
      address: {
        line1: "Maximilianstraße 35",
        city: "Munich",
        postcode: "80539",
        country: "DE",
      },
      data_enrichment_consent: false,
      countries_of_operation: "Germany",
      years_in_business: "3",
      annual_revenue: "€500K–€2M",
      products_services:
        "Sustainable infrastructure solutions and consultancy for municipal authorities and federal agencies.",
      business_goals:
        "Win first public sector contracts via EU and German federal procurement frameworks. Target BMI and BMWK tenders in 2025.",
      challenges:
        "Limited track record in public sector. No existing relationships with procurement offices. Unsure about DTVP and vergabe.de registration.",
      usp: "ISO 14001 certified. Proven methodology reducing municipal energy consumption by 35%. Fully compliant with German public procurement law (GWB).",
      communication_channels: ["email", "video"],
      security_requirements: ["ISO27001"],
      privacy_policy_agreed: true,
      segments: ["b2g"],
      b2g_data: {
        target_procurement_frameworks: ["DTVP", "vergabe.de", "TED"],
        target_agencies: ["BMI", "BMWK", "KfW"],
        typical_lot_value: "€200K–€1.5M",
        previous_public_sector_work: false,
      },
      status: "converted",
      session_id: `sess_atlas_${Date.now()}`,
      submitted_at: iso(-16),
      converted_to_client_id: c3.id,
      ai_evaluation: {
        recommendation: "proceed",
        reasoning:
          "Clear B2G intent with specific target agencies. Compliance certifications are strong. Revenue and readiness scores are lower — proposal should include upskilling component.",
        qualityScore: 68,
        evaluatedAt: iso(-15),
      },
      created_at: iso(-18),
      updated_at: iso(-16),
    })
    .select("*")
    .single();
  if (qErr3) err("Questionnaire 3", qErr3);
  ok("Questionnaire — Atlas Ventures GmbH", q3);

  await supabase.from("clients").update({ questionnaire_id: q3!.id }).eq("id", c3.id);

  const { error: contactErr3 } = await supabase.from("contacts").insert({
    client_id: c3.id,
    name: "Klaus Weber",
    email: "k.weber@atlasventures.de",
    phone: "+49 89 21456789",
    job_title: "Founder & Managing Director",
    role: "primary",
    is_primary: true,
    notes: "Sole founder. Responds faster on email than phone. CET business hours only.",
    created_at: iso(-18),
    updated_at: iso(-18),
  });
  if (contactErr3) err("Contact 3", contactErr3);
  ok("Contact — Klaus Weber (Founder)", null);

  const { data: prop3, error: propErr3 } = await supabase
    .from("proposals")
    .insert({
      questionnaire_id: q3!.id,
      client_id: c3.id,
      title: "B2G Government Procurement Strategy — Atlas Ventures GmbH",
      proposal_ref: "AK-2025-0003-PROP-001",
      service_type: "b2g",
      status: "sent",
      valid_until: isoDate(21),
      commercials_locked: false,
      addons: {
        currency: "EUR",
        billingCycle: "monthly",
        paymentTerms: 30,
        paymentMethod: "bank_transfer",
        recurringItems: [
          { name: "B2G Procurement Strategy Retainer", monthly: 3200 },
          { name: "Tender Identification & Shortlisting", monthly: 1400 },
        ],
        oneTimeItems: [
          { name: "Procurement Readiness Audit", amount: 4800 },
          { name: "DTVP/vergabe.de Registration & Profile Setup", amount: 1200 },
        ],
      },
      sections: [
        {
          key: "executive_summary",
          title: "Executive Summary",
          content:
            "Atlas Ventures GmbH has the technical credentials to compete for German federal and municipal tenders. This programme will build the procurement capability and pipeline needed to win first contracts within 9 months.",
          order: 1,
          isVisible: true,
        },
        {
          key: "scope",
          title: "Scope of Services",
          content:
            "Procurement readiness audit, platform registration (DTVP, vergabe.de, TED), tender identification and qualification, bid writing support, and ongoing pipeline management.",
          order: 2,
          isVisible: true,
        },
        {
          key: "timeline",
          title: "Delivery Timeline",
          content:
            "Month 1: Readiness audit and gap analysis. Month 2: Platform registrations and profile optimisation. Month 3–4: First tender applications. Month 5–9: Active pipeline execution.",
          order: 3,
          isVisible: true,
        },
        {
          key: "commercials",
          title: "Commercial Terms",
          content:
            "Monthly retainer of €4,600 plus one-time readiness audit of €6,000. 30-day payment terms. EUR billing.",
          order: 4,
          isVisible: true,
        },
      ],
      approved_by_admin_at: iso(-10),
      sent_to_client_at: iso(-7),
      client_approved_at: null,
      admin_notes:
        "Sent to Klaus on 7th. No response yet. Follow up scheduled for end of week.",
      created_at: iso(-13),
      updated_at: iso(-7),
    })
    .select("*")
    .single();
  if (propErr3) err("Proposal 3", propErr3);
  ok("Proposal — AK-2025-0003-PROP-001 (sent, awaiting approval)", prop3);

  // KYC — pending (no documents yet)
  const { error: kycErr3 } = await supabase.from("kyc_verifications").insert({
    client_id: c3.id,
    status: "pending",
    company_name: "Atlas Ventures GmbH",
    company_reg_number: null,
    vat_number: null,
    country: "DE",
    director_name: "Klaus Weber",
    director_email: "k.weber@atlasventures.de",
    documents: [],
    verified_by: null,
    verified_at: null,
    notes: "Chased Klaus twice for Handelsregister extract and ID. Still outstanding.",
    created_at: iso(-15),
    updated_at: iso(-2),
  });
  if (kycErr3) err("KYC 3", kycErr3);
  ok("KYC — pending (documents outstanding)", null);

  const activityLog3 = [
    {
      type: "client_created",
      client_id: c3.id,
      questionnaire_id: q3!.id,
      metadata: { source: "questionnaire", company: "Atlas Ventures GmbH" },
      created_at: iso(-18),
    },
    {
      type: "questionnaire_submitted",
      client_id: c3.id,
      questionnaire_id: q3!.id,
      metadata: { contact: "Klaus Weber", score: 68 },
      created_at: iso(-16),
    },
    {
      type: "questionnaire_proceed",
      client_id: c3.id,
      questionnaire_id: q3!.id,
      metadata: { recommendation: "proceed" },
      created_at: iso(-15),
    },
    {
      type: "client_stage_changed",
      client_id: c3.id,
      metadata: { from: "questionnaire", to: "proposal" },
      created_at: iso(-13),
    },
  ];
  const { error: actErr3 } = await supabase.from("activity_log").insert(activityLog3);
  if (actErr3) err("Activity log 3", actErr3);
  ok(`Activity log — ${activityLog3.length} entries`, null);

  console.log(`  → Client 3 ID: ${c3.id}\n`);

  // ─────────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║              SEED COMPLETE                   ║");
  console.log("╚══════════════════════════════════════════════╝\n");
  console.log("  CLIENT 1  Nexora Group Ltd         stage=active    ref=AK-2025-0001");
  console.log(`            ID: ${c1.id}`);
  console.log("            Login: james.mitchell@nexoragroup.co.uk / TestClient1!\n");
  console.log("  CLIENT 2  Brightfield Consulting   stage=contract  ref=AK-2025-0002");
  console.log(`            ID: ${c2.id}`);
  console.log("            Login: s.chen@brightfieldconsulting.com / TestClient2!\n");
  console.log("  CLIENT 3  Atlas Ventures GmbH      stage=proposal  ref=AK-2025-0003");
  console.log(`            ID: ${c3.id}`);
  console.log("            Login: k.weber@atlasventures.de / TestClient3!\n");
  console.log("  Tables seeded:");
  console.log("    clients, users (auth + app), questionnaires, contacts,");
  console.log("    proposals, contracts, invoices, kyc_verifications,");
  console.log("    milestones (client 1), meetings (client 1), activity_log\n");
}

main().catch((e) => {
  console.error("\n[FATAL]", e.message ?? e);
  process.exit(1);
});
