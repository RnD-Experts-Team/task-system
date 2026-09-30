import { useCallback, useEffect, useRef, useState } from "react"
import { isAbortError } from "../api/publicApiClient"

interface State<T> {
  tag: string
  data: T | null
  error: unknown
}

export interface Resource<T> {
  data: T | null
  error: unknown
  /** True while the request for the current key is running. */
  loading: boolean
  reload: () => void
}

/**
 * Minimal keyed GET hook with AbortController. `key === null` disables the request.
 * Loading state is derived from the key so no state is set synchronously in the effect.
 * With `keepPrevious` the last successful data stays available while a new key loads.
 */
export function useResource<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: { keepPrevious?: boolean } = {},
): Resource<T> {
  const [nonce, setNonce] = useState(0)
  const [state, setState] = useState<State<T>>({ tag: "", data: null, error: null })
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const tag = key === null ? null : `${key}#${nonce}`

  useEffect(() => {
    if (tag === null) return
    const controller = new AbortController()
    fetcherRef
      .current(controller.signal)
      .then((data) => setState({ tag, data, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error) || controller.signal.aborted) return
        setState((prev) => ({ tag, data: options.keepPrevious ? prev.data : null, error }))
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  const current = state.tag === tag

  return {
    data: current || options.keepPrevious ? state.data : null,
    error: current ? state.error : null,
    loading: tag !== null && !current,
    reload,
  }
}
