import { create } from "zustand"
import { isCancel, AxiosError } from "axios"
import { toast } from "sonner"
import { projectService } from "../services/projectService"
import type { Project, CreateProjectPayload, UpdateProjectPayload } from "../types"
import type { ApiValidationError } from "@/types"

// Extract a user-friendly message from Axios errors
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    if (data?.errors) {
      return Object.values(data.errors).flat().join(". ")
    }
    if (data?.message) return data.message
  }
  return fallback
}

// ─── State shape ──────────────────────────────────────────────────

interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
  selectedProject: Project | null
  selectedLoading: boolean
  submitting: boolean
  submitError: string | null
}

// ─── Actions ──────────────────────────────────────────────────────

interface ProjectsActions {
  fetchProjects: () => Promise<void>
  getProject: (id: number) => Promise<void>
  createProject: (payload: CreateProjectPayload) => Promise<Project | null>
  updateProject: (id: number, payload: UpdateProjectPayload) => Promise<boolean>
  deleteProject: (id: number) => Promise<boolean>
  clearError: () => void
  clearSubmitError: () => void
  clearSelectedProject: () => void
}

type ProjectsStore = ProjectsState & ProjectsActions

// ─── Store ────────────────────────────────────────────────────────

export const useProjectsStore = create<ProjectsStore>()((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  selectedProject: null,
  selectedLoading: false,
  submitting: false,
  submitError: null,

  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const projects = await projectService.getAll()
      set({ projects })
    } catch (err) {
      if (!isCancel(err)) {
        set({ error: "Failed to load projects." })
      }
    } finally {
      set({ loading: false })
    }
  },

  getProject: async (id: number) => {
    set({ selectedLoading: true, selectedProject: null })
    try {
      const project = await projectService.getById(id)
      set({ selectedProject: project })
    } catch (err) {
      if (!isCancel(err)) {
        set({ error: "Failed to load project details." })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  createProject: async (payload: CreateProjectPayload) => {
    set({ submitting: true, submitError: null })
    try {
      const project = await projectService.create(payload)
      // Refresh list after create
      await get().fetchProjects()
      toast.success("Project created successfully")
      return project
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to create project.")
        set({ submitError: msg })
        toast.error(msg)
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  updateProject: async (id: number, payload: UpdateProjectPayload) => {
    set({ submitting: true, submitError: null })
    try {
      await projectService.update(id, payload)
      await get().fetchProjects()
      toast.success("Project updated successfully")
      return true
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to update project.")
        set({ submitError: msg })
        toast.error(msg)
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  deleteProject: async (id: number) => {
    set({ submitting: true, submitError: null })
    try {
      await projectService.delete(id)
      await get().fetchProjects()
      toast.success("Project deleted successfully")
      return true
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to delete project.")
        set({ submitError: msg })
        toast.error(msg)
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  clearError: () => set({ error: null }),
  clearSubmitError: () => set({ submitError: null }),
  clearSelectedProject: () => set({ selectedProject: null }),
}))
