import { apiClient } from "./api";
import type { AnalyticsData, AnalyticsPeriod, EmployeeData } from "@/types";

// Dashboard API service — handles analytics & employee endpoints

class DashboardService {
  /** Fetch admin analytics with an optional period filter */
  async getAnalytics(period: AnalyticsPeriod = "today"): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>("/dashboard/analytics", {
      params: { period },
    });
    return response.data;
  }

  /** Fetch the logged-in employee's dashboard data */
  async getEmployee(): Promise<EmployeeData> {
    const response = await apiClient.get<EmployeeData>("/dashboard/employee");
    return response.data;
  }
}

export const dashboardService = new DashboardService();
