// src/app/roadmap-admin/store/boardsStore.ts
// Boards list (cached once), per-board detail (statuses + tags), and every board / status / tag
// mutation. Reorders are optimistic with rollback; other mutations refresh the affected slice.

import { create } from "zustand"
import { isCancel } from "axios"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { extractErrorMessage } from "../utils/format"
import { attempt, type MutationResult } from "../utils/mutation"
import type { AdminBoard, AdminStatus, AdminTag, BoardPayload, StatusPayload, TagPayload } from "../types"

// ─── State ────────────────────────────────────────────────────────

interface BoardsState {
  boards: AdminBoard[]
  loading: boolean
  error: string | null
  loaded: boolean

  /** Board detail (with statuses + tags) by id */
  details: Record<number, AdminBoard>
  detailLoading: Record<number, boolean>
  detailError: Record<number, string | null>
}

// ─── Actions ──────────────────────────────────────────────────────

interface BoardsActions {
  fetchBoards: (force?: boolean) => Promise<void>
  fetchBoardDetail: (id: number, force?: boolean) => Promise<void>

  createBoard: (payload: BoardPayload) => Promise<MutationResult<AdminBoard>>
  updateBoard: (id: number, payload: Partial<BoardPayload>, successMessage?: string) => Promise<MutationResult<AdminBoard>>
  deleteBoard: (id: number) => Promise<MutationResult<void>>
  reorderBoards: (ids: number[]) => Promise<void>

  createStatus: (boardId: number, payload: StatusPayload) => Promise<MutationResult<AdminStatus>>
  updateStatus: (boardId: number, id: number, payload: Partial<StatusPayload>) => Promise<MutationResult<AdminStatus>>
  deleteStatus: (boardId: number, id: number, reassignTo?: number | null) => Promise<MutationResult<void>>
  reorderStatuses: (boardId: number, ids: number[]) => Promise<void>
  makeStatusDefault: (boardId: number, id: number) => Promise<MutationResult<void>>

  createTag: (boardId: number, payload: TagPayload) => Promise<MutationResult<AdminTag>>
  updateTag: (boardId: number, id: number, payload: Partial<TagPayload>) => Promise<MutationResult<AdminTag>>
  deleteTag: (boardId: number, id: number) => Promise<MutationResult<void>>
  reorderTags: (boardId: number, ids: number[]) => Promise<void>
}

type BoardsStore = BoardsState & BoardsActions

function reorderBy<T extends { id: number }>(rows: T[], ids: number[]): T[] {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const ordered = ids.map((id) => byId.get(id)).filter((row): row is T => Boolean(row))
  const rest = rows.filter((row) => !ids.includes(row.id))
  return [...ordered, ...rest]
}

// ─── Store ────────────────────────────────────────────────────────

export const useBoardsStore = create<BoardsStore>()((set, get) => ({
  boards: [],
  loading: false,
  error: null,
  loaded: false,
  details: {},
  detailLoading: {},
  detailError: {},

  // ─── Reads ─────────────────────────────────────────────────────
  fetchBoards: async (force = false) => {
    const { loaded, loading } = get()
    if (loading || (loaded && !force)) return
    set({ loading: true, error: null })
    try {
      const boards = await roadmapAdminService.listBoards()
      set({ boards, loaded: true })
    } catch (err) {
      if (!isCancel(err)) set({ error: extractErrorMessage(err, "Failed to load boards.") })
    } finally {
      set({ loading: false })
    }
  },

  fetchBoardDetail: async (id, force = false) => {
    const state = get()
    if (state.detailLoading[id] || (state.details[id] && !force)) return
    set((s) => ({ detailLoading: { ...s.detailLoading, [id]: true }, detailError: { ...s.detailError, [id]: null } }))
    try {
      const board = await roadmapAdminService.getBoard(id)
      set((s) => ({ details: { ...s.details, [id]: board } }))
    } catch (err) {
      if (!isCancel(err)) {
        set((s) => ({
          detailError: { ...s.detailError, [id]: extractErrorMessage(err, "Failed to load board details.") },
        }))
      }
    } finally {
      set((s) => ({ detailLoading: { ...s.detailLoading, [id]: false } }))
    }
  },

  // ─── Boards ────────────────────────────────────────────────────
  createBoard: async (payload) => {
    const result = await attempt(() => roadmapAdminService.createBoard(payload), "Failed to create board.")
    if (result.ok) await get().fetchBoards(true)
    return result
  },

  updateBoard: async (id, payload, successMessage) => {
    const result = await attempt(() => roadmapAdminService.updateBoard(id, payload, successMessage), "Failed to update board.")
    if (result.ok) {
      const updated = result.data
      set((s) => ({
        boards: s.boards.map((b) => (b.id === id ? { ...b, ...updated, statuses: undefined, tags: undefined } : b)),
        details: s.details[id] ? { ...s.details, [id]: { ...s.details[id], ...updated } } : s.details,
      }))
    }
    return result
  },

  deleteBoard: async (id) => {
    const result = await attempt(() => roadmapAdminService.deleteBoard(id), "Failed to delete board.")
    if (result.ok) {
      set((s) => {
        const details = { ...s.details }
        delete details[id]
        return { boards: s.boards.filter((b) => b.id !== id), details }
      })
    }
    return result
  },

  reorderBoards: async (ids) => {
    const snapshot = get().boards
    set({ boards: reorderBy(snapshot, ids) })
    const result = await attempt(() => roadmapAdminService.reorderBoards(ids))
    if (!result.ok) set({ boards: snapshot })
  },

  // ─── Statuses ──────────────────────────────────────────────────
  createStatus: async (boardId, payload) => {
    const result = await attempt(() => roadmapAdminService.createStatus(boardId, payload), "Failed to create status.")
    if (result.ok) await get().fetchBoardDetail(boardId, true)
    return result
  },

  updateStatus: async (boardId, id, payload) => {
    const result = await attempt(() => roadmapAdminService.updateStatus(id, payload), "Failed to update status.")
    if (result.ok) await get().fetchBoardDetail(boardId, true)
    return result
  },

  deleteStatus: async (boardId, id, reassignTo) => {
    const result = await attempt(() => roadmapAdminService.deleteStatus(id, reassignTo), "Failed to delete status.")
    if (result.ok) await get().fetchBoardDetail(boardId, true)
    return result
  },

  reorderStatuses: async (boardId, ids) => {
    const before = get().details[boardId]
    if (!before?.statuses) return
    set((s) => ({
      details: { ...s.details, [boardId]: { ...before, statuses: reorderBy(before.statuses ?? [], ids) } },
    }))
    const result = await attempt(() => roadmapAdminService.reorderStatuses(boardId, ids))
    if (!result.ok) set((s) => ({ details: { ...s.details, [boardId]: before } }))
  },

  makeStatusDefault: async (boardId, id) => {
    const result = await attempt(() => roadmapAdminService.makeStatusDefault(boardId, id), "Failed to set default status.")
    if (result.ok) await get().fetchBoardDetail(boardId, true)
    return result
  },

  // ─── Tags ──────────────────────────────────────────────────────
  createTag: async (boardId, payload) => {
    const result = await attempt(() => roadmapAdminService.createTag(boardId, payload), "Failed to create tag.")
    if (result.ok) await get().fetchBoardDetail(boardId, true)
    return result
  },

  updateTag: async (boardId, id, payload) => {
    const result = await attempt(() => roadmapAdminService.updateTag(id, payload), "Failed to update tag.")
    if (result.ok) await get().fetchBoardDetail(boardId, true)
    return result
  },

  deleteTag: async (boardId, id) => {
    const result = await attempt(() => roadmapAdminService.deleteTag(id), "Failed to delete tag.")
    if (result.ok) await get().fetchBoardDetail(boardId, true)
    return result
  },

  reorderTags: async (boardId, ids) => {
    const before = get().details[boardId]
    if (!before?.tags) return
    set((s) => ({ details: { ...s.details, [boardId]: { ...before, tags: reorderBy(before.tags ?? [], ids) } } }))
    const result = await attempt(() => roadmapAdminService.reorderTags(boardId, ids))
    if (!result.ok) set((s) => ({ details: { ...s.details, [boardId]: before } }))
  },
}))
