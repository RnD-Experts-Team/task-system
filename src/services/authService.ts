import { apiClient } from "./api";
import type { LoginCredentials, LoginResponse, User } from "@/types";

const TOKEN_KEY = "auth_token";

// ─── Profile Update Payload ──────────────────────────────────────
// Fields accepted by POST /profile (multipart/form-data)
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: File | null; // image file, max 10 000 KB
}

// ─── Password Update Payload ─────────────────────────────────────
// Fields accepted by POST /profile/password (application/json)
export interface UpdatePasswordPayload {
  password: string;             // min 8 characters
  password_confirmation: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/login", credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post("/logout");
  }

  // GET /me — returns the authenticated user's data
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>("/me");
    return response.data;
  }

  // POST /profile — update name, email and/or avatar (multipart/form-data)
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const form = new FormData();
    if (payload.name !== undefined) form.append("name", payload.name);
    if (payload.email !== undefined) form.append("email", payload.email);
    // Only append the file when the caller actually chose one
    if (payload.avatar instanceof File) form.append("avatar", payload.avatar);

    const response = await apiClient.postMultipart<User>("/profile", form, {
      // Show a success toast automatically via the api interceptor
      toast: { success: "Profile updated successfully." },
    } as never);
    return response.data;
  }

  // POST /profile/password — change the authenticated user's password (JSON)
  async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
    await apiClient.post("/profile/password", payload, {
      toast: { success: "Password updated successfully." },
    } as never);
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
