import { useNavigate } from "react-router"
import { WorkspaceForm, type WorkspaceFormValues } from "./components/workspace-form"
import { WorkspacePageShell } from "./components/workspace-page-shell"
import { useCreateWorkspace } from "./hooks/useCreateWorkspace"

/**
 * CreateWorkspacePage — form page for creating a new workspace.
 * Calls POST /workspaces and navigates to the new workspace on success.
 */
export default function CreateWorkspacePage() {
  const navigate = useNavigate()
  const { createWorkspace, submitting, submitError } = useCreateWorkspace()

  // Submit handler — calls the API and navigates on success
  async function handleSubmit(values: WorkspaceFormValues) {
    const workspace = await createWorkspace({
      name: values.name,
      description: values.description || null,
    })
    // Navigate to the new workspace detail page on success
    if (workspace) {
      navigate(`/workspaces/${workspace.id}`)
    }
  }

  return (
    <WorkspacePageShell
      title="Create Workspace"
      description="Set up a new workspace with a name and description."
    >
      <WorkspaceForm
        mode="create"
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/workspaces")}
      />
    </WorkspacePageShell>
  )
}
