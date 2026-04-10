import type { ProjectStatus } from "../types"

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function normalizeStatus(status: ProjectStatus) {
  return String(status ?? "pending").toLowerCase()
}

export function statusLabel(status: ProjectStatus) {
  const normalized = normalizeStatus(status)
  const labels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    done: "Done",
    rated: "Rated",
  }

  return labels[normalized] ?? normalized.replace(/_/g, " ")
}

export function statusClassName(status: ProjectStatus) {
  const normalized = normalizeStatus(status)

  const classes: Record<string, string> = {
    pending: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    in_progress: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    done: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rated: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  }

  return classes[normalized] ?? "border-muted-foreground/20 bg-muted text-muted-foreground"
}

export function formatProgress(progressPercentage: string | number) {
  const parsed = Number(progressPercentage)
  if (!Number.isFinite(parsed)) return "0%"
  return `${parsed.toFixed(0)}%`
}
