"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/api"
import { createLead, deleteLead, fetchLeads, updateLead } from "@/lib/services/admin"
import type { ApiLead } from "@/lib/api-types"

const statusVariant: Record<string, "warning" | "accent" | "success" | "destructive" | "outline"> = {
  NEW: "warning",
  CONTACTED: "accent",
  QUALIFIED: "default" as never,
  WON: "success",
  LOST: "destructive",
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<ApiLead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", source: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchLeads({ page, perPage: 20, status: statusFilter || undefined })
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items: ApiLead[]; pagination?: { total: number } } | ApiLead[]
        const items = Array.isArray(data) ? data : (data.items ?? [])
        const totalCount = Array.isArray(data) ? items.length : (data.pagination?.total ?? items.length)
        setLeads(items)
        setTotal(totalCount)
      })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [page, statusFilter])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const lead = await createLead(form)
      setLeads((prev) => [lead, ...prev])
      setForm({ name: "", email: "", phone: "", source: "" })
      setCreating(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const convert = async (id: string) => {
    if (!window.confirm("Convert this lead to a customer?")) return
    setError(null)
    try {
      const updated = await updateLead(id, { status: "WON" })
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm("Delete this lead?")) return
    try {
      await deleteLead(id)
      setLeads((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const perPage = 20
  const pages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">CRM Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} leads</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="">All statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
          <Button onClick={() => setCreating((v) => !v)}>{creating ? "Close" : "New lead"}</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {creating && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Phone</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Source</label>
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Creating…" : "Create lead"}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3 font-medium">
                    {lead.name}
                    {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.email}
                    {lead.phone && <br />}
                    {lead.phone}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.source}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[lead.status] ?? "outline"}>{lead.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {lead.status !== "WON" && lead.status !== "LOST" && (
                        <Button size="sm" variant="outline" onClick={() => convert(lead.id)}>
                          Convert
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => remove(lead.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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