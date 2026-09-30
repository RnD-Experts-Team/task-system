import { ChevronDown } from "lucide-react"
import { Link, NavLink, useLocation, useNavigate, useParams } from "react-router"
import { S } from "../../lib/strings"
import { boardPath, changelogPath, homePath, roadmapPath } from "../../lib/url"
import { containerClass } from "../../lib/ui"
import { cn } from "@/lib/utils"
import type { PublicConfig } from "../../types"
import { SiteLogo } from "./site-logo"
import { ThemeToggle } from "./theme-toggle"

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative inline-flex h-11 shrink-0 items-center border-b-2 px-3 text-sm font-medium transition-colors duration-150 ease-out",
    isActive
      ? "border-foreground text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground",
  )

export function SiteHeader({ config }: { config: PublicConfig }) {
  const { boardSlug: routeBoard } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { site, boards, features, assets } = config

  // The board the tabs act on: route board, else the only/default board.
  const fallbackBoard =
    boards.find((b) => b.slug === site.default_board_slug)?.slug ?? (boards.length === 1 ? boards[0]?.slug : undefined)
  const boardSlug = routeBoard && boards.some((b) => b.slug === routeBoard) ? routeBoard : fallbackBoard

  const onRoadmapTab = boardSlug ? pathname === roadmapPath(boardSlug) : false
  const feedbackTo = boardSlug ? boardPath(boardSlug) : homePath()
  const feedbackActive = pathname === homePath() || (boardSlug ? pathname.startsWith(boardPath(boardSlug)) && !onRoadmapTab : false)

  function switchBoard(slug: string) {
    if (!slug) navigate(homePath())
    else navigate(onRoadmapTab ? roadmapPath(slug) : boardPath(slug))
  }

  return (
    <header className="border-b border-border/60 bg-background">
      <div className={cn(containerClass, "flex h-16 items-center gap-3")}>
        <Link
          to={homePath()}
          className="flex min-w-0 items-center gap-2.5 rounded-lg py-1 pe-2 transition-opacity hover:opacity-80"
        >
          <SiteLogo name={site.name} assets={assets} />
          <span className="truncate text-[0.9375rem] font-semibold tracking-tight">{site.name}</span>
        </Link>

        <div className="ms-auto flex items-center gap-1.5">
          {boards.length > 1 ? (
            <div className="relative">
              <label htmlFor="rm-board-switch" className="sr-only">
                {S.nav.board}
              </label>
              <select
                id="rm-board-switch"
                value={boardSlug ?? ""}
                onChange={(e) => switchBoard(e.target.value)}
                className="h-10 max-w-[8.5rem] cursor-pointer appearance-none truncate rounded-lg border border-border bg-card ps-3 pe-8 text-sm font-medium text-foreground transition-colors hover:border-foreground/25 sm:max-w-[14rem]"
              >
                {!boardSlug ? <option value="">{S.changelog.allBoards}</option> : null}
                {boards.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          ) : null}
          <ThemeToggle />
        </div>
      </div>

      <nav aria-label={S.nav.primary} className={cn(containerClass, "rm-scroll-x -mb-px flex overflow-x-auto")}>
        <Link to={feedbackTo} className={tabClass({ isActive: feedbackActive })} aria-current={feedbackActive ? "page" : undefined}>
          {S.nav.feedback}
        </Link>
        {features.roadmap && boardSlug ? (
          <NavLink to={roadmapPath(boardSlug)} end className={tabClass}>
            {S.nav.roadmap}
          </NavLink>
        ) : null}
        {features.changelog ? (
          <NavLink to={changelogPath()} className={tabClass}>
            {S.nav.changelog}
          </NavLink>
        ) : null}
      </nav>
    </header>
  )
}
