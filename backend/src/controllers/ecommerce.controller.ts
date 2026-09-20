import type { NextFunction, Request, Response } from "express"
import { AppError, success } from "@/utils/api"
import * as cartService from "@/services/ecommerce/cart.service"
import * as orderService from "@/services/ecommerce/order.service"
import * as paymentService from "@/services/payment/payment.service"
import { cartItemSchema, updateCartItemSchema, checkoutSchema, verifyPaymentSchema, addReviewSchema } from "@/validators/ecommerce"
import { COLLECTIONS, create, findById, findMany, setDoc, update, now } from "@/services/db/firestore"
import { orderAudit } from "@/utils/audit"

export async function getCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.getCart(req.user!.id)
    return success(res, cart, "Cart fetched")
  } catch (err) {
    next(err)
  }
}

export async function addToCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = cartItemSchema.parse(req.body)
    const cart = await cartService.addToCart(req.user!.id, input)
    return success(res, cart, "Item added to cart")
  } catch (err) {
    next(err)
  }
}

export async function updateCartItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateCartItemSchema.parse(req.body)
    const cart = await cartService.updateCartItem(req.user!.id, req.params.itemId, input.quantity)
    return success(res, cart, "Cart updated")
  } catch (err) {
    next(err)
  }
}

export async function removeCartItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.removeCartItem(req.user!.id, req.params.itemId)
    return success(res, cart, "Item removed from cart")
  } catch (err) {
    next(err)
  }
}

export async function clearCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.clearCart(req.user!.id)
    return success(res, cart, "Cart cleared")
  } catch (err) {
    next(err)
  }
}

export async function checkoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = checkoutSchema.parse(req.body)
    const order = await orderService.createOrderFromCart(req.user!.id, input)
    return success(res, order, "Order created", 201)
  } catch (err) {
    next(err)
  }
}

export async function createPaymentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.orderId
    const result = await paymentService.createRazorpayOrder(orderId, req.user!.id)
    return success(res, result, "Payment order created")
  } catch (err) {
    next(err)
  }
}

export async function verifyPaymentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = verifyPaymentSchema.parse(req.body)
    const result = await paymentService.verifyRazorpayPayment(req.user!.id, input)
    orderAudit(req.user!.id, "PAYMENT_VERIFIED", result.order.id)
    return success(res, result, "Payment verified")
  } catch (err) {
    next(err)
  }
}

export async function getOrdersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await orderService.getOrders(req.user!.id, req.query as never)
    return success(res, result, "Orders fetched")
  } catch (err) {
    next(err)
  }
}

export async function getOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.id)
    return success(res, order, "Order fetched")
  } catch (err) {
    next(err)
  }
}

export async function getOrderByNumberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderByNumber(req.params.orderNumber, req.user!.id)
    return success(res, order, "Order fetched")
  } catch (err) {
    next(err)
  }
}

export async function cancelOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const reason = (req.body?.reason as string) || undefined
    const order = await orderService.cancelOrder(req.params.id, req.user!.id, reason)
    orderAudit(req.user!.id, "ORDER_CANCELLED", order.id, { reason })
    return success(res, order, "Order cancelled")
  } catch (err) {
    next(err)
  }
}

export async function addReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = addReviewSchema.parse(req.body)
    const product = await findById(COLLECTIONS.products, input.productId)
    if (!product) {
      throw new AppError(404, "NOT_FOUND", "Product not found")
    }

    const allForProduct = await findMany(COLLECTIONS.reviews, {
      where: [{ field: "productId", op: "==", value: input.productId }],
      limit: 100,
    })
    const existing = allForProduct.filter((r) => String((r as Record<string, unknown>).userId) === req.user!.id).slice(0, 1)
    const data = {
      productId: input.productId,
      userId: req.user!.id,
      orderId: input.orderId ?? null,
      rating: input.rating,
      title: input.title ?? null,
      body: input.body ?? null,
      status: "PENDING",
      verified: false,
    }
    let review: { id: string }
    if (existing.length) {
      const reviewId = String(existing[0].id)
      await update(COLLECTIONS.reviews, reviewId, data)
      review = { id: reviewId }
    } else {
      review = await create(COLLECTIONS.reviews, data)
    }
    return success(res, { id: review.id, ...data }, "Review submitted", 201)
  } catch (err) {
    next(err)
  }
}

async function hydrateWishlist(userId: string) {
  const doc = await findById<{ id: string; userId?: string; createdAt?: string; items?: { id: string; productId: string; createdAt: string }[] }>(
    COLLECTIONS.wishlists,
    userId,
  )
  const items: { id: string; productId: string; createdAt: string; product: Record<string, unknown> | null }[] = []
  if (doc?.items) {
    for (const item of doc.items) {
      const product = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.products, item.productId)
      if (!product) continue
      const images = Array.isArray(product.images) ? (product.images as { id?: string; url?: string; alt?: string | null; position?: number }[]) : []
      const image = images[0] ?? null
      items.push({
        id: item.id ?? item.productId,
        productId: item.productId,
        createdAt: item.createdAt ?? String(doc.createdAt ?? "") ?? String(now()),
        product: {
          id: String(product.id),
          slug: String(product.slug ?? ""),
          name: String(product.name ?? ""),
          price: product.price ?? 0,
          originalPrice: product.originalPrice ?? null,
          stock: product.stock ?? 0,
          isActive: product.isActive !== false,
          images: image ? [image] : [],
        } as Record<string, unknown>,
      })
    }
  }
  return { id: userId, items }
}

export async function getWishlistHandler(req: Request, res: Response, next: NextFunction) {
  try {
    return success(res, await hydrateWishlist(req.user!.id), "Wishlist fetched")
  } catch (err) {
    next(err)
  }
}

export async function toggleWishlistHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params
    const product = await findById(COLLECTIONS.products, productId)
    if (!product) {
      throw new AppError(404, "NOT_FOUND", "Product not found")
    }

    const doc = await findById<{ id: string; items?: { id: string; productId: string; createdAt: string }[] }>(
      COLLECTIONS.wishlists,
      req.user!.id,
    )
    const items = doc?.items ?? []
    const exists = items.find((i) => i.productId === productId)

    if (exists) {
      await setDoc(COLLECTIONS.wishlists, req.user!.id, {
        userId: req.user!.id,
        items: items.filter((i) => i.productId !== productId),
      })
      return success(res, { added: false }, "Removed from wishlist")
    }

    await setDoc(COLLECTIONS.wishlists, req.user!.id, {
      userId: req.user!.id,
      items: [...items, { id: productId, productId, createdAt: now() }],
    })
    return success(res, { added: true }, "Added to wishlist", 201)
  } catch (err) {
    next(err)
  }
}

export async function getInvoicesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await orderService.listInvoices(req.user!.id, false, req.query as never)
    return success(res, result, "Invoices fetched")
  } catch (err) {
    next(err)
  }
}

export async function getInvoiceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await orderService.getInvoiceById(req.params.id, req.user!.id)
    return success(res, invoice, "Invoice fetched")
  } catch (err) {
    next(err)
  }
}

export async function getPaymentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const payments = await findMany(COLLECTIONS.payments, {
      where: [{ field: "userId", op: "==", value: req.user!.id }],
      limit: 500,
    })
    const rows = payments
      .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))
      .map((p) => ({ ...p, order: p.orderId ? { orderNumber: p.orderNumber ?? null } : null }))
    return success(res, rows, "Payments fetched")
  } catch (err) {
    next(err)
  }
}