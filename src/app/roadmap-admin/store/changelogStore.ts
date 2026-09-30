// src/app/roadmap-admin/store/changelogStore.ts
// Changelog list (params-keyed) with publish / unpublish / delete, and the editor's entry.

import { create } from "zustand"
import { isCancel } from "axios"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { extractErrorMessage } from "../utils/format"
import { attempt, type MutationResult } from "../utils/mutation"
import type {
  AdminChangelogDetail,
  AdminChangelogEntry,
  ChangelogFilters,
  ChangelogPayload,
  Pagination,
  SyncChangelogPostsPayload,
} from "../types"

interface ChangelogState {
  entries: AdminChangelogEntry[]
  pagination: Pagination | null
  loading: boolean
  error: string | null
  lastParams: ChangelogFilters | null

  entry: AdminChangelogDetail | null
  entryLoading: boolean
  entryError: string | null
}

interface ChangelogActions {
  fetchEntries: (params?: ChangelogFilters) => Promise<void>
  publish: (id: number, publishedAt?: string | null) => Promise<MutationResult<AdminChangelogDetail>>
  unpublish: (id: number) => Promise<MutationResult<AdminChangelogDetail>>
  remove: (id: number) => Promise<MutationResult<void>>

  fetchEntry: (id: number) => Promise<void>
  clearEntry: () => void
  createEntry: (payload: ChangelogPayload) => Promise<MutationResult<AdminChangelogDetail>>
  updateEntry: (id: number, payload: Partial<ChangelogPayload>) => Promise<MutationResult<AdminChangelogDetail>>
  syncPosts: (id: number, payload: SyncChangelogPostsPayload) => Promise<MutationResult<AdminChangelogDetail>>
}

export const useChangelogStore = create<ChangelogState & ChangelogActions>()((set, get) => {
  /** Reflect an updated entry in the list row and the open editor. */
  const apply = (detail: AdminChangelogDetail) => {
    set((s) => ({
      entry: s.entry && s.entry.id === detail.id ? { ...s.entry, ...detail } : s.entry,
      entries: s.entries.map((row) => (row.id === detail.id ? { ...row, ...detail } : row)),
    }))
  }

  return {
    entries: [],
    pagination: null,
    loading: false,
    error: null,
    lastParams: null,
    entry: null,
    entryLoading: false,
    entryError: null,

    fetchEntries: async (params = {}) => {
      set({ loading: true, error: null, lastParams: params })
      try {
        const res = await roadmapAdminService.listChangelog(params)
        set({ entries: res.data, pagination: res.pagination })
      } catch (err) {
        if (!isCancel(err)) set({ error: extractErrorMessage(err, "Failed to load the changelog.") })
      } finally {
        set({ loading: false })
      }
    },

    publish: async (id, publishedAt) => {
      const result = await attempt(() => roadmapAdminService.publishChangelogEntry(id, publishedAt), "Failed to publish.")
      if (result.ok) apply(result.data)
      return result
    },

    unpublish: async (id) => {
      const result = await attempt(() => roadmapAdminService.unpublishChangelogEntry(id), "Failed to unpublish.")
      if (result.ok) apply(result.data)
      return result
    },

    remove: async (id) => {
      const result = await attempt(() => roadmapAdminService.deleteChangelogEntry(id), "Failed to delete the entry.")
      if (result.ok) {
        set((s) => ({
          entries: s.entries.filter((row) => row.id !== id),
          pagination: s.pagination ? { ...s.pagination, total: Math.max(0, s.pagination.total - 1) } : null,
        }))
      }
      return result
    },

    fetchEntry: async (id) => {
      set({ entryLoading: true, entryError: null, entry: null })
      try {
        const entry = await roadmapAdminService.getChangelogEntry(id)
        set({ entry })
      } catch (err) {
        if (!isCancel(err)) set({ entryError: extractErrorMessage(err, "Failed to load the entry.") })
      } finally {
        set({ entryLoading: false })
      }
    },

    clearEntry: () => set({ entry: null, entryError: null, entryLoading: false }),

    createEntry: async (payload) => {
      const result = await attempt(() => roadmapAdminService.createChangelogEntry(payload), "Failed to save the entry.")
      if (result.ok) set({ entry: result.data })
      return result
    },

    updateEntry: async (id, payload) => {
      const result = await attempt(() => roadmapAdminService.updateChangelogEntry(id, payload), "Failed to save the entry.")
      if (result.ok) apply(result.data)
      return result
    },

    syncPosts: async (id, payload) => {
      const result = await attempt(() => roadmapAdminService.syncChangelogPosts(id, payload), "Failed to link posts.")
      if (result.ok) {
        apply(result.data)
        // The response may omit the relation list; make sure the editor shows fresh links.
        if (!result.data.linked_posts) await get().fetchEntry(id)
      }
      return result
    },
  }
})
