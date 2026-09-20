"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/api"
import { approveReview, deleteReview, fetchReviews } from "@/lib/services/admin"

type Review = {
  id: string
  rating: number
  title?: string | null
  body?: string | null
  verified?: boolean
  approved?: boolean
  createdAt: string
  user?: { firstName?: string | null; lastName?: string | null } | null
  product?: { name: string }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetchReviews()
      const data = res as unknown as { items: Review[] } | Review[]
      setReviews(Array.isArray(data) ? data : (data.items ?? []))
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

  const approve = async (id: string) => {
    try {
      await approveReview(id)
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm("Delete this review?")) return
    try {
      await deleteReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">Moderate product reviews</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{"★".repeat(r.rating)}</span>
                    <span className="text-sm font-medium">{r.title ?? "—"}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.user?.firstName ?? "Customer"} {r.user?.lastName ?? ""} · {r.product?.name ?? "—"} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {r.body && <p className="mt-2 text-sm text-foreground">{r.body}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={(r.approved ?? r.verified) ? "success" : "warning"}>
                    {r.approved ?? r.verified ? "Approved" : "Pending"}
                  </Badge>
                  {!r.approved && (
                    <Button size="sm" variant="outline" onClick={() => approve(r.id)}>
                      Approve
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}