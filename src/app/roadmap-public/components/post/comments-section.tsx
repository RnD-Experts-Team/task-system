import { useRef, useState } from "react"
import { Loader2, MessageSquare } from "lucide-react"
import { useComments } from "../../hooks/useComments"
import { S } from "../../lib/strings"
import { btn, cardClass } from "../../lib/ui"
import { cn } from "@/lib/utils"
import { useViewerStore } from "../../stores/viewerStore"
import type { LimitsHint, PublicComment } from "../../types"
import { EmptyState } from "../common/empty-state"
import { ErrorState } from "../common/error-state"
import { Skel } from "../common/skeletons"
import { CommentForm, type CommentFormHandle } from "./comment-form"
import { CommentItem } from "./comment-item"
import { PendingBanner } from "./pending-banner"

interface Props {
  board: string
  number: number
  limits: LimitsHint
  /** Board allows comments and the site has them enabled. */
  enabled: boolean
}

export function CommentsSection({ board, number, limits, enabled }: Props) {
  const comments = useComments(board, number, enabled)
  const [replyTo, setReplyTo] = useState<PublicComment | null>(null)
  const [added, setAdded] = useState(0)
  const formRef = useRef<CommentFormHandle | null>(null)
  const pendingMine = useViewerStore(
    (s) => s.ownPending.filter((p) => p.board === board && p.type === "comment" && p.number === number).length,
  )

  if (!enabled) {
    return (
      <section aria-labelledby="rm-comments-h" className="space-y-3">
        <h2 id="rm-comments-h" className="text-lg font-semibold tracking-tight">
          {S.comments.heading(0)}
        </h2>
        <p className="text-sm text-muted-foreground">{S.comments.closed}</p>
      </section>
    )
  }

  function onReply(c: PublicComment) {
    setReplyTo(c)
    formRef.current?.focus()
    document.getElementById("rm-comment-body")?.scrollIntoView({ block: "center", behavior: "smooth" })
  }

  return (
    <section aria-labelledby="rm-comments-h" className="space-y-6">
      <h2 id="rm-comments-h" className="text-lg font-semibold tracking-tight">
        {S.comments.heading(comments.total + added)}
      </h2>

      {pendingMine > 0 ? (
        <PendingBanner title={S.post.pendingCommentsTitle(pendingMine)} body={S.post.pendingCommentsBody} />
      ) : null}

      {comments.error ? (
        <ErrorState error={comments.error} onRetry={comments.reload} />
      ) : comments.loading ? (
        <div role="status" aria-label={S.common.loading} className="space-y-5">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-3">
              <Skel className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skel className="h-4 w-40" />
                <Skel className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.items.length === 0 ? (
        <EmptyState icon={MessageSquare} title={S.comments.empty} className="py-10" />
      ) : (
        <>
          <ul className="space-y-6">
            {comments.items.map((c) => (
              <CommentItem key={c.id} comment={c} canReply onReply={onReply} />
            ))}
          </ul>
          {comments.hasMore ? (
            <button type="button" onClick={comments.loadMore} disabled={comments.moreLoading} className={btn("outline", "md")}>
              {comments.moreLoading ? <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : null}
              {S.comments.loadMore}
            </button>
          ) : null}
        </>
      )}

      <div className={cn(cardClass, "p-4 sm:p-5")}>
        <CommentForm
          ref={formRef}
          board={board}
          number={number}
          limits={limits}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onPosted={(res, draft) => {
            if (res.moderation_state !== "approved" || res.id === null) return
            comments.append({
              id: res.id,
              parent_id: draft.parentId,
              author: { name: draft.author || S.common.anonymous, is_team: false },
              body: draft.body,
              created_at: new Date().toISOString(),
              replies: [],
            })
            setAdded((n) => n + 1)
          }}
        />
      </div>
    </section>
  )
}
