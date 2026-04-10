import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import { AlertCircle, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProjectForm, type ProjectFormValues } from "./components/project-form"
import { ProjectPageShell } from "./components/project-page-shell"
import { useProject } from "./hooks/useProject"
import { useUpdateProject } from "./hooks/useUpdateProject"
import { projectKanbanPath } from "./utils/project-routes"
import type { CreateProjectPayload } from "./types"

export default function EditProjectPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()

  const projectId = useMemo(() => {
    const parsed = Number(params.id)
    return Number.isFinite(parsed) ? parsed : null
  }, [params.id])

  const { project, loading, error } = useProject(projectId)
  const { updateProject, submitting } = useUpdateProject()

  async function handleSubmit(values: ProjectFormValues) {
    if (!project) return

    const payload: CreateProjectPayload = {
      name: values.name,
      description: values.description,
      stakeholder_will_rate: values.stakeholder_will_rate,
    }

    const ok = await updateProject(project.id, payload)
    if (ok) {
      navigate(`/projects/${project.id}`)
    }
  }

  return (
    <ProjectPageShell
      title="Edit Project"
      description="Update project details while preserving stakeholder ownership and progress history."
      backTo={project ? `/projects/${project.id}` : "/projects"}
      /* Open Kanban action button shown in the header area */
      headerAction={
        project ? (
          <Button variant="outline" onClick={() => navigate(projectKanbanPath(project.id))}>
            <LayoutGrid className="size-4" />
            Open Kanban
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4" />
            <span className="font-medium">{error}</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/projects")}>Return to projects</Button>
        </div>
      ) : null}

      {!loading && !error && project ? (
        <ProjectForm
          mode="edit"
          project={project}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/projects/${project.id}`)}
        />
      ) : null}
    </ProjectPageShell>
  )
}
