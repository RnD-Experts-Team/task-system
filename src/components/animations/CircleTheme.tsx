import { memo, useCallback, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCircleTheme } from "@/hooks/useCircleTheme"

export interface CircleThemeProps {
  /**
   * Button size variant.
   * - "sm" → 32px  |  "md" → 40px (default)  |  "lg" → 48px
   */
  size?: "sm" | "md" | "lg"
  /**
   * Optional accent colour applied to the border/glow on hover.
   * Accepts any valid CSS colour string.
   */
  color?: string
  /**
   * Duration (ms) of the icon micro-interaction.
   * @default 500
   */
  speed?: number
  /**
   * Exit-collapse intensity 0–1. Higher = tighter collapse.
   * @default 1
   */
  intensity?: number
  className?: string
}

const sizeMap: Record<NonNullable<CircleThemeProps["size"]>, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
}

const iconSizeMap: Record<NonNullable<CircleThemeProps["size"]>, string> = {
  sm: "size-[0.875rem]",
  md: "size-[1.0625rem]",
  lg: "size-[1.25rem]",
}

/**
 * CircleTheme — glassmorphism light/dark toggle with cursor-origin circle wipe.
 *
 * Animation architecture:
 *   1. A 1×1 px ghost span is rendered as a sibling (position: fixed).
 *      On click it is teleported to the cursor's viewport coordinates.
 *   2. `switchThemeFromElement(nextTheme, ghostRef)` triggers a View Transition
 *      whose blur-circle wipe expands from exactly where the user clicked.
 *   3. A cursor-following radial shimmer span sits inside the button. Its
 *      `background` is mutated directly on mousemove — no state, no re-renders.
 *   4. Sun/Moon icons use a staggered exit/enter: the departing icon clears the
 *      stage before the entering one begins its animation.
 */
function CircleThemeBase({
  size = "md",
  color,
  speed = 500,
  intensity = 1,
  className,
}: CircleThemeProps) {
  const { ghostRef, isDark, handleClick, transitionDuration, exitScale, enterDelay } =
    useCircleTheme({ speed, intensity })

  // Directly-mutated shimmer span — background set on mousemove, no re-renders.
  const shimmerRef = useRef<HTMLSpanElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!shimmerRef.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    shimmerRef.current.style.background =
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.22) 0%, transparent 68%)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!shimmerRef.current) return
    shimmerRef.current.style.background = "none"
  }, [])

  const ariaLabel = isDark ? "Switch to light theme" : "Switch to dark theme"

  // Shared transition for both icons: cubic-bezier ease + per-icon stagger.
  const iconTransition = `transform ${transitionDuration} cubic-bezier(0.4,0,0.2,1), opacity ${transitionDuration} cubic-bezier(0.4,0,0.2,1)`

  return (
    <>
      {/*
       * Ghost origin element — lives outside the button so button transforms
       * (scale on hover/active) don't displace its fixed-position coordinates.
       * Teleported to (clientX, clientY) just before the View Transition fires.
       */}
      <span
        ref={ghostRef}
        aria-hidden
        className="pointer-events-none fixed size-px opacity-0"
      />

      <button
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label={ariaLabel}
        aria-pressed={isDark}
        type="button"
        className={cn(
          // Layout
          "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
          sizeMap[size],
          // ── Glassmorphism surface ──────────────────────────────────────────
          "bg-white/10 dark:bg-white/6",
          "backdrop-blur-md",
          // Border: frosted-glass edge, slightly brighter on top-left
          "border border-white/30 dark:border-white/10",
          // Layered shadow: ambient depth underneath + inner top sheen
          "shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.22)]",
          "dark:shadow-[0_2px_12px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.07)]",
          // ── Hover state ───────────────────────────────────────────────────
          "hover:scale-[1.08]",
          "hover:border-white/45 dark:hover:border-white/20",
          "hover:shadow-[0_6px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.32)]",
          "dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.10)]",
          // ── Pressed ───────────────────────────────────────────────────────
          "active:scale-[0.94]",
          // ── Motion: spring easing for bounce, slower settle ───────────────
          "transition-all duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)]",
          // ── Focus ring ────────────────────────────────────────────────────
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        style={color ? { borderColor: color } as React.CSSProperties : undefined}
      >
        {/*
         * Cursor-following radial shimmer.
         * Opacity is driven by CSS (group-hover); background is driven by JS.
         * This combination avoids any React re-renders on mousemove.
         */}
        <span
          ref={shimmerRef}
          aria-hidden
          className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Sun — active in light mode. Exits clockwise, enters from -90°. */}
        <Sun
          aria-hidden
          className={cn("absolute", iconSizeMap[size], "will-change-transform")}
          style={{
            transition: iconTransition,
            transitionDelay: isDark ? "0ms" : enterDelay,
            transform: isDark
              ? `rotate(90deg) scale(${exitScale})`
              : "rotate(0deg) scale(1)",
            opacity: isDark ? 0 : 1,
          }}
        />

        {/* Moon — active in dark mode. Exits counter-clockwise, enters from 90°. */}
        <Moon
          aria-hidden
          className={cn("absolute", iconSizeMap[size], "will-change-transform")}
          style={{
            transition: iconTransition,
            transitionDelay: isDark ? enterDelay : "0ms",
            transform: isDark
              ? "rotate(0deg) scale(1)"
              : `rotate(-90deg) scale(${exitScale})`,
            opacity: isDark ? 1 : 0,
          }}
        />

        <span className="sr-only">{ariaLabel}</span>
      </button>
    </>
  )
}

export const CircleTheme = memo(CircleThemeBase)
CircleTheme.displayName = "CircleTheme"
