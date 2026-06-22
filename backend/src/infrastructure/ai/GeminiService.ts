import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../shared/config/env";
import { logger } from "../logger";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export interface ResumeEvaluation {
  grade: string;
  scores: {
    skillMatch: number;
    experience: number;
    education: number;
    presentation: number;
    overall: number;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  intent: string;
}

export interface CodeAnalysis {
  quality: number;
  summary: string;
  strengths: string[];
  issues: string[];
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  async evaluateResume(
    resumeText: string,
    jobDescription: string,
    requiredSkills: string[]
  ): Promise<ResumeEvaluation> {
    const prompt = `You are an expert Technical Recruiter and HR Manager AI. Your task is to comprehensively and objectively  evaluate the provided candidate resume against the job description and required skills.

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS:
${requiredSkills.join(", ")}

RESUME TEXT:
${resumeText}

EVALUATION INSTRUCTIONS:
1. skillMatch: Assess how well the candidate's listed skills align with the REQUIRED SKILLS and job requirements.
2. experience: Evaluate the relevance, depth, and duration of the candidate's work history.
3. education: Assess the relevance of the candidate's educational background and certifications.
4. presentation: Evaluate the resume's clarity, structure, professionalism, and impact (e.g., use of metrics).
5. overall: A weighted average or holistic assessment of the above criteria.
6. summary: Provide a concise, professional, and objective 2-3 sentence summary of the candidate's fit for the role.
7. strengths/weaknesses: Provide specific, actionable points based strictly on the provided resume and job requirements.

Return ONLY valid JSON (no markdown formatting, no code blocks) in this exact format:
{
  "grade": "A" | "B" | "C" | "D" | "F",
  "scores": {
    "skillMatch": <0-100>,
    "experience": <0-100>,
    "education": <0-100>,
    "presentation": <0-100>,
    "overall": <0-100>
  },
  "summary": "<2-3 sentence summary of the candidate>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"]
}

Grading scale: A = 80-100 overall, B = 65-79, C = 50-64, D = 35-49, F = below 35.`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as ResumeEvaluation;
    } catch (error) {
      logger.error("Gemini resume evaluation failed:", error);
      throw new Error("AI resume evaluation failed. Please try again.");
    }
  }

  async generateQuestions(
    resumeSummary: string,
    jobDescription: string,
    requiredSkills: string[],
    roundNumber: number,
    previousFeedback?: string
  ): Promise<GeneratedQuestion[]> {
    let contextBlock = "";
    if (previousFeedback) {
      contextBlock = `
PREVIOUS ROUND FEEDBACK FROM INTERVIEWER:
${previousFeedback}

CRITICAL: Based on this feedback, explicitly tailor the questions to dig deeper into identified areas of concern or further explore highlighted strengths.`;
    }

    const prompt = `You are an expert Senior Technical Interviewer AI. Your objective is to design a targeted, effective interview for Round ${roundNumber}.

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS:
${requiredSkills.join(", ")}

CANDIDATE SUMMARY (from resume analysis):
${resumeSummary}
${contextBlock}

INSTRUCTIONS:
1. Generate 6-8 highly specific and targeted interview questions.
2. Ensure a good mix of categories:
   - "technical": Test deep knowledge of specific tools, languages, or concepts from the job description.
   - "behavioral": Assess past experiences, teamwork, and cultural fit.
   - "situational": Present hypothetical scenarios relevant to the role.
   - "problem-solving": Evaluate critical thinking and approach to complex challenges.
3. Questions must NOT be generic (e.g., avoid "What are your strengths?"). Tailor them to the candidate's background and the specific role.
4. Provide a clear "intent" explaining exactly what the interviewer should look for in the candidate's answer.

Return ONLY valid JSON (no markdown formatting, no code blocks) as an array:
[
  {
    "question": "<the highly specific interview question>",
    "category": "technical" | "behavioral" | "situational" | "problem-solving",
    "difficulty": "easy" | "medium" | "hard",
    "intent": "<what a strong answer should demonstrate>"
  }
]`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as GeneratedQuestion[];
    } catch (error) {
      logger.error("Gemini question generation failed:", error);
      throw new Error("AI question generation failed. Please try again.");
    }
  }

  async analyzeCode(
    code: string,
    language: string,
    context: string
  ): Promise<CodeAnalysis> {
    const prompt = `You are a Principal Software Engineer and expert code reviewer AI. Your task is to comprehensively analyze this ${language} code submission.

CONTEXT/PROBLEM STATEMENT:
${context}

SUBMITTED CODE:
${code}

EVALUATION CRITERIA:
1. Correctness: Does the code solve the problem as described in the context?
2. Readability & Maintainability: Is the code clean, well-structured, and appropriately commented? Are variable names descriptive?
3. Efficiency: Are there optimal algorithmic choices? Are there unnecessary computations or memory allocations?
4. Best Practices: Does the code follow idiomatic patterns for ${language}? Are there edge cases unhandled?

INSTRUCTIONS:
- Provide an overall "quality" score out of 100 based on the criteria above.
- Write a concise "summary" evaluating the overall approach and execution.
- List specific "strengths" (e.g., "Effective use of map over loops", "Handles empty array edge case").
- List actionable "issues" or areas for improvement (e.g., "O(N^2) complexity can be optimized to O(N)", "Missing error handling for X").

Return ONLY valid JSON (no markdown formatting, no code blocks):
{
  "quality": <0-100>,
  "summary": "<concise technical analysis of the code quality and approach>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "issues": ["<actionable issue 1>", "<actionable issue 2>"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as CodeAnalysis;
    } catch (error) {
      logger.error("Gemini code analysis failed:", error);
      throw new Error("AI code analysis failed. Please try again.");
    }
  }
}

export const geminiService = new GeminiService();
