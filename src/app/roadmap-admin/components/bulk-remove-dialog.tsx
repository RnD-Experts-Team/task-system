import { useState } from "react"
import { Check, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useVisitorsStore } from "../store/visitorsStore"
import { fieldError, type MutationResult } from "../utils/mutation"
import type { BulkRemovePayload, BulkRemoveResult } from "../types"

type Target = { by: BulkRemovePayload["by"]; value: string }

type BulkRemoveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Prefilled target (from a visitor sheet, the overview panel, ...) */
  initial?: Target | null
}

const KINDS: { value: BulkRemovePayload["remove"][number]; label: string }[] = [
  { value: "votes", label: "Votes" },
  { value: "posts", label: "Posts" },
  { value: "comments", label: "Comments" },
]

/** Bulk-remove everything from a visitor or an ip hash; shows the returned counts. */
export function BulkRemoveDialog({ open, onOpenChange, initial }: BulkRemoveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-md overflow-y-auto">
        {open && <BulkForm initial={initial ?? null} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function BulkForm({ initial, onClose }: { initial: Target | null; onClose: () => void }) {
  const bulkRemove = useVisitorsStore((s) => s.bulkRemove)
  const [by, setBy] = useState<Target["by"]>(initial?.by ?? "visitor")
  const [value, setValue] = useState(initial?.value ?? "")
  const [remove, setRemove] = useState<BulkRemovePayload["remove"]>(["votes", "posts", "comments"])
  const [ban, setBan] = useState(false)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<MutationResult<BulkRemoveResult> | null>(null)

  async function submit() {
    setBusy(true)
    const result = await bulkRemove({ by, value: value.trim(), remove, ban, reason: ban ? reason.trim() || null : null })
    setBusy(false)
    setOutcome(result)
  }

  if (outcome?.ok) {
    const r = outcome.data
    const rows = [
      ["Votes removed", r.votes_removed],
      ["Posts removed", r.posts_removed],
      ["Comments removed", r.comments_removed],
      ["Visitors banned", r.visitors_banned],
    ] as const
    return (
      <div className="space-y-4 p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="size-4 text-emerald-600" />
            Bulk removal complete
          </DialogTitle>
          <DialogDescription>Affected posts had their counters recalculated.</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-2">
          {rows.map(([label, count]) => (
            <div key={label} className="rounded-lg border p-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-2xl font-bold tabular-nums">{count}</dd>
            </div>
          ))}
        </dl>
        <div className="flex justify-end">
          <Button size="lg" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    )
  }

  const valueError = fieldError(outcome, "value")
  const canSubmit = value.trim() !== "" && remove.length > 0
  const generalError = outcome && !outcome.ok && Object.keys(outcome.errors).length === 0 ? outcome.message : null

  return (
    <div className="space-y-4 p-5">
      <DialogHeader>
        <DialogTitle>Bulk remove</DialogTitle>
        <DialogDescription>
          Remove content in one go by visitor or by network (IP hash). Votes are deleted; posts and comments are hidden as spam.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5">
        <Label>Remove everything from</Label>
        <ToggleGroup type="single" variant="outline" value={by} onValueChange={(v) => v && setBy(v as Target["by"])} className="w-full">
          <ToggleGroupItem value="visitor" className="flex-1">
            One visitor
          </ToggleGroupItem>
          <ToggleGroupItem value="ip_hash" className="flex-1">
            A network (IP hash)
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bulk-value">{by === "visitor" ? "Visitor ID" : "IP hash"}</Label>
        <Input id="bulk-value" value={value} onChange={(e) => setValue(e.target.value)} className="font-mono" placeholder={by === "visitor" ? "01HXYZ…" : "32-character hash"} aria-invalid={Boolean(valueError) || undefined} spellCheck={false} />
        {valueError && <p className="text-xs text-destructive">{valueError}</p>}
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-medium">What to remove</legend>
        <div className="flex flex-wrap gap-4">
          {KINDS.map((k) => (
            <label key={k.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={remove.includes(k.value)}
                onCheckedChange={(c) => setRemove((prev) => (c === true ? [...prev, k.value] : prev.filter((x) => x !== k.value)))}
              />
              {k.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2 rounded-lg border p-3">
        <label className="flex items-center justify-between gap-3">
          <span className="space-y-0.5">
            <span className="block text-sm font-medium">Also ban {by === "visitor" ? "the visitor" : "every visitor on this network"}</span>
            <span className="block text-xs text-muted-foreground">Silent shadow ban: they are not notified.</span>
          </span>
          <Switch checked={ban} onCheckedChange={setBan} aria-label="Also ban" />
        </label>
        {ban && (
          <Input value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} placeholder="Reason (internal, optional)" aria-label="Ban reason" />
        )}
      </div>

      {generalError && (
        <p className="text-sm text-destructive" role="alert">
          {generalError}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button variant="destructive" size="lg" className="gap-1.5" onClick={() => void submit()} disabled={!canSubmit || busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Trash2 />}
          Remove content
        </Button>
      </div>
    </div>
  )
}
