import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BarChart3, Boxes, Globe, Megaphone, ShieldCheck, Sparkles, Users, Zap } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { SectionHeader } from "@/components/store/section-header"
import { CtaSection } from "@/components/site/cta-section"
import { loadServices, loadTestimonials, loadFaqs } from "@/lib/data"
import { serviceIcons } from "@/lib/service-icons"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "RR GROUP — Digital Technology & Business Solutions",
  description:
    "Web development, ERP solutions, CRM solutions and digital marketing that drive business growth. Building digital solutions that drive business growth.",
  openGraph: {
    title: "RR GROUP — Digital Technology & Business Solutions",
    description: "Web development, ERP, CRM and digital marketing built to drive business growth.",
    type: "website",
  },
}

const heroMetrics = [
  { label: "Projects delivered", value: "120+" },
  { label: "Client satisfaction", value: "98%" },
  { label: "Industries served", value: "12+" },
  { label: "Avg. time-to-market", value: "6 wks" },
]

export default async function HomePage() {
  const [services, testimonials, faqs] = await Promise.all([loadServices(), loadTestimonials(), loadFaqs()])
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-0 size-[28rem] rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 size-[24rem] rounded-full bg-cyan-400/20 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-6 lg:grid-cols-2 lg:items-center lg:py-10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-background/15 bg-background/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
              <Sparkles className="size-3.5" /> Digital Technology &amp; Business Solutions
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Building digital solutions that drive{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-primary bg-clip-text text-transparent">
                business growth
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-background/70">
              RR GROUP designs and delivers web development, ERP, CRM and digital marketing systems
              that connect your operations, engage your customers and grow your revenue.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
                Explore Our Services
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-6 border border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-white/40",
                )}
              >
                Book a Consultation
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {heroMetrics.map((m) => (
                <div key={m.label}>
                  <dt className="font-display text-2xl font-bold text-cyan-300">{m.value}</dt>
                  <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-background/50">
                    {m.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Feature grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Globe, title: "Web Development", text: "Modern, scalable, conversion-focused websites and web apps." },
              { icon: Boxes, title: "ERP Solutions", text: "Connected operations — inventory, finance, procurement and reporting." },
              { icon: Users, title: "CRM Solutions", text: "Lead pipelines, sales automation and 360° customer views." },
              { icon: Megaphone, title: "Digital Marketing", text: "SEO, paid media and content campaigns measured to ROI." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-background/10 bg-background/5 p-6 backdrop-blur transition-colors hover:border-cyan-300/40"
              >
                <f.icon className="size-6 text-cyan-300" />
                <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-background/60">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <SectionHeader
          eyebrow="What We Offer"
          title="Services built around your business"
          description="Four focused practices, one accountable team — every engagement scoped, delivered and supported with measurable outcomes."
          href="/services"
          linkLabel="View all services"
        />
        <div className="grid gap-5 md:grid-cols-2">
          {services.map((s) => {
            const Icon = serviceIcons[s.slug] ?? Globe
            return (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50 sm:p-8"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-foreground">{s.name}</h3>
                <p className="mt-2 text-muted-foreground">{s.shortDescription}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Learn More
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Why RR GROUP */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Why RR GROUP</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              One team for your entire digital stack
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Most companies waste time and budget stitching together different vendors for their
              website, business software and marketing. We build them as one connected system — so
              your data flows, your team stays aligned and every investment compounds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6")}>
                About RR GROUP
              </Link>
            </div>
          </div>
          <dl className="grid gap-6 sm:grid-cols-2">
            {[
              { icon: Zap, title: "Faster to market", text: "Focused scope and agile sprints mean launch in weeks, not quarters." },
              { icon: ShieldCheck, title: "Security built in", text: "Role-based access, audit logs and privacy baked into every build." },
              { icon: BarChart3, title: "Decisions with data", text: "Dashboards and reports that turn business data into direction." },
              { icon: Users, title: "A partner, not a vendor", text: "Long-term relationships — from launch through ongoing support." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-background p-6">
                <item.icon className="size-6 text-primary" />
                <dt className="mt-3 font-display text-lg font-bold text-foreground">{item.title}</dt>
                <dd className="mt-1.5 text-sm text-muted-foreground">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <SectionHeader eyebrow="Client Stories" title="Trusted by growing businesses" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm text-muted-foreground">“{t.content}”</blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.role}, {t.company}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
          <SectionHeader eyebrow="FAQ" title="Common questions, answered" />
          <div className="space-y-3">
            {faqs.slice(0, 6).map((f) => (
              <details
                key={f.question}
                className="group rounded-xl border border-border bg-background px-5 py-4"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <span className="text-primary transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/contact" className="text-sm font-semibold text-primary hover:underline">
              Still have questions? Talk to our team →
            </Link>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
