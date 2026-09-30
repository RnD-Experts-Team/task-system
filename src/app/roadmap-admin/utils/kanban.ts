// src/app/roadmap-admin/utils/kanban.ts
// Pure helpers for the roadmap board drag & drop / "Move to…" logic.

import { arrayMove } from "@dnd-kit/sortable"
import type { KanbanColumn } from "../types"

/** Droppable id of a column (cards use their numeric id as a string). */
export function columnDropId(statusId: number): string {
  return `col-${statusId}`
}

export function isColumnDropId(id: string): boolean {
  return id.startsWith("col-")
}

export function columnIdToStatusId(id: string): number {
  return Number(id.slice(4))
}

/** Index of the column that owns a droppable id (a column id or a card id). */
function findColumnIndex(columns: KanbanColumn[], id: string): number {
  if (isColumnDropId(id)) {
    const statusId = columnIdToStatusId(id)
    return columns.findIndex((c) => c.status.id === statusId)
  }
  return columns.findIndex((c) => c.posts.some((p) => String(p.id) === id))
}

export interface MoveResult {
  columns: KanbanColumn[]
  toStatusId: number
  fromStatusId: number
  orderedIds: number[]
}

/**
 * Move card `activeId` next to `overId` (a card or a column). Returns null when nothing changes.
 * Cards dropped on a column go to the end of that column.
 */
export function moveCard(columns: KanbanColumn[], activeId: string, overId: string): MoveResult | null {
  const from = findColumnIndex(columns, activeId)
  const to = findColumnIndex(columns, overId)
  if (from === -1 || to === -1) return null

  const card = columns[from].posts.find((p) => String(p.id) === activeId)
  if (!card) return null
  const oldIndex = columns[from].posts.findIndex((p) => String(p.id) === activeId)

  const next = columns.map((c) => ({ ...c, posts: [...c.posts] }))

  if (from === to) {
    const newIndex = isColumnDropId(overId)
      ? next[to].posts.length - 1
      : next[to].posts.findIndex((p) => String(p.id) === overId)
    if (newIndex === -1 || newIndex === oldIndex) return null
    next[to].posts = arrayMove(next[to].posts, oldIndex, newIndex)
  } else {
    next[from].posts.splice(oldIndex, 1)
    const insertAt = isColumnDropId(overId)
      ? next[to].posts.length
      : Math.max(0, next[to].posts.findIndex((p) => String(p.id) === overId))
    next[to].posts.splice(insertAt, 0, card)
  }

  next[to].posts = next[to].posts.map((p, i) => ({ ...p, roadmap_order: i }))
  return {
    columns: next,
    toStatusId: next[to].status.id,
    fromStatusId: next[from].status.id,
    orderedIds: next[to].posts.map((p) => p.id),
  }
}

/** "Move to…" on mobile: append the card to the end of another column. */
export function moveCardToColumn(columns: KanbanColumn[], cardId: number, toStatusId: number): MoveResult | null {
  return moveCard(columns, String(cardId), columnDropId(toStatusId))
}
