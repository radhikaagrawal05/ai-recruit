import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { MongoJobRepository } from "../../infrastructure/repositories/MongoJobRepository";
import { MongoCandidateRepository } from "../../../candidates/infrastructure/repositories/MongoCandidateRepository";
import { CreateJob } from "../../application/use-cases/CreateJob";
import { GetJobs } from "../../application/use-cases/GetJobs";
import { GetJobById } from "../../application/use-cases/GetJobById";
import { UpdateJob } from "../../application/use-cases/UpdateJob";
import { DeleteJob } from "../../application/use-cases/DeleteJob";
import { BulkAddCandidates } from "../../../candidates/application/use-cases/BulkAddCandidates";
import { createJobSchema, updateJobSchema } from "../../application/validators/jobValidators";
import { uploadExcel } from "../../../../shared/middleware/uploadMiddleware";
import { fileStorage } from "../../../../infrastructure/storage";

const router = Router();
const repo = new MongoJobRepository();
const candidateRepo = new MongoCandidateRepository();

// POST /api/jobs/:id/bulk-candidates — HR/RECRUITER only
router.post("/:id/bulk-candidates", authenticate, authorize("HR", "RECRUITER"), uploadExcel, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const bulkAdd = new BulkAddCandidates(candidateRepo, fileStorage);
    const result = await bulkAdd.execute(req.file.buffer, req.params.id as string);

    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// POST /api/jobs — HR only
router.post("/", authenticate, authorize("HR"), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const createJob = new CreateJob(repo);
    const job = await createJob.execute({
      ...parsed.data,
      createdBy: req.user!.id,
    });

    res.status(201).json({ success: true, data: job });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// GET /api/jobs — all roles
router.get("/", authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const getJobs = new GetJobs(repo);
    const jobs = await getJobs.execute();
    res.status(200).json({ success: true, data: jobs });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/stats — dashboard stats
router.get("/stats", authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const total = await repo.count();
    const open = await repo.countByStatus("OPEN");
    const closed = await repo.countByStatus("CLOSED");
    const paused = await repo.countByStatus("PAUSED");
    res.status(200).json({ success: true, data: { total, open, closed, paused } });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/:id — all roles
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const getJob = new GetJobById(repo);
    const job = await getJob.execute(req.params.id as string);
    res.status(200).json({ success: true, data: job });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// PUT /api/jobs/:id — HR only
router.put("/:id", authenticate, authorize("HR"), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = updateJobSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const updateJob = new UpdateJob(repo);
    const job = await updateJob.execute(req.params.id as string, parsed.data as any);
    res.status(200).json({ success: true, data: job });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

// DELETE /api/jobs/:id — HR only
router.delete("/:id", authenticate, authorize("HR"), async (req: AuthRequest, res: Response) => {
  try {
    const deleteJob = new DeleteJob(repo);
    await deleteJob.execute(req.params.id as string);
    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (err: any) {
    res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
});

export default router;