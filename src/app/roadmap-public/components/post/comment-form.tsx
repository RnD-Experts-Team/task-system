import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { Loader2, X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { isPublicApiError } from "../../api/publicApiClient"
import { roadmapPublicService } from "../../api/roadmapPublicService"
import { useCooldown } from "../../hooks/useCooldown"
import { useGuardedSubmit } from "../../hooks/useGuardedSubmit"
import { describeError } from "../../lib/errors"
import { S } from "../../lib/strings"
import { btn, inputClass, inputSize, textareaClass } from "../../lib/ui"
import { useSiteStore } from "../../stores/siteStore"
import { useViewerStore } from "../../stores/viewerStore"
import { useVisitorStore } from "../../stores/visitorStore"
import type { LimitsHint, PublicComment, SubmitCommentResult } from "../../types"
import { Field } from "../common/field"
import { describedBy } from "../../lib/a11y"

function buildSchema(l: LimitsHint) {
  return z.object({
    body: z
      .string()
      .trim()
      .min(l.comment_min, S.submit.validation.commentMin(l.comment_min))
      .max(l.comment_max, S.submit.validation.commentMax(l.comment_max)),
    author_name: z.string().trim().max(l.author_name_max, S.submit.validation.nameMax(l.author_name_max)),
    website: z.string(),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

export interface CommentFormHandle {
  focus: () => void
}

interface Props {
  board: string
  number: number
  limits: LimitsHint
  replyTo: PublicComment | null
  onCancelReply: () => void
  /** Approved comments are appended to the thread right away. */
  onPosted: (result: SubmitCommentResult, draft: { body: string; author: string; parentId: number | null }) => void
}

export const CommentForm = forwardRef<CommentFormHandle, Props>(function CommentForm(
  { board, number, limits, replyTo, onCancelReply, onPosted },
  ref,
) {
  const schema = useMemo(() => buildSchema(limits), [limits])
  const authorName = useVisitorStore((s) => s.authorName)
  const setAuthorName = useVisitorStore((s) => s.setAuthorName)
  const announce = useSiteStore((s) => s.announce)
  const guard = useGuardedSubmit("comment", board)
  const cooldown = useCooldown()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    setError: setFieldError,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { body: "", author_name: authorName, website: "" },
  })

  useEffect(() => {
    if (authorName) setValue("author_name", authorName)
  }, [authorName, setValue])

  const bodyRegister = register("body")
  useImperativeHandle(ref, () => ({ focus: () => textareaRef.current?.focus() }), [])

  const submit = handleSubmit(async (values) => {
    setSubmitting(true)
    setError(null)
    setNotice(null)
    const parentId = replyTo?.id ?? null
    try {
      const res = await guard.run((formToken) =>
        roadmapPublicService.submitComment(board, number, {
          body: values.body.trim(),
          author_name: values.author_name.trim() || null,
          parent_id: parentId,
          form_token: formToken,
          website: values.website,
        }),
      )
      setAuthorName(values.author_name)
      const approved = res.moderation_state === "approved"
      const message = approved ? S.comments.successApproved : S.comments.successPending
      announce(message)
      setNotice(message)
      if (!approved) {
        useViewerStore.getState().addOwnPending({
          board,
          type: "comment",
          number,
          title: null,
          created_at: new Date().toISOString(),
        })
      }
      onPosted(res, { body: values.body.trim(), author: values.author_name.trim(), parentId })
      reset({ body: "", author_name: values.author_name, website: "" })
      onCancelReply()
    } catch (e) {
      if (isPublicApiError(e)) {
        if (e.status === 422) {
          const first = e.fieldErrors.body?.[0]
          if (first) setFieldError("body", { message: first })
          setError(e.message)
        } else if (e.code === "too_fast") {
          setError(S.submit.tooFast)
          cooldown.start(5)
        } else if (e.status === 429) {
          setError(describeError(e))
          cooldown.start(e.retryAfter ?? 10)
        } else {
          setError(describeError(e))
        }
      } else {
        setError(S.comments.failed)
      }
    } finally {
      setSubmitting(false)
    }
  })

  const bodyError = errors.body?.message
  const nameError = errors.author_name?.message
  const busy = submitting || cooldown.remaining > 0

  return (
    <form onSubmit={submit} noValidate className="space-y-3" aria-busy={submitting || undefined}>
      {replyTo ? (
        <p className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-[0.8125rem] text-muted-foreground">
          <span className="truncate">{S.comments.replyingTo(replyTo.author.name)}</span>
          <button
            type="button"
            onClick={onCancelReply}
            className="inline-flex shrink-0 items-center gap-1 font-medium text-foreground hover:underline"
          >
            <X aria-hidden="true" className="size-3.5" />
            {S.comments.cancelReply}
          </button>
        </p>
      ) : null}

      <Field id="rm-comment-body" label={S.comments.formLabel} error={bodyError}>
        <textarea
          id="rm-comment-body"
          rows={3}
          placeholder={S.comments.placeholder}
          aria-invalid={bodyError ? true : undefined}
          aria-describedby={describedBy("rm-comment-body", { error: bodyError })}
          className={textareaClass}
          {...bodyRegister}
          onFocus={() => guard.prefetch()}
          ref={(el) => {
            bodyRegister.ref(el)
            textareaRef.current = el
          }}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-end">
        <Field id="rm-comment-name" label={S.submit.nameLabel} optional error={nameError}>
          <input
            id="rm-comment-name"
            type="text"
            autoComplete="nickname"
            placeholder={S.submit.namePlaceholder}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={describedBy("rm-comment-name", { error: nameError })}
            className={cn(inputClass, inputSize)}
            {...register("author_name")}
          />
        </Field>
        <div className="flex sm:justify-end">
          <button type="submit" disabled={busy} className={btn("primary", "md", "w-full sm:w-auto sm:min-w-32")}>
            {submitting ? <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : null}
            {submitting ? S.comments.posting : cooldown.remaining > 0 ? S.submit.tooFastWait(cooldown.remaining) : S.comments.post}
          </button>
        </div>
      </div>

      <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>
          {S.submit.honeypot}
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-sm text-(--rm-accent-strong)">
          {notice}
        </p>
      ) : null}
    </form>
  )
})
