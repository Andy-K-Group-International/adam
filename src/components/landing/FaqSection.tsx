"use client";

import { useState } from "react";

function Chevron() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="faq-chevron w-4 h-4 shrink-0 transition-transform duration-200">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const faqs = [
  {
    q: "What is A.D.A.M.?",
    a: "A.D.A.M. is a Lifecycle Implementation System built by Andy'K Group International LTD. It manages your entire client lifecycle — from first contact to active implementation — in one structured operational environment.",
  },
  {
    q: "Who is A.D.A.M. for?",
    a: "A.D.A.M. is for companies that manage clients, onboard projects, or deliver services. It works for internal use or as a white-label platform for your own clients.",
  },
  {
    q: "How long does implementation take?",
    a: "The standard implementation phase is 30 days. During this period, the system is configured for your workflows before billing begins.",
  },
  {
    q: "What is the difference between Internal Use and White-label?",
    a: "Internal Use is for managing your own clients. White-label allows you to rebrand and deploy A.D.A.M. as your own platform for your clients.",
  },
  {
    q: "What happens after I apply?",
    a: "Your application is reviewed manually within 48 hours. If there is strategic alignment, you will be invited to sign an NDA and access the full implementation demo.",
  },
  {
    q: "Is A.D.A.M. an AI tool?",
    a: "A.D.A.M. is not a chatbot or AI automation tool. It is a structured operational platform. AI supports specific workflows — but humans remain in control of all strategic decisions.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-20 px-8">
      <div className="max-w-[760px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[clamp(1.875rem,1.52rem+1.25vw,2.5rem)] font-bold tracking-tight leading-[1.2] text-foreground mb-4">
            Frequently{" "}
            <span className="font-serif font-light italic text-[1.2em]">Asked</span>
            <br />
            Questions
          </h2>
        </div>

        <div className="border-t border-grid-300">
          {faqs.map((faq, i) => (
            <div key={i} className={`border-b border-grid-300 ${open === i ? "faq-open" : ""}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex items-center justify-between w-full py-5 text-left gap-4 cursor-pointer"
              >
                <span className={`text-base font-medium transition-colors ${open === i ? "text-highlight" : "text-foreground"}`}>
                  {faq.q}
                </span>
                <span className={`transition-colors ${open === i ? "text-highlight" : "text-muted-2"}`}>
                  <Chevron />
                </span>
              </button>
              <div className="faq-answer">
                <p className="pb-5 text-sm text-muted leading-relaxed max-w-[640px]">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
