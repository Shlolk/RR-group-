"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import type { Product } from "@/lib/types"
import { categories as mockCategories } from "@/lib/mock-data"
import { ProductGrid } from "@/components/store/product-grid"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/components/store/store-provider"
import { cn } from "@/lib/utils"

type SortKey = "popular" | "new" | "price-asc" | "price-desc" | "rating" | "discount"

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest discount" },
]

const priceBands = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹15,000", min: 5000, max: 15000 },
  { label: "₹15,000 – ₹40,000", min: 15000, max: 40000 },
  { label: "Over ₹40,000", min: 40000, max: Infinity },
]

export function ProductsBrowser({
  products,
  categories,
  initialSort = "popular",
  initialCategory,
  heading = "All products",
}: {
  products: Product[]
  categories?: Array<{ id?: string; slug: string; name: string }>
  initialSort?: SortKey
  initialCategory?: string
  heading?: string
}) {
  const displayCategories =
    categories && categories.length ? categories : mockCategories
  const [sort, setSort] = useState<SortKey>(initialSort)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  )
  const [selectedBands, setSelectedBands] = useState<number[]>([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = [...products]
    if (selectedCategories.length) {
      list = list.filter((p) => selectedCategories.includes(p.categorySlug))
    }
    if (selectedBands.length) {
      list = list.filter((p) =>
        selectedBands.some((i) => p.price >= priceBands[i].min && p.price < priceBands[i].max),
      )
    }
    if (inStockOnly) list = list.filter((p) => p.stockStatus !== "out-of-stock")
    if (minRating) list = list.filter((p) => p.rating >= minRating)

    switch (sort) {
      case "new":
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        break
      case "price-asc":
        list.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        list.sort((a, b) => b.price - a.price)
        break
      case "rating":
        list.sort((a, b) => b.rating - a.rating)
        break
      case "discount":
        list.sort(
          (a, b) =>
            (b.originalPrice - b.price) / b.originalPrice - (a.originalPrice - a.price) / a.originalPrice,
        )
        break
      default:
        list.sort((a, b) => b.popularity - a.popularity)
    }
    return list
  }, [products, selectedCategories, selectedBands, inStockOnly, minRating, sort])

  const toggle = <T,>(value: T, list: T[], setter: (v: T[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const activeFilterCount =
    selectedCategories.length + selectedBands.length + (inStockOnly ? 1 : 0) + (minRating ? 1 : 0)

  const clearAll = () => {
    setSelectedCategories([])
    setSelectedBands([])
    setInStockOnly(false)
    setMinRating(0)
  }

  const filterPanel = (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Category</h3>
          {activeFilterCount > 0 && (
            <button onClick={clearAll} className="text-xs font-medium text-primary hover:underline">
              Clear all
            </button>
          )}
        </div>
        <div className="space-y-2">
          {displayCategories.map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(c.slug)}
                onChange={() => toggle(c.slug, selectedCategories, setSelectedCategories)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-muted-foreground">{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Price</h3>
        <div className="space-y-2">
          {priceBands.map((band, i) => (
            <label key={band.label} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={selectedBands.includes(i)}
                onChange={() => toggle(i, selectedBands, setSelectedBands)}
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-muted-foreground">{band.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Rating</h3>
        <div className="space-y-2">
          {[4, 3].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(r)}
                className="size-4 border-border text-primary focus:ring-primary"
              />
              <span className="text-muted-foreground">{r} stars & up</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="radio"
              name="rating"
              checked={minRating === 0}
              onChange={() => setMinRating(0)}
              className="size-4 border-border text-primary focus:ring-primary"
            />
            <span className="text-muted-foreground">Any rating</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Availability</h3>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="size-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-muted-foreground">In stock only</span>
        </label>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">{heading}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{filtered.length} products</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">{filterPanel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-muted-foreground">
                Sort by
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length ? (
            <ProductGrid products={filtered} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <p className="text-sm text-muted-foreground">No products match your filters.</p>
              <Button variant="outline" className="mt-4" onClick={clearAll}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-background p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg hover:bg-accent"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>
            {filterPanel}
            <Button className="mt-8 w-full" onClick={() => setMobileFiltersOpen(false)}>
              Show {filtered.length} results
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Kept for potential external use of formatted band labels.
export { formatPrice }
