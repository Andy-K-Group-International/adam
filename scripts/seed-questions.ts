/**
 * Reads data/questionItems.csv and upserts all rows into the question_items table.
 *
 * Run:
 *   npx tsx scripts/seed-questions.ts
 *
 * Loads credentials from .env.production.local (where Supabase keys live).
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
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file might not exist; rely on environment
  }
}

loadEnv(join(process.cwd(), ".env.production.local"));
loadEnv(join(process.cwd(), ".env.local"));

// ── CSV parser (RFC 4180) ─────────────────────────────────────────────────────

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"')             inQuotes = false;
      else                             field += ch;
    } else {
      if      (ch === '"')  inQuotes = true;
      else if (ch === ',')  { row.push(field); field = ""; }
      else if (ch === '\r') { /* skip */ }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else                  field += ch;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ── Field transformers ────────────────────────────────────────────────────────

function parseOptions(raw: string): { label: string; value: string }[] | null {
  if (!raw?.trim()) return null;
  return raw.split("|").map((opt) => {
    const trimmed = opt.trim();
    // Value is always the LAST parenthesised group; label is everything before it.
    const match = trimmed.match(/^(.*\S)\s+\(([^()]+)\)$/);
    if (!match) throw new Error(`Cannot parse option segment: "${trimmed}"`);
    return { label: match[1].trim(), value: match[2] };
  });
}

function parseConditionalOn(raw: string): { questionId: string; value: string } | null {
  if (!raw?.trim()) return null;
  const match = raw.trim().match(/^if\s+(\S+)\s+=\s+(.+)$/);
  if (!match) throw new Error(`Cannot parse conditionalOn: "${raw}"`);
  return { questionId: match[1], value: match[2].trim() };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Prefer the project-local copy; fall back to the Desktop archive path.
  const csvPath =
    join(process.cwd(), "data", "questionItems.csv");

  console.log(`Reading CSV: ${csvPath}`);
  const raw = readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);

  if (rows.length < 2) {
    console.error("CSV appears empty or header-only");
    process.exit(1);
  }

  const headers = rows[0];
  console.log(`Headers: ${headers.join(", ")}`);
  console.log(`Data rows: ${rows.length - 1}`);

  // Column index map
  const idx = (name: string) => {
    const i = headers.indexOf(name);
    if (i === -1) throw new Error(`Header "${name}" not found in CSV`);
    return i;
  };

  const iNumber       = idx("number");
  const iQuestionId   = idx("questionId");
  const iQuestion     = idx("question");
  const iType         = idx("type");
  const iRequired     = idx("required");
  const iSection      = idx("section");
  const iSubsection   = idx("subsection");
  const iIsActive     = idx("isActive");
  const iOptions      = idx("options");
  const iPlaceholder  = idx("placeholder");
  const iConditional  = idx("conditionalOn");

  const records: Record<string, unknown>[] = [];
  const errors: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    // Skip blank trailing rows
    if (row.every((c) => !c.trim())) continue;

    const questionId = row[iQuestionId]?.trim();
    if (!questionId) continue;

    try {
      records.push({
        question_id:    questionId,
        number:         parseInt(row[iNumber], 10),
        question:       row[iQuestion]?.trim(),
        type:           row[iType]?.trim(),
        required:       row[iRequired]?.trim() === "true",
        section:        row[iSection]?.trim(),
        subsection:     row[iSubsection]?.trim(),
        is_active:      row[iIsActive]?.trim() === "true",
        options:        parseOptions(row[iOptions]),
        placeholder:    row[iPlaceholder]?.trim() || null,
        conditional_on: parseConditionalOn(row[iConditional]),
      });
    } catch (err) {
      errors.push(`Row ${r} (${questionId}): ${(err as Error).message}`);
    }
  }

  if (errors.length) {
    console.error("\nParse errors:");
    errors.forEach((e) => console.error(" ", e));
    process.exit(1);
  }

  console.log(`\nParsed ${records.length} records. Upserting…`);

  // Batch upsert in chunks of 50
  const CHUNK = 50;
  let inserted = 0;
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("question_items")
      .upsert(chunk, { onConflict: "question_id" });

    if (error) {
      console.error(`\nSupabase error on chunk starting at ${i}:`, error.message);
      process.exit(1);
    }
    inserted += chunk.length;
    process.stdout.write(`  ${inserted}/${records.length}\r`);
  }

  console.log(`\nDone. ${inserted} rows upserted into question_items.`);
}

main();
