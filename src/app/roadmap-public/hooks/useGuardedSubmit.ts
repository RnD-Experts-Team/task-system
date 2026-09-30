import { useCallback, useEffect, useRef } from "react"
import { isPublicApiError } from "../api/publicApiClient"
import { roadmapPublicService } from "../api/roadmapPublicService"
import type { FormKind, FormStartResult } from "../types"

interface Held {
  result: FormStartResult
  fetchedAt: number
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Signed single-use form token handling for posts and comments.
 * - `prefetch()` on first focus (cheap, idempotent)
 * - `run(send)` waits out the server's minimum fill time, sends, and silently refetches on `form_expired`
 */
export function useGuardedSubmit(kind: FormKind, board: string) {
  const held = useRef<Held | null>(null)
  const pending = useRef<Promise<Held> | null>(null)
  const boardRef = useRef(board)

  useEffect(() => {
    if (boardRef.current !== board) {
      boardRef.current = board
      held.current = null
      pending.current = null
    }
  }, [board])

  const fetchToken = useCallback((): Promise<Held> => {
    if (held.current) return Promise.resolve(held.current)
    if (pending.current) return pending.current
    const request = roadmapPublicService
      .startForm(kind, board)
      .then((result) => {
        const next = { result, fetchedAt: Date.now() }
        held.current = next
        return next
      })
      .finally(() => {
        pending.current = null
      })
    pending.current = request
    return request
  }, [kind, board])

  const prefetch = useCallback(() => {
    fetchToken().catch(() => undefined)
  }, [fetchToken])

  const run = useCallback(
    async <T,>(send: (formToken: string) => Promise<T>): Promise<T> => {
      for (let attempt = 0; ; attempt++) {
        const token = await fetchToken()
        held.current = null // single use
        const wait = token.fetchedAt + token.result.min_seconds * 1000 + 300 - Date.now()
        if (wait > 0) await sleep(wait)
        try {
          return await send(token.result.form_token)
        } catch (error) {
          if (isPublicApiError(error)) {
            if (error.status === 422) held.current = token // token untouched by validation failures
            if (error.code === "form_expired" && attempt === 0) continue
          }
          throw error
        }
      }
    },
    [fetchToken],
  )

  const discard = useCallback(() => {
    held.current = null
  }, [])

  return { prefetch, run, discard }
}
