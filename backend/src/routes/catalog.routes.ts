import { Router } from "express"
import { success, wrap } from "@/utils/api"
import {
  listProducts,
  getProductBySlug,
  getRelatedProducts,
  searchProducts,
  listCategories,
} from "@/services/ecommerce/product.service"

const router = Router()

router.get(
  "/products",
  wrap(async (req, res) => {
    const data = await listProducts({
      page: Number(req.query.page) || 1,
      perPage: Number(req.query.perPage) || 20,
      category: (req.query.category as string) || undefined,
      search: (req.query.search as string) || undefined,
      sort: (req.query.sort as string) || undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      inStock: req.query.inStock === "true",
      featured: req.query.featured === "true",
    })
    return success(res, data, "Products fetched")
  }),
)

router.get(
  "/products/search",
  wrap(async (req, res) => {
    const results = await searchProducts((req.query.q as string) ?? "", 10)
    return success(res, { items: results }, "Search results")
  }),
)

router.get(
  "/categories",
  wrap(async (_req, res) => {
    const categories = await listCategories()
    return success(res, { items: categories }, "Categories fetched")
  }),
)

router.get(
  "/products/:slug",
  wrap(async (req, res) => {
    const product = await getProductBySlug(req.params.slug)
    const related = await getRelatedProducts(product.id, product.categoryId)
    return success(res, { product, related }, "Product fetched")
  }),
)

export default router