// src/app/roadmap-admin/store/postsStore.ts
// Posts list (params-keyed) + the selected post detail used by the detail sheet, with every
// post mutation. Mutations patch both the open detail and the matching list row so the table
// and the sheet stay in sync without a refetch.

import { create } from "zustand"
import { isCancel } from "axios"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { extractErrorMessage } from "../utils/format"
import { attempt, type MutationResult } from "../utils/mutation"
import type {
  AdminPostDetail,
  AdminPostFilters,
  AdminPostListItem,
  ChangeStatusPayload,
  CreateAdminPostPayload,
  MergePreview,
  ModeratePayload,
  Pagination,
  UpdateAdminPostPayload,
} from "../types"

interface PostsState {
  posts: AdminPostListItem[]
  pagination: Pagination | null
  loading: boolean
  error: string | null
  lastParams: AdminPostFilters | null

  selected: AdminPostDetail | null
  selectedLoading: boolean
  selectedError: string | null
  /** True while any mutation on the selected post is in flight */
  mutating: boolean
}

interface PostsActions {
  fetchPosts: (params?: AdminPostFilters) => Promise<void>
  fetchPost: (id: number, options?: { silent?: boolean }) => Promise<void>
  clearSelected: () => void

  createPost: (payload: CreateAdminPostPayload) => Promise<MutationResult<AdminPostDetail>>
  updatePost: (id: number, payload: UpdateAdminPostPayload) => Promise<MutationResult<AdminPostDetail>>
  deletePost: (id: number) => Promise<MutationResult<void>>
  moderatePost: (id: number, payload: ModeratePayload) => Promise<MutationResult<AdminPostDetail>>
  changeStatus: (id: number, payload: ChangeStatusPayload) => Promise<MutationResult<AdminPostDetail>>
  setResponse: (id: number, bodyMd: string) => Promise<MutationResult<AdminPostDetail>>
  clearResponse: (id: number) => Promise<MutationResult<AdminPostDetail>>
  pinPost: (id: number, isPinned: boolean) => Promise<MutationResult<AdminPostDetail>>
  syncTags: (id: number, tagIds: number[]) => Promise<MutationResult<AdminPostDetail>>
  movePost: (id: number, boardId: number, statusId?: number | null) => Promise<MutationResult<AdminPostDetail>>
  previewMerge: (id: number, targetPostId: number) => Promise<MutationResult<MergePreview>>
  mergePost: (id: number, targetPostId: number) => Promise<MutationResult<void>>
}

type PostsStore = PostsState & PostsActions

const LIST_KEYS: (keyof AdminPostListItem)[] = [
  "title",
  "excerpt",
  "author_name",
  "moderation_state",
  "status",
  "tags",
  "votes_count",
  "comments_count",
  "pending_comments_count",
  "is_pinned",
  "flags",
  "board",
  "number",
  "slug",
  "merged_into_post_id",
  "published_at",
  "last_activity_at",
]

/** Copies only the list-row fields present on a (detail or list) payload onto a list row. */
function patchRow(row: AdminPostListItem, source: Partial<AdminPostDetail>): AdminPostListItem {
  const next: Record<string, unknown> = { ...row }
  for (const key of LIST_KEYS) {
    if (key in source && source[key] !== undefined) next[key] = source[key]
  }
  return next as unknown as AdminPostListItem
}

export const usePostsStore = create<PostsStore>()((set, get) => {
  /** Apply a mutation result to the open detail and the list row. */
  const apply = (id: number, detail: AdminPostDetail) => {
    set((s) => ({
      selected: s.selected && s.selected.id === id ? { ...s.selected, ...detail } : s.selected,
      posts: s.posts.map((row) => (row.id === id ? patchRow(row, detail) : row)),
    }))
  }

  /** Run a detail-returning mutation while flagging `mutating`. */
  const run = async (
    id: number,
    fn: () => Promise<AdminPostDetail>,
    fallback: string,
    refresh = false
  ): Promise<MutationResult<AdminPostDetail>> => {
    set({ mutating: true })
    const result = await attempt(fn, fallback)
    if (result.ok) {
      apply(id, result.data)
      if (refresh) await get().fetchPost(id, { silent: true })
    }
    set({ mutating: false })
    return result
  }

  return {
    posts: [],
    pagination: null,
    loading: false,
    error: null,
    lastParams: null,
    selected: null,
    selectedLoading: false,
    selectedError: null,
    mutating: false,

    fetchPosts: async (params = {}) => {
      set({ loading: true, error: null, lastParams: params })
      try {
        const res = await roadmapAdminService.listPosts(params)
        set({ posts: res.data, pagination: res.pagination })
      } catch (err) {
        if (!isCancel(err)) set({ error: extractErrorMessage(err, "Failed to load posts.") })
      } finally {
        set({ loading: false })
      }
    },

    fetchPost: async (id, options) => {
      if (!options?.silent) set({ selectedLoading: true, selectedError: null, selected: null })
      try {
        const detail = await roadmapAdminService.getPost(id)
        set((s) => ({
          selected: detail,
          posts: s.posts.map((row) => (row.id === id ? patchRow(row, detail) : row)),
        }))
      } catch (err) {
        if (!isCancel(err)) set({ selectedError: extractErrorMessage(err, "Failed to load the post.") })
      } finally {
        if (!options?.silent) set({ selectedLoading: false })
      }
    },

    clearSelected: () => set({ selected: null, selectedError: null, selectedLoading: false }),

    createPost: async (payload) => {
      const result = await attempt(() => roadmapAdminService.createPost(payload), "Failed to create post.")
      if (result.ok && get().lastParams) await get().fetchPosts(get().lastParams ?? {})
      return result
    },

    updatePost: (id, payload) => run(id, () => roadmapAdminService.updatePost(id, payload), "Failed to update post."),
    moderatePost: (id, payload) => run(id, () => roadmapAdminService.moderatePost(id, payload), "Failed to moderate post."),
    changeStatus: (id, payload) =>
      run(id, () => roadmapAdminService.changePostStatus(id, payload), "Failed to change status.", true),
    setResponse: (id, bodyMd) => run(id, () => roadmapAdminService.setPostResponse(id, bodyMd), "Failed to save the response."),
    clearResponse: (id) => run(id, () => roadmapAdminService.clearPostResponse(id), "Failed to remove the response."),
    pinPost: (id, isPinned) => run(id, () => roadmapAdminService.pinPost(id, isPinned), "Failed to update the pin."),
    syncTags: (id, tagIds) => run(id, () => roadmapAdminService.syncPostTags(id, tagIds), "Failed to update tags.", true),
    movePost: (id, boardId, statusId) =>
      run(id, () => roadmapAdminService.movePost(id, boardId, statusId), "Failed to move the post.", true),

    deletePost: async (id) => {
      set({ mutating: true })
      const result = await attempt(() => roadmapAdminService.deletePost(id), "Failed to delete post.")
      if (result.ok) {
        set((s) => ({
          posts: s.posts.filter((row) => row.id !== id),
          pagination: s.pagination ? { ...s.pagination, total: Math.max(0, s.pagination.total - 1) } : null,
          selected: s.selected?.id === id ? null : s.selected,
        }))
      }
      set({ mutating: false })
      return result
    },

    previewMerge: (id, targetPostId) =>
      attempt(() => roadmapAdminService.mergePreview(id, targetPostId), "Failed to preview the merge."),

    mergePost: async (id, targetPostId) => {
      set({ mutating: true })
      const result = await attempt(() => roadmapAdminService.mergePost(id, targetPostId), "Failed to merge posts.")
      if (result.ok) {
        // The source post is hidden after a merge: drop it from the list and close the sheet.
        set((s) => ({
          posts: s.posts.filter((row) => row.id !== id),
          pagination: s.pagination ? { ...s.pagination, total: Math.max(0, s.pagination.total - 1) } : null,
          selected: s.selected?.id === id ? null : s.selected,
        }))
      }
      set({ mutating: false })
      return result
    },
  }
})
