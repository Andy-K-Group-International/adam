// ─── FAQ content ──────────────────────────────────────────────────────────
// Edit the questions/answers below to update what sellers see — nothing
// else in this file needs to change for a copy update. Add/remove entries
// as needed; each answer is a single placeholder string until filled in.
const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "How is this different from a normal CRM or hiring a consultant?",
    answer:
      "[PLACEHOLDER — Andy to write actual copy. What makes A.D.A.M. a different category, not just a cheaper alternative.]",
  },
  {
    question: "How long does onboarding take?",
    answer:
      "[PLACEHOLDER — Andy to write actual copy. Realistic timeline from signed contract to a client being fully live.]",
  },
  {
    question: "What's included in the price?",
    answer:
      "[PLACEHOLDER — Andy to write actual copy. What's bundled vs. what costs extra — sellers need this to avoid over-promising.]",
  },
  {
    question: "Do you offer a trial or money-back guarantee?",
    answer:
      "[PLACEHOLDER — Andy to write actual copy. State the real policy plainly — sellers should never improvise an answer here.]",
  },
  {
    question: "What happens right after a prospect signs up?",
    answer:
      "[PLACEHOLDER — Andy to write actual copy. The next concrete steps a referred prospect should expect, so the seller can set expectations.]",
  },
];

export default function Faq() {
  return (
    <div className="space-y-5">
      {FAQ_ITEMS.map((item) => (
        <div key={item.question}>
          <h4 className="text-sm font-semibold text-foreground mb-1.5">{item.question}</h4>
          <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
