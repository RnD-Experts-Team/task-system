// Centralized project route builders to keep navigation paths consistent.
export function projectKanbanPath(projectId: number | string) {
  return `/projects/${projectId}/kanban`
}
