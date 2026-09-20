import type { Metadata } from "next"
import Link from "next/link"
import { Search } from "lucide-react"
import { ProductGrid } from "@/components/store/product-grid"
import { loadProducts } from "@/lib/data"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Search Results — RR GROUP Store",
  description: "Search products in the RR GROUP store.",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""
  const products = query ? await loadProducts({ search: query }) : await loadProducts()

  const searched = query
    ? products.filter((p) =>
        `${p.name} ${p.description ?? ""} ${p.tags?.join(" ") ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : products

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          {query ? `Results for “${query}”` : "Search products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {searched.length} product{searched.length === 1 ? "" : "s"} found
        </p>
      </div>

      {searched.length ? (
        <ProductGrid products={searched} />
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <Search className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No products match your search. Try a different keyword.
          </p>
          <Link href="/shop/products" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
            Browse all products
          </Link>
        </div>
      )}
    </div>
  )
}