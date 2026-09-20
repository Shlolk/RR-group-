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
      {/* Hero — premium dark with grid, gradient mesh, elevated cards */}
      <section className="relative isolate overflow-hidden bg-foreground text-background">
        {/* gradient mesh + subtle grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-violet-600/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-0 size-[30rem] rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full bg-cyan-400/15 blur-3xl"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200 backdrop-blur-xl">
              <Sparkles className="size-3.5 text-cyan-300" /> Digital Technology &amp; Business Solutions
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
              Building digital solutions that drive{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                business growth
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-background/65">
              RR GROUP designs and delivers web development, ERP, CRM and digital marketing systems
              that connect your operations, engage your customers and grow your revenue.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/services"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group h-11 px-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25",
                )}
              >
                Explore Our Services
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "group h-11 px-6 border border-white/25 bg-white/[0.06] text-white backdrop-blur-xl hover:bg-white hover:text-foreground hover:border-white",
                )}
              >
                Book a Consultation
                <ArrowRight className="size-4 opacity-70 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
              {heroMetrics.map((m) => (
                <div key={m.label}>
                  <dt className="font-display text-2xl font-bold tracking-tight text-white">{m.value}</dt>
                  <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-background/45">
                    {m.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Feature grid — glass + premium shadows */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Globe, title: "Web Development", text: "Modern, scalable, conversion-focused websites and web apps." },
              { icon: Boxes, title: "ERP Solutions", text: "Connected operations — inventory, finance, procurement and reporting." },
              { icon: Users, title: "CRM Solutions", text: "Lead pipelines, sales automation and 360° customer views." },
              { icon: Megaphone, title: "Digital Marketing", text: "SEO, paid media and content campaigns measured to ROI." },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/15"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 transition-colors group-hover:bg-white group-hover:text-foreground">
                  <f.icon className="size-5 text-cyan-200 group-hover:text-primary" />
                </div>
                <h3 className="mt-4 font-display text-[15px] font-bold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-background/60">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer — premium card grid */}
      <section className="border-t border-border/40 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
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
                  className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/[0.06] sm:p-8"
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/[0.08] text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/20">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">{s.name}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.shortDescription}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Learn More
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why RR GROUP — muted rhythm with subtle pattern */}
      <section className="relative border-y border-border/40 bg-muted/30">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.55_0.18_264/0.06),transparent_60%)]"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span aria-hidden className="h-px w-6 bg-primary/30" /> Why RR GROUP
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              One team for your entire digital stack
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              Most companies waste time and budget stitching together different vendors for their
              website, business software and marketing. We build them as one connected system — so
              your data flows, your team stays aligned and every investment compounds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6 shadow-sm hover:shadow-md")}>
                About RR GROUP <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            {[
              { icon: Zap, title: "Faster to market", text: "Focused scope and agile sprints mean launch in weeks, not quarters." },
              { icon: ShieldCheck, title: "Security built in", text: "Role-based access, audit logs and privacy baked into every build." },
              { icon: BarChart3, title: "Decisions with data", text: "Dashboards and reports that turn business data into direction." },
              { icon: Users, title: "A partner, not a vendor", text: "Long-term relationships — from launch through ongoing support." },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/15 hover:shadow-md"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                  <item.icon className="size-5" />
                </span>
                <dt className="mt-4 font-display text-[15px] font-bold tracking-tight text-foreground">{item.title}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Testimonials — premium quote cards */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <SectionHeader eyebrow="Client Stories" title="Trusted by growing businesses" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/[0.05]"
              >
                <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < t.rating ? "text-[13px]" : "text-[13px] text-amber-400/25"}>
                      ★
                    </span>
                  ))}
                  <span className="ml-1.5 text-xs font-medium text-muted-foreground">{t.rating}.0</span>
                </div>
                <span aria-hidden className="mt-3 font-display text-3xl leading-none text-primary/15">
                  “
                </span>
                <blockquote className="-mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">“{t.content}”</blockquote>
                <figcaption className="mt-5 border-t border-border/60 pt-4">
                  <p className="text-sm font-semibold tracking-tight text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role}, {t.company}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — muted rhythm with premium accordion */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
          <SectionHeader eyebrow="FAQ" title="Common questions, answered" />
          <div className="space-y-3">
            {faqs.slice(0, 6).map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-all duration-200 open:shadow-md open:border-primary/15 hover:border-primary/10 hover:bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold tracking-tight text-foreground [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary transition-all duration-200 group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground group-open:border-primary">
                    ＋
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Still have questions? Talk to our team <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
