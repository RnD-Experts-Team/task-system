import { create } from "zustand"
import { roadmapPublicService } from "../api/roadmapPublicService"
import { isPublicApiError } from "../api/publicApiClient"
import { describeError } from "../lib/errors"
import { S } from "../lib/strings"
import { useSiteStore } from "./siteStore"
import { useVisitorStore } from "./visitorStore"
import type { MeState } from "../types"

// ─── Keys ──────────────────────────────────────────────────────────

const key = (board: string, number: number) => `${board}:${number}`

export interface OwnPending {
  board: string
  type: "post" | "comment"
  number: number | null
  title: string | null
  created_at: string
}

interface VoteOp {
  timer: ReturnType<typeof setTimeout> | null
  inflight: boolean
  /** Last state acknowledged by the server; used for rollback. */
  confirmedVoted: boolean
  confirmedCount: number
}

const VOTE_DEBOUNCE_MS = 350
const ops = new Map<string, VoteOp>()
const hydrating = new Map<string, Promise<void>>()

// ─── Store ─────────────────────────────────────────────────────────

interface ViewerState {
  /** "board:number" → visitor has voted. */
  voted: Record<string, boolean>
  /** "board:number" → latest known vote count (optimistic or confirmed). */
  counts: Record<string, number>
  /** "board:number" → a vote request is queued or in flight. */
  pending: Record<string, true>
  ownPending: OwnPending[]
  hydrated: Record<string, true>

  hydrate: (board: string) => Promise<void>
  /** Toggle the vote, optimistic; the request is debounced to the final desired state. */
  toggleVote: (board: string, number: number, currentCount: number, desired?: boolean) => void
  forgetCounts: (board: string) => void
  addOwnPending: (item: OwnPending) => void
}

function applyMeState(board: string, me: MeState, set: (fn: (s: ViewerState) => Partial<ViewerState>) => void) {
  set((s) => {
    const voted = { ...s.voted }
    for (const n of me.voted_post_numbers) {
      const k = key(board, n)
      // Never overwrite a local change that is still being synced.
      if (!s.pending[k]) voted[k] = true
    }
    const others = s.ownPending.filter((p) => p.board !== board)
    const mine: OwnPending[] = me.own_pending.map((p) => ({ ...p, board }))
    return { voted, ownPending: [...others, ...mine], hydrated: { ...s.hydrated, [board]: true } }
  })
}

export const useViewerStore = create<ViewerState>((set, get) => ({
  voted: {},
  counts: {},
  pending: {},
  ownPending: [],
  hydrated: {},

  hydrate: async (board) => {
    // Without a token there is nothing to hydrate (reads never issue tokens).
    if (!useVisitorStore.getState().token) {
      set((s) => ({ hydrated: { ...s.hydrated, [board]: true } }))
      return
    }
    const running = hydrating.get(board)
    if (running) return running
    const request = (async () => {
      try {
        const me = await roadmapPublicService.getMeState(board)
        applyMeState(board, me, set)
      } catch {
        set((s) => ({ hydrated: { ...s.hydrated, [board]: true } }))
      } finally {
        hydrating.delete(board)
      }
    })()
    hydrating.set(board, request)
    return request
  },

  toggleVote: (board, number, currentCount, desiredOverride) => {
    const k = key(board, number)
    const state = get()
    const wasVoted = state.voted[k] === true
    const desired = desiredOverride ?? !wasVoted
    if (desired === wasVoted && ops.has(k)) return
    const baseCount = state.counts[k] ?? currentCount

    let op = ops.get(k)
    if (!op) {
      op = { timer: null, inflight: false, confirmedVoted: wasVoted, confirmedCount: baseCount }
      ops.set(k, op)
    }

    // Optimistic update.
    const nextCount = Math.max(0, baseCount + (desired === wasVoted ? 0 : desired ? 1 : -1))
    set((s) => ({
      voted: { ...s.voted, [k]: desired },
      counts: { ...s.counts, [k]: nextCount },
      pending: { ...s.pending, [k]: true },
    }))

    const settle = (patch: Partial<ViewerState>) =>
      set((s) => {
        const pending = { ...s.pending }
        delete pending[k]
        return { ...patch, pending }
      })

    const flush = async () => {
      const current = ops.get(k)
      if (!current) return
      current.timer = null
      const target = get().voted[k] === true
      if (target === current.confirmedVoted) {
        ops.delete(k)
        settle({})
        return
      }
      current.inflight = true
      try {
        const res = await roadmapPublicService.setVote(board, number, target)
        current.inflight = false
        current.confirmedVoted = res.voted
        current.confirmedCount = res.votes_count
        const latest = get().voted[k] === true
        if (latest !== res.voted) {
          // The visitor toggled again while the request was in flight: send the final state next.
          set((s) => ({ counts: { ...s.counts, [k]: Math.max(0, res.votes_count + (latest ? 1 : -1)) } }))
          void flush()
          return
        }
        ops.delete(k)
        settle({ voted: { ...get().voted, [k]: res.voted }, counts: { ...get().counts, [k]: res.votes_count } })
        useSiteStore.getState().announce(res.voted ? S.vote.votedAnnounce : S.vote.unvotedAnnounce)
      } catch (error) {
        current.inflight = false
        ops.delete(k)
        // Roll back to the last state the server confirmed.
        settle({
          voted: { ...get().voted, [k]: current.confirmedVoted },
          counts: { ...get().counts, [k]: current.confirmedCount },
        })
        const known =
          isPublicApiError(error) && (error.status === 429 || error.code === "voting_closed")
        useSiteStore
          .getState()
          .announce(known ? (error.code === "voting_closed" ? S.vote.closed : describeError(error)) : S.vote.failed, "error")
      }
    }

    if (op.timer) clearTimeout(op.timer)
    // While a request is in flight the follow-up is triggered by its completion.
    if (!op.inflight) op.timer = setTimeout(() => void flush(), VOTE_DEBOUNCE_MS)
  },

  forgetCounts: (board) =>
    set((s) => {
      const counts: Record<string, number> = {}
      for (const [k, v] of Object.entries(s.counts)) {
        if (!k.startsWith(`${board}:`) || s.pending[k]) counts[k] = v
      }
      return { counts }
    }),

  addOwnPending: (item) => set((s) => ({ ownPending: [item, ...s.ownPending] })),
}))

export { key as voteKey }
