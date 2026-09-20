import type { NextFunction, Request, Response } from "express"
import { AppError, handleValidationError } from "@/utils/api"
import { ZodError } from "zod"

export function notFound(_req: Request, res: Response) {
  return res.status(404).json({
    success: false,
    message: "Resource not found",
    code: "NOT_FOUND",
  })
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("Unhandled error:", err)

  if (err instanceof ZodError) {
    const validationError = handleValidationError(err)
    return res.status(400).json({
      success: false,
      message: validationError?.message ?? "Invalid input data",
      code: "VALIDATION_ERROR",
      details: validationError?.details,
    })
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    })
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  })
}