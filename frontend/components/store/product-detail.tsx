"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RatingStars } from "@/components/store/rating-stars"
import { useStore, formatPrice } from "@/components/store/store-provider"
import { cn } from "@/lib/utils"

const tabs = ["Description", "Specifications", "Reviews"] as const
type Tab = (typeof tabs)[number]

export function ProductDetail({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<Tab>("Description")
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants?.[0]?.options.find((o) => o.available)?.label,
  )
  const selectedVariantId = useMemo(
    () => product.variants?.flatMap((g) => g.options).find((o) => o.label === selectedVariant)?.id,
    [product.variants, selectedVariant],
  )
  const wished = isInWishlist(product.id)
  const outOfStock = product.stockStatus === "out-of-stock"
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/shop/categories/${product.categorySlug}`} className="hover:text-foreground">
          {product.category}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-accent/30">
            {product.badge && (
              <Badge className="absolute left-4 top-4 z-10">
                {product.badge === "sale" ? `${discount}% OFF` : product.badge}
              </Badge>
            )}
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-8"
              priority
            />
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium text-primary">{product.brand}</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <RatingStars rating={product.rating} />
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviewCount} reviews)
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">SKU {product.sku}</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-3xl font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="mb-1 text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="mb-1 text-sm font-semibold text-success">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="mt-4 text-muted-foreground">{product.shortDescription}</p>

          {/* Stock */}
          <div className="mt-5">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                Out of stock
              </span>
            ) : product.stockStatus === "low-stock" ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-warning">
                Only {product.stock} left in stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <Check className="size-4" /> In stock
              </span>
            )}
          </div>

          {/* Variants */}
          {product.variants?.map((group) => (
            <div key={group.name} className="mt-6">
              <p className="mb-2 text-sm font-semibold text-foreground">{group.name}</p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => (
                  <button
                    key={option.id}
                    disabled={!option.available}
                    onClick={() => setSelectedVariant(option.label)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      selectedVariant === option.label
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:border-primary/40",
                      !option.available && "cursor-not-allowed opacity-40 line-through",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex size-11 items-center justify-center rounded-l-lg text-foreground hover:bg-accent disabled:opacity-40"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                className="flex size-11 items-center justify-center rounded-r-lg text-foreground hover:bg-accent"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="h-11 flex-1"
              disabled={outOfStock}
              onClick={() => addToCart(product, quantity, selectedVariantId)}
            >
              <ShoppingCart className="size-4" />
              {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className={cn("h-11", wished && "border-primary text-primary")}
              onClick={() => toggleWishlist(product)}
              aria-label="Add to wishlist"
            >
              <Heart className={cn("size-4", wished && "fill-primary")} />
            </Button>
          </div>

          {/* Trust */}
          <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
            {[
              { icon: Truck, label: "Free deployment" },
              { icon: ShieldCheck, label: "2-year warranty" },
              { icon: RotateCcw, label: "30-day returns" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <item.icon className="size-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex gap-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
              {tab === "Reviews" && ` (${product.reviewCount})`}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === "Description" && (
            <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
              <p>{product.description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Specifications" && (
            <div className="max-w-2xl overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr key={spec.label} className={i % 2 ? "bg-card" : "bg-accent/30"}>
                      <td className="w-1/3 px-5 py-3 font-medium text-foreground">{spec.label}</td>
                      <td className="px-5 py-3 text-muted-foreground">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-card p-6">
                <div className="text-center">
                  <p className="font-display text-4xl font-bold text-foreground">{product.rating}</p>
                  <RatingStars rating={product.rating} className="mt-1 justify-center" />
                  <p className="mt-1 text-xs text-muted-foreground">{product.reviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-6 text-muted-foreground">{star}★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {product.reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-6 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {review.avatarInitials}
                    </span>
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        {review.author}
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                            <Check className="size-3" /> Verified
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} className="mt-3" />
                  <p className="mt-2 text-sm font-semibold text-foreground">{review.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
