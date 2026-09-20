"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api"
import { fetchAdminTickets } from "@/lib/services/admin"
import type { ApiTicket } from "@/lib/api-types"
import { cn } from "@/lib/utils"

const statusVariant: Record<string, "warning" | "accent" | "success" | "outline"> = {
  OPEN: "warning",
  REPLIED: "accent",
  PROCESSING: "accent",
  RESOLVED: "success",
  CLOSED: "outline",
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<ApiTicket[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchAdminTickets({ page, status: statusFilter || undefined })
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items: ApiTicket[]; pagination?: { total: number } } | ApiTicket[]
        const items = Array.isArray(data) ? data : (data.items ?? [])
        const totalCount = Array.isArray(data) ? items.length : (data.pagination?.total ?? items.length)
        setTickets(items)
        setTotal(totalCount)
      })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [page, statusFilter])

  const perPage = 20
  const pages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Support Tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} tickets</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="REPLIED">Replied</option>
          <option value="PROCESSING">Processing</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : tickets.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No tickets found.</p>
        ) : (
          <ul className="divide-y divide-border">
            {tickets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <Link href={`/admin/support/${t.id}`} className="text-sm font-semibold hover:text-primary">
                    {t.subject}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.ticketNumber ?? t.id.slice(0, 8)} · {t.user?.firstName ?? ""} {t.user?.lastName ?? ""} ·{" "}
                    {t.user?.email} · {t.priority}
                    {typeof t._count?.messages === "number" && ` · ${t._count.messages} msg`}
                  </p>
                </div>
                <Badge variant={statusVariant[t.status] ?? "outline"}>{t.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}