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
      <section className="relative overflow-hidden border-b border-white/10 bg-foreground text-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-violet-600/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-200">
            <span aria-hidden className="h-px w-6 bg-white/20" /> What We Offer
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tighter sm:text-5xl">
            Services designed to drive measurable growth
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-background/65">
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
                className="group flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-lg hover:shadow-primary/[0.06]"
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
