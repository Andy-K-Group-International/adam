"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient as createSupabase } from "@/lib/supabase/client";
import { getClientById } from "@/lib/supabase/queries/clients";
import { createClientReport, updateClientReport } from "@/lib/supabase/queries/client-reports";
import { sendClientReportAction } from "@/app/actions/clients";
import type { Client, ReportPeriod } from "@/lib/supabase/types";
import { ArrowLeft, Save, Send, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const SECTIONS = [
  { key: "executive_summary",     label: "Executive Summary" },
  { key: "milestones_progress",   label: "Milestones Progress" },
  { key: "kpis",                  label: "KPIs" },
  { key: "next_period_goals",     label: "Next Period Goals" },
  { key: "notes",                 label: "Notes" },
] as const;

type SectionKey = typeof SECTIONS[number]["key"];

export default function NewClientReportPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const router = useRouter();
  const supabase = createSupabase();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<Record<SectionKey, string>>({
    executive_summary: "",
    milestones_progress: "",
    kpis: "",
    next_period_goals: "",
    notes: "",
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getClientById(supabase, clientId)
      .then((c) => {
        setClient(c);
        const month = new Date().toLocaleString("en-GB", { month: "long", year: "numeric" });
        setTitle(`${month} Report`);
      })
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [clientId]);

  const handleSaveDraft = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setMsg("");
    try {
      if (reportId) {
        await updateClientReport(supabase, reportId, { title: title.trim(), period, content });
      } else {
        const row = await createClientReport(supabase, {
          client_id: clientId,
          title: title.trim(),
          period,
          content,
        });
        setReportId(row.id);
      }
      setMsg("Draft saved.");
      setTimeout(() => setMsg(""), 3000);
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim()) return;
    setSending(true);
    setMsg("");
    try {
      let id = reportId;
      if (!id) {
        const row = await createClientReport(supabase, {
          client_id: clientId,
          title: title.trim(),
          period,
          content,
        });
        id = row.id;
        setReportId(id);
      } else {
        await updateClientReport(supabase, id, { title: title.trim(), period, content });
      }
      const result = await sendClientReportAction(id);
      if (result.error) {
        setMsg(`Send error: ${result.error}`);
      } else {
        setMsg("Report sent to client.");
        setTimeout(() => router.push(`/admin/clients/${clientId}`), 1500);
      }
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner className="min-h-[60vh]" />;
  if (!client) return <div className="py-20 text-center text-sm text-muted-2">Client not found.</div>;

  const periodLabel = period === "monthly" ? "Monthly" : "Quarterly";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/clients/${clientId}`} className="text-muted-2 hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-serif font-semibold text-foreground">New Client Report</h1>
          <p className="text-sm text-muted-2">{client.company_name}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white rounded-xl border border-grid-300 p-5 mb-5 space-y-4">
        <div>
          <label className="label-mono block mb-2">Report Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. May 2026 Monthly Report"
            className="w-full h-10 rounded-lg border border-grid-500 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
          />
        </div>
        <div>
          <label className="label-mono block mb-2">Period</label>
          <div className="flex gap-2">
            {(["monthly", "quarterly"] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "h-9 px-4 rounded-lg text-sm font-medium transition-colors border",
                  period === p
                    ? "bg-highlight text-white border-highlight"
                    : "bg-white text-muted border-grid-500 hover:bg-grid-300"
                )}
              >
                {p === "monthly" ? "Monthly" : "Quarterly"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview toggle */}
      <div className="flex items-center justify-end mb-3">
        <button
          onClick={() => setPreview(!preview)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-grid-500 text-xs text-muted-2 hover:text-foreground transition-colors"
        >
          {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        /* Preview pane */
        <div className="bg-white rounded-xl border border-grid-300 p-8 space-y-6">
          <div>
            <p className="label-mono mb-1">{periodLabel} Report · {client.company_name}</p>
            <h2 className="text-2xl font-serif font-semibold text-foreground">{title || "Untitled Report"}</h2>
          </div>
          {SECTIONS.map((s) => content[s.key] && (
            <div key={s.key}>
              <h3 className="text-sm font-semibold text-foreground mb-2">{s.label}</h3>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{content[s.key]}</p>
            </div>
          ))}
        </div>
      ) : (
        /* Edit sections */
        <div className="space-y-4">
          {SECTIONS.map((s) => (
            <div key={s.key} className="bg-white rounded-xl border border-grid-300 p-5">
              <label className="label-mono block mb-2">{s.label}</label>
              <textarea
                value={content[s.key]}
                onChange={(e) => setContent((prev) => ({ ...prev, [s.key]: e.target.value }))}
                rows={5}
                placeholder={`${s.label}…`}
                className="w-full rounded-lg border border-grid-500 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            </div>
          ))}
        </div>
      )}

      {/* Status message */}
      {msg && (
        <div className={cn(
          "mt-4 rounded-lg border px-4 py-3 text-sm",
          msg.startsWith("Error") || msg.startsWith("Send error")
            ? "bg-error/8 border-error/20 text-error"
            : "bg-success/8 border-success/20 text-success"
        )}>
          {msg}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleSaveDraft}
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-grid-300 text-foreground text-sm font-medium hover:bg-grid-500 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Draft"}
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !title.trim()}
          className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending…" : "Send to Client"}
        </button>
        <Link
          href={`/admin/clients/${clientId}`}
          className="text-sm text-muted-2 hover:text-foreground transition-colors ml-2"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
