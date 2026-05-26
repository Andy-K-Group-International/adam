"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateClient } from "@/lib/supabase/queries/clients";
import { saveMarketAnalysisAction } from "@/app/actions/clients";
import type { Client, Questionnaire } from "@/lib/supabase/types";
import { Plus, Trash2, Sparkles, Save } from "lucide-react";
import { cn } from "@/lib/utils";

type Competitor = { name: string; strengths: string; weaknesses: string; market_share: string };

type Analysis = {
  market_overview: string;
  icp_definition: string;
  market_opportunities: string;
  risks_challenges: string;
  competitors: Competitor[];
};

const emptyAnalysis = (): Analysis => ({
  market_overview: "",
  icp_definition: "",
  market_opportunities: "",
  risks_challenges: "",
  competitors: [],
});

function Section({ label, value, onChange, rows = 5 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <label className="label-mono block mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-grid-500 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
      />
    </div>
  );
}

export default function AnalysisTab({
  clientId,
  initialAnalysis,
  questionnaire,
  companyName,
}: {
  clientId: string;
  initialAnalysis: Client["market_analysis"];
  questionnaire: Questionnaire | null;
  companyName: string;
}) {
  const [analysis, setAnalysis] = useState<Analysis>(
    initialAnalysis
      ? {
          market_overview: initialAnalysis.market_overview ?? "",
          icp_definition: initialAnalysis.icp_definition ?? "",
          market_opportunities: initialAnalysis.market_opportunities ?? "",
          risks_challenges: initialAnalysis.risks_challenges ?? "",
          competitors: initialAnalysis.competitors ?? [],
        }
      : emptyAnalysis()
  );
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (key: keyof Omit<Analysis, "competitors">, val: string) =>
    setAnalysis((prev) => ({ ...prev, [key]: val }));

  const addCompetitor = () =>
    setAnalysis((prev) => ({
      ...prev,
      competitors: [...prev.competitors, { name: "", strengths: "", weaknesses: "", market_share: "" }],
    }));

  const updateCompetitor = (idx: number, field: keyof Competitor, val: string) =>
    setAnalysis((prev) => {
      const next = prev.competitors.map((c, i) => i === idx ? { ...c, [field]: val } : c);
      return { ...prev, competitors: next };
    });

  const removeCompetitor = (idx: number) =>
    setAnalysis((prev) => ({ ...prev, competitors: prev.competitors.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    const result = await saveMarketAnalysisAction(clientId, analysis);
    setSaving(false);
    setMsg(result.error ? `Error: ${result.error}` : "Analysis saved.");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleGenerate = async () => {
    if (!questionnaire) return;
    setGenerating(true);
    setMsg("");
    try {
      const prompt = `You are a market analyst for Andy'K Group International LTD. Based on the following client questionnaire data, generate a detailed market analysis.

Client: ${companyName}
Country/Markets: ${questionnaire.countries_of_operation}
Industry/Products: ${questionnaire.products_services}
Business Goals: ${questionnaire.business_goals}
Challenges: ${questionnaire.challenges}
Competitors Mentioned: ${questionnaire.competitors ?? "Not specified"}
USP: ${questionnaire.usp}
Segments: ${questionnaire.segments?.join(", ") ?? "Not specified"}

Generate the following sections in JSON format exactly:
{
  "market_overview": "2-3 paragraphs about the market landscape relevant to this client",
  "icp_definition": "Detailed Ideal Customer Profile description",
  "market_opportunities": "Key market opportunities this client should pursue",
  "risks_challenges": "Key risks and challenges in this market",
  "competitors": [
    { "name": "competitor name", "strengths": "key strengths", "weaknesses": "key weaknesses", "market_share": "estimated market share" }
  ]
}
Return only the JSON object, no markdown.`;

      const res = await fetch("/api/ai/generate-market-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const json = await res.json();
      if (json.result) {
        const parsed = JSON.parse(json.result);
        setAnalysis({
          market_overview: parsed.market_overview ?? "",
          icp_definition: parsed.icp_definition ?? "",
          market_opportunities: parsed.market_opportunities ?? "",
          risks_challenges: parsed.risks_challenges ?? "",
          competitors: parsed.competitors ?? [],
        });
        setMsg("AI analysis generated. Review and save when ready.");
      }
    } catch (e) {
      setMsg("AI generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* AI Generate button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Market Analysis</h3>
          <p className="text-xs text-muted-2 mt-0.5">
            {questionnaire ? "AI can auto-generate from questionnaire data." : "No questionnaire linked — fill manually."}
          </p>
        </div>
        {questionnaire && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-highlight/40 text-highlight text-sm font-medium hover:bg-highlight/8 transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating…" : "Generate with AI"}
          </button>
        )}
      </div>

      {msg && (
        <div className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          msg.startsWith("Error")
            ? "bg-error/8 border-error/20 text-error"
            : "bg-success/8 border-success/20 text-success"
        )}>
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-grid-300 p-5 space-y-5">
        <Section label="Market Overview" value={analysis.market_overview} onChange={(v) => set("market_overview", v)} rows={6} />
        <Section label="ICP Definition (Ideal Customer Profile)" value={analysis.icp_definition} onChange={(v) => set("icp_definition", v)} rows={5} />
        <Section label="Market Opportunities" value={analysis.market_opportunities} onChange={(v) => set("market_opportunities", v)} />
        <Section label="Risks & Challenges" value={analysis.risks_challenges} onChange={(v) => set("risks_challenges", v)} />
      </div>

      {/* Competitor table */}
      <div className="bg-white rounded-xl border border-grid-300 p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground">Competitor Analysis</h4>
          <button
            onClick={addCompetitor}
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg border border-dashed border-grid-500 text-xs text-muted-2 hover:text-foreground hover:border-highlight/40 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Competitor
          </button>
        </div>
        {analysis.competitors.length === 0 ? (
          <p className="text-sm text-muted-2">No competitors added yet.</p>
        ) : (
          <div className="space-y-4">
            {analysis.competitors.map((c, idx) => (
              <div key={idx} className="rounded-lg border border-grid-300 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateCompetitor(idx, "name", e.target.value)}
                    placeholder="Competitor name"
                    className="flex-1 h-8 rounded-lg border border-grid-500 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-highlight/30"
                  />
                  <input
                    type="text"
                    value={c.market_share}
                    onChange={(e) => updateCompetitor(idx, "market_share", e.target.value)}
                    placeholder="Market share est."
                    className="w-36 h-8 rounded-lg border border-grid-500 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
                  />
                  <button
                    onClick={() => removeCompetitor(idx)}
                    className="h-8 w-8 flex items-center justify-center rounded text-muted-2 hover:text-error hover:bg-error/8 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-2 mb-1 block">Strengths</label>
                    <textarea
                      value={c.strengths}
                      onChange={(e) => updateCompetitor(idx, "strengths", e.target.value)}
                      rows={2}
                      placeholder="Key strengths…"
                      className="w-full rounded-lg border border-grid-500 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-2 mb-1 block">Weaknesses</label>
                    <textarea
                      value={c.weaknesses}
                      onChange={(e) => updateCompetitor(idx, "weaknesses", e.target.value)}
                      rows={2}
                      placeholder="Key weaknesses…"
                      className="w-full rounded-lg border border-grid-500 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving…" : "Save Analysis"}
      </button>
    </div>
  );
}
