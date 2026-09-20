import type { NextFunction, Request, Response } from "express"
import { success, paginate, AppError } from "@/utils/api"
import { COLLECTIONS, findById, findMany, remove, update } from "@/services/db/firestore"

type Row = Record<string, unknown> & { id: string }

export async function listReviewsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, take, page, perPage } = paginate(Number(req.query.page ?? 1), Number(req.query.perPage ?? 20))
    const { status } = req.query

    const rows = await findMany<Row>(COLLECTIONS.reviews, {
      orderBy: { field: "createdAt", dir: "desc" },
      limit: 500,
    })
    const matching = status ? rows.filter((r) => r.status === status) : rows
    const total = matching.length
    const pageItems = matching.slice(skip, skip + take)

    const [products, users] = await Promise.all([
      findMany<Row>(COLLECTIONS.products, { limit: 1000 }),
      findMany<Row>(COLLECTIONS.users, { limit: 500 }),
    ])
    const items = pageItems.map((r) => {
      const product = products.find((p) => p.id === String(r.productId))
      const user = users.find((u) => u.id === String(r.userId))
      const images = Array.isArray(product?.images) ? (product.images as { url?: string }[]) : []
      return {
        ...r,
        product: product
          ? { id: product.id, name: product.name, slug: product.slug, images: images.slice(0, 1).map((img) => ({ url: img.url })) }
          : null,
        user: user ? { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
      }
    })
    return success(res, {
      items,
      pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
    })
  } catch (err) {
    next(err)
  }
}

export async function approveReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await findById<Row>(COLLECTIONS.reviews, req.params.id)
    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Review not found")
    }
    await update(COLLECTIONS.reviews, req.params.id, { status: "APPROVED", verified: true })
    const review = (await findById<Row>(COLLECTIONS.reviews, req.params.id)) ?? { ...existing, status: "APPROVED", verified: true }
    await recalcProductRating(String(existing.productId))
    return success(res, review, "Review approved")
  } catch (err) {
    next(err)
  }
}

export async function deleteReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await findById<Row>(COLLECTIONS.reviews, req.params.id)
    await remove(COLLECTIONS.reviews, req.params.id)
    if (review) {
      await recalcProductRating(String(review.productId))
    }
    return success(res, null, "Review deleted")
  } catch (err) {
    next(err)
  }
}

async function recalcProductRating(productId: string) {
  const all = await findMany<Row>(COLLECTIONS.reviews, {
    where: [{ field: "productId", op: "==", value: productId }],
    limit: 500,
  })
  const reviews = all.filter((r) => r.status === "APPROVED")
  if (!reviews.length) {
    await update(COLLECTIONS.products, productId, { rating: 0, reviewCount: 0 })
    return
  }
  const avg = reviews.reduce((sum, r) => sum + Number(r.rating ?? 0), 0) / reviews.length
  await update(COLLECTIONS.products, productId, { rating: avg, reviewCount: reviews.length })
}