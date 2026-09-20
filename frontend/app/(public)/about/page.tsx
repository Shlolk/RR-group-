import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BarChart3, Boxes, Globe, Megaphone, ShieldCheck, Users } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { SectionHeader } from "@/components/store/section-header"
import { CtaSection } from "@/components/site/cta-section"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "About — RR GROUP",
  description:
    "RR GROUP is a digital technology and business solutions company delivering web development, ERP, CRM and digital marketing that drive business growth.",
}

const values = [
  { icon: ShieldCheck, title: "Trust", text: "We ship what we promise, with clear timelines and honest architecture." },
  { icon: BarChart3, title: "Outcomes", text: "Every engagement is measured by the business result, not the deliverables." },
  { icon: Users, title: "Partnership", text: "We build for the long term — your success metrics are our success metrics." },
  { icon: Globe, title: "Craft", text: "Clean design and engineering are not optional; they're how software survives." },
]

const timeline = [
  { year: "How we work", title: "Audit & scope", text: "We start by understanding your processes, data and goals." },
  { year: "Design", title: "Blueprint", text: "You get a clear plan of modules, integrations and milestones." },
  { year: "Build", title: "Iterate & ship", text: "Focused sprints with demos, testing and feedback loops." },
  { year: "Grow", title: "Support & optimize", text: "Post-launch support and ongoing improvements." },
]

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">About RR GROUP</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            A technology partner for companies that want to grow with software
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-background/70">
            RR GROUP is a digital technology and business solutions company. We build websites,
            business systems and marketing engines — together, not as disconnected projects.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Why we exist
            </h2>
            <p className="mt-4 text-muted-foreground">
              Most growing businesses end up with a patchwork of tools that don't talk to each other —
              a website that can't take orders properly, a CRM that sales don't trust, an ERP that
              nobody uses and marketing that can't prove ROI.
            </p>
            <p className="mt-4 text-muted-foreground">
              We exist to replace that patchwork with a single connected platform: one company, one
              team, one system — built around how your business actually operates, and measured by
              what it actually produces.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
                What We Offer
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6")}
              >
                Talk to us
              </Link>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Globe, title: "Web Development", text: "Websites and web apps" },
              { icon: Boxes, title: "ERP Solutions", text: "Connected operations" },
              { icon: Users, title: "CRM Solutions", text: "Revenue and retention" },
              { icon: Megaphone, title: "Digital Marketing", text: "Measured growth" },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <s.icon className="size-6 text-primary" />
                <dt className="mt-3 font-display text-lg font-bold text-foreground">{s.title}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{s.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <SectionHeader eyebrow="Our Principles" title="What we believe" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-background p-6">
                <v.icon className="size-6 text-primary" />
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <SectionHeader eyebrow="The Journey" title="How an engagement runs" />
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((t, i) => (
            <li key={t.title} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">{t.year}</p>
              <h3 className="mt-1 font-display text-base font-bold text-foreground">{t.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <CtaSection
        title="Let's build what's next"
        description="Tell us where your business is today and where it needs to be — we'll chart the route."
      />
    </>
  )
}