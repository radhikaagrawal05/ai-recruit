import { z } from "zod";
import { JobStatus } from "../../domain/value-objects/JobStatus";

export const createJobSchema = z.object({
  title:           z.string().min(2, "Title is required"),
  department:      z.string().min(2, "Department is required"),
  description:     z.string().min(10, "Description must be at least 10 characters"),
  requiredSkills:  z.array(z.string()).min(1, "At least one skill is required"),
  experienceLevel: z.string().optional(),
  location:        z.string().optional(),
});

export const updateJobSchema = z.object({
  title:           z.string().min(2).optional(),
  department:      z.string().min(2).optional(),
  description:     z.string().min(10).optional(),
  requiredSkills:  z.array(z.string()).min(1).optional(),
  experienceLevel: z.string().optional(),
  location:        z.string().optional(),
  status:          z.nativeEnum(JobStatus).optional(),
});