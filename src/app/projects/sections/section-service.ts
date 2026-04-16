// Service layer for section CRUD operations and section tasks.
// Uses the shared apiClient to stay consistent with the rest of the app.

import { apiClient } from "@/services/api"
import type { Section, SectionTask, CreateSectionPayload, UpdateSectionPayload } from "./types"

class SectionService {
  // Fetch all sections belonging to a specific project
  async getByProject(projectId: number): Promise<Section[]> {
    const response = await apiClient.get<Section[]>(
      `/projects/${projectId}/sections`
    )
    return response.data
  }

  // Fetch a single section by its ID
  async getById(sectionId: number): Promise<Section> {
    const response = await apiClient.get<Section>(`/sections/${sectionId}`)
    return response.data
  }

  // Create a new section
  async create(payload: CreateSectionPayload): Promise<Section> {
    const response = await apiClient.post<Section>("/sections", payload)
    return response.data
  }

  // Update an existing section
  async update(sectionId: number, payload: UpdateSectionPayload): Promise<Section> {
    const response = await apiClient.put<Section>(`/sections/${sectionId}`, payload)
    return response.data
  }

  // Delete a section by its ID
  async delete(sectionId: number): Promise<void> {
    await apiClient.delete(`/sections/${sectionId}`)
  }

  // Fetch all tasks belonging to a specific section (basic, no assignment data)
  async getTasksBySection(sectionId: number): Promise<SectionTask[]> {
    const response = await apiClient.get<SectionTask[]>(
      `/sections/${sectionId}/tasks`
    )
    return response.data
  }

  // Fetch all tasks for a section WITH user assignment data (pivot percentage).
  // Uses GET /sections/{sectionId}/tasks-with-assignments — the richer endpoint
  // that eager-loads assignedUsers so each task includes an assigned_users array.
  async getTasksWithAssignments(sectionId: number): Promise<SectionTask[]> {
    const response = await apiClient.get<SectionTask[]>(
      `/sections/${sectionId}/tasks-with-assignments`
    )
    return response.data
  }
}

export const sectionService = new SectionService()
