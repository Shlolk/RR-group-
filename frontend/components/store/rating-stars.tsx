import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function RatingStars({
  rating,
  size = "sm",
  className,
}: {
  rating: number
  size?: "sm" | "md"
  className?: string
}) {
  const px = size === "sm" ? "size-3.5" : "size-4"
  return (
    <div className={cn("flex items-center", className)} aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(rating)
        return (
          <Star
            key={i}
            className={cn(px, filled ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")}
            aria-hidden
          />
        )
      })}
    </div>
  )
}
