import type { ReactNode } from "react"
import { Drawer } from "vaul"
import { X } from "lucide-react"
import { useThemeRoot } from "../../lib/theme-root"
import { S } from "../../lib/strings"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}

/**
 * Bottom sheet built on vaul. Mounted inside the theme root so the brand tokens apply
 * (a body-level portal would fall back to the staff app's red tokens).
 */
export function RmDrawer({ open, onOpenChange, title, description, children }: Props) {
  const root = useThemeRoot()
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal container={root}>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50 motion-safe:transition-opacity" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92svh] flex-col rounded-t-2xl border border-border/60 bg-background text-foreground outline-none">
          <div aria-hidden="true" className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/25" />
          <div className="flex items-start justify-between gap-4 px-5 pt-3 pb-2">
            <div className="min-w-0">
              <Drawer.Title className="text-lg font-semibold tracking-tight">{title}</Drawer.Title>
              {description ? (
                <Drawer.Description className="mt-0.5 text-sm text-muted-foreground">{description}</Drawer.Description>
              ) : (
                <Drawer.Description className="sr-only">{title}</Drawer.Description>
              )}
            </div>
            <Drawer.Close
              aria-label={S.common.close}
              className="-me-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden="true" className="size-5" />
            </Drawer.Close>
          </div>
          <div className="overflow-y-auto px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
