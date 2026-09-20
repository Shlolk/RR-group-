import type { NextFunction, Request, Response } from "express"
import { success } from "@/utils/api"
import * as orderService from "@/services/ecommerce/order.service"
import { COLLECTIONS, findById, findMany } from "@/services/db/firestore"

export async function getAllOrdersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await orderService.getAllOrders(req.query as never)
    return success(res, result, "Orders fetched")
  } catch (err) {
    next(err)
  }
}

export async function getOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(req.params.id, undefined, true)
    return success(res, order, "Order fetched")
  } catch (err) {
    next(err)
  }
}

export async function updateOrderStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, note } = req.body
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
      "REFUNDED",
      "FAILED",
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status", code: "VALIDATION_ERROR" })
    }
    const order = await orderService.updateOrderStatus(req.params.id, status, note, req.user!.id)
    return success(res, order, "Order status updated")
  } catch (err) {
    next(err)
  }
}

export async function createRefundHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { amount, reason } = req.body
    const refund = await orderService.initiateRefund(req.params.id, Number(amount), reason, req.user!.id)
    return success(res, refund, "Refund initiated", 201)
  } catch (err) {
    next(err)
  }
}

export async function listRefundsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const docs = (await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.refunds, {
      orderBy: { field: "createdAt", dir: "desc" },
      limit: 500,
    }))
    const refunds: Record<string, unknown>[] = []
    for (const refund of docs) {
      const payment = refund.paymentId
        ? await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.payments, String(refund.paymentId))
        : null
      let order: (Record<string, unknown> & { id: string }) | null = null
      let user: Record<string, unknown> | null = null
      if (payment?.orderId) {
        order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, String(payment.orderId))
      }
      if (order?.userId) {
        const u = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, String(order.userId))
        if (u) {
          user = { email: u.email ?? null, firstName: u.firstName ?? null, lastName: u.lastName ?? null }
        }
      }
      refunds.push({
        ...refund,
        payment: payment ? { ...payment, order: order ? { ...order, user } : null } : null,
      })
    }
    return success(res, refunds, "Refunds fetched")
  } catch (err) {
    next(err)
  }
}

export async function listPaymentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const docs = (await findMany<Record<string, unknown> & { id: string }>(COLLECTIONS.payments, {
      orderBy: { field: "createdAt", dir: "desc" },
      limit: 100,
    }))
    const payments: Record<string, unknown>[] = []
    for (const payment of docs) {
      let user: Record<string, unknown> | null = null
      if (payment.userId) {
        const u = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, String(payment.userId))
        if (u) {
          user = { email: u.email ?? null, firstName: u.firstName ?? null, lastName: u.lastName ?? null }
        }
      }
      let order: Record<string, unknown> | null = null
      if (payment.orderId) {
        const o = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, String(payment.orderId))
        if (o) {
          order = { orderNumber: o.orderNumber ?? null }
        }
      }
      payments.push({ ...payment, user, order })
    }
    return success(res, payments, "Payments fetched")
  } catch (err) {
    next(err)
  }
}

export async function listInvoicesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await orderService.listInvoices(undefined, true, req.query as never)
    return success(res, result, "Invoices fetched")
  } catch (err) {
    next(err)
  }
}

export async function createInvoiceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await orderService.createManualInvoice(req.body)
    return success(res, invoice, "Invoice created", 201)
  } catch (err) {
    next(err)
  }
}