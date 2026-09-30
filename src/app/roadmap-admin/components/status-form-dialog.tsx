import { useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useBoardsStore } from "../store/boardsStore"
import { fieldError, type MutationResult } from "../utils/mutation"
import { ITEM_PALETTE } from "../utils/palette"
import type { AdminStatus, StatusKind } from "../types"
import { ColorPicker } from "./color-picker"
import { StatusPill } from "./status-pill"

const KINDS: { value: StatusKind; label: string; hint: string }[] = [
  { value: "open", label: "Open", hint: "New and under review" },
  { value: "planned", label: "Planned", hint: "Accepted, not started" },
  { value: "in_progress", label: "In progress", hint: "Being worked on" },
  { value: "done", label: "Done", hint: "Shipped" },
  { value: "closed", label: "Closed", hint: "Not planned or declined" },
]

type StatusFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: number
  /** Status to edit; null creates a new one */
  status: AdminStatus | null
}

export function StatusFormDialog({ open, onOpenChange, boardId, status }: StatusFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-md overflow-y-auto">
        {open && <StatusForm boardId={boardId} status={status} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function StatusForm({ boardId, status, onClose }: { boardId: number; status: AdminStatus | null; onClose: () => void }) {
  const createStatus = useBoardsStore((s) => s.createStatus)
  const updateStatus = useBoardsStore((s) => s.updateStatus)
  const editing = status !== null

  const [name, setName] = useState(status?.name ?? "")
  const [color, setColor] = useState(status?.color ?? ITEM_PALETTE[8])
  const [kind, setKind] = useState<StatusKind>(status?.kind ?? "open")
  const [isRoadmapColumn, setIsRoadmapColumn] = useState(status?.is_roadmap_column ?? false)
  const [locksVoting, setLocksVoting] = useState(status?.locks_voting ?? false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<MutationResult<AdminStatus> | null>(null)

  const nameError = name.trim() === "" ? "Name is required" : name.length > 60 ? "Name must be 60 characters or less" : undefined

  async function submit() {
    if (nameError) return
    setBusy(true)
    const payload = { name: name.trim(), color, kind, is_roadmap_column: isRoadmapColumn, locks_voting: locksVoting }
    const res = editing ? await updateStatus(boardId, status.id, payload) : await createStatus(boardId, payload)
    setBusy(false)
    setResult(res)
    if (res.ok) onClose()
  }

  const generalError = result && !result.ok && Object.keys(result.errors).length === 0 ? result.message : null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
      className="space-y-4 p-5"
    >
      <DialogHeader>
        <DialogTitle>{editing ? "Edit status" : "New status"}</DialogTitle>
        <DialogDescription>Statuses describe where a request is in its life. Roadmap columns show on the public roadmap.</DialogDescription>
      </DialogHeader>

      {generalError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          {generalError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="status-name">Name *</Label>
        <Input id="status-name" autoFocus value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="In review" />
        {(nameError && name !== "") || fieldError(result, "name") ? (
          <p className="text-xs text-destructive">{fieldError(result, "name") ?? nameError}</p>
        ) : null}
      </div>

      <ColorPicker label="Colour" value={color} onChange={setColor} palette={ITEM_PALETTE} compact error={fieldError(result, "color")} />

      <div className="space-y-1.5">
        <Label htmlFor="status-kind">Kind</Label>
        <Select value={kind} onValueChange={(v) => setKind(v as StatusKind)}>
          <SelectTrigger id="status-kind" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KINDS.map((k) => (
              <SelectItem key={k.value} value={k.value}>
                {k.label} <span className="text-muted-foreground">· {k.hint}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
        <label htmlFor="status-roadmap" className="space-y-0.5">
          <span className="block text-sm font-medium">Roadmap column</span>
          <span className="block text-xs text-muted-foreground">Show posts with this status as a column on the roadmap.</span>
        </label>
        <Switch id="status-roadmap" checked={isRoadmapColumn} onCheckedChange={setIsRoadmapColumn} />
      </div>
      <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
        <label htmlFor="status-locks" className="space-y-0.5">
          <span className="block text-sm font-medium">Locks voting</span>
          <span className="block text-xs text-muted-foreground">Visitors can no longer vote on posts in this status.</span>
        </label>
        <Switch id="status-locks" checked={locksVoting} onCheckedChange={setLocksVoting} />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <StatusPill name={name.trim() || "Preview"} color={color} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={busy || Boolean(nameError)}>
            {busy && <Loader2 className="animate-spin" />}
            {editing ? "Save status" : "Create status"}
          </Button>
        </div>
      </div>
    </form>
  )
}
