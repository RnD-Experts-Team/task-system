import { useEffect } from "react";
import { useDashboardStore } from "@/app/dashboard/stores/dashboardStore";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * Hook that fetches the correct dashboard data based on the user's permissions.
 * - Users with "view analytics" permission get the analytics endpoint.
 * - All authenticated users get the employee endpoint.
 */
export function useDashboard() {
  const { hasPermission, hasRole } = usePermissions();

  const canViewAnalytics = hasPermission("view analytics") || hasRole("admin");

  const {
    analytics,
    analyticsPeriod,
    analyticsLoading,
    employee,
    employeeLoading,
    fetchAnalytics,
    setAnalyticsPeriod,
    fetchEmployee,
  } = useDashboardStore();

  // Fetch on mount — only analytics if permitted, always employee
  useEffect(() => {
    if (canViewAnalytics) {
      fetchAnalytics();
    }
    fetchEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewAnalytics]);

  return {
    // permissions
    canViewAnalytics,

    // analytics
    analytics,
    analyticsPeriod,
    analyticsLoading,
    setAnalyticsPeriod,
    refetchAnalytics: fetchAnalytics,

    // employee
    employee,
    employeeLoading,
    refetchEmployee: fetchEmployee,
  } as const;
}
