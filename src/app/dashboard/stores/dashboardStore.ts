import { create } from "zustand";
import { isCancel } from "axios";
import { toast } from "sonner";
import { dashboardService } from "@/services/dashboardService";
import type { AnalyticsData, AnalyticsPeriod, EmployeeData } from "@/types";

// ─── Store shape ─────────────────────────────────────────────────

interface DashboardState {
  // Analytics (admin)
  analytics: AnalyticsData | null;
  analyticsPeriod: AnalyticsPeriod;
  analyticsLoading: boolean;

  // Employee
  employee: EmployeeData | null;
  employeeLoading: boolean;
  // Flag set when fetching employee dashboard failed (backend error)
  employeeError: boolean;
}

interface DashboardActions {
  /** Fetch analytics data (admin). Shows toast on error. */
  fetchAnalytics: (period?: AnalyticsPeriod) => Promise<void>;
  /** Set the analytics period filter and re-fetch */
  setAnalyticsPeriod: (period: AnalyticsPeriod) => void;
  /** Fetch employee dashboard data. Shows toast on error. */
  fetchEmployee: () => Promise<void>;
}

type DashboardStore = DashboardState & DashboardActions;

// ─── Store ───────────────────────────────────────────────────────

export const useDashboardStore = create<DashboardStore>()((set, get) => ({
  analytics: null,
  analyticsPeriod: "today",
  analyticsLoading: false,

  employee: null,
  employeeLoading: false,
  employeeError: false,

  fetchAnalytics: async (period) => {
    const p = period ?? get().analyticsPeriod;
    set({ analyticsLoading: true });
    try {
      const data = await dashboardService.getAnalytics(p);
      set({ analytics: data, analyticsPeriod: p });
    } catch (error) {
      // Don't toast for canceled requests (e.g. component unmount)
      if (!isCancel(error)) {
        toast.error("Failed to load analytics data");
      }
    } finally {
      set({ analyticsLoading: false });
    }
  },

  setAnalyticsPeriod: (period) => {
    set({ analyticsPeriod: period });
    get().fetchAnalytics(period);
  },

  fetchEmployee: async () => {
    set({ employeeLoading: true, employeeError: false });
    try {
      const data = await dashboardService.getEmployee();
      set({ employee: data });
    } catch (error) {
      if (!isCancel(error)) {
        toast.error("Failed to load employee dashboard");
        set({ employeeError: true });
      }
    } finally {
      set({ employeeLoading: false });
    }
  },
}));
