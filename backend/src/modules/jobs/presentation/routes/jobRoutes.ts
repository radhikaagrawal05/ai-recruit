import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { MongoJobRepository } from "../../infrastructure/repositories/MongoJobRepository";
import { CreateJob } from "../../application/use-cases/CreateJob";
import { GetJobs } from "../../application/use-cases/GetJobs";
import { GetJobById } from "../../application/use-cases/GetJobById";
import { UpdateJob } from "../../application/use-cases/UpdateJob";
import { DeleteJob } from "../../application/use-cases/DeleteJob";
import { createJobSchema, updateJobSchema } from "../../application/validators/jobValidators";

const router = Router();
const repo = new MongoJobRepository();

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