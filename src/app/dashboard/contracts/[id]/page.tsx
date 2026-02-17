"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import ContractViewer from "@/components/contracts/ContractViewer";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function ContractPage() {
  const params = useParams();
  const contractId = params.id as Id<"contracts">;

  const contract = useQuery(api.contracts.getById, { id: contractId });
  const comments = useQuery(api.contractComments.listByContract, {
    contractId,
  });
  const versions = useQuery(api.contractVersions.listByContract, {
    contractId,
  });

  const markViewed = useMutation(api.contracts.markViewed);
  const requestChanges = useMutation(api.contracts.requestChanges);
  const clientSign = useMutation(api.contracts.clientSign);

  // Auto-mark as viewed
  if (contract && contract.status === "published") {
    markViewed({ id: contractId });
  }

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
        await clientSign({ id: contractId, signatureStorageId: signature });
      }}
      onRequestChanges={async (comment) => {
        await requestChanges({ id: contractId, comment });
      }}
      backHref="/dashboard"
    />
  );
}
