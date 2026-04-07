import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, ArrowRight, Calendar, User, ClipboardList } from "lucide-react"
import { tasks, type Task } from "@/app/tasks/data"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const statusStyles: Record<string, string> = {
  completed:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "in-progress":
    "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  pending:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  todo: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30",
}

export default function RatingsPage() {
  const navigate = useNavigate()
  const [taskInput, setTaskInput] = useState("")
  const [search, setSearch] = useState("")

  const availableTasks = useMemo(() => tasks.slice(0, 6), [])

  const filtered = useMemo(() => {
    if (!search.trim()) return availableTasks
    const q = search.toLowerCase()
    return availableTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q)
    )
  }, [availableTasks, search])

  function handleRateTask(task: Task) {
    navigate(`/tasks?rate=${task.id}`)
  }

  function handleRateInput() {
    if (taskInput.trim()) {
      navigate(`/tasks?rate=${encodeURIComponent(taskInput.trim())}`)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">Tasks Rating</h2>
          <Badge variant="secondary" className="uppercase tracking-wider">
            {availableTasks.length} {availableTasks.length === 1 ? "Task" : "Tasks"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground max-w-md">
          Rate tasks based on configured evaluation criteria.
        </p>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Task Rating Input */}
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <ClipboardList className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Enter task ID or name to rate..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRateInput()}
              className="pl-8 h-10 text-sm"
            />
          </div>
          <Button onClick={handleRateInput} disabled={!taskInput.trim()}>
            <Star className="size-3.5" />
            Rate
          </Button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-10 text-sm"
          />
        </div>
      </div>

      {/* Browse Tasks */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Browse Tasks</h3>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-full bg-muted p-4">
                <Search className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">No tasks found</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Try adjusting your search query.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((task) => (
              <Card
                key={task.id}
                className="transition-all hover:shadow-md hover:shadow-primary/10 hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs font-mono">
                          {task.code}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={statusStyles[task.status] ?? ""}
                        >
                          {task.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm leading-snug">
                        {task.title}
                      </CardTitle>
                    </div>
                    {task.rating > 0 && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold">{task.rating}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {task.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="size-3" />
                      {task.project}
                    </span>
                  </div>

                  {/* Assignees */}
                  {task.assignees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <User className="size-3 text-muted-foreground shrink-0" />
                      <div className="flex -space-x-1.5">
                        {task.assignees.slice(0, 3).map((a) => (
                          <Avatar key={a.id} className="size-6 border-2 border-background">
                            <AvatarImage src={a.avatarUrl} alt={a.name} />
                            <AvatarFallback className="text-[8px]">
                              {getInitials(a.name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {task.assignees.length > 3 && (
                          <span className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-medium text-muted-foreground">
                            +{task.assignees.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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

      {/* View All Tasks Button - bottom center */}
      <div className="mt-auto flex justify-center">
        <Button
          onClick={() => navigate("/tasks")}
          variant="outline"
          className="w-full max-w-xs"
        >
          View All Tasks
          <ArrowRight className="size-3.5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
