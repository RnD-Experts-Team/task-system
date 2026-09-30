import { roadmapPublicService } from "../api/roadmapPublicService"
import { useDebouncedValue } from "./useDebouncedValue"
import { useResource } from "./useResource"

export const SIMILAR_MIN_CHARS = 4
export const SIMILAR_DEBOUNCE_MS = 300

/** Debounced (300 ms) duplicate suggestions with request cancellation while typing. */
export function useSimilarPosts(board: string, title: string, enabled: boolean) {
  const q = useDebouncedValue(title.trim(), SIMILAR_DEBOUNCE_MS)
  const active = enabled && q.length >= SIMILAR_MIN_CHARS
  const res = useResource(
    active ? `similar:${board}:${q}` : null,
    (signal) => roadmapPublicService.similarPosts(board, q, signal),
    { keepPrevious: true },
  )
  const typing = title.trim() !== q
  return {
    suggestions: active && !res.error ? (res.data ?? []) : [],
    loading: enabled && (res.loading || (typing && title.trim().length >= SIMILAR_MIN_CHARS)),
  }
}
