import { IJobRepository } from "../../domain/repositories/IJobRepository";

export class DeleteJob {
  constructor(private jobRepository: IJobRepository) {}

  async execute(id: string): Promise<void> {
    await this.jobRepository.delete(id);
  }
}
