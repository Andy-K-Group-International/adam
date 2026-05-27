"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getContractById, markViewed, requestChanges, clientSign } from "@/lib/supabase/queries/contracts";
import { listByContract as getCommentsByContract } from "@/lib/supabase/queries/contract-comments";
import { listByContract as getVersionsByContract } from "@/lib/supabase/queries/contract-versions";
import ContractViewer from "@/components/contracts/ContractViewer";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ClientRequestForm from "@/components/dashboard/ClientRequestForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePreviewContext } from "@/lib/preview-context";

export default function ContractPage() {
  const params = useParams();
  const contractId = params.id as string;
  const { user } = useCurrentUser();
  const { isPreview, previewClientId } = usePreviewContext();

  const [contract, setContract] = useState<any | undefined>(undefined);
  const [comments, setComments] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const markedViewedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      const [contractData, commentsData, versionsData] = await Promise.all([
        getContractById(supabase, contractId),
        getCommentsByContract(supabase, contractId),
        getVersionsByContract(supabase, contractId),
      ]);
      setContract(contractData);
      setComments(commentsData);
      setVersions(versionsData);
    }

    fetchData();
  }, [contractId]);

  // Auto-mark as viewed (suppressed in preview mode — admin visit must not affect contract state)
  useEffect(() => {
    if (contract && contract.status === "published" && !markedViewedRef.current && user && !isPreview) {
      markedViewedRef.current = true;
      const supabase = createClient();
      markViewed(supabase, contractId, user.id).then((updated) => {
        if (updated) setContract(updated);
      });
    }
  }, [contract, contractId, user, isPreview]);

  if (contract === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-2">Contract not found</p>
      </div>
    );
  }

  const canSign =
    contract.status === "viewed" || contract.status === "published";
  const canRequestChanges =
    contract.status === "viewed" || contract.status === "published";

  return (
    <div>
      {isPreview && (canSign || canRequestChanges) && (
        <div className="flex items-center gap-2 rounded-lg bg-warning/8 border border-warning/20 px-4 py-2.5 text-xs text-warning mb-4">
          <span>Preview only — signing and change requests are disabled.</span>
        </div>
      )}
      <ContractViewer
        contract={contract}
        comments={comments || []}
        versions={versions || []}
        canSign={isPreview ? false : canSign}
        canRequestChanges={isPreview ? false : canRequestChanges}
        onSign={async (signature) => {
          if (!user) return;
          const supabase = createClient();
          const updated = await clientSign(supabase, contractId, user.id, signature);
          if (updated) setContract(updated);
        }}
        onRequestChanges={async (comment) => {
          if (!user) return;
          const supabase = createClient();
          const updated = await requestChanges(supabase, contractId, user.id, comment);
          if (updated) setContract(updated);
        }}
        backHref={isPreview && previewClientId ? `/dashboard?preview=${previewClientId}` : "/dashboard"}
      />
      <div className="max-w-3xl mt-2">
        <ClientRequestForm
          documentType="contract"
          documentId={contractId}
          sections={contract.sections?.map((s: { id: string; title: string }) => ({ id: s.id, title: s.title }))}
        />
      </div>
    </div>
  );
}
