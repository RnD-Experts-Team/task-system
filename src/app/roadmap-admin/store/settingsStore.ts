// src/app/roadmap-admin/store/settingsStore.ts
// Settings for one scope (global or board:{id}) with save + asset upload/removal.

import { create } from "zustand"
import { isCancel } from "axios"
import { roadmapAdminService, type UpdateSettingsPayload } from "../services/roadmapAdminService"
import { extractErrorMessage } from "../utils/format"
import { attempt, type MutationResult } from "../utils/mutation"
import type { AssetType, AssetUploadResult, SettingsResponse } from "../types"

interface SettingsState {
  scope: string | null
  response: SettingsResponse | null
  loading: boolean
  error: string | null
  saving: boolean
  /** Asset type currently uploading/removing */
  assetBusy: AssetType | null
}

interface SettingsActions {
  fetchSettings: (scope: string) => Promise<void>
  save: (payload: UpdateSettingsPayload) => Promise<MutationResult<SettingsResponse>>
  uploadAsset: (type: AssetType, file: File) => Promise<MutationResult<AssetUploadResult>>
  deleteAsset: (type: AssetType) => Promise<MutationResult<void>>
}

export const useSettingsStore = create<SettingsState & SettingsActions>()((set, get) => ({
  scope: null,
  response: null,
  loading: false,
  error: null,
  saving: false,
  assetBusy: null,

  fetchSettings: async (scope) => {
    set({ loading: true, error: null, scope, response: get().scope === scope ? get().response : null })
    try {
      const response = await roadmapAdminService.getSettings(scope)
      if (get().scope === scope) set({ response })
    } catch (err) {
      if (!isCancel(err) && get().scope === scope) set({ error: extractErrorMessage(err, "Failed to load settings.") })
    } finally {
      if (get().scope === scope) set({ loading: false })
    }
  },

  save: async (payload) => {
    set({ saving: true })
    const result = await attempt(() => roadmapAdminService.updateSettings(payload), "Failed to save settings.")
    if (result.ok && get().scope === payload.scope) set({ response: result.data })
    set({ saving: false })
    return result
  },

  uploadAsset: async (type, file) => {
    set({ assetBusy: type })
    const result = await attempt(() => roadmapAdminService.uploadAsset(type, file), "Failed to upload the image.")
    // Re-read so the preview gets the fresh public URL for the asset
    if (result.ok && get().scope) await get().fetchSettings(get().scope as string)
    set({ assetBusy: null })
    return result
  },

  deleteAsset: async (type) => {
    set({ assetBusy: type })
    const result = await attempt(() => roadmapAdminService.deleteAsset(type), "Failed to remove the image.")
    if (result.ok && get().scope) await get().fetchSettings(get().scope as string)
    set({ assetBusy: null })
    return result
  },
}))
