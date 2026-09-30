import { roadmapPublicService } from "../api/roadmapPublicService"
import type { BoardDetail } from "../types"
import { useResource } from "./useResource"

export function useBoard(slug: string | undefined) {
  return useResource<BoardDetail>(slug ? `board:${slug}` : null, (signal) =>
    roadmapPublicService.getBoard(slug as string, signal),
  )
}

/** True when the board or the post's status forbids voting. */
export function votingDisabledReason(
  detail: BoardDetail | null,
  statusSlug: string,
  strings: { boardClosed: string; closed: string },
): string | null {
  if (!detail) return null
  if (!detail.board.allow_votes) return strings.boardClosed
  const status = detail.statuses.find((s) => s.slug === statusSlug)
  return status?.locks_voting ? strings.closed : null
}
