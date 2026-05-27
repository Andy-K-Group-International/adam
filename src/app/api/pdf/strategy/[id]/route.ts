import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import StrategyDocument from "@/lib/pdf/StrategyDocument";
import { createElement, type ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createAdminClient();

    const { data: client, error } = await supabase
      .from("clients")
      .select("company_name, client_ref, strategy_type, strategy_notes, created_at")
      .eq("id", id)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.strategy_notes) {
      return NextResponse.json({ error: "No strategy notes available" }, { status: 404 });
    }

    const element = createElement(StrategyDocument, {
      companyName: client.company_name ?? "Client",
      clientRef: client.client_ref ?? id,
      strategyType: client.strategy_type ?? "Strategy Document",
      strategyNotes: client.strategy_notes,
      date: new Date(client.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    }) as unknown as ReactElement<DocumentProps>;

    const pdfBuffer = await renderToBuffer(element);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="strategy-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Strategy PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
