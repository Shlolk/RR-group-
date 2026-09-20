"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Clock, Loader2, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react"
import { buttonVariants, Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { serviceIcons } from "@/lib/service-icons"
import type { ServiceContent } from "@/lib/content-data"
import { submitContact } from "@/lib/services/api"
import { whatsappUrl } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"

type FormState = "idle" | "submitting" | "success" | "error"

const contactChannels = [
  {
    icon: Mail,
    label: "Email",
    value: "contact@rrgroup.example",
    href: "mailto:contact@rrgroup.example",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 9938844331",
    href: "tel:+919938844331",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "27/817, Nuasahi, Nayapalli, Bhubaneswar, Odisha 751012, India",
    href: undefined,
  },
  {
    icon: Clock,
    label: "Response time",
    value: "Within one business day",
    href: undefined,
  },
]

export function ContactClient({ services }: { services: ServiceContent[] }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" })
  const [state, setState] = useState<FormState>("idle")
  const [error, setError] = useState("")

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState("submitting")
    setError("")
    try {
      await submitContact({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.service || "General inquiry",
        message: form.message,
      })
      setState("success")
    } catch (err) {
      setState("error")
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    }
  }

  return (
    <>
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Contact</p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Tell us what you're trying to build
          </h1>
          <p className="mt-4 max-w-2xl text-background/70">
            A conversation is free and usually useful. Reach out and we'll respond within one business day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            {state === "success" ? (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-border bg-card p-10 text-center">
                <CheckCircle2 className="size-12 text-success" />
                <h2 className="mt-4 font-display text-2xl font-bold text-foreground">Message sent</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Thanks, {form.name.split(" ")[0] || "there"}! We've received your message and will
                  get back to you at <span className="font-medium text-foreground">{form.email}</span>{" "}
                  within one business day.
                </p>
                {form.service && <p className="mt-3 text-xs text-primary">Regarding: {form.service}</p>}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-border bg-card p-6 sm:p-8"
              >
                <h2 className="font-display text-xl font-bold text-foreground">Send us a message</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  All fields marked * are required.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleInput}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInput}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleInput}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="service" className="text-sm font-medium text-foreground">
                      What can we help with?
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handleInput}
                      className="flex h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    >
                      <option value="">Select a service (optional)</option>
                      {services.map((s) => (
                        <option key={s.slug} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                      <option value="Something else">Something else</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleInput}
                    placeholder="Tell us about your project, timeline, budget or the problem you're facing."
                    required
                    rows={5}
                  />
                </div>
                {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" className="mt-6" disabled={state === "submitting"}>
                  {state === "submitting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" /> Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Channels */}
          <aside className="space-y-4 lg:col-span-2">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold text-foreground">Contact details</h3>
              <ul className="mt-4 space-y-4">
                {contactChannels.map((c) => (
                  <li key={c.label} className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <c.icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {c.label}
                      </p>
                      {c.href ? (
                        <a href={c.href} className="mt-0.5 block text-sm font-medium text-foreground hover:text-primary">
                          {c.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-foreground">{c.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={whatsappUrl("Hi RR GROUP, I'd like to talk about a project.")}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-auto w-full flex-col items-start gap-3 rounded-3xl px-6 py-5 hover:bg-muted")}
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="size-5 text-primary" />
                <span className="text-left">
                  <span className="block font-display text-base font-bold text-foreground">
                    Prefer WhatsApp?
                  </span>
                  <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                    Chat with us instantly — no forms needed.
                  </span>
                </span>
              </span>
            </a>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold text-foreground">What we offer</h3>
              <ul className="mt-4 space-y-2.5">
                {services.map((s) => {
                  const Icon = serviceIcons[s.slug]
                  if (!Icon) return null
                  return (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                      >
                        <Icon className="size-4 text-primary" /> {s.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
