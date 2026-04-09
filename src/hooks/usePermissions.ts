import { useAuthStore } from "@/app/(auth)/stores/authStore";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const allPermissions = useAuthStore((s) => s.allPermissions);

  const userPermissions = allPermissions.map((p) => p.name);

  const hasPermission = (name: string): boolean =>
    userPermissions.includes(name);

  const hasAnyPermission = (names: string[]): boolean =>
    names.some((name) => userPermissions.includes(name));

  const hasAllPermissions = (names: string[]): boolean =>
    names.every((name) => userPermissions.includes(name));

  const hasRole = (name: string): boolean =>
    user?.roles.some((role) => role.name === name) ?? false;

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
    allPermissions,
  } as const;
}
