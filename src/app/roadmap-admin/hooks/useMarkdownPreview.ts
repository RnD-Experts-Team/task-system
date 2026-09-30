// src/app/roadmap-admin/hooks/useMarkdownPreview.ts
// Debounced (300 ms) live preview through POST /roadmap/admin/markdown/preview. The returned
// HTML is server-sanitised — render it only through <ServerHtml>. Stale requests are aborted.

import { useEffect, useState } from "react"
import { isCancel } from "axios"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { useDebouncedValue } from "./useDebouncedValue"

const PREVIEW_DEBOUNCE_MS = 300

type PreviewState = { source: string; html: string; failed: boolean }

export function useMarkdownPreview(markdown: string, enabled = true) {
  const debounced = useDebouncedValue(markdown, PREVIEW_DEBOUNCE_MS)
  const [state, setState] = useState<PreviewState>({ source: "", html: "", failed: false })

  useEffect(() => {
    if (!enabled || !debounced.trim()) return
    const controller = new AbortController()
    roadmapAdminService
      .previewMarkdown(debounced, controller.signal)
      .then((result) => setState({ source: debounced, html: result.html, failed: false }))
      .catch((err: unknown) => {
        if (!isCancel(err)) setState({ source: debounced, html: "", failed: true })
      })
    return () => controller.abort()
  }, [debounced, enabled])

  const empty = !markdown.trim()
  const settled = state.source === markdown
  return {
    html: empty ? "" : state.html,
    /** True while the latest text has not been rendered by the server yet. */
    loading: enabled && !empty && !settled && !state.failed,
    failed: !empty && state.failed && state.source === debounced,
    empty,
  }
}
