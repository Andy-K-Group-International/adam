"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getContractById, markViewed, requestChanges, clientSign } from "@/lib/supabase/queries/contracts";
import { listByContract as getCommentsByContract } from "@/lib/supabase/queries/contract-comments";
import { listByContract as getVersionsByContract } from "@/lib/supabase/queries/contract-versions";
import ContractViewer from "@/components/contracts/ContractViewer";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function ContractPage() {
  const params = useParams();
  const contractId = params.id as string;
  const { user } = useCurrentUser();

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

  // Auto-mark as viewed
  useEffect(() => {
    if (contract && contract.status === "published" && !markedViewedRef.current && user) {
      markedViewedRef.current = true;
      const supabase = createClient();
      markViewed(supabase, contractId, user.id).then((updated) => {
        if (updated) setContract(updated);
      });
    }
  }, [contract, contractId, user]);

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
    <ContractViewer
      contract={contract}
      comments={comments || []}
      versions={versions || []}
      canSign={canSign}
      canRequestChanges={canRequestChanges}
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
      backHref="/dashboard"
    />
  );
}
