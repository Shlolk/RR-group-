import type { Metadata } from "next"
import { ProductsBrowser } from "@/components/store/products-browser"
import { loadCategories, loadProducts } from "@/lib/data"

export const metadata: Metadata = {
  title: "All Products — RR GROUP Store",
  description: "Browse software licenses, hardware, cloud services and marketing tools.",
}

type SortKey = "popular" | "new" | "price-asc" | "price-desc" | "rating" | "discount"
const validSorts: SortKey[] = ["popular", "new", "price-asc", "price-desc", "rating", "discount"]

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; category?: string }>
}) {
  const { sort, category } = await searchParams
  const initialSort = validSorts.includes(sort as SortKey) ? (sort as SortKey) : "popular"

  const [products, categories] = await Promise.all([
    loadProducts({ category, sort: initialSort }),
    loadCategories(),
  ])

  return (
    <ProductsBrowser
      products={products}
      categories={categories}
      initialSort={initialSort}
      initialCategory={category}
    />
  )
}