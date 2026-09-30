import { useEffect } from "react"

interface PageMeta {
  title: string
  description?: string | null
  /** SPA path (or absolute URL) for <link rel="canonical">. */
  canonical?: string | null
}

function ensureTag<K extends "meta" | "link">(
  tag: K,
  selector: string,
  attrs: Record<string, string>,
): { el: HTMLElementTagNameMap[K]; created: boolean } {
  const existing = document.head.querySelector<HTMLElementTagNameMap[K]>(selector)
  if (existing) return { el: existing, created: false }
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  document.head.appendChild(el)
  return { el, created: true }
}

/**
 * Sets document.title, meta description and canonical for JS-rendering crawlers and restores
 * the previous values when the page unmounts.
 */
export function usePageMeta({ title, description, canonical }: PageMeta): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title
    return () => {
      document.title = previousTitle
    }
  }, [title])

  useEffect(() => {
    if (!description) return
    const { el, created } = ensureTag("meta", 'meta[name="description"]', { name: "description" })
    const previous = el.getAttribute("content")
    el.setAttribute("content", description)
    return () => {
      if (created) el.remove()
      else if (previous === null) el.removeAttribute("content")
      else el.setAttribute("content", previous)
    }
  }, [description])

  useEffect(() => {
    if (!canonical) return
    const href = canonical.startsWith("http") ? canonical : `${window.location.origin}${canonical}`
    const { el, created } = ensureTag("link", 'link[rel="canonical"]', { rel: "canonical" })
    const previous = el.getAttribute("href")
    el.setAttribute("href", href)
    return () => {
      if (created) el.remove()
      else if (previous === null) el.removeAttribute("href")
      else el.setAttribute("href", previous)
    }
  }, [canonical])
}
