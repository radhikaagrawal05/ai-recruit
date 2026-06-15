import mongoose, { Schema, Document } from "mongoose";
import { CandidateStatus } from "../../domain/value-objects/CandidateStatus";

export interface ICandidateDocument extends Document {
  name: string;
  email: string;
  phone: string;
  jobId: mongoose.Types.ObjectId;
  resumeUrl: string;
  resumeText: string;
  aiGrade: string;
  aiSummary: string;
  aiScores: {
    skillMatch: number;
    experience: number;
    education: number;
    presentation: number;
    overall: number;
  };
  aiStrengths: string[];
  aiWeaknesses: string[];
  status: CandidateStatus;
  appliedAt: Date;
  createdAt: Date;
}

const CandidateSchema = new Schema<ICandidateDocument>(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true },
    phone:        { type: String, default: "" },
    jobId:        { type: Schema.Types.ObjectId, ref: "Job", required: true },
    resumeUrl:    { type: String, default: "" },
    resumeText:   { type: String, default: "" },
    aiGrade:      { type: String, default: "" },
    aiSummary:    { type: String, default: "" },
    aiScores:     {
      skillMatch:   { type: Number, default: 0 },
      experience:   { type: Number, default: 0 },
      education:    { type: Number, default: 0 },
      presentation: { type: Number, default: 0 },
      overall:      { type: Number, default: 0 },
    },
    aiStrengths:  { type: [String], default: [] },
    aiWeaknesses: { type: [String], default: [] },
    status:       { type: String, enum: Object.values(CandidateStatus), default: CandidateStatus.APPLIED },
    appliedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CandidateModel = mongoose.model<ICandidateDocument>("Candidate", CandidateSchema);
