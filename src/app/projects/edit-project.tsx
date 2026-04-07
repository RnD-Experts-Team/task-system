import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { ProjectForm, type ProjectFormValues } from "@/app/projects/project-form"
import { projects, type Project } from "@/app/projects/data"

export default function EditProjectPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Mock API call - fetch project by ID from mock data
    async function fetchProject() {
      try {
        setIsLoading(true)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        const found = projects.find((p) => p.id === id)
        if (!found) {
          setError("Project not found")
          return
        }

        setProject(found)
      } catch (err) {
        setError("Failed to load project")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  async function handleSubmit(data: ProjectFormValues) {
    if (!project) return

    // Mock API call - in production, this would PATCH/PUT to your backend
    console.log("Updating project:", project.id, data)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update in mock data (in production, server would confirm update)
    const index = projects.findIndex((p) => p.id === project.id)
    if (index !== -1) {
      projects[index] = {
        ...projects[index],
        ...data,
      }
    }

    // Navigate back to projects list
    navigate("/projects")
  }

  function handleCancel() {
    navigate("/projects")
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate("/projects")}
            className="text-primary underline text-sm"
          >
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProjectForm
      mode="edit"
      project={project}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  )
}
