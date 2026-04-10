export type ProjectStatus = "pending" | "in_progress" | "done" | "rated" | string

export interface ProjectStakeholder {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  avatar_path: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Project type matching the API response
export interface Project {
  id: number
  name: string
  description: string | null
  stakeholder_will_rate: boolean
  status: ProjectStatus
  progress_percentage: string | number
  stakeholder: ProjectStakeholder | null
}

// Payload for creating a project
export interface CreateProjectPayload {
  name: string
  description: string | null
  stakeholder_will_rate: boolean
}

// Payload for updating a project (all fields optional)
export interface UpdateProjectPayload {
  name?: string
  description?: string | null
  stakeholder_will_rate?: boolean
}

// ─── Kanban API types ─────────────────────────────────────────────

/** A user assigned to a kanban task */
export interface KanbanAssignedUser {
  id: number
  name: string
  email: string
  avatar_path: string | null
  avatar_url?: string | null
  created_at: string
  updated_at: string
  pivot?: {
    task_id: number
    user_id: number
    percentage: number
  }
}

/** A subtask belonging to a kanban task */
export interface KanbanSubtask {
  id: number
  name: string
  description: string | null
  due_date: string
  priority: "low" | "medium" | "high" | "critical"
  is_complete: boolean
  task_id: number
  created_at: string
  updated_at: string
}

/** A task inside a kanban column */
export interface KanbanTask {
  id: number
  name: string
  description: string | null
  weight: number
  due_date: string
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "in_progress" | "done" | "rated"
  section_id: number
  completed_at: string | null
  created_at: string
  updated_at: string
  assigned_users: KanbanAssignedUser[]
  subtasks: KanbanSubtask[]
}

/** A project section containing tasks grouped by status */
export interface KanbanSectionData {
  section: {
    id: number
    name: string
    description: string | null
    project_id: number
    created_at: string
    updated_at: string
  }
  tasks_by_status: {
    pending: KanbanTask[]
    in_progress: KanbanTask[]
    done: KanbanTask[]
    rated: KanbanTask[]
  }
}

/** Project-level info returned by the kanban endpoint */
export interface KanbanProject {
  id: number
  name: string
  description: string | null
  stakeholder_will_rate: boolean
  stakeholder_id: number
  status: ProjectStatus
  progress_percentage: number
  created_at: string
  updated_at: string
}

/** Full response shape from GET /projects/:id/kanban */
export interface KanbanData {
  project: KanbanProject
  sections: KanbanSectionData[]
}
