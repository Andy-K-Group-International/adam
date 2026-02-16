"use client";

import { formatDate } from "@/lib/utils";
import { Clock } from "lucide-react";

interface Version {
  _id: string;
  version: number;
  changeNote?: string;
  createdAt: number;
}

interface VersionHistoryProps {
  versions: Version[];
}

export default function VersionHistory({ versions }: VersionHistoryProps) {
  if (versions.length === 0) {
    return (
      <p className="text-sm text-muted-2 text-center py-4">
        No version history
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <div
          key={version._id}
          className="flex items-start gap-3 p-3 bg-grid-300/30 rounded-lg"
        >
          <Clock className="h-4 w-4 text-muted-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Version {version.version}
            </p>
            {version.changeNote && (
              <p className="text-xs text-muted mt-0.5">
                {version.changeNote}
              </p>
            )}
            <p className="text-xs text-muted-2 mt-0.5">
              {formatDate(version.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
