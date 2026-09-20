"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { Badge } from "@/components/ui/badge"

export default function AdminSettingsPage() {
  const { user } = useAuth()

  const rows = [
    { label: "Signed in as", value: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() },
    { label: "Email", value: user?.email ?? "—" },
    { label: "Role", value: user?.role ?? "—" },
    { label: "Company", value: "RR GROUP" },
    { label: "Permissions", value: user?.permissions?.length ? `${user.permissions.length} granted` : "Default set" },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account information</p>
      </div>

      <div className="rounded-xl border border-border bg-card px-5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between border-b border-border py-3 last:border-0">
            <span className="text-sm text-muted-foreground">{r.label}</span>
            <span className="text-sm font-medium">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Full administrative settings (payment credentials, email templates, SEO, roles &amp; permissions) are
        managed from the backend API. Keep credential fields synced with the
        <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">backend/.env</code> file.
      </div>
    </div>
  )
}