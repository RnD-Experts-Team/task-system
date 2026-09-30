import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { formatDateTime } from "../utils/format"
import type { AdminPostDetail } from "../types"
import { ConfirmDialog } from "./confirm-dialog"
import { MarkdownEditor } from "./markdown-editor"

type PostResponseEditorProps = {
  post: AdminPostDetail
  canEdit: boolean
  busy: boolean
  onSave: (bodyMd: string) => Promise<boolean>
  onClear: () => Promise<boolean>
}

const MAX = 10000

/** Official team response: markdown editor with live server-rendered preview. */
export function PostResponseEditor({ post, canEdit, busy, onSave, onClear }: PostResponseEditorProps) {
  const saved = post.response_md ?? ""
  const [draft, setDraft] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const value = draft ?? saved
  const dirty = draft !== null && draft !== saved

  async function save() {
    const ok = await onSave(value.trim())
    if (ok) setDraft(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="response-md">Official response</Label>
        {post.responded_at && (
          <span className="text-xs text-muted-foreground">Last published {formatDateTime(post.responded_at)}</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Shown publicly under the post with a team badge. Supports Markdown; links open in a new tab.
      </p>

      <MarkdownEditor
        id="response-md"
        layout="tabs"
        value={value}
        onChange={setDraft}
        maxLength={MAX}
        disabled={!canEdit || busy}
        placeholder="Thanks for the suggestion! We're planning to…"
        heightClass="min-h-52"
      />

      {canEdit && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="lg" onClick={() => void save()} disabled={busy || !dirty || !value.trim()}>
            {busy && <Loader2 className="animate-spin" />}
            {post.response_md ? "Update response" : "Publish response"}
          </Button>
          {dirty && (
            <Button variant="ghost" size="lg" onClick={() => setDraft(null)} disabled={busy}>
              Discard changes
            </Button>
          )}
          {post.response_md && (
            <Button variant="destructive" size="lg" className="ms-auto gap-1.5" onClick={() => setConfirmClear(true)} disabled={busy}>
              <Trash2 />
              Remove
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Remove the official response?"
        description="The response disappears from the public post. You can write a new one at any time."
        confirmLabel="Remove response"
        destructive
        busy={busy}
        onConfirm={async () => {
          const ok = await onClear()
          if (ok) {
            setConfirmClear(false)
            setDraft(null)
          }
        }}
      />
    </div>
  )
}
