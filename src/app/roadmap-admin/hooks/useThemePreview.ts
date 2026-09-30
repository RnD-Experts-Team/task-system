// src/app/roadmap-admin/hooks/useThemePreview.ts
// Debounced (250 ms) POST /settings/theme-preview. Returns the server-computed PublicTheme for
// the current branding draft, or the server's 422 message (e.g. contrast rejection) so the form
// can show it inline. The last valid theme is kept while a new one is loading or rejected.

import { useEffect, useState } from "react"
import { isCancel } from "axios"
import type { PublicTheme } from "@/app/roadmap-public/types"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { extractErrorMessage, extractFieldErrors, extractStatus } from "../utils/format"
import { isHexColor } from "../utils/palette"
import type { ThemePreviewPayload } from "../types"
import { useDebouncedValue } from "./useDebouncedValue"

const PREVIEW_DEBOUNCE_MS = 250

interface PreviewState {
  key: string
  theme: PublicTheme | null
  error: string | null
  brandingError: Record<string, string[]>
}

export function useThemePreview(branding: ThemePreviewPayload["branding"] | null, initial: PublicTheme | null) {
  const key = branding ? JSON.stringify(branding) : ""
  const debouncedKey = useDebouncedValue(key, PREVIEW_DEBOUNCE_MS)
  const [state, setState] = useState<PreviewState>({ key: "", theme: initial, error: null, brandingError: {} })

  useEffect(() => {
    if (!debouncedKey) return
    const payload = JSON.parse(debouncedKey) as ThemePreviewPayload["branding"]
    if (!isHexColor(payload.primary)) return
    const controller = new AbortController()
    roadmapAdminService
      .previewTheme({ branding: payload }, controller.signal)
      .then((theme) => setState({ key: debouncedKey, theme, error: null, brandingError: {} }))
      .catch((err: unknown) => {
        if (isCancel(err)) return
        setState((prev) => ({
          key: debouncedKey,
          theme: prev.theme,
          error: extractErrorMessage(err, "Couldn't compute the preview."),
          brandingError: extractStatus(err) === 422 ? extractFieldErrors(err) : {},
        }))
      })
    return () => controller.abort()
  }, [debouncedKey])

  return {
    theme: state.theme ?? initial,
    /** Server message for the latest draft (422 contrast rejection etc.), null when fine. */
    error: state.key === debouncedKey ? state.error : null,
    fieldErrors: state.key === debouncedKey ? state.brandingError : {},
    /** True while the draft has not been round-tripped to the server yet. */
    pending: key !== "" && state.key !== key,
  }
}
