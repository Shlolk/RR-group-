import type { Metadata } from "next"
import Link from "next/link"
import { AdminSignupForm } from "@/components/auth/admin-signup-form"
import { ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Registration — RR GROUP",
  description: "Register a new staff or admin account for the RR GROUP management panel.",
}

export default function AdminSignupPage() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <div className="mb-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-600 font-display text-lg font-bold text-white">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Register Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new staff or admin account. Requires an admin secret key.
        </p>
      </div>
      <AdminSignupForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/admin/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}