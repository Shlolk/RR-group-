"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/api"
import { createDepartment, createEmployee, fetchDepartments, fetchEmployees } from "@/lib/services/admin"
import { cn } from "@/lib/utils"

type Dept = { id: string; name: string; code?: string }
type Emp = {
  id: string
  firstName: string
  lastName: string
  email: string
  designation?: string
  employmentStatus?: string
  department?: { name: string } | null
}

export default function AdminErpPage() {
  const [tab, setTab] = useState<"departments" | "employees">("departments")
  const [departments, setDepartments] = useState<Dept[]>([])
  const [employees, setEmployees] = useState<Emp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [deptName, setDeptName] = useState("")
  const [empForm, setEmpForm] = useState({ firstName: "", lastName: "", email: "", designation: "" })
  const [saving, setSaving] = useState(false)

  const loadDepartments = async () => {
    setLoading(true)
    try {
      const res = await fetchDepartments()
      const data = res as unknown as { items: Dept[] } | Dept[]
      setDepartments(Array.isArray(data) ? data : (data.items ?? []))
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const res = await fetchEmployees()
      const data = res as unknown as { items: Emp[] } | Emp[]
      setEmployees(Array.isArray(data) ? data : (data.items ?? []))
      setError(null)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === "departments") loadDepartments()
    else loadEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const createDept = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createDepartment({ name: deptName })
      setDeptName("")
      setCreating(false)
      await loadDepartments()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const createEmp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createEmployee(empForm)
      setEmpForm({ firstName: "", lastName: "", email: "", designation: "" })
      setCreating(false)
      await loadEmployees()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">ERP</h1>
          <p className="mt-1 text-sm text-muted-foreground">Departments and employees</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button
              onClick={() => setTab("departments")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium",
                tab === "departments" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
              )}
            >
              Departments
            </button>
            <button
              onClick={() => setTab("employees")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium",
                tab === "employees" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
              )}
            >
              Employees
            </button>
          </div>
          <Button onClick={() => setCreating((v) => !v)}>
            {creating ? "Close" : tab === "departments" ? "New department" : "New employee"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {creating &&
        (tab === "departments" ? (
          <form onSubmit={createDept} className="flex max-w-md gap-2 rounded-xl border border-border bg-card p-5">
            <Input
              required
              placeholder="Department name"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
            />
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Create"}
            </Button>
          </form>
        ) : (
          <form onSubmit={createEmp} className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">First name</label>
              <Input
                required
                value={empForm.firstName}
                onChange={(e) => setEmpForm({ ...empForm, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Last name</label>
              <Input
                required
                value={empForm.lastName}
                onChange={(e) => setEmpForm({ ...empForm, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                required
                type="email"
                value={empForm.email}
                onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Designation</label>
              <Input
                value={empForm.designation}
                onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : "Create employee"}
              </Button>
            </div>
          </form>
        ))}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tab === "departments" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No departments yet.</p>
          ) : (
            departments.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-card p-4">
                <p className="font-medium">{d.name}</p>
                {d.code && <p className="mt-0.5 text-xs text-muted-foreground">{d.code}</p>}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          {employees.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No employees yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Designation</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-medium">
                      {e.firstName} {e.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{e.email}</td>
                    <td className="px-4 py-3">{e.designation ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.department?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={e.employmentStatus === "TERMINATED" ? "destructive" : "success"}>
                        {e.employmentStatus ?? "ACTIVE"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}