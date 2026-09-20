"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError, getErrorMessage } from "@/lib/api"
import { broadcastNotification, fetchNotifications } from "@/lib/services/admin"

type Notification = {
  id: string
  title: string
  message: string
  type?: string | null
  link?: string | null
  createdAt: string
  userId?: string
  readAt?: string | null
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", message: "", type: "announcement", link: "" })
  const [sending, setSending] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchNotifications()
      const data = res as unknown as { items: Notification[] } | Notification[] | { items: Notification[]; pagination?: unknown }
      const list = Array.isArray(data) ? data : ((data as { items: Notification[] }).items ?? [])
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

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await broadcastNotification({
        title: form.title,
        message: form.message,
        type: form.type,
        link: form.link || undefined,
      })
      setSuccessMsg("Broadcast sent")
      setForm({ title: "", message: "", type: "announcement", link: "" })
      load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Broadcast and review system notifications</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleBroadcast} className="space-y-3 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Broadcast notification</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type</label>
            <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="announcement" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Message</label>
          <Input required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message body" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Link (optional)</label>
          <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://…" />
        </div>
        <Button type="submit" disabled={sending}>
          {sending ? "Sending…" : "Broadcast to all active users"}
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((n) => (
                <tr key={n.id}>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{n.title}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[320px] truncate">{n.message}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{n.type ?? "notification"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "—"}
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
