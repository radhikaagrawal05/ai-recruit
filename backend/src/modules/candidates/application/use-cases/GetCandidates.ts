import { ICandidateRepository } from "../../domain/repositories/ICandidateRepository";
import { Candidate } from "../../domain/entities/Candidate";

export class GetCandidates {
  constructor(private candidateRepository: ICandidateRepository) {}

  async execute(filters?: { jobId?: string; status?: string; aiGrade?: string }): Promise<Candidate[]> {
    return this.candidateRepository.findAll(filters);
  }
}
