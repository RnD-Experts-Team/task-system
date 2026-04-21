// src/hooks/useManagerClockingChannel.ts
// Subscribes to real-time clocking updates on the shared manager channel.
// Mirrors the pattern of useClockingChannel but listens on "clocking.manager"
// and reuses the same global Echo instance to avoid duplicate connections.

import { useEffect, useRef } from "react"
import Echo from "laravel-echo"
import Pusher from "pusher-js"
import type { ClockSession } from "@/app/clocking/data"

// Ensure Pusher constructor is globally available for laravel-echo
if (typeof window !== "undefined") {
  ;(window as any).Pusher = Pusher
}

/** Payload shape broadcast by the ClockSessionUpdated backend event */
interface ClockSessionUpdatedPayload {
  user_id: number
  session: ClockSession
  company_timezone: string
  server_time_utc: string
}

/**
 * Subscribe to the "clocking.manager" channel to receive live session updates.
 * The callback fires whenever ANY employee's session changes.
 *
 * Reuses the global window.EchoClocking instance created by useClockingChannel
 * so there is only one WebSocket connection regardless of how many hooks mount.
 */
export function useManagerClockingChannel(
  onUpdate: (payload: ClockSessionUpdatedPayload) => void
) {
  // Keep a stable ref to the callback to avoid re-subscribing on every render
  const callbackRef = useRef(onUpdate)
  callbackRef.current = onUpdate

  useEffect(() => {
    // Reuse the global Echo instance if it already exists (set by useClockingChannel)
    let echo: any = (typeof window !== "undefined" && (window as any).EchoClocking) || null

    if (!echo && typeof window !== "undefined") {
      // Build a new Echo instance with the same config as useClockingChannel
      const key =
        import.meta.env.VITE_REVERB_APP_KEY ??
        import.meta.env.VITE_PUSHER_APP_KEY ??
        "tasks_key"

      let wsHost = import.meta.env.VITE_REVERB_HOST ?? import.meta.env.VITE_PUSHER_HOST
      try {
        if (!wsHost && import.meta.env.VITE_API_URL) {
          wsHost = new URL(String(import.meta.env.VITE_API_URL)).hostname
        }
      } catch (_) {
        // ignore
      }
      if (!wsHost) wsHost = window.location.hostname

      const wsPort = Number(import.meta.env.VITE_REVERB_PORT ?? import.meta.env.VITE_PUSHER_PORT ?? 6001)
      const wssPort = Number(import.meta.env.VITE_REVERB_PORT ?? import.meta.env.VITE_PUSHER_PORT ?? 443)
      const forceTLS =
        (import.meta.env.VITE_REVERB_SCHEME ?? import.meta.env.VITE_PUSHER_SCHEME) === "https" ||
        window.location.protocol === "https:"

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
        ;(window as any).EchoClocking = echo
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to initialize Echo (manager clocking):", e)
        return
      }
    }

    if (!echo) return

    // Subscribe to the public manager channel
    const channel = echo.channel("clocking.manager")

    const handler = (payload: ClockSessionUpdatedPayload) => {
      callbackRef.current(payload)
    }

    try {
      channel.listen("ClockSessionUpdated", handler)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Echo listen failed (manager clocking):", e)
    }

    return () => {
      try {
        // Only stop listening, do not leave the channel (other components may still use it)
        channel.stopListening("ClockSessionUpdated", handler)
      } catch (_) {
        // ignore
      }
    }
  }, []) // empty deps — set up once per mount
}
