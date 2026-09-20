import type { NextFunction, Request, Response } from "express"
import { success } from "@/utils/api"
import * as productService from "@/services/ecommerce/product.service"
import { productCreateSchema, productUpdateSchema, inventoryAdustmentSchema } from "@/validators/product"
import { productAudit, inventoryAudit } from "@/utils/audit"

export async function listProductsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.listProducts(_req.query as never)
    return success(res, result, "Products fetched")
  } catch (err) {
    next(err)
  }
}

export async function getProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductBySlug(req.params.slug)
    return success(res, product, "Product fetched")
  } catch (err) {
    next(err)
  }
}

export async function relatedProductsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProductBySlug(req.params.slug)
    const related = await productService.getRelatedProducts(product.id, product.categoryId)
    return success(res, related, "Related products fetched")
  } catch (err) {
    next(err)
  }
}

export async function searchProductsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string) ?? ""
    const results = await productService.searchProducts(q)
    return success(res, results, "Search results")
  } catch (err) {
    next(err)
  }
}

export async function listCategoriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await productService.listCategories(req.query.all === "true")
    return success(res, categories, "Categories fetched")
  } catch (err) {
    next(err)
  }
}

export async function createProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = productCreateSchema.parse(req.body)
    const product = await productService.createProduct({ ...input, createdById: req.user!.id })
    productAudit(req.user!.id, "PRODUCT_CREATE", product.id, { name: product.name as string })
    return success(res, product, "Product created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = productUpdateSchema.parse(req.body)
    const product = await productService.updateProduct(req.params.id, input)
    productAudit(req.user!.id, "PRODUCT_UPDATE", product.id, { name: product.name as string })
    return success(res, product, "Product updated")
  } catch (err) {
    next(err)
  }
}

export async function deleteProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.deleteProduct(req.params.id)
    productAudit(req.user!.id, "PRODUCT_DEACTIVATE", req.params.id)
    return success(res, result, "Product deactivated")
  } catch (err) {
    next(err)
  }
}

export async function adjustInventoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = inventoryAdustmentSchema.parse(req.body)
    const result = await productService.adjustInventory(
      req.params.id,
      input.type,
      input.quantity,
      input.note,
      input.reference,
      req.user!.id,
    )
    inventoryAudit(req.user!.id, `INVENTORY_${input.type}`, req.params.id, { quantity: input.quantity })
    return success(res, result, "Inventory updated")
  } catch (err) {
    next(err)
  }
}

export async function inventoryListHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.getInventoryList(_req.query as never)
    return success(res, result, "Inventory fetched")
  } catch (err) {
    next(err)
  }
}

export async function inventoryTransactionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.id
    const result = await productService.getInventoryTransactions(productId)
    return success(res, result, "Inventory transactions fetched")
  } catch (err) {
    next(err)
  }
}