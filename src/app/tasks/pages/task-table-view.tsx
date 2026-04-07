import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Star, Pencil, Trash2, Eye } from "lucide-react"
import type { Task } from "@/app/tasks/data"

type TaskTableViewProps = {
  tasks: Task[]
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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  )
}

export function TaskTableView({ tasks, onSelect, onEdit, onDelete, onRate }: TaskTableViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assignees</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Progress</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const completedSubtasks = task.subtasks.filter((s) => s.completed).length
          const totalSubtasks = task.subtasks.length
          return (
            <TableRow key={task.id} className="group">
              <TableCell className="py-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    className="font-medium text-foreground text-base hover:text-primary hover:underline underline-offset-2 transition-colors text-left"
                    onClick={() => onSelect(task)}
                  >
                    {task.title}
                  </button>
                  <span className="text-xs text-muted-foreground font-mono">{task.code}</span>
                </div>
              </TableCell>
              <TableCell className="py-3">
                <Badge variant={statusVariant[task.status] ?? "outline"}>
                  {statusLabel[task.status] ?? task.status}
                </Badge>
              </TableCell>
              <TableCell className="py-3">
                <Badge variant={priorityVariant[task.priority] ?? "outline"} className="capitalize">
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell className="py-3">
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <Avatar key={assignee.id} className="size-7 border-2 border-card">
                      <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                      <AvatarFallback className="text-[8px]">
                        {getInitials(assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="size-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-3">
                <Badge variant="secondary" className="text-xs">
                  {task.project}
                </Badge>
              </TableCell>
              <TableCell className="py-3">
                <StarRating rating={task.rating} />
              </TableCell>
              <TableCell className="text-muted-foreground py-3 text-sm font-mono">
                {task.dueDate}
              </TableCell>
              <TableCell className="text-right py-3">
                <span
                  className={`text-xs font-bold ${
                    completedSubtasks === totalSubtasks && totalSubtasks > 0
                      ? "text-green-500"
                      : completedSubtasks > 0
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </TableCell>
              <TableCell className="text-right py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSelect(task)}>
                      <Eye className="size-4" />
                      View Details
                    </DropdownMenuItem>
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
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
