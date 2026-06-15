import api from "../lib/axios";
import type { ApiResponse, User } from "../types";

export const authService = {
  register: async (data: { name: string; email: string; password: string; role: string }) => {
    const res = await api.post<ApiResponse<User>>("/auth/register", data);
    return res.data;
  },

  verifyEmail: async (data: { email: string; code: string }) => {
    const res = await api.post<ApiResponse<void>>("/auth/verify-email", data);
    return res.data;
  },

  resendVerification: async (email: string) => {
    const res = await api.post<ApiResponse<void>>("/auth/resend-verification", { email });
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>("/auth/login", data);
    return res.data;
  },

  me: async () => {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data;
  },
};
