// Generic vertical drag-to-reorder list with an explicit drag handle (touch + keyboard friendly).
import type { ReactNode } from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

type SortableRowsProps<T extends { id: number }> = {
  items: T[]
  onReorder: (ids: number[]) => void
  disabled?: boolean
  renderRow: (item: T) => ReactNode
  /** Row label used for the handle's accessible name */
  labelFor: (item: T) => string
  className?: string
}

function SortableRow({ id, label, disabled, children }: { id: number; label: string; disabled?: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("flex items-center gap-2 rounded-lg border bg-card p-2 pe-3", isDragging && "relative z-10 shadow-lg ring-1 ring-primary/30")}
    >
      {!disabled && (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${label}`}
          className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      )}
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
    </li>
  )
}

export function SortableRows<T extends { id: number }>({ items, onReorder, disabled, renderRow, labelFor, className }: SortableRowsProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = items.findIndex((i) => i.id === active.id)
    const to = items.findIndex((i) => i.id === over.id)
    if (from === -1 || to === -1) return
    onReorder(arrayMove(items, from, to).map((i) => i.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className={cn("space-y-2", className)}>
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id} label={labelFor(item)} disabled={disabled}>
              {renderRow(item)}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
