import { z } from "zod";
import { CandidateStatus } from "../../domain/value-objects/CandidateStatus";

export const addCandidateSchema = z.object({
  name:  z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  jobId: z.string().min(1, "Job ID is required"),
});

export const updateCandidateStatusSchema = z.object({
  status: z.nativeEnum(CandidateStatus, { message: "Invalid status" }),
});
