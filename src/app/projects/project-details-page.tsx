// Project Details Page
// Main entry point for exploring a single project. Shows project info,
// progress, stakeholder, and all sections with their tasks loaded dynamically.

import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { AlertCircle, LayoutGrid, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProject } from "./hooks/useProject"
import { ProjectPageShell } from "./components/project-page-shell"
import { projectKanbanPath } from "./utils/project-routes"
import {
  formatProgress,
  getInitials,
  statusClassName,
  statusLabel,
} from "./utils/project-format"
// Section integration — fetches and displays project sections with tasks
import { useSections } from "./sections/hooks/useSections"
import { SectionList } from "./sections/SectionList"
// Assignment panel — shows all users assigned to tasks in this project
import { ProjectAssignmentsPanel } from "./components/project-assignments-panel"
// Ratings panel — shows all stakeholder ratings submitted for this project
import { StakeholderRatingsPanel } from "./components/stakeholder-ratings-panel"
import { usePermissions } from "@/hooks/usePermissions"

export default function ProjectDetailsPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("edit projects")
  const canViewKanban = hasPermission("view projects")
  // const canRate = hasPermission("create stakeholder ratings")
  const canViewSections = hasPermission("view sections")

  const projectId = useMemo(() => {
    const parsed = Number(params.id)
    return Number.isFinite(parsed) ? parsed : null
  }, [params.id])

  // Fetch project details
  const { project, loading, error } = useProject(projectId)

  // Fetch sections for the project with CRUD support
  const {
    sections,
    loading: sectionsLoading,
    error: sectionsError,
    submitting: sectionsSubmitting,
    createSection,
    updateSection,
    deleteSection,
  } = useSections(projectId)

  return (
    <ProjectPageShell
      title="Project Details"
      description="A full project profile with stakeholder identity, current status, and completion progress."
    >
      {/* Loading skeleton for the project header */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      ) : null}

      {/* Error state */}
      {!loading && error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4" />
            <span className="font-medium">{error}</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/projects")}>Return to projects</Button>
        </div>
      ) : null}

      {/* Main content — project info + sections */}
      {!loading && !error && project ? (
        <div className="space-y-6">
          {/* ── Project header card ── */}
          <Card className="border-border/70 bg-linear-to-br from-background to-muted/20">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={statusClassName(project.status)}>
                    {statusLabel(project.status)}
                  </Badge>
                  <Badge variant={project.stakeholder_will_rate ? "default" : "secondary"}>
                    {project.stakeholder_will_rate ? "Stakeholder Rated" : "Not Rated"}
                  </Badge>
                </div>
                <CardTitle className="text-2xl leading-tight">{project.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Project ID: {project.id}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Navigate to the Kanban board for this project */}
                {canViewKanban && (
                  <Button variant="outline" asChild>
                    <Link to={projectKanbanPath(project.id)}>
                      <LayoutGrid className="size-4" />
                      Open Kanban
                    </Link>
                  </Button>
                )}
                
                {canEdit && (
                  <Button asChild>
                    <Link to={`/projects/${project.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit Project
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* ── Summary cards (progress, stakeholder, status) ── */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stakeholder</CardTitle>
              </CardHeader>
              <CardContent>
                {project.stakeholder ? (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={project.stakeholder.avatar_url ?? undefined} alt={project.stakeholder.name} />
                      <AvatarFallback>{getInitials(project.stakeholder.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{project.stakeholder.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{project.stakeholder.email}</p>
                      <p className="text-[11px] text-muted-foreground">User ID: {project.stakeholder.id}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No stakeholder assigned.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current status</span>
                  <Badge variant="outline" className={statusClassName(project.status)}>
                    {statusLabel(project.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stakeholder rating</span>
                  <span>{project.stakeholder_will_rate ? "Enabled" : "Disabled"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* ── Sections with tasks ── */}
          {canViewSections && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold tracking-tight">Sections</h2>
              <p className="text-sm text-muted-foreground">
                Each section groups related tasks within this project.
              </p>
              <SectionList
                sections={sections}
                loading={sectionsLoading}
                error={sectionsError}
                projectId={projectId!}
                submitting={sectionsSubmitting}
                onCreateSection={createSection}
                onUpdateSection={updateSection}
                onDeleteSection={deleteSection}
              />
            </div>
          )}

          <Separator />

          {/* ── Team Assignments ── */}
          {/* Lists every user who has tasks assigned in this project,
              grouped by user with the task name, status, priority, due date,
              and their percentage allocation per task. */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Team Assignments</h2>
            <p className="text-sm text-muted-foreground">
              All team members with task assignments in this project, including their allocation percentages.
            </p>
            <ProjectAssignmentsPanel projectId={projectId} variant="full" />
          </div>

          <Separator />

          {/* ── Stakeholder Ratings ── */}
          {/* Lists all ratings submitted by the stakeholder for this project,
              showing their final score and the individual field breakdown. */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">Stakeholder Ratings</h2>
            <p className="text-sm text-muted-foreground">
              Ratings submitted by the project stakeholder, including per-field scores and the overall result.
            </p>
            <StakeholderRatingsPanel projectId={projectId} variant="full" />
          </div>
        </div>
      ) : null}
    </ProjectPageShell>
  )
}
