import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useBoardsStore } from "../store/boardsStore"
import { fieldError, type MutationResult } from "../utils/mutation"
import type { AdminBoard, BoardPayload, VotingMode } from "../types"

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name must be 80 characters or less"),
  slug: z
    .string()
    .trim()
    .max(64, "Slug must be 64 characters or less")
    .refine((v) => v === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), "Use lowercase letters, numbers and single hyphens"),
  description: z.string().max(500, "Description must be 500 characters or less"),
  icon: z.string().trim().max(32, "Icon must be 32 characters or less"),
  voting_mode: z.enum(["anonymous", "verified_email"]),
  allow_submissions: z.boolean(),
  allow_comments: z.boolean(),
  allow_votes: z.boolean(),
  require_post_approval: z.boolean(),
  require_comment_approval: z.boolean(),
  is_archived: z.boolean(),
  trust_after_approved: z
    .string()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 50), "Enter a whole number from 1 to 50, or leave empty"),
})
type FormValues = z.infer<typeof schema>

type BoardFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Board to edit; null creates a new one */
  board: AdminBoard | null
  onSaved: (board: AdminBoard) => void
}

const VOTING_LABEL: Record<VotingMode, string> = {
  anonymous: "Anonymous (no sign-in)",
  verified_email: "Verified email",
}

export function BoardFormDialog({ open, onOpenChange, board, onSaved }: BoardFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-xl overflow-y-auto">
        {open && <BoardForm board={board} onClose={() => onOpenChange(false)} onSaved={onSaved} />}
      </DialogContent>
    </Dialog>
  )
}

function ToggleRow({ id, label, hint, checked, onChange }: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <label htmlFor={id} className="space-y-0.5">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function BoardForm({ board, onClose, onSaved }: { board: AdminBoard | null; onClose: () => void; onSaved: (board: AdminBoard) => void }) {
  const createBoard = useBoardsStore((s) => s.createBoard)
  const updateBoard = useBoardsStore((s) => s.updateBoard)
  const [serverResult, setServerResult] = useState<MutationResult<AdminBoard> | null>(null)
  const editing = board !== null

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: board?.name ?? "",
      slug: board?.slug ?? "",
      description: board?.description ?? "",
      icon: board?.icon ?? "",
      voting_mode: board?.voting_mode ?? "anonymous",
      allow_submissions: board?.allow_submissions ?? true,
      allow_comments: board?.allow_comments ?? true,
      allow_votes: board?.allow_votes ?? true,
      require_post_approval: board?.require_post_approval ?? true,
      require_comment_approval: board?.require_comment_approval ?? true,
      is_archived: board?.is_archived ?? false,
      trust_after_approved: board?.trust_after_approved != null ? String(board.trust_after_approved) : "3",
    },
  })

  async function submit(values: FormValues) {
    const payload: BoardPayload = {
      name: values.name.trim(),
      // Empty slug on create = let the server derive it; on edit keep the current one unless changed
      slug: values.slug || (editing ? board?.slug : null),
      description: values.description.trim() || null,
      icon: values.icon || null,
      is_archived: values.is_archived,
      voting_mode: values.voting_mode,
      allow_submissions: values.allow_submissions,
      allow_comments: values.allow_comments,
      allow_votes: values.allow_votes,
      require_post_approval: values.require_post_approval,
      require_comment_approval: values.require_comment_approval,
      trust_after_approved: values.trust_after_approved === "" ? null : Number(values.trust_after_approved),
    }
    const result = editing ? await updateBoard(board.id, payload) : await createBoard(payload)
    setServerResult(result)
    if (result.ok) {
      onSaved(result.data)
      onClose()
    }
  }

  const err = (field: string, local?: string) => local ?? fieldError(serverResult, field)
  const generalError = serverResult && !serverResult.ok && Object.keys(serverResult.errors).length === 0 ? serverResult.message : null

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5 p-5">
      <DialogHeader>
        <DialogTitle>{editing ? "Edit board" : "New board"}</DialogTitle>
        <DialogDescription>
          {editing ? "Changing the slug keeps the old public link working through a redirect." : "New boards start with five statuses you can customise afterwards."}
        </DialogDescription>
      </DialogHeader>

      {generalError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          <AlertCircle className="size-4 shrink-0" />
          {generalError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="board-name">Name *</Label>
          <Input id="board-name" autoFocus placeholder="Mobile app" aria-invalid={Boolean(err("name", errors.name?.message)) || undefined} {...register("name")} />
          {err("name", errors.name?.message) && <p className="text-xs text-destructive">{err("name", errors.name?.message)}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="board-slug">Slug</Label>
          <Input id="board-slug" placeholder="auto from name" className="font-mono" aria-invalid={Boolean(err("slug", errors.slug?.message)) || undefined} {...register("slug")} />
          {err("slug", errors.slug?.message) ? (
            <p className="text-xs text-destructive">{err("slug", errors.slug?.message)}</p>
          ) : (
            <p className="text-xs text-muted-foreground">/roadmap/&lt;slug&gt;</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="board-description">Description</Label>
        <Textarea id="board-description" className="min-h-16" placeholder="Shown under the board name on the public site." {...register("description")} />
        {err("description", errors.description?.message) && <p className="text-xs text-destructive">{err("description", errors.description?.message)}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="board-icon">Icon</Label>
          <Input id="board-icon" placeholder="An emoji or icon name" maxLength={32} {...register("icon")} />
          {err("icon", errors.icon?.message) && <p className="text-xs text-destructive">{err("icon", errors.icon?.message)}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="board-voting">Voting mode</Label>
          <Controller
            control={control}
            name="voting_mode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="board-voting" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(VOTING_LABEL) as VotingMode[]).map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {VOTING_LABEL[mode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <Controller
        control={control}
        name="voting_mode"
        render={({ field }) =>
          field.value === "verified_email" ? (
            <p className="-mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              Verified email is not active yet. It is reserved for a future release, so voting still works anonymously for now.
            </p>
          ) : (
            <p className="-mt-2 text-xs text-muted-foreground">Verified email voting is not active yet; every board votes anonymously today.</p>
          )
        }
      />

      <div className="space-y-2">
        <Controller control={control} name="allow_submissions" render={({ field }) => <ToggleRow id="board-submissions" label="Accept new ideas" hint="Visitors can suggest posts." checked={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="allow_votes" render={({ field }) => <ToggleRow id="board-votes" label="Allow voting" hint="Turn off to freeze vote counts." checked={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="allow_comments" render={({ field }) => <ToggleRow id="board-comments" label="Allow comments" hint="Visitors can discuss posts." checked={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="require_post_approval" render={({ field }) => <ToggleRow id="board-post-approval" label="Review new posts first" hint="Posts wait in Moderation until approved (trusted visitors skip this)." checked={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="require_comment_approval" render={({ field }) => <ToggleRow id="board-comment-approval" label="Review new comments first" hint="Comments wait in Moderation until approved." checked={field.value} onChange={field.onChange} />} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="board-trust">Trust threshold</Label>
        <Input id="board-trust" inputMode="numeric" className="w-28" placeholder="3" {...register("trust_after_approved")} />
        {err("trust_after_approved", errors.trust_after_approved?.message) ? (
          <p className="text-xs text-destructive">{err("trust_after_approved", errors.trust_after_approved?.message)}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Visitors with this many approved items are auto-approved. Empty uses the default.</p>
        )}
      </div>

      {editing && (
        <Controller control={control} name="is_archived" render={({ field }) => <ToggleRow id="board-archived" label="Archived" hint="Hidden from the public site. Posts are kept." checked={field.value} onChange={field.onChange} />} />
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {editing ? "Save board" : "Create board"}
        </Button>
      </div>
    </form>
  )
}
