// src/hooks/useClockingNotifications.ts
// Listens on the "clocking.manager" WebSocket channel and shows toast
// notifications to admin/manager users when employees clock in, clock out,
// start a break, or end a break.
//
// Additional behaviour when the app tab is in the background:
//   • Plays a soft audio chime for every notification.
//   • Prefixes the document title with an unread badge, e.g. "(3) task-system".
//   • Resets the badge the moment the user returns to the tab.
//
// Mount this hook once at the layout level — it self-gates on the permission.

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/usePermissions"
import { useManagerClockingChannel } from "@/hooks/useManagerClockingChannel"
import { playNotificationChime } from "@/lib/notificationSound"
import type { ClockSession } from "@/app/clocking/data"

// ─── Helpers ─────────────────────────────────────────────────────

/** Derive the clocking action from the session's current state. */
function detectAction(session: ClockSession): "clock-in" | "clock-out" | "break-start" | "break-end" | null {
  if (session.status === "completed") return "clock-out"
  if (session.status === "on_break") return "break-start"
  if (session.status === "active") {
    const hasBreaks = session.break_records && session.break_records.length > 0
    const lastBreak = hasBreaks ? session.break_records[session.break_records.length - 1] : null
    if (lastBreak && lastBreak.break_end_utc !== null) return "break-end"
    return "clock-in"
  }
  return null
}

const ACTION_LABELS: Record<string, string> = {
  "clock-in":    "Clocked In",
  "clock-out":   "Clocked Out",
  "break-start": "Started Break",
  "break-end":   "Ended Break",
}

// Emoji prefix shown in the tab title per action type
const ACTION_EMOJI: Record<string, string> = {
  "clock-in":    "🟢",
  "clock-out":   "🔴",
  "break-start": "🟡",
  "break-end":   "🟢",
}

// ─── Tab-title badge helpers ──────────────────────────────────────

const BASE_TITLE = document.title || "task-system"

function setTabBadge(count: number): void {
  document.title = count > 0 ? `(${count}) ${BASE_TITLE}` : BASE_TITLE
}

// ─── Hook ─────────────────────────────────────────────────────────

/**
 * Subscribes to real-time clocking events and:
 *   1. Shows a toast notification.
 *   2. Plays an audio chime.
 *   3. Updates the browser tab title with an unread counter when
 *      the user is on a different tab.
 *
 * Only activates for users with the "view all clocking sessions" permission.
 * Deduplicates rapid-fire events for the same session + action combination.
 */
export function useClockingNotifications() {
  const { hasPermission } = usePermissions()
  const isManager = hasPermission("view all clocking sessions")

  // Track the last event shown per session to prevent duplicate toasts
  const lastEventRef  = useRef<Map<number, string>>(new Map())
  // Unread count — notifications that arrived while the tab was hidden
  const unreadRef = useRef(0)

  // Reset badge and unread count whenever the user returns to this tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        unreadRef.current = 0
        setTabBadge(0)
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [])

  useManagerClockingChannel((payload) => {
    if (!isManager) return

    const session = payload.session as ClockSession
    const action = detectAction(session)
    if (!action) return

    // Deduplicate: skip if we already showed this exact action for this session
    const key = `${session.id}:${action}`
    if (lastEventRef.current.get(session.id) === key) return
    lastEventRef.current.set(session.id, key)

    const userName  = session.user?.name ?? `User #${session.user_id}`
    const label     = ACTION_LABELS[action]
    const emoji     = ACTION_EMOJI[action]
    const actionTime = new Date().toLocaleTimeString("en-US", {
      hour:   "2-digit",
      minute: "2-digit",
    })

    // ── 1. Audio chime (always) ───────────────────────────────────
    playNotificationChime()

    // ── 2. Tab-title badge (only when tab is hidden) ──────────────
    if (document.visibilityState !== "visible") {
      unreadRef.current += 1
      setTabBadge(unreadRef.current)
    }

    // ── 3. Toast notification ─────────────────────────────────────
    const toastTitle = `${emoji} ${userName} ${label}`
    const toastDesc  = `at ${actionTime}`

    switch (action) {
      case "clock-in":
        toast.success(toastTitle, { description: toastDesc, duration: 5000 })
        break
      case "clock-out":
        toast.info(toastTitle, { description: toastDesc, duration: 5000 })
        break
      case "break-start":
        toast.warning(toastTitle, { description: toastDesc, duration: 5000 })
        break
      case "break-end":
        toast.success(toastTitle, { description: toastDesc, duration: 5000 })
        break
    }
  })
}
