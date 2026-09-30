import { MessageSquare, Pin, ThumbsUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { timeAgo } from "../utils/format"
import type { AdminPostListItem } from "../types"
import { ModerationBadge } from "./moderation-badge"
import { StatusPill, TagChip } from "./status-pill"

type PostsTableProps = {
  posts: AdminPostListItem[]
  activeId?: number | null
  onRowClick: (post: AdminPostListItem) => void
  /** Dim rows while a refetch is running */
  refreshing?: boolean
}

export function PostsTable({ posts, activeId, onRowClick, refreshing }: PostsTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-md border transition-opacity", refreshing && "opacity-60")}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[260px]">Post</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Moderation</TableHead>
            <TableHead className="w-16 text-end">Votes</TableHead>
            <TableHead className="hidden w-20 text-end md:table-cell">Comments</TableHead>
            <TableHead className="hidden lg:table-cell">Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow
              key={post.id}
              tabIndex={0}
              aria-label={`Open post: ${post.title}`}
              data-state={activeId === post.id ? "selected" : undefined}
              className="cursor-pointer outline-none focus-visible:bg-muted/60"
              onClick={() => onRowClick(post)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onRowClick(post)
                }
              }}
            >
              <TableCell className="w-full max-w-0 py-3 whitespace-normal">
                <div className="flex items-center gap-1.5">
                  {post.is_pinned && <Pin className="size-3 shrink-0 text-primary" aria-label="Pinned" />}
                  <span className="truncate font-medium">{post.title}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-mono">
                    {post.board.name} #{post.number}
                  </span>
                  {post.tags.slice(0, 3).map((t) => (
                    <TagChip key={t.id} name={t.name} color={t.color} />
                  ))}
                  {post.tags.length > 3 && <span>+{post.tags.length - 3}</span>}
                </div>
              </TableCell>
              <TableCell className="py-3">
                <StatusPill name={post.status.name} color={post.status.color} />
              </TableCell>
              <TableCell className="hidden py-3 sm:table-cell">
                <ModerationBadge state={post.moderation_state} />
              </TableCell>
              <TableCell className="py-3 text-end">
                <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
                  <ThumbsUp className="size-3 text-muted-foreground" />
                  {post.votes_count}
                </span>
              </TableCell>
              <TableCell className="hidden py-3 text-end md:table-cell">
                <span className="inline-flex items-center gap-1 tabular-nums text-muted-foreground">
                  <MessageSquare className="size-3" />
                  {post.comments_count}
                  {post.pending_comments_count > 0 && <span className="text-amber-600 dark:text-amber-400">(+{post.pending_comments_count})</span>}
                </span>
              </TableCell>
              <TableCell className="hidden py-3 text-muted-foreground lg:table-cell">{timeAgo(post.last_activity_at ?? post.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
