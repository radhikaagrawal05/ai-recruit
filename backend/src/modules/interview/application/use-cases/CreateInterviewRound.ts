import { IInterviewRepository } from "../../domain/repositories/IInterviewRepository";
import { ICandidateRepository } from "../../../candidates/domain/repositories/ICandidateRepository";
import { InterviewRound } from "../../domain/entities/InterviewRound";
import { RoundStatus } from "../../domain/value-objects/RoundStatus";
import { NotFoundError } from "../../../../shared/errors/AppError";
import { geminiService } from "../../../../infrastructure/ai/GeminiService";
import { MongoJobRepository } from "../../../jobs/infrastructure/repositories/MongoJobRepository";
import { emailService } from "../../../../infrastructure/email/EmailService";

export interface CreateInterviewRoundDTO {
  candidateId: string;
  jobId: string;
  interviewerId?: string;
  scheduledAt?: string;
}

export class CreateInterviewRound {
  constructor(
    private interviewRepository: IInterviewRepository,
    private candidateRepository: ICandidateRepository
  ) {}

  async execute(dto: CreateInterviewRoundDTO): Promise<InterviewRound> {
    // Get candidate for resume context
    const candidate = await this.candidateRepository.findById(dto.candidateId);
    if (!candidate) {
      throw new NotFoundError("Candidate");
    }

    // Get job for description and skills
    const jobRepo = new MongoJobRepository();
    const job = await jobRepo.findById(dto.jobId);
    if (!job) {
      throw new NotFoundError("Job");
    }

    // Determine round number
    const existingRounds = await this.interviewRepository.countByCandidateId(dto.candidateId);
    const roundNumber = existingRounds + 1;

    // Get previous feedback if this is not round 1
    let previousFeedback: string | undefined;
    if (roundNumber > 1) {
      const rounds = await this.interviewRepository.findByCandidateId(dto.candidateId);
      const lastRound = rounds[rounds.length - 1];
      if (lastRound?.interviewerFeedback) {
        previousFeedback = lastRound.interviewerFeedback;
      }
    }

    // Generate AI questions
    let suggestedQuestions: any[] = [];
    try {
      suggestedQuestions = await geminiService.generateQuestions(
        candidate.aiSummary || `Candidate: ${candidate.name}, applying for ${job.title}`,
        job.description,
        job.requiredSkills,
        roundNumber,
        previousFeedback
      );
    } catch {
      // AI failed — create round without questions
    }

    const round = new InterviewRound({
      candidateId: dto.candidateId,
      jobId: dto.jobId,
      roundNumber,
      interviewerId: dto.interviewerId,
      status: RoundStatus.SCHEDULED,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      suggestedQuestions,
    });

    const savedRound = await this.interviewRepository.save(round);

    if (dto.scheduledAt && candidate.email) {
      await emailService.sendInterviewInvite(
        candidate.email,
        candidate.name,
        job.title,
        roundNumber,
        new Date(dto.scheduledAt)
      );
    }

    return savedRound;
  }
}
