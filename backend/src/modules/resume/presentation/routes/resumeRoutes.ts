import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { uploadResume } from "../../../../shared/middleware/uploadMiddleware";
import { ParseResume } from "../../application/use-cases/ParseResume";
import { EvaluateResume } from "../../application/use-cases/EvaluateResume";
import { MongoCandidateRepository } from "../../../candidates/infrastructure/repositories/MongoCandidateRepository";
import { MongoJobRepository } from "../../../jobs/infrastructure/repositories/MongoJobRepository";

const router = Router();
const candidateRepo = new MongoCandidateRepository();
const jobRepo = new MongoJobRepository();

// POST /api/resume/parse/:candidateId — parse uploaded resume and store text
router.post(
  "/parse/:candidateId",
  authenticate,
  authorize("HR", "RECRUITER"),
  uploadResume,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "No file uploaded" });
        return;
      }

      const parseResume = new ParseResume();
      const resumeText = await parseResume.execute(req.file.buffer, req.file.mimetype);

      // Update candidate with parsed text
      const candidate = await candidateRepo.update(req.params.candidateId as string, {
        resumeText,
      });

      if (!candidate) {
        res.status(404).json({ success: false, message: "Candidate not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          candidateId: candidate.id,
          resumeTextLength: resumeText.length,
          preview: resumeText.substring(0, 300),
        },
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({ success: false, message: err.message });
    }
  }
);

// POST /api/resume/evaluate/:candidateId — AI evaluation
router.post(
  "/evaluate/:candidateId",
  authenticate,
  authorize("HR", "RECRUITER"),
  async (req: AuthRequest, res: Response) => {
    try {
      // Get the candidate's job to get description and skills
      const candidate = await candidateRepo.findById(req.params.candidateId as string);
      if (!candidate) {
        res.status(404).json({ success: false, message: "Candidate not found" });
        return;
      }

      const job = await jobRepo.findById(candidate.jobId);
      if (!job) {
        res.status(404).json({ success: false, message: "Job not found" });
        return;
      }

      const evaluateResume = new EvaluateResume(candidateRepo);
      const evaluation = await evaluateResume.execute(
        req.params.candidateId as string,
        job.description,
        job.requiredSkills
      );

      res.status(200).json({ success: true, data: evaluation });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({ success: false, message: err.message });
    }
  }
);

export default router;
