import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import ContractDocument from "@/lib/pdf/ContractDocument";
import { createElement } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createAdminClient();

    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", id)
      .single();

    if (contractError || !contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Fetch client name
    let clientName = "Client";
    if (contract.client_id) {
      const { data: client } = await supabase
        .from("clients")
        .select("contact_name")
        .eq("id", contract.client_id)
        .single();

      if (client) clientName = client.contact_name;
    }

    const pdfBuffer = await renderToBuffer(
      createElement(ContractDocument, {
        title: contract.title,
        sections: contract.sections || [],
        clientName,
        clientSignature: contract.client_signature,
        clientSignedAt: contract.client_signed_at
          ? new Date(contract.client_signed_at).getTime()
          : undefined,
        adminSignature: contract.admin_signature,
        adminSignedAt: contract.admin_signed_at
          ? new Date(contract.admin_signed_at).getTime()
          : undefined,
        date: new Date(contract.created_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      })
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contract-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
