import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/store/product-detail"
import { SectionHeader } from "@/components/store/section-header"
import { ProductGrid } from "@/components/store/product-grid"
import { loadProduct } from "@/lib/data"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = await loadProduct(slug)
  if (!result) return { title: "Product not found — RR GROUP Store" }
  return {
    title: `${result.product.name} — RR GROUP Store`,
    description: result.product.shortDescription,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await loadProduct(slug)
  if (!result) notFound()

  const { product, related } = result

  return (
    <div>
      <ProductDetail product={product} />
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <SectionHeader title="You may also like" />
        <ProductGrid products={related} />
      </section>
    </div>
  )
}