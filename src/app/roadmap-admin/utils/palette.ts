// src/app/roadmap-admin/utils/palette.ts
// Curated colour palettes + hex helpers shared by the colour pickers.

/** Curated tag / status swatches — every one keeps readable text on a 12% tint. */
export const ITEM_PALETTE = [
  "#64748b", // slate
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#14b8a6", // teal
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#ec4899", // pink
] as const

/** Brand-primary swatches. All reach 4.5:1 in at least one usable direction (server enforces it). */
export const BRAND_PALETTE = [
  "#e11d48", // rose (default)
  "#dc2626", // red
  "#ea580c", // orange
  "#d97706", // amber
  "#65a30d", // lime
  "#059669", // emerald
  "#0d9488", // teal
  "#0284c7", // sky
  "#2563eb", // blue
  "#4f46e5", // indigo
  "#7c3aed", // violet
  "#c026d3", // fuchsia
  "#475569", // slate
] as const

const HEX6 = /^#[0-9a-fA-F]{6}$/

/** True for "#rrggbb". */
export function isHexColor(value: string): boolean {
  return HEX6.test(value)
}

/** "e11d48" / "#E11D48" / "#e11" → "#e11d48" (lower-case, 6 digits) or null when invalid. */
export function normalizeHex(input: string): string | null {
  let v = input.trim().replace(/^#/, "").toLowerCase()
  if (/^[0-9a-f]{3}$/.test(v)) v = v.split("").map((c) => c + c).join("")
  return /^[0-9a-f]{6}$/.test(v) ? `#${v}` : null
}

/** Tinted pill styles derived from a status/tag colour (works in light and dark). */
export function pillStyle(color: string): { backgroundColor: string; color: string; borderColor: string } {
  return {
    backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
    color: `color-mix(in srgb, ${color} 72%, var(--foreground))`,
    borderColor: `color-mix(in srgb, ${color} 32%, transparent)`,
  }
}
