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
import { MoreHorizontal, Pencil, Trash2, Kanban, Calendar } from "lucide-react"
import { useTilt } from "@/hooks/use-tilt"
import type { Project } from "@/app/projects/data"

type ProjectCardProps = {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onSelect: (project: Project) => void
  onKanban: (project: Project) => void
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
  "in-review": "In Review",
  paused: "Paused",
  completed: "Completed",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  "in-review": "outline",
  paused: "secondary",
  completed: "default",
}

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  high: "destructive",
  medium: "outline",
  low: "secondary",
}

export function ProjectCard({ project, onEdit, onDelete, onSelect, onKanban }: ProjectCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.015 })

  return (
    <Card ref={ref} style={style} className="flex flex-col">
      <CardContent className="flex flex-col gap-4 pt-4 px-4 flex-1">
        {/* Header: Status + Priority + Actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant[project.status] ?? "outline"} className="text-[10px]">
              {statusLabel[project.status] ?? project.status}
            </Badge>
            <Badge variant={priorityVariant[project.priority] ?? "outline"} className="text-[10px] capitalize">
              {project.priority}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onKanban(project)}>
                <Kanban className="size-4" />
                Kanban Board
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(project)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title + Category */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="text-lg font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors text-left leading-tight"
            onClick={() => onSelect(project)}
          >
            {project.name}
          </button>
          <span className="text-xs text-muted-foreground">{project.category}</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground">{project.progress}%</span>
        </div>

        {/* Members + Date */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.members.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="size-6 border-2 border-card">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="text-[8px]">{getInitials(member.name)}</AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <div className="size-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            {project.createdAt}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-3 w-full mt-auto">
        <Button variant="secondary" size="lg" className="flex-1 py-2" onClick={() => onEdit(project)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button variant="outline" size="icon-lg" onClick={() => onKanban(project)}>
          <Kanban className="size-3.5" />
        </Button>
        <Button variant="destructive" size="icon-lg" onClick={() => onDelete(project)}>
          <Trash2 className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
