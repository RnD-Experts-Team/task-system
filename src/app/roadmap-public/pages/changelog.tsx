import { Loader2, Megaphone, Rss } from "lucide-react"
import { useSearchParams } from "react-router"
import { cn } from "@/lib/utils"
import { ChangelogTimeline } from "../components/changelog/changelog-timeline"
import { EmptyState } from "../components/common/empty-state"
import { ErrorState } from "../components/common/error-state"
import { ChangelogSkeleton } from "../components/common/skeletons"
import { useChangelogList } from "../hooks/useChangelog"
import { useInfiniteScroll } from "../hooks/useInfiniteScroll"
import { usePageMeta } from "../hooks/usePageMeta"
import { S } from "../lib/strings"
import { btn, containerClass, eyebrowClass, inputClass } from "../lib/ui"
import { RSS_URL, changelogPath } from "../lib/url"
import { useSiteStore } from "../stores/siteStore"
import type { ChangelogLabel } from "../types"

const LABELS: ChangelogLabel[] = ["new", "improved", "fixed"]

export default function PublicChangelogPage() {
  const config = useSiteStore((s) => s.config)
  const [params, setParams] = useSearchParams()
  const boardParam = params.get("board") ?? undefined
  const labelRaw = params.get("label")
  const label = LABELS.find((l) => l === labelRaw)
  const boards = config?.boards ?? []
  const enabled = config?.features.changelog ?? false
  const list = useChangelogList(boardParam, label, enabled)
  const sentinel = useInfiniteScroll(list.loadMore, list.hasMore && !list.moreLoading)

  usePageMeta({
    title: S.meta.changelogTitle(config?.site.name ?? ""),
    description: S.meta.changelogDescription(config?.site.name ?? ""),
    canonical: changelogPath(),
  })

  function setParam(key: "board" | "label", value: string | undefined) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  if (config && !config.features.changelog) {
    return (
      <div className={cn(containerClass, "py-16")}>
        <ErrorState title={S.errors.notFoundTitle} message={S.changelog.featureOff} className="mx-auto max-w-lg" />
      </div>
    )
  }

  const chip = (active: boolean) =>
    cn(
      "h-9 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out motion-safe:active:scale-[0.97]",
      active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
    )

  return (
    <div className={cn(containerClass, "py-8 sm:py-12")}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
        <div className="max-w-2xl">
          <p className={cn(eyebrowClass, "mb-3")}>{config?.site.name}</p>
          <h1 className="text-[2rem] leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{S.changelog.title}</h1>
          <p className="mt-3 text-base text-pretty text-muted-foreground">{S.changelog.subtitle}</p>
        </div>
        {config?.features.rss ? (
          <a href={RSS_URL} className={btn("outline", "md")}>
            <Rss aria-hidden="true" className="size-4" />
            {S.changelog.rss}
          </a>
        ) : null}
      </header>

      <div className="mb-10 flex flex-wrap items-center gap-2">
        <div role="group" aria-label={S.changelog.filterLabel} className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!label} onClick={() => setParam("label", undefined)} className={chip(!label)}>
            {S.changelog.filterAll}
          </button>
          {LABELS.map((l) => (
            <button key={l} type="button" aria-pressed={label === l} onClick={() => setParam("label", l)} className={chip(label === l)}>
              {S.changelog.label[l]}
            </button>
          ))}
        </div>
        {boards.length > 1 ? (
          <div className="ms-auto">
            <label htmlFor="rm-cl-board" className="sr-only">
              {S.changelog.boardFilter}
            </label>
            <select
              id="rm-cl-board"
              value={boardParam ?? ""}
              onChange={(e) => setParam("board", e.target.value || undefined)}
              className={cn(inputClass, "h-9 w-auto cursor-pointer py-0 pe-8 text-sm")}
            >
              <option value="">{S.changelog.allBoards}</option>
              {boards.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {list.error ? (
        <ErrorState error={list.error} onRetry={list.reload} />
      ) : list.loading ? (
        <ChangelogSkeleton />
      ) : list.items.length === 0 ? (
        <EmptyState icon={Megaphone} title={S.changelog.emptyTitle} body={S.changelog.emptyBody} />
      ) : (
        <>
          <ChangelogTimeline items={list.items} />
          {list.hasMore ? (
            <div className="mt-10 flex justify-center">
              <div ref={sentinel} aria-hidden="true" className="h-px w-px" />
              <button type="button" onClick={list.loadMore} disabled={list.moreLoading} className={btn("outline", "md")}>
                {list.moreLoading ? <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : null}
                {S.changelog.loadMore}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
