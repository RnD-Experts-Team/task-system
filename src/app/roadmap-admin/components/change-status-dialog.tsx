import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { AdminPostDetail, AdminStatus, ChangeStatusPayload } from "../types"
import { StatusPill } from "./status-pill"

type ChangeStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: AdminPostDetail
  statuses: AdminStatus[]
  busy: boolean
  onSubmit: (payload: ChangeStatusPayload) => Promise<boolean>
}

export function ChangeStatusDialog({ open, onOpenChange, post, statuses, busy, onSubmit }: ChangeStatusDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {/* Remount the form on every open so it starts fresh */}
        {open && <StatusForm post={post} statuses={statuses} busy={busy} onSubmit={onSubmit} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function StatusForm({
  post,
  statuses,
  busy,
  onSubmit,
  onClose,
}: Pick<ChangeStatusDialogProps, "post" | "statuses" | "busy" | "onSubmit"> & { onClose: () => void }) {
  const [statusId, setStatusId] = useState(String(post.status.id))
  const [note, setNote] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const unchanged = Number(statusId) === post.status.id

  async function submit() {
    const ok = await onSubmit({ status_id: Number(statusId), note: note.trim() || null, note_is_public: note.trim() ? isPublic : false })
    if (ok) onClose()
  }

  return (
    <div className="space-y-4 p-5">
      <DialogHeader>
        <DialogTitle>Change status</DialogTitle>
        <DialogDescription>Adds an entry to the post's status history. The note is optional.</DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="status-select">New status</Label>
        <Select value={statusId} onValueChange={setStatusId}>
          <SelectTrigger id="status-select" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                <StatusPill name={s.name} color={s.color} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {statuses.some((s) => s.id === Number(statusId) && s.locks_voting) && (
          <p className="text-xs text-muted-foreground">Voting closes on posts with this status.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status-note">Note (optional)</Label>
        <Textarea
          id="status-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          placeholder="e.g. Shipping in the next release"
          className="min-h-20"
        />
        <p className="text-end text-[0.6875rem] tabular-nums text-muted-foreground">{note.length} / 500</p>
      </div>

      <label className="flex items-start justify-between gap-3 rounded-lg border p-3">
        <span className="space-y-0.5">
          <span className="block text-sm font-medium">Show note publicly</span>
          <span className="block text-xs text-muted-foreground">Visitors see this note in the post's status timeline.</span>
        </span>
        <Switch checked={isPublic} onCheckedChange={setIsPublic} disabled={!note.trim()} aria-label="Show note publicly" />
      </label>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button size="lg" onClick={() => void submit()} disabled={busy || unchanged || statuses.length === 0}>
          {busy && <Loader2 className="animate-spin" />}
          Update status
        </Button>
      </div>
    </div>
  )
}
