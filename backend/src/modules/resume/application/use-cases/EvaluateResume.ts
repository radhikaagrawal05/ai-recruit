import { geminiService, ResumeEvaluation } from "../../../../infrastructure/ai/GeminiService";
import { ICandidateRepository } from "../../../candidates/domain/repositories/ICandidateRepository";
import { NotFoundError } from "../../../../shared/errors/AppError";

export class EvaluateResume {
  constructor(private candidateRepository: ICandidateRepository) {}

  async execute(
    candidateId: string,
    jobDescription: string,
    requiredSkills: string[]
  ): Promise<ResumeEvaluation> {
    const candidate = await this.candidateRepository.findById(candidateId);
    if (!candidate) {
      throw new NotFoundError("Candidate");
    }

    if (!candidate.resumeText) {
      throw new Error("Resume has not been parsed yet. Please upload and parse the resume first.");
    }

    // Call Gemini AI for evaluation
    const evaluation = await geminiService.evaluateResume(
      candidate.resumeText,
      jobDescription,
      requiredSkills
    );

    // Update candidate with AI results
    await this.candidateRepository.update(candidateId, {
      aiGrade: evaluation.grade,
      aiSummary: evaluation.summary,
      aiScores: evaluation.scores,
      aiStrengths: evaluation.strengths,
      aiWeaknesses: evaluation.weaknesses,
    });

    return evaluation;
  }
}
