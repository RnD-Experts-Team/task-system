import { useState } from "react"
import { EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useVisitorsStore } from "../store/visitorsStore"
import type { AdminVisitor } from "../types"

type BanVisitorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitor: AdminVisitor
}

export function BanVisitorDialog({ open, onOpenChange, visitor }: BanVisitorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">{open && <BanForm visitor={visitor} onClose={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

function BanForm({ visitor, onClose }: { visitor: AdminVisitor; onClose: () => void }) {
  const ban = useVisitorsStore((s) => s.ban)
  const [reason, setReason] = useState("")
  const [removeContent, setRemoveContent] = useState(false)
  const [removeVotes, setRemoveVotes] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    const result = await ban(visitor.id, { reason: reason.trim() || null, remove_content: removeContent, remove_votes: removeVotes })
    setBusy(false)
    if (result.ok) onClose()
  }

  return (
    <div className="space-y-4 p-5">
      <DialogHeader>
        <DialogTitle>Ban this visitor?</DialogTitle>
        <DialogDescription>
          Visitor <span className="font-mono">{visitor.id.slice(0, 8)}</span> will be shadow-banned.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-start gap-2.5 rounded-lg border bg-muted/40 p-3 text-sm">
        <EyeOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p>
          A shadow ban is silent: the visitor is <strong>not notified</strong> and still sees normal success messages, but everything they
          post, comment or vote from now on is silently ignored. This makes it hard for them to notice and switch identity.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ban-reason">Reason (internal)</Label>
        <Textarea id="ban-reason" value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} className="min-h-16" placeholder="e.g. Promotional spam" />
      </div>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <Checkbox checked={removeContent} onCheckedChange={(c) => setRemoveContent(c === true)} className="mt-0.5" />
          <span>
            Also remove their posts and comments
            <span className="block text-xs text-muted-foreground">{visitor.posts_count} posts, {visitor.comments_count} comments</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <Checkbox checked={removeVotes} onCheckedChange={(c) => setRemoveVotes(c === true)} className="mt-0.5" />
          <span>
            Also remove their votes
            <span className="block text-xs text-muted-foreground">{visitor.votes_count} votes; counts on posts are recalculated</span>
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="destructive" size="lg" onClick={() => void submit()} disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          Ban visitor
        </Button>
      </div>
    </div>
  )
}
