import type { NextFunction, Request, Response } from "express"

export interface ApiError {
  status: number
  code: string
  message: string
  details?: unknown
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

export function wrap(handler: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

export class AppError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function success(res: Response, data: unknown, message = "Success", status = 200) {
  return res.status(status).json({ success: true, message, data })
}

export function error(res: Response, err: ApiError) {
  return res.status(err.status).json({
    success: false,
    message: err.message,
    code: err.code,
    details: err.details,
  })
}

export function handleValidationError(err: { issues?: { path: (string | number)[]; message: string }[] }) {
  if (!err.issues) return null
  const details = err.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }))
  return new AppError(400, "VALIDATION_ERROR", "Invalid input data", details)
}

export function paginate(page: number, perPage: number) {
  const p = Math.max(1, page || 1)
  const limit = Math.min(100, Math.max(1, perPage || 20))
  return { skip: (p - 1) * limit, take: limit, page: p, perPage: limit }
}