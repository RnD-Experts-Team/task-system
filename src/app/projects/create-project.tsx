import { useNavigate } from "react-router"
import { ProjectForm, type ProjectFormValues } from "@/app/projects/project-form"
import { projects } from "@/app/projects/data"

export default function CreateProjectPage() {
  const navigate = useNavigate()

  async function handleSubmit(data: ProjectFormValues) {
    // Mock API call - in production, this would POST to your backend
    console.log("Creating project:", data)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Add to mock data (in production, server would return the created project)
    const newProject = {
      id: `proj-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
      owner: {
        id: "user-1",
        name: "You",
        role: "Project Lead",
        avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=You",
      },
      members: [],
      tasks: [],
      budget: "$0",
      timeElapsed: "0h",
      milestonesDone: 0,
      milestonesTotal: 0,
      kanbanColumns: [],
    }

    projects.push(newProject)

    // Navigate back to projects list
    navigate("/projects")
  }

  function handleCancel() {
    navigate("/projects")
  }

  return <ProjectForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
}
