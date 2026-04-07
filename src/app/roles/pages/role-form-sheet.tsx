import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import type { Role, RoleFormData, Permission } from "@/app/roles/data"
import { ALL_PERMISSIONS } from "@/app/roles/data"

type RoleFormSheetProps = {
  mode: "create" | "edit"
  role?: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RoleFormData) => void
}

const GUARD_OPTIONS = ["web", "api"]

const permissionLabels: Record<Permission, string> = {
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
}

const permissionDescriptions: Record<Permission, string> = {
  create: "Can create new resources",
  read: "Can view existing resources",
  update: "Can modify existing resources",
  delete: "Can remove resources permanently",
}

export function RoleFormSheet({
  mode,
  role,
  open,
  onOpenChange,
  onSubmit,
}: RoleFormSheetProps) {
  const [name, setName] = useState("")
  const [guardName, setGuardName] = useState("web")
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [errors, setErrors] = useState<{ name?: string; permissions?: string }>({})

  useEffect(() => {
    if (open) {
      if (mode === "edit" && role) {
        setName(role.name)
        setGuardName(role.guardName)
        setPermissions([...role.permissions])
      } else {
        setName("")
        setGuardName("web")
        setPermissions([])
      }
      setErrors({})
    }
  }, [open, mode, role])

  function togglePermission(permission: Permission) {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  function validate() {
    const next: { name?: string; permissions?: string } = {}
    if (!name.trim()) next.name = "Role name is required"
    if (permissions.length === 0) next.permissions = "At least one permission is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ name: name.trim(), permissions, guardName })
    onOpenChange(false)
  }

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

            {/* Role Name */}
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
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Guard Name */}
            <div className="space-y-2">
              <Label htmlFor="guard-name" className="text-sm font-medium">
                Guard Name
              </Label>
              <Select value={guardName} onValueChange={setGuardName}>
                <SelectTrigger id="guard-name" className="w-full">
                  <SelectValue placeholder="Select guard" />
                </SelectTrigger>
                <SelectContent>
                  {GUARD_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Permissions */}
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
                    className="text-xs text-primary hover:underline underline-offset-2"
                    onClick={() =>
                      setPermissions(
                        permissions.length === ALL_PERMISSIONS.length
                          ? []
                          : [...ALL_PERMISSIONS]
                      )
                    }
                  >
                    {permissions.length === ALL_PERMISSIONS.length
                      ? "Deselect all"
                      : "Select all"}
                  </button>
                </div>
              </div>

              {errors.permissions && (
                <p className="text-xs text-destructive">{errors.permissions}</p>
              )}

              <div className="space-y-2">
                {ALL_PERMISSIONS.map((permission) => (
                  <div
                    key={permission}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                      permissions.includes(permission)
                        ? "border-primary/40 bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => togglePermission(permission)}
                  >
                    <Checkbox
                      id={`perm-${permission}`}
                      checked={permissions.includes(permission)}
                      onCheckedChange={() => togglePermission(permission)}
                      className="mt-0.5"
                    />
                    <div className="flex flex-col gap-0.5">
                      <Label
                        htmlFor={`perm-${permission}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permissionLabels[permission]}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {permissionDescriptions[permission]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {mode === "create" ? "Create Role" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
