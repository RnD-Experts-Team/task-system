import { BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRelative, initials, isoOrUndefined } from "../../lib/format"
import { linkify } from "../../lib/linkify"
import { S } from "../../lib/strings"
import type { PublicComment } from "../../types"

interface Props {
  comment: PublicComment
  canReply: boolean
  onReply?: (comment: PublicComment) => void
  isReply?: boolean
}

export function CommentItem({ comment, canReply, onReply, isReply = false }: Props) {
  const team = comment.author.is_team
  return (
    <li className="list-none">
      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold",
            team ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {initials(comment.author.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <span className="font-semibold">{comment.author.name}</span>
            {team ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-(--rm-accent-soft) px-2 py-0.5 text-[0.6875rem] font-medium text-(--rm-accent-strong)">
                <BadgeCheck aria-hidden="true" className="size-3" />
                {S.comments.teamBadge}
              </span>
            ) : null}
            <time dateTime={isoOrUndefined(comment.created_at)} className="text-xs text-muted-foreground">
              {formatRelative(comment.created_at)}
            </time>
          </p>
          <p className="mt-1 text-[0.9375rem] leading-relaxed break-words whitespace-pre-line text-foreground/90">
            {linkify(comment.body)}
          </p>
          {canReply && !isReply && onReply ? (
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="mt-1.5 -ms-1 rounded-md px-1 py-1 text-[0.8125rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {S.comments.reply}
            </button>
          ) : null}
        </div>
      </div>
      {comment.replies.length > 0 ? (
        <ul className="mt-4 ms-4 space-y-4 border-s border-border/70 ps-4 sm:ms-5 sm:ps-5">
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} canReply={false} isReply />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
