"use client";

import { Users, FileText, AlertTriangle, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  totalClients: number;
  activeContracts: number;
  pendingActions: number;
  newQuestionnaires: number;
}

const cards = [
  {
    key: "totalClients",
    label: "Total Clients",
    icon: Users,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    key: "activeContracts",
    label: "Active Contracts",
    icon: FileText,
    color: "text-highlight",
    bgColor: "bg-highlight/10",
  },
  {
    key: "pendingActions",
    label: "Pending Actions",
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    key: "newQuestionnaires",
    label: "New Questionnaires",
    icon: ClipboardList,
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export default function StatsCards({
  totalClients,
  activeContracts,
  pendingActions,
  newQuestionnaires,
}: StatsCardsProps) {
  const values = {
    totalClients,
    activeContracts,
    pendingActions,
    newQuestionnaires,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
