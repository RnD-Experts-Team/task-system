// src/hooks/useManagerClockingChannel.ts
// Subscribes to real-time clocking updates on the shared manager channel.
// Uses the websocketClient singleton (reverb broadcaster) so there is only
// one WebSocket connection regardless of how many hooks mount.

import { useEffect, useRef } from "react"
import { websocketClient } from "@/websockets/websocketClient"
import type { ClockSession } from "@/app/clocking/data"

/** Payload shape broadcast by the ClockSessionUpdated backend event */
export interface ClockSessionUpdatedPayload {
  user_id: number
  session: ClockSession
  company_timezone: string
  server_time_utc: string
}

/**
 * Subscribe to the "clocking.manager" channel to receive live session updates.
 * The callback fires whenever ANY employee's session changes.
 */
export function useManagerClockingChannel(
  onUpdate: (payload: ClockSessionUpdatedPayload) => void
) {
  // Keep a stable ref to the callback to avoid re-subscribing on every render
  const callbackRef = useRef(onUpdate)
  callbackRef.current = onUpdate

  useEffect(() => {
    websocketClient.initialize()

    const echo = websocketClient.getEcho()
    if (!echo) return

    // Get (or join) the public manager channel and attach our handler.
    // We use echo.channel() directly so multiple hooks can each add their
    // own listener without interfering with one another.
    const channel = echo.channel("clocking.manager")

    const handler = (payload: ClockSessionUpdatedPayload) => {
      callbackRef.current(payload)
    }

    channel.listen(".ClockSessionUpdated", handler)

    return () => {
      channel.stopListening(".ClockSessionUpdated", handler)
    }
  }, []) // set up once per mount
}
