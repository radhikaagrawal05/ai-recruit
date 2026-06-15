import { IJobRepository } from "../../domain/repositories/IJobRepository";
import { Job } from "../../domain/entities/Job";
import { NotFoundError } from "../../../../shared/errors/AppError";
import { JobStatus } from "../../domain/value-objects/JobStatus";

export interface UpdateJobDTO {
  title?: string;
  department?: string;
  description?: string;
  requiredSkills?: string[];
  experienceLevel?: string;
  location?: string;
  status?: JobStatus;
}

export class UpdateJob {
  constructor(private jobRepository: IJobRepository) {}

  async execute(id: string, dto: UpdateJobDTO): Promise<Job> {
    const job = await this.jobRepository.update(id, dto);
    if (!job) {
      throw new NotFoundError("Job");
    }
    return job;
  }
}
