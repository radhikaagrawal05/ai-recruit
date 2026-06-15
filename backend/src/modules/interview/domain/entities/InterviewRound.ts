import { RoundStatus } from "../value-objects/RoundStatus";

export interface SuggestedQuestion {
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  intent: string;
}

export interface InterviewRoundProps {
  id?: string;
  candidateId: string;
  jobId: string;
  roundNumber: number;
  interviewerId?: string;
  status: RoundStatus;
  scheduledAt?: Date;
  suggestedQuestions: SuggestedQuestion[];
  interviewerFeedback?: string;
  interviewerRating?: number;
  codeSubmissionUrl?: string;
  codeLanguage?: string;
  codeAnalysis?: {
    quality: number;
    summary: string;
    strengths: string[];
    issues: string[];
  };
  recommendNextRound?: boolean;
  createdAt?: Date;
}

export class InterviewRound {
  private props: InterviewRoundProps;

  constructor(props: InterviewRoundProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get candidateId() { return this.props.candidateId; }
  get jobId() { return this.props.jobId; }
  get roundNumber() { return this.props.roundNumber; }
  get interviewerId() { return this.props.interviewerId; }
  get status() { return this.props.status; }
  get scheduledAt() { return this.props.scheduledAt; }
  get suggestedQuestions() { return this.props.suggestedQuestions; }
  get interviewerFeedback() { return this.props.interviewerFeedback; }
  get interviewerRating() { return this.props.interviewerRating; }
  get codeSubmissionUrl() { return this.props.codeSubmissionUrl; }
  get codeLanguage() { return this.props.codeLanguage; }
  get codeAnalysis() { return this.props.codeAnalysis; }
  get recommendNextRound() { return this.props.recommendNextRound; }
  get createdAt() { return this.props.createdAt; }

  toJSON() {
    return {
      id: this.id,
      candidateId: this.candidateId,
      jobId: this.jobId,
      roundNumber: this.roundNumber,
      interviewerId: this.interviewerId,
      status: this.status,
      scheduledAt: this.scheduledAt,
      suggestedQuestions: this.suggestedQuestions,
      interviewerFeedback: this.interviewerFeedback,
      interviewerRating: this.interviewerRating,
      codeSubmissionUrl: this.codeSubmissionUrl,
      codeLanguage: this.codeLanguage,
      codeAnalysis: this.codeAnalysis,
      recommendNextRound: this.recommendNextRound,
      createdAt: this.createdAt,
    };
  }
}
