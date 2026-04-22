import { ProjectCard } from "./project-card"
import type { Project } from "../types"

type ProjectGridViewProps = {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onSelect: (project: Project) => void
  onViewPage: (project: Project) => void
  canEdit?: boolean
  canDelete?: boolean
}

// Responsive grid wrapper for ProjectCard items
export function ProjectGridView({ projects, onEdit, onDelete, onSelect, onViewPage, canEdit = false, canDelete = false }: ProjectGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          onViewPage={onViewPage}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ))}
    </div>
  )
}
