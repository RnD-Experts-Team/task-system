import { ArrowRight, Lightbulb, Megaphone } from "lucide-react"
import { Link, Navigate } from "react-router"
import { cn } from "@/lib/utils"
import { LabelBadge } from "../components/changelog/label-badge"
import { BoardIcon } from "../components/common/board-icon"
import { EmptyState } from "../components/common/empty-state"
import { useChangelogList } from "../hooks/useChangelog"
import { usePageMeta } from "../hooks/usePageMeta"
import { formatDate, isoOrUndefined } from "../lib/format"
import { S } from "../lib/strings"
import { btn, cardClass, containerClass, eyebrowClass, liftClass } from "../lib/ui"
import { boardPath, changelogEntryPath, changelogPath, roadmapPath } from "../lib/url"
import { useSiteStore } from "../stores/siteStore"
import type { BoardSummary, HeroStyle } from "../types"

const HERO_BG: Record<HeroStyle, string> = {
  plain: "",
  gradient: "bg-[radial-gradient(70%_90%_at_20%_0%,var(--rm-accent-soft),transparent_70%)]",
  pattern:
    "bg-[radial-gradient(color-mix(in_oklab,var(--foreground)_14%,transparent)_1px,transparent_1px)] bg-size-[22px_22px] mask-[linear-gradient(to_bottom,black,transparent_85%)]",
}

function BoardCard({ board }: { board: BoardSummary }) {
  return (
    <Link to={boardPath(board.slug)} className={cn(cardClass, liftClass, "group flex h-full flex-col p-5 sm:p-6")}>
      <span className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-(--rm-accent-soft) text-lg text-(--rm-accent-strong)">
        <BoardIcon icon={board.icon} className="size-5" />
      </span>
      <h3 className="text-lg font-semibold tracking-tight">{board.name}</h3>
      {board.description ? <p className="mt-1.5 line-clamp-2 text-sm text-pretty text-muted-foreground">{board.description}</p> : null}
      <div className="mt-auto flex items-center justify-between pt-5 text-sm">
        <span className="text-muted-foreground tabular-nums">{S.common.ideas(board.posts_count)}</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-(--rm-accent-strong)">
          {S.home.openBoard}
          <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 rtl:rotate-180" />
        </span>
      </div>
    </Link>
  )
}

export default function RoadmapHomePage() {
  const config = useSiteStore((s) => s.config)
  const changelog = useChangelogList(undefined, undefined, config?.features.changelog ?? false)

  usePageMeta({
    title: config ? S.meta.homeTitle(config.site.name) : "Roadmap",
  })

  if (!config) return null
  const { site, boards, features } = config

  // A configured default board makes the home page a shortcut to that board.
  const defaultBoard = boards.find((b) => b.slug === site.default_board_slug)
  if (defaultBoard) return <Navigate to={boardPath(defaultBoard.slug)} replace />

  const primaryBoard = boards.length === 1 ? boards[0] : undefined
  const latest = changelog.items.slice(0, 3)

  return (
    <div>
      <section className="relative isolate overflow-hidden border-b border-border/60">
        <div aria-hidden="true" className={cn("absolute inset-0 -z-10", HERO_BG[site.hero_style])} />
        <div className={cn(containerClass, "py-16 sm:py-24 lg:py-28")}>
          <div className="max-w-3xl">
            {site.tagline ? <p className={cn(eyebrowClass, "mb-5")}>{site.tagline}</p> : null}
            <h1 className="text-[2.25rem] leading-[2.75rem] font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[3.25rem]">
              {site.hero_title}
            </h1>
            {site.hero_subtitle ? (
              <p className="mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">{site.hero_subtitle}</p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryBoard ? (
                <Link to={boardPath(primaryBoard.slug)} className={btn("primary", "lg")}>
                  {S.home.ctaFeedback}
                </Link>
              ) : (
                <a href="#rm-boards" className={btn("primary", "lg")}>
                  {S.home.ctaFeedback}
                </a>
              )}
              {primaryBoard && features.roadmap ? (
                <Link to={roadmapPath(primaryBoard.slug)} className={btn("outline", "lg")}>
                  {S.home.ctaRoadmap}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className={cn(containerClass, "space-y-16 py-12 sm:py-16")}>
        <section id="rm-boards" aria-labelledby="rm-boards-h" className="scroll-mt-8">
          <div className="mb-6 max-w-xl">
            <h2 id="rm-boards-h" className="text-2xl font-semibold tracking-tight">
              {S.home.boardsTitle}
            </h2>
            <p className="mt-1.5 text-muted-foreground">{S.home.boardsHint}</p>
          </div>
          {boards.length === 0 ? (
            <EmptyState icon={Lightbulb} title={S.home.noBoardsTitle} body={S.home.noBoardsBody} />
          ) : (
            <ul className={cn("grid gap-4", boards.length === 1 ? "max-w-xl" : "sm:grid-cols-2 lg:grid-cols-3")}>
              {boards.map((b) => (
                <li key={b.slug}>
                  <BoardCard board={b} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {features.changelog && latest.length > 0 ? (
          <section aria-labelledby="rm-latest-h">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="rm-latest-h" className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
                <Megaphone aria-hidden="true" className="size-5 text-muted-foreground" />
                {S.home.latestTitle}
              </h2>
              <Link to={changelogPath()} className="inline-flex items-center gap-1.5 text-sm font-medium text-(--rm-accent-strong) hover:underline">
                {S.home.allUpdates}
                <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
              </Link>
            </div>
            <ul className={cn(cardClass, "divide-y divide-border/60 overflow-hidden")}>
              {latest.map((e) => (
                <li key={e.slug}>
                  <Link
                    to={changelogEntryPath(e.slug)}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-4 transition-colors duration-150 hover:bg-muted/40"
                  >
                    <LabelBadge label={e.label} className="w-[4.5rem] justify-center" />
                    <span className="min-w-0 flex-1 basis-56 font-medium text-balance">{e.title}</span>
                    <time dateTime={isoOrUndefined(e.published_at)} className="text-sm text-muted-foreground">
                      {formatDate(e.published_at)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}
