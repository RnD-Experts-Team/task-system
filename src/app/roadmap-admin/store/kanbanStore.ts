// src/app/roadmap-admin/store/kanbanStore.ts
// Roadmap board data + the optimistic move (with rollback on failure). Only one move is in
// flight at a time; the UI ignores further drags until it settles, so rollbacks can never
// clobber a newer optimistic state.

import { create } from "zustand"
import { isCancel } from "axios"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { extractErrorMessage } from "../utils/format"
import { attempt } from "../utils/mutation"
import type { AdminRoadmapData, KanbanColumn } from "../types"
import type { MoveResult } from "../utils/kanban"

interface KanbanState {
  boardId: number | null
  data: AdminRoadmapData | null
  loading: boolean
  error: string | null
  moving: boolean
}

interface KanbanActions {
  fetchRoadmap: (boardId: number) => Promise<void>
  /** Optimistically apply a computed move, call the API, roll back on failure. */
  commitMove: (boardId: number, postId: number, move: MoveResult) => Promise<boolean>
  clear: () => void
}

export const useKanbanStore = create<KanbanState & KanbanActions>()((set, get) => ({
  boardId: null,
  data: null,
  loading: false,
  error: null,
  moving: false,

  fetchRoadmap: async (boardId) => {
    set({ loading: true, error: null, boardId, data: get().boardId === boardId ? get().data : null })
    try {
      const data = await roadmapAdminService.getRoadmap(boardId)
      // Ignore a late response for a board the user already navigated away from
      if (get().boardId === boardId) set({ data })
    } catch (err) {
      if (!isCancel(err) && get().boardId === boardId) {
        set({ error: extractErrorMessage(err, "Failed to load the roadmap board.") })
      }
    } finally {
      if (get().boardId === boardId) set({ loading: false })
    }
  },

  commitMove: async (boardId, postId, move) => {
    const snapshot = get().data
    if (!snapshot || get().moving) return false
    const nextColumns: KanbanColumn[] = move.columns
    set({ data: { ...snapshot, columns: nextColumns }, moving: true })

    const result = await attempt(
      () =>
        roadmapAdminService.moveOnRoadmap(boardId, {
          post_id: postId,
          to_status_id: move.toStatusId,
          ordered_ids: move.orderedIds,
        }),
      "Failed to move the card."
    )
    if (!result.ok) {
      set({ data: snapshot, moving: false })
      return false
    }
    set({ moving: false })
    return true
  },

  clear: () => set({ boardId: null, data: null, error: null, loading: false, moving: false }),
}))
