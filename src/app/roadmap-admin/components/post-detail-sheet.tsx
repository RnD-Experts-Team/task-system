// Post detail sheet: edit content, status (with history), official response, tags, pin,
// moderation, merge, move and delete. Full-width on mobile.

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowRightLeft,
  Check,
  ExternalLink,
  FileText,
  GitMerge,
  Loader2,
  MessageSquare,
  Pin,
  ShieldAlert,
  ThumbsUp,
  Trash2,
  Undo2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAdminPost } from "../hooks/useAdminPost"
import { useBoardDetail } from "../hooks/useBoards"
import { useRoadmapPermissions } from "../hooks/useRoadmapPermissions"
import { usePostsStore } from "../store/postsStore"
import type { AdminPostDetail, ModerationState } from "../types"
import { formatDateTime, plural } from "../utils/format"
import { ChangeStatusDialog } from "./change-status-dialog"
import { ConfirmDialog } from "./confirm-dialog"
import { ErrorState } from "./error-state"
import { MergePostDialog } from "./merge-post-dialog"
import { ModerationBadge } from "./moderation-badge"
import { MovePostDialog } from "./move-post-dialog"
import { ActivityHeading, StatusHistory, VotesByIp } from "./post-activity"
import { PostResponseEditor } from "./post-response-editor"
import { StatusPill } from "./status-pill"
import { TagPicker } from "./tag-picker"
import { VisitorSummary } from "./visitor-summary"

type PostDetailSheetProps = {
  postId: number | null
  onClose: () => void
  /** Open another post in the sheet (after a merge) */
  onOpenPost: (id: number) => void
}

const editSchema = z.object({
  title: z.string().trim().min(3, "Title needs at least 3 characters").max(140, "Title must be 140 characters or less"),
  author_name: z.string().trim().max(40, "Name must be 40 characters or less"),
  body: z.string().max(5000, "Body must be 5000 characters or less"),
})
type EditValues = z.infer<typeof editSchema>

export function PostDetailSheet({ postId, onClose, onOpenPost }: PostDetailSheetProps) {
  const { post, loading, error, refetch } = useAdminPost(postId)

  return (
    <Sheet open={postId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {loading || (!post && !error) ? (
          <>
            <SheetHeader className="border-b pe-12">
              <SheetTitle>Post</SheetTitle>
              <SheetDescription>Loading post details…</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 p-6">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </>
        ) : error && !post ? (
          <>
            <SheetHeader className="border-b pe-12">
              <SheetTitle>Post</SheetTitle>
              <SheetDescription>Something went wrong.</SheetDescription>
            </SheetHeader>
            <div className="p-6">
              <ErrorState message={error} onRetry={() => void refetch()} />
            </div>
          </>
        ) : post ? (
          <PostDetailBody key={post.id} post={post} onClose={onClose} onOpenPost={onOpenPost} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

function PostDetailBody({ post, onClose, onOpenPost }: { post: AdminPostDetail; onClose: () => void; onOpenPost: (id: number) => void }) {
  const { canManage, canModerate } = useRoadmapPermissions()
  const { statuses, tags } = useBoardDetail(post.board.id)
  const mutating = usePostsStore((s) => s.mutating)
  const updatePost = usePostsStore((s) => s.updatePost)
  const moderatePost = usePostsStore((s) => s.moderatePost)
  const changeStatus = usePostsStore((s) => s.changeStatus)
  const setResponse = usePostsStore((s) => s.setResponse)
  const clearResponse = usePostsStore((s) => s.clearResponse)
  const pinPost = usePostsStore((s) => s.pinPost)
  const syncTags = usePostsStore((s) => s.syncTags)
  const movePost = usePostsStore((s) => s.movePost)
  const deletePost = usePostsStore((s) => s.deletePost)

  const [statusOpen, setStatusOpen] = useState(false)
  const [mergeOpen, setMergeOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    // `values` re-syncs the form whenever the server copy changes (after save / refetch)
    values: { title: post.title, author_name: post.author_name ?? "", body: post.body ?? "" },
  })

  async function saveContent(values: EditValues) {
    const result = await updatePost(post.id, {
      title: values.title,
      body: values.body.trim() ? values.body : null,
      author_name: values.author_name.trim() ? values.author_name.trim() : null,
    })
    if (result.ok) reset(values)
  }

  async function moderate(state: ModerationState) {
    const previous = post.moderation_state
    const result = await moderatePost(post.id, { state })
    if (result.ok && state !== "approved") {
      toast.success(`Post ${state === "pending" ? "moved back to pending" : state === "spam" ? "marked as spam" : state}`, {
        action: {
          label: "Undo",
          onClick: () => void moderatePost(post.id, { state: previous }),
        },
      })
    } else if (result.ok) {
      toast.success("Post approved", {
        action: { label: "Undo", onClick: () => void moderatePost(post.id, { state: previous }) },
      })
    }
  }

  const tagIds = post.tags.map((t) => t.id)
  const editable = canManage
  const moderationButtons: { state: ModerationState; label: string; icon: typeof Check; variant: "default" | "outline" | "destructive" }[] = [
    { state: "approved", label: "Approve", icon: Check, variant: "default" },
    { state: "rejected", label: "Reject", icon: X, variant: "outline" },
    { state: "spam", label: "Spam", icon: ShieldAlert, variant: "destructive" },
    { state: "pending", label: "Back to pending", icon: Undo2, variant: "outline" },
  ]

  return (
    <>
      {/* ── Header ── */}
      <SheetHeader className="border-b pb-4 pe-12">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <SheetTitle className="text-lg leading-snug break-words">{post.title}</SheetTitle>
            <SheetDescription asChild>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs">
                  {post.board.name} #{post.number}
                </span>
                <ModerationBadge state={post.moderation_state} />
                <StatusPill name={post.status.name} color={post.status.color} />
                {post.is_pinned && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Pin className="size-3" /> Pinned
                  </span>
                )}
              </div>
            </SheetDescription>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 tabular-nums">
                <ThumbsUp className="size-3" /> {plural(post.votes_count, "vote")}
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <MessageSquare className="size-3" /> {plural(post.comments_count, "comment")}
                {post.pending_comments_count > 0 && ` (${post.pending_comments_count} pending)`}
              </span>
              <a
                href={post.public_url_path}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline-offset-2 hover:text-foreground hover:underline"
              >
                <ExternalLink className="size-3" /> Public page
              </a>
            </div>
          </div>
        </div>
      </SheetHeader>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="response">Response{post.response_md ? " •" : ""}</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Details */}
          <TabsContent value="details" className="space-y-6 pt-4">
            <Section title="Content">
              <form onSubmit={handleSubmit(saveContent)} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="post-title">Title</Label>
                  <Input id="post-title" disabled={!editable || mutating} aria-invalid={Boolean(errors.title) || undefined} {...register("title")} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="post-author">Author name</Label>
                  <Input id="post-author" placeholder="Anonymous" disabled={!editable || mutating} {...register("author_name")} />
                  {errors.author_name && <p className="text-xs text-destructive">{errors.author_name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="post-body">Body</Label>
                  <Textarea id="post-body" rows={6} disabled={!editable || mutating} className="min-h-32" {...register("body")} />
                  {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
                </div>
                {editable && (
                  <div className="flex gap-2">
                    <Button type="submit" size="lg" disabled={!isDirty || mutating}>
                      {mutating && <Loader2 className="animate-spin" />}
                      Save changes
                    </Button>
                    {isDirty && (
                      <Button type="button" variant="ghost" size="lg" onClick={() => reset()} disabled={mutating}>
                        Reset
                      </Button>
                    )}
                  </div>
                )}
              </form>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Submitted {formatDateTime(post.created_at)}</span>
                <span aria-hidden>·</span>
                <VisitorSummary visitor={post.visitor} createdByAdmin={post.created_by_admin} />
              </div>
              {post.flags.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400">Flags: {post.flags.join(", ")}</p>
              )}
            </Section>

            <Separator />

            <Section
              title="Status"
              aside={
                editable && (
                  <Button size="lg" variant="outline" onClick={() => setStatusOpen(true)} disabled={mutating}>
                    Change status
                  </Button>
                )
              }
            >
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill name={post.status.name} color={post.status.color} />
                <label className="ms-auto flex items-center gap-2 text-sm">
                  <Pin className="size-3.5 text-muted-foreground" />
                  Pin to top
                  <Switch
                    checked={post.is_pinned}
                    disabled={!editable || mutating}
                    onCheckedChange={(checked) => void pinPost(post.id, checked)}
                    aria-label="Pin to top"
                  />
                </label>
              </div>
            </Section>

            <Section title="Tags">
              <TagPicker
                tags={tags}
                selectedIds={tagIds}
                disabled={!editable || mutating}
                onToggle={(id) => void syncTags(post.id, tagIds.includes(id) ? tagIds.filter((t) => t !== id) : [...tagIds, id])}
              />
            </Section>

            {canModerate && (
              <>
                <Separator />
                <Section title="Moderation" aside={<ModerationBadge state={post.moderation_state} />}>
                  <div className="flex flex-wrap gap-2">
                    {moderationButtons
                      .filter((b) => b.state !== post.moderation_state)
                      .map((b) => (
                        <Button key={b.state} size="lg" variant={b.variant} className="gap-1.5" disabled={mutating} onClick={() => void moderate(b.state)}>
                          <b.icon />
                          {b.label}
                        </Button>
                      ))}
                  </div>
                  {post.moderation_reason && <p className="text-xs text-muted-foreground">Reason: {post.moderation_reason}</p>}
                </Section>
              </>
            )}

            {post.merged_from.length > 0 && (
              <>
                <Separator />
                <Section title="Merged into this post">
                  <ul className="space-y-1 text-sm">
                    {post.merged_from.map((m) => (
                      <li key={m.id} className="flex gap-2">
                        <span className="font-mono text-xs text-muted-foreground">#{m.number}</span>
                        <span className="truncate">{m.title}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              </>
            )}

            {editable && (
              <>
                <Separator />
                <Section title="Manage">
                  <div className="flex flex-wrap gap-2">
                    <Button size="lg" variant="outline" className="gap-1.5" disabled={mutating} onClick={() => setMergeOpen(true)}>
                      <GitMerge />
                      Merge into…
                    </Button>
                    <Button size="lg" variant="outline" className="gap-1.5" disabled={mutating} onClick={() => setMoveOpen(true)}>
                      <ArrowRightLeft />
                      Move to board…
                    </Button>
                    <Button size="lg" variant="destructive" className="ms-auto gap-1.5" disabled={mutating} onClick={() => setDeleteOpen(true)}>
                      <Trash2 />
                      Delete
                    </Button>
                  </div>
                </Section>
              </>
            )}
          </TabsContent>

          {/* Response */}
          <TabsContent value="response" className="pt-4">
            <PostResponseEditor
              post={post}
              canEdit={editable}
              busy={mutating}
              onSave={async (md) => (await setResponse(post.id, md)).ok}
              onClear={async () => (await clearResponse(post.id)).ok}
            />
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity" className="space-y-6 pt-4">
            <div>
              <ActivityHeading>Status history</ActivityHeading>
              <StatusHistory history={post.status_history} />
            </div>
            <Separator />
            <div>
              <ActivityHeading>Votes by network</ActivityHeading>
              <VotesByIp votes={post.votes_by_ip} total={post.votes_count} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Dialogs ── */}
      <ChangeStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        post={post}
        statuses={statuses}
        busy={mutating}
        onSubmit={async (payload) => (await changeStatus(post.id, payload)).ok}
      />
      <MergePostDialog open={mergeOpen} onOpenChange={setMergeOpen} post={post} onMerged={(target) => onOpenPost(target.id)} />
      <MovePostDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        post={post}
        busy={mutating}
        onSubmit={async (boardId, statusId) => (await movePost(post.id, boardId, statusId)).ok}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this post?"
        description="The post, its votes and its comments are permanently deleted. To keep the votes, merge it into another post instead."
        confirmLabel="Delete post"
        destructive
        busy={mutating}
        onConfirm={async () => {
          const result = await deletePost(post.id)
          if (result.ok) {
            setDeleteOpen(false)
            onClose()
          }
        }}
      />
    </>
  )
}
