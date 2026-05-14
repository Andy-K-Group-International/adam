"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getInvoiceById, updateInvoice } from "@/lib/supabase/queries/invoices";
import { listClients } from "@/lib/supabase/queries/clients";
import { sendInvoiceAction, markInvoicePaidAction } from "@/app/actions/invoices";
import type { Invoice, InvoiceStatus, Client, InvoiceLineItem } from "@/lib/supabase/types";
import Link from "next/link";
import { ArrowLeft, Download, Send, CheckCircle2, Pencil, Save, X, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

function statusStyle(s: InvoiceStatus) {
  switch (s) {
    case "draft":     return "bg-grid-300 text-muted";
    case "sent":      return "bg-info/10 text-info";
    case "paid":      return "bg-success/10 text-success";
    case "overdue":   return "bg-error/10 text-error";
    case "cancelled": return "bg-grid-300 text-muted-2";
  }
}
function statusLabel(s: InvoiceStatus) {
  return { draft: "Draft", sent: "Sent", paid: "Paid", overdue: "Overdue", cancelled: "Cancelled" }[s];
}
function fmtAmt(n: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);
}
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function calcTotals(items: InvoiceLineItem[], taxPct: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmt = subtotal * (taxPct / 100);
  return { subtotal, taxAmt, total: subtotal + taxAmt };
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);
  const [client, setClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit state
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [currency, setCurrency] = useState("EUR");
  const [taxPct, setTaxPct] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      getInvoiceById(supabase, id),
      listClients(supabase),
    ]).then(([inv, clients]) => {
      setInvoice(inv);
      setClient(clients.find((c) => c.id === inv.client_id) ?? null);
      setLineItems(inv.line_items ?? []);
      setCurrency(inv.currency);
      setTaxPct(inv.tax_amount > 0 ? Math.round((inv.tax_amount / inv.amount) * 100) : 0);
      setDueDate(inv.due_date ?? "");
      setNotes(inv.notes ?? "");
    }).catch(() => setInvoice(null));
  }, [id]);

  if (invoice === undefined) return <LoadingSpinner className="min-h-[60vh]" />;
  if (!invoice) return <div className="text-center py-20 text-muted-2 text-sm">Invoice not found</div>;

  const { subtotal, taxAmt, total } = calcTotals(lineItems, taxPct);

  const handleSend = async () => {
    setIsSending(true);
    setActionMsg("");
    const result = await sendInvoiceAction(id);
    if (result.error) { setActionMsg(result.error); setIsSending(false); return; }
    setInvoice((prev) => prev ? { ...prev, status: "sent" } : prev);
    setIsSending(false);
    setActionMsg("Invoice sent to client.");
  };

  const handleMarkPaid = async () => {
    setIsPaying(true);
    setActionMsg("");
    const result = await markInvoicePaidAction(id);
    if (result.error) { setActionMsg(result.error); setIsPaying(false); return; }
    setInvoice((prev) => prev ? { ...prev, status: "paid", paid_at: new Date().toISOString() } : prev);
    setIsPaying(false);
    setActionMsg("Invoice marked as paid.");
  };

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    setActionMsg("");
    try {
      const supabase = createClient();
      const updated = await updateInvoice(supabase, id, {
        line_items: lineItems,
        currency,
        amount: subtotal,
        tax_amount: taxAmt,
        total_amount: total,
        due_date: dueDate || null,
        notes: notes.trim() || null,
      });
      setInvoice(updated);
      setIsEditing(false);
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const updateItem = (i: number, field: keyof InvoiceLineItem, value: string | number) =>
    setLineItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const canEdit = invoice.status === "draft";
  const canSend = invoice.status === "draft";
  const canPay  = invoice.status === "sent" || invoice.status === "overdue";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/invoices" className="text-muted-2 hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif font-semibold text-foreground">{invoice.invoice_number}</h1>
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusStyle(invoice.status))}>
                {statusLabel(invoice.status)}
              </span>
            </div>
            <p className="text-sm text-muted-2 mt-0.5">
              {client?.company_name ?? "Unknown Client"} · Issued {fmtDate(invoice.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/pdf/invoice/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-4 h-9 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
          >
            <Download className="h-4 w-4" />
            PDF
          </a>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-4 h-9 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          )}
          {canSend && (
            <button
              onClick={handleSend}
              disabled={isSending}
              className="relative inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSending ? "Sending…" : "Send to Client"}
            </button>
          )}
          {canPay && (
            <button
              onClick={handleMarkPaid}
              disabled={isPaying}
              className="relative inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isPaying ? "Updating…" : "Mark as Paid"}
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div className="mb-6 rounded-lg bg-success/8 border border-success/20 px-4 py-3 text-sm text-success">
          {actionMsg}
        </div>
      )}

      {/* Invoice card */}
      <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
        {/* Invoice header band */}
        <div className="px-8 py-6 border-b border-grid-300 flex justify-between items-start">
          <div>
            <p className="label-mono mb-1">Andy'K Group International LTD</p>
            <p className="text-xs text-muted-2">86-90 Paul Street, London EC2A 4NE</p>
          </div>
          <div className="text-right">
            <p className="label-mono mb-1">Invoice</p>
            <p className="text-lg font-semibold text-foreground">{invoice.invoice_number}</p>
          </div>
        </div>

        {/* Billing + dates */}
        <div className="px-8 py-6 border-b border-grid-300 flex gap-12">
          <div className="flex-1">
            <p className="label-mono mb-2">Bill To</p>
            <p className="text-sm font-semibold text-foreground">{client?.company_name}</p>
            <p className="text-sm text-muted-2">{client?.contact_name}</p>
            <p className="text-sm text-muted-2">{client?.contact_email}</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="label-mono mb-0.5">Issue Date</p>
              <p className="text-sm text-foreground">{fmtDate(invoice.created_at)}</p>
            </div>
            {isEditing ? (
              <div>
                <p className="label-mono mb-1">Due Date</p>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 rounded-lg border border-grid-500 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
                />
              </div>
            ) : invoice.due_date ? (
              <div>
                <p className="label-mono mb-0.5">Due Date</p>
                <p className="text-sm text-foreground">{fmtDate(invoice.due_date)}</p>
              </div>
            ) : null}
            {invoice.paid_at && (
              <div>
                <p className="label-mono mb-0.5">Paid On</p>
                <p className="text-sm text-success font-medium">{fmtDate(invoice.paid_at)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Currency selector (edit mode) */}
        {isEditing && (
          <div className="px-8 py-4 bg-grid-300/20 border-b border-grid-300 flex items-center gap-6">
            <div>
              <label className="label-mono block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-8 rounded-lg border border-grid-500 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
              >
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="label-mono block mb-1">Tax (%)</label>
              <input
                type="number"
                min="0" max="100" step="0.1"
                value={taxPct}
                onChange={(e) => setTaxPct(Number(e.target.value))}
                className="w-20 h-8 rounded-lg border border-grid-500 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            </div>
          </div>
        )}

        {/* Line items */}
        <div className="px-8 py-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grid-300">
                {["Description", "Qty", "Unit Price", "Amount"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider pb-3 last:text-right">
                    {h}
                  </th>
                ))}
                {isEditing && <th />}
              </tr>
            </thead>
            <tbody>
              {(isEditing ? lineItems : invoice.line_items).map((item, i) => (
                <tr key={i} className="border-b border-grid-300/50 last:border-b-0">
                  {isEditing ? (
                    <>
                      <td className="py-2 pr-3">
                        <input
                          value={item.description}
                          onChange={(e) => updateItem(i, "description", e.target.value)}
                          className="w-full h-8 rounded border border-grid-500 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-highlight/30"
                        />
                      </td>
                      <td className="py-2 pr-3 w-16">
                        <input
                          type="number" min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                          className="w-full h-8 rounded border border-grid-500 px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-highlight/30"
                        />
                      </td>
                      <td className="py-2 pr-3 w-28">
                        <input
                          type="number" min="0" step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(i, "unit_price", Number(e.target.value))}
                          className="w-full h-8 rounded border border-grid-500 px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-highlight/30"
                        />
                      </td>
                      <td className="py-2 text-right text-sm font-medium text-foreground w-24">
                        {fmtAmt(item.quantity * item.unit_price, currency)}
                      </td>
                      <td className="py-2 pl-2 w-8">
                        <button onClick={() => setLineItems((p) => p.filter((_, idx) => idx !== i))} disabled={lineItems.length === 1} className="text-muted-2 hover:text-error disabled:opacity-30">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 text-sm text-foreground">{item.description}</td>
                      <td className="py-3 text-sm text-muted-2">{item.quantity}</td>
                      <td className="py-3 text-sm text-muted-2">{fmtAmt(item.unit_price, invoice.currency)}</td>
                      <td className="py-3 text-sm font-medium text-foreground text-right">{fmtAmt(item.quantity * item.unit_price, invoice.currency)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {isEditing && (
            <button
              type="button"
              onClick={() => setLineItems((p) => [...p, { description: "", quantity: 1, unit_price: 0 }])}
              className="mt-3 flex items-center gap-1.5 text-sm text-highlight hover:text-highlight/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add line item
            </button>
          )}

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-grid-300 space-y-2 max-w-xs ml-auto text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{fmtAmt(isEditing ? subtotal : invoice.amount, isEditing ? currency : invoice.currency)}</span>
            </div>
            {(isEditing ? taxAmt : invoice.tax_amount) > 0 && (
              <div className="flex justify-between text-muted">
                <span>Tax</span>
                <span>{fmtAmt(isEditing ? taxAmt : invoice.tax_amount, isEditing ? currency : invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-foreground text-base pt-2 border-t border-grid-300">
              <span>Total</span>
              <span>{fmtAmt(isEditing ? total : invoice.total_amount, isEditing ? currency : invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(invoice.notes || isEditing) && (
          <div className="px-8 py-5 border-t border-grid-300 bg-grid-300/10">
            <p className="label-mono mb-2">Notes</p>
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full text-sm border border-grid-500 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-highlight/30"
              />
            ) : (
              <p className="text-sm text-muted-2 whitespace-pre-wrap">{invoice.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* Edit actions */}
      {isEditing && (
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSaveEdit}
            disabled={isSavingEdit}
            className="relative inline-flex items-center justify-center gap-2 h-9 px-4 text-sm font-medium text-foreground btn-primary-gradient disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSavingEdit ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center gap-2 bg-grid-300 text-foreground px-4 h-9 rounded-lg text-sm font-medium hover:bg-grid-500 transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
