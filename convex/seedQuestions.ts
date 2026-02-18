import { internalMutation } from "./_generated/server";

const sections = [
  {
    sectionId: "goals-context",
    title: "Goals & Context",
    subsections: [{ id: "goals", title: "Goals & Context" }],
    order: 0,
  },
  {
    sectionId: "company-profile",
    title: "Company Profile",
    subsections: [
      { id: "company-contacts", title: "Company & Contacts" },
      { id: "scale-presence", title: "Scale & Presence" },
      { id: "market-position", title: "Market Position" },
    ],
    order: 1,
  },
  {
    sectionId: "segment-selection",
    title: "Service Selection",
    subsections: [{ id: "segment", title: "Select Your Services" }],
    order: 2,
  },
  {
    sectionId: "b2b",
    title: "B2B — Lead Generation",
    subsections: [
      { id: "b2b-goals", title: "What You're Trying to Achieve" },
      { id: "b2b-package", title: "Package Selection" },
      { id: "b2b-target", title: "Target Market" },
      { id: "b2b-campaign", title: "Campaign Intelligence" },
      { id: "b2b-tech", title: "Tech Stack & Reporting" },
    ],
    order: 3,
  },
  {
    sectionId: "b2g",
    title: "B2G — Government Contracts",
    subsections: [
      { id: "b2g-goals", title: "What You're Trying to Achieve" },
      { id: "b2g-package", title: "Package Selection" },
      { id: "b2g-scope", title: "Target Scope" },
      { id: "b2g-compliance", title: "Capacity & Compliance" },
      { id: "b2g-strategy", title: "Strategy & Priorities" },
    ],
    order: 4,
  },
  {
    sectionId: "adam",
    title: "A.D.A.M. — System Licensing",
    subsections: [
      { id: "adam-automate", title: "What You're Trying to Automate" },
      { id: "adam-package", title: "Package Selection" },
      { id: "adam-config", title: "Configuration & Integration" },
      { id: "adam-future", title: "Launch & Future Plans" },
    ],
    order: 5,
  },
  {
    sectionId: "proposal-readiness",
    title: "Proposal Readiness",
    subsections: [{ id: "proposal", title: "Proposal Readiness" }],
    order: 6,
  },
  {
    sectionId: "attachments",
    title: "Attachments",
    subsections: [{ id: "uploads", title: "Upload Documents" }],
    order: 7,
  },
  {
    sectionId: "review",
    title: "Review & Submit",
    subsections: [{ id: "review-submit", title: "Review Your Answers" }],
    order: 8,
  },
];

const questions = [
  // ─── Section 1: Goals & Context ───
  { questionId: "reachOutReason", number: 1, question: "What made you reach out to Andy'K Group right now?", type: "long-text" as const, required: true, section: "goals-context", subsection: "goals" },
  { questionId: "successVision", number: 2, question: "What does success look like for you 12 months from now?", type: "long-text" as const, required: true, section: "goals-context", subsection: "goals" },
  { questionId: "biggestObstacle", number: 3, question: "What's the single biggest obstacle standing between you and that outcome?", type: "long-text" as const, required: true, section: "goals-context", subsection: "goals" },
  { questionId: "previousAgency", number: 4, question: "Have you worked with an external agency or automation partner before?", type: "single-select" as const, required: true, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }], section: "goals-context", subsection: "goals" },
  { questionId: "previousAgencyDetails", number: 5, question: "What worked and what didn't?", type: "long-text" as const, required: false, conditionalOn: { questionId: "previousAgency", value: "yes" }, section: "goals-context", subsection: "goals" },
  { questionId: "urgencyLevel", number: 6, question: "How urgent is this for you?", type: "single-select" as const, required: true, options: [{ label: "We need to move immediately (this is costing us money or time now)", value: "immediate" }, { label: "We have a clear deadline", value: "deadline" }, { label: "We're planning ahead — no hard deadline yet", value: "planning" }, { label: "Exploring options, no commitment yet", value: "exploring" }], section: "goals-context", subsection: "goals" },
  { questionId: "urgencyDeadline", number: 7, question: "What is your deadline?", type: "text" as const, required: false, conditionalOn: { questionId: "urgencyLevel", value: "deadline" }, section: "goals-context", subsection: "goals" },
  { questionId: "partnerConfidence", number: 8, question: "What would need to be true for you to feel confident moving forward with a partner?", type: "long-text" as const, required: true, section: "goals-context", subsection: "goals" },

  // ─── Section 2: Company Profile — Company & Contacts ───
  { questionId: "companyName", number: 9, question: "Legal company name (as in official registration)?", type: "text" as const, required: true, placeholder: "e.g. Acme Corporation Ltd", section: "company-profile", subsection: "company-contacts" },
  { questionId: "websiteUrl", number: 10, question: "Website URL?", type: "url" as const, required: false, placeholder: "https://example.com", section: "company-profile", subsection: "company-contacts" },
  { questionId: "billingCurrency", number: 11, question: "Billing currency?", type: "single-select" as const, required: true, options: [{ label: "EUR (€)", value: "EUR" }, { label: "GBP (£)", value: "GBP" }, { label: "USD ($)", value: "USD" }, { label: "Other", value: "Other" }], section: "company-profile", subsection: "company-contacts" },
  { questionId: "contactName", number: 12, question: "Primary contact for this engagement (full name)?", type: "text" as const, required: true, placeholder: "John Smith", section: "company-profile", subsection: "company-contacts" },
  { questionId: "contactPhone", number: 13, question: "Phone?", type: "phone" as const, required: true, placeholder: "+44 20 1234 5678", section: "company-profile", subsection: "company-contacts" },
  { questionId: "contactEmail", number: 14, question: "Email?", type: "email" as const, required: true, placeholder: "john@example.com", section: "company-profile", subsection: "company-contacts" },
  { questionId: "isDecisionMaker", number: 15, question: "Are you the person who will make the final decision on this?", type: "single-select" as const, required: true, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }], section: "company-profile", subsection: "company-contacts" },
  { questionId: "decisionMakerDetails", number: 16, question: "Who is the decision maker? (name / role)", type: "text" as const, required: false, conditionalOn: { questionId: "isDecisionMaker", value: "no" }, section: "company-profile", subsection: "company-contacts" },
  { questionId: "otherStakeholders", number: 17, question: "Who else is involved in evaluating or approving this decision?", type: "text" as const, required: false, section: "company-profile", subsection: "company-contacts" },
  { questionId: "address", number: 18, question: "Registered business address?", type: "address" as const, required: true, section: "company-profile", subsection: "company-contacts" },
  { questionId: "dataEnrichmentConsent", number: 19, question: "I agree to data enrichment using public sources and official registers", type: "checkbox" as const, required: true, section: "company-profile", subsection: "company-contacts" },

  // ─── Section 2: Scale & Presence ───
  { questionId: "socialProfiles", number: 20, question: "LinkedIn / Social profiles?", type: "text" as const, required: false, placeholder: "https://linkedin.com/company/...", section: "company-profile", subsection: "scale-presence" },
  { questionId: "countriesOfOperation", number: 21, question: "Countries you currently operate in?", type: "text" as const, required: true, placeholder: "UK, Germany, Netherlands...", section: "company-profile", subsection: "scale-presence" },
  { questionId: "yearsInBusiness", number: 22, question: "Years in business?", type: "single-select" as const, required: true, options: [{ label: "< 1 year", value: "<1" }, { label: "1–3 years", value: "1-3" }, { label: "3–5 years", value: "3-5" }, { label: "5–10 years", value: "5-10" }, { label: "10+ years", value: "10+" }], section: "company-profile", subsection: "scale-presence" },
  { questionId: "annualRevenue", number: 23, question: "Annual revenue range? (optional — helps us right-size the solution)", type: "single-select" as const, required: false, options: [{ label: "< €100K", value: "<100K" }, { label: "€100K–€500K", value: "100K-500K" }, { label: "€500K–€1M", value: "500K-1M" }, { label: "€1M–€5M", value: "1M-5M" }, { label: "€5M–€20M", value: "5M-20M" }, { label: "€20M+", value: "20M+" }, { label: "Prefer not to say", value: "undisclosed" }], section: "company-profile", subsection: "scale-presence" },

  // ─── Section 2: Market Position ───
  { questionId: "productsServices", number: 24, question: "What do you sell and who do you sell it to?", type: "long-text" as const, required: true, placeholder: "Describe your main offerings and target audience...", section: "company-profile", subsection: "market-position" },
  { questionId: "usp", number: 25, question: "What makes you meaningfully different from your competitors?", type: "long-text" as const, required: true, placeholder: "What makes you stand out?", section: "company-profile", subsection: "market-position" },
  { questionId: "competitors", number: 26, question: "Who are the competitors you most want to outperform? (name + website)", type: "long-text" as const, required: false, placeholder: "Competitor 1: example.com\nCompetitor 2: example2.com", section: "company-profile", subsection: "market-position" },
  { questionId: "clientAcquisitionChannels", number: 27, question: "How do your clients currently find you or buy from you?", type: "multi-select" as const, required: true, options: [{ label: "Email", value: "email" }, { label: "Cold outreach", value: "cold-outreach" }, { label: "LinkedIn", value: "linkedin" }, { label: "Referrals", value: "referrals" }, { label: "Events", value: "events" }, { label: "Inbound / content", value: "inbound" }, { label: "Other", value: "other" }], section: "company-profile", subsection: "market-position" },
  { questionId: "securityRequirements", number: 28, question: "Data security and compliance requirements?", type: "multi-select" as const, required: false, options: [{ label: "Special storage", value: "special-storage" }, { label: "Encryption", value: "encryption" }, { label: "GDPR compliance", value: "gdpr" }, { label: "HIPAA compliance", value: "hipaa" }, { label: "On-premise hosting", value: "on-premise" }, { label: "None specific", value: "none" }, { label: "Other", value: "other" }], section: "company-profile", subsection: "market-position" },
  { questionId: "privacyPolicyAgreed", number: 29, question: "I agree to the Privacy Policy", type: "checkbox" as const, required: true, section: "company-profile", subsection: "market-position" },

  // ─── Section 3: Service Selection ───
  { questionId: "segments", number: 30, question: "Which service(s) are you interested in?", type: "multi-select" as const, required: true, options: [{ label: "B2B — Lead Generation & Sales Development", value: "B2B" }, { label: "B2G — Public Tender & Government Contracts", value: "B2G" }, { label: "A.D.A.M. — Business Automation System Licensing", value: "ADAM" }], section: "segment-selection", subsection: "segment" },

  // ─── Section 4: B2B — What You're Trying to Achieve ───
  { questionId: "b2bDesiredClients", number: 31, question: "How many new clients per month would represent a win for you?", type: "text" as const, required: true, section: "b2b", subsection: "b2b-goals" },
  { questionId: "b2bDealSize", number: 32, question: "What's your current average deal size, and what would you like it to be?", type: "long-text" as const, required: true, section: "b2b", subsection: "b2b-goals" },
  { questionId: "b2bSalesCycle", number: 33, question: "What's your sales cycle typically look like end to end?", type: "single-select" as const, required: true, options: [{ label: "Short (< 1 month)", value: "short" }, { label: "Medium (1–3 months)", value: "medium" }, { label: "Long (> 3 months)", value: "long" }], section: "b2b", subsection: "b2b-goals" },
  { questionId: "b2bObjections", number: 34, question: "What are the top 3 objections you hear from prospects before they say no?", type: "long-text" as const, required: true, placeholder: "1. \n2. \n3. ", section: "b2b", subsection: "b2b-goals" },
  { questionId: "b2bConversionRate", number: 35, question: "What's your current lead-to-client conversion rate?", type: "text" as const, required: false, placeholder: "e.g. 5%", section: "b2b", subsection: "b2b-goals" },

  // ─── Section 4: B2B — Package Selection ───
  { questionId: "b2bPackage", number: 36, question: "Choose your B2B package", type: "single-select" as const, required: true, options: [{ label: "CORE — €950/month", value: "CORE" }, { label: "ADVANCE — €1,350/month", value: "ADVANCE" }, { label: "VANGUARD — €1,750/month", value: "VANGUARD" }, { label: "PRESTIGE — from €2,400/month", value: "PRESTIGE" }, { label: "Not sure yet — help me decide", value: "UNDECIDED" }], section: "b2b", subsection: "b2b-package" },
  { questionId: "b2bBudgetRange", number: 37, question: "What's your monthly budget range for lead generation?", type: "text" as const, required: false, section: "b2b", subsection: "b2b-package" },

  // ─── Section 4: B2B — Target Market ───
  { questionId: "b2bTargetCountries", number: 38, question: "Which countries or regions should we target?", type: "text" as const, required: true, placeholder: "e.g. DACH region, Nordics, UK...", section: "b2b", subsection: "b2b-target" },
  { questionId: "b2bTargetIndustries", number: 39, question: "Which industries are your ideal clients in?", type: "text" as const, required: true, placeholder: "e.g. SaaS, Manufacturing, Healthcare...", section: "b2b", subsection: "b2b-target" },
  { questionId: "b2bCompanySize", number: 40, question: "What company size are you after?", type: "multi-select" as const, required: true, options: [{ label: "1–10 employees", value: "1-10" }, { label: "11–50 employees", value: "11-50" }, { label: "51–200 employees", value: "51-200" }, { label: "201–1,000 employees", value: "201-1000" }, { label: "1,000+ employees", value: "1000+" }], section: "b2b", subsection: "b2b-target" },
  { questionId: "b2bContactRoles", number: 41, question: "What job titles or roles do you want to reach?", type: "multi-select" as const, required: true, options: [{ label: "CEO", value: "CEO" }, { label: "CMO", value: "CMO" }, { label: "CTO", value: "CTO" }, { label: "CFO", value: "CFO" }, { label: "Procurement", value: "Procurement" }, { label: "Sales Director", value: "Sales Director" }, { label: "Marketing Director", value: "Marketing Director" }, { label: "Other", value: "Other" }], section: "b2b", subsection: "b2b-target" },
  { questionId: "b2bSeniority", number: 42, question: "What seniority level should we target?", type: "multi-select" as const, required: true, options: [{ label: "C-Level", value: "C-Level" }, { label: "VP / Director", value: "VP/Director" }, { label: "Manager", value: "Manager" }, { label: "Team Lead", value: "Team Lead" }], section: "b2b", subsection: "b2b-target" },
  { questionId: "b2bOutreachLanguages", number: 43, question: "What languages should outreach be in?", type: "text" as const, required: true, placeholder: "e.g. English, German, French", section: "b2b", subsection: "b2b-target" },

  // ─── Section 4: B2B — Campaign Intelligence ───
  { questionId: "b2bDecisionTriggers", number: 44, question: "What are the key triggers that make your buyers take action?", type: "multi-select" as const, required: true, options: [{ label: "Cost savings", value: "cost-savings" }, { label: "Compliance pressure", value: "compliance" }, { label: "New technology", value: "new-tech" }, { label: "Speed to market", value: "speed" }, { label: "Quality improvement", value: "quality" }, { label: "After-sales support", value: "support" }, { label: "Other", value: "other" }], section: "b2b", subsection: "b2b-campaign" },
  { questionId: "b2bProductsToPromote", number: 45, question: "Which specific products or services should we lead with in this campaign?", type: "long-text" as const, required: true, placeholder: "Describe the products or services for this campaign...", section: "b2b", subsection: "b2b-campaign" },
  { questionId: "b2bMarketingMaterial", number: 46, question: "What marketing material do you have ready?", type: "multi-select" as const, required: false, options: [{ label: "Pitch deck", value: "pitch-deck" }, { label: "Brochures", value: "brochures" }, { label: "Videos", value: "videos" }, { label: "Case studies", value: "case-studies" }, { label: "White papers", value: "white-papers" }, { label: "Product demos", value: "demos" }, { label: "None yet", value: "none" }], section: "b2b", subsection: "b2b-campaign" },
  { questionId: "b2bPreviousMethods", number: 47, question: "What lead generation have you tried before, and what happened?", type: "long-text" as const, required: false, section: "b2b", subsection: "b2b-campaign" },
  { questionId: "b2bCompetitorStrengths", number: 48, question: "What are your competitors' strongest selling points that we'll need to counter?", type: "long-text" as const, required: false, section: "b2b", subsection: "b2b-campaign" },
  { questionId: "b2bCompliance", number: 49, question: "Any compliance or certification requirements we need to be aware of?", type: "long-text" as const, required: false, section: "b2b", subsection: "b2b-campaign" },

  // ─── Section 4: B2B — Tech Stack & Reporting ───
  { questionId: "b2bCrm", number: 50, question: "What CRM system do you use today? (or \"none\")", type: "text" as const, required: true, placeholder: "e.g. HubSpot, Salesforce, none", section: "b2b", subsection: "b2b-tech" },
  { questionId: "b2bReportingFormat", number: 51, question: "How do you want to receive reports?", type: "single-select" as const, required: true, options: [{ label: "Google Sheets", value: "google-sheets" }, { label: "PDF", value: "pdf" }, { label: "CRM export", value: "crm-export" }, { label: "Excel", value: "excel" }, { label: "Other", value: "other" }], section: "b2b", subsection: "b2b-tech" },
  { questionId: "b2bAddons", number: 52, question: "Optional B2B add-ons you'd like included?", type: "multi-select" as const, required: false, options: [{ label: "Extra leads beyond package", value: "extra-leads" }, { label: "CRM export setup", value: "crm-setup" }, { label: "Multilingual outreach scripts", value: "multilingual" }, { label: "AI-powered proposal generation", value: "ai-proposals" }, { label: "Custom branding package", value: "custom-branding" }, { label: "Multi-market expansion support", value: "multi-market" }, { label: "Other", value: "other" }], section: "b2b", subsection: "b2b-tech" },

  // ─── Section 5: B2G — What You're Trying to Achieve ───
  { questionId: "b2gMotivation", number: 53, question: "Why are you looking at public tenders now — what's driving this?", type: "long-text" as const, required: true, section: "b2g", subsection: "b2g-goals" },
  { questionId: "b2gPastExperience", number: 54, question: "Have you bid on government contracts before?", type: "single-select" as const, required: true, options: [{ label: "Yes, and we've won", value: "won" }, { label: "Yes, but we haven't won yet", value: "lost" }, { label: "We've never applied", value: "never" }], section: "b2g", subsection: "b2g-goals" },
  { questionId: "b2gFailureReasons", number: 55, question: "If you've lost bids before, what do you think went wrong?", type: "long-text" as const, required: false, section: "b2g", subsection: "b2g-goals" },
  { questionId: "b2gSubmissionCapacity", number: 56, question: "How many tenders can your team realistically prepare and submit per month?", type: "text" as const, required: true, placeholder: "e.g. 3-5", section: "b2g", subsection: "b2g-goals" },

  // ─── Section 5: B2G — Package Selection ───
  { questionId: "b2gPackage", number: 57, question: "Choose your B2G package", type: "single-select" as const, required: true, options: [{ label: "GovStarter — £650/month", value: "GovStarter" }, { label: "GovExpand — £1,050/month", value: "GovExpand" }, { label: "GovElite — £1,650/month", value: "GovElite" }, { label: "Not sure yet — help me decide", value: "UNDECIDED" }], section: "b2g", subsection: "b2g-package" },
  { questionId: "b2gBudgetRange", number: 58, question: "What's your monthly budget range for this service?", type: "text" as const, required: false, section: "b2g", subsection: "b2g-package" },

  // ─── Section 5: B2G — Target Scope ───
  { questionId: "b2gTargetRegions", number: 59, question: "Which regions are you targeting?", type: "single-select" as const, required: true, options: [{ label: "UK only", value: "UK" }, { label: "EU only", value: "EU" }, { label: "Both UK & EU", value: "UK+EU" }], section: "b2g", subsection: "b2g-scope" },
  { questionId: "b2gTenderTypes", number: 60, question: "What types of contracts are you looking for?", type: "multi-select" as const, required: true, options: [{ label: "RFP (Request for Proposal)", value: "RFP" }, { label: "RFQ (Request for Quotation)", value: "RFQ" }, { label: "Grants", value: "Grants" }, { label: "Frameworks", value: "Frameworks" }, { label: "Other", value: "Other" }], section: "b2g", subsection: "b2g-scope" },
  { questionId: "b2gContractValue", number: 61, question: "What contract value range are you targeting?", type: "single-select" as const, required: true, options: [{ label: "< £50K", value: "<50K" }, { label: "£50K–£150K", value: "50K-150K" }, { label: "£150K–£500K", value: "150K-500K" }, { label: "£500K–£1M", value: "500K-1M" }, { label: "£1M+", value: "1M+" }], section: "b2g", subsection: "b2g-scope" },
  { questionId: "b2gSectorFocus", number: 62, question: "What sector or industry focus?", type: "text" as const, required: true, placeholder: "e.g. Healthcare, Defence, IT...", section: "b2g", subsection: "b2g-scope" },
  { questionId: "b2gKeywords", number: 63, question: "Keywords we should use when searching for relevant tenders?", type: "text" as const, required: false, placeholder: "e.g. software development, consulting...", section: "b2g", subsection: "b2g-scope" },
  { questionId: "b2gCpvCodes", number: 64, question: "Relevant CPV codes (if you know them)?", type: "text" as const, required: false, placeholder: "e.g. 72000000-5", section: "b2g", subsection: "b2g-scope" },

  // ─── Section 5: B2G — Capacity & Compliance ───
  { questionId: "b2gBidResources", number: 65, question: "What does your internal bid team look like? (team size & experience)", type: "long-text" as const, required: false, placeholder: "Team size: 2\nExperience: Intermediate", section: "b2g", subsection: "b2g-compliance" },
  { questionId: "b2gExperienceLevel", number: 66, question: "Experience level?", type: "single-select" as const, required: true, options: [{ label: "No experience", value: "none" }, { label: "Beginner (1–3 bids submitted)", value: "beginner" }, { label: "Intermediate (4–10 bids submitted)", value: "intermediate" }, { label: "Experienced (10+ bids submitted)", value: "experienced" }], section: "b2g", subsection: "b2g-compliance" },
  { questionId: "b2gBidCompliance", number: 67, question: "Which compliance requirements apply to you?", type: "multi-select" as const, required: false, options: [{ label: "ISO certification", value: "iso" }, { label: "GDPR compliance", value: "gdpr" }, { label: "Insurance levels", value: "insurance" }, { label: "Security clearance", value: "security" }, { label: "Financial thresholds", value: "financial" }, { label: "None yet", value: "none" }, { label: "Other", value: "other" }], section: "b2g", subsection: "b2g-compliance" },
  { questionId: "b2gConsortium", number: 68, question: "Are you open to consortium partnerships to qualify for larger contracts?", type: "single-select" as const, required: true, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }, { label: "Open to it — tell me more", value: "maybe" }], section: "b2g", subsection: "b2g-compliance" },
  { questionId: "b2gTranslation", number: 69, question: "Do you need translation support for bids?", type: "single-select" as const, required: true, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }], section: "b2g", subsection: "b2g-compliance" },

  // ─── Section 5: B2G — Strategy & Priorities ───
  { questionId: "b2gEvaluationCriteria", number: 70, question: "What matters most in how contracts are evaluated?", type: "multi-select" as const, required: true, options: [{ label: "Price", value: "price" }, { label: "Quality", value: "quality" }, { label: "Innovation", value: "innovation" }, { label: "Sustainability", value: "sustainability" }, { label: "Local content", value: "local" }, { label: "Relevant experience", value: "experience" }, { label: "Other", value: "other" }], section: "b2g", subsection: "b2g-strategy" },
  { questionId: "b2gGrantInterest", number: 71, question: "Are you interested in grant funding opportunities as well?", type: "single-select" as const, required: false, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }], section: "b2g", subsection: "b2g-strategy" },
  { questionId: "b2gReportingFrequency", number: 72, question: "Preferred reporting frequency?", type: "single-select" as const, required: true, options: [{ label: "Weekly", value: "weekly" }, { label: "Bi-weekly", value: "bi-weekly" }, { label: "Monthly", value: "monthly" }], section: "b2g", subsection: "b2g-strategy" },
  { questionId: "b2gAddons", number: 73, question: "Optional B2G add-ons?", type: "multi-select" as const, required: false, options: [{ label: "Grant writing", value: "grant-writing" }, { label: "Pitch deck creation", value: "pitch-deck" }, { label: "Translation services", value: "translation" }, { label: "Consortium matching", value: "consortium" }, { label: "Other", value: "other" }], section: "b2g", subsection: "b2g-strategy" },

  // ─── Section 6: A.D.A.M. — What You're Trying to Automate ───
  { questionId: "adamWorkflowDescription", number: 74, question: "Walk us through what your client onboarding or operational workflow looks like today — step by step if possible.", type: "long-text" as const, required: true, section: "adam", subsection: "adam-automate" },
  { questionId: "adamBreakdownPoints", number: 75, question: "Where does it break down or slow you down the most?", type: "multi-select" as const, required: true, options: [{ label: "Too much manual data entry", value: "manual-entry" }, { label: "Slow follow-up and communication gaps", value: "follow-up" }, { label: "Errors and inaccuracies", value: "errors" }, { label: "No visibility into where clients are in the process", value: "no-visibility" }, { label: "Team coordination issues", value: "coordination" }, { label: "All of the above", value: "all" }, { label: "Other", value: "other" }], section: "adam", subsection: "adam-automate" },
  { questionId: "adamNewClientsPerMonth", number: 76, question: "How many new clients do you onboard per month on average?", type: "text" as const, required: true, section: "adam", subsection: "adam-automate" },
  { questionId: "adamTeamMembers", number: 77, question: "How many team members will use this system?", type: "text" as const, required: true, placeholder: "e.g. 3", section: "adam", subsection: "adam-automate" },
  { questionId: "adamProcessCost", number: 78, question: "What does a broken or slow process cost you today? (in time, revenue, or client satisfaction)", type: "long-text" as const, required: false, section: "adam", subsection: "adam-automate" },

  // ─── Section 6: A.D.A.M. — Package Selection ───
  { questionId: "adamPackage", number: 79, question: "Choose your A.D.A.M. package", type: "single-select" as const, required: true, options: [{ label: "Starter — Basic features, single user", value: "Starter" }, { label: "Professional — Full features, team access", value: "Professional" }, { label: "Enterprise — Custom deployment, priority support", value: "Enterprise" }, { label: "Not sure yet — help me decide", value: "UNDECIDED" }], section: "adam", subsection: "adam-package" },
  { questionId: "adamBranding", number: 80, question: "Do you need custom branding on the system?", type: "single-select" as const, required: true, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }], section: "adam", subsection: "adam-package" },
  { questionId: "adamBudgetRange", number: 81, question: "What's your budget range for this?", type: "text" as const, required: false, section: "adam", subsection: "adam-package" },

  // ─── Section 6: A.D.A.M. — Configuration & Integration ───
  { questionId: "adamCompanyName", number: 82, question: "Full legal company name and registration number?", type: "text" as const, required: true, section: "adam", subsection: "adam-config" },
  { questionId: "adamWebsite", number: 83, question: "Company website (we'll use it to pull branding and copy)?", type: "url" as const, required: true, placeholder: "https://example.com", section: "adam", subsection: "adam-config" },
  { questionId: "adamIndustry", number: 84, question: "Primary industry and target client type?", type: "text" as const, required: true, section: "adam", subsection: "adam-config" },
  { questionId: "adamServicesCount", number: 85, question: "How many different services or products do you offer?", type: "text" as const, required: true, section: "adam", subsection: "adam-config" },
  { questionId: "adamCustomTemplates", number: 86, question: "Do you need custom contract templates built into the system?", type: "single-select" as const, required: true, options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }], section: "adam", subsection: "adam-config" },
  { questionId: "adamIntegrations", number: 87, question: "What tools or systems do you need A.D.A.M. to connect with?", type: "multi-select" as const, required: false, options: [{ label: "CRM", value: "crm" }, { label: "Email platform", value: "email" }, { label: "WhatsApp / messaging", value: "messaging" }, { label: "Payment processing", value: "payments" }, { label: "Accounting software", value: "accounting" }, { label: "Other", value: "other" }], section: "adam", subsection: "adam-config" },
  { questionId: "adamAiMode", number: 88, question: "What AI mode do you prefer?", type: "single-select" as const, required: true, options: [{ label: "Free AI (built-in)", value: "free" }, { label: "OpenAI (premium)", value: "openai" }, { label: "Custom / hybrid", value: "custom" }], section: "adam", subsection: "adam-config" },
  { questionId: "adamConfigAddons", number: 89, question: "Additional add-ons you'd like?", type: "multi-select" as const, required: false, options: [{ label: "Extra document templates", value: "extra-templates" }, { label: "AI outreach scripts", value: "ai-outreach" }, { label: "Other", value: "other" }], section: "adam", subsection: "adam-config" },

  // ─── Section 6: A.D.A.M. — Launch & Future Plans ───
  { questionId: "adamLaunchDeadline", number: 90, question: "When do you need this live?", type: "single-select" as const, required: true, options: [{ label: "Urgent (< 2 weeks)", value: "urgent" }, { label: "Standard (2–4 weeks)", value: "standard" }, { label: "Flexible (1–2 months)", value: "flexible" }, { label: "No hard deadline", value: "no-rush" }], section: "adam", subsection: "adam-future" },
  { questionId: "adamFutureUpgrades", number: 91, question: "What are you thinking about for the future?", type: "multi-select" as const, required: false, options: [{ label: "E.V.A. AI agent integration", value: "eva" }, { label: "SaaS licensing to your own clients", value: "saas" }, { label: "Custom modules", value: "custom" }, { label: "Other", value: "other" }], section: "adam", subsection: "adam-future" },

  // ─── Section 7: Proposal Readiness ───
  { questionId: "proposalBudget", number: 92, question: "What budget have you set aside for this engagement? (a range is fine)", type: "text" as const, required: true, section: "proposal-readiness", subsection: "proposal" },
  { questionId: "proposalBudgetApproval", number: 93, question: "Is this budget already approved, or does it need sign-off?", type: "single-select" as const, required: true, options: [{ label: "Approved and ready", value: "approved" }, { label: "Needs internal sign-off", value: "needs-signoff" }, { label: "Budget isn't confirmed yet", value: "unconfirmed" }], section: "proposal-readiness", subsection: "proposal" },
  { questionId: "proposalSignoffTimeline", number: 94, question: "What is the timeline for internal sign-off?", type: "text" as const, required: false, conditionalOn: { questionId: "proposalBudgetApproval", value: "needs-signoff" }, section: "proposal-readiness", subsection: "proposal" },
  { questionId: "proposalPartnerCriteria", number: 95, question: "What would make you choose one partner over another at this stage?", type: "long-text" as const, required: false, section: "proposal-readiness", subsection: "proposal" },
  { questionId: "proposalBlockers", number: 96, question: "Is there anything that would stop this from moving forward even if the proposal is right?", type: "long-text" as const, required: false, section: "proposal-readiness", subsection: "proposal" },
  { questionId: "proposalAdditionalContext", number: 97, question: "Any other context you think we should know before we build your proposal?", type: "long-text" as const, required: false, section: "proposal-readiness", subsection: "proposal" },

  // ─── Section 8: Attachments ───
  { questionId: "attachments", number: 98, question: "Upload any supporting documents (pitch decks, brochures, brand guidelines, contracts, process diagrams, etc.)", type: "file" as const, required: false, section: "attachments", subsection: "uploads" },
];

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingSection = await ctx.db
      .query("questionSections")
      .first();
    if (existingSection) {
      return { skipped: true, message: "Data already exists — use reseed to replace" };
    }

    // Insert sections
    for (const section of sections) {
      await ctx.db.insert("questionSections", {
        ...section,
        isActive: true,
      });
    }

    // Insert questions
    for (const q of questions) {
      await ctx.db.insert("questionItems", {
        ...q,
        isActive: true,
      });
    }

    return {
      skipped: false,
      message: `Seeded ${sections.length} sections and ${questions.length} questions (v2)`,
    };
  },
});

export const reseed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing sections
    const existingSections = await ctx.db.query("questionSections").collect();
    for (const s of existingSections) {
      await ctx.db.delete(s._id);
    }

    // Delete all existing questions
    const existingQuestions = await ctx.db.query("questionItems").collect();
    for (const q of existingQuestions) {
      await ctx.db.delete(q._id);
    }

    // Insert sections
    for (const section of sections) {
      await ctx.db.insert("questionSections", {
        ...section,
        isActive: true,
      });
    }

    // Insert questions
    for (const q of questions) {
      await ctx.db.insert("questionItems", {
        ...q,
        isActive: true,
      });
    }

    return {
      deleted: { sections: existingSections.length, questions: existingQuestions.length },
      inserted: { sections: sections.length, questions: questions.length },
      message: `Replaced ${existingSections.length} sections + ${existingQuestions.length} questions → ${sections.length} sections + ${questions.length} questions (v2)`,
    };
  },
});
