import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { formatDate, isoOrUndefined } from "../../lib/format"
import { S } from "../../lib/strings"
import { changelogEntryPath } from "../../lib/url"
import type { ChangelogListItem } from "../../types"
import { LabelBadge } from "./label-badge"

/** Vertical timeline: date rail on desktop, stacked on mobile. */
export function ChangelogTimeline({ items }: { items: ChangelogListItem[] }) {
  return (
    <ol className="relative space-y-10 ps-6 before:absolute before:inset-y-2 before:start-[0.3125rem] before:w-px before:bg-border md:space-y-12 md:ps-8 md:before:start-[0.4375rem]">
      {items.map((e) => (
        <li key={e.slug} className="relative">
          <span
            aria-hidden="true"
            className="absolute -start-6 top-[0.4375rem] size-[0.6875rem] rounded-full border-2 border-background bg-primary md:-start-8 md:size-3.5"
          />
          <ChangelogEntryCard entry={e} />
        </li>
      ))}
    </ol>
  )
}

export function ChangelogEntryCard({ entry }: { entry: ChangelogListItem }) {
  return (
    <article className="group relative -m-3 rounded-xl p-3 transition-colors duration-150 hover:bg-muted/40">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <LabelBadge label={entry.label} />
        <time dateTime={isoOrUndefined(entry.published_at)} className="text-sm text-muted-foreground">
          {formatDate(entry.published_at, "long")}
        </time>
        {entry.board ? <span className="text-sm text-muted-foreground">&middot; {entry.board.name}</span> : null}
      </div>
      <h2 className="mt-2 text-xl leading-snug font-semibold tracking-tight text-balance sm:text-2xl">
        <Link to={changelogEntryPath(entry.slug)} className="rounded-sm after:absolute after:inset-0 after:content-['']">
          {entry.title}
        </Link>
      </h2>
      {entry.summary ? <p className="mt-2 max-w-2xl text-base text-pretty text-muted-foreground">{entry.summary}</p> : null}
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-(--rm-accent-strong)">
        {S.changelog.readMore}
        <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 rtl:rotate-180" />
      </span>
    </article>
  )
}
