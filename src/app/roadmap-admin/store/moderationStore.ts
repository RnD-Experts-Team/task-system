// src/app/roadmap-admin/store/moderationStore.ts
// The pending moderation queue (posts + comments). Approve / reject / spam remove the item
// optimistically and restore it (at its original index) if the request fails; `undo` re-queues
// an item by moderating it back to "pending".

import { create } from "zustand"
import { isCancel } from "axios"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { extractErrorMessage } from "../utils/format"
import { attempt } from "../utils/mutation"
import type { AdminComment, AdminPostListItem, ModerationState, Pagination } from "../types"

export type QueueKind = "posts" | "comments"
export type ModerationDecision = Extract<ModerationState, "approved" | "rejected" | "spam">

export interface QueueSlice<T> {
  items: T[]
  pagination: Pagination | null
  loading: boolean
  error: string | null
}

interface ModerationState_ {
  posts: QueueSlice<AdminPostListItem>
  comments: QueueSlice<AdminComment>
}

interface ModerationActions {
  fetchQueue: (kind: QueueKind, boardId?: number) => Promise<void>
  /** Resolves true when the server accepted the decision. */
  decide: (kind: QueueKind, id: number, state: ModerationDecision) => Promise<boolean>
  decideMany: (kind: QueueKind, ids: number[], state: ModerationDecision) => Promise<boolean>
  /** Put an item back into the queue (undo). */
  requeue: (kind: QueueKind, id: number, item: AdminPostListItem | AdminComment, index: number) => Promise<boolean>
}

type ModerationStore = ModerationState_ & ModerationActions

const EMPTY = { items: [], pagination: null, loading: false, error: null }
const PER_PAGE = 50

function insertAt<T>(rows: T[], item: T, index: number): T[] {
  const next = [...rows]
  next.splice(Math.min(Math.max(index, 0), next.length), 0, item)
  return next
}

export const useModerationStore = create<ModerationStore>()((set, get) => ({
  posts: { ...EMPTY } as QueueSlice<AdminPostListItem>,
  comments: { ...EMPTY } as QueueSlice<AdminComment>,

  fetchQueue: async (kind, boardId) => {
    set((s) => ({ [kind]: { ...s[kind], loading: true, error: null } }) as Pick<ModerationStore, QueueKind>)
    try {
      if (kind === "posts") {
        const res = await roadmapAdminService.listPosts({
          moderation_state: "pending",
          board_id: boardId,
          sort: "new",
          per_page: PER_PAGE,
        })
        set({ posts: { items: res.data, pagination: res.pagination, loading: false, error: null } })
      } else {
        const res = await roadmapAdminService.listComments({ moderation_state: "pending", per_page: PER_PAGE })
        // Comments are not board-filtered server-side; the page filters by `post.board_slug`.
        set({ comments: { items: res.data, pagination: res.pagination, loading: false, error: null } })
      }
    } catch (err) {
      if (isCancel(err)) return
      const message = extractErrorMessage(err, "Failed to load the moderation queue.")
      set((s) => ({ [kind]: { ...s[kind], loading: false, error: message } }) as Pick<ModerationStore, QueueKind>)
    }
  },

  decide: async (kind, id, state) => {
    const slice = get()[kind]
    const index = slice.items.findIndex((item) => item.id === id)
    if (index === -1) return false
    const item = slice.items[index]
    const total = slice.pagination?.total

    // Optimistic removal
    set((s) => ({
      [kind]: {
        ...s[kind],
        items: s[kind].items.filter((row) => row.id !== id),
        pagination: s[kind].pagination ? { ...s[kind].pagination, total: Math.max(0, (total ?? 1) - 1) } : null,
      },
    }) as Pick<ModerationStore, QueueKind>)

    const result = await attempt(async () => {
      if (kind === "posts") await roadmapAdminService.moderatePost(id, { state })
      else await roadmapAdminService.moderateComment(id, { state })
    })
    if (!result.ok) {
      // Rollback
      set((s) => ({
        [kind]: {
          ...s[kind],
          items: insertAt(s[kind].items as unknown[], item, index),
          pagination: s[kind].pagination ? { ...s[kind].pagination, total: total ?? s[kind].pagination.total } : null,
        },
      }) as Pick<ModerationStore, QueueKind>)
      return false
    }
    return true
  },

  decideMany: async (kind, ids, state) => {
    const before = get()[kind]
    const idSet = new Set(ids)
    const removed = before.items.filter((row) => idSet.has(row.id)).length
    set((s) => ({
      [kind]: {
        ...s[kind],
        items: s[kind].items.filter((row) => !idSet.has(row.id)),
        pagination: s[kind].pagination
          ? { ...s[kind].pagination, total: Math.max(0, s[kind].pagination.total - removed) }
          : null,
      },
    }) as Pick<ModerationStore, QueueKind>)

    const result = await attempt(() =>
      kind === "posts"
        ? roadmapAdminService.bulkModeratePosts({ ids, state })
        : roadmapAdminService.bulkModerateComments({ ids, state })
    )
    if (!result.ok) {
      set({ [kind]: before } as Pick<ModerationStore, QueueKind>)
      return false
    }
    return true
  },

  requeue: async (kind, id, item, index) => {
    const result = await attempt(async () => {
      if (kind === "posts") await roadmapAdminService.moderatePost(id, { state: "pending" })
      else await roadmapAdminService.moderateComment(id, { state: "pending" })
    })
    if (!result.ok) return false
    set((s) => ({
      [kind]: {
        ...s[kind],
        items: insertAt(s[kind].items as unknown[], item, index),
        pagination: s[kind].pagination ? { ...s[kind].pagination, total: s[kind].pagination.total + 1 } : null,
      },
    }) as Pick<ModerationStore, QueueKind>)
    return true
  },
}))
