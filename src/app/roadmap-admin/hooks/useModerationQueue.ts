// src/app/roadmap-admin/hooks/useModerationQueue.ts
import { useCallback, useEffect } from "react"
import { useModerationStore, type QueueKind } from "../store/moderationStore"

/** Loads both queues on mount (tab counts) and re-loads the posts queue when the board changes. */
export function useModerationQueue(boardId: number | null) {
  const posts = useModerationStore((s) => s.posts)
  const comments = useModerationStore((s) => s.comments)
  const fetchQueue = useModerationStore((s) => s.fetchQueue)
  const decide = useModerationStore((s) => s.decide)
  const decideMany = useModerationStore((s) => s.decideMany)
  const requeue = useModerationStore((s) => s.requeue)

  useEffect(() => {
    void fetchQueue("posts", boardId ?? undefined)
  }, [boardId, fetchQueue])

  useEffect(() => {
    void fetchQueue("comments")
  }, [fetchQueue])

  const refetch = useCallback(
    (kind: QueueKind) => fetchQueue(kind, kind === "posts" ? (boardId ?? undefined) : undefined),
    [fetchQueue, boardId]
  )

  return { posts, comments, refetch, decide, decideMany, requeue }
}
