// Renders the full list of sections for a project.
// Handles loading, error, and empty states.
// Each section is displayed as a SectionCard with edit/delete actions.
// Includes a "Create Section" button to open the section form dialog.

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, Plus } from "lucide-react"
import { SectionCard } from "./SectionCard"
import { SectionForm, type SectionFormValues } from "./SectionForm"
import type { Section, CreateSectionPayload, UpdateSectionPayload } from "./types"

type SectionListProps = {
  sections: Section[]
  loading: boolean
  error: string | null
  projectId: number
  submitting: boolean
  onCreateSection: (payload: CreateSectionPayload) => Promise<Section | null>
  onUpdateSection: (sectionId: number, payload: UpdateSectionPayload) => Promise<boolean>
  onDeleteSection: (sectionId: number) => Promise<boolean>
}

export function SectionList({
  sections,
  loading,
  error,
  projectId,
  submitting,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
}: SectionListProps) {
  // State for the create/edit dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)

  // Open dialog in create mode
  function handleCreate() {
    setEditingSection(null)
    setFormOpen(true)
  }

  // Open dialog in edit mode with pre-filled data
  function handleEdit(section: Section) {
    setEditingSection(section)
    setFormOpen(true)
  }

  // Handle delete — calls the parent callback
  async function handleDelete(section: Section) {
    await onDeleteSection(section.id)
  }

  // Handle form submission for both create and edit
  async function handleFormSubmit(values: SectionFormValues) {
    if (editingSection) {
      // Update existing section
      const payload: UpdateSectionPayload = {
        name: values.name,
        description: values.description,
        project_id: projectId,
      }
      const ok = await onUpdateSection(editingSection.id, payload)
      if (ok) setFormOpen(false)
    } else {
      // Create new section
      const payload: CreateSectionPayload = {
        name: values.name,
        description: values.description,
        project_id: projectId,
      }
      const created = await onCreateSection(payload)
      if (created) setFormOpen(false)
    }
  }

  // Loading skeleton — show placeholder cards while sections load
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Empty state — no sections exist in the project yet */}
      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No sections found for this project.
        </p>
      ) : (
        // Render each section as a card with its tasks and actions
        sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            onEdit={handleEdit}
            onDelete={handleDelete}
            submitting={submitting}
          />
        ))
      )}

      {/* Create section button */}
      <Button
        variant="outline"
        className="w-full gap-1.5"
        onClick={handleCreate}
      >
        <Plus className="size-4" />
        Add Section
      </Button>

      {/* Create / Edit section dialog */}
      <SectionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={editingSection ? "edit" : "create"}
        section={editingSection}
        submitting={submitting}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
