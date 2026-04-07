import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const TASK_VELOCITY_DATA = [
  { month: "Jan", tasks: 40 },
  { month: "Feb", tasks: 60 },
  { month: "Mar", tasks: 85 },
  { month: "Apr", tasks: 50 },
  { month: "May", tasks: 70 },
  { month: "Jun", tasks: 95 },
  { month: "Jul", tasks: 45 },
]

export default function TaskVelocityChart() {
  return (
    <Card className="glass-glow border min-h-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base font-bold">Task Velocity</CardTitle>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Monthly</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={TASK_VELOCITY_DATA} barSize={20}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted-foreground)" }} />
            <Tooltip
              cursor={{ fill: "oklch(0.505 0.213 27.518 / 5%)" }}
              contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem", fontSize: "0.75rem" }}
              labelStyle={{ color: "var(--color-foreground)", fontWeight: 700 }}
              itemStyle={{ color: "var(--color-primary)" }}
            />
            <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
              {TASK_VELOCITY_DATA.map((_, index) => {
                const isHighest = index === 5
                return (
                  <Cell key={`bar-${index}`} fill={isHighest ? "var(--color-primary)" : "oklch(0.505 0.213 27.518 / 30%)"} opacity={isHighest ? 1 : 0.7} />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
