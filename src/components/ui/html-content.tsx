import { type ReactNode, useMemo } from "react"
import { cn } from "@/lib/utils"
import { isHtmlBlank, sanitizeHtml } from "@/lib/html"

type HtmlContentProps = {
  html?: string | null
  className?: string
  emptyFallback?: ReactNode
}

export function HtmlContent({ html, className, emptyFallback = null }: HtmlContentProps) {
  const safeHtml = useMemo(() => sanitizeHtml(html ?? ""), [html])

  if (!safeHtml || isHtmlBlank(safeHtml)) {
    return <>{emptyFallback}</>
  }

  return (
    <div
      className={cn(
        "break-words [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_ul]:list-disc [&_ul]:pl-5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
