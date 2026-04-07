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
import { Pencil, Star, CheckCircle2, Circle } from "lucide-react"
import type { Task } from "@/app/tasks/data"

type TaskDetailSheetProps = {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (task: Task) => void
  onRate?: (task: Task) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const statusLabel: Record<string, string> = {
  "in-progress": "In Progress",
  pending: "Pending",
  completed: "Completed",
  todo: "Todo",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "in-progress": "default",
  pending: "outline",
  completed: "default",
  todo: "secondary",
}

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "outline",
  low: "secondary",
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onEdit,
  onRate,
}: TaskDetailSheetProps) {
  if (!task) return null

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-full md:max-w-[50vw] overflow-y-auto themed-scrollbar">
        <SheetHeader className="gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={priorityVariant[task.priority] ?? "outline"} className="capitalize">
              {task.priority} Priority
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{task.code}</span>
            <Badge variant="secondary">{task.project}</Badge>
          </div>
          <SheetTitle className="text-2xl">{task.title}</SheetTitle>
          <SheetDescription className="sr-only">Task details for {task.title}</SheetDescription>
        </SheetHeader>

        <div className="px-8 pb-10 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Status
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${
                    task.status === "in-progress"
                      ? "bg-primary animate-pulse"
                      : task.status === "completed"
                        ? "bg-green-500"
                        : "bg-muted-foreground"
                  }`}
                />
                <Badge variant={statusVariant[task.status] ?? "outline"}>
                  {statusLabel[task.status] ?? task.status}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Due Date
              </p>
              <p className="text-sm font-medium">{task.dueDate}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Weight
              </p>
              <p className="text-sm font-medium">{task.weight}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Section
              </p>
              <p className="text-sm font-medium">{task.section}</p>
            </div>
          </div>

          {/* Assignees */}
          <section>
            <h4 className="text-sm font-semibold mb-3">Assignees</h4>
            <div className="flex flex-wrap gap-3">
              {task.assignees.map((assignee) => (
                <div
                  key={assignee.id}
                  className="flex items-center gap-2 rounded-full bg-muted/50 pr-3 pl-1 py-1"
                >
                  <Avatar className="size-6">
                    <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{assignee.name}</span>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Description */}
          <section>
            <h4 className="text-sm font-semibold mb-3">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
          </section>

          <Separator />

          {/* Subtasks */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Subtasks Progress</h4>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            {totalSubtasks > 0 && (
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    subtask.completed
                      ? "bg-muted/30"
                      : "bg-muted/50 border-l-2 border-primary"
                  }`}
                >
                  {subtask.completed ? (
                    <CheckCircle2 className="size-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      subtask.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Rating */}
          {task.rating > 0 && (
            <>
              <Separator />
              <section>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Star className="size-5 fill-primary text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Quality Rating
                      </p>
                      <p className="text-sm font-bold">
                        {task.rating >= 4
                          ? "Excellent"
                          : task.rating >= 3
                            ? "Good"
                            : task.rating >= 2
                              ? "Fair"
                              : "Needs Improvement"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < task.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            {onRate && (
              <Button variant="outline" size="lg" className="flex-1" onClick={() => onRate(task)}>
                <Star className="size-4" />
                Rate Task
              </Button>
            )}
            {onEdit && (
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => onEdit(task)}>
                <Pencil className="size-4" />
                Edit Task
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
