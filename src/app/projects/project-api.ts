import type { ProjectFormValues as ProjectFormData } from "@/app/projects/components/project-form"
import type { Project } from "./types"

/**
 * Fetch a single project by ID
 */
export async function fetchProject(id: string): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch project")
  }
  return response.json()
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectFormData): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Failed to create project")
  }
  return response.json()
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  data: ProjectFormData
): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Failed to update project")
  }
  return response.json()
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete project")
  }
}
