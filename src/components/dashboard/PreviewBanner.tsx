"use client";

import { AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePreviewContext } from "@/lib/preview-context";

export default function PreviewBanner() {
  const { isPreview, previewClientId, previewClientName } = usePreviewContext();
  const router = useRouter();

  if (!isPreview) return null;

  const handleExit = () => {
    if (previewClientId) {
      router.push(`/admin/clients/${previewClientId}`);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-4 px-5 py-3 bg-warning/10 border-b border-warning/30">
      <div className="flex items-center gap-2 text-warning text-sm font-medium">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          Admin Preview Mode
          {previewClientName ? (
            <> &mdash; viewing as <strong>{previewClientName}</strong></>
          ) : null}
        </span>
      </div>
      <button
        onClick={handleExit}
        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-warning/20 border border-warning/40 text-warning text-xs font-medium hover:bg-warning/30 transition-colors shrink-0"
      >
        <X className="h-3.5 w-3.5" />
        Exit Preview
      </button>
    </div>
  );
}
