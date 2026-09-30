import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBoardDetail } from "../hooks/useBoards"
import type { AdminPostDetail } from "../types"
import { BoardSelect } from "./board-select"
import { StatusPill } from "./status-pill"

type MovePostDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: AdminPostDetail
  busy: boolean
  onSubmit: (boardId: number, statusId: number | null) => Promise<boolean>
}

const KEEP_DEFAULT = "default"

export function MovePostDialog({ open, onOpenChange, post, busy, onSubmit }: MovePostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open && <MoveForm post={post} busy={busy} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function MoveForm({ post, busy, onSubmit, onClose }: Omit<MovePostDialogProps, "open" | "onOpenChange"> & { onClose: () => void }) {
  const [boardId, setBoardId] = useState<number | null>(null)
  const [statusId, setStatusId] = useState(KEEP_DEFAULT)
  const { statuses, loading } = useBoardDetail(boardId)

  async function submit() {
    if (!boardId) return
    const ok = await onSubmit(boardId, statusId === KEEP_DEFAULT ? null : Number(statusId))
    if (ok) onClose()
  }

  return (
    <div className="space-y-4 p-5">
      <DialogHeader>
        <DialogTitle>Move to another board</DialogTitle>
        <DialogDescription>
          The post gets a new number on the destination board and its old link redirects. Tags are matched by name; tags with no
          match are dropped.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="move-board">Destination board</Label>
        <BoardSelect
          id="move-board"
          value={boardId}
          onChange={(next) => {
            setBoardId(next)
            setStatusId(KEEP_DEFAULT)
          }}
          allLabel={null}
          className="w-full sm:w-full"
        />
      </div>

      {boardId && (
        <div className="space-y-2">
          <Label htmlFor="move-status">Status on the new board</Label>
          <Select value={statusId} onValueChange={setStatusId} disabled={loading}>
            <SelectTrigger id="move-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={KEEP_DEFAULT}>Board default</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  <StatusPill name={s.name} color={s.color} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button size="lg" onClick={() => void submit()} disabled={!boardId || boardId === post.board.id || busy}>
          {busy && <Loader2 className="animate-spin" />}
          Move post
        </Button>
      </div>
    </div>
  )
}
