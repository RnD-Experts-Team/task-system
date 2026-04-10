// Renders a single section as a Card.
// The card header shows the section name, description, and action menu (edit/delete).
// The card body loads and displays all tasks belonging to this section.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSectionTasks } from "./hooks/useSectionTasks"
import { TaskList } from "./TaskList"
import { SectionActions } from "./SectionActions"
import type { Section } from "./types"

type SectionCardProps = {
  section: Section
  onEdit: (section: Section) => void
  onDelete: (section: Section) => void
  submitting?: boolean
}

export function SectionCard({ section, onEdit, onDelete, submitting }: SectionCardProps) {
  // Fetch tasks for this section when it mounts
  const { tasks, loading, error } = useSectionTasks(section.id)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">{section.name}</CardTitle>
            {section.description && (
              <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
            )}
          </div>
          {/* Edit / Delete actions */}
          <SectionActions
            section={section}
            onEdit={onEdit}
            onDelete={onDelete}
            submitting={submitting}
          />
        </div>
      </CardHeader>
      <CardContent>
        <TaskList tasks={tasks} loading={loading} error={error} />
      </CardContent>
    </Card>
  )
}
