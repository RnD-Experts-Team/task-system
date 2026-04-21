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

export function HelpRequestTableSkeleton() {
  return (
    <div className="w-full overflow-hidden border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Request</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Task</TableHead>
            <TableHead className="hidden lg:table-cell">Helper</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead className="text-right w-10">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i} className="animate-pulse">
              <TableCell className="py-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-2">
                     <Skeleton className="h-3 w-16" />
                     <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3">
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell className="hidden md:table-cell py-3">
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="hidden lg:table-cell py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell py-3">
                <Skeleton className="h-4 w-20" />
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

export function HelpRequestGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="flex flex-col h-[220px]">
          <div className="p-4 flex flex-col gap-3 flex-1">
             <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="size-8 rounded-md" />
             </div>
             <Skeleton className="h-5 w-full" />
             <Skeleton className="h-4 w-2/3" />
             <div className="mt-auto flex items-center gap-2">
                 <Skeleton className="size-6 rounded-full" />
                 <Skeleton className="h-4 w-24" />
             </div>
          </div>
          <div className="p-3 border-t bg-muted/30 flex justify-between">
             <Skeleton className="h-4 w-16" />
             <Skeleton className="h-4 w-16" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function HelpRequestFormSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse p-4">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}
