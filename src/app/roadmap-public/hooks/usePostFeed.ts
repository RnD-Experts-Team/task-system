import { useEffect, useState } from "react"
import { isAbortError } from "../api/publicApiClient"
import { roadmapPublicService } from "../api/roadmapPublicService"
import { useViewerStore } from "../stores/viewerStore"
import { PUBLIC_POST_PAGE_SIZE, type Pagination, type PostSort, type PublicPostListItem } from "../types"

export interface FeedParams {
  board: string
  q: string
  sort: PostSort
  status: string[]
  tag: string[]
}

interface FeedState {
  tag: string
  items: PublicPostListItem[]
  pagination: Pagination | null
  error: unknown
  moreLoading: boolean
  moreError: unknown
}

const INITIAL: FeedState = { tag: "", items: [], pagination: null, error: null, moreLoading: false, moreError: null }

/** Paginated post list with search/sort/filters, reload and "load more". */
export function usePostFeed({ board, q, sort, status, tag }: FeedParams) {
  const statusKey = status.join(",")
  const tagKey = tag.join(",")
  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState<FeedState>(INITIAL)
  const feedTag = JSON.stringify([board, q, sort, statusKey, tagKey, nonce])

  useEffect(() => {
    const controller = new AbortController()
    roadmapPublicService
      .listPosts(
        board,
        {
          q: q || undefined,
          sort,
          status: statusKey ? statusKey.split(",") : undefined,
          tag: tagKey ? tagKey.split(",") : undefined,
          page: 1,
          per_page: PUBLIC_POST_PAGE_SIZE,
        },
        controller.signal,
      )
      .then((page) => {
        // Fresh server counts win over optimistic leftovers.
        useViewerStore.getState().forgetCounts(board)
        setState({ ...INITIAL, tag: feedTag, items: page.items, pagination: page.pagination })
      })
      .catch((error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) return
        setState({ ...INITIAL, tag: feedTag, error })
      })
    return () => controller.abort()
  }, [board, q, sort, statusKey, tagKey, feedTag])

  const current = state.tag === feedTag
  const loading = !current
  const items = current ? state.items : []
  const pagination = current ? state.pagination : null
  const hasMore = pagination ? pagination.current_page < pagination.last_page : false

  const loadMore = () => {
    if (!current || !pagination || state.moreLoading || pagination.current_page >= pagination.last_page) return
    const nextPage = pagination.current_page + 1
    setState((s) => (s.tag === feedTag ? { ...s, moreLoading: true, moreError: null } : s))
    roadmapPublicService
      .listPosts(
        board,
        {
          q: q || undefined,
          sort,
          status: statusKey ? statusKey.split(",") : undefined,
          tag: tagKey ? tagKey.split(",") : undefined,
          page: nextPage,
          per_page: PUBLIC_POST_PAGE_SIZE,
        },
      )
      .then((page) =>
        setState((s) => {
          if (s.tag !== feedTag) return s
          const seen = new Set(s.items.map((p) => p.number))
          return {
            ...s,
            items: [...s.items, ...page.items.filter((p) => !seen.has(p.number))],
            pagination: page.pagination,
            moreLoading: false,
          }
        }),
      )
      .catch((error: unknown) => setState((s) => (s.tag === feedTag ? { ...s, moreLoading: false, moreError: error } : s)))
  }

  return {
    items,
    pagination,
    loading,
    error: current ? state.error : null,
    hasMore,
    moreLoading: current && state.moreLoading,
    moreError: current ? state.moreError : null,
    loadMore,
    reload: () => setNonce((n) => n + 1),
  }
}
