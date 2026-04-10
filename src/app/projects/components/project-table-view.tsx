import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Pencil, Trash2, LayoutGrid } from "lucide-react"
import type { Project } from "../types"
import {
  formatProgress,
  getInitials,
  statusClassName,
  statusLabel,
} from "../utils/project-format"

type ProjectTableViewProps = {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onSelect: (project: Project) => void
  onViewPage: (project: Project) => void
}

// Table view for the project list
export function ProjectTableView({ projects, onEdit, onDelete, onSelect, onViewPage }: ProjectTableViewProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Stakeholder</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Stakeholder Rating</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="group">
              {/* Name */}
              <TableCell className="py-3">
                <button
                  type="button"
                  className="font-medium text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors text-left"
                  onClick={() => onSelect(project)}
                >
                  {project.name}
                </button>
              </TableCell>

              {/* Description (truncated) */}
              <TableCell className="py-3 max-w-xs">
                <span className="text-sm text-muted-foreground line-clamp-1">
                  {project.description || "—"}
                </span>
              </TableCell>

              {/* Stakeholder */}
              <TableCell className="py-3">
                {project.stakeholder ? (
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage
                        src={project.stakeholder.avatar_url ?? undefined}
                        alt={project.stakeholder.name}
                      />
                      <AvatarFallback>{getInitials(project.stakeholder.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-36">{project.stakeholder.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-44">
                        {project.stakeholder.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No stakeholder</span>
                )}
              </TableCell>

              {/* Status */}
              <TableCell className="py-3">
                <Badge variant="outline" className={statusClassName(project.status)}>
                  {statusLabel(project.status)}
                </Badge>
              </TableCell>

              {/* Progress */}
              <TableCell className="py-3 min-w-36">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Completion</span>
                    <span>{formatProgress(project.progress_percentage)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: formatProgress(project.progress_percentage) }}
                    />
                  </div>
                </div>
              </TableCell>

              {/* Stakeholder Will Rate */}
              <TableCell className="py-3">
                <Badge variant={project.stakeholder_will_rate ? "default" : "secondary"}>
                  {project.stakeholder_will_rate ? "Yes" : "No"}
                </Badge>
              </TableCell>

              {/* Actions */}
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
                    <DropdownMenuItem onClick={() => onViewPage(project)}>
                      <LayoutGrid className="size-4" />
                      Open Kanban
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(project)}>
                      <Pencil className="size-4" />
                      Edit
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
    </div>
  )
}
