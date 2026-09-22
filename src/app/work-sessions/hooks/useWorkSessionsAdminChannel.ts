// src/app/work-sessions/hooks/useWorkSessionsAdminChannel.ts
// Subscribes to real-time work-session updates on the shared admin channel.
// Mirrors useManagerClockingChannel: uses the websocketClient singleton
// (reverb broadcaster) so there is only one WebSocket connection regardless
// of how many hooks mount.

import { useEffect, useRef, useState } from "react"
import { websocketClient } from "@/websockets/websocketClient"
import type { WorkSessionUpdatedPayload } from "../types"

const CHANNEL = "work-sessions.admin"
const EVENT = ".WorkSessionUpdated"
/** After this long without a subscription ack we report the channel as offline. */
const CONNECT_TIMEOUT_MS = 8000

export type ChannelStatus = "connecting" | "live" | "offline"

/**
 * Subscribe to the "work-sessions.admin" channel to receive live session
 * updates. The callback fires whenever ANY employee's session changes.
 * `connected` flips to true once the channel subscription is acknowledged;
 * `status` also reports "offline" when the socket never connects (e.g. the
 * Reverb host is not reachable from the browser), so the UI can say so.
 */
export function useWorkSessionsAdminChannel(
  onUpdate: (payload: WorkSessionUpdatedPayload) => void
) {
  const [status, setStatus] = useState<ChannelStatus>("connecting")

  // Keep a stable ref to the callback to avoid re-subscribing on every render.
  // (Updated inside an effect rather than during render to satisfy react-hooks/refs.)
  const callbackRef = useRef(onUpdate)
  useEffect(() => {
    callbackRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    websocketClient.initialize()

    const echo = websocketClient.getEcho()
    if (!echo) return

    // Get (or join) the public admin channel and attach our handler.
    // We use echo.channel() directly so multiple hooks can each add their
    // own listener without interfering with one another.
    const channel = echo.channel(CHANNEL)

    const handler = (payload: WorkSessionUpdatedPayload) => {
      callbackRef.current(payload)
    }

    channel.listen(EVENT, handler)
    channel.subscribed(() => setStatus("live"))
    channel.error(() => setStatus("offline"))

    // Nothing acknowledged in time — treat it as offline rather than leaving
    // the badge on "Connecting…" forever.
    const timer = window.setTimeout(
      () => setStatus((s) => (s === "connecting" ? "offline" : s)),
      CONNECT_TIMEOUT_MS
    )

    return () => {
      window.clearTimeout(timer)
      channel.stopListening(EVENT, handler)
      // Leave the channel so a later remount subscribes afresh — otherwise the
      // cached channel is already subscribed and `subscribed()` never fires again,
      // leaving `connected` stuck at false.
      echo.leaveChannel(CHANNEL)
    }
  }, []) // set up once per mount

  return { status, connected: status === "live" }
}
