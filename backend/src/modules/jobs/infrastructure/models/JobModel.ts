import mongoose, { Schema, Document } from "mongoose";
import { JobStatus } from "../../domain/value-objects/JobStatus";

export interface IJobDocument extends Document {
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  experienceLevel: string;
  location: string;
  status: JobStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    title:           { type: String, required: true },
    department:      { type: String, required: true },
    description:     { type: String, required: true },
    requiredSkills:  { type: [String], default: [] },
    experienceLevel: { type: String, default: "" },
    location:        { type: String, default: "" },
    status:          { type: String, enum: Object.values(JobStatus), default: JobStatus.OPEN },
    createdBy:       { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const JobModel = mongoose.model<IJobDocument>("Job", JobSchema);