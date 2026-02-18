"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import QuestionnairePreview from "@/components/admin/QuestionnairePreview";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Id } from "../../../../../convex/_generated/dataModel";

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

export default function QuestionnaireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionnaireId = params.id as Id<"questionnaires">;

  const questionnaire = useQuery(api.questionnaires.getById, {
    id: questionnaireId,
  });
  const convertToClient = useMutation(api.clients.convertFromQuestionnaire);
  const [isConverting, setIsConverting] = useState(false);

  if (questionnaire === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (!questionnaire) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Questionnaire not found</p>
      </div>
    );
  }

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const clientId = await convertToClient({ questionnaireId });
      router.push(`/admin/clients/${clientId}`);
    } catch (err) {
      console.error("Failed to convert questionnaire:", err);
      setIsConverting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/questionnaires"
            className="text-muted-2 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">
                {questionnaire.companyName || "Untitled"}
              </h1>
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  statusColors[questionnaire.status] || "bg-grid-300 text-muted"
                )}
              >
                {statusLabels[questionnaire.status] || questionnaire.status}
              </span>
            </div>
            <p className="text-sm text-muted-2 mt-0.5">
              Questionnaire submission
              {questionnaire.submittedAt
                ? ` - ${formatDate(questionnaire.submittedAt)}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {questionnaire.status === "submitted" && (
            <button
              onClick={handleConvert}
              disabled={isConverting}
              className="inline-flex items-center gap-2 bg-highlight text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {isConverting ? "Converting..." : "Convert to Client"}
            </button>
          )}
          {questionnaire.status === "converted" && questionnaire.convertedToClientId && (
            <Link
              href={`/admin/clients/${questionnaire.convertedToClientId}`}
              className="inline-flex items-center gap-2 bg-success text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-success/90 transition-colors"
            >
              View Client
            </Link>
          )}
        </div>
      </div>

      {/* Questionnaire Preview */}
      <QuestionnairePreview questionnaire={questionnaire as never} />
    </div>
  );
}
