// Types scoped to the roles feature

/** Shape used by the create/edit form */
export type RoleFormData = {
  name: string
  permissions: string[]
  guard_name: string
}
