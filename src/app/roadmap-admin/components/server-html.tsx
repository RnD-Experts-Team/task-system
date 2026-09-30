// The ONLY place the admin console renders raw HTML. It must only ever be given HTML that the
// server produced through MarkdownRenderer (league/commonmark: html_input=strip,
// allow_unsafe_links=false, https-only images). Never pass user-typed strings or client-built HTML.

import { cn } from "@/lib/utils"

type ServerHtmlProps = {
  /** Server-sanitised HTML (markdown preview / stored *_html fields). */
  html: string
  className?: string
}

const PROSE =
  "text-sm leading-relaxed break-words [&_a]:text-primary [&_a]:underline [&_blockquote]:border-s-2 [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_hr]:my-4 [&_img]:max-w-full [&_img]:rounded-md [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:ps-5 [&_p]:my-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:my-2 [&_table]:w-full [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:ps-5 [&>*:first-child]:mt-0"

export function ServerHtml({ html, className }: ServerHtmlProps) {
  return <div className={cn(PROSE, className)} dangerouslySetInnerHTML={{ __html: html }} />
}
