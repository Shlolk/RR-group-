"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ApiError, getErrorMessage } from "@/lib/api"
import { fetchAdminPortfolio } from "@/lib/services/admin"

type PortfolioProject = {
  id: string
  title: string
  slug?: string
  category?: string | null
  isActive?: boolean
  active?: boolean
  createdAt: string
}

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchAdminPortfolio()
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items: PortfolioProject[] } | PortfolioProject[]
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">Managed project showcases</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No portfolio projects yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((p) => {
                const active = p.isActive ?? p.active ?? true
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={active ? "success" : "outline"}>{active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
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
