import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { uploadCode } from "../../../../shared/middleware/uploadMiddleware";
import { MongoInterviewRepository } from "../../infrastructure/repositories/MongoInterviewRepository";
import { MongoCandidateRepository } from "../../../candidates/infrastructure/repositories/MongoCandidateRepository";
import { CreateInterviewRound } from "../../application/use-cases/CreateInterviewRound";
import { GetInterviewRounds } from "../../application/use-cases/GetInterviewRounds";
import { SubmitFeedback } from "../../application/use-cases/SubmitFeedback";
import { GenerateNextRoundQuestions } from "../../application/use-cases/GenerateNextRoundQuestions";
import { createInterviewSchema, submitFeedbackSchema } from "../../application/validators/interviewValidators";
import { geminiService } from "../../../../infrastructure/ai/GeminiService";
import { fileStorage } from "../../../../infrastructure/storage";

const router = Router();
const interviewRepo = new MongoInterviewRepository();
const candidateRepo = new MongoCandidateRepository();

// POST /api/interviews — HR/RECRUITER (create round)
router.post("/", authenticate, authorize("HR", "RECRUITER"), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createInterviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const createRound = new CreateInterviewRound(interviewRepo, candidateRepo);
    const round = await createRound.execute(parsed.data);

    res.status(201).json({ success: true, data: round });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// GET /api/interviews/candidate/:candidateId — all authenticated
router.get("/candidate/:candidateId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const getRounds = new GetInterviewRounds(interviewRepo);
    const rounds = await getRounds.byCandidateId(req.params.candidateId as string);
    res.status(200).json({ success: true, data: rounds });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// GET /api/interviews/my — INTERVIEWER (get my assigned interviews)
router.get("/my", authenticate, authorize("INTERVIEWER"), async (req: AuthRequest, res: Response) => {
  try {
    const getRounds = new GetInterviewRounds(interviewRepo);
    const rounds = await getRounds.byInterviewerId(req.user!.id);
    res.status(200).json({ success: true, data: rounds });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// GET /api/interviews/all — HR/RECRUITER (get all interviews)
router.get("/all", authenticate, authorize("HR", "RECRUITER"), async (_req: AuthRequest, res: Response) => {
  try {
    const rounds = await interviewRepo.findAll();
    res.status(200).json({ success: true, data: rounds });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// GET /api/interviews/:id — all authenticated
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const round = await interviewRepo.findById(req.params.id as string);
    if (!round) {
      res.status(404).json({ success: false, message: "Interview round not found" });
      return;
    }
    res.status(200).json({ success: true, data: round });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// GET /api/interviews/stats/count — dashboard
router.get("/stats/count", authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const total = await interviewRepo.count();
    res.status(200).json({ success: true, data: { total } });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/interviews/:id/feedback — INTERVIEWER
router.patch("/:id/feedback", authenticate, authorize("INTERVIEWER", "HR"), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = submitFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const submitFeedback = new SubmitFeedback(interviewRepo);
    const round = await submitFeedback.execute(req.params.id as string, parsed.data);

    res.status(200).json({ success: true, data: round });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// POST /api/interviews/:id/generate-questions — regenerate AI questions
router.post("/:id/generate-questions", authenticate, authorize("HR", "INTERVIEWER"), async (req: AuthRequest, res: Response) => {
  try {
    const generate = new GenerateNextRoundQuestions(interviewRepo, candidateRepo);
    const questions = await generate.execute(req.params.id as string);

    res.status(200).json({ success: true, data: questions });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// POST /api/interviews/:id/code — upload code submission + AI analysis
router.post("/:id/code", authenticate, authorize("INTERVIEWER", "HR"), uploadCode, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const round = await interviewRepo.findById(req.params.id as string);
    if (!round) {
      res.status(404).json({ success: false, message: "Interview round not found" });
      return;
    }

    // Upload code file
    const ext = req.file.originalname.split(".").pop();
    const key = `code/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const codeUrl = await fileStorage.upload(req.file.buffer, key, req.file.mimetype);

    // AI code analysis
    const codeText = req.file.buffer.toString("utf-8");
    const language = req.body.language || ext || "unknown";
    let codeAnalysis;
    try {
      codeAnalysis = await geminiService.analyzeCode(
        codeText,
        language,
        `Interview round ${round.roundNumber} for candidate`
      );
    } catch {
      codeAnalysis = { quality: 0, summary: "Analysis unavailable", strengths: [], issues: [] };
    }

    const updated = await interviewRepo.update(req.params.id as string, {
      codeSubmissionUrl: codeUrl,
      codeLanguage: language,
      codeAnalysis,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

export default router;
