import { roadmapPublicService } from "../api/roadmapPublicService"
import type { PublicPostDetail } from "../types"
import { useResource } from "./useResource"

export function usePost(board: string | undefined, number: number | null, asOwner: boolean) {
  return useResource<PublicPostDetail>(board && number ? `post:${board}:${number}` : null, (signal) =>
    roadmapPublicService.getPost(board as string, number as number, { asOwner, signal }),
  )
}
