import mongoose, { Schema, Document } from "mongoose";
import { RoundStatus } from "../../domain/value-objects/RoundStatus";

export interface IInterviewDocument extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  roundNumber: number;
  interviewerId: mongoose.Types.ObjectId;
  status: RoundStatus;
  scheduledAt: Date;
  suggestedQuestions: {
    question: string;
    category: string;
    difficulty: string;
    intent: string;
  }[];
  interviewerFeedback: string;
  interviewerRating: number;
  codeSubmissionUrl: string;
  codeLanguage: string;
  codeAnalysis: {
    quality: number;
    summary: string;
    strengths: string[];
    issues: string[];
  };
  recommendNextRound: boolean;
  createdAt: Date;
}

const InterviewSchema = new Schema<IInterviewDocument>(
  {
    candidateId:        { type: Schema.Types.ObjectId, ref: "Candidate", required: true },
    jobId:              { type: Schema.Types.ObjectId, ref: "Job", required: true },
    roundNumber:        { type: Number, required: true },
    interviewerId:      { type: Schema.Types.ObjectId, ref: "User" },
    status:             { type: String, enum: Object.values(RoundStatus), default: RoundStatus.SCHEDULED },
    scheduledAt:        { type: Date },
    suggestedQuestions: [{
      question:   { type: String },
      category:   { type: String },
      difficulty: { type: String },
      intent:     { type: String },
    }],
    interviewerFeedback: { type: String, default: "" },
    interviewerRating:   { type: Number, default: 0 },
    codeSubmissionUrl:   { type: String, default: "" },
    codeLanguage:        { type: String, default: "" },
    codeAnalysis: {
      quality:   { type: Number, default: 0 },
      summary:   { type: String, default: "" },
      strengths: { type: [String], default: [] },
      issues:    { type: [String], default: [] },
    },
    recommendNextRound: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const InterviewModel = mongoose.model<IInterviewDocument>("Interview", InterviewSchema);
