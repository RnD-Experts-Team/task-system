// src/app/roadmap-admin/services/roadmapAdminService.ts
// Wraps every /roadmap/admin endpoint. One method per backend route.
// Mutations pass a { toast: { success } } config so the axios interceptor shows a
// success toast; errors are toasted automatically by the interceptor. List endpoints return
// the full envelope (with the sibling `pagination` block) via an `as unknown as` cast.

import { apiClient } from "@/services/api"
import type {
  AbuseEvent,
  AdminBoard,
  AdminChangelogDetail,
  AdminChangelogEntry,
  AdminComment,
  AdminPostDetail,
  AdminPostFilters,
  AdminPostListItem,
  AdminRoadmapData,
  AdminStatus,
  AdminTag,
  AdminVisitor,
  AdminVisitorDetail,
  AnalyticsSummary,
  AssetType,
  AssetUploadResult,
  BanPayload,
  BoardPayload,
  BulkModeratePayload,
  BulkRemovePayload,
  BulkRemoveResult,
  ChangeStatusPayload,
  ChangelogFilters,
  ChangelogPayload,
  CommentFilters,
  CreateAdminPostPayload,
  MarkdownPreviewResult,
  MergePreview,
  ModeratePayload,
  Pagination,
  RoadmapMovePayload,
  RoadmapSettings,
  SettingsResponse,
  StatusPayload,
  SyncChangelogPostsPayload,
  TagPayload,
  ThemePreviewPayload,
  UpdateAdminPostPayload,
} from "../types"
import type { PublicTheme } from "@/app/roadmap-public/types"

const BASE = "/roadmap/admin"

/** A paginated list response: rows + the sibling pagination block. */
export interface PagedResult<T> {
  data: T[]
  pagination: Pagination
}

/** Params accepted by GET /visitors. */
export interface VisitorFilters {
  banned?: boolean
  trusted?: boolean
  q?: string
  sort?: "last_seen" | "first_seen" | "votes" | "posts"
  page?: number
  per_page?: number
}

/** Params accepted by GET /abuse/events. */
export interface AbuseEventFilters {
  type?: string
  visitor_id?: string
  ip_hash?: string
  board_id?: number
  page?: number
  per_page?: number
}

/** Board-scope-aware settings payload accepted by PUT /settings. */
export interface UpdateSettingsPayload {
  scope: string
  data: DeepPartial<RoadmapSettings>
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? (T[K] extends unknown[] ? T[K] : DeepPartial<T[K]>) : T[K] }

// Strip "all"/undefined/empty values and map arrays to Laravel's "key[]" form
function buildParams(params: object): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === "all") continue
    if (Array.isArray(value)) {
      if (value.length > 0) out[`${key}[]`] = value
      continue
    }
    if (typeof value === "boolean") {
      out[key] = value ? 1 : 0
      continue
    }
    out[key] = value
  }
  return out
}

async function patchRequest<T>(url: string, data: unknown, config: Record<string, unknown> = {}) {
  return apiClient.patch<T>(url, data, config as never)
}

// Background calls (previews) must never spam the user with error toasts.
const SILENT = { toast: { error: "" } } as never

class RoadmapAdminService {
  // ─── Analytics ────────────────────────────────────────────────────

  // GET /analytics/summary?board_id&days
  async getAnalytics(params: { board_id?: number; days?: number } = {}): Promise<AnalyticsSummary> {
    const response = await apiClient.get<AnalyticsSummary>(`${BASE}/analytics/summary`, {
      params: buildParams(params),
    })
    return response.data
  }

  // ─── Boards ───────────────────────────────────────────────────────

  // GET /boards
  async listBoards(): Promise<AdminBoard[]> {
    const response = await apiClient.get<AdminBoard[]>(`${BASE}/boards`)
    return response.data
  }

  // GET /boards/{id} — includes statuses + tags
  async getBoard(id: number): Promise<AdminBoard> {
    const response = await apiClient.get<AdminBoard>(`${BASE}/boards/${id}`)
    return response.data
  }

  // POST /boards
  async createBoard(payload: BoardPayload): Promise<AdminBoard> {
    const response = await apiClient.post<AdminBoard>(`${BASE}/boards`, payload, {
      toast: { success: "Board created" },
    } as never)
    return response.data
  }

  // PATCH /boards/{id}
  async updateBoard(id: number, payload: Partial<BoardPayload>, successMessage = "Board updated"): Promise<AdminBoard> {
    const response = await patchRequest<AdminBoard>(`${BASE}/boards/${id}`, payload, {
      toast: { success: successMessage },
    } as never)
    return response.data
  }

  // DELETE /boards/{id} — only when the board has no posts
  async deleteBoard(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/boards/${id}`, { toast: { success: "Board deleted" } } as never)
  }

  // POST /boards/reorder
  async reorderBoards(ids: number[]): Promise<void> {
    await apiClient.post(`${BASE}/boards/reorder`, { ids })
  }

  // ─── Statuses ─────────────────────────────────────────────────────

  // GET /boards/{board}/statuses
  async listStatuses(boardId: number): Promise<AdminStatus[]> {
    const response = await apiClient.get<AdminStatus[]>(`${BASE}/boards/${boardId}/statuses`)
    return response.data
  }

  // POST /boards/{board}/statuses
  async createStatus(boardId: number, payload: StatusPayload): Promise<AdminStatus> {
    const response = await apiClient.post<AdminStatus>(`${BASE}/boards/${boardId}/statuses`, payload, {
      toast: { success: "Status created" },
    } as never)
    return response.data
  }

  // PATCH /statuses/{status}
  async updateStatus(id: number, payload: Partial<StatusPayload>): Promise<AdminStatus> {
    const response = await patchRequest<AdminStatus>(`${BASE}/statuses/${id}`, payload, {
      toast: { success: "Status updated" },
    } as never)
    return response.data
  }

  // DELETE /statuses/{status}?reassign_to_status_id
  async deleteStatus(id: number, reassignToStatusId?: number | null): Promise<void> {
    await apiClient.delete(`${BASE}/statuses/${id}`, {
      params: buildParams({ reassign_to_status_id: reassignToStatusId }),
      toast: { success: "Status deleted" },
    } as never)
  }

  // POST /boards/{board}/statuses/reorder
  async reorderStatuses(boardId: number, ids: number[]): Promise<void> {
    await apiClient.post(`${BASE}/boards/${boardId}/statuses/reorder`, { ids })
  }

  // POST /boards/{board}/statuses/{status}/make-default
  async makeStatusDefault(boardId: number, statusId: number): Promise<void> {
    await apiClient.post(`${BASE}/boards/${boardId}/statuses/${statusId}/make-default`, undefined, {
      toast: { success: "Default status updated" },
    } as never)
  }

  // ─── Tags ─────────────────────────────────────────────────────────

  // GET /boards/{board}/tags
  async listTags(boardId: number): Promise<AdminTag[]> {
    const response = await apiClient.get<AdminTag[]>(`${BASE}/boards/${boardId}/tags`)
    return response.data
  }

  // POST /boards/{board}/tags
  async createTag(boardId: number, payload: TagPayload): Promise<AdminTag> {
    const response = await apiClient.post<AdminTag>(`${BASE}/boards/${boardId}/tags`, payload, {
      toast: { success: "Tag created" },
    } as never)
    return response.data
  }

  // PATCH /tags/{tag}
  async updateTag(id: number, payload: Partial<TagPayload>): Promise<AdminTag> {
    const response = await patchRequest<AdminTag>(`${BASE}/tags/${id}`, payload, {
      toast: { success: "Tag updated" },
    } as never)
    return response.data
  }

  // DELETE /tags/{tag}
  async deleteTag(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/tags/${id}`, { toast: { success: "Tag deleted" } } as never)
  }

  // POST /boards/{board}/tags/reorder
  async reorderTags(boardId: number, ids: number[]): Promise<void> {
    await apiClient.post(`${BASE}/boards/${boardId}/tags/reorder`, { ids })
  }

  // ─── Posts ────────────────────────────────────────────────────────

  // GET /posts
  async listPosts(filters: AdminPostFilters = {}): Promise<PagedResult<AdminPostListItem>> {
    const raw = (await apiClient.get<unknown>(`${BASE}/posts`, {
      params: buildParams(filters),
    })) as unknown as PagedResult<AdminPostListItem>
    return raw
  }

  // GET /posts/{post}
  async getPost(id: number): Promise<AdminPostDetail> {
    const response = await apiClient.get<AdminPostDetail>(`${BASE}/posts/${id}`)
    return response.data
  }

  // POST /posts — admin-created post
  async createPost(payload: CreateAdminPostPayload): Promise<AdminPostDetail> {
    const response = await apiClient.post<AdminPostDetail>(`${BASE}/posts`, payload, {
      toast: { success: "Post created" },
    } as never)
    return response.data
  }

  // PATCH /posts/{post}
  async updatePost(id: number, payload: UpdateAdminPostPayload): Promise<AdminPostDetail> {
    const response = await patchRequest<AdminPostDetail>(`${BASE}/posts/${id}`, payload, {
      toast: { success: "Post updated" },
    } as never)
    return response.data
  }

  // DELETE /posts/{post}
  async deletePost(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/posts/${id}`, { toast: { success: "Post deleted" } } as never)
  }

  // POST /posts/{post}/moderate — silent: the caller shows an undo toast
  async moderatePost(id: number, payload: ModeratePayload): Promise<AdminPostDetail> {
    const response = await apiClient.post<AdminPostDetail>(`${BASE}/posts/${id}/moderate`, payload)
    return response.data
  }

  // POST /posts/bulk-moderate
  async bulkModeratePosts(payload: BulkModeratePayload): Promise<void> {
    await apiClient.post(`${BASE}/posts/bulk-moderate`, payload)
  }

  // POST /posts/{post}/status
  async changePostStatus(id: number, payload: ChangeStatusPayload): Promise<AdminPostDetail> {
    const response = await apiClient.post<AdminPostDetail>(`${BASE}/posts/${id}/status`, payload, {
      toast: { success: "Status updated" },
    } as never)
    return response.data
  }

  // PUT /posts/{post}/response
  async setPostResponse(id: number, bodyMd: string): Promise<AdminPostDetail> {
    const response = await apiClient.put<AdminPostDetail>(
      `${BASE}/posts/${id}/response`,
      { body_md: bodyMd },
      { toast: { success: "Official response saved" } } as never
    )
    return response.data
  }

  // DELETE /posts/{post}/response
  async clearPostResponse(id: number): Promise<AdminPostDetail> {
    const response = await apiClient.delete<AdminPostDetail>(`${BASE}/posts/${id}/response`, {
      toast: { success: "Official response removed" },
    } as never)
    return response.data
  }

  // POST /posts/{post}/pin
  async pinPost(id: number, isPinned: boolean): Promise<AdminPostDetail> {
    const response = await apiClient.post<AdminPostDetail>(
      `${BASE}/posts/${id}/pin`,
      { pinned: isPinned },
      { toast: { success: isPinned ? "Post pinned" : "Post unpinned" } } as never
    )
    return response.data
  }

  // POST /posts/{post}/merge/preview
  async mergePreview(id: number, targetPostId: number): Promise<MergePreview> {
    const response = await apiClient.post<MergePreview>(`${BASE}/posts/${id}/merge/preview`, {
      target_post_id: targetPostId,
    })
    return response.data
  }

  // POST /posts/{post}/merge
  async mergePost(id: number, targetPostId: number): Promise<void> {
    await apiClient.post(
      `${BASE}/posts/${id}/merge`,
      { target_post_id: targetPostId },
      { toast: { success: "Posts merged" } } as never
    )
  }

  // POST /posts/{post}/move
  async movePost(id: number, boardId: number, statusId?: number | null): Promise<AdminPostDetail> {
    const response = await apiClient.post<AdminPostDetail>(
      `${BASE}/posts/${id}/move`,
      { board_id: boardId, ...(statusId ? { status_id: statusId } : {}) },
      { toast: { success: "Post moved" } } as never
    )
    return response.data
  }

  // PUT /posts/{post}/tags
  async syncPostTags(id: number, tagIds: number[]): Promise<AdminPostDetail> {
    const response = await apiClient.put<AdminPostDetail>(`${BASE}/posts/${id}/tags`, { tag_ids: tagIds })
    return response.data
  }

  // ─── Roadmap kanban ───────────────────────────────────────────────

  // GET /boards/{board}/roadmap
  async getRoadmap(boardId: number): Promise<AdminRoadmapData> {
    const response = await apiClient.get<AdminRoadmapData>(`${BASE}/boards/${boardId}/roadmap`)
    return response.data
  }

  // POST /boards/{board}/roadmap/move
  async moveOnRoadmap(boardId: number, payload: RoadmapMovePayload): Promise<void> {
    await apiClient.post(`${BASE}/boards/${boardId}/roadmap/move`, payload)
  }

  // ─── Comments ─────────────────────────────────────────────────────

  // GET /comments
  async listComments(filters: CommentFilters = {}): Promise<PagedResult<AdminComment>> {
    const raw = (await apiClient.get<unknown>(`${BASE}/comments`, {
      params: buildParams(filters),
    })) as unknown as PagedResult<AdminComment>
    return raw
  }

  // POST /comments/{comment}/moderate
  async moderateComment(id: number, payload: ModeratePayload): Promise<AdminComment> {
    const response = await apiClient.post<AdminComment>(`${BASE}/comments/${id}/moderate`, payload)
    return response.data
  }

  // POST /comments/bulk-moderate
  async bulkModerateComments(payload: BulkModeratePayload): Promise<void> {
    await apiClient.post(`${BASE}/comments/bulk-moderate`, payload)
  }

  // DELETE /comments/{comment}
  async deleteComment(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/comments/${id}`, { toast: { success: "Comment deleted" } } as never)
  }

  // POST /posts/{post}/comments — team reply
  async replyToPost(postId: number, body: string, parentId?: number | null): Promise<AdminComment> {
    const response = await apiClient.post<AdminComment>(
      `${BASE}/posts/${postId}/comments`,
      { body, ...(parentId ? { parent_id: parentId } : {}) },
      { toast: { success: "Reply posted" } } as never
    )
    return response.data
  }

  // ─── Visitors & abuse ─────────────────────────────────────────────

  // GET /visitors
  async listVisitors(filters: VisitorFilters = {}): Promise<PagedResult<AdminVisitor>> {
    const raw = (await apiClient.get<unknown>(`${BASE}/visitors`, {
      params: buildParams(filters),
    })) as unknown as PagedResult<AdminVisitor>
    return raw
  }

  // GET /visitors/{visitor}
  async getVisitor(id: string): Promise<AdminVisitorDetail> {
    const response = await apiClient.get<AdminVisitorDetail>(`${BASE}/visitors/${id}`)
    return response.data
  }

  // POST /visitors/{visitor}/ban
  async banVisitor(id: string, payload: BanPayload): Promise<AdminVisitor> {
    const response = await apiClient.post<AdminVisitor>(`${BASE}/visitors/${id}/ban`, payload, {
      toast: { success: "Visitor banned" },
    } as never)
    return response.data
  }

  // POST /visitors/{visitor}/unban
  async unbanVisitor(id: string): Promise<AdminVisitor> {
    const response = await apiClient.post<AdminVisitor>(`${BASE}/visitors/${id}/unban`, undefined, {
      toast: { success: "Visitor unbanned" },
    } as never)
    return response.data
  }

  // POST /abuse/bulk-remove
  async bulkRemove(payload: BulkRemovePayload): Promise<BulkRemoveResult> {
    const response = await apiClient.post<BulkRemoveResult>(`${BASE}/abuse/bulk-remove`, payload)
    return response.data
  }

  // GET /abuse/events
  async listAbuseEvents(filters: AbuseEventFilters = {}): Promise<PagedResult<AbuseEvent>> {
    const raw = (await apiClient.get<unknown>(`${BASE}/abuse/events`, {
      params: buildParams(filters),
    })) as unknown as PagedResult<AbuseEvent>
    return raw
  }

  // ─── Changelog ────────────────────────────────────────────────────

  // GET /changelog
  async listChangelog(filters: ChangelogFilters = {}): Promise<PagedResult<AdminChangelogEntry>> {
    const raw = (await apiClient.get<unknown>(`${BASE}/changelog`, {
      params: buildParams(filters),
    })) as unknown as PagedResult<AdminChangelogEntry>
    return raw
  }

  // GET /changelog/{entry}
  async getChangelogEntry(id: number): Promise<AdminChangelogDetail> {
    const response = await apiClient.get<AdminChangelogDetail>(`${BASE}/changelog/${id}`)
    return response.data
  }

  // POST /changelog
  async createChangelogEntry(payload: ChangelogPayload): Promise<AdminChangelogDetail> {
    const response = await apiClient.post<AdminChangelogDetail>(`${BASE}/changelog`, payload, {
      toast: { success: "Entry saved" },
    } as never)
    return response.data
  }

  // PATCH /changelog/{entry}
  async updateChangelogEntry(id: number, payload: Partial<ChangelogPayload>): Promise<AdminChangelogDetail> {
    const response = await patchRequest<AdminChangelogDetail>(`${BASE}/changelog/${id}`, payload, {
      toast: { success: "Entry saved" },
    } as never)
    return response.data
  }

  // DELETE /changelog/{entry}
  async deleteChangelogEntry(id: number): Promise<void> {
    await apiClient.delete(`${BASE}/changelog/${id}`, { toast: { success: "Entry deleted" } } as never)
  }

  // POST /changelog/{entry}/publish — optional published_at (future = scheduled)
  async publishChangelogEntry(id: number, publishedAt?: string | null): Promise<AdminChangelogDetail> {
    const response = await apiClient.post<AdminChangelogDetail>(
      `${BASE}/changelog/${id}/publish`,
      publishedAt ? { published_at: publishedAt } : {},
      { toast: { success: publishedAt ? "Entry scheduled" : "Entry published" } } as never
    )
    return response.data
  }

  // POST /changelog/{entry}/unpublish
  async unpublishChangelogEntry(id: number): Promise<AdminChangelogDetail> {
    const response = await apiClient.post<AdminChangelogDetail>(`${BASE}/changelog/${id}/unpublish`, undefined, {
      toast: { success: "Entry moved back to draft" },
    } as never)
    return response.data
  }

  // PUT /changelog/{entry}/posts
  async syncChangelogPosts(id: number, payload: SyncChangelogPostsPayload): Promise<AdminChangelogDetail> {
    const response = await apiClient.put<AdminChangelogDetail>(`${BASE}/changelog/${id}/posts`, payload, {
      toast: { success: "Linked posts updated" },
    } as never)
    return response.data
  }

  // ─── Settings & branding ──────────────────────────────────────────

  // GET /settings?scope=global|board:{id}
  async getSettings(scope: string): Promise<SettingsResponse> {
    const response = await apiClient.get<SettingsResponse>(`${BASE}/settings`, { params: { scope } })
    return response.data
  }

  // PUT /settings — validation errors (422, e.g. contrast rejection) are rendered inline by the caller
  async updateSettings(payload: UpdateSettingsPayload): Promise<SettingsResponse> {
    const response = await apiClient.put<SettingsResponse>(`${BASE}/settings`, payload, {
      toast: { success: "Settings saved" },
    } as never)
    return response.data
  }

  // POST /settings/asset (multipart)
  async uploadAsset(type: AssetType, file: File): Promise<AssetUploadResult> {
    const form = new FormData()
    form.append("type", type)
    form.append("file", file)
    const response = await apiClient.postMultipart<AssetUploadResult>(`${BASE}/settings/asset`, form, {
      toast: { success: "Image uploaded" },
    } as never)
    return response.data
  }

  // DELETE /settings/asset/{type}
  async deleteAsset(type: AssetType): Promise<void> {
    await apiClient.delete(`${BASE}/settings/asset/${type}`, { toast: { success: "Image removed" } } as never)
  }

  // POST /settings/theme-preview — background call, silent on error (the form shows 422s inline)
  async previewTheme(payload: ThemePreviewPayload, signal?: AbortSignal): Promise<PublicTheme> {
    const response = await apiClient.post<PublicTheme>(`${BASE}/settings/theme-preview`, payload, {
      ...(SILENT as object),
      signal,
    })
    return response.data
  }

  // ─── Markdown ─────────────────────────────────────────────────────

  // POST /markdown/preview — server-sanitised HTML, silent on error
  async previewMarkdown(md: string, signal?: AbortSignal): Promise<MarkdownPreviewResult> {
    const response = await apiClient.post<MarkdownPreviewResult>(
      `${BASE}/markdown/preview`,
      { md },
      { ...(SILENT as object), signal }
    )
    return response.data
  }
}

export const roadmapAdminService = new RoadmapAdminService()
