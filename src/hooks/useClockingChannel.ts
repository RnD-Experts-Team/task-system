// src/hooks/useClockingChannel.ts
// Hook to subscribe to real-time clocking session updates via WebSocket.
// Uses the websocketClient singleton (reverb broadcaster) so there is only
// one WebSocket connection shared across all clocking hooks.

import { useEffect, useRef } from "react"
import { websocketClient } from "@/websockets/websocketClient"
import type { ClockingSessionResponse } from "@/app/clocking/data"

/** Payload shape broadcast by ClockSessionUpdated event */
interface ClockSessionUpdatedPayload {
  user_id: number
  session: any
  company_timezone: string
  server_time_utc: string
}

/**
 * Subscribe to real-time clocking updates for the current user.
 * Listens on the shared "clocking.manager" channel and filters by userId.
 */
export function useClockingChannel(
  userId: number | null,
  onUpdate: (data: ClockingSessionResponse) => void
) {
  // Keep a stable ref to the callback so we don't re-subscribe on every render
  const callbackRef = useRef(onUpdate)
  callbackRef.current = onUpdate

  useEffect(() => {
    if (!userId) return

    websocketClient.initialize()

    const echo = websocketClient.getEcho()
    if (!echo) return

    // Reuse the shared "clocking.manager" channel
    const channel = echo.channel("clocking.manager")

    const handler = (payload: ClockSessionUpdatedPayload) => {
      if (payload.user_id === userId) {
        callbackRef.current({
          session: payload.session,
          company_timezone: payload.company_timezone,
          server_time_utc: payload.server_time_utc,
        })
      }
    }

    channel.listen(".ClockSessionUpdated", handler)

    return () => {
      channel.stopListening(".ClockSessionUpdated", handler)
    }
  }, [userId])
}
