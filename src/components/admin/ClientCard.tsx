"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Building2, Mail, FileText } from "lucide-react";

interface ClientCardProps {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  stage: string;
  contractCount: number;
}

const stageColors: Record<string, string> = {
  questionnaire: "bg-grid-300 text-muted",
  proposal: "bg-info/10 text-info",
  strategy: "bg-highlight/10 text-highlight",
  contract: "bg-warning/10 text-warning",
  invoice: "bg-success/10 text-success",
  kickoff: "bg-success/10 text-success",
};

const stageLabels: Record<string, string> = {
  questionnaire: "Questionnaire",
  proposal: "Proposal",
  strategy: "Strategy",
  contract: "Contract",
  invoice: "Invoice",
  kickoff: "Kick-off",
};

export default function ClientCard({
  id,
  companyName,
  contactName,
  contactEmail,
  stage,
  contractCount,
}: ClientCardProps) {
  return (
    <Link
      href={`/admin/clients/${id}`}
      className="block bg-white rounded-lg border border-grid-300 p-3 hover:border-grid-500 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-3.5 w-3.5 text-muted shrink-0" />
          <p className="text-sm font-semibold text-foreground truncate">
            {companyName}
          </p>
        </div>
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ml-2",
            stageColors[stage] || "bg-grid-300 text-muted"
          )}
        >
          {stageLabels[stage] || stage}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-muted-2 truncate">{contactName}</p>
        <div className="flex items-center gap-1 text-xs text-muted-2">
          <Mail className="h-3 w-3 shrink-0" />
          <span className="truncate">{contactEmail}</span>
        </div>
        {contractCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-2">
            <FileText className="h-3 w-3 shrink-0" />
            <span>
              {contractCount} contract{contractCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
