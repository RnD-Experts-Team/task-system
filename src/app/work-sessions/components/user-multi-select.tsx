// src/app/work-sessions/components/user-multi-select.tsx
// Searchable checkbox list of users with select-all and a selected/total
// badge. Extracted from the weighted-ratings page so the admin session list,
// reports and ratings pages share one picker.

import { useMemo, useState } from "react"
import { Search, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { SessionUser } from "../types"

type UserMultiSelectProps = {
  users: SessionUser[]
  /** Selected user ids */
  selected: number[]
  onChange: (ids: number[]) => void
  loading?: boolean
  /** Max list height in px (the list scrolls beyond it) */
  maxHeight?: number
  className?: string
}

// Two initials from a full name ("John Doe" → "JD")
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserMultiSelect({
  users,
  selected,
  onChange,
  loading = false,
  maxHeight = 224,
  className,
}: UserMultiSelectProps) {
  const [query, setQuery] = useState("")

  // Case-insensitive match on name or email
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)
    )
  }, [users, query])

  const selectedSet = useMemo(() => new Set(selected), [selected])
  const allVisibleSelected = filtered.length > 0 && filtered.every((u) => selectedSet.has(u.id))

  function toggleUser(id: number) {
    onChange(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  // Select-all operates on the visible (filtered) users so a search can be
  // used to bulk-select a subset; deselecting removes only the visible ones.
  function toggleAll() {
    if (allVisibleSelected) {
      const visible = new Set(filtered.map((u) => u.id))
      onChange(selected.filter((id) => !visible.has(id)))
    } else {
      const merged = new Set(selected)
      filtered.forEach((u) => merged.add(u.id))
      onChange(Array.from(merged))
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users…"
          className="h-9 pl-8 text-sm"
          aria-label="Search users"
        />
      </div>

      <div className="overflow-hidden rounded-md border">
        {/* Select all */}
        {/* A label wrapping the checkbox keeps the whole row clickable without nesting buttons */}
        <label
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 border-b bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/50",
            (loading || filtered.length === 0) && "cursor-not-allowed opacity-60"
          )}
        >
          <Checkbox
            checked={allVisibleSelected}
            onCheckedChange={toggleAll}
            disabled={loading || filtered.length === 0}
            aria-label={query ? "Select all matching users" : "Select all users"}
          />
          <span className="font-medium">{query ? "Select all matching" : "Select all"}</span>
          <Badge variant="secondary" className="ml-auto text-xs tabular-nums">
            {selected.length} / {users.length}
          </Badge>
        </label>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight }}>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="size-4 rounded-sm" />
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}

          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-1.5 px-3 py-6 text-center">
              <Users className="size-4 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">
                {users.length === 0 ? "No users available." : "No users match your search."}
              </p>
            </div>
          )}

          {!loading &&
            filtered.map((user) => {
              const checked = selectedSet.has(user.id)
              return (
                <label
                  key={user.id}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                    checked && "bg-primary/5"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleUser(user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                  <Avatar className="size-6">
                    <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-[9px]">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1 truncate">{user.name}</span>
                  {user.email && (
                    <span className="hidden max-w-[45%] truncate text-xs text-muted-foreground sm:inline">
                      {user.email}
                    </span>
                  )}
                </label>
              )
            })}
        </div>
      </div>
    </div>
  )
}
