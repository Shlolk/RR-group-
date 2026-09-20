"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { CtaSection } from "@/components/site/cta-section"
import { portfolioCategories, type PortfolioCategory, type PortfolioProject } from "@/lib/content-data"
import { cn } from "@/lib/utils"

export function PortfolioClient({ projects }: { projects: PortfolioProject[] }) {
  const [active, setActive] = useState<PortfolioCategory | "All">("All")
  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active)

  return (
    <>
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Case Studies</p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Work that ships and moves the numbers
          </h1>
          <p className="mt-4 max-w-2xl text-background/70">
            Real projects across software, AI, infrastructure, marketing and real estate — with the
            outcomes that mattered.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects by category">
          {(["All", ...portfolioCategories] as const).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <Search className="size-8 text-muted-foreground" />
            <p className="text-muted-foreground">No projects in this category yet.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.slug}
                href={`/portfolio/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
              >
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category}</span>
                  <h2 className="mt-2 font-display text-lg font-bold text-foreground">{p.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    View case study
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CtaSection
        title="Have a project in mind?"
        description="Tell us the outcome you need — we'll show you how we'd build it."
      />
    </>
  )
}
