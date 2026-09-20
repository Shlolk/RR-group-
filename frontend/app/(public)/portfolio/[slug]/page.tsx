import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, CheckCircle2, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CtaSection } from "@/components/site/cta-section"
import { loadPortfolio, loadPortfolioProject } from "@/lib/data"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = await loadPortfolioProject(slug)
  if (!project) return { title: "Project Not Found" }
  return {
    title: `${project.title} — RR GROUP Portfolio`,
    description: project.summary,
  }
}

export default async function PortfolioDetailPage({ params }: Params) {
  const { slug } = await params
  const project = await loadPortfolioProject(slug)
  if (!project) notFound()

  const allProjects = await loadPortfolio()
  const related = allProjects.filter((p) => project.related.includes(p.slug) && p.slug !== project.slug).slice(0, 2)

  return (
    <>
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:underline"
          >
            <ArrowRight className="size-4 rotate-180" /> Portfolio
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="rounded-md bg-background/10 px-3 py-1 text-cyan-300">
              {project.category}
            </Badge>
            <span className="text-sm text-background/50">
              Client: {project.client} · {project.industry}
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-background/70">{project.summary}</p>
        </div>
      </section>

      {/* Cover */}
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="flex aspect-[21/9] items-center justify-center rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-background to-cyan-400/15">
          <Layers className="size-16 text-primary/50" />
        </div>
      </section>

      {/* Context / Problem / Solution */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-foreground">Context</h2>
            <p className="mt-4 text-muted-foreground">{project.context}</p>
            <h2 className="mt-10 font-display text-2xl font-bold text-foreground">The problem</h2>
            <p className="mt-4 text-muted-foreground">{project.problem}</p>
            <h2 className="mt-10 font-display text-2xl font-bold text-foreground">The solution</h2>
            <p className="mt-4 text-muted-foreground">{project.solution}</p>

            <h3 className="mt-10 font-display text-lg font-bold text-foreground">Key features</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Outcomes
              </h3>
              <dl className="mt-4 space-y-4">
                {project.results.map((r) => (
                  <div key={r.label}>
                    <dd className="font-display text-2xl font-bold text-primary">{r.value}</dd>
                    <dt className="mt-0.5 text-sm text-muted-foreground">{r.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Technologies
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.technologies.map((t) => (
                  <Badge key={t} variant="secondary" className="rounded-md px-2.5 py-1">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <h2 className="font-display text-2xl font-bold text-foreground">Related projects</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/portfolio/${p.slug}`}
                  className="group rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/50"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category}</span>
                  <h3 className="mt-2 font-display text-lg font-bold text-foreground">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    View case study
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection />
    </>
  )
}
