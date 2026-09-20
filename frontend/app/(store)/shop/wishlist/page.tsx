"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { ProductGrid } from "@/components/store/product-grid"
import { buttonVariants } from "@/components/ui/button"
import { useStore } from "@/components/store/store-provider"
import { loadProducts } from "@/lib/data"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function WishlistPage() {
  const { wishlist } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    loadProducts()
      .then((all) => {
        if (!active) return
        setProducts(all.filter((p) => wishlist.includes(p.id)))
      })
      .catch(() => {
        if (active) setProducts([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [wishlist])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Your Wishlist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} item{products.length === 1 ? "" : "s"} saved
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">Loading wishlist…</p>
        </div>
      ) : products.length ? (
        <ProductGrid products={products} />
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
          <Heart className="size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {wishlist.length === 0
              ? "Your wishlist is empty. Save products you like for later."
              : "No products found for your wishlist. They may be unavailable."}
          </p>
          <Link href="/shop/products" className={cn(buttonVariants(), "mt-4")}>
            <ShoppingBag className="size-4" /> Shop products
          </Link>
        </div>
      )}
    </div>
  )
}