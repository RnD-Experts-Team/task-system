import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const PROJECT_STATUS_DATA = [
  { name: "Active", value: 42, color: "var(--color-primary)" },
  { name: "Pending", value: 18, color: "oklch(0.577 0.245 27.325 / 50%)" },
  { name: "On Hold", value: 4, color: "oklch(0.505 0.213 27.518 / 25%)" },
]

export default function ProjectStatusChart() {
  const total = PROJECT_STATUS_DATA.reduce((s, d) => s + d.value, 0)
  const onTrackPct = Math.round((PROJECT_STATUS_DATA[0].value / total) * 100)

  return (
    <Card className="glass-glow border flex flex-col min-h-0">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-bold">Project Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center gap-8 min-h-0">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PROJECT_STATUS_DATA}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={70}
                startAngle={90}
                endAngle={-270}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {PROJECT_STATUS_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-heading text-2xl font-bold leading-none">{onTrackPct}%</span>
            <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground mt-1">On Track</span>
          </div>
        </div>

        <div className="space-y-3">
          {PROJECT_STATUS_DATA.map((item) => (
            <div key={item.name} className="flex items-center gap-2.5">
              <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} aria-hidden="true" />
              <span className="text-xs font-semibold text-foreground">{item.name}: <span className="text-muted-foreground">{item.value}</span></span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
