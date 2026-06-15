import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { uploadResume } from "../../../../shared/middleware/uploadMiddleware";
import { MongoCandidateRepository } from "../../infrastructure/repositories/MongoCandidateRepository";
import { AddCandidate } from "../../application/use-cases/AddCandidate";
import { GetCandidates } from "../../application/use-cases/GetCandidates";
import { GetCandidateById } from "../../application/use-cases/GetCandidateById";
import { UpdateCandidateStatus } from "../../application/use-cases/UpdateCandidateStatus";
import { addCandidateSchema, updateCandidateStatusSchema } from "../../application/validators/candidateValidators";
import { fileStorage } from "../../../../infrastructure/storage";

const router = Router();
const repo = new MongoCandidateRepository();

// POST /api/candidates — HR/RECRUITER (with resume upload)
router.post("/", authenticate, authorize("HR", "RECRUITER"), uploadResume, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = addCandidateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const addCandidate = new AddCandidate(repo, fileStorage);
    const candidate = await addCandidate.execute({
      ...parsed.data,
      resumeBuffer: req.file?.buffer,
      resumeMimetype: req.file?.mimetype,
      resumeOriginalName: req.file?.originalname,
    });

    res.status(201).json({ success: true, data: candidate });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// GET /api/candidates — all authenticated (with filters)
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      jobId: req.query.jobId as string | undefined,
      status: req.query.status as string | undefined,
      aiGrade: req.query.aiGrade as string | undefined,
    };

    const getCandidates = new GetCandidates(repo);
    const candidates = await getCandidates.execute(filters);
    res.status(200).json({ success: true, data: candidates });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// GET /api/candidates/stats — dashboard stats
router.get("/stats", authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const total = await repo.count();
    const screening = await repo.countByStatus("SCREENING");
    const interview = await repo.countByStatus("INTERVIEW");
    const offered = await repo.countByStatus("OFFERED");
    const hired = await repo.countByStatus("HIRED");
    res.status(200).json({
      success: true,
      data: { total, screening, interview, offered, hired },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/candidates/:id — all authenticated
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const getCandidate = new GetCandidateById(repo);
    const candidate = await getCandidate.execute(req.params.id as string);
    res.status(200).json({ success: true, data: candidate });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// PATCH /api/candidates/:id/status — HR/RECRUITER
router.patch("/:id/status", authenticate, authorize("HR", "RECRUITER"), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateCandidateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const updateStatus = new UpdateCandidateStatus(repo);
    const candidate = await updateStatus.execute(req.params.id as string, parsed.data.status);
    res.status(200).json({ success: true, data: candidate });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// DELETE /api/candidates/:id — HR only
router.delete("/:id", authenticate, authorize("HR"), async (req: AuthRequest, res: Response) => {
  try {
    await repo.delete(req.params.id as string);
    res.status(200).json({ success: true, message: "Candidate deleted" });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

export default router;
