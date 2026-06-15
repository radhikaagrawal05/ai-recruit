import { IJobRepository } from "../../domain/repositories/IJobRepository";
import { Job } from "../../domain/entities/Job";
import { JobModel } from "../models/JobModel";
import { JobStatus } from "../../domain/value-objects/JobStatus";

export class MongoJobRepository implements IJobRepository {

  private toEntity(doc: any): Job {
    return new Job({
      id: doc._id.toString(),
      title: doc.title,
      department: doc.department,
      description: doc.description,
      requiredSkills: doc.requiredSkills,
      experienceLevel: doc.experienceLevel,
      location: doc.location,
      status: doc.status as JobStatus,
      createdBy: doc.createdBy.toString(),
      createdAt: doc.createdAt,
    });
  }

  async save(job: Job): Promise<Job> {
    const doc = await JobModel.create({
      title: job.title,
      department: job.department,
      description: job.description,
      requiredSkills: job.requiredSkills,
      experienceLevel: job.experienceLevel,
      location: job.location,
      status: job.status,
      createdBy: job.createdBy,
    });
    return this.toEntity(doc);
  }

  async findAll(): Promise<Job[]> {
    const docs = await JobModel.find().sort({ createdAt: -1 });
    return docs.map(this.toEntity);
  }

  async findById(id: string): Promise<Job | null> {
    const doc = await JobModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async findByStatus(status: string): Promise<Job[]> {
    const docs = await JobModel.find({ status }).sort({ createdAt: -1 });
    return docs.map(this.toEntity);
  }

  async update(id: string, data: Partial<any>): Promise<Job | null> {
    const doc = await JobModel.findByIdAndUpdate(id, data, { new: true });
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await JobModel.findByIdAndDelete(id);
  }

  async count(): Promise<number> {
    return JobModel.countDocuments();
  }

  async countByStatus(status: string): Promise<number> {
    return JobModel.countDocuments({ status });
  }
}