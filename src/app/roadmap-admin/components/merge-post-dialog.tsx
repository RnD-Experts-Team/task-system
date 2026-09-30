import { useEffect, useState } from "react"
import { isCancel } from "axios"
import { AlertTriangle, ArrowRight, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useDebouncedValue } from "../hooks/useDebouncedValue"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { usePostsStore } from "../store/postsStore"
import type { AdminPostDetail, AdminPostListItem, MergePreview } from "../types"
import { plural } from "../utils/format"

type MergePostDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: AdminPostDetail
  onMerged: (target: AdminPostListItem) => void
}

/** Merge this post into another one: search a target, preview the counts, confirm. */
export function MergePostDialog({ open, onOpenChange, post, onMerged }: MergePostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {open && <MergeForm post={post} onClose={() => onOpenChange(false)} onMerged={onMerged} />}
      </DialogContent>
    </Dialog>
  )
}

function MergeForm({ post, onClose, onMerged }: { post: AdminPostDetail; onClose: () => void; onMerged: (t: AdminPostListItem) => void }) {
  const previewMerge = usePostsStore((s) => s.previewMerge)
  const mergePost = usePostsStore((s) => s.mergePost)

  const [query, setQuery] = useState("")
  const debounced = useDebouncedValue(query.trim(), 300)
  const [results, setResults] = useState<AdminPostListItem[]>([])
  const [searching, setSearching] = useState(false)
  const [target, setTarget] = useState<AdminPostListItem | null>(null)
  const [preview, setPreview] = useState<MergePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [merging, setMerging] = useState(false)

  // Search targets on the same board (merge requires it)
  useEffect(() => {
    let cancelled = false
    void (async () => {
      setSearching(true)
      try {
        const res = await roadmapAdminService.listPosts({
          board_id: post.board.id,
          q: debounced || undefined,
          moderation_state: "approved",
          sort: "votes",
          per_page: 8,
        })
        if (!cancelled) setResults(res.data.filter((p) => p.id !== post.id && p.merged_into_post_id === null))
      } catch (err) {
        if (!isCancel(err) && !cancelled) setResults([])
      } finally {
        if (!cancelled) setSearching(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debounced, post.board.id, post.id])

  async function choose(candidate: AdminPostListItem) {
    setTarget(candidate)
    setPreview(null)
    setPreviewError(null)
    setPreviewLoading(true)
    const result = await previewMerge(post.id, candidate.id)
    setPreviewLoading(false)
    if (result.ok) setPreview(result.data)
    else setPreviewError(result.message || "Couldn't preview this merge.")
  }

  async function confirm() {
    if (!target) return
    setMerging(true)
    const result = await mergePost(post.id, target.id)
    setMerging(false)
    if (result.ok) {
      onMerged(target)
      onClose()
    }
  }

  return (
    <div className="space-y-4 p-5">
      <DialogHeader>
        <DialogTitle>Merge into another post</DialogTitle>
        <DialogDescription>
          Votes and comments of “{post.title}” move to the target. This post is then hidden and its link redirects to the target.
        </DialogDescription>
      </DialogHeader>

      <div className="relative">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts on this board…"
          className="ps-8"
          aria-label="Search target post"
          autoFocus
        />
      </div>

      <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-1" aria-label="Target posts">
        {searching && results.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : results.length === 0 ? (
          <li className="p-3 text-center text-sm text-muted-foreground">No matching posts.</li>
        ) : (
          results.map((candidate) => (
            <li key={candidate.id}>
              <button
                type="button"
                onClick={() => void choose(candidate)}
                aria-pressed={target?.id === candidate.id}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                  target?.id === candidate.id && "bg-primary/10"
                )}
              >
                <span className="min-w-0 flex-1 truncate font-medium">{candidate.title}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">#{candidate.number}</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{plural(candidate.votes_count, "vote")}</span>
              </button>
            </li>
          ))
        )}
      </ul>

      {target && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3" aria-live="polite">
          {previewLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : previewError ? (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="size-4" />
              {previewError}
            </p>
          ) : preview ? (
            <>
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="truncate">#{post.number}</span>
                <ArrowRight className="size-3.5 shrink-0" />
                <span className="truncate">
                  #{target.number} {target.title}
                </span>
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Votes moving</dt>
                <dd className="text-end font-medium tabular-nums">{preview.votes_moving}</dd>
                <dt className="text-muted-foreground">Voters on both</dt>
                <dd className="text-end font-medium tabular-nums">{preview.overlapping_voters}</dd>
                <dt className="text-muted-foreground">Comments moving</dt>
                <dd className="text-end font-medium tabular-nums">{preview.comments_moving}</dd>
                <dt className="text-muted-foreground">Target votes after</dt>
                <dd className="text-end font-semibold tabular-nums">{preview.target_votes_after}</dd>
              </dl>
            </>
          ) : null}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={onClose} disabled={merging}>
          Cancel
        </Button>
        <Button size="lg" onClick={() => void confirm()} disabled={!target || !preview || merging}>
          {merging && <Loader2 className="animate-spin" />}
          Merge posts
        </Button>
      </div>
    </div>
  )
}
