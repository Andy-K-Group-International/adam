"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { FileText, Download } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  const contracts = useQuery(api.contracts.listForClient);

  if (contracts === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  const finalContracts = (contracts || []).filter(
    (c) => c.status === "final"
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="text-muted mt-1">Access your finalized documents.</p>
      </div>

      {finalContracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 p-12 text-center">
          <FileText className="h-10 w-10 text-muted-2 mx-auto mb-3" />
          <p className="text-muted-2 font-medium">No documents yet</p>
          <p className="text-sm text-muted-2 mt-1">
            Finalized contracts will appear here as downloadable documents.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {finalContracts.map((contract) => (
            <Link
              key={contract._id}
              href={`/dashboard/contracts/${contract._id}`}
              className="flex items-center justify-between bg-white rounded-xl border border-grid-300 p-5 hover:border-highlight/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-highlight/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-highlight" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{contract.title}</p>
                  <p className="text-sm text-muted-2 mt-0.5">
                    Finalized {contract.finalizedAt ? new Date(contract.finalizedAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-2" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
