"use client";

import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusCardsProps {
  totalContracts: number;
  pendingActions: number;
  completed: number;
}

const cards = [
  {
    key: "total",
    label: "Total Contracts",
    icon: FileText,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    key: "pending",
    label: "Pending Actions",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export default function StatusCards({
  totalContracts,
  pendingActions,
  completed,
}: StatusCardsProps) {
  const values = { total: totalContracts, pending: pendingActions, completed };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl border border-grid-300 p-5"
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", card.bgColor)}>
              <card.icon className={cn("h-5 w-5", card.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {values[card.key as keyof typeof values]}
              </p>
              <p className="text-sm text-muted-2">{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
