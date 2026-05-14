"use server";

// ─── Transport ────────────────────────────────────────────────────────────────

async function sendEmail({
  to,
  from = "info@andykgroup.com",
  subject,
  text,
  html,
}: {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set, skipping email send");
    return null;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Andy'K Group International LTD <${from}>`,
      to: [to],
      subject,
      text,
      ...(html ? { html } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Resend API error:", error);
    throw new Error(`Failed to send email: ${error}`);
  }

  return await response.json();
}

// ─── Template builder ─────────────────────────────────────────────────────────

function emailHtml(label: string | undefined, body: string): string {
  const labelSpan = label
    ? `&nbsp;&nbsp;<span style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.12em;">${label}</span>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf6f3;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf6f3;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#faf6f3;padding:20px 40px;border-radius:12px 12px 0 0;border:1px solid #ede8e2;border-bottom:none;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td width="34" height="34" style="width:34px;height:34px;min-width:34px;background:#01011b;border-radius:7px;text-align:center;vertical-align:middle;">
            <span style="color:#c9707d;font-family:Georgia,serif;font-size:15px;font-weight:700;line-height:1;">A</span>
          </td>
          <td style="padding-left:12px;vertical-align:middle;">
            <span style="font-family:Georgia,'Times New Roman',serif;color:#01011b;font-size:16px;font-weight:700;letter-spacing:-0.3px;">A.D.A.M.</span>${labelSpan}
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border-left:1px solid #ede8e2;border-right:1px solid #ede8e2;">
        ${body}
      </td></tr>
      <tr><td style="background:#faf6f3;padding:20px 40px;border-radius:0 0 12px 12px;border:1px solid #ede8e2;border-top:none;text-align:center;">
        <p style="font-family:'Courier New',Courier,monospace;font-size:11px;color:#8b93a8;margin:0;line-height:1.8;">
          Andy&#8217;K Group International LTD &nbsp;&middot;&nbsp; 86-90 Paul Street, London, EC2A 4NE, United Kingdom<br>
          <a href="https://andykgroup.com" style="color:#c9707d;text-decoration:none;">andykgroup.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Contract emails ──────────────────────────────────────────────────────────

export async function sendContractPublished({
  clientEmail,
  clientName,
  contractTitle,
  contractId,
}: {
  clientEmail: string;
  clientName: string;
  contractTitle: string;
  contractId: string;
}) {
  const url = `https://adam.andykgroup.com/dashboard/contracts`;
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">A new contract is ready for your review</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">A new contract has been prepared for your review. Please log in to your client portal to read through the document and take action.</p>
    <div style="background:#faf6f3;border-left:2px solid #c9707d;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Contract</p>
      <p style="color:#01011b;font-size:15px;font-weight:600;margin:0;">${contractTitle}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Contract &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    subject: `New Contract Available: ${contractTitle}`,
    text: `Hi ${clientName},\n\nA new contract "${contractTitle}" has been published for your review.\n\nLog in to your portal to view and take action: ${url}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

export async function sendChangesRequested({
  staffEmail,
  clientName,
  contractTitle,
  contractId,
  comment,
}: {
  staffEmail: string;
  clientName: string;
  contractTitle: string;
  contractId: string;
  comment: string;
}) {
  const url = `https://adam.andykgroup.com/admin/contracts/${contractId}`;
  const html = emailHtml("Contract Update", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">Changes requested on a contract</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;"><strong style="color:#01011b;">${clientName}</strong> has requested changes to &ldquo;${contractTitle}&rdquo;.</p>
    <div style="background:#faf6f3;border-left:2px solid #c9707d;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Client Comment</p>
      <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${comment}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review in Admin &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#8b93a8;font-size:12px;margin:0;font-family:'Courier New',Courier,monospace;">Automated notification &mdash; A.D.A.M. &middot; Andy&#8217;K Group International LTD</p>
    </div>
  `);
  return await sendEmail({
    to: staffEmail,
    subject: `Changes Requested: ${contractTitle}`,
    text: `${clientName} has requested changes to "${contractTitle}".\n\nComment: ${comment}\n\nReview: ${url}`,
    html,
  });
}

export async function sendContractSigned({
  staffEmail,
  clientName,
  contractTitle,
  contractId,
}: {
  staffEmail: string;
  clientName: string;
  contractTitle: string;
  contractId: string;
}) {
  const url = `https://adam.andykgroup.com/admin/contracts/${contractId}`;
  const html = emailHtml("Contract Update", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">A client has signed a contract</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;"><strong style="color:#01011b;">${clientName}</strong> has signed &ldquo;${contractTitle}&rdquo; and it is awaiting your countersignature.</p>
    <div style="background:#faf6f3;border-left:2px solid #c9707d;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Contract</p>
      <p style="color:#01011b;font-size:15px;font-weight:600;margin:0;">${contractTitle}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review &amp; Countersign &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#8b93a8;font-size:12px;margin:0;font-family:'Courier New',Courier,monospace;">Automated notification &mdash; A.D.A.M. &middot; Andy&#8217;K Group International LTD</p>
    </div>
  `);
  return await sendEmail({
    to: staffEmail,
    subject: `Contract Signed by Client: ${contractTitle}`,
    text: `${clientName} has signed "${contractTitle}".\n\nPlease review and countersign: ${url}`,
    html,
  });
}

export async function sendContractFinalized({
  clientEmail,
  clientName,
  contractTitle,
  contractId,
}: {
  clientEmail: string;
  clientName: string;
  contractTitle: string;
  contractId: string;
}) {
  const url = `https://adam.andykgroup.com/dashboard/contracts`;
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">Your contract is now finalized</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Great news &mdash; &ldquo;${contractTitle}&rdquo; has been fully executed and is now finalized. You can access it at any time through your client portal.</p>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View Contract &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    subject: `Contract Finalized: ${contractTitle}`,
    text: `Hi ${clientName},\n\nGreat news! "${contractTitle}" has been fully executed and is now finalized.\n\nView it in your portal: ${url}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Questionnaire emails ─────────────────────────────────────────────────────

export async function sendQuestionnaireReceived({
  staffEmail,
  companyName,
  contactName,
  contactEmail,
  questionnaireId,
}: {
  staffEmail: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  questionnaireId: string;
}) {
  const url = `https://adam.andykgroup.com/admin/questionnaires/${questionnaireId}`;
  const html = emailHtml("Questionnaire", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">New questionnaire submitted</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">A new questionnaire has been submitted and is ready for your review.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;width:100px;border-bottom:1px solid #ede8e2;">Company</td>
        <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${companyName}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Contact</td>
        <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${contactName}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;">Email</td>
        <td style="padding:7px 0;font-size:13px;"><a href="mailto:${contactEmail}" style="color:#c9707d;text-decoration:none;">${contactEmail}</a></td>
      </tr>
    </table>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Questionnaire &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#8b93a8;font-size:12px;margin:0;font-family:'Courier New',Courier,monospace;">Automated notification &mdash; A.D.A.M. &middot; Andy&#8217;K Group International LTD</p>
    </div>
  `);
  return await sendEmail({
    to: staffEmail,
    subject: `New Questionnaire Submitted: ${companyName}`,
    text: `New questionnaire submitted.\n\nCompany: ${companyName}\nContact: ${contactName} (${contactEmail})\n\nReview: ${url}`,
    html,
  });
}

// ─── Contact form ─────────────────────────────────────────────────────────────

export async function sendContactForm({
  staffEmail,
  name,
  email,
  message,
}: {
  staffEmail: string;
  name: string;
  email: string;
  message: string;
}) {
  const html = emailHtml("Contact Form", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">New contact form submission</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;width:80px;border-bottom:1px solid #ede8e2;">Name</td>
        <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${name}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;">Email</td>
        <td style="padding:7px 0;font-size:13px;"><a href="mailto:${email}" style="color:#c9707d;text-decoration:none;">${email}</a></td>
      </tr>
    </table>
    <div style="background:#faf6f3;border-left:2px solid #c9707d;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Message</p>
      <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${message}</p>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#8b93a8;font-size:12px;margin:0;font-family:'Courier New',Courier,monospace;">Automated notification &mdash; A.D.A.M. &middot; Andy&#8217;K Group International LTD</p>
    </div>
  `);
  return await sendEmail({
    to: staffEmail,
    subject: `New Contact Form Submission from ${name}`,
    text: `New contact form submission.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html,
  });
}

// ─── Proposal emails ──────────────────────────────────────────────────────────

export async function sendProposalSent({
  clientEmail,
  clientName,
  proposalTitle,
  proposalId,
}: {
  clientEmail: string;
  clientName: string;
  proposalTitle: string;
  proposalId: string;
}) {
  const url = `https://adam.andykgroup.com/dashboard/proposals/${proposalId}`;
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">A proposal is ready for your review</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">A proposal has been prepared for your consideration. Please log in to your client portal to read through the details and share your decision.</p>
    <div style="background:#faf6f3;border-left:2px solid #c9707d;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Proposal</p>
      <p style="color:#01011b;font-size:15px;font-weight:600;margin:0;">${proposalTitle}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Proposal &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    subject: `Proposal Ready for Review: ${proposalTitle}`,
    text: `Hi ${clientName},\n\nA proposal "${proposalTitle}" is ready for your review.\n\nLog in to read and respond: ${url}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

export async function sendProposalResponse({
  staffEmail,
  clientName,
  proposalTitle,
  proposalId,
  decision,
  comment,
}: {
  staffEmail: string;
  clientName: string;
  proposalTitle: string;
  proposalId: string;
  decision: "approved" | "declined";
  comment?: string;
}) {
  const url = `https://adam.andykgroup.com/admin/proposals/${proposalId}`;
  const verb = decision === "approved" ? "approved" : "declined";
  const decisionColor = decision === "approved" ? "#2e7d5e" : "#c9707d";
  const html = emailHtml("Proposal Update", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">${clientName} has ${verb} a proposal</h1>
    <div style="background:#faf6f3;border-left:2px solid ${decisionColor};padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:${comment ? "20" : "28"}px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Proposal</p>
      <p style="color:#01011b;font-size:15px;font-weight:600;margin:0 0 6px;">${proposalTitle}</p>
      <p style="color:${decisionColor};font-size:13px;font-weight:600;margin:0;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">${decision}</p>
    </div>
    ${comment ? `<div style="background:#faf6f3;border-left:2px solid #ede8e2;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;"><p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Client Comment</p><p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${comment}</p></div>` : ""}
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View in Admin &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#8b93a8;font-size:12px;margin:0;font-family:'Courier New',Courier,monospace;">Automated notification &mdash; A.D.A.M. &middot; Andy&#8217;K Group International LTD</p>
    </div>
  `);
  return await sendEmail({
    to: staffEmail,
    subject: `Proposal ${decision === "approved" ? "Approved" : "Declined"}: ${proposalTitle}`,
    text: `${clientName} has ${verb} the proposal "${proposalTitle}".\n${comment ? `\nClient comment: ${comment}\n` : ""}\nReview: ${url}`,
    html,
  });
}

// ─── Lead emails ──────────────────────────────────────────────────────────────

export async function sendLeadConfirmation({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">Your application has been received</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you for reaching out to Andy&#8217;K Group International LTD. We&#8217;ve received your application and our team will review it carefully.</p>
    <div style="background:#faf6f3;border-left:2px solid #c9707d;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="color:#01011b;font-size:13px;font-weight:600;margin:0 0 6px;">What happens next</p>
      <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">Our team will review your details within 48 hours. If we&#8217;re the right fit for each other, you&#8217;ll hear from us directly with next steps.</p>
    </div>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 32px;">In the meantime, feel free to explore our work at <a href="https://andykgroup.com" style="color:#c9707d;text-decoration:none;">andykgroup.com</a>.</p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: "Your application has been received — Andy'K Group International LTD",
    text: `Hi ${name},\n\nThank you for reaching out to Andy'K Group International LTD. We've received your application and our team will review it within 48 hours.\n\nIf we're the right fit, you'll hear from us directly with next steps.\n\nWarm regards,\nThe Andy'K Group International LTD Team\nhttps://andykgroup.com`,
    html,
  });
}

export async function sendLeadAdminNotification({
  leadId,
  name,
  email,
  phone,
  company,
  score,
  breakdown,
  questionnaire,
  highPriority = false,
}: {
  leadId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  score: number;
  breakdown: {
    revenue:            { label: string; score: number; max: number };
    timeline:           { label: string; score: number; max: number };
    decision_authority: { label: string; score: number; max: number };
    service_interest?:  { label: string; score: number; max: number };
  };
  questionnaire: Record<string, unknown>;
  highPriority?: boolean;
}) {
  const services = Array.isArray(questionnaire.services)
    ? (questionnaire.services as string[]).join(", ")
    : "—";
  const reviewUrl = `https://adam.andykgroup.com/admin/leads/${leadId}`;

  const breakdownText = [
    `  Revenue:            ${breakdown.revenue.score}/${breakdown.revenue.max} — ${breakdown.revenue.label}`,
    `  Timeline:           ${breakdown.timeline.score}/${breakdown.timeline.max} — ${breakdown.timeline.label}`,
    `  Decision authority: ${breakdown.decision_authority.score}/${breakdown.decision_authority.max} — ${breakdown.decision_authority.label}`,
  ].join("\n");

  const html = emailHtml("New Lead Alert", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#01011b;margin:0 0 4px;line-height:1.3;">New lead: ${company || name}</h1>
    <p style="color:#8b93a8;font-size:13px;margin:0 0 28px;font-family:'Courier New',Courier,monospace;">Submitted via andykgroup.com</p>

    <div style="background:#faf6f3;border:1px solid #ede8e2;border-radius:10px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Lead Score</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:52px;font-weight:700;color:#01011b;margin:0;line-height:1;">${score}</p>
      <p style="color:#8b93a8;font-size:13px;margin:4px 0 0;">out of 100</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;width:110px;border-bottom:1px solid #ede8e2;">Revenue</td>
        <td style="padding:8px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${breakdown.revenue.label}</td>
        <td style="padding:8px 0;color:#01011b;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #ede8e2;">${breakdown.revenue.score}/${breakdown.revenue.max}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Timeline</td>
        <td style="padding:8px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${breakdown.timeline.label}</td>
        <td style="padding:8px 0;color:#01011b;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #ede8e2;">${breakdown.timeline.score}/${breakdown.timeline.max}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">Authority</td>
        <td style="padding:8px 0;color:#525a70;font-size:13px;">${breakdown.decision_authority.label}</td>
        <td style="padding:8px 0;color:#01011b;font-size:13px;font-weight:600;text-align:right;">${breakdown.decision_authority.score}/${breakdown.decision_authority.max}</td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${company ? `<tr><td style="padding:6px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;width:100px;border-bottom:1px solid #ede8e2;">Company</td><td style="padding:6px 0;color:#525a70;font-size:13px;font-weight:500;border-bottom:1px solid #ede8e2;">${company}</td></tr>` : ""}
      <tr>
        <td style="padding:6px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Name</td>
        <td style="padding:6px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${name}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Email</td>
        <td style="padding:6px 0;font-size:13px;border-bottom:1px solid #ede8e2;"><a href="mailto:${email}" style="color:#c9707d;text-decoration:none;">${email}</a></td>
      </tr>
      ${phone ? `<tr><td style="padding:6px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Phone</td><td style="padding:6px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${phone}</td></tr>` : ""}
      <tr>
        <td style="padding:6px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">Services</td>
        <td style="padding:6px 0;color:#525a70;font-size:13px;">${services}</td>
      </tr>
      ${questionnaire.website ? `<tr><td style="padding:6px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">Website</td><td style="padding:6px 0;font-size:13px;"><a href="${String(questionnaire.website)}" style="color:#c9707d;text-decoration:none;">${questionnaire.website}</a></td></tr>` : ""}
    </table>

    ${questionnaire.business_description ? `<div style="margin-bottom:16px;"><p style="color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Business Description</p><p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${questionnaire.business_description}</p></div>` : ""}
    ${questionnaire.biggest_challenge ? `<div style="margin-bottom:28px;"><p style="color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Biggest Challenge</p><p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${questionnaire.biggest_challenge}</p></div>` : ""}

    <a href="${reviewUrl}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Lead &#8594;</a>
  `);

  return await sendEmail({
    to: "ceo@andykgroup.com",
    from: "info@andykgroup.com",
    subject: `${highPriority ? "🔴 HIGH PRIORITY — " : ""}New lead: ${company || name} — Score: ${score}/100`,
    text: `New lead submitted via andykgroup.com\n\nCompany: ${company || "—"}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nScore: ${score}/100\n\nScore Breakdown:\n${breakdownText}\n\nServices: ${services}\nBusiness: ${questionnaire.business_description || "—"}\nChallenge: ${questionnaire.biggest_challenge || "—"}\n\nReview: ${reviewUrl}`,
    html,
  });
}

export async function sendLeadRejection({
  name,
  email,
  reason,
}: {
  name: string;
  email: string;
  reason?: string;
}) {
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">Regarding your application</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Thank you for taking the time to reach out to Andy&#8217;K Group International LTD and for the interest you&#8217;ve shown in working with us.</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">After carefully reviewing your application, we don&#8217;t feel we&#8217;re the right fit for your current needs.${reason ? ` ${reason}` : ""}</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 32px;">This isn&#8217;t a permanent decision &mdash; circumstances change, and we&#8217;d genuinely welcome the opportunity to reconsider in the future. We wish you every success with your business in the meantime.</p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: "Regarding your Andy'K Group International LTD application",
    text: `Hi ${name},\n\nThank you for reaching out to Andy'K Group International LTD.\n\nAfter reviewing your application, we don't feel we're the right fit for your current needs.${reason ? " " + reason : ""}\n\nThis isn't permanent — we'd welcome the opportunity to reconnect in the future.\n\nWarm regards,\nThe Andy'K Group International LTD Team\nhttps://andykgroup.com`,
    html,
  });
}

export async function sendQuestionnaireInvite({
  name,
  email,
  company,
  token,
  expiresAt,
}: {
  name: string;
  email: string;
  company?: string | null;
  token: string;
  expiresAt: string;
}) {
  const link = `https://adam.andykgroup.com/questionnaire/full?token=${token}`;
  const expiryDate = new Date(expiresAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const html = emailHtml("Strategic Assessment", `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">You&#8217;ve been approved</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.25;">Your Strategic Assessment<br>is ready to begin</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">After reviewing your initial application${company ? ` from ${company}` : ""}, our team has determined there is genuine potential for alignment. You have been selected to proceed to the full Strategic Assessment.</p>
    <div style="background:#faf6f3;border-left:2px solid #c9707d;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#01011b;font-size:13px;font-weight:600;margin:0 0 6px;">What this means</p>
      <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">The Strategic Assessment is a comprehensive evaluation covering your company structure, strategic positioning, sales operations, financial readiness, and growth intent. It forms the foundation of our engagement.</p>
    </div>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">Your personalised assessment link is below. It is valid until <strong style="color:#01011b;">${expiryDate}</strong> &mdash; please complete it before then.</p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${link}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:-0.2px;">Begin Strategic Assessment &#8594;</a>
    </div>
    <div style="background:#faf6f3;border:1px solid #ede8e2;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Your private link</p>
      <p style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#525a70;word-break:break-all;margin:0;">${link}</p>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: "Your Andy'K Group International LTD Strategic Assessment is ready",
    text: `Hi ${name},\n\nYou've been approved to proceed to the Andy'K Group International LTD Strategic Assessment.\n\nYour personalised link is valid until ${expiryDate}:\n${link}\n\nPlease complete the assessment before it expires.\n\nWarm regards,\nThe Andy'K Group International LTD Team\nhttps://andykgroup.com`,
    html,
  });
}

export async function sendTokenReminder({
  name,
  email,
  token,
  tokenExpiresAt,
}: {
  name: string;
  email: string;
  token: string;
  tokenExpiresAt: string;
}) {
  const link = `https://adam.andykgroup.com/questionnaire/full?token=${token}`;
  const daysLeft = Math.max(1, Math.ceil((new Date(tokenExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const html = emailHtml("Reminder", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.3;">Your assessment link expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">This is a reminder that your Andy&#8217;K Group International LTD Strategic Assessment link expires in <strong style="color:#01011b;">${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong>. Please complete it before it expires.</p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${link}" style="display:inline-block;background:#c9707d;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Complete Assessment &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: `Reminder: ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to complete your Strategic Assessment`,
    text: `Hi ${name},\n\nYour Andy'K Group International LTD Strategic Assessment link expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.\n\nComplete it here:\n${link}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}
