import { IJobRepository } from "../../domain/repositories/IJobRepository";
import { Job } from "../../domain/entities/Job";
import { JobStatus } from "../../domain/value-objects/JobStatus";

export interface CreateJobDTO {
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  experienceLevel?: string;
  location?: string;
  createdBy: string;
}

export class CreateJob {
  constructor(private jobRepository: IJobRepository) {}

  async execute(dto: CreateJobDTO): Promise<Job> {
    const job = new Job({
      title: dto.title,
      department: dto.department,
      description: dto.description,
      requiredSkills: dto.requiredSkills,
      experienceLevel: dto.experienceLevel,
      location: dto.location,
      status: JobStatus.OPEN,
      createdBy: dto.createdBy,
    });
    return this.jobRepository.save(job);
  }
}