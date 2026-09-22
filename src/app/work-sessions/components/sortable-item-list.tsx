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
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import type { ItemOutcome, WorkSessionItem } from "../types"
import { SessionItemCard } from "./session-item-card"

type SortableItemListProps = {
  items: WorkSessionItem[]
  /** Disables dragging and every per-row control (confirmed sessions) */
  readOnly?: boolean
  /** Disables controls while a request is in flight (still renders as editable) */
  disabled?: boolean
  onReorder?: (itemIds: number[]) => void
  onEdit?: (item: WorkSessionItem) => void
  onDelete?: (item: WorkSessionItem) => void | Promise<unknown>
  onOutcomeChange?: (item: WorkSessionItem, outcome: ItemOutcome) => void
}

/** Vertical drag-to-reorder list of SessionItemCard rows */
export function SortableItemList({
  items,
  readOnly = false,
  disabled = false,
  onReorder,
  onEdit,
  onDelete,
  onOutcomeChange,
}: SortableItemListProps) {
  const sensors = useSensors(
    // 4px activation distance prevents accidental drags on click
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // Keyboard sensor enables accessible drag-and-drop
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !onReorder) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(items, oldIndex, newIndex).map((i) => i.id))
  }

  const rows = items.map((item) => (
    <SessionItemCard
      key={item.id}
      item={item}
      editable={!readOnly}
      disabled={disabled}
      onEdit={readOnly ? undefined : onEdit}
      onDelete={readOnly ? undefined : onDelete}
      onOutcomeChange={readOnly ? undefined : onOutcomeChange}
    />
  ))

  // The DnD context is always mounted; read-only rows disable their own useSortable
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">{rows}</div>
      </SortableContext>
    </DndContext>
  )
}
