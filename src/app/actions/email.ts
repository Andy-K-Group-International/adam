"use server";

// ─── Transport ────────────────────────────────────────────────────────────────

async function sendEmail({
  to,
  from = "info@andykgroup.com",
  fromName = "Andy'K Group International LTD",
  replyTo,
  subject,
  text,
  html,
}: {
  to: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
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
      from: `${fromName} <${from}>`,
      to: [to],
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
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

const LOGO_URL = "https://adam.andykgroup.com/images/adam-logo.png";

const LOGO_SVG_40 = `<img src="${LOGO_URL}" alt="A.D.A.M." width="40" height="40" style="display:block;width:40px;height:40px;object-fit:contain;" />`;

const LOGO_SVG_24 = `<img src="${LOGO_URL}" alt="A.D.A.M." width="24" height="24" style="display:block;width:24px;height:24px;object-fit:contain;" />`;

function emailHtml(label: string | undefined, body: string): string {
  const labelSpan = label
    ? `&nbsp;&nbsp;<span style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.12em;">${label}</span>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f4;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#f0f4f4;padding:20px 40px;border-radius:12px 12px 0 0;border:1px solid #ede8e2;border-bottom:none;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td width="40" height="40" style="width:40px;height:40px;min-width:40px;vertical-align:middle;">
            ${LOGO_SVG_40}
          </td>
          <td style="padding-left:12px;vertical-align:middle;">
            <span style="font-family:Georgia,'Times New Roman',serif;color:#2F9E9A;font-size:16px;font-weight:700;letter-spacing:-0.3px;">A.D.A.M.</span>${labelSpan}
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border-left:1px solid #ede8e2;border-right:1px solid #ede8e2;">
        ${body}
      </td></tr>
      <tr><td style="background:#f0f4f4;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #ede8e2;border-top:none;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;width:33%;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle;width:24px;height:24px;min-width:24px;">${LOGO_SVG_24}</td>
                <td style="padding-left:7px;vertical-align:middle;">
                  <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;color:#2F9E9A;letter-spacing:0.04em;">A.D.A.M. &mdash; Lifecycle Implementation System</span>
                </td>
              </tr></table>
            </td>
            <td style="text-align:center;vertical-align:middle;width:34%;padding:0 8px;">
              <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;margin:0;line-height:1.7;">
                Andy&#8217;K Group International LTD &middot; Reg: 16453500<br>
                86-90 Paul Street, London, EC2A 4NE, United Kingdom
              </p>
            </td>
            <td style="text-align:right;vertical-align:middle;width:33%;">
              <a href="https://andykgroup.com" style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#2F9E9A;text-decoration:none;">andykgroup.com</a>
            </td>
          </tr>
        </table>
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
  senderName,
  senderEmail,
}: {
  clientEmail: string;
  clientName: string;
  contractTitle: string;
  contractId: string;
  senderName?: string | null;
  senderEmail?: string | null;
}) {
  const url = `https://adam.andykgroup.com/dashboard/contracts`;
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">A new contract is ready for your review</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">A new contract has been prepared for your review. Please log in to your client portal to read through the document and take action.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Contract</p>
      <p style="color:#0E282D;font-size:15px;font-weight:600;margin:0;">${contractTitle}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Contract &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    ...(senderName ? { fromName: senderName } : {}),
    ...(senderEmail ? { from: senderEmail, replyTo: senderEmail } : {}),
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Changes requested on a contract</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;"><strong style="color:#0E282D;">${clientName}</strong> has requested changes to &ldquo;${contractTitle}&rdquo;.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Client Comment</p>
      <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${comment}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review in Admin &#8594;</a>
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">A client has signed a contract</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;"><strong style="color:#0E282D;">${clientName}</strong> has signed &ldquo;${contractTitle}&rdquo; and it is awaiting your countersignature.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Contract</p>
      <p style="color:#0E282D;font-size:15px;font-weight:600;margin:0;">${contractTitle}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review &amp; Countersign &#8594;</a>
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
  senderName,
  senderEmail,
}: {
  clientEmail: string;
  clientName: string;
  contractTitle: string;
  contractId: string;
  senderName?: string | null;
  senderEmail?: string | null;
}) {
  const url = `https://adam.andykgroup.com/dashboard/contracts`;
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your contract is now finalized</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Great news &mdash; &ldquo;${contractTitle}&rdquo; has been fully executed and is now finalized. You can access it at any time through your client portal.</p>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View Contract &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    ...(senderName ? { fromName: senderName } : {}),
    ...(senderEmail ? { from: senderEmail, replyTo: senderEmail } : {}),
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">New questionnaire submitted</h1>
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
        <td style="padding:7px 0;font-size:13px;"><a href="mailto:${contactEmail}" style="color:#2F9E9A;text-decoration:none;">${contactEmail}</a></td>
      </tr>
    </table>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Questionnaire &#8594;</a>
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">New contact form submission</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;width:80px;border-bottom:1px solid #ede8e2;">Name</td>
        <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${name}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;">Email</td>
        <td style="padding:7px 0;font-size:13px;"><a href="mailto:${email}" style="color:#2F9E9A;text-decoration:none;">${email}</a></td>
      </tr>
    </table>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
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

export async function sendProposalPublished({
  clientEmail,
  clientName,
  proposalTitle,
  proposalRef,
  proposalId,
  validUntil,
  senderName,
  senderEmail,
}: {
  clientEmail: string;
  clientName: string;
  proposalTitle: string;
  proposalRef: string | null;
  proposalId: string;
  validUntil: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
}) {
  const url = `https://adam.andykgroup.com/dashboard/proposals/${proposalId}`;
  const validStr = validUntil
    ? new Date(validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your proposal is ready to review</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">We have prepared a proposal for your review. Please log in to your client portal to read through the details and share your decision.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      ${proposalRef ? `<p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Ref: ${proposalRef}</p>` : ""}
      <p style="color:#0E282D;font-size:15px;font-weight:600;margin:0 0 8px;">${proposalTitle}</p>
      ${validStr ? `<p style="color:#525a70;font-size:13px;margin:0;">Valid until <strong style="color:#0E282D;">${validStr}</strong></p>` : ""}
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Proposal &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    ...(senderName ? { fromName: senderName } : {}),
    ...(senderEmail ? { from: senderEmail, replyTo: senderEmail } : {}),
    subject: `Your Proposal is Ready: ${proposalTitle}`,
    text: `Hi ${clientName},\n\nYour proposal "${proposalTitle}" is ready for review.${validStr ? `\nValid until: ${validStr}` : ""}\n\nLog in to read and respond: ${url}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

export async function sendProposalChangesRequestedByClient({
  staffEmail,
  clientName,
  proposalTitle,
  proposalId,
  comment,
}: {
  staffEmail: string;
  clientName: string;
  proposalTitle: string;
  proposalId: string;
  comment: string;
}) {
  const url = `https://adam.andykgroup.com/admin/proposals/${proposalId}`;
  const html = emailHtml("Proposal Update", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Changes requested on a proposal</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;"><strong style="color:#0E282D;">${clientName}</strong> has requested changes to &ldquo;${proposalTitle}&rdquo;.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Client Comment</p>
      <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${comment || "No comment provided."}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review in Admin &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#8b93a8;font-size:12px;margin:0;font-family:'Courier New',Courier,monospace;">Automated notification &mdash; A.D.A.M. &middot; Andy&#8217;K Group International LTD</p>
    </div>
  `);
  return await sendEmail({
    to: staffEmail,
    subject: `Changes Requested on Proposal: ${proposalTitle}`,
    text: `${clientName} has requested changes to "${proposalTitle}".\n\nComment: ${comment || "None"}\n\nReview: ${url}`,
    html,
  });
}

export async function sendProposalConfirmed({
  staffEmail,
  clientEmail,
  clientName,
  proposalTitle,
  proposalRef,
  proposalId,
}: {
  staffEmail: string;
  clientEmail: string;
  clientName: string;
  proposalTitle: string;
  proposalRef: string | null;
  proposalId: string;
}) {
  const adminUrl = `https://adam.andykgroup.com/admin/proposals/${proposalId}`;
  const dashUrl = `https://adam.andykgroup.com/dashboard/proposals/${proposalId}`;

  const adminHtml = emailHtml("Proposal Confirmed", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">${clientName} has confirmed a proposal</h1>
    <div style="background:#f0f4f4;border-left:2px solid #2e7d5e;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      ${proposalRef ? `<p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Ref: ${proposalRef}</p>` : ""}
      <p style="color:#0E282D;font-size:15px;font-weight:600;margin:0 0 6px;">${proposalTitle}</p>
      <p style="color:#2e7d5e;font-size:13px;font-weight:600;margin:0;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">CONFIRMED &mdash; Commercial terms locked</p>
    </div>
    <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0 0 28px;">The commercial terms are now locked. You can proceed to create and publish the contract.</p>
    <div style="margin-bottom:32px;">
      <a href="${adminUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Create Contract &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#8b93a8;font-size:12px;margin:0;font-family:'Courier New',Courier,monospace;">Automated notification &mdash; A.D.A.M. &middot; Andy&#8217;K Group International LTD</p>
    </div>
  `);

  const clientHtml = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your proposal has been confirmed</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you for confirming your proposal. The commercial terms are now locked and our team will proceed to prepare the formal Service Agreement within 5 business days.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2e7d5e;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      ${proposalRef ? `<p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Ref: ${proposalRef}</p>` : ""}
      <p style="color:#0E282D;font-size:15px;font-weight:600;margin:0;">${proposalTitle}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${dashUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View in Portal &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);

  await Promise.all([
    sendEmail({
      to: staffEmail,
      subject: `Proposal Confirmed: ${proposalTitle}`,
      text: `${clientName} has confirmed proposal "${proposalTitle}". Commercial terms are now locked.\n\nCreate contract: ${adminUrl}`,
      html: adminHtml,
    }),
    sendEmail({
      to: clientEmail,
      subject: `Proposal Confirmed: ${proposalTitle}`,
      text: `Hi ${clientName},\n\nThank you for confirming your proposal "${proposalTitle}". Our team will prepare the service agreement within 5 business days.\n\nView your portal: ${dashUrl}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
      html: clientHtml,
    }),
  ]);
}

export async function sendProposalSent({
  clientEmail,
  clientName,
  proposalTitle,
  proposalId,
  senderName,
  senderEmail,
}: {
  clientEmail: string;
  clientName: string;
  proposalTitle: string;
  proposalId: string;
  senderName?: string | null;
  senderEmail?: string | null;
}) {
  const url = `https://adam.andykgroup.com/dashboard/proposals/${proposalId}`;
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">A proposal is ready for your review</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">A proposal has been prepared for your consideration. Please log in to your client portal to read through the details and share your decision.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Proposal</p>
      <p style="color:#0E282D;font-size:15px;font-weight:600;margin:0;">${proposalTitle}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Proposal &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    ...(senderName ? { fromName: senderName } : {}),
    ...(senderEmail ? { from: senderEmail, replyTo: senderEmail } : {}),
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
  const decisionColor = decision === "approved" ? "#2e7d5e" : "#2F9E9A";
  const html = emailHtml("Proposal Update", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">${clientName} has ${verb} a proposal</h1>
    <div style="background:#f0f4f4;border-left:2px solid ${decisionColor};padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:${comment ? "20" : "28"}px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 4px;">Proposal</p>
      <p style="color:#0E282D;font-size:15px;font-weight:600;margin:0 0 6px;">${proposalTitle}</p>
      <p style="color:${decisionColor};font-size:13px;font-weight:600;margin:0;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">${decision}</p>
    </div>
    ${comment ? `<div style="background:#f0f4f4;border-left:2px solid #ede8e2;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;"><p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Client Comment</p><p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${comment}</p></div>` : ""}
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View in Admin &#8594;</a>
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your application has been received</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you for reaching out to Andy&#8217;K Group International LTD. We&#8217;ve received your application and our team will review it carefully.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="color:#0E282D;font-size:13px;font-weight:600;margin:0 0 6px;">What happens next</p>
      <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">Andy&#8217;K Group International LTD will review your submission. If your company is selected for the Founding Client Program, you&#8217;ll receive a license activation invitation directly.</p>
    </div>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 32px;">In the meantime, feel free to explore our work at <a href="https://andykgroup.com" style="color:#2F9E9A;text-decoration:none;">andykgroup.com</a>.</p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: "Your application has been received — Andy'K Group International LTD",
    text: `Hi ${name},\n\nThank you for your application. Andy'K Group International LTD will review your submission carefully.\n\nIf your company is selected for the Founding Client Program, you'll receive a license activation invitation directly.\n\nWarm regards,\nThe Andy'K Group International LTD Team\nhttps://andykgroup.com`,
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
  isEndToEnd = false,
  documentUrl = null,
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
  isEndToEnd?: boolean;
  documentUrl?: string | null;
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#0E282D;margin:0 0 4px;line-height:1.3;">New lead: ${company || name}</h1>
    <p style="color:#8b93a8;font-size:13px;margin:0 0 28px;font-family:'Courier New',Courier,monospace;">Submitted via andykgroup.com</p>

    <div style="background:#f0f4f4;border:1px solid #ede8e2;border-radius:10px;padding:24px;margin-bottom:24px;text-align:center;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Lead Score</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:52px;font-weight:700;color:#0E282D;margin:0;line-height:1;">${score}</p>
      <p style="color:#8b93a8;font-size:13px;margin:4px 0 0;">out of 100</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;width:110px;border-bottom:1px solid #ede8e2;">Revenue</td>
        <td style="padding:8px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${breakdown.revenue.label}</td>
        <td style="padding:8px 0;color:#0E282D;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #ede8e2;">${breakdown.revenue.score}/${breakdown.revenue.max}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Timeline</td>
        <td style="padding:8px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${breakdown.timeline.label}</td>
        <td style="padding:8px 0;color:#0E282D;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #ede8e2;">${breakdown.timeline.score}/${breakdown.timeline.max}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">Authority</td>
        <td style="padding:8px 0;color:#525a70;font-size:13px;">${breakdown.decision_authority.label}</td>
        <td style="padding:8px 0;color:#0E282D;font-size:13px;font-weight:600;text-align:right;">${breakdown.decision_authority.score}/${breakdown.decision_authority.max}</td>
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
        <td style="padding:6px 0;font-size:13px;border-bottom:1px solid #ede8e2;"><a href="mailto:${email}" style="color:#2F9E9A;text-decoration:none;">${email}</a></td>
      </tr>
      ${phone ? `<tr><td style="padding:6px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Phone</td><td style="padding:6px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${phone}</td></tr>` : ""}
      <tr>
        <td style="padding:6px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">Services</td>
        <td style="padding:6px 0;color:#525a70;font-size:13px;">${services}</td>
      </tr>
      ${questionnaire.website ? `<tr><td style="padding:6px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">Website</td><td style="padding:6px 0;font-size:13px;"><a href="${String(questionnaire.website)}" style="color:#2F9E9A;text-decoration:none;">${questionnaire.website}</a></td></tr>` : ""}
    </table>

    ${questionnaire.business_description ? `<div style="margin-bottom:16px;"><p style="color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Business Description</p><p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${questionnaire.business_description}</p></div>` : ""}
    ${questionnaire.biggest_challenge ? `<div style="margin-bottom:${isEndToEnd ? "16" : "28"}px;"><p style="color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;">Biggest Challenge</p><p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${questionnaire.biggest_challenge}</p></div>` : ""}

    ${isEndToEnd ? `<div style="background:#f0f4f4;border-left:2px solid ${documentUrl ? "#2e7d5e" : "#2F9E9A"};padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Supporting Document</p>
      ${documentUrl
        ? `<a href="${documentUrl}" style="color:#2e7d5e;font-size:14px;font-weight:600;text-decoration:none;">&#8681; Download Document</a>`
        : `<p style="color:#2F9E9A;font-size:14px;font-weight:600;margin:0;">&#9888; Not uploaded &mdash; manual review required</p>`}
    </div>` : ""}

    <a href="${reviewUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Lead &#8594;</a>
  `);

  const subject = isEndToEnd
    ? `🔴 End-to-End Application: ${company || name} — Score: ${score}/100`
    : `${highPriority ? "🔴 HIGH PRIORITY — " : ""}New lead: ${company || name} — Score: ${score}/100`;

  const documentLine = isEndToEnd
    ? `\nDocument: ${documentUrl ? documentUrl : "⚠ Not uploaded — manual review required"}`
    : "";

  return await sendEmail({
    to: "ceo@andykgroup.com",
    from: "info@andykgroup.com",
    subject,
    text: `New lead submitted via andykgroup.com\n\nCompany: ${company || "—"}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nScore: ${score}/100\n\nScore Breakdown:\n${breakdownText}\n\nServices: ${services}\nBusiness: ${questionnaire.business_description || "—"}\nChallenge: ${questionnaire.biggest_challenge || "—"}${documentLine}\n\nReview: ${reviewUrl}`,
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Regarding your application</h1>
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.25;">Your Strategic Assessment<br>is ready to begin</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">After reviewing your initial application${company ? ` from ${company}` : ""}, our team has determined there is genuine potential for alignment. You have been selected to proceed to the full Strategic Assessment.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#0E282D;font-size:13px;font-weight:600;margin:0 0 6px;">What this means</p>
      <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">The Strategic Assessment is a comprehensive evaluation covering your company structure, strategic positioning, sales operations, financial readiness, and growth intent. It forms the foundation of our engagement.</p>
    </div>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">Your personalised assessment link is below. It is valid until <strong style="color:#0E282D;">${expiryDate}</strong> &mdash; please complete it before then.</p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${link}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:-0.2px;">Begin Strategic Assessment &#8594;</a>
    </div>
    <div style="background:#f0f4f4;border:1px solid #ede8e2;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your assessment link expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">This is a reminder that your Andy&#8217;K Group International LTD Strategic Assessment link expires in <strong style="color:#0E282D;">${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong>. Please complete it before it expires.</p>
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${link}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">Complete Assessment &#8594;</a>
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

// ─── Invoice emails ───────────────────────────────────────────────────────────

export async function sendInvoiceSent({
  clientEmail,
  clientName,
  companyName,
  invoiceNumber,
  invoiceId,
  totalAmount,
  currency,
  dueDate,
  senderName,
  senderEmail,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  invoiceNumber: string;
  invoiceId: string;
  totalAmount: number;
  currency: string;
  dueDate: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
}) {
  const url = `https://adam.andykgroup.com/dashboard/invoices/${invoiceId}`;
  const formattedAmount = new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(totalAmount);
  const formattedDue = dueDate
    ? new Date(dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">You have a new invoice to review</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">An invoice has been issued for ${companyName}. Please log in to your client portal to view and download it.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;padding-bottom:4px;width:50%;">Invoice</td>
          <td style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;padding-bottom:4px;">Amount Due</td>
        </tr>
        <tr>
          <td style="color:#0E282D;font-size:15px;font-weight:600;">${invoiceNumber}</td>
          <td style="color:#0E282D;font-size:15px;font-weight:600;">${formattedAmount}</td>
        </tr>
        ${formattedDue ? `<tr><td colspan="2" style="color:#525a70;font-size:13px;padding-top:8px;">Due ${formattedDue}</td></tr>` : ""}
      </table>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View Invoice &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);

  return await sendEmail({
    to: clientEmail,
    from: senderEmail || "info@andykgroup.com",
    ...(senderName ? { fromName: senderName } : {}),
    ...(senderEmail ? { replyTo: senderEmail } : {}),
    subject: `Invoice ${invoiceNumber} — ${formattedAmount}${formattedDue ? ` due ${formattedDue}` : ""}`,
    text: `Hi ${clientName},\n\nInvoice ${invoiceNumber} for ${formattedAmount} has been issued for ${companyName}.${formattedDue ? `\nDue: ${formattedDue}` : ""}\n\nView your invoice: ${url}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

export async function sendInvoiceOverdue({
  clientEmail,
  clientName,
  invoiceNumber,
  invoiceId,
  totalAmount,
  currency,
  dueDate,
  senderName,
  senderEmail,
}: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  invoiceId: string;
  totalAmount: number;
  currency: string;
  dueDate: string | null;
  senderName?: string | null;
  senderEmail?: string | null;
}) {
  const url = `https://adam.andykgroup.com/dashboard/invoices/${invoiceId}`;
  const formattedAmount = new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(totalAmount);
  const formattedDue = dueDate
    ? new Date(dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Invoice payment overdue</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">This is a reminder that the following invoice is now overdue. Please arrange payment at your earliest convenience.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;padding-bottom:4px;width:50%;">Invoice</td>
          <td style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;padding-bottom:4px;">Amount Due</td>
        </tr>
        <tr>
          <td style="color:#0E282D;font-size:15px;font-weight:600;">${invoiceNumber}</td>
          <td style="color:#0E282D;font-size:15px;font-weight:600;">${formattedAmount}</td>
        </tr>
        ${formattedDue ? `<tr><td colspan="2" style="color:#2F9E9A;font-size:13px;font-weight:600;padding-top:8px;font-family:'Courier New',Courier,monospace;">Was due ${formattedDue}</td></tr>` : ""}
      </table>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View Invoice &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);

  return await sendEmail({
    to: clientEmail,
    from: senderEmail || "info@andykgroup.com",
    ...(senderName ? { fromName: senderName } : {}),
    ...(senderEmail ? { replyTo: senderEmail } : {}),
    subject: `Overdue: Invoice ${invoiceNumber} — ${formattedAmount}`,
    text: `Hi ${clientName},\n\nInvoice ${invoiceNumber} for ${formattedAmount} is now overdue.${formattedDue ? `\nIt was due on ${formattedDue}.` : ""}\n\nView your invoice: ${url}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Welcome email ───────────────────────────────────────────────────────────

export async function sendWelcomeEmail({
  clientEmail,
  clientName,
  companyName,
  clientRef,
  tempPassword,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  clientRef: string;
  tempPassword: string;
}) {
  const loginUrl = "https://adam.andykgroup.com/sign-in";
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Welcome to A.D.A.M. &mdash; Your account is ready</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">We&#8217;re pleased to welcome ${companyName} as a client of Andy&#8217;K Group International LTD. Your client portal has been set up and is ready for you to access.</p>
    <div style="background:#f0f4f4;border:1px solid #ede8e2;border-radius:10px;padding:24px;margin-bottom:28px;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Your Account Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;width:120px;border-bottom:1px solid #ede8e2;">Client ID</td>
          <td style="padding:7px 0;color:#0E282D;font-size:13px;font-weight:600;border-bottom:1px solid #ede8e2;font-family:'Courier New',Courier,monospace;">${clientRef}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Email</td>
          <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${clientEmail}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;">Temp Password</td>
          <td style="padding:7px 0;font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:700;color:#0E282D;letter-spacing:0.05em;">${tempPassword}</td>
        </tr>
      </table>
    </div>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#0E282D;font-size:13px;font-weight:600;margin:0 0 4px;">Important</p>
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Please change your password after your first login. Go to your profile settings once you&#8217;re signed in.</p>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${loginUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:-0.2px;">Login to your dashboard &#8594;</a>
    </div>
    <p style="color:#8b93a8;font-size:12px;font-family:'Courier New',Courier,monospace;text-align:center;margin:0 0 24px;">or visit: <a href="${loginUrl}" style="color:#2F9E9A;text-decoration:none;">${loginUrl}</a></p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);

  return await sendEmail({
    to: clientEmail,
    from: "info@andykgroup.com",
    subject: "Welcome to A.D.A.M. — Your account is ready",
    text: `Hi ${clientName},\n\nWelcome to A.D.A.M. — your client portal is ready.\n\nClient ID: ${clientRef}\nLogin: ${loginUrl}\nEmail: ${clientEmail}\nTemporary password: ${tempPassword}\n\nPlease change your password after first login.\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Kickoff email ────────────────────────────────────────────────────────────

export async function sendKickoffConfirmed({
  clientEmail,
  clientName,
  companyName,
  kickoffDate,
  checklist,
  kickoffNotes,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  kickoffDate: string | null;
  checklist: string[];
  kickoffNotes: string;
}) {
  const formattedDate = kickoffDate
    ? new Date(kickoffDate).toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const checklistHtml = checklist.length > 0
    ? `<div style="margin-bottom:28px;">
        <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">What&#8217;s Included</p>
        ${checklist.map((item) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="display:inline-block;width:16px;height:16px;background:#2F9E9A;border-radius:50%;color:#fff;font-size:10px;text-align:center;line-height:16px;flex-shrink:0;">&#10003;</span>
          <span style="color:#525a70;font-size:14px;">${item}</span>
        </div>`).join("")}
      </div>`
    : "";

  const notesHtml = kickoffNotes
    ? `<div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
        <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Agenda &amp; Notes</p>
        <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;white-space:pre-line;">${kickoffNotes}</p>
      </div>`
    : "";

  const html = emailHtml("Project Kickoff", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your project with Andy&#8217;K Group International LTD is now live</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">We&#8217;re excited to confirm that ${companyName}&#8217;s engagement with Andy&#8217;K Group International LTD is officially underway. Everything is in place and we&#8217;re ready to begin.</p>
    ${formattedDate ? `<div style="background:#f0f4f4;border:1px solid #ede8e2;border-radius:10px;padding:20px;margin-bottom:28px;text-align:center;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 6px;">Kickoff Date</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#0E282D;margin:0;">${formattedDate}</p>
    </div>` : ""}
    ${checklistHtml}
    ${notesHtml}
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">If you have any questions before we begin, don&#8217;t hesitate to reach out. We look forward to working with you.</p>
    <div style="margin-bottom:32px;">
      <a href="https://adam.andykgroup.com/dashboard" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Access Your Portal &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);

  return await sendEmail({
    to: clientEmail,
    from: "info@andykgroup.com",
    subject: `Your project with Andy'K Group International LTD is now live`,
    text: `Hi ${clientName},\n\nYour engagement with Andy'K Group International LTD is officially underway.${formattedDate ? `\n\nKickoff date: ${formattedDate}` : ""}${checklist.length > 0 ? `\n\nWhat's included:\n${checklist.map((i) => `• ${i}`).join("\n")}` : ""}${kickoffNotes ? `\n\nAgenda:\n${kickoffNotes}` : ""}\n\nAccess your portal: https://adam.andykgroup.com/dashboard\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Client Request Notification (admin) ─────────────────────────────────────

export async function sendClientRequestNotification({
  companyName,
  contactName,
  documentType,
  documentId,
  content,
  sectionId,
}: {
  companyName: string;
  contactName: string;
  documentType: string;
  documentId: string;
  content: string;
  sectionId?: string | null;
}) {
  const docLabel = documentType.charAt(0).toUpperCase() + documentType.slice(1);
  const sectionNote = sectionId ? ` (Section: ${sectionId})` : "";

  const html = emailHtml("Client Request", `
    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#0E282D;margin:0 0 8px;">Client Request Received</h2>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">A new request has been submitted by <strong>${companyName}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:8px 0;color:#525a70;font-size:13px;font-weight:600;width:140px;">Company</td><td style="padding:8px 0;color:#0E282D;font-size:13px;">${companyName}</td></tr>
      <tr><td style="padding:8px 0;color:#525a70;font-size:13px;font-weight:600;">Contact</td><td style="padding:8px 0;color:#0E282D;font-size:13px;">${contactName}</td></tr>
      <tr><td style="padding:8px 0;color:#525a70;font-size:13px;font-weight:600;">Document</td><td style="padding:8px 0;color:#0E282D;font-size:13px;">${docLabel}${sectionNote}</td></tr>
    </table>
    <div style="background:#faf8f5;border-left:3px solid #2F9E9A;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
      <p style="color:#0E282D;font-size:14px;line-height:1.7;margin:0;">${content.replace(/\n/g, "<br>")}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="https://adam.andykgroup.com/admin/${documentType}s/${documentId}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Request &#8594;</a>
    </div>
  `);

  return await sendEmail({
    to: "ceo@andykgroup.com",
    from: "info@andykgroup.com",
    subject: `📋 Client Request: ${companyName} — ${docLabel}`,
    text: `Client request from ${companyName} (${contactName})\n\nDocument: ${docLabel}${sectionNote}\n\n${content}\n\nReview: https://adam.andykgroup.com/admin/${documentType}s/${documentId}`,
    html,
  });
}

// ─── Client Request Response (client) ────────────────────────────────────────

export async function sendClientRequestResponse({
  clientEmail,
  clientName,
  documentType,
  adminResponse,
  status,
}: {
  clientEmail: string;
  clientName: string;
  documentType: string;
  adminResponse: string;
  status: string;
}) {
  const docLabel = documentType.charAt(0).toUpperCase() + documentType.slice(1);
  const statusLabel: Record<string, string> = {
    acknowledged: "Acknowledged",
    resolved: "Resolved",
    declined: "Declined",
  };
  const statusColor: Record<string, string> = {
    acknowledged: "#d97706",
    resolved: "#16a34a",
    declined: "#dc2626",
  };
  const label = statusLabel[status] ?? status;
  const color = statusColor[status] ?? "#525a70";

  const html = emailHtml("Request Update", `
    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#0E282D;margin:0 0 8px;">Update on Your Request</h2>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi ${clientName}, we have reviewed your request regarding your <strong>${docLabel}</strong>.</p>
    <div style="margin-bottom:16px;">
      <span style="display:inline-block;padding:4px 12px;background:${color}20;color:${color};border-radius:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${label}</span>
    </div>
    <div style="background:#faf8f5;border-left:3px solid #ede8e2;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
      <p style="color:#0E282D;font-size:14px;line-height:1.7;margin:0;">${adminResponse.replace(/\n/g, "<br>")}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="https://adam.andykgroup.com/dashboard/${documentType}s" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View in Portal &#8594;</a>
    </div>
    <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">If you have further questions, please don&#8217;t hesitate to reach out.<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
  `);

  return await sendEmail({
    to: clientEmail,
    from: "info@andykgroup.com",
    subject: `Update on your ${docLabel} request — Andy'K Group`,
    text: `Hi ${clientName},\n\nYour request regarding your ${docLabel} has been ${label}.\n\n${adminResponse}\n\nView your portal: https://adam.andykgroup.com/dashboard/${documentType}s\n\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Client Activation ───────────────────────────────────────────────────────

// ─── Contract signature reminder ─────────────────────────────────────────────

export async function sendContractSignatureReminder({
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
  const url = `https://adam.andykgroup.com/dashboard/contracts/${contractId}`;
  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your contract is waiting for your signature</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">This is a friendly reminder that your contract <strong>${contractTitle}</strong> has been ready for your signature for over 7 days. Please review and sign at your earliest convenience to keep your project on track.</p>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review &amp; Sign Contract &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    subject: `Reminder: Please sign your contract — ${contractTitle}`,
    text: `Hi ${clientName},\n\nYour contract "${contractTitle}" has been awaiting your signature for over 7 days.\n\nReview and sign here: ${url}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Proposal response reminder ───────────────────────────────────────────────

export async function sendProposalResponseReminder({
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
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your proposal is awaiting your response</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">We&#8217;re following up on proposal <strong>${proposalTitle}</strong>, which has been ready for your review for over 5 days. Please take a moment to confirm or request changes so we can move your project forward.</p>
    <div style="margin-bottom:32px;">
      <a href="${url}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Proposal &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    subject: `Reminder: Please respond to your proposal — ${proposalTitle}`,
    text: `Hi ${clientName},\n\nProposal "${proposalTitle}" has been awaiting your response for over 5 days.\n\nReview it here: ${url}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Monthly report email ─────────────────────────────────────────────────────

export async function sendMonthlyReport({
  clientEmail,
  clientName,
  companyName,
  month,
  healthScore,
  milestonesCompleted,
  invoicesPaid,
  invoicesOutstanding,
  recentActivities,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  month: string;
  healthScore: number;
  milestonesCompleted: string[];
  invoicesPaid: number;
  invoicesOutstanding: number;
  recentActivities: string[];
}) {
  const portalUrl = "https://adam.andykgroup.com/dashboard";
  const milestoneHtml = milestonesCompleted.length
    ? milestonesCompleted.map((m) => `<li style="color:#525a70;font-size:14px;line-height:1.8;">${m}</li>`).join("")
    : `<li style="color:#8b93a8;font-size:14px;font-style:italic;">No milestones completed this month</li>`;
  const activityHtml = recentActivities.length
    ? recentActivities.map((a) => `<li style="color:#525a70;font-size:13px;line-height:1.8;">${a}</li>`).join("")
    : `<li style="color:#8b93a8;font-size:13px;font-style:italic;">No recent activity</li>`;

  const scoreColor = healthScore >= 80 ? "#16a34a" : healthScore >= 60 ? "#d97706" : "#dc2626";

  const html = emailHtml("Monthly Report", `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">${month} Summary</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your monthly progress report</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi ${clientName},<br>Here&#8217;s a summary of ${companyName}&#8217;s progress during <strong>${month}</strong>.</p>
    <div style="background:#f0f4f4;border:1px solid #ede8e2;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 12px;text-align:center;border-right:1px solid #ede8e2;">
            <div style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Health Score</div>
            <div style="font-size:28px;font-weight:700;color:${scoreColor};">${healthScore}</div>
          </td>
          <td style="padding:8px 12px;text-align:center;border-right:1px solid #ede8e2;">
            <div style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Milestones Done</div>
            <div style="font-size:28px;font-weight:700;color:#0E282D;">${milestonesCompleted.length}</div>
          </td>
          <td style="padding:8px 12px;text-align:center;">
            <div style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Outstanding Invoices</div>
            <div style="font-size:28px;font-weight:700;color:${invoicesOutstanding > 0 ? "#d97706" : "#0E282D"};">${invoicesOutstanding}</div>
          </td>
        </tr>
      </table>
    </div>
    <div style="margin-bottom:20px;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">Milestones completed this month</p>
      <ul style="margin:0;padding-left:20px;">${milestoneHtml}</ul>
    </div>
    <div style="margin-bottom:24px;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">Recent activity</p>
      <ul style="margin:0;padding-left:20px;">${activityHtml}</ul>
    </div>
    <div style="margin-bottom:32px;">
      <a href="${portalUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">View Your Portal &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);

  return await sendEmail({
    to: clientEmail,
    subject: `${companyName} — ${month} Progress Report`,
    text: `Hi ${clientName},\n\nHere's your ${month} summary for ${companyName}.\n\nHealth Score: ${healthScore}/100\nMilestones completed: ${milestonesCompleted.length}\nInvoices paid: ${invoicesPaid}\nOutstanding invoices: ${invoicesOutstanding}\n\nView your portal: ${portalUrl}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Subscription activated email ────────────────────────────────────────────

export async function sendSubscriptionActivated({
  clientEmail,
  clientName,
  companyName,
  planName,
  billingCycle,
  activationDate,
  paidUntil,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  planName: string;
  billingCycle: string;
  activationDate: string;
  paidUntil: string;
}) {
  const html = emailHtml(undefined, `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Subscription Active</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.25;">Your A.D.A.M. subscription<br>is now active</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Your payment has been verified and your A.D.A.M. subscription for <strong>${companyName}</strong> is now active. Your service period has begun.</p>
    <div style="background:#f0f4f4;border-left:3px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">Subscription details</p>
      <p style="color:#0E282D;font-size:14px;margin:0 0 4px;"><strong>Plan:</strong> ${planName}</p>
      <p style="color:#0E282D;font-size:14px;margin:0 0 4px;"><strong>Billing cycle:</strong> ${billingCycle}</p>
      <p style="color:#0E282D;font-size:14px;margin:0 0 4px;"><strong>Service start:</strong> ${new Date(activationDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      <p style="color:#0E282D;font-size:14px;margin:0;"><strong>Service period ends:</strong> ${new Date(paidUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
    </div>
    <div style="margin-bottom:32px;">
      <a href="https://adam.andykgroup.com/dashboard" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Go to Your Portal &#8594;</a>
    </div>
    <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">For billing questions contact us at ceo@andykgroup.com.<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
  `);

  return await sendEmail({
    to: clientEmail,
    from: "info@andykgroup.com",
    subject: `Your A.D.A.M. subscription is now active — ${companyName}`,
    text: `Hi ${clientName},\n\nYour A.D.A.M. subscription for ${companyName} is now active.\n\nPlan: ${planName}\nBilling cycle: ${billingCycle}\nService start: ${activationDate}\nService period ends: ${paidUntil}\n\nLog in to your portal: https://adam.andykgroup.com/dashboard\n\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Launch invitation ────────────────────────────────────────────────────────

export async function sendLaunchInvitation({
  name,
  email,
  company,
  plan,
  leadId,
}: {
  name: string;
  email: string;
  company?: string | null;
  plan?: string | null;
  leadId?: string | null;
}) {
  const applyUrl = `https://adam.andykgroup.com/#pricing`;
  const html = emailHtml("Founding Client Program", `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">License Activation Invitation</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.25;">Your A.D.A.M. license activation<br>invitation is ready</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">After reviewing your application${company ? ` from ${company}` : ""}, we&#8217;re pleased to confirm that you have been selected for the <strong style="color:#0E282D;">Founding Client Program</strong>. Your license will be activated by our team following business verification.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">What this means for you</p>
      <ul style="color:#525a70;font-size:14px;line-height:1.8;margin:0;padding-left:18px;">
        <li>Founding Client pricing locked for the lifetime of your license</li>
        <li>Priority onboarding and dedicated support during implementation</li>
        <li>Direct input into upcoming A.D.A.M. features</li>
        ${plan ? `<li>Selected plan: <strong style="color:#0E282D;">${plan}</strong></li>` : ""}
      </ul>
    </div>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">To confirm your place and proceed with payment, use the link below. Availability is limited to 20 companies.</p>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${applyUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:-0.2px;">Confirm Your Place &#8594;</a>
    </div>
    <p style="color:#8b93a8;font-size:12px;font-family:'Courier New',Courier,monospace;text-align:center;margin:0 0 24px;">or visit: <a href="${applyUrl}" style="color:#2F9E9A;text-decoration:none;">${applyUrl}</a></p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong><br><span style="color:#8b93a8;font-size:12px;">ceo@andykgroup.com</span></p>
    </div>
  `);
  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: "Your A.D.A.M. License Activation Invitation — Founding Client Program",
    text: `Hi ${name},\n\nAfter reviewing your application${company ? ` from ${company}` : ""}, we're pleased to confirm that you have been selected for the A.D.A.M. Founding Client Program.\n\nYour license will be activated by our team following business verification. Founding Client pricing is locked for the lifetime of your license.\n\nConfirm your place here: ${applyUrl}\n\nWarm regards,\nThe Andy'K Group International LTD Team\nceo@andykgroup.com`,
    html,
  });
}

// ─── Demo invitation (personal invite, pre-NDA) ───────────────────────────────

export async function sendDemoInvitation({
  contactName,
  contactEmail,
  companyName,
  invitedByName,
  ndaSignUrl,
}: {
  contactName: string;
  contactEmail: string;
  companyName: string;
  invitedByName: string;
  ndaSignUrl: string;
}) {
  const html = emailHtml("Private Invitation", `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Personal Invitation</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.25;">You&#8217;ve been personally invited<br>to a private A.D.A.M. demo</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${contactName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">You&#8217;ve been personally invited by <strong style="color:#0E282D;">${invitedByName}</strong>, CEO of Andy&#8217;K Group International LTD, to a private demo of A.D.A.M. for ${companyName}.</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">Before the demo, we ask that you sign a short Non-Disclosure Agreement to protect the confidential information shown during the walkthrough. Once signed, your private demo access link is generated automatically.</p>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${ndaSignUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:-0.2px;">Review &amp; Sign the NDA &#8594;</a>
    </div>
    <p style="color:#8b93a8;font-size:12px;font-family:'Courier New',Courier,monospace;text-align:center;margin:0 0 24px;">or visit: <a href="${ndaSignUrl}" style="color:#2F9E9A;text-decoration:none;">${ndaSignUrl}</a></p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>${invitedByName}</strong><br><span style="color:#8b93a8;font-size:12px;">Andy&#8217;K Group International LTD</span></p>
    </div>
  `);
  return await sendEmail({
    to: contactEmail,
    from: "info@andykgroup.com",
    subject: `You've been personally invited to a private A.D.A.M. demo — ${invitedByName}`,
    text: `Hi ${contactName},\n\nYou've been personally invited by ${invitedByName}, CEO of Andy'K Group International LTD, to a private demo of A.D.A.M. for ${companyName}.\n\nBefore the demo, please sign a short Non-Disclosure Agreement. Once signed, your private demo access link is generated automatically.\n\nReview and sign the NDA: ${ndaSignUrl}\n\nWarm regards,\n${invitedByName}\nAndy'K Group International LTD`,
    html,
  });
}

// ─── Seller partner invitation ─────────────────────────────────────────────

export async function sendSellerInvitation({
  fullName,
  email,
  invitedByName,
  registerUrl,
}: {
  fullName: string;
  email: string;
  invitedByName: string;
  registerUrl: string;
}) {
  const html = emailHtml("Partner Invitation", `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Seller Partner Invitation</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.25;">You&#8217;ve been invited to become<br>an A.D.A.M. seller partner</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${fullName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">${invitedByName} has invited you to join the Andy&#8217;K Group International LTD seller partner program for A.D.A.M. As a partner, you&#8217;ll get your own referral link and earn commission on companies you refer who become clients.</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">To get started, set up your account below. You&#8217;ll then be asked to sign our Seller Partner Agreement before your referral link goes live.</p>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${registerUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:-0.2px;">Set Up Your Account &#8594;</a>
    </div>
    <p style="color:#8b93a8;font-size:12px;font-family:'Courier New',Courier,monospace;text-align:center;margin:0 0 24px;">or visit: <a href="${registerUrl}" style="color:#2F9E9A;text-decoration:none;">${registerUrl}</a></p>
    <p style="color:#8b93a8;font-size:12px;line-height:1.6;margin:0 0 24px;">This invitation link expires in 7 days.</p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: `You've been invited to become an A.D.A.M. seller partner`,
    text: `Hi ${fullName},\n\n${invitedByName} has invited you to join the Andy'K Group International LTD seller partner program for A.D.A.M.\n\nSet up your account: ${registerUrl}\n\nThis invitation link expires in 7 days.\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Payment received (admin notification) ────────────────────────────────────

export async function sendPaymentReceivedAdmin({
  name,
  email,
  company,
  plan,
  billingCycle,
  amountGbp,
}: {
  name: string;
  email: string;
  company?: string | null;
  plan?: string | null;
  billingCycle?: string | null;
  amountGbp: number;
}) {
  const adminUrl = "https://adam.andykgroup.com/admin/clients";
  const formattedAmount = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amountGbp);
  const html = emailHtml("Payment Received", `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Payment received — pending activation</h1>
    <div style="background:#f0f4f4;border:1px solid #ede8e2;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 8px;">Amount Received</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:40px;font-weight:700;color:#0E282D;margin:0;line-height:1;">${formattedAmount}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${company ? `<tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;width:120px;border-bottom:1px solid #ede8e2;">Company</td><td style="padding:7px 0;color:#0E282D;font-size:13px;font-weight:600;border-bottom:1px solid #ede8e2;">${company}</td></tr>` : ""}
      <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Name</td><td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${name}</td></tr>
      <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Email</td><td style="padding:7px 0;font-size:13px;border-bottom:1px solid #ede8e2;"><a href="mailto:${email}" style="color:#2F9E9A;text-decoration:none;">${email}</a></td></tr>
      ${plan ? `<tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Plan</td><td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${plan}${billingCycle ? ` — ${billingCycle}` : ""}</td></tr>` : ""}
    </table>
    <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0 0 24px;">Business verification is required before activation. Please review the client record and verify documentation.</p>
    <div style="margin-bottom:32px;">
      <a href="${adminUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Client &#8594;</a>
    </div>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#8b93a8;font-size:12px;margin:0;font-family:'Courier New',Courier,monospace;">Automated notification &mdash; A.D.A.M. &middot; Revolut Webhook</p>
    </div>
  `);
  return await sendEmail({
    to: "ceo@andykgroup.com",
    from: "info@andykgroup.com",
    subject: `Payment received: ${formattedAmount} — ${company || name}`,
    text: `Payment received via Revolut.\n\nCompany: ${company || "—"}\nName: ${name}\nEmail: ${email}\nPlan: ${plan || "—"}${billingCycle ? ` (${billingCycle})` : ""}\nAmount: ${formattedAmount}\n\nBusiness verification required before activation.\n\nReview: ${adminUrl}`,
    html,
  });
}

// ─── Payment confirmation (client) ────────────────────────────────────────────

export async function sendPaymentConfirmation({
  clientEmail,
  clientName,
  companyName,
  planName,
  billingCycle,
  amountGbp,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  planName: string;
  billingCycle: string;
  amountGbp: number;
}) {
  const formattedAmount = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amountGbp);
  const html = emailHtml(undefined, `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Payment Confirmed</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.25;">Your payment has been received</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you — we&#8217;ve successfully received your payment for <strong>${companyName}</strong>. Your account is now pending activation, which will begin after business verification is completed.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#8b93a8;font-family:'Courier New',Courier,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px;">Payment summary</p>
      <p style="color:#0E282D;font-size:14px;margin:0 0 4px;"><strong>Amount paid:</strong> ${formattedAmount}</p>
      <p style="color:#0E282D;font-size:14px;margin:0 0 4px;"><strong>Plan:</strong> ${planName} — ${billingCycle}</p>
      <p style="color:#525a70;font-size:13px;margin:0 0 4px;">Your billing period will begin from the date of account activation, not the date of payment.</p>
    </div>
    <div style="background:#f0f4f4;border-left:2px solid #ede8e2;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#0E282D;font-size:13px;font-weight:600;margin:0 0 4px;">What happens next</p>
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Our team will review your business verification documents and activate your account within 3&ndash;5 business days. You will receive a separate confirmation when your account goes live.</p>
    </div>
    <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0 0 24px;">Questions? Contact us at <a href="mailto:ceo@andykgroup.com" style="color:#2F9E9A;text-decoration:none;">ceo@andykgroup.com</a>.</p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    from: "info@andykgroup.com",
    subject: `Payment confirmed — ${formattedAmount} received for ${companyName}`,
    text: `Hi ${clientName},\n\nThank you — we've received your payment of ${formattedAmount} for ${companyName}.\n\nPlan: ${planName} — ${billingCycle}\n\nYour account is pending activation. Billing begins from activation date, not payment date.\n\nWe will notify you once your account is live (typically 3–5 business days after verification).\n\nQuestions? ceo@andykgroup.com\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Subscription expiry warning ──────────────────────────────────────────────

export async function sendSubscriptionExpiryWarning({
  clientEmail,
  clientName,
  companyName,
  planName,
  paidUntil,
  daysLeft,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  planName: string;
  paidUntil: string;
  daysLeft: number;
}) {
  const formattedDate = new Date(paidUntil).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const html = emailHtml(undefined, `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Subscription Expiring Soon</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">This is a reminder that the A.D.A.M. subscription for <strong>${companyName}</strong> (${planName}) is due to expire on <strong style="color:#0E282D;">${formattedDate}</strong>.</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#0E282D;font-size:14px;margin:0 0 4px;"><strong>Plan:</strong> ${planName}</p>
      <p style="color:#0E282D;font-size:14px;margin:0;"><strong>Expires:</strong> ${formattedDate}</p>
    </div>
    <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0 0 24px;">To continue uninterrupted access, please contact us to arrange renewal before the expiry date. Your data and configuration will be retained for 30 days after expiry.</p>
    <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0 0 28px;">Contact us at <a href="mailto:ceo@andykgroup.com" style="color:#2F9E9A;text-decoration:none;">ceo@andykgroup.com</a> to renew or discuss your options.</p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    from: "info@andykgroup.com",
    subject: `Reminder: Your A.D.A.M. subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — ${companyName}`,
    text: `Hi ${clientName},\n\nYour A.D.A.M. subscription for ${companyName} (${planName}) expires on ${formattedDate} — ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining.\n\nTo renew, contact us at ceo@andykgroup.com.\n\nYour data will be retained for 30 days after expiry.\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Subscription expired ─────────────────────────────────────────────────────

export async function sendSubscriptionExpired({
  clientEmail,
  clientName,
  companyName,
  planName,
  expiredOn,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  planName: string;
  expiredOn: string;
}) {
  const formattedDate = new Date(expiredOn).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const html = emailHtml(undefined, `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Subscription Expired</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your A.D.A.M. subscription has ended</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">The A.D.A.M. subscription for <strong>${companyName}</strong> (${planName}) expired on <strong style="color:#0E282D;">${formattedDate}</strong>. Access to your portal has been suspended.</p>
    <div style="background:#f0f4f4;border-left:2px solid #ede8e2;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#0E282D;font-size:13px;font-weight:600;margin:0 0 6px;">Your data is retained for 30 days</p>
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Your account data and configuration will be held until <strong>${new Date(new Date(expiredOn).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>. After this date it may be permanently deleted.</p>
    </div>
    <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0 0 28px;">To reactivate your account or discuss renewal options, contact us at <a href="mailto:ceo@andykgroup.com" style="color:#2F9E9A;text-decoration:none;">ceo@andykgroup.com</a>.</p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);
  return await sendEmail({
    to: clientEmail,
    from: "info@andykgroup.com",
    subject: `Your A.D.A.M. subscription has ended — ${companyName}`,
    text: `Hi ${clientName},\n\nYour A.D.A.M. subscription for ${companyName} (${planName}) expired on ${formattedDate}.\n\nAccess has been suspended. Your data will be retained for 30 days.\n\nTo reactivate, contact ceo@andykgroup.com.\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Payment failed ───────────────────────────────────────────────────────────

export async function sendPaymentFailed({
  clientEmail,
  clientName,
  companyName,
  planName,
  amountGbp,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
  planName: string;
  amountGbp: number;
}) {
  const formattedAmount = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amountGbp);
  const html = emailHtml(undefined, `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Payment Failed</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">We were unable to process your payment</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Unfortunately, we were unable to process a payment of <strong style="color:#0E282D;">${formattedAmount}</strong> for your A.D.A.M. ${planName} subscription (${companyName}).</p>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#0E282D;font-size:13px;font-weight:600;margin:0 0 6px;">Common reasons for payment failure</p>
      <ul style="color:#525a70;font-size:13px;line-height:1.8;margin:0;padding-left:18px;">
        <li>Insufficient funds or card limit</li>
        <li>Card expired or incorrect billing details</li>
        <li>Bank security block on the transaction</li>
      </ul>
    </div>
    <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0 0 28px;">Your access will remain active during a 7-day grace period. Please contact us to resolve this as soon as possible to avoid interruption to your service.</p>
    <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0 0 28px;">Contact us at <a href="mailto:ceo@andykgroup.com" style="color:#2F9E9A;text-decoration:none;">ceo@andykgroup.com</a> to arrange payment or update your details.</p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);

  await Promise.all([
    sendEmail({
      to: clientEmail,
      from: "info@andykgroup.com",
      subject: `Action required: Payment of ${formattedAmount} failed — ${companyName}`,
      text: `Hi ${clientName},\n\nWe were unable to process your payment of ${formattedAmount} for your A.D.A.M. ${planName} subscription (${companyName}).\n\nYour access remains active for 7 days. Please contact us at ceo@andykgroup.com to resolve this.\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
      html,
    }),
    sendEmail({
      to: "ceo@andykgroup.com",
      from: "info@andykgroup.com",
      subject: `⚠️ Payment failed: ${formattedAmount} — ${companyName}`,
      text: `Payment failed.\n\nCompany: ${companyName}\nClient: ${clientName} (${clientEmail})\nPlan: ${planName}\nAmount: ${formattedAmount}\n\nClient has been notified. 7-day grace period active.\n\nReview: https://adam.andykgroup.com/admin/clients`,
      html: emailHtml("Payment Failed", `
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Payment failed — action may be required</h1>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;width:110px;border-bottom:1px solid #ede8e2;">Company</td><td style="padding:7px 0;color:#0E282D;font-size:13px;font-weight:600;border-bottom:1px solid #ede8e2;">${companyName}</td></tr>
          <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Client</td><td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${clientName} &lt;${clientEmail}&gt;</td></tr>
          <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #ede8e2;">Plan</td><td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${planName}</td></tr>
          <tr><td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.08em;">Amount</td><td style="padding:7px 0;color:#0E282D;font-size:13px;font-weight:600;">${formattedAmount}</td></tr>
        </table>
        <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0 0 24px;">Client has been notified. 7-day grace period is active. Access remains unaffected during this window.</p>
        <a href="https://adam.andykgroup.com/admin/clients" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Review Client &#8594;</a>
      `),
    }),
  ]);
}

// ─── Client activation email ──────────────────────────────────────────────────

export async function sendClientActivationEmail({
  clientEmail,
  clientName,
  companyName,
}: {
  clientEmail: string;
  clientName: string;
  companyName: string;
}) {
  const html = emailHtml(undefined, `
    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">System Activated</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.25;">Your A.D.A.M. system<br>is now active</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${clientName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">We&#8217;re pleased to confirm that your A.D.A.M. system for <strong>${companyName}</strong> has been fully activated. Your implementation is now live and our team is ready to begin work.</p>
    <div style="background:#f0fdf4;border-left:3px solid #16a34a;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#0E282D;font-size:13px;font-weight:600;margin:0 0 8px;">Your next steps</p>
      <ul style="color:#525a70;font-size:14px;line-height:1.8;margin:0;padding-left:18px;">
        <li>Log in to your client portal to review your project milestones</li>
        <li>Check your implementation timeline and upcoming deliverables</li>
        <li>Reach out to your assigned team member with any questions</li>
      </ul>
    </div>
    <div style="margin-bottom:32px;">
      <a href="https://adam.andykgroup.com/dashboard" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">Go to Your Portal &#8594;</a>
    </div>
    <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Welcome to the active phase of your engagement. We look forward to delivering results together.<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
  `);

  return await sendEmail({
    to: clientEmail,
    from: "info@andykgroup.com",
    subject: `Your A.D.A.M. system is now active — ${companyName}`,
    text: `Hi ${clientName},\n\nYour A.D.A.M. system for ${companyName} has been fully activated.\n\nLog in to your portal: https://adam.andykgroup.com/dashboard\n\nThe Andy'K Group International LTD Team`,
    html,
  });
}

// ─── Company admin activation (v1.1) ─────────────────────────────────────────

export async function sendCompanyActivationEmail({
  adminEmail,
  firstName,
  companyName,
  licenseTier,
  tempPassword,
}: {
  adminEmail: string;
  firstName: string;
  companyName: string;
  licenseTier: "trial" | "full" | "founding";
  tempPassword: string;
}) {
  const loginUrl = "https://adam.andykgroup.com/sign-in";
  const tierLabel: Record<string, string> = {
    trial:    "Trial License",
    full:     "Full License",
    founding: "Founding Client License",
  };

  const html = emailHtml(undefined, `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#0E282D;margin:0 0 20px;line-height:1.3;">Your A.D.A.M. admin account is ready</h1>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${firstName},</p>
    <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Andy&#8217;K Group International LTD has activated your <strong style="color:#0E282D;">A.D.A.M.</strong> admin account for
      <strong style="color:#0E282D;">${companyName}</strong>. You can now log in to your administration panel and begin setting up your workspace.
    </p>
    <div style="background:#f0f4f4;border:1px solid #ede8e2;border-radius:10px;padding:24px;margin-bottom:28px;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8b93a8;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">Your Account Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;width:130px;border-bottom:1px solid #ede8e2;">Company</td>
          <td style="padding:7px 0;color:#0E282D;font-size:13px;font-weight:600;border-bottom:1px solid #ede8e2;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">License</td>
          <td style="padding:7px 0;color:#0E282D;font-size:13px;border-bottom:1px solid #ede8e2;">${tierLabel[licenseTier] ?? licenseTier}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;border-bottom:1px solid #ede8e2;">Email</td>
          <td style="padding:7px 0;color:#525a70;font-size:13px;border-bottom:1px solid #ede8e2;">${adminEmail}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#8b93a8;font-size:11px;font-family:'Courier New',Courier,monospace;text-transform:uppercase;letter-spacing:0.1em;">Temp Password</td>
          <td style="padding:7px 0;font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:700;color:#0E282D;letter-spacing:0.05em;">${tempPassword}</td>
        </tr>
      </table>
    </div>
    <div style="background:#f0f4f4;border-left:2px solid #2F9E9A;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="color:#0E282D;font-size:13px;font-weight:600;margin:0 0 4px;">Important</p>
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">You will be prompted to set a new password on your first login. Please do so immediately and keep it secure.</p>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${loginUrl}" style="display:inline-block;background:#2F9E9A;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:-0.2px;">Log in to A.D.A.M. &#8594;</a>
    </div>
    <p style="color:#8b93a8;font-size:12px;font-family:'Courier New',Courier,monospace;text-align:center;margin:0 0 24px;">or visit: <a href="${loginUrl}" style="color:#2F9E9A;text-decoration:none;">${loginUrl}</a></p>
    <div style="border-top:1px solid #ede8e2;padding-top:20px;">
      <p style="color:#525a70;font-size:13px;line-height:1.6;margin:0;">Warm regards,<br><strong>The Andy&#8217;K Group International LTD Team</strong></p>
    </div>
  `);

  return await sendEmail({
    to: adminEmail,
    from: "info@andykgroup.com",
    subject: `Your A.D.A.M. admin account is ready — ${companyName}`,
    text: `Hi ${firstName},\n\nYour A.D.A.M. admin account for ${companyName} has been activated.\n\nLicense: ${tierLabel[licenseTier] ?? licenseTier}\nEmail: ${adminEmail}\nTemporary password: ${tempPassword}\n\nYou will be prompted to set a new password on first login.\n\nLog in here: ${loginUrl}\n\nWarm regards,\nThe Andy'K Group International LTD Team`,
    html,
  });
}
