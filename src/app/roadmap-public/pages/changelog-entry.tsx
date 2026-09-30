import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { Link, useParams } from "react-router"
import { cn } from "@/lib/utils"
import { LabelBadge } from "../components/changelog/label-badge"
import { ErrorState } from "../components/common/error-state"
import { Skel } from "../components/common/skeletons"
import { TrustedHtml } from "../components/common/trusted-html"
import { usePageMeta } from "../hooks/usePageMeta"
import { useResource } from "../hooks/useResource"
import { roadmapPublicService } from "../api/roadmapPublicService"
import { isNotFound } from "../lib/errors"
import { formatDate, isoOrUndefined } from "../lib/format"
import { S } from "../lib/strings"
import { cardClass, containerClass } from "../lib/ui"
import { changelogEntryPath, changelogPath, postPath } from "../lib/url"
import { useSiteStore } from "../stores/siteStore"
import type { ChangelogDetail } from "../types"
import NotFoundPage from "./not-found"

export default function PublicChangelogEntryPage() {
  const { slug } = useParams()
  const siteName = useSiteStore((s) => s.config?.site.name ?? "")
  const res = useResource<ChangelogDetail>(slug ? `entry:${slug}` : null, (signal) =>
    roadmapPublicService.getChangelogEntry(slug as string, signal),
  )
  const entry = res.data

  usePageMeta({
    title: entry ? `${entry.title} | ${S.changelog.title} | ${siteName}` : `${S.changelog.title} | ${siteName}`,
    description: entry?.summary ?? undefined,
    canonical: entry ? changelogEntryPath(entry.slug) : undefined,
  })

  if (res.error) {
    return isNotFound(res.error) ? (
      <NotFoundPage />
    ) : (
      <div className={cn(containerClass, "py-16")}>
        <ErrorState error={res.error} onRetry={res.reload} className="mx-auto max-w-lg" />
      </div>
    )
  }

  return (
    <div className={cn(containerClass, "py-8 sm:py-12")}>
      <div className="mx-auto max-w-2xl">
        <Link
          to={changelogPath()}
          className="-ms-2 mb-8 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          {S.changelog.backToChangelog}
        </Link>

        {!entry ? (
          <div role="status" aria-label={S.common.loading} className="space-y-4">
            <Skel className="h-5 w-40" />
            <Skel className="h-10 w-4/5" />
            <Skel className="h-40 w-full" />
          </div>
        ) : (
          <article>
            <header className="mb-8 space-y-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <LabelBadge label={entry.label} />
                <time dateTime={isoOrUndefined(entry.published_at)} className="text-sm text-muted-foreground">
                  {formatDate(entry.published_at, "long")}
                </time>
                {entry.board ? <span className="text-sm text-muted-foreground">&middot; {entry.board.name}</span> : null}
              </div>
              <h1 className="text-[2rem] leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{entry.title}</h1>
              {entry.summary ? <p className="text-lg text-pretty text-muted-foreground">{entry.summary}</p> : null}
            </header>

            <TrustedHtml html={entry.body_html} />

            {entry.related_posts.length > 0 ? (
              <section aria-labelledby="rm-related-h" className="mt-12">
                <h2 id="rm-related-h" className="mb-3 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                  {S.changelog.relatedIdeas}
                </h2>
                <ul className="space-y-2">
                  {entry.related_posts.map((p) => (
                    <li key={`${p.board_slug}-${p.number}`}>
                      <Link
                        to={postPath(p.board_slug, p.number, p.slug)}
                        className={cn(
                          cardClass,
                          "group flex items-center gap-3 px-4 py-3 text-sm font-medium transition-[transform,border-color] duration-150 ease-out hover:border-border motion-safe:hover:-translate-y-px",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{p.title}</span>
                        <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </article>
        )}
      </div>
    </div>
  )
}
