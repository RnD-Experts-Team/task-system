/**
 * Re-exports useViteTheme from @space-man/react-theme-animation so every
 * consumer imports from the same stable path (`@/hooks/use-theme`).
 *
 * Returns (subset used across this project):
 *   theme          – stored preference: "light" | "dark" | "system"
 *   setTheme       – update preference + localStorage + <html> class (no animation)
 *   resolvedTheme  – actual applied theme: "light" | "dark" (never "system")
 *   systemTheme    – OS preference: "light" | "dark" | undefined
 *   toggleTheme    – toggle with circle animation (View Transition API)
 *   ref            – attach to the trigger element as the animation origin
 */
export { useViteTheme as useTheme } from "@space-man/react-theme-animation"

