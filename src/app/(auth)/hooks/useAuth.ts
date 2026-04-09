import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { LoginCredentials } from "@/types";
import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeLogin = useAuthStore((s) => s.login);
  const storeLogout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const login = async (credentials: LoginCredentials) => {
    try {
      await storeLogin(credentials);
      const currentUser = useAuthStore.getState().user;
      const name = currentUser?.name ?? "";
      toast.success(name ? `Welcome back, ${name}` : "Signed in successfully");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error("Sign in failed. Check your credentials and try again.");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await storeLogout();
      toast.success("Signed out successfully");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error("Sign out failed. Please try again.");
      navigate("/login", { replace: true });
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  } as const;
}
