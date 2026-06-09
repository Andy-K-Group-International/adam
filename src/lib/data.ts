export const siteConfig = {
  name: "A.D.A.M.",
  fullName: "Lifecycle Operations Platform",
  company: "Andy'K Group International LTD",
  companyReg: "16453500",
  address: "86-90 Paul Street, London, EC2A 4NE",
  email: "info@andykgroup.com",
  website: "https://andykgroup.com",
};

export const navLinks = [
  { label: "Features", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Demo", href: "/request-demo" },
  { label: "Contact", href: "#contact" },
];

export const heroData = {
  headline: "Your Business, Automated.",
  subheadline:
    "A.D.A.M. manages your entire client lifecycle — from first contact to signed contract. No manual processes, no lost emails, no missed deadlines.",
  primaryCta: { label: "Start Questionnaire", href: "/questionnaire" },
  secondaryCta: { label: "Learn More", href: "#services" },
};

export const statsData = [
  { value: "12+", label: "Countries served", flag: "🌍" },
  { value: "200+", label: "Clients onboarded", flag: "🤝" },
  { value: "98%", label: "Client satisfaction", flag: "⭐" },
  { value: "24h", label: "Average response time", flag: "⚡" },
];

export const roadmapSteps = [
  {
    step: "01",
    title: "Strategic Application",
    description:
      "Submit your strategic brief. Tell us about your business objectives, target market, and growth ambitions.",
    icon: "clipboard",
  },
  {
    step: "02",
    title: "Internal Review & Qualification",
    description:
      "Our team evaluates your application against our qualification criteria. You'll hear back within 24 hours.",
    icon: "file-text",
  },
  {
    step: "03",
    title: "Proposal & Strategy",
    description:
      "We craft a bespoke proposal with a clear strategy and roadmap. Review it in your personal client portal.",
    icon: "map",
  },
  {
    step: "04",
    title: "Contract & Signing",
    description:
      "Review, negotiate, and digitally sign your contract. Full transparency — no surprises, no small print.",
    icon: "shield",
  },
  {
    step: "05",
    title: "Invoice & Payment",
    description:
      "Automated invoicing with clear payment terms and milestones. Everything tracked and accessible in one place.",
    icon: "receipt",
  },
  {
    step: "06",
    title: "Kickoff & Execution",
    description:
      "Project launches. Real-time updates, document sharing, and ongoing management through A.D.A.M.",
    icon: "rocket",
  },
];

export const founders = [
  {
    name: "Andrej Kneisl",
    role: "CEO & Founder",
    bio: "Visionary entrepreneur with a passion for automating business processes. Founded Andy'K Group International LTD to bridge the gap between businesses and their growth potential.",
    image: "/images/ceo.jpeg",
    quote:
      "Every business deserves a system that works as hard as they do. A.D.A.M. is that system.",
  },
  {
    name: "Kobe Janssens",
    role: "CTO & Co-Founder",
    bio: "The technical architect behind A.D.A.M., Kobe leverages his extensive expertise to transform any idea into reality.",
    image: "/images/co-founder.jpg",
    quote:
      "Technology should disappear into the background. When it works perfectly, you don't even notice it's there.",
  },
];

export const pricingData = {
  internal: {
    label: "Internal Use",
    subtitle: "Manage your own clients end-to-end.",
    plans: [
      {
        name: "Starter",
        monthlyGBP: 349,
        annualGBP: 209,
        description: "Everything you need to start managing clients professionally.",
        features: [
          "Up to 10 clients",
          "Proposals & contracts",
          "Invoicing",
          "Questionnaire intake",
          "Email notifications",
        ],
        cta: "Apply for Access",
        highlighted: false,
      },
      {
        name: "Growth",
        monthlyGBP: 699,
        annualGBP: 419,
        description: "Scale your operations with full pipeline management and structured operational workflows.",
        features: [
          "Up to 50 clients",
          "Everything in Starter",
          "AI questionnaire evaluation",
          "Strategy editor",
          "Pipeline board",
        ],
        cta: "Apply for Access",
        highlighted: true,
      },
      {
        name: "Scale",
        monthlyGBP: 1299,
        annualGBP: 779,
        description: "Unlimited capacity with white-glove onboarding and priority support.",
        features: [
          "Unlimited clients",
          "Everything in Growth",
          "White-glove onboarding",
          "Priority support",
        ],
        cta: "Apply for Access",
        highlighted: false,
      },
      {
        name: "Enterprise",
        monthlyGBP: null,
        annualGBP: null,
        description: "Custom deployment tailored to your organisation.",
        features: [
          "Custom deployment",
          "Dedicated instance",
          "SLA guarantee",
          "Custom integrations",
        ],
        cta: "Request Quote",
        highlighted: false,
      },
    ],
  },
  whitelabel: {
    label: "White-label",
    subtitle: "Build your own branded platform powered by A.D.A.M.",
    plans: [
      {
        name: "Growth",
        monthlyGBP: 1299,
        annualGBP: 779,
        description: "Launch your branded client management platform.",
        features: [
          "Up to 20 end-clients",
          "Your branding & custom domain",
          "Proposals, contracts & invoices",
          "Questionnaire intake",
          "Email notifications",
        ],
        cta: "Apply for Access",
        highlighted: false,
      },
      {
        name: "Scale",
        monthlyGBP: 2199,
        annualGBP: 1319,
        description: "Grow your platform with advanced customisation and multi-workspace support.",
        features: [
          "Up to 100 end-clients",
          "Everything in Growth",
          "Advanced customisation",
          "Multi-workspace support",
          "Priority support",
        ],
        cta: "Apply for Access",
        highlighted: true,
      },
      {
        name: "Enterprise",
        monthlyGBP: null,
        annualGBP: null,
        description: "Unlimited scale with fully custom infrastructure and dedicated support.",
        features: [
          "Unlimited end-clients",
          "Fully custom deployment",
          "Dedicated support team",
          "SLA guarantee",
          "Custom integrations",
        ],
        cta: "Request Quote",
        highlighted: false,
      },
    ],
  },
};

export const lovedByQuote = {
  text: "Andy'K Group International LTD didn't just deliver leads — they delivered results. A.D.A.M. changed how we onboard clients entirely.",
  author: "Enterprise Client",
  role: "CEO",
};

export const faqItems = [
  {
    title: "Lead Generation",
    description:
      "Targeted B2B outreach campaigns that fill your pipeline with qualified prospects ready to convert.",
    icon: "users",
  },
  {
    title: "Government Tenders",
    description:
      "End-to-end support for public sector contracts — from tender identification to bid submission.",
    icon: "landmark",
  },
  {
    title: "Client Onboarding",
    description:
      "Automated intake, questionnaires, and contract management through A.D.A.M.'s intelligent workflow.",
    icon: "user-check",
  },
  {
    title: "Contract Management",
    description:
      "Digital contracts with version control, e-signatures, and real-time status tracking.",
    icon: "file-signature",
  },
  {
    title: "Business Intelligence",
    description:
      "Data-driven insights into your pipeline, conversion rates, and client lifecycle metrics.",
    icon: "bar-chart",
  },
  {
    title: "Automation Systems",
    description:
      "License A.D.A.M. for your own business. Full client lifecycle management, white-labeled for you.",
    icon: "cpu",
  },
];

export const integrationFeatures = [
  {
    name: "A.D.A.M.",
    tagline: "Automated Document & Account Manager",
    description:
      "The brain of your operations. Manages documents, contracts, client data, and workflows in one intelligent system.",
    features: [
      "Real-time client dashboard",
      "Digital contract signing",
      "Automated questionnaires",
      "Pipeline management",
      "Document verification",
    ],
  },
  {
    name: "E.V.E.",
    tagline: "Efficient Virtual Executor",
    description:
      "The automation layer that executes. E.V.E. handles emails, generates proposals, triggers notifications, and keeps everything moving.",
    features: [
      "Automated proposal generation",
      "Automated email sequences",
      "Smart notifications",
      "Task orchestration",
      "Coming soon",
    ],
    comingSoon: true,
  },
];

export const footerLinks = {
  company: [
    { label: "About", href: "https://andykgroup.com/#about" },
    { label: "Services", href: "https://andykgroup.com/#services" },
    { label: "Pricing", href: "https://andykgroup.com/#pricing" },
    { label: "Contact", href: "https://andykgroup.com/#contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-and-conditions" },
    { label: "Cookie Policy", href: "/cookies-policy" },
    { label: "Service Definition", href: "/service-definition" },
  ],
  connect: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/andyk-group-international" },
    { label: "Email", href: "mailto:info@andykgroup.com" },
  ],
};
