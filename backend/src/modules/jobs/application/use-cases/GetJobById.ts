import { IJobRepository } from "../../domain/repositories/IJobRepository";
import { Job } from "../../domain/entities/Job";
import { NotFoundError } from "../../../../shared/errors/AppError";

export class GetJobById {
  constructor(private jobRepository: IJobRepository) {}

  async execute(id: string): Promise<Job> {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      throw new NotFoundError("Job");
    }
    return job;
  }
}
