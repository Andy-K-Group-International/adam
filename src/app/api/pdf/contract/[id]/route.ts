import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import ContractDocument from "@/lib/pdf/ContractDocument";
import { createElement } from "react";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Convex URL not configured" }, { status: 500 });
    }

    const response = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "contracts:getById",
        args: { id },
        format: "json",
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch contract" }, { status: 500 });
    }

    const { value: contract } = await response.json();
    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Fetch client name
    const clientResponse = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "clients:getById",
        args: { id: contract.clientId },
        format: "json",
      }),
    });

    let clientName = "Client";
    if (clientResponse.ok) {
      const { value: client } = await clientResponse.json();
      if (client) clientName = client.contactName;
    }

    const pdfBuffer = await renderToBuffer(
      createElement(ContractDocument, {
        title: contract.title,
        sections: contract.sections || [],
        clientName,
        clientSignature: contract.clientSignature,
        clientSignedAt: contract.clientSignedAt,
        adminSignature: contract.adminSignature,
        adminSignedAt: contract.adminSignedAt,
        date: new Date(contract.createdAt).toLocaleDateString("en-GB", {
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
