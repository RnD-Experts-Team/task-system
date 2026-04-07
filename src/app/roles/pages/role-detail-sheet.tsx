import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Pencil, Shield, CheckCircle2 } from "lucide-react"
import type { Role, Permission } from "@/app/roles/data"

type RoleDetailSheetProps = {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (role: Role) => void
}

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

const ALL_PERMS: Permission[] = ["create", "read", "update", "delete"]

export function RoleDetailSheet({
  role,
  open,
  onOpenChange,
  onEdit,
}: RoleDetailSheetProps) {
  if (!role) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-full md:max-w-[50vw] overflow-y-auto themed-scrollbar">
        <SheetHeader className="items-center text-center gap-3">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-primary/10 ring-2 ring-primary/20">
            <Shield className="size-8 text-primary" />
          </div>
          <SheetTitle className="text-2xl">{role.name}</SheetTitle>
          <SheetDescription className="text-sm">
            Guard: <span className="font-medium text-foreground">{role.guardName}</span>
          </SheetDescription>
          <Badge variant="secondary" className="uppercase tracking-wider text-xs">
            {role.permissions.length === 4 ? "Full Access" : `${role.permissions.length} Permission${role.permissions.length !== 1 ? "s" : ""}`}
          </Badge>
        </SheetHeader>

        <div className="px-6 pb-10 space-y-8">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Guard
              </p>
              <p className="text-sm font-medium font-mono">{role.guardName}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Created
              </p>
              <p className="text-sm font-medium">{role.createdAt}</p>
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Permissions
            </h3>
            <div className="space-y-2">
              {ALL_PERMS.map((permission) => {
                const granted = role.permissions.includes(permission)
                return (
                  <div
                    key={permission}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      granted
                        ? "border-primary/30 bg-primary/5"
                        : "border-border opacity-40"
                    }`}
                  >
                    <CheckCircle2
                      className={`size-4 shrink-0 ${
                        granted ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">
                        {permissionLabels[permission]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {permissionDescriptions[permission]}
                      </p>
                    </div>
                    {granted && (
                      <Badge
                        variant="secondary"
                        className="ml-auto text-xs"
                      >
                        Granted
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {onEdit && (
            <>
              <Separator />
              <Button
                className="w-full"
                variant="outline"
                onClick={() => onEdit(role)}
              >
                <Pencil className="size-4" />
                Edit Role
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
