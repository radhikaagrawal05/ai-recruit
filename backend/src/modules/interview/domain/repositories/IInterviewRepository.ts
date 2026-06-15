import { InterviewRound } from "../entities/InterviewRound";

export interface IInterviewRepository {
  save(round: InterviewRound): Promise<InterviewRound>;
  findById(id: string): Promise<InterviewRound | null>;
  findByCandidateId(candidateId: string): Promise<InterviewRound[]>;
  findByInterviewerId(interviewerId: string): Promise<InterviewRound[]>;
  update(id: string, data: Partial<any>): Promise<InterviewRound | null>;
  countByCandidateId(candidateId: string): Promise<number>;
  count(): Promise<number>;
}
