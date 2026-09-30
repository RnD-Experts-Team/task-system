import { BadgeCheck } from "lucide-react"
import { formatDate, isoOrUndefined } from "../../lib/format"
import { S } from "../../lib/strings"
import type { OfficialResponse as OfficialResponseData } from "../../types"
import { Monogram } from "../common/monogram"
import { TrustedHtml } from "../common/trusted-html"

/** The team's reply, visually distinct from visitor content. HTML comes sanitised from the server. */
export function OfficialResponse({ response }: { response: OfficialResponseData }) {
  return (
    <section
      aria-label={S.post.responseTitle}
      className="rounded-xl border border-primary/25 bg-(--rm-accent-soft) p-4 sm:p-5"
    >
      <header className="mb-3 flex items-center gap-3">
        <Monogram name={response.by} className="size-8 text-xs" />
        <div className="min-w-0 leading-tight">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
            {response.by}
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[0.6875rem] font-medium text-primary-foreground">
              <BadgeCheck aria-hidden="true" className="size-3" />
              {S.post.responseTeam}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {S.post.responseTitle} &middot;{" "}
            <time dateTime={isoOrUndefined(response.responded_at)}>{formatDate(response.responded_at)}</time>
          </p>
        </div>
      </header>
      <TrustedHtml html={response.body_html} className="text-[0.9375rem]" />
    </section>
  )
}
