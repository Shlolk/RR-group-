"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/components/store/store-provider"
import { getErrorMessage } from "@/lib/api"
import { adjustInventory, fetchAdminProducts } from "@/lib/services/admin"
import type { ApiProduct } from "@/lib/api-types"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchAdminProducts({ page, perPage: 20, search })
      .then((res) => {
        if (!mounted) return
        const items = Array.isArray(res)
          ? (res as unknown as ApiProduct[])
          : (res as unknown as { items: ApiProduct[]; total: number }).items ?? []
        const totalCount = Array.isArray(res)
          ? items.length
          : (res as unknown as { items: ApiProduct[]; total: number }).total ?? items.length
        setProducts(items)
        setTotal(totalCount)
      })
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [page, search])

  const [restockQty, setRestockQty] = useState<Record<string, number>>({})

  const restock = async (id: string) => {
    const qty = restockQty[id] ?? 0
    if (!qty) return
    setError(null)
    try {
      await adjustInventory(id, { type: "RECEIPT", quantity: qty, note: "Manual restock" })
      setRestockQty((prev) => ({ ...prev, [id]: 0 }))
      // Refresh local stock display
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: (p.stock ?? 0) + qty } : p)),
      )
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
          <h1 className="font-display text-2xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{total} products</p>
        </div>
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-64"
        />
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
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Restock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="size-9 rounded-md object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <Badge variant={(p.stock ?? 0) <= (p.lowStockThreshold ?? 0) ? "destructive" : "success"}>
                      {p.stock}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.isActive ? "success" : "outline"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <input
                        type="number"
                        min={0}
                        value={restockQty[p.id] ?? 0}
                        onChange={(e) =>
                          setRestockQty((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))
                        }
                        className="h-8 w-20 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      />
                      <Button size="sm" variant="outline" onClick={() => restock(p.id)}>
                        Add
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