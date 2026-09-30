import { S } from "../../lib/strings"
import { safeColor } from "../../lib/format"
import { cn } from "@/lib/utils"
import type { BoardDetail } from "../../types"

interface Props {
  board: BoardDetail
  status: string[]
  tag: string[]
  onStatus: (next: string[]) => void
  onTag: (next: string[]) => void
  idPrefix: string
}

const toggle = (list: string[], slug: string) => (list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug])

/** Status checkboxes (with counts) and tag chips. Used in the desktop sidebar and the mobile drawer. */
export function FiltersPanel({ board, status, tag, onStatus, onTag, idPrefix }: Props) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">{S.feed.status}</legend>
        <ul className="space-y-0.5">
          {board.statuses.map((st) => {
            const id = `${idPrefix}-status-${st.slug}`
            return (
              <li key={st.slug}>
                <label
                  htmlFor={id}
                  className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm transition-colors hover:bg-muted/60"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={status.includes(st.slug)}
                    onChange={() => onStatus(toggle(status, st.slug))}
                    className="size-4 rounded accent-primary"
                  />
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: safeColor(st.color) }} />
                  <span className="min-w-0 flex-1 truncate">{st.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{st.posts_count}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>

      {board.tags.length > 0 ? (
        <fieldset>
          <legend className="mb-2 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">{S.feed.tags}</legend>
          <div className="flex flex-wrap gap-2">
            {board.tags.map((t) => {
              const on = tag.includes(t.slug)
              return (
                <button
                  key={t.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onTag(toggle(tag, t.slug))}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[0.8125rem] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out motion-safe:active:scale-[0.97]",
                    on
                      ? "border-primary/50 bg-(--rm-accent-soft) text-(--rm-accent-strong)"
                      : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                  )}
                >
                  {t.name}
                  <span className="text-xs tabular-nums opacity-70">{t.posts_count}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : null}
    </div>
  )
}
