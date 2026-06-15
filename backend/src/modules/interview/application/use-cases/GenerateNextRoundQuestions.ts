import { IInterviewRepository } from "../../domain/repositories/IInterviewRepository";
import { ICandidateRepository } from "../../../candidates/domain/repositories/ICandidateRepository";
import { NotFoundError } from "../../../../shared/errors/AppError";
import { geminiService, GeneratedQuestion } from "../../../../infrastructure/ai/GeminiService";
import { MongoJobRepository } from "../../../jobs/infrastructure/repositories/MongoJobRepository";

export class GenerateNextRoundQuestions {
  constructor(
    private interviewRepository: IInterviewRepository,
    private candidateRepository: ICandidateRepository
  ) {}

  async execute(roundId: string): Promise<GeneratedQuestion[]> {
    const round = await this.interviewRepository.findById(roundId);
    if (!round) {
      throw new NotFoundError("Interview round");
    }

    const candidate = await this.candidateRepository.findById(round.candidateId);
    if (!candidate) {
      throw new NotFoundError("Candidate");
    }

    const jobRepo = new MongoJobRepository();
    const job = await jobRepo.findById(round.jobId);
    if (!job) {
      throw new NotFoundError("Job");
    }

    // Get all previous rounds for comprehensive context
    const allRounds = await this.interviewRepository.findByCandidateId(round.candidateId);
    const feedbackHistory = allRounds
      .filter(r => r.interviewerFeedback)
      .map(r => `Round ${r.roundNumber}: ${r.interviewerFeedback} (Rating: ${r.interviewerRating}/10)`)
      .join("\n");

    const questions = await geminiService.generateQuestions(
      candidate.aiSummary || `Candidate: ${candidate.name}`,
      job.description,
      job.requiredSkills,
      round.roundNumber + 1,
      feedbackHistory || undefined
    );

    // Update round with regenerated questions
    await this.interviewRepository.update(roundId, {
      suggestedQuestions: questions,
    });

    return questions;
  }
}
