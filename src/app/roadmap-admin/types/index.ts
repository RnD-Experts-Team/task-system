// src/app/roadmap-admin/types/index.ts
// FROZEN CONTRACT for the admin API (/api/roadmap/admin/...). Same envelope as the rest of the
// app: { success, data, message } plus a sibling `pagination` on lists. Timestamps are ISO-8601
// UTC ("...Z"). Admin output never includes token hashes or raw IPs; ip hashes are 32-char
// hex strings (rotated monthly) and are only useful for grouping/bulk removal.
//
// Permissions (guard "sanctum"): "manage roadmap", "moderate roadmap", "manage roadmap settings",
// "manage changelog". The `admin` role always passes (role_or_permission).

import type {
  ChangelogLabel,
  FontChoice,
  HeroStyle,
  ModerationState,
  Pagination,
  RadiusPreset,
  StatusKind,
  ThemeMode,
  VotingMode,
} from "@/app/roadmap-public/types"

export type { ChangelogLabel, ModerationState, Pagination, StatusKind, VotingMode }

export type ChangelogStatus = "draft" | "published"
export type AdminPostSort = "votes" | "new" | "activity"
export type AbuseEventType =
  | "honeypot"
  | "too_fast"
  | "keyword"
  | "duplicate"
  | "link_flood"
  | "rate_limited"
  | "daily_limit"
  | "banned_write"
  | "bad_token"
  | "spike"

export const ADMIN_PERMISSIONS = {
  manage: "manage roadmap",
  moderate: "moderate roadmap",
  settings: "manage roadmap settings",
  changelog: "manage changelog",
} as const

// ─── Boards / statuses / tags ─────────────────────────────────────

export interface AdminStatus {
  id: number
  board_id: number
  name: string
  slug: string
  color: string
  kind: StatusKind
  sort_order: number
  is_roadmap_column: boolean
  is_default: boolean
  locks_voting: boolean
  posts_count: number
}

export interface AdminTag {
  id: number
  board_id: number
  name: string
  slug: string
  color: string
  sort_order: number
  posts_count: number
}

export interface AdminBoard {
  id: number
  slug: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  is_archived: boolean
  voting_mode: VotingMode
  allow_submissions: boolean
  allow_comments: boolean
  allow_votes: boolean
  require_post_approval: boolean
  require_comment_approval: boolean
  trust_after_approved: number | null
  posts_count: number
  pending_count: number
  created_at: string
  updated_at: string
  /** Included by GET /boards/{id} only. */
  statuses?: AdminStatus[]
  tags?: AdminTag[]
}

export interface BoardPayload {
  name: string
  slug?: string | null
  description?: string | null
  icon?: string | null
  is_archived?: boolean
  voting_mode?: VotingMode
  allow_submissions?: boolean
  allow_comments?: boolean
  allow_votes?: boolean
  require_post_approval?: boolean
  require_comment_approval?: boolean
  trust_after_approved?: number | null
}

export interface StatusPayload {
  name: string
  slug?: string | null
  color: string
  kind: StatusKind
  is_roadmap_column?: boolean
  locks_voting?: boolean
}

export interface TagPayload {
  name: string
  slug?: string | null
  color?: string
}

// ─── Visitors ─────────────────────────────────────────────────────

export interface AdminVisitorRef {
  id: string // ULID
  is_banned: boolean
  is_trusted: boolean
  /** First 8 chars of the ip hash — display only. */
  ip_hash_short: string | null
  approved_posts_count: number
}

export interface AdminVisitor extends AdminVisitorRef {
  ip_hash: string | null // full 32-char hash (for bulk removal)
  banned_reason: string | null
  banned_at: string | null
  first_seen_at: string | null
  last_seen_at: string | null
  posts_count: number
  comments_count: number
  approved_comments_count: number
  votes_count: number
  /** Heuristic flag from SuspicionService. */
  suspicious: boolean
}

export interface AdminVisitorDetail extends AdminVisitor {
  recent_posts: { id: number; number: number; board_slug: string; title: string; moderation_state: ModerationState; created_at: string }[]
  recent_comments: { id: number; post_id: number; body: string; moderation_state: ModerationState; created_at: string }[]
  recent_votes: { post_id: number; post_title: string; created_at: string }[]
  /** Other visitors seen from the same ip hash (for spotting sock puppets). */
  same_ip_visitors: number
}

export interface BanPayload {
  reason?: string | null
  remove_content?: boolean
  remove_votes?: boolean
}

export interface BulkRemovePayload {
  by: "visitor" | "ip_hash"
  value: string
  remove: ("votes" | "posts" | "comments")[]
  ban?: boolean
  reason?: string | null
}

export interface BulkRemoveResult {
  votes_removed: number
  posts_removed: number
  comments_removed: number
  visitors_banned: number
}

export interface AbuseEvent {
  id: number
  type: AbuseEventType
  visitor_id: string | null
  ip_hash_short: string | null
  board_id: number | null
  meta: Record<string, unknown> | null
  created_at: string
}

// ─── Posts ────────────────────────────────────────────────────────

export interface AdminStatusRef {
  id: number
  slug: string
  name: string
  color: string
  kind: StatusKind
}

export interface AdminTagRef {
  id: number
  slug: string
  name: string
  color: string
}

export interface AdminPostListItem {
  id: number
  board: { id: number; slug: string; name: string }
  number: number
  slug: string
  title: string
  excerpt: string
  author_name: string | null
  /** null for admin-created posts. */
  visitor: AdminVisitorRef | null
  created_by_admin: boolean
  moderation_state: ModerationState
  status: AdminStatusRef
  tags: AdminTagRef[]
  votes_count: number
  comments_count: number
  pending_comments_count: number
  is_pinned: boolean
  flags: string[]
  merged_into_post_id: number | null
  created_at: string
  published_at: string | null
  last_activity_at: string | null
}

export interface AdminStatusChange {
  id: number
  from: AdminStatusRef | null
  to: AdminStatusRef
  note: string | null
  is_public: boolean
  changed_by_name: string | null
  at: string
}

export interface AdminPostDetail extends AdminPostListItem {
  body: string | null
  response_md: string | null
  response_html: string | null
  responded_at: string | null
  moderation_reason: string | null
  status_history: AdminStatusChange[]
  merged_from: { id: number; number: number; title: string }[]
  public_url_path: string
  /** Votes grouped by ip hash prefix — highlights concentrated voting. */
  votes_by_ip: { ip_hash_short: string; count: number }[]
}

export interface AdminPostFilters {
  board_id?: number
  moderation_state?: ModerationState | "all"
  status_id?: number
  tag_id?: number
  q?: string
  sort?: AdminPostSort
  visitor_id?: string
  ip_hash?: string
  page?: number
  per_page?: number // <= 50
}

export interface CreateAdminPostPayload {
  board_id: number
  title: string
  body?: string | null
  status_id?: number
  tag_ids?: number[]
}

export interface UpdateAdminPostPayload {
  title?: string
  body?: string | null
  author_name?: string | null
}

export interface ModeratePayload {
  state: ModerationState
  reason?: string | null
}

export interface BulkModeratePayload {
  ids: number[] // <= 100
  state: ModerationState
}

export interface ChangeStatusPayload {
  status_id: number
  note?: string | null
  note_is_public?: boolean
}

export interface MergePreview {
  votes_moving: number
  overlapping_voters: number
  comments_moving: number
  target_votes_after: number
}

// ─── Roadmap kanban ───────────────────────────────────────────────

export interface KanbanCard {
  id: number
  number: number
  title: string
  votes_count: number
  comments_count: number
  is_pinned: boolean
  tags: AdminTagRef[]
  roadmap_order: number
}

export interface KanbanColumn {
  status: AdminStatusRef
  posts: KanbanCard[]
}

/** GET /boards/{board}/roadmap */
export interface AdminRoadmapData {
  board: { id: number; slug: string; name: string }
  columns: KanbanColumn[]
}

export interface RoadmapMovePayload {
  post_id: number
  to_status_id: number
  /** Full ordered list of post ids in the destination column after the move. */
  ordered_ids: number[]
}

// ─── Comments ─────────────────────────────────────────────────────

export interface AdminComment {
  id: number
  post: { id: number; number: number; title: string; board_slug: string }
  parent_id: number | null
  author_name: string | null
  is_admin: boolean
  body: string
  moderation_state: ModerationState
  visitor: AdminVisitorRef | null
  flags: string[]
  created_at: string
}

export interface CommentFilters {
  moderation_state?: ModerationState | "all"
  post_id?: number
  visitor_id?: string
  page?: number
  per_page?: number
}

// ─── Changelog ────────────────────────────────────────────────────

export interface AdminChangelogEntry {
  id: number
  board: { id: number; slug: string; name: string } | null
  title: string
  slug: string
  summary: string | null
  label: ChangelogLabel
  status: ChangelogStatus
  /** Future date on a published entry = scheduled. */
  published_at: string | null
  is_scheduled: boolean
  linked_posts_count: number
  created_at: string
  updated_at: string
}

export interface AdminChangelogDetail extends AdminChangelogEntry {
  body_md: string | null
  body_html: string | null
  linked_posts: { id: number; number: number; board_slug: string; title: string }[]
}

export interface ChangelogPayload {
  title: string
  slug?: string | null
  board_id?: number | null
  label: ChangelogLabel
  summary?: string | null
  body_md: string
  published_at?: string | null
}

export interface ChangelogFilters {
  status?: ChangelogStatus | "all"
  board_id?: number
  page?: number
  per_page?: number
}

export interface SyncChangelogPostsPayload {
  post_ids: number[]
  mark_status_id?: number | null
}

// ─── Settings & branding ──────────────────────────────────────────

export interface RoadmapSettings {
  site: {
    name: string
    tagline: string | null
    hero_title: string
    hero_subtitle: string | null
    team_name: string
    footer_text: string | null
    footer_links: { label: string; url: string }[]
    contact_url: string | null
    default_board_slug: string | null
  }
  branding: {
    primary: string // "#rrggbb"
    radius: RadiusPreset
    font: FontChoice
    default_theme: ThemeMode
    hero_style: HeroStyle
    logo_path: string | null
    logo_dark_path: string | null
    favicon_path: string | null
  }
  features: {
    roadmap: boolean
    changelog: boolean
    comments: boolean
    show_vote_counts: boolean
    rss: boolean
  }
  moderation: {
    blocklist: string[] // <= 500 entries, each <= 60 chars
    max_links_post: number
    max_links_comment: number
    min_post_seconds: number
    min_comment_seconds: number
  }
  limits: {
    votes_per_visitor_day: number
    votes_per_ip_day: number
    new_visitor_votes_day: number
    posts_per_visitor_day: number
    posts_per_ip_day: number
    comments_per_visitor_hour: number
    tokens_per_ip_day: number
  }
}

/** GET /settings?scope=global|board:{id} */
export interface SettingsResponse {
  scope: string
  settings: RoadmapSettings
  /** Computed public theme for the live preview. */
  theme: import("@/app/roadmap-public/types").PublicTheme
  assets: import("@/app/roadmap-public/types").PublicAssets
}

export interface ThemePreviewPayload {
  branding: Pick<RoadmapSettings["branding"], "primary" | "radius" | "font" | "default_theme">
}

export type AssetType = "logo" | "logo_dark" | "favicon"

export interface AssetUploadResult {
  type: AssetType
  path: string
  url: string
}

export interface MarkdownPreviewResult {
  html: string
}

// ─── Analytics ────────────────────────────────────────────────────

export interface SuspiciousItem {
  type: "post" | "ip_hash" | "visitor"
  reason_code: string
  /** Human-readable subject (post title, short ip hash, visitor id). */
  subject: string
  /** Value usable with the bulk-remove / filter endpoints (post id, full ip hash, visitor id). */
  ref: string
  score: number
}

/** GET /analytics/summary?board_id&days=30 */
export interface AnalyticsSummary {
  totals: { posts: number; votes: number; comments: number; visitors: number }
  moderation_backlog: { posts: number; comments: number }
  votes_per_day: { date: string; count: number }[]
  posts_per_day: { date: string; count: number }[]
  top_posts: {
    id: number
    number: number
    board_slug: string
    title: string
    votes_count: number
    status: AdminStatusRef
  }[]
  by_status: { status: AdminStatusRef; count: number }[]
  suspicious: SuspiciousItem[]
}
