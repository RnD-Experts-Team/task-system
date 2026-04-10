import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Pencil, Trash2 } from "lucide-react"
import type { Project } from "../types"
import {
  formatProgress,
  getInitials,
  statusClassName,
  statusLabel,
} from "../utils/project-format"

type ProjectCardProps = {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onSelect: (project: Project) => void
  onViewPage: (project: Project) => void
}

// Card component used in grid view
export function ProjectCard({ project, onEdit, onDelete, onSelect, onViewPage }: ProjectCardProps) {
  return (
    <Card className="flex flex-col border-border/70 bg-linear-to-br from-background via-background to-muted/20">
      <CardContent className="flex flex-col gap-3 pt-4 px-4 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className={statusClassName(project.status)}>
            {statusLabel(project.status)}
          </Badge>
          <Badge variant={project.stakeholder_will_rate ? "default" : "secondary"}>
            {project.stakeholder_will_rate ? "Stakeholder Rated" : "Not Rated"}
          </Badge>
        </div>

        {/* Name */}
        <button
          type="button"
          className="text-lg font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors text-left leading-tight"
          onClick={() => onSelect(project)}
        >
          {project.name}
        </button>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description || "No description"}
        </p>

        <div className="space-y-1.5 rounded-lg border bg-background/80 p-2.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{formatProgress(project.progress_percentage)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: formatProgress(project.progress_percentage) }}
            />
          </div>
        </div>

        {project.stakeholder && (
          <div className="flex items-center gap-2 rounded-lg border bg-background/80 p-2.5">
            <Avatar size="sm">
              <AvatarImage src={project.stakeholder.avatar_url ?? undefined} alt={project.stakeholder.name} />
              <AvatarFallback>{getInitials(project.stakeholder.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{project.stakeholder.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{project.stakeholder.email}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center gap-2 w-full mt-auto">
        <Button variant="outline" size="icon-lg" onClick={() => onViewPage(project)}>
          <Eye className="size-3.5" />
        </Button>
        <Button variant="secondary" size="lg" className="flex-1 py-2" onClick={() => onEdit(project)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button variant="destructive" size="icon-lg" onClick={() => onDelete(project)}>
          <Trash2 className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
