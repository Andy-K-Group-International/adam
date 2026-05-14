import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import InvoiceDocument from "@/lib/pdf/InvoiceDocument";
import { createElement, type ReactElement } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DocumentProps } from "@react-pdf/renderer";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createAdminClient();

    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("company_name, contact_name, contact_email, address")
      .eq("id", invoice.client_id)
      .single();

    const issuedDate = new Date(invoice.created_at).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
    });
    const dueDate = invoice.due_date
      ? new Date(invoice.due_date).toLocaleDateString("en-GB", {
          day: "numeric", month: "long", year: "numeric",
        })
      : null;

    const pdfBuffer = await renderToBuffer(
      createElement(InvoiceDocument, {
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        issuedDate,
        dueDate,
        currency: invoice.currency,
        lineItems: invoice.line_items ?? [],
        amount: invoice.amount,
        taxAmount: invoice.tax_amount,
        totalAmount: invoice.total_amount,
        notes: invoice.notes,
        clientCompanyName: client?.company_name ?? "Client",
        clientContactName: client?.contact_name ?? "",
        clientEmail: client?.contact_email ?? "",
        clientAddress: client?.address ?? null,
      }) as ReactElement<DocumentProps>
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
