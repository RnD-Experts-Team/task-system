import { useEffect, useRef } from "react"

/**
 * Calls `onReach` when the returned sentinel ref scrolls near the viewport.
 * Pair with a visible "Load more" button as the keyboard / no-IntersectionObserver fallback.
 */
export function useInfiniteScroll(onReach: () => void, enabled: boolean) {
  const sentinel = useRef<HTMLDivElement | null>(null)
  const handler = useRef(onReach)

  useEffect(() => {
    handler.current = onReach
  })

  useEffect(() => {
    const node = sentinel.current
    if (!enabled || !node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) handler.current()
      },
      { rootMargin: "480px 0px" },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled])

  return sentinel
}
