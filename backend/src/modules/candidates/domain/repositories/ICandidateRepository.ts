import { Candidate } from "../entities/Candidate";

export interface ICandidateRepository {
  save(candidate: Candidate): Promise<Candidate>;
  findAll(filters?: { jobId?: string; status?: string; aiGrade?: string }): Promise<Candidate[]>;
  findById(id: string): Promise<Candidate | null>;
  findByJobId(jobId: string): Promise<Candidate[]>;
  findByEmail(email: string): Promise<Candidate | null>;
  update(id: string, data: Partial<any>): Promise<Candidate | null>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  countByStatus(status: string): Promise<number>;
}
