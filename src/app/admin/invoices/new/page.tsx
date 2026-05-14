"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { listClients } from "@/lib/supabase/queries/clients";
import { listContractsForClient } from "@/lib/supabase/queries/contracts";
import { createInvoice, generateInvoiceNumber } from "@/lib/supabase/queries/invoices";
import { sendInvoiceAction } from "@/app/actions/invoices";
import type { Client, Contract, InvoiceLineItem } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function calcTotals(items: InvoiceLineItem[], taxPct: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmt = subtotal * (taxPct / 100);
  return { subtotal, taxAmt, total: subtotal + taxAmt };
}

function fmtAmt(n: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);
}

export default function NewInvoicePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useCurrentUser();

  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [clientId, setClientId] = useState(params.get("clientId") ?? "");
  const [contractId, setContractId] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [taxPct, setTaxPct] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    listClients(supabase).then(setClients);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    generateInvoiceNumber(supabase, clientId || undefined).then(setInvoiceNumber);
    if (!clientId) { setContracts([]); return; }
    listContractsForClient(supabase, clientId).then(setContracts).catch(() => setContracts([]));
  }, [clientId]);

  const addItem = () =>
    setLineItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);

  const removeItem = (i: number) =>
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof InvoiceLineItem, value: string | number) =>
    setLineItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item))
    );

  const { subtotal, taxAmt, total } = calcTotals(lineItems, taxPct);

  const buildPayload = (status: "draft" | "sent") => {
    if (!clientId) throw new Error("Select a client");
    if (!user?.id) throw new Error("Not authenticated");
    return {
      client_id: clientId,
      contract_id: contractId || null,
      invoice_number: invoiceNumber,
      status,
      currency,
      amount: subtotal,
      tax_amount: taxAmt,
      total_amount: total,
      due_date: dueDate || null,
      paid_at: null,
      notes: notes.trim() || null,
      line_items: lineItems.filter((i) => i.description.trim()),
      created_by: user.id,
    };
  };

  const handleSaveDraft = useCallback(async () => {
    setError("");
    setIsSaving(true);
    try {
      const supabase = createClient();
      const inv = await createInvoice(supabase, buildPayload("draft") as Parameters<typeof createInvoice>[1]);
      router.push(`/admin/invoices/${inv.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setIsSaving(false);
    }
  }, [clientId, contractId, currency, taxPct, dueDate, notes, lineItems, user, invoiceNumber]);

  const handleSendNow = useCallback(async () => {
    setError("");
    setIsSending(true);
    try {
      const supabase = createClient();
      const inv = await createInvoice(supabase, buildPayload("draft") as Parameters<typeof createInvoice>[1]);
      const result = await sendInvoiceAction(inv.id);
      if (result.error) throw new Error(result.error);
      router.push(`/admin/invoices/${inv.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send");
      setIsSending(false);
    }
  }, [clientId, contractId, currency, taxPct, dueDate, notes, lineItems, user, invoiceNumber]);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/invoices" className="text-muted-2 hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">New Invoice</h1>
          <p className="text-muted text-sm mt-0.5">{invoiceNumber}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error/8 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Client + Contract */}
        <div className="bg-white rounded-xl border border-grid-300 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Bill To</h2>
          <div>
            <label className="label-mono block mb-1.5">Client</label>
            <select
              value={clientId}
              onChange={(e) => { setClientId(e.target.value); setContractId(""); }}
              className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
            >
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-mono block mb-1.5">Linked Contract (optional)</label>
            <select
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              disabled={!clientId}
              className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors disabled:opacity-50"
            >
              <option value="">No linked contract</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Invoice settings */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Invoice Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-mono block mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
              >
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — Sterling</option>
                <option value="USD">USD — Dollar</option>
              </select>
            </div>
            <div>
              <label className="label-mono block mb-1.5">Tax (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxPct}
                onChange={(e) => setTaxPct(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
              />
            </div>
            <div>
              <label className="label-mono block mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Line Items</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_80px_110px_100px_36px] gap-2 mb-1">
              {["Description", "Qty", "Unit Price", "Amount", ""].map((h) => (
                <p key={h} className="label-mono">{h}</p>
              ))}
            </div>
            {lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_110px_100px_36px] gap-2 items-center">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  placeholder="Service description"
                  className="h-9 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                />
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  className="h-9 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground text-right focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))}
                  className="h-9 rounded-lg border border-grid-500 bg-white px-3 text-sm text-foreground text-right focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
                />
                <div className="h-9 rounded-lg bg-grid-300/40 border border-grid-300 px-3 flex items-center justify-end text-sm text-foreground font-medium">
                  {fmtAmt(item.quantity * item.unit_price, currency)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={lineItems.length === 1}
                  className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-2 hover:text-error hover:bg-error/8 transition-colors disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="mt-2 flex items-center gap-2 text-sm text-highlight hover:text-highlight/80 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add line item
            </button>
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-grid-300 space-y-2 max-w-xs ml-auto text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{fmtAmt(subtotal, currency)}</span>
            </div>
            {taxPct > 0 && (
              <div className="flex justify-between text-muted">
                <span>Tax ({taxPct}%)</span>
                <span>{fmtAmt(taxAmt, currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-foreground text-base pt-2 border-t border-grid-300">
              <span>Total</span>
              <span>{fmtAmt(total, currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-grid-300 p-5">
          <label className="label-mono block mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Payment instructions, reference numbers, or any additional information…"
            className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-highlight/30 focus:border-highlight transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-8">
          <button
            onClick={handleSendNow}
            disabled={isSending || isSaving || !clientId}
            className="relative inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
          >
            {isSending ? "Sending…" : "Send to Client"}
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isSending || !clientId}
            className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-5 h-10 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save as Draft"}
          </button>
          <Link
            href="/admin/invoices"
            className="text-sm text-muted-2 hover:text-foreground transition-colors px-3"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
