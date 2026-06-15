import { ICandidateRepository } from "../../domain/repositories/ICandidateRepository";
import { Candidate } from "../../domain/entities/Candidate";
import { CandidateModel } from "../models/CandidateModel";
import { CandidateStatus } from "../../domain/value-objects/CandidateStatus";

export class MongoCandidateRepository implements ICandidateRepository {

  private toEntity(doc: any): Candidate {
    return new Candidate({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      jobId: doc.jobId.toString(),
      resumeUrl: doc.resumeUrl,
      resumeText: doc.resumeText,
      aiGrade: doc.aiGrade,
      aiSummary: doc.aiSummary,
      aiScores: doc.aiScores,
      aiStrengths: doc.aiStrengths,
      aiWeaknesses: doc.aiWeaknesses,
      status: doc.status as CandidateStatus,
      appliedAt: doc.appliedAt,
      createdAt: doc.createdAt,
    });
  }

  async save(candidate: Candidate): Promise<Candidate> {
    const doc = await CandidateModel.create({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      jobId: candidate.jobId,
      resumeUrl: candidate.resumeUrl,
      resumeText: candidate.resumeText,
      aiGrade: candidate.aiGrade,
      aiSummary: candidate.aiSummary,
      aiScores: candidate.aiScores,
      aiStrengths: candidate.aiStrengths,
      aiWeaknesses: candidate.aiWeaknesses,
      status: candidate.status,
    });
    return this.toEntity(doc);
  }

  async findAll(filters?: { jobId?: string; status?: string; aiGrade?: string }): Promise<Candidate[]> {
    const query: any = {};
    if (filters?.jobId) query.jobId = filters.jobId;
    if (filters?.status) query.status = filters.status;
    if (filters?.aiGrade) query.aiGrade = filters.aiGrade;

    const docs = await CandidateModel.find(query).sort({ createdAt: -1 });
    return docs.map(this.toEntity);
  }

  async findById(id: string): Promise<Candidate | null> {
    const doc = await CandidateModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByJobId(jobId: string): Promise<Candidate[]> {
    const docs = await CandidateModel.find({ jobId }).sort({ createdAt: -1 });
    return docs.map(this.toEntity);
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const doc = await CandidateModel.findOne({ email });
    return doc ? this.toEntity(doc) : null;
  }

  async update(id: string, data: Partial<any>): Promise<Candidate | null> {
    const doc = await CandidateModel.findByIdAndUpdate(id, data, { new: true });
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await CandidateModel.findByIdAndDelete(id);
  }

  async count(): Promise<number> {
    return CandidateModel.countDocuments();
  }

  async countByStatus(status: string): Promise<number> {
    return CandidateModel.countDocuments({ status });
  }
}
