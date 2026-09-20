"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api"
import { fetchAdminTicket, replyAdminTicket, updateAdminTicket } from "@/lib/services/admin"
import type { ApiTicket } from "@/lib/api-types"
import { cn } from "@/lib/utils"

const statusVariant: Record<string, "warning" | "accent" | "success" | "outline"> = {
  OPEN: "warning",
  REPLIED: "accent",
  PROCESSING: "accent",
  RESOLVED: "success",
  CLOSED: "outline",
}

export default function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<ApiTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const t = await fetchAdminTicket(id)
      setTicket(t)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    setError(null)
    try {
      await replyAdminTicket(id, { content: reply })
      setReply("")
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  const setStatus = async (status: string) => {
    setBusy(true)
    setError(null)
    try {
      const updated = await updateAdminTicket(id, { status })
      setTicket(updated)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (!ticket) return <p className="text-sm text-destructive">{error ?? "Ticket not found"}</p>

  const messages = ticket.messages ?? []

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/support" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          ← Back
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {ticket.ticketNumber ?? ticket.id.slice(0, 8)} · {ticket.priority} · by{" "}
              {ticket.user?.firstName} {ticket.user?.lastName} ({ticket.user?.email}) ·{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge variant={statusVariant[ticket.status] ?? "outline"}>{ticket.status}</Badge>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {["OPEN", "REPLIED", "PROCESSING", "RESOLVED", "CLOSED"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={s === ticket.status ? "default" : "outline"}
              disabled={busy || s === ticket.status}
              onClick={() => setStatus(s)}
            >
              {s === ticket.status ? `✓ ${s}` : s}
            </Button>
          ))}
        </div>
      </section>

      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-foreground">{ticket.description}</p>
        </div>
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-4xl rounded-xl border border-border p-4",
              m.isInternal ? "border-dashed" : m.sender?.role === "CUSTOMER" ? "bg-card" : "bg-muted/50",
            )}
          >
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">
                {m.sender?.firstName} {m.sender?.lastName} ({m.sender?.role})
                {m.isInternal && <Badge variant="outline" className="ml-2">internal</Badge>}
              </span>
              <span>{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-foreground">{m.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="space-y-3 rounded-xl border border-border bg-card p-5">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          placeholder="Reply to customer…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={sending || !reply.trim()}>
            {sending ? "Sending…" : "Send reply"}
          </Button>
        </div>
      </form>
    </div>
  )
}