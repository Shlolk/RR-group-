import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { whatsappUrl } from "@/lib/whatsapp"

export function CtaSection({
  title = "Ready to build what's next?",
  description = "Book a free discovery call and get a clear plan — and pricing — for your project within 48 hours.",
  primaryLabel = "Get a Quote",
  primaryHref = "/contact",
  secondaryLabel,
  secondaryHref,
}: {
  title?: string
  description?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-xl shadow-primary/20 ring-1 ring-white/10 sm:p-10 lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-violet-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3rem_3rem]"
        />
        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            <p className="mt-3 leading-relaxed text-primary-foreground/80">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {secondaryLabel && secondaryHref && (
              <Link
                href={secondaryHref}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "h-11 px-6 shadow-sm",
                )}
              >
                {secondaryLabel}
              </Link>
            )}
            <a
              href={whatsappUrl("Hello RR GROUP, I'd like to know more about your services.")}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "h-11 px-6 bg-white text-foreground shadow-sm hover:bg-white/90",
              )}
            >
              Chat on WhatsApp
            </a>
            <Link
              href={primaryHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 px-6 bg-white text-primary shadow-sm hover:bg-white/90",
              )}
            >
              {primaryLabel}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}