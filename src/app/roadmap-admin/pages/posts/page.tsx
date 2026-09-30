// src/app/roadmap-admin/pages/posts/page.tsx
// Posts: filterable data table (board, moderation state, status, tag, search, sort), pagination
// and a detail Sheet. The open post lives in the URL (?post=ID) so links from other screens work.

import { useState } from "react"
import { useSearchParams } from "react-router"
import { FileText, Plus, RefreshCw, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BoardSelect } from "../../components/board-select"
import { CreatePostDialog } from "../../components/create-post-dialog"
import { EmptyState } from "../../components/empty-state"
import { ErrorState } from "../../components/error-state"
import { PageHeader } from "../../components/page-header"
import { PaginationBar } from "../../components/pagination-bar"
import { PostDetailSheet } from "../../components/post-detail-sheet"
import { PostsTable } from "../../components/posts-table"
import { TableSkeleton } from "../../components/skeletons"
import { useAdminPosts } from "../../hooks/useAdminPosts"
import { useBoardDetail } from "../../hooks/useBoards"
import { useDebouncedValue } from "../../hooks/useDebouncedValue"
import { useRoadmapPermissions } from "../../hooks/useRoadmapPermissions"
import type { AdminPostFilters, AdminPostSort, ModerationState } from "../../types"

const ALL = "all"
const PER_PAGE = 20

const STATE_OPTIONS: { value: ModerationState | "all"; label: string }[] = [
  { value: "all", label: "All states" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "spam", label: "Spam" },
]

const SORT_OPTIONS: { value: AdminPostSort; label: string }[] = [
  { value: "new", label: "Newest" },
  { value: "votes", label: "Most votes" },
  { value: "activity", label: "Recent activity" },
]

export default function RoadmapPostsPage() {
  const { canManage } = useRoadmapPermissions()
  const [searchParams, setSearchParams] = useSearchParams()
  const openId = Number(searchParams.get("post")) || null

  const [boardId, setBoardId] = useState<number | null>(null)
  const [moderationState, setModerationState] = useState<ModerationState | "all">("all")
  const [statusId, setStatusId] = useState<number | null>(null)
  const [tagId, setTagId] = useState<number | null>(null)
  const [sort, setSort] = useState<AdminPostSort>("new")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const { statuses, tags } = useBoardDetail(boardId)

  const filters: AdminPostFilters = {
    board_id: boardId ?? undefined,
    moderation_state: moderationState,
    status_id: statusId ?? undefined,
    tag_id: tagId ?? undefined,
    q: debouncedSearch || undefined,
    sort,
    page,
    per_page: PER_PAGE,
  }
  const { posts, pagination, loading, error, refetch } = useAdminPosts(filters)

  const hasFilters = boardId !== null || moderationState !== "all" || statusId !== null || tagId !== null || search !== ""

  // Any filter change goes back to page 1
  function withReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  function openPost(id: number | null) {
    const next = new URLSearchParams(searchParams)
    if (id) next.set("post", String(id))
    else next.delete("post")
    setSearchParams(next, { replace: false })
  }

  function clearFilters() {
    setBoardId(null)
    setModerationState("all")
    setStatusId(null)
    setTagId(null)
    setSearch("")
    setPage(1)
  }

  const firstLoad = loading && posts.length === 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Posts"
        description="Every suggestion across your boards. Open one to change its status, reply officially, merge duplicates or moderate it."
        badge={pagination ? `${pagination.total.toLocaleString()} total` : undefined}
        actions={
          <>
            <Button variant="outline" size="lg" className="gap-1.5" onClick={() => void refetch()} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
            {canManage && (
              <Button size="lg" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus />
                New post
              </Button>
            )}
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-0 lg:w-72">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => withReset(setSearch)(e.target.value)}
            placeholder="Search title or body…"
            className="ps-8"
            aria-label="Search posts"
          />
        </div>
        <BoardSelect
          value={boardId}
          onChange={(next) => {
            setBoardId(next)
            setStatusId(null)
            setTagId(null)
            setPage(1)
          }}
        />
        <Select value={moderationState} onValueChange={(v) => withReset(setModerationState)(v as ModerationState | "all")}>
          <SelectTrigger className="w-full sm:w-36" aria-label="Moderation state">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {boardId && (
          <>
            <Select value={statusId === null ? ALL : String(statusId)} onValueChange={(v) => withReset(setStatusId)(v === ALL ? null : Number(v))}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tagId === null ? ALL : String(tagId)} onValueChange={(v) => withReset(setTagId)(v === ALL ? null : Number(v))}>
              <SelectTrigger className="w-full sm:w-36" aria-label="Tag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All tags</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
        <Select value={sort} onValueChange={(v) => withReset(setSort)(v as AdminPostSort)}>
          <SelectTrigger className="w-full sm:w-40 lg:ms-auto" aria-label="Sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="lg" className="gap-1.5" onClick={clearFilters}>
            <X />
            Clear
          </Button>
        )}
      </div>

      {/* List */}
      {error && posts.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : firstLoad ? (
        <TableSkeleton columns={["Post", "Status", "Moderation", "Votes", "Comments", "Activity"]} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={hasFilters ? "No posts match these filters" : "No posts yet"}
          description={hasFilters ? "Try a different search or clear the filters." : "Suggestions from visitors will appear here."}
          action={
            hasFilters ? (
              <Button variant="outline" size="lg" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {error && <ErrorState title="Couldn't refresh" message={error} onRetry={() => void refetch()} />}
          <PostsTable posts={posts} activeId={openId} onRowClick={(p) => openPost(p.id)} refreshing={loading} />
          <PaginationBar pagination={pagination} label="posts" onPageChange={setPage} />
        </>
      )}

      <PostDetailSheet postId={openId} onClose={() => openPost(null)} onOpenPost={openPost} />
      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} defaultBoardId={boardId} onCreated={(p) => openPost(p.id)} />
    </div>
  )
}
