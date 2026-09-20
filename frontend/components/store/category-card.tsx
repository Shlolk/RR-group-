import Image from "next/image"
import Link from "next/link"
import type { Category } from "@/lib/types"

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop/categories/${category.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl bg-accent/50">
        <Image
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          width={64}
          height={64}
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div>
        <p className="text-sm font-semibold leading-tight text-foreground">{category.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{category.productCount} products</p>
      </div>
    </Link>
  )
}
