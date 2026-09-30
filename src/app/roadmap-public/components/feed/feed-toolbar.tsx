import { useEffect, useRef, useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebouncedValue } from "../../hooks/useDebouncedValue"
import { S } from "../../lib/strings"
import { inputClass } from "../../lib/ui"
import type { PostSort } from "../../types"

// ─── Sort ──────────────────────────────────────────────────────────

const SORTS: PostSort[] = ["top", "new", "trending"]

export function SortTabs({ value, onChange }: { value: PostSort; onChange: (sort: PostSort) => void }) {
  return (
    <div role="group" aria-label={S.feed.sortLabel} className="order-last flex w-full rounded-lg bg-muted p-0.5 sm:order-none sm:inline-flex sm:w-auto">
      {SORTS.map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={value === s}
          onClick={() => onChange(s)}
          className={cn(
            "h-9 flex-1 rounded-md px-3.5 text-sm font-medium sm:flex-none transition-[background-color,color,box-shadow,transform] duration-150 ease-out motion-safe:active:scale-[0.97]",
            value === s
              ? "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {S.feed.sort[s]}
        </button>
      ))}
    </div>
  )
}

// ─── Toolbar ───────────────────────────────────────────────────────

interface Props {
  q: string
  sort: PostSort
  activeFilters: number
  onSearch: (q: string) => void
  onSort: (sort: PostSort) => void
  onOpenFilters: () => void
}

/** Search (debounced 300 ms), sort, and the mobile filters trigger. Remount with `key` to reset the text. */
export function FeedToolbar({ q, sort, activeFilters, onSearch, onSort, onOpenFilters }: Props) {
  const [text, setText] = useState(q)
  const debounced = useDebouncedValue(text, 300)
  const latest = useRef({ q, onSearch })

  useEffect(() => {
    latest.current = { q, onSearch }
  })

  // Only the debounced text drives the URL; external changes are handled by remounting.
  useEffect(() => {
    if (debounced.trim() !== latest.current.q) latest.current.onSearch(debounced)
  }, [debounced])

  return (
    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
      <div className="relative min-w-0 flex-1">
        <label htmlFor="rm-search" className="sr-only">
          {S.feed.searchLabel}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id="rm-search"
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={S.feed.searchPlaceholder}
          autoComplete="off"
          className={cn(inputClass, "h-10 ps-9 pe-9 [&::-webkit-search-cancel-button]:hidden")}
        />
        {text ? (
          <button
            type="button"
            onClick={() => setText("")}
            aria-label={S.feed.clearSearch}
            className="absolute end-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenFilters}
        aria-label={activeFilters > 0 ? S.feed.filtersActive(activeFilters) : S.feed.filters}
        className="relative inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-[background-color,transform] duration-150 ease-out hover:bg-muted/60 motion-safe:active:scale-[0.97] lg:hidden"
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        <span className="hidden min-[400px]:inline">{S.feed.filters}</span>
        {activeFilters > 0 ? (
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[0.6875rem] font-semibold text-primary-foreground">
            {activeFilters}
          </span>
        ) : null}
      </button>

      <SortTabs value={sort} onChange={onSort} />
    </div>
  )
}
