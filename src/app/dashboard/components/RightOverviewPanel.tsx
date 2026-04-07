import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit, Eye, ArrowRight, CheckCheck, Rocket, MessageSquare} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const USER_STATS = [
  { label: "My Tasks", value: "12", sub: "Active", icon: CheckCheck },
  { label: "Projects", value: "04", sub: "Queued", icon: Rocket },
  { label: "Help Desk", value: "02", sub: "Tickets", icon: MessageSquare },
]

const RECENT_ACTIVITIES = [
  { id: 1, text: "Updated Apollo System documentation", time: "2 mins ago", active: true },
  { id: 2, text: "Meeting with Marketing Team", time: "1 hour ago", active: false },
  { id: 3, text: "Resolved ticket #2041", time: "3 hours ago", active: false },
]

export default function RightOverviewPanel({ variant = "aside" }: { variant?: "aside" | "card" | "developer" }) {
  const inner = (
    <div className="flex flex-col gap-5 p-5 flex-1 min-h-0">
      <Card className="glass-panel border-border/20 shadow-none">
        <CardContent className={cn("p-5 flex flex-col items-center text-center gap-3", variant === "card" ? "p-6" : "") }>
          <div className="relative">
            <Avatar className={cn("size-20 ring-4 ring-primary/20", variant === "card" ? "size-24" : "") }>
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">DR</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0.5 right-0.5 size-4 rounded-full bg-emerald-500 border-2 border-background" aria-label="Online" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold">Dilan Rey</h2>
            <p className="text-xs text-muted-foreground mt-0.5">dilan.r@company.io</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Edit profile"><Edit className="size-3.5" /></Button>
            <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Share profile"><Eye className="size-3.5" /></Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {USER_STATS.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="group flex items-center justify-between p-3 rounded-xl glass-panel border border-border/10 cursor-pointer hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="font-heading text-base font-black leading-tight">{value} <span className="text-xs font-normal text-muted-foreground">{sub}</span></p>
              </div>
            </div>
            <ArrowRight className="size-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        ))}
      </div>

      <Separator className="bg-border/30" />

      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Recent Activity</h3>
        <div className="relative pl-5 space-y-4">
          <div className="absolute left-1.5 top-1.5 bottom-1.5 w-px bg-border/30" aria-hidden="true" />
          {RECENT_ACTIVITIES.map((activity) => (
            <div key={activity.id} className="relative flex flex-col gap-0.5">
              <span className={cn("absolute -left-5.5 top-0.5 size-3 rounded-full border-2 border-background", activity.active ? "bg-primary" : "bg-border")} aria-hidden="true" />
              <p className="text-xs font-semibold leading-tight">{activity.text}</p>
              <p className="text-[10px] text-muted-foreground">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (variant === "aside") {
    return (
      <aside className="flex flex-col w-full md:w-72 lg:w-80 md:shrink-0 border-t md:border-t-0 md:border-l border-border/20 overflow-y-auto min-w-0" aria-label="User overview">
        {inner}
      </aside>
    )
  }
  if (variant === "card") {
    return (
      <section aria-label="Developer overview" className="w-full">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl bg-background/60 border border-border/20 overflow-hidden shadow-sm">
            {inner}
          </div>
        </div>
      </section>
    )
  }

  // developer variant: compact console layout using existing data
  return (
    <section aria-label="Developer overview" className="w-full">
      <div className=" w-full  p-2 md:p-4">
        <div className="rounded-2xl bg-background/60 border border-border/20 overflow-hidden shadow-sm ">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              

              <div className="flex flex-wrap gap-3">
                {USER_STATS.map(({ label, value, sub, icon: Icon }) => (
                  <div key={label} className="flex-1 min-w-[160px] rounded-lg glass-panel border border-border/10 p-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                        <p className="font-heading text-base font-black leading-tight">{value} <span className="text-xs font-normal text-muted-foreground">{sub}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="mt-2">
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold">Recent Activity</h3>
                    <Button variant="ghost" className="text-xs">View all</Button>
                  </div>
                  <div className="space-y-3">
                    {RECENT_ACTIVITIES.map((a) => (
                      <div key={a.id} className="flex items-start gap-3">
                        <span className={cn("w-2 h-2 rounded-full mt-1", a.active ? "bg-primary" : "bg-border")} aria-hidden="true" />
                        <div>
                          <p className="text-sm font-semibold">{a.text}</p>
                          <p className="text-xs text-muted-foreground">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-0">
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <Avatar className="size-20 ring-4 ring-primary/20">
                    <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">DR</AvatarFallback>
                  </Avatar>
                  <h3 className="font-heading text-base font-bold">Dilan Rey</h3>
                  <p className="text-xs text-muted-foreground">dilan.r@company.io</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Edit profile"><Edit className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-full" aria-label="Share profile"><Eye className="size-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg glass-panel border border-border/10 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">CI Status</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Passing</span>
                  <span className="text-xs text-muted-foreground">Last: 10m ago</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
