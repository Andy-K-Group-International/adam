"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/supabase/queries/users";
import { getKycByClientId } from "@/lib/supabase/queries/kyc";
import { submitKycAction } from "@/app/actions/kyc";
import type { KycVerification, KycDocumentType, KycDocument } from "@/lib/supabase/types";
import { User, Mail, ShieldCheck, ShieldX, Clock, Upload, FileText, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const DOC_SLOTS: { type: KycDocumentType; label: string; required: boolean }[] = [
  { type: "registry_extract",  label: "Company Registry Extract", required: true },
  { type: "id_passport",       label: "ID / Passport",            required: true },
  { type: "power_of_attorney", label: "Power of Attorney",        required: false },
];

function KycStatusBanner({ kyc }: { kyc: KycVerification }) {
  if (kyc.status === "verified") {
    return (
      <div className="rounded-xl bg-success/8 border border-success/20 p-5 flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-5 w-5 text-success" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">KYC Verified</p>
          <p className="text-sm text-muted-2 mt-0.5">
            Your identity and company have been verified. You can now proceed with contracts.
          </p>
          {kyc.verified_at && (
            <p className="text-xs text-muted-2 mt-1 font-mono">
              Verified on {new Date(kyc.verified_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (kyc.status === "pending") {
    return (
      <div className="rounded-xl bg-warning/8 border border-warning/20 p-5 flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-warning/15 flex items-center justify-center flex-shrink-0">
          <Clock className="h-5 w-5 text-warning" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Under Review</p>
          <p className="text-sm text-muted-2 mt-0.5">
            Your KYC submission is being reviewed. We'll notify you by email once complete.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any | undefined>(undefined);
  const [kyc, setKyc] = useState<KycVerification | null | undefined>(undefined);
  const [kycLoading, setKycLoading] = useState(true);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [country, setCountry] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [directorEmail, setDirectorEmail] = useState("");

  // Document state: { type, file (for new uploads), existingDoc }
  const [docs, setDocs] = useState<Record<KycDocumentType, KycDocument | null>>({
    registry_extract: null,
    id_passport: null,
    power_of_attorney: null,
  });
  const [uploading, setUploading] = useState<Partial<Record<KycDocumentType, boolean>>>({});
  const fileRefs = useRef<Partial<Record<KycDocumentType, HTMLInputElement | null>>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    const supabase = createClient();
    getCurrentUser(supabase).then((data) => {
      setUser(data ?? null);
      if (data?.client_id) {
        getKycByClientId(supabase, data.client_id)
          .then((kycData) => {
            setKyc(kycData);
            if (kycData) {
              setCompanyName(kycData.company_name ?? "");
              setRegNumber(kycData.company_reg_number ?? "");
              setVatNumber(kycData.vat_number ?? "");
              setCountry(kycData.country ?? "");
              setDirectorName(kycData.director_name ?? "");
              setDirectorEmail(kycData.director_email ?? "");
              const existingDocs: Record<KycDocumentType, KycDocument | null> = {
                registry_extract: null, id_passport: null, power_of_attorney: null,
              };
              for (const d of kycData.documents ?? []) {
                existingDocs[d.type as KycDocumentType] = d;
              }
              setDocs(existingDocs);
            }
          })
          .catch(() => setKyc(null))
          .finally(() => setKycLoading(false));
      } else {
        setKycLoading(false);
      }
    });
  }, []);

  const handleFileUpload = async (type: KycDocumentType, file: File) => {
    if (!user?.client_id) return;
    setUploading((p) => ({ ...p, [type]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("clientId", user.client_id);
      const res = await fetch("/api/kyc/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Upload failed");
      setDocs((p) => ({
        ...p,
        [type]: { type, path: json.path, name: json.name, uploaded_at: new Date().toISOString() },
      }));
    } catch (err: any) {
      setSubmitMsg(err.message ?? "Upload failed");
    } finally {
      setUploading((p) => ({ ...p, [type]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!user?.client_id) return;
    setSubmitting(true);
    setSubmitMsg("");
    const documentList = Object.values(docs).filter(Boolean) as KycDocument[];
    const result = await submitKycAction({
      clientId: user.client_id,
      companyName,
      companyRegNumber: regNumber,
      vatNumber,
      country,
      directorName,
      directorEmail,
      documents: documentList,
    });
    if (result.error) {
      setSubmitMsg(result.error);
    } else {
      setSubmitMsg("Submitted successfully. We'll review your documents and notify you by email.");
      setKyc((prev) => prev
        ? { ...prev, status: "pending", company_name: companyName, company_reg_number: regNumber, vat_number: vatNumber, country, director_name: directorName, director_email: directorEmail, documents: documentList }
        : { id: "", client_id: user.client_id, status: "pending", company_name: companyName, company_reg_number: regNumber, vat_number: vatNumber, country, director_name: directorName, director_email: directorEmail, documents: documentList, verified_by: null, verified_at: null, rejection_reason: null, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      );
    }
    setSubmitting(false);
  };

  if (user === undefined) return <LoadingSpinner className="min-h-[60vh]" />;
  if (!user) return <div className="text-center py-20"><p className="text-muted-2">Unable to load profile.</p></div>;

  const showKycForm = !kyc || kyc.status === "rejected";
  const isResubmit = kyc?.status === "rejected";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">Profile</h1>
        <p className="text-muted text-sm mt-1">Your account information and verification.</p>
      </div>

      {/* Account card */}
      <div className="bg-white rounded-xl border border-grid-300 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-highlight/10 flex items-center justify-center">
            <User className="h-7 w-7 text-highlight" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{user.first_name} {user.last_name}</h2>
            <p className="text-sm text-muted-2 capitalize">{user.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-muted-2" />
          <span className="text-foreground">{user.email}</span>
        </div>
      </div>

      {/* KYC section — only for clients */}
      {user.role === "client" && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-serif font-semibold text-foreground">KYC Verification</h2>
            <p className="text-sm text-muted-2 mt-0.5">
              Required before contract signing. All documents are stored securely.
            </p>
          </div>

          {kycLoading ? (
            <LoadingSpinner className="py-8" />
          ) : (
            <div className="space-y-4">
              {kyc && <KycStatusBanner kyc={kyc} />}

              {/* Rejection reason */}
              {kyc?.status === "rejected" && kyc.rejection_reason && (
                <div className="rounded-xl bg-error/6 border border-error/20 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-0.5">Action required</p>
                    <p className="text-sm text-muted-2">{kyc.rejection_reason}</p>
                  </div>
                </div>
              )}

              {showKycForm && (
                <div className="bg-white rounded-xl border border-grid-300 p-6 space-y-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    {isResubmit ? "Resubmit KYC" : "Submit KYC Verification"}
                  </h3>

                  {/* Company details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-mono block mb-1.5">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nexora Group Ltd"
                        className="w-full h-10 rounded-lg border border-grid-500 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                      />
                    </div>
                    <div>
                      <label className="label-mono block mb-1.5">Registration Number <span className="text-error">*</span></label>
                      <input
                        type="text"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                        placeholder="12345678"
                        className="w-full h-10 rounded-lg border border-grid-500 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                      />
                    </div>
                    <div>
                      <label className="label-mono block mb-1.5">VAT Number</label>
                      <input
                        type="text"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        placeholder="GB123456789"
                        className="w-full h-10 rounded-lg border border-grid-500 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                      />
                    </div>
                    <div>
                      <label className="label-mono block mb-1.5">Country <span className="text-error">*</span></label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="United Kingdom"
                        className="w-full h-10 rounded-lg border border-grid-500 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                      />
                    </div>
                    <div>
                      <label className="label-mono block mb-1.5">Director Name <span className="text-error">*</span></label>
                      <input
                        type="text"
                        value={directorName}
                        onChange={(e) => setDirectorName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full h-10 rounded-lg border border-grid-500 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                      />
                    </div>
                    <div>
                      <label className="label-mono block mb-1.5">Director Email</label>
                      <input
                        type="email"
                        value={directorEmail}
                        onChange={(e) => setDirectorEmail(e.target.value)}
                        placeholder="director@company.com"
                        className="w-full h-10 rounded-lg border border-grid-500 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                      />
                    </div>
                  </div>

                  {/* Document upload slots */}
                  <div>
                    <p className="label-mono mb-3">Documents</p>
                    <div className="space-y-2.5">
                      {DOC_SLOTS.map(({ type, label, required }) => {
                        const existing = docs[type];
                        const isUploading = uploading[type];
                        return (
                          <div
                            key={type}
                            className={cn(
                              "flex items-center justify-between p-3.5 rounded-lg border transition-colors",
                              existing ? "border-success/30 bg-success/4" : "border-grid-500 bg-white"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                existing ? "bg-success/10" : "bg-grid-300/60"
                              )}>
                                <FileText className={cn("h-4 w-4", existing ? "text-success" : "text-muted-2")} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {label}
                                  {required && <span className="text-error ml-1">*</span>}
                                </p>
                                {existing ? (
                                  <p className="text-xs text-muted-2 truncate">{existing.name}</p>
                                ) : (
                                  <p className="text-xs text-muted-2">PDF, JPG, PNG · max 10 MB</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              {existing && (
                                <button
                                  onClick={() => setDocs((p) => ({ ...p, [type]: null }))}
                                  className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-2 hover:text-error transition-colors"
                                  title="Remove"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => fileRefs.current[type]?.click()}
                                disabled={isUploading}
                                className={cn(
                                  "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors border disabled:opacity-50",
                                  existing
                                    ? "border-grid-500 text-muted-2 hover:text-foreground"
                                    : "border-highlight/40 text-highlight hover:bg-highlight/8"
                                )}
                              >
                                <Upload className="h-3.5 w-3.5" />
                                {isUploading ? "Uploading…" : existing ? "Replace" : "Upload"}
                              </button>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                className="hidden"
                                ref={(el) => { fileRefs.current[type] = el; }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(type, file);
                                  e.target.value = "";
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {submitMsg && (
                    <p className={cn("text-sm", submitMsg.includes("successfully") ? "text-success" : "text-error")}>
                      {submitMsg}
                    </p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !regNumber.trim() || !country.trim() || !directorName.trim() || !docs.registry_extract || !docs.id_passport}
                    className="relative inline-flex w-full items-center justify-center h-11 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck className="h-4 w-4 mr-2 relative z-10" />
                    <span className="relative z-10">
                      {submitting ? "Submitting…" : isResubmit ? "Resubmit for Review" : "Submit for Review"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
