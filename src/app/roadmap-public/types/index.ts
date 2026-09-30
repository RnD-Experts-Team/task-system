// src/app/roadmap-public/types/index.ts
// FROZEN CONTRACT for the public roadmap API (/api/public/roadmap/...).
// Field names mirror the Laravel responses exactly (snake_case). Timestamps are ISO-8601 UTC
// with a trailing "Z". Every response uses the envelope { success, data, message } with a
// sibling `pagination` block on paginated lists. The backend builds these with hand-listed
// whitelist resources — never add an internal field here without changing the backend contract.

// ─── Enums ────────────────────────────────────────────────────────

export type StatusKind = "open" | "planned" | "in_progress" | "done" | "closed"
export type PostSort = "top" | "new" | "trending"
export type ChangelogLabel = "new" | "improved" | "fixed"
export type ModerationState = "pending" | "approved" | "rejected" | "spam"
export type VotingMode = "anonymous" | "verified_email"
export type FormKind = "post" | "comment"
export type ThemeMode = "system" | "light" | "dark"
export type RadiusPreset = "sm" | "md" | "lg" | "xl"
export type FontChoice = "outfit" | "system"
export type HeroStyle = "plain" | "gradient" | "pattern"

// ─── Envelope / errors ────────────────────────────────────────────

export interface Pagination {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message: string
}

export interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  pagination: Pagination
}

/** Machine-readable error codes returned in `code` on 4xx business/limit errors. */
export type PublicErrorCode =
  | "visitor_token_required"
  | "visitor_token_invalid"
  | "submissions_closed"
  | "voting_closed"
  | "comments_closed"
  | "duplicate_content"
  | "too_fast"
  | "form_expired"
  | "rate_limited"
  | "daily_limit"
  | "not_found"
  | "validation_error"
  | "server_error"

/** Normalised error thrown by the public API client. */
export interface PublicApiError {
  status: number
  code: PublicErrorCode | string
  message: string
  /** Seconds to wait before retrying (429 only). */
  retryAfter: number | null
  /** Laravel 422 field errors. */
  fieldErrors: Record<string, string[]>
}

// ─── Shared building blocks ───────────────────────────────────────

export interface StatusRef {
  slug: string
  name: string
  color: string // "#rrggbb"
  kind: StatusKind
}

export interface TagRef {
  slug: string
  name: string
  color: string
}

export interface PublicAuthor {
  /** Visitor-supplied display name, or "Anonymous". Team members show the configured team name. */
  name: string
  is_team: boolean
}

// ─── Site config ──────────────────────────────────────────────────

/** Computed CSS variables (server-authoritative, contrast-checked). Keys like "--primary". */
export type ThemeTokens = Record<string, string>

export interface PublicTheme {
  light: ThemeTokens
  dark: ThemeTokens
  radius: string // e.g. "0.875rem"
  font: FontChoice
  default_theme: ThemeMode
}

export interface PublicSite {
  name: string
  tagline: string | null
  hero_title: string
  hero_subtitle: string | null
  hero_style: HeroStyle
  team_name: string
  footer_text: string | null
  footer_links: { label: string; url: string }[]
  contact_url: string | null
  default_board_slug: string | null
}

export interface PublicFeatures {
  roadmap: boolean
  changelog: boolean
  comments: boolean
  show_vote_counts: boolean
  rss: boolean
}

export interface PublicAssets {
  logo_url: string | null
  logo_dark_url: string | null
  favicon_url: string | null
  og_image_url: string | null
}

export interface BoardSummary {
  slug: string
  name: string
  description: string | null
  icon: string | null
  posts_count: number
}

export interface LimitsHint {
  title_min: number
  title_max: number
  body_max: number
  comment_min: number
  comment_max: number
  author_name_max: number
  max_tags: number
}

/** GET /config */
export interface PublicConfig {
  site: PublicSite
  theme: PublicTheme
  features: PublicFeatures
  assets: PublicAssets
  boards: BoardSummary[]
  limits_hint: LimitsHint
  /** Changes whenever settings change; use as a cache-buster. */
  version: string
}

// ─── Boards ───────────────────────────────────────────────────────

export interface PublicStatus extends StatusRef {
  is_roadmap_column: boolean
  is_default: boolean
  locks_voting: boolean
  posts_count: number
}

export interface PublicTag extends TagRef {
  posts_count: number
}

export interface BoardInfo {
  slug: string
  name: string
  description: string | null
  icon: string | null
  allow_submissions: boolean
  allow_comments: boolean
  allow_votes: boolean
  voting_mode: VotingMode
  /** True when new posts wait for admin approval (drives the post-submit message). */
  requires_review: boolean
  posts_count: number
}

/** GET /boards/{board} */
export interface BoardDetail {
  board: BoardInfo
  statuses: PublicStatus[]
  tags: PublicTag[]
}

// ─── Posts ────────────────────────────────────────────────────────

/** Item of GET /boards/{board}/posts and of roadmap columns. */
export interface PublicPostListItem {
  number: number
  slug: string
  title: string
  excerpt: string // first ~200 chars, plain text
  author: PublicAuthor
  status: StatusRef
  tags: TagRef[]
  votes_count: number
  comments_count: number
  is_pinned: boolean
  has_response: boolean
  published_at: string | null
  /** SPA path, e.g. "/roadmap/web-app/p/42-dark-mode" */
  url_path: string
}

export interface StatusHistoryEntry {
  from: Pick<StatusRef, "slug" | "name" | "color"> | null
  to: Pick<StatusRef, "slug" | "name" | "color">
  note: string | null
  at: string
}

export interface OfficialResponse {
  /** Server-sanitised HTML. Safe to render with <TrustedHtml>. */
  body_html: string
  responded_at: string
  by: string // team name
}

export interface MergedInto {
  board_slug: string
  number: number
  slug: string
}

export interface RelatedChangelog {
  slug: string
  title: string
  label: ChangelogLabel
  published_at: string
}

/** GET /boards/{board}/posts/{number} */
export interface PublicPostDetail extends PublicPostListItem {
  body: string // plain text — render as text, linkify only
  response: OfficialResponse | null
  status_history: StatusHistoryEntry[]
  merged_into: MergedInto | null
  related_changelog: RelatedChangelog[]
  board: { slug: string; name: string }
  /** Current slug; if it differs from the URL the SPA replaces the URL. */
  canonical_slug: string
  /** Only set for the owning visitor (that response is no-store). */
  viewer: { is_owner_pending: boolean; moderation_state: ModerationState | null }
}

/** GET /boards/{board}/posts/similar?q= */
export interface SimilarPost {
  number: number
  slug: string
  title: string
  votes_count: number
  status: Pick<StatusRef, "slug" | "name" | "color">
  url_path: string
}

export interface PostListParams {
  q?: string
  sort?: PostSort
  status?: string[] // status slugs
  tag?: string[] // tag slugs
  page?: number
  per_page?: number // 1-30
}

/** POST /boards/{board}/posts */
export interface SubmitPostPayload {
  title: string // 8-140
  body?: string | null // <= 5000
  author_name?: string | null // <= 40
  tag_slugs?: string[] // <= 3
  form_token: string
  /** Honeypot — must stay empty. */
  website?: string
}

export interface SubmitPostResult {
  number: number
  slug: string
  moderation_state: "pending" | "approved"
  url_path: string
}

// ─── Votes ────────────────────────────────────────────────────────

/** POST /boards/{board}/posts/{number}/vote  body { voted } */
export interface VoteResult {
  voted: boolean
  votes_count: number
}

// ─── Comments ─────────────────────────────────────────────────────

export interface PublicComment {
  id: number
  parent_id: number | null
  author: PublicAuthor
  body: string // plain text
  created_at: string
  replies: PublicComment[]
}

export interface SubmitCommentPayload {
  body: string // 2-2000
  author_name?: string | null
  parent_id?: number | null
  form_token: string
  website?: string
}

export interface SubmitCommentResult {
  id: number | null
  moderation_state: "pending" | "approved"
}

// ─── Roadmap ──────────────────────────────────────────────────────

export interface RoadmapColumn {
  status: StatusRef
  /** Total approved posts in this status (for "See all N"). */
  total: number
  posts: PublicPostListItem[]
}

/** GET /boards/{board}/roadmap */
export interface RoadmapData {
  columns: RoadmapColumn[]
  generated_at: string
}

// ─── Changelog ────────────────────────────────────────────────────

export interface ChangelogListItem {
  slug: string
  title: string
  summary: string | null
  label: ChangelogLabel
  published_at: string
  board: { slug: string; name: string } | null
  url_path: string
}

export interface RelatedPost {
  board_slug: string
  number: number
  slug: string
  title: string
  url_path: string
}

/** GET /changelog/{slug} */
export interface ChangelogDetail extends ChangelogListItem {
  /** Server-sanitised HTML. */
  body_html: string
  related_posts: RelatedPost[]
}

export interface ChangelogListParams {
  board?: string
  label?: ChangelogLabel
  page?: number
  per_page?: number
}

// ─── Visitor identity & anti-abuse ────────────────────────────────

/** POST /visitor */
export interface VisitorIssueResult {
  visitor_token: string // "rmv_…" — store in localStorage['pne.rm.v1'], send as X-Visitor-Token
  is_new: boolean
}

/** POST /forms/{kind}/start  body { board } */
export interface FormStartResult {
  form_token: string
  min_seconds: number
  max_age_seconds: number
}

/** GET /me/state?board= */
export interface MeState {
  voted_post_numbers: number[]
  own_pending: {
    type: "post" | "comment"
    number: number | null
    title: string | null
    created_at: string
  }[]
}

// ─── Client-side constants (mirror server rules) ──────────────────

export const VISITOR_STORAGE_KEY = "pne.rm.v1"
export const VISITOR_HEADER = "X-Visitor-Token"
export const PUBLIC_POST_PAGE_SIZE = 15
