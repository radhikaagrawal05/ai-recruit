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
  private model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  async evaluateResume(
    resumeText: string,
    jobDescription: string,
    requiredSkills: string[]
  ): Promise<ResumeEvaluation> {
    const prompt = `You are an expert HR recruiter AI. Evaluate this resume against the job description and required skills.

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS:
${requiredSkills.join(", ")}

RESUME TEXT:
${resumeText}

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
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

Based on this feedback, tailor the questions to dig deeper into areas of concern or explore strengths further.`;
    }

    const prompt = `You are an expert technical interviewer. Generate interview questions for Round ${roundNumber}.

JOB DESCRIPTION:
${jobDescription}

REQUIRED SKILLS:
${requiredSkills.join(", ")}

CANDIDATE SUMMARY (from resume analysis):
${resumeSummary}
${contextBlock}

Generate 6-8 targeted interview questions. Mix categories: technical, behavioral, situational, and problem-solving.

Return ONLY valid JSON (no markdown, no code blocks) as an array:
[
  {
    "question": "<the question>",
    "category": "technical" | "behavioral" | "situational" | "problem-solving",
    "difficulty": "easy" | "medium" | "hard",
    "intent": "<what this question aims to evaluate>"
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
    const prompt = `You are an expert code reviewer. Analyze this ${language} code submission.

CONTEXT:
${context}

CODE:
${code}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "quality": <0-100>,
  "summary": "<brief analysis of code quality>",
  "strengths": ["<strength1>", "<strength2>"],
  "issues": ["<issue1>", "<issue2>"]
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
