import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, CheckSquare, Plus } from "lucide-react"
import type { Project, KanbanColumn, KanbanTask } from "@/app/projects/data"
import { cn } from "@/lib/utils"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type KanbanBoardProps = {
  project: Project
  onBack: () => void
}

type KanbanSection = {
  id: string
  title: string
  columns: KanbanColumn[]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  high: { label: "High Priority", className: "bg-destructive/10 text-destructive" },
  medium: { label: "Med Priority", className: "bg-blue-500/10 text-blue-400" },
  low: { label: "Low Priority", className: "bg-green-500/10 text-green-400" },
}

// ── Sortable Task Card ────────────────────────────────────────────────────

function SortableTaskCard({ task }: { task: KanbanTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-50")}
    >
      <TaskCardInner task={task} />
    </div>
  )
}

function TaskCardInner({ task }: { task: KanbanTask }) {
  const config = priorityConfig[task.priority]
  const isHighPriority = task.priority === "high"

  return (
    <Card
      className={cn(
        "p-4 cursor-grab active:cursor-grabbing border-l-2 transition-all hover:shadow-md",
        isHighPriority ? "border-l-destructive/40 hover:border-l-destructive" : "border-l-primary/40 hover:border-l-primary",
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider", config.className)}>
          {config.label}
        </span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="text-[10px] font-medium">
            {task.subtasksDone} / {task.subtasksTotal}
          </span>
          <CheckSquare className="size-3" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-foreground leading-tight mb-4">
        {task.title}
      </h4>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/80">
          <Calendar className="size-3" />
          {task.dueLabel}
        </div>
        <Avatar className="size-6">
          <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
          <AvatarFallback className="text-[8px]">{getInitials(task.assignee.name)}</AvatarFallback>
        </Avatar>
      </div>
    </Card>
  )
}

// ── Kanban Column ─────────────────────────────────────────────────────────

function KanbanColumnView({
  column,
  isOver,
}: {
  column: KanbanColumn
  isOver?: boolean
}) {
  // Register the column as a droppable container so DnD knows when pointer is over an empty column area
  const { setNodeRef: setDroppableRef, isOver: isDroppableOver } = useDroppable({ id: column.id })

  const showOver = Boolean(isOver || isDroppableOver)

  return (
    <div ref={setDroppableRef} className={cn("flex flex-col min-w-70 max-w-[320px] w-full bg-card/50 rounded-xl border border-border/50", showOver ? "ring-2 ring-primary/30 shadow-lg" : "")}>
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between shrink-0 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", column.color)} />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {column.title}{" "}
            <span className="opacity-50">({column.tasks.length})</span>
          </h3>
        </div>
        <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-primary">
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* Cards */}
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {column.tasks.map((task) => (
                  <SortableTaskCard key={task.id} task={task} />
                ))}
              </div>
        </SortableContext>
    </div>
  )
}

// ── Board ─────────────────────────────────────────────────────────────────

export function KanbanBoard({ project, onBack }: KanbanBoardProps) {
  // Group all columns under a default section
  const defaultSections: KanbanSection[] = [{ id: "section-default", title: "", columns: project.kanbanColumns }]

  const [sections, setSections] = useState<KanbanSection[]>(() => defaultSections)
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null)
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskId = event.active.id as string
    for (const section of sections) {
      for (const col of section.columns) {
        const found = col.tasks.find((t) => t.id === taskId)
        if (found) {
          setActiveTask(found)
          return
        }
      }
    }
  }, [sections])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as string | undefined
    if (!overId) {
      setHoveredColumn(null)
      return
    }

    // If overId matches a column id directly, set hoveredColumn
    for (const section of sections) {
      const foundCol = section.columns.find((c) => c.id === overId)
      if (foundCol) {
        setHoveredColumn(foundCol.id)
        return
      }
    }

    // Otherwise if overId is a task id, find the parent column
    for (const section of sections) {
      for (const col of section.columns) {
        if (col.tasks.some((t) => t.id === overId)) {
          setHoveredColumn(col.id)
          return
        }
      }
    }

    setHoveredColumn(null)
  }, [sections])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null)
    setHoveredColumn(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    setSections((prevSections) => {
      // Find source section/column/task
      let sourceSectionIdx = -1
      let sourceColIdx = -1
      let sourceTaskIdx = -1
      for (let si = 0; si < prevSections.length; si++) {
        for (let ci = 0; ci < prevSections[si].columns.length; ci++) {
          const ti = prevSections[si].columns[ci].tasks.findIndex((t) => t.id === activeId)
          if (ti !== -1) {
            sourceSectionIdx = si
            sourceColIdx = ci
            sourceTaskIdx = ti
            break
          }
        }
        if (sourceSectionIdx !== -1) break
      }
      if (sourceSectionIdx === -1) return prevSections

      // Determine destination section/column/index
      let destSectionIdx = -1
      let destColIdx = -1
      let destTaskIdx = -1

      // If overId is a column id -> append to that column
      for (let si = 0; si < prevSections.length; si++) {
        const ci = prevSections[si].columns.findIndex((c) => c.id === overId)
        if (ci !== -1) {
          destSectionIdx = si
          destColIdx = ci
          destTaskIdx = prevSections[si].columns[ci].tasks.length
          break
        }
      }

      // Otherwise if overId is a task id -> insert before that task in its column
      if (destColIdx === -1) {
        for (let si = 0; si < prevSections.length; si++) {
          for (let ci = 0; ci < prevSections[si].columns.length; ci++) {
            const ti = prevSections[si].columns[ci].tasks.findIndex((t) => t.id === overId)
            if (ti !== -1) {
              destSectionIdx = si
              destColIdx = ci
              destTaskIdx = ti
              break
            }
          }
          if (destColIdx !== -1) break
        }
      }

      if (destColIdx === -1 || destSectionIdx === -1) return prevSections

      const next = prevSections.map((s) => ({ ...s, columns: s.columns.map((c) => ({ ...c, tasks: [...c.tasks] })) }))

      const [movedTask] = next[sourceSectionIdx].columns[sourceColIdx].tasks.splice(sourceTaskIdx, 1)
      next[destSectionIdx].columns[destColIdx].tasks.splice(destTaskIdx, 0, movedTask)

      return next
    })
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 shrink-0">
        <Button variant="ghost" size="icon-lg" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
            <Badge variant="secondary" className="uppercase tracking-wider">Kanban</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary font-bold uppercase tracking-widest">
              {project.category}
            </span>
          </div>
        </div>
      </div>

      {/* Members bar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex -space-x-2">
          {project.members.slice(0, 4).map((m) => (
            <Avatar key={m.id} className="size-8 border-2 border-background">
              <AvatarImage src={m.avatarUrl} alt={m.name} />
              <AvatarFallback className="text-[10px]">{getInitials(m.name)}</AvatarFallback>
            </Avatar>
          ))}
          {project.members.length > 4 && (
            <div className="size-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{project.members.length} members</span>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-4 min-h-0">
          {sections.map((section) => (
            <section key={section.id} className="space-y-4">
              {section.title ? (
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</h3>
                </div>
              ) : null}

              <div className="flex gap-4 overflow-x-auto pb-4 min-h-0">
                {section.columns.map((col) => (
                  <KanbanColumnView key={col.id} column={col} isOver={hoveredColumn === col.id} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="w-72">
              <div className="text-xs text-muted-foreground mb-2">
                {hoveredColumn
                  ? `Move to: ${(() => {
                      for (const s of sections) {
                        const c = s.columns.find((x: any) => x.id === hoveredColumn)
                        if (c) return c.title
                      }
                      return hoveredColumn
                    })()}`
                  : "Dragging"}
              </div>
              <TaskCardInner task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
