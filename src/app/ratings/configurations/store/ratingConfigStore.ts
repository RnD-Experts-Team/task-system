import { create } from "zustand"
import { isCancel, AxiosError } from "axios"
import { toast } from "sonner"
import { ratingConfigService } from "../services/ratingConfigService"
import type {
  ApiRatingConfig,
  ApiRatingConfigType,
  RatingConfigPagination,
  CreateRatingConfigPayload,
  UpdateRatingConfigPayload,
} from "../types"
import type { ApiValidationError } from "@/types"

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract a user-friendly message from an Axios error */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    if (data?.errors) return Object.values(data.errors).flat().join(". ")
    if (data?.message) return data.message
  }
  return fallback
}

// ─── State shape ─────────────────────────────────────────────────────────────

interface RatingConfigState {
  // ── Full list (GET /rating-configs) ────────────────────────────
  configs: ApiRatingConfig[]
  configsLoading: boolean
  configsError: string | null
  configsPagination: RatingConfigPagination | null

  // ── Filtered by type (GET /rating-configs/type/{type}) ─────────
  configsByType: ApiRatingConfig[]
  configsByTypeLoading: boolean
  configsByTypeError: string | null
  activeTypeFilter: ApiRatingConfigType | null // which type is currently filtered

  // ── Single config detail (GET /rating-configs/{id}) ────────────
  selectedConfig: ApiRatingConfig | null
  selectedLoading: boolean
  selectedError: string | null

  // ── Delete (DELETE /rating-configs/{id}) ───────────────────────
  deleting: boolean
  deleteError: string | null

  // ── Create (POST /rating-configs) ──────────────────────────────
  creating: boolean
  createError: string | null

  // ── Update (PUT /rating-configs/{id}) ──────────────────────────
  updating: boolean
  updateError: string | null
}

// ─── Actions ─────────────────────────────────────────────────────────────────

interface RatingConfigActions {
  /** Fetch all rating configs (used for the ALL tab and stats) */
  fetchConfigs: () => Promise<void>
  /** Fetch configs filtered by type (used for TASK / STAKEHOLDER tabs) */
  fetchConfigsByType: (type: ApiRatingConfigType) => Promise<void>
  /** Fetch a single config by ID (used when opening the detail sheet) */
  fetchConfigById: (id: number) => Promise<void>
  /** Delete a config by ID; returns true on success */
  deleteConfig: (id: number) => Promise<boolean>
  /** Clear the full-list error */
  clearConfigsError: () => void
  /** Clear the type-filter error */
  clearConfigsByTypeError: () => void
  /** Clear the selected config and its error */
  clearSelectedConfig: () => void
  /** Clear the delete error */
  clearDeleteError: () => void
  /** Create a new rating config; returns the created config or null on failure */
  createConfig: (payload: CreateRatingConfigPayload) => Promise<ApiRatingConfig | null>
  /** Clear the create error */
  clearCreateError: () => void
  /** Update an existing rating config; returns the updated config or null on failure */
  updateConfig: (id: number, payload: UpdateRatingConfigPayload) => Promise<ApiRatingConfig | null>
  /** Clear the update error */
  clearUpdateError: () => void
}

type RatingConfigStore = RatingConfigState & RatingConfigActions

// ─── Store ───────────────────────────────────────────────────────────────────

export const useRatingConfigStore = create<RatingConfigStore>()((set, _get) => ({
  // Initial state
  configs: [],
  configsLoading: false,
  configsError: null,
  configsPagination: null,

  configsByType: [],
  configsByTypeLoading: false,
  configsByTypeError: null,
  activeTypeFilter: null,

  selectedConfig: null,
  selectedLoading: false,
  selectedError: null,

  deleting: false,
  deleteError: null,

  // Create initial state
  creating: false,
  createError: null,

  // Update initial state
  updating: false,
  updateError: null,

  // ── Actions ────────────────────────────────────────────────────

  /** GET /rating-configs — load all configs into the store */
  fetchConfigs: async () => {
    set({ configsLoading: true, configsError: null })
    try {
      const { configs, pagination } = await ratingConfigService.getAll()
      set({ configs, configsPagination: pagination })
    } catch (err) {
      // Ignore cancelled requests (e.g. component unmount)
      if (!isCancel(err)) {
        set({ configsError: extractErrorMessage(err, "Failed to load rating configurations.") })
      }
    } finally {
      set({ configsLoading: false })
    }
  },

  /** GET /rating-configs/type/{type} — load configs for a specific type */
  fetchConfigsByType: async (type: ApiRatingConfigType) => {
    set({ configsByTypeLoading: true, configsByTypeError: null, activeTypeFilter: type })
    try {
      const { configs } = await ratingConfigService.getByType(type)
      set({ configsByType: configs })
    } catch (err) {
      if (!isCancel(err)) {
        set({
          configsByTypeError: extractErrorMessage(err, "Failed to load configurations by type."),
        })
      }
    } finally {
      set({ configsByTypeLoading: false })
    }
  },

  /** GET /rating-configs/{id} — load a single config into selectedConfig */
  fetchConfigById: async (id: number) => {
    set({ selectedLoading: true, selectedError: null, selectedConfig: null })
    try {
      const config = await ratingConfigService.getById(id)
      set({ selectedConfig: config })
    } catch (err) {
      if (!isCancel(err)) {
        set({ selectedError: extractErrorMessage(err, "Failed to load configuration details.") })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  /** DELETE /rating-configs/{id} — delete a config and remove it from the store lists */
  deleteConfig: async (id: number) => {
    set({ deleting: true, deleteError: null })
    try {
      await ratingConfigService.delete(id)
      // Remove deleted config from both store lists so UI updates immediately
      set((state) => ({
        configs: state.configs.filter((c) => c.id !== id),
        configsByType: state.configsByType.filter((c) => c.id !== id),
      }))
      toast.success("Configuration deleted successfully.")
      return true
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to delete configuration.")
        set({ deleteError: msg })
      }
      return false
    } finally {
      set({ deleting: false })
    }
  },

  // ── Clearers ───────────────────────────────────────────────────

  clearConfigsError: () => set({ configsError: null }),
  clearConfigsByTypeError: () => set({ configsByTypeError: null }),
  clearSelectedConfig: () => set({ selectedConfig: null, selectedError: null }),
  clearDeleteError: () => set({ deleteError: null }),

  // ── POST /rating-configs ────────────────────────────────────────
  /** Create a new config and prepend it to the local list on success */
  createConfig: async (payload: CreateRatingConfigPayload) => {
    set({ creating: true, createError: null })
    try {
      const config = await ratingConfigService.create(payload)
      // Prepend to both lists so it shows up immediately without refetching
      set((state) => ({
        configs: [config, ...state.configs],
        configsByType:
          state.activeTypeFilter === config.type
            ? [config, ...state.configsByType]
            : state.configsByType,
      }))
      toast.success("Configuration created successfully.")
      return config
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to create configuration.")
        set({ createError: msg })
      }
      return null
    } finally {
      set({ creating: false })
    }
  },

  clearCreateError: () => set({ createError: null }),

  // ── PUT /rating-configs/{id} ────────────────────────────────────
  /** Update an existing config and refresh it in the local lists */
  updateConfig: async (id: number, payload: UpdateRatingConfigPayload) => {
    set({ updating: true, updateError: null })
    try {
      const updated = await ratingConfigService.update(id, payload)
      // Replace the updated config in both lists so the UI reflects changes immediately
      set((state) => ({
        configs: state.configs.map((c) => (c.id === id ? updated : c)),
        configsByType: state.configsByType.map((c) => (c.id === id ? updated : c)),
        // Refresh the detail sheet if this config is currently open
        selectedConfig: state.selectedConfig?.id === id ? updated : state.selectedConfig,
      }))
      toast.success("Configuration updated successfully.")
      return updated
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to update configuration.")
        set({ updateError: msg })
      }
      return null
    } finally {
      set({ updating: false })
    }
  },

  clearUpdateError: () => set({ updateError: null }),
}))
