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
import { Pencil, Calendar, Hash, CheckCircle2, Circle, Kanban } from "lucide-react"
import type { Project } from "@/app/projects/data"

type ProjectDetailSheetProps = {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (project: Project) => void
  onKanban?: (project: Project) => void
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

export function ProjectDetailSheet({
  project,
  open,
  onOpenChange,
  onEdit,
  onKanban,
}: ProjectDetailSheetProps) {
  if (!project) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-full md:max-w-[50vw] overflow-y-auto themed-scrollbar">
        <SheetHeader className="gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[project.status] ?? "outline"}>
              {statusLabel[project.status] ?? project.status}
            </Badge>
            <Badge variant="secondary" className="capitalize">{project.priority} Priority</Badge>
          </div>
          <SheetTitle className="text-2xl leading-tight">{project.name}</SheetTitle>
          <SheetDescription className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {project.createdAt}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="size-3" />
              {project.id.toUpperCase()}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="px-8 pb-10 space-y-8">
          {/* Stakeholders */}
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Stakeholders
            </h4>
            <div className="flex flex-wrap gap-3">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 bg-muted/50 py-2 pl-2 pr-4 rounded-full"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback className="text-[10px]">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-none">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Progress Overview */}
          <section className="bg-muted/50 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-end">
              <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Project Health
              </h4>
              <span className="text-2xl font-black text-primary tracking-tighter">
                {project.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
                  Budget Used
                </p>
                <p className="text-sm font-bold">{project.budget}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
                  Time Elapsed
                </p>
                <p className="text-sm font-bold">{project.timeElapsed}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
                  Milestones
                </p>
                <p className="text-sm font-bold">
                  {project.milestonesDone} / {project.milestonesTotal}
                </p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Project Overview
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
          </section>

          <Separator />

          {/* Task Summary */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Task Summary
              </h4>
              <Button variant="link" size="sm" className="text-primary text-xs">
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl group"
                >
                  <div className="flex items-center gap-3">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="size-5 text-primary" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {task.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Created
              </p>
              <p className="text-sm font-medium">{project.createdAt}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Deadline
              </p>
              <p className="text-sm font-medium">{project.deadline}</p>
            </div>
          </div>

          <Separator />

          {/* Edit Actions */}
          <div className="flex gap-3">
            {onEdit && (
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => onEdit(project)}
              >
                <Pencil />
                Edit Project
              </Button>
            )}
            {onKanban && (
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => onKanban(project)}
              >
                <Kanban />
                Kanban Board
              </Button>
            )}
          </div>
        </div>
        
      </SheetContent>
    </Sheet>
  )
}
