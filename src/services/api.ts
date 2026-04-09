import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  isCancel,
} from "axios";
import { toast } from "sonner";
import type { ApiResponse, PaginatedData } from "@/types";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
      
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  // ─── Interceptors ──────────────────────────────────────────────

  // Allow callers to pass `toast` messages through config: { toast: { success, error } }
  private setupInterceptors(): void {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - axios headers typing is loose here
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        try {
          const cfg = response.config as AxiosRequestConfig & { toast?: { success?: string } };
          if (cfg?.toast?.success) {
            toast.success(cfg.toast.success);
          }
        } catch (err) {
          // swallow
        }

        return response;
      },
      (error) => {
        if (isCancel(error)) return Promise.reject(error);

        try {
          const cfg = error?.config as AxiosRequestConfig & { toast?: { error?: string } } | undefined;

          // If backend sent a message use it, otherwise allow per-request override
          const serverMessage = error?.response?.data?.message;
          const toastMessage = cfg?.toast?.error ?? serverMessage;
          if (toastMessage) toast.error(String(toastMessage));
        } catch (err) {
          // swallow
        }

        if (error.response?.status === 401) {
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
        }

        return Promise.reject(error);
      },
    );
  }

  // ─── Public Methods ────────────────────────────────────────────

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async getPaginated<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<PaginatedData<T>>> {
    const response = await this.client.get<ApiResponse<PaginatedData<T>>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  async postMultipart<T>(url: string, data: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async downloadFile(url: string, config?: AxiosRequestConfig): Promise<void> {
    const response: AxiosResponse<Blob> = await this.client.get(url, {
      ...config,
      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"] as string | undefined;
    let filename = "download";

    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
      if (match?.[1]) {
        filename = decodeURIComponent(match[1].replace(/["]/g, ""));
      }
    }

    const blob = new Blob([response.data]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }
}

export const apiClient = new ApiClient();
