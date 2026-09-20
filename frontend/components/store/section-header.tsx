import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string
  title: string
  description?: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <span aria-hidden className="h-px w-6 bg-primary/30" />
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/20 hover:bg-primary hover:text-primary-foreground hover:shadow-md"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
