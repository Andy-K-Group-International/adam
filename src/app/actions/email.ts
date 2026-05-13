"use server";

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
      from: `Andy'K Group <${from}>`,
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
  return await sendEmail({
    to: clientEmail,
    subject: `New Contract Available: ${contractTitle}`,
    text: `Hi ${clientName},

A new contract "${contractTitle}" has been published for your review.

Please log in to your portal to view the contract details and take action.

Contract ID: ${contractId}

Best regards,
A.D.A.M. - Andy'K Group International LTD`,
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
  return await sendEmail({
    to: staffEmail,
    subject: `Changes Requested: ${contractTitle}`,
    text: `Hi,

${clientName} has requested changes to the contract "${contractTitle}".

Comment: ${comment}

Contract ID: ${contractId}

Please log in to review the requested changes.

Best regards,
A.D.A.M. - Andy'K Group International LTD`,
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
  return await sendEmail({
    to: staffEmail,
    subject: `Contract Signed by Client: ${contractTitle}`,
    text: `Hi,

${clientName} has signed the contract "${contractTitle}".

Contract ID: ${contractId}

Please log in to review and countersign the contract.

Best regards,
A.D.A.M. - Andy'K Group International LTD`,
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
  return await sendEmail({
    to: clientEmail,
    subject: `Contract Finalized: ${contractTitle}`,
    text: `Hi ${clientName},

Great news! The contract "${contractTitle}" has been fully executed and is now finalized.

Contract ID: ${contractId}

You can view the finalized contract in your portal at any time.

Best regards,
A.D.A.M. - Andy'K Group International LTD`,
  });
}

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
  return await sendEmail({
    to: staffEmail,
    subject: `New Questionnaire Submitted: ${companyName}`,
    text: `Hi,

A new questionnaire has been submitted.

Company: ${companyName}
Contact: ${contactName} (${contactEmail})
Questionnaire ID: ${questionnaireId}

Please log in to review the submission.

Best regards,
A.D.A.M. - Andy'K Group International LTD`,
  });
}

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
  return await sendEmail({
    to: staffEmail,
    subject: `New Contact Form Submission from ${name}`,
    text: `Hi,

A new contact form submission has been received.

Name: ${name}
Email: ${email}

Message:
${message}

Best regards,
A.D.A.M. - Andy'K Group International LTD`,
  });
}

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
  return await sendEmail({
    to: clientEmail,
    subject: `Proposal Ready for Review: ${proposalTitle}`,
    text: `Hi ${clientName},

A proposal "${proposalTitle}" is ready for your review.

Please log in to your client portal to read the proposal and share your decision.

Proposal ID: ${proposalId}

Best regards,
A.D.A.M. - Andy'K Group International LTD`,
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
  const verb = decision === "approved" ? "approved" : "declined";
  return await sendEmail({
    to: staffEmail,
    subject: `Proposal ${decision === "approved" ? "Approved" : "Declined"}: ${proposalTitle}`,
    text: `Hi,

${clientName} has ${verb} the proposal "${proposalTitle}".
${comment ? `\nClient comment: ${comment}\n` : ""}
Proposal ID: ${proposalId}

Please log in to review and take the next steps.

Best regards,
A.D.A.M. - Andy'K Group International LTD`,
  });
}

// ── Lead emails ───────────────────────────────────────────────────────────────

export async function sendLeadConfirmation({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#01011b;padding:28px 40px;border-radius:12px 12px 0 0;">
        <span style="color:#C9707D;font-weight:700;font-size:17px;letter-spacing:-0.3px;">Andy'K Group</span>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border:1px solid #e2e4ea;border-top:none;border-radius:0 0 12px 12px;">
        <h1 style="font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;">Your application has been received</h1>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">Thank you for reaching out to Andy'K Group. We've received your application and our team will review it carefully.</p>
        <div style="background:#faf9fb;border-left:3px solid #C9707D;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <p style="color:#01011b;font-size:14px;font-weight:600;margin:0 0 6px;">What happens next</p>
          <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">Our team will review your details within 48 hours. If we're the right fit for each other, you'll hear from us directly with next steps.</p>
        </div>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 32px;">In the meantime, feel free to explore our work at <a href="https://andykgroup.com" style="color:#C9707D;text-decoration:none;">andykgroup.com</a>.</p>
        <hr style="border:none;border-top:1px solid #f5f5f7;margin:0 0 24px;">
        <p style="color:#8b93a8;font-size:13px;line-height:1.6;margin:0;">
          Warm regards,<br>
          <strong style="color:#525a70;">The Andy'K Group Team</strong><br>
          <a href="https://andykgroup.com" style="color:#C9707D;text-decoration:none;">andykgroup.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: "Your application has been received — Andy'K Group",
    text: `Hi ${name},\n\nThank you for reaching out to Andy'K Group. We've received your application and our team will review it within 48 hours.\n\nIf we're the right fit, you'll hear from us directly with next steps.\n\nWarm regards,\nThe Andy'K Group Team\nhttps://andykgroup.com`,
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#01011b;padding:28px 40px;border-radius:12px 12px 0 0;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#C9707D;font-weight:700;font-size:17px;">Andy'K Group</span>
        <span style="color:white;font-size:13px;opacity:0.5;">New Lead Alert</span>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border:1px solid #e2e4ea;border-top:none;border-radius:0 0 12px 12px;">
        <h1 style="font-size:20px;font-weight:700;color:#01011b;margin:0 0 4px;">New lead: ${company || name}</h1>
        <p style="color:#8b93a8;font-size:13px;margin:0 0 28px;">Submitted via andykgroup.com</p>

        <div style="background:#faf9fb;border:1px solid #e2e4ea;border-radius:8px;padding:20px;margin-bottom:24px;text-align:center;">
          <p style="color:#8b93a8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Lead Score</p>
          <p style="color:#01011b;font-size:48px;font-weight:700;margin:0;line-height:1;">${score}</p>
          <p style="color:#8b93a8;font-size:13px;margin:4px 0 0;">out of 100</p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr style="border-bottom:1px solid #f5f5f7;">
            <td style="padding:8px 0;color:#8b93a8;font-size:13px;width:140px;">Revenue</td>
            <td style="padding:8px 0;color:#525a70;font-size:13px;">${breakdown.revenue.label}</td>
            <td style="padding:8px 0;color:#01011b;font-size:13px;font-weight:600;text-align:right;">${breakdown.revenue.score}/${breakdown.revenue.max}</td>
          </tr>
          <tr style="border-bottom:1px solid #f5f5f7;">
            <td style="padding:8px 0;color:#8b93a8;font-size:13px;">Timeline</td>
            <td style="padding:8px 0;color:#525a70;font-size:13px;">${breakdown.timeline.label}</td>
            <td style="padding:8px 0;color:#01011b;font-size:13px;font-weight:600;text-align:right;">${breakdown.timeline.score}/${breakdown.timeline.max}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#8b93a8;font-size:13px;">Authority</td>
            <td style="padding:8px 0;color:#525a70;font-size:13px;">${breakdown.decision_authority.label}</td>
            <td style="padding:8px 0;color:#01011b;font-size:13px;font-weight:600;text-align:right;">${breakdown.decision_authority.score}/${breakdown.decision_authority.max}</td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          ${company ? `<tr><td style="padding:6px 0;color:#8b93a8;font-size:13px;width:120px;">Company</td><td style="padding:6px 0;color:#525a70;font-size:13px;font-weight:500;">${company}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#8b93a8;font-size:13px;">Name</td><td style="padding:6px 0;color:#525a70;font-size:13px;">${name}</td></tr>
          <tr><td style="padding:6px 0;color:#8b93a8;font-size:13px;">Email</td><td style="padding:6px 0;color:#C9707D;font-size:13px;"><a href="mailto:${email}" style="color:#C9707D;text-decoration:none;">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:6px 0;color:#8b93a8;font-size:13px;">Phone</td><td style="padding:6px 0;color:#525a70;font-size:13px;">${phone}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#8b93a8;font-size:13px;">Services</td><td style="padding:6px 0;color:#525a70;font-size:13px;">${services}</td></tr>
          ${questionnaire.website ? `<tr><td style="padding:6px 0;color:#8b93a8;font-size:13px;">Website</td><td style="padding:6px 0;font-size:13px;"><a href="${String(questionnaire.website)}" style="color:#C9707D;text-decoration:none;">${questionnaire.website}</a></td></tr>` : ""}
        </table>

        ${questionnaire.business_description ? `<div style="margin-bottom:16px;"><p style="color:#8b93a8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Business Description</p><p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${questionnaire.business_description}</p></div>` : ""}
        ${questionnaire.biggest_challenge ? `<div style="margin-bottom:28px;"><p style="color:#8b93a8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Biggest Challenge</p><p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">${questionnaire.biggest_challenge}</p></div>` : ""}

        <a href="${reviewUrl}" style="display:inline-block;background:#C9707D;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">Review Lead →</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

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
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#01011b;padding:28px 40px;border-radius:12px 12px 0 0;">
        <span style="color:#C9707D;font-weight:700;font-size:17px;letter-spacing:-0.3px;">Andy'K Group</span>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border:1px solid #e2e4ea;border-top:none;border-radius:0 0 12px 12px;">
        <h1 style="font-size:22px;font-weight:700;color:#01011b;margin:0 0 20px;">Regarding your application</h1>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Thank you for taking the time to reach out to Andy'K Group and for the interest you've shown in working with us.</p>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">After carefully reviewing your application, we don't feel we're the right fit for your current needs.${reason ? ` ${reason}` : ""}</p>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 32px;">This isn't a permanent decision — circumstances change, and we'd genuinely welcome the opportunity to reconsider in the future. We wish you every success with your business in the meantime.</p>
        <hr style="border:none;border-top:1px solid #f5f5f7;margin:0 0 24px;">
        <p style="color:#8b93a8;font-size:13px;line-height:1.6;margin:0;">
          Warm regards,<br>
          <strong style="color:#525a70;">The Andy'K Group Team</strong><br>
          <a href="https://andykgroup.com" style="color:#C9707D;text-decoration:none;">andykgroup.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: "Regarding your Andy'K Group application",
    text: `Hi ${name},\n\nThank you for reaching out to Andy'K Group.\n\nAfter reviewing your application, we don't feel we're the right fit for your current needs.${reason ? " " + reason : ""}\n\nThis isn't permanent — we'd welcome the opportunity to reconnect in the future.\n\nWarm regards,\nThe Andy'K Group Team\nhttps://andykgroup.com`,
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#01011b;padding:28px 40px;border-radius:12px 12px 0 0;">
        <span style="color:#C9707D;font-weight:700;font-size:17px;letter-spacing:-0.3px;">Andy'K Group</span>
        <span style="color:rgba(255,255,255,0.35);font-size:13px;margin-left:12px;">Strategic Assessment</span>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border:1px solid #e2e4ea;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#8b93a8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">You've been approved</p>
        <h1 style="font-size:24px;font-weight:700;color:#01011b;margin:0 0 20px;line-height:1.2;">Your Strategic Assessment<br>is ready to begin</h1>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">After reviewing your initial application${company ? ` from ${company}` : ""}, our team has determined there is genuine potential for alignment. You have been selected to proceed to the full Strategic Assessment.</p>
        <div style="background:#faf9fb;border-left:3px solid #C9707D;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
          <p style="color:#01011b;font-size:14px;font-weight:600;margin:0 0 6px;">What this means</p>
          <p style="color:#525a70;font-size:14px;line-height:1.6;margin:0;">The Strategic Assessment is a comprehensive evaluation covering your company structure, strategic positioning, sales operations, financial readiness, and growth intent. It forms the foundation of our engagement.</p>
        </div>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 28px;">Your personalised assessment link is below. It is valid until <strong style="color:#01011b;">${expiryDate}</strong> — please complete it before then.</p>
        <div style="text-align:center;margin-bottom:28px;">
          <a href="${link}" style="display:inline-block;background:#C9707D;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:-0.2px;">Begin Strategic Assessment →</a>
        </div>
        <div style="background:#faf9fb;border:1px solid #e2e4ea;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
          <p style="color:#8b93a8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Your private link</p>
          <p style="font-family:monospace;font-size:12px;color:#525a70;word-break:break-all;margin:0;">${link}</p>
        </div>
        <hr style="border:none;border-top:1px solid #f5f5f7;margin:0 0 24px;">
        <p style="color:#8b93a8;font-size:13px;line-height:1.6;margin:0;">
          Warm regards,<br>
          <strong style="color:#525a70;">The Andy'K Group Team</strong><br>
          <a href="https://andykgroup.com" style="color:#C9707D;text-decoration:none;">andykgroup.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: "Your Andy'K Group Strategic Assessment is ready",
    text: `Hi ${name},\n\nYou've been approved to proceed to the Andy'K Group Strategic Assessment.\n\nYour personalised link is valid until ${expiryDate}:\n${link}\n\nPlease complete the assessment before it expires.\n\nWarm regards,\nThe Andy'K Group Team\nhttps://andykgroup.com`,
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#01011b;padding:28px 40px;border-radius:12px 12px 0 0;">
        <span style="color:#C9707D;font-weight:700;font-size:17px;letter-spacing:-0.3px;">Andy'K Group</span>
      </td></tr>
      <tr><td style="background:#ffffff;padding:40px;border:1px solid #e2e4ea;border-top:none;border-radius:0 0 12px 12px;">
        <h1 style="font-size:20px;font-weight:700;color:#01011b;margin:0 0 20px;">Your assessment link expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}</h1>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${name},</p>
        <p style="color:#525a70;font-size:15px;line-height:1.7;margin:0 0 24px;">This is a reminder that your Andy'K Group Strategic Assessment link expires in <strong style="color:#01011b;">${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong>. Please complete it before it expires.</p>
        <div style="text-align:center;margin-bottom:28px;">
          <a href="${link}" style="display:inline-block;background:#C9707D;color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">Complete Assessment →</a>
        </div>
        <hr style="border:none;border-top:1px solid #f5f5f7;margin:0 0 24px;">
        <p style="color:#8b93a8;font-size:13px;line-height:1.6;margin:0;">
          Warm regards,<br>
          <strong style="color:#525a70;">The Andy'K Group Team</strong><br>
          <a href="https://andykgroup.com" style="color:#C9707D;text-decoration:none;">andykgroup.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  return await sendEmail({
    to: email,
    from: "info@andykgroup.com",
    subject: `Reminder: ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to complete your Strategic Assessment`,
    text: `Hi ${name},\n\nYour Andy'K Group Strategic Assessment link expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.\n\nComplete it here:\n${link}\n\nWarm regards,\nThe Andy'K Group Team`,
    html,
  });
}
