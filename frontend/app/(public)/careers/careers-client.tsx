"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Briefcase, Building2, CheckCircle2, Clock, Loader2, MapPin, Send } from "lucide-react"
import { buttonVariants, Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CtaSection } from "@/components/site/cta-section"
import type { Job } from "@/lib/content-data"
import { submitJobApplication } from "@/lib/services/api"
import { whatsappUrl } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"

type FormState = "idle" | "submitting" | "success" | "error"

export function CareersClient({ jobs }: { jobs: Job[] }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    experience: "",
    coverLetter: "",
  })
  const [state, setState] = useState<FormState>("idle")
  const [error, setError] = useState("")

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setState("submitting")
    setError("")
    try {
      await submitJobApplication({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        location: form.location,
        position: jobs.find((j) => j.id === selected)?.title ?? "Role",
        experience: form.experience,
        coverLetter: form.coverLetter,
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
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Careers</p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Do the best work of your career
          </h1>
          <p className="mt-4 max-w-2xl text-background/70">
            We're a lean, senior team. If you care about craft and outcomes, you'll fit right in.
            Not sure it's a match? Ask us anything on WhatsApp below.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6")}>
              Get in touch
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Open Roles</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Open positions
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {jobs.length} position{jobs.length === 1 ? "" : "s"} open
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Briefcase className="size-5 text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground">{job.title}</h3>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5" /> {job.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {job.type}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {job.experience}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{job.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.requirements.slice(0, 4).map((r) => (
                    <Badge key={r} variant="secondary" className="rounded-md px-2 py-0.5 text-xs">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-row items-end justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                <span className="text-sm font-semibold text-foreground">{job.salaryRange}</span>
                <Button size="sm" onClick={() => (selected === job.id ? setSelected(null) : setSelected(job.id))}>
                  {selected === job.id ? "Cancel" : "Apply Now"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Apply form */}
        {selected && (
          <div className="mt-10 rounded-3xl border border-primary/40 bg-card p-6 sm:p-10">
            {state === "success" ? (
              <div className="mx-auto max-w-md py-8 text-center">
                <CheckCircle2 className="mx-auto size-12 text-success" />
                <h2 className="mt-4 font-display text-2xl font-bold text-foreground">Application received</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thanks, {form.fullName.split(" ")[0] || "there"}! We've received your application for{" "}
                  {jobs.find((j) => j.id === selected)?.title}. We'll get back to you within a few
                  working days.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Apply — {jobs.find((j) => j.id === selected)?.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill this in and hit submit. We usually respond within 2–3 working days.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                      Full name *
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
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
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <label htmlFor="location" className="text-sm font-medium text-foreground">
                      Location *
                    </label>
                    <Input
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleInput}
                      placeholder="City, India"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="experience" className="text-sm font-medium text-foreground">
                    Experience *
                  </label>
                  <Input
                    id="experience"
                    name="experience"
                    value={form.experience}
                    onChange={handleInput}
                    placeholder="e.g. 3 years of full-stack development"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="coverLetter" className="text-sm font-medium text-foreground">
                    Why are you a good fit? *
                  </label>
                  <Textarea
                    id="coverLetter"
                    name="coverLetter"
                    value={form.coverLetter}
                    onChange={handleInput}
                    placeholder="Tell us about your experience and what you'd bring to this role."
                    required
                    rows={4}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" disabled={state === "submitting"}>
                  {state === "submitting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" /> Submit Application
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        )}
      </section>

      {/* Ask a question via WhatsApp */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-border bg-background p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Have questions about a role or working with us?
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Message us directly on WhatsApp and we'll answer personally — no bots, no HR portals.
              </p>
            </div>
            <a
              href={whatsappUrl("Hi RR GROUP, I have a question about careers.")}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }), "h-11 shrink-0 px-6")}
            >
              Ask a Question on WhatsApp
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <CtaSection
        title="Prefer a direct conversation?"
        description="Whatever the question — services, careers or partnerships — it starts with a quick chat."
      />
    </>
  )
}
