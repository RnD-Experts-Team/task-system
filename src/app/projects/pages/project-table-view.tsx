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
import { MoreHorizontal, Pencil, Trash2, Kanban } from "lucide-react"
import type { Project } from "@/app/projects/data"

type ProjectTableViewProps = {
  projects: Project[]
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

export function ProjectTableView({
  projects,
  onEdit,
  onDelete,
  onSelect,
  onKanban,
}: ProjectTableViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id} className="group">
            <TableCell className="py-3">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="font-medium text-foreground text-base hover:text-primary hover:underline underline-offset-2 transition-colors text-left"
                  onClick={() => onSelect(project)}
                >
                  {project.name}
                </button>
                <span className="text-xs text-muted-foreground">{project.category}</span>
              </div>
            </TableCell>
            <TableCell className="py-3">
              <div className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarImage src={project.owner.avatarUrl} alt={project.owner.name} />
                  <AvatarFallback className="text-[10px]">{getInitials(project.owner.name)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{project.owner.name}</span>
              </div>
            </TableCell>
            <TableCell className="py-3">
              <Badge variant={statusVariant[project.status] ?? "outline"}>
                {statusLabel[project.status] ?? project.status}
              </Badge>
            </TableCell>
            <TableCell className="py-3">
              <Badge variant={priorityVariant[project.priority] ?? "outline"} className="capitalize">
                {project.priority}
              </Badge>
            </TableCell>
            <TableCell className="py-3 w-40">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                  {project.progress}%
                </span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground py-3 text-sm">{project.createdAt}</TableCell>
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
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onKanban(project)}>
                    <Kanban className="size-4" />
                    Kanban Board
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(project)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
