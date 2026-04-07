import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import type { User } from "@/app/users/data"

type UserDetailSheetProps = {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (user: User) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const statusLabel: Record<string, string> = {
  active: "Active",
  away: "Away",
  suspended: "Suspended",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  away: "outline",
  suspended: "destructive",
}

// Mock activity data
const recentTasks = [
  {
    id: "1",
    title: "Design System Audit",
    status: "In Progress",
    statusVariant: "default" as const,
    description: "Reviewing accessibility contrast ratios for the new theme palette.",
    due: "Oct 24",
  },
  {
    id: "2",
    title: "Mobile App Wireframes",
    status: "Todo",
    statusVariant: "secondary" as const,
    description: "Core navigation flow and task creation interface.",
    due: "Oct 28",
  },
]

const activityHistory = [
  { label: "Completed Task", detail: "Brand Identity Guidelines v2.1", time: "2 hours ago", active: true },
  { label: "Joined Project", detail: "Editorial Redesign Phase II", time: "Yesterday, 4:12 PM", active: false },
  { label: "Updated Status", detail: "Changed status to Active", time: "2 days ago", active: false },
]

export function UserDetailSheet({ user, open, onOpenChange, onEdit }: UserDetailSheetProps) {
  if (!user) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-full md:max-w-[50vw] overflow-y-auto themed-scrollbar">
        <SheetHeader className="items-center text-center gap-3">
          <Avatar size="lg" className="size-28 ring-2 ring-primary/20">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <SheetTitle className="text-2xl">{user.name}</SheetTitle>
          <SheetDescription className="text-sm">{user.email}</SheetDescription>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant={statusVariant[user.status] ?? "outline"}>
              {statusLabel[user.status] ?? user.status}
            </Badge>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
        </SheetHeader>

        <div className="px-8 pb-10 space-y-8">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Joined
              </p>
              <p className="text-sm font-medium">{user.createdAt}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Status
              </p>
              <p className="text-sm font-medium flex items-center gap-2">
                <span
                  className={`size-3 rounded-full ${
                    user.status === "active"
                      ? "bg-primary"
                      : user.status === "away"
                        ? "bg-yellow-500"
                        : "bg-destructive"
                  }`}
                />
                {statusLabel[user.status] ?? user.status}
              </p>
            </div>
          </div>

          <Separator />

          {/* Recent Tasks */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold">Recent Tasks</h4>
              <Button variant="link" size="sm" className="text-primary">
                View all
              </Button>
            </div>
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div key={task.id} className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{task.title}</span>
                    <Badge variant={task.statusVariant} className="shrink-0">
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
                  <p className="text-sm text-muted-foreground">Due {task.due}</p>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Activity History */}
          <section>
            <h4 className="text-sm font-semibold mb-4">Activity History</h4>
            <div className="relative space-y-4 pl-4 border-l border-border">
              {activityHistory.map((activity, i) => (
                <div key={i} className="relative flex justify-start gap-3">
                  <div
                    className={`absolute -left-[calc(0.25rem+15px)] top-1 size-3 rounded-full ring-2 ring-background ${
                      activity.active ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{activity.label}</span>
                    <span className="text-sm text-muted-foreground">{activity.detail}</span>
                    <span className="text-sm text-muted-foreground/70">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Edit Action */}
          {onEdit && (
            <Button variant="secondary" size="lg" className="w-full" onClick={() => onEdit(user)}>
              <Pencil />
              Edit User
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
