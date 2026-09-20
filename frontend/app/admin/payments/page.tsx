"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/components/store/store-provider"
import { getErrorMessage } from "@/lib/api"
import { fetchAdminPayments } from "@/lib/services/admin"
import type { ApiPayment } from "@/lib/api-types"

const statusVariant: Record<string, "success" | "warning" | "destructive" | "outline"> = {
  captured: "success",
  paid: "success",
  pending: "warning",
  authorized: "warning",
  failed: "destructive",
  refunded: "outline",
}

const num = (v: string | number) => Number(v)

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<ApiPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchAdminPayments()
      .then((res) => {
        if (!mounted) return
        setPayments(Array.isArray(res) ? res : (res as unknown as { items: ApiPayment[] }).items ?? [])
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">{payments.length} recorded transactions</p>
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
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No payments yet.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs">{p.id.slice(0, 12)}…</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.order?.orderNumber ?? "—"}</td>
                  <td className="px-4 py-3">{p.provider}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.method}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[p.status] ?? "outline"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(num(p.amount))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}