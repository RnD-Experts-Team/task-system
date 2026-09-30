import { Link2 } from "lucide-react"
import { S } from "../../lib/strings"
import { btn } from "../../lib/ui"
import { useSiteStore } from "../../stores/siteStore"

export function ShareButton({ className }: { className?: string }) {
  const announce = useSiteStore((s) => s.announce)
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      announce(S.post.linkCopied)
    } catch {
      announce(S.errors.generic, "error")
    }
  }
  return (
    <button type="button" onClick={() => void copy()} className={btn("outline", "md", className)}>
      <Link2 aria-hidden="true" className="size-4" />
      {S.post.copyLink}
    </button>
  )
}
