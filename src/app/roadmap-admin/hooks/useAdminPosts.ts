// src/app/roadmap-admin/hooks/useAdminPosts.ts
// Params-keyed fetch of the admin posts list.
import { useCallback, useEffect, useRef } from "react"
import { usePostsStore } from "../store/postsStore"
import type { AdminPostFilters } from "../types"

export function useAdminPosts(params: AdminPostFilters = {}) {
  const posts = usePostsStore((s) => s.posts)
  const pagination = usePostsStore((s) => s.pagination)
  const loading = usePostsStore((s) => s.loading)
  const error = usePostsStore((s) => s.error)
  const fetchPosts = usePostsStore((s) => s.fetchPosts)

  const paramsKey = JSON.stringify(params)
  const lastKey = useRef("")

  useEffect(() => {
    if (paramsKey !== lastKey.current) {
      lastKey.current = paramsKey
      void fetchPosts(JSON.parse(paramsKey) as AdminPostFilters)
    }
  }, [paramsKey, fetchPosts])

  const refetch = useCallback(() => fetchPosts(JSON.parse(paramsKey) as AdminPostFilters), [fetchPosts, paramsKey])
  return { posts, pagination, loading, error, refetch }
}
