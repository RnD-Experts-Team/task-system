import { useCallback, useEffect, useState } from "react"
import { isAbortError } from "../api/publicApiClient"
import { roadmapPublicService } from "../api/roadmapPublicService"
import type { Pagination, PublicComment } from "../types"

interface State {
  tag: string
  items: PublicComment[]
  pagination: Pagination | null
  error: unknown
  moreLoading: boolean
}

const INITIAL: State = { tag: "", items: [], pagination: null, error: null, moreLoading: false }

/** Comments of one post (oldest first, replies nested one level) with load-more and local append. */
export function useComments(board: string, number: number, enabled: boolean) {
  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState<State>(INITIAL)
  const tag = enabled ? `${board}:${number}#${nonce}` : null

  useEffect(() => {
    if (tag === null) return
    const controller = new AbortController()
    roadmapPublicService
      .listComments(board, number, 1, controller.signal)
      .then((page) => setState({ ...INITIAL, tag, items: page.items, pagination: page.pagination }))
      .catch((error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) return
        setState({ ...INITIAL, tag, error })
      })
    return () => controller.abort()
  }, [tag, board, number])

  const current = tag !== null && state.tag === tag
  const pagination = current ? state.pagination : null
  const hasMore = pagination ? pagination.current_page < pagination.last_page : false

  const loadMore = useCallback(() => {
    if (!current || !pagination || state.moreLoading || pagination.current_page >= pagination.last_page) return
    setState((s) => ({ ...s, moreLoading: true }))
    roadmapPublicService
      .listComments(board, number, pagination.current_page + 1)
      .then((page) =>
        setState((s) => {
          if (s.tag !== tag) return s
          const seen = new Set(s.items.map((c) => c.id))
          return {
            ...s,
            items: [...s.items, ...page.items.filter((c) => !seen.has(c.id))],
            pagination: page.pagination,
            moreLoading: false,
          }
        }),
      )
      .catch(() => setState((s) => ({ ...s, moreLoading: false })))
  }, [current, pagination, state.moreLoading, board, number, tag])

  /** Adds an approved comment to the visible thread without refetching. */
  const append = useCallback((comment: PublicComment) => {
    setState((s) => {
      if (comment.parent_id === null) return { ...s, items: [...s.items, comment] }
      return {
        ...s,
        items: s.items.map((c) => (c.id === comment.parent_id ? { ...c, replies: [...c.replies, comment] } : c)),
      }
    })
  }, [])

  return {
    items: current ? state.items : [],
    total: pagination?.total ?? 0,
    loading: tag !== null && !current,
    error: current ? state.error : null,
    hasMore,
    moreLoading: current && state.moreLoading,
    loadMore,
    append,
    reload: () => setNonce((n) => n + 1),
  }
}
