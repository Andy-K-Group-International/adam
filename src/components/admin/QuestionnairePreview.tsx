"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionnaireData {
  _id: string;
  companyName: string;
  websiteUrl?: string;
  billingCurrency: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  dataEnrichmentConsent: boolean;
  socialProfiles?: string;
  countriesOfOperation: string;
  yearsInBusiness: string;
  annualRevenue?: string;
  productsServices: string;
  businessGoals: string;
  challenges: string;
  competitors?: string;
  usp: string;
  communicationChannels: string[];
  securityRequirements?: string[];
  privacyPolicyAgreed: boolean;
  segments: string[];
  b2bData?: Record<string, unknown>;
  b2gData?: Record<string, unknown>;
  adamData?: Record<string, unknown>;
  status: string;
  submittedAt?: number;
  createdAt: number;
}

interface QuestionnairePreviewProps {
  questionnaire: QuestionnaireData;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-grid-300 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 bg-grid-300/30 hover:bg-grid-300/50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted" />
        )}
      </button>
      {isOpen && <div className="px-5 py-4 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | boolean | string[] | null }) {
  if (value === undefined || value === null) return null;

  let displayValue: string;
  if (typeof value === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else if (Array.isArray(value)) {
    displayValue = value.join(", ");
  } else {
    displayValue = String(value);
  }

  return (
    <div>
      <p className="text-xs text-muted-2 mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{displayValue || "---"}</p>
    </div>
  );
}

function JsonPreview({ label, data }: { label: string; data?: Record<string, unknown> }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div>
      <p className="text-xs text-muted-2 mb-1">{label}</p>
      <div className="bg-grid-300/30 rounded-lg p-3 text-xs font-mono text-muted overflow-auto max-h-40">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="mb-1">
            <span className="text-highlight">{key}:</span>{" "}
            <span>{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuestionnairePreview({ questionnaire }: QuestionnairePreviewProps) {
  const q = questionnaire;

  return (
    <div className="space-y-4">
      {/* Company Information */}
      <Section title="Company Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Company Name" value={q.companyName} />
          <Field label="Website" value={q.websiteUrl} />
          <Field label="Billing Currency" value={q.billingCurrency} />
          <Field label="Years in Business" value={q.yearsInBusiness} />
          <Field label="Annual Revenue" value={q.annualRevenue} />
          <Field label="Countries of Operation" value={q.countriesOfOperation} />
        </div>
      </Section>

      {/* Contact Information */}
      <Section title="Contact Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contact Name" value={q.contactName} />
          <Field label="Email" value={q.contactEmail} />
          <Field label="Phone" value={q.contactPhone} />
          <Field label="Social Profiles" value={q.socialProfiles} />
        </div>
        <div className="pt-2">
          <p className="text-xs text-muted-2 mb-0.5">Address</p>
          <p className="text-sm text-foreground">
            {q.address.line1}
            {q.address.line2 ? `, ${q.address.line2}` : ""}
            <br />
            {q.address.city}, {q.address.postcode}
            <br />
            {q.address.country}
          </p>
        </div>
      </Section>

      {/* Business Details */}
      <Section title="Business Details">
        <Field label="Products / Services" value={q.productsServices} />
        <Field label="Business Goals" value={q.businessGoals} />
        <Field label="Challenges" value={q.challenges} />
        <Field label="Competitors" value={q.competitors} />
        <Field label="Unique Selling Proposition" value={q.usp} />
      </Section>

      {/* Segments */}
      <Section title="Selected Segments">
        <Field label="Segments" value={q.segments} />
        <JsonPreview label="B2B Data" data={q.b2bData as Record<string, unknown>} />
        <JsonPreview label="B2G Data" data={q.b2gData as Record<string, unknown>} />
        <JsonPreview label="ADAM License Data" data={q.adamData as Record<string, unknown>} />
      </Section>

      {/* Preferences & Compliance */}
      <Section title="Preferences & Compliance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Communication Channels" value={q.communicationChannels} />
          <Field label="Security Requirements" value={q.securityRequirements} />
          <Field label="Data Enrichment Consent" value={q.dataEnrichmentConsent} />
          <Field label="Privacy Policy Agreed" value={q.privacyPolicyAgreed} />
        </div>
      </Section>
    </div>
  );
}
