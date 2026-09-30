import type { ReactNode } from "react"

const URL_RE = /https?:\/\/[^\s<>"']+/gi
const TRAILING = /[.,;:!?)\]}]+$/

/**
 * Turns plain visitor text into React nodes, wrapping http(s) URLs in safe anchors.
 * Never uses dangerouslySetInnerHTML; everything else stays plain text.
 */
export function linkify(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let i = 0
  for (const match of text.matchAll(URL_RE)) {
    const start = match.index
    let url = match[0]
    const trail = TRAILING.exec(url)
    if (trail) url = url.slice(0, url.length - trail[0].length)
    if (start > last) nodes.push(text.slice(last, start))
    nodes.push(
      <a
        key={`u${i++}`}
        href={url}
        target="_blank"
        rel="nofollow noopener noreferrer ugc"
        className="break-words text-(--rm-accent-strong) underline decoration-current/30 underline-offset-2 transition-colors hover:decoration-current"
      >
        {url}
      </a>,
    )
    last = start + url.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}
