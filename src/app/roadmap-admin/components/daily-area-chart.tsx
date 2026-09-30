// Area chart of a per-day count series (votes/day, posts/day). Built on ui/chart.tsx.
import { useId, useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { BarChart3 } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatDate, formatShortDay } from "../utils/format"
import { EmptyState } from "./empty-state"

type DailyAreaChartProps = {
  series: { date: string; count: number }[]
  label: string
  /** CSS colour token, e.g. "var(--chart-1)" */
  color: string
}

export function DailyAreaChart({ series, label, color }: DailyAreaChartProps) {
  const gradientId = useId().replace(/:/g, "")
  const config = useMemo(() => ({ count: { label, color } }) satisfies ChartConfig, [label, color])
  const data = useMemo(
    () => [...series].sort((a, b) => a.date.localeCompare(b.date)).map((p) => ({ ...p, label: formatShortDay(p.date) })),
    [series]
  )

  if (data.length === 0 || data.every((p) => p.count === 0)) {
    return <EmptyState icon={BarChart3} title={`No ${label.toLowerCase()} yet`} description="Activity will show up here once visitors start engaging." className="h-56 p-6" />
  }

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} tick={{ fontSize: 11 }} />
        <ChartTooltip
          cursor={{ stroke: "var(--color-muted-foreground)", strokeDasharray: "3 3" }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_label, payload) => {
                const point = payload?.[0]?.payload as { date: string } | undefined
                return point ? formatDate(point.date) : String(_label)
              }}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-count)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
