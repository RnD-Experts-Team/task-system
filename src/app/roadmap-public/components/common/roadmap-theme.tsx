import { useMemo, useState, type ReactNode } from "react"
import { buildThemeCss } from "../../lib/theme-css"
import { ThemeRootContext } from "../../lib/theme-root"
import type { PublicTheme } from "../../types"

interface Props {
  theme: PublicTheme | null | undefined
  children: ReactNode
}

/**
 * Scopes the server-computed brand tokens to the public site only. The staff app keeps its own
 * tokens because every rule below is prefixed with [data-roadmap-theme].
 */
export function RoadmapTheme({ theme, children }: Props) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const css = useMemo(() => buildThemeCss(theme), [theme])

  return (
    <ThemeRootContext value={root}>
      <div
        ref={setRoot}
        data-roadmap-theme
        className="flex min-h-svh flex-col bg-background text-foreground"
      >
        <style>{css}</style>
        {children}
      </div>
    </ThemeRootContext>
  )
}
