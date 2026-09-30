// Where "Review" leads for each kind of suspicious subject.
import type { SuspiciousItem } from "../types"

export function reviewPath(item: SuspiciousItem): string {
  if (item.type === "post") return `/roadmap-admin/posts?post=${encodeURIComponent(item.ref)}`
  if (item.type === "visitor") return `/roadmap-admin/visitors?visitor=${encodeURIComponent(item.ref)}`
  return `/roadmap-admin/visitors?ip=${encodeURIComponent(item.ref)}`
}

