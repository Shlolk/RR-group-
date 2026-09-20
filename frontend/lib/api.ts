export interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  code?: string
  details?: unknown
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  params?: Record<string, string | number | boolean | undefined | null>
  raw?: boolean
}

async function apiFetchRaw(path: string, options: Omit<RequestOptions, "raw"> = {}): Promise<Response> {
  const { body, params, headers, ...rest } = options

  let url = path
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&")
    if (qs) url = `${path}?${qs}`
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData

  return fetch(url, {
    credentials: "include",
    ...rest,
    headers: isFormData
      ? headers
      : {
          "Content-Type": "application/json",
          ...headers,
        },
    body: body !== undefined && !isFormData ? JSON.stringify(body) : (body as BodyInit | undefined),
  })
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers, raw, ...rest } = options

  const res = await apiFetchRaw(path, { body, params, headers, ...rest })

  if (raw) {
    return (await res.json()) as T
  }

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = (await res.json()) as ApiEnvelope<T>
  } catch {
    payload = null
  }

  if (!res.ok) {
    const message = payload?.message ?? `Request failed (${res.status})`
    throw new ApiError(res.status, message, payload?.code, payload?.details)
  }

  return payload?.data as T
}

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"]) => apiFetch<T>(path, { params }),
  post: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) =>
    apiFetch<T>(path, {
      method: "POST",
      body: formData,
      headers: {},
    }),
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return "Something went wrong"
}

export function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401
}