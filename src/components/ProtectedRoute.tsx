import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { usePermissions } from "@/hooks/usePermissions";

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  fallback = <Navigate to="/dashboard" replace />,
}: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } =
    usePermissions();

  // A user gains access if they satisfy the role check OR the permission check.
  // Both must be absent to block access (i.e. failing one does not redirect if
  // the other succeeds — admins can skip permission checks, developers rely on
  // direct permissions).
  const roleGranted = role ? hasRole(role) : null;
  const permissionGranted = permission ? hasPermission(permission) : null;

  // If at least one check is defined and none of the defined checks pass, block.
  if (
    (roleGranted !== null || permissionGranted !== null) &&
    roleGranted !== true &&
    permissionGranted !== true
  ) {
    return <>{fallback}</>;
  }

  if (permissions?.length) {
    const granted = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!granted) return <>{fallback}</>;
  }

  return <>{children}</>;
}
