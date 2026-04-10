import { useNavigate } from "react-router"
import { ProjectForm, type ProjectFormValues } from "./components/project-form"
import { ProjectPageShell } from "./components/project-page-shell"
import { useCreateProject } from "./hooks/useCreateProject"
import type { CreateProjectPayload } from "./types"

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const { createProject, submitting } = useCreateProject()

  async function handleSubmit(values: ProjectFormValues) {
    const payload: CreateProjectPayload = {
      name: values.name,
      description: values.description,
      stakeholder_will_rate: values.stakeholder_will_rate,
    }

    const created = await createProject(payload)
    if (created) {
      navigate(`/projects/${created.id}`)
    }
  }

  return (
    <ProjectPageShell
      title="Create Project"
      description="Set up a new project with stakeholder rating preferences and a clear description."
    >
      <ProjectForm
        mode="create"
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/projects")}
      />
    </ProjectPageShell>
  )
}
