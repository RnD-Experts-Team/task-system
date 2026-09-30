// ─── URL helpers ───────────────────────────────────────────────────

const rawApi = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api"

/** Base URL of the public API, without a trailing slash. */
export const API_BASE = `${rawApi.replace(/\/+$/, "")}/public/roadmap`

/** Absolute URL of the changelog RSS feed. */
export const RSS_URL = `${API_BASE}/changelog/feed.xml`

export const homePath = () => "/roadmap"
export const boardPath = (slug: string) => `/roadmap/${encodeURIComponent(slug)}`
export const roadmapPath = (slug: string) => `${boardPath(slug)}/roadmap`
export const postPath = (board: string, number: number, slug: string) =>
  `${boardPath(board)}/p/${number}${slug ? `-${slug}` : ""}`
export const changelogPath = () => "/changelog"
export const changelogEntryPath = (slug: string) => `/changelog/${encodeURIComponent(slug)}`

/** "42-dark-mode" → { number: 42, slug: "dark-mode" }. Only the leading number is authoritative. */
export function parsePostParam(param: string | undefined): { number: number; slug: string } | null {
  if (!param) return null
  const match = /^(\d{1,9})(?:-(.*))?$/.exec(param)
  if (!match) return null
  const number = Number(match[1])
  if (!Number.isSafeInteger(number) || number < 1) return null
  return { number, slug: match[2] ?? "" }
}

/** Only allow http(s) URLs coming from the server (footer links, contact URL). */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null
  } catch {
    return null
  }
}

/** True for same-origin SPA paths ("/roadmap/…"). */
export function isInternalPath(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//")
}

export function absoluteUrl(path: string): string {
  return `${window.location.origin}${path}`
}

/** Comma-joined multi-value query param → array. */
export function splitParam(value: string | null): string[] {
  return value ? value.split(",").map((v) => v.trim()).filter(Boolean) : []
}
