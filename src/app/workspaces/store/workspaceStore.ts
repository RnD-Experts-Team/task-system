import { create } from "zustand"
import { isCancel, AxiosError } from "axios"
import { workspaceService } from "../services/workspaceService"
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
import type { ApiValidationError } from "@/types"

// ─── Helper ───────────────────────────────────────────────────────
// Pulls a user-friendly error message out of an Axios error response
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    // Show validation errors first (field-level messages)
    if (data?.errors) return Object.values(data.errors).flat().join(". ")
    // Fall back to the server's top-level message
    if (data?.message) return data.message
  }
  return fallback
}

// ─── State ────────────────────────────────────────────────────────

interface WorkspaceState {
  // List slice — used by the workspaces list page
  workspaces: Workspace[]
  loading: boolean
  error: string | null

  // Detail slice — used by workspace detail page
  selectedWorkspace: Workspace | null
  selectedLoading: boolean
  selectedError: string | null

  // Members slice — used by workspace detail members tab
  members: WorkspaceMember[]
  membersLoading: boolean
  membersError: string | null

  // Member mutation slice — for add / remove / update-role operations
  memberSubmitting: boolean
  memberSubmitError: string | null

  // Mutation slice — shared by create, update, delete actions
  submitting: boolean
  submitError: string | null

  // Todos list slice — used by workspace detail todos tab
  todos: WorkspaceTodo[]
  todosLoading: boolean
  todosError: string | null

  // Todo detail slice — used by todo detail page
  selectedTodo: WorkspaceTodo | null
  selectedTodoLoading: boolean
  selectedTodoError: string | null

  // Todo mutation slice — for create, update, delete operations
  todoSubmitting: boolean
  todoSubmitError: string | null
}

// ─── Actions ──────────────────────────────────────────────────────

interface WorkspaceActions {
  // Fetch all workspaces for the current user
  fetchWorkspaces: () => Promise<void>
  // Fetch a single workspace by ID
  fetchWorkspace: (id: number) => Promise<void>
  // Fetch workspace members
  fetchMembers: (workspaceId: number) => Promise<void>
  // Add a member to a workspace by email + role
  addMember: (workspaceId: number, payload: AddWorkspaceMemberPayload) => Promise<boolean>
  // Remove a member from a workspace
  removeMember: (workspaceId: number, userId: number) => Promise<boolean>
  // Update a member's role (viewer or editor)
  updateMemberRole: (workspaceId: number, userId: number, payload: UpdateMemberRolePayload) => Promise<boolean>
  // Clear member mutation error
  clearMemberSubmitError: () => void
  // Create a new workspace
  createWorkspace: (payload: CreateWorkspacePayload) => Promise<Workspace | null>
  // Full update (PUT) a workspace
  updateWorkspace: (id: number, payload: UpdateWorkspacePayload) => Promise<Workspace | null>
  // Partial update (PATCH) a workspace
  patchWorkspace: (id: number, payload: Partial<UpdateWorkspacePayload>) => Promise<Workspace | null>
  // Delete a workspace
  deleteWorkspace: (id: number) => Promise<boolean>
  // Clear error states
  clearError: () => void
  clearSelectedError: () => void
  clearSelectedWorkspace: () => void
  clearSubmitError: () => void

  // ─── Todo Actions ─────────────────────────────────────────────
  // Fetch all todos for a workspace (top-level with subtodos)
  fetchTodos: (workspaceId: number) => Promise<void>
  // Fetch a single todo by ID (with subtodos)
  fetchTodo: (workspaceId: number, todoId: number) => Promise<void>
  // Create a new todo — returns the created todo or null on failure
  createTodo: (workspaceId: number, payload: CreateTodoPayload) => Promise<WorkspaceTodo | null>
  // Update a todo — returns the updated todo or null on failure
  updateTodo: (workspaceId: number, todoId: number, payload: UpdateTodoPayload) => Promise<WorkspaceTodo | null>
  // Delete a todo — returns true on success, false on failure
  deleteTodo: (workspaceId: number, todoId: number) => Promise<boolean>
  // Clear todo-related errors
  clearTodosError: () => void
  clearSelectedTodo: () => void
  clearTodoSubmitError: () => void
}

type WorkspaceStore = WorkspaceState & WorkspaceActions

// ─── Store ────────────────────────────────────────────────────────

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
  // Initial state
  workspaces: [],
  loading: false,
  error: null,

  selectedWorkspace: null,
  selectedLoading: false,
  selectedError: null,

  members: [],
  membersLoading: false,
  membersError: null,

  memberSubmitting: false,
  memberSubmitError: null,

  submitting: false,
  submitError: null,

  // Todo initial state
  todos: [],
  todosLoading: false,
  todosError: null,

  selectedTodo: null,
  selectedTodoLoading: false,
  selectedTodoError: null,

  todoSubmitting: false,
  todoSubmitError: null,

  // ─── List ──────────────────────────────────────────────────────
  // Fetches all workspaces for the authenticated user
  fetchWorkspaces: async () => {
    set({ loading: true, error: null })
    try {
      const workspaces = await workspaceService.getAll()
      set({ workspaces })
    } catch (err) {
      // Skip cancelled requests (e.g. component unmount)
      if (!isCancel(err)) {
        set({ error: extractErrorMessage(err, "Failed to load workspaces.") })
      }
    } finally {
      set({ loading: false })
    }
  },

  // ─── Detail ────────────────────────────────────────────────────
  // Fetches a single workspace by ID for the detail page
  fetchWorkspace: async (id: number) => {
    set({ selectedLoading: true, selectedError: null, selectedWorkspace: null })
    try {
      const workspace = await workspaceService.getById(id)
      set({ selectedWorkspace: workspace })
    } catch (err) {
      if (!isCancel(err)) {
        set({ selectedError: extractErrorMessage(err, "Failed to load workspace details.") })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  // ─── Members ───────────────────────────────────────────────────
  // Fetches workspace members with their pivot roles
  fetchMembers: async (workspaceId: number) => {
    set({ membersLoading: true, membersError: null })
    try {
      const members = await workspaceService.getMembers(workspaceId)
      set({ members })
    } catch (err) {
      if (!isCancel(err)) {
        set({ membersError: extractErrorMessage(err, "Failed to load members.") })
      }
    } finally {
      set({ membersLoading: false })
    }
  },

  // ─── Add Member ────────────────────────────────────────────────
  // Adds a user to the workspace by email; refetches member list on success
  addMember: async (workspaceId: number, payload: AddWorkspaceMemberPayload) => {
    set({ memberSubmitting: true, memberSubmitError: null })
    try {
      await workspaceService.addMember(workspaceId, payload)
      // Refresh the member list so the new member appears immediately
      const members = await workspaceService.getMembers(workspaceId)
      set({ members })
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ memberSubmitError: extractErrorMessage(err, "Failed to add member.") })
      }
      return false
    } finally {
      set({ memberSubmitting: false })
    }
  },

  // ─── Remove Member ─────────────────────────────────────────────
  // Removes a member from the workspace; updates local state optimistically
  removeMember: async (workspaceId: number, userId: number) => {
    set({ memberSubmitting: true, memberSubmitError: null })
    try {
      await workspaceService.removeMember(workspaceId, userId)
      // Remove the member from local state without a full refetch
      set((state) => ({ members: state.members.filter((m) => m.id !== userId) }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ memberSubmitError: extractErrorMessage(err, "Failed to remove member.") })
      }
      return false
    } finally {
      set({ memberSubmitting: false })
    }
  },

  // ─── Update Member Role ────────────────────────────────────────
  // Changes a member's role to viewer or editor; updates local state
  updateMemberRole: async (workspaceId: number, userId: number, payload: UpdateMemberRolePayload) => {
    set({ memberSubmitting: true, memberSubmitError: null })
    try {
      await workspaceService.updateMemberRole(workspaceId, userId, payload)
      // Update the pivot role for this member in local state
      set((state) => ({
        members: state.members.map((m) =>
          m.id === userId ? { ...m, pivot: { ...m.pivot, role: payload.role } } : m
        ),
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ memberSubmitError: extractErrorMessage(err, "Failed to update member role.") })
      }
      return false
    } finally {
      set({ memberSubmitting: false })
    }
  },

  // ─── Create ────────────────────────────────────────────────────
  // Creates a new workspace — returns the workspace on success, null on failure
  createWorkspace: async (payload: CreateWorkspacePayload) => {
    set({ submitting: true, submitError: null })
    try {
      const workspace = await workspaceService.create(payload)
      return workspace
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to create workspace.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ─── Full Update (PUT) ────────────────────────────────────────
  // Updates all workspace fields — returns workspace on success, null on failure
  updateWorkspace: async (id: number, payload: UpdateWorkspacePayload) => {
    set({ submitting: true, submitError: null })
    try {
      const workspace = await workspaceService.update(id, payload)
      return workspace
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to update workspace.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ─── Partial Update (PATCH) ───────────────────────────────────
  // Partially updates workspace fields — returns workspace on success, null on failure
  patchWorkspace: async (id: number, payload: Partial<UpdateWorkspacePayload>) => {
    set({ submitting: true, submitError: null })
    try {
      const workspace = await workspaceService.patch(id, payload)
      return workspace
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to update workspace.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ─── Delete ────────────────────────────────────────────────────
  // Deletes a workspace — returns true on success, false on failure
  deleteWorkspace: async (id: number) => {
    set({ submitting: true, submitError: null })
    try {
      await workspaceService.delete(id)
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to delete workspace.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  // ─── Clear helpers ─────────────────────────────────────────────
  clearError: () => set({ error: null }),
  clearSelectedError: () => set({ selectedError: null }),
  clearSelectedWorkspace: () => set({ selectedWorkspace: null, selectedError: null }),
  clearSubmitError: () => set({ submitError: null }),
  // Clears the member mutation error (add / remove / update-role)
  clearMemberSubmitError: () => set({ memberSubmitError: null }),

  // ─── Todos — List ──────────────────────────────────────────────
  // Fetches top-level todos with subtodos for the workspace detail page
  fetchTodos: async (workspaceId: number) => {
    set({ todosLoading: true, todosError: null })
    try {
      const todos = await workspaceService.getTodos(workspaceId)
      set({ todos })
    } catch (err) {
      if (!isCancel(err)) {
        set({ todosError: extractErrorMessage(err, "Failed to load todos.") })
      }
    } finally {
      set({ todosLoading: false })
    }
  },

  // ─── Todos — Detail ────────────────────────────────────────────
  // Fetches a single todo with subtodos for the detail page
  fetchTodo: async (workspaceId: number, todoId: number) => {
    set({ selectedTodoLoading: true, selectedTodoError: null, selectedTodo: null })
    try {
      const todo = await workspaceService.getTodoById(workspaceId, todoId)
      set({ selectedTodo: todo })
    } catch (err) {
      if (!isCancel(err)) {
        set({ selectedTodoError: extractErrorMessage(err, "Failed to load todo.") })
      }
    } finally {
      set({ selectedTodoLoading: false })
    }
  },

  // ─── Todos — Create ────────────────────────────────────────────
  // Creates a new todo — returns the created todo or null on failure
  createTodo: async (workspaceId: number, payload: CreateTodoPayload) => {
    set({ todoSubmitting: true, todoSubmitError: null })
    try {
      const todo = await workspaceService.createTodo(workspaceId, payload)
      return todo
    } catch (err) {
      if (!isCancel(err)) {
        set({ todoSubmitError: extractErrorMessage(err, "Failed to create todo.") })
      }
      return null
    } finally {
      set({ todoSubmitting: false })
    }
  },

  // ─── Todos — Update ────────────────────────────────────────────
  // Updates a todo — returns the updated todo or null on failure
  updateTodo: async (workspaceId: number, todoId: number, payload: UpdateTodoPayload) => {
    set({ todoSubmitting: true, todoSubmitError: null })
    try {
      const todo = await workspaceService.updateTodo(workspaceId, todoId, payload)
      return todo
    } catch (err) {
      if (!isCancel(err)) {
        set({ todoSubmitError: extractErrorMessage(err, "Failed to update todo.") })
      }
      return null
    } finally {
      set({ todoSubmitting: false })
    }
  },

  // ─── Todos — Delete ────────────────────────────────────────────
  // Deletes a todo — returns true on success, false on failure
  deleteTodo: async (workspaceId: number, todoId: number) => {
    set({ todoSubmitting: true, todoSubmitError: null })
    try {
      await workspaceService.deleteTodo(workspaceId, todoId)
      // Remove from local state so UI updates immediately
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== todoId),
      }))
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ todoSubmitError: extractErrorMessage(err, "Failed to delete todo.") })
      }
      return false
    } finally {
      set({ todoSubmitting: false })
    }
  },

  // ─── Todo Clear helpers ────────────────────────────────────────
  clearTodosError: () => set({ todosError: null }),
  clearSelectedTodo: () => set({ selectedTodo: null, selectedTodoError: null }),
  clearTodoSubmitError: () => set({ todoSubmitError: null }),
}))
