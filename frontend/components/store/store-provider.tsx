"use client"

import { AnimatePresence, motion } from "motion/react"
import { Check, X } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { CartItem, Product } from "@/lib/types"
import { useAuth } from "@/components/providers/auth-provider"
import {
  fetchCart,
  addToServerCart,
  updateServerCartItem,
  removeServerCartItem,
  clearServerCart,
  fetchWishlist,
  toggleServerWishlist,
} from "@/lib/services/account"

interface Toast {
  id: number
  message: string
  variant: "success" | "error" | "info"
}

interface StoreContextValue {
  cart: CartItem[]
  wishlist: string[]
  cartCount: number
  wishlistCount: number
  cartSubtotal: number
  addToCart: (product: Product, quantity?: number, variant?: string) => void
  removeFromCart: (productId: string, variant?: string) => void
  updateQuantity: (productId: string, quantity: number, variant?: string) => void
  clearCart: () => void
  toggleWishlist: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  removeFromWishlist: (productId: string) => void
  toast: (message: string, variant?: Toast["variant"]) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

function mapApiCartToItems(apiCart: { items?: unknown[] }): CartItem[] {
  if (!apiCart?.items || !Array.isArray(apiCart.items)) return []
  return apiCart.items.map((it: unknown) => {
    const r = it as Record<string, unknown>
    return {
      productId: String(r.productId ?? r.id ?? ""),
      slug: String(r.slug ?? r.productId ?? ""),
      name: String(r.name ?? ""),
      image: String(r.image ?? (Array.isArray(r.images) ? (r.images as string[])[0] ?? "" : "")),
      price: Number(r.price ?? 0),
      originalPrice: r.originalPrice != null ? Number(r.originalPrice) : undefined,
      variant: (r.variant as string) ?? (r.variantLabel as string) ?? undefined,
      quantity: Number(r.quantity ?? 1),
      stockStatus: String(r.stockStatus ?? "in-stock"),
    } as CartItem
  })
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  // Hydrate from server when authenticated, clear on logout
  const refreshFromServer = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const [c, w] = await Promise.all([fetchCart().catch(() => null), fetchWishlist().catch(() => null)])
      if (c) setCart(mapApiCartToItems(c as unknown as { items?: unknown[] }))
      if (w) {
        const items = (w as unknown as { items?: { productId: string }[] }).items ?? []
        setWishlist(items.map((i) => i.productId))
      }
    } catch {
      // keep local state on error
    }
  }, [isAuthenticated])

  const doHydrate = useCallback(() => {
    if (isAuthenticated) refreshFromServer()
    else {
      setCart([])
      setWishlist([])
    }
  }, [isAuthenticated, refreshFromServer])

  useEffect(() => {
    doHydrate()
  }, [doHydrate])

  const addToCart = useCallback(
    async (product: Product, quantity = 1, variant?: string) => {
      if (isAuthenticated) {
        try {
          const updated = await addToServerCart({ productId: product.id, quantity, variantId: variant })
          setCart(mapApiCartToItems(updated as unknown as { items?: unknown[] }))
          toast(`${product.name} added to cart`)
          return
        } catch {
          toast("Failed to add to cart", "error")
          return
        }
      }
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === product.id && i.variant === variant)
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id && i.variant === variant
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          )
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            price: product.price,
            originalPrice: product.originalPrice,
            variant,
            quantity,
            stockStatus: product.stockStatus,
          },
        ]
      })
      toast(`${product.name} added to cart`)
    },
    [toast, isAuthenticated],
  )

  const removeFromCart = useCallback(
    async (productId: string, variant?: string) => {
      if (isAuthenticated) {
        try {
          // Find server item id by productId — server uses productId as id for simple cart
          const current = await fetchCart().catch(() => null)
          const items = (current as unknown as { items?: { id: string; productId: string }[] })?.items ?? []
          const match = items.find((i) => i.productId === productId)
          if (match) {
            const updated = await removeServerCartItem(match.id)
            setCart(mapApiCartToItems(updated as unknown as { items?: unknown[] }))
            return
          }
        } catch {
          // fallback to local remove
        }
      }
      setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)))
    },
    [isAuthenticated],
  )

  const updateQuantity = useCallback(
    async (productId: string, quantity: number, variant?: string) => {
      if (quantity < 1) return
      if (isAuthenticated) {
        try {
          const current = await fetchCart().catch(() => null)
          const items = (current as unknown as { items?: { id: string; productId: string }[] })?.items ?? []
          const match = items.find((i) => i.productId === productId)
          if (match) {
            const updated = await updateServerCartItem(match.id, quantity)
            setCart(mapApiCartToItems(updated as unknown as { items?: unknown[] }))
            return
          }
        } catch {
          // fallback
        }
      }
      setCart((prev) =>
        prev.map((i) => (i.productId === productId && i.variant === variant ? { ...i, quantity } : i)),
      )
    },
    [isAuthenticated],
  )

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await clearServerCart()
        setCart([])
        return
      } catch {
        // fallback
      }
    }
    setCart([])
  }, [isAuthenticated])

  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (isAuthenticated) {
        try {
          const res = await toggleServerWishlist(product.id)
          if (res.added) {
            setWishlist((prev) => [...prev, product.id])
            toast(`${product.name} added to wishlist`)
          } else {
            setWishlist((prev) => prev.filter((id) => id !== product.id))
            toast(`${product.name} removed from wishlist`, "info")
          }
          return
        } catch {
          toast("Failed to update wishlist", "error")
          return
        }
      }
      setWishlist((prev) => {
        if (prev.includes(product.id)) {
          toast(`${product.name} removed from wishlist`, "info")
          return prev.filter((id) => id !== product.id)
        }
        toast(`${product.name} added to wishlist`)
        return [...prev, product.id]
      })
    },
    [toast, isAuthenticated],
  )

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        try {
          // Toggle off if present
          if (wishlist.includes(productId)) await toggleServerWishlist(productId)
          setWishlist((prev) => prev.filter((id) => id !== productId))
          return
        } catch {
          // fallback
        }
      }
      setWishlist((prev) => prev.filter((id) => id !== productId))
    },
    [isAuthenticated, wishlist],
  )

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist])

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      wishlist,
      cartCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      wishlistCount: wishlist.length,
      cartSubtotal: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      removeFromWishlist,
      toast,
    }),
    [
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      removeFromWishlist,
      toast,
    ],
  )

  return (
    <StoreContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg"
              role="status"
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                  t.variant === "error"
                    ? "bg-destructive/10 text-destructive"
                    : t.variant === "info"
                      ? "bg-accent text-accent-foreground"
                      : "bg-success/15 text-success"
                }`}
              >
                {t.variant === "error" ? <X className="size-3.5" /> : <Check className="size-3.5" />}
              </span>
              <p className="text-sm font-medium text-foreground">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}
