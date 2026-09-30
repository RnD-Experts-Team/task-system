import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { Check, Loader2 } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { isPublicApiError } from "../../api/publicApiClient"
import { roadmapPublicService } from "../../api/roadmapPublicService"
import { useCooldown } from "../../hooks/useCooldown"
import { useGuardedSubmit } from "../../hooks/useGuardedSubmit"
import { useSimilarPosts } from "../../hooks/useSimilarPosts"
import { describeError } from "../../lib/errors"
import { S } from "../../lib/strings"
import { btn, cardClass, inputClass, inputSize, textareaClass } from "../../lib/ui"
import { postPath } from "../../lib/url"
import { useSiteStore } from "../../stores/siteStore"
import { useViewerStore } from "../../stores/viewerStore"
import { useVisitorStore } from "../../stores/visitorStore"
import type { BoardDetail, LimitsHint, SubmitPostResult } from "../../types"
import { Field } from "../common/field"
import { describedBy } from "../../lib/a11y"
import { DuplicateSuggestions } from "./duplicate-suggestions"

// ─── Schema ────────────────────────────────────────────────────────

function buildSchema(l: LimitsHint) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(l.title_min, S.submit.validation.titleMin(l.title_min))
      .max(l.title_max, S.submit.validation.titleMax(l.title_max)),
    body: z.string().max(l.body_max, S.submit.validation.bodyMax(l.body_max)),
    author_name: z.string().trim().max(l.author_name_max, S.submit.validation.nameMax(l.author_name_max)),
    tag_slugs: z.array(z.string()).max(l.max_tags),
    website: z.string(),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

// ─── Component ─────────────────────────────────────────────────────

interface Props {
  board: BoardDetail
  limits: LimitsHint
  /** Called after an idea was accepted; approved ones should refresh the feed. */
  onCreated?: (result: SubmitPostResult) => void
  /** Called when the visitor dismisses the success state (closes the mobile drawer). */
  onDone?: () => void
  variant?: "card" | "plain"
  id?: string
}

export function SubmitBox({ board, limits, onCreated, onDone, variant = "card", id = "rm-submit" }: Props) {
  const slug = board.board.slug
  const schema = useMemo(() => buildSchema(limits), [limits])
  const authorName = useVisitorStore((s) => s.authorName)
  const setAuthorName = useVisitorStore((s) => s.setAuthorName)
  const announce = useSiteStore((s) => s.announce)
  const guard = useGuardedSubmit("post", slug)
  const cooldown = useCooldown()

  const [engaged, setEngaged] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitPostResult | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", body: "", author_name: authorName, tag_slugs: [], website: "" },
    mode: "onSubmit",
  })

  const title = useWatch({ control, name: "title" }) ?? ""
  const body = useWatch({ control, name: "body" }) ?? ""
  const tagSlugs = useWatch({ control, name: "tag_slugs" }) ?? []
  const similar = useSimilarPosts(slug, title, result === null)

  // Keep the remembered name in the form if it loads after mount (another tab, storage restore).
  useEffect(() => {
    if (authorName) setValue("author_name", authorName, { shouldDirty: false })
  }, [authorName, setValue])

  const expanded = engaged || title.length > 0
  const busy = submitting || cooldown.remaining > 0

  function onEngage() {
    setEngaged(true)
    guard.prefetch()
  }

  function toggleTag(tagSlug: string) {
    const next = tagSlugs.includes(tagSlug) ? tagSlugs.filter((t) => t !== tagSlug) : [...tagSlugs, tagSlug]
    if (next.length <= limits.max_tags) setValue("tag_slugs", next, { shouldDirty: true })
  }

  const submit = handleSubmit(async (values) => {
    setSubmitting(true)
    setFormError(null)
    setRateLimited(false)
    try {
      const res = await guard.run((formToken) =>
        roadmapPublicService.submitPost(slug, {
          title: values.title.trim(),
          body: values.body.trim() || null,
          author_name: values.author_name.trim() || null,
          tag_slugs: values.tag_slugs,
          form_token: formToken,
          website: values.website,
        }),
      )
      setAuthorName(values.author_name)
      setResult(res)
      const message = messageFor(res, board.board.requires_review)
      announce(message)
      if (res.moderation_state === "pending") {
        useViewerStore.getState().addOwnPending({
          board: slug,
          type: "post",
          number: res.number,
          title: values.title.trim(),
          created_at: new Date().toISOString(),
        })
      }
      onCreated?.(res)
    } catch (error) {
      if (isPublicApiError(error)) {
        if (error.status === 422) {
          for (const [field, messages] of Object.entries(error.fieldErrors)) {
            if (field === "title" || field === "body" || field === "author_name" || field === "tag_slugs") {
              setError(field, { message: messages[0] })
            }
          }
          setFormError(error.message)
        } else if (error.code === "too_fast") {
          setFormError(S.submit.tooFast)
          cooldown.start(5)
        } else if (error.code === "duplicate_content") {
          setFormError(S.submit.duplicate)
        } else if (error.code === "submissions_closed") {
          setFormError(S.submit.closed)
        } else if (error.status === 429) {
          setRateLimited(true)
          setFormError(describeError(error))
          cooldown.start(error.retryAfter ?? 10)
        } else {
          setFormError(describeError(error))
        }
      } else {
        setFormError(describeError(error))
      }
    } finally {
      setSubmitting(false)
    }
  })

  function startOver() {
    setResult(null)
    setFormError(null)
    setEngaged(false)
    reset({ title: "", body: "", author_name: useVisitorStore.getState().authorName, tag_slugs: [], website: "" })
  }

  const shell = variant === "card" ? cn(cardClass, "p-4 sm:p-5") : ""

  // ─── Success ───────────────────────────────────────────────────────
  if (result) {
    const approved = result.moderation_state === "approved"
    return (
      <section id={id} aria-label={S.submit.heading} className={cn(shell, "text-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150")}>
        <span className="mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-full bg-(--rm-accent-soft) text-(--rm-accent-strong)">
          <Check aria-hidden="true" className="size-5" strokeWidth={2.5} />
        </span>
        <p role="status" className="mx-auto max-w-sm text-[0.9375rem] font-medium text-pretty">
          {messageFor(result, board.board.requires_review)}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {approved ? (
            <Link
              to={postPath(slug, result.number, result.slug)}
              onClick={onDone}
              className={btn("primary", "md")}
            >
              {S.submit.viewIdea}
            </Link>
          ) : null}
          <button type="button" onClick={startOver} className={btn(approved ? "outline" : "primary", "md")}>
            {S.submit.another}
          </button>
        </div>
      </section>
    )
  }

  // ─── Form ──────────────────────────────────────────────────────────
  const titleError = errors.title?.message
  const bodyError = errors.body?.message
  const nameError = errors.author_name?.message

  return (
    <section id={id} aria-label={S.submit.heading} className={shell}>
      {variant === "card" ? (
        <div className="mb-3">
          <h2 className="text-lg font-semibold tracking-tight">{S.submit.heading}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{S.submit.subheading}</p>
        </div>
      ) : null}

      <form onSubmit={submit} noValidate className="space-y-4" aria-busy={submitting || undefined}>
        <Field
          id={`${id}-title`}
          label={S.submit.titleLabel}
          error={titleError}
          hint={S.submit.titleHint(limits.title_min, limits.title_max)}
          counter={expanded ? S.submit.counter(title.length, limits.title_max) : undefined}
        >
          <input
            id={`${id}-title`}
            type="text"
            autoComplete="off"
            maxLength={limits.title_max + 20}
            placeholder={S.submit.titlePlaceholder}
            aria-invalid={titleError ? true : undefined}
            aria-describedby={describedBy(`${id}-title`, { hint: S.submit.titleHint(limits.title_min, limits.title_max), error: titleError })}
            className={cn(inputClass, inputSize, "h-11")}
            {...register("title")}
            onFocus={onEngage}
          />
        </Field>

        <DuplicateSuggestions board={board} suggestions={similar.suggestions} loading={similar.loading} />

        {expanded ? (
          <div className="space-y-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-150">
            <Field
              id={`${id}-body`}
              label={S.submit.bodyLabel}
              optional
              error={bodyError}
              counter={S.submit.counter(body.length, limits.body_max)}
            >
              <textarea
                id={`${id}-body`}
                rows={4}
                placeholder={S.submit.bodyPlaceholder}
                aria-invalid={bodyError ? true : undefined}
                aria-describedby={describedBy(`${id}-body`, { error: bodyError })}
                className={textareaClass}
                {...register("body")}
              />
            </Field>

            {board.tags.length > 0 ? (
              <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium">
                  {S.submit.tagsLabel}
                  <span className="ms-1.5 text-xs font-normal text-muted-foreground">{S.submit.tagsHint(limits.max_tags)}</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {board.tags.map((t) => {
                    const on = tagSlugs.includes(t.slug)
                    const locked = !on && tagSlugs.length >= limits.max_tags
                    return (
                      <button
                        key={t.slug}
                        type="button"
                        aria-pressed={on}
                        disabled={locked}
                        onClick={() => toggleTag(t.slug)}
                        className={cn(
                          "h-8 rounded-full border px-3 text-[0.8125rem] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out motion-safe:active:scale-[0.97] disabled:opacity-45",
                          on
                            ? "border-primary/50 bg-(--rm-accent-soft) text-(--rm-accent-strong)"
                            : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
                        )}
                      >
                        {t.name}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}

            <Field
              id={`${id}-name`}
              label={S.submit.nameLabel}
              optional
              error={nameError}
              hint={S.submit.nameHint}
            >
              <input
                id={`${id}-name`}
                type="text"
                autoComplete="nickname"
                placeholder={S.submit.namePlaceholder}
                aria-invalid={nameError ? true : undefined}
                aria-describedby={describedBy(`${id}-name`, { hint: S.submit.nameHint, error: nameError })}
                className={cn(inputClass, inputSize)}
                {...register("author_name")}
              />
            </Field>
          </div>
        ) : null}

        {/* Honeypot: real visitors never see or reach it. */}
        <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
          <label>
            {S.submit.honeypot}
            <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>

        {formError ? (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {rateLimited && cooldown.remaining > 0 ? S.errors.rateLimited(cooldown.remaining) : formError}
          </p>
        ) : null}

        {expanded ? (
          <div className="flex items-center justify-end gap-3">
            <button type="submit" disabled={busy} className={btn("primary", "md", "min-w-32")}>
              {submitting ? <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : null}
              {submitting
                ? S.submit.submitting
                : cooldown.remaining > 0
                  ? S.submit.tooFastWait(cooldown.remaining)
                  : S.submit.submit}
            </button>
          </div>
        ) : null}
      </form>
    </section>
  )
}

function messageFor(result: SubmitPostResult, requiresReview: boolean): string {
  if (result.moderation_state === "approved") return S.submit.successApproved
  return requiresReview ? S.submit.successPendingReview : S.submit.successPendingHold
}
