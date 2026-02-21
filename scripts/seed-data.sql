-- ============================================================================
-- ADAM Seed Data
-- Seeds question_sections, question_items, and proposal_templates tables
-- Converted from convex/seedQuestions.ts
-- ============================================================================

BEGIN;

-- ── Question Sections ──────────────────────────────────────────────────────────

INSERT INTO question_sections (section_id, title, subsections, "order", is_active) VALUES
('goals-context', 'Goals & Context', '[{"id": "goals", "title": "Goals & Context"}]'::jsonb, 0, true),
('company-profile', 'Company Profile', '[{"id": "company-contacts", "title": "Company & Contacts"}, {"id": "scale-presence", "title": "Scale & Presence"}, {"id": "market-position", "title": "Market Position"}]'::jsonb, 1, true),
('segment-selection', 'Service Selection', '[{"id": "segment", "title": "Select Your Services"}]'::jsonb, 2, true),
('b2b', 'B2B — Lead Generation', '[{"id": "b2b-goals", "title": "What You''re Trying to Achieve"}, {"id": "b2b-package", "title": "Package Selection"}, {"id": "b2b-target", "title": "Target Market"}, {"id": "b2b-campaign", "title": "Campaign Intelligence"}, {"id": "b2b-tech", "title": "Tech Stack & Reporting"}]'::jsonb, 3, true),
('b2g', 'B2G — Government Contracts', '[{"id": "b2g-goals", "title": "What You''re Trying to Achieve"}, {"id": "b2g-package", "title": "Package Selection"}, {"id": "b2g-scope", "title": "Target Scope"}, {"id": "b2g-compliance", "title": "Capacity & Compliance"}, {"id": "b2g-strategy", "title": "Strategy & Priorities"}]'::jsonb, 4, true),
('adam', 'A.D.A.M. — System Licensing', '[{"id": "adam-automate", "title": "What You''re Trying to Automate"}, {"id": "adam-package", "title": "Package Selection"}, {"id": "adam-config", "title": "Configuration & Integration"}, {"id": "adam-future", "title": "Launch & Future Plans"}]'::jsonb, 5, true),
('proposal-readiness', 'Proposal Readiness', '[{"id": "proposal", "title": "Proposal Readiness"}]'::jsonb, 6, true),
('attachments', 'Attachments', '[{"id": "uploads", "title": "Upload Documents"}]'::jsonb, 7, true),
('review', 'Review & Submit', '[{"id": "review-submit", "title": "Review Your Answers"}]'::jsonb, 8, true);

-- ── Question Items ──────────────────────────────────────────────────────────────

-- Section 1: Goals & Context
INSERT INTO question_items (question_id, number, question, type, required, options, placeholder, conditional_on, section, subsection, is_active) VALUES
('reachOutReason', 1, 'What made you reach out to Andy''K Group right now?', 'long-text', true, NULL, NULL, NULL, 'goals-context', 'goals', true),
('successVision', 2, 'What does success look like for you 12 months from now?', 'long-text', true, NULL, NULL, NULL, 'goals-context', 'goals', true),
('biggestObstacle', 3, 'What''s the single biggest obstacle standing between you and that outcome?', 'long-text', true, NULL, NULL, NULL, 'goals-context', 'goals', true),
('previousAgency', 4, 'Have you worked with an external agency or automation partner before?', 'single-select', true, '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]'::jsonb, NULL, NULL, 'goals-context', 'goals', true),
('previousAgencyDetails', 5, 'What worked and what didn''t?', 'long-text', false, NULL, NULL, '{"questionId": "previousAgency", "value": "yes"}'::jsonb, 'goals-context', 'goals', true),
('urgencyLevel', 6, 'How urgent is this for you?', 'single-select', true, '[{"label": "We need to move immediately (this is costing us money or time now)", "value": "immediate"}, {"label": "We have a clear deadline", "value": "deadline"}, {"label": "We''re planning ahead — no hard deadline yet", "value": "planning"}, {"label": "Exploring options, no commitment yet", "value": "exploring"}]'::jsonb, NULL, NULL, 'goals-context', 'goals', true),
('urgencyDeadline', 7, 'What is your deadline?', 'text', false, NULL, NULL, '{"questionId": "urgencyLevel", "value": "deadline"}'::jsonb, 'goals-context', 'goals', true),
('partnerConfidence', 8, 'What would need to be true for you to feel confident moving forward with a partner?', 'long-text', true, NULL, NULL, NULL, 'goals-context', 'goals', true),

-- Section 2: Company Profile — Company & Contacts
('companyName', 9, 'Legal company name (as in official registration)?', 'text', true, NULL, 'e.g. Acme Corporation Ltd', NULL, 'company-profile', 'company-contacts', true),
('websiteUrl', 10, 'Website URL?', 'url', false, NULL, 'https://example.com', NULL, 'company-profile', 'company-contacts', true),
('billingCurrency', 11, 'Billing currency?', 'single-select', true, '[{"label": "EUR (€)", "value": "EUR"}, {"label": "GBP (£)", "value": "GBP"}, {"label": "USD ($)", "value": "USD"}, {"label": "Other", "value": "Other"}]'::jsonb, NULL, NULL, 'company-profile', 'company-contacts', true),
('contactName', 12, 'Primary contact for this engagement (full name)?', 'text', true, NULL, 'John Smith', NULL, 'company-profile', 'company-contacts', true),
('contactPhone', 13, 'Phone?', 'phone', true, NULL, '+44 20 1234 5678', NULL, 'company-profile', 'company-contacts', true),
('contactEmail', 14, 'Email?', 'email', true, NULL, 'john@example.com', NULL, 'company-profile', 'company-contacts', true),
('isDecisionMaker', 15, 'Are you the person who will make the final decision on this?', 'single-select', true, '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]'::jsonb, NULL, NULL, 'company-profile', 'company-contacts', true),
('decisionMakerDetails', 16, 'Who is the decision maker? (name / role)', 'text', false, NULL, NULL, '{"questionId": "isDecisionMaker", "value": "no"}'::jsonb, 'company-profile', 'company-contacts', true),
('otherStakeholders', 17, 'Who else is involved in evaluating or approving this decision?', 'text', false, NULL, NULL, NULL, 'company-profile', 'company-contacts', true),
('address', 18, 'Registered business address?', 'address', true, NULL, NULL, NULL, 'company-profile', 'company-contacts', true),
('dataEnrichmentConsent', 19, 'I agree to data enrichment using public sources and official registers', 'checkbox', true, NULL, NULL, NULL, 'company-profile', 'company-contacts', true),

-- Section 2: Scale & Presence
('socialProfiles', 20, 'LinkedIn / Social profiles?', 'text', false, NULL, 'https://linkedin.com/company/...', NULL, 'company-profile', 'scale-presence', true),
('countriesOfOperation', 21, 'Countries you currently operate in?', 'text', true, NULL, 'UK, Germany, Netherlands...', NULL, 'company-profile', 'scale-presence', true),
('yearsInBusiness', 22, 'Years in business?', 'single-select', true, '[{"label": "< 1 year", "value": "<1"}, {"label": "1–3 years", "value": "1-3"}, {"label": "3–5 years", "value": "3-5"}, {"label": "5–10 years", "value": "5-10"}, {"label": "10+ years", "value": "10+"}]'::jsonb, NULL, NULL, 'company-profile', 'scale-presence', true),
('annualRevenue', 23, 'Annual revenue range? (optional — helps us right-size the solution)', 'single-select', false, '[{"label": "< €100K", "value": "<100K"}, {"label": "€100K–€500K", "value": "100K-500K"}, {"label": "€500K–€1M", "value": "500K-1M"}, {"label": "€1M–€5M", "value": "1M-5M"}, {"label": "€5M–€20M", "value": "5M-20M"}, {"label": "€20M+", "value": "20M+"}, {"label": "Prefer not to say", "value": "undisclosed"}]'::jsonb, NULL, NULL, 'company-profile', 'scale-presence', true),

-- Section 2: Market Position
('productsServices', 24, 'What do you sell and who do you sell it to?', 'long-text', true, NULL, 'Describe your main offerings and target audience...', NULL, 'company-profile', 'market-position', true),
('usp', 25, 'What makes you meaningfully different from your competitors?', 'long-text', true, NULL, 'What makes you stand out?', NULL, 'company-profile', 'market-position', true),
('competitors', 26, 'Who are the competitors you most want to outperform? (name + website)', 'long-text', false, NULL, E'Competitor 1: example.com\nCompetitor 2: example2.com', NULL, 'company-profile', 'market-position', true),
('clientAcquisitionChannels', 27, 'How do your clients currently find you or buy from you?', 'multi-select', true, '[{"label": "Email", "value": "email"}, {"label": "Cold outreach", "value": "cold-outreach"}, {"label": "LinkedIn", "value": "linkedin"}, {"label": "Referrals", "value": "referrals"}, {"label": "Events", "value": "events"}, {"label": "Inbound / content", "value": "inbound"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'company-profile', 'market-position', true),
('securityRequirements', 28, 'Data security and compliance requirements?', 'multi-select', false, '[{"label": "Special storage", "value": "special-storage"}, {"label": "Encryption", "value": "encryption"}, {"label": "GDPR compliance", "value": "gdpr"}, {"label": "HIPAA compliance", "value": "hipaa"}, {"label": "On-premise hosting", "value": "on-premise"}, {"label": "None specific", "value": "none"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'company-profile', 'market-position', true),
('privacyPolicyAgreed', 29, 'I agree to the Privacy Policy', 'checkbox', true, NULL, NULL, NULL, 'company-profile', 'market-position', true),

-- Section 3: Service Selection
('segments', 30, 'Which service(s) are you interested in?', 'multi-select', true, '[{"label": "B2B — Lead Generation & Sales Development", "value": "B2B"}, {"label": "B2G — Public Tender & Government Contracts", "value": "B2G"}, {"label": "A.D.A.M. — Business Automation System Licensing", "value": "ADAM"}]'::jsonb, NULL, NULL, 'segment-selection', 'segment', true),

-- Section 4: B2B — What You're Trying to Achieve
('b2bDesiredClients', 31, 'How many new clients per month would represent a win for you?', 'text', true, NULL, NULL, NULL, 'b2b', 'b2b-goals', true),
('b2bDealSize', 32, 'What''s your current average deal size, and what would you like it to be?', 'long-text', true, NULL, NULL, NULL, 'b2b', 'b2b-goals', true),
('b2bSalesCycle', 33, 'What''s your sales cycle typically look like end to end?', 'single-select', true, '[{"label": "Short (< 1 month)", "value": "short"}, {"label": "Medium (1–3 months)", "value": "medium"}, {"label": "Long (> 3 months)", "value": "long"}]'::jsonb, NULL, NULL, 'b2b', 'b2b-goals', true),
('b2bObjections', 34, 'What are the top 3 objections you hear from prospects before they say no?', 'long-text', true, NULL, E'1. \n2. \n3. ', NULL, 'b2b', 'b2b-goals', true),
('b2bConversionRate', 35, 'What''s your current lead-to-client conversion rate?', 'text', false, NULL, 'e.g. 5%', NULL, 'b2b', 'b2b-goals', true),

-- Section 4: B2B — Package Selection
('b2bPackage', 36, 'Choose your B2B package', 'single-select', true, '[{"label": "CORE — €950/month", "value": "CORE"}, {"label": "ADVANCE — €1,350/month", "value": "ADVANCE"}, {"label": "VANGUARD — €1,750/month", "value": "VANGUARD"}, {"label": "PRESTIGE — from €2,400/month", "value": "PRESTIGE"}, {"label": "Not sure yet — help me decide", "value": "UNDECIDED"}]'::jsonb, NULL, NULL, 'b2b', 'b2b-package', true),
('b2bBudgetRange', 37, 'What''s your monthly budget range for lead generation?', 'text', false, NULL, NULL, NULL, 'b2b', 'b2b-package', true),

-- Section 4: B2B — Target Market
('b2bTargetCountries', 38, 'Which countries or regions should we target?', 'text', true, NULL, 'e.g. DACH region, Nordics, UK...', NULL, 'b2b', 'b2b-target', true),
('b2bTargetIndustries', 39, 'Which industries are your ideal clients in?', 'text', true, NULL, 'e.g. SaaS, Manufacturing, Healthcare...', NULL, 'b2b', 'b2b-target', true),
('b2bCompanySize', 40, 'What company size are you after?', 'multi-select', true, '[{"label": "1–10 employees", "value": "1-10"}, {"label": "11–50 employees", "value": "11-50"}, {"label": "51–200 employees", "value": "51-200"}, {"label": "201–1,000 employees", "value": "201-1000"}, {"label": "1,000+ employees", "value": "1000+"}]'::jsonb, NULL, NULL, 'b2b', 'b2b-target', true),
('b2bContactRoles', 41, 'What job titles or roles do you want to reach?', 'multi-select', true, '[{"label": "CEO", "value": "CEO"}, {"label": "CMO", "value": "CMO"}, {"label": "CTO", "value": "CTO"}, {"label": "CFO", "value": "CFO"}, {"label": "Procurement", "value": "Procurement"}, {"label": "Sales Director", "value": "Sales Director"}, {"label": "Marketing Director", "value": "Marketing Director"}, {"label": "Other", "value": "Other"}]'::jsonb, NULL, NULL, 'b2b', 'b2b-target', true),
('b2bSeniority', 42, 'What seniority level should we target?', 'multi-select', true, '[{"label": "C-Level", "value": "C-Level"}, {"label": "VP / Director", "value": "VP/Director"}, {"label": "Manager", "value": "Manager"}, {"label": "Team Lead", "value": "Team Lead"}]'::jsonb, NULL, NULL, 'b2b', 'b2b-target', true),
('b2bOutreachLanguages', 43, 'What languages should outreach be in?', 'text', true, NULL, 'e.g. English, German, French', NULL, 'b2b', 'b2b-target', true),

-- Section 4: B2B — Campaign Intelligence
('b2bDecisionTriggers', 44, 'What are the key triggers that make your buyers take action?', 'multi-select', true, '[{"label": "Cost savings", "value": "cost-savings"}, {"label": "Compliance pressure", "value": "compliance"}, {"label": "New technology", "value": "new-tech"}, {"label": "Speed to market", "value": "speed"}, {"label": "Quality improvement", "value": "quality"}, {"label": "After-sales support", "value": "support"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'b2b', 'b2b-campaign', true),
('b2bProductsToPromote', 45, 'Which specific products or services should we lead with in this campaign?', 'long-text', true, NULL, 'Describe the products or services for this campaign...', NULL, 'b2b', 'b2b-campaign', true),
('b2bMarketingMaterial', 46, 'What marketing material do you have ready?', 'multi-select', false, '[{"label": "Pitch deck", "value": "pitch-deck"}, {"label": "Brochures", "value": "brochures"}, {"label": "Videos", "value": "videos"}, {"label": "Case studies", "value": "case-studies"}, {"label": "White papers", "value": "white-papers"}, {"label": "Product demos", "value": "demos"}, {"label": "None yet", "value": "none"}]'::jsonb, NULL, NULL, 'b2b', 'b2b-campaign', true),
('b2bPreviousMethods', 47, 'What lead generation have you tried before, and what happened?', 'long-text', false, NULL, NULL, NULL, 'b2b', 'b2b-campaign', true),
('b2bCompetitorStrengths', 48, 'What are your competitors'' strongest selling points that we''ll need to counter?', 'long-text', false, NULL, NULL, NULL, 'b2b', 'b2b-campaign', true),
('b2bCompliance', 49, 'Any compliance or certification requirements we need to be aware of?', 'long-text', false, NULL, NULL, NULL, 'b2b', 'b2b-campaign', true),

-- Section 4: B2B — Tech Stack & Reporting
('b2bCrm', 50, 'What CRM system do you use today? (or "none")', 'text', true, NULL, 'e.g. HubSpot, Salesforce, none', NULL, 'b2b', 'b2b-tech', true),
('b2bReportingFormat', 51, 'How do you want to receive reports?', 'single-select', true, '[{"label": "Google Sheets", "value": "google-sheets"}, {"label": "PDF", "value": "pdf"}, {"label": "CRM export", "value": "crm-export"}, {"label": "Excel", "value": "excel"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'b2b', 'b2b-tech', true),
('b2bAddons', 52, 'Optional B2B add-ons you''d like included?', 'multi-select', false, '[{"label": "Extra leads beyond package", "value": "extra-leads"}, {"label": "CRM export setup", "value": "crm-setup"}, {"label": "Multilingual outreach scripts", "value": "multilingual"}, {"label": "AI-powered proposal generation", "value": "ai-proposals"}, {"label": "Custom branding package", "value": "custom-branding"}, {"label": "Multi-market expansion support", "value": "multi-market"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'b2b', 'b2b-tech', true),

-- Section 5: B2G — What You're Trying to Achieve
('b2gMotivation', 53, 'Why are you looking at public tenders now — what''s driving this?', 'long-text', true, NULL, NULL, NULL, 'b2g', 'b2g-goals', true),
('b2gPastExperience', 54, 'Have you bid on government contracts before?', 'single-select', true, '[{"label": "Yes, and we''ve won", "value": "won"}, {"label": "Yes, but we haven''t won yet", "value": "lost"}, {"label": "We''ve never applied", "value": "never"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-goals', true),
('b2gFailureReasons', 55, 'If you''ve lost bids before, what do you think went wrong?', 'long-text', false, NULL, NULL, NULL, 'b2g', 'b2g-goals', true),
('b2gSubmissionCapacity', 56, 'How many tenders can your team realistically prepare and submit per month?', 'text', true, NULL, 'e.g. 3-5', NULL, 'b2g', 'b2g-goals', true),

-- Section 5: B2G — Package Selection
('b2gPackage', 57, 'Choose your B2G package', 'single-select', true, '[{"label": "GovStarter — £650/month", "value": "GovStarter"}, {"label": "GovExpand — £1,050/month", "value": "GovExpand"}, {"label": "GovElite — £1,650/month", "value": "GovElite"}, {"label": "Not sure yet — help me decide", "value": "UNDECIDED"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-package', true),
('b2gBudgetRange', 58, 'What''s your monthly budget range for this service?', 'text', false, NULL, NULL, NULL, 'b2g', 'b2g-package', true),

-- Section 5: B2G — Target Scope
('b2gTargetRegions', 59, 'Which regions are you targeting?', 'single-select', true, '[{"label": "UK only", "value": "UK"}, {"label": "EU only", "value": "EU"}, {"label": "Both UK & EU", "value": "UK+EU"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-scope', true),
('b2gTenderTypes', 60, 'What types of contracts are you looking for?', 'multi-select', true, '[{"label": "RFP (Request for Proposal)", "value": "RFP"}, {"label": "RFQ (Request for Quotation)", "value": "RFQ"}, {"label": "Grants", "value": "Grants"}, {"label": "Frameworks", "value": "Frameworks"}, {"label": "Other", "value": "Other"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-scope', true),
('b2gContractValue', 61, 'What contract value range are you targeting?', 'single-select', true, '[{"label": "< £50K", "value": "<50K"}, {"label": "£50K–£150K", "value": "50K-150K"}, {"label": "£150K–£500K", "value": "150K-500K"}, {"label": "£500K–£1M", "value": "500K-1M"}, {"label": "£1M+", "value": "1M+"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-scope', true),
('b2gSectorFocus', 62, 'What sector or industry focus?', 'text', true, NULL, 'e.g. Healthcare, Defence, IT...', NULL, 'b2g', 'b2g-scope', true),
('b2gKeywords', 63, 'Keywords we should use when searching for relevant tenders?', 'text', false, NULL, 'e.g. software development, consulting...', NULL, 'b2g', 'b2g-scope', true),
('b2gCpvCodes', 64, 'Relevant CPV codes (if you know them)?', 'text', false, NULL, 'e.g. 72000000-5', NULL, 'b2g', 'b2g-scope', true),

-- Section 5: B2G — Capacity & Compliance
('b2gBidResources', 65, 'What does your internal bid team look like? (team size & experience)', 'long-text', false, NULL, E'Team size: 2\nExperience: Intermediate', NULL, 'b2g', 'b2g-compliance', true),
('b2gExperienceLevel', 66, 'Experience level?', 'single-select', true, '[{"label": "No experience", "value": "none"}, {"label": "Beginner (1–3 bids submitted)", "value": "beginner"}, {"label": "Intermediate (4–10 bids submitted)", "value": "intermediate"}, {"label": "Experienced (10+ bids submitted)", "value": "experienced"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-compliance', true),
('b2gBidCompliance', 67, 'Which compliance requirements apply to you?', 'multi-select', false, '[{"label": "ISO certification", "value": "iso"}, {"label": "GDPR compliance", "value": "gdpr"}, {"label": "Insurance levels", "value": "insurance"}, {"label": "Security clearance", "value": "security"}, {"label": "Financial thresholds", "value": "financial"}, {"label": "None yet", "value": "none"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-compliance', true),
('b2gConsortium', 68, 'Are you open to consortium partnerships to qualify for larger contracts?', 'single-select', true, '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Open to it — tell me more", "value": "maybe"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-compliance', true),
('b2gTranslation', 69, 'Do you need translation support for bids?', 'single-select', true, '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-compliance', true),

-- Section 5: B2G — Strategy & Priorities
('b2gEvaluationCriteria', 70, 'What matters most in how contracts are evaluated?', 'multi-select', true, '[{"label": "Price", "value": "price"}, {"label": "Quality", "value": "quality"}, {"label": "Innovation", "value": "innovation"}, {"label": "Sustainability", "value": "sustainability"}, {"label": "Local content", "value": "local"}, {"label": "Relevant experience", "value": "experience"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-strategy', true),
('b2gGrantInterest', 71, 'Are you interested in grant funding opportunities as well?', 'single-select', false, '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-strategy', true),
('b2gReportingFrequency', 72, 'Preferred reporting frequency?', 'single-select', true, '[{"label": "Weekly", "value": "weekly"}, {"label": "Bi-weekly", "value": "bi-weekly"}, {"label": "Monthly", "value": "monthly"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-strategy', true),
('b2gAddons', 73, 'Optional B2G add-ons?', 'multi-select', false, '[{"label": "Grant writing", "value": "grant-writing"}, {"label": "Pitch deck creation", "value": "pitch-deck"}, {"label": "Translation services", "value": "translation"}, {"label": "Consortium matching", "value": "consortium"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'b2g', 'b2g-strategy', true),

-- Section 6: A.D.A.M. — What You're Trying to Automate
('adamWorkflowDescription', 74, 'Walk us through what your client onboarding or operational workflow looks like today — step by step if possible.', 'long-text', true, NULL, NULL, NULL, 'adam', 'adam-automate', true),
('adamBreakdownPoints', 75, 'Where does it break down or slow you down the most?', 'multi-select', true, '[{"label": "Too much manual data entry", "value": "manual-entry"}, {"label": "Slow follow-up and communication gaps", "value": "follow-up"}, {"label": "Errors and inaccuracies", "value": "errors"}, {"label": "No visibility into where clients are in the process", "value": "no-visibility"}, {"label": "Team coordination issues", "value": "coordination"}, {"label": "All of the above", "value": "all"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'adam', 'adam-automate', true),
('adamNewClientsPerMonth', 76, 'How many new clients do you onboard per month on average?', 'text', true, NULL, NULL, NULL, 'adam', 'adam-automate', true),
('adamTeamMembers', 77, 'How many team members will use this system?', 'text', true, NULL, 'e.g. 3', NULL, 'adam', 'adam-automate', true),
('adamProcessCost', 78, 'What does a broken or slow process cost you today? (in time, revenue, or client satisfaction)', 'long-text', false, NULL, NULL, NULL, 'adam', 'adam-automate', true),

-- Section 6: A.D.A.M. — Package Selection
('adamPackage', 79, 'Choose your A.D.A.M. package', 'single-select', true, '[{"label": "Starter — Basic features, single user", "value": "Starter"}, {"label": "Professional — Full features, team access", "value": "Professional"}, {"label": "Enterprise — Custom deployment, priority support", "value": "Enterprise"}, {"label": "Not sure yet — help me decide", "value": "UNDECIDED"}]'::jsonb, NULL, NULL, 'adam', 'adam-package', true),
('adamBranding', 80, 'Do you need custom branding on the system?', 'single-select', true, '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]'::jsonb, NULL, NULL, 'adam', 'adam-package', true),
('adamBudgetRange', 81, 'What''s your budget range for this?', 'text', false, NULL, NULL, NULL, 'adam', 'adam-package', true),

-- Section 6: A.D.A.M. — Configuration & Integration
('adamCompanyName', 82, 'Full legal company name and registration number?', 'text', true, NULL, NULL, NULL, 'adam', 'adam-config', true),
('adamWebsite', 83, 'Company website (we''ll use it to pull branding and copy)?', 'url', true, NULL, 'https://example.com', NULL, 'adam', 'adam-config', true),
('adamIndustry', 84, 'Primary industry and target client type?', 'text', true, NULL, NULL, NULL, 'adam', 'adam-config', true),
('adamServicesCount', 85, 'How many different services or products do you offer?', 'text', true, NULL, NULL, NULL, 'adam', 'adam-config', true),
('adamCustomTemplates', 86, 'Do you need custom contract templates built into the system?', 'single-select', true, '[{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}]'::jsonb, NULL, NULL, 'adam', 'adam-config', true),
('adamIntegrations', 87, 'What tools or systems do you need A.D.A.M. to connect with?', 'multi-select', false, '[{"label": "CRM", "value": "crm"}, {"label": "Email platform", "value": "email"}, {"label": "WhatsApp / messaging", "value": "messaging"}, {"label": "Payment processing", "value": "payments"}, {"label": "Accounting software", "value": "accounting"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'adam', 'adam-config', true),
('adamAiMode', 88, 'What AI mode do you prefer?', 'single-select', true, '[{"label": "Free AI (built-in)", "value": "free"}, {"label": "OpenAI (premium)", "value": "openai"}, {"label": "Custom / hybrid", "value": "custom"}]'::jsonb, NULL, NULL, 'adam', 'adam-config', true),
('adamConfigAddons', 89, 'Additional add-ons you''d like?', 'multi-select', false, '[{"label": "Extra document templates", "value": "extra-templates"}, {"label": "AI outreach scripts", "value": "ai-outreach"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'adam', 'adam-config', true),

-- Section 6: A.D.A.M. — Launch & Future Plans
('adamLaunchDeadline', 90, 'When do you need this live?', 'single-select', true, '[{"label": "Urgent (< 2 weeks)", "value": "urgent"}, {"label": "Standard (2–4 weeks)", "value": "standard"}, {"label": "Flexible (1–2 months)", "value": "flexible"}, {"label": "No hard deadline", "value": "no-rush"}]'::jsonb, NULL, NULL, 'adam', 'adam-future', true),
('adamFutureUpgrades', 91, 'What are you thinking about for the future?', 'multi-select', false, '[{"label": "E.V.A. AI agent integration", "value": "eva"}, {"label": "SaaS licensing to your own clients", "value": "saas"}, {"label": "Custom modules", "value": "custom"}, {"label": "Other", "value": "other"}]'::jsonb, NULL, NULL, 'adam', 'adam-future', true),

-- Section 7: Proposal Readiness
('proposalBudget', 92, 'What budget have you set aside for this engagement? (a range is fine)', 'text', true, NULL, NULL, NULL, 'proposal-readiness', 'proposal', true),
('proposalBudgetApproval', 93, 'Is this budget already approved, or does it need sign-off?', 'single-select', true, '[{"label": "Approved and ready", "value": "approved"}, {"label": "Needs internal sign-off", "value": "needs-signoff"}, {"label": "Budget isn''t confirmed yet", "value": "unconfirmed"}]'::jsonb, NULL, NULL, 'proposal-readiness', 'proposal', true),
('proposalSignoffTimeline', 94, 'What is the timeline for internal sign-off?', 'text', false, NULL, NULL, '{"questionId": "proposalBudgetApproval", "value": "needs-signoff"}'::jsonb, 'proposal-readiness', 'proposal', true),
('proposalPartnerCriteria', 95, 'What would make you choose one partner over another at this stage?', 'long-text', false, NULL, NULL, NULL, 'proposal-readiness', 'proposal', true),
('proposalBlockers', 96, 'Is there anything that would stop this from moving forward even if the proposal is right?', 'long-text', false, NULL, NULL, NULL, 'proposal-readiness', 'proposal', true),
('proposalAdditionalContext', 97, 'Any other context you think we should know before we build your proposal?', 'long-text', false, NULL, NULL, NULL, 'proposal-readiness', 'proposal', true),

-- Section 8: Attachments
('attachments', 98, 'Upload any supporting documents (pitch decks, brochures, brand guidelines, contracts, process diagrams, etc.)', 'file', false, NULL, NULL, NULL, 'attachments', 'uploads', true);

-- ── Proposal Templates ──────────────────────────────────────────────────────────

INSERT INTO proposal_templates (name, version, is_active, system_prompt, sections) VALUES
('Default Proposal Template', 1, true,
'You are a senior business development consultant at Andy''K Group. Your task is to generate a professional, persuasive, and tailored business proposal based on the client''s questionnaire responses. The proposal should be structured, data-informed, and demonstrate clear understanding of the client''s needs, challenges, and goals. Use a consultative tone that is confident but not aggressive. Reference specific answers from the questionnaire to personalize each section.',
'[
  {"key": "executive-summary", "title": "Executive Summary", "content": "A concise overview of the client''s situation, their goals, and how Andy''K Group will help them achieve those goals. Reference the client''s stated challenges and desired outcomes.", "order": 1, "isVisible": true},
  {"key": "understanding", "title": "Understanding Your Needs", "content": "Demonstrate deep understanding of the client''s business, industry, challenges, and objectives based on their questionnaire responses. Show that we have listened and understand their unique position.", "order": 2, "isVisible": true},
  {"key": "proposed-solution", "title": "Proposed Solution", "content": "Detail the specific services, packages, and approach tailored to the client''s needs. Include selected package details, add-ons, and how each component addresses their stated requirements.", "order": 3, "isVisible": true},
  {"key": "methodology", "title": "Our Methodology", "content": "Outline the step-by-step approach, timeline, and milestones for delivering the proposed solution. Include onboarding process, key phases, and expected deliverables at each stage.", "order": 4, "isVisible": true},
  {"key": "investment", "title": "Investment & Pricing", "content": "Present the pricing structure based on selected packages and add-ons. Include payment terms, billing currency preference, and any volume discounts or commitment incentives.", "order": 5, "isVisible": true},
  {"key": "why-andyk", "title": "Why Andy''K Group", "content": "Highlight differentiators, relevant experience, case studies, and credentials that position Andy''K Group as the ideal partner for this engagement.", "order": 6, "isVisible": true},
  {"key": "next-steps", "title": "Next Steps", "content": "Clear call-to-action with specific next steps, timeline for decision, and points of contact. Address the client''s stated urgency level and decision-making process.", "order": 7, "isVisible": true},
  {"key": "terms", "title": "Terms & Conditions", "content": "Standard terms including service level agreements, data protection commitments (referencing client''s security requirements), cancellation policy, and liability limitations.", "order": 8, "isVisible": true}
]'::jsonb);

COMMIT;
