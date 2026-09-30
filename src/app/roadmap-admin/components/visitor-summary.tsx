import { Link } from "react-router"
import { Ban, Fingerprint, ShieldCheck, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AdminVisitorRef } from "../types"

type VisitorSummaryProps = {
  visitor: AdminVisitorRef | null
  createdByAdmin?: boolean
  /** Link the summary to the visitor's detail sheet on the Visitors page */
  linkable?: boolean
}

/** One-line visitor context: banned / trusted / approved count / short ip hash. */
export function VisitorSummary({ visitor, createdByAdmin, linkable = true }: VisitorSummaryProps) {
  if (!visitor) {
    return (
      <Badge variant="secondary" className="gap-1">
        <UserRound />
        {createdByAdmin ? "Team member" : "Unknown visitor"}
      </Badge>
    )
  }

  const inner = (
    <>
      {visitor.is_banned && (
        <Badge variant="destructive" className="gap-1">
          <Ban />
          Banned
        </Badge>
      )}
      {visitor.is_trusted && (
        <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <ShieldCheck />
          Trusted
        </Badge>
      )}
      <span className="text-xs text-muted-foreground">
        {visitor.approved_posts_count} approved {visitor.approved_posts_count === 1 ? "post" : "posts"}
      </span>
      {visitor.ip_hash_short && (
        <span className="inline-flex items-center gap-1 font-mono text-[0.6875rem] text-muted-foreground" title="Short IP hash (rotates monthly)">
          <Fingerprint className="size-3" />
          {visitor.ip_hash_short}
        </span>
      )}
    </>
  )

  if (!linkable) return <div className="flex flex-wrap items-center gap-2">{inner}</div>
  return (
    <Link
      to={`/roadmap-admin/visitors?visitor=${visitor.id}`}
      className="flex flex-wrap items-center gap-2 rounded-md outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
      title="Open visitor"
    >
      {inner}
    </Link>
  )
}
