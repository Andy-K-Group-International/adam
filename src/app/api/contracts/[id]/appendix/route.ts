import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries/users";
import { uploadContractFile } from "@/lib/supabase/storage";
import { createFile } from "@/lib/supabase/queries/contract-files";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",      // .xlsx
  "image/png",
  "image/jpeg",
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contractId } = await params;

  if (!UUID_RE.test(contractId)) {
    return NextResponse.json({ error: "Invalid contract id" }, { status: 400 });
  }

  const authClient = await createClient();
  const user = await getCurrentUser(authClient);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: contract } = await supabase
    .from("contracts")
    .select("client_id")
    .eq("id", contractId)
    .single();
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const isStaff = user.role === "admin" || user.role === "staff";
  const isOwner = user.role === "client" && user.client_id === contract.client_id;
  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const slot = formData.get("slot") as string | null;

  if (!file || !slot) {
    return NextResponse.json({ error: "Missing file or slot" }, { status: 400 });
  }

  // Matches the KYC upload route's validation — the appendix path had none
  // of this before (no size cap, no MIME check, client-side accept="" only).
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const { path, error: uploadError } = await uploadContractFile(supabase, file, contractId);
  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 500 });
  }

  const created = await createFile(supabase, {
    contract_id: contractId,
    storage_key: path,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    category: "appendix",
    slot,
    uploaded_by: user.id,
  });

  return NextResponse.json({ file: created });
}
