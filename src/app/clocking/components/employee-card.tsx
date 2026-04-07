import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Employee } from "../data"

interface EmployeeCardProps {
  employee: Employee
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const isOnBreak = employee.status === "on-break"
  const statusLabel = isOnBreak ? "On Break" : "Working"

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card/60 p-4 transition-all duration-300 hover:bg-card sm:p-5",
        employee.starred && "border-2 border-primary/20 shadow-xl shadow-primary/5"
      )}
    >
      {employee.starred && (
        <div className="absolute right-2 top-2">
          <Star className="size-3 fill-primary text-primary" />
        </div>
      )}

      {/* Top row: avatar + status */}
      <div className="mb-3 flex items-start justify-between sm:mb-4">
        <div className="relative">
          <Avatar className="size-10 rounded-xl sm:size-12">
            <AvatarFallback className="rounded-xl bg-muted text-sm font-bold">
              {employee.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -bottom-1 -right-1 size-3.5 rounded-full border-4 border-card transition-all sm:size-4",
              isOnBreak ? "bg-orange-400" : "bg-primary"
            )}
          />
        </div>
        <div className="text-right">
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              isOnBreak ? "text-orange-400" : "text-primary"
            )}
          >
            {statusLabel}
          </span>
          <div className="mt-1 text-xs font-bold">In at {employee.clockInTime}</div>
        </div>
      </div>

      {/* Name + role */}
      <div className="mb-3 sm:mb-4">
        <h4 className="text-sm font-bold sm:text-base">{employee.name}</h4>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {employee.role}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 border-t border-border/10 pt-3 sm:pt-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">Work</p>
          <p className="text-xs font-bold">{employee.workTime}</p>
        </div>
        <div>
          <p
            className={cn(
              "text-[9px] font-bold uppercase tracking-tighter text-muted-foreground",
              isOnBreak && "text-orange-400"
            )}
          >
            Break
          </p>
          <p className={cn("text-xs font-bold", isOnBreak && "text-orange-400")}>
            {employee.breakTime}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">Breaks</p>
          <p className="text-xs font-bold">
            {employee.breaksUsed} / {employee.breaksAllowed}
          </p>
        </div>
      </div>
    </div>
  )
}
