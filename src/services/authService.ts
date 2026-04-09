import { apiClient } from "./api";
import type { LoginCredentials, LoginResponse, User } from "@/types";

const TOKEN_KEY = "auth_token";

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/login", credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post("/logout");
  }

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>("/me");
    return response.data;
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
