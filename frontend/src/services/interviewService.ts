import api from "../lib/axios";
import type { ApiResponse, InterviewRound, SuggestedQuestion } from "../types";

export const interviewService = {
  getAll: async () => {
    const res = await api.get<ApiResponse<InterviewRound[]>>("/interviews/all");
    return res.data;
  },

  create: async (data: { candidateId: string; jobId: string; interviewerId?: string; scheduledAt?: string }) => {
    const res = await api.post<ApiResponse<InterviewRound>>("/interviews", data);
    return res.data;
  },

  getByCandidateId: async (candidateId: string) => {
    const res = await api.get<ApiResponse<InterviewRound[]>>(`/interviews/candidate/${candidateId}`);
    return res.data;
  },

  getMyInterviews: async () => {
    const res = await api.get<ApiResponse<InterviewRound[]>>("/interviews/my");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<InterviewRound>>(`/interviews/${id}`);
    return res.data;
  },

  submitFeedback: async (id: string, data: { feedback: string; rating: number; recommendNextRound: boolean }) => {
    const res = await api.patch<ApiResponse<InterviewRound>>(`/interviews/${id}/feedback`, data);
    return res.data;
  },

  generateQuestions: async (id: string) => {
    const res = await api.post<ApiResponse<SuggestedQuestion[]>>(`/interviews/${id}/generate-questions`);
    return res.data;
  },

  uploadCode: async (id: string, file: File, language: string) => {
    const formData = new FormData();
    formData.append("code", file);
    formData.append("language", language);
    const res = await api.post<ApiResponse<InterviewRound>>(`/interviews/${id}/code`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};
