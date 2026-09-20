"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ApiError, getErrorMessage } from "@/lib/api"
import { fetchInquiries, updateInquiry } from "@/lib/services/admin"

type Inquiry = {
  id: string
  name: string
  email: string
  subject: string
  message?: string
  status: string
  createdAt: string
}

const statusVariant: Record<string, "success" | "warning" | "outline" | "destructive" | "secondary"> = {
  NEW: "warning",
  OPEN: "warning",
  PENDING: "warning",
  IN_PROGRESS: "secondary",
  RESOLVED: "success",
  CLOSED: "outline",
  REPLIED: "success",
}

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchInquiries()
      const data = res as unknown as { items: Inquiry[] } | Inquiry[]
      const list = Array.isArray(data) ? data : (data.items ?? [])
      setItems(list)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setItems([])
      } else {
        setError(getErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    setError(null)
    try {
      await updateInquiry(id, { status })
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Queries</h1>
        <p className="mt-1 text-sm text-muted-foreground">Contact inquiries from customers</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No inquiries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((inq) => (
                <tr key={inq.id}>
                  <td className="px-4 py-3 font-medium">{inq.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inq.email}</td>
                  <td className="px-4 py-3 max-w-[260px] truncate">{inq.subject}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[inq.status] ?? "outline"}>{inq.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatus(inq.id, e.target.value)}
                        disabled={updatingId === inq.id}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      >
                        <option value="NEW">NEW</option>
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                      {updatingId === inq.id && <span className="text-xs text-muted-foreground">…</span>}
                    </div>
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
