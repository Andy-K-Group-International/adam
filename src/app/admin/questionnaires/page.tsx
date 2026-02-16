"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { ClipboardList, UserPlus } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import type { Id } from "../../../../convex/_generated/dataModel";

const statusColors: Record<string, string> = {
  draft: "bg-grid-300 text-muted",
  submitted: "bg-info/10 text-info",
  converted: "bg-success/10 text-success",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  converted: "Converted",
};

export default function QuestionnairesPage() {
  const questionnaires = useQuery(api.questionnaires.list, {});
  const convertToClient = useMutation(api.clients.convertFromQuestionnaire);
  const router = useRouter();
  const [convertingId, setConvertingId] = useState<string | null>(null);

  if (questionnaires === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const handleConvert = async (questionnaireId: string) => {
    setConvertingId(questionnaireId);
    try {
      const clientId = await convertToClient({
        questionnaireId: questionnaireId as Id<"questionnaires">,
      });
      router.push(`/admin/clients/${clientId}`);
    } catch (err) {
      console.error("Failed to convert questionnaire:", err);
      setConvertingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Questionnaires</h1>
        <p className="text-muted mt-1">
          Review submitted questionnaires and convert them to clients.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300 bg-grid-300/30">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Company
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Contact
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Segments
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Submitted
                </th>
                <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(questionnaires || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-2">
                    <ClipboardList className="h-8 w-8 mx-auto mb-2 text-grid-500" />
                    No questionnaires submitted yet.
                  </td>
                </tr>
              ) : (
                (questionnaires || []).map((q) => (
                  <tr
                    key={q._id}
                    className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/questionnaires/${q._id}`}
                        className="text-sm font-medium text-foreground hover:text-highlight transition-colors"
                      >
                        {q.companyName}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-foreground">{q.contactName}</p>
                      <p className="text-xs text-muted-2">{q.contactEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {q.segments?.map((seg) => (
                          <span
                            key={seg}
                            className="text-[10px] bg-highlight/10 text-highlight px-1.5 py-0.5 rounded-full"
                          >
                            {seg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full",
                          statusColors[q.status] || "bg-grid-300 text-muted"
                        )}
                      >
                        {statusLabels[q.status] || q.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      {q.submittedAt ? formatDate(q.submittedAt) : "---"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/questionnaires/${q._id}`}
                          className="text-xs text-highlight hover:underline"
                        >
                          View
                        </Link>
                        {q.status === "submitted" && (
                          <button
                            onClick={() => handleConvert(q._id)}
                            disabled={convertingId === q._id}
                            className="inline-flex items-center gap-1 text-xs font-medium text-white bg-highlight hover:bg-highlight/90 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <UserPlus className="h-3 w-3" />
                            {convertingId === q._id
                              ? "Converting..."
                              : "Convert to Client"}
                          </button>
                        )}
                        {q.status === "converted" && q.convertedToClientId && (
                          <Link
                            href={`/admin/clients/${q.convertedToClientId}`}
                            className="text-xs text-success hover:underline"
                          >
                            View Client
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
