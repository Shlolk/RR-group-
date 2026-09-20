import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Boxes, CheckCircle2, Globe, Megaphone, Users } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CtaSection } from "@/components/site/cta-section"
import { serviceIcons } from "@/lib/service-icons"
import { loadService, loadServices } from "@/lib/data"
import { cn } from "@/lib/utils"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const service = await loadService(slug)
  if (!service)
    return {
      title: "Service Not Found",
    }
  return {
    title: `${service.name} | RR GROUP`,
    description: service.shortDescription,
  }
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params
  const service = await loadService(slug)
  if (!service) notFound()

  const Icon = serviceIcons[service.slug] ?? Globe
  const allServices = await loadServices()
  const related = allServices.filter((s) => s.slug !== service.slug).slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:underline"
          >
            <ArrowRight className="size-4 rotate-180" /> What We Offer
          </Link>
          <div className="mt-6 flex items-center gap-5">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Icon className="size-8" />
            </span>
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{service.name}</h1>
              <p className="mt-2 text-lg text-background/70">{service.tagline}</p>
            </div>
          </div>
          <p className="mt-8 max-w-3xl text-background/80">{service.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
              {service.cta}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* What we solve / What we offer */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">What we solve</h2>
            <ul className="mt-6 space-y-3">
              {service.problems.map((p) => (
                <li key={p} className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">What we offer</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {service.offerings.map((o) => (
                <div key={o} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  {o}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key features */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-2xl font-bold text-foreground">Key features</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.features.map((f) => (
              <div
                key={f}
                className="rounded-xl border border-border bg-background p-5 text-sm font-medium text-foreground"
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + Process */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Benefits</h2>
            <ul className="mt-6 space-y-3">
              {service.benefits.map((b) => (
                <li key={b} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  {b}
                </li>
              ))}
            </ul>
            {service.technologies.length > 0 && (
              <>
                <h3 className="mt-10 font-display text-lg font-bold text-foreground">Technologies</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.technologies.map((t) => (
                    <Badge key={t} variant="secondary" className="rounded-md px-2.5 py-1">
                      {t}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">How we work</h2>
            <ol className="mt-6 space-y-4">
              {service.process.map((p, i) => (
                <li key={p.step} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {p.step} · {p.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-2xl font-bold text-foreground">Use cases</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {service.useCases.map((u) => (
              <div key={u.title} className="rounded-xl border border-border bg-background p-6">
                <h3 className="font-display text-base font-bold text-foreground">{u.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-foreground">FAQs</h2>
        <div className="mt-6 space-y-3">
          {service.faqs.map((f) => (
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
      </section>

      {/* Other services */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="font-display text-2xl font-bold text-foreground">Explore other services</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {related.map((s) => {
            const RelIcon = serviceIcons[s.slug] ?? Globe
            return (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <RelIcon className="size-6 text-primary" />
                <h3 className="mt-3 font-display text-base font-bold text-foreground">{s.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.shortDescription}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Learn More <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <CtaSection
        title={service.cta}
        description={service.ctaDescription}
        primaryLabel="Get a Quote"
        primaryHref="/contact"
      />
    </>
  )
}
