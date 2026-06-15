import api from "../lib/axios";
import type { ApiResponse, Job } from "../types";

export const jobService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Job[]>>("/jobs");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get<ApiResponse<{ total: number; open: number; closed: number; paused: number }>>("/jobs/stats");
    return res.data;
  },

  create: async (data: {
    title: string;
    department: string;
    description: string;
    requiredSkills: string[];
    experienceLevel?: string;
    location?: string;
  }) => {
    const res = await api.post<ApiResponse<Job>>("/jobs", data);
    return res.data;
  },

  update: async (id: string, data: Partial<Job>) => {
    const res = await api.put<ApiResponse<Job>>(`/jobs/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/jobs/${id}`);
    return res.data;
  },
};
