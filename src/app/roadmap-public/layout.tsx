import { Suspense, useEffect } from "react"
import { Outlet, useLocation } from "react-router"
import { useTheme } from "@/hooks/use-theme"
import { useSiteStore } from "./stores/siteStore"
import { RoadmapTheme } from "./components/common/roadmap-theme"
import { RoadmapErrorBoundary } from "./components/common/error-boundary"
import { SiteHeader } from "./components/common/site-header"
import { SiteFooter } from "./components/common/site-footer"
import { LiveNotice } from "./components/common/live-notice"
import { ErrorState } from "./components/common/error-state"
import { PageSkeleton } from "./components/common/skeletons"
import { S } from "./lib/strings"
import { containerClass } from "./lib/ui"
import { cn } from "@/lib/utils"
import { prefetchRouteChunk } from "./lib/prefetch"

// Start loading the landing page chunk as soon as this layout module evaluates (see lib/prefetch.ts).
if (typeof window !== "undefined") prefetchRouteChunk(window.location.pathname)

/** Applies the server's default theme once, only when the visitor never chose one. */
function useDefaultThemeMode(mode: "system" | "light" | "dark" | undefined) {
  const { setTheme } = useTheme()
  useEffect(() => {
    if (!mode || mode === "system") return
    try {
      if (window.localStorage.getItem("theme") === null) setTheme(mode)
    } catch {
      // Storage unavailable: keep the system default.
    }
  }, [mode, setTheme])
}

/** Uses the configured favicon while the public site is open. */
function useFavicon(href: string | null | undefined) {
  useEffect(() => {
    if (!href) return
    const link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) return
    const previous = link.getAttribute("href")
    link.setAttribute("href", href)
    return () => {
      if (previous !== null) link.setAttribute("href", previous)
    }
  }, [href])
}

export default function RoadmapPublicLayout() {
  const { pathname } = useLocation()
  const config = useSiteStore((s) => s.config)
  const status = useSiteStore((s) => s.status)
  const error = useSiteStore((s) => s.error)
  const load = useSiteStore((s) => s.load)

  useEffect(() => {
    void load()
  }, [load])

  // New page: start at the top (search-param changes on the feed keep the scroll position).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useDefaultThemeMode(config?.theme.default_theme)
  useFavicon(config?.assets.favicon_url)

  function retry() {
    useSiteStore.setState({ status: "idle", error: null })
    void load()
  }

  return (
    <RoadmapTheme theme={config?.theme}>
      <a
        href="#rm-main"
        className="sr-only z-[70] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
      >
        {S.nav.skip}
      </a>

      {config ? (
        <SiteHeader config={config} />
      ) : (
        <header className="border-b border-border/60">
          <div className={cn(containerClass, "h-16")} />
        </header>
      )}

      {/* min-height keeps the footer below the fold while content loads, so it cannot jump (CLS) */}
      <main id="rm-main" className="min-h-[calc(100svh-4rem)] flex-1">
        <RoadmapErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            {status === "ready" ? (
              <Outlet />
            ) : status === "error" ? (
              <div className={cn(containerClass, "py-16")}>
                <ErrorState error={error} onRetry={retry} className="mx-auto max-w-lg" />
              </div>
            ) : (
              <PageSkeleton />
            )}
          </Suspense>
        </RoadmapErrorBoundary>
      </main>

      <SiteFooter config={config} />
      <LiveNotice />
    </RoadmapTheme>
  )
}
