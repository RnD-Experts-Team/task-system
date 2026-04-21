import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, ArrowRight, Calendar, ClipboardList, Loader2, AlertCircle, User, ChevronDown, X } from "lucide-react"
import { useTasks } from "@/app/tasks/hooks/useTasks"
import type { Task } from "@/app/tasks/types"

import { RatingGridSkeleton } from "./rating-skeletons"

// Returns 1–2 initials from a name string for use in avatar fallback
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Tailwind classes for each task status badge
const statusStyles: Record<string, string> = {
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  rated: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
}

// Human-readable label for each task status
const statusLabel: Record<string, string> = {
  done: "Done",
  rated: "Rated",
  in_progress: "In Progress",
  pending: "Pending",
}

export default function RatingsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch tasks from the real API — GET /tasks
  // Per page is higher here so users see more tasks to rate at once
  const { tasks, loading, error, clearError } = useTasks({ per_page: 30, search: search || undefined })

  // Navigate to the dedicated rating form page for a specific task
  function handleRateTask(task: Task) {
    navigate(`/ratings/tasks/${task.id}/rate`)
  }

  // Close dropdown when clicking outside the search container
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl font-bold tracking-tight">Tasks Rating</h2>
          {!loading && !error && (
            <Badge variant="secondary" className="uppercase tracking-wider">
              {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          Select a task below and click Rate to evaluate it using the configured criteria.
        </p>
      </div>

      {/* ── Search Bar with Collapsible Task List ───────────── */}
      <div ref={searchRef} className="relative max-w-sm">
        <div className="flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <Search className="ml-2.5 size-3.5 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search tasks by name or project..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setDropdownOpen(true)
            }}
            onFocus={() => setDropdownOpen(true)}
            className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-sm pl-2"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setDropdownOpen(false) }}
              className="mr-1 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="mr-2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Toggle task list"
          >
            <ChevronDown className={`size-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible dropdown list */}
        {dropdownOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && tasks.length === 0 && (
              <p className="px-3 py-3 text-sm text-muted-foreground">No tasks found.</p>
            )}
            {!loading && tasks.length > 0 && (
              <ul className="max-h-64 overflow-y-auto py-1">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        setDropdownOpen(false)
                        handleRateTask(task)
                      }}
                    >
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] ${statusStyles[task.status] ?? ""}`}
                      >
                        {statusLabel[task.status] ?? task.status}
                      </Badge>
                      <span className="truncate">{task.name}</span>
                      {task.section?.project?.name && (
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {task.section.project.name}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ── API Error Banner ────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="size-4 mt-0.5 shrink-0" />
          <div className="flex flex-1 items-center justify-between gap-2 flex-wrap">
            <span className="text-sm">{error}</span>
            <Button size="sm" variant="outline" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* ── Loading State ───────────────────────────────────────── */}
      {loading && <RatingGridSkeleton />}

      {/* ── Empty / No Results ──────────────────────────────────── */}
      {!loading && !error && tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <Search className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No tasks found</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {search ? "Try adjusting your search query." : "No tasks are available yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Task Grid ───────────────────────────────────────────── */}
      {!loading && !error && tasks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="transition-all hover:shadow-md hover:shadow-primary/10 hover:border-primary/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    {/* Status + weight badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={statusStyles[task.status] ?? ""}
                      >
                        {statusLabel[task.status] ?? task.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono">
                        W: {task.weight}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm leading-snug line-clamp-2">
                      {task.name}
                    </CardTitle>
                  </div>
                  {/* Show star if the task already has a rating */}
                  {task.latest_final_rating !== null && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold">
                        {Number(task.latest_final_rating).toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col gap-3">
                {/* Description excerpt */}
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {/* Metadata: due date + project/section */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {task.due_date}
                  </span>
                  {task.section?.project?.name && (
                    <span className="flex items-center gap-1">
                      <ClipboardList className="size-3" />
                      {task.section.project.name}
                    </span>
                  )}
                </div>

                {/* Assigned users avatars */}
                {task.assigned_users.length > 0 && (
                  <div className="flex items-center gap-2">
                    <User className="size-3 text-muted-foreground shrink-0" />
                    <div className="flex -space-x-1.5">
                      {task.assigned_users.slice(0, 3).map((u) => (
                        <Avatar key={u.id} className="size-6 border-2 border-background">
                          <AvatarImage src={u.avatar_url ?? undefined} alt={u.name} />
                          <AvatarFallback className="text-[8px]">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {task.assigned_users.length > 3 && (
                        <span className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-medium text-muted-foreground">
                          +{task.assigned_users.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Rate button — navigates to the task rating form page */}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1 w-full"
                  onClick={() => handleRateTask(task)}
                >
                  <Star className="size-3.5" />
                  Rate
                  <ArrowRight className="size-3.5 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

