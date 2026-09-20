"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ApiError, getErrorMessage } from "@/lib/api"
import { api } from "@/lib/api"

type Subscriber = {
  id: string
  email: string
  isActive?: boolean
  createdAt?: string
  subscriberCount?: number
}

export default function AdminNewsletterPage() {
  const [items, setItems] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notAvailable, setNotAvailable] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        // Try primary endpoint
        const res = await api.get<Subscriber[]>("/api/admin/newsletter")
        const data = res as unknown as { items: Subscriber[] } | Subscriber[]
        const list = Array.isArray(data) ? data : (data.items ?? [])
        if (!mounted) return
        setItems(list)
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // try fallback
          try {
            const res2 = await api.get<Subscriber[]>("/api/admin/subscribers")
            const data2 = res2 as unknown as { items: Subscriber[] } | Subscriber[]
            const list2 = Array.isArray(data2) ? data2 : (data2.items ?? [])
            if (!mounted) return
            setItems(list2)
            return
          } catch (err2) {
            if (!mounted) return
            if (err2 instanceof ApiError && err2.status === 404) {
              setNotAvailable(true)
              setItems([])
              return
            }
            setError(getErrorMessage(err2))
            return
          }
        }
        if (!mounted) return
        setError(getErrorMessage(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">Subscriber list and growth</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : notAvailable ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Newsletter endpoint not available yet. Subscriber data will appear here once the backend endpoint is active.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Tried /api/admin/newsletter and /api/admin/subscribers — both returned 404.</p>
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No subscribers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.isActive === false ? "outline" : "success"}>
                      {s.isActive === false ? "Inactive" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
