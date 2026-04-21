// src/hooks/useClockingChannel.ts
// Hook to subscribe to real-time clocking session updates via WebSocket.
// Uses laravel-echo + pusher-js to listen on the "clocking.user.{userId}" channel
// for the "ClockSessionUpdated" event broadcast by the Laravel backend.

import { useEffect, useRef } from "react"
import Echo from "laravel-echo"
import Pusher from "pusher-js"
import type { ClockingSessionResponse } from "@/app/clocking/data"

// Ensure Pusher is globally available for laravel-echo
if (typeof window !== "undefined") {
  ;(window as any).Pusher = Pusher
}

/** Payload shape broadcast by ClockSessionUpdated event */
interface ClockSessionUpdatedPayload {
  user_id: number
  session: any
  company_timezone: string
  server_time_utc: string
}

/**
 * Subscribe to real-time clocking updates for the current user.
 * Uses a resilient Echo configuration with sensible fallbacks so the
 * client doesn't try to connect to an invalid pusher host (eg. ws-.pusher.com).
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

    // Reuse a single Echo instance on window to avoid multiple socket connections
    let echo: any = (typeof window !== "undefined" && (window as any).EchoClocking) || null

    if (!echo && typeof window !== "undefined") {
      // Resolve sensible host/port defaults
      const key = import.meta.env.VITE_REVERB_APP_KEY ?? import.meta.env.VITE_PUSHER_APP_KEY ?? "tasks_key"

      // try API_URL host as fallback, then window.location.hostname
      let wsHost = import.meta.env.VITE_REVERB_HOST ?? import.meta.env.VITE_PUSHER_HOST
      try {
        if (!wsHost && import.meta.env.VITE_API_URL) {
          wsHost = new URL(String(import.meta.env.VITE_API_URL)).hostname
        }
      } catch (e) {
        // ignore
      }
      if (!wsHost && typeof window !== "undefined") wsHost = window.location.hostname

      const wsPort = Number(import.meta.env.VITE_REVERB_PORT ?? import.meta.env.VITE_PUSHER_PORT ?? 6001)
      const wssPort = Number(import.meta.env.VITE_REVERB_PORT ?? import.meta.env.VITE_PUSHER_PORT ?? 443)
      const forceTLS = ((import.meta.env.VITE_REVERB_SCHEME ?? import.meta.env.VITE_PUSHER_SCHEME) === "https") || (typeof window !== "undefined" && window.location.protocol === "https:")

      try {
        echo = new Echo({
          broadcaster: "pusher",
          key,
          wsHost,
          wsPort,
          wssPort,
          forceTLS,
          enabledTransports: ["ws", "wss"],
          disableStats: true,
          authEndpoint: "/broadcasting/auth",
          auth: {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          },
        })

        // keep global reference so other hooks/components reuse the same socket
        ;(window as any).EchoClocking = echo
      } catch (e) {
        // Initialization failed — log and bail out; UI will still work via REST
        // (we don't want a noisy fallback that reconnects to ws-.pusher.com)
        // eslint-disable-next-line no-console
        console.error("Failed to initialize Echo (clocking):", e)
        return
      }
    }

    if (!echo) return

    // Subscribe to the public manager channel where backend broadcasts session updates
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

    // Listen for the server event name (no leading dot)
    try {
      channel.listen("ClockSessionUpdated", handler)
    } catch (e) {
      // If listen fails, log and continue — REST calls still work
      // eslint-disable-next-line no-console
      console.error("Echo listen failed (clocking):", e)
    }

    return () => {
      try {
        echo.leave("clocking.manager")
      } catch (_) {
        // ignore
      }
    }
  }, [userId])
}
