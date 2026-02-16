"use client";

import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  ArrowRightLeft,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItem {
  id: string;
  type: "unsigned_contract" | "unverified_appendix" | "change_request" | "new_questionnaire";
  title: string;
  description: string;
  href: string;
  priority: "high" | "medium" | "low";
}

interface ActionItemsProps {
  items: ActionItem[];
}

const typeIcons: Record<ActionItem["type"], typeof FileText> = {
  unsigned_contract: FileText,
  unverified_appendix: ShieldCheck,
  change_request: ArrowRightLeft,
  new_questionnaire: ClipboardList,
};

const typeLabels: Record<ActionItem["type"], string> = {
  unsigned_contract: "Unsigned Contract",
  unverified_appendix: "Unverified Appendix",
  change_request: "Change Request",
  new_questionnaire: "New Questionnaire",
};

export default function ActionItems({ items }: ActionItemsProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-2">
        No pending actions
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = typeIcons[item.type] || FileText;
        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-start gap-3 px-4 py-3 rounded-lg border border-grid-300 bg-white hover:border-grid-500 hover:shadow-sm transition-all group"
          >
            <div className="relative mt-0.5">
              <div className="p-1.5 rounded-lg bg-grid-300">
                <Icon className="h-4 w-4 text-muted" />
              </div>
              {item.priority === "high" && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.title}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0",
                    item.type === "change_request"
                      ? "bg-warning/10 text-warning"
                      : item.type === "new_questionnaire"
                        ? "bg-success/10 text-success"
                        : "bg-info/10 text-info"
                  )}
                >
                  {typeLabels[item.type]}
                </span>
              </div>
              <p className="text-xs text-muted-2 truncate">{item.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-2 group-hover:text-highlight transition-colors mt-1 shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
