import { z } from "zod";

export const createInterviewSchema = z.object({
  candidateId:  z.string().min(1, "Candidate ID is required"),
  jobId:        z.string().min(1, "Job ID is required"),
  interviewerId: z.string().optional(),
  scheduledAt:  z.string().optional(),
});

export const submitFeedbackSchema = z.object({
  feedback:       z.string().min(10, "Feedback must be at least 10 characters"),
  rating:         z.number().min(1).max(10),
  recommendNextRound: z.boolean(),
});
