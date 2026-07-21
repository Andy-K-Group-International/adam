import { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "contract-files";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function uploadContractFile(
  supabase: SupabaseClient,
  file: File,
  contractId: string
): Promise<{ path: string; error: string | null }> {
  // contractId becomes the storage folder segment below — only the filename
  // was ever sanitized, so a caller passing a crafted contractId (this
  // function is exported and callable with any string) had no defense here.
  if (!UUID_RE.test(contractId)) {
    return { path: "", error: "Invalid contract id" };
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${contractId}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { path: "", error: error.message };
  }

  return { path, error: null };
}

export function getContractFileUrl(
  supabase: SupabaseClient,
  storageKey: string
): string {
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storageKey);

  return data.publicUrl;
}

export async function getSignedFileUrl(
  supabase: SupabaseClient,
  storageKey: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storageKey, expiresIn);

  if (error) {
    console.error("Failed to create signed URL:", error);
    return null;
  }

  return data.signedUrl;
}

export async function deleteContractFile(
  supabase: SupabaseClient,
  storageKey: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storageKey]);

  if (error) {
    console.error("Failed to delete file:", error);
    return false;
  }

  return true;
}
