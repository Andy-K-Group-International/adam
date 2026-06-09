"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function logAIGeneration({
  clientId,
  type,
  provider,
  tokensUsed,
  success,
  errorMessage,
}: {
  clientId: string | null;
  type: string;
  provider: string;
  tokensUsed?: number;
  success: boolean;
  errorMessage?: string;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from("ai_generation_logs").insert({
      client_id: clientId,
      type,
      provider,
      tokens_used: tokensUsed ?? null,
      success,
      error_message: errorMessage ?? null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // never throw — logging must not break the generation path
  }
}
