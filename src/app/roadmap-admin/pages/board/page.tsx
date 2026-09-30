// src/app/roadmap-admin/pages/board/page.tsx
// Roadmap Board: dnd-kit kanban across the roadmap-column statuses of one board.

import { useState } from "react"
import { Columns3, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BoardSelect } from "../../components/board-select"
import { EmptyState } from "../../components/empty-state"
import { ErrorState } from "../../components/error-state"
import { KanbanBoard } from "../../components/kanban-board"
import { PageHeader } from "../../components/page-header"
import { useBoards } from "../../hooks/useBoards"
import { useRoadmapKanban } from "../../hooks/useRoadmapKanban"
import { useRoadmapPermissions } from "../../hooks/useRoadmapPermissions"

function BoardSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-72 shrink-0 space-y-2 rounded-xl border bg-muted/30 p-2">
          <Skeleton className="h-6 w-28" />
          {Array.from({ length: 3 - (i % 2) }).map((__, j) => (
            <Skeleton key={j} className="h-24 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function RoadmapBoardPage() {
  const { canManage } = useRoadmapPermissions()
  const { boards, loading: boardsLoading, error: boardsError, refetch: refetchBoards } = useBoards()
  const [chosenId, setChosenId] = useState<number | null>(null)

  // Default to the first non-archived board until the user picks one
  const boardId = chosenId ?? boards.find((b) => !b.is_archived)?.id ?? boards[0]?.id ?? null
  const { data, loading, error, moving, refetch, commitMove } = useRoadmapKanban(boardId)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Roadmap Board"
        description={
          canManage
            ? "Drag cards between columns (or use Move to… on small screens) to update their public status and order. Changes show on the public roadmap right away."
            : "Read-only view of the public roadmap."
        }
        actions={
          <>
            <BoardSelect value={boardId} onChange={setChosenId} allLabel={null} />
            <Button variant="outline" size="lg" className="gap-1.5" onClick={() => void refetch()} disabled={loading || !boardId}>
              <RefreshCw className={loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
            {moving && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
                <Loader2 className="size-3.5 animate-spin" />
                Saving…
              </span>
            )}
          </>
        }
      />

      {boardsError && boards.length === 0 ? (
        <ErrorState message={boardsError} onRetry={() => void refetchBoards()} />
      ) : boardsLoading ? (
        <BoardSkeleton />
      ) : boards.length === 0 ? (
        <EmptyState icon={Columns3} title="No boards yet" description="Create a board in Boards & Statuses to start a roadmap." />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : !data ? (
        <BoardSkeleton />
      ) : (
        <KanbanBoard
          key={data.board.id}
          data={data}
          canMove={canManage}
          moving={moving}
          onCommit={(postId, move) => commitMove(data.board.id, postId, move)}
        />
      )}
    </div>
  )
}
