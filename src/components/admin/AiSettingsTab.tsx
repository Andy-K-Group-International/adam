"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AI_MODE_LABELS, AI_MODE_DESCRIPTIONS, type AIMode } from "@/lib/ai/config";
import { cn } from "@/lib/utils";
import { AlertTriangle, Lock, RefreshCw, Bot } from "lucide-react";

const MODES: AIMode[] = ["basic", "client_openai", "client_anthropic", "managed", "disabled"];
const FALLBACK_OPTIONS = ["basic", "disabled"];

interface Props {
  clientId: string;
}

export default function AiSettingsTab({ clientId }: Props) {
  const [loading, setLoading]         = useState(true);
  const [mode, setMode]               = useState<AIMode>("basic");
  const [usageLimit, setUsageLimit]   = useState("");
  const [fallback, setFallback]       = useState("basic");
  const [logsEnabled, setLogsEnabled] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("clients")
      .select("ai_mode, ai_usage_limit_monthly, ai_fallback_provider, ai_generation_logs_enabled")
      .eq("id", clientId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMode((data.ai_mode ?? "basic") as AIMode);
          setUsageLimit(String(data.ai_usage_limit_monthly ?? ""));
          setFallback(data.ai_fallback_provider ?? "basic");
          setLogsEnabled(data.ai_generation_logs_enabled ?? true);
        }
        setLoading(false);
      });
  }, [clientId]);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const patch = {
        ai_mode: mode,
        ai_usage_limit_monthly: usageLimit ? parseInt(usageLimit, 10) : null,
        ai_fallback_provider: fallback || null,
        ai_generation_logs_enabled: logsEnabled,
      };
      const { error } = await supabase.from("clients").update(patch).eq("id", clientId);
      if (error) throw error;
      setMsg({ text: "AI settings saved.", ok: true });
    } catch (err: unknown) {
      setMsg({ text: err instanceof Error ? err.message : "Save failed", ok: false });
    }
    setSaving(false);
  }

  if (loading) return <div className="py-8 text-sm text-muted-2">Loading…</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
          <Bot className="h-4 w-4 text-highlight" />
          AI Settings
        </h3>
        <p className="text-sm text-muted-2">Configure AI mode for this client. A.D.A.M. works fully without AI.</p>
      </div>

      {/* Mode selector */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-muted-2 uppercase tracking-wider">AI Mode</p>
        {MODES.map((m) => (
          <label key={m} className={cn(
            "flex items-start gap-3 p-4 border cursor-pointer transition-all",
            mode === m ? "border-highlight/40 bg-highlight/5" : "border-grid-300 bg-white hover:border-grid-500"
          )}>
            <input
              type="radio"
              name="ai_mode"
              value={m}
              checked={mode === m}
              onChange={() => setMode(m)}
              className="mt-0.5 accent-highlight"
            />
            <div>
              <p className="text-sm font-medium text-foreground">{AI_MODE_LABELS[m]}</p>
              <p className="text-xs text-muted-2 mt-0.5">{AI_MODE_DESCRIPTIONS[m]}</p>
            </div>
          </label>
        ))}
      </div>

      {mode === "disabled" && (
        <div className="border border-warning/25 bg-warning/5 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <p className="text-sm text-muted-2">
            AI is disabled for this client. All proposals, strategies, and summaries will use
            manual templates only. The client portal and all core features remain functional.
          </p>
        </div>
      )}

      {/* API Key fields — display only, saving disabled */}
      {(mode === "client_openai" || mode === "client_anthropic") && (
        <div className="border border-error/25 bg-error/5 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Lock className="h-4 w-4 text-error mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Secure key storage is pending implementation</p>
              <p className="text-xs text-muted-2">
                Do not enter live API keys until encrypted storage is confirmed.
                Key fields are shown for configuration planning only — saving is disabled.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-2 uppercase tracking-wider block">
              {mode === "client_openai" ? "OpenAI API Key" : "Anthropic API Key"}
            </label>
            <input
              type="password"
              disabled
              placeholder="sk-… (saving disabled — coming soon)"
              className="w-full border border-grid-300 bg-grid-100 px-3 py-2 text-sm font-mono text-muted-2 cursor-not-allowed opacity-60"
            />
            <p className="text-xs font-mono text-muted-2">Coming soon — encrypted storage</p>
          </div>
        </div>
      )}

      {/* Usage limit */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-muted-2 uppercase tracking-wider block">
          Monthly usage limit (tokens, optional)
        </label>
        <input
          type="number"
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
          placeholder="e.g. 100000"
          className="border border-grid-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-highlight/30 w-48"
        />
        <p className="text-xs text-muted-2">Leave blank for no limit.</p>
      </div>

      {/* Fallback */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-muted-2 uppercase tracking-wider block">
          Fallback provider (if primary fails)
        </label>
        <select
          value={fallback}
          onChange={(e) => setFallback(e.target.value)}
          className="border border-grid-500 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-highlight/30"
        >
          {FALLBACK_OPTIONS.map((o) => (
            <option key={o} value={o}>{o === "basic" ? "Basic (A.D.A.M. built-in)" : "Disabled (no fallback)"}</option>
          ))}
        </select>
      </div>

      {/* Logs toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={logsEnabled}
          onChange={(e) => setLogsEnabled(e.target.checked)}
          className="h-4 w-4 accent-highlight"
        />
        <span className="text-sm text-foreground">Enable AI generation logging for this client</span>
      </label>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-white text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
      >
        {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
        Save AI Settings
      </button>

      {msg && (
        <p className={cn("text-sm font-mono", msg.ok ? "text-success" : "text-error")}>
          {msg.ok ? "✓ " : "✗ "}{msg.text}
        </p>
      )}
    </div>
  );
}
