"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/queries/users";
import { AI_MODE_LABELS } from "@/lib/ai/config";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Bot, Info } from "lucide-react";

export default function AISettingsPage() {
  const [user, setUser] = useState<any | undefined>(undefined);
  const [client, setClient] = useState<any | null>(null);

  useEffect(() => {
    const supabase = createClient();
    getCurrentUser(supabase).then(async (u) => {
      setUser(u ?? null);
      if (u?.client_id) {
        const { data } = await supabase
          .from("clients")
          .select("ai_mode, ai_usage_limit_monthly, ai_generation_logs_enabled")
          .eq("id", u.client_id)
          .maybeSingle();
        setClient(data ?? null);
      }
    });
  }, []);

  if (user === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  const mode = client?.ai_mode ?? "basic";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
          <Bot className="h-6 w-6 text-highlight" />
          AI Settings
        </h1>
        <p className="text-muted text-sm mt-1">
          Your current AI configuration. AI features are optional — A.D.A.M. works fully without AI.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-grid-300 divide-y divide-grid-300">
        <div className="flex items-start gap-4 px-6 py-4">
          <span className="w-36 shrink-0 text-xs font-mono text-muted-2 pt-0.5">AI mode</span>
          <span className="text-sm text-foreground font-medium">
            {AI_MODE_LABELS[mode as keyof typeof AI_MODE_LABELS] ?? mode}
          </span>
        </div>
        {client?.ai_usage_limit_monthly && (
          <div className="flex items-start gap-4 px-6 py-4">
            <span className="w-36 shrink-0 text-xs font-mono text-muted-2 pt-0.5">Monthly limit</span>
            <span className="text-sm text-foreground">{client.ai_usage_limit_monthly.toLocaleString()} tokens</span>
          </div>
        )}
        <div className="flex items-start gap-4 px-6 py-4">
          <span className="w-36 shrink-0 text-xs font-mono text-muted-2 pt-0.5">Logging</span>
          <span className="text-sm text-foreground">{client?.ai_generation_logs_enabled !== false ? "Enabled" : "Disabled"}</span>
        </div>
      </div>

      <div className="border border-highlight/20 bg-highlight/5 rounded-xl px-5 py-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-highlight mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">AI features are optional</p>
          <p className="text-sm text-muted-2">
            A.D.A.M. is fully functional without AI. All proposals, contracts, and documents
            can be created and managed using manual workflows. AI features assist content
            generation — they are never required.
          </p>
          <p className="text-sm text-muted-2 mt-2">
            To change your AI settings, contact{" "}
            <a href="mailto:ceo@andykgroup.com" className="text-highlight hover:underline underline-offset-2">
              ceo@andykgroup.com
            </a>
          </p>
        </div>
      </div>

      {(mode === "client_openai" || mode === "client_anthropic") && (
        <div className="border border-grid-300 bg-white rounded-xl px-5 py-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            {mode === "client_openai" ? "OpenAI" : "Anthropic"} API Key
          </p>
          <p className="text-sm text-muted-2">
            Your account is configured to use your own API key. Secure key management is handled
            by your account administrator. Keys are stored encrypted and never shown in the interface.
          </p>
          <p className="text-xs font-mono text-muted-2">
            Status: configured — contact support if you need to update your key
          </p>
        </div>
      )}
    </div>
  );
}
