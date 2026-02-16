"use client";

import {
  FileText,
  Eye,
  PenTool,
  CheckCircle,
  MessageSquare,
  Upload,
  UserPlus,
  ClipboardList,
  ArrowRightLeft,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const activityIcons: Record<string, typeof FileText> = {
  contract_created: FileText,
  contract_published: FileText,
  contract_viewed: Eye,
  contract_changes_requested: ArrowRightLeft,
  contract_client_signed: PenTool,
  contract_countersigned: CheckCircle,
  contract_finalized: CheckCircle,
  appendix_uploaded: Upload,
  appendix_verified: CheckCircle,
  appendix_rejected: ArrowRightLeft,
  comment_added: MessageSquare,
  client_created: UserPlus,
  questionnaire_submitted: ClipboardList,
  client_stage_changed: ArrowRightLeft,
};

const activityLabels: Record<string, string> = {
  contract_created: "Contract created",
  contract_published: "Contract published",
  contract_viewed: "Contract viewed",
  contract_changes_requested: "Changes requested",
  contract_client_signed: "Contract signed by client",
  contract_countersigned: "Contract countersigned",
  contract_finalized: "Contract finalized",
  appendix_uploaded: "Appendix uploaded",
  appendix_verified: "Appendix verified",
  appendix_rejected: "Appendix rejected",
  comment_added: "Comment added",
  client_created: "Client created",
  questionnaire_submitted: "Questionnaire submitted",
  client_stage_changed: "Client stage changed",
};

interface ActivityItem {
  _id: string;
  type: string;
  createdAt: number;
  metadata?: Record<string, string>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-2">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type] || FileText;
        return (
          <div
            key={activity._id}
            className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-grid-300/50 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-grid-300 mt-0.5">
              <Icon className="h-3.5 w-3.5 text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                {activityLabels[activity.type] || activity.type}
              </p>
              <p className="text-xs text-muted-2">
                {formatRelativeTime(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
