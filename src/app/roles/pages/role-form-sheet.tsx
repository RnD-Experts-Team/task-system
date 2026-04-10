import { useEffect, useMemo, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import type { Permission, Role } from "@/types"
import type { RoleFormData } from "@/app/roles/types"

type RoleFormSheetProps = {
  mode: "create" | "edit"
  role?: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RoleFormData) => void
  submitting?: boolean
  permissionsCatalog: Permission[]
  guardOptions: string[]
  permissionsLoading?: boolean
}

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  create: "Can create new records.",
  read: "Can view existing records.",
  update: "Can edit existing records.",
  delete: "Can permanently remove records.",
}

function prettifyLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function RoleFormSheet({
  mode,
  role,
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
  permissionsCatalog,
  guardOptions,
  permissionsLoading = false,
}: RoleFormSheetProps) {
  const [name, setName] = useState("")
  const [guardName, setGuardName] = useState("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [errors, setErrors] = useState<{ name?: string; guard_name?: string; permissions?: string }>({})

  // Show only permissions that belong to the currently selected guard.
  const visiblePermissions = useMemo(
    () => permissionsCatalog.filter((permission) => permission.guard_name === guardName),
    [permissionsCatalog, guardName],
  )

  useEffect(() => {
    if (!open) return

    if (mode === "edit" && role) {
      setName(role.name)
      setGuardName(role.guard_name)
      setPermissions(role.permissions.map((permission) => permission.name))
    } else {
      setName("")
      setGuardName(guardOptions[0] ?? "")
      setPermissions([])
    }

    setErrors({})
  }, [open, mode, role, guardOptions])

  useEffect(() => {
    if (!open) return
    if (!guardName && guardOptions.length > 0) {
      setGuardName(guardOptions[0])
      return
    }
    if (guardName && !guardOptions.includes(guardName) && guardOptions.length > 0) {
      setGuardName(guardOptions[0])
    }
  }, [open, guardName, guardOptions])

  useEffect(() => {
    if (!guardName) return
    const allowedNames = new Set(visiblePermissions.map((permission) => permission.name))
    setPermissions((prev) => prev.filter((permission) => allowedNames.has(permission)))
  }, [guardName, visiblePermissions])

  function togglePermission(permissionName: string) {
    setPermissions((prev) =>
      prev.includes(permissionName)
        ? prev.filter((name) => name !== permissionName)
        : [...prev, permissionName],
    )
  }

  function validate() {
    const next: { name?: string; guard_name?: string; permissions?: string } = {}
    if (!name.trim()) next.name = "Role name is required"
    if (!guardName) next.guard_name = "Guard name is required"
    if (permissions.length === 0) next.permissions = "At least one permission is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ name: name.trim(), guard_name: guardName, permissions })
  }

  const allVisibleSelected = visiblePermissions.length > 0 && permissions.length === visiblePermissions.length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="gap-1">
          <SheetTitle className="text-2xl font-bold">
            {mode === "create" ? "Create Role" : "Edit Role"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Define a new role and assign its permissions."
              : "Update the role name and its permissions."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-4 pb-8 space-y-6">
            <Separator />

            <div className="space-y-2">
              <Label htmlFor="role-name" className="text-sm font-medium">
                Role Name
              </Label>
              <Input
                id="role-name"
                placeholder="e.g. Editor, Reviewer, Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="guard-name" className="text-sm font-medium">
                Guard Name
              </Label>

              <Select value={guardName} onValueChange={setGuardName}>
                <SelectTrigger id="guard-name" className={errors.guard_name ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select guard" />
                </SelectTrigger>
                <SelectContent>
                  {guardOptions.map((guard) => (
                    <SelectItem key={guard} value={guard}>
                      {prettifyLabel(guard)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.guard_name && <p className="text-xs text-destructive">{errors.guard_name}</p>}
              {guardOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">No guards available from the API response.</p>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                {guardOptions.map((guard) => {
                  const selected = guardName === guard
                  return (
                    <button
                      key={guard}
                      type="button"
                      onClick={() => setGuardName(guard)}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <ShieldCheck className={`mt-0.5 size-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{prettifyLabel(guard)}</p>
                          <p className="text-xs text-muted-foreground">Guard from API response.</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Permissions</Label>
                <div className="flex items-center gap-2">
                  {permissions.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {permissions.length} selected
                    </Badge>
                  )}
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline underline-offset-2 disabled:opacity-50"
                    onClick={() =>
                      setPermissions(
                        allVisibleSelected
                          ? []
                          : visiblePermissions.map((permission) => permission.name),
                      )
                    }
                    disabled={permissionsLoading || visiblePermissions.length === 0}
                  >
                    {allVisibleSelected ? "Deselect all" : "Select all"}
                  </button>
                </div>
              </div>

              {errors.permissions && <p className="text-xs text-destructive">{errors.permissions}</p>}
              {!errors.permissions && (
                <p className="text-xs text-muted-foreground">
                  Select one or more permissions for this role.
                </p>
              )}

              {permissionsLoading ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading permissions...
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {visiblePermissions.map((permission) => {
                    const selected = permissions.includes(permission.name)
                    return (
                      <label
                        key={permission.id}
                        htmlFor={`perm-${permission.id}`}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                          selected ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={selected}
                            onCheckedChange={() => togglePermission(permission.name)}
                            className="mt-0.5"
                          />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{prettifyLabel(permission.name)}</p>
                            <p className="text-xs text-muted-foreground">
                              {PERMISSION_DESCRIPTIONS[permission.name] ?? "Permission from API response."}
                            </p>
                          </div>
                          {selected && <CheckCircle2 className="ml-auto mt-0.5 size-4 text-primary" />}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}

              {!permissionsLoading && visiblePermissions.length === 0 && guardName && (
                <p className="text-xs text-muted-foreground">No permissions available for this guard.</p>
              )}

              {permissions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 rounded-lg bg-muted/50 p-2">
                  {permissions.map((permissionName) => (
                    <Badge key={permissionName} variant="secondary" className="capitalize">
                      {prettifyLabel(permissionName)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={submitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Saving..." : mode === "create" ? "Create Role" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
