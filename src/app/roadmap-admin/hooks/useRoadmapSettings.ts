// src/app/roadmap-admin/hooks/useRoadmapSettings.ts
import { useCallback, useEffect } from "react"
import { useSettingsStore } from "../store/settingsStore"

export function useRoadmapSettings(scope: string) {
  const response = useSettingsStore((s) => (s.scope === scope ? s.response : null))
  const loading = useSettingsStore((s) => s.loading)
  const error = useSettingsStore((s) => s.error)
  const saving = useSettingsStore((s) => s.saving)
  const assetBusy = useSettingsStore((s) => s.assetBusy)
  const fetchSettings = useSettingsStore((s) => s.fetchSettings)
  const save = useSettingsStore((s) => s.save)
  const uploadAsset = useSettingsStore((s) => s.uploadAsset)
  const deleteAsset = useSettingsStore((s) => s.deleteAsset)

  useEffect(() => {
    void fetchSettings(scope)
  }, [scope, fetchSettings])

  const refetch = useCallback(() => fetchSettings(scope), [scope, fetchSettings])

  return { response, loading, error, saving, assetBusy, refetch, save, uploadAsset, deleteAsset }
}
