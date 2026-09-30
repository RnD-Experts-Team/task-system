// src/app/roadmap-admin/hooks/useBoards.ts
// Boards list (fetched once, cached in the store) and per-board detail (statuses + tags).

import { useCallback, useEffect } from "react"
import { useBoardsStore } from "../store/boardsStore"
import type { AdminStatus, AdminTag } from "../types"

const NO_STATUSES: AdminStatus[] = []
const NO_TAGS: AdminTag[] = []

export function useBoards() {
  const boards = useBoardsStore((s) => s.boards)
  const loading = useBoardsStore((s) => s.loading)
  const error = useBoardsStore((s) => s.error)
  const loaded = useBoardsStore((s) => s.loaded)
  const fetchBoards = useBoardsStore((s) => s.fetchBoards)

  useEffect(() => {
    void fetchBoards()
  }, [fetchBoards])

  const refetch = useCallback(() => fetchBoards(true), [fetchBoards])
  return { boards, loading: loading || !loaded, error, refetch }
}

export function useBoardDetail(boardId: number | null | undefined) {
  const board = useBoardsStore((s) => (boardId ? s.details[boardId] : undefined))
  const loading = useBoardsStore((s) => (boardId ? Boolean(s.detailLoading[boardId]) : false))
  const error = useBoardsStore((s) => (boardId ? (s.detailError[boardId] ?? null) : null))
  const fetchBoardDetail = useBoardsStore((s) => s.fetchBoardDetail)

  useEffect(() => {
    if (boardId) void fetchBoardDetail(boardId)
  }, [boardId, fetchBoardDetail])

  const refetch = useCallback(() => (boardId ? fetchBoardDetail(boardId, true) : Promise.resolve()), [boardId, fetchBoardDetail])

  return {
    board: board ?? null,
    statuses: board?.statuses ?? NO_STATUSES,
    tags: board?.tags ?? NO_TAGS,
    loading: loading || (Boolean(boardId) && !board && !error),
    error,
    refetch,
  }
}
