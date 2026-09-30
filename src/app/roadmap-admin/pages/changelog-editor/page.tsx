// src/app/roadmap-admin/pages/changelog-editor/page.tsx
// Changelog editor for /roadmap-admin/changelog/new and /roadmap-admin/changelog/:id.
// Markdown textarea with debounced live preview, schedule picker, publish / unpublish and
// a "link posts" dialog.

import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AlertCircle, ArrowLeft, CalendarClock, Eye, EyeOff, Link2, Loader2, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { BoardSelect } from "../../components/board-select"
import { ChangelogLabelBadge, ChangelogStatusBadge } from "../../components/changelog-badges"
import { ConfirmDialog } from "../../components/confirm-dialog"
import { ErrorState } from "../../components/error-state"
import { LinkPostsDialog } from "../../components/link-posts-dialog"
import { MarkdownEditor } from "../../components/markdown-editor"
import { useChangelogEntry } from "../../hooks/useChangelog"
import { useRoadmapPermissions } from "../../hooks/useRoadmapPermissions"
import { useChangelogStore } from "../../store/changelogStore"
import { formatDateTime, fromDateTimeLocal, toDateTimeLocal } from "../../utils/format"
import { fieldError, type MutationResult } from "../../utils/mutation"
import type { AdminChangelogDetail, ChangelogLabel, ChangelogPayload } from "../../types"

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(140, "Title must be 140 characters or less"),
  label: z.enum(["new", "improved", "fixed"]),
  board_id: z.number().nullable(),
  summary: z.string().max(280, "Summary must be 280 characters or less"),
  body_md: z.string().trim().min(1, "Write the entry body").max(20000, "Body must be 20,000 characters or less"),
  published_at: z.string(),
})
type FormValues = z.infer<typeof schema>

const LABELS: { value: ChangelogLabel; text: string }[] = [
  { value: "new", text: "New" },
  { value: "improved", text: "Improved" },
  { value: "fixed", text: "Fixed" },
]

export default function RoadmapChangelogEditorPage() {
  const params = useParams()
  const id = params.id && /^\d+$/.test(params.id) ? Number(params.id) : null
  const { entry, loading, error, refetch } = useChangelogEntry(id)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-lg" aria-label="Back to changelog">
          <Link to="/roadmap-admin/changelog">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">{id ? "Edit entry" : "New entry"}</h2>
          {entry && <ChangelogStatusBadge entry={entry} />}
        </div>
      </div>

      {id && loading && !entry ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : id && error && !entry ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : (
        // Remount when switching entries (e.g. after the first save navigates to /:id)
        <EditorForm key={entry?.id ?? "new"} entry={entry} />
      )}
    </div>
  )
}

function EditorForm({ entry }: { entry: AdminChangelogDetail | null }) {
  const navigate = useNavigate()
  const { canManageChangelog } = useRoadmapPermissions()
  const createEntry = useChangelogStore((s) => s.createEntry)
  const updateEntry = useChangelogStore((s) => s.updateEntry)
  const publish = useChangelogStore((s) => s.publish)
  const unpublish = useChangelogStore((s) => s.unpublish)
  const remove = useChangelogStore((s) => s.remove)

  const [linkOpen, setLinkOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState<"save" | "publish" | "unpublish" | "delete" | null>(null)
  const [serverResult, setServerResult] = useState<MutationResult<AdminChangelogDetail> | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title ?? "",
      label: entry?.label ?? "new",
      board_id: entry?.board?.id ?? null,
      summary: entry?.summary ?? "",
      body_md: entry?.body_md ?? "",
      published_at: toDateTimeLocal(entry?.published_at),
    },
  })

  // "Now" is captured once per editor mount; good enough to label a date as future/scheduled
  const [mountedAt] = useState(() => Date.now())
  const publishedAtIso = fromDateTimeLocal(useWatch({ control, name: "published_at" }))
  const isFuture = publishedAtIso !== null && new Date(publishedAtIso).getTime() > mountedAt
  const isPublished = entry?.status === "published"
  const readOnly = !canManageChangelog

  function toPayload(values: FormValues): ChangelogPayload {
    return {
      title: values.title.trim(),
      label: values.label,
      board_id: values.board_id,
      summary: values.summary.trim() || null,
      body_md: values.body_md,
      published_at: fromDateTimeLocal(values.published_at),
    }
  }

  /** Save (create or update). Resolves the saved entry, or null on failure. */
  async function persist(values: FormValues): Promise<AdminChangelogDetail | null> {
    const payload = toPayload(values)
    const result = entry ? await updateEntry(entry.id, payload) : await createEntry(payload)
    setServerResult(result)
    if (!result.ok) return null
    reset(values)
    return result.data
  }

  async function onSave(values: FormValues) {
    setBusy("save")
    const saved = await persist(values)
    setBusy(null)
    if (saved && !entry) navigate(`/roadmap-admin/changelog/${saved.id}`, { replace: true })
  }

  async function onPublish(values: FormValues) {
    setBusy("publish")
    const saved = await persist(values)
    if (saved) {
      const published = await publish(saved.id, fromDateTimeLocal(values.published_at))
      if (published.ok && !entry) navigate(`/roadmap-admin/changelog/${saved.id}`, { replace: true })
    }
    setBusy(null)
  }

  async function onUnpublish() {
    if (!entry) return
    setBusy("unpublish")
    await unpublish(entry.id)
    setBusy(null)
  }

  async function onDelete() {
    if (!entry) return
    setBusy("delete")
    const result = await remove(entry.id)
    setBusy(null)
    if (result.ok) navigate("/roadmap-admin/changelog", { replace: true })
  }

  const err = (field: string, local?: string) => local ?? fieldError(serverResult, field)
  const generalError = serverResult && !serverResult.ok && Object.keys(serverResult.errors).length === 0 ? serverResult.message : null
  const working = busy !== null

  return (
    <form onSubmit={handleSubmit(onSave)} className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      {/* ── Content ── */}
      <div className="min-w-0 space-y-4">
        {generalError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
            <AlertCircle className="size-4 shrink-0" />
            {generalError}
          </div>
        )}
        <Card>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cl-title">Title *</Label>
              <Input id="cl-title" placeholder="Dark mode is here" disabled={readOnly} aria-invalid={Boolean(err("title", errors.title?.message)) || undefined} {...register("title")} />
              {err("title", errors.title?.message) && <p className="text-xs text-destructive">{err("title", errors.title?.message)}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cl-summary">Summary</Label>
              <Textarea id="cl-summary" className="min-h-16" maxLength={280} disabled={readOnly} placeholder="One or two sentences shown in lists and link previews." {...register("summary")} />
              {err("summary", errors.summary?.message) && <p className="text-xs text-destructive">{err("summary", errors.summary?.message)}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cl-body">Body (Markdown) *</Label>
              <Controller
                control={control}
                name="body_md"
                render={({ field }) => (
                  <MarkdownEditor
                    id="cl-body"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={20000}
                    heightClass="min-h-80"
                    disabled={readOnly}
                    invalid={Boolean(err("body_md", errors.body_md?.message))}
                    placeholder={"## What's new\n\n- Dark mode across the app\n- Faster search"}
                  />
                )}
              />
              {err("body_md", errors.body_md?.message) && <p className="text-xs text-destructive">{err("body_md", errors.body_md?.message)}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sidebar ── */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cl-label">Label</Label>
                <Controller
                  control={control}
                  name="label"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={readOnly}>
                      <SelectTrigger id="cl-label" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LABELS.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.text}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cl-board">Board</Label>
                <Controller
                  control={control}
                  name="board_id"
                  render={({ field }) => (
                    <BoardSelect id="cl-board" value={field.value} onChange={field.onChange} allLabel="All boards" className="w-full sm:w-full" disabled={readOnly} />
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cl-date" className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5" />
                Publish date
              </Label>
              <Input id="cl-date" type="datetime-local" disabled={readOnly} {...register("published_at")} />
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {isFuture
                  ? `Will go live on ${formatDateTime(publishedAtIso)} once published.`
                  : "Leave empty to publish immediately. A future date schedules the entry."}
              </p>
            </div>

            {entry && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <ChangelogLabelBadge label={entry.label} />
                <ChangelogStatusBadge entry={entry} />
                <span>Updated {formatDateTime(entry.updated_at)}</span>
              </div>
            )}

            {!readOnly && (
              <div className="flex flex-col gap-2">
                <Button type="submit" size="lg" variant="outline" className="gap-1.5" disabled={working || (!isDirty && Boolean(entry))}>
                  {busy === "save" ? <Loader2 className="animate-spin" /> : <Save />}
                  {entry ? "Save changes" : "Save as draft"}
                </Button>
                {(!isPublished || isDirty) && (
                  <Button type="button" size="lg" className="gap-1.5" disabled={working} onClick={handleSubmit(onPublish)}>
                    {busy === "publish" ? <Loader2 className="animate-spin" /> : isFuture ? <CalendarClock /> : <Eye />}
                    {isPublished ? "Save & keep published" : isFuture ? "Schedule" : "Publish now"}
                  </Button>
                )}
                {isPublished && (
                  <Button type="button" size="lg" variant="outline" className="gap-1.5" disabled={working} onClick={() => void onUnpublish()}>
                    {busy === "unpublish" ? <Loader2 className="animate-spin" /> : <EyeOff />}
                    Unpublish
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {entry && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Linked posts</CardTitle>
                <Badge variant="secondary">{entry.linked_posts?.length ?? entry.linked_posts_count}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {entry.linked_posts?.length ? (
                <ul className="space-y-1.5 text-sm">
                  {entry.linked_posts.map((p) => (
                    <li key={p.id} className="flex gap-2">
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">#{p.number}</span>
                      <span className="truncate">{p.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No requests linked yet.</p>
              )}
              {!readOnly && (
                <Button type="button" size="lg" variant="outline" className="w-full gap-1.5" onClick={() => setLinkOpen(true)}>
                  <Link2 />
                  Link posts…
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {entry && !readOnly && (
          <Button type="button" variant="ghost" size="lg" className="w-full text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)} disabled={working}>
            Delete entry
          </Button>
        )}
      </div>

      {entry && <LinkPostsDialog open={linkOpen} onOpenChange={setLinkOpen} entry={entry} />}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this entry?"
        description="It disappears from the public changelog and RSS feed. This cannot be undone."
        confirmLabel="Delete entry"
        destructive
        busy={busy === "delete"}
        onConfirm={onDelete}
      />
    </form>
  )
}
