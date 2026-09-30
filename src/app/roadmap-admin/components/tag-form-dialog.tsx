import { useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBoardsStore } from "../store/boardsStore"
import { fieldError, type MutationResult } from "../utils/mutation"
import { ITEM_PALETTE } from "../utils/palette"
import type { AdminTag } from "../types"
import { ColorPicker } from "./color-picker"
import { TagChip } from "./status-pill"

type TagFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: number
  tag: AdminTag | null
}

export function TagFormDialog({ open, onOpenChange, boardId, tag }: TagFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">{open && <TagForm boardId={boardId} tag={tag} onClose={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function TagForm({ boardId, tag, onClose }: { boardId: number; tag: AdminTag | null; onClose: () => void }) {
  const createTag = useBoardsStore((s) => s.createTag)
  const updateTag = useBoardsStore((s) => s.updateTag)
  const editing = tag !== null
  const [name, setName] = useState(tag?.name ?? "")
  const [color, setColor] = useState(tag?.color ?? ITEM_PALETTE[9])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<MutationResult<AdminTag> | null>(null)

  const nameError = name.trim() === "" ? "Name is required" : name.length > 40 ? "Name must be 40 characters or less" : undefined

  async function submit() {
    if (nameError) return
    setBusy(true)
    const payload = { name: name.trim(), color }
    const res = editing ? await updateTag(boardId, tag.id, payload) : await createTag(boardId, payload)
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
        <DialogTitle>{editing ? "Edit tag" : "New tag"}</DialogTitle>
        <DialogDescription>Tags help visitors filter the board, and you triage faster.</DialogDescription>
      </DialogHeader>
      {generalError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          {generalError}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="tag-name">Name *</Label>
        <Input id="tag-name" autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Integrations" />
        {(nameError && name !== "") || fieldError(result, "name") ? <p className="text-xs text-destructive">{fieldError(result, "name") ?? nameError}</p> : null}
      </div>
      <ColorPicker label="Colour" value={color} onChange={setColor} palette={ITEM_PALETTE} compact error={fieldError(result, "color")} />
      <div className="flex items-center justify-between gap-2 pt-1">
        <TagChip name={name.trim() || "Preview"} color={color} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={busy || Boolean(nameError)}>
            {busy && <Loader2 className="animate-spin" />}
            {editing ? "Save tag" : "Create tag"}
          </Button>
        </div>
      </div>
    </form>
  )
}
