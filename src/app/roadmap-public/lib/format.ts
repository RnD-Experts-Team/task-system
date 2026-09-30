import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns"

// ─── Dates ─────────────────────────────────────────────────────────

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const d = parseISO(iso)
  return isValid(d) ? d : null
}

/** "3 minutes ago" / "just now". */
export function formatRelative(iso: string | null | undefined): string {
  const d = toDate(iso)
  if (!d) return ""
  if (Date.now() - d.getTime() < 45_000) return "just now"
  return `${formatDistanceToNowStrict(d)} ago`
}

/** "12 Mar 2026" (short) or "12 March 2026" (long). */
export function formatDate(iso: string | null | undefined, style: "short" | "long" = "short"): string {
  const d = toDate(iso)
  if (!d) return ""
  return format(d, style === "long" ? "d MMMM yyyy" : "d MMM yyyy")
}

/** Value for a <time dateTime> attribute. */
export function isoOrUndefined(iso: string | null | undefined): string | undefined {
  return toDate(iso) ? (iso as string) : undefined
}

// ─── Numbers ───────────────────────────────────────────────────────

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

export function formatCount(n: number): string {
  return n < 1000 ? String(n) : compact.format(n)
}

// ─── Colours ───────────────────────────────────────────────────────

const HEX = /^#[0-9a-fA-F]{6}$/
export const FALLBACK_COLOR = "#64748b"

export function safeColor(color: string | null | undefined): string {
  return color && HEX.test(color) ? color : FALLBACK_COLOR
}

/** Transparent tint of a status/tag colour, e.g. for pill backgrounds. */
export function tint(color: string, percent: number): string {
  return `color-mix(in oklab, ${safeColor(color)} ${percent}%, transparent)`
}

/** Readable text colour derived from a status colour in both themes. */
export function tintText(color: string): string {
  return `color-mix(in oklab, ${safeColor(color)} 55%, var(--foreground))`
}

// ─── Text ──────────────────────────────────────────────────────────

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0]?.[0] ?? "?"
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + second).toUpperCase()
}
