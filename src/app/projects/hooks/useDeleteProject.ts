import { useProjectsStore } from "../store/projectStore"

// Exposes deleteProject action with loading/error state
export function useDeleteProject() {
  const deleteProject = useProjectsStore((s) => s.deleteProject)
  const submitting = useProjectsStore((s) => s.submitting)
  const submitError = useProjectsStore((s) => s.submitError)
  const clearSubmitError = useProjectsStore((s) => s.clearSubmitError)

  return { deleteProject, submitting, submitError, clearSubmitError }
}
