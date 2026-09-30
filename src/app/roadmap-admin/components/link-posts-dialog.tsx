import { useEffect, useState } from "react"
import { isCancel } from "axios"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useBoardDetail } from "../hooks/useBoards"
import { useDebouncedValue } from "../hooks/useDebouncedValue"
import { roadmapAdminService } from "../services/roadmapAdminService"
import { useChangelogStore } from "../store/changelogStore"
import type { AdminChangelogDetail, AdminPostListItem } from "../types"
import { BoardSelect } from "./board-select"
import { StatusPill } from "./status-pill"

type LinkedPost = AdminChangelogDetail["linked_posts"][number]

type LinkPostsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: AdminChangelogDetail
}

const KEEP = "keep"

/** Link shipped requests to a changelog entry, optionally moving them to a status. */
export function LinkPostsDialog({ open, onOpenChange, entry }: LinkPostsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-xl overflow-y-auto">
        {open && <LinkForm entry={entry} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function LinkForm({ entry, onClose }: { entry: AdminChangelogDetail; onClose: () => void }) {
  const syncPosts = useChangelogStore((s) => s.syncPosts)
  const [boardId, setBoardId] = useState<number | null>(entry.board?.id ?? null)
  const [query, setQuery] = useState("")
  const debounced = useDebouncedValue(query.trim(), 300)
  const [results, setResults] = useState<AdminPostListItem[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<Map<number, LinkedPost>>(() => new Map(entry.linked_posts.map((p) => [p.id, p])))
  const [statusId, setStatusId] = useState(KEEP)
  const [busy, setBusy] = useState(false)
  // Statuses come from the board filter, or from the board of the first post the user ticks
  const [pickedBoardId, setPickedBoardId] = useState<number | null>(null)
  const statusBoardId = boardId ?? pickedBoardId
  const { statuses } = useBoardDetail(statusBoardId)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setSearching(true)
      try {
        const res = await roadmapAdminService.listPosts({
          board_id: boardId ?? undefined,
          q: debounced || undefined,
          moderation_state: "approved",
          sort: "activity",
          per_page: 15,
        })
        if (!cancelled) setResults(res.data)
      } catch (err) {
        if (!isCancel(err) && !cancelled) setResults([])
      } finally {
        if (!cancelled) setSearching(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debounced, boardId])

  function toggle(post: AdminPostListItem, checked: boolean) {
    if (checked && pickedBoardId === null) setPickedBoardId(post.board.id)
    setSelected((prev) => {
      const next = new Map(prev)
      if (checked) next.set(post.id, { id: post.id, number: post.number, board_slug: post.board.slug, title: post.title })
      else next.delete(post.id)
      return next
    })
  }

  async function save() {
    setBusy(true)
    const result = await syncPosts(entry.id, {
      post_ids: [...selected.keys()],
      mark_status_id: statusId === KEEP ? null : Number(statusId),
    })
    setBusy(false)
    if (result.ok) onClose()
  }

  const markStatus = statuses.find((s) => String(s.id) === statusId)

  return (
    <div className="space-y-4 p-5">
      <DialogHeader>
        <DialogTitle>Link posts</DialogTitle>
        <DialogDescription>Show visitors which requests this release fulfils. Linked posts get a link to the entry.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search approved posts…" className="ps-8" aria-label="Search posts" autoFocus />
        </div>
        <BoardSelect value={boardId} onChange={setBoardId} />
      </div>

      <ul className="max-h-64 space-y-0.5 overflow-y-auto rounded-lg border p-1" aria-label="Posts">
        {searching && results.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)
        ) : results.length === 0 ? (
          <li className="p-3 text-center text-sm text-muted-foreground">No matching posts.</li>
        ) : (
          results.map((post) => (
            <li key={post.id}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted">
                <Checkbox checked={selected.has(post.id)} onCheckedChange={(c) => toggle(post, c === true)} />
                <span className="min-w-0 flex-1 truncate text-sm">{post.title}</span>
                <StatusPill name={post.status.name} color={post.status.color} />
              </label>
            </li>
          ))
        )}
      </ul>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {selected.size} {selected.size === 1 ? "post" : "posts"} linked
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="mark-status">Mark linked posts as</Label>
        <Select value={statusId} onValueChange={setStatusId} disabled={!statusBoardId}>
          <SelectTrigger id="mark-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={KEEP}>Keep their current status</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                <StatusPill name={s.name} color={s.color} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {statusBoardId ? (markStatus ? `Every linked post moves to “${markStatus.name}”.` : "Optional. Applies to every linked post.") : "Tick a post or choose a board to pick a status."}
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button size="lg" onClick={() => void save()} disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          Save links
        </Button>
      </div>
    </div>
  )
}
