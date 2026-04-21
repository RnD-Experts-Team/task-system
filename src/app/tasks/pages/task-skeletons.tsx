import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TaskTableSkeleton() {
  return (
    <div className="w-full overflow-hidden border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Priority</TableHead>
            <TableHead className="hidden md:table-cell">Assignees</TableHead>
            <TableHead className="hidden lg:table-cell">Project</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="hidden sm:table-cell">Due Date</TableHead>
            <TableHead>Subtasks</TableHead>
            <TableHead className="text-right w-10">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i} className="animate-pulse">
              <TableCell className="py-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </TableCell>
              <TableCell className="py-3">
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell className="hidden sm:table-cell py-3">
                <Skeleton className="h-5 w-16 px-2.5 py-0.5 rounded-full" />
              </TableCell>
              <TableCell className="hidden md:table-cell py-3">
                <div className="flex -space-x-2">
                  <Skeleton className="size-7 rounded-full border-2 border-card" />
                  <Skeleton className="size-7 rounded-full border-2 border-card" />
                  <Skeleton className="size-7 rounded-full border-2 border-card" />
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell py-3">
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell className="py-3">
                <Skeleton className="h-4 w-10" />
              </TableCell>
              <TableCell className="hidden sm:table-cell py-3">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="py-3">
                <div className="flex flex-col gap-1 min-w-[60px]">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
              </TableCell>
              <TableCell className="text-right py-3">
                <Skeleton className="size-8 rounded-md ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function TaskGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            <Skeleton className="size-8 rounded-md" />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>

          <div className="flex items-center justify-between border-t pt-4 mt-auto">
            <Skeleton className="h-4 w-24" />
            <div className="flex space-x-1">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
