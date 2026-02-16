"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

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

export const sendContractPublished = action({
  args: {
    clientEmail: v.string(),
    clientName: v.string(),
    contractTitle: v.string(),
    contractId: v.string(),
  },
  handler: async (_ctx, args) => {
    return await sendEmail({
      to: args.clientEmail,
      subject: `New Contract Available: ${args.contractTitle}`,
      text: `Hi ${args.clientName},

A new contract "${args.contractTitle}" has been published for your review.

Please log in to your portal to view the contract details and take action.

Contract ID: ${args.contractId}

Best regards,
A.D.A.M. - AndyK Group International`,
    });
  },
});

export const sendChangesRequested = action({
  args: {
    staffEmail: v.string(),
    clientName: v.string(),
    contractTitle: v.string(),
    contractId: v.string(),
    comment: v.string(),
  },
  handler: async (_ctx, args) => {
    return await sendEmail({
      to: args.staffEmail,
      subject: `Changes Requested: ${args.contractTitle}`,
      text: `Hi,

${args.clientName} has requested changes to the contract "${args.contractTitle}".

Comment: ${args.comment}

Contract ID: ${args.contractId}

Please log in to review the requested changes.

Best regards,
A.D.A.M. - AndyK Group International`,
    });
  },
});

export const sendContractSigned = action({
  args: {
    staffEmail: v.string(),
    clientName: v.string(),
    contractTitle: v.string(),
    contractId: v.string(),
  },
  handler: async (_ctx, args) => {
    return await sendEmail({
      to: args.staffEmail,
      subject: `Contract Signed by Client: ${args.contractTitle}`,
      text: `Hi,

${args.clientName} has signed the contract "${args.contractTitle}".

Contract ID: ${args.contractId}

Please log in to review and countersign the contract.

Best regards,
A.D.A.M. - AndyK Group International`,
    });
  },
});

export const sendContractFinalized = action({
  args: {
    clientEmail: v.string(),
    clientName: v.string(),
    contractTitle: v.string(),
    contractId: v.string(),
  },
  handler: async (_ctx, args) => {
    return await sendEmail({
      to: args.clientEmail,
      subject: `Contract Finalized: ${args.contractTitle}`,
      text: `Hi ${args.clientName},

Great news! The contract "${args.contractTitle}" has been fully executed and is now finalized.

Contract ID: ${args.contractId}

You can view the finalized contract in your portal at any time.

Best regards,
A.D.A.M. - AndyK Group International`,
    });
  },
});

export const sendQuestionnaireReceived = action({
  args: {
    staffEmail: v.string(),
    companyName: v.string(),
    contactName: v.string(),
    contactEmail: v.string(),
    questionnaireId: v.string(),
  },
  handler: async (_ctx, args) => {
    return await sendEmail({
      to: args.staffEmail,
      subject: `New Questionnaire Submitted: ${args.companyName}`,
      text: `Hi,

A new questionnaire has been submitted.

Company: ${args.companyName}
Contact: ${args.contactName} (${args.contactEmail})
Questionnaire ID: ${args.questionnaireId}

Please log in to review the submission.

Best regards,
A.D.A.M. - AndyK Group International`,
    });
  },
});

export const sendContactForm = action({
  args: {
    staffEmail: v.string(),
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (_ctx, args) => {
    return await sendEmail({
      to: args.staffEmail,
      subject: `New Contact Form Submission from ${args.name}`,
      text: `Hi,

A new contact form submission has been received.

Name: ${args.name}
Email: ${args.email}

Message:
${args.message}

Best regards,
A.D.A.M. - AndyK Group International`,
    });
  },
});
