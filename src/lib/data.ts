export const siteConfig = {
  name: "A.D.A.M.",
  fullName: "Automated Document & Account Manager",
  company: "Andy'K Group International LTD",
  companyReg: "16453500",
  address: "86-90 Paul Street, London EC2A 4NE",
  email: "info@andykgroupinternational.com",
  website: "https://andykgroupinternational.com",
};

export const navLinks = [
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
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
    title: "Questionnaire",
    description:
      "Complete our structured intake form. We learn about your business, goals, and requirements.",
    icon: "clipboard",
  },
  {
    step: "02",
    title: "Proposal",
    description:
      "We craft a tailored proposal based on your needs. Review it in your personal dashboard.",
    icon: "file-text",
  },
  {
    step: "03",
    title: "Strategy",
    description:
      "Together we define the strategy and timeline. Every detail aligned before we start.",
    icon: "target",
  },
  {
    step: "04",
    title: "Contract",
    description:
      "Review, comment, and digitally sign your contract. Full transparency, no surprises.",
    icon: "pen-tool",
  },
  {
    step: "05",
    title: "Invoice",
    description:
      "Automated invoicing with clear payment terms. Everything tracked in one place.",
    icon: "receipt",
  },
  {
    step: "06",
    title: "Kick-off",
    description:
      "Project launches. Real-time updates, document sharing, and ongoing support through A.D.A.M.",
    icon: "rocket",
  },
];

export const founders = [
  {
    name: "Andrej Kneisl",
    role: "CEO & Founder",
    bio: "Visionary entrepreneur with a passion for automating business processes. Founded Andy'K Group International to bridge the gap between businesses and their growth potential.",
    image: "/images/ceo.jpeg",
    quote:
      "Every business deserves a system that works as hard as they do. A.D.A.M. is that system.",
  },
  {
    name: "Kobe Janssens",
    role: "CTO & Co-Founder",
    bio: "Full-stack engineer and architect behind A.D.A.M. Obsessed with building tools that eliminate friction and let people focus on what matters.",
    image: "/images/co-founder.jpg",
    quote:
      "Technology should disappear into the background. When it works perfectly, you don't even notice it's there.",
  },
];

export const pricingData = {
  b2b: {
    label: "B2B",
    subtitle: "Lead Generation & Sales Development",
    plans: [
      {
        name: "CORE",
        price: "€950",
        period: "/mo",
        description: "Essential lead generation for growing businesses",
        features: [
          "500 targeted leads/month",
          "Email outreach campaigns",
          "Basic CRM integration",
          "Monthly reporting",
          "Dedicated account manager",
        ],
        cta: "Get Started",
        highlighted: false,
      },
      {
        name: "ADVANCE",
        price: "€1,350",
        period: "/mo",
        description: "Advanced outreach with multi-channel approach",
        features: [
          "1,000 targeted leads/month",
          "Multi-channel outreach",
          "Advanced CRM integration",
          "Bi-weekly reporting",
          "A/B tested campaigns",
          "LinkedIn automation",
        ],
        cta: "Get Started",
        highlighted: true,
      },
      {
        name: "VANGUARD",
        price: "€1,750",
        period: "/mo",
        description: "Premium pipeline building for ambitious teams",
        features: [
          "2,000 targeted leads/month",
          "Full omnichannel outreach",
          "Custom CRM setup",
          "Weekly reporting",
          "Dedicated strategy sessions",
          "AI-powered personalization",
          "Priority support",
        ],
        cta: "Get Started",
        highlighted: false,
      },
    ],
  },
  b2g: {
    label: "B2G",
    subtitle: "Public Tender & Government Contracts",
    plans: [
      {
        name: "GovStarter",
        price: "£650",
        period: "/mo",
        description: "Entry into government contracting",
        features: [
          "Tender monitoring (UK)",
          "5 bid reviews/month",
          "Basic compliance check",
          "Monthly tender briefing",
          "Email support",
        ],
        cta: "Get Started",
        highlighted: false,
      },
      {
        name: "GovExpand",
        price: "£1,050",
        period: "/mo",
        description: "Expand your government portfolio",
        features: [
          "Tender monitoring (UK & EU)",
          "10 bid reviews/month",
          "Full compliance support",
          "Bi-weekly strategy calls",
          "Bid writing assistance",
          "Framework applications",
        ],
        cta: "Get Started",
        highlighted: true,
      },
      {
        name: "GovElite",
        price: "£1,650",
        period: "/mo",
        description: "Full-service government contracting",
        features: [
          "Global tender monitoring",
          "Unlimited bid reviews",
          "End-to-end bid management",
          "Weekly strategy sessions",
          "Consortium matching",
          "Grant applications",
          "Priority support",
        ],
        cta: "Get Started",
        highlighted: false,
      },
    ],
  },
  tech: {
    label: "A.D.A.M.",
    subtitle: "The right plan for every stage of growth.",
    plans: [
      {
        name: "Small Business",
        price: "€249",
        period: "/mo",
        description: "Everything you need to get started with automated client management.",
        features: [
          "Client portal",
          "Questionnaire system",
          "Contract management",
          "Email notifications",
          "Basic reporting",
          "48h avg. response time",
        ],
        cta: "Get Started",
        highlighted: false,
      },
      {
        name: "Medium Business",
        price: "€450",
        period: "/mo",
        description: "Scale your operations with advanced automation and custom branding.",
        features: [
          "Everything in Small Business",
          "Custom branding",
          "Advanced analytics",
          "CRM integration",
          "24h avg. response time",
        ],
        cta: "Get Started",
        highlighted: true,
      },
      {
        name: "Big Business",
        price: "Custom",
        period: "",
        description: "Tailored deployment for large-scale operations.",
        features: [
          "Everything in Medium Business",
          "White-label deployment",
          "Custom modules",
          "SLA guarantee",
          "On-premise option",
          "12h avg. response time",
        ],
        cta: "Request Quote",
        highlighted: false,
      },
    ],
  },
};

export const commitmentOptions = [
  { label: "Monthly", discount: 0 },
  { label: "6 months", discount: 5 },
  { label: "12 months", discount: 10 },
];

export const lovedByQuote = {
  text: "Andy'K Group didn't just deliver leads — they delivered results. A.D.A.M. changed how we onboard clients entirely.",
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
    name: "E.V.A.",
    tagline: "Efficient Virtual Assistant",
    description:
      "The automation layer that executes. E.V.A. handles emails, generates proposals, triggers notifications, and keeps everything moving.",
    features: [
      "AI-powered proposals",
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
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
  connect: [
    { label: "LinkedIn", href: "https://linkedin.com/company/andykgroup" },
    { label: "Email", href: "mailto:info@andykgroupinternational.com" },
  ],
};
