// Live preview of the public feed, rendered inside a scoped `data-roadmap-theme` element whose
// CSS variables come straight from the server (POST /settings/theme-preview). The admin app's
// own theme is untouched: everything the preview needs is defined on the wrapper.

import { useState, type CSSProperties } from "react"
import { ChevronUp, Loader2, MessageSquare, Moon, Sun } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { HeroStyle, PublicTheme } from "@/app/roadmap-public/types"
import type { RoadmapSettings } from "../types"
import { pillStyle } from "../utils/palette"

type PreviewMode = "light" | "dark"

type SettingsPreviewProps = {
  theme: PublicTheme | null
  settings: RoadmapSettings
  logoUrl: string | null
  logoDarkUrl: string | null
  /** True while a newer draft is still being round-tripped to the server */
  pending: boolean
  /** Server rejection message for the current draft (contrast etc.) */
  error: string | null
}

const SURFACES: Record<PreviewMode, Record<string, string>> = {
  light: {
    "--pv-bg": "oklch(0.985 0.002 250)",
    "--pv-card": "oklch(1 0 0)",
    "--pv-fg": "oklch(0.21 0.01 260)",
    "--pv-muted": "oklch(0.52 0.01 260)",
    "--pv-border": "oklch(0.92 0.005 260)",
  },
  dark: {
    "--pv-bg": "oklch(0.17 0.01 260)",
    "--pv-card": "oklch(0.215 0.012 260)",
    "--pv-fg": "oklch(0.96 0.005 260)",
    "--pv-muted": "oklch(0.72 0.01 260)",
    "--pv-border": "oklch(0.3 0.012 260)",
  },
}

const SAMPLE_STATUSES = [
  { name: "Under review", color: "#64748b" },
  { name: "Planned", color: "#6366f1" },
  { name: "In progress", color: "#f59e0b" },
  { name: "Live", color: "#10b981" },
]

const SAMPLE_POSTS = [
  { title: "Dark mode for the dashboard", body: "Long sessions are hard on the eyes. A dark theme would help a lot.", votes: 128, comments: 14, status: 2, voted: true },
  { title: "Export reports as CSV", body: "Finance asks for a spreadsheet every month.", votes: 46, comments: 5, status: 1, voted: false },
  { title: "Keyboard shortcuts everywhere", body: "Let me approve and reject without touching the mouse.", votes: 12, comments: 2, status: 0, voted: false },
]

function heroBackground(style: HeroStyle): CSSProperties {
  if (style === "gradient") return { backgroundImage: "linear-gradient(135deg, var(--rm-accent-soft), transparent 70%)" }
  if (style === "pattern") {
    return { backgroundImage: "radial-gradient(var(--rm-accent-soft) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }
  }
  return {}
}

export function SettingsPreview({ theme, settings, logoUrl, logoDarkUrl, pending, error }: SettingsPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>(settings.branding.default_theme === "dark" ? "dark" : "light")

  const tokens = theme ? theme[mode] : {}
  const style = {
    ...SURFACES[mode],
    ...tokens,
    "--radius": theme?.radius ?? "0.875rem",
    fontFamily: (theme?.font ?? settings.branding.font) === "system" ? "ui-sans-serif, system-ui, sans-serif" : "inherit",
    backgroundColor: "var(--pv-bg)",
    color: "var(--pv-fg)",
  } as CSSProperties

  const logo = mode === "dark" ? (logoDarkUrl ?? logoUrl) : logoUrl
  const site = settings.site
  const radius = "var(--radius)"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          Live preview
          {pending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-label="Updating preview" />}
        </h3>
        <ToggleGroup type="single" variant="outline" size="sm" value={mode} onValueChange={(v) => v && setMode(v as PreviewMode)} aria-label="Preview theme">
          <ToggleGroupItem value="light" aria-label="Light" className="gap-1">
            <Sun />
            Light
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark" className="gap-1">
            <Moon />
            Dark
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
          {error} The preview shows the last valid colours.
        </p>
      )}

      <div
        data-roadmap-theme=""
        data-mode={mode}
        style={style}
        className="overflow-hidden rounded-xl border text-[13px] leading-normal"
        aria-label="Public site preview"
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: "var(--pv-border)" }}>
          {logo ? (
            <img src={logo} alt="" className="h-6 max-w-28 object-contain" />
          ) : (
            <span
              className="flex size-6 items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", borderRadius: `calc(${radius} * 0.5)` }}
              aria-hidden
            >
              {site.name.trim().charAt(0).toUpperCase() || "R"}
            </span>
          )}
          <span className="truncate font-semibold">{site.name}</span>
          <nav className="ms-auto flex gap-3 text-xs" style={{ color: "var(--pv-muted)" }} aria-hidden>
            <span style={{ color: "var(--rm-accent-strong, var(--primary))" }} className="font-medium">
              Feedback
            </span>
            <span>Roadmap</span>
            <span>Changelog</span>
          </nav>
        </div>

        {/* Hero */}
        <div className="space-y-3 px-4 py-5" style={heroBackground(settings.branding.hero_style)}>
          <div>
            <p className="text-lg leading-tight font-bold text-balance">{site.hero_title || "What should we build next?"}</p>
            {site.hero_subtitle && (
              <p className="mt-1 text-xs" style={{ color: "var(--pv-muted)" }}>
                {site.hero_subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            tabIndex={-1}
            className="inline-flex h-8 items-center px-3.5 text-xs font-medium"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)", borderRadius: `calc(${radius} * 0.7)` }}
          >
            Suggest an idea
          </button>
        </div>

        {/* Feed */}
        <ul className="space-y-2 px-4 pb-4">
          {SAMPLE_POSTS.map((post) => {
            const status = SAMPLE_STATUSES[post.status]
            return (
              <li
                key={post.title}
                className="flex gap-3 border p-3"
                style={{ backgroundColor: "var(--pv-card)", borderColor: "var(--pv-border)", borderRadius: radius }}
              >
                <div
                  className="flex h-14 w-11 shrink-0 flex-col items-center justify-center gap-0.5 border text-xs font-semibold tabular-nums"
                  style={{
                    borderRadius: `calc(${radius} * 0.7)`,
                    borderColor: post.voted ? "var(--primary)" : "var(--pv-border)",
                    backgroundColor: post.voted ? "var(--primary)" : "transparent",
                    color: post.voted ? "var(--primary-foreground)" : "var(--pv-fg)",
                  }}
                >
                  <ChevronUp className="size-3.5" aria-hidden />
                  {post.votes}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{post.title}</p>
                  <p className="line-clamp-1 text-xs" style={{ color: "var(--pv-muted)" }}>
                    {post.body}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      style={pillStyle(status.color)}
                      className="inline-flex h-5 items-center gap-1 rounded-full border px-2 text-[10px] font-medium"
                    >
                      <span className="size-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                      {status.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "var(--pv-muted)" }}>
                      <MessageSquare className="size-3" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
          <li className="flex items-center gap-2 pt-1 text-xs" style={{ color: "var(--pv-muted)" }}>
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
            <span style={{ color: "var(--rm-accent-strong, var(--primary))" }} className="font-medium underline underline-offset-2">
              Links use the accent
            </span>
            <span className="ms-auto">{site.footer_text || `Powered by ${site.team_name}`}</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
