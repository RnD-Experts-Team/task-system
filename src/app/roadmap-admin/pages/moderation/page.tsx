// src/app/roadmap-admin/pages/moderation/page.tsx
// Moderation inbox — pending posts and comments. Approve / Reject / Spam with A / R / S on the
// focused item, bulk select, undo toast, optimistic removal (with rollback in the store).

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { CheckCheck, Inbox, RefreshCw, ShieldAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BoardSelect } from "../../components/board-select"
import { EmptyState } from "../../components/empty-state"
import { ErrorState } from "../../components/error-state"
import { ModerationItemCard } from "../../components/moderation-item-card"
import { PageHeader } from "../../components/page-header"
import { CardListSkeleton } from "../../components/skeletons"
import { useBoards } from "../../hooks/useBoards"
import { useModerationQueue } from "../../hooks/useModerationQueue"
import { useRoadmapPermissions } from "../../hooks/useRoadmapPermissions"
import type { ModerationDecision, QueueKind } from "../../store/moderationStore"
import type { AdminComment, AdminPostListItem } from "../../types"

const DECISION_LABEL: Record<ModerationDecision, string> = {
  approved: "approved",
  rejected: "rejected",
  spam: "marked as spam",
}

export default function RoadmapModerationPage() {
  const { canModerate } = useRoadmapPermissions()
  const [tab, setTab] = useState<QueueKind>("posts")
  const [boardId, setBoardId] = useState<number | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set())

  const { posts, comments, refetch, decide, decideMany, requeue } = useModerationQueue(boardId)
  const listRef = useRef<HTMLDivElement>(null)
  // Where to move keyboard focus after the focused item leaves the queue
  const focusIndex = useRef<number | null>(null)

  const boardSlug = useBoardSlugFilter(boardId)
  const commentItems = useMemo(
    () => (boardSlug ? comments.items.filter((c) => c.post.board_slug === boardSlug) : comments.items),
    [comments.items, boardSlug]
  )

  const slice = tab === "posts" ? posts : comments
  const items: (AdminPostListItem | AdminComment)[] = tab === "posts" ? posts.items : commentItems
  const postsTotal = posts.pagination?.total ?? posts.items.length
  const commentsTotal = comments.pagination?.total ?? comments.items.length
  const loadingFirst = slice.loading && slice.items.length === 0

  // Drop selections that left the queue
  const activeSelected = useMemo(() => new Set([...selected].filter((id) => items.some((i) => i.id === id))), [selected, items])

  // Restore keyboard focus to the neighbour of the item that was just decided
  useEffect(() => {
    if (focusIndex.current === null) return
    const index = focusIndex.current
    focusIndex.current = null
    const cards = listRef.current?.querySelectorAll<HTMLElement>("[data-item-id]")
    if (!cards || cards.length === 0) return
    cards[Math.min(index, cards.length - 1)]?.focus()
  }, [items.length])

  function changeTab(next: string) {
    setTab(next as QueueKind)
    setSelected(new Set())
  }

  async function handleDecide(item: AdminPostListItem | AdminComment, state: ModerationDecision) {
    if (busyIds.has(item.id)) return
    const index = items.findIndex((i) => i.id === item.id)
    const active = document.activeElement
    const hadFocus = active instanceof HTMLElement && active.closest(`[data-item-id="${item.id}"]`) !== null
    if (hadFocus) focusIndex.current = index

    const kind = tab
    setBusyIds((prev) => new Set(prev).add(item.id))
    const ok = await decide(kind, item.id, state)
    setBusyIds((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
    if (!ok) {
      focusIndex.current = null
      return
    }
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(item.id)
      return next
    })
    const noun = kind === "posts" ? "Post" : "Comment"
    toast.success(`${noun} ${DECISION_LABEL[state]}`, {
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          void requeue(kind, item.id, item, index).then((restored) => {
            if (restored) toast.message(`${noun} moved back to the queue`)
          })
        },
      },
    })
  }

  async function handleBulk(state: ModerationDecision) {
    const ids = [...activeSelected]
    if (ids.length === 0) return
    const kind = tab
    const ok = await decideMany(kind, ids, state)
    if (ok) {
      setSelected(new Set())
      toast.success(`${ids.length} ${kind === "posts" ? "posts" : "comments"} ${DECISION_LABEL[state]}`)
    }
  }

  const allSelected = items.length > 0 && activeSelected.size === items.length

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Moderation"
        description="Review what visitors submitted before it goes public. Focus an item and press A, R or S to decide without the mouse."
        badge={`${postsTotal + commentsTotal} pending`}
        actions={
          <>
            {tab === "posts" && <BoardSelect value={boardId} onChange={setBoardId} />}
            <Button variant="outline" size="lg" className="gap-1.5" onClick={() => void refetch(tab)} disabled={slice.loading}>
              <RefreshCw className={slice.loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={changeTab}>
          <TabsList>
            <TabsTrigger value="posts">Posts ({postsTotal})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({commentsTotal})</TabsTrigger>
          </TabsList>
        </Tabs>
        {canModerate && items.length > 0 && (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => setSelected(checked === true ? new Set(items.map((i) => i.id)) : new Set())}
              aria-label="Select all"
            />
            Select all
          </label>
        )}
      </div>

      {slice.error && slice.items.length === 0 ? (
        <ErrorState message={slice.error} onRetry={() => void refetch(tab)} />
      ) : loadingFirst ? (
        <CardListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inbox zero"
          description={
            tab === "posts"
              ? "No posts are waiting for review. New submissions land here when a board requires approval."
              : "No comments are waiting for review."
          }
        />
      ) : (
        <div ref={listRef} className="space-y-3 pb-20">
          {items.map((item) => (
            <ModerationItemCard
              key={`${tab}-${item.id}`}
              item={item}
              selected={activeSelected.has(item.id)}
              busy={busyIds.has(item.id)}
              canDecide={canModerate}
              onSelectChange={(checked) =>
                setSelected((prev) => {
                  const next = new Set(prev)
                  if (checked) next.add(item.id)
                  else next.delete(item.id)
                  return next
                })
              }
              onDecide={(state) => void handleDecide(item, state)}
            />
          ))}
          {slice.pagination && slice.pagination.total > items.length && tab === "posts" && (
            <p className="text-center text-xs text-muted-foreground">
              Showing the newest {items.length} of {slice.pagination.total}. Decide these and refresh to load more.
            </p>
          )}
        </div>
      )}

      {/* Bulk bar */}
      {canModerate && activeSelected.size > 0 && (
        <div
          role="region"
          aria-label="Bulk actions"
          className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-2 rounded-xl border bg-popover p-3 shadow-lg md:bottom-6"
        >
          <p className="text-sm font-medium tabular-nums">{activeSelected.size} selected</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="lg" className="gap-1.5" onClick={() => void handleBulk("approved")}>
              <CheckCheck />
              Approve
            </Button>
            <Button size="lg" variant="outline" className="gap-1.5" onClick={() => void handleBulk("rejected")}>
              <X />
              Reject
            </Button>
            <Button size="lg" variant="destructive" className="gap-1.5" onClick={() => void handleBulk("spam")}>
              <ShieldAlert />
              Spam
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Board slug for the selected board id (comments only know the slug). */
function useBoardSlugFilter(boardId: number | null): string | null {
  const { boards } = useBoards()
  if (boardId === null) return null
  return boards.find((b) => b.id === boardId)?.slug ?? null
}
