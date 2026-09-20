"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { getErrorMessage } from "@/lib/api"
import { fetchAuditLogs } from "@/lib/services/admin"

type AuditLog = {
  id: string
  action: string
  entity?: string | null
  entityId?: string | null
  metadata?: unknown
  createdAt: string
  actor?: { firstName?: string | null; lastName?: string | null; email?: string } | null
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchAuditLogs({ page: 1, perPage: 50 })
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items: AuditLog[] } | AuditLog[]
        setLogs(Array.isArray(data) ? data : (data.items ?? []))
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Recent system activity</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No audit logs yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{l.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.entity} {l.entityId ? `#${l.entityId.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.actor ? `${l.actor.firstName ?? ""} ${l.actor.lastName ?? ""}`.trim() || l.actor.email : "System"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(l.createdAt).toLocaleString()}
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