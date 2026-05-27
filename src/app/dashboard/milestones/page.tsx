"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { listMilestones } from "@/lib/supabase/queries/milestones";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Milestone, MilestoneStatus } from "@/lib/supabase/types";
import { Calendar, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ContextualHelp from "@/components/ui/ContextualHelp";

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; icon: React.ElementType; dot: string; text: string; bg: string }> = {
  pending:     { label: "Pending",     icon: Circle,       dot: "bg-muted-2",  text: "text-muted",   bg: "bg-grid-300/60" },
  in_progress: { label: "In Progress", icon: Clock,        dot: "bg-info",     text: "text-info",    bg: "bg-info/8" },
  completed:   { label: "Completed",   icon: CheckCircle2, dot: "bg-success",  text: "text-success", bg: "bg-success/8" },
  blocked:     { label: "Blocked",     icon: XCircle,      dot: "bg-error",    text: "text-error",   bg: "bg-error/8" },
};

export default function DashboardMilestonesPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [milestones, setMilestones] = useState<Milestone[] | undefined>(undefined);

  useEffect(() => {
    if (userLoading) return;
    if (!user?.client_id) { setMilestones([]); return; }
    const supabase = createClient();
    listMilestones(supabase, user.client_id)
      .then(setMilestones)
      .catch(() => setMilestones([]));
  }, [user, userLoading]);

  if (userLoading || milestones === undefined) return <LoadingSpinner className="min-h-[60vh]" />;

  const completed = milestones.filter((m) => m.status === "completed").length;
  const total = milestones.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const grouped: Record<MilestoneStatus, Milestone[]> = {
    in_progress: milestones.filter((m) => m.status === "in_progress"),
    pending:     milestones.filter((m) => m.status === "pending"),
    blocked:     milestones.filter((m) => m.status === "blocked"),
    completed:   milestones.filter((m) => m.status === "completed"),
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif font-semibold text-foreground">Project Milestones</h1>
          <ContextualHelp
            id="client-milestones"
            title="Milestones"
            description="Milestones track the progress of your implementation. Each milestone represents a key delivery checkpoint."
            position="right"
          />
        </div>
        <p className="text-muted text-sm mt-1">Track your project progress with Andy&#8217;K Group.</p>
      </div>

      {total === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 py-16 text-center">
          <p className="text-muted-2 text-sm">No milestones have been set yet.</p>
          <p className="text-xs text-muted-2 mt-1">Your team will add milestones as your project progresses.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall progress */}
          <div className="bg-white rounded-xl border border-grid-300 p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Overall Progress</h2>
                <p className="text-sm text-muted-2 mt-0.5">{completed} of {total} milestone{total !== 1 ? "s" : ""} completed</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-foreground font-serif">{progress}%</span>
              </div>
            </div>
            <div className="h-3 rounded-full bg-grid-300">
              <div
                className="h-3 rounded-full bg-highlight transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid grid-cols-4 gap-3 mt-4">
              {(["in_progress", "pending", "blocked", "completed"] as MilestoneStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const count = grouped[s].length;
                return (
                  <div key={s} className={cn("rounded-lg px-3 py-2.5 text-center", cfg.bg)}>
                    <p className={cn("text-xl font-bold", cfg.text)}>{count}</p>
                    <p className={cn("text-xs", cfg.text)}>{cfg.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestone groups */}
          {(["in_progress", "pending", "blocked", "completed"] as MilestoneStatus[]).map((status) => {
            const group = grouped[status];
            if (group.length === 0) return null;
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            return (
              <div key={status}>
                <h3 className={cn("flex items-center gap-2 text-sm font-semibold mb-3", cfg.text)}>
                  <Icon className="h-4 w-4" />
                  {cfg.label}
                </h3>
                <div className="bg-white rounded-xl border border-grid-300 divide-y divide-grid-300">
                  {group.map((m) => (
                    <div key={m.id} className="flex items-start gap-4 px-5 py-4">
                      <div className={cn("mt-0.5 h-2.5 w-2.5 rounded-full shrink-0", cfg.dot)} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          m.status === "completed" && "line-through text-muted-2",
                          m.status !== "completed" && "text-foreground",
                        )}>
                          {m.title}
                        </p>
                        {m.description && (
                          <p className="text-xs text-muted-2 mt-0.5">{m.description}</p>
                        )}
                      </div>
                      {m.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-2 shrink-0">
                          <Calendar className="h-3 w-3" />
                          {new Date(m.due_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </div>
                      )}
                      {m.completed_at && (
                        <div className="text-xs text-success shrink-0">
                          Done {new Date(m.completed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
