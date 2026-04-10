import { useProjectsStore } from "../store/projectStore"

// Exposes updateProject action with loading/error state
export function useUpdateProject() {
  const updateProject = useProjectsStore((s) => s.updateProject)
  const submitting = useProjectsStore((s) => s.submitting)
  const submitError = useProjectsStore((s) => s.submitError)
  const clearSubmitError = useProjectsStore((s) => s.clearSubmitError)

  return { updateProject, submitting, submitError, clearSubmitError }
}
