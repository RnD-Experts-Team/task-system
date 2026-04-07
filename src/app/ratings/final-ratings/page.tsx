import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings2,
  Calendar,
  Pencil,
  Calculator,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

// ── Types ─────────────────────────────────────────────────────────────────────

type ComponentToggle = {
  id: string
  label: string
  enabled: boolean
}

type CalculationMethod = "SUM" | "AVERAGE"

type FinalRatingConfig = {
  name: string
  description: string
  components: ComponentToggle[]
  calculationMethod: CalculationMethod
  createdAt: string
}

type CalculationResult = {
  totalPoints: number
  maxPoints: number
  percentage: number
}

// ── Initial Data ──────────────────────────────────────────────────────────────

const initialConfig: FinalRatingConfig = {
  name: "Default Configuration",
  description:
    "Standard final rating profile combining task and stakeholder evaluations for comprehensive performance scoring.",
  components: [
    { id: "task-ratings", label: "Task Ratings", enabled: true },
    { id: "stakeholder", label: "Stakeholder", enabled: true },
    { id: "help", label: "Help", enabled: false },
    { id: "help-requester", label: "Help (Requester)", enabled: false },
    { id: "tickets", label: "Tickets", enabled: false },
  ],
  calculationMethod: "SUM",
  createdAt: "2025-11-01",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FinalRatingsPage() {
  const [config, setConfig] = useState<FinalRatingConfig>(initialConfig)
  const [editOpen, setEditOpen] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState(config.name)
  const [editDescription, setEditDescription] = useState(config.description)
  const [editComponents, setEditComponents] = useState<ComponentToggle[]>(
    config.components.map((c) => ({ ...c }))
  )
  const [editMethod, setEditMethod] = useState<CalculationMethod>(
    config.calculationMethod
  )

  // Calculate form state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [maxPoints, setMaxPoints] = useState("200")
  const [result, setResult] = useState<CalculationResult | null>(null)

  const enabledCount = useMemo(
    () => config.components.filter((c) => c.enabled).length,
    [config]
  )

  function openEditSheet() {
    setEditName(config.name)
    setEditDescription(config.description)
    setEditComponents(config.components.map((c) => ({ ...c })))
    setEditMethod(config.calculationMethod)
    setEditOpen(true)
  }

  function handleUpdateConfig() {
    setConfig({
      ...config,
      name: editName,
      description: editDescription,
      components: editComponents,
      calculationMethod: editMethod,
    })
    setEditOpen(false)
    toast.success("Configuration updated successfully")
  }

  function toggleEditComponent(id: string) {
    setEditComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    )
  }

  function handleCalculate() {
    if (!startDate || !endDate) {
      toast.error("Please select a date range")
      return
    }
    const max = Number(maxPoints) || 200
    // Simulated total based on enabled components
    const simulatedTotal = Math.round(max * (0.55 + Math.random() * 0.35))
    const percentage = Math.min((simulatedTotal / max) * 100, 100)

    setResult({
      totalPoints: simulatedTotal,
      maxPoints: max,
      percentage: Math.round(percentage * 100) / 100,
    })
    toast.success("Final ratings calculated")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">Final Ratings</h2>
          <Badge variant="secondary" className="uppercase tracking-wider">
            {enabledCount} Active Components
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground max-w-lg">
          Configure final rating parameters and calculate comprehensive performance scores.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── A. Configuration Section ──────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Settings2 className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Configurations</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={openEditSheet}>
                <Pencil className="size-3.5" />
                Edit Configuration
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Active config info */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{config.name}</span>
                <Badge
                  variant="default"
                  className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                >
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {config.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                Created {formatDate(config.createdAt)}
              </div>
            </div>

            <Separator />

            {/* Component toggles */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Components
              </p>
              <div className="space-y-1.5">
                {config.components.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm">{comp.label}</span>
                    {comp.enabled ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs"
                      >
                        <CheckCircle2 className="size-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <XCircle className="size-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Calculation Method
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {config.calculationMethod}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* ── B. Calculate Ratings Section ──────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calculator className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Calculate Final Ratings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-5">
            {/* Date range */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-xs">
                  Start Date
                </Label>
                <DateInput
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date" className="text-xs">
                  End Date
                </Label>
                <DateInput
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            {/* Max points */}
            <div className="space-y-1.5">
              <Label htmlFor="max-points" className="text-xs">
                Maximum Points
              </Label>
              <Input
                id="max-points"
                type="number"
                min={1}
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* Active config label */}
            <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
              <Settings2 className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Using configuration:
              </span>
              <span className="text-xs font-semibold">{config.name}</span>
            </div>

            {/* Explanation */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                <Info className="size-3.5" />
                Calculation Logic
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The final rating is computed as:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                  percentage = (totalPoints / maxPoints) × 100
                </code>
                . The result is capped at 100%. Only enabled components contribute
                to the total points using the{" "}
                <span className="font-semibold">{config.calculationMethod}</span>{" "}
                method.
              </p>
            </div>

            <Button className="w-full" onClick={handleCalculate}>
              <Calculator className="size-3.5" />
              Calculate Ratings
            </Button>

            {/* Result */}
            {result && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Result
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold tracking-tight">
                      {result.totalPoints}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Total Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">
                      {result.maxPoints}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Max Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-primary">
                      {result.percentage}%
                    </p>
                    <p className="text-[11px] text-muted-foreground">Percentage</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Edit Configuration Sheet ───────────────────────────────────── */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Configuration</SheetTitle>
            <SheetDescription>
              Update the final rating configuration parameters.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-6 py-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs">
                Configuration Name
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc" className="text-xs">
                Description
              </Label>
              <Input
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <Separator />

            {/* Components */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Components
              </p>
              <div className="space-y-1.5">
                {editComponents.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => toggleEditComponent(comp.id)}
                    className="flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
                  >
                    <span>{comp.label}</span>
                    <Badge
                      variant={comp.enabled ? "default" : "secondary"}
                      className={
                        comp.enabled
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : ""
                      }
                    >
                      {comp.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Calculation Method */}
            <div className="space-y-1.5">
              <Label className="text-xs">Calculation Method</Label>
              <Select
                value={editMethod}
                onValueChange={(v) => setEditMethod(v as CalculationMethod)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUM">SUM</SelectItem>
                  <SelectItem value="AVERAGE">AVERAGE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateConfig}>Update Configuration</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
