import { apiClient } from "@/services/api"
import type {
  Task,
  TaskListParams,
  TaskListApiResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  UpdateStatusPayload,
  AddUserPayload,
  AssignUsersPayload,
  UpdateAssignmentPayload,
  TaskComment,
  CommentPayload,
  TaskSubtaskListApiResponse,
  TaskHelpRequestListApiResponse,
  TaskRatingListApiResponse,
} from "../types"

// Converts TaskListParams to a plain object safe to pass as Axios params.
// Omits undefined values and handles array params (assignees[]).
function buildParams(params: TaskListParams): Record<string, unknown> {
  const p: Record<string, unknown> = {}
  if (params.page !== undefined) p.page = params.page
  if (params.per_page !== undefined) p.per_page = params.per_page
  // Only add status filter when not "all"
  if (params.status && params.status !== "all") p.status = params.status
  // Only add priority filter when not "all"
  if (params.priority && params.priority !== "all") p.priority = params.priority
  if (params.project_id !== undefined) p.project_id = params.project_id
  // Assignees are sent as assignees[] array
  if (params.assignees?.length) p["assignees[]"] = params.assignees
  if (params.due_from) p.due_from = params.due_from
  if (params.due_to) p.due_to = params.due_to
  if (params.search?.trim()) p.search = params.search.trim()
  return p
}

class TaskService {
  /**
   * GET /tasks
   * Returns the current page of tasks with pagination metadata.
   * Supports all filter/pagination params from TaskListParams.
   */
  async getAll(params: TaskListParams = {}): Promise<TaskListApiResponse> {
    // Cast through unknown because the tasks list endpoint uses a custom shape
    // ({ data: Task[], pagination: {...} }) rather than the standard PaginatedData wrapper.
    const raw = (await apiClient.get<unknown>("/tasks", {
      params: buildParams(params),
    })) as unknown as TaskListApiResponse

    return raw
  }

  /**
   * GET /tasks/{id}
   * Returns complete details for a single task.
   */
  async getById(id: number): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`)
    return response.data
  }

  /**
   * POST /tasks
   * Creates a new task. Returns the created task on success (201).
   * Toast success is shown automatically by the API client interceptor.
   */
  async create(payload: CreateTaskPayload): Promise<Task> {
    // Cast config to any to allow the custom `toast` extension used by the interceptor
    const response = await apiClient.post<Task>("/tasks", payload, {
      toast: { success: "Task created successfully" },
    } as never)
    return response.data
  }

  /**
   * PUT /tasks/{id}
   * Updates an existing task. Only provided fields are changed.
   */
  async update(id: number, payload: UpdateTaskPayload): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${id}`, payload, {
      toast: { success: "Task updated successfully" },
    } as never)
    return response.data
  }

  /**
   * DELETE /tasks/{id}
   * Removes a task and all its subtasks/ratings permanently.
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`, {
      toast: { success: "Task deleted successfully" },
    } as never)
  }

  // ─── Assignment Endpoints ────────────────────────────────────────

  /**
   * GET /tasks/{id}/with-assignments
   * Returns the task with all user assignments (includes pivot percentage).
   */
  async getByIdWithAssignments(id: number): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}/with-assignments`)
    return response.data
  }

  /**
   * POST /tasks/{id}/status
   * Updates only the status of an existing task.
   */
  async updateStatus(id: number, payload: UpdateStatusPayload): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${id}/status`, payload, {
      toast: { success: "Status updated" },
    } as never)
    return response.data
  }

  /**
   * POST /tasks/{id}/add-user
   * Adds a single user assignment to a task with a given percentage.
   * Returns the updated task with all current assignments.
   */
  async addUser(id: number, payload: AddUserPayload): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${id}/add-user`, payload, {
      toast: { success: "User assigned successfully" },
    } as never)
    return response.data
  }

  /**
   * POST /tasks/{id}/assign-users
   * Replaces all current assignments with the provided list.
   * Total percentage across all entries must not exceed 100.
   * Returns the updated task with the new assignment list.
   */
  async assignUsers(id: number, payload: AssignUsersPayload): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${id}/assign-users`, payload, {
      toast: { success: "Assignments updated successfully" },
    } as never)
    return response.data
  }

  /**
   * DELETE /tasks/{id}/users/{userId}
   * Removes a single user from the task's assignment list.
   * Returns the updated task without the removed user.
   */
  async removeUser(id: number, userId: number): Promise<Task> {
    const response = await apiClient.delete<Task>(`/tasks/${id}/users/${userId}`, {
      toast: { success: "User removed from task" },
    } as never)
    return response.data
  }

  /**
   * PUT /tasks/{id}/users/{userId}/assignment
   * Updates the allocation percentage for an already-assigned user.
   * Returns the updated task with the new pivot percentage reflected.
   */
  async updateUserAssignment(
    id: number,
    userId: number,
    payload: UpdateAssignmentPayload
  ): Promise<Task> {
    const response = await apiClient.put<Task>(
      `/tasks/${id}/users/${userId}/assignment`,
      payload,
      { toast: { success: "Assignment updated successfully" } } as never
    )
    return response.data
  }

  // ─── Comment Endpoints ────────────────────────────────────────

  /**
   * POST /tasks/{taskId}/comments
   * Creates a new comment on the given task.
   * Returns the created comment with the author's user info.
   */
  async createComment(taskId: number, payload: CommentPayload): Promise<TaskComment> {
    const response = await apiClient.post<TaskComment>(
      `/tasks/${taskId}/comments`,
      payload,
      { toast: { success: "Comment added" } } as never
    )
    return response.data
  }

  /**
   * PUT /comments/{commentId}
   * Updates the content of an existing comment.
   * Only the comment owner or a user with 'create tasks' permission can do this.
   * Returns the updated comment.
   */
  async updateComment(commentId: number, payload: CommentPayload): Promise<TaskComment> {
    const response = await apiClient.put<TaskComment>(
      `/comments/${commentId}`,
      payload,
      { toast: { success: "Comment updated" } } as never
    )
    return response.data
  }

  /**
   * DELETE /comments/{commentId}
   * Permanently removes a comment.
   * Only the comment owner or a user with 'create tasks' permission can do this.
   */
  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`, {
      toast: { success: "Comment deleted" },
    } as never)
  }

  // ─── Task Sub-Resource Endpoints ─────────────────────────────────

  /**
   * GET /tasks/{taskId}/subtasks
   * Returns a paginated list of subtasks for the specified task.
   * Uses the dedicated endpoint (not the embedded task.subtasks array).
   */
  async getSubtasksByTask(
    taskId: number,
    page = 1,
  ): Promise<TaskSubtaskListApiResponse> {
    const raw = (await apiClient.get<unknown>(`/tasks/${taskId}/subtasks`, {
      params: { page },
    })) as unknown as TaskSubtaskListApiResponse
    return raw
  }

  /**
   * GET /tasks/{taskId}/help-requests
   * Returns a paginated list of help requests linked to the specified task.
   * Includes requester and helper user relationships.
   */
  async getHelpRequestsByTask(
    taskId: number,
    page = 1,
  ): Promise<TaskHelpRequestListApiResponse> {
    const raw = (await apiClient.get<unknown>(`/tasks/${taskId}/help-requests`, {
      params: { page },
    })) as unknown as TaskHelpRequestListApiResponse
    return raw
  }

  /**
   * GET /tasks/{taskId}/ratings
   * Returns a paginated list of rating records submitted for the specified task.
   * Includes the rater's user info and computed final_rating per record.
   */
  async getRatingsByTask(
    taskId: number,
    page = 1,
  ): Promise<TaskRatingListApiResponse> {
    const raw = (await apiClient.get<unknown>(`/tasks/${taskId}/ratings`, {
      params: { page },
    })) as unknown as TaskRatingListApiResponse
    return raw
  }
}

export const taskService = new TaskService()
