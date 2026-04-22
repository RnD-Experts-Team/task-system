import { useEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, ChevronDown, ChevronUp, Loader2, Search, UserRound, X } from "lucide-react"
import { usersService } from "@/services/usersService"
import { usePermissions } from "@/hooks/usePermissions"
import type { User } from "@/app/users/data"
import type { AddWorkspaceMemberPayload } from "../types"

// ─── Validation schema ────────────────────────────────────────────
// The API requires user_id (integer) — role must be viewer or editor
const schema = z.object({
  user_id: z.number({ message: "Please select a user" }).int().positive("Please select a user"),
  role: z.enum(["viewer", "editor"] as const, { message: "Role is required" }),
})

type FormValues = z.infer<typeof schema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the validated payload when the form is submitted */
  onSubmit: (payload: AddWorkspaceMemberPayload) => void
  submitting?: boolean
  /** Error message returned by the API — shown below the form */
  submitError?: string | null
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/**
 * AddMemberDialog — dialog form for adding a new member to a workspace.
 * Searches existing system users and sends their user_id to the API.
 * Maps to POST /workspaces/{workspaceId}/users.
 */
export function AddMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
  submitError,
}: Props) {
  const { hasPermission } = usePermissions()
  const canViewUsers = hasPermission("view users")

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "viewer" },
  })

  // ─── User search state ────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [collapsedSelectedUser, setCollapsedSelectedUser] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  // Filter users based on the search query
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return allUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  }, [allUsers, searchQuery])

  // Fetch users when the dialog opens — only if the current user has permission
  useEffect(() => {
    if (!open || !canViewUsers) return
    setUsersLoading(true)
    usersService
      .getAll(1)
      .then(({ users }) => setAllUsers(users))
      .catch(() => setAllUsers([]))
      .finally(() => setUsersLoading(false))
  }, [open, canViewUsers])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  // Reset keyboard focus when dropdown or filtered users change
  useEffect(() => {
    if (!dropdownOpen) setFocusedIndex(-1)
  }, [dropdownOpen, filteredUsers])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!dropdownOpen || focusedIndex < 0) return
    const el = document.getElementById(
      `add-member-user-${filteredUsers[focusedIndex]?.id}`,
    )
    if (el) el.scrollIntoView({ block: "nearest" })
  }, [focusedIndex, dropdownOpen, filteredUsers])

  // Select a user from the dropdown
  function handleSelectUser(user: User) {
    setSelectedUser(user)
    setSearchQuery("")
    setDropdownOpen(false)
    setValue("user_id", Number(user.id), { shouldValidate: true })
    setCollapsedSelectedUser(false)
  }

  // Clear the selected user
  function handleClearUser() {
    setSelectedUser(null)
    setSearchQuery("")
    setValue("user_id", undefined as unknown as number, { shouldValidate: false })
    setCollapsedSelectedUser(false)
    setTimeout(() => searchInputRef.current?.focus(), 0)
  }

  // Reset all local state when the dialog closes
  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      reset()
      setSelectedUser(null)
      setCollapsedSelectedUser(false)
      setSearchQuery("")
      setDropdownOpen(false)
    }
    onOpenChange(isOpen)
  }

  function handleSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!dropdownOpen) {
      if (e.key === "ArrowDown") {
        setDropdownOpen(true)
        setFocusedIndex(0)
        e.preventDefault()
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex((prev) => {
        const next = prev < 0 ? 0 : Math.min(prev + 1, filteredUsers.length - 1)
        return next
      })
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex((prev) => {
        const next = prev <= 0 ? Math.max(filteredUsers.length - 1, 0) : prev - 1
        return next
      })
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (focusedIndex >= 0 && filteredUsers[focusedIndex]) {
        handleSelectUser(filteredUsers[focusedIndex])
      }
    } else if (e.key === "Escape") {
      setDropdownOpen(false)
    }
  }

  function handleFormSubmit(values: FormValues) {
    onSubmit({ user_id: values.user_id, role: values.role })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg gap-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogHeader>
            <DialogTitle className="text-lg">Add Member</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              Search and select a user to add to this workspace.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-0">
          <div className="px-6 py-5 space-y-5">

            {/* ── User search picker ────────────────────────────────── */}
            <div className="space-y-2">
              <Label>User</Label>

              {!canViewUsers ? (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
                  You don't have permission to search users.
                </div>
              ) : selectedUser ? (
                collapsedSelectedUser ? (
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/10 px-2 py-1">
                    <Avatar className="size-7 shrink-0">
                      {selectedUser.avatarUrl ? (
                        <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />
                      ) : null}
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">
                        {selectedUser.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCollapsedSelectedUser(false)}
                      disabled={submitting}
                      className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      aria-label="Expand selected user"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClearUser}
                      disabled={submitting}
                      className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      aria-label="Clear selected user"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                    <Avatar className="size-9 shrink-0">
                      {selectedUser.avatarUrl ? (
                        <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />
                      ) : null}
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">
                        {selectedUser.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedUser.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCollapsedSelectedUser(true)}
                        disabled={submitting}
                        className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        aria-label="Collapse selected user"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleClearUser}
                        disabled={submitting}
                        className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        aria-label="Clear selected user"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* Search input + dropdown */
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search by name or email…"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setDropdownOpen(true)
                        setFocusedIndex(-1)
                      }}
                      onFocus={() => setDropdownOpen(true)}
                      onKeyDown={handleSearchKeyDown}
                      aria-controls="add-member-users-list"
                      aria-autocomplete="list"
                      aria-activedescendant={
                        focusedIndex >= 0 && filteredUsers[focusedIndex]
                          ? `add-member-user-${filteredUsers[focusedIndex].id}`
                          : undefined
                      }
                      autoComplete="off"
                      disabled={submitting}
                      className="pl-9 pr-9"
                    />
                    {usersLoading ? (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    )}
                  </div>

                  {/* Dropdown list */}
                  {dropdownOpen && !usersLoading && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden transition-all duration-150 ease-in-out"
                    >
                      {filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center gap-1.5 py-6 text-center">
                          <UserRound className="size-7 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? "No users match your search" : "No users found"}
                          </p>
                        </div>
                      ) : (
                        <ul ref={listRef} id="add-member-users-list" className="max-h-52 overflow-y-auto py-1" role="listbox">
                          {filteredUsers.map((user, idx) => (
                            <li key={user.id}>
                              <button
                                id={`add-member-user-${user.id}`}
                                type="button"
                                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors ${
                                  focusedIndex === idx ? "bg-accent" : ""
                                }`}
                                onPointerDown={(e) => {
                                  e.preventDefault()
                                  handleSelectUser(user)
                                }}
                                onMouseEnter={() => setFocusedIndex(idx)}
                                role="option"
                                aria-selected={focusedIndex === idx}
                              >
                                <Avatar className="size-8 shrink-0">
                                  {user.avatarUrl ? (
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                  ) : null}
                                  <AvatarFallback className="text-xs font-medium">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium leading-tight truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Validation error for user_id (shown when submitting without selecting) */}
              {errors.user_id && (
                <p className="text-xs text-destructive">{errors.user_id.message}</p>
              )}
            </div>

            {/* ── Role selector ─────────────────────────────────────── */}
            <div className="space-y-2">
              <Label htmlFor="add-member-role">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={submitting}
                  >
                    <SelectTrigger id="add-member-role" className="w-full h-auto min-h-[4rem] text-left px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors border-border/60">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer" className="py-3 px-4 cursor-pointer">
                        <div className="flex flex-col items-start text-left gap-1">
                          <span className="font-medium text-foreground text-sm">Viewer</span>
                          <span className="text-sm text-muted-foreground leading-snug">Can view workspace content</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="editor" className="py-3 px-4 cursor-pointer mt-1">
                        <div className="flex flex-col items-start text-left gap-1">
                          <span className="font-medium text-foreground text-sm">Editor</span>
                          <span className="text-sm text-muted-foreground leading-snug">Can edit and manage content</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            {/* API error */}
            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/60 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="min-w-20"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="min-w-28">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
