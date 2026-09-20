import type { NextFunction, Request, Response } from "express"
import { success } from "@/utils/api"
import { COLLECTIONS, countWhere, create, findById, findMany, getDb, now, update } from "@/services/db/firestore"

type Row = Record<string, unknown> & { id: string }

function toLegacyEmployee(employee: Row): Record<string, unknown> {
  const { title, joiningDate, ...rest } = employee
  return { ...rest, position: title ?? null, joinDate: joiningDate ?? null }
}

async function resolveCompanyId(body: Record<string, unknown>): Promise<string | undefined> {
  const companySnap = await getDb().collection("companies").limit(1).get()
  return companySnap.size ? String(companySnap.docs[0].id) : (body.companyId as string | undefined)
}

export async function listDepartmentsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Row>(COLLECTIONS.departments, { limit: 500 })
    const employeeRows = await findMany<Row>(COLLECTIONS.employees, { limit: 500 })
    const departments = rows
      .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
      .map((d) => ({
        ...d,
        _count: {
          employees: employeeRows.filter((emp) => emp.departmentId != null && String(emp.departmentId) === d.id).length,
        },
      }))
    return success(res, departments, "Departments fetched")
  } catch (err) {
    next(err)
  }
}

export async function createDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, unknown>
    const companyId = await resolveCompanyId(body)
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company not found", code: "COMPANY_REQUIRED" })
    }
    const department = (await create(COLLECTIONS.departments, {
      name: body.name,
      headUserId: body.headUserId ?? null,
      description: body.description ?? null,
    })) as Row
    return success(res, { ...department, createdAt: department.createdAt ?? now(), updatedAt: department.updatedAt ?? now() }, "Department created", 201)
  } catch (err) {
    next(err)
  }
}

export async function listEmployeesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await findMany<Row>(COLLECTIONS.employees, { limit: 500 })
    const employees = rows.sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")))

    const deptRows = await findMany<Row>(COLLECTIONS.departments, { limit: 500 })
    const deptMap = new Map<string, Row>()
    for (const d of deptRows) deptMap.set(d.id, d)

    const userIds = new Set<string>()
    for (const emp of employees) if (emp.userId != null) userIds.add(String(emp.userId))
    const users = await Promise.all([...userIds].map((id) => findById<Row>(COLLECTIONS.users, id)))
    const userMap = new Map<string, Row>()
    for (const u of users) if (u != null) userMap.set(u.id, u)

    const items = employees.map((emp) => {
      const department = emp.departmentId != null ? deptMap.get(String(emp.departmentId)) : undefined
      const user = emp.userId != null ? userMap.get(String(emp.userId)) : undefined
      const item: Row = { ...emp }
      item.department = department ? { id: department.id, name: department.name ?? null } : null
      item.user = user
        ? { id: user.id, email: user.email ?? null, firstName: user.firstName ?? null, lastName: user.lastName ?? null, avatar: user.avatar ?? null }
        : null
      return toLegacyEmployee(item)
    })
    return success(res, items, "Employees fetched")
  } catch (err) {
    next(err)
  }
}

export async function createEmployeeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, unknown>
    const companyId = await resolveCompanyId(body)
    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company not found", code: "COMPANY_REQUIRED" })
    }
    const employee = (await create(COLLECTIONS.employees, {
      departmentId: body.departmentId ?? null,
      userId: body.userId ?? null,
      title: body.title ?? body.position ?? null,
      salary: body.salary != null ? Number(body.salary) : null,
      currency: body.currency ?? null,
      joiningDate:
        body.joiningDate != null
          ? new Date(String(body.joiningDate)).toISOString()
          : body.joinDate != null
            ? new Date(String(body.joinDate)).toISOString()
            : null,
      status: (body.status as string | undefined) ?? "ACTIVE",
      contact: body.contact ?? null,
      address: body.address ?? null,
    })) as Row
    return success(res, { ...toLegacyEmployee(employee), createdAt: employee.createdAt ?? now(), updatedAt: employee.updatedAt ?? now() }, "Employee created", 201)
  } catch (err) {
    next(err)
  }
}

export async function updateEmployeeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body as Record<string, unknown>
    const { position, joinDate, ...rest } = body
    const data: Record<string, unknown> = { ...rest }
    if (body.salary != null) data.salary = Number(body.salary)
    if (data.joiningDate != null) data.joiningDate = new Date(String(data.joiningDate)).toISOString()
    if (position != null) data.title = position
    if (joinDate != null) data.joiningDate = new Date(String(joinDate)).toISOString()
    await update(COLLECTIONS.employees, req.params.id, data)
    const updated = await findById<Row>(COLLECTIONS.employees, req.params.id)
    return success(res, updated ? toLegacyEmployee(updated) : toLegacyEmployee({ id: req.params.id, ...data }), "Employee updated")
  } catch (err) {
    next(err)
  }
}

export async function getErpSummaryHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const [departments, employees, totalProjects] = await Promise.all([
      countWhere(COLLECTIONS.departments, "id", ">=", ""),
      countWhere(COLLECTIONS.employees, "id", ">=", ""),
      countWhere(COLLECTIONS.projects, "id", ">=", ""),
    ])
    return success(res, { departments, employees, totalProjects }, "ERP summary fetched")
  } catch (err) {
    next(err)
  }
}