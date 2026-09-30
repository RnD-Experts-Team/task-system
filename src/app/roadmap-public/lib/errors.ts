import { isPublicApiError } from "../api/publicApiClient"
import { S } from "./strings"

/** Friendly message for any error coming out of the public API client. */
export function describeError(error: unknown): string {
  if (!isPublicApiError(error)) return S.errors.generic
  if (error.status === 429) {
    return error.code === "daily_limit" ? S.errors.dailyLimit : S.errors.rateLimited(error.retryAfter)
  }
  if (error.code === "network_error") return S.errors.network
  if (error.code === "timeout") return S.errors.timeout
  if (error.status >= 500) return S.errors.generic
  return error.message || S.errors.generic
}

export function isNotFound(error: unknown): boolean {
  return isPublicApiError(error) && error.status === 404
}

export function isRateLimited(error: unknown): boolean {
  return isPublicApiError(error) && error.status === 429
}
