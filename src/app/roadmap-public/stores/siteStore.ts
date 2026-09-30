import { create } from "zustand"
import { roadmapPublicService } from "../api/roadmapPublicService"
import { isAbortError } from "../api/publicApiClient"
import type { BoardSummary, PublicConfig } from "../types"

// ─── Transient notice (toast + screen-reader live region) ──────────

export interface Notice {
  id: number
  tone: "info" | "error"
  text: string
}

interface SiteState {
  config: PublicConfig | null
  status: "idle" | "loading" | "ready" | "error"
  error: unknown
  notice: Notice | null
  load: () => Promise<void>
  announce: (text: string, tone?: Notice["tone"]) => void
  dismissNotice: () => void
}

let noticeId = 0
let inflight: Promise<void> | null = null

export const useSiteStore = create<SiteState>((set, get) => ({
  config: null,
  status: "idle",
  error: null,
  notice: null,

  load: () => {
    if (get().status === "ready") return Promise.resolve()
    if (inflight) return inflight
    set({ status: "loading", error: null })
    inflight = roadmapPublicService
      .getConfig()
      .then((config) => set({ config, status: "ready", error: null }))
      .catch((error: unknown) => {
        if (!isAbortError(error)) set({ status: "error", error })
      })
      .finally(() => {
        inflight = null
      })
    return inflight
  },

  announce: (text, tone = "info") => set({ notice: { id: ++noticeId, tone, text } }),
  dismissNotice: () => set({ notice: null }),
}))

export function findBoard(config: PublicConfig | null, slug: string | undefined): BoardSummary | undefined {
  return slug ? config?.boards.find((b) => b.slug === slug) : undefined
}
