import { cn } from "@/lib/utils"
import type { ActivityEvent } from "../data"

interface ActivityFeedProps {
  events: ActivityEvent[]
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "mt-1.5 size-2.5 shrink-0 rounded-full",
                event.color === "primary" ? "bg-primary" : "bg-orange-400"
              )}
            />
            {i < events.length - 1 && (
              <div className="my-1.5 w-px flex-1 bg-border/30" />
            )}
          </div>
          <div className="pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {event.time}
            </span>
            <p className="mt-1 text-sm font-medium">
              {event.message}{" "}
              <span className="text-muted-foreground">{event.highlight}</span>
            </p>
            {event.detail && (
              <div className="mt-2 rounded-lg bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
                {event.detail}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
