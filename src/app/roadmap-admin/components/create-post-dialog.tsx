import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePostsStore } from "../store/postsStore"
import { fieldError, type MutationResult } from "../utils/mutation"
import type { AdminPostDetail } from "../types"
import { BoardSelect } from "./board-select"

type CreatePostDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultBoardId: number | null
  onCreated: (post: AdminPostDetail) => void
}

/** Team-created post (published straight away by the backend). */
export function CreatePostDialog({ open, onOpenChange, defaultBoardId, onCreated }: CreatePostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && <CreateForm defaultBoardId={defaultBoardId} onClose={() => onOpenChange(false)} onCreated={onCreated} />}
      </DialogContent>
    </Dialog>
  )
}

function CreateForm({ defaultBoardId, onClose, onCreated }: Pick<CreatePostDialogProps, "defaultBoardId" | "onCreated"> & { onClose: () => void }) {
  const createPost = usePostsStore((s) => s.createPost)
  const [boardId, setBoardId] = useState<number | null>(defaultBoardId)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<MutationResult<AdminPostDetail> | null>(null)

  async function submit() {
    if (!boardId) return
    setBusy(true)
    const res = await createPost({ board_id: boardId, title: title.trim(), body: body.trim() || null })
    setBusy(false)
    setResult(res)
    if (res.ok) {
      onCreated(res.data)
      onClose()
    }
  }

  const titleError = fieldError(result, "title")
  const valid = boardId !== null && title.trim().length >= 3

  return (
    <div className="space-y-4 p-5">
      <DialogHeader>
        <DialogTitle>New post</DialogTitle>
        <DialogDescription>Add a request on behalf of the team, for example from a customer call.</DialogDescription>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label htmlFor="new-post-board">Board</Label>
        <BoardSelect id="new-post-board" value={boardId} onChange={setBoardId} allLabel={null} className="w-full sm:w-full" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-post-title">Title</Label>
        <Input id="new-post-title" value={title} maxLength={140} onChange={(e) => setTitle(e.target.value)} aria-invalid={Boolean(titleError) || undefined} />
        {titleError && <p className="text-xs text-destructive">{titleError}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-post-body">Details (optional)</Label>
        <Textarea id="new-post-body" value={body} maxLength={5000} onChange={(e) => setBody(e.target.value)} className="min-h-28" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button size="lg" onClick={() => void submit()} disabled={!valid || busy}>
          {busy && <Loader2 className="animate-spin" />}
          Create post
        </Button>
      </div>
    </div>
  )
}
