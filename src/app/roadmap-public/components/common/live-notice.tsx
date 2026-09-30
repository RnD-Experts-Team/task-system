import { useEffect } from "react"
import { AlertCircle, X } from "lucide-react"
import { useSiteStore } from "../../stores/siteStore"
import { S } from "../../lib/strings"

/**
 * One polite live region for the whole site (vote and submit results) plus a visible toast for errors.
 */
export function LiveNotice() {
  const notice = useSiteStore((s) => s.notice)
  const dismiss = useSiteStore((s) => s.dismissNotice)

  useEffect(() => {
    if (!notice) return
    const id = setTimeout(dismiss, notice.tone === "error" ? 6000 : 2500)
    return () => clearTimeout(id)
  }, [notice, dismiss])

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {notice && notice.tone === "info" ? notice.text : ""}
      </div>
      {notice && notice.tone === "error" ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 sm:bottom-6">
          <div
            role="alert"
            className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-150"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="min-w-0 flex-1 text-pretty">{notice.text}</p>
            <button
              type="button"
              onClick={dismiss}
              aria-label={S.common.close}
              className="-m-1 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
