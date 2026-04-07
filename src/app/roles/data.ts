export type Permission = "create" | "read" | "update" | "delete"

export type Role = {
  id: string
  name: string
  permissions: Permission[]
  guardName: string
  createdAt: string
}

export type RoleFormData = {
  name: string
  permissions: Permission[]
  guardName: string
}

export const ALL_PERMISSIONS: Permission[] = ["create", "read", "update", "delete"]

export const roles: Role[] = [
  {
    id: "1",
    name: "Admin",
    permissions: ["create", "read", "update", "delete"],
    guardName: "web",
    createdAt: "Jan 10, 2024",
  },
  {
    id: "2",
    name: "Developer",
    permissions: ["read", "update"],
    guardName: "web",
    createdAt: "Feb 14, 2024",
  }
]
