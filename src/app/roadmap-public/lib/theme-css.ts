import type { PublicTheme, ThemeTokens } from "../types"

// ─── Server tokens → scoped CSS ────────────────────────────────────

const KEY = /^--[a-z0-9-]{1,40}$/i
// Colours, lengths and calc-free values only: nothing that could break out of a declaration or the <style>.
const VALUE = /^[#a-z0-9(),.%\s/+-]{1,96}$/i

function declarations(tokens: ThemeTokens | undefined): string {
  if (!tokens) return ""
  return Object.entries(tokens)
    .filter(([k, v]) => KEY.test(k) && VALUE.test(v))
    .map(([k, v]) => `${k}:${v};`)
    .join("")
}

const SYSTEM_FONT = `ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif`

/** Static rules shared by every theme. Everything is scoped under [data-roadmap-theme]. */
const STATIC_CSS = `
[data-roadmap-theme]{--muted-foreground:oklch(0.46 0 0);--rm-accent-strong:var(--primary);--rm-accent-soft:color-mix(in oklab,var(--primary) 10%,transparent);color-scheme:light;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
.dark [data-roadmap-theme]{--muted-foreground:oklch(0.72 0 0);--rm-accent-soft:color-mix(in oklab,var(--primary) 18%,transparent);color-scheme:dark}
[data-roadmap-theme] :where(a,button,input,select,textarea,summary,[tabindex]):focus-visible{outline:2px solid var(--ring);outline-offset:2px;border-radius:var(--radius-sm)}
[data-roadmap-theme] :where(input,textarea,select):focus-visible{outline-offset:0;border-color:var(--ring)}
[data-roadmap-theme] ::selection{background:color-mix(in oklab,var(--primary) 24%,transparent)}
[data-roadmap-theme] .rm-scroll-x{scrollbar-width:none}
[data-roadmap-theme] .rm-scroll-x::-webkit-scrollbar{display:none}
[data-roadmap-theme] .rm-prose{font-size:1rem;line-height:1.7;overflow-wrap:anywhere}
[data-roadmap-theme] .rm-prose>*+*{margin-top:1em}
[data-roadmap-theme] .rm-prose h1,[data-roadmap-theme] .rm-prose h2,[data-roadmap-theme] .rm-prose h3,[data-roadmap-theme] .rm-prose h4{font-weight:600;letter-spacing:-.01em;line-height:1.3;margin-top:1.6em;text-wrap:balance}
[data-roadmap-theme] .rm-prose h1{font-size:1.5rem}
[data-roadmap-theme] .rm-prose h2{font-size:1.3125rem}
[data-roadmap-theme] .rm-prose h3{font-size:1.125rem}
[data-roadmap-theme] .rm-prose h4{font-size:1rem}
[data-roadmap-theme] .rm-prose a{color:var(--rm-accent-strong);text-decoration:underline;text-underline-offset:2px;text-decoration-color:color-mix(in oklab,currentColor 35%,transparent)}
[data-roadmap-theme] .rm-prose a:hover{text-decoration-color:currentColor}
[data-roadmap-theme] .rm-prose ul{list-style:disc;padding-inline-start:1.25rem}
[data-roadmap-theme] .rm-prose ol{list-style:decimal;padding-inline-start:1.25rem}
[data-roadmap-theme] .rm-prose li+li{margin-top:.35em}
[data-roadmap-theme] .rm-prose li::marker{color:var(--muted-foreground)}
[data-roadmap-theme] .rm-prose blockquote{border-inline-start:2px solid var(--border);padding-inline-start:1rem;color:var(--muted-foreground)}
[data-roadmap-theme] .rm-prose code{font-size:.875em;background:var(--muted);padding:.125em .375em;border-radius:.375rem}
[data-roadmap-theme] .rm-prose pre{background:var(--muted);padding:1rem;border-radius:.75rem;overflow-x:auto;font-size:.875rem;line-height:1.6}
[data-roadmap-theme] .rm-prose pre code{background:none;padding:0}
[data-roadmap-theme] .rm-prose img{max-width:100%;height:auto;border-radius:.75rem}
[data-roadmap-theme] .rm-prose hr{border:0;border-top:1px solid var(--border);margin-block:1.75em}
[data-roadmap-theme] .rm-prose table{display:block;width:100%;overflow-x:auto;border-collapse:collapse;font-size:.9375rem}
[data-roadmap-theme] .rm-prose th,[data-roadmap-theme] .rm-prose td{border-bottom:1px solid var(--border);padding:.5rem .75rem;text-align:start}
[data-roadmap-theme] .rm-prose strong{font-weight:600}
`

export function buildThemeCss(theme: PublicTheme | undefined | null): string {
  const radius = theme && /^[0-9.]+(rem|px)$/.test(theme.radius) ? `--radius:${theme.radius};` : ""
  const font = theme?.font === "system" ? `font-family:${SYSTEM_FONT};` : ""
  const light = `[data-roadmap-theme]{${radius}${font}${declarations(theme?.light)}}`
  const dark = theme?.dark ? `.dark [data-roadmap-theme]{${declarations(theme.dark)}}` : ""
  return `${STATIC_CSS}${light}${dark}`
}
