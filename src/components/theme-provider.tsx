import { ViteThemeProvider, ThemeAnimationType } from "@space-man/react-theme-animation"

/**
 * Thin wrapper around @space-man/react-theme-animation's ViteThemeProvider.
 *
 * Why ViteThemeProvider?
 * - `attribute="class"` writes/removes the `dark` class on <html>, matching
 *   Tailwind v4's `@custom-variant dark (&:is(.dark *))` setup.
 * - `enableSystem` / defaultTheme="system" tracks `prefers-color-scheme`.
 * - `animationType={ThemeAnimationType.CIRCLE}` drives a View Transition API
 *   radial-clip animation that expands from the toggle button's position.
 * - `storageKey="theme"` matches the FOUC-prevention script in index.html,
 *   so the resolved class persists across hard reloads.
 * - `disableTransitionOnChange` prevents CSS transition artifacts during switch.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ViteThemeProvider
      attribute="class"
      defaultTheme="system"
      animationType={ThemeAnimationType.BLUR_CIRCLE}
      duration={800}
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </ViteThemeProvider>
  )
}
