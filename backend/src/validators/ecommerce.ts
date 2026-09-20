import { z } from "zod"

export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).max(99),
})

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
})

export const checkoutSchema = z.object({
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  shippingAddress: z
    .object({
      label: z.string().default("Home"),
      fullName: z.string().min(1),
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(3),
      country: z.string().default("India"),
      phone: z.string().optional(),
    })
    .optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.string().default("razorpay"),
  notes: z.string().optional(),
})

export const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1),
  orderId: z.string().min(1),
  signature: z.string().min(1),
})

export const addReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
  orderId: z.string().optional(),
})