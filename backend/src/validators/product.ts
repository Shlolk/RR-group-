import { z } from "zod"

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  shortDescription: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().optional().nullable(),
  brand: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().positive("Price must be positive"),
  originalPrice: z.coerce.number().positive().optional().nullable(),
  costPrice: z.coerce.number().positive().optional().nullable(),
  taxRate: z.coerce.number().default(18),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isDigital: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
})

export const productUpdateSchema = productCreateSchema.partial()

export const inventoryAdustmentSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUST", "RESERVE", "RELEASE"]).default("ADJUST"),
  quantity: z.coerce.number().int(),
  note: z.string().optional(),
  reference: z.string().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  active: z.boolean().default(true),
  order: z.coerce.number().default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  parentId: z.string().optional().nullable(),
})

export const couponSchema = z.object({
  code: z.string().min(3).max(30),
  type: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  value: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().optional().nullable(),
  maxDiscount: z.coerce.number().optional().nullable(),
  usageLimit: z.coerce.number().int().optional().nullable(),
  perUserLimit: z.coerce.number().int().default(1),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
})