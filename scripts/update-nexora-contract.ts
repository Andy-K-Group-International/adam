/**
 * Updates the Nexora Group Ltd contract with the full E2E template content.
 * Fixes: wrong company name, only 6 sections (needs 19), only 3 appendices (needs 5).
 *
 * Run:
 *   npx tsx scripts/update-nexora-contract.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { getContractTemplate } from "../src/lib/contract-templates";

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
      val = val.replace(/\\n/g, "").trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // rely on environment
  }
}

const root = join(__dirname, "..");
loadEnv(join(root, ".env.production.local"));
loadEnv(join(root, ".env.local"));
loadEnv(join(root, ".env"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── IDs ───────────────────────────────────────────────────────────────────────

const CONTRACT_ID = "9bce5553-796a-4b0d-bc3b-ef4aa968a9ba";

// ── Build template ────────────────────────────────────────────────────────────

const template = getContractTemplate("end_to_end", {
  clientName:   "James Harrington",
  clientCompany: "Nexora Group Ltd",
  clientAddress: "123 Innovation Drive, London, EC1A 1BB, United Kingdom",
  clientRef:    "AK-2025-0001",
  date:         "1 January 2025",
  packageName:  "End-to-End Business Development — Growth Package",
  monthlyFee:   "£8,500",
  currency:     "GBP",
});

// ── Merge appendices (preserve existing completed status) ─────────────────────

const updatedAppendices = [
  { slot: "appendix_a", label: "Appendix A — Scope of Work",                            required: true,  status: "completed" },
  { slot: "appendix_b", label: "Appendix B — Commercial Terms",                         required: true,  status: "completed" },
  { slot: "appendix_c", label: "Appendix C — Service Level Agreement",                  required: false, status: "empty" },
  {
    slot: "appendix_d",
    label: "Appendix D — Primary Contact Person",
    required: true,
    status: "completed",
    formData: {
      name:             "James Mitchell",
      role:             "CEO",
      email:            "james.mitchell@nexoragroup.co.uk",
      phone:            "+44 20 7946 0101",
      preferredChannel: "email",
    },
  },
  { slot: "appendix_e", label: "Appendix E — Target Market & Competitor Scope Definition", required: false, status: "empty" },
];

// ── Generate flat content string ───────────────────────────────────────────────

const flatContent = template.sections
  .map((s) => `${s.title}\n\n${s.content}`)
  .join("\n\n" + "─".repeat(60) + "\n\n");

// ── Run update ────────────────────────────────────────────────────────────────

async function run() {
  console.log(`Updating contract ${CONTRACT_ID}…`);
  console.log(`Template: "${template.title}"`);
  console.log(`Sections: ${template.sections.length}`);
  console.log(`Appendices: ${updatedAppendices.length}`);

  const { data, error } = await supabase
    .from("contracts")
    .update({
      title:      template.title,
      content:    flatContent,
      sections:   template.sections,
      appendices: updatedAppendices,
      service_type: "end_to_end",
      updated_at: new Date().toISOString(),
    })
    .eq("id", CONTRACT_ID)
    .select("id, title")
    .single();

  if (error) {
    console.error("Update failed:", error.message);
    process.exit(1);
  }

  console.log("✓ Contract updated:", data.title);
}

run();
