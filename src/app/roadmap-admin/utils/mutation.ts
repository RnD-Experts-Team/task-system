// src/app/roadmap-admin/utils/mutation.ts
// Uniform result of a store mutation so dialogs/forms can show server-side field errors inline
// (the axios interceptor already toasts generic failures).

import { isCancel } from "axios"
import { extractErrorMessage, extractFieldErrors, extractStatus } from "./format"

export type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; errors: Record<string, string[]>; status: number | null }

export async function attempt<T>(fn: () => Promise<T>, fallback = "Something went wrong."): Promise<MutationResult<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (err) {
    return {
      ok: false,
      message: isCancel(err) ? "" : extractErrorMessage(err, fallback),
      errors: extractFieldErrors(err),
      status: extractStatus(err),
    }
  }
}

/** First message for a field from a failed mutation, if any. */
export function fieldError(result: MutationResult<unknown> | null, field: string): string | undefined {
  if (!result || result.ok) return undefined
  return result.errors[field]?.[0]
}
