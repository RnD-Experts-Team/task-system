import { X } from "lucide-react"
import { S } from "../../lib/strings"
import type { BoardDetail } from "../../types"

interface Props {
  board: BoardDetail
  status: string[]
  tag: string[]
  onStatus: (next: string[]) => void
  onTag: (next: string[]) => void
  onClear: () => void
}

/** Removable chips for the applied filters (most useful on mobile where the panel is hidden). */
export function ActiveFilters({ board, status, tag, onStatus, onTag, onClear }: Props) {
  if (status.length + tag.length === 0) return null
  const chip =
    "inline-flex h-8 items-center gap-1.5 rounded-full bg-(--rm-accent-soft) ps-3 pe-2 text-[0.8125rem] font-medium text-(--rm-accent-strong) transition-transform duration-150 motion-safe:active:scale-[0.97]"
  return (
    <ul aria-label={S.feed.filters} className="flex flex-wrap items-center gap-2">
      {status.map((slug) => {
        const name = board.statuses.find((s) => s.slug === slug)?.name ?? slug
        return (
          <li key={`s-${slug}`}>
            <button type="button" className={chip} onClick={() => onStatus(status.filter((s) => s !== slug))}>
              {name}
              <X aria-hidden="true" className="size-3.5" />
              <span className="sr-only">{S.feed.removeFilter(name)}</span>
            </button>
          </li>
        )
      })}
      {tag.map((slug) => {
        const name = board.tags.find((t) => t.slug === slug)?.name ?? slug
        return (
          <li key={`t-${slug}`}>
            <button type="button" className={chip} onClick={() => onTag(tag.filter((t) => t !== slug))}>
              {name}
              <X aria-hidden="true" className="size-3.5" />
              <span className="sr-only">{S.feed.removeFilter(name)}</span>
            </button>
          </li>
        )
      })}
      <li>
        <button
          type="button"
          onClick={onClear}
          className="h-8 rounded-full px-2 text-[0.8125rem] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {S.feed.clearFilters}
        </button>
      </li>
    </ul>
  )
}
