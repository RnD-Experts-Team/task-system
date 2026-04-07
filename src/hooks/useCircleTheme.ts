import { useCallback, useMemo, useRef } from "react"
import { useViteTheme } from "@space-man/react-theme-animation"
import type { Theme } from "@space-man/react-theme-animation"

export interface UseCircleThemeOptions {
  /** Duration (ms) of the icon micro-interaction. @default 500 */
  speed?: number
  /** Exit-collapse intensity 0–1. @default 1 */
  intensity?: number
}

export interface UseCircleThemeReturn {
  /** 1×1 px fixed span — teleported to cursor on click, used as VT circle origin. */
  ghostRef: React.RefObject<HTMLSpanElement | null>
  resolvedTheme: "light" | "dark"
  theme: string
  /** Click handler: positions ghost at cursor coords then calls switchThemeFromElement. */
  handleClick: (e: React.MouseEvent) => void
  isDark: boolean
  /** CSS duration string for icon micro-interactions. */
  transitionDuration: string
  /** Scale applied to the exiting icon (collapse effect). */
  exitScale: number
  /** Delay before the entering icon animates in (exit/enter stagger). */
  enterDelay: string
}

/**
 * Wraps `useViteTheme` with cursor-aware animation origin and derived icon
 * transition values. The circle wipe expands from the exact pixel clicked,
 * not just the button center.
 */
export function useCircleTheme(options: UseCircleThemeOptions = {}): UseCircleThemeReturn {
  const { speed = 50, intensity = 1 } = options

  const { switchThemeFromElement, resolvedTheme, theme } = useViteTheme()

  // A 1×1 px fixed element — its getBoundingClientRect() center becomes the
  // View Transition origin. Teleported to (clientX, clientY) just before the
  // transition fires, so the circle expands from the exact cursor position.
  const ghostRef = useRef<HTMLSpanElement>(null)

  const isDark = resolvedTheme === "dark"

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!ghostRef.current) return
      ghostRef.current.style.left = `${e.clientX}px`
      ghostRef.current.style.top = `${e.clientY}px`
      const next: Theme = resolvedTheme === "dark" ? "light" : "dark"
      switchThemeFromElement(next, ghostRef.current as unknown as HTMLButtonElement)
    },
    [resolvedTheme, switchThemeFromElement],
  )

  const transitionDuration = useMemo(() => `${speed}ms`, [speed])

  // Clamp exit scale: higher intensity → tighter collapse.
  const exitScale = useMemo(
    () => Math.max(0.3, 0.6 - intensity * 0.3),
    [intensity],
  )

  // Entering icon waits ~18% of the cycle so the exit clears the stage first.
  const enterDelay = useMemo(() => `${Math.round(speed * 0.10)}ms`, [speed])

  return {
    ghostRef,
    resolvedTheme,
    theme,
    handleClick,
    isDark,
    transitionDuration,
    exitScale,
    enterDelay,
  }
}
