"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/api"
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  fetchAdminBlogPosts,
  fetchAdminFaqs,
  fetchAdminTestimonials,
} from "@/lib/services/admin"

type ContentItem = { id: string; title?: string; question?: string; author?: string; published?: boolean; isActive?: boolean }

export default function AdminContentPage() {
  const [tab, setTab] = useState<"blog" | "faq" | "testimonials">("blog")
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    const fetcher =
      tab === "blog"
        ? fetchAdminBlogPosts
        : tab === "faq"
          ? fetchAdminFaqs
          : fetchAdminTestimonials

    fetcher()
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items: ContentItem[] } | ContentItem[]
        setItems(Array.isArray(data) ? data : (data.items ?? []))
      })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">Blog posts, FAQs and testimonials</p>
      </div>

      <div className="flex overflow-hidden rounded-lg border border-border">
        {(["blog", "faq", "testimonials"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {tab} items yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title ?? item.question ?? item.id}</p>
                <p className="text-xs text-muted-foreground">
                  {item.author && `By ${item.author} · `}
                  {(item.published ?? item.isActive) ? "Published" : "Draft"}
                </p>
              </div>
              <Badge variant={(item.published ?? item.isActive) ? "success" : "outline"}>
                {(item.published ?? item.isActive) ? "Live" : "Draft"}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}