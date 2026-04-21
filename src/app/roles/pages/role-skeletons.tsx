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

export function RoleTableSkeleton() {
  return (
    <div className="w-full overflow-hidden border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role Name</TableHead>
            <TableHead>Guard Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead className="text-right w-10">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i} className="animate-pulse">
              <TableCell className="py-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell className="py-3">
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell className="py-3">
                 <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
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

export function RoleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="size-8 rounded-md" />
          </div>
          
          <Skeleton className="h-5 w-20 rounded-full" />

          <div className="flex flex-wrap gap-2 mt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>

          <div className="flex items-center border-t pt-4 mt-auto">
             <Skeleton className="h-4 w-24" />
          </div>
        </Card>
      ))}
    </div>
  )
}
