// Types for sections and tasks within a project.
// These match the backend API response shapes (Section model + Task model).

export interface Section {
  id: number
  name: string
  description: string | null
  project_id: number
  created_at: string
  updated_at: string
}

// Payload for creating a new section
export interface CreateSectionPayload {
  name: string
  project_id: number
  description: string | null
}

// Payload for updating an existing section
export interface UpdateSectionPayload {
  name: string
  project_id: number
  description: string | null
}

export interface SectionTask {
  id: number
  name: string
  description: string | null
  weight: number
  due_date: string
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "in_progress" | "done" | "rated"
  section_id: number
  project_id: number | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// Shape returned by paginated backend endpoints
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    current_page: number
    total: number
    per_page: number
    last_page: number
    from: number | null
    to: number | null
  }
  message: string
}
