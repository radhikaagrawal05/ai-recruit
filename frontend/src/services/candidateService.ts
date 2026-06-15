import api from "../lib/axios";
import type { ApiResponse, Candidate } from "../types";

export const candidateService = {
  getAll: async (filters?: { jobId?: string; status?: string; aiGrade?: string }) => {
    const params = new URLSearchParams();
    if (filters?.jobId) params.set("jobId", filters.jobId);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.aiGrade) params.set("aiGrade", filters.aiGrade);
    const res = await api.get<ApiResponse<Candidate[]>>(`/candidates?${params}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Candidate>>(`/candidates/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get<ApiResponse<{
      total: number; screening: number; interview: number; offered: number; hired: number;
    }>>("/candidates/stats");
    return res.data;
  },

  create: async (data: FormData) => {
    const res = await api.post<ApiResponse<Candidate>>("/candidates", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.patch<ApiResponse<Candidate>>(`/candidates/${id}/status`, { status });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/candidates/${id}`);
    return res.data;
  },

  parseResume: async (candidateId: string, file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    const res = await api.post(`/resume/parse/${candidateId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  evaluateResume: async (candidateId: string) => {
    const res = await api.post(`/resume/evaluate/${candidateId}`);
    return res.data;
  },
};
