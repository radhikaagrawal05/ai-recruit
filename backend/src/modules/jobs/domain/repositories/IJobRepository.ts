import { Job } from "../entities/Job";

export interface IJobRepository {
  save(job: Job): Promise<Job>;
  findAll(): Promise<Job[]>;
  findById(id: string): Promise<Job | null>;
  findByStatus(status: string): Promise<Job[]>;
  update(id: string, data: Partial<Job>): Promise<Job | null>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  countByStatus(status: string): Promise<number>;
}