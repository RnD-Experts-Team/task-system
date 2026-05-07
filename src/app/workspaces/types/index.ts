// ─── Workspace types (matches backend API response) ──────────────

/**
 * Workspace member — returned from GET /workspaces/{id}/users
 * The `pivot.role` comes from the user_workspace pivot table.
 */
export interface WorkspaceMember {
  id: number
  name: string
  email: string
  avatar_url: string | null
  pivot: {
    role: "owner" | "viewer" | "editor"
    created_at: string
    updated_at: string
  }
}

/**
 * Workspace — returned from GET /workspaces and GET /workspaces/{id}
 * Fields match the database columns: id, name, description, timestamps.
 * Users are loaded separately via the members endpoint.
 */
export interface Workspace {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
  // Users may be eager-loaded on show endpoint
  users?: WorkspaceMember[]
}

/** Body for POST /workspaces — create a new workspace */
export interface CreateWorkspacePayload {
  name: string
  description?: string | null
}

/** Body for PUT/PATCH /workspaces/{id} — update an existing workspace */
export interface UpdateWorkspacePayload {
  name?: string
  description?: string | null
}

/** Body for POST /workspaces/{id}/users — add a new member to a workspace */
export interface AddWorkspaceMemberPayload {
  /** ID of the user to add (required by the API — email lookup is not supported) */
  user_id: number
  /** Role to assign — only viewer or editor are allowed via the API */
  role: "viewer" | "editor"
}

/** Body for PUT /workspaces/{id}/users/{userId}/role — update a member's role */
export interface UpdateMemberRolePayload {
  /** New role — only viewer or editor are assignable via the API */
  role: "viewer" | "editor"
}

// ─── Todo types (matches backend API) ────────────────────────────

// Status enum values match the database enum exactly
export type TodoStatus = "pending" | "inprogress" | "completed"

// Todo returned from the API — subtodos are eager-loaded on list and show
export interface WorkspaceTodo {
  id: number
  workspace_id: number
  title: string
  due_date: string | null
  status: TodoStatus
  parent_id: number | null
  created_at: string
  updated_at: string
  // Subtodos loaded on index (top-level only) and show endpoints
  subtodos?: WorkspaceTodo[]
}

// Body for POST /workspaces/{id}/todos — workspace_id is provided in the URL
export interface CreateTodoPayload {
  title: string
  due_date?: string | null
  parent_id?: number | null
  status?: TodoStatus | null
}

// Body for PUT /workspaces/{id}/todos/{todo} — title is required, rest optional
export interface UpdateTodoPayload {
  title: string
  due_date?: string | null
  parent_id?: number | null
  status?: TodoStatus | null
}

// ─── Display label maps ──────────────────────────────────────────

export const TODO_STATUS_LABELS: Record<TodoStatus, string> = {
  pending: "Pending",
  inprogress: "In Progress",
  completed: "Completed",
}
