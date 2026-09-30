// Roadmap kanban (dnd-kit) — cross-column drag with optimistic move; the store rolls back when
// the API rejects it. On mobile there are column tabs plus a "Move to…" menu instead of drag.

import { memo, useCallback, useState } from "react"
import { createPortal } from "react-dom"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Columns3 } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { columnDropId, moveCard, moveCardToColumn, type MoveResult } from "../utils/kanban"
import type { AdminRoadmapData, KanbanCard, KanbanColumn } from "../types"
import { EmptyState } from "./empty-state"
import { KanbanCardView } from "./kanban-card"

type KanbanBoardProps = {
  data: AdminRoadmapData
  canMove: boolean
  moving: boolean
  onCommit: (postId: number, move: MoveResult) => Promise<boolean>
}

const SortableCard = memo(function SortableCard({ card, disabled }: { card: KanbanCard; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(card.id), disabled })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition: isDragging ? undefined : transition }}
      {...attributes}
      {...listeners}
      className={cn("w-full touch-manipulation select-none", !disabled && "cursor-grab")}
      aria-label={`${card.title}. ${disabled ? "" : "Press space to pick up, arrow keys to move."}`}
    >
      <div className={isDragging ? "opacity-30" : undefined}>
        <KanbanCardView card={card} />
      </div>
    </div>
  )
})

function Column({ column, isOver, canMove, moving }: { column: KanbanColumn; isOver: boolean; canMove: boolean; moving: boolean }) {
  const { setNodeRef, isOver: droppableOver } = useDroppable({ id: columnDropId(column.status.id) })
  const highlight = isOver || droppableOver
  return (
    <section
      ref={setNodeRef}
      aria-label={`${column.status.name}, ${column.posts.length} cards`}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors",
        highlight && "border-primary/50 bg-primary/5"
      )}
    >
      <header className="flex items-center gap-2 border-b px-3 py-2.5">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: column.status.color }} aria-hidden />
        <h3 className="text-xs font-semibold tracking-wider uppercase">{column.status.name}</h3>
        <span className="ms-auto rounded-full bg-muted px-2 text-xs tabular-nums text-muted-foreground">{column.posts.length}</span>
      </header>
      <SortableContext items={column.posts.map((p) => String(p.id))} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-24 flex-1 flex-col gap-2 p-2">
          {column.posts.map((card) => (
            <SortableCard key={card.id} card={card} disabled={!canMove || moving} />
          ))}
          {column.posts.length === 0 && (
            <p className="m-auto py-6 text-center text-xs text-muted-foreground">{canMove ? "Drop a card here" : "Nothing here yet"}</p>
          )}
        </div>
      </SortableContext>
    </section>
  )
}

export function KanbanBoard({ data, canMove, moving, onCommit }: KanbanBoardProps) {
  const isMobile = useIsMobile()
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null)
  const [activeWidth, setActiveWidth] = useState<number | null>(null)
  const [overColumn, setOverColumn] = useState<string | null>(null)
  const [tab, setTab] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const columns = data.columns

  const commit = useCallback(
    async (move: MoveResult | null, postId: number) => {
      if (!move) return
      const ok = await onCommit(postId, move)
      if (!ok) toast.error("Couldn't move the card. It went back to where it was.")
    },
    [onCommit]
  )

  function handleDragStart(event: DragStartEvent) {
    const width = event.active.rect.current.initial?.width
    setActiveWidth(typeof width === "number" ? width : null)
    for (const col of columns) {
      const found = col.posts.find((p) => String(p.id) === String(event.active.id))
      if (found) return setActiveCard(found)
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over?.id ? String(event.over.id) : null
    if (!overId) return setOverColumn(null)
    const asColumn = columns.find((c) => columnDropId(c.status.id) === overId)
    if (asColumn) return setOverColumn(overId)
    const owner = columns.find((c) => c.posts.some((p) => String(p.id) === overId))
    setOverColumn(owner ? columnDropId(owner.status.id) : null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null)
    setActiveWidth(null)
    setOverColumn(null)
    const { active, over } = event
    if (!over || moving) return
    const move = moveCard(columns, String(active.id), String(over.id))
    void commit(move, Number(active.id))
  }

  if (columns.length === 0) {
    return (
      <EmptyState
        icon={Columns3}
        title="No roadmap columns"
        description="Mark at least one status as a roadmap column in Boards & Statuses to see it here."
      />
    )
  }

  // ── Mobile: column tabs + "Move to…" ──
  if (isMobile) {
    const current = tab && columns.some((c) => String(c.status.id) === tab) ? tab : String(columns[0].status.id)
    return (
      <Tabs value={current} onValueChange={setTab}>
        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <TabsList className="w-max">
            {columns.map((c) => (
              <TabsTrigger key={c.status.id} value={String(c.status.id)} className="gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: c.status.color }} aria-hidden />
                {c.status.name}
                <span className="tabular-nums opacity-60">{c.posts.length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {columns.map((c) => (
          <TabsContent key={c.status.id} value={String(c.status.id)} className="space-y-2">
            {c.posts.length === 0 ? (
              <EmptyState title="Nothing here yet" description="Cards moved to this column appear here." className="p-6" />
            ) : (
              c.posts.map((card) => (
                <KanbanCardView
                  key={card.id}
                  card={card}
                  moveTargets={canMove ? columns.filter((x) => x.status.id !== c.status.id).map((x) => x.status) : undefined}
                  moveDisabled={moving}
                  onMoveTo={(cardToMove, statusId) => void commit(moveCardToColumn(columns, cardToMove.id, statusId), cardToMove.id)}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    )
  }

  // ── Desktop: drag & drop ──
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveCard(null)
        setOverColumn(null)
      }}
    >
      <div className="flex items-start gap-3 overflow-x-auto pb-3">
        {columns.map((col) => (
          <Column key={col.status.id} column={col} isOver={overColumn === columnDropId(col.status.id)} canMove={canMove} moving={moving} />
        ))}
      </div>
      {createPortal(
        <DragOverlay adjustScale={false} zIndex={100} dropAnimation={{ duration: 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
          {activeCard && (
            <div className="pointer-events-none" style={{ width: activeWidth ?? 272 }}>
              <KanbanCardView card={activeCard} isOverlay />
            </div>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}
