// Public marketing content for the corporate site.
// Mirrors the Firestore collections (services, portfolioProjects, blogPosts,
// careerApplications/jobs, faqs, testimonials). Used as the offline fallback
// until Firebase is configured.

export interface ServiceContent {
  slug: string
  name: string
  icon: string
  tagline: string
  shortDescription: string
  description: string
  problems: string[]
  offerings: string[]
  features: string[]
  benefits: string[]
  process: { step: string; title: string; description: string }[]
  technologies: string[]
  useCases: { title: string; description: string }[]
  faqs: { question: string; answer: string }[]
  cta: string
  ctaDescription: string
}

export interface PortfolioProject {
  slug: string
  title: string
  category: PortfolioCategory
  image: string
  client: string
  industry: string
  summary: string
  context: string
  problem: string
  solution: string
  technologies: string[]
  features: string[]
  results: { label: string; value: string }[]
  gallery: string[]
  related: string[]
}

export type PortfolioCategory =
  | "Software Development"
  | "AI Solutions"
  | "IT Solutions"
  | "Digital Marketing"
  | "Real Estate"

export interface BlogPost {
  slug: string
  title: string
  category: string
  excerpt: string
  content: string[]
  coverImage: string
  author: string
  authorRole: string
  publishedAt: string
  readMinutes: number
  tags: string[]
  related: string[]
}

export interface Job {
  id: string
  title: string
  category: string
  type: string
  location: string
  experience: string
  description: string
  responsibilities: string[]
  requirements: string[]
  salaryRange: string
  postedAt: string
}

export const services: ServiceContent[] = [
  {
    slug: "web-development",
    name: "Web Development",
    icon: "Globe",
    tagline: "Modern, scalable and conversion-focused websites",
    shortDescription:
      "Custom websites and web applications engineered for performance, SEO and growth.",
    description:
      "RR GROUP builds fast, secure and beautifully engineered web experiences — from corporate websites and business portals to full e-commerce platforms and complex web applications. Every build follows modern architecture, clean code and SEO-ready fundamentals, so your digital presence performs as hard as your business does.",
    problems: [
      "Slow, outdated websites that hurt credibility and conversions",
      "Non-responsive experiences that lose mobile users",
      "Sites that rank poorly in search results",
      "Platforms that can't scale as the business grows",
      "Broken integrations between website, CRM and payments",
    ],
    offerings: [
      "Custom Website Development",
      "Business & Corporate Websites",
      "E-commerce Development",
      "Web Applications & Dashboards",
      "Responsive Design",
      "Third-party API Integration",
      "Performance Optimization",
      "Maintenance & Support",
    ],
    features: [
      "Mobile-first responsive builds",
      "Next.js / React / Node.js stacks",
      "Headless & CMS-ready architecture",
      "SEO-ready semantic structure",
      "Payment gateway integration",
      "Analytics & conversion tracking",
      "CI/CD deployment pipelines",
      "SLA-backed support plans",
    ],
    benefits: [
      "Faster load times and better rankings",
      "Higher conversion and engagement rates",
      "Secure, maintainable codebase",
      "A site that grows with your business",
    ],
    process: [
      { step: "Discover", title: "Discovery & planning", description: "We map goals, users, content and success metrics before a line of code is written." },
      { step: "Design", title: "UX/UI design", description: "Wireframes and polished interfaces that reflect your brand and guide users to action." },
      { step: "Develop", title: "Development", description: "Clean, performant code with responsive layouts, integrations and rigorous testing." },
      { step: "Deliver", title: "Launch & optimize", description: "Deployment, monitoring and ongoing optimization for speed, SEO and conversions." },
    ],
    technologies: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Firebase", "Tailwind CSS", "Vercel"],
    useCases: [
      { title: "Corporate website relaunch", description: "A modern, fast site that elevates the brand, improves SEO and drives qualified inquiries." },
      { title: "E-commerce storefront", description: "End-to-end online store with catalog, cart, secure payments and order management." },
      { title: "Internal web application", description: "Dashboards and portals that digitize manual business workflows." },
    ],
    faqs: [
      { question: "How long does a website take to build?", answer: "A corporate website typically takes 4–8 weeks; larger web applications 8–16 weeks depending on scope." },
      { question: "Do you provide hosting and support?", answer: "Yes — we deploy on fast, secure infrastructure and offer ongoing maintenance and support plans." },
      { question: "Will the site be SEO-ready?", answer: "Absolutely. All builds include semantic markup, metadata, sitemaps and performance tuning as standard." },
    ],
    cta: "Start Your Project",
    ctaDescription: "Tell us about your website or web application and get a scoped proposal within 48 hours.",
  },
  {
    slug: "erp-solutions",
    name: "ERP Solutions",
    icon: "Boxes",
    tagline: "Connected business operations and enterprise workflows",
    shortDescription:
      "Custom ERP platforms that unify finance, inventory, sales and operations in one system.",
    description:
      "RR GROUP designs and implements ERP solutions that connect every department — finance, inventory, sales, procurement and HR — into one centralized platform. Custom-built around your processes, our ERP eliminates silos, automates workflows and gives leadership a single source of truth for decision-making.",
    problems: [
      "Disconnected tools that force duplicate data entry",
      "No real-time visibility into inventory, orders or cash flow",
      "Manual processes that slow down operations",
      "Spreadsheet-based reporting that is error-prone and outdated",
      "No audit trail for critical business decisions",
    ],
    offerings: [
      "Business process management",
      "Operations management",
      "Inventory management",
      "Finance & accounting workflows",
      "Procurement & vendor management",
      "Reporting & analytics",
      "Workflow automation",
      "Enterprise dashboards",
    ],
    features: [
      "Centralized master data",
      "Role-based access control",
      "Real-time inventory tracking",
      "Automated purchase & sales workflows",
      "GST-ready invoicing",
      "Custom reporting engine",
      "Cloud or on-premise deployment",
      "Integration with banks, e-commerce & POS",
    ],
    benefits: [
      "One source of truth across departments",
      "Faster, error-free operations",
      "Real-time financial and inventory insight",
      "Scalable platform for multi-location growth",
    ],
    process: [
      { step: "Assess", title: "Process assessment", description: "We document your workflows, pain points and reporting needs across departments." },
      { step: "Design", title: "Solution design", description: "A modular blueprint covering modules, roles, integrations and data model." },
      { step: "Build", title: "Configuration & development", description: "Custom modules, migrations of existing data and integration with your tools." },
      { step: "Adopt", title: "Training & go-live", description: "Team training, phased rollout and post-launch support for smooth adoption." },
    ],
    technologies: ["Node.js", "React", "Firestore", "PostgreSQL", "TypeScript", "REST APIs", "SSO/ADFS", "Docker"],
    useCases: [
      { title: "Manufacturing ERP", description: "Inventory, production and purchase modules synchronized across factories and warehouses." },
      { title: "Distribution & trade", description: "Multi-channel ordering, stock visibility and automated billing for distributors." },
      { title: "Services firm ERP", description: "Project costing, resource allocation and client billing in one system." },
    ],
    faqs: [
      { question: "Is ERP implementation a long project?", answer: "Most deployments complete in 8–20 weeks depending on the number of modules and integrations." },
      { question: "Can ERP connect to our existing software?", answer: "Yes — we integrate with accounting tools, e-commerce platforms, POS and banking APIs." },
      { question: "Is the ERP customizable as we grow?", answer: "Our modular architecture lets you add departments, branches and features without rework." },
    ],
    cta: "Discuss Your ERP Requirements",
    ctaDescription: "Book a free process assessment with our ERP consultants.",
  },
  {
    slug: "crm-solutions",
    name: "CRM Solutions",
    icon: "Users",
    tagline: "Customer management and sales automation",
    shortDescription:
      "CRM platforms that organize your pipeline, automate follow-ups and retain customers.",
    description:
      "Our CRM solutions turn scattered customer interactions into a clean, accessible pipeline. Capture every lead, track deals, automate follow-ups and arm your sales team with complete customer history — so opportunities never slip through the cracks and every customer relationship is measurable.",
    problems: [
      "Leads lost because follow-ups never happen",
      "No single view of the sales pipeline",
      "Customer history scattered across email and spreadsheets",
      "No insight into pipeline health or revenue forecasts",
      "Poor communication between sales and support",
    ],
    offerings: [
      "Lead management",
      "Customer management",
      "Sales pipeline tracking",
      "Automated follow-ups",
      "Customer interaction history",
      "Team communication tools",
      "Sales reporting",
      "Customer retention programs",
    ],
    features: [
      "Drag-and-drop pipeline stages",
      "Lead scoring & assignment",
      "Email and WhatsApp integration",
      "Call, meeting and task tracking",
      "Built-in reports and forecasting",
      "Role-based team access",
      "API & webhook support",
      "Mobile-friendly sales view",
    ],
    benefits: [
      "No missed follow-ups or deals",
      "Accurate sales forecasting",
      "A complete 360° customer record",
      "Higher close rates and retention",
    ],
    process: [
      { step: "Audit", title: "Sales team audit", description: "We map how leads are captured, qualified and converted today." },
      { step: "Configure", title: "Pipeline configuration", description: "Custom stages, fields, automations and team roles tailored to your sales process." },
      { step: "Integrate", title: "Integration", description: "Connect email, phone, WhatsApp, website forms and support tools." },
      { step: "Launch", title: "Adoption & training", description: "Team onboarding that gets your sales and support teams productive fast." },
    ],
    technologies: ["React", "Node.js", "Firestore", "TypeScript", "Twilio", "WhatsApp API", "REST APIs"],
    useCases: [
      { title: "B2B sales teams", description: "Stage-based pipelines with account-level history and team ownership." },
      { title: "Real estate agencies", description: "Lead capture from portals, automated owner follow-ups and property tracking." },
      { title: "Support-led retention", description: "Ticket context merged with sales history for proactive account management." },
    ],
    faqs: [
      { question: "How fast can we migrate our existing contacts?", answer: "Most contact and deal migrations from spreadsheets or other CRMs complete within days." },
      { question: "Can the CRM automate our WhatsApp follow-ups?", answer: "Yes, WhatsApp Business API integrations support templates and automated follow-up workflows." },
      { question: "How do you protect customer data?", answer: "Role-based access, audit logs and per-user permissions are built in from day one." },
    ],
    cta: "Build Your CRM",
    ctaDescription: "Talk to us about your sales pipeline and get a CRM blueprint.",
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    icon: "Megaphone",
    tagline: "Data-driven marketing, SEO and performance campaigns",
    shortDescription:
      "Full-funnel digital marketing that grows organic reach, paid performance and conversions.",
    description:
      "RR GROUP's digital marketing team combines SEO, content and paid media into measurable campaigns. We research, build and optimize every channel around a simple outcome — pipeline. From search-first website foundations to paid campaigns and conversion tracking, we grow your brand with data, not guesswork.",
    problems: [
      "Low organic visibility and stagnant traffic",
      "Ad spend that doesn't convert to revenue",
      "No clear picture of what marketing actually returns",
      "Inconsistent brand presence across channels",
      "Leads generated but never followed up properly",
    ],
    offerings: [
      "Search engine optimization (SEO)",
      "Search engine marketing (SEM)",
      "Social media marketing",
      "Paid campaigns (Google, Meta)",
      "Content strategy & creation",
      "Lead generation campaigns",
      "Web analytics & tracking",
      "Conversion rate optimization",
      "Campaign reporting",
    ],
    features: [
      "Keyword and competitor research",
      "Technical & on-page SEO",
      "Performance marketing funnels",
      "Landing page & CRO programs",
      "Monthly performance reports",
      "UTM-based attribution",
      "A/B testing",
      "Retargeting & retention campaigns",
    ],
    benefits: [
      "Predictable pipeline from organic + paid",
      "Full-funnel visibility end to end",
      "Efficient, accountable ad spend",
      "A brand that's credible at every touchpoint",
    ],
    process: [
      { step: "Research", title: "Audit & research", description: "Baseline traffic, keywords, competitors and conversion data." },
      { step: "Strategy", title: "Channel strategy", description: "A prioritized plan across SEO, paid and content based on ROI potential." },
      { step: "Execute", title: "Campaign execution", description: "Content, ads, technical SEO and tracking implemented in sprint cycles." },
      { step: "Optimize", title: "Optimize & report", description: "Continuous testing, budget shifts and transparent monthly reporting." },
    ],
    technologies: ["Google Ads", "Google Analytics 4", "Meta Ads", "Ahrefs", "SEMrush", "HubSpot", "Hotjar", "Search Console"],
    useCases: [
      { title: "Local business growth", description: "Local SEO and Google Ads programs that fill the enquiry pipeline." },
      { title: "E-commerce scaling", description: "Shopping feeds, remarketing and CRO that lift average order value." },
      { title: "B2B lead generation", description: "LinkedIn + search campaigns feeding a nurtured CRM pipeline." },
    ],
    faqs: [
      { question: "When will we see results?", answer: "Paid campaigns can drive leads in weeks; compounding SEO results typically build over 3–6 months." },
      { question: "Do you share reporting?", answer: "Yes — you get a monthly report with real metrics, CAC, ROI and clear next steps." },
      { question: "Can we cancel anytime?", answer: "Campaigns run on flexible monthly terms with no lock-in contracts." },
    ],
    cta: "Grow Your Business",
    ctaDescription: "Get a free marketing audit and growth roadmap for your business.",
  },
]

export const portfolioCategories: PortfolioCategory[] = [
  "Software Development",
  "AI Solutions",
  "IT Solutions",
  "Digital Marketing",
  "Real Estate",
]

export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "unified-erp-platform",
    title: "Unified ERP Platform",
    category: "Software Development",
    image: "/placeholder.svg",
    client: "Manufacturing & Trade Group",
    industry: "Enterprise Software",
    summary:
      "A centralized ERP uniting finance, inventory, sales and procurement for a multi-branch manufacturing group.",
    context:
      "The client managed operations across six branches using spreadsheets and disconnected software, forcing duplicate data entry every day.",
    problem:
      "No real-time visibility into stock or cash flow, manual reconciliation, and monthly reports that were always a week out of date.",
    solution:
      "We designed and built a modular ERP with role-based dashboards, automated purchase workflows, GST-ready invoicing and a custom reporting engine, migrating 10 years of data and integrating with their banks and e-commerce channels.",
    technologies: ["Node.js", "React", "Firestore", "TypeScript", "REST APIs", "Docker"],
    features: [
      "Real-time inventory across 6 branches",
      "Automated purchase and sales workflows",
      "Custom finance and GST reporting",
      "Role-based access and audit trail",
    ],
    results: [
      { label: "Daily manual work saved", value: "4 hrs/team" },
      { label: "Month-end closing time", value: "14 → 3 days" },
      { label: "Data entry errors", value: "-92%" },
    ],
    gallery: ["/placeholder.svg"],
    related: ["commerce-crm-suite"],
  },
  {
    slug: "commerce-crm-suite",
    title: "Commerce CRM Suite",
    category: "Software Development",
    image: "/placeholder.svg",
    client: "E-commerce Retailer",
    industry: "Retail / E-commerce",
    summary:
      "A CRM and order-management platform that unified sales, support and marketing for an omnichannel retailer.",
    context:
      "A growing D2C brand was losing repeat buyers because orders, returns and follow-ups lived in separate inboxes and sheets.",
    problem:
      "No unified customer record, missed support responses, and zero visibility into repeat purchase behavior or churn.",
    solution:
      "We built a CRM with a drag-and-drop pipeline, automated follow-ups, integrated order data and support tickets, plus a customer 360 view that powered targeted campaigns.",
    technologies: ["React", "Node.js", "Firestore", "TypeScript", "WhatsApp API"],
    features: [
      "Customer 360 profile with order history",
      "Automated WhatsApp follow-ups",
      "Unified support and sales inbox",
      "Campaign segments built from behaviors",
    ],
    results: [
      { label: "Repeat purchase rate", value: "+38%" },
      { label: "Support response time", value: "-70%" },
      { label: "Churn", value: "-24%" },
    ],
    gallery: ["/placeholder.svg"],
    related: ["unified-erp-platform", "ai-support-copilot"],
  },
  {
    slug: "ai-support-copilot",
    title: "AI Support Copilot",
    category: "AI Solutions",
    image: "/placeholder.svg",
    client: "Tech Services Provider",
    industry: "Artificial Intelligence",
    summary:
      "An AI assistant that answers customer questions and routes complex tickets using their own knowledge base.",
    context:
      "Support volume was scaling faster than headcount, and agents spent most of their time answering repetitive questions.",
    problem:
      "High first-response latency, inconsistent answers, and no escalation path that preserved conversation context.",
    solution:
      "We deployed a retrieval-augmented AI copilot trained on FAQs, product docs and support history. It answers instantly, surfaces order/ticket status verified against live data, and hands off to agents with full context.",
    technologies: ["OpenAI", "Firestore", "Node.js", "React", "LangChain-style tooling"],
    features: [
      "RAG over company knowledge base",
      "Live order, invoice and ticket lookups",
      "Agent handoff with conversation context",
      "Guardrails and brand-safe tone controls",
    ],
    results: [
      { label: "Auto-resolved tickets", value: "61%" },
      { label: "First response time", value: "-83%" },
      { label: "CSAT", value: "4.7/5" },
    ],
    gallery: ["/placeholder.svg"],
    related: ["commerce-crm-suite"],
  },
  {
    slug: "it-infrastructure-modernization",
    title: "IT Infrastructure Modernization",
    category: "IT Solutions",
    image: "/placeholder.svg",
    client: "Financial Services Firm",
    industry: "IT Infrastructure",
    summary:
      "Cloud migration and security hardening for a regulated financial services firm.",
    context:
      "The firm ran critical applications on aging on-premise servers with no disaster recovery plan.",
    problem:
      "Recurring outages, compliance gaps, and data that could not survive a single server failure.",
    solution:
      "We architected a cloud-hosted hybrid infrastructure with encrypted backups, identity access controls, monitoring and a tested disaster-recovery runbook — reducing risk and operating cost.",
    technologies: ["GCP", "Firebase", "Kubernetes", "Terraform", "IAM", "Cloud Monitoring"],
    features: [
      "Encrypted, automated backups",
      "SSO and least-privilege access",
      "24x7 monitoring and alerting",
      "Documented DR plan with drills",
    ],
    results: [
      { label: "Uptime (12 months)", value: "99.98%" },
      { label: "Infrastructure cost", value: "-31%" },
      { label: "Recovery time", value: "days → minutes" },
    ],
    gallery: ["/placeholder.svg"],
    related: ["unified-erp-platform"],
  },
  {
    slug: "b2b-lead-generation-engine",
    title: "B2B Lead Generation Engine",
    category: "Digital Marketing",
    image: "/placeholder.svg",
    client: "Industrial Supplies Co.",
    industry: "Digital Marketing",
    summary:
      "A full-funnel SEO and paid search program that turned a website into a consistent pipeline source.",
    context:
      "The client had a website but no organic visibility and a small, unpredictable paid budget.",
    problem:
      "Clicks didn't convert, leads were unqualified, and there was no clue which channel produced revenue.",
    solution:
      "We rebuilt pages around buyer intent, launched structured Google Ads, built lead-qualifying funnels and wired end-to-end conversion tracking to ROI reporting.",
    technologies: ["Google Ads", "GA4", "Ahrefs", "Landing Page CRO", "HubSpot"],
    features: [
      "Keyword-led site architecture",
      "Structured paid campaigns",
      "Lead qualification forms",
      "Full-funnel ROI attribution",
    ],
    results: [
      { label: "Qualified leads / month", value: "+210%" },
      { label: "Cost per lead", value: "-44%" },
      { label: "Organic traffic", value: "+160%" },
    ],
    gallery: ["/placeholder.svg"],
    related: ["digital-brand-relaunch"],
  },
  {
    slug: "digital-brand-relaunch",
    title: "Digital Brand Relaunch",
    category: "Digital Marketing",
    image: "/placeholder.svg",
    client: "Premium Brands Group",
    industry: "Digital Marketing",
    summary:
      "A coordinated brand, content and campaign relaunch that refreshed image and reengaged audience.",
    context:
      "A premium consumer brand had grown quiet online; audiences remembered it as dated and disconnected.",
    problem:
      "Fragmented messaging, stagnant social presence, and no content engine to rebuild trust.",
    solution:
      "We defined the new messaging framework, relaunched the website narrative, rebuilt social channels and ran a 90-day launch campaign across paid and organic.",
    technologies: ["Meta Ads", "GA4", "Content Strategy", "Framer Motion", "Next.js"],
    features: [
      "New messaging and visual identity rollout",
      "Launch campaign across owned and paid",
      "Content calendar and creator partnerships",
      "Brand lift measurement",
    ],
    results: [
      { label: "Social reach (90 days)", value: "+320%" },
      { label: "Store enquiries", value: "+120%" },
      { label: "Brand search volume", value: "+88%" },
    ],
    gallery: ["/placeholder.svg"],
    related: ["b2b-lead-generation-engine"],
  },
  {
    slug: "residential-project-portal",
    title: "Residential Project Portal",
    category: "Real Estate",
    image: "/placeholder.svg",
    client: "Real Estate Developer",
    industry: "Real Estate",
    summary:
      "A sales portal with virtual tours, live inventory and automated lead follow-up for a residential developer.",
    context:
      "The developer marketed projects across several sites with brochures, walk-ins and intense manual follow-up.",
    problem:
      "No centralized inventory, slow response to buyers, and no way to track enquiries to booking.",
    solution:
      "We built a project portal with live unit inventory, dynamic floor plans, enquiry capture, an integrated CRM pipeline and automated WhatsApp follow-ups for prospects.",
    technologies: ["Next.js", "Firestore", "React", "WhatsApp API", "Google Maps API"],
    features: [
      "Live unit availability by project",
      "Virtual tours and floor plans",
      "Automated prospect follow-ups",
      "Broker and channel partner tracking",
    ],
    results: [
      { label: "Enquiry response time", value: "12 hrs → 5 min" },
      { label: "Site visit conversions", value: "+55%" },
      { label: "Booking cycle", value: "-18 days" },
    ],
    gallery: ["/placeholder.svg"],
    related: ["b2b-lead-generation-engine"],
  },
]

export const jobs: Job[] = [
  {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    category: "Engineering",
    type: "Full-time",
    location: "Hybrid · Mumbai",
    experience: "1–5 years",
    description:
      "Build client-facing web applications and internal platforms using modern React and Node.js stacks.",
    responsibilities: [
      "Design and build features end-to-end across frontend and backend",
      "Write clean, tested and well-documented TypeScript code",
      "Integrate third-party APIs, payment gateways and Firebase services",
      "Collaborate with designers and product on scoping and delivery",
      "Troubleshoot production issues and optimize performance",
    ],
    requirements: [
      "Strong JavaScript/TypeScript fundamentals",
      "Experience with React (Next.js a plus) and Node.js",
      "Comfort with REST APIs and database design",
      "Good communication and a product mindset",
      "Familiarity with Git, CI/CD and testing",
    ],
    salaryRange: "₹8–16 LPA",
    postedAt: "2026-09-10",
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    category: "Design",
    type: "Full-time",
    location: "On-site · Mumbai",
    experience: "2–6 years",
    description:
      "Own the interface and experience of websites, dashboards and mobile-first products for our clients.",
    responsibilities: [
      "Create wireframes, prototypes and high-fidelity product interfaces",
      "Build and maintain a scalable design system",
      "Run usability testing and iterate based on feedback",
      "Partner with developers to ship pixel-perfect experiences",
    ],
    requirements: [
      "Portfolio demonstrating web and product design",
      "Expertise in Figma and prototyping tools",
      "Strong typography, layout and visual hierarchy skills",
      "Understanding of accessibility and responsive design",
    ],
    salaryRange: "₹6–14 LPA",
    postedAt: "2026-09-08",
  },
  {
    id: "digital-marketing-executive",
    title: "Digital Marketing Executive",
    category: "Marketing",
    type: "Full-time",
    location: "Hybrid · Mumbai",
    experience: "1–4 years",
    description:
      "Plan and execute SEO, paid search and social campaigns that turn traffic into pipeline.",
    responsibilities: [
      "Run and optimize Google and Meta ad campaigns",
      "Own on-page SEO and content publishing workflows",
      "Track, report and improve conversion data across funnels",
      "Coordinate with design and content teams on campaign assets",
    ],
    requirements: [
      "Hands-on experience with Google Ads and GA4",
      "Working knowledge of SEO tools and keyword research",
      "Analytical mindset and comfort with reporting metrics",
      "Ability to manage multiple campaigns and deadlines",
    ],
    salaryRange: "₹5–9 LPA",
    postedAt: "2026-09-05",
  },
  {
    id: "erp-consultant",
    title: "ERP Consultant",
    category: "Consulting",
    type: "Full-time",
    location: "On-site · Mumbai",
    experience: "3–8 years",
    description:
      "Lead ERP discovery, configuration and rollout for enterprise clients across manufacturing and trade.",
    responsibilities: [
      "Document client business processes and requirements",
      "Configure business modules and migration plans",
      "Train client teams and manage phased go-lives",
      "Bridge between business users and technical teams",
    ],
    requirements: [
      "Experience implementing ERP/CRM systems",
      "Strong understanding of finance, inventory or operations",
      "Excellent stakeholder communication",
      "Willingness to travel for on-site client work",
    ],
    salaryRange: "₹10–22 LPA",
    postedAt: "2026-09-01",
  },
]

export const blogPosts: BlogPost[] = [
  {
    slug: "why-your-business-needs-an-erp-now",
    title: "Why Your Business Needs an ERP — Now",
    category: "Business",
    excerpt:
      "Scattered tools and manual processes quietly cost growing businesses more than most finance teams realize. Here's how a connected ERP changes that.",
    content: [
      "Every growing company hits the same wall: sales in one tool, inventory in another, finance in spreadsheets. The result isn't just duplication of effort — it's a company making decisions on data that is days or weeks stale.",
      "An ERP is not a luxury for enterprises. Mid-sized businesses today need the same visibility into cash flow, stock and orders that large corporations get from million-dollar systems — at a fraction of the cost.",
      "The measurable shifts we see after implementation: month-end closing drops from two weeks to a few days, stock discrepancies fall by an order of magnitude, and leadership stops asking 'what's the real number?' and starts planning from it.",
      "The right time to move is when you can no longer answer a basic question in under a day — like how much stock is inbound, or what gross margin looks like at branch level.",
      "Start small: pick the processes that hurt most — usually inventory or billing — automate them first, and expand module by module. A phased rollout protects daily operations while the system earns its keep.",
    ],
    coverImage: "/placeholder.svg",
    author: "RR GROUP",
    authorRole: "Enterprise Team",
    publishedAt: "2026-08-28",
    readMinutes: 6,
    tags: ["ERP", "Operations", "Growth"],
    related: ["how-crm-improves-sales-retention", "seo-tips-for-b2b-websites"],
  },
  {
    slug: "how-crm-improves-sales-retention",
    title: "How a CRM Turns Follow-ups Into Revenue and Retention",
    category: "Sales",
    excerpt:
      "Most revenue leakage isn't bad products — it's missed follow-ups. Here's the pipeline discipline a modern CRM enforces.",
    content: [
      "Studies consistently show that most leads are lost because nobody followed up — not because the prospect wasn't interested. In a busy sales team, 'I'll call them next week' is where deals go to die.",
      "A CRM enforces structure: every lead has an owner, a stage, and a next action. Automated reminders and follow-ups ensure nothing falls through the cracks, even during the chaos of a busy quarter.",
      "The second big win is memory. When your salesperson opens a customer record, they see the full history — past orders, tickets, emails, preferences. That context is what turns a transactional vendor into a trusted partner.",
      "Retention is where CRMs quietly pay for themselves. Understanding churn risk, spotting repeat buyers, and recognizing patterns in support tickets lets you act before a customer leaves.",
      "The rule for implementation: don't overcomplicate. Start with the pipeline and follow-up automation, give the team two weeks to build the habit, then add reporting and integrations.",
    ],
    coverImage: "/placeholder.svg",
    author: "RR GROUP",
    authorRole: "CRM Team",
    publishedAt: "2026-08-14",
    readMinutes: 5,
    tags: ["CRM", "Sales", "Retention"],
    related: ["why-your-business-needs-an-erp-now", "seo-tips-for-b2b-websites"],
  },
  {
    slug: "seo-tips-for-b2b-websites",
    title: "SEO Tips for B2B Websites That Actually Generate Leads",
    category: "Marketing",
    excerpt:
      "Ranking is one thing; ranking for the pages buyers search when they're ready to purchase is another. Here's how to do both.",
    content: [
      "B2B buyers don't shop like consumers. They search specific problems ('warehouse inventory software for distributors'), compare, and only then contact vendors. Your SEO must match that intent.",
      "Start with intent mapping. For each product or service, list the questions a buyer asks at each stage — awareness, research, comparison, decision — and build a page for each. Service pages for decision intent, guides for research intent.",
      "The fastest wins are usually technical: page speed, mobile usability, clean internal linking, and schema markup. These are measurable and fixable in weeks, not quarters.",
      "Content depth beats volume. A handful of genuinely useful, authoritative articles that answer real buyer questions will outperform a content farm of thin posts every time.",
      "Finally, wire SEO to revenue. Add UTM-tagged CTAs, track form fills and chat sessions back to the page they came from. When you can show which keywords produce booked meetings, SEO stops being a cost center.",
    ],
    coverImage: "/placeholder.svg",
    author: "RR GROUP",
    authorRole: "Marketing Team",
    publishedAt: "2026-07-30",
    readMinutes: 7,
    tags: ["SEO", "B2B", "Content"],
    related: ["b2b-marketing-on-small-budget", "why-your-business-needs-an-erp-now"],
  },
  {
    slug: "ai-customer-support-copilots-that-work",
    title: "AI Support Copilots That Work (Not Just Chatbots)",
    category: "Business",
    excerpt:
      "The difference between a gimmick AI chatbot and one that cuts support costs is access to your real data. Here's what we've learned shipping them.",
    content: [
      "The first generation of AI support was conversational autocomplete — impressive demos, thin results. Customers still got wrong answers and had to talk to a human anyway.",
      "A support copilot that actually works is different: it answers from your knowledge base, not its imagination. It can look up a live order status, a ticket, an invoice — verified against current data — before it answers.",
      "The architecture is straightforward: the AI gets tools. When a customer asks 'where's my order?', the assistant calls an order-status function, and only answers from the returned data. Hallucination becomes nearly impossible.",
      "Design matters more than model choice. Clear escalation rules, brand-safe tone limits, and seamless handoff to a human with full context — these decide whether customers feel helped or just meeting the machine.",
      "The KPI that matters isn't 'conversations handled' — it's auto-resolved rate. In our deployments, 50–65% of tickets resolve without a human, and the rest arrive at agents with complete context.",
    ],
    coverImage: "/placeholder.svg",
    author: "RR GROUP",
    authorRole: "AI Team",
    publishedAt: "2026-07-16",
    readMinutes: 6,
    tags: ["AI", "Support", "Automation"],
    related: ["how-crm-improves-sales-retention", "why-your-business-needs-an-erp-now"],
  },
  {
    slug: "b2b-marketing-on-small-budget",
    title: "B2B Marketing on a Small Budget: Where Every Rupee Should Go",
    category: "Marketing",
    excerpt:
      "You don't need a six-figure budget to grow. You need disciplined targeting, sharp funnels and ruthless measurement.",
    content: [
      "A small marketing budget forces clarity. You can't be everywhere, so you must win where the buyers actually are — and know precisely what a lead is worth before you spend.",
      "Prioritize the 'leaky bucket' problems first: fix conversion tracking before scaling ads; fix the landing page before buying more traffic; fix follow-up speed before spending on more lists.",
      "Channel discipline beats channel hopping. Pick one paid channel you understand deeply — search for most B2B — and one organic channel. Give them an unbroken quarter, then judge.",
      "Measure at the level that matters. Clicks and impressions are vanity; cost per qualified lead and pipeline influenced are the real numbers. Build a simple dashboard that shows those two, and nothing else.",
      "Retargeting is the unnoticed multiplier. Most B2B buyers won't convert on a first visit; a small retargeting budget that keeps you in front of them after research typically repays itself several times over.",
    ],
    coverImage: "/placeholder.svg",
    author: "RR GROUP",
    authorRole: "Marketing Team",
    publishedAt: "2026-06-28",
    readMinutes: 5,
    tags: ["Marketing", "B2B", "Budget"],
    related: ["seo-tips-for-b2b-websites", "how-crm-improves-sales-retention"],
  },
  {
    slug: "web-app-vs-mobile-app-for-your-business",
    title: "Web App vs Mobile App: Which Does Your Business Actually Need?",
    category: "Business",
    excerpt:
      "Mobile-first doesn't always mean native. We break down when a web app wins, when native wins, and what the decision really costs.",
    content: [
      "Every project brief eventually asks the same question: web app or mobile app? The honest answer is usually 'a great web app first' — but the real analysis depends on your users and workflows.",
      "Web apps win when: users need URLs that can be shared and indexed, updates should reach everyone instantly, or internal teams use the tool on laptops and phones. Progressive web apps close most of the native gap.",
      "Native apps win when: deep device integration is essential — camera, offline-first flows, GPS in the background — or when the storefront presence itself matters to your brand.",
      "The cost math matters too. One web application can serve a distributed team immediately; native means two codebases, two release cycles and two app-store policies from day one.",
      "Our default recommendation: build the web app, add PWA capabilities, and only go native when a specific constraint demands it. Most businesses save 40–60% without sacrificing capability.",
    ],
    coverImage: "/placeholder.svg",
    author: "RR GROUP",
    authorRole: "Engineering Team",
    publishedAt: "2026-06-12",
    readMinutes: 6,
    tags: ["Development", "Web", "Mobile"],
    related: ["why-your-business-needs-an-erp-now", "ai-customer-support-copilots-that-work"],
  },
]

export const testimonials = [
  {
    name: "Rahul Mehta",
    company: "Manufacturing & Trade Group",
    role: "Director",
    content:
      "We replaced spreadsheets and six disconnected tools with one ERP. Month-end closing went from two weeks to three days. The visibility alone changed how we run the business.",
    rating: 5,
  },
  {
    name: "Sneha Iyer",
    company: "D2C Retail Brand",
    role: "Founder",
    content:
      "The CRM they built for us unified sales, support and marketing. Repeat purchases are up 38% and our team finally works from one customer record.",
    rating: 5,
  },
  {
    name: "Arun Nair",
    company: "Tech Services Provider",
    role: "Head of Support",
    content:
      "Our AI copilot auto-resolves 61% of tickets and hands the rest to agents with full context. First-response time dropped by over 80%. Genuine ROI.",
    rating: 5,
  },
  {
    name: "Priya Kulkarni",
    company: "Residential Developer",
    role: "Sales Director",
    content:
      "The project portal with live inventory and automated follow-ups changed our sales velocity. Response time went from hours to minutes.",
    rating: 5,
  },
]

export const faqs = [
  {
    question: "What does RR GROUP do?",
    answer:
      "RR GROUP is a digital technology and business solutions company. We build web development, ERP and CRM solutions, and run data-driven digital marketing campaigns.",
  },
  {
    question: "Which industries do you work with?",
    answer:
      "We serve manufacturing, distribution, retail, real estate, professional services and B2B technology companies — with ERP, CRM, websites and growth marketing.",
  },
  {
    question: "How do you price projects?",
    answer:
      "Each engagement is scoped after a discovery call and quoted on a fixed or milestone basis. We publish transparent proposals with no hidden costs.",
  },
  {
    question: "Do you provide support after launch?",
    answer:
      "Yes. Every project includes a support window, and most clients continue with a monthly maintenance or retainer plan for development, hosting and campaigns.",
  },
  {
    question: "Can you integrate with our existing software?",
    answer:
      "Almost always. We integrate with accounting tools, e-commerce platforms, POS, payment gateways, WhatsApp and third-party APIs as part of each build.",
  },
  {
    question: "How long does a typical engagement take?",
    answer:
      "Websites take 4–8 weeks, CRM implementations 6–12 weeks, and ERP deployments 8–20 weeks depending on modules and data migration.",
  },
]

// Helpers mirroring the Firestore-backed loaders (offline fallback).
export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug)
}

export function getPortfolioBySlug(slug: string) {
  return portfolioProjects.find((p) => p.slug === slug)
}

export function getBlogBySlug(slug: string) {
  return blogPosts.find((b) => b.slug === slug)
}

export function getJobById(id: string) {
  return jobs.find((j) => j.id === id)
}

export function getRelatedPortfolio(slug: string) {
  const project = getPortfolioBySlug(slug)
  if (!project) return []
  return project.related
    .map(getPortfolioBySlug)
    .filter((p): p is PortfolioProject => Boolean(p))
}

export function getRelatedPosts(slug: string) {
  const post = getBlogBySlug(slug)
  if (!post) return []
  return post.related
    .map(getBlogBySlug)
    .filter((p): p is BlogPost => Boolean(p))
}