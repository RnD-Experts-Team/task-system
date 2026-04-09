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

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
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
