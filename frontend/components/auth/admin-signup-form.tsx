"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/api"
import { ShieldCheck, ArrowLeft } from "lucide-react"

export function AdminSignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    adminSecret: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/admin-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          adminSecret: form.adminSecret,
          role: "STAFF",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "Registration failed")
      }
      router.push("/admin/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="admin-first" className="text-sm font-medium text-foreground">
            First Name
          </label>
          <Input
            id="admin-first"
            required
            placeholder="Shlok"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-last" className="text-sm font-medium text-foreground">
            Last Name
          </label>
          <Input
            id="admin-last"
            required
            placeholder="Singh"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="admin-email"
          type="email"
          required
          placeholder="admin@rrgroup.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-phone" className="text-sm font-medium text-foreground">
          Phone <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="admin-phone"
          type="tel"
          placeholder="+91 9938844331"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-pw" className="text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="admin-pw"
          type="password"
          required
          minLength={8}
          placeholder="Min 8 characters"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-secret" className="text-sm font-medium text-foreground">
          Admin Secret Key
        </label>
        <Input
          id="admin-secret"
          type="password"
          required
          placeholder="Enter the admin registration secret"
          value={form.adminSecret}
          onChange={(e) => update("adminSecret", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Contact the super admin to get the registration secret.
        </p>
      </div>
      <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
        {loading ? (
          "Creating account…"
        ) : (
          <>
            <ShieldCheck className="mr-2 size-4" />
            Create Admin Account
          </>
        )}
      </Button>
      <Link
        href="/admin/login"
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to admin login
      </Link>
    </form>
  )
}