"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ApiError, getErrorMessage } from "@/lib/api"
import { fetchAdminFaqs } from "@/lib/services/admin"

type Faq = {
  id: string
  question: string
  answer: string
  isActive?: boolean
  active?: boolean
  order?: number
  createdAt?: string
}

export default function AdminFaqsPage() {
  const [items, setItems] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchAdminFaqs()
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items: Faq[] } | Faq[]
        const list = Array.isArray(data) ? data : (data.items ?? [])
        setItems(list)
      })
      .catch((err) => {
        if (!mounted) return
        if (err instanceof ApiError && err.status === 404) {
          setItems([])
        } else {
          setError(getErrorMessage(err))
        }
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">FAQs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Frequently asked questions</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No FAQs yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Question</th>
                <th className="px-4 py-3 font-medium">Answer</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((faq) => {
                const active = faq.isActive ?? faq.active ?? true
                return (
                  <tr key={faq.id}>
                    <td className="px-4 py-3 font-medium max-w-[280px] truncate">{faq.question}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[360px] truncate">{faq.answer}</td>
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
