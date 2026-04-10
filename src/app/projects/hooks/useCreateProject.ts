import { useProjectsStore } from "../store/projectStore"

// Exposes createProject action with loading/error state
export function useCreateProject() {
  const createProject = useProjectsStore((s) => s.createProject)
  const submitting = useProjectsStore((s) => s.submitting)
  const submitError = useProjectsStore((s) => s.submitError)
  const clearSubmitError = useProjectsStore((s) => s.clearSubmitError)

  return { createProject, submitting, submitError, clearSubmitError }
}
