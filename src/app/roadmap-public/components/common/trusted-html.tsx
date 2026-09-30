import { cn } from "@/lib/utils"

interface Props {
  /** Server-sanitised HTML only (official responses, changelog bodies). Never pass visitor text. */
  html: string
  className?: string
}

export function TrustedHtml({ html, className }: Props) {
  return <div className={cn("rm-prose", className)} dangerouslySetInnerHTML={{ __html: html }} />
}
