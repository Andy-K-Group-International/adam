"use server";

async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
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
      from: "A.D.A.M. <adam@andykgroupinternational.com>",
      to: [to],
      subject,
      text,
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
A.D.A.M. - AndyK Group International`,
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
A.D.A.M. - AndyK Group International`,
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
A.D.A.M. - AndyK Group International`,
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
A.D.A.M. - AndyK Group International`,
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
A.D.A.M. - AndyK Group International`,
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
A.D.A.M. - AndyK Group International`,
  });
}
