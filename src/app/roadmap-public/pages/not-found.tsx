import { Compass } from "lucide-react"
import { Link } from "react-router"
import { usePageMeta } from "../hooks/usePageMeta"
import { S } from "../lib/strings"
import { btn, containerClass } from "../lib/ui"
import { homePath } from "../lib/url"
import { useSiteStore } from "../stores/siteStore"
import { EmptyState } from "../components/common/empty-state"
import { cn } from "@/lib/utils"

/** Rendered by pages for unknown board / post / changelog slugs (not a route of its own). */
export default function RoadmapNotFoundPage() {
  const siteName = useSiteStore((s) => s.config?.site.name ?? "Roadmap")
  usePageMeta({ title: S.meta.notFoundTitle(siteName) })
  return (
    <div className={cn(containerClass, "py-16 sm:py-24")}>
      <EmptyState
        icon={Compass}
        title={S.errors.notFoundTitle}
        body={S.errors.notFoundBody}
        className="mx-auto max-w-lg border-solid"
        action={
          <Link to={homePath()} className={btn("primary", "md")}>
            {S.common.goHome}
          </Link>
        }
      />
    </div>
  )
}
