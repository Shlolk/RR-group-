import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { CtaSection } from "@/components/site/cta-section"
import { loadFaqs } from "@/lib/data"
import { cn } from "@/lib/utils"

type Params = { params: Promise<{ slug: string[] }> }

interface DocPage {
  eyebrow: string
  title: string
  meta: string
  intro: string
  sections: { heading: string; body: string[] }[]
}

const docs: Record<string, DocPage> = {
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    meta: "How RR GROUP collects, uses and protects your information.",
    intro:
      "This Privacy Policy explains what personal data we collect when you use the RR GROUP website, store and services, and how we use and protect it. By using our sites you agree to this policy.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Account information you provide — name, email, phone number and password — when you register or place an order.",
          "Payment details are handled by our payment providers (Razorpay). We do not store card numbers on our servers.",
          "Usage data such as pages visited, products viewed and device information, collected via cookies and analytics.",
          "Information you send us through contact forms, career applications, support tickets and chat.",
        ],
      },
      {
        heading: "How we use your data",
        body: [
          "To deliver the services you request: process orders, manage accounts, provide support and respond to inquiries.",
          "To improve our products and website experience, and to send transactional emails about your orders.",
          "With your consent, we may send marketing communications. You may unsubscribe at any time.",
        ],
      },
      {
        heading: "Sharing your data",
        body: [
          "We only share personal data with service providers who need it to operate our business (hosting, payments, email). These providers are bound by confidentiality obligations.",
          "We do not sell your personal data. We never share it with third parties for their own marketing without your consent.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may request a copy of the personal data we hold about you, ask us to correct it, or request deletion.",
          "To exercise these rights, contact us via the contact page or email contact@rrgroup.example.",
        ],
      },
      {
        heading: "Security and retention",
        body: [
          "We use industry-standard safeguards (encryption in transit, access controls) to protect your data.",
          "We retain personal data only as long as needed for the purposes above or to comply with legal obligations.",
        ],
      },
      {
        heading: "Changes to this policy",
        body: [
          "We may update this policy from time to time. Material changes will be highlighted on this page, and the effective date below will be refreshed.",
          "Effective date: 1 January 2026.",
        ],
      },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    meta: "The terms that govern access to the RR GROUP website and services.",
    intro:
      "These Terms of Service govern your use of the RR GROUP website, online store and related services. By accessing or using our services, you agree to be bound by these terms.",
    sections: [
      {
        heading: "Use of the services",
        body: [
          "You must be at least 18 years old to make purchases. You are responsible for maintaining the confidentiality of your account credentials.",
          "You agree not to misuse the services, attempt to disrupt them, or use them for unlawful purposes.",
        ],
      },
      {
        heading: "Products and pricing",
        body: [
          "We make every effort to display product information accurately. Prices are listed in Indian Rupees (INR) and include applicable taxes where stated.",
          "We may update prices or specifications at any time. Prices on the order confirmation are final.",
        ],
      },
      {
        heading: "Orders and delivery",
        body: [
          "Your order is accepted once payment is processed and we send an order confirmation.",
          "Digital products are delivered by email after payment. Physical products are shipped as described on the product page.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "All content, software, branding and designs on this website are owned by RR GROUP or our licensors and are protected by applicable laws.",
          "Licensed software products remain subject to their respective vendor licence agreements.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "Our services are provided 'as is'. To the maximum extent permitted by law, RR GROUP is not liable for indirect or consequential damages arising from your use of the services.",
          "Nothing in these terms limits liability that cannot be excluded under applicable law.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.",
        ],
      },
    ],
  },
  refund: {
    eyebrow: "Support",
    title: "Refund & Cancellation Policy",
    meta: "Our refund and cancellation policy for products and services purchased from RR GROUP.",
    intro:
      "We want you to be completely satisfied. This policy explains when and how you can cancel an order or request a refund for products and services purchased from RR GROUP.",
    sections: [
      {
        heading: "Digital products & software licenses",
        body: [
          "Because digital products are delivered instantly, refunds are available within 7 days of purchase if the product is defective, does not work as described, or the licence key fails to activate.",
          "We may request a diagnostic screenshot to verify the issue before processing the refund.",
        ],
      },
      {
        heading: "Physical products",
        body: [
          "Physical products may be returned within 7 days of delivery if unused and in original packaging. Return shipping costs are your responsibility unless the item is defective or wrong.",
        ],
      },
      {
        heading: "Services",
        body: [
          "For consulting, development and managed services, cancellations are free before work begins. If work has started, fees for completed work are non-refundable; we prorate any unused portion.",
        ],
      },
      {
        heading: "How to request a refund",
        body: [
          "Contact us through the contact page, or email support@rrgroup.example with your order number and reason.",
          "We review refund requests within 3–5 business days. Approved refunds are processed to the original payment method within 7–10 business days.",
        ],
      },
    ],
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookie Policy",
    meta: "How RR GROUP uses cookies and similar technologies.",
    intro:
      "This Cookie Policy explains what cookies are, how we use them on our website, and the choices you have to control them.",
    sections: [
      {
        heading: "What are cookies?",
        body: [
          "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how it is used.",
        ],
      },
      {
        heading: "How we use cookies",
        body: [
          "Essential cookies: required for the site to function, such as keeping you logged in or remembering your cart.",
          "Analytics cookies: help us understand how visitors use the site so we can improve it.",
          "Preference cookies: remember your choices such as currency or session settings.",
        ],
      },
      {
        heading: "Managing cookies",
        body: [
          "You can disable cookies in your browser settings. Note that some parts of the site may not work correctly without them.",
          "You may also clear stored cookies at any time from your browser's privacy settings.",
        ],
      },
    ],
  },
  help: {
    eyebrow: "Support",
    title: "Help Center",
    meta: "Get help with orders, accounts and services at RR GROUP.",
    intro:
      "Find quick answers to the most common questions. Can't find what you need? Our team is one message away on WhatsApp or the contact page.",
    sections: [
      {
        heading: "Tracking your order",
        body: [
          "Sign in and open your dashboard, then go to Orders, or use Track Order in the navigation. Each order shows its live status and shipping updates.",
        ],
      },
      {
        heading: "Damaged or wrong product",
        body: [
          "Email support@rrgroup.example with your order number and photos within 48 hours of delivery. We will arrange a replacement or refund promptly.",
        ],
      },
      {
        heading: "Login or account issues",
        body: [
          "Use the 'Forgot password' link on the login page to reset your password. If you still cannot sign in, contact support with your registered email address.",
        ],
      },
      {
        heading: "Service project inquiries",
        body: [
          "For web, ERP, CRM or marketing projects, use the contact form and select the relevant service. We respond within one business day.",
        ],
      },
    ],
  },
  partners: {
    eyebrow: "Company",
    title: "Partners",
    meta: "Become a partner of RR GROUP — reseller, technology or referral partnerships.",
    intro:
      "We work with implementation partners, resellers and technology vendors to deliver complete solutions to our customers. Here's how we partner.",
    sections: [
      {
        heading: "Reseller partnerships",
        body: [
          "Resell RR GROUP products and solutions to your customer base with dedicated margins and sales support. We provide marketing collateral, demo environments and co-branded proposals.",
        ],
      },
      {
        heading: "Technology partnerships",
        body: [
          "Technology vendors, cloud providers and platform companies can integrate their solutions with ours to offer end-to-end outcomes for shared customers.",
        ],
      },
      {
        heading: "Referral partnerships",
        body: [
          "Agencies and consultants who refer clients to RR GROUP earn a referral fee on successfully engaged projects. Simple to start, no exclusivity required.",
        ],
      },
      {
        heading: "Become a partner",
        body: [
          "Contact us through the contact page with 'Partnership' as the subject, or email partners@rrgroup.example. We'll set up a call within one business day.",
        ],
      },
    ],
  },
  shipping: {
    eyebrow: "Support",
    title: "Shipping Policy",
    meta: "Delivery timeframes and shipping details for RR GROUP physical products.",
    intro:
      "Here's what to expect when ordering physical products from RR GROUP. Digital and software products are delivered instantly by email.",
    sections: [
      {
        heading: "Processing time",
        body: [
          "Orders are packed and dispatched within 1–2 business days after payment confirmation (excluding weekends and public holidays).",
        ],
      },
      {
        heading: "Delivery timelines",
        body: [
          "Metro cities: 2–4 business days. Rest of India: 4–7 business days. You'll receive tracking details by email and SMS once your parcel ships.",
        ],
      },
      {
        heading: "Shipping charges",
        body: [
          "Shipping is free on orders above ₹999. Below that, a nominal shipping fee is calculated at checkout. Premium or same-day delivery options may carry additional charges.",
        ],
      },
      {
        heading: "Delivery issues",
        body: [
          "If a shipment is delayed or damaged, contact support@rrgroup.example with your order number and we'll make it right — including replacements where needed.",
        ],
      },
    ],
  },
  returns: {
    eyebrow: "Support",
    title: "Returns Policy",
    meta: "How to return a product purchased from RR GROUP.",
    intro:
      "Our goal is that you love what you ordered. If something isn't right, this policy explains how to return or exchange it.",
    sections: [
      {
        heading: "Eligibility",
        body: [
          "Physical products may be returned within 7 days of delivery if unused and in original packaging. Defective or incorrect items can be returned without restriction.",
          "Digital products and software licences are non-returnable unless defective, per our refund policy.",
        ],
      },
      {
        heading: "How to start a return",
        body: [
          "Email support@rrgroup.example with your order number, the item, and the reason. We'll reply with a return authorization and instructions within one business day.",
        ],
      },
      {
        heading: "Refund timing",
        body: [
          "Once the returned item is received and checked, the refund is processed to your original payment method within 7–10 business days.",
        ],
      },
    ],
  },
  warranty: {
    eyebrow: "Support",
    title: "Warranty Policy",
    meta: "Warranty coverage for hardware and devices sold by RR GROUP.",
    intro:
      "Hardware and devices sold by RR GROUP carry warranty terms from their manufacturers. This policy explains the coverage and how to make a claim.",
    sections: [
      {
        heading: "Coverage",
        body: [
          "New hardware ships with the manufacturer's standard warranty (typically 12 months), covering manufacturing defects under normal use. Software licences are not covered by hardware warranties.",
        ],
      },
      {
        heading: "What's not covered",
        body: [
          "Accidental damage, liquid damage, unauthorized modifications or repairs, and issues caused by misuse or third-party accessories are excluded from coverage.",
        ],
      },
      {
        heading: "Making a claim",
        body: [
          "Contact support@rrgroup.example with your order number and a description of the fault. We'll arrange diagnostics and, where applicable, repair or replacement under warranty.",
        ],
      },
    ],
  },
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const key = slug.join("/")
  const doc = docs[key]
  if (!doc) return { title: "Page Not Found" }
  return {
    title: `${doc.title} | RR GROUP`,
    description: doc.meta,
  }
}

export default async function InfoPage({ params }: Params) {
  const { slug } = await params
  const key = slug.join("/")
  const doc = docs[key]
  if (!doc) notFound()

  // For help page, hydrate FAQ section with live data (API-first with mock fallback)
  const liveFaqs = key === "help" ? await loadFaqs() : null

  return (
    <>
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">{doc.eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">{doc.title}</h1>
          <p className="mt-4 text-background/70">{doc.meta}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-lg leading-relaxed text-foreground">{doc.intro}</p>
        {doc.sections.map((s) => (
          <div key={s.heading} className="mt-10">
            <h2 className="font-display text-xl font-bold text-foreground">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
        ))}
        {liveFaqs && liveFaqs.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-foreground">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-3">
              {liveFaqs.map((f) => (
                <details
                  key={f.question}
                  className="group rounded-xl border border-border bg-card px-5 py-4"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span className="text-primary transition-transform group-open:rotate-45">＋</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}
        <div className="mt-12">
          <Link href="/contact" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
            Still have questions? Contact us
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <CtaSection />
    </>
  )
}