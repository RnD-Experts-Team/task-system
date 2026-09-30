import { publicApi } from "./publicApiClient"
import type {
  ApiEnvelope,
  BoardDetail,
  ChangelogDetail,
  ChangelogListItem,
  ChangelogListParams,
  FormKind,
  FormStartResult,
  MeState,
  PaginatedEnvelope,
  Pagination,
  PostListParams,
  PublicComment,
  PublicConfig,
  PublicPostDetail,
  PublicPostListItem,
  RoadmapData,
  SimilarPost,
  SubmitCommentPayload,
  SubmitCommentResult,
  SubmitPostPayload,
  SubmitPostResult,
  VoteResult,
} from "../types"

export interface Page<T> {
  items: T[]
  pagination: Pagination
}

const board = (slug: string) => `/boards/${encodeURIComponent(slug)}`

// Laravel reads repeated "status[]" params; axios would serialise arrays as status[]=a&status[]=b already,
// but an explicit builder keeps the query stable and free of empty values.
function listQuery(params: PostListParams): URLSearchParams {
  const qs = new URLSearchParams()
  if (params.q) qs.set("q", params.q)
  if (params.sort) qs.set("sort", params.sort)
  params.status?.forEach((s) => qs.append("status[]", s))
  params.tag?.forEach((t) => qs.append("tag[]", t))
  if (params.page) qs.set("page", String(params.page))
  if (params.per_page) qs.set("per_page", String(params.per_page))
  return qs
}

function toPage<T>(body: PaginatedEnvelope<T>): Page<T> {
  return { items: body.data, pagination: body.pagination }
}

export const roadmapPublicService = {
  // ─── Site ─────────────────────────────────────────────────────────
  async getConfig(signal?: AbortSignal): Promise<PublicConfig> {
    const res = await publicApi.get<ApiEnvelope<PublicConfig>>("/config", { signal })
    return res.data.data
  },

  async getBoard(slug: string, signal?: AbortSignal): Promise<BoardDetail> {
    const res = await publicApi.get<ApiEnvelope<BoardDetail>>(board(slug), { signal })
    return res.data.data
  },

  // ─── Posts ────────────────────────────────────────────────────────
  async listPosts(slug: string, params: PostListParams, signal?: AbortSignal): Promise<Page<PublicPostListItem>> {
    const res = await publicApi.get<PaginatedEnvelope<PublicPostListItem>>(`${board(slug)}/posts`, {
      params: listQuery(params),
      signal,
    })
    return toPage(res.data)
  },

  async similarPosts(slug: string, q: string, signal?: AbortSignal): Promise<SimilarPost[]> {
    const res = await publicApi.get<ApiEnvelope<SimilarPost[]>>(`${board(slug)}/posts/similar`, {
      params: { q },
      signal,
    })
    return res.data.data
  },

  /** `asOwner` sends the stored visitor token so an owner can open their own pending post. */
  async getPost(slug: string, number: number, opts: { asOwner?: boolean; signal?: AbortSignal } = {}): Promise<PublicPostDetail> {
    const res = await publicApi.get<ApiEnvelope<PublicPostDetail>>(`${board(slug)}/posts/${number}`, {
      signal: opts.signal,
      visitorToken: opts.asOwner ? "existing" : "never",
    })
    return res.data.data
  },

  async submitPost(slug: string, payload: SubmitPostPayload): Promise<SubmitPostResult> {
    const res = await publicApi.post<ApiEnvelope<SubmitPostResult>>(`${board(slug)}/posts`, payload)
    return res.data.data
  },

  // ─── Votes ────────────────────────────────────────────────────────
  async setVote(slug: string, number: number, voted: boolean): Promise<VoteResult> {
    const res = await publicApi.post<ApiEnvelope<VoteResult>>(`${board(slug)}/posts/${number}/vote`, { voted })
    return res.data.data
  },

  // ─── Comments ─────────────────────────────────────────────────────
  async listComments(slug: string, number: number, page: number, signal?: AbortSignal): Promise<Page<PublicComment>> {
    const res = await publicApi.get<PaginatedEnvelope<PublicComment>>(`${board(slug)}/posts/${number}/comments`, {
      params: { page },
      signal,
    })
    return toPage(res.data)
  },

  async submitComment(slug: string, number: number, payload: SubmitCommentPayload): Promise<SubmitCommentResult> {
    const res = await publicApi.post<ApiEnvelope<SubmitCommentResult>>(
      `${board(slug)}/posts/${number}/comments`,
      payload,
    )
    return res.data.data
  },

  // ─── Roadmap ──────────────────────────────────────────────────────
  async getRoadmap(slug: string, perColumn: number, signal?: AbortSignal): Promise<RoadmapData> {
    const res = await publicApi.get<ApiEnvelope<RoadmapData>>(`${board(slug)}/roadmap`, {
      params: { per_column: perColumn },
      signal,
    })
    return res.data.data
  },

  // ─── Changelog ────────────────────────────────────────────────────
  async listChangelog(params: ChangelogListParams, signal?: AbortSignal): Promise<Page<ChangelogListItem>> {
    const res = await publicApi.get<PaginatedEnvelope<ChangelogListItem>>("/changelog", { params, signal })
    return toPage(res.data)
  },

  async getChangelogEntry(slug: string, signal?: AbortSignal): Promise<ChangelogDetail> {
    const res = await publicApi.get<ApiEnvelope<ChangelogDetail>>(`/changelog/${encodeURIComponent(slug)}`, { signal })
    return res.data.data
  },

  // ─── Anti-abuse & visitor state ───────────────────────────────────
  async startForm(kind: FormKind, boardSlug: string): Promise<FormStartResult> {
    const res = await publicApi.post<ApiEnvelope<FormStartResult>>(`/forms/${kind}/start`, { board: boardSlug })
    return res.data.data
  },

  async getMeState(boardSlug?: string, signal?: AbortSignal): Promise<MeState> {
    const res = await publicApi.get<ApiEnvelope<MeState>>("/me/state", {
      params: boardSlug ? { board: boardSlug } : undefined,
      signal,
    })
    return res.data.data
  },
}
