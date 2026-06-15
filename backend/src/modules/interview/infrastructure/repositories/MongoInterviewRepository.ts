import { IInterviewRepository } from "../../domain/repositories/IInterviewRepository";
import { InterviewRound } from "../../domain/entities/InterviewRound";
import { InterviewModel } from "../models/InterviewModel";
import { RoundStatus } from "../../domain/value-objects/RoundStatus";

export class MongoInterviewRepository implements IInterviewRepository {

  private toEntity(doc: any): InterviewRound {
    return new InterviewRound({
      id: doc._id.toString(),
      candidateId: doc.candidateId.toString(),
      jobId: doc.jobId.toString(),
      roundNumber: doc.roundNumber,
      interviewerId: doc.interviewerId?.toString(),
      status: doc.status as RoundStatus,
      scheduledAt: doc.scheduledAt,
      suggestedQuestions: doc.suggestedQuestions || [],
      interviewerFeedback: doc.interviewerFeedback,
      interviewerRating: doc.interviewerRating,
      codeSubmissionUrl: doc.codeSubmissionUrl,
      codeLanguage: doc.codeLanguage,
      codeAnalysis: doc.codeAnalysis,
      recommendNextRound: doc.recommendNextRound,
      createdAt: doc.createdAt,
    });
  }

  async save(round: InterviewRound): Promise<InterviewRound> {
    const doc = await InterviewModel.create({
      candidateId: round.candidateId,
      jobId: round.jobId,
      roundNumber: round.roundNumber,
      interviewerId: round.interviewerId,
      status: round.status,
      scheduledAt: round.scheduledAt,
      suggestedQuestions: round.suggestedQuestions,
    });
    return this.toEntity(doc);
  }

  async findById(id: string): Promise<InterviewRound | null> {
    const doc = await InterviewModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByCandidateId(candidateId: string): Promise<InterviewRound[]> {
    const docs = await InterviewModel.find({ candidateId }).sort({ roundNumber: 1 });
    return docs.map(this.toEntity);
  }

  async findByInterviewerId(interviewerId: string): Promise<InterviewRound[]> {
    const docs = await InterviewModel.find({ interviewerId }).sort({ scheduledAt: -1 });
    return docs.map(this.toEntity);
  }

  async update(id: string, data: Partial<any>): Promise<InterviewRound | null> {
    const doc = await InterviewModel.findByIdAndUpdate(id, data, { new: true });
    return doc ? this.toEntity(doc) : null;
  }

  async countByCandidateId(candidateId: string): Promise<number> {
    return InterviewModel.countDocuments({ candidateId });
  }

  async count(): Promise<number> {
    return InterviewModel.countDocuments();
  }

  async findAll(): Promise<InterviewRound[]> {
    const docs = await InterviewModel.find().sort({ createdAt: -1 });
    return docs.map(this.toEntity);
  }
}
