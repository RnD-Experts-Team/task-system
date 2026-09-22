import { useState } from "react"
import type { CSSProperties } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ChevronDown,
  GripVertical,
  Link2,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Timer,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TruncatedText } from "@/components/ui/truncated-text"
import { cn } from "@/lib/utils"
import { OUTCOME_LABELS, type ItemOutcome, type WorkSessionItem } from "../types"
import { minutesToHuman } from "../utils/format"
import { OutcomeBadge } from "./outcome-badge"
import { PriorityBadge } from "./priority-badge"

const OUTCOME_ORDER: ItemOutcome[] = ["pending", "done", "partial", "not_done"]

type SessionItemCardProps = {
  item: WorkSessionItem
  /** When false, the row is static: no drag handle, no outcome dropdown, no edit/delete */
  editable?: boolean
  /** Disables interactive controls while a request is in flight */
  disabled?: boolean
  onEdit?: (item: WorkSessionItem) => void
  onDelete?: (item: WorkSessionItem) => void | Promise<unknown>
  onOutcomeChange?: (item: WorkSessionItem, outcome: ItemOutcome) => void
}

/** Sortable row for one planned item (drag handle, badges, quick outcome, edit/delete) */
export function SessionItemCard({
  item,
  editable = true,
  disabled = false,
  onEdit,
  onDelete,
  onOutcomeChange,
}: SessionItemCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: !editable || disabled })

  const style: CSSProperties = {
    // CSS.Translate omits scale components so the row stays aligned with the pointer
    transform: CSS.Translate.toString(transform),
    transition,
  }

  async function handleConfirmDelete() {
    if (!onDelete) return
    setDeleting(true)
    try {
      await onDelete(item)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group/item relative flex items-start gap-2 rounded-lg border bg-card/40 p-3 transition-colors",
          "hover:bg-card/70",
          isDragging && "z-10 opacity-80 shadow-lg ring-1 ring-primary/40",
          item.outcome === "done" && "border-emerald-500/30",
          item.outcome === "partial" && "border-amber-500/30",
          item.outcome === "not_done" && "border-red-500/30"
        )}
      >
        {/* Drag handle — only the handle activates dragging so buttons stay clickable */}
        {editable ? (
          <button
            ref={setActivatorNodeRef}
            type="button"
            aria-label="Drag to reorder"
            disabled={disabled}
            className="mt-0.5 shrink-0 cursor-grab touch-none rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        ) : (
          <span className="mt-0.5 w-6 shrink-0" />
        )}

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-sm font-medium leading-tight text-foreground",
                item.outcome === "done" && "text-muted-foreground line-through decoration-emerald-500/50"
              )}
            >
              {item.title}
            </p>
            {item.carried_from_item_id && (
              <Badge variant="secondary" className="gap-1">
                <RotateCcw />
                Carried over
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityBadge priority={item.priority} />
            {item.estimated_minutes !== null && (
              <span className="inline-flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                <Timer className="size-3" />
                {minutesToHuman(item.estimated_minutes)}
              </span>
            )}
            {item.task && (
              <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-input/20 px-2 py-0.5 text-[0.625rem] text-muted-foreground">
                <Link2 className="size-2.5 shrink-0" />
                <TruncatedText value={item.task.name} className="max-w-40 sm:max-w-60" />
              </span>
            )}
          </div>

          {item.description && (
            <TruncatedText
              value={item.description}
              className="max-w-full text-xs text-muted-foreground sm:max-w-md lg:max-w-lg"
            />
          )}

          {item.outcome_note && (
            <p className="text-xs italic text-muted-foreground">“{item.outcome_note}”</p>
          )}
        </div>

        {/* Right rail: outcome + actions */}
        <div className="flex shrink-0 items-center gap-1">
          {editable && onOutcomeChange ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled}
                  className="inline-flex items-center gap-0.5 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50"
                  aria-label="Change outcome"
                >
                  <OutcomeBadge outcome={item.outcome} />
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuRadioGroup
                  value={item.outcome}
                  onValueChange={(v) => onOutcomeChange(item, v as ItemOutcome)}
                >
                  {OUTCOME_ORDER.map((o) => (
                    <DropdownMenuRadioItem key={o} value={o}>
                      {OUTCOME_LABELS[o]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <OutcomeBadge outcome={item.outcome} />
          )}

          {editable && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" disabled={disabled} aria-label="Item actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil className="size-3.5" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onEdit && onDelete && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="size-3.5" />
                    Remove
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={(o) => !deleting && setConfirmDelete(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this item?</AlertDialogTitle>
            <AlertDialogDescription>
              “{item.title}” will be removed from today's plan. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmDelete()
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
