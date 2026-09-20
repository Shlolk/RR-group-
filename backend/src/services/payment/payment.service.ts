import { AppError } from "@/utils/api"
import { env } from "@/config/env"
import { createHmac } from "crypto"
import { getRazorpay, getStripe } from "@/config/payment"
import { createInvoiceForOrder } from "@/services/ecommerce/order.service"
import { sendPaymentSuccessEmail, sendOrderConfirmationEmail } from "@/emails/templates"
import {
  COLLECTIONS,
  create,
  findById,
  findMany,
  update,
} from "@/services/db/firestore"

function createHmacSha(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex")
}

type PayRow = Record<string, unknown> & { id: string }

async function findPaymentByProvider(providerOrderId?: string | null, providerPaymentId?: string | null): Promise<PayRow | null> {
  const docs = (await findMany<PayRow>(COLLECTIONS.payments, { limit: 500 }))
  return (
    docs.find(
      (p) =>
        (providerOrderId && p.providerOrderId === providerOrderId) ||
        (providerPaymentId && p.providerPaymentId === providerPaymentId),
    ) ?? null
  )
}

async function ensureOrderNumberOnPayment(payment: PayRow) {
  if (payment.orderNumber) return payment
  const order = payment.orderId ? await findById(COLLECTIONS.orders, String(payment.orderId)) : null
  if (order?.orderNumber) {
    await update(COLLECTIONS.payments, payment.id, { orderNumber: order.orderNumber })
    return { ...payment, orderNumber: order.orderNumber }
  }
  return payment
}

export async function createRazorpayOrder(orderId: string, userId: string) {
  const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, orderId)
  if (!order || order.userId !== userId) {
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }

  const allPayments = await findMany(COLLECTIONS.payments, { limit: 500 })
  const existingPayment = allPayments.find((p) => p.orderId === orderId && p.status === "PENDING" && p.provider === "razorpay")
  if (existingPayment?.providerOrderId) {
    return { order: { id: order.id, orderNumber: order.orderNumber, amount: Number(order.total), currency: order.currency, receipt: order.orderNumber }, payment: existingPayment, keyId: env.RAZORPAY_KEY_ID }
  }

  const razorpay = getRazorpay()
  const amountInPaise = Math.round(Number(order.total) * 100)

  const rzpOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: order.currency as string,
    receipt: order.orderNumber as string,
    notes: {
      orderId: order.id,
      userId,
    },
  })

  const payment = await create(COLLECTIONS.payments, {
    userId,
    orderId: order.id,
    orderNumber: order.orderNumber ?? null,
    amount: order.total ?? 0,
    currency: order.currency ?? "INR",
    method: "RAZORPAY",
    provider: "razorpay",
    providerOrderId: rzpOrder.id,
    providerPaymentId: null,
    status: "PENDING",
    failureReason: null,
    idempotencyKey: `rzp-order-${orderId}`,
  })

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      currency: order.currency,
      receipt: order.orderNumber,
    },
    payment,
    keyId: env.RAZORPAY_KEY_ID,
  }
}

async function markPaid(orderId?: string | null) {
  if (!orderId) return
  const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, orderId)
  if (!order) return
  if (order.paymentStatus === "PAID") {
    await ensureOrderNumberOnPayment({ id: orderId } as Record<string, unknown> & { id: string })
    return order
  }

  const history = Array.isArray(order.statusHistory) ? (order.statusHistory as { id: string; status: string; note?: string | null; createdAt: string }[]) : []
  await update(COLLECTIONS.orders, order.id, {
    status: "CONFIRMED",
    paymentStatus: "PAID",
    statusHistory: [...history, { id: `h${history.length + 1}`, status: "CONFIRMED", note: "Payment confirmed via webhook", createdAt: new Date().toISOString() }],
  })
  const updated = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, order.id)

  await createInvoiceForOrder(order.id)

  const user = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, String(order.userId ?? ""))
  if (user?.email && order.orderNumber) {
    sendPaymentSuccessEmail(String(user.email), String(order.orderNumber), `₹${Number(order.total)}`)
  }

  return updated ?? order
}

export async function verifyRazorpayPayment(
  userId: string,
  input: { paymentId: string; orderId: string; signature: string },
) {
  const docs = (await findMany<PayRow>(COLLECTIONS.payments, { limit: 500 }))
  const payment = docs.find((p) => p.providerOrderId === input.orderId && p.userId === userId) ?? null
  if (!payment) {
    throw new AppError(400, "PAYMENT_NOT_FOUND", "Payment not found")
  }

  const expectedSignature = createHmacSha(`${input.orderId}|${input.paymentId}`, env.RAZORPAY_KEY_SECRET)
  if (expectedSignature !== input.signature) {
    throw new AppError(400, "INVALID_SIGNATURE", "Payment signature verification failed")
  }

  await update(COLLECTIONS.payments, payment.id, {
    providerPaymentId: input.paymentId,
    status: "PAID",
  })

  const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, String(payment.orderId ?? ""))
  if (!order) {
    throw new AppError(400, "PAYMENT_NOT_FOUND", "Payment order not found")
  }
  const history = Array.isArray(order.statusHistory) ? (order.statusHistory as { id: string; status: string; note?: string | null; createdAt: string }[]) : []
  await update(COLLECTIONS.orders, order.id, {
    status: "CONFIRMED",
    paymentStatus: "PAID",
    statusHistory: [...history, { id: `h${history.length + 1}`, status: "CONFIRMED", note: "Payment verified", createdAt: new Date().toISOString() }],
  })
  const updatedOrder = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, order.id)

  await createInvoiceForOrder(order.id)

  const user = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.users, userId)
  if (user?.email && order.orderNumber) {
    sendPaymentSuccessEmail(String(user.email), String(order.orderNumber), `₹${Number(order.total)}`)
    const items = Array.isArray(order.items) ? (order.items as { name: string; quantity: number }[]) : []
    sendOrderConfirmationEmail(
      String(user.email),
      String(order.orderNumber),
      `₹${Number(order.total)}`,
      items.map((i) => `${i.name} × ${i.quantity}`),
    )
  }

  return { payment: { ...payment, status: "PAID" }, order: updatedOrder ?? order }
}

export async function handleRazorpayWebhook(event: string, payload: Record<string, unknown>) {
  if (event === "payment.captured" || event === "payment.authorized") {
    const razorpayPayment = payload.payment as { id?: string; order_id?: string; amount?: number; status?: string }

    let payment = await findPaymentByProvider(razorpayPayment.order_id, razorpayPayment.id)
    if (!payment) {
      const rzp = getRazorpay()
      const rzpOrder = razorpayPayment.order_id ? await rzp.orders.fetch(razorpayPayment.order_id) : null
      const notes = rzpOrder?.notes as { orderId?: string; userId?: string } | undefined
      if (!notes?.orderId) {
        throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found for webhook")
      }
      const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, notes.orderId)
      payment = await create(COLLECTIONS.payments, {
        userId: notes.userId ?? "",
        orderId: notes.orderId,
        orderNumber: order?.orderNumber ?? null,
        amount: 0,
        currency: "INR",
        method: "RAZORPAY",
        provider: "razorpay",
        providerOrderId: razorpayPayment.order_id ?? null,
        providerPaymentId: razorpayPayment.id ?? null,
        status: "PAID",
        idempotencyKey: `rzp-webhook-${razorpayPayment.id ?? razorpayPayment.order_id}`,
      })
      await markPaid(payment.orderId as string | undefined)
      return payment
    }

    if (payment.status === "PAID") {
      return payment
    }

    await update(COLLECTIONS.payments, payment.id, {
      providerPaymentId: razorpayPayment.id ?? null,
      status: "PAID",
    })
    await markPaid(payment.orderId as string | undefined)
    return payment
  }

  if (event === "payment.failed") {
    const razorpayPayment = payload.payment as { id?: string; order_id?: string; error_description?: string }
    const payment = await findPaymentByProvider(razorpayPayment.order_id, razorpayPayment.id)
    if (payment) {
      await update(COLLECTIONS.payments, payment.id, {
        status: "FAILED",
        failureReason: razorpayPayment.error_description ?? null,
      })
      if (payment.orderId) {
        await update(COLLECTIONS.orders, String(payment.orderId), {
          paymentStatus: "FAILED",
          status: "FAILED",
        })
      }
    }
    return { received: true }
  }

  return { received: true }
}

export async function refundPayment(paymentId: string, amount?: number, notes?: string) {
  const payment = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.payments, paymentId)
  if (!payment) {
    throw new AppError(404, "NOT_FOUND", "Payment not found")
  }
  if (payment.status !== "PAID" || !payment.providerPaymentId) {
    throw new AppError(400, "NOT_PAID", "Payment is not paid or has no provider ID")
  }

  const razorpay = getRazorpay()
  const refundAmount = amount ? Math.round(amount * 100) : undefined

  const rzpRefund = (await razorpay.payments.refund(
    String(payment.providerPaymentId),
    { amount: refundAmount, notes: notes as never },
  )) as unknown as { id: string; status: string }

  const refund = await create(COLLECTIONS.refunds, {
    paymentId: payment.id,
    orderId: payment.orderId ?? null,
    amount: amount ?? payment.amount ?? 0,
    reason: notes ?? null,
    initiatedById: null,
    providerRefundId: rzpRefund.id,
    status: rzpRefund.status === "processed" ? "COMPLETED" : "PENDING",
  })

  if (rzpRefund.status === "processed" && payment.orderId) {
    await update(COLLECTIONS.orders, String(payment.orderId), {
      status: "REFUNDED",
      paymentStatus: "REFUNDED",
    })
  }

  return refund
}

export async function syncRefundStatus() {
  const pending = (await findMany(COLLECTIONS.refunds, { limit: 500 })).filter((r) => r.status === "PENDING" && r.providerRefundId)

  const razorpay = getRazorpay()
  for (const refund of pending) {
    try {
      const rzpRefund = await razorpay.refunds.fetch(String(refund.providerRefundId))
      if (rzpRefund.status === "processed") {
        await update(COLLECTIONS.refunds, String(refund.id), { status: "COMPLETED" })
        if (refund.orderId) {
          await update(COLLECTIONS.orders, String(refund.orderId), {
            status: "REFUNDED",
            paymentStatus: "REFUNDED",
          })
        }
      }
    } catch (err) {
      console.error("Refund sync failed:", err)
    }
  }
}

export async function createStripePaymentIntent(orderId: string, userId: string) {
  const stripe = getStripe()
  const order = await findById<Record<string, unknown> & { id: string }>(COLLECTIONS.orders, orderId)
  if (!order || order.userId !== userId) {
    throw new AppError(404, "NOT_FOUND", "Order not found")
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(Number(order.total) * 100),
    currency: String(order.currency ?? "INR").toLowerCase(),
    metadata: { orderId: order.id },
  })

  const payment = await create(COLLECTIONS.payments, {
    userId,
    orderId: order.id,
    orderNumber: order.orderNumber ?? null,
    amount: order.total ?? 0,
    currency: order.currency ?? "INR",
    method: "STRIPE",
    provider: "stripe",
    providerOrderId: intent.id,
    providerPaymentId: null,
    status: "PENDING",
    failureReason: null,
    idempotencyKey: `stripe-${order.id}`,
  })

  return { clientSecret: intent.client_secret, payment, publishableKey: env.STRIPE_PUBLIC_KEY }
}

export async function handleStripeWebhook(event: "payment_intent.succeeded" | "payment_intent.payment_failed", payload: { data?: { object?: Record<string, unknown> } }) {
  const intent = payload.data?.object as Record<string, unknown> | undefined
  if (!intent) return { received: true }

  const payment = await findPaymentByProvider(intent.id as string | null, null)

  if (event === "payment_intent.succeeded" && payment) {
    await update(COLLECTIONS.payments, payment.id, {
      status: "PAID",
      providerPaymentId: (((intent.payment as Record<string, unknown> | undefined)?.latest_charge) ??
        intent.latest_charge ??
        null) as string | null,
    })
    await markPaid(payment.orderId as string | undefined)
  }

  if (event === "payment_intent.payment_failed" && payment) {
    await update(COLLECTIONS.payments, payment.id, {
      status: "FAILED",
      failureReason: ((intent.last_payment_error as Record<string, unknown> | undefined)?.message ?? null) as string | null,
    })
  }

  return { received: true }
}