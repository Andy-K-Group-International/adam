"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listInvoicesForClient } from "@/lib/supabase/queries/invoices";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Invoice, InvoiceStatus } from "@/lib/supabase/types";
import { Download, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

function statusStyle(s: InvoiceStatus): string {
  switch (s) {
    case "sent":      return "bg-info/10 text-info";
    case "paid":      return "bg-success/10 text-success";
    case "overdue":   return "bg-error/10 text-error";
    default:          return "bg-grid-300 text-muted";
  }
}
function statusLabel(s: InvoiceStatus): string {
  return { sent: "Awaiting Payment", paid: "Paid", overdue: "Overdue", draft: "Draft", cancelled: "Cancelled" }[s] ?? s;
}
function fmtAmt(n: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(n);
}
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function DashboardInvoicesPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [invoices, setInvoices] = useState<Invoice[] | undefined>(undefined);

  useEffect(() => {
    if (!user?.client_id) return;
    const supabase = createClient();
    listInvoicesForClient(supabase, user.client_id)
      .then(setInvoices)
      .catch(() => setInvoices([]));
  }, [user]);

  if (userLoading || invoices === undefined) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">Invoices</h1>
        <p className="text-muted text-sm mt-1">Your billing history from Andy'K Group International LTD.</p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-grid-300 p-12 text-center">
          <Receipt className="h-10 w-10 text-muted-2 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No invoices yet</p>
          <p className="text-sm text-muted-2 mt-1">
            Invoices will appear here once they have been issued.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-grid-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-grid-300 bg-grid-300/30">
                  {["Invoice", "Amount", "Status", "Due Date", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-5 py-3 last:w-16">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-grid-300 last:border-b-0 hover:bg-grid-300/10 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{inv.invoice_number}</p>
                      <p className="text-xs text-muted-2 mt-0.5">Issued {fmtDate(inv.created_at)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-foreground">{fmtAmt(inv.total_amount, inv.currency)}</p>
                      {inv.paid_at && (
                        <p className="text-xs text-success mt-0.5">Paid {fmtDate(inv.paid_at)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                        statusStyle(inv.status)
                      )}>
                        {statusLabel(inv.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-2">
                      {fmtDate(inv.due_date)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={`/api/pdf/invoice/${inv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-highlight hover:underline"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
