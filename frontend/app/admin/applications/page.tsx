"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ApiError, getErrorMessage } from "@/lib/api"
import { fetchAdminApplications, updateApplication } from "@/lib/services/admin"

type Application = {
  id: string
  fullName: string
  email: string
  position: string
  experience?: string | null
  status: string
  phone?: string | null
  location?: string | null
  createdAt: string
}

const statusVariant: Record<string, "success" | "warning" | "outline" | "destructive" | "secondary"> = {
  NEW: "warning",
  REVIEWING: "secondary",
  SHORTLISTED: "success",
  REJECTED: "destructive",
  HIRED: "success",
  PENDING: "warning",
}

export default function AdminApplicationsPage() {
  const [items, setItems] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAdminApplications()
      const data = res as unknown as { items: Application[] } | Application[]
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
      await updateApplication(id, { status })
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Career Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Job applications from candidates</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Full Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Experience</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((app) => (
                <tr key={app.id}>
                  <td className="px-4 py-3 font-medium">{app.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.email}</td>
                  <td className="px-4 py-3">{app.position}</td>
                  <td className="px-4 py-3 text-muted-foreground">{app.experience ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[app.status] ?? "outline"}>{app.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatus(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      >
                        <option value="NEW">NEW</option>
                        <option value="REVIEWING">REVIEWING</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="HIRED">HIRED</option>
                      </select>
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
