// Hook to manage sections for a given project.
// Supports fetching, creating, updating, and deleting sections.
// Follows the same cancel-safe pattern used across the project.

import { useCallback, useEffect, useState } from "react"
import { isCancel, AxiosError } from "axios"
import { toast } from "sonner"
import { sectionService } from "../section-service"
import type { Section, CreateSectionPayload, UpdateSectionPayload } from "../types"
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

export function useSections(projectId: number | null) {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch all sections for the project
  const fetchSections = useCallback(async () => {
    if (projectId === null) return

    setLoading(true)
    setError(null)

    try {
      const data = await sectionService.getByProject(projectId)
      setSections(data)
    } catch (err) {
      if (!isCancel(err)) {
        setError("Failed to load sections.")
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Initial fetch on mount / when projectId changes
  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  // Create a new section, then refetch the list
  const createSection = useCallback(async (payload: CreateSectionPayload): Promise<Section | null> => {
    setSubmitting(true)
    try {
      const created = await sectionService.create(payload)
      await fetchSections()
      toast.success("Section created successfully")
      return created
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to create section.")
        toast.error(msg)
      }
      return null
    } finally {
      setSubmitting(false)
    }
  }, [fetchSections])

  // Update an existing section, then refetch the list
  const updateSection = useCallback(async (sectionId: number, payload: UpdateSectionPayload): Promise<boolean> => {
    setSubmitting(true)
    try {
      await sectionService.update(sectionId, payload)
      await fetchSections()
      toast.success("Section updated successfully")
      return true
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to update section.")
        toast.error(msg)
      }
      return false
    } finally {
      setSubmitting(false)
    }
  }, [fetchSections])

  // Delete a section, then refetch the list
  const deleteSection = useCallback(async (sectionId: number): Promise<boolean> => {
    setSubmitting(true)
    try {
      await sectionService.delete(sectionId)
      await fetchSections()
      toast.success("Section deleted successfully")
      return true
    } catch (err) {
      if (!isCancel(err)) {
        const msg = extractErrorMessage(err, "Failed to delete section.")
        toast.error(msg)
      }
      return false
    } finally {
      setSubmitting(false)
    }
  }, [fetchSections])

  return {
    sections,
    loading,
    error,
    submitting,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
  }
}
