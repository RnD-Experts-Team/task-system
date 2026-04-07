import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Star, Calendar } from "lucide-react"
import { useTilt } from "@/hooks/use-tilt"
import type { Task } from "@/app/tasks/data"

type TaskCardProps = {
  task: Task
  onSelect: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onRate: (task: Task) => void
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

export function TaskCard({ task, onSelect, onEdit, onDelete, onRate }: TaskCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.015 })

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  return (
    <Card ref={ref} style={style} className="flex flex-col">
      <CardContent className="flex flex-col gap-4 pt-4 px-4 flex-1">
        {/* Header: Status + Priority + Actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant[task.status] ?? "outline"} className="text-[10px]">
              {statusLabel[task.status] ?? task.status}
            </Badge>
            <Badge variant={priorityVariant[task.priority] ?? "outline"} className="text-[10px] capitalize">
              {task.priority}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRate(task)}>
                <Star className="size-4" />
                Rate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(task)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title + Project */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="text-lg font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors text-left leading-tight"
            onClick={() => onSelect(task)}
          >
            {task.title}
          </button>
          <span className="text-xs text-muted-foreground">{task.project}</span>
        </div>

        {/* Progress */}
        {totalSubtasks > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground">{progress}%</span>
          </div>
        )}

        {/* Rating Stars */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`size-3.5 ${
                i < task.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Members + Date */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((assignee) => (
              <Avatar key={assignee.id} className="size-6 border-2 border-card">
                <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                <AvatarFallback className="text-[8px]">{getInitials(assignee.name)}</AvatarFallback>
              </Avatar>
            ))}
            {task.assignees.length > 3 && (
              <div className="size-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            {task.dueDate}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-3 w-full mt-auto">
        <Button variant="secondary" size="lg" className="flex-1 py-2" onClick={() => onEdit(task)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button variant="outline" size="icon-lg" onClick={() => onRate(task)}>
          <Star className="size-3.5" />
        </Button>
        <Button variant="destructive" size="icon-lg" onClick={() => onDelete(task)}>
          <Trash2 className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
