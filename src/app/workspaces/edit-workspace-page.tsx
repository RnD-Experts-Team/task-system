import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceForm, type WorkspaceFormValues } from "./components/workspace-form"
import { WorkspacePageShell } from "./components/workspace-page-shell"
import { useWorkspace } from "./hooks/useWorkspace"
import { useUpdateWorkspace } from "./hooks/useUpdateWorkspace"
import { EditWorkspaceSkeleton } from "./components/skeletons"

/**
 * EditWorkspacePage — form page for editing an existing workspace.
 * Fetches workspace from GET /workspaces/{id}, then submits via PUT /workspaces/{id}.
 */
export default function EditWorkspacePage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()

  // Parse workspace ID from URL
  const workspaceId = useMemo(() => {
    const parsed = Number(params.id)
    return Number.isFinite(parsed) ? parsed : null
  }, [params.id])

  // Fetch workspace data from the API
  const { workspace, loading, error } = useWorkspace(workspaceId)

  // Update mutation hook
  const { updateWorkspace, submitting, submitError } = useUpdateWorkspace()

  // Submit handler — calls PUT /workspaces/{id} with the form data
  async function handleSubmit(values: WorkspaceFormValues) {
    if (workspaceId === null) return
    const updated = await updateWorkspace(workspaceId, {
      name: values.name,
      description: values.description || null,
    })
    // Navigate to workspace detail page on success
    if (updated) {
      navigate(`/workspaces/${workspaceId}`)
    }
  }

  // Loading state while fetching workspace data
  if (loading) {
    return <EditWorkspaceSkeleton workspaceId={workspaceId} />
  }

  // Error state — workspace not found or API error
  if (error || !workspace) {
    return (
      <WorkspacePageShell
        title="Edit Workspace"
        description="Update workspace details."
      >
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4" />
            <span className="font-medium">{error || "Workspace not found"}</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/workspaces")}>
            Return to workspaces
          </Button>
        </div>
      </WorkspacePageShell>
    )
  }

  return (
    <WorkspacePageShell
      title="Edit Workspace"
      description="Update workspace details while preserving member assignments."
      backTo={`/workspaces/${workspace.id}`}
      backLabel="Back to workspace"
    >
      <WorkspaceForm
        mode="edit"
        workspace={workspace}
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/workspaces/${workspace.id}`)}
      />
    </WorkspacePageShell>
  )
}
