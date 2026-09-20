"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/api"
import { createTicket, fetchMyTickets } from "@/lib/services/account"
import type { ApiTicket } from "@/lib/api-types"

const statusVariant: Record<string, "warning" | "accent" | "success" | "destructive" | "outline"> = {
  OPEN: "warning",
  REPLIED: "accent",
  PROCESSING: "accent",
  RESOLVED: "success",
  CLOSED: "outline",
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<ApiTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const list = await fetchMyTickets()
      setTickets(Array.isArray(list) ? list : (list as unknown as { items: ApiTicket[] }).items ?? [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createTicket({ subject, description })
      setSubject("")
      setDescription("")
      setOpen(false)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">Open a ticket and track responses.</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>
          {open ? <X className="size-4" /> : <Plus className="size-4" />}
          {open ? "Close" : "New ticket"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {open && (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Subject</label>
            <Input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              placeholder="Describe the problem in detail"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Submitting…" : "Submit ticket"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No support tickets yet.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => (
            <li key={t.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/support/${t.id}`}
                    className="text-sm font-semibold hover:text-primary"
                  >
                    {t.subject}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    #{t.ticketNumber ?? t.id.slice(0, 8)} · {new Date(t.createdAt).toLocaleString()} ·{" "}
                    {t.priority}
                    {typeof t._count?.messages === "number" && ` · ${t._count.messages} message(s)`}
                  </p>
                </div>
                <Badge variant={statusVariant[t.status] ?? "outline"}>{t.status}</Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}