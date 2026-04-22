const ALLOWED_TAGS = new Set([
  "a",
  "p",
  "br",
  "strong",
  "b", // Allow <b> for bold
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "div",
  "span",
])

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"])

function sanitizeLinkHref(rawHref: string): string | null {
  const href = rawHref.trim()
  if (!href) return null

  if (href.startsWith("/") || href.startsWith("#")) {
    return href
  }

  try {
    const url = new URL(href, window.location.origin)
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

function sanitizeElement(element: Element) {
  // Unwrap non-allowed tags while keeping their child text/markup.
  if (!ALLOWED_TAGS.has(element.tagName.toLowerCase())) {
    const parent = element.parentNode
    if (!parent) return
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element)
    }
    parent.removeChild(element)
    return
  }

  const tagName = element.tagName.toLowerCase()

  // Remove all attributes except safe link attributes.
  const attrs = Array.from(element.attributes)
  for (const attr of attrs) {
    const name = attr.name.toLowerCase()

    // Strip all inline event handlers and styles.
    if (name.startsWith("on") || name === "style") {
      element.removeAttribute(attr.name)
      continue
    }

    if (tagName !== "a") {
      element.removeAttribute(attr.name)
      continue
    }

    if (name === "href") {
      const safeHref = sanitizeLinkHref(attr.value)
      if (!safeHref) {
        element.removeAttribute(attr.name)
      } else {
        element.setAttribute("href", safeHref)
      }
      continue
    }

    if (name !== "target" && name !== "rel") {
      element.removeAttribute(attr.name)
      continue
    }
  }

  if (tagName === "a") {
    // Enforce safe defaults for links opening in new tabs.
    const target = element.getAttribute("target")
    if (target === "_blank") {
      element.setAttribute("rel", "noopener noreferrer")
    }
  }
}

export function sanitizeHtml(input: string): string {
  if (!input) return ""
  if (typeof window === "undefined") return input

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${input}</div>`, "text/html")
  const root = doc.body.firstElementChild
  if (!root) return ""

  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT)
  const nodesToProcess: Node[] = []

  let current = walker.nextNode()
  while (current) {
    nodesToProcess.push(current)
    current = walker.nextNode()
  }

  for (const node of nodesToProcess) {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node)
      continue
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      sanitizeElement(node as Element)
    }
  }

  return root.innerHTML
}

export function getTextFromHtml(input: string): string {
  if (!input) return ""
  if (typeof window === "undefined") return input

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${input}</div>`, "text/html")
  const text = doc.body.textContent ?? ""
  return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
}

export function isHtmlBlank(input: string): boolean {
  return getTextFromHtml(input).length === 0
}

export function normalizeHtmlForSubmit(input: string): string | null {
  const cleaned = sanitizeHtml(input)
  if (!cleaned || isHtmlBlank(cleaned)) {
    return null
  }
  return cleaned.trim()
}
