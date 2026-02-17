"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import ContractCard from "@/components/dashboard/ContractCard";
import QuestionnairePreview from "@/components/admin/QuestionnairePreview";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import type { Id } from "../../../../../convex/_generated/dataModel";

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

type Tab = "overview" | "contracts" | "questionnaire" | "activity";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as Id<"clients">;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const client = useQuery(api.clients.getById, { id: clientId });
  const activities = useQuery(api.activityLog.listForClient, { clientId });

  const questionnaireId = client?.questionnaireId;
  const questionnaire = useQuery(
    api.questionnaires.getById,
    questionnaireId ? { id: questionnaireId } : "skip"
  );

  if (client === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Client not found</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "contracts", label: `Contracts (${client.contracts?.length || 0})` },
    { key: "questionnaire", label: "Questionnaire" },
    { key: "activity", label: "Activity" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clients"
            className="text-muted-2 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">
                {client.companyName}
              </h1>
              <span
                className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  stageColors[client.stage] || "bg-grid-300 text-muted"
                )}
              >
                {stageLabels[client.stage] || client.stage}
              </span>
            </div>
            <p className="text-sm text-muted-2 mt-0.5">
              Created {formatDate(client.createdAt)}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/contracts/new?clientId=${clientId}`}
          className="inline-flex items-center gap-2 bg-highlight text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors"
        >
          New Contract
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-grid-300">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.key
                ? "border-highlight text-highlight"
                : "border-transparent text-muted-2 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-2 shrink-0" />
                <span className="text-sm text-foreground">{client.companyName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-2 shrink-0" />
                <span className="text-sm text-foreground">{client.contactEmail}</span>
              </div>
              {client.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-2 shrink-0" />
                  <span className="text-sm text-foreground">{client.contactPhone}</span>
                </div>
              )}
              {client.websiteUrl && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-2 shrink-0" />
                  <a
                    href={client.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-highlight hover:underline"
                  >
                    {client.websiteUrl}
                  </a>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-2 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">
                    {client.address.line1}
                    {client.address.line2 ? `, ${client.address.line2}` : ""}
                    <br />
                    {client.address.city}, {client.address.postcode}
                    <br />
                    {client.address.country}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-grid-300 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-2 mb-0.5">Stage</p>
                <p className="text-sm text-foreground">
                  {stageLabels[client.stage] || client.stage}
                </p>
              </div>
              {client.segments && client.segments.length > 0 && (
                <div>
                  <p className="text-xs text-muted-2 mb-1">Segments</p>
                  <div className="flex flex-wrap gap-1.5">
                    {client.segments.map((seg) => (
                      <span
                        key={seg}
                        className="text-xs bg-highlight/10 text-highlight px-2 py-0.5 rounded-full"
                      >
                        {seg}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {client.billingCurrency && (
                <div>
                  <p className="text-xs text-muted-2 mb-0.5">Billing Currency</p>
                  <p className="text-sm text-foreground">{client.billingCurrency}</p>
                </div>
              )}
              {client.notes && (
                <div>
                  <p className="text-xs text-muted-2 mb-0.5">Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "contracts" && (
        <div>
          {(client.contracts || []).length === 0 ? (
            <div className="bg-white rounded-xl border border-grid-300 p-8 text-center">
              <p className="text-muted-2 mb-4">No contracts yet</p>
              <Link
                href={`/admin/contracts/new?clientId=${clientId}`}
                className="inline-flex items-center gap-2 bg-highlight text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-highlight/90 transition-colors"
              >
                Create Contract
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(client.contracts || []).map((contract) => (
                <ContractCard
                  key={contract._id}
                  id={contract._id}
                  title={contract.title}
                  status={contract.status}
                  stage={client.stage}
                  updatedAt={contract.updatedAt}
                  isAdmin
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "questionnaire" && (
        <div>
          {questionnaire ? (
            <QuestionnairePreview questionnaire={questionnaire as never} />
          ) : (
            <div className="bg-white rounded-xl border border-grid-300 p-8 text-center">
              <p className="text-muted-2">
                {client.questionnaireId
                  ? "Loading questionnaire..."
                  : "No questionnaire linked to this client."}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white rounded-xl border border-grid-300 p-4">
          <ActivityFeed activities={activities || []} />
        </div>
      )}
    </div>
  );
}
