"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { rejectSellerApplication } from "@/app/actions/seller-applications";

export default function RejectApplicationDialog({
  applicationId,
  applicantName,
  onRejected,
}: {
  applicationId: string;
  applicantName: string;
  onRejected?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setReason("");
    setError("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setRejecting(true);
    const result = await rejectSellerApplication(applicationId, reason.trim() || undefined);
    setRejecting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setOpen(false);
    reset();
    onRejected?.();
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
        <Button size="sm" variant="destructive">
          <XCircle className="h-3.5 w-3.5" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {applicantName}</DialogTitle>
          <DialogDescription>
            The reason is stored for internal reference only — no email is sent to the applicant.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. not a fit for the current partner program"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={rejecting}>
              {rejecting ? "Rejecting…" : "Reject Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
