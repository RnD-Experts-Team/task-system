import { createContext, useContext } from "react"

/** The `[data-roadmap-theme]` element; portalled UI (drawers) mounts inside it so tokens apply. */
export const ThemeRootContext = createContext<HTMLElement | null>(null)

export function useThemeRoot(): HTMLElement | null {
  return useContext(ThemeRootContext)
}
