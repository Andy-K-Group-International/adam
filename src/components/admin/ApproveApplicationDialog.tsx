"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { approveSellerApplication } from "@/app/actions/seller-applications";

export default function ApproveApplicationDialog({
  applicationId,
  applicantName,
  applicantEmail,
  onApproved,
}: {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  onApproved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [commissionRate, setCommissionRate] = useState("10");
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");
  const [approved, setApproved] = useState(false);

  const reset = () => {
    setCommissionRate("10");
    setError("");
    setApproved(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setApproving(true);
    const result = await approveSellerApplication(
      applicationId,
      commissionRate ? Number(commissionRate) : undefined
    );
    setApproving(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setApproved(true);
    onApproved?.();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Check className="h-3.5 w-3.5" />
          Approve
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve {applicantName}</DialogTitle>
          <DialogDescription>
            Sends a seller invite to {applicantEmail} at the commission rate below. No
            referral access is granted until they register, sign the Seller Partner
            Agreement, and are activated.
          </DialogDescription>
        </DialogHeader>

        {approved ? (
          <div className="rounded-lg bg-success/8 border border-success/20 px-4 py-3 text-sm text-success">
            Application approved and invitation sent to {applicantEmail}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="10"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={approving}>
                {approving ? "Approving…" : "Approve & Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
