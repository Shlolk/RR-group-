import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Package } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Order Confirmed — RR GROUP Store",
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order } = await searchParams
  const orderId = order?.trim() || null
  const isRealOrderId = Boolean(orderId && /^[A-Za-z0-9-_]{6,}$/.test(orderId))
  const trackHref = isRealOrderId ? `/dashboard/orders/${orderId}` : "/dashboard/orders"
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="size-9" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground">
        Thank you for your order!
      </h1>
      <p className="mt-3 text-muted-foreground">
        {orderId ? (
          <>
            We&apos;ve received your order and sent a confirmation to your email. Your order number is{" "}
            <span className="font-semibold text-foreground">{orderId}</span>.
          </>
        ) : (
          <>We&apos;ve received your order and sent a confirmation to your email.</>
        )}
      </p>

      <div className="mt-8 w-full rounded-2xl border border-border bg-card p-5 text-left">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Estimated delivery</p>
            <p className="text-sm text-muted-foreground">3–5 business days · Free tracking included</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={trackHref} className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
          Track your order
        </Link>
        <Link
          href="/shop/products"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6")}
        >
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
