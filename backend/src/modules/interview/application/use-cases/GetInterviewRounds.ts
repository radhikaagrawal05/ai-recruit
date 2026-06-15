import { IInterviewRepository } from "../../domain/repositories/IInterviewRepository";
import { InterviewRound } from "../../domain/entities/InterviewRound";

export class GetInterviewRounds {
  constructor(private interviewRepository: IInterviewRepository) {}

  async byCandidateId(candidateId: string): Promise<InterviewRound[]> {
    return this.interviewRepository.findByCandidateId(candidateId);
  }

  async byInterviewerId(interviewerId: string): Promise<InterviewRound[]> {
    return this.interviewRepository.findByInterviewerId(interviewerId);
  }
}
