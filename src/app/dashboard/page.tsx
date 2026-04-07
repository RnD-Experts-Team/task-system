import React from "react"
import TeamCarousel from "./components/TeamCarousel"
import StatCard from "./components/StatCard"
import ProjectStatusChart from "./components/ProjectStatusChart"
import TaskVelocityChart from "./components/TaskVelocityChart"
import HelpRequestItem, { HELP_REQUESTS } from "./components/HelpRequestItem"
import DeadlineItem, { CRITICAL_DEADLINES } from "./components/DeadlineItem"
import RightOverviewPanel from "./components/RightOverviewPanel"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, FolderKanban, CheckCircle2, Gauge } from "lucide-react"

function DateFilter() {
  const [period, setPeriod] = React.useState("today")
  return (
    <Select value={period} onValueChange={setPeriod}>
      <SelectTrigger className="h-8 w-36 text-xs rounded-full border-border/40 bg-muted/30 gap-1.5 focus:ring-primary/20">
        <CalendarDays className="size-3 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="today">Today</SelectItem>
        <SelectItem value="yesterday">Yesterday</SelectItem>
        <SelectItem value="week">This Week</SelectItem>
        <SelectItem value="month">This Month</SelectItem>
        <SelectItem value="quarter">This Quarter</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default function DashboardPage() {
  const [role, setRole] = React.useState<"admin" | "developer">("admin")

  React.useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const params = new URLSearchParams(window.location.search)
      const roleParam = params.get("role")
      const stored = localStorage.getItem("user_role")
      if (roleParam === "developer" || stored === "developer") {
        setRole("developer")
      }
    } catch (e) {
      // ignore
    }
  }, [])

  if (role === "developer") {
    return (
      <div className="flex-1 bg-background/50 flex items-start justify-center p-6 md:p-8">
        <main className="w-full max-w-7xl">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">Developer Overview</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">A lightweight view focused on developer needs.</p>
          </div>

          <div className="space-y-4">
            <RightOverviewPanel variant="developer" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse md:flex-row flex-1 min-h-0 overflow-hidden">
        {/* team analytics */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col gap-8 p-6 md:p-8 pb-16">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">Hi, there!</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">Here's what's happening across your workspace today.</p>
          </div>
          <DateFilter />
        </div>

        <TeamCarousel />

        <section aria-label="Performance statistics" className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Active Projects" value="24" trend="+12%" trendUp icon={<FolderKanban className="size-4 text-primary" />} />
          <StatCard label="Completed Tasks" value="1,204" trend="+8%" trendUp icon={<CheckCircle2 className="size-4 text-primary" />} />
          <StatCard label="Performance Rate" value="98.2%" icon={<Gauge className="size-4 text-primary" />} highlight />
        </section>

        <section aria-label="Analytics" className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <ProjectStatusChart />
          <TaskVelocityChart />
        </section>

        <section aria-label="Support and deadlines" className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto] items-start">
          <Card className="glass-glow border overflow-hidden min-w-0">
            <Tabs defaultValue="help-requests">
              <CardHeader className="border-b border-border/40 pb-0 pt-0 px-0">
                <TabsList variant="line" className="w-full rounded-none border-b-0 h-auto gap-0 p-0">
                  <TabsTrigger value="help-requests" className="flex-1 rounded-none py-4 text-sm font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">Help Requests</TabsTrigger>
                  <TabsTrigger value="tickets" className="flex-1 rounded-none py-4 text-sm font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">Tickets</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="help-requests" className="mt-0 p-4 space-y-1 overflow-auto max-h-[48vh] sm:max-h-[36vh] md:max-h-[28vh]">
                {HELP_REQUESTS.map((item) => <HelpRequestItem key={item.id} item={item} />)}
              </TabsContent>

              <TabsContent value="tickets" className="mt-0 p-6">
                <p className="text-sm text-muted-foreground text-center py-6">No open tickets.</p>
              </TabsContent>

              <TabsContent value="faq" className="mt-0 p-6">
                <p className="text-sm text-muted-foreground text-center py-6">FAQ coming soon.</p>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="glass-glow border w-full lg:w-80 min-w-0">
            <CardHeader>
              <CardTitle className="font-heading text-base font-bold">Critical Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {CRITICAL_DEADLINES.map((item) => <DeadlineItem key={item.id} item={item} />)}
            </CardContent>
          </Card>
        </section>
      </main>

      <RightOverviewPanel />
    </div>
  )

}
