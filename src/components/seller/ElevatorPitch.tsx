// ─── Elevator pitch content ──────────────────────────────────────────────
// Edit the text below to update what sellers see — nothing else in this
// file needs to change for a copy update. Each section is a list of
// paragraphs (or bullet-style lines); add/remove strings as needed, keep
// the section headers as the object keys.
const PITCH_SECTIONS: { heading: string; paragraphs: string[] }[] = [
  {
    heading: "What is A.D.A.M.",
    paragraphs: [
      "[PLACEHOLDER — Andy to write actual copy. 2-3 plain-language sentences describing A.D.A.M.: what it does, who runs it, and what problem it solves. Avoid internal jargon — this needs to work read aloud to a prospect who has never heard of it.]",
    ],
  },
  {
    heading: "Who it's for",
    paragraphs: [
      "[PLACEHOLDER — Andy to write actual copy. Describe the ideal customer profile: company size/stage, industry, and the situation that makes A.D.A.M. relevant to them right now.]",
    ],
  },
  {
    heading: "Key value props",
    paragraphs: [
      "[PLACEHOLDER — Andy to write actual copy. One value prop per line — what changes for the client, not just what the product does. Sellers will read these near-verbatim in early conversations.]",
    ],
  },
  {
    heading: "Common objections + answers",
    paragraphs: [
      "[PLACEHOLDER — Andy to write actual copy. Format as \"Objection\" followed by the answer, one pair per line, e.g. isn't this expensive / why not just hire someone / how is this different from a normal CRM.]",
    ],
  },
  // Company/ecosystem context — comes after the A.D.A.M. sections above
  // since A.D.A.M. is what sellers are actually selling; these two exist
  // for when a prospect asks about the bigger picture.
  {
    heading: "E.V.E. Intelligence System",
    paragraphs: [
      "[PLACEHOLDER — Andy to write actual copy. What E.V.E. is, and how it relates to A.D.A.M. as a companion product — e.g. bundled vs. sold separately, what E.V.E. adds on top of A.D.A.M. Keep this brief: sellers are selling A.D.A.M., this is just enough for \"what else do you offer.\"]",
    ],
  },
  {
    heading: "The Andy'K Group Ecosystem",
    paragraphs: [
      "[PLACEHOLDER — Andy to write actual copy. Brief overview that Andy'K Group is a multi-brand group: B2B SaaS via A.D.A.M. and E.V.E., plus a separate music vertical (DJ Andy'K, Andy'K Music Lab, Andy'K Records). Enough for a seller to answer \"who are you as a company\" if asked — no need for depth on the music side, that's not what sellers are selling.]",
    ],
  },
];

export default function ElevatorPitch() {
  return (
    <div className="space-y-5">
      {PITCH_SECTIONS.map((section) => (
        <div key={section.heading}>
          <h4 className="text-sm font-semibold text-foreground mb-1.5">{section.heading}</h4>
          {section.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-sm text-muted leading-relaxed whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
