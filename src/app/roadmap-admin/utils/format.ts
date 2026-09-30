// src/app/roadmap-admin/utils/format.ts
// Shared formatting + error helpers for the roadmap admin console. Date helpers go through
// date-fns; nothing here hand-rolls date strings.

import { AxiosError } from "axios"
import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns"
import type { ApiValidationError } from "@/types"

// ─── Dates ────────────────────────────────────────────────────────

/** ISO-8601 timestamp → "Sep 22, 2026 3:45 PM". "—" when null/undefined/invalid. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  const parsed = parseISO(iso)
  return isValid(parsed) ? format(parsed, "MMM d, yyyy h:mm a") : "—"
}

/** ISO-8601 timestamp → "Sep 22, 2026". "—" when null/undefined/invalid. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const parsed = parseISO(iso)
  return isValid(parsed) ? format(parsed, "MMM d, yyyy") : "—"
}

/** "2026-09-22" → "Sep 22". Falls back to the raw string. */
export function formatShortDay(day: string): string {
  const parsed = parseISO(day)
  return isValid(parsed) ? format(parsed, "MMM d") : day
}

/** ISO-8601 timestamp → "5 minutes ago". "—" when null/undefined/invalid. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—"
  const parsed = parseISO(iso)
  return isValid(parsed) ? `${formatDistanceToNowStrict(parsed)} ago` : "—"
}

/** ISO timestamp → value for <input type="datetime-local"> in the viewer's timezone. */
export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  const parsed = parseISO(iso)
  return isValid(parsed) ? format(parsed, "yyyy-MM-dd'T'HH:mm") : ""
}

/** <input type="datetime-local"> value (viewer timezone) → ISO-8601 UTC. "" → null. */
export function fromDateTimeLocal(value: string): string | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

// ─── Numbers / text ───────────────────────────────────────────────

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : pluralForm}`
}

/** "review-queue" / "in_progress" → "Review queue" / "In progress" */
export function humanize(value: string): string {
  const text = value.replace(/[_-]+/g, " ").trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// ─── Errors ───────────────────────────────────────────────────────

/** Pulls a user-friendly message out of an Axios error (validation errors first). */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    if (data?.errors) return Object.values(data.errors).flat().join(". ")
    if (data?.message) return data.message
  }
  return fallback
}

/** Laravel 422 field errors keyed by field name ({} for anything else). */
export function extractFieldErrors(err: unknown): Record<string, string[]> {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    if (data?.errors) return data.errors
  }
  return {}
}

/** HTTP status of an Axios error, or null. */
export function extractStatus(err: unknown): number | null {
  return err instanceof AxiosError ? (err.response?.status ?? null) : null
}
