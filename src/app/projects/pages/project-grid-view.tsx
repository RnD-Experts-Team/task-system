import type { Project } from "@/app/projects/data"
import { ProjectCard } from "@/app/projects/pages/project-card"

type ProjectGridViewProps = {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onSelect: (project: Project) => void
  onKanban: (project: Project) => void
}

export function ProjectGridView({ projects, onEdit, onDelete, onSelect, onKanban }: ProjectGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          onKanban={onKanban}
        />
      ))}
    </div>
  )
}
