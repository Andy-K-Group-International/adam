// Best-effort mapping from deep-dive questionnaire answer keys onto the
// discrete columns on `questionnaires` that admin review (QuestionnairePreview),
// AI evaluation (buildQuestionnaireText), and convertToClientAction all read
// directly. Those discrete columns predate the current 158-question bank and
// only cover its earliest, core fields — everything else stays in the
// `answers` jsonb column (full fidelity, nothing is dropped), just not yet
// surfaced by the discrete-column-reading UI. Only include a mapping here if
// the question and column are an unambiguous 1:1 match; when in doubt, leave
// it out rather than risk silently miscategorizing a prospective client's data.
const FIELD_MAP: Record<string, string> = {
  companyName: "company_name",
  websiteUrl: "website_url",
  billingCurrency: "billing_currency",
  contactName: "contact_name",
  contactPhone: "contact_phone",
  contactEmail: "contact_email",
  address: "address",
  dataEnrichmentConsent: "data_enrichment_consent",
  socialProfiles: "social_profiles",
  countriesOfOperation: "countries_of_operation",
  yearsInBusiness: "years_in_business",
  annualRevenue: "annual_revenue",
  productsServices: "products_services",
  usp: "usp",
  competitors: "competitors",
  securityRequirements: "security_requirements",
  privacyPolicyAgreed: "privacy_policy_agreed",
};

export function mapAnswersToDiscreteColumns(
  answers: Record<string, unknown>,
  selectedSegments: string[]
): Record<string, unknown> {
  const columns: Record<string, unknown> = {};

  for (const [questionId, column] of Object.entries(FIELD_MAP)) {
    if (answers[questionId] !== undefined && answers[questionId] !== null && answers[questionId] !== "") {
      columns[column] = answers[questionId];
    }
  }

  if (selectedSegments.length > 0) {
    columns.segments = selectedSegments.map((s) => s.toLowerCase());
  }

  return columns;
}
