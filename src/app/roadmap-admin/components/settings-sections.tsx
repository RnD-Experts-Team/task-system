// The five settings tabs. Each section is a controlled view over the draft settings.

import type { ReactNode } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { FontChoice, HeroStyle, RadiusPreset, ThemeMode } from "@/app/roadmap-public/types"
import { BRAND_PALETTE } from "../utils/palette"
import type { AssetType, RoadmapSettings } from "../types"
import { AssetUploader } from "./asset-uploader"
import { ColorPicker } from "./color-picker"
import { BlocklistInput, Field, NumberField, ToggleField } from "./settings-fields"

export type SectionProps = {
  draft: RoadmapSettings
  onChange: <K extends keyof RoadmapSettings>(section: K, patch: Partial<RoadmapSettings[K]>) => void
  /** Board scope: only a few keys can be overridden */
  boardScope: boolean
  /** Server / client validation message for a dotted path, e.g. "branding.primary" */
  errorFor: (path: string) => string | null
}

function ScopeNote({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">{children}</p>
}

// ─── Branding ─────────────────────────────────────────────────────

const RADII: { value: RadiusPreset; label: string }[] = [
  { value: "sm", label: "Sharp" },
  { value: "md", label: "Soft" },
  { value: "lg", label: "Round" },
  { value: "xl", label: "Pill-ish" },
]
const FONTS: { value: FontChoice; label: string }[] = [
  { value: "outfit", label: "Outfit" },
  { value: "system", label: "System" },
]
const THEMES: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]
const HEROES: { value: HeroStyle; label: string }[] = [
  { value: "plain", label: "Plain" },
  { value: "gradient", label: "Gradient" },
  { value: "pattern", label: "Pattern" },
]

function Segmented<T extends string>({ value, options, onChange, label, disabled }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string; disabled?: boolean }) {
  return (
    <ToggleGroup type="single" variant="outline" value={value} onValueChange={(v) => v && onChange(v as T)} aria-label={label} disabled={disabled} className="flex-wrap justify-start">
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} className="px-3">
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export type AssetsProps = {
  urls: Record<AssetType, string | null>
  busy: AssetType | null
  onUpload: (type: AssetType, file: File) => Promise<boolean>
  onRemove: (type: AssetType) => Promise<boolean>
}

export function BrandingSection({ draft, onChange, boardScope, errorFor, assets }: SectionProps & { assets: AssetsProps }) {
  const b = draft.branding
  return (
    <div className="space-y-6">
      {boardScope && <ScopeNote>This board can override the accent colour, corner radius and hero style. Fonts, theme and images come from the global settings.</ScopeNote>}
      <ColorPicker label="Accent colour" value={b.primary} onChange={(primary) => onChange("branding", { primary })} palette={BRAND_PALETTE} error={errorFor("branding.primary")} />
      <p className="-mt-3 text-xs text-muted-foreground">Used for the vote button, primary buttons, links and focus rings. Colours that are hard to read are adjusted automatically; the preview shows the result.</p>

      <Field label="Corner radius">
        <Segmented label="Corner radius" value={b.radius} options={RADII} onChange={(radius) => onChange("branding", { radius })} />
      </Field>
      <Field label="Hero style">
        <Segmented label="Hero style" value={b.hero_style} options={HEROES} onChange={(hero_style) => onChange("branding", { hero_style })} />
      </Field>
      <Field label="Font">
        <Segmented label="Font" value={b.font} options={FONTS} onChange={(font) => onChange("branding", { font })} disabled={boardScope} />
      </Field>
      <Field label="Default theme" hint="What visitors see before they choose light or dark.">
        <Segmented label="Default theme" value={b.default_theme} options={THEMES} onChange={(default_theme) => onChange("branding", { default_theme })} disabled={boardScope} />
      </Field>

      {!boardScope && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Images</h4>
          <AssetUploader label="Logo" hint="PNG, JPG or WebP, up to 1 MB. Shown in the header." url={assets.urls.logo} busy={assets.busy === "logo"} onUpload={(f) => assets.onUpload("logo", f)} onRemove={() => assets.onRemove("logo")} />
          <AssetUploader label="Logo for dark mode" hint="Optional. Falls back to the main logo." dark url={assets.urls.logo_dark} busy={assets.busy === "logo_dark"} onUpload={(f) => assets.onUpload("logo_dark", f)} onRemove={() => assets.onRemove("logo_dark")} />
          <AssetUploader label="Favicon" hint="Square, up to 512 px. Saved as a 64 px PNG." small url={assets.urls.favicon} busy={assets.busy === "favicon"} onUpload={(f) => assets.onUpload("favicon", f)} onRemove={() => assets.onRemove("favicon")} />
          <AssetUploader label="Social preview image" hint="Shown when links are shared. Best at 1200×630." url={assets.urls.og} busy={assets.busy === "og"} onUpload={(f) => assets.onUpload("og", f)} onRemove={() => assets.onRemove("og")} />
        </div>
      )}
    </div>
  )
}

// ─── Site copy ────────────────────────────────────────────────────

export function SiteSection({ draft, onChange, boardScope, errorFor, boardSlugs }: SectionProps & { boardSlugs: { slug: string; name: string }[] }) {
  const s = draft.site
  const NONE = "none"
  const links = s.footer_links

  function setLink(index: number, patch: Partial<{ label: string; url: string }>) {
    onChange("site", { footer_links: links.map((l, i) => (i === index ? { ...l, ...patch } : l)) })
  }

  return (
    <div className="space-y-6">
      {boardScope && <ScopeNote>This board can override the hero title and subtitle. Everything else is global.</ScopeNote>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Site name" htmlFor="site-name" error={errorFor("site.name")}>
          <Input id="site-name" value={s.name} maxLength={80} disabled={boardScope} onChange={(e) => onChange("site", { name: e.target.value })} />
        </Field>
        <Field label="Team name" htmlFor="site-team" hint="Shown on official responses." error={errorFor("site.team_name")}>
          <Input id="site-team" value={s.team_name} maxLength={40} disabled={boardScope} onChange={(e) => onChange("site", { team_name: e.target.value })} />
        </Field>
      </div>
      <Field label="Tagline" htmlFor="site-tagline" error={errorFor("site.tagline")}>
        <Input id="site-tagline" value={s.tagline ?? ""} maxLength={140} disabled={boardScope} onChange={(e) => onChange("site", { tagline: e.target.value || null })} />
      </Field>
      <Field label="Hero title" htmlFor="site-hero-title" error={errorFor("site.hero_title")}>
        <Input id="site-hero-title" value={s.hero_title} maxLength={140} onChange={(e) => onChange("site", { hero_title: e.target.value })} />
      </Field>
      <Field label="Hero subtitle" htmlFor="site-hero-sub" error={errorFor("site.hero_subtitle")}>
        <Textarea id="site-hero-sub" className="min-h-16" value={s.hero_subtitle ?? ""} maxLength={280} onChange={(e) => onChange("site", { hero_subtitle: e.target.value || null })} />
      </Field>

      {!boardScope && (
        <>
          <Field label="Footer text" htmlFor="site-footer" error={errorFor("site.footer_text")}>
            <Input id="site-footer" value={s.footer_text ?? ""} maxLength={280} onChange={(e) => onChange("site", { footer_text: e.target.value || null })} />
          </Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Footer links</h4>
              <Button type="button" size="lg" variant="outline" className="gap-1.5" disabled={links.length >= 10} onClick={() => onChange("site", { footer_links: [...links, { label: "", url: "https://" }] })}>
                <Plus />
                Add link
              </Button>
            </div>
            {links.length === 0 && <p className="text-xs text-muted-foreground">No footer links.</p>}
            {links.map((link, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row">
                <Input aria-label={`Link ${i + 1} label`} value={link.label} placeholder="Label" maxLength={40} onChange={(e) => setLink(i, { label: e.target.value })} className="sm:w-40" />
                <Input aria-label={`Link ${i + 1} URL`} value={link.url} placeholder="https://…" maxLength={255} onChange={(e) => setLink(i, { url: e.target.value })} />
                <Button type="button" variant="ghost" size="icon-lg" aria-label={`Remove link ${i + 1}`} onClick={() => onChange("site", { footer_links: links.filter((_, j) => j !== i) })}>
                  <Trash2 />
                </Button>
              </div>
            ))}
            {errorFor("site.footer_links") && <p className="text-xs text-destructive">{errorFor("site.footer_links")}</p>}
          </div>

          <Field label="Contact URL" htmlFor="site-contact" hint="A page or mailto: link for “Contact us”." error={errorFor("site.contact_url")}>
            <Input id="site-contact" value={s.contact_url ?? ""} maxLength={255} placeholder="https:// or mailto:" onChange={(e) => onChange("site", { contact_url: e.target.value || null })} />
          </Field>

          <Field label="Default board" hint="Where the public home page sends visitors.">
            <Select value={s.default_board_slug ?? NONE} onValueChange={(v) => onChange("site", { default_board_slug: v === NONE ? null : v })}>
              <SelectTrigger className="w-full sm:w-64" aria-label="Default board">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Show all boards</SelectItem>
                {boardSlugs.map((b) => (
                  <SelectItem key={b.slug} value={b.slug}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Features</h4>
            <ToggleField label="Roadmap page" hint="Show the public roadmap columns." checked={draft.features.roadmap} onChange={(roadmap) => onChange("features", { roadmap })} />
            <ToggleField label="Changelog" hint="Show published release notes." checked={draft.features.changelog} onChange={(changelog) => onChange("features", { changelog })} />
            <ToggleField label="Comments" hint="Allow discussion on posts (boards can still close comments)." checked={draft.features.comments} onChange={(comments) => onChange("features", { comments })} />
            <ToggleField label="Show vote counts" hint="Display the number of votes next to each post." checked={draft.features.show_vote_counts} onChange={(show_vote_counts) => onChange("features", { show_vote_counts })} />
            <ToggleField label="RSS feed" hint="Publish the changelog as an RSS feed." checked={draft.features.rss} onChange={(rss) => onChange("features", { rss })} />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Moderation ───────────────────────────────────────────────────

export function ModerationSection({ draft, onChange, errorFor }: SectionProps) {
  const m = draft.moderation
  return (
    <div className="space-y-6">
      <Field label="Blocked words and phrases" error={errorFor("moderation.blocklist")}>
        <BlocklistInput value={m.blocklist} onChange={(blocklist) => onChange("moderation", { blocklist })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="Links allowed per post" hint="More links send the post to review." value={m.max_links_post} max={20} onChange={(max_links_post) => onChange("moderation", { max_links_post })} error={errorFor("moderation.max_links_post")} />
        <NumberField label="Links allowed per comment" value={m.max_links_comment} max={20} onChange={(max_links_comment) => onChange("moderation", { max_links_comment })} error={errorFor("moderation.max_links_comment")} />
        <NumberField label="Minimum seconds to write a post" hint="Faster submissions look like bots and are rejected." value={m.min_post_seconds} max={120} onChange={(min_post_seconds) => onChange("moderation", { min_post_seconds })} error={errorFor("moderation.min_post_seconds")} />
        <NumberField label="Minimum seconds to write a comment" value={m.min_comment_seconds} max={120} onChange={(min_comment_seconds) => onChange("moderation", { min_comment_seconds })} error={errorFor("moderation.min_comment_seconds")} />
      </div>
    </div>
  )
}

// ─── Limits ───────────────────────────────────────────────────────

export function LimitsSection({ draft, onChange, errorFor }: SectionProps) {
  const l = draft.limits
  const field = (key: keyof RoadmapSettings["limits"], label: string, hint: string, max = 10000) => (
    <NumberField key={key} label={label} hint={hint} value={l[key]} min={1} max={max} onChange={(n) => onChange("limits", { [key]: n } as Partial<RoadmapSettings["limits"]>)} error={errorFor(`limits.${key}`)} />
  )
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Daily caps are counted from the database, so they survive cache clears. IP caps are higher to tolerate offices sharing one address.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("votes_per_visitor_day", "Votes per visitor per day", "Per anonymous visitor.")}
        {field("votes_per_ip_day", "Votes per network per day", "Per hashed IP.", 100000)}
        {field("new_visitor_votes_day", "Votes for brand-new visitors", "Visitors younger than 24 hours.")}
        {field("posts_per_visitor_day", "Posts per visitor per day", "", 1000)}
        {field("posts_per_ip_day", "Posts per network per day", "", 10000)}
        {field("comments_per_visitor_hour", "Comments per visitor per hour", "", 1000)}
        {field("tokens_per_ip_day", "New visitors per network per day", "How many anonymous identities one IP can create.")}
      </div>
    </div>
  )
}

// ─── SEO ──────────────────────────────────────────────────────────

export function SeoSection({ draft, onChange, errorFor }: SectionProps) {
  const s = draft.seo
  return (
    <div className="space-y-6">
      <ToggleField label="Let search engines index the public site" hint="Turn off to add noindex to every public page and hide it from the sitemap." checked={s.indexable} onChange={(indexable) => onChange("seo", { indexable })} />
      <Field label="Title suffix" htmlFor="seo-suffix" hint="Appended to page titles, e.g. “ | PNE”." error={errorFor("seo.title_suffix")}>
        <Input id="seo-suffix" value={s.title_suffix} maxLength={60} onChange={(e) => onChange("seo", { title_suffix: e.target.value })} />
      </Field>
      <Field label="Meta description" htmlFor="seo-desc" hint={`${s.meta_description.length} / 160. Shown in search results when a page has none of its own.`} error={errorFor("seo.meta_description")}>
        <Textarea id="seo-desc" className="min-h-20" value={s.meta_description} maxLength={160} onChange={(e) => onChange("seo", { meta_description: e.target.value })} />
      </Field>
    </div>
  )
}
