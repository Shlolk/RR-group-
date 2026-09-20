"use client"

import { AnimatePresence, motion } from "motion/react"
import { Bot, Send, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { products as mockProducts } from "@/lib/mock-data"
import { formatPrice } from "@/components/store/store-provider"
import { sendChatMessage } from "@/lib/services/api"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

interface Message {
  id: number
  role: "user" | "bot"
  content: string
  suggestions?: { name: string; slug: string; price: number }[]
}

const quickPrompts = [
  "Recommend ERP software",
  "What's on sale?",
  "Track my order",
  "Best POS hardware",
]

function generateReply(input: string, sourceProducts: Product[]): Message {
  const products = sourceProducts.length ? sourceProducts : mockProducts
  const text = input.toLowerCase()
  const id = Date.now() + Math.random()

  const matchByKeyword = (kw: string[]) =>
    products.filter((p) =>
      kw.some(
        (k) =>
          p.name.toLowerCase().includes(k) ||
          p.tags.some((t) => t.includes(k)) ||
          p.category.toLowerCase().includes(k),
      ),
    )

  if (text.includes("sale") || text.includes("deal") || text.includes("discount")) {
    const onSale = products.filter((p) => p.originalPrice > p.price).slice(0, 3)
    return {
      id,
      role: "bot",
      content: "Here are some of our best current deals:",
      suggestions: onSale.map((p) => ({ name: p.name, slug: p.slug, price: p.price })),
    }
  }
  if (text.includes("track") || text.includes("order") || text.includes("delivery")) {
    return {
      id,
      role: "bot",
      content:
        "You can track any order from the Orders page — each order shows a live status timeline. Head to Orders to see your latest shipment.",
    }
  }
  if (text.includes("erp") || text.includes("crm") || text.includes("software")) {
    const matches = matchByKeyword(["erp", "crm", "software", "analytics"]).slice(0, 3)
    return {
      id,
      role: "bot",
      content: "Based on what growing teams pick most, these are great starting points:",
      suggestions: matches.map((p) => ({ name: p.name, slug: p.slug, price: p.price })),
    }
  }
  if (text.includes("pos") || text.includes("hardware") || text.includes("scanner")) {
    const matches = matchByKeyword(["pos", "hardware", "scanner", "terminal"]).slice(0, 3)
    return {
      id,
      role: "bot",
      content: "Our most reliable business hardware picks:",
      suggestions: matches.map((p) => ({ name: p.name, slug: p.slug, price: p.price })),
    }
  }

  const generic = matchByKeyword(text.split(" ").filter((w) => w.length > 3)).slice(0, 3)
  if (generic.length) {
    return {
      id,
      role: "bot",
      content: "Here's what I found that might match:",
      suggestions: generic.map((p) => ({ name: p.name, slug: p.slug, price: p.price })),
    }
  }

  return {
    id,
    role: "bot",
    content:
      "I'm RR Assistant — I can help you find products, compare options, check deals, or track orders. Try asking about ERP software, POS hardware, or current sales.",
  }
}

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [liveProducts, setLiveProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "bot",
      content:
        "Hi! I'm RR Assistant. Ask me about products, deals or orders and I'll point you in the right direction.",
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  useEffect(() => {
    if (!open || productsLoading || liveProducts.length) return
    let cancelled = false
    setProductsLoading(true)
    import("@/lib/data")
      .then((mod) => mod.loadProducts())
      .then((data) => {
        if (!cancelled && data.length) setLiveProducts(data)
      })
      .catch(() => {
        // keep mock fallback; do not throw
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, productsLoading, liveProducts.length])

  const send = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const userMsg: Message = { id: Date.now(), role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setTyping(true)
    try {
      const res = await sendChatMessage({ message: trimmed })
      setTyping(false)
      setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role: "bot", content: res.message }])
    } catch {
      setTyping(false)
      setTimeout(() => {
        setMessages((prev) => [...prev, generateReply(trimmed, liveProducts)])
      }, 400)
    }
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-5 z-50 flex h-[540px] w-[min(calc(100vw-2.5rem),380px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary-foreground/15">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">RR Assistant</p>
                <p className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                  <span className="size-1.5 rounded-full bg-success" /> Online now
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                      m.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                  {m.suggestions && (
                    <div className="flex w-[85%] flex-col gap-2">
                      {m.suggestions.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/shop/products/${s.slug}`}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs transition-colors hover:border-primary"
                        >
                          <span className="font-medium text-foreground">{s.name}</span>
                          <span className="font-semibold text-primary">{formatPrice(s.price)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {productsLoading && !typing && (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3 text-xs text-muted-foreground">
                  Loading products…
                </div>
              )}
              {typing && (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-muted-foreground"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products or orders..."
                aria-label="Message"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                    e.preventDefault()
                    send(input)
                  }
                }}
              />
              <Button type="submit" size="icon" aria-label="Send message">
                <Send className="size-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
