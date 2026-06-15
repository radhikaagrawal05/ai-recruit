export interface User {
  id: string;
  name: string;
  email: string;
  role: "HR" | "RECRUITER" | "INTERVIEWER";
}

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  experienceLevel?: string;
  location?: string;
  status: "OPEN" | "CLOSED" | "PAUSED";
  createdBy: string;
  createdAt: string;
}

export interface AIScores {
  skillMatch: number;
  experience: number;
  education: number;
  presentation: number;
  overall: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobId: string;
  resumeUrl?: string;
  resumeText?: string;
  aiGrade?: string;
  aiSummary?: string;
  aiScores?: AIScores;
  aiStrengths?: string[];
  aiWeaknesses?: string[];
  status: "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFERED" | "REJECTED" | "HIRED";
  appliedAt?: string;
  createdAt: string;
}

export interface SuggestedQuestion {
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  intent: string;
}

export interface CodeAnalysis {
  quality: number;
  summary: string;
  strengths: string[];
  issues: string[];
}

export interface InterviewRound {
  id: string;
  candidateId: string;
  jobId: string;
  roundNumber: number;
  interviewerId?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  scheduledAt?: string;
  suggestedQuestions: SuggestedQuestion[];
  interviewerFeedback?: string;
  interviewerRating?: number;
  codeSubmissionUrl?: string;
  codeLanguage?: string;
  codeAnalysis?: CodeAnalysis;
  recommendNextRound?: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
