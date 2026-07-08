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
import { inviteCompanyToDemo } from "@/app/actions/demo-invites";

export default function InviteCompanyToDemoDialog({
  invitedBy,
  onInvited,
}: {
  invitedBy: string;
  onInvited?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ companyName: "", contactName: "", contactEmail: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const reset = () => {
    setForm({ companyName: "", contactName: "", contactEmail: "" });
    setError("");
    setSent(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    const result = await inviteCompanyToDemo({ ...form, invitedBy });
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
          Invite Company to Demo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Company to Demo</DialogTitle>
          <DialogDescription>
            Sends a personal invitation to sign the NDA and receive private demo access.
            No demo access is granted until the NDA is signed.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="rounded-lg bg-success/8 border border-success/20 px-4 py-3 text-sm text-success">
            Invitation sent to {form.contactEmail || "the contact"}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                required
                value={form.companyName}
                onChange={set("companyName")}
                placeholder="Acme Ltd"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                required
                value={form.contactName}
                onChange={set("contactName")}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                required
                type="email"
                value={form.contactEmail}
                onChange={set("contactEmail")}
                placeholder="jane@acme.com"
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
