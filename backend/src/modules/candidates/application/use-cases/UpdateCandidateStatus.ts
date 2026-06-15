import { ICandidateRepository } from "../../domain/repositories/ICandidateRepository";
import { CandidateStatus } from "../../domain/value-objects/CandidateStatus";
import { NotFoundError } from "../../../../shared/errors/AppError";
import { Candidate } from "../../domain/entities/Candidate";

export class UpdateCandidateStatus {
  constructor(private candidateRepository: ICandidateRepository) {}

  async execute(id: string, status: CandidateStatus): Promise<Candidate> {
    const candidate = await this.candidateRepository.update(id, { status });
    if (!candidate) {
      throw new NotFoundError("Candidate");
    }
    return candidate;
  }
}
