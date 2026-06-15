import { ICandidateRepository } from "../../domain/repositories/ICandidateRepository";
import { Candidate } from "../../domain/entities/Candidate";
import { NotFoundError } from "../../../../shared/errors/AppError";

export class GetCandidateById {
  constructor(private candidateRepository: ICandidateRepository) {}

  async execute(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findById(id);
    if (!candidate) {
      throw new NotFoundError("Candidate");
    }
    return candidate;
  }
}
