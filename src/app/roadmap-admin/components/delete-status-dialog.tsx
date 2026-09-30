import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBoardsStore } from "../store/boardsStore"
import { plural } from "../utils/format"
import type { AdminStatus } from "../types"
import { StatusPill } from "./status-pill"

type DeleteStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: number
  status: AdminStatus | null
  allStatuses: AdminStatus[]
}

/** Delete a status; when posts use it they must be reassigned to another status first. */
export function DeleteStatusDialog({ open, onOpenChange, boardId, status, allStatuses }: DeleteStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open && status && <DeleteForm boardId={boardId} status={status} allStatuses={allStatuses} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function DeleteForm({ boardId, status, allStatuses, onClose }: { boardId: number; status: AdminStatus; allStatuses: AdminStatus[]; onClose: () => void }) {
  const deleteStatus = useBoardsStore((s) => s.deleteStatus)
  const others = allStatuses.filter((s) => s.id !== status.id)
  const needsReassign = status.posts_count > 0
  const [reassignTo, setReassignTo] = useState<string>(() => String(others.find((s) => s.is_default)?.id ?? others[0]?.id ?? ""))
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    const result = await deleteStatus(boardId, status.id, needsReassign ? Number(reassignTo) : null)
    setBusy(false)
    if (result.ok) onClose()
  }

  return (
    <div className="space-y-4 p-5">
      <DialogHeader>
        <DialogTitle>Delete “{status.name}”?</DialogTitle>
        <DialogDescription>
          {needsReassign
            ? `${plural(status.posts_count, "post")} currently use this status. Choose where they should go.`
            : "No posts use this status, so nothing else changes."}
        </DialogDescription>
      </DialogHeader>

      {needsReassign && (
        <div className="space-y-1.5">
          <Label htmlFor="reassign-status">Move posts to</Label>
          <Select value={reassignTo} onValueChange={setReassignTo}>
            <SelectTrigger id="reassign-status" className="w-full">
              <SelectValue placeholder="Choose a status" />
            </SelectTrigger>
            <SelectContent>
              {others.map((s) => (
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
        <Button variant="destructive" size="lg" onClick={() => void submit()} disabled={busy || (needsReassign && !reassignTo)}>
          {busy && <Loader2 className="animate-spin" />}
          Delete status
        </Button>
      </div>
    </div>
  )
}
