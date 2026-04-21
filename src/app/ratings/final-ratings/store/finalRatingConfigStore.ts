import { create } from "zustand"
import { isCancel, AxiosError } from "axios"
import { toast } from "sonner"
import { finalRatingConfigService } from "../services/finalRatingConfigService"
import type {
  ApiFinalRatingConfig,
  FinalRatingConfigData,
  CreateFinalRatingConfigPayload,
  UpdateFinalRatingConfigPayload,
} from "../types"
import type { ApiValidationError } from "@/types"

// ─── Helper ───────────────────────────────────────────────────────────────────

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

interface FinalRatingConfigState {
  // ── Full list (GET /final-ratings/configs) ─────────────────────
  configs: ApiFinalRatingConfig[]
  configsLoading: boolean
  configsError: string | null

  // ── Active config (GET /final-ratings/configs/active) ──────────
  activeConfig: ApiFinalRatingConfig | null
  activeLoading: boolean
  activeError: string | null

  // ── Default structure (GET /final-ratings/configs/default-structure) ──
  defaultStructure: FinalRatingConfigData | null
  defaultStructureLoading: boolean
  defaultStructureError: string | null

  // ── Single config detail (GET /final-ratings/configs/{id}) ─────
  selectedConfig: ApiFinalRatingConfig | null
  selectedLoading: boolean
  selectedError: string | null

  // ── Create (POST /final-ratings/configs) ───────────────────────
  creating: boolean
  createError: string | null

  // ── Update (PUT /final-ratings/configs/{id}) ───────────────────
  updating: boolean
  updateError: string | null

  // ── Delete (DELETE /final-ratings/configs/{id}) ────────────────
  deleting: boolean
  deleteError: string | null

  // ── Activate (POST /final-ratings/configs/{id}/activate) ─────────
  activating: boolean
  activateError: string | null
}

// ─── Actions ─────────────────────────────────────────────────────────────────

interface FinalRatingConfigActions {
  /** GET /final-ratings/configs — load all configs into the store */
  fetchConfigs: () => Promise<void>
  /** GET /final-ratings/configs/active — load the active config */
  fetchActiveConfig: () => Promise<void>
  /** GET /final-ratings/configs/default-structure — load the default structure */
  fetchDefaultStructure: () => Promise<void>
  /** GET /final-ratings/configs/{id} — load a single config by ID */
  fetchConfigById: (id: number) => Promise<void>
  /** POST /final-ratings/configs — create a new config */
  createConfig: (payload: CreateFinalRatingConfigPayload) => Promise<ApiFinalRatingConfig | null>
  /** PUT /final-ratings/configs/{id} — update an existing config */
  updateConfig: (id: number, payload: UpdateFinalRatingConfigPayload) => Promise<ApiFinalRatingConfig | null>
  /** DELETE /final-ratings/configs/{id} — delete a config */
  deleteConfig: (id: number) => Promise<boolean>
  /** POST /final-ratings/configs/{id}/activate — activate a config */
  activateConfig: (id: number) => Promise<ApiFinalRatingConfig | null>
  // ── Clearers ────────────────────────────────────────────────────
  clearConfigsError: () => void
  clearActiveError: () => void
  clearDefaultStructureError: () => void
  clearSelectedConfig: () => void
  clearCreateError: () => void
  clearUpdateError: () => void
  clearDeleteError: () => void
  clearActivateError: () => void
}

type FinalRatingConfigStore = FinalRatingConfigState & FinalRatingConfigActions

// ─── Store ───────────────────────────────────────────────────────────────────

export const useFinalRatingConfigStore = create<FinalRatingConfigStore>()((set) => ({
  // Initial state
  configs: [],
  configsLoading: false,
  configsError: null,

  activeConfig: null,
  activeLoading: false,
  activeError: null,

  defaultStructure: null,
  defaultStructureLoading: false,
  defaultStructureError: null,

  selectedConfig: null,
  selectedLoading: false,
  selectedError: null,

  creating: false,
  createError: null,

  updating: false,
  updateError: null,

  deleting: false,
  deleteError: null,

  activating: false,
  activateError: null,

  // ── Actions ────────────────────────────────────────────────────

  /** GET /final-ratings/configs — fetch all configs and store them */
  fetchConfigs: async () => {
    set({ configsLoading: true, configsError: null })
    try {
      const configs = await finalRatingConfigService.getAll()
      set({ configs })
    } catch (err) {
      // Skip cancelled requests (e.g. component unmount mid-request)
      if (!isCancel(err)) {
        set({ configsError: extractErrorMessage(err, "Failed to load final rating configurations.") })
      }
    } finally {
      set({ configsLoading: false })
    }
  },

  /** GET /final-ratings/configs/active — fetch the currently active config */
  fetchActiveConfig: async () => {
    set({ activeLoading: true, activeError: null })
    try {
      const activeConfig = await finalRatingConfigService.getActive()
      set({ activeConfig })
    } catch (err) {
      if (!isCancel(err)) {
        set({ activeError: extractErrorMessage(err, "Failed to load active configuration.") })
      }
    } finally {
      set({ activeLoading: false })
    }
  },

  /** GET /final-ratings/configs/default-structure — fetch default config data */
  fetchDefaultStructure: async () => {
    set({ defaultStructureLoading: true, defaultStructureError: null })
    try {
      const defaultStructure = await finalRatingConfigService.getDefaultStructure()
      set({ defaultStructure })
    } catch (err) {
      if (!isCancel(err)) {
        set({ defaultStructureError: extractErrorMessage(err, "Failed to load default structure.") })
      }
    } finally {
      set({ defaultStructureLoading: false })
    }
  },

  /** GET /final-ratings/configs/{id} — load a single config into selectedConfig */
  fetchConfigById: async (id: number) => {
    set({ selectedLoading: true, selectedError: null, selectedConfig: null })
    try {
      const config = await finalRatingConfigService.getById(id)
      set({ selectedConfig: config })
    } catch (err) {
      if (!isCancel(err)) {
        set({ selectedError: extractErrorMessage(err, "Failed to load configuration details.") })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  /** POST /final-ratings/configs — create a new config, prepend to list on success */
  createConfig: async (payload: CreateFinalRatingConfigPayload) => {
    set({ creating: true, createError: null })
    try {
      const created = await finalRatingConfigService.create(payload)
      // Prepend the new config to the list and refresh active if it was set active
      set((state) => ({
        configs: [
          created,
          // If new config is active, deactivate all existing ones in the store
          ...(created.is_active
            ? state.configs.map((c) => ({ ...c, is_active: false }))
            : state.configs),
        ],
        // Update activeConfig if the created one is active
        activeConfig: created.is_active ? created : state.activeConfig,
      }))
      toast.success("Configuration created successfully.")
      return created
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

  /** PUT /final-ratings/configs/{id} — update a config and refresh the list */
  updateConfig: async (id: number, payload: UpdateFinalRatingConfigPayload) => {
    set({ updating: true, updateError: null })
    try {
      const updated = await finalRatingConfigService.update(id, payload)
      // Replace the updated config in the list; deactivate others if it was set active
      set((state) => ({
        configs: state.configs.map((c) => {
          if (c.id === id) return updated
          // If the updated config is now active, deactivate all others
          if (updated.is_active) return { ...c, is_active: false }
          return c
        }),
        // Update selectedConfig if it matches
        selectedConfig: state.selectedConfig?.id === id ? updated : state.selectedConfig,
        // Update activeConfig if the updated one is active
        activeConfig: updated.is_active ? updated : state.activeConfig,
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

  /** DELETE /final-ratings/configs/{id} — delete a config and remove from list */
  deleteConfig: async (id: number) => {
    set({ deleting: true, deleteError: null })
    try {
      await finalRatingConfigService.delete(id)
      // Remove deleted config from the store list immediately
      set((state) => ({
        configs: state.configs.filter((c) => c.id !== id),
        // Clear selectedConfig if it was deleted
        selectedConfig: state.selectedConfig?.id === id ? null : state.selectedConfig,
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

  /** POST /final-ratings/configs/{id}/activate — activate a config by ID */
  activateConfig: async (id: number) => {
    set({ activating: true, activateError: null })
    try {
      const activated = await finalRatingConfigService.activate(id)
      // Mark the activated config as active, deactivate all others in the list
      set((state) => ({
        configs: state.configs.map((c) =>
          c.id === id ? activated : { ...c, is_active: false },
        ),
        selectedConfig: state.selectedConfig?.id === id ? activated : state.selectedConfig,
        activeConfig: activated,
      }))
      toast.success("Configuration activated successfully.")
      return activated
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to activate configuration.")
        set({ activateError: msg })
      }
      return null
    } finally {
      set({ activating: false })
    }
  },

  // ── Clearers ──────────────────────────────────────────────────────────────

  clearConfigsError: () => set({ configsError: null }),
  clearActiveError: () => set({ activeError: null }),
  clearDefaultStructureError: () => set({ defaultStructureError: null }),
  clearSelectedConfig: () => set({ selectedConfig: null, selectedError: null }),
  clearCreateError: () => set({ createError: null }),
  clearUpdateError: () => set({ updateError: null }),
  clearDeleteError: () => set({ deleteError: null }),
  clearActivateError: () => set({ activateError: null }),
}))
