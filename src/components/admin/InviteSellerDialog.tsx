"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
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
import { inviteSeller } from "@/app/actions/sellers";

export default function InviteSellerDialog({
  invitedBy,
  onInvited,
}: {
  invitedBy: string;
  onInvited?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", commissionRate: "10" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const reset = () => {
    setForm({ fullName: "", email: "", commissionRate: "10" });
    setError("");
    setSent(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    const result = await inviteSeller({
      fullName: form.fullName,
      email: form.email,
      commissionRate: form.commissionRate ? Number(form.commissionRate) : undefined,
      invitedBy,
    });
    setSending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }
    setSent(true);
    onInvited?.();
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
        <Button>
          <Mail />
          Invite Seller
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Seller</DialogTitle>
          <DialogDescription>
            Sends a registration link for a new seller partner. No referral access is
            granted until they register, sign the Seller Partner Agreement, and are activated.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="rounded-lg bg-success/8 border border-success/20 px-4 py-3 text-sm text-success">
            Invitation sent to {form.email || "the seller"}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                required
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                required
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.commissionRate}
                onChange={set("commissionRate")}
                placeholder="10"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={sending}>
                {sending ? "Sending…" : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
