import { roadmapPublicService } from "../api/roadmapPublicService"
import type { RoadmapData } from "../types"
import { useResource } from "./useResource"

export function useRoadmap(board: string | undefined) {
  return useResource<RoadmapData>(board ? `roadmap:${board}` : null, (signal) =>
    roadmapPublicService.getRoadmap(board as string, 10, signal),
  )
}
