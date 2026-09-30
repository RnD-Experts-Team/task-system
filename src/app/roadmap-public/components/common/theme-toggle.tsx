import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { S } from "../../lib/strings"

/** Light/dark switch that follows the app-wide `theme` key and `.dark` class. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? S.nav.toLight : S.nav.toDark}
      className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-[background-color,color,transform] duration-150 ease-out hover:bg-muted hover:text-foreground motion-safe:active:scale-[0.97]"
    >
      {dark ? <Sun aria-hidden="true" className="size-[1.125rem]" /> : <Moon aria-hidden="true" className="size-[1.125rem]" />}
    </button>
  )
}
