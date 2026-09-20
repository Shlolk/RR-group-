import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { loadCategories } from "@/lib/data"

export const metadata: Metadata = {
  title: "Categories — RR GROUP Store",
  description: "Browse all product categories at the RR GROUP Store.",
}

export default async function CategoriesPage() {
  const categories = await loadCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Shop by category
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Everything your business needs, organized into curated collections.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/shop/categories/${category.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-accent/40">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="font-display text-lg font-bold text-foreground">{category.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{category.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {category.productCount} products
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Browse
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}