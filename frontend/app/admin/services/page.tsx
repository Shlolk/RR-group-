"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ApiError, getErrorMessage } from "@/lib/api"
import { fetchAdminServices } from "@/lib/services/admin"
import { fetchServices } from "@/lib/services/api"

type Service = {
  id: string
  slug: string
  name: string
  category: string
  isActive?: boolean
  active?: boolean
}

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetchAdminServices()
        const data = res as unknown as { items: Service[] } | Service[]
        const list = Array.isArray(data) ? data : (data.items ?? [])
        if (!mounted) return
        setItems(list)
      } catch (err) {
        // fallback to public API if admin endpoint missing
        if (err instanceof ApiError && err.status === 404) {
          try {
            const pub = await fetchServices()
            const data = pub as unknown as { items: Service[] } | Service[]
            const list = Array.isArray(data) ? data : ((data as { items: Service[] }).items ?? [])
            if (!mounted) return
            setItems(list)
            return
          } catch (fallbackErr) {
            if (!mounted) return
            if (fallbackErr instanceof ApiError && fallbackErr.status === 404) {
              setItems([])
              return
            }
            setError(getErrorMessage(fallbackErr))
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">Business service catalog</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No services yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((s) => {
                const active = s.isActive ?? s.active ?? true
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.slug}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.category ?? "—"}</td>
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
