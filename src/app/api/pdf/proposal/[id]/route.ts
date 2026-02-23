import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import ProposalDocument from "@/lib/pdf/ProposalDocument";
import { createElement } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = createAdminClient();

    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Fetch questionnaire for company name
    let companyName = "Client";
    if (proposal.questionnaire_id) {
      const { data: questionnaire } = await supabase
        .from("questionnaires")
        .select("company_name")
        .eq("id", proposal.questionnaire_id)
        .single();

      if (questionnaire) companyName = questionnaire.company_name;
    }

    const pdfBuffer = await renderToBuffer(
      createElement(ProposalDocument, {
        title: proposal.title,
        proposalRef: proposal.proposal_ref,
        companyName,
        sections: proposal.sections || [],
        date: new Date(proposal.created_at).toLocaleDateString("en-GB", {
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
