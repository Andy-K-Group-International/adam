import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import ProposalDocument from "@/lib/pdf/ProposalDocument";
import { createElement } from "react";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch proposal data from Convex via HTTP
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Convex URL not configured" }, { status: 500 });
    }

    // Use Convex HTTP client to fetch proposal
    const response = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "proposals:getById",
        args: { id },
        format: "json",
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch proposal" }, { status: 500 });
    }

    const { value: proposal } = await response.json();
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Fetch questionnaire for company name
    const qResponse = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "questionnaires:getById",
        args: { id: proposal.questionnaireId },
        format: "json",
      }),
    });

    let companyName = "Client";
    if (qResponse.ok) {
      const { value: questionnaire } = await qResponse.json();
      if (questionnaire) companyName = questionnaire.companyName;
    }

    const pdfBuffer = await renderToBuffer(
      createElement(ProposalDocument, {
        title: proposal.title,
        proposalRef: proposal.proposalRef,
        companyName,
        sections: proposal.sections,
        date: new Date(proposal.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      })
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="proposal-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
