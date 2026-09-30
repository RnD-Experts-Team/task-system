import { create } from "zustand"
import { VISITOR_STORAGE_KEY } from "../types"

// ─── Persistence (localStorage may be unavailable) ─────────────────

interface Persisted {
  v: 1
  token: string | null
  name: string
}

function readStorage(): Persisted {
  const empty: Persisted = { v: 1, token: null, name: "" }
  try {
    const raw = window.localStorage.getItem(VISITOR_STORAGE_KEY)
    if (!raw) return empty
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return empty
    const obj = parsed as Record<string, unknown>
    return {
      v: 1,
      token: typeof obj.token === "string" && obj.token.startsWith("rmv_") ? obj.token : null,
      name: typeof obj.name === "string" ? obj.name.slice(0, 40) : "",
    }
  } catch {
    return empty
  }
}

function writeStorage(data: Persisted): void {
  try {
    if (!data.token && !data.name) window.localStorage.removeItem(VISITOR_STORAGE_KEY)
    else window.localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage blocked or full: the in-memory copy keeps the session working.
  }
}

// ─── Store ─────────────────────────────────────────────────────────

interface VisitorState {
  token: string | null
  /** Last display name the visitor used (prefills the forms). */
  authorName: string
  setToken: (token: string) => void
  clearToken: () => void
  setAuthorName: (name: string) => void
}

const initial = readStorage()

export const useVisitorStore = create<VisitorState>((set, get) => ({
  token: initial.token,
  authorName: initial.name,
  setToken: (token) => {
    set({ token })
    writeStorage({ v: 1, token, name: get().authorName })
  },
  clearToken: () => {
    set({ token: null })
    writeStorage({ v: 1, token: null, name: get().authorName })
  },
  setAuthorName: (name) => {
    const clean = name.trim().slice(0, 40)
    if (clean === get().authorName) return
    set({ authorName: clean })
    writeStorage({ v: 1, token: get().token, name: clean })
  },
}))
