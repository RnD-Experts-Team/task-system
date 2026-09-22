// src/app/work-sessions/utils/format.ts
// Shared formatting helpers for the Daily Work Sessions module. Every date
// helper goes through date-fns so the module never hand-rolls date strings.

import { AxiosError } from "axios"
import { format, isValid, parse, parseISO } from "date-fns"
import type { ApiValidationError } from "@/types"
import type { WorkSessionItem } from "../types"

// ─── Dates ────────────────────────────────────────────────────────

/** "2026-09-22" → "Tue, Sep 22, 2026". Returns the raw string if unparsable. */
export function formatWorkDate(workDate: string): string {
  const parsed = parse(workDate, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? format(parsed, "EEE, MMM d, yyyy") : workDate
}

/** ISO-8601 timestamp → "Sep 22, 2026 3:45 PM". "—" when null/undefined/invalid. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  const parsed = parseISO(iso)
  return isValid(parsed) ? format(parsed, "MMM d, yyyy h:mm a") : "—"
}

/** ISO-8601 timestamp → "3:45 PM". "—" when null/undefined/invalid. */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  const parsed = parseISO(iso)
  return isValid(parsed) ? format(parsed, "h:mm a") : "—"
}

/** (2026, 9) → "September 2026". Month is 1-based like the API. */
export function monthLabel(year: number, month: number): string {
  return format(new Date(year, month - 1, 1), "MMMM yyyy")
}

// ─── Durations ────────────────────────────────────────────────────

/** 150 → "2h 30m", 45 → "45m", 120 → "2h", null/0 → "—" */
export function minutesToHuman(minutes: number | null): string {
  if (minutes === null || minutes === undefined || minutes <= 0) return "—"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

/** Sum of estimated_minutes across items (null estimates count as 0). */
export function sumEstimatedMinutes(items: Pick<WorkSessionItem, "estimated_minutes">[]): number {
  return items.reduce((total, item) => total + (item.estimated_minutes ?? 0), 0)
}

// ─── Completion tone ──────────────────────────────────────────────

export type CompletionTone = "good" | "warn" | "bad" | "none"

/** ≥80 good, ≥60 warn, otherwise bad. null (no items) → none. */
export function completionTone(pct: number | null): CompletionTone {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return "none"
  if (pct >= 80) return "good"
  if (pct >= 60) return "warn"
  return "bad"
}

/** Badge classes for a tone — same emerald/amber/red palette as the weighted-ratings page. */
export function completionToneClasses(tone: CompletionTone): string {
  switch (tone) {
    case "good":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
    case "warn":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
    case "bad":
      return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

// ─── Errors ───────────────────────────────────────────────────────

/** Pulls a user-friendly message out of an Axios error (validation errors first). */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    // Show validation errors first (field-level messages)
    if (data?.errors) return Object.values(data.errors).flat().join(". ")
    // Fall back to the server's top-level message
    if (data?.message) return data.message
  }
  return fallback
}
