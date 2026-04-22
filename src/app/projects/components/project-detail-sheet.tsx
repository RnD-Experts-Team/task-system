import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpRight, Eye, Pencil, Hash } from "lucide-react"
import type { Project } from "../types"
import {
  formatProgress,
  getInitials,
  statusClassName,
  statusLabel,
} from "../utils/project-format"
import { usePermissions } from "@/hooks/usePermissions"

type ProjectDetailSheetProps = {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (project: Project) => void
  onViewPage?: (project: Project) => void
  onViewDetails?: (project: Project) => void
}

// Right-side sheet showing project details
export function ProjectDetailSheet({
  project,
  open,
  onOpenChange,
  onEdit,
  onViewPage,
  onViewDetails,
}: ProjectDetailSheetProps) {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("edit projects")

  if (!project) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:sm:max-w-full overflow-y-auto themed-scrollbar">
        <SheetHeader className="gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={statusClassName(project.status)}>
              {statusLabel(project.status)}
            </Badge>
            <Badge variant={project.stakeholder_will_rate ? "default" : "secondary"}>
              {project.stakeholder_will_rate ? "Stakeholder Rated" : "Not Rated"}
            </Badge>
          </div>
          <SheetTitle className="text-2xl leading-tight">{project.name}</SheetTitle>
          <SheetDescription className="flex items-center gap-1 text-xs">
            <Hash className="size-3" />
            ID: {project.id}
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-10 space-y-6">
          <Separator />

          {/* Description */}
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Description
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description || "No description provided."}
            </p>
          </section>

          <Separator />

          {/* Stakeholder Rating */}
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Project Progress
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Completion</span>
                <span className="font-medium text-foreground">{formatProgress(project.progress_percentage)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: formatProgress(project.progress_percentage) }}
                />
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Stakeholder
            </h4>
            {project.stakeholder ? (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar>
                  <AvatarImage
                    src={project.stakeholder.avatar_url ?? undefined}
                    alt={project.stakeholder.name}
                  />
                  <AvatarFallback>{getInitials(project.stakeholder.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{project.stakeholder.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{project.stakeholder.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No stakeholder is assigned.</p>
            )}
          </section>

          <Separator />

          {/* Actions */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {/* Navigate to the full project details page */}
            {onViewDetails && (
              <Button variant="default" size="lg" className="w-full" onClick={() => { onOpenChange(false); onViewDetails(project) }}>
                <Eye />
                View Details
              </Button>
            )}

            {onViewPage && (
              <Button variant="outline" size="lg" className="w-full" onClick={() => { onOpenChange(false); onViewPage(project) }}>
                <ArrowUpRight />
                Open Kanban Page
              </Button>
            )}

            {onEdit && canEdit && (
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => onEdit(project)}
              >
                <Pencil />
                Edit Project
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
