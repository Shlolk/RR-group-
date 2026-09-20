"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ApiError, getErrorMessage } from "@/lib/api"
import { fetchAdminBlogPosts } from "@/lib/services/admin"

type BlogPost = {
  id: string
  title: string
  slug?: string
  isPublished?: boolean
  isActive?: boolean
  authorId?: string
  author?: string
  createdAt: string
  publishedAt?: string | null
}

export default function AdminBlogPage() {
  const [items, setItems] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchAdminBlogPosts()
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items: BlogPost[] } | BlogPost[]
        const list = Array.isArray(data) ? data : (data.items ?? [])
        setItems(list)
      })
      .catch((err) => {
        if (!mounted) return
        if (err instanceof ApiError && err.status === 404) {
          setItems([])
        } else {
          setError(getErrorMessage(err))
        }
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Blog</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage blog posts</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No blog posts yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((post) => {
                const published = post.isPublished ?? post.isActive ?? false
                return (
                  <tr key={post.id}>
                    <td className="px-4 py-3 font-medium max-w-[320px] truncate">{post.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{post.slug ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={published ? "success" : "outline"}>{published ? "Published" : "Draft"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
