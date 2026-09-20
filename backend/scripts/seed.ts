/**
 * Firestore + Firebase Auth seed script for RR GROUP backend.
 *
 * Usage:  npm run seed   (from backend/)
 * Requires backend/.env with a working service account
 * (FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY).
 */
/* eslint-disable no-console */
import "dotenv/config"
import bcrypt from "bcryptjs"
import { createHash } from "node:crypto"
import { getAdminAuth, isFirebaseConfigured } from "@/config/firebase"
import { COLLECTIONS, create, now, setDoc } from "@/services/db/firestore"

const SALT_ROUNDS = 12

async function hash(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Development-only credentials (documented in backend/.env.example / README).
const DEV_PASSWORD = "Password@123"

type StaffAccount = {
  email: string
  firstName: string
  lastName: string
  role: "SUPER_ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER"
  phone?: string
  permissions: string[]
}

const STAFF: StaffAccount[] = [
  {
    email: "admin@rrgroup.example",
    firstName: "Admin",
    lastName: "RR",
    role: "SUPER_ADMIN",
    permissions: [
      "DASHBOARD_VIEW", "USERS_MANAGE", "CUSTOMERS_MANAGE", "LEADS_MANAGE", "SERVICES_MANAGE",
      "PROJECTS_MANAGE", "PORTFOLIO_MANAGE", "INQUIRIES_MANAGE", "PRODUCTS_MANAGE", "CATEGORIES_MANAGE",
      "INVENTORY_MANAGE", "ORDERS_MANAGE", "REFUNDS_MANAGE", "COUPONS_MANAGE", "REVIEWS_MANAGE",
      "CRM_MANAGE", "ERP_MANAGE", "MARKETING_MANAGE", "INVOICES_MANAGE", "PAYMENTS_MANAGE",
      "SUPPORT_MANAGE", "MESSAGES_MANAGE", "NOTIFICATIONS_MANAGE", "BLOG_MANAGE", "FAQ_MANAGE",
      "TESTIMONIALS_MANAGE", "REPORTS_VIEW", "SETTINGS_MANAGE", "AUDIT_LOGS_VIEW", "AI_ASSISTANT_MANAGE",
      "INVOICE_CREATE", "PAYMENT_REFUND",
    ],
  },
  {
    email: "manager@rrgroup.example",
    firstName: "Manager",
    lastName: "RR",
    role: "MANAGER",
    permissions: ["DASHBOARD_VIEW", "PRODUCTS_MANAGE", "CATEGORIES_MANAGE", "INVENTORY_MANAGE", "ORDERS_MANAGE", "LEADS_MANAGE", "CRM_MANAGE", "SUPPORT_MANAGE", "REPORT_VIEW", "INVOICE_CREATE"],
  },
  {
    email: "staff@rrgroup.example",
    firstName: "Staff",
    lastName: "RR",
    role: "STAFF",
    permissions: ["DASHBOARD_VIEW", "PRODUCTS_MANAGE", "ORDERS_MANAGE", "SUPPORT_MANAGE", "LEADS_MANAGE"],
  },
  {
    email: "customer@rrgroup.example",
    firstName: "Vikram",
    lastName: "Sethi",
    phone: "+91 98200 12345",
    role: "CUSTOMER",
    permissions: [],
  },
]

const ROLE_ORDER = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "CUSTOMER"] as const

const SERVICES = [
  {
    slug: "website-development", name: "Website Development", isActive: true,
    description: "Custom, responsive, high-performance websites built with modern stacks that turn visitors into customers.",
    category: "Development", icon: "Globe",
    features: ["Custom UI/UX Design", "SEO-Ready Architecture", "CMS Integration", "Analytics & Tracking", "Ongoing Support"],
    price: 74999, duration: "4-6 weeks",
  },
  {
    slug: "erp-software-solutions", name: "ERP Software Solutions", isActive: true,
    description: "End-to-end ERP implementation covering inventory, finance, sales, HR and operations on one platform.",
    category: "Software", icon: "Boxes",
    features: ["Inventory Management", "Finance & Accounting", "Sales & Purchase", "HR & Payroll", "Custom Reports"],
    price: 249999, duration: "8-12 weeks",
  },
  {
    slug: "crm-software-solutions", name: "CRM Software Solutions", isActive: true,
    description: "Unify sales, marketing and support around one customer view with automation and deep reporting.",
    category: "Software", icon: "Users",
    features: ["Sales Pipeline", "Contact Management", "Marketing Automation", "Support Desk", "Analytics"],
    price: 199999, duration: "6-10 weeks",
  },
  {
    slug: "digital-marketing", name: "Digital Marketing", isActive: true,
    description: "Data-driven SEO, performance ads, email and social campaigns engineered for measurable growth.",
    category: "Marketing", icon: "Megaphone",
    features: ["SEO & Content", "Paid Advertising", "Email Marketing", "Social Media", "Monthly Reporting"],
    price: 49999, duration: "Ongoing",
  },
]

const CATEGORIES = [
  { slug: "software-licenses", name: "Software Licenses", description: "Production-ready ERP, CRM and analytics platforms with annual licensing and priority support.", image: "/products/rr-erp.png", order: 1 },
  { slug: "website-templates", name: "Website Templates", description: "Premium, conversion-focused website and dashboard templates for modern teams.", image: "/products/analytics-template.png", order: 2 },
  { slug: "business-hardware", name: "Business Hardware", description: "Point-of-sale terminals, scanners and IoT devices engineered for reliability.", image: "/products/smartpos.png", order: 3 },
  { slug: "cloud-services", name: "Cloud Services", description: "Managed cloud backup, hosting and infrastructure plans that scale with you.", image: "/products/cloud-backup.png", order: 4 },
  { slug: "marketing-tools", name: "Marketing Tools", description: "Email automation and SEO toolkits to grow reach and drive qualified leads.", image: "/products/email-suite.png", order: 5 },
  { slug: "accessories", name: "Accessories", description: "Workspace essentials and connectivity gear for productive teams.", image: "/products/usb-hub.png", order: 6 },
]

const PRODUCTS: Record<string, unknown>[] = [
  {
    slug: "rr-commerce-erp-pro", name: "RR Commerce ERP Pro", category: "software-licenses", brand: "RR GROUP", sku: "RR-ERP-PRO-01",
    shortDescription: "End-to-end ERP for inventory, finance and operations.",
    description: "RR Commerce ERP Pro unifies inventory, procurement, finance and sales into a single operational platform. Automate purchase orders, track stock across warehouses in real time, and generate finance-ready reports without spreadsheets.",
    price: 48999, originalPrice: 64999, stock: 40, isFeatured: true, popularity: 98, image: "/products/rr-erp.png", badge: "bestseller",
    tags: ["erp", "operations", "finance", "inventory"],
  },
  {
    slug: "rr-crm-suite-enterprise", name: "RR CRM Suite Enterprise", category: "software-licenses", brand: "RR GROUP", sku: "RR-CRM-ENT-02",
    shortDescription: "Pipeline, contacts and automation for revenue teams.",
    description: "Manage the full customer lifecycle with a visual sales pipeline, automated follow-ups, and deep reporting. RR CRM Suite Enterprise keeps marketing, sales and support aligned around a single source of truth.",
    price: 39999, originalPrice: 49999, stock: 55, isFeatured: true, popularity: 95, image: "/products/rr-crm.png", badge: "bestseller",
    tags: ["crm", "sales", "pipeline", "automation"],
  },
  {
    slug: "rr-analytics-cloud", name: "RR Analytics Cloud", category: "software-licenses", brand: "RR GROUP", sku: "RR-ANL-CLD-03",
    shortDescription: "Real-time BI dashboards and reporting.",
    description: "Connect your data sources and build live dashboards in minutes. RR Analytics Cloud delivers real-time KPIs, scheduled reports and role-based sharing for data-driven teams.",
    price: 24999, originalPrice: 29999, stock: 8, popularity: 88, image: "/products/analytics-template.png", badge: "sale",
    tags: ["analytics", "bi", "dashboards", "reporting"],
  },
  {
    slug: "corporate-website-kit", name: "Corporate Website Kit", category: "website-templates", brand: "RR Studio", sku: "RR-TPL-CORP-04",
    shortDescription: "Multi-page corporate site template with CMS.",
    description: "A polished, fully responsive corporate website template with 12 pre-built pages, blog layouts and a headless-CMS-ready structure. Ship a premium brand presence in days.",
    price: 5999, originalPrice: 8999, stock: 200, isFeatured: true, popularity: 92, image: "/products/website-kit.png", badge: "bestseller",
    tags: ["template", "website", "nextjs", "corporate"],
  },
  {
    slug: "analytics-dashboard-template", name: "Analytics Dashboard Template", category: "website-templates", brand: "RR Studio", sku: "RR-TPL-DASH-05",
    shortDescription: "Admin dashboard UI kit with 30+ screens.",
    description: "A comprehensive admin dashboard template featuring 30+ screens, charts, data tables and dark mode. Perfect starting point for internal tools and SaaS products.",
    price: 4499, originalPrice: 6499, stock: 150, popularity: 84, image: "/products/analytics-template.png", badge: "new",
    tags: ["template", "dashboard", "admin", "react"],
  },
  {
    slug: "smartpos-terminal-x1", name: "SmartPOS Terminal X1", category: "business-hardware", brand: "RR Devices", sku: "RR-HW-POS-06",
    shortDescription: "All-in-one touchscreen POS with printer.",
    description: "A sleek all-in-one point-of-sale terminal with a 15-inch touchscreen, built-in thermal printer and dual-band Wi-Fi. Pre-configured to work with RR Commerce ERP out of the box.",
    price: 34999, originalPrice: 42999, stock: 12, popularity: 79, image: "/products/smartpos.png", badge: "sale",
    tags: ["pos", "hardware", "retail", "terminal"],
    variants: [
      { id: "graphite", name: "Color", value: "Graphite", available: true },
      { id: "silver", name: "Color", value: "Silver", available: true },
    ],
  },
  {
    slug: "barcode-scanner-pro", name: "Barcode Scanner Pro", category: "business-hardware", brand: "RR Devices", sku: "RR-HW-SCN-07",
    shortDescription: "Wireless 2D barcode & QR scanner.",
    description: "A rugged wireless 2D scanner reading barcodes and QR codes at up to 300 scans per second. Charging cradle and 12-hour battery included for all-day warehouse use.",
    price: 7499, originalPrice: 9499, stock: 0, popularity: 61, image: "/products/barcode-scanner.png",
    tags: ["scanner", "hardware", "warehouse"],
  },
  {
    slug: "iot-sensor-kit", name: "IoT Sensor Starter Kit", category: "business-hardware", brand: "RR Devices", sku: "RR-HW-IOT-08",
    shortDescription: "Environmental sensor kit with gateway.",
    description: "Monitor temperature, humidity and motion across facilities with this plug-and-play IoT kit. Includes a gateway, six wireless sensors and a cloud dashboard trial.",
    price: 12999, originalPrice: 15999, stock: 25, popularity: 66, image: "/products/iot-kit.png", badge: "new",
    tags: ["iot", "sensors", "hardware", "monitoring"],
  },
  {
    slug: "cloud-backup-1tb", name: "Cloud Backup 1TB Plan", category: "cloud-services", brand: "RR Cloud", sku: "RR-CLD-BK-09",
    shortDescription: "Encrypted managed backup, 1TB annual.",
    description: "Automated, encrypted backups for your critical business data with 1TB of storage, versioning and one-click restore. Managed entirely by RR Cloud with 99.9% uptime.",
    price: 8999, originalPrice: 11999, stock: 999, popularity: 74, image: "/products/cloud-backup.png",
    tags: ["cloud", "backup", "storage", "managed"],
  },
  {
    slug: "email-marketing-suite", name: "Email Marketing Suite", category: "marketing-tools", brand: "RR Marketing", sku: "RR-MKT-EM-10",
    shortDescription: "Automation, campaigns and analytics.",
    description: "Design campaigns, build automated journeys and track engagement with a drag-and-drop email builder. Includes deliverability tools and detailed analytics.",
    price: 6499, originalPrice: 8999, stock: 500, isFeatured: true, popularity: 81, image: "/products/email-suite.png", badge: "bestseller",
    tags: ["marketing", "email", "automation", "campaigns"],
  },
  {
    slug: "seo-optimizer-toolkit", name: "SEO Optimizer Toolkit", category: "marketing-tools", brand: "RR Marketing", sku: "RR-MKT-SEO-11",
    shortDescription: "Keyword, audit and rank-tracking suite.",
    description: "Improve organic visibility with keyword research, technical site audits, backlink analysis and daily rank tracking — all in one toolkit with actionable recommendations.",
    price: 5499, originalPrice: 7499, stock: 6, popularity: 70, image: "/products/seo-toolkit.png", badge: "sale",
    tags: ["marketing", "seo", "keywords", "audit"],
  },
  {
    slug: "usb-c-hub-station", name: "USB-C Hub Station 11-in-1", category: "accessories", brand: "RR Devices", sku: "RR-ACC-HUB-12",
    shortDescription: "11-port docking station with 4K HDMI.",
    description: "Expand any laptop with 11 ports including dual 4K HDMI, Gigabit Ethernet, SD card readers and 100W passthrough charging. Aluminum body stays cool under load.",
    price: 4299, originalPrice: 5999, stock: 80, popularity: 77, image: "/products/usb-hub.png",
    tags: ["accessory", "usb-c", "dock", "hub"],
    variants: [
      { id: "space-gray", name: "Color", value: "Space Gray", available: true },
      { id: "silver", name: "Color", value: "Silver", available: false },
    ],
  },
  {
    slug: "wireless-presenter", name: "Wireless Presenter Remote", category: "accessories", brand: "RR Devices", sku: "RR-ACC-PRS-13",
    shortDescription: "Laser presenter with 30m range.",
    description: "Present with confidence using this ergonomic wireless remote featuring a red laser pointer, intuitive slide controls and a 30-meter range. USB-C rechargeable.",
    price: 1999, originalPrice: 2799, stock: 3, popularity: 58, image: "/products/presenter.png",
    tags: ["accessory", "presenter", "remote"],
  },
]

const FAQS = [
  { question: "How do I get started with an RR GROUP software license?", answer: "Purchase the license from our store, and you'll receive an onboarding email within 24 hours. Our team will schedule a setup call to get you live.", order: 1 },
  { question: "What is included in the annual license?", answer: "Every license includes 12 months of updates, priority email/chat support, and documentation. Deployment can be cloud or on-premise based on your plan.", order: 2 },
  { question: "Can I upgrade my plan later?", answer: "Yes. You can upgrade between Standard, Business and Enterprise plans anytime. You'll be charged the prorated difference.", order: 3 },
  { question: "What hardware warranty do you offer?", answer: "Hardware products carry a 1-2 year warranty depending on the product. Extended warranty plans are available on request.", order: 4 },
  { question: "How long does delivery take?", answer: "Digital products are delivered instantly. Physical products typically arrive within 3-5 business days across India.", order: 5 },
  { question: "What payment methods do you accept?", answer: "We accept UPI, credit/debit cards, net banking and wallets through Razorpay. Invoices are generated for all orders.", order: 6 },
  { question: "Do you offer refunds?", answer: "Digital products include a 7-day refund window if the product is defective. Hardware products have a 30-day return policy. See our refund policy for details.", order: 7 },
  { question: "Can you build a custom ERP or website for us?", answer: "Absolutely. Our services team delivers custom website development, ERP and CRM implementations. Contact us for a discovery call.", order: 8 },
]

const TESTIMONIALS = [
  { name: "Ananya Mehta", company: "Bloom Retail", role: "COO", content: "RR GROUP rolled out our ERP across three departments in a week. The support team is outstanding.", rating: 5, isActive: true },
  { name: "Rahul Kapoor", company: "Kapoor Exports", role: "Director", content: "Their website team delivered a stunning site for our export business. Conversion rate is up 40%.", rating: 5, isActive: true },
  { name: "Priya Nair", company: "Nair Labs", role: "Head of Sales", content: "The CRM implementation was smooth and our sales pipeline has never been clearer.", rating: 4, isActive: true },
  { name: "Suresh Iyer", company: "IyerGentech", role: "Founder", content: "Professional, fast, and truly tech-focused. Their digital marketing campaigns bring in quality leads.", rating: 5, isActive: true },
]

const BLOG_POSTS = [
  {
    slug: "why-enterprises-are-moving-to-ai-embedded-erp",
    title: "Why Enterprises Are Moving to AI-Embedded ERP",
    excerpt: "Modern ERP systems are doing far more than tracking inventory and ledgers — they're predicting demand, flagging anomalies and automating workflows.",
    content: "Modern ERP systems are doing far more than tracking inventory and ledgers — they're predicting demand, flagging anomalies and automating workflows.\n\nIn this post we cover five ways AI-embedded ERP improves operational efficiency and why RR GROUP deploys AI features in every ERP rollout.",
    category: "ERP",
    tags: ["erp", "ai", "enterprise"],
  },
  {
    slug: "website-redesign-plan-2026",
    title: "The 2026 Website Redesign Checklist",
    excerpt: "A practical checklist to make your next website project faster, cheaper and more impactful.",
    content: "A practical checklist to make your next website project faster, cheaper and more impactful.\n\nFrom performance budgets and Core Web Vitals to content strategy and accessibility, here's everything we review before every RR GROUP website launch.",
    category: "Web Development",
    tags: ["website", "redesign", "performance"],
  },
  {
    slug: "crm-automation-roi",
    title: "The Hard Numbers on CRM Automation ROI",
    excerpt: "We break down how automated follow-ups and lead scoring cut sales cycles by up to 30%.",
    content: "We break down how automated follow-ups and lead scoring cut sales cycles by up to 30%.\n\nUsing real implementation data from RR GROUP customers, this article shows the measurable ROI of CRM automation across sales, marketing and support teams.",
    category: "CRM",
    tags: ["crm", "automation", "roi"],
  },
]

const PORTFOLIO = [
  {
    slug: "bloom-retail-erp", title: "Bloom Retail ERP", client: "Bloom Retail", category: "ERP Implementation",
    description: "Unified inventory, finance and sales for a 24-store retail chain.",
    image: "/products/rr-erp.png", tags: ["ERP", "Retail", "Finance"], result: "40% faster month-end close", isFeatured: true,
  },
  {
    slug: "kapoor-exports-website", title: "Kapoor Exports Website", client: "Kapoor Exports", category: "Web Development",
    description: "A modern multi-language corporate site driving qualified export inquiries.",
    image: "/products/website-kit.png", tags: ["Web", "Next.js", "SEO"], result: "+40% conversion rate", isFeatured: true,
  },
  {
    slug: "nair-labs-crm", title: "Nair Labs CRM", client: "Nair Labs", category: "CRM Implementation",
    description: "Sales pipeline and support desk automation for a research-tech firm.",
    image: "/products/rr-crm.png", tags: ["CRM", "Sales", "Automation"], result: "30% shorter sales cycles", isFeatured: false,
  },
]

const PROJECTS = [
  {
    slug: "bloom-retail-erp-rollout", name: "Bloom Retail ERP Rollout",
    description: "Full ERP implementation with inventory and finance modules for a retail chain.",
    serviceSlug: "erp-software-solutions",
    status: "IN_PROGRESS", startDate: "2026-08-01", dueDate: "2026-10-15",
    budget: 250000, progress: 40,
    members: [{ role: "PROJECT_MANAGER" }, { role: "CONSULTANT" }],
  },
  {
    slug: "reddy-homes-website", name: "Reddy Homes Website",
    description: "Corporate website with property listings and SEO optimization.",
    serviceSlug: "website-development",
    status: "COMPLETED", startDate: "2026-05-10", dueDate: "2026-07-20", completedAt: "2026-07-18",
    budget: 80000, progress: 100,
    members: [],
  },
]

const LEADS = [
  { name: "Ananya Mehta", email: "ananya@bloomretail.example", phone: "+91 98700 11111", company: "Bloom Retail", source: "Website", status: "NEW", priority: "HIGH", value: 250000 },
  { name: "Rahul Kapoor", email: "rahul@kapoorexports.example", phone: "+91 98700 22222", company: "Kapoor Exports", source: "Referral", status: "CONTACTED", priority: "MEDIUM", value: 150000 },
  { name: "Priya Nair", email: "priya@nairlabs.example", phone: "+91 98700 33333", company: "Nair Labs", source: "LinkedIn", status: "QUALIFIED", priority: "HIGH", value: 350000 },
  { name: "Suresh Iyer", email: "suresh@iyergentech.example", phone: "+91 98700 44444", company: "IyerGentech", source: "Email Campaign", status: "NEW", priority: "LOW", value: 80000 },
  { name: "Kavya Reddy", email: "kavya@reddyhomes.example", phone: "+91 98700 55555", company: "Reddy Homes", source: "Website", status: "CONTACTED", priority: "MEDIUM", value: 120000 },
]

const JOBS = [
  { slug: "erp-consultant", title: "ERP Implementation Consultant", category: "ERP", type: "FULL_TIME", location: "Mumbai (Hybrid)", experience: "3-6 years", description: "Deliver ERP implementations for mid-size and enterprise customers, from requirements to go-live.", responsibilities: ["Lead ERP discovery and scoping", "Configure inventory, finance and sales modules", "Train client teams and manage cutover"], requirements: ["3+ years implementing ERP systems", "Strong SQL and business-process skills", "Excellent client communication"], salaryRange: "₹12L - ₹18L per annum", openings: 2 },
  { slug: "fullstack-developer", title: "Full Stack Developer (Next.js)", category: "Development", type: "FULL_TIME", location: "Remote (India)", experience: "2-5 years", description: "Build performance-obsessed web applications for client projects on our platform.", responsibilities: ["Ship production React/Next.js features", "Design REST APIs and data models", "Collaborate with designers and QA"], requirements: ["Proficiency in TypeScript and React", "Experience with PostgreSQL or Firebase", "Attention to detail and testing"], salaryRange: "₹10L - ₹16L per annum", openings: 3 },
  { slug: "digital-marketing-specialist", title: "Digital Marketing Specialist", category: "Marketing", type: "FULL_TIME", location: "Mumbai", experience: "2-4 years", description: "Run SEO, performance and email campaigns across client accounts.", responsibilities: ["Manage SEO and paid ad campaigns", "Write and schedule email journeys", "Report on KPIs monthly"], requirements: ["Hands-on SEO/Ads experience", "Analytics and reporting skills", "Content-first mindset"], salaryRange: "₹6L - ₹10L per annum", openings: 1 },
]

async function ensureUser(account: StaffAccount): Promise<string> {
  const email = account.email.toLowerCase()
  const auth = getAdminAuth()
  let uid: string | null = null
  if (auth) {
    try {
      const existing = await auth.getUserByEmail(email)
      uid = existing.uid
    } catch {
      uid = null
    }
    if (!uid) {
      try {
        const created = await auth.createUser({
          email,
          password: DEV_PASSWORD,
          emailVerified: true,
          displayName: `${account.firstName} ${account.lastName}`,
        })
        uid = created.uid
      } catch (err) {
        console.warn(`   - Firebase Auth user creation failed for ${email}: ${(err as Error).message}`)
        uid = null
      }
    }
    if (uid) {
      try {
        await auth.setCustomUserClaims(uid, { role: account.role })
      } catch (err) {
        console.warn(`   - Could not set custom claims for ${email}: ${(err as Error).message}`)
      }
    }
  }

  if (!uid) {
    uid = `local_${createHash("sha256").update(email).digest("hex").slice(0, 16)}`
    console.warn(`   - Using local-only uid ${uid} for ${email} (Firebase Auth unavailable)`)
  }

  const passwordHash = await hash(DEV_PASSWORD)
  await setDoc(COLLECTIONS.users, uid, {
    uid,
    email,
    emailLower: email,
    firstName: account.firstName,
    lastName: account.lastName,
    phone: account.phone ?? null,
    role: account.role,
    isActive: true,
    emailVerified: true,
    passwordHash,
    permissions: account.permissions,
    createdAt: now(),
    updatedAt: now(),
    lastLoginAt: null,
  })
  return uid
}

function buildProductDoc(p: Record<string, unknown>) {
  const { category, image, isFeatured, variants, ...rest } = p
  return {
    ...rest,
    categoryId: category,
    categoryName: CATEGORIES.find((c) => c.slug === category)?.name ?? null,
    isFeatured: Boolean(isFeatured),
    isActive: true,
    rating: 4.5,
    reviewCount: 0,
    inventory: {
      quantity: Number(rest.stock ?? 0),
      reservedQuantity: 0,
      lowStockThreshold: 5,
    },
    images: [{ url: image, position: 0, alt: String(rest.name ?? "") }],
    variants:
      (variants as { id?: string; name: string; value: string; available: boolean }[] | undefined)?.map((v) => ({
        id: v.id ?? v.name.toLowerCase().replace(/\s+/g, "-"),
        name: v.name,
        value: v.value,
        price: rest.price as number,
        available: v.available,
      })) ?? [],
  }
}

const money = (n: number) => Math.round(n * 100) / 100

async function main() {
  console.log("🌱 Seeding RR GROUP (Firestore + Firebase Auth)...")

  if (!isFirebaseConfigured) {
    console.error("❌ Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH (or inline vars) in backend/.env")
    process.exit(1)
  }

  // ----- Roles & accounts -----
  for (const role of ROLE_ORDER) {
    const id = role === "ADMIN" ? "admin" : role.toLowerCase()
    await setDoc(COLLECTIONS.roles, id, { name: role, slug: id, isActive: true })
  }

  console.log("   Users (Firebase Auth + Firestore)...")
  const uids: Partial<Record<(typeof ROLE_ORDER)[number], string>> = {}
  for (const account of STAFF) {
    uids[account.role] = await ensureUser(account)
  }
  const managerId = uids.MANAGER!
  const staffId = uids.STAFF!
  const customerId = uids.CUSTOMER!

  await setDoc(COLLECTIONS.customers, customerId, {
    userId: customerId,
    company: "Sethi Traders Pvt Ltd",
    gstNumber: "27ABCDE1234F1Z5",
    createdAt: now(),
  })

  await setDoc(COLLECTIONS.addresses, "cust-default", {
    userId: customerId,
    customerId,
    label: "Office",
    fullName: "Vikram Sethi",
    line1: "402, Orchid Towers, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400050",
    country: "India",
    phone: "+91 98200 12345",
    isDefault: true,
    createdAt: now(),
  })

  // ----- Content: services, faqs, testimonials, blog, portfolio, jobs -----
  console.log("   Services / FAQs / Testimonials / Blog / Portfolio / Jobs...")
  for (const s of SERVICES) await setDoc(COLLECTIONS.services, s.slug, { ...s, createdAt: now() })
  for (const f of FAQS) await setDoc(COLLECTIONS.faqs, `faq-${f.order}`, { ...f, isActive: true, createdAt: now() })
  for (const t of TESTIMONIALS) {
    await setDoc(COLLECTIONS.testimonials, `testimonial-${t.name.toLowerCase().replace(/\s+/g, "-")}`, { ...t, createdAt: now() })
  }
  for (const p of BLOG_POSTS) {
    await setDoc(COLLECTIONS.blogPosts, p.slug, { ...p, authorId: managerId, isPublished: true, publishedAt: now(), createdAt: now() })
  }
  for (const p of PORTFOLIO) {
    await setDoc(COLLECTIONS.projects, p.slug, { ...p, isActive: true, createdAt: now() })
  }
  for (const p of PROJECTS) {
    const service = SERVICES.find((s) => s.slug === p.serviceSlug)
    await setDoc(COLLECTIONS.projects, p.slug, {
      name: p.name,
      description: p.description,
      serviceId: service?.slug ?? null,
      serviceSlug: p.serviceSlug ?? null,
      clientId: customerId,
      clientName: "Sethi Traders Pvt Ltd",
      status: p.status,
      startDate: p.startDate,
      dueDate: p.dueDate,
      completedAt: p.completedAt ?? null,
      budget: p.budget,
      progress: p.progress,
      members: p.members,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    })
  }
  for (const j of JOBS) {
    await setDoc(COLLECTIONS.jobs, j.slug, { ...j, isActive: true, createdAt: now() })
  }

  // ----- Commerce: categories, products, coupon -----
  console.log("   Catalog (categories + products) + coupons...")
  for (const c of CATEGORIES) await setDoc(COLLECTIONS.categories, c.slug, { ...c, active: true, createdAt: now() })
  for (const p of PRODUCTS) {
    await setDoc(COLLECTIONS.products, String(p.slug), buildProductDoc(p))
  }

  await setDoc(COLLECTIONS.coupons, "RR10", {
    code: "RR10",
    title: "10% Off",
    type: "PERCENTAGE",
    value: 10,
    maxDiscount: 5000,
    perUserLimit: 1,
    usageLimit: 1000,
    usedCount: 0,
    minimumOrderAmount: 0,
    startsAt: now(),
    expiresAt: "2030-12-31T23:59:59.999Z",
    isActive: true,
    createdAt: now(),
  })

  // ----- Sample orders + payment + invoice + reviews -----
  console.log("   Sample orders, payments, invoices, reviews...")
  const erp = buildProductDoc(PRODUCTS.find((p) => p.slug === "rr-commerce-erp-pro")!)
  const hub = buildProductDoc(PRODUCTS.find((p) => p.slug === "usb-c-hub-station")!)
  const kit = buildProductDoc(PRODUCTS.find((p) => p.slug === "corporate-website-kit")!)

  const items1 = [
    { product: erp, qty: 1 },
    { product: hub, qty: 2 },
  ]
  const subtotal1 = items1.reduce((s, i) => s + Number(i.product.price) * i.qty, 0)
  const discount1 = 5000
  const tax1 = money((subtotal1 - discount1) * 0.18)
  const total1 = money(subtotal1 - discount1 + tax1)

  const customerBlock = { name: "Vikram Sethi", email: "customer@rrgroup.example", phone: "+91 98200 12345" }
  const addressBlock = { fullName: "Vikram Sethi", line1: "402, Orchid Towers, Bandra West", city: "Mumbai", state: "Maharashtra", postalCode: "400050", country: "India", phone: "+91 98200 12345" }

  await setDoc(COLLECTIONS.orders, "ord-10001", {
    orderNumber: "RR-2026-10001",
    userId: customerId,
    customerId,
    customer: customerBlock,
    status: "SHIPPED",
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    subtotal: subtotal1,
    discountAmount: discount1,
    shippingCharge: 0,
    taxAmount: tax1,
    total: total1,
    currency: "INR",
    couponCode: "RR10",
    items: items1.map(({ product, qty }) => ({
      productId: String(product.slug),
      name: product.name,
      sku: product.sku,
      image: (product.images as { url: string }[])[0].url,
      unitPrice: Number(product.price),
      quantity: qty,
      tax: money(Number(product.price) * qty * 0.18),
      total: money(Number(product.price) * qty),
    })),
    statusHistory: [
      { id: "h1", status: "PENDING", note: "Order placed", createdAt: "2026-08-20T09:00:00.000Z" },
      { id: "h2", status: "CONFIRMED", note: "Payment verified", createdAt: "2026-08-20T09:02:00.000Z" },
      { id: "h3", status: "PROCESSING", note: "Processing", createdAt: "2026-08-21T10:00:00.000Z" },
      { id: "h4", status: "SHIPPED", note: "Shipped", createdAt: "2026-08-22T08:30:00.000Z" },
    ],
    billingAddress: addressBlock,
    deliveryAddress: addressBlock,
    createdAt: "2026-08-20T09:00:00.000Z",
    updatedAt: "2026-08-22T08:30:00.000Z",
  })

  await setDoc(COLLECTIONS.orders, "ord-10002", {
    orderNumber: "RR-2026-10002",
    userId: customerId,
    customerId,
    customer: customerBlock,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "CARD",
    subtotal: Number(kit.price),
    discountAmount: 0,
    shippingCharge: 0,
    taxAmount: money(Number(kit.price) * 0.18),
    total: money(Number(kit.price) * 1.18),
    currency: "INR",
    items: [
      {
        productId: String(kit.slug),
        name: kit.name,
        sku: kit.sku,
        image: (kit.images as { url: string }[])[0].url,
        unitPrice: Number(kit.price),
        quantity: 1,
        tax: money(Number(kit.price) * 0.18),
        total: Number(kit.price),
      },
    ],
    statusHistory: [
      { id: "h1", status: "PENDING", note: "Order placed", createdAt: "2026-07-05T09:00:00.000Z" },
      { id: "h2", status: "CONFIRMED", note: "Payment verified", createdAt: "2026-07-05T09:02:00.000Z" },
      { id: "h3", status: "SHIPPED", note: "Shipped", createdAt: "2026-07-06T10:00:00.000Z" },
      { id: "h4", status: "DELIVERED", note: "Delivered", createdAt: "2026-07-09T12:00:00.000Z" },
    ],
    billingAddress: addressBlock,
    deliveryAddress: addressBlock,
    createdAt: "2026-07-05T09:00:00.000Z",
    updatedAt: "2026-07-09T12:00:00.000Z",
  })

  await setDoc(COLLECTIONS.payments, "pay-10001", {
    userId: customerId,
    orderId: "ord-10001",
    orderNumber: "RR-2026-10001",
    amount: total1,
    currency: "INR",
    method: "UPI",
    provider: "razorpay",
    providerOrderId: "order_ord-10001",
    providerPaymentId: "pay_ord-10001",
    status: "PAID",
    failureReason: null,
    createdAt: "2026-08-20T09:02:00.000Z",
  })

  await setDoc(COLLECTIONS.invoices, "inv-10001", {
    invoiceNumber: "INV-2026-10001",
    customerId,
    userId: customerId,
    orderId: "ord-10001",
    orderNumber: "RR-2026-10001",
    status: "PAID",
    subtotal: subtotal1,
    discountAmount: discount1,
    taxAmount: tax1,
    total: total1,
    currency: "INR",
    items: items1.map(({ product, qty }) => ({
      description: String(product.name),
      quantity: qty,
      unitPrice: Number(product.price),
      taxRate: 18,
      total: money(Number(product.price) * qty),
    })),
    createdAt: "2026-08-20T09:02:00.000Z",
  })

  const reviews = [
    { productId: "rr-commerce-erp-pro", rating: 5, title: "Transformative for our ops", comment: "We rolled out RR Commerce ERP Pro across three departments. Inventory is finally unified with finance.", reviewer: "Ananya Mehta" },
    { productId: "corporate-website-kit", rating: 4, title: "Great starting point", comment: "The template was clean and fast. With small customizations our brand site was live within the week.", reviewer: "Rahul Kapoor" },
    { productId: "usb-c-hub-station", rating: 5, title: "Reliable and cool", comment: "All ports work flawlessly with our MacBooks. 4K HDMI output is crisp.", reviewer: "Priya Nair" },
  ]
  for (const r of reviews) {
    await create(COLLECTIONS.reviews, {
      userId: customerId,
      productId: r.productId,
      orderId: null,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      reviewerName: r.reviewer,
      status: "APPROVED",
      verified: true,
      helpfulCount: 0,
    })
  }

  // ----- CRM -----
  console.log("   CRM (leads, inquiries)...")
  for (const l of LEADS) {
    await setDoc(COLLECTIONS.leads, `lead-${l.email.split("@")[0]}`, {
      ...l,
      assignedTo: managerId,
      timeline: [],
      createdAt: now(),
      updatedAt: now(),
    })
  }

  for (const [name, email, phone, subject, message] of [
    ["Meera Joshi", "meera@joshigroup.example", "+91 98700 66666", "ERP implementation quote", "We are a mid-size manufacturing firm and would like a demo of your ERP solution."],
    ["Arjun Bansal", "arjun@bansaltechnologies.example", null, "Website redesign", "Need a modern website for our engineering services company."],
  ] as [string, string, string | null, string, string][]) {
    await create(COLLECTIONS.contactInquiries, {
      name, email, phone, subject, message, status: "NEW", createdAt: now(),
    })
  }

  // ----- Support + notifications -----
  console.log("   Support tickets, messages, notifications...")
  const t1 = "ticket-erp-limits"
  await setDoc(COLLECTIONS.supportTickets, t1, {
    ticketNumber: "SUP-1001",
    userId: customerId,
    user: { name: "Vikram Sethi", email: "customer@rrgroup.example" },
    subject: "Need help with ERP user limits",
    description: "We're hitting the user limit on our RR Commerce ERP Pro plan. How do we upgrade?",
    status: "OPEN",
    priority: "HIGH",
    assignedTo: staffId,
    createdAt: now(),
    updatedAt: now(),
  })
  await create(COLLECTIONS.messages, { ticketId: t1, senderId: customerId, content: "We're hitting the user limit on our plan. Can you help us upgrade?", isInternal: false, type: "ticket", createdAt: now() })
  await create(COLLECTIONS.messages, { ticketId: t1, senderId: staffId, content: "Hi Vikram, we can upgrade your plan. Would you prefer Business or Enterprise?", isInternal: false, type: "ticket", createdAt: now() })

  const t2 = "ticket-tracking"
  await setDoc(COLLECTIONS.supportTickets, t2, {
    ticketNumber: "SUP-1002",
    userId: customerId,
    user: { name: "Vikram Sethi", email: "customer@rrgroup.example" },
    subject: "Tracking number for recent order",
    description: "Could you share the tracking number for order RR-2026-10001?",
    status: "RESOLVED",
    priority: "MEDIUM",
    assignedTo: staffId,
    createdAt: now(),
    updatedAt: now(),
  })
  await create(COLLECTIONS.messages, { ticketId: t2, senderId: customerId, content: "Could you share the tracking number?", isInternal: false, type: "ticket", createdAt: now() })

  for (const [type, title, message, link] of [
    ["order", "Order shipped", "Order RR-2026-10001 has shipped.", "/dashboard/orders"],
    ["payment", "Payment received", "Your last payment was successful.", "/dashboard/payments"],
    ["ticket", "Ticket update", "Our team replied to your support ticket.", "/dashboard/support"],
  ] as [string, string, string, string][]) {
    await create(COLLECTIONS.notifications, { userId: customerId, type, title, message, link, readAt: null, createdAt: now() })
  }

  // ----- ERP: company, departments, employees -----
  console.log("   ERP (company, departments, employees) + campaigns...")
  await setDoc("companies", "rr-group", {
    name: "RR GROUP",
    gstNumber: "27RRGDG1234F1Z5",
    address: "Bandra Kurla Complex, Mumbai 400051",
    phone: "+91 22 4000 1234",
    email: "hello@rrgroup.example",
    website: "https://rrgroup.example",
  })

  const departments = [
    { slug: "sales", name: "Sales", headUserId: managerId },
    { slug: "engineering", name: "Engineering", headUserId: null },
    { slug: "marketing", name: "Marketing", headUserId: null },
  ]
  for (const d of departments) {
    await setDoc(COLLECTIONS.departments, d.slug, { name: d.name, headUserId: d.headUserId, companyId: "rr-group", isActive: true, createdAt: now() })
  }

  const employees = [
    { employeeCode: "EMP-001", departmentId: "engineering", userId: staffId, position: "Senior Consultant", status: "ACTIVE", joiningDate: "2025-01-15", salary: 1200000, currency: "INR", contact: { phone: "+91 98200 99999", email: "staff@rrgroup.example" } },
    { employeeCode: "EMP-002", departmentId: "sales", userId: null, position: "Sales Manager", status: "ACTIVE", joiningDate: "2025-03-01", salary: 1100000, currency: "INR", contact: { phone: "+91 98200 88888", email: "sales@rrgroup.example" } },
    { employeeCode: "EMP-003", departmentId: "marketing", userId: null, position: "Digital Marketing Lead", status: "ACTIVE", joiningDate: "2025-06-20", salary: 900000, currency: "INR", contact: { phone: "+91 98200 77777", email: "marketing@rrgroup.example" } },
  ]
  for (const e of employees) {
    await setDoc(COLLECTIONS.employees, `emp-${e.employeeCode.toLowerCase()}`, {
      ...e,
      companyId: "rr-group",
      title: e.position,
      createdAt: now(),
    })
  }

  const campaigns = [
    {
      name: "August ERP Awareness Campaign", type: "EMAIL", status: "SENT",
      description: "Email + LinkedIn nurture for ERP buyers.",
      audience: "Manufacturing & retail decision-makers",
      subject: "How to unify your operations with ERP", content: "Email body...",
      scheduleAt: "2026-08-15T09:00:00.000Z", sentAt: "2026-08-15T09:00:00.000Z",
      createdById: managerId, openedCount: 1240, clickCount: 312, leadsGenerated: 18, conversionCount: 5,
    },
    {
      name: "Website Package Launch", type: "SOCIAL", status: "DRAFT",
      description: "Launch campaign for the new website packages.",
      audience: "SMB owners",
      subject: "New website packages starting at ₹59,999", content: "Launch content...",
      scheduleAt: null, sentAt: null,
      createdById: managerId, openedCount: 0, clickCount: 0, leadsGenerated: 0, conversionCount: 0,
    },
  ]
  for (const c of campaigns) {
    await setDoc(COLLECTIONS.campaigns, `campaign-${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, { ...c, createdAt: now() })
  }

  console.log("✅ Seed complete!")
  console.log("")
  console.log(`Dev accounts (password: ${DEV_PASSWORD}):`)
  console.log("  SUPER_ADMIN  admin@rrgroup.example")
  console.log("  MANAGER      manager@rrgroup.example")
  console.log("  STAFF        staff@rrgroup.example")
  console.log("  CUSTOMER     customer@rrgroup.example")
  console.log("Coupon code: RR10")
  console.log("")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })