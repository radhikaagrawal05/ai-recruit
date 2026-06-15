import { IJobRepository } from "../../domain/repositories/IJobRepository";
import { Job } from "../../domain/entities/Job";

export class GetJobs {
  constructor(private jobRepository: IJobRepository) {}

  async execute(): Promise<Job[]> {
    return this.jobRepository.findAll();
  }
}