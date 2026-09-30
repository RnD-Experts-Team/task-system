// src/app/roadmap-admin/hooks/useAdminPost.ts
// Loads one post (detail) into the store when `id` changes; clears it when null.
import { useCallback, useEffect } from "react"
import { usePostsStore } from "../store/postsStore"

export function useAdminPost(id: number | null) {
  const selected = usePostsStore((s) => s.selected)
  const loading = usePostsStore((s) => s.selectedLoading)
  const error = usePostsStore((s) => s.selectedError)
  const fetchPost = usePostsStore((s) => s.fetchPost)
  const clearSelected = usePostsStore((s) => s.clearSelected)

  useEffect(() => {
    if (id) void fetchPost(id)
    else clearSelected()
  }, [id, fetchPost, clearSelected])

  const refetch = useCallback(() => (id ? fetchPost(id) : Promise.resolve()), [id, fetchPost])
  return { post: selected && selected.id === id ? selected : null, loading, error, refetch }
}
