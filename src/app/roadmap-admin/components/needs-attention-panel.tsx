import { Link } from "react-router"
import { ArrowRight, Fingerprint, MessageSquareWarning, ShieldCheck, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "./empty-state"
import { humanize } from "../utils/format"
import { reviewPath } from "../utils/review"
import type { SuspiciousItem } from "../types"

const REASONS: Record<string, string> = {
  vote_spike: "Votes spiked on this post",
  ip_concentration: "Most recent votes come from a few IPs",
  ip_many_visitors: "One IP minted many visitors today",
  vote_burst: "Many votes in a few minutes",
  new_visitor_cluster: "Cluster of brand-new visitors voting",
}

const ICONS = { post: MessageSquareWarning, visitor: UserRound, ip_hash: Fingerprint } as const

/** "Needs attention": the suspicious items from the analytics heuristics, one click to review. */
export function NeedsAttentionPanel({ items }: { items: SuspiciousItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <CardTitle className="text-base">Needs attention</CardTitle>
          {items.length > 0 && <Badge variant="destructive">{items.length}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Nothing looks suspicious"
            description="Voting and posting patterns look normal for this period."
            className="p-6"
          />
        ) : (
          <ul className="divide-y">
            {items.map((item) => {
              const Icon = ICONS[item.type]
              return (
                <li key={`${item.type}-${item.ref}-${item.reason_code}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="shrink-0 rounded-md bg-muted p-1.5">
                    <Icon className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={item.type === "post" ? "truncate text-sm font-medium" : "truncate font-mono text-sm font-medium"}>
                      {item.subject}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{REASONS[item.reason_code] ?? humanize(item.reason_code)}</p>
                  </div>
                  <Badge variant="outline" className="hidden tabular-nums sm:inline-flex" title="Suspicion score">
                    {Math.round(item.score)}
                  </Badge>
                  <Button asChild size="lg" variant="outline" className="shrink-0 gap-1">
                    <Link to={reviewPath(item)}>
                      Review
                      <ArrowRight />
                    </Link>
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
