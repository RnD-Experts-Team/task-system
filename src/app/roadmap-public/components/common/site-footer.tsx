import { Link } from "react-router"
import { Rss } from "lucide-react"
import { S } from "../../lib/strings"
import { RSS_URL, isInternalPath, safeHttpUrl } from "../../lib/url"
import { containerClass } from "../../lib/ui"
import { cn } from "@/lib/utils"
import type { PublicConfig } from "../../types"

const linkClass = "text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"

export function SiteFooter({ config }: { config: PublicConfig | null }) {
  if (!config) return <footer className="mt-auto" />
  const { site, features } = config
  const links = site.footer_links.filter((l) => isInternalPath(l.url) || safeHttpUrl(l.url))
  const contact = safeHttpUrl(site.contact_url)

  return (
    <footer className="mt-auto border-t border-border/60">
      <div className={cn(containerClass, "flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between")}>
        <div className="space-y-1">
          {site.footer_text ? <p className="text-sm text-pretty text-muted-foreground">{site.footer_text}</p> : null}
          <p className="text-xs text-muted-foreground">{S.footer.rights(site.name, new Date().getFullYear())}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {links.map((l) =>
            isInternalPath(l.url) ? (
              <Link key={l.url + l.label} to={l.url} className={linkClass}>
                {l.label}
              </Link>
            ) : (
              <a key={l.url + l.label} href={safeHttpUrl(l.url) ?? "#"} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {l.label}
              </a>
            ),
          )}
          {contact ? (
            <a href={contact} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {S.footer.contact}
            </a>
          ) : null}
          {features.rss && features.changelog ? (
            <a href={RSS_URL} className={cn(linkClass, "inline-flex items-center gap-1.5")}>
              <Rss aria-hidden="true" className="size-3.5" />
              {S.nav.rss}
            </a>
          ) : null}
        </nav>
      </div>
    </footer>
  )
}
