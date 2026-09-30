// src/app/roadmap-admin/hooks/useRoadmapKanban.ts
import { useCallback, useEffect } from "react"
import { useKanbanStore } from "../store/kanbanStore"

export function useRoadmapKanban(boardId: number | null) {
  const data = useKanbanStore((s) => s.data)
  const loading = useKanbanStore((s) => s.loading)
  const error = useKanbanStore((s) => s.error)
  const moving = useKanbanStore((s) => s.moving)
  const fetchRoadmap = useKanbanStore((s) => s.fetchRoadmap)
  const commitMove = useKanbanStore((s) => s.commitMove)

  useEffect(() => {
    if (boardId) void fetchRoadmap(boardId)
  }, [boardId, fetchRoadmap])

  const refetch = useCallback(() => (boardId ? fetchRoadmap(boardId) : Promise.resolve()), [boardId, fetchRoadmap])

  return {
    // Never show another board's columns while this one loads
    data: data && data.board.id === boardId ? data : null,
    loading,
    error,
    moving,
    refetch,
    commitMove,
  }
}
