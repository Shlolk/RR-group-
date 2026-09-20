"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { getErrorMessage } from "@/lib/api"
import { fetchCampaigns } from "@/lib/services/admin"

type Campaign = {
  id: string
  name: string
  type: string
  channel: string
  status: string
  budget?: string | number | null
  startDate?: string | null
  endDate?: string | null
}

const statusVariant: Record<string, "success" | "warning" | "outline" | "destructive"> = {
  ACTIVE: "success",
  DRAFT: "warning",
  PAUSED: "warning",
  COMPLETED: "outline",
  CANCELLED: "destructive",
}

export default function AdminMarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchCampaigns()
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items: Campaign[] } | Campaign[]
        setCampaigns(Array.isArray(data) ? data : (data.items ?? []))
      })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Marketing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Campaigns and promotions</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : campaigns.length === 0 ? (
        <p className="text-sm text-muted-foreground">No campaigns yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.channel} · {c.type} · {c.budget != null ? `₹${Number(c.budget).toLocaleString("en-IN")}` : "—"}
                  </p>
                </div>
                <Badge variant={statusVariant[c.status] ?? "outline"}>{c.status}</Badge>
              </div>
              {(c.startDate || c.endDate) && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {c.startDate ? new Date(c.startDate).toLocaleDateString() : "—"} →{" "}
                  {c.endDate ? new Date(c.endDate).toLocaleDateString() : "open-ended"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}