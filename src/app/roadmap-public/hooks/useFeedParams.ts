import { useCallback } from "react"
import { useSearchParams } from "react-router"
import { splitParam } from "../lib/url"
import type { PostSort } from "../types"

export interface FeedFilters {
  q: string
  sort: PostSort
  status: string[]
  tag: string[]
}

export type FeedPatch = Partial<FeedFilters>

/** Feed search/sort/filters live in the URL so links, back/forward and "See all N" just work. */
export function useFeedParams() {
  const [params, setParams] = useSearchParams()
  const sortRaw = params.get("sort")
  const filters: FeedFilters = {
    q: params.get("q") ?? "",
    sort: sortRaw === "new" || sortRaw === "trending" ? sortRaw : "top",
    status: splitParam(params.get("status")),
    tag: splitParam(params.get("tag")),
  }

  const update = useCallback(
    (patch: FeedPatch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const set = (key: string, value: string | string[] | undefined, empty: boolean) => {
            if (value === undefined) return
            if (empty) next.delete(key)
            else next.set(key, Array.isArray(value) ? value.join(",") : value)
          }
          set("q", patch.q?.trim(), patch.q !== undefined && patch.q.trim() === "")
          set("sort", patch.sort, patch.sort === "top")
          set("status", patch.status, patch.status !== undefined && patch.status.length === 0)
          set("tag", patch.tag, patch.tag !== undefined && patch.tag.length === 0)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const activeFilterCount = filters.status.length + filters.tag.length
  return { filters, update, activeFilterCount, hasAny: activeFilterCount > 0 || filters.q !== "" }
}
