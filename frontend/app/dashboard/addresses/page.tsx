"use client"

import { useEffect, useState } from "react"
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/api"
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
} from "@/lib/services/account"
import type { ApiAddress } from "@/lib/api-types"

const emptyForm = {
  label: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  phone: "",
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<ApiAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<ApiAddress | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const list = await fetchAddresses()
      setAddresses(list)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setEditing(null)
    setCreating(true)
  }

  const openEdit = (addr: ApiAddress) => {
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone ?? "",
    })
    setEditing(addr)
    setCreating(true)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await updateAddress(editing.id, form)
      } else {
        await createAddress(form)
      }
      setCreating(false)
      setEditing(null)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteAddress(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your shipping and billing addresses.</p>
        </div>
        <Button onClick={openCreate} disabled={creating}>
          <Plus className="size-4" /> Add
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {creating && (
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Address label</label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Home, Office"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full name</label>
              <Input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 …"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Address line 1</label>
              <Input
                required
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">Address line 2 (optional)</label>
              <Input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">City</label>
              <Input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">State</label>
              <Input
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Postal code</label>
              <Input
                required
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Country</label>
              <Input
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update address" : "Add address"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <MapPin className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No saved addresses.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {addr.label && (
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">{addr.label}</p>
                  )}
                  <p className="mt-1 text-sm font-semibold">{addr.fullName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}
                    <br />
                    {addr.city}, {addr.state} {addr.postalCode}
                    <br />
                    {addr.country}
                    {addr.phone && (
                      <>
                        <br />
                        {addr.phone}
                      </>
                    )}
                  </p>
                  {addr.isDefault && (
                    <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(addr)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(addr.id)} aria-label="Delete">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}