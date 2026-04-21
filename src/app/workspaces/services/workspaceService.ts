import { apiClient } from "@/services/api"
import type {
  Workspace,
  WorkspaceMember,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  AddWorkspaceMemberPayload,
  UpdateMemberRolePayload,
  WorkspaceTodo,
  CreateTodoPayload,
  UpdateTodoPayload,
} from "../types"

/**
 * Workspace API service — wraps all /workspaces endpoints.
 * Each method maps 1:1 to a backend route.
 */
class WorkspaceService {
  // ─── List ────────────────────────────────────────────────────────
  // GET /workspaces — returns workspaces the authenticated user belongs to
  async getAll(): Promise<Workspace[]> {
    const response = await apiClient.get<Workspace[]>("/workspaces")
    return response.data
  }

  // ─── Show ────────────────────────────────────────────────────────
  // GET /workspaces/{id} — returns a single workspace by ID
  async getById(id: number): Promise<Workspace> {
    const response = await apiClient.get<Workspace>(`/workspaces/${id}`)
    return response.data
  }

  // ─── Create ──────────────────────────────────────────────────────
  // POST /workspaces — creates a new workspace, auto-assigns current user as owner
  async create(payload: CreateWorkspacePayload): Promise<Workspace> {
    const response = await apiClient.post<Workspace>("/workspaces", payload, {
      toast: { success: "Workspace created successfully" },
    } as never)
    return response.data
  }

  // ─── Full Update ─────────────────────────────────────────────────
  // PUT /workspaces/{id} — replaces workspace name/description
  async update(id: number, payload: UpdateWorkspacePayload): Promise<Workspace> {
    const response = await apiClient.put<Workspace>(`/workspaces/${id}`, payload, {
      toast: { success: "Workspace updated successfully" },
    } as never)
    return response.data
  }

  // ─── Partial Update ──────────────────────────────────────────────
  // PATCH /workspaces/{id} — partially updates workspace fields
  async patch(id: number, payload: Partial<UpdateWorkspacePayload>): Promise<Workspace> {
    const response = await apiClient.put<Workspace>(`/workspaces/${id}`, payload, {
      toast: { success: "Workspace updated successfully" },
    } as never)
    return response.data
  }

  // ─── Delete ──────────────────────────────────────────────────────
  // DELETE /workspaces/{id} — permanently removes the workspace
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/workspaces/${id}`, {
      toast: { success: "Workspace deleted successfully" },
    } as never)
  }

  // ─── Members ─────────────────────────────────────────────────────
  // GET /workspaces/{id}/users — returns all members with their pivot roles
  async getMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    const response = await apiClient.get<WorkspaceMember[]>(
      `/workspaces/${workspaceId}/users`
    )
    return response.data
  }

  // ─── Add Member ───────────────────────────────────────────────────
  // POST /workspaces/{id}/users — adds a user by email with a given role
  // Requires owner or editor role; role can only be viewer or editor
  async addMember(workspaceId: number, payload: AddWorkspaceMemberPayload): Promise<WorkspaceMember> {
    const response = await apiClient.post<WorkspaceMember>(
      `/workspaces/${workspaceId}/users`,
      payload,
      { toast: { success: "Member added successfully" } } as never
    )
    return response.data
  }

  // ─── Remove Member ────────────────────────────────────────────────
  // DELETE /workspaces/{id}/users/{userId} — removes a member from the workspace
  async removeMember(workspaceId: number, userId: number): Promise<void> {
    await apiClient.delete(
      `/workspaces/${workspaceId}/users/${userId}`,
      { toast: { success: "Member removed successfully" } } as never
    )
  }

  // ─── Update Member Role ───────────────────────────────────────────
  // PUT /workspaces/{id}/users/{userId}/role — changes a member's role (viewer or editor)
  async updateMemberRole(
    workspaceId: number,
    userId: number,
    payload: UpdateMemberRolePayload
  ): Promise<WorkspaceMember> {
    const response = await apiClient.put<WorkspaceMember>(
      `/workspaces/${workspaceId}/users/${userId}/role`,
      payload,
      { toast: { success: "Member role updated successfully" } } as never
    )
    return response.data
  }

  // ─── Todos — List ─────────────────────────────────────────────────
  // GET /workspaces/{id}/todos — returns top-level todos with subtodos
  async getTodos(workspaceId: number): Promise<WorkspaceTodo[]> {
    const response = await apiClient.get<WorkspaceTodo[]>(
      `/workspaces/${workspaceId}/todos`
    )
    return response.data
  }

  // ─── Todos — Show ─────────────────────────────────────────────────
  // GET /todos/{id} — returns a single todo with its subtodos
  async getTodoById(todoId: number): Promise<WorkspaceTodo> {
    const response = await apiClient.get<WorkspaceTodo>(`/todos/${todoId}`)
    return response.data
  }

  // ─── Todos — Create ───────────────────────────────────────────────
  // POST /todos — creates a new todo (workspace_id goes in the body)
  async createTodo(payload: CreateTodoPayload): Promise<WorkspaceTodo> {
    const response = await apiClient.post<WorkspaceTodo>("/todos", payload, {
      toast: { success: "Todo created successfully" },
    } as never)
    return response.data
  }

  // ─── Todos — Update ───────────────────────────────────────────────
  // PUT /todos/{id} — updates an existing todo
  async updateTodo(todoId: number, payload: UpdateTodoPayload): Promise<WorkspaceTodo> {
    const response = await apiClient.put<WorkspaceTodo>(
      `/todos/${todoId}`,
      payload,
      { toast: { success: "Todo updated successfully" } } as never
    )
    return response.data
  }

  // ─── Todos — Delete ───────────────────────────────────────────────
  // DELETE /todos/{id} — permanently removes a todo
  async deleteTodo(todoId: number): Promise<void> {
    await apiClient.delete(`/todos/${todoId}`, {
      toast: { success: "Todo deleted successfully" },
    } as never)
  }
}

// Singleton instance used across the app
export const workspaceService = new WorkspaceService()
