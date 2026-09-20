import type { NextFunction, Request, Response } from "express"
import { success } from "@/utils/api"
import * as productService from "@/services/ecommerce/product.service"
import { productCreateSchema, productUpdateSchema, inventoryAdustmentSchema, categorySchema, couponSchema } from "@/validators/product"
import { Router } from "express"
import { productAudit, inventoryAudit } from "@/utils/audit"
import { AppError } from "@/utils/api"
import { COLLECTIONS, create, findById, findMany, remove, update } from "@/services/db/firestore"
import { slugify } from "@/utils/slug"

export async function listProductsAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const search = (req.query.search as string | undefined) ?? ""
    const items = await productService.listProducts({ page: 1, perPage: 100, search: search || undefined })
    return success(res, { items: items.items as Record<string, unknown>[], total: items.pagination.total }, "Products fetched")
  } catch (err) {
    next(err)
  }
}

export async function createProductAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = productCreateSchema.parse(req.body)
    const product = await productService.createProduct(input)
    productAudit(req.user!.id, "PRODUCT_CREATE", product.id, { name: product.name as string })
    return success(res, product, "Product created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateProductAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = productUpdateSchema.parse(req.body)
    const product = await productService.updateProduct(req.params.id, input)
    productAudit(req.user!.id, "PRODUCT_UPDATE", product.id, { name: product.name as string })
    return success(res, product, "Product updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteProductAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.deleteProduct(req.params.id)
    productAudit(req.user!.id, "PRODUCT_DELETE", req.params.id)
    return success(res, result, "Product deactivated")
  } catch (err) {
    next(err)
  }
}

export async function adjustInventoryAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = inventoryAdustmentSchema.parse(req.body)
    await productService.adjustInventory(req.params.id, input.type, input.quantity, input.note, input.reference, req.user!.id)
    inventoryAudit(req.user!.id, `INVENTORY_${input.type}`, req.params.id, { quantity: input.quantity })
    return success(res, null, "Inventory updated")
  } catch (err) {
    next(err)
  }
}

export async function listCategoriesAdminHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await productService.listCategories(true)
    return success(res, categories, "Categories fetched")
  } catch (err) {
    next(err)
  }
}

export async function createCategoryAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = categorySchema.parse(req.body)
    const id = input.slug ?? slugify(input.name)
    const existing = await findById(COLLECTIONS.categories, id)
    if (existing) {
      throw new AppError(409, "SLUG_TAKEN", "A category with this slug already exists")
    }
    const category = await create(
      COLLECTIONS.categories,
      { id, ...input, slug: id, parentId: input.parentId ?? null, active: true, order: Number(input.order ?? 0) } as Record<string, unknown>,
    )
    return success(res, category, "Category created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateCategoryAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = categorySchema.partial().parse(req.body)
    await update(COLLECTIONS.categories, req.params.id, input)
    return success(res, { id: req.params.id, ...input }, "Category updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteCategoryAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await update(COLLECTIONS.categories, req.params.id, { active: false })
    return success(res, null, "Category deactivated")
  } catch (err) {
    next(err)
  }
}

export const couponAdminRouter = Router()

couponAdminRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await findMany(COLLECTIONS.coupons, { limit: 500 })
    return success(res, coupons, "Coupons fetched")
  } catch (err) {
    next(err)
  }
})

couponAdminRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = couponSchema.parse(req.body)
    const coupon = await create(COLLECTIONS.coupons, {
      ...input,
      code: input.code.toUpperCase(),
      value: input.value,
      startsAt: input.startsAt ? new Date(input.startsAt).toISOString() : null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt).toISOString() : null,
    })
    return success(res, coupon, "Coupon created", 201)
  } catch (err) {
    next(err)
  }
})

couponAdminRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await update(COLLECTIONS.coupons, req.params.id, req.body as Record<string, unknown>)
    return success(res, { id: req.params.id, ...(req.body as Record<string, unknown>) }, "Coupon updated")
  } catch (err) {
    next(err)
  }
})

couponAdminRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await remove(COLLECTIONS.coupons, req.params.id)
    return success(res, null, "Coupon deleted")
  } catch (err) {
    next(err)
  }
})