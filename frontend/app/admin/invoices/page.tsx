"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/components/store/store-provider"
import { getErrorMessage } from "@/lib/api"
import { fetchAdminInvoices } from "@/lib/services/admin"
import type { ApiInvoice } from "@/lib/api-types"

const statusVariant: Record<string, "warning" | "accent" | "success" | "destructive" | "outline"> = {
  pending: "warning",
  sent: "accent",
  paid: "success",
  overdue: "destructive",
  void: "outline",
}

const num = (v: string | number) => Number(v)

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<ApiInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchAdminInvoices()
      .then((res) => {
        if (!mounted) return
        const data = res as unknown as { items?: ApiInvoice[] } | ApiInvoice[]
        setInvoices(Array.isArray(data) ? data : (data.items ?? []))
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">{invoices.length} invoices</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Due</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No invoices yet.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.order?.orderNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[inv.status] ?? "outline"}>{inv.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(num(inv.total))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}