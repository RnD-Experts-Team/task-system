import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios"
import { useVisitorStore } from "../stores/visitorStore"
import {
  VISITOR_HEADER,
  type PublicApiError,
  type PublicErrorCode,
  type VisitorIssueResult,
} from "../types"
import { API_BASE } from "../lib/url"

// ─── Request options ───────────────────────────────────────────────

/**
 * auto     non-GET and /me/* carry the visitor token (issued lazily for writes)
 * existing send the token only when one is already stored (never issue)
 * never    never send the token
 */
export type VisitorTokenMode = "auto" | "existing" | "never"

declare module "axios" {
  interface AxiosRequestConfig {
    visitorToken?: VisitorTokenMode
    /** Internal: set once a 401 replay was attempted. */
    rmReplayed?: boolean
  }
}

// ─── Error normalisation ───────────────────────────────────────────

export class PublicApiRequestError extends Error implements PublicApiError {
  status: number
  code: PublicErrorCode | string
  retryAfter: number | null
  fieldErrors: Record<string, string[]>

  constructor(init: {
    status: number
    code: PublicErrorCode | string
    message: string
    retryAfter?: number | null
    fieldErrors?: Record<string, string[]>
  }) {
    super(init.message)
    this.name = "PublicApiError"
    this.status = init.status
    this.code = init.code
    this.retryAfter = init.retryAfter ?? null
    this.fieldErrors = init.fieldErrors ?? {}
  }
}

export function isPublicApiError(value: unknown): value is PublicApiRequestError {
  return value instanceof PublicApiRequestError
}

/** True when a request was cancelled through its AbortController. */
export function isAbortError(value: unknown): boolean {
  return (isPublicApiError(value) && value.code === "aborted") || axios.isCancel(value)
}

function toPositiveInt(value: unknown): number | null {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : typeof value === "number" ? value : NaN
  return Number.isFinite(n) && n > 0 ? Math.ceil(n) : null
}

interface ErrorBody {
  message?: unknown
  code?: unknown
  retry_after?: unknown
  errors?: unknown
}

function normaliseError(error: unknown): PublicApiRequestError {
  if (isPublicApiError(error)) return error
  if (axios.isCancel(error)) {
    return new PublicApiRequestError({ status: 0, code: "aborted", message: "Request cancelled." })
  }
  if (!axios.isAxiosError(error)) {
    return new PublicApiRequestError({
      status: 0,
      code: "server_error",
      message: error instanceof Error ? error.message : "Unexpected error.",
    })
  }
  const response = (error as AxiosError<ErrorBody>).response
  if (!response) {
    return new PublicApiRequestError({
      status: 0,
      code: error.code === "ECONNABORTED" ? "timeout" : "network_error",
      message: error.code === "ECONNABORTED" ? "The request timed out." : "Network error.",
    })
  }
  const body: ErrorBody = typeof response.data === "object" && response.data !== null ? response.data : {}
  const headerRetry = toPositiveInt(response.headers?.["retry-after"])
  const fieldErrors: Record<string, string[]> = {}
  if (body.errors && typeof body.errors === "object") {
    for (const [field, messages] of Object.entries(body.errors as Record<string, unknown>)) {
      fieldErrors[field] = Array.isArray(messages) ? messages.map(String) : [String(messages)]
    }
  }
  let code: string
  if (typeof body.code === "string") code = body.code
  else if (response.status === 422) code = "validation_error"
  else if (response.status === 404) code = "not_found"
  else if (response.status === 429) code = "rate_limited"
  else if (response.status >= 500) code = "server_error"
  else code = "error"

  return new PublicApiRequestError({
    status: response.status,
    code,
    message: typeof body.message === "string" && body.message ? body.message : "Request failed.",
    retryAfter: response.status === 429 ? (headerRetry ?? toPositiveInt(body.retry_after)) : null,
    fieldErrors,
  })
}

// ─── Client ────────────────────────────────────────────────────────

/**
 * Dedicated axios instance for the anonymous public API.
 * No Authorization header, no shared api service, no toasts, no default Content-Type
 * (plain GETs stay preflight-free). Never redirects anywhere on failure.
 */
export const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { Accept: "application/json" },
})

// ─── Visitor token issuing (single flight) ─────────────────────────

let issuing: Promise<string> | null = null

/** Returns the stored token or issues one via POST /visitor (one request at a time). */
export function ensureVisitorToken(): Promise<string> {
  const existing = useVisitorStore.getState().token
  if (existing) return Promise.resolve(existing)
  if (issuing) return issuing
  issuing = publicApi
    .post<{ data: VisitorIssueResult }>("/visitor", undefined, { visitorToken: "never" })
    .then((res) => {
      const token = res.data.data.visitor_token
      useVisitorStore.getState().setToken(token)
      return token
    })
    .finally(() => {
      issuing = null
    })
  return issuing
}

const ME_PATH = /^\/me(\/|$|\?)/

function tokenMode(config: InternalAxiosRequestConfig): VisitorTokenMode {
  return config.visitorToken ?? "auto"
}

publicApi.interceptors.request.use(async (config) => {
  const mode = tokenMode(config)
  if (mode === "never") return config
  const method = (config.method ?? "get").toLowerCase()
  const url = config.url ?? ""
  let token: string | null = null
  if (mode === "existing") {
    token = useVisitorStore.getState().token
  } else if (method !== "get") {
    token = await ensureVisitorToken()
  } else if (ME_PATH.test(url)) {
    token = useVisitorStore.getState().token
  }
  if (token) config.headers.set(VISITOR_HEADER, token)
  else config.headers.delete(VISITOR_HEADER)
  return config
})

const TOKEN_CODES = new Set(["visitor_token_required", "visitor_token_invalid"])

publicApi.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const normalised = normaliseError(error)
    if (
      normalised.status === 401 &&
      TOKEN_CODES.has(normalised.code) &&
      axios.isAxiosError(error) &&
      error.config &&
      !error.config.rmReplayed &&
      tokenMode(error.config as InternalAxiosRequestConfig) !== "never"
    ) {
      useVisitorStore.getState().clearToken()
      try {
        await ensureVisitorToken()
        return await publicApi.request({ ...error.config, rmReplayed: true })
      } catch (replayError) {
        throw normaliseError(replayError)
      }
    }
    throw normalised
  },
)
