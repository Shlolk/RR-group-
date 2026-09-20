import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductsBrowser } from "@/components/store/products-browser"
import { loadCategories, loadCategory } from "@/lib/data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await loadCategory(slug)
  if (!result) return { title: "Category not found — RR GROUP Store" }
  return { title: `${result.category.name} — RR GROUP Store`, description: result.category.description }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [result, categories] = await Promise.all([loadCategory(slug), loadCategories()])
  if (!result) notFound()

  const { category, products } = result

  return (
    <div>
      <div className="border-b border-border bg-accent/30">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
        </div>
      </div>
      <ProductsBrowser
        products={products}
        categories={categories}
        heading={category.name}
        initialCategory={slug}
      />
    </div>
  )
}