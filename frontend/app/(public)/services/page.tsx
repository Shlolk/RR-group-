import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Boxes, Globe, Megaphone, Users } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { CtaSection } from "@/components/site/cta-section"
import { loadServices } from "@/lib/data"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Services — What We Offer",
  description:
    "Web development, ERP solutions, CRM solutions and digital marketing from RR GROUP. Explore what we offer and find the right solution for your business.",
}

const serviceIcons: Record<string, typeof Globe> = {
  "web-development": Globe,
  "erp-solutions": Boxes,
  "crm-solutions": Users,
  "digital-marketing": Megaphone,
}

export default async function ServicesPage() {
  const services = await loadServices()
  return (
    <>
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">What We Offer</p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Services designed to drive measurable growth
          </h1>
          <p className="mt-4 max-w-2xl text-background/70">
            Four focused practices — web development, ERP, CRM and digital marketing — that work
            together as one connected system for your business.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {services.map((s, i) => {
            const Icon = serviceIcons[s.slug] ?? Globe
            return (
              <article
                key={s.slug}
                className="flex flex-col rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-7" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Service {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="font-display text-2xl font-bold text-foreground">{s.name}</h2>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-muted-foreground">{s.shortDescription}</p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {s.offerings.slice(0, 4).map((o) => (
                    <li key={o} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="size-4 shrink-0 text-primary" />
                      {o}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/services/${s.slug}`}
                    className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}
                  >
                    Learn More
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <CtaSection />
    </>
  )
}
