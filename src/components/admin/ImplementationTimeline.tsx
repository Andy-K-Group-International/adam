"use client";

import type { Client, Contract, Invoice, ActivityLog } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import {
  UserPlus, ClipboardList, FileSignature, Lightbulb, CheckCircle2,
  FileText, PenLine, Receipt, Banknote, Rocket, Zap,
} from "lucide-react";

interface TimelineEvent {
  key: string;
  label: string;
  icon: React.ElementType;
  date: string | null;
  completed: boolean;
  isCurrent?: boolean;
}

function buildTimeline(
  client: Client & { contracts: any[] },
  activities: ActivityLog[],
  invoices?: Invoice[]
): TimelineEvent[] {
  const actMap: Record<string, string> = {};
  for (const a of activities) {
    if (!actMap[a.type] || a.created_at < actMap[a.type]) {
      // keep earliest occurrence per type
    }
    actMap[a.type] = actMap[a.type]
      ? (a.created_at < actMap[a.type] ? a.created_at : actMap[a.type])
      : a.created_at;
  }

  const contracts: Contract[] = client.contracts ?? [];
  const ndaContract = contracts.find((c) => c.contract_type === "nda");
  const serviceContract = contracts.find(
    (c) => c.contract_type !== "nda" && c.contract_type !== "amendment"
  ) ?? contracts[0] ?? null;

  const invoice = invoices?.find((i) => i.status !== "cancelled") ?? null;
  const paidInvoice = invoices?.find((i) => i.status === "paid") ?? null;

  const STAGE_ORDER = ["questionnaire", "proposal", "strategy", "contract", "invoice", "kickoff", "active"];
  const currentStageIdx = STAGE_ORDER.indexOf(client.stage);

  const events: TimelineEvent[] = [
    {
      key: "lead_created",
      label: "Lead Created",
      icon: UserPlus,
      date: actMap["client_created"] ?? client.created_at,
      completed: true,
    },
    {
      key: "questionnaire_submitted",
      label: "Questionnaire Submitted",
      icon: ClipboardList,
      date: actMap["questionnaire_submitted"] ?? null,
      completed: currentStageIdx > 0,
    },
    {
      key: "nda_signed",
      label: "NDA Signed",
      icon: FileSignature,
      date: ndaContract?.client_signed_at ?? null,
      completed: !!ndaContract?.client_signed_at,
    },
    {
      key: "proposal_sent",
      label: "Proposal Sent",
      icon: Lightbulb,
      date: actMap["contract_published"] ?? null,
      completed: currentStageIdx >= 2,
    },
    {
      key: "proposal_approved",
      label: "Proposal Approved",
      icon: CheckCircle2,
      date: actMap["questionnaire_proceed"] ?? null,
      completed: currentStageIdx >= 2,
    },
    {
      key: "contract_published",
      label: "Contract Published",
      icon: FileText,
      date: serviceContract?.published_at ?? null,
      completed: !!serviceContract?.published_at,
    },
    {
      key: "contract_signed",
      label: "Contract Signed",
      icon: PenLine,
      date: serviceContract?.client_signed_at ?? null,
      completed: !!serviceContract?.client_signed_at,
    },
    {
      key: "invoice_sent",
      label: "Invoice Sent",
      icon: Receipt,
      date: invoice?.updated_at ?? null,
      completed: currentStageIdx >= 4,
    },
    {
      key: "invoice_paid",
      label: "Invoice Paid",
      icon: Banknote,
      date: paidInvoice?.paid_at ?? null,
      completed: !!paidInvoice?.paid_at,
    },
    {
      key: "kickoff_confirmed",
      label: "Kickoff Confirmed",
      icon: Rocket,
      date: client.kickoff_confirmed_at ?? null,
      completed: !!client.kickoff_confirmed_at,
    },
    {
      key: "client_activated",
      label: "Client Activated",
      icon: Zap,
      date: client.activated_at ?? null,
      completed: !!client.activated_at,
    },
  ];

  // Mark the first incomplete event as current
  let markedCurrent = false;
  return events.map((e) => {
    if (!e.completed && !markedCurrent) {
      markedCurrent = true;
      return { ...e, isCurrent: true };
    }
    return e;
  });
}

function formatTs(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ImplementationTimeline({
  client,
  activities,
  invoices,
}: {
  client: Client & { contracts: any[] };
  activities: ActivityLog[];
  invoices?: Invoice[];
}) {
  const events = buildTimeline(client, activities, invoices);

  return (
    <div className="bg-white rounded-xl border border-grid-300 p-5">
      <h3 className="text-sm font-semibold text-foreground mb-5">Implementation Journey</h3>
      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-grid-300" />

        <div className="space-y-1">
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.key} className="relative flex items-start gap-3 py-1.5">
                {/* dot */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center h-[18px] w-[18px] rounded-full shrink-0 mt-0.5",
                    event.completed
                      ? "bg-highlight"
                      : event.isCurrent
                      ? "bg-white border-2 border-highlight"
                      : "bg-white border-2 border-grid-500"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-2.5 w-2.5",
                      event.completed ? "text-white" : event.isCurrent ? "text-highlight" : "text-muted-2"
                    )}
                  />
                </div>

                <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
                  <span
                    className={cn(
                      "text-sm",
                      event.completed
                        ? "text-foreground font-medium"
                        : event.isCurrent
                        ? "text-highlight font-semibold"
                        : "text-muted-2"
                    )}
                  >
                    {event.label}
                    {event.isCurrent && (
                      <span className="ml-2 inline-block text-[10px] font-mono font-semibold text-highlight bg-highlight/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </span>
                  {event.date && (
                    <span className="text-xs text-muted-2 shrink-0">{formatTs(event.date)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
