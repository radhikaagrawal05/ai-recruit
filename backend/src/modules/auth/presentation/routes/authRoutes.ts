import { Router, Request, Response } from "express";
import { RegisterUser } from "../../application/use-cases/RegisterUser";
import { LoginUser } from "../../application/use-cases/LoginUser";
import { VerifyEmail } from "../../application/use-cases/VerifyEmail";
import { ResendVerification } from "../../application/use-cases/ResendVerification";
import { MongoUserRepository } from "../../infrastructure/repositories/MongoUserRepository";
import { registerSchema, loginSchema, verifyEmailSchema, resendVerificationSchema } from "../../application/validators/authValidators";
import { authenticate, AuthRequest } from "../../../../shared/middleware/authenticate";
import { authorize } from "../../../../shared/middleware/authorize";
import { emailService } from "../../../../infrastructure/email/EmailService";

const router = Router();
const repo = new MongoUserRepository();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const registerUser = new RegisterUser(repo);
    const { user, verificationCode } = await registerUser.execute(parsed.data);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.name, verificationCode);
    } catch {
      // Email failed but user is created — they can resend
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the verification code.",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message });
  }
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const verifyEmail = new VerifyEmail(repo);
    await verifyEmail.execute(parsed.data);

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message });
  }
});

// POST /api/auth/resend-verification
router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const resend = new ResendVerification(repo);
    await resend.execute(parsed.data.email);

    res.status(200).json({
      success: true,
      message: "Verification code sent. Please check your email.",
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const loginUser = new LoginUser(repo);
    const result = await loginUser.execute(parsed.data);

    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    const status = err.statusCode || 401;
    res.status(status).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  res.status(200).json({ success: true, data: req.user });
});

// Role-based test endpoints
router.get("/hr-only", authenticate, authorize("HR"), (req: AuthRequest, res: Response) => {
  res.status(200).json({ success: true, message: "Welcome HR!", user: req.user });
});

router.get("/interviewer-only", authenticate, authorize("INTERVIEWER"), (req: AuthRequest, res: Response) => {
  res.status(200).json({ success: true, message: "Welcome Interviewer!", user: req.user });
});

router.get("/hr-recruiter", authenticate, authorize("HR", "RECRUITER"), (req: AuthRequest, res: Response) => {
  res.status(200).json({ success: true, message: "Welcome HR or Recruiter!", user: req.user });
});

export default router;