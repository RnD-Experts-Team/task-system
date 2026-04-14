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
// Use the API-aligned Task type (not the mock from data.ts)
import type { Task } from "@/app/tasks/types"

type TaskCardProps = {
  task: Task
  /** Navigate to the task detail page */
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

// Status labels and variants aligned with the API enum values
const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  rated: "Rated",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  in_progress: "default",
  done: "secondary",
  rated: "secondary",
}

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "outline",
  low: "secondary",
}

export function TaskCard({ task, onSelect, onEdit, onDelete, onRate }: TaskCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.015 })

  // Count completed subtasks using the API field is_complete
  const completedSubtasks = task.subtasks.filter((s) => s.is_complete).length
  const totalSubtasks = task.subtasks.length
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
  // Resolve project name from the nested section.project relationship
  const projectName = task.section?.project?.name ?? "—"

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
            {task.name}
          </button>
          <span className="text-xs text-muted-foreground">{projectName}</span>
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

        {/* Final rating score (0–100) from the latest rating, shown when available */}
        {task.latest_final_rating !== null ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Star className="size-3.5 fill-primary text-primary" />
            <span>{task.latest_final_rating.toFixed(1)}</span>
            <span className="text-muted-foreground font-normal">/ 100</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="size-3.5 text-muted-foreground/30" />
            Not rated
          </div>
        )}

        {/* Members + Date */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {task.assigned_users.slice(0, 3).map((user) => (
              <Avatar key={user.id} className="size-6 border-2 border-card">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                <AvatarFallback className="text-[8px]">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            ))}
            {task.assigned_users.length > 3 && (
              <div className="size-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                +{task.assigned_users.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            {task.due_date}
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
