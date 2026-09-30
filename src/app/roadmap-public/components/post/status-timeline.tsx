import { formatDate, isoOrUndefined, safeColor } from "../../lib/format"
import { S } from "../../lib/strings"
import type { StatusHistoryEntry } from "../../types"

interface Props {
  history: StatusHistoryEntry[]
  createdAt: string | null
}

/** Newest first: each status change with its optional public note, ending with the original post. */
export function StatusTimeline({ history, createdAt }: Props) {
  const entries = [...history].sort((a, b) => (a.at < b.at ? 1 : -1))
  if (entries.length === 0 && !createdAt) return null
  return (
    <section aria-label={S.post.historyHeading}>
      <h2 className="mb-3 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">{S.post.historyHeading}</h2>
      <ol className="relative space-y-4 ps-5 before:absolute before:inset-y-1.5 before:start-[0.3125rem] before:w-px before:bg-border">
        {entries.map((e, i) => (
          <li key={`${e.at}-${i}`} className="relative">
            <span
              aria-hidden="true"
              className="absolute -start-5 top-1.5 size-[0.6875rem] rounded-full border-2 border-background"
              style={{ backgroundColor: safeColor(e.to.color) }}
            />
            <p className="text-sm font-medium">{S.post.historyMoved(e.from?.name ?? null, e.to.name)}</p>
            {e.note ? <p className="mt-0.5 text-sm text-pretty text-muted-foreground">{e.note}</p> : null}
            <time dateTime={isoOrUndefined(e.at)} className="mt-0.5 block text-xs text-muted-foreground">
              {formatDate(e.at)}
            </time>
          </li>
        ))}
        {createdAt ? (
          <li className="relative">
            <span aria-hidden="true" className="absolute -start-5 top-1.5 size-[0.6875rem] rounded-full border-2 border-background bg-muted-foreground/40" />
            <p className="text-sm font-medium">{S.post.historyCreated}</p>
            <time dateTime={isoOrUndefined(createdAt)} className="mt-0.5 block text-xs text-muted-foreground">
              {formatDate(createdAt)}
            </time>
          </li>
        ) : null}
      </ol>
    </section>
  )
}
