"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { listSentReportsForClient, getClientReport } from "@/lib/supabase/queries/client-reports";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { ClientReport } from "@/lib/supabase/types";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const SECTION_LABELS: Record<string, string> = {
  executive_summary:   "Executive Summary",
  milestones_progress: "Milestones Progress",
  kpis:                "KPIs",
  next_period_goals:   "Next Period Goals",
  notes:               "Notes",
};

const SECTION_ORDER = ["executive_summary", "milestones_progress", "kpis", "next_period_goals", "notes"];

export default function DashboardReportsPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [reports, setReports] = useState<ClientReport[] | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ClientReport | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user?.client_id) { setReports([]); return; }
    const supabase = createClient();
    listSentReportsForClient(supabase, user.client_id)
      .then(setReports)
      .catch(() => setReports([]));
  }, [user, userLoading]);

  useEffect(() => {
    if (!selectedId) { setSelected(null); return; }
    const supabase = createClient();
    getClientReport(supabase, selectedId).then(setSelected).catch(() => setSelected(null));
  }, [selectedId]);

  const handleDownload = (report: ClientReport) => {
    const lines: string[] = [
      report.title,
      `Period: ${report.period === "monthly" ? "Monthly" : "Quarterly"}`,
      `Sent: ${report.sent_at ? formatDate(report.sent_at) : ""}`,
      "",
    ];
    SECTION_ORDER.forEach((key) => {
      const text = report.content[key];
      if (text?.trim()) {
        lines.push(`--- ${SECTION_LABELS[key] ?? key} ---`);
        lines.push(text.trim());
        lines.push("");
      }
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${report.title.replace(/\s+/g, "_")}.txt`;
    a.click();
  };

  if (reports === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  if (selectedId && selected) {
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => { setSelectedId(null); setSelected(null); }}
          className="flex items-center gap-2 text-muted-2 hover:text-foreground mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="label-mono mb-1">
              {selected.period === "monthly" ? "Monthly" : "Quarterly"} Report
              {selected.sent_at && ` · ${formatDate(selected.sent_at)}`}
            </p>
            <h1 className="text-2xl font-serif font-semibold text-foreground">{selected.title}</h1>
          </div>
          <button
            onClick={() => handleDownload(selected)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-grid-500 text-sm text-muted-2 hover:text-foreground hover:border-highlight/40 transition-colors shrink-0"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>

        <div className="bg-white rounded-xl border border-grid-300 p-8 space-y-7">
          {SECTION_ORDER.map((key) => {
            const text = selected.content[key];
            if (!text?.trim()) return null;
            return (
              <div key={key}>
                <h3 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b border-grid-300">
                  {SECTION_LABELS[key] ?? key}
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">Reports</h1>
        <p className="text-muted text-sm mt-1">Monthly and quarterly reports from your team.</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 py-16 text-center">
          <p className="text-muted-2 text-sm">No reports have been sent yet.</p>
          <p className="text-xs text-muted-2 mt-1">Your team will publish reports here as they become available.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-grid-300 divide-y divide-grid-300">
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-grid-300/20 transition-colors cursor-pointer"
              onClick={() => setSelectedId(r.id)}
            >
              <div className="h-9 w-9 rounded-lg bg-highlight/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-highlight" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                <p className="text-xs text-muted-2">
                  {r.period === "monthly" ? "Monthly" : "Quarterly"}
                  {r.sent_at && ` · ${formatDate(r.sent_at)}`}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(r); }}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-2 hover:text-foreground hover:bg-grid-300 transition-colors shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
