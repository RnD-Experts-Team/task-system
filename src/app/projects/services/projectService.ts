import { apiClient } from "@/services/api"
import type {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  KanbanData,
  ProjectAssignmentsData,
  StakeholderRatingsResponse,
} from "../types"

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

  /** POST /tasks/:id/move-section — move a task to another section */
  async moveTaskSection(taskId: number, sectionId: number): Promise<void> {
    await apiClient.post(`/tasks/${taskId}/move-section`, { section_id: sectionId })
  }

  /** POST /tasks/:id/move-status — move a task to another status */
  async moveTaskStatus(taskId: number, status: "pending" | "in_progress" | "done" | "rated"): Promise<void> {
    await apiClient.post(`/tasks/${taskId}/move-status`, { status })
  }

  /**
   * GET /projects/:id/assignments
   * Returns the project, total user count, and each assigned user with their tasks + percentage.
   */
  async getAssignments(projectId: number): Promise<ProjectAssignmentsData> {
    const response = await apiClient.get<ProjectAssignmentsData>(`/projects/${projectId}/assignments`)
    return response.data
  }

  /**
   * GET /projects/:id/stakeholder-ratings
   * Returns a paginated list of stakeholder rating entries for the project.
   * The response body has `data[]` and `pagination` at the top level (non-standard).
   */
  async getStakeholderRatings(projectId: number): Promise<StakeholderRatingsResponse> {
    // The paginated response has a non-standard shape: { success, data[], pagination, message }.
    // We cast through unknown to bypass the ApiResponse<T> wrapper mismatch.
    const response = await apiClient.get<unknown>(`/projects/${projectId}/stakeholder-ratings`)
    return response as StakeholderRatingsResponse
  }
}

export const projectService = new ProjectService()
