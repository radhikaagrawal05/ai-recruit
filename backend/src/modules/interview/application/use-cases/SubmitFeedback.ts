import { IInterviewRepository } from "../../domain/repositories/IInterviewRepository";
import { InterviewRound } from "../../domain/entities/InterviewRound";
import { RoundStatus } from "../../domain/value-objects/RoundStatus";
import { NotFoundError } from "../../../../shared/errors/AppError";

export interface SubmitFeedbackDTO {
  feedback: string;
  rating: number;
  recommendNextRound: boolean;
}

export class SubmitFeedback {
  constructor(private interviewRepository: IInterviewRepository) {}

  async execute(roundId: string, dto: SubmitFeedbackDTO): Promise<InterviewRound> {
    const round = await this.interviewRepository.update(roundId, {
      interviewerFeedback: dto.feedback,
      interviewerRating: dto.rating,
      recommendNextRound: dto.recommendNextRound,
      status: RoundStatus.COMPLETED,
    });

    if (!round) {
      throw new NotFoundError("Interview round");
    }

    return round;
  }
}
