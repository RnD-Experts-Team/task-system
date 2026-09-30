import { useCallback, useEffect, useState } from "react"
import { isAbortError } from "../api/publicApiClient"
import { roadmapPublicService } from "../api/roadmapPublicService"
import type { ChangelogLabel, ChangelogListItem, Pagination } from "../types"

interface State {
  tag: string
  items: ChangelogListItem[]
  pagination: Pagination | null
  error: unknown
  moreLoading: boolean
}

const INITIAL: State = { tag: "", items: [], pagination: null, error: null, moreLoading: false }
const PAGE_SIZE = 12

export function useChangelogList(board: string | undefined, label: ChangelogLabel | undefined, enabled = true) {
  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState<State>(INITIAL)
  const tag = enabled ? JSON.stringify([board ?? "", label ?? "", nonce]) : null

  useEffect(() => {
    if (tag === null) return
    const controller = new AbortController()
    roadmapPublicService
      .listChangelog({ board, label, page: 1, per_page: PAGE_SIZE }, controller.signal)
      .then((page) => setState({ ...INITIAL, tag, items: page.items, pagination: page.pagination }))
      .catch((error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) return
        setState({ ...INITIAL, tag, error })
      })
    return () => controller.abort()
  }, [tag, board, label])

  const current = tag !== null && state.tag === tag
  const pagination = current ? state.pagination : null
  const hasMore = pagination ? pagination.current_page < pagination.last_page : false

  const loadMore = useCallback(() => {
    if (!current || !pagination || state.moreLoading || pagination.current_page >= pagination.last_page) return
    setState((s) => ({ ...s, moreLoading: true }))
    roadmapPublicService
      .listChangelog({ board, label, page: pagination.current_page + 1, per_page: PAGE_SIZE })
      .then((page) =>
        setState((s) => {
          if (s.tag !== tag) return s
          const seen = new Set(s.items.map((e) => e.slug))
          return {
            ...s,
            items: [...s.items, ...page.items.filter((e) => !seen.has(e.slug))],
            pagination: page.pagination,
            moreLoading: false,
          }
        }),
      )
      .catch(() => setState((s) => ({ ...s, moreLoading: false })))
  }, [current, pagination, state.moreLoading, board, label, tag])

  return {
    items: current ? state.items : [],
    loading: tag !== null && !current,
    error: current ? state.error : null,
    hasMore,
    moreLoading: current && state.moreLoading,
    loadMore,
    reload: () => setNonce((n) => n + 1),
  }
}
