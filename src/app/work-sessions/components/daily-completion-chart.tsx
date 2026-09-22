// src/app/work-sessions/components/daily-completion-chart.tsx
// Per-day outcome breakdown for the overview report: stacked bars for
// done / partial / not done on the left axis and a completion % line on the
// right axis. Built on ui/chart.tsx (ChartContainer + recharts).

import { useMemo } from "react"
import { format, isValid, parse } from "date-fns"
import { BarChart3 } from "lucide-react"
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { DailyReportRow } from "../types"
import { EmptyState } from "./empty-state"

// Semantic outcome colors (emerald / amber / red) + neutral line for the %
const chartConfig = {
  done: { label: "Done", color: "oklch(0.696 0.17 162.48)" },
  partial: { label: "Partial", color: "oklch(0.769 0.188 70.08)" },
  not_done: { label: "Not done", color: "oklch(0.637 0.237 25.331)" },
  completion_pct: { label: "Completion", color: "var(--color-foreground)" },
} satisfies ChartConfig

type ChartPoint = {
  date: string
  label: string
  done: number
  partial: number
  not_done: number
  completion_pct: number | null
}

// "2026-09-22" → "Sep 22" (falls back to the raw string)
function shortDate(workDate: string): string {
  const parsed = parse(workDate, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? format(parsed, "MMM d") : workDate
}

// "2026-09-22" → "Tue, Sep 22"
function longDate(workDate: string): string {
  const parsed = parse(workDate, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? format(parsed, "EEE, MMM d, yyyy") : workDate
}

export function DailyCompletionChart({ daily }: { daily: DailyReportRow[] }) {
  const data = useMemo<ChartPoint[]>(
    () =>
      [...daily]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((row) => ({
          date: row.date,
          label: shortDate(row.date),
          done: row.done,
          partial: row.partial,
          not_done: row.not_done,
          completion_pct: row.completion_pct === null ? null : Math.round(row.completion_pct),
        })),
    [daily]
  )

  if (data.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No daily activity"
        description="No sessions were recorded in the selected period."
      />
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full sm:h-72">
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
          tick={{ fontSize: 11 }}
        />
        {/* Left axis: item counts */}
        <YAxis yAxisId="left" allowDecimals={false} tickLine={false} axisLine={false} width={40} tick={{ fontSize: 11 }} />
        {/* Right axis: completion percentage */}
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tickLine={false}
          axisLine={false}
          width={44}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          content={
            <ChartTooltipContent
              labelFormatter={(_label, payload) => {
                const point = payload?.[0]?.payload as ChartPoint | undefined
                return point ? longDate(point.date) : String(_label)
              }}
              formatter={(value, name) => {
                const key = String(name) as keyof typeof chartConfig
                const cfg = chartConfig[key]
                const isPct = key === "completion_pct"
                return (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span
                        className="size-2 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: `var(--color-${key})` }}
                      />
                      {cfg?.label ?? key}
                    </span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {value === null || value === undefined ? "—" : isPct ? `${value}%` : value}
                    </span>
                  </div>
                )
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar maxBarSize={56} yAxisId="left" dataKey="done" stackId="outcomes" fill="var(--color-done)" radius={[0, 0, 0, 0]} />
        <Bar maxBarSize={56} yAxisId="left" dataKey="partial" stackId="outcomes" fill="var(--color-partial)" />
        <Bar maxBarSize={56} yAxisId="left" dataKey="not_done" stackId="outcomes" fill="var(--color-not_done)" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="completion_pct"
          stroke="var(--color-completion_pct)"
          strokeWidth={2}
          dot={{ r: 3, strokeWidth: 0, fill: "var(--color-completion_pct)" }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </ComposedChart>
    </ChartContainer>
  )
}
