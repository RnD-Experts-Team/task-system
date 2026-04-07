import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListTodo, Plus } from "lucide-react"

export default function TasksPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Track and manage tasks.
          </p>
        </div>
        <Button className="transition-all hover:shadow-md hover:shadow-primary/25">
          <Plus className="size-4" />
          New Task
        </Button>
      </div>
      <Card className="transition-all hover:shadow-md hover:shadow-primary/10 hover:border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <ListTodo className="size-4 text-primary" />
            </div>
            <CardTitle>All Tasks</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No tasks found.</p>
        </CardContent>
      </Card>
    </div>
  )
}
