import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Calendar, CalendarClock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CtaSection } from "@/components/site/cta-section"
import { loadBlogPost, loadBlogPosts } from "@/lib/data"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await loadBlogPost(slug)
  if (!post) return { title: "Article Not Found" }
  return {
    title: `${post.title} — RR GROUP Blog`,
    description: post.excerpt,
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

export default async function BlogArticlePage({ params }: Params) {
  const { slug } = await params
  const post = await loadBlogPost(slug)
  if (!post) notFound()

  const allPosts = await loadBlogPosts()
  const related = allPosts.filter((p) => post.related.includes(p.slug)).slice(0, 2)

  return (
    <>
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:underline"
          >
            <ArrowRight className="size-4 rotate-180" /> Blog
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="rounded-md bg-background/10 text-cyan-300">
              {post.category}
            </Badge>
            <span className="flex items-center gap-1.5 text-sm text-background/50">
              <Calendar className="size-4" /> {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-background/50">
              <CalendarClock className="size-4" /> {post.readMinutes} min read
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-background/70">
            By {post.author} · {post.authorRole}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-cyan-400/10 p-16 text-center">
          <span className="text-sm font-semibold text-primary">{post.category}</span>
        </div>
        <div className="mt-8 space-y-6">
          {post.content.map((para, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-lg leading-relaxed text-foreground"
                  : "leading-relaxed text-muted-foreground"
              }
            >
              {para}
            </p>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-8">
          <span className="text-sm font-semibold text-foreground">Tags:</span>
          {post.tags.map((t) => (
            <Badge key={t} variant="outline" className="rounded-md">
              {t}
            </Badge>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <h2 className="font-display text-2xl font-bold text-foreground">Related articles</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/50"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category}</span>
                  <h3 className="mt-2 font-display text-lg font-bold text-foreground">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Read Article
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
