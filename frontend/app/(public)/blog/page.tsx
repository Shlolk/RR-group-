import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Calendar, Clock } from "lucide-react"
import { CtaSection } from "@/components/site/cta-section"
import { loadBlogPosts } from "@/lib/data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog — Insights & Ideas",
  description:
    "Expert insights on ERP, CRM, digital marketing, AI and web development from the RR GROUP team.",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default async function BlogPage() {
  const blogPosts = await loadBlogPosts()
  return (
    <>
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Insights</p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            The RR GROUP blog
          </h1>
          <p className="mt-4 max-w-2xl text-background/70">
            Practical thinking on building software, running operations and growing revenue.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
            >
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/10 via-background to-cyan-400/10">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {post.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> {formatDate(post.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {post.readMinutes} min read
                  </span>
                </div>
                <h2 className="mt-3 font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read Article
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <CtaSection />
    </>
  )
}
