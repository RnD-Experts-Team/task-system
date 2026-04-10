import { apiClient } from "@/services/api"
import type { Project, CreateProjectPayload, UpdateProjectPayload, KanbanData } from "../types"

// API service for project CRUD operations and kanban

class ProjectService {
  /** GET /projects — fetch all projects */
  async getAll(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>("/projects")
    return response.data
  }

  /** GET /projects/:id — fetch a single project */
  async getById(id: number): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${id}`)
    return response.data
  }

  /** POST /projects — create a new project */
  async create(payload: CreateProjectPayload): Promise<Project> {
    const response = await apiClient.post<Project>("/projects", payload)
    return response.data
  }

  /** PUT /projects/:id — update an existing project */
  async update(id: number, payload: UpdateProjectPayload): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${id}`, payload)
    return response.data
  }

  /** DELETE /projects/:id — delete a project */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/projects/${id}`)
  }

  /** GET /projects/:id/kanban — fetch kanban board data for a project */
  async getKanban(projectId: number): Promise<KanbanData> {
    const response = await apiClient.get<KanbanData>(`/projects/${projectId}/kanban`)
    return response.data
  }
}

export const projectService = new ProjectService()
