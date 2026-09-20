"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { Eye, Heart, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RatingStars } from "@/components/store/rating-stars"
import { formatPrice, useStore } from "@/components/store/store-provider"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

function StockLabel({ status }: { status: Product["stockStatus"] }) {
  if (status === "out-of-stock")
    return <Badge variant="destructive">Out of stock</Badge>
  if (status === "low-stock") return <Badge variant="warning">Low stock</Badge>
  return <Badge variant="success">In stock</Badge>
}

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product
  onQuickView?: (product: Product) => void
}) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore()
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  )
  const wished = isInWishlist(product.id)
  const outOfStock = product.stockStatus === "out-of-stock"

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/shop/products/${product.slug}`} aria-label={product.name}>
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && <Badge>-{discount}%</Badge>}
          {product.badge === "new" && <Badge variant="accent">New</Badge>}
          {product.badge === "bestseller" && <Badge variant="secondary">Bestseller</Badge>}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            onClick={() => toggleWishlist(product)}
            className="bg-background/90 backdrop-blur"
          >
            <Heart className={cn("size-4", wished && "fill-destructive text-destructive")} />
          </Button>
          {onQuickView && (
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Quick view"
              onClick={() => onQuickView(product)}
              className="bg-background/90 backdrop-blur"
            >
              <Eye className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/shop/categories/${product.categorySlug}`}
            className="text-xs font-medium text-muted-foreground hover:text-primary"
          >
            {product.category}
          </Link>
          <StockLabel status={product.stockStatus} />
        </div>

        <Link href={`/shop/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            aria-label={`Add ${product.name} to cart`}
            disabled={outOfStock}
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="size-3.5" />
            Add
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
