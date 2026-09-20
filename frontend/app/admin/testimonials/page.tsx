"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ApiError, getErrorMessage } from "@/lib/api"
import { fetchAdminTestimonials } from "@/lib/services/admin"

type Testimonial = {
  id: string
  author?: string
  name?: string
  content?: string
  text?: string
  rating?: number
  isActive?: boolean
  active?: boolean
  createdAt?: string
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchAdminTestimonials()
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items: Testimonial[] } | Testimonial[]
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Testimonials</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customer testimonials</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No testimonials yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Content</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((t) => {
                const active = t.isActive ?? t.active ?? true
                const text = t.content ?? t.text ?? "—"
                return (
                  <tr key={t.id}>
                    <td className="px-4 py-3 font-medium">{t.author ?? t.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[320px] truncate">{text}</td>
                    <td className="px-4 py-3">{t.rating != null ? `${t.rating} ★` : "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={active ? "success" : "outline"}>{active ? "Active" : "Inactive"}</Badge>
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
