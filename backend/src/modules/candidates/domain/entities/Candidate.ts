import { CandidateStatus } from "../value-objects/CandidateStatus";

export interface AIScores {
  skillMatch: number;
  experience: number;
  education: number;
  presentation: number;
  overall: number;
}

export interface CandidateProps {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  jobId: string;
  resumeUrl?: string;
  resumeText?: string;
  aiGrade?: string;
  aiSummary?: string;
  aiScores?: AIScores;
  aiStrengths?: string[];
  aiWeaknesses?: string[];
  status: CandidateStatus;
  appliedAt?: Date;
  createdAt?: Date;
}

export class Candidate {
  private props: CandidateProps;

  constructor(props: CandidateProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get email() { return this.props.email; }
  get phone() { return this.props.phone; }
  get jobId() { return this.props.jobId; }
  get resumeUrl() { return this.props.resumeUrl; }
  get resumeText() { return this.props.resumeText; }
  get aiGrade() { return this.props.aiGrade; }
  get aiSummary() { return this.props.aiSummary; }
  get aiScores() { return this.props.aiScores; }
  get aiStrengths() { return this.props.aiStrengths; }
  get aiWeaknesses() { return this.props.aiWeaknesses; }
  get status() { return this.props.status; }
  get appliedAt() { return this.props.appliedAt; }
  get createdAt() { return this.props.createdAt; }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      jobId: this.jobId,
      resumeUrl: this.resumeUrl,
      resumeText: this.resumeText,
      aiGrade: this.aiGrade,
      aiSummary: this.aiSummary,
      aiScores: this.aiScores,
      aiStrengths: this.aiStrengths,
      aiWeaknesses: this.aiWeaknesses,
      status: this.status,
      appliedAt: this.appliedAt,
      createdAt: this.createdAt,
    };
  }
}
