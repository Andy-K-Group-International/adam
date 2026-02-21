"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createFile } from "@/lib/supabase/queries/contract-files";
import { uploadContractFile } from "@/lib/supabase/storage";
import { Upload, CheckCircle, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Appendix {
  slot: string;
  label: string;
  required: boolean;
  fileId?: string;
  status: "empty" | "uploaded" | "verified" | "rejected";
  rejectionNote?: string;
}

interface AppendixUploadProps {
  contractId: string;
  appendices: Appendix[];
  canUpload: boolean;
  onUploadComplete?: () => void;
}

const statusIcons = {
  empty: null,
  uploaded: <FileText className="h-4 w-4 text-info" />,
  verified: <CheckCircle className="h-4 w-4 text-success" />,
  rejected: <XCircle className="h-4 w-4 text-error" />,
};

const statusLabels = {
  empty: "Not uploaded",
  uploaded: "Uploaded",
  verified: "Verified",
  rejected: "Rejected",
};

export default function AppendixUpload({
  contractId,
  appendices,
  canUpload,
  onUploadComplete,
}: AppendixUploadProps) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (slot: string, file: File) => {
    setUploading(slot);
    try {
      const supabase = createClient();
      const { path, error: uploadError } = await uploadContractFile(supabase, file, contractId);
      if (uploadError) throw new Error(uploadError);
      const { data: { user } } = await supabase.auth.getUser();
      await createFile(supabase, {
        contract_id: contractId,
        storage_key: path,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        category: "appendix",
        slot,
        uploaded_by: user?.id ?? "",
      });
      onUploadComplete?.();
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-2">
      {appendices.map((appendix) => (
        <div
          key={appendix.slot}
          className="flex items-center gap-3 p-3 bg-grid-300/30 rounded-lg"
        >
          <span className="text-xs font-bold text-muted-2 w-6">
            {appendix.slot}:
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">
              {appendix.label}
              {appendix.required && (
                <span className="text-error ml-1">*</span>
              )}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {statusIcons[appendix.status]}
              <span
                className={cn(
                  "text-xs",
                  appendix.status === "verified"
                    ? "text-success"
                    : appendix.status === "rejected"
                      ? "text-error"
                      : "text-muted-2"
                )}
              >
                {statusLabels[appendix.status]}
              </span>
            </div>
            {appendix.status === "rejected" && appendix.rejectionNote && (
              <p className="text-xs text-error mt-1">
                {appendix.rejectionNote}
              </p>
            )}
          </div>
          {canUpload && appendix.status !== "verified" && (
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(appendix.slot, file);
                }}
                disabled={uploading === appendix.slot}
              />
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  uploading === appendix.slot
                    ? "bg-grid-300 animate-pulse"
                    : "bg-highlight/10 text-highlight hover:bg-highlight/20"
                )}
              >
                <Upload className="h-3.5 w-3.5" />
              </div>
            </label>
          )}
        </div>
      ))}
    </div>
  );
}
