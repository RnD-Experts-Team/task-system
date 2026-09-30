import { useCallback, useEffect, useState } from "react"

/** Counts down whole seconds after `start(seconds)`. `remaining` is 0 when idle. */
export function useCooldown() {
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (until <= Date.now()) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= until) clearInterval(id)
    }, 250)
    return () => clearInterval(id)
  }, [until])

  const start = useCallback((seconds: number) => {
    const t = Date.now()
    setNow(t)
    setUntil(t + seconds * 1000)
  }, [])

  return { remaining: Math.max(0, Math.ceil((until - now) / 1000)), start }
}
