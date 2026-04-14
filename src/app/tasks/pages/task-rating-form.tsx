import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
// Use the API-aligned Task type; ratingConfigurations are local until the ratings API is wired
import type { Task } from "@/app/tasks/types"
import { ratingConfigurations } from "@/app/tasks/data"

type TaskRatingFormProps = {
  task: Task
  onSubmit: () => void
  onCancel: () => void
}

export function TaskRatingForm({ task, onSubmit, onCancel }: TaskRatingFormProps) {
  const [activeConfig, setActiveConfig] = useState(ratingConfigurations[0].id)
  const [summary, setSummary] = useState("")
  const [scores, setScores] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {}
    for (const config of ratingConfigurations) {
      initial[config.id] = {}
      for (const criterion of config.criteria) {
        initial[config.id][criterion] = 0
      }
    }
    return initial
  })

  const currentConfig = ratingConfigurations.find((c) => c.id === activeConfig)!
  const currentScores = scores[activeConfig] ?? {}

  const totalPoints = Object.values(currentScores).reduce((sum, v) => sum + v, 0)
  const maxPoints = currentConfig.criteria.length * 100
  const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0

  function handleScoreChange(criterion: string, value: number) {
    setScores((prev) => ({
      ...prev,
      [activeConfig]: {
        ...prev[activeConfig],
        [criterion]: value,
      },
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="flex w-full justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-lg" onClick={onCancel}>
            <ArrowLeft />
          </Button>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Task Ratings — {task.name}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Rate task performance and quality with editorial precision.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-muted/50 p-4 rounded-xl">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Weight
              </span>
              <span className="text-2xl font-bold text-primary">{task.weight}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Rating Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* Config Tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-xl w-fit overflow-x-auto max-w-full">
              {ratingConfigurations.map((config) => (
                <button
                  key={config.id}
                  type="button"
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    activeConfig === config.id
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveConfig(config.id)}
                >
                  {config.name}
                </button>
              ))}
            </div>

            <Card>
              <CardContent className="p-6 md:p-8 space-y-8">
                <h3 className="text-xl font-bold tracking-tight border-l-4 border-primary pl-4">
                  Task Rating — {currentConfig.name}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Summary Input */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Narrative Performance Summary
                    </Label>
                    <Input
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Summarize the task performance..."
                      className="h-12 text-sm"
                    />
                  </div>

                  {/* Criteria Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    {currentConfig.criteria.map((criterion) => (
                      <div key={criterion} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">{criterion}</span>
                          <span className="text-lg font-bold text-primary">
                            {currentScores[criterion] ?? 0}
                            <span className="text-xs text-muted-foreground ml-1">/100</span>
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={currentScores[criterion] ?? 0}
                          onChange={(e) =>
                            handleScoreChange(criterion, Number(e.target.value))
                          }
                          className="w-full accent-primary"
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Total & Submit */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                        Cumulative Evaluation
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold tracking-tight">{percentage}%</span>
                        <span className="text-muted-foreground text-sm">
                          {totalPoints} / {maxPoints} total points
                        </span>
                      </div>
                    </div>
                    <Button type="submit" size="lg">
                      Submit Rating
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar — Previous Ratings */}
          <aside className="lg:col-span-4 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <span className="w-4 h-px bg-primary" />
              Previous Ratings
            </h4>

            {/* Previous ratings sidebar — will be populated from the ratings API endpoint */}
            {/* Showing placeholder until GET /tasks/{id}/ratings is wired up */}
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No previous ratings</p>
              </CardContent>
            </Card>

            {/* Insight Card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Quality Insights
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The current configuration weight of{" "}
                  <span className="font-bold text-foreground">{task.weight}</span> puts this
                  task in the{" "}
                  <span className="font-bold text-primary">
                    Top {task.weight > 70 ? "5%" : task.weight > 50 ? "20%" : "50%"}
                  </span>{" "}
                  of critical deliverables for the {task.section?.project?.name ?? "this"} project.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
